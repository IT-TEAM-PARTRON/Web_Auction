import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import axiosClient from "../../services/axiosClient";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
export default function UpdateAccountModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  const schema = z.object({
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
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
          t("password_regex")
        )
    });
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    phone_number: "",
    company: "",
    role: "",
    password: ""
  });

  useEffect(() => {
    if (!isOpen || !user?.user_id) return;

    setLoading(true);
    setError(null);

    axiosClient
      .get(`/users/${user.user_id}`)
      .then((res) => {
        const userData = res.data;
        setFormData({
          email: userData.email || "",
          username: userData.username || "",
          phone_number: userData.phone_number || "",
          company: userData.company || "",
          role: userData.role || "",
          password: userData.password || ""
        });
      })
      .catch((err) => {
        toast.error(err.response?.data?.detail || err.message || "Error load account info");
      })
      .finally(() => setLoading(false));
  }, [isOpen, user?.id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      schema.parse(formData);
      await axiosClient.put(`/users/${user.user_id}`, updateData);
      toast.success(t("update_user_success", "User updated successfully"));
      onClose();
    } catch (err) {
       if (err.errors) {
      setError(err.errors.map(e => e.message).join(", "));
      } 
    else {
      toast.error(err.response?.data?.detail || err.message || "Error updating account");
    } 
  }finally {
      setLoading(false);
    }
  };

  const handleClose = () => onClose();
  
  return (
    <div
      className={
        "fixed inset-0 flex items-center justify-center z-[2000] max-sm:pt-[140px] bg-black bg-opacity-50 " +
        (isOpen ? "visible" : "invisible")
      }
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      <div
        className={
          "sm:mt-[60px] md:mt-[55px] bg-white rounded-xl shadow-2xl 2xl:mb-[10px] w-full max-w-lg sm:max-w-2xl md:max-w-3xl max-h-[95vh] overflow-hidden mx-2 sm:mx-4 md:mx-auto flex flex-col fade-slide-up " +
          (isOpen ? "fade-slide-up-visible" : "fade-slide-up-hidden")
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 flex items-center justify-between relative">
          <div className="flex-1 text-center">
            <h2 className="text-xl font-bold uppercase">
              {t("account_info")}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors absolute right-4 sm:right-6"
            style={{ top: "50%", transform: "translateY(-50%)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {loading && !formData.email && (
            <div className="flex items-center justify-center py-8">
              <div className="loader"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700">
                <svg
                className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>{t("email")}</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                className="w-full border cursor-not-allowed border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                readOnly 
              />
            </div>

            {/* username */}
            <div >
              
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700">
                <svg
                className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>{t("username")}</label>

              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                disabled={loading}
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700">
                <svg  fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                {t("phone")}
                </label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                disabled={loading}
              />
            </div>

            {/* Công ty */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
                {t("company")}
                </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                disabled={loading}
              />
            </div>

            {/* Vai trò */}
            <div>
              

              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700">
                <svg  fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              {t("role")}
              </label>
              <input
                type="text"
                value={formData.role}
                className="w-full uppercase border cursor-not-allowed border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                readOnly 
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                {t("password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="•••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Nút */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 rounded-lg will-change-transform border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all transform  duration-300 hover:scale-105"
                disabled={loading}
              >
               {t("cancel")}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg will-change-transform bg-gradient-to-r from-blue-500 to-indigo-500 text-white  transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform  duration-300 hover:scale-105"
                disabled={loading}
              >
                {loading ? "Đang cập nhật..." : t("update")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
