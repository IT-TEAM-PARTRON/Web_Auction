import AnimatedContent from "../ui/animatedContent";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useTetMode } from "../../contexts/TetModeContext";

function History() {
  const { t, i18n } = useTranslation();
  const { tetMode } = useTetMode();
  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);
  const scopeList = t("history_scope_list", { returnObjects: true });
  const contributionList = t("history_contribution_list", {
    returnObjects: true,
  });
  return (
    <AnimatedContent>
      <main className="history-content mt-[160px] sm:mt-[200px] md:mt-[220px] lg:mt-[150px] xl:mt-[100px]">
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
            {t("history_title").toUpperCase()}
          </h2>
          <div style={{ fontSize: "18px", color: tetMode ? "#e4e6eb" : "#222", lineHeight: "2" }}>
            <div
              style={{
                borderLeft: tetMode ? "4px solid #CB0502" : "4px solid #667eea",
                paddingLeft: "24px",
                marginBottom: "24px",
                background: tetMode ? "linear-gradient(90deg, #18191a 80%, transparent)" : "linear-gradient(90deg, #f6f8fa 80%, transparent)",
                borderRadius: "6px",
              }}
            >
              {[2008, 2015, 2024].map((year) => (
                <div key={year}>
                  <strong style={{ color: tetMode ? "#fbbf24" : "inherit" }}>{t(`history_milestone_${year}_title`)}:</strong>{" "}
                  {t(`history_milestone_${year}_desc`)}
                </div>
              ))}
            </div>
            <div style={{ marginBottom: "24px" }}>
              <strong style={{ color: tetMode ? "#fbbf24" : "inherit" }}>{t("history_scope_title")}:</strong>
              <ul style={{ margin: "8px 0 0 24px", padding: 0 }}>
                {scopeList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <span>{t("history_scope_desc")}</span>
            </div>
            <div>
              <strong style={{ color: tetMode ? "#fbbf24" : "inherit" }}>{t("history_contribution_title")}:</strong>
              <ul style={{ margin: "8px 0 0 24px", padding: 0 }}>
                {contributionList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      {/* <Footer /> */}
    </AnimatedContent>
  );
}

export default History;
