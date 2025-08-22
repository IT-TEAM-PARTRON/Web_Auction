import "./ResetPassword.css";
import logo from "../../assets/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEye, faEyeSlash, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { resetPassword, verifyResetToken } from "../../services/api";
import z from "zod";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const token = searchParams.get('token');

  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setIsCheckingToken(false);
        return;
      }

      try {
        const response = await verifyResetToken(token);
        if (response.status === 200) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
        }
      } catch (error) {
        console.error("Token verification error:", error);
        setIsValidToken(false);
      } finally {
        setIsCheckingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const passwordSchema = z.object({
    newPassword: z
      .string()
      .min(8, t("password_min", "Password must be at least 8 characters"))
      .max(30, t("password_max", "Password must be at most 30 characters"))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        t("password_regex", "Password must contain uppercase, lowercase, number, and special character")
      ),
    confirmPassword: z.string().min(8, t("password_min", "Password must be at least 8 characters")),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t("password_not_match", "Passwords do not match"),
    path: ["confirmPassword"],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the passwords
    try {
      passwordSchema.parse({ newPassword, confirmPassword });
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        toast.error(err.errors[0].message);
      } else {
        toast.error(t("password_reset_failed", "Password reset failed. Please try again."));
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword(token, newPassword);
      
      if (response.status === 200) {
        toast.success(t("password_reset_success", "Password has been reset successfully!"), {
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
        
        // Chuyển hướng đến trnag login sau khi reset thành công
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(
        error.response?.data?.detail || t("password_reset_failed", "Password reset failed. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="reset-password-bg">
        <img src={logo} alt="Logo" className="reset-password-logo" />
        <div className="reset-password-form-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="reset-password-bg">
        <img src={logo} alt="Logo" className="reset-password-logo" />
        <div className="reset-password-form-container">
          <div className="error-container">
            <h2>Invalid Reset Link</h2>
            <p>{t("invalid_reset_token", "Invalid or expired reset token.")}</p>
            <Link to="/forgot-password" className="reset-password-btn">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-bg">
      <img src={logo} alt="Logo" className="reset-password-logo" />
      <div
        className={`reset-password-form-container transition-all duration-700 ease-out ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="reset-password-header">
          <h1 className="reset-password-title">{t("reset_password_title", "Reset Password")}</h1>
        </div>
        
        <p className="reset-password-desc">
          {t("reset_password_desc", "Enter your new password below.")}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="input-icon">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder={t("new_password", "New Password")}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              minLength={8}
            />
            <span
              className="input-icon right"
              style={{ cursor: "pointer" }}
              onClick={() => setShowNewPassword((prev) => !prev)}
            >
              <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          
          <div className="input-group">
            <span className="input-icon">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              type={"password"}
              placeholder={t("confirm_new_password", "Confirm New Password")}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              minLength={8}
            />
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
          
          <button 
            type="submit" 
            className="reset-password-btn"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : t("reset_password", "Reset Password")}
          </button>
          
          <div className="reset-password-footer">
            <Link to="/login" className="back-to-login-link">
              {t("back_to_login", "Back to Login")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;