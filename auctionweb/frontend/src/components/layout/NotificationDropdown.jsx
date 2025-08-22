import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import axiosClient from "../../services/axiosClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTranslation } from "react-i18next";
dayjs.extend(relativeTime);

const NotificationDropdown = ({ triggerRef }) => {
  const dropdownRef = useRef();
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const { t, i18n } = useTranslation();
  const closeDropdown = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 300);
  };

  useEffect(() => {
    const fetchNotifications = () => {
      axiosClient
        .get("/notifications")
        .then((res) => setNotifications(res.data || []))
        .catch(() => setNotifications([]));
    };
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 120000);
    return () => clearInterval(intervalId);
  }, []);
  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
      i18n.changeLanguage(savedLang);
  }, [i18n]);
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !triggerRef.current?.contains(e.target)
      ) {
        closeDropdown();
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
      axiosClient
        .get("/notifications")
        .then((res) => setNotifications(res.data || []))
        .catch(() => setNotifications([]));
      axiosClient
        .post("/set_read")
        .then(() => {
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, is_read: true }))
          );
        })
        .catch((err) => console.error("Read fail", err));
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible]);

  return (
    <span style={{ position: "relative", display: "inline-block" }} ref={triggerRef}>
      <FontAwesomeIcon
        icon={faBell}
        className="bell-icon"
        style={{ marginLeft: "10px", cursor: "pointer" }}
        onClick={() => {
          if (visible) {
            closeDropdown();
          } else {
            setVisible(true);
          }
        }}
      />
      {notifications.filter((n) => !n.is_read).length > 0 && (
        <span
          className="notification-badge"
          style={{
            position: "absolute",
            top: "-5px",
            right: "-2px",
            backgroundColor: "red",
            color: "white",
            borderRadius: "50%",
            padding: "1px 4px",
            fontSize: "8px",
          }}
        >
          {notifications.filter((n) => !n.is_read).length}
        </span>
      )}

      {visible && (
        <div
          className={`notification-dropdown ${closing ? 'fade-slide-out' : 'fade-slide-in'}`}
          ref={dropdownRef}
        >
          <div className="notification-dropdown-header ">
            <FontAwesomeIcon icon={faBell} style={{ marginRight: "8px" }} />
            {t("notification")}
          </div>
          <ul className="notification-list">
            {notifications.length === 0 ? (
              <li className="notification-item">{t('no_announcements')}</li>
            ) : (
              notifications.map((item) => (
                <li
                  className={`notification-item${item.is_read ? "" : " unread"}`}
                  key={item.id}
                  title={item.message}  
                >
                  <span className="notification-avatar"><FontAwesomeIcon icon={faUser} /></span>
                  <span style={{ flex: 1, minWidth: 0, borderBottom: "1px solid" }}>
                    <span
                      className="notification-message"
                      style={{
                        fontWeight: item.is_read ? "normal" : "bold",
                      }}
                    >
                      {item.message.length > 60
                        ? item.message.slice(0, 60) + "..."
                        : item.message}
                    </span>
                    <br />
                    <span className="notification-time">
                      {dayjs(item.created_at).fromNow()}
                    </span>
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </span>
  );
};

export default NotificationDropdown;
