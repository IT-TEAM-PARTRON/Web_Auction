import AnimatedContent from "../ui/animatedContent";
import login from "../../assets/images/login.png";
import register from "../../assets/images/register.png";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function Tutorial() {
  const { t, i18n } = useTranslation();
  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang") || "en";

    i18n.changeLanguage(savedLang);
  }, [i18n]);

  return (
    <AnimatedContent>
      <main className="tutorial-content">
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
            {t("auction_guide_title")}
          </h3>
          <ol
            style={{
              fontSize: "18px",
              color: "#222",
              lineHeight: "2",
            }}
          >
            <li>
              <b className="italic">{t("auction_guide_step_1_title")}</b>{" "}
              <ul className="list-disc pl-5">
                <li>{t("auction_guide_step_1_content_1")}</li>
                <li>{t("auction_guide_step_1_content_2")}</li>
                <li>{t("auction_guide_step_1_content_3")}</li>
              </ul>
              <img
                src={register}
                alt="register"
                className="img"
                style={{
                  maxWidth: "60%",
                  height: "auto",
                  maxHeight: "400px",
                  display: "block",
                  margin: "16px auto",
                }}
              />
            </li>
            <li>
              <b className="italic">{t("auction_guide_step_2_title")}</b>
              <br />
              <ul className="list-disc pl-5">
                <li>{t("auction_guide_step_2_content_1")}</li>
                <li>{t("auction_guide_step_2_content_2")}</li>
                <li>{t("auction_guide_step_2_content_3")}</li>
              </ul>
              <img
                src={login}
                alt="login"
                className="img"
                style={{
                  maxWidth: "60%",
                  height: "auto",
                  maxHeight: "400px",
                  display: "block",
                  margin: "16px auto",
                }}
              />
            </li>
            <li>
              <b className="italic">{t("auction_guide_step_3_title")}</b>
              <br />
              {t("auction_guide_step_3_content")}
            </li>
            <li>
              <b className="italic">{t("auction_guide_step_4_title")}</b>
              <br />
              {t("auction_guide_step_4_content")}
            </li>
            <li>
              <b className="italic">{t("auction_guide_step_5_title")}</b>
              <br />
              {
                <ul className="list-disc pl-5">
                  <li>{t("auction_guide_step_5_content_1")}</li>
                  <li>{t("auction_guide_step_5_content_2")}</li>
                </ul>
              }
            </li>
            <li>
              <b className="italic">{t("auction_guide_step_6_title")}</b>
              <br />
              {t("auction_guide_step_6_content")}
            </li>
          </ol>
        </div>
      </main>
      {/* <Footer /> */}
    </AnimatedContent>
  );
}

export default Tutorial;
