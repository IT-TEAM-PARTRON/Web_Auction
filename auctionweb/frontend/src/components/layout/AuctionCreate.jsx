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
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { BASE_URL } from "../../config";

const CreateAuctionForm = ({
  isOpen,
  onClickClose,
  mode = "create",
  auction,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputKey, setInputKey] = useState(false);  
  const [categories, setCategories] = useState([]);
  const [listUser, setListUser] = useState([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState([]); 
  const [participantQuery, setParticipantQuery] = useState("");
  const MAX_FILE_SIZE =
    Number(import.meta.env.VITE_MAX_FILE_SIZE) || 100 * 1024 * 1024;
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
      .max(3000, t("validate_auction.description_max")),
    starting_price: z.number().optional(),
    step_price: z.number().optional(),
    image_url: z
      .array(z.union([z.instanceof(File), z.string()]))
      .min(2, t("validate_auction.image_url_min")),
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
    participants: z.array(z.string()).min(1, t("validate_auction.participants_required")),
    auction_type: z.enum(["SELL", "BUY"], {
      errorMap: () => ({ message: t("validate_auction.auction_type_required") }),
    }),
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
    trigger,
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
      participants: [],
      file_exel: null,
      image_url: [],
      category_id: "",
      auction_type: ""
    },
  });

  const startTime = watch("start_time");
  const endTime = watch("end_time");
  // chone mode
  useEffect(() => {
    if (mode === "create") {
      reset({
        title: "",
        auction_type: "",
        starting_price: 0,
        step_price: 0,
        start_time: "",
        end_time: "",
        currency: "USD",
        description: "",
        participants: [],
        file_exel: null,
        image_url: [],
        category_id: "",
      });
    } else if (mode === "edit" && auction) {
      reset({
        title: auction.title || "",
        auction_type: auction.auction_type || "BUY",
        starting_price: auction.starting_price || 0,
        step_price: auction.step_price || 0,
        start_time: auction.start_time || "",
        currency: auction.currency || "USD",
        end_time: auction.end_time || "",
        description: auction.description || "",
        participants: [],
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
  // Call api Category
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
    // Call api Participants
    useEffect(() => {
  const fetchParticipants = async () => {
    if (!auction?.id) return;
    try {
      const res = await getAll(`auctions/${auction.id}/participants`, true);
      const raw = Array.isArray(res?.participants)
       ? res.participants
       : Array.isArray(res?.data?.participants)
       ? res.data.participants
       : [];
     const ids = raw
       .map(p => (typeof p === "string" ? p : p?.user_id))
       .filter(Boolean);
      setSelectedParticipantIds(ids);
      setValue("participants", ids); 
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };
  fetchParticipants();
}, [auction?.id, setValue]);

  // Submit form
  const onSubmit = async (formData) => {
    setIsSubmitting(true);
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
    finally {
      setIsSubmitting(false);
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

  // call api get list users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAll("users", true, { page_size: 100, role: "USER" });
        let usersData = [];
        if (response?.data?.users && Array.isArray(response.data.users)) {
          usersData = response.data.users;
        
        if (usersData.length > 0) {
          const formattedUsers = usersData.map(user => ({
            id: user.id,
            name: user.username,
            email: user.email
          }));
          setListUser(formattedUsers);
          
        } else {
          console.warn("No users found in response");
        }
      }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);
  // set checkbox selected participants
  useEffect(() => {
    setValue("participants", selectedParticipantIds);
  }, [selectedParticipantIds, setValue]);

  // Check xem tất cả user đã chọn chưa
  const allParticipantsChecked =
    listUser.length > 0 &&
    selectedParticipantIds.length === listUser.length;
  // Tìm kiếm không phân biệt dấu
  const normalize = (s = "") =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  // Danh sách user sau khi filter
  const filteredParticipants = listUser.filter(u => {
    const q = normalize(participantQuery);
    return (
      normalize(u.name).includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div
      className={clsx(
        "fixed inset-0 flex items-center pt-[50px] justify-center bg-black bg-opacity-50 z-[2000] ",
        isOpen ? "visible" : "invisible"
      )}
      // onClick={onClickClose}
    >
      <div
        className={clsx(
          "bg-white w-full max-w-4xl max-sm:w-[90%] max-h-[95%] rounded-2xl relative overflow-hidden fade-slide-up",
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
        <div className="mt-[7%] max-sm:mt-[10%] min-[1500px]:mt-[10%] overflow-y-auto scrollbar-thumb-gray-400 p-2 pt-0 max-h-[80vh] pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 min-w-[300px] mt-[14px] max-w-[1500px]"
          >
            <div className="flex gap-4">
              {/* title */}
              <div className="flex-[3] relative">                
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
                  className="w-full p-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                {errors.title && (
                  <p className="text-red-500 absolute right-1 text-xs">
                    {errors.title.message}
                  </p>
                )}
              </div>
              {/* type product */}
              <div className="flex-[3] relative">
                <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
                  </svg>
                  {t("type")}<span className="text-red-500">*</span>
                </label>
                <select
                  {...register("category_id")}
                  className="w-full p-[10px] rounded-lg flex items-center border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">{t("select_group")}</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name.toLowerCase()}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-red-500 absolute right-1 text-xs">
                    {errors.category_id.message}
                  </p>
                )}
              </div>
              {/* type auction */}
              <div className="flex-[2] relative">
                <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                  </svg>
                  {t("auction_type")}<span className="text-red-500">*</span>
                </label>
                <select
                  {...register("auction_type")}
                  className="w-full p-[10px] rounded-lg flex items-center border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">{t("select_group")}</option>
                  <option value="SELL">{t("sell")}</option>
                  <option value="BUY">{t("buy")}</option>
                </select>
                {errors.auction_type && (
                  <p className="text-red-500 absolute right-1 text-xs">
                    {errors.auction_type.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              {/* currency */}
              <div className="flex-1 relative">
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                    </svg>
                    {t("currency")}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-row gap-6 mt-3 justify-center">
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
              {/* starting_price */}
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
                  className="w-full p-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  onChange={(e) => setStartingPrice(e.target.value)}
                />
                {/* {errors.starting_price && (
                  <p className="text-red-500 absolute right-1 text-xs">
                    {errors.starting_price.message}
                  </p>
                )} */}
              </div>
              {/* step_price */}
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
                  className="w-full p-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  onChange={(e) => setStepPrice(e.target.value)}
                />
                {/* {errors.step_price && (
                  <p className="text-red-500 absolute right-1 text-xs">
                    {errors.step_price.message}
                  </p>
                )} */}
              </div>            
            </div>
            {/* time */}
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
            {/* participants */}
            <div className="relative">
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                    {t("participants")}<span className="text-red-500">*</span>
                  </label>
                  
                  {/* Tất cả mọi người */}
                  <label className="inline-flex items-center gap-2 text-indigo-600 font-medium cursor-pointer select-none">
                    <p className="text-gray-600">{t("selected")}: {selectedParticipantIds.length}</p>
                    <Controller
                      name="participants"
                      control={control}
                      render={({ field: { onChange } }) => (
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-blue-700 ui-checkbox"
                          checked={selectedParticipantIds.length === listUser.length}
                          onChange={() => {
                            const newIds =
                              selectedParticipantIds.length === listUser.length
                                ? []
                                : listUser.map(u => u.id);
                            setSelectedParticipantIds(newIds);
                            onChange(newIds);
                          }}
                        />
                      )}
                    />
                    <span>{t("all")}</span>
                  </label>
                </div>
                {/* Ô tìm kiếm user */}
                  <div className="mb-3">
                    <div className="relative">
                      <input
                        value={participantQuery}
                        onChange={(e) => setParticipantQuery(e.target.value)}
                        type="text"
                        placeholder="Tìm theo tên hoặc email"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                      <svg
                        className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M21 21l-4.35-4.35M10 18a8 8 0 110-16 8 8 0 010 16z" />
                      </svg>
                    </div>
                  </div>
                {/* Hộp danh sách người dùng */}
                <div className="rounded-xl border border-gray-300 bg-white overflow-y-auto max-h-60">
                  <ul className="divide-y divide-gray-300">
                    {filteredParticipants.length > 0 ? (
                      filteredParticipants.map(u => {
                        const checked = selectedParticipantIds.includes(u.id);
                        return (
                          <li key={u.id} className="flex items-center gap-3 px-4 py-3">                          
                            <Controller
                              name="participants"
                              control={control}
                              render={({ field: { onChange } }) => (
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 accent-blue-500 ui-checkbox"
                                  checked={selectedParticipantIds.includes(u.id)}
                                  onChange={() => {
                                    const newIds = selectedParticipantIds.includes(u.id)
                                      ? selectedParticipantIds.filter(x => x !== u.id)
                                      : [...selectedParticipantIds, u.id];
                                    setSelectedParticipantIds(newIds);
                                    onChange(newIds);
                                  }}
                                />
                              )}
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 leading-5">{u.name}</p>
                              <p className="text-sm text-gray-500 leading-4">{u.email}</p>
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      <li className="px-4 py-8 text-center text-gray-500">
                        {listUser.length === 0 ? t("loading_users") : t("no_users_found")}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              {errors.participants && (
                <p className="text-red-500 absolute right-1 text-xs">
                  {errors.participants.message}
                </p>
              )}
            </div>
            {/* description */}
            <div className="relative">
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
                {t("description")}
                <span className="text-red-500">*</span>
              </label>
              {/* CKEditor */}
              <Controller
                name="description"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <CKEditor
                    editor={ClassicEditor}
                    data={value || ""}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      onChange(data);
                    }}
                    config={{
                    toolbar: {
                      items: [
                        "heading",
                        "|",
                        "bold",
                        "italic",
                        "link",
                        "bulletedList",
                        "numberedList",
                        "|",
                        "outdent",
                        "indent",
                        "|",
                        "insertTable",
                        "blockQuote",
                        "|",
                        "undo",
                        "redo",
                      ],
                    },
                    table: {
                      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
                    },
                    placeholder: t("describe_auction"),
                  }}
                  />
                )}
              />

              {errors.description && (
                <p className="text-red-500 absolute right-1 text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>
            {/* excel file */}
            <div className="flex-1 relative">
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
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
                        placeholder={t("select_excel_file")}
                        className="w-full p-2 rounded-lg border border-gray-300 text-gray-700 cursor-pointer outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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
            {/* image */}
            <div className="flex-1 relative">
              <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                {t("img")}
                <span className="text-red-500">*</span>
              </label>

              <div className="flex w-full ">
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
                          : `${BASE_URL}${item}`;

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
            {/* submit form */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="flex items-center justify-center gap-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded hover:bg-blue-600 transform transition-transform duration-300 hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    {/* Loading icon */}
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    <span className="text-sm sm:text-base">Creating...</span>
                  </>
                ) : (
                  <>
                    {/* Icon mũi tên */}
                    <svg
                      className="w-5 h-5"
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
                    {/* Text chính */}
                    <span className="text-sm sm:text-base">
                      {mode === "create" ? t("create") : t("edit")}
                    </span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      
      </div>
    </div>
  );
};

export default CreateAuctionForm;
