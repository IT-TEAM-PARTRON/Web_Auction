import AnimatedContent from "../ui/animatedContent";
import imagefac from "../../assets/images/factory.jpg";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import MapEmbed from "./MapEmbed";
import { useTetMode } from "../../contexts/TetModeContext";

function Contact() {
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
    <AnimatedContent>
      <main className="rule-content mt-[160px] sm:mt-[200px] md:mt-[220px] lg:mt-[150px] xl:mt-[100px]">
        <div
          style={{
            background: tetMode ? "#242526" : "#fff",
            borderRadius: "6px",
            padding: "32px",
            maxWidth: "1200px",
            margin: "0px auto",
            boxShadow: tetMode ? "0 2px 8px rgba(0, 0, 0, 0.5)" : "0 2px 8px rgba(0, 0, 0, 0.3)",
            border: tetMode ? "1px solid #3a3b3c" : "none",
          }}
        >
          <h3
            style={{
              fontWeight: "bold",
              marginBottom: "24px",
              textAlign: "center",
              fontSize: "2rem",
              color: tetMode ? "#fff" : "inherit",
            }}
          >
            {t("contact_title").toUpperCase()}
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: 400,
                  color: tetMode ? "#CB0502" : "inherit",
                }}
              >
                {t("contact_company_name")}
              </h2>

              <div
                style={{ fontSize: "16px", color: tetMode ? "#e4e6eb" : "#222", lineHeight: "1.8" }}
              >
                <div className="text-[18px] my-3">
                  <div>
                    <strong style={{ color: tetMode ? "#fbbf24" : "inherit" }}>{t("contact_phone_label")}</strong>{" "}
                    {t("contact_phone_value")}
                  </div>
                  <div>
                    <strong style={{ color: tetMode ? "#fbbf24" : "inherit" }}>{t("contact_fax_label")}</strong>{" "}
                    {t("contact_fax_value")}
                  </div>
                  <div>
                    <strong style={{ color: tetMode ? "#fbbf24" : "inherit" }}>{t("contact_email_label")}</strong>{" "}
                    {t("contact_email_value")}
                  </div>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "18px",
                      marginBottom: "8px",
                      color: tetMode ? "#CB0502" : "inherit",
                    }}
                  >
                    {t("contact_1_title")}
                  </div>
                  <div style={{ marginLeft: "16px" }}>
                    <div>
                      <p>{t("contact_1_company")}</p>
                    </div>
                    <div>
                      <strong style={{ color: tetMode ? "#fbbf24" : "inherit" }}>{t("contact_1_tax_label")}</strong>{" "}
                      {t("contact_1_tax_value")}
                    </div>
                    <div>
                      <span style={{ fontWeight: "bold", color: tetMode ? "#fbbf24" : "inherit" }}>
                        {t("contact_1_address_label")}
                      </span>{" "}
                      {t("contact_1_address_value")}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "18px",
                      marginBottom: "8px",
                      color: tetMode ? "#CB0502" : "inherit",
                    }}
                  >
                    {t("contact_2_title")}
                  </div>
                  <div style={{ marginLeft: "16px" }}>
                    <div>
                      <p>{t("contact_2_company")}</p>
                    </div>
                    <div>
                      <strong style={{ color: tetMode ? "#fbbf24" : "inherit" }}>{t("contact_2_tax_label")}</strong>{" "}
                      {t("contact_2_tax_value")}
                    </div>
                    <div>
                      <span style={{ fontWeight: "bold", color: tetMode ? "#fbbf24" : "inherit" }}>
                        {t("contact_2_address_label")}
                      </span>{" "}
                      {t("contact_2_address_value")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <img
              src={imagefac}
              alt="Liên hệ"
              style={{
                width: "40%",
                maxWidth: "100%",
                height: "auto",
                borderRadius: "8px",
                objectFit: "cover",
                boxShadow:
                  "0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
              }}
            /> */}            
            <MapEmbed />
          </div>
        </div>
      </main>
    </AnimatedContent>
  );
}

export default Contact;
