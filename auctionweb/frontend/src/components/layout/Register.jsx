import React, { useState, useEffect } from "react";
import "./Login.css";
import logo from "../../assets/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUser,
  faLock,
  faBuilding,
  faEye,
  faPhone,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const schema = z.object({
    email: z
      .string({ required_error: t("email_required") })
      .email(t("email_invalid"))
      .max(100, t("email_max")),
    username: z
      .string()
      .min(3, t("username_min"))
      .max(50, t("username_max"))
      .regex(/^[\p{L}\s]+$/u, t("username_regex")),
    company: z
      .string()
      .min(2, t("company_min"))
      .max(100, t("company_max"))
      .regex(/^[\p{L}\s]+$/u, t("company_regex")),
    phone_number: z
      .string()
      .min(10, t("phone_require"))
      .max(10, t("phone_require"))
      .regex(
        /^[0-9+\-\s()]+$/,
        t("phone_regex", "Invalid phone number format")
      ),
    password: z
      .string()   
      .min(8, t("password_min"))
      .max(30, t("password_max"))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@#$!%*?&]+$/,
        t("password_regex")
      ),
    passwordConfirm: z.string().min(8, t("password_min")),
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      username: "",
      email: "",
      company: "",
      phone_number: "",
      password: "",
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  const submitForm = async (formData) => {
    if (formData.password !== confirm) {
      toast.error(t("password_not_match", "Password does not match"));
      return;
    }
    try {
      const response = await fetch("/api/v1/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept-Language": sessionStorage.getItem("lang") || "en"},
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(t("register_success", "Register successful!"));
        navigate("/login");
      } else {
        toast.error(data.detail || t("register_failed", "Register failed!"));
      }
    } catch (error) {
      console.error(error.detail || error.message || error);
      toast.error(t("register_failed", "Register failed!"));
    }
  };

  return (
    <div className="login-bg">
      <img src={logo} alt="Logo" className="login-logo" />
      <div
        className={`login-form-container transition-all duration-700 ease-out ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h1 className="login-title">{t("register", "Register")}</h1>
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="input-group">
            <span className="input-icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </span>
            <input
              {...register("email")}
              type="email"
              placeholder={t("email", "Email*")}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-500 text-[8px] absolute left-0 ml-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="input-group">
            <span className="input-icon">
              <FontAwesomeIcon icon={faUser} />
            </span>
            <input
              {...register("username")}
              type="text"
              placeholder={t("username", "Username*")}
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-red-500 text-[8px] absolute left-0 ml-1">
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="input-group">
            <span className="input-icon">
              <FontAwesomeIcon icon={faBuilding} />
            </span>
            <input
              {...register("company")}
              type="text"
              placeholder={t("company", "Company")}
              autoComplete="organization"
            />
            {errors.company && (
              <p className="text-red-500 text-[8px] absolute left-0 ml-1">
                {errors.company.message}
              </p>
            )}
          </div>
          <div className="input-group">
            <span className="input-icon">
              <FontAwesomeIcon icon={faPhone} />
            </span>
            <input
              {...register("phone_number")}
              type="tel"
              placeholder={t("phone", "Phone Number*")}
              autoComplete="tel"
            />
            {errors.phone_number && (
              <p className="text-red-500 text-[8px] absolute left-0 ml-1">
                {errors.phone_number.message}
              </p>
            )}
          </div>
          <div className="input-group">
            <span className="input-icon">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder={t("password", "Password*")}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-red-500 text-[8px] absolute left-0 ml-1">
                {errors.password.message}
              </p>
            )}
            <span
              className="input-icon right"
              style={{ cursor: "pointer" }}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <div className="input-group">
            <span className="input-icon">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              {...register("passwordConfirm")}
              type="password"
              placeholder={t("confirm_password", "Confirm Password*")}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {errors.password && (
              <p className="text-red-500 text-[8px] absolute left-0 ml-1">
                {errors.password.message}
              </p>
            )}
            {/* <span
              className="input-icon right"
              style={{ cursor: "pointer" }}
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
            </span> */}
          </div>
          <button type="submit" className="login-btn">
            {t("register", "Register")}
          </button>
          <div className="login-or">{t("or", "or")}</div>
          <div className="login-signup">
            {t("already_account", "You already have an account?")}{" "}
            <Link to="/login">{t("sign_in", "Sign in")}</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
