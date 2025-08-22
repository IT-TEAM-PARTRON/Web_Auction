import RangeCalender from "../ui/RangeCalender";
import { create, update, getAll } from "../../services/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import clsx from "clsx";
import toast from "react-hot-toast";
import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const CreateAuctionForm = ({
  isOpen,
  onClickClose,
  mode = "create",
  auction,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [inputKey, setInputKey] = useState(false);  
  const [categories, setCategories] = useState([]);
  const MAX_FILE_SIZE =
    Number(import.meta.env.VITE_MAX_FILE_SIZE) || 10 * 1024 * 1024;
  const { t, i18n } = useTranslation();
  const auctionSchema = z.object({
    title: z
      .string()
      .trim()
      .min(1, t("validate_auction.title_required"))
      .max(200, t("validate_auction.title_max")),
    description: z
      .string()
      .trim()
      .min(1, t("validate_auction.description_required"))
      .max(2000, t("validate_auction.description_max")),
    starting_price: z.number().optional(),
    step_price: z.number().optional(),
    image_url: z
      .array(z.union([z.instanceof(File), z.string()]))
      .min(1, t("validate_auction.image_url_min")),
    file_exel: z
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
    currency: z.enum(["USD", "VND"]),
    end_time: z.string().min(1, t("validate_auction.end_time_required")),
    start_time: z.any(),
    category_id: z.string().min(1, t("validate_auction.category_id_required")),
  });

  dayjs.extend(utc);
  dayjs.extend(timezone);

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(auctionSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
      starting_price: 0,
      step_price: 0,
      currency: "USD",
      start_time: "",
      end_time: "",
      description: "",
      file_exel: null,
      image_url: [],
      category_id: "",
    },
  });

  const startTime = watch("start_time");
  const endTime = watch("end_time");

  useEffect(() => {
    if (mode === "create") {
      reset({
        title: "",
        starting_price: 0,
        step_price: 0,
        start_time: "",
        end_time: "",
        currency: "USD",
        description: "",
        file_exel: null,
        image_url: [],
        category_id: "",
      });
    } else if (mode === "edit" && auction) {
      reset({
        title: auction.title || "",
        starting_price: auction.starting_price || 0,
        step_price: auction.step_price || 0,
        start_time: auction.start_time || "",
        currency: auction.currency || "USD",
        end_time: auction.end_time || "",
        description: auction.description || "",
        file_exel: null,
        image_url: auction.image_url || [],
        category_id: auction.category?.category_id || "",
      });
      setInputKey((prev) => !prev);
    }
  }, [mode, auction, reset]);

  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  useEffect(() => {
      const fetchCategories = async () => {
        try {
          const dataGroup = await getAll("categories", false);
          setCategories(Array.isArray(dataGroup) ? dataGroup : dataGroup.data?.Categories || []);
        } catch (error) {
          console.error("Error fetching categories:", error);
          setCategories([]);
        }
      };
      fetchCategories();
    }, []);

  // Effect riêng để set category_id khi edit mode và có auction data
  useEffect(() => {
    if (mode === "edit" && auction && auction.category_id && categories.length > 0) {
      setValue("category_id", auction.category_id);
    }
  }, [mode, auction, categories, setValue]);
  const onSubmit = async (formData) => {
    const arrLinkImg = await handlerUploadImgs(formData.image_url);
    const linkExcel = await handleUpLoadExcel();

    try {
      const data = {
        ...formData,
        image_url: arrLinkImg,
        file_exel:
          linkExcel || (mode === "edit" ? auction?.file_exel || null : null),
      };
      const language = sessionStorage.getItem("lang") || "en";
      if (mode === "create") {
        await create("auctions", data, true, { lang: language });
        toast.success(t("success.add_new_auction"));
      } else {
        await update("auctions", auction.id, data, true, { lang: language });
        toast.success(t("success.update_auction"));
      }

      onClickClose(true);
    } catch (error) {
      const detail = error?.response?.data?.detail;
      toast.error(
        detail ||
          (mode === "create"
            ? t("error.add_new_auction")
            : t("error.update_auction"))
      );
      console.log(error);
    }
  };

  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  const imgFiles = watch("image_url") || [];

  const handleFileChange = (e) => {
    const currentFiles = watch("image_url") || [];
    const files = Array.from(e.target.files);

    const currentNames = currentFiles.map((file) => file.name);
    const newNames = files.map((file) => file.name);

    const hasDuplicate = newNames.some((name) => currentNames.includes(name));

    if (hasDuplicate) {
      toast.error(t("error.duplicate_photos"));
      return;
    }

    setValue("image_url", [...currentFiles, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      const currentFiles = watch("image_url") || [];

      const currentNames = currentFiles.map((file) => file.name);
      const newNames = files.map((file) => file.name);

      const hasDuplicate = newNames.some((name) => currentNames.includes(name));

      if (hasDuplicate) {
        toast.error(t("error.duplicate_photos"));
        return;
      }

      setValue("image_url", [...currentFiles, ...files]);
    }
  };

  const removeFile = (indexToRemove) => {
    const currentFiles = watch("image_url") || [];
    const updatedFiles = currentFiles.filter(
      (_, index) => index !== indexToRemove
    );
    setValue("image_url", updatedFiles);
  };

  const handleDragAreaClick = () => {
    document.getElementById("imageInput").click();
  };

  const handlerUploadImgs = async (imgs) => {
    const files = imgs.filter((img) => img instanceof File);
    const existingUrls = imgs.filter((img) => typeof img === "string");
    const formData = new FormData();
    files.forEach((img) => {
      formData.append("files", img);
    });
    try {
      const language = sessionStorage.getItem("lang") || "en";
      let uploadedUrls = [];
      if (files.length > 0) {
        const response = await create("upload/image", formData, true, {
          lang: language,
        });
        uploadedUrls = response.data.image_urls;
      }
      return [...existingUrls, ...uploadedUrls];
    } catch (error) {
      const detail = error?.response?.data?.detail;
      toast.error(detail || t("error.error_upload_image"));
      throw error;
    }
  };

  const handleUpLoadExcel = async () => {
    const excelFile = watch("file_exel");
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
        "fixed inset-0 flex items-center pt-[50px] justify-center bg-black bg-opacity-50 z-50 max-sm:pt-[200px] ",
        isOpen ? "visible" : "invisible"
      )}
      // onClick={onClickClose}
    >
      <div
        className={clsx(
          "bg-gray-200 w-full max-w-2xl max-sm:w-[90%] max-h-[95%] p-8 rounded-2xl relative overflow-hidden fade-slide-up",
          isOpen ? "fade-slide-up-visible" : "fade-slide-up-hidden"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white sm:p-1 absolute top-0 left-0 w-full h-[7%] min-[1500px]:h-[10%]">
          <h2 className="uppercase text-lg sm:text-2xl font-bold text-center absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-1/2">
            {mode == "create" ? t("create_auction_btn") : t("edit_auction_btn")}
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
          <div className="flex gap-4">
            <div className="flex-1 relative">
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
                {t("title")}
                <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title")}
                type="text"
                className="w-full p-2 rounded shadow"
              />
              {errors.title && (
                <p className="text-red-500 absolute right-1 text-xs">
                  {errors.title.message}
                </p>
              )}
            </div>
            
            <div className="flex-1 relative">
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
                {t("type")}<span className="text-red-500">*</span>
              </label>
              <select
                {...register("category_id")}
                className="w-full p-2 rounded shadow bg-white"
              >
                <option value="">{t("select_group")}</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-red-500 absolute right-1 text-xs">
                  {errors.category_id.message}
                </p>
              )}
            </div>
          </div>          

          <div className="flex gap-4">
            <div className="flex-1 relative">
                <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {t("currency")}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-row gap-6 mt-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="USD"
                      {...register("currency")}
                      className="w-4 h-4"
                    />USD
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="VND"
                      {...register("currency")}
                      className="w-4 h-4"
                    />
                    VND
                  </label>
                </div>
                {errors.currency && (
                  <p className="text-red-500 absolute right-1 text-xs">
                    {errors.currency.message}
                  </p>
                )}
            </div>
            <div className="flex-1 relative">
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
                    d="M7 7h.01M3 7a4 4 0 014-4h6l8 8-6 6-8-8V7z"
                  />
                </svg>
                {t("starting_price")}
                {/* <span className="text-red-500">*</span> */}
              </label>
              <input
                {...register("starting_price", { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full p-2 rounded shadow"
                onChange={(e) => setStartingPrice(e.target.value)}
              />
              {/* {errors.starting_price && (
                <p className="text-red-500 absolute right-1 text-xs">
                  {errors.starting_price.message}
                </p>
              )} */}
            </div>

            <div className="flex-1 relative">
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
                    d="M3 17l6-6 4 4 8-8M14 7h7v7"
                  />
                </svg>
                {t("step_price")}
                {/* <span className="text-red-500">*</span> */}
              </label>
              <input
                {...register("step_price", { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full p-2 rounded shadow"
                onChange={(e) => setStepPrice(e.target.value)}
              />
              {/* {errors.step_price && (
                <p className="text-red-500 absolute right-1 text-xs">
                  {errors.step_price.message}
                </p>
              )} */}
            </div>            
          
          </div>
          <div className="relative">
            <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t("select_time")}
              <span className="text-red-500">*</span>
            </label>
            <RangeCalender
              onChange={(dates) => {
                if (dates.length === 2) {
                  setValue(
                    "start_time",
                    dayjs(dates[0]).tz("Asia/Ho_Chi_Minh").format()
                  );
                  setValue(
                    "end_time",
                    dayjs(dates[1]).tz("Asia/Ho_Chi_Minh").format()
                  );
                }
              }}
              value={
                startTime && endTime
                  ? [dayjs(startTime).toDate(), dayjs(endTime).toDate()]
                  : []
              }
              allowMinDate={false}
            />
            {errors.end_time && (
              <p className="text-red-500 mt-1 absolute right-1 text-xs">
                {errors.end_time.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
                  d="M8 16h8M8 12h8M9 4h6a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2z"
                />
              </svg>
              {t("description")}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              className="w-full p-2 rounded shadow h-24  max-[1500px]:max-h-14"
              // defaultValue={auction.description || ""}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && (
              <p className="text-red-500 absolute right-1 text-xs">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="flex-1 relative">
            <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
                  d="M4 4h16v16H4V4z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 9l6 6m0-6l-6 6"
                />
              </svg>
              {t("excel")}
            </label>
            <Controller
              name="file_exel"
              control={control}
              render={({
                field: { onChange, value, ...field },
                fieldState,
              }) => {
                const fileName =
                  value instanceof File
                    ? value.name
                    : auction?.file_exel?.split("/").pop() || "";

                return (
                  <div className="relative space-y-2">
                    {/* Ô input chỉ hiển thị tên file */}
                    <input
                      type="text"
                      readOnly
                      value={fileName}
                      className="w-full p-2 rounded shadow bg-white text-gray-700 cursor-pointer"
                      onClick={() => {
                        document.getElementById("filePicker")?.click();
                        console.log(value);
                        console.log(watchedFile);
                      }}
                    />

                    {/* Input file ẩn */}
                    <input
                      {...field}
                      id="filePicker"
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      key={inputKey}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file || null);
                      }}
                    />

                    {/* Thông báo lỗi */}
                    {fieldState.error && (
                      <p className="text-red-500 absolute right-1 text-xs">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                );
              }}
            />
          </div>

          <div className="flex-1 relative">
            <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
                  d="M3 5a2 2 0 012-2h2l1-1h6l1 1h2a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
                />
                <circle cx="12" cy="13" r="3" />
              </svg>
              {t("img")}
              <span className="text-red-500">*</span>
            </label>

            <div className="flex w-full">
              {/* Drag & Drop Area */}
              <div
                className={clsx(
                  "min-[1500px]:p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer flex-1",
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleDragAreaClick}
              >
                <div className="text-center h-28 max-[375px]:h-20 overflow-y-auto">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">
                        {t("click_to_select_image")}
                      </span>{" "}
                      {t("or_drag_and_drop")}
                    </p>
                    <p className="text-sm text-red-500">{t("photo_limit")}</p>
                  </div>
                  {/* Image Preview Area */}
                  <div
                    className="grid grid-cols-6 gap-2 ml-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[...(imgFiles || [])].map((item, index) => {
                      const isFile = item instanceof File;
                      const key = isFile
                        ? `${item.name}-${item.size}-${item.lastModified}`
                        : item;

                      const src = isFile
                        ? URL.createObjectURL(item)
                        : `${import.meta.env.VITE_BASE_URL}${item}`;

                      return (
                        <div key={key} className="relative">
                          <img
                            src={src}
                            alt={`preview-${index}`}
                            className="object-cover rounded border"
                          />
                          <div
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                            title="Delete image"
                          >
                            ×
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            {/* Hidden Input */}
            <Controller
              name="image_url"
              control={control}
              render={({
                field: { onChange, value, ...field },
                fieldState,
              }) => (
                <>
                  <input
                    {...field}
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                  />

                  {fieldState.error && (
                    <p className="text-red-500 absolute right-1 text-xs">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              {mode == "create" ? t("create") : t("edit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuctionForm;
