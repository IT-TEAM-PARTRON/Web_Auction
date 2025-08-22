
import { create} from "../../services/api";
import clsx from "clsx";
import toast from "react-hot-toast";
import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const CreateCategoryForm = ({
  isOpen,
  onClickClose,
}) => {
  const { t, i18n } = useTranslation();
  const auctionSchema = z.object({
    category_name: z
      .string()
      .min(1, t("error.category_name_required"))
      .max(100, t("error.category_name_max_length")),
    description: z
      .string()
      .min(1, t("error.description_required"))
      .max(500, t("error.description_max_length")),
  });
    // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
  const savedLang = sessionStorage.getItem("lang") || "vi"; 
  i18n.changeLanguage(savedLang);
}, [i18n]);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      category_name: "",
      description: ""
    },
  });
  const onSubmit = async (formData) => {
    try {
        const data = {
        category_name: formData.category_name.trim(),
        description: formData.description.trim(),
        };
         const language = sessionStorage.getItem("lang") || "en";
        const res = await create("categories", data, true, { lang: language });
        if (res?.status === 201 || res?.status === 200) {
        toast.success(t("success.create_category_success"));
        reset();
        onClickClose(true);
        } else {
        toast.error(res?.data?.message || t("create_category_failed"));
        }
    } catch (error) {
        const detail = error?.response?.data?.detail || t("unknown_error");
        toast.error(detail);
        console.error(error);
    }
};

  return (
    <div
      className={clsx(
        "fixed inset-0 flex items-center pt-[50px] justify-center bg-black bg-opacity-50 z-50 max-sm:pt-[200px] ",
        isOpen ? "visible" : "invisible"
      )}
    >
      <div
        className={clsx(
          "bg-gray-200 w-full max-w-2xl max-sm:w-[90%] max-h-[95%] p-8 rounded-2xl relative overflow-hidden fade-slide-up",
          isOpen ? "fade-slide-up-visible" : "fade-slide-up-hidden"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 absolute top-0 left-0 w-full h-[7%] min-[1200px]:h-[10%]">
          <h2 className="uppercase text-lg sm:text-2xl font-bold text-center absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-1/2">
            {t("create_category")}
          </h2>
          <button
            onClick={() => onClickClose()}
            className="absolute max-[1500px]:top-2 top-5 right-3 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 text-white hover:text-gray-200"
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-2 mt-[5%] max-sm:mt-[6%] min-[1500px]:mt-[10%]"
        >
          <div className="relative">
            <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              <svg
                className="w-8 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z"
                />
              </svg>
              {t("category_name")}
              <span className="text-red-500">*</span>
            </label>
            <input
              {...register("category_name")}
              type="text"
              className="w-full p-2 rounded shadow"
            />
            {errors.category_name && (
              <p className="text-red-500 absolute right-1 text-xs">
                {errors.category_name.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              <svg
                className="w-8 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z"
                />
              </svg>
              {t("description")}
              <span className="text-red-500">*</span>
            </label>
            <input
              {...register("description")}
              type="text"
              className="w-full p-2 rounded shadow"
            />
            {errors.description && (
              <p className="text-red-500 absolute right-1 text-xs">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Submit button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
                {t("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryForm;
