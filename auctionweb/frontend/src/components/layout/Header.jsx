import logo from "../../assets/images/logo.png";
import tetIconCoin from "../../assets/images/tet-icon-coin.svg";
import tetHeaderFlower from "../../assets/images/tet-header-flower (1).svg";
import firework from "../../assets/images/firework-7791_256.gif";
import "./Header.css";
import RealTime from "../ui/realtime";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTetMode } from "../../contexts/TetModeContext";

function Header() {
  const { t, i18n } = useTranslation();
  const { tetMode } = useTetMode();

  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  return (
    <div 
      className={`header-container transition-colors duration-500 ${tetMode ? 'tet-header' : ''}`}
      style={tetMode ? { backgroundColor: '#18191a' } : {}}
    >
      <div className="header-left">
        <Link to="/">
          <img src={logo} alt="Logo" className="header-logo" />
        </Link>
        {tetMode && (
          <img 
            src={tetHeaderFlower} 
            alt="" 
            className="w-24 h-12 object-contain hidden md:block"
          />
        )}
      </div>
      <div className="header-center">
        {tetMode && (
          <img 
            src={tetIconCoin} 
            alt="" 
            className="w-8 h-8 mr-2 animate-spin-slow hidden md:block"
            style={{ animationDuration: '3s' }}
          />
        )}
        <span className={`header-title ${tetMode ? '!text-white' : ''}`}>{t("auction_online")}</span>
        {tetMode && (
          <img 
            src={tetIconCoin} 
            alt="" 
            className="w-8 h-8 ml-2 animate-spin-slow hidden md:block"
            style={{ animationDuration: '3s' }}
          />
        )}
      </div>
      <div className={`header-right ${tetMode ? 'text-white' : ''}`}>
        {tetMode && (
          <img 
            src={firework} 
            alt="" 
            className="w-24 h-12 object-contain hidden md:block"
          />
        )}
        <RealTime />
      </div>
    </div>
  );
}

export default Header;
