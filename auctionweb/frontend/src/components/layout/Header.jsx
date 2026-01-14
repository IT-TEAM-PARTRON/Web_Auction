import logo from "../../assets/images/logo.png";
import "./Header.css";
import RealTime from "../ui/realtime";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Link } from "react-router-dom";
function Header() {
  const { t, i18n } = useTranslation();

  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  return (
    <div className="header-container">
      <div className="header-left">
        <Link to="/">
          <img src={logo} alt="Logo" className="header-logo" />
        </Link>
      </div>
      <div className="header-center">
        <span className="header-title">{t("auction_online")}</span>
      </div>
      <div className="header-right">
        <RealTime />
      </div>
    </div>
  );
}

export default Header;
