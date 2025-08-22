import React, { useEffect } from "react";
import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t, i18n } = useTranslation();
  const addresses = t("addresses", { returnObjects: true });
  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);
  const companyInfo = {
    name: "Partron Vina Co., Ltd.",
    phone: "+84 123 456 789",
    email: "contact@partronvina.com",
    addresses: [
      "Lot 11, Khai Quang Industrial Park, Vinh Phuc Ward, Phu Tho Province, Vietnam",
      "Lot CN03-03, Dong Soc Industrial Cluster, Vinh Tuong Commune, Phu Tho Province, Vietnam",
    ],
  };

  const helpLinks = [
    { label: t("register_account_pricing"), to: "/guide" },
    { label: t("policy_security"), to: "/policy" },
    { label: t("vision_title"), to: "/about" },
    { label: t("company_history"), to: "/history" },
  ];

  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__section footer__company">
          <h2 className="footer__title">{companyInfo.name}</h2>
          <ul className="footer__list">
            <li>
              <FontAwesomeIcon icon={faPhone} style={{ marginRight: 8 }} />
              <span className="footer__label">{t("phone")}:</span>{" "}
              {companyInfo.phone}
            </li>
            <li>
              <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 8 }} />
              <span className="footer__label">{t("email")}:</span>{" "}
              {companyInfo.email}
            </li>
            <li>
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                style={{ marginRight: 8 }}
              />
              <span className="footer__label">{t("address")}:</span>
              <ul className="footer__address-list">
                {addresses.map((addr, index) => (
                  <li key={index} className="footer__address-item">
                    {"- " + addr}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>

        <div className="footer__section footer__help">
          <h2 className="footer__title">{t("auctioneer_assistance")}</h2>
          <ul className="footer__list footer__list--inline">
            {helpLinks.map((link, idx) => (
              <li key={idx} className="footer__item">
                <Link to={link.to} className="footer__link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
