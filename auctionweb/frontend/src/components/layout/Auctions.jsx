import React, { useEffect, useState } from "react";
import "./Auctions.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AnimatedContent from "../ui/animatedContent";
import RenderCardAuction from "../ui/CardComponent";

const AuctionSection = ({ titleKey, type }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const statusMap = {
    ongoing: 0,
    upcoming: 1,
    ended: 2,
  };
  const totalMap = {
    ongoing: "total_ongoing",
    upcoming: "total_upcoming",
    ended: "total_ended",
  };
  const handleClick = (id) => {
    navigate(`/auctions/${id}`);
  };

  const handleSeeAll = () => {
    navigate(`/auctions/search?status=${statusMap[type]}`);
  };

// Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
      i18n.changeLanguage(savedLang);
  }, [i18n]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/v1/auctions?status=${statusMap[type]}&sort_by=created_at&sort_order=desc`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        // Lấy 4 phần tử đầu tiên
        const firstFour = (data.auctions || []).slice(0, 4);
        setItems(firstFour);
        setTotal(data[totalMap[type]] || 0);
      } catch (err) {
        console.error("Error fetching auctions:", err);
        setError("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  return (
    <AnimatedContent>
      <div className="section">
        {loading ? (
          <div className="loader" />
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            <h2 className="section-title">{t(titleKey)}</h2>
            <span
              style={{
                fontWeight: "normal",
                color: "#8c8e94",
                fontSize: "12px",
                padding: "0px 0px 5px 0px",
              }}
            >
              {t("total")}: {total} {t("asset")}
            </span>
            <RenderCardAuction
              arrAuction={items}
              numberCol={4}
              clickCard={handleClick}
            />
            <span 
              onClick={handleSeeAll} 
              className="see-all"
              style={{ cursor: 'pointer' }}
            >
              {t("see_all")}
            </span>
          </>
        )}
      </div>
    </AnimatedContent>
  );
};

export default AuctionSection;
