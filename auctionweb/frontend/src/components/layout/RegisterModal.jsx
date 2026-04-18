import React, { useState } from "react";
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
import { toast } from "react-hot-toast";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useTetMode } from "../../contexts/TetModeContext";

function RegisterModal() {
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { switchAuthModal } = useAuth();
  const { tetMode } = useTetMode();
  const { t } = useTranslation();

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
      .regex(/^[\p{L}\s\0-9]+$/u, t("company_regex")),
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
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])[A-Za-z\d@#$!%*?&]+$/,
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

  const submitForm = async (formData) => {
    if (formData.password !== confirm) {
      toast.error(t("password_not_match", "Password does not match"));
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": sessionStorage.getItem("lang") || "en",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(t("register_success", "Register successful!"));
        switchAuthModal("login");
      } else {
        toast.error(data.detail || t("register_failed", "Register failed!"));
      }
    } catch (error) {
      console.error(error.detail || error.message || error);
      toast.error(t("register_failed", "Register failed!"));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = tetMode
    ? "w-full pl-11 pr-4 py-3 rounded-lg bg-[#3a3b3c] border border-[#4a4b4c] text-white placeholder-gray-500 text-sm outline-none transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-900/30 focus:bg-[#3a3b3c]"
    : "w-full pl-11 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white";

  const inputPasswordClass = tetMode
    ? "w-full pl-11 pr-11 py-3 rounded-lg bg-[#3a3b3c] border border-[#4a4b4c] text-white placeholder-gray-500 text-sm outline-none transition-all duration-300 focus:border-red-500 focus:ring-2 focus:ring-red-900/30 focus:bg-[#3a3b3c]"
    : "w-full pl-11 pr-11 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white";

  const errorClass = "text-red-500 text-xs mt-1 ml-1";
  const iconClass = `absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${tetMode ? "text-[#CB0502]" : "text-blue-500"}`;

  return (
    <div className="w-full">
      <h1
        className={`text-center text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r mb-1 ${
          tetMode ? "from-[#CB0502] to-[#ff4444]" : "from-blue-500 to-indigo-600"
        }`}
      >
        {t("register", "Register")}
      </h1>
      <p className={`text-center text-sm mb-4 ${tetMode ? "text-gray-400" : "text-gray-500"}`}>
        {t("register_des")}
      </p>

      <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
        {/* Email */}
        <div>
          <div className="relative">
            <span className={iconClass}>
              <FontAwesomeIcon icon={faEnvelope} />
            </span>
            <input
              {...register("email")}
              type="email"
              placeholder={t("email", "Email*")}
              autoComplete="email"
              className={inputClass}
            />
          </div>
          {errors.email && (
            <p className={errorClass}>{errors.email.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <div className="relative">
            <span className={iconClass}>
              <FontAwesomeIcon icon={faUser} />
            </span>
            <input
              {...register("username")}
              type="text"
              placeholder={t("username", "Username*")}
              autoComplete="off"
              className={inputClass}
            />
          </div>
          {errors.username && (
            <p className={errorClass}>{errors.username.message}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <div className="relative">
            <span className={iconClass}>
              <FontAwesomeIcon icon={faBuilding} />
            </span>
            <input
              {...register("company")}
              type="text"
              placeholder={t("company", "Company")}
              autoComplete="organization"
              className={inputClass}
            />
          </div>
          {errors.company && (
            <p className={errorClass}>{errors.company.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <div className="relative">
            <span className={iconClass}>
              <FontAwesomeIcon icon={faPhone} />
            </span>
            <input
              {...register("phone_number")}
              type="tel"
              placeholder={t("phone", "Phone Number*")}
              autoComplete="tel"
              className={inputClass}
            />
          </div>
          {errors.phone_number && (
            <p className={errorClass}>{errors.phone_number.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <span className={iconClass}>
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder={t("password", "Password*")}
              autoComplete="new-password"
              className={inputPasswordClass}
            />
            <span
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${tetMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          {errors.password && (
            <p className={errorClass}>{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <div className="relative">
            <span className={iconClass}>
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              {...register("passwordConfirm")}
              type="password"
              placeholder={t("confirm_password", "Confirm Password*")}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
            />
          </div>
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
              {t("registering", "Registering...")}
            </span>
          ) : (
            t("register", "Register")
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className={`flex-1 h-px ${tetMode ? "bg-[#3a3b3c]" : "bg-gray-200"}`} />
          <span className={`text-sm ${tetMode ? "text-gray-500" : "text-gray-400"}`}>{t("or", "or")}</span>
          <div className={`flex-1 h-px ${tetMode ? "bg-[#3a3b3c]" : "bg-gray-200"}`} />
        </div>

        {/* Sign in link */}
        <p className={`text-center text-sm ${tetMode ? "text-gray-400" : "text-gray-600"}`}>
          {t("already_account", "You already have an account?")}{" "}
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

export default RegisterModal;
