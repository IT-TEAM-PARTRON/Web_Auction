import React, { useEffect, useState } from "react";
import "./Auctions.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AnimatedContent from "../ui/animatedContent";
import RenderCardAuction from "../ui/CardComponent";
import axiosDefault from "../../services/axiosClient";
import { useTetMode } from "../../contexts/TetModeContext";

const AuctionSection = ({ titleKey, type }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { tetMode } = useTetMode();
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
        const res = await axiosDefault.get(
          `/auctions?status=${statusMap[type]}&sort_by=created_at&sort_order=desc`
        );
        
        const data = res.data;
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
      <div className=" pb-4 rounded-xl">
        {loading ? (
          <div className="loader" />
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>          
            <h2 className={`section-title flex items-center gap-2 ${tetMode ? 'text-white' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" width="46" height="32" viewBox="0 0 46 32" fill="none" className="h-7 w-auto"><g clipPath="url(#a)"><path fill={tetMode ? "#ef4444" : "#60a5fa"} d="M17.38 3.511 9.247 14.86l9.053 6.106 8.134-11.349-9.052-6.106Z"></path><path fill={tetMode ? "#ef4444" : "#60a5fa"} d="m17.381 3.511-.29.405 9.053 6.106.29-.405-9.053-6.106Z"></path><path fill={tetMode ? "#dc2626" : "#2563eb"} d="m19.184.107 9.913 6.686a.589.589 0 0 1 .159.828l-1.535 2.14a.631.631 0 0 1-.856.145L16.952 3.22a.589.589 0 0 1-.158-.828l1.534-2.14a.631.631 0 0 1 .856-.145Z"></path><path fill={tetMode ? "#dc2626" : "#2563eb"} d="m22.559 13.95-1.421 1.983 4.47 3.015 1.42-1.983-4.469-3.015ZM44.773 27.136c1.265.775 1.61 2.415.757 3.606-.858 1.197-2.562 1.454-3.753.573l-15.45-10.93-.822-.615a.401.401 0 0 1-.087-.556l1.802-2.515a.431.431 0 0 1 .569-.115l.88.535 16.105 10.017h-.001Z"></path><path fill={tetMode ? "#dc2626" : "#2563eb"} d="m9.536 14.455-.29.404 9.053 6.106.29-.404-9.053-6.106Z"></path><path fill={tetMode ? "#dc2626" : "#2563eb"} d="m8.816 14.571 9.913 6.686a.589.589 0 0 1 .158.828l-1.534 2.141a.631.631 0 0 1-.856.144l-9.913-6.686a.589.589 0 0 1-.159-.828l1.535-2.14a.631.631 0 0 1 .856-.145Z"></path><path fill={tetMode ? "#dc2626" : "#2563eb"} d="m16.138 5.246 9.052 6.105-2.112 2.95 1.352.912-1.42 1.983-1.354-.913-2.113 2.948-9.053-6.105 5.648-7.88Z"></path><path fill={tetMode ? "#dc2626" : "#2563eb"} d="M14.503 5.587 10.25 11.52a.678.678 0 0 0 .178.962l9.757 6.581c.323.218.767.14.992-.173l4.254-5.934a.678.678 0 0 0-.179-.963l-9.757-6.58a.727.727 0 0 0-.992.173Z"></path><path fill={tetMode ? "#dc2626" : "#2563eb"} d="M28.669 17.119c-.03.066-.07.133-.115.197l-2.076 2.896a1.11 1.11 0 0 1-.151.173l-.823-.615a.401.401 0 0 1-.087-.556l.19-.267-1.198-.807 1.422-1.983 1.198.807.19-.266a.431.431 0 0 1 .569-.115l.88.535v.001Z"></path><path fill={tetMode ? "#dc2626" : "#2563eb"} d="M27.895 15.757c.43.29.54.862.242 1.278l-2.076 2.897a.967.967 0 0 1-1.32.225.902.902 0 0 1-.242-1.278l2.076-2.897a.968.968 0 0 1 1.32-.225Z"></path><path fill={tetMode ? "#dc2626" : "#2563eb"} d="M26.543 26.815v3.197h-21.4v-3.197c0-.88.735-1.594 1.642-1.594h18.116c.907 0 1.642.714 1.642 1.594Z"></path><path fill={tetMode ? "#dc2626" : "#2563eb"} d="M26.544 28.626H5.142v1.387h21.402v-1.387Z"></path><path fill={tetMode ? "#dc2626" : "#2563eb"} d="M4.267 29.226h23.151c.683 0 1.238.539 1.238 1.201v.372c0 .663-.555 1.201-1.238 1.201H4.268c-.684 0-1.239-.537-1.239-1.2v-.373c0-.662.554-1.2 1.238-1.2Z"></path><path fill={tetMode ? "#dc2626" : "#2563eb"} d="m0 24.055.847-.737 3.25 2.513-.115.1L0 24.055ZM.9 21.714l.847-.737 3.165 4.144-.115.1L.9 21.714ZM3.397 21.099l.848-.737 1.483 4.05-.116.1L3.397 21.1Z"></path></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h46v32H0z"></path></clipPath></defs></svg><i>{t(titleKey)}</i></h2>
            <span
              style={{
                fontWeight: "normal",
                color: tetMode ? "#ffffff" : "#8c8e94",
                fontSize: "12px",
                padding: "0px 0px 5px 0px",
              }}
            >
              {t("total")}: {total} {t("asset")}
            </span>
            <AnimatedContent>
              <RenderCardAuction
              arrAuction={items}
              numberCol={4}
              clickCard={handleClick}
            />
            </AnimatedContent>
            <div 
              onClick={handleSeeAll} 
              className={`see-all ${tetMode ? 'text-white hover:text-yellow-300' : ''}`}
              style={{ cursor: 'pointer' }}
            >
            <span className="break-all flex items-center">{t("see_all")} <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg></span>
            </div>
          </>
        )}
      </div>
    </AnimatedContent>
  );
};

export default AuctionSection;
