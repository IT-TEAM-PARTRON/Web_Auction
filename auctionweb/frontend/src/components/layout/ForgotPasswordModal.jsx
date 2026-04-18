import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { forgotPassword } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useTetMode } from "../../contexts/TetModeContext";

function ForgotPasswordModal() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { switchAuthModal } = useAuth();
  const { tetMode } = useTetMode();
  const { t } = useTranslation();

  const inputClass = tetMode
    ? "w-full pl-11 pr-4 py-3 rounded-lg bg-[#3a3b3c] border border-[#4a4b4c] text-white placeholder-gray-500 text-sm outline-none transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-900/30 focus:bg-[#3a3b3c] disabled:opacity-60"
    : "w-full pl-11 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white disabled:opacity-60";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t("email_required", "Please enter your email address"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t("invalid_email", "Please enter a valid email address"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPassword(email);

      if (response.status === 200) {
        toast.success(
          t(
            "reset_link_sent",
            "Password reset link has been sent to your email!"
          ),
          {
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
          }
        );
        switchAuthModal("login");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        t("reset_link_failed", "Failed to send reset link. Please try again.");
      toast.error(errorMessage, {
        style: {
          border: "1px solid #fecaca",
          padding: "12px 16px",
          color: "#dc2626",
          fontWeight: "500",
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          borderRadius: "12px",
          background: "#fef2f2",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        },
        iconTheme: {
          primary: "#dc2626",
          secondary: "#fef2f2",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1
        className={`text-center text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r mb-2 ${
          tetMode ? "from-[#CB0502] to-[#ff4444]" : "from-blue-500 to-indigo-600"
        }`}
      >
        {t("forgot_password_title", "Forgot Password")}
      </h1>
      <p className={`text-center text-sm mb-6 ${tetMode ? "text-gray-400" : "text-gray-500"}`}>
        {t(
          "forgot_password_desc",
          "Enter your email address and we'll send you a link to reset your password."
        )}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="relative">
          <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${tetMode ? "text-[#CB0502]" : "text-blue-500"}`}>
            <FontAwesomeIcon icon={faEnvelope} />
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("enter_email", "Enter your email address")}
            required
            autoComplete="email"
            disabled={isLoading}
            className={inputClass}
          />
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
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {t("sending", "Sending...")}
            </span>
          ) : (
            t("send_reset_link", "Send Reset Link")
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className={`flex-1 h-px ${tetMode ? "bg-[#3a3b3c]" : "bg-gray-200"}`} />
          <span className={`text-sm ${tetMode ? "text-gray-500" : "text-gray-400"}`}>{t("or", "or")}</span>
          <div className={`flex-1 h-px ${tetMode ? "bg-[#3a3b3c]" : "bg-gray-200"}`} />
        </div>

        {/* Back to login */}
        <p className={`text-center text-sm ${tetMode ? "text-gray-400" : "text-gray-600"}`}>
          {t("remember_password", "Remember your password?")}{" "}
          <button
            type="button"
            onClick={() => switchAuthModal("login")}
            className={`font-semibold hover:underline transition-colors ${tetMode ? "text-[#fbbf24] hover:text-yellow-300" : "text-blue-600"}`}
          >
            {t("sign_in", "Sign in")}
          </button>
        </p>
      </form>
    </div>
  );
}

export default ForgotPasswordModal;
