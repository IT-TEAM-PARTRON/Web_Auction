import AnimatedContent from "../ui/animatedContent";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

function Rule() {
  const { t, i18n } = useTranslation();
  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);
  const ruleTitle = t("auction_rules_title");

  const ruleList = [t("rule_1"), t("rule_2"), t("rule_3"), t("rule_4")];

  return (
    <AnimatedContent>
      <main className="rule-content mt-[250px] sm:mt-[200px] md:mt-[220px] lg:mt-[150px] xl:mt-[100px]" translate="yes">
        <div
          style={{
            background: "#fff",
            borderRadius: "6px",
            padding: "32px",
            maxWidth: "1200px",
            margin: "0px auto",
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
            {ruleTitle.toUpperCase()}
          </h3>
          <ol
            className="google-translate-section"
            style={{
              fontSize: "18px",
              color: "#222",
              fontStyle: "italic",
              lineHeight: "2",
            }}
          >
            {ruleList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </div>
      </main>
    </AnimatedContent>
  );
}

export default Rule;
