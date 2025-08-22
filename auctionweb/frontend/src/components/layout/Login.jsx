import "./Login.css";
import logo from "../../assets/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

function Login() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let lang = sessionStorage.getItem("lang");
      const response = await fetch("/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept-Language": sessionStorage.getItem("lang") || "en",  },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.role === "user") {
        login(data, remember);
        toast.success(t("login_success", "Login successfully!"), {
          style: {
            border: "1px solid #4ade80",
            padding: "12px 16px",
            color: "#16a34a",
            fontWeight: "500",
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            borderRadius: "12px",
            background: "#f0fdf4",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          },
          iconTheme: {
            primary: "#16a34a",
            secondary: "#ecfdf5",
          },
        });
        navigate("/");
      } else if (
        response.ok &&
        (data.role === "admin" || data.role === "super_admin")
      ) {
        login(data, remember);
        navigate("/admin");
        toast.success(t("login_success", "Login successfully!"), {
          style: {
            border: "1px solid #4ade80",
            padding: "12px 16px",
            color: "#16a34a",
            fontWeight: "500",
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            borderRadius: "12px",
            background: "#f0fdf4",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          },
          iconTheme: {
            primary: "#16a34a",
            secondary: "#ecfdf5",
          },
        });
      } else {
        toast.error(
          data.detail || t("login_failed", "Login failed. Please try again.")
        );
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  let emails = JSON.parse(localStorage.getItem("login_emails") || "[]");
  if (!emails.includes(email)) {
    emails.push(email);
    localStorage.setItem("login_emails", JSON.stringify(emails));
  }

  return (
    <div className="login-bg">
      <img src={logo} alt="Logo" className="login-logo" />
      <div
        className={`login-form-container transition-all duration-700 ease-out ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h1 className="login-title">{t("login", "Login")}</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="input-icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </span>
            <input
              type="email"
              placeholder={t("email", "Email")}
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <span className="input-icon">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("password", "Password")}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <span
              className="input-icon right"
              style={{ cursor: "pointer" }}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              margin: "8px 0 12px 0",
            }}
          >
            <select
              value={i18n.language}
              onChange={(e) => {
                i18n.changeLanguage(e.target.value);
                sessionStorage.setItem("lang", e.target.value);
              }}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid #ddd",
                fontSize: 12,
              }}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>
          </div>
          <div className="login-options">
            <label>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />{" "}
              {t("remember_me", "Remember me")}
            </label>
            <Link
              to="/forgot-password"
              className="login-link"
            >
              {t("forget_password", "Forget password")}
            </Link>
          </div>
          <button type="submit" className="login-btn">
            {t("sign_in", "Sign in")}
          </button>
          <div className="login-or">{t("or", "or")}</div>
          <div className="login-signup">
            {t("no_account", "Don't have an account?")}{" "}
            <Link to="/register">{t("sign_up", "Sign up")}</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
