import AnimatedContent from "../ui/animatedContent";
import imagefac from "../../assets/images/factory.jpg";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

function Contact() {
  const { t, i18n } = useTranslation();
  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);
  return (
    <AnimatedContent>
      <main className="rule-content">
        <div
          style={{
            background: "#fff",
            borderRadius: "6px",
            padding: "32px",
            maxWidth: "1200px",
            margin: "40px auto",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3
            style={{
              fontWeight: "bold",
              marginBottom: "24px",
              textAlign: "center",
              fontSize: "2rem",
            }}
          >
            {t("contact_title")}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: 400,
                }}
              >
                {t("contact_company_name")}
              </h2>

              <div
                style={{ fontSize: "16px", color: "#222", lineHeight: "1.8" }}
              >
                <div className="text-[18px] my-3">
                  <div>
                    <strong>{t("contact_phone_label")}</strong>{" "}
                    {t("contact_phone_value")}
                  </div>
                  <div>
                    <strong>{t("contact_fax_label")}</strong>{" "}
                    {t("contact_fax_value")}
                  </div>
                  <div>
                    <strong>{t("contact_email_label")}</strong>{" "}
                    {t("contact_email_value")}
                  </div>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "18px",
                      marginBottom: "8px",
                    }}
                  >
                    {t("contact_1_title")}
                  </div>
                  <div style={{ marginLeft: "16px" }}>
                    <div>
                      <p>{t("contact_1_company")}</p>
                    </div>
                    <div>
                      <strong>{t("contact_1_tax_label")}</strong>{" "}
                      {t("contact_1_tax_value")}
                    </div>
                    <div>
                      <span style={{ fontWeight: "bold" }}>
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
                    }}
                  >
                    {t("contact_2_title")}
                  </div>
                  <div style={{ marginLeft: "16px" }}>
                    <div>
                      <p>{t("contact_2_company")}</p>
                    </div>
                    <div>
                      <strong>{t("contact_2_tax_label")}</strong>{" "}
                      {t("contact_2_tax_value")}
                    </div>
                    <div>
                      <span style={{ fontWeight: "bold" }}>
                        {t("contact_2_address_label")}
                      </span>{" "}
                      {t("contact_2_address_value")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <img
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
            />
          </div>
        </div>
      </main>
    </AnimatedContent>
  );
}

export default Contact;
