import { useState } from "react";
import { create } from "../../services/api";
import { toast } from "react-hot-toast";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

function ModalAuction({ isOpen, onClose, email, username, auctionId, currency }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, i18n } = useTranslation();
  const MAX_FILE_SIZE =
    Number(import.meta.env.VITE_MAX_FILE_SIZE) || 100 * 1024 * 1024;
  const schema = z.object({
    auction_id: z.any(),
    address: z
      .string()
      .trim()
      .min(1, t("validate_bid.address_required"))
      .max(100, t("validate_bid.address_max")),
    bid_amount: z
      .number()
      .positive(t("validate_bid.bid_amount_positive"))
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toFixed(2)), {
        message: t("validate_bid.bid_amount_decimal"),
      }),
      file_excel: z
            .any()
            .optional()
            .refine(
              (file) => {
                if (!file || !(file instanceof File)) return true;
                return file.size <= MAX_FILE_SIZE;
              },
              {
                message: t("validate_auction.file_max_size"),
              }
            ),
    note: z.string().trim().max(1000, t("validate_bid.note_max")),
  });

  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);    
  }, [i18n]);

  const {
    handleSubmit,
    control,
    register,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      auction_id: auctionId,
      address: "",
      bid_amount: 0,
      note: "",
      file_excel: null,
    },
  });

  const submitAuctionForm = async (formData) => {
    setIsSubmitting(true);
    try {
      const excelUrl = await handleUpLoadExcel();
      const finalFormData = {
        ...formData,
        file: excelUrl,
      };      
      console.log(finalFormData);
      
      const response = await create("bids", finalFormData, true, {
        lang: sessionStorage.getItem("lang") || "en",
      });
      
      toast.success(t("success.bid_submitted"));
    } catch (error) {
      console.error(error.response?.data?.detail);
      toast.error(`${error.response?.data?.detail || "Upload failed"}!`, {
        style: {
          textAlign: "center",
        },
      });
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const handleUpLoadExcel = async () => {
    const excelFile = watch("file_excel");
    if (!excelFile) return null;
    const formData = new FormData();
    formData.append("file", excelFile);

    try {
      const response = await create("upload/excel", formData, true);
      return response.data.file_excel;
    } catch (error) {
      const detail = error?.response?.data?.detail;
      toast.error(detail || t("error.error_upload_excel"));
      throw error;
    }
  };
  return (
    <div
      className={clsx(
        "fixed inset-0 bg-black bg-opacity-50 flex items-center pt-[80px] max-sm:pt-[170px] justify-center p-2 z-[2000]",
        isOpen ? "visible" : "invisible"
      )}
      // onClick={onClose}
    >
      <div
        className={clsx(
          "bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg  transform transition-all duration-300 fade-slide-up",
          isOpen ? "fade-slide-up-visible" : "fade-slide-up-hidden"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white sm:p-1 rounded-t-2xl relative">
          <h2 className="text-lg sm:text-2xl font-bold text-center">
            {t("submit_your_bid")}
          </h2>
          <p className="text-blue-100 text-center text-sm sm:text-base">
            {t("enter_auction_details")}
          </p>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 text-white hover:text-gray-200"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit(submitAuctionForm)}
          className="p-3 sm:p-6 space-y-4 sm:space-y-1"
        >
          {/* Username Field */}
          <div className="">
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
              </svg>
              {t("username")}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-200 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-not-allowed"
                value={username}
                disabled
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="">
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
              </svg>
              {t("supplier_email")}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-200 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-not-allowed"
                value={email}
                disabled
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Address Field */}
          <div className="">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {t("address")}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Controller
              name="address"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <input
                    type="text"
                    {...field}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder={t("enter_delivery_address")}
                  />
                  {fieldState.error && (
                    <p className="text-red-500 text-[10px]">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Bid Amount Field */}
          <div className="">
            <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700">              
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
              {t("bid_amount_usd")}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium text-sm sm:text-base">
                  {currency === "VND" ? "₫" : "$"}
                </span>
              </div>
              <input
                type="number"
                placeholder="0.00"
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                {...register("bid_amount", { valueAsNumber: true })}
              />

              {errors.bid_amount && (
                <p className="text-red-500 text-[10px]">
                  {errors.bid_amount.message}
                </p>
              )}
            </div>
          </div>
           <div className="">
            <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              {t("attached_file")}
            </label>
            <Controller
              name="file_excel"
              control={control}
              render={({ field: { onChange, value, ...field }, fieldState }) => {
                const fileName = value instanceof File ? value.name : "";                
                return (
                  <div className="relative space-y-2">
                    {/* Ô input hiển thị tên file */}
                    <input
                      type="text"
                      readOnly
                      value={fileName}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white border border-gray-300 rounded-md sm:rounded-lg cursor-pointer"
                      placeholder={t("select_excel_file")}
                      onClick={() => document.getElementById("excelFile")?.click()}
                    />
                    {/* Input file ẩn */}
                    <input
                      {...field}
                      id="excelFile"
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file || null);
                      }}
                    />

                    {/* Thông báo lỗi */}
                    {fieldState.error && (
                      <p className="text-red-500 text-[10px]">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                );
              }}
            />
          </div>   
          {/* Note Field */}
          <div className="">
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {t("additional_notes")}
            </label>
            <Controller
              name="note"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <textarea
                    {...field}
                    className="w-full px-4 sm:px-2 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
                    rows="3"
                    placeholder={t("add_special_requirement_or_comment")}
                  />
                  {fieldState.error && (
                    <p className="text-red-500">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r will-change-transform from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 sm:py-4 px-4 sm:px-3 text-sm sm:text-base rounded-md sm:rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-sm sm:text-base">Submitting...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">
                    {t("submit_bid")}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalAuction;
