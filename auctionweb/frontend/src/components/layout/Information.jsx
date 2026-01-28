import AnimatedContent from "../ui/animatedContent";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Indent } from "lucide-react";
import { useTetMode } from "../../contexts/TetModeContext";

function Information() {
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
      <main className="information-content mt-[160px] sm:mt-[200px] md:mt-[220px] lg:mt-[150px] xl:mt-[100px]">
        <div
          style={{
            background: tetMode ? "#242526" : "#fff",
            borderRadius: "12px",
            padding: "40px",
            maxWidth: "1200px",
            margin: "0px auto",
            boxShadow: tetMode ? "0 4px 24px rgba(0,0,0,0.5)" : "0 4px 24px rgba(0,0,0,0.30)",
            border: tetMode ? "1px solid #3a3b3c" : "none",
          }}
        >
          <h2
            style={{
              fontSize: "2.2rem",
              fontWeight: 700,
              marginBottom: "32px",
              color: tetMode ? "#fff" : "#2d3748",
              letterSpacing: "1px",
              textAlign: "center",
            }}
          >
            {t("vision_title").toUpperCase()}
          </h2>
          <div
            style={{
              fontSize: "18px",
              color: tetMode ? "#e4e6eb" : "#222",
              lineHeight: "2",
              marginBottom: "32px",
            }}
          >
            <p>{t("vision_p1")}</p>
            <p>{t("vision_p2")}</p>
          </div>

          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: "20px",
              color: tetMode ? "#CB0502" : "#4a5568",
            }}
          >
            {t("auction_scope_heading")}
          </h3>

          <ul
            style={{
              fontSize: "18px",
              color: tetMode ? "#e4e6eb" : "#222",
              lineHeight: "2",
              marginLeft: "24px",
              marginBottom: "24px",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="mb-2">
                <span className="font-semibold" style={{ color: tetMode ? "#fbbf24" : "inherit" }}>
                  {t(`auction_scope_${i}_title`)}:
                </span>{" "}
                <span>{t(`auction_scope_${i}_desc`)}</span>
              </li>
            ))}
          </ul>

          <div style={{ fontSize: "18px", color: tetMode ? "#e4e6eb" : "#222", lineHeight: "2" }}>
            <p>{t("vision_p3")}</p>
          </div>
        </div>
      </main>
      {/* <Footer /> */}
    </AnimatedContent>
  );
}

export default Information;
