import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../services/axiosClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAuth } from "../../contexts/AuthContext";
import "./VoidBidWarningModal.css";

dayjs.extend(relativeTime);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const VoidBidWarningModal = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [voidNotifications, setVoidNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const fetchVoidNotifications = useCallback(() => {
    if (!user) return;
    axiosClient
      .get("/notifications")
      .then((res) => {
        const unreadVoids = (res.data || []).filter(
          (n) => n.notification_type === "void_bid" && !n.is_read
        );
        if (unreadVoids.length > 0) {
          setVoidNotifications(unreadVoids);
          setVisible(true);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchVoidNotifications();
    const interval = setInterval(fetchVoidNotifications, 120000);
    return () => clearInterval(interval);
  }, [fetchVoidNotifications]);

  // Close modal without marking as read — will reappear on next visit
  const handleDismiss = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 300);
  };

  // Acknowledge — mark as read so it won't appear again
  const handleAcknowledge = () => {
    setClosing(true);
    axiosClient.post("/notifications/mark-void-read").catch(() => {});
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      setVoidNotifications([]);
    }, 300);
  };

  // Navigate to auction detail and close modal
  const handleViewAuction = (auctionId) => {
    handleDismiss();
    // set is_read on navigation
    axiosClient.post("/notifications/mark-void-read").catch(() => {});
    navigate(`/auctions/${auctionId}`);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible || voidNotifications.length === 0) return null;

  const modal = (
    <div
      className={`void-modal-overlay ${closing ? "closing" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div className="void-modal-container" role="alertdialog" aria-modal="true">
        {/* Close button (X) — dismiss only, not mark read */}
        <button
          className="void-modal-close-x"
          onClick={handleDismiss}
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        {/* Danger stripe */}
        <div className="void-modal-danger-bar" />

        {/* Header */}
        <div className="void-modal-header">
          <div className="void-modal-icon-wrapper">
            <div className="void-modal-icon-pulse" />
            <div className="void-modal-icon">
              <WarningIcon />
            </div>
          </div>
          <h2 className="void-modal-title">
            {t("void_bid_warning_title", "Bid Voided by Administrator")}
          </h2>
          <span className="void-modal-subtitle">
            {voidNotifications.length > 1
              ? t("void_bid_warning_count", "{{count}} bid(s) have been voided", {
                  count: voidNotifications.length,
                })
              : t("void_bid_warning_single", "Your bid has been invalidated")}
          </span>
        </div>

        {/* Divider */}
        <div className="void-modal-divider" />

        {/* Body - list of void notifications */}
        <div className="void-modal-body">
          {voidNotifications.map((n) => (
            <div className="void-notification-card" key={n.id}>
              <div className="void-notification-icon-small">!</div>
              <div className="void-notification-content">
                <p className="void-notification-message">{n.message}</p>
                <div className="void-notification-bottom">
                  <span className="void-notification-time">
                    {dayjs(n.created_at).fromNow()}
                  </span>
                  <button
                    className="void-notification-link"
                    onClick={() => handleViewAuction(n.auction_id)}
                  >
                    {t("view_auction_detail", "View Auction")} &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="void-modal-footer">
          <button className="void-modal-btn-secondary" onClick={handleDismiss}>
            {t("close", "Close")}
          </button>
          <button className="void-modal-btn-primary" onClick={handleAcknowledge}>
            {t("void_bid_acknowledge", "I Understand")}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default VoidBidWarningModal;
