import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import axiosClient from "../../services/axiosClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTetMode } from "../../contexts/TetModeContext";
dayjs.extend(relativeTime);

const NotificationDropdown = ({ triggerRef }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { t, i18n } = useTranslation();
  const { tetMode } = useTetMode();
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
        .catch(() =>
           setNotifications([]));
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
      setShowAll(false); 
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
          className={`notification-dropdown ${closing ? 'fade-slide-out' : 'fade-slide-in'} ${tetMode ? 'tet-mode' : ''}`}
          ref={dropdownRef}
          style={tetMode ? { backgroundColor: '#242526', borderColor: '#3a3b3c' } : {}}
        >
          <div className="notification-dropdown-header" style={tetMode ? { background: 'linear-gradient(to right, #CB0502, #ff4444)', color: 'white' } : {}}>
            <FontAwesomeIcon icon={faBell} style={{ marginRight: "8px" }} />
            {t("notification")}
          </div>
          <ul className="notification-list" style={tetMode ? { backgroundColor: '#242526' } : {}}>
            {notifications.length === 0 ? (
              <li className="notification-item" style={tetMode ? { color: '#e4e6eb' } : {}}>{t('no_announcements')}</li>
            ) : (
              (showAll ? notifications : notifications.slice(0, 8)).map((item) => (
                <li
                  className={`notification-item${item.is_read ? "" : " unread"}`}
                  key={item.id}
                  title={item.message}
                  style={tetMode ? { backgroundColor: item.is_read ? '#242526' : '#3a3b3c', borderBottomColor: '#3a3b3c' } : {}}
                >
                  <span className="notification-avatar" style={tetMode ? { backgroundColor: '#CB0502' } : {}}><FontAwesomeIcon icon={faUser} /></span>
                  <span style={{ flex: 1, minWidth: 0, borderBottom: tetMode ? '1px solid #3a3b3c' : '1px solid' }}>
                    <span
                      className="notification-message"
                      style={{
                        fontWeight: item.is_read ? "normal" : "bold",
                        color: tetMode ? '#e4e6eb' : undefined
                      }}
                    >
                      {item.message.length > 60
                        ? item.message.slice(0, 60) + "..."
                        : item.message}
                    </span>
                    <br />
                    <span className="notification-time" style={tetMode ? { color: '#a0a0a0' } : {}}>
                      {dayjs(item.created_at).fromNow()}
                    </span>
                  </span>
                </li>
              ))
            )}
          </ul>
          {notifications.length > 10 && !showAll && (
            <div className="notification-more">
              <button 
                className="more-button"
                onClick={() => setShowAll(true)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  backgroundColor: tetMode ? "#3a3b3c" : "#f0f0f0",
                  color: tetMode ? "#e4e6eb" : "#666",
                  cursor: "pointer",
                  borderTop: tetMode ? "1px solid #4a4b4c" : "1px solid #e0e0e0",
                  fontSize: "14px"
                }}
              >
                {t('load_more')} ({notifications.length - 8})
              </button>
            </div>
          )}
        </div>
      )}
    </span>
  );
};

export default NotificationDropdown;
