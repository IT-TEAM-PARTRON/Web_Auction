import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTetMode } from "../../contexts/TetModeContext";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

function LoginModal() {
  const { login, closeAuthModal, switchAuthModal } = useAuth();
  const { tetMode } = useTetMode();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const inputClass = tetMode
    ? "w-full pl-11 pr-4 py-3 rounded-lg bg-[#3a3b3c] border border-[#4a4b4c] text-white placeholder-gray-500 text-sm outline-none transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-900/30 focus:bg-[#3a3b3c]"
    : "w-full pl-11 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white";

  const inputPasswordClass = tetMode
    ? "w-full pl-11 pr-11 py-3 rounded-lg bg-[#3a3b3c] border border-[#4a4b4c] text-white placeholder-gray-500 text-sm outline-none transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-900/30 focus:bg-[#3a3b3c]"
    : "w-full pl-11 pr-11 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": sessionStorage.getItem("lang") || "en",
        },
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
        closeAuthModal();
        navigate("/");
      } else if (
        response.ok &&
        (data.role === "admin" || data.role === "super_admin")
      ) {
        login(data, remember);
        closeAuthModal();
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1
        className={`text-center text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r mb-1 ${
          tetMode ? "from-[#CB0502] to-[#ff4444]" : "from-blue-500 to-indigo-600"
        }`}
      >
        {t("login", "Login")}
      </h1>
      <p className={`text-center mb-5 text-sm ${tetMode ? "text-gray-400" : "text-gray-500"}`}>
        {t("login_des")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="relative">
          <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${tetMode ? "text-[#CB0502]" : "text-blue-500"}`}>
            <FontAwesomeIcon icon={faEnvelope} />
          </span>
          <input
            type="email"
            placeholder={t("email", "Email")}
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Password */}
        <div className="relative">
          <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${tetMode ? "text-[#CB0502]" : "text-blue-500"}`}>
            <FontAwesomeIcon icon={faLock} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("password", "Password")}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className={inputPasswordClass}
          />
          <span
            className={`absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${tetMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </span>
        </div>

        {/* Options row */}
        <div className="flex items-center justify-between text-sm">
          <label className={`flex items-center gap-2 cursor-pointer select-none ${tetMode ? "text-gray-300" : "text-gray-600"}`}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className={`w-4 h-4 rounded border-gray-300 focus:ring-blue-400 ${tetMode ? "accent-[#CB0502]" : "accent-blue-500 text-blue-500"}`}
            />
            {t("remember_me", "Remember me")}
          </label>
          <button
            type="button"
            onClick={() => switchAuthModal("forgot-password")}
            className={`hover:underline transition-colors font-medium ${tetMode ? "text-[#fbbf24] hover:text-yellow-300" : "text-blue-500 hover:text-blue-700"}`}
          >
            {t("forget_password", "Forget password")}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-xl text-white font-semibold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r ${
            tetMode ? "from-[#CB0502] to-[#ff4444]" : "from-blue-500 to-indigo-500"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t("signing_in", "Signing in...")}
            </span>
          ) : (
            t("sign_in", "Sign in")
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className={`flex-1 h-px ${tetMode ? "bg-[#3a3b3c]" : "bg-gray-200"}`} />
          <span className={`text-sm ${tetMode ? "text-gray-500" : "text-gray-400"}`}>{t("or", "or")}</span>
          <div className={`flex-1 h-px ${tetMode ? "bg-[#3a3b3c]" : "bg-gray-200"}`} />
        </div>

        {/* Sign up link */}
        <p className={`text-center text-sm ${tetMode ? "text-gray-400" : "text-gray-600"}`}>
          {t("no_account", "Don't have an account?")}{" "}
          <button
            type="button"
            onClick={() => switchAuthModal("register")}
            className={`font-semibold hover:underline transition-colors ${tetMode ? "text-[#fbbf24] hover:text-yellow-300" : "text-blue-600"}`}
          >
            {t("sign_up", "Sign up")}
          </button>
        </p>
      </form>
    </div>
  );
}

export default LoginModal;
