import { NavLink, useNavigate } from "react-router-dom";
import "./NavBar.css";
import { useAuth } from "../../contexts/AuthContext";
import { useTetMode } from "../../contexts/TetModeContext";
import { useState, useRef, useEffect } from "react";
import axiosClient from "../../services/axiosClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import NotificationDropdown from "./NotificationDropdown";
import AuctionHistory from "./AuctionHistory";
import { useTranslation } from "react-i18next";
import AccountInfo from "./AccountInfo";
import logo from "../../assets/images/logo.png";
import tetIconCoin from "../../assets/images/tet-icon-coin.svg";
import tetHeaderHorse from "../../assets/images/tet-header-horse.svg";
import toast from "react-hot-toast";
dayjs.extend(relativeTime);

function NavBar() {
  const { user, logout, openAuthModal } = useAuth();
  const { tetMode, toggleTetMode } = useTetMode();
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [showAuctionHistory, setShowAuctionHistory] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpenDesktop, setLangOpenDesktop] = useState(false);
  const [langOpenMobile, setLangOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const bellRef = useRef();
  const dropdownRef = useRef();
  const langRefDesktop = useRef();
  const langRefMobile = useRef();
  const { t, i18n } = useTranslation();

  // Function to show random Tet greeting
  const showTetGreetings = (isActivating) => {
    const greetingsList = isActivating
      ? t("tet_greetings", { returnObjects: true })
      : t("tet_off_greetings", { returnObjects: true });

    // Random 1 greeting from the list
    const randomIndex = Math.floor(Math.random() * greetingsList.length);
    const randomGreeting = greetingsList[randomIndex];

    toast.success(randomGreeting, {
      duration: 3000,
      position: "top-center",
      style: {
        background: isActivating ? "#CB0502" : "#4b5563",
        color: "#fff",
        fontWeight: "bold",
      },
    });
  };

  // Handle Tet mode toggle with greetings
  const handleTetModeToggle = () => {
    const willActivate = !tetMode;
    toggleTetMode();
    showTetGreetings(willActivate);
  };

  // Detect mobile screen and handle outside clicks for language dropdowns
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener("resize", handleResize);

    const handleClickOutside = (event) => {
      if (langRefDesktop.current && !langRefDesktop.current.contains(event.target)) {
        setLangOpenDesktop(false);
      }
      if (langRefMobile.current && !langRefMobile.current.contains(event.target)) {
        setLangOpenMobile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !bellRef.current.contains(event.target)
      ) {
        setShowNotification(false);
      }
    }
    if (showNotification) {
      document.addEventListener("mousedown", handleClickOutside);
      axiosClient
        .get("/notifications")
        .then((res) => {
          setNotifications(res.data || []);
        })
        .catch(() =>
          setNotifications([], console.error("Error fetching notifications")),
        );
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotification]);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="mobile-header" style={{ backgroundColor: tetMode ? '#CB0502' : '#fff', borderBottomColor: tetMode ? '#CB0502' : '#eee', transition: 'all 0.3s' }}>
        <button
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line" style={{ backgroundColor: tetMode ? '#fff' : '#333' }}></span>
          <span className="hamburger-line" style={{ backgroundColor: tetMode ? '#fff' : '#333' }}></span>
          <span className="hamburger-line" style={{ backgroundColor: tetMode ? '#fff' : '#333' }}></span>
        </button>
        <div className="mobile-header-right">
          {/* Tet Mode Switch Mobile */}
          <button
            onClick={handleTetModeToggle}
            className={`flex items-center justify-center p-1.5 mr-1 sm:mr-2 rounded-full transition-all duration-300 ${tetMode ? "bg-yellow-400 text-red-600 shadow-sm" : "bg-gray-100/80 text-gray-500"}`}
            title={tetMode ? t("tet_mode_turn_off") : t("tet_mode_turn_on")}
          >
            <img 
              src={tetIconCoin} 
              alt="Tet" 
              className={`w-4 h-4 transition-transform duration-300 ${tetMode ? "rotate-0" : "rotate-180 grayscale"}`} 
            />
          </button>
          {user ? (
            <>
              {isMobile && <NotificationDropdown triggerRef={bellRef} />}
              <span
                className="nav-link font-medium"
                onClick={() => setShowAccountInfo(true)}
                style={{ cursor: "pointer", color: tetMode ? "#fbbf24" : "inherit" }}
              >
                {t("account_info")}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal("login")}
                className={`mobile-auth-btn ${tetMode ? 'bg-[#ff4444] text-white' : 'mobile-auth-filled'}`}
                style={tetMode ? { background: '#ff4444', border: 'none' } : {}}
              >
                {t("login", "Đăng nhập")}
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className={`mobile-auth-btn ${tetMode ? 'bg-yellow-400 text-[#CB0502]' : 'mobile-auth-outline'}`}
                style={tetMode ? { border: 'none', background: '#fbbf24' } : {}}
              >
                {t("register", "Đăng ký")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={closeMobileMenu}></div>
      )}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header" style={tetMode ? { background: '#CB0502' } : {}}>
          <img src={logo} alt="Logo" className="mobile-menu-logo" />
          <button className="mobile-menu-close" onClick={closeMobileMenu}>
            ×
          </button>
        </div>
        <div className="mobile-menu-nav">
          <NavLink to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
            {t("home", "Trang chủ")}
          </NavLink>
          <NavLink
            to="/guide"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            {t("tutorial", "Hướng dẫn")}
          </NavLink>
          <NavLink
            to="/contact"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            {t("contact", "Liên hệ")}
          </NavLink>
          <NavLink
            to="/about"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            {t("information", "Giới thiệu")}
          </NavLink>
          <NavLink
            to="/auctions/search"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            {t("auction", "Đấu giá")}
          </NavLink>
          <NavLink
            to="/history"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            {t("history", "Lịch sử")}
          </NavLink>
          <NavLink
            to="/policy"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            {t("rule", "Quy định")}
          </NavLink>
          {(user?.role === "admin" || user?.role === "super_admin") && (
            <NavLink
              to="/admin"
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              {t("dashboard", "Dashboard")}
            </NavLink>
          )}
          {user && (
            <>
              <span
                className="mobile-nav-link"
                onClick={() => {
                  setShowAccountInfo(true);
                  closeMobileMenu();
                }}
              >
                {t("account_info", "Thông tin tài khoản")}
              </span>
              {user?.role === "user" && (
                <span
                  className="mobile-nav-link"
                  onClick={() => {
                    setShowAuctionHistory(true);
                    closeMobileMenu();
                  }}
                >
                  {t("auction_history", "Lịch sử đấu giá")}
                </span>
              )}
              <span
                className="mobile-nav-link"
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
              >
                {t("logout", "Đăng xuất")}
              </span>
            </>
          )}

          {/* Smooth custom mobile language accordion */}
          <div className="px-5 py-3 border-t border-gray-100 mt-2" ref={langRefMobile}>
            <button
              onClick={() => setLangOpenMobile(!langOpenMobile)}
              className="w-full flex items-center justify-between text-gray-700 font-medium text-sm py-1 outline-none"
            >
              <span>{t("language", "Language")}: {i18n.language === "vi" ? "Tiếng Việt" : i18n.language === "en" ? "English" : "한국어"}</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${langOpenMobile ? "rotate-180 text-blue-500" : "text-gray-400"}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div 
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: langOpenMobile ? "200px" : "0px", opacity: langOpenMobile ? 1 : 0, marginTop: langOpenMobile ? "8px" : "0px" }}
            >
              {[
                { code: "vi", label: "Tiếng Việt" },
                { code: "en", label: "English" },
                { code: "ko", label: "한국어" }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    sessionStorage.setItem("lang", lang.code);
                    setLangOpenMobile(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors mb-1 ${
                    i18n.language === lang.code
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Nav - hidden on mobile */}
      <nav
        className={`nav-wrapper transition-all duration-300 ${tetMode ? "tet-mode-nav" : ""}`}
        style={tetMode ? { backgroundColor: "#CB0502" } : {}}
      >
        <div className="nav-left">
          <NavLink
            to="/"
            className={`nav-link ${tetMode ? "!text-white hover:!text-yellow-300" : ""}`}
          >
            {t("home", "Home")}
          </NavLink>
          <NavLink
            to="/auctions/search"
            className={`nav-link ${tetMode ? "!text-white hover:!text-yellow-300" : ""}`}
          >
            {t("auction", "Auction")}
          </NavLink>
          <NavLink
            to="/about"
            className={`nav-link ${tetMode ? "!text-white hover:!text-yellow-300" : ""}`}
          >
            {t("information", "Information")}
          </NavLink>
          <NavLink
            to="/history"
            className={`nav-link ${tetMode ? "!text-white hover:!text-yellow-300" : ""}`}
          >
            {t("history", "History")}
          </NavLink>
          <NavLink
            to="/guide"
            className={`nav-link ${tetMode ? "!text-white hover:!text-yellow-300" : ""}`}
          >
            {t("tutorial", "Tutorial")}
          </NavLink>
          <NavLink
            to="/contact"
            className={`nav-link ${tetMode ? "!text-white hover:!text-yellow-300" : ""}`}
          >
            {t("contact", "Contact")}
          </NavLink>
          <NavLink
            to="/policy"
            className={`nav-link ${tetMode ? "!text-white hover:!text-yellow-300" : ""}`}
          >
            {t("rule", "Rule")}
          </NavLink>
          {(user?.role === "admin" || user?.role === "super_admin") && (
            <NavLink
              to="/admin"
              className={`nav-link ${tetMode ? "!text-white hover:!text-yellow-300" : ""}`}
            >
              {t("dashboard", "Dashboard")}
            </NavLink>
          )}
        </div>
        <div className="nav-right">
          {tetMode && (
            <img
              src={tetHeaderHorse}
              alt=""
              className="w-20 h-full mr-2 object-contain hidden md:inline-block"
              aria-hidden="true"
            />
          )}

          {/* Smooth Custom Language Selector Desktop */}
          <div className="hidden md:flex items-center mx-1 relative" ref={langRefDesktop}>
            <button
              type="button"
              onClick={() => setLangOpenDesktop(!langOpenDesktop)}
              className={`flex items-center gap-2 px-3 rounded transition-colors duration-200 font-semibold text-sm outline-none ${
                tetMode
                  ? "text-white hover:text-yellow-300"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-100/80"
              }`}
            >
              <span className="text-center min-w-[24px]">
                {i18n.language === "vi" ? "VN" : i18n.language === "en" ? "EN" : "KR"}
              </span>
              <svg 
                className={`w-3.5 h-3.5 transition-transform duration-300 ${langOpenDesktop ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu Overlay */}
            <div 
              className={`absolute top-[calc(100%+8px)] right-0 w-[140px] rounded-2xl shadow-xl overflow-hidden transition-all duration-300 origin-top transform z-50 ${
                tetMode ? "bg-[#242526] border border-[#3a3b3c]" : "bg-white border border-gray-100"
              }`}
              style={{
                opacity: langOpenDesktop ? 1 : 0,
                visibility: langOpenDesktop ? "visible" : "hidden",
                transform: langOpenDesktop ? "scale(1) translateY(0)" : "scale(0.95) translateY(-8px)",
                pointerEvents: langOpenDesktop ? "auto" : "none"
              }}
            >
              <div className="p-1.5 flex flex-col gap-1">
                {[
                  { code: "vi", label: "Tiếng Việt" },
                  { code: "en", label: "English" },
                  { code: "ko", label: "한국어" }
                ].map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      sessionStorage.setItem("lang", lang.code);
                      setLangOpenDesktop(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                      i18n.language === lang.code
                        ? (tetMode ? "bg-[#CB0502]/20 text-[#CB0502]" : "bg-blue-50 text-blue-600")
                        : (tetMode ? "text-gray-300 hover:bg-[#3a3b3c]" : "text-gray-600 hover:bg-gray-100")
                    }`}
                  >
                    <span>{lang.label}</span>
                    {i18n.language === lang.code && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tet Mode Switch */}
          <button
            onClick={handleTetModeToggle}
            className={`tet-mode-switch flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-300 ${tetMode ? "bg-red-600 text-yellow-300" : "bg-gray-400 text-gray-300"}`}
            title={tetMode ? t("tet_mode_turn_off") : t("tet_mode_turn_on")}
          >
            <img
              src={tetIconCoin}
              alt="Tet"
              className={`w-3 h-3 transition-transform duration-300 ${tetMode ? "rotate-0" : "rotate-180 grayscale"}`}
            />
            <span className="text-xs font-medium hidden sm:inline">
              {tetMode ? t("tet_mode_on") : t("tet_mode_off")}
            </span>
          </button>
          {user ? (
            <>
              {/* Bell icon for desktop - only render when not mobile */}
              {!isMobile && <NotificationDropdown triggerRef={bellRef} />}
              <span
                className={`user-greeting nav-link ${tetMode ? "!text-white hover:!text-yellow-300" : ""}`}
                onClick={() => setShowAccountInfo(true)}
                style={{ cursor: "pointer" }}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  setShowAccountInfo(true)
                }
                aria-label={t("account_info")}
                role="button"
              >
                {t("account_info")}
              </span>

              {user?.role === "user" && (
                <span
                  className={`nav-link ${tetMode ? "!text-white hover:!text-yellow-300" : ""}`}
                  onClick={() => setShowAuctionHistory(true)}
                  style={{ cursor: "pointer" }}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    setShowAuctionHistory(true)
                  }
                  aria-label={t("auction_history")}
                  role="button"
                >
                  {t("auction_history")}
                </span>
              )}

              <button
                className={`nav-link button-link ${tetMode ? "!text-white hover:!text-yellow-300" : ""}`}
                onClick={handleLogout}
              >
                {t("logout", "Logout")}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuthModal("login")}
                className={`nav-link ${tetMode ? "!text-white hover:!text-yellow-300" : ""}`}
              >
                {t("login", "Đăng nhập")}
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className={`nav-link ${tetMode ? "!text-white hover:!text-yellow-300" : ""}`}
              >
                {t("register", "Register")}
              </button>
            </>
          )}
        </div>
      </nav>
      <AccountInfo
        isOpen={showAccountInfo}
        onClose={() => setShowAccountInfo(false)}
      />
      <AuctionHistory
        isOpen={showAuctionHistory}
        onClose={() => setShowAuctionHistory(false)}
      />
    </>
  );
}

export default NavBar;
