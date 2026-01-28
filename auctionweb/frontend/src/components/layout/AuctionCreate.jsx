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
import { useTetMode } from "../../contexts/TetModeContext";

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
  const { tetMode } = useTetMode();
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
        "fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[2000]",
        isOpen ? "visible" : "invisible"
      )}
    >
      <div
        className={clsx(
          `w-full max-w-5xl sm:w-[95%] md:w-[90%] max-h-[95vh] rounded-3xl relative overflow-hidden shadow-2xl fade-slide-up ${tetMode ? 'bg-gradient-to-br from-[#242526] to-[#18191a] border border-[#3a3b3c]' : 'bg-gradient-to-br from-gray-50 to-white'}`,
          isOpen ? "fade-slide-up-visible" : "fade-slide-up-hidden"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative text-white px-6 py-3 flex items-center justify-between shadow-lg uppercase ${tetMode ? 'bg-gradient-to-r from-[#CB0502] to-[#ff4444]' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* để tạm trống f */}
        </div>

        {/* Center title */}
        <h2 className="absolute left-1/2 -translate-x-1/2 text-xl sm:text-2xl font-bold">
          {mode === "create" ? t("create_auction_btn") : t("edit_auction_btn")}
        </h2>

        {/* Right */}
        <button
          onClick={onClickClose}
          className="w-9 h-9 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>


        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)] p-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Section 1: Basic Information */}
            <div className={`rounded-2xl shadow-md border p-6 hover:shadow-lg transition-shadow ${tetMode ? 'bg-[#242526] border-[#3a3b3c]' : 'bg-white border-gray-200'}`}>
              <div className={`flex items-center gap-2 mb-5 pb-3 border-b ${tetMode ? 'border-[#3a3b3c]' : 'border-gray-200'}`}>
                <div className={`p-2 rounded-lg shadow-sm ${tetMode ? 'bg-gradient-to-br from-[#CB0502] to-[#ff4444]' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-bold ${tetMode ? 'text-gray-200' : 'text-gray-800'}`}>{t("basic_info")}</h3>
              </div>

              {/* Title */}
              <div className="mb-5 relative">
                <label className={`flex items-center text-sm font-semibold mb-2 ${tetMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className={`w-5 h-5 mr-2 ${tetMode ? 'text-[#CB0502]' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z" />
                  </svg>
                  {t("title")}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  {...register("title")}
                  type="text"
                  placeholder={t("enter_product_name")}
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm ${tetMode ? 'bg-[#3a3b3c] border-[#4a4b4c] text-white placeholder-gray-500 focus:border-[#CB0502] focus:ring-4 focus:ring-red-900/30' : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Category */}
                <div className="relative">
                  <label className={`flex items-center text-sm font-semibold mb-2 ${tetMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <svg className={`w-5 h-5 mr-2 ${tetMode ? 'text-[#CB0502]' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
                    </svg>
                    {t("type")}<span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    {...register("category_id")}
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm appearance-none ${tetMode ? 'bg-[#3a3b3c] border-[#4a4b4c] text-white focus:border-[#CB0502] focus:ring-4 focus:ring-red-900/30' : 'bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'}`}
                    style={{backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%236b7280%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22M19 9l-7 7-7-7%22/%3E%3C/svg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "20px"}}
                  >
                    <option value="">{t("select_group")}</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name.toLowerCase()}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.category_id.message}
                    </p>
                  )}
                </div>

                {/* Auction Type */}
                <div className="relative">
                  <label className={`flex items-center text-sm font-semibold mb-2 ${tetMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <svg className={`w-5 h-5 mr-2 ${tetMode ? 'text-[#CB0502]' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                    </svg>
                    {t("auction_type")}<span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    {...register("auction_type")}
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm appearance-none ${tetMode ? 'bg-[#3a3b3c] border-[#4a4b4c] text-white focus:border-[#CB0502] focus:ring-4 focus:ring-red-900/30' : 'bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'}`}
                    style={{backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%236b7280%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22M19 9l-7 7-7-7%22/%3E%3C/svg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "20px"}}
                  >
                    <option value="">{t("select_group")}</option>
                    <option value="SELL">{t("sell")}</option>
                    <option value="BUY">{t("buy")}</option>
                  </select>
                  {errors.auction_type && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.auction_type.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Pricing & Currency */}
            <div className={`rounded-2xl shadow-md border p-6 hover:shadow-lg transition-shadow ${tetMode ? 'bg-[#242526] border-[#3a3b3c]' : 'bg-white border-gray-200'}`}>
              <div className={`flex items-center gap-2 mb-5 pb-3 border-b ${tetMode ? 'border-[#3a3b3c]' : 'border-gray-200'}`}>
                <div className={`p-2 rounded-lg shadow-sm ${tetMode ? 'bg-gradient-to-br from-[#CB0502] to-[#ff4444]' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-bold ${tetMode ? 'text-gray-200' : 'text-gray-800'}`}>{t("pricing_info")}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Currency */}
                <div className="relative">
                  <label className={`flex items-center text-sm font-semibold mb-3 ${tetMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <svg className={`w-5 h-5 mr-2 ${tetMode ? 'text-[#CB0502]' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                    </svg>
                    {t("currency")}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${tetMode ? 'border-[#4a4b4c] hover:border-[#CB0502] has-[:checked]:border-[#CB0502] has-[:checked]:bg-red-900/20' : 'border-gray-200 hover:border-blue-400 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50'} has-[:checked]:shadow-sm`}>
                      <input
                        type="radio"
                        value="USD"
                        {...register("currency")}
                        className={`w-4 h-4 ${tetMode ? 'accent-[#CB0502]' : 'text-blue-600 accent-blue-600'}`}
                      />
                      <span className={`font-medium text-sm ${tetMode ? 'text-gray-300' : ''}`}>USD</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${tetMode ? 'border-[#4a4b4c] hover:border-[#CB0502] has-[:checked]:border-[#CB0502] has-[:checked]:bg-red-900/20' : 'border-gray-200 hover:border-blue-400 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50'} has-[:checked]:shadow-sm`}>
                      <input
                        type="radio"
                        value="VND"
                        {...register("currency")}
                        className={`w-4 h-4 ${tetMode ? 'accent-[#CB0502]' : 'text-blue-600 accent-blue-600'}`}
                      />
                      <span className={`font-medium text-sm ${tetMode ? 'text-gray-300' : ''}`}>VND</span>
                    </label>
                  </div>
                  {errors.currency && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.currency.message}
                    </p>
                  )}
                </div>

                {/* Starting Price */}
                <div className="relative">
                  <label className={`flex items-center text-sm font-semibold mb-2 ${tetMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <svg className={`w-5 h-5 mr-2 ${tetMode ? 'text-[#CB0502]' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M3 7a4 4 0 014-4h6l8 8-6 6-8-8V7z" />
                    </svg>
                    {t("starting_price")}
                  </label>
                  <div className="relative">
                    <input
                      {...register("starting_price", { valueAsNumber: true })}
                      type="number"
                      min="0"
                      placeholder="0"
                      className={`w-full px-4 py-3 pl-10 rounded-xl border-2 outline-none transition-all text-sm ${tetMode ? 'bg-[#3a3b3c] border-[#4a4b4c] text-white placeholder-gray-500 focus:border-[#CB0502] focus:ring-4 focus:ring-red-900/30' : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'}`}
                    />
                    <svg className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${tetMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                {/* Step Price */}
                <div className="relative">
                  <label className={`flex items-center text-sm font-semibold mb-2 ${tetMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <svg className={`w-5 h-5 mr-2 ${tetMode ? 'text-[#CB0502]' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8M14 7h7v7" />
                    </svg>
                    {t("step_price")}
                  </label>
                  <div className="relative">
                    <input
                      {...register("step_price", { valueAsNumber: true })}
                      type="number"
                      min="0"
                      placeholder="0"
                      className={`w-full px-4 py-3 pl-10 rounded-xl border-2 outline-none transition-all text-sm ${tetMode ? 'bg-[#3a3b3c] border-[#4a4b4c] text-white placeholder-gray-500 focus:border-[#CB0502] focus:ring-4 focus:ring-red-900/30' : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'}`}
                    />
                    <svg className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${tetMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Time Schedule */}
            <div className={`rounded-2xl shadow-md border p-6 hover:shadow-lg transition-shadow ${tetMode ? 'bg-[#242526] border-[#3a3b3c]' : 'bg-white border-gray-200'}`}>
              <div className={`flex items-center gap-2 mb-5 pb-3 border-b ${tetMode ? 'border-[#3a3b3c]' : 'border-gray-200'}`}>
                <div className={`p-2 rounded-lg shadow-sm ${tetMode ? 'bg-gradient-to-br from-[#CB0502] to-[#ff4444]' : 'bg-gradient-to-br from-blue-600 to-indigo-600'}`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-bold ${tetMode ? 'text-gray-200' : 'text-gray-800'}`}>{t("time_schedule")}</h3>
              </div>

              <div className="relative">
                <label className={`flex items-center text-sm font-semibold mb-2 ${tetMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className={`w-5 h-5 mr-2 ${tetMode ? 'text-[#CB0502]' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t("select_time")}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className={`p-4 rounded-xl border-2 ${tetMode ? 'bg-[#3a3b3c] border-[#4a4b4c]' : 'bg-gray-50 border-gray-200'}`}>
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
                </div>
                {errors.end_time && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.end_time.message}
                  </p>
                )}
              </div>
            </div>

            {/* Section 4: Participants */}
            <div className={`rounded-2xl shadow-md border p-6 hover:shadow-lg transition-shadow ${tetMode ? 'bg-[#242526] border-[#3a3b3c]' : 'bg-white border-gray-200'}`}>
              <div className={`flex items-center gap-2 mb-5 pb-3 border-b ${tetMode ? 'border-[#3a3b3c]' : 'border-gray-200'}`}>
                <div className={`p-2 rounded-lg shadow-sm ${tetMode ? 'bg-gradient-to-br from-[#CB0502] to-[#ff4444]' : 'bg-gradient-to-br from-indigo-600 to-blue-700'}`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-bold ${tetMode ? 'text-gray-200' : 'text-gray-800'}`}>{t("participants")}</h3>
                <span className="text-red-500 ml-1">*</span>
              </div>

              <div className="relative">
                {/* Header with select all */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${tetMode ? 'bg-[#CB0502]/20 text-[#ff6666]' : 'bg-blue-100 text-blue-700'}`}>
                      {selectedParticipantIds.length} {t("selected")}
                    </div>
                  </div>
                  <label className={`inline-flex items-center gap-2 font-medium cursor-pointer select-none transition-colors ${tetMode ? 'text-[#CB0502] hover:text-[#ff4444]' : 'text-indigo-600 hover:text-indigo-700'}`}>
                    <Controller
                      name="participants"
                      control={control}
                      render={({ field: { onChange } }) => (
                        <input
                          type="checkbox"
                          className={`w-5 h-5 rounded cursor-pointer ${tetMode ? 'accent-[#CB0502]' : 'accent-blue-600'}`}
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
                    <span className="text-sm font-semibold">{t("all")}</span>
                  </label>
                </div>

                {/* Search box */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      value={participantQuery}
                      onChange={(e) => setParticipantQuery(e.target.value)}
                      type="text"
                      placeholder={t("search_by_name_email")}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none transition-all text-sm ${tetMode ? 'bg-[#3a3b3c] border-[#4a4b4c] text-white placeholder-gray-500 focus:border-[#CB0502] focus:ring-4 focus:ring-red-900/30' : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'}`}
                    />
                    <svg className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 ${tetMode ? 'text-gray-500' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 110-16 8 8 0 010 16z" />
                    </svg>
                  </div>
                </div>

                {/* User list */}
                <div className={`rounded-xl border-2 overflow-hidden ${tetMode ? 'bg-[#3a3b3c] border-[#4a4b4c]' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                    <ul className={`divide-y ${tetMode ? 'divide-[#4a4b4c]' : 'divide-gray-200'}`}>
                      {filteredParticipants.length > 0 ? (
                        filteredParticipants.map(u => {
                          const checked = selectedParticipantIds.includes(u.id);
                          return (
                            <li key={u.id} className={clsx(
                              "flex items-center gap-3 px-5 py-4 transition-all cursor-pointer",
                              tetMode ? "hover:bg-[#4a4b4c]" : "hover:bg-white",
                              checked && (tetMode ? "bg-[#4a4b4c] hover:bg-[#4a4b4c]" : "bg-blue-50 hover:bg-blue-50")
                            )}>
                              <Controller
                                name="participants"
                                control={control}
                                render={({ field: { onChange } }) => (
                                  <input
                                    type="checkbox"
                                    className={`w-5 h-5 rounded cursor-pointer ${tetMode ? 'accent-[#CB0502]' : 'accent-blue-600'}`}
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
                                <p className={`font-semibold text-sm ${tetMode ? 'text-gray-200' : 'text-gray-900'}`}>{u.name}</p>
                                <p className={`text-xs mt-0.5 ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>{u.email}</p>
                              </div>
                              {checked && (
                                <svg className={`w-5 h-5 ${tetMode ? 'text-[#CB0502]' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </li>
                          );
                        })
                      ) : (
                        <li className={`px-5 py-10 text-center ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <svg className={`w-12 h-12 mx-auto mb-2 ${tetMode ? 'text-gray-500' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <p className="text-sm">{listUser.length === 0 ? t("loading_users") : t("no_users_found")}</p>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {errors.participants && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.participants.message}
                  </p>
                )}
              </div>
            </div>

            {/* Section 5: Description */}
            <div className={`rounded-2xl shadow-md border p-6 hover:shadow-lg transition-shadow ${tetMode ? 'bg-[#242526] border-[#3a3b3c]' : 'bg-white border-gray-200'}`}>
              <div className={`flex items-center gap-2 mb-5 pb-3 border-b ${tetMode ? 'border-[#3a3b3c]' : 'border-gray-200'}`}>
                <div className={`p-2 rounded-lg shadow-sm ${tetMode ? 'bg-gradient-to-br from-[#CB0502] to-[#ff4444]' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </div>
                <h3 className={`text-lg font-bold ${tetMode ? 'text-gray-200' : 'text-gray-800'}`}>{t("description")}</h3>
                <span className="text-red-500 ml-1">*</span>
              </div>

              <div className="relative">
                <Controller
                  name="description"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className={`border-2 rounded-xl overflow-hidden transition-all ${tetMode ? 'border-[#4a4b4c] focus-within:border-[#CB0502] focus-within:ring-4 focus-within:ring-red-900/30' : 'border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100'}`}>
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
                          placeholder: t("product_description_detail"),
                        }}
                      />
                    </div>
                  )}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Section 6: Files & Images */}
            <div className={`rounded-2xl shadow-md border p-6 hover:shadow-lg transition-shadow ${tetMode ? 'bg-[#242526] border-[#3a3b3c]' : 'bg-white border-gray-200'}`}>
              <div className={`flex items-center gap-2 mb-5 pb-3 border-b ${tetMode ? 'border-[#3a3b3c]' : 'border-gray-200'}`}>
                <div className={`p-2 rounded-lg shadow-sm ${tetMode ? 'bg-gradient-to-br from-[#CB0502] to-[#ff4444]' : 'bg-gradient-to-br from-indigo-500 to-blue-500'}`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <h3 className={`text-lg font-bold ${tetMode ? 'text-gray-200' : 'text-gray-800'}`}>{t("files_images")}</h3>
              </div>

              {/* Excel File Upload */}
              <div className="mb-6 relative">
                <label className={`flex items-center text-sm font-semibold mb-2 ${tetMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className={`w-5 h-5 mr-2 ${tetMode ? 'text-[#CB0502]' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  {t("excel")} <span className={`text-xs ml-1 ${tetMode ? 'text-gray-500' : 'text-gray-500'}`}>({t("optional")})</span>
                </label>
                <Controller
                  name="file_exel"
                  control={control}
                  render={({ field: { onChange, value, ...field }, fieldState }) => {
                    const fileName = value instanceof File
                      ? value.name
                      : auction?.file_exel?.split("/").pop() || "";

                    return (
                      <div className="relative">
                        <div
                          onClick={() => document.getElementById("filePicker")?.click()}
                          className={`group flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${tetMode ? 'border-[#4a4b4c] hover:border-[#CB0502] hover:bg-[#3a3b3c]' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}
                        >
                          <div className={`flex-shrink-0 p-2 rounded-lg transition-colors ${tetMode ? 'bg-[#3a3b3c] group-hover:bg-[#4a4b4c]' : 'bg-blue-100 group-hover:bg-blue-200'}`}>
                            <svg className={`w-5 h-5 ${tetMode ? 'text-[#CB0502]' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            {fileName ? (
                              <p className={`text-sm font-medium truncate ${tetMode ? 'text-gray-200' : 'text-gray-700'}`}>{fileName}</p>
                            ) : (
                              <p className={`text-sm ${tetMode ? 'text-gray-500' : 'text-gray-500'}`}>{t("select_excel_file") || "Chọn file Excel..."}</p>
                            )}
                          </div>
                          {fileName && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                              }}
                              className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>

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

                        {fieldState.error && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
              </div>

              {/* Image Upload */}
              <div className="relative">
                <label className={`flex items-center text-sm font-semibold mb-2 ${tetMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <svg className={`w-5 h-5 mr-2 ${tetMode ? 'text-[#CB0502]' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  {t("img")}
                  <span className="text-red-500 ml-1">*</span>
                  <span className={`text-xs ml-2 ${tetMode ? 'text-gray-500' : 'text-gray-500'}`}>({t("minimum_2_images")})</span>
                </label>

                {/* Drop Zone */}
                <div
                  className={clsx(
                    "border-3 border-dashed rounded-xl transition-all cursor-pointer min-h-[200px] relative overflow-hidden",
                    isDragging
                      ? tetMode ? "border-[#CB0502] bg-[#3a3b3c] scale-[1.02]" : "border-blue-500 bg-blue-50 scale-[1.02]"
                      : tetMode ? "border-[#4a4b4c] hover:border-[#CB0502] hover:bg-[#3a3b3c]/30" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={(e) => {
                    // Only trigger if clicking on the background, not on child elements
                    if (e.target === e.currentTarget || e.target.closest('.p-4') === null) {
                      handleDragAreaClick();
                    }
                  }}
                >
                  {imgFiles.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <div className={`p-4 rounded-full mb-4 ${tetMode ? 'bg-gradient-to-br from-[#CB0502]/30 to-[#ff4444]/30' : 'bg-gradient-to-br from-blue-100 to-indigo-100'}`}>
                        <svg className={`w-12 h-12 ${tetMode ? 'text-[#CB0502]' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 48 48">
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <p className={`text-base font-semibold mb-1 ${tetMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className={tetMode ? 'text-[#CB0502]' : 'text-blue-600'}>{t("click_to_select_image")}</span>
                      </p>
                      <p className={`text-sm ${tetMode ? 'text-gray-500' : 'text-gray-500'}`}>{t("or_drag_and_drop")}</p>
                      <p className="text-xs text-red-500 mt-2">{t("minimum_2_images")}</p>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        {imgFiles.map((item, index) => {
                          const isFile = item instanceof File;
                          const key = isFile
                            ? `${item.name}-${item.size}-${item.lastModified}`
                            : item;
                          const src = isFile
                            ? URL.createObjectURL(item)
                            : `${BASE_URL}${item}`;

                          return (
                            <div
                              key={key}
                              className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <img
                                src={src}
                                alt={`preview-${index}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all transform scale-90 group-hover:scale-100 shadow-lg"
                                  title={t("delete_image")}
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {/* Add more button */}
                        <div
                          className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center cursor-pointer transition-all hover:bg-blue-50 group"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDragAreaClick();
                          }}
                        >
                          <svg className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hidden Input */}
                <Controller
                  name="image_url"
                  control={control}
                  render={({ field: { onChange, value, ...field }, fieldState }) => (
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
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={clsx(
                  "group relative px-8 py-4 rounded-xl font-bold text-white text-base shadow-lg transition-all duration-300 overflow-hidden",
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : tetMode 
                      ? "bg-gradient-to-r from-[#CB0502] to-[#ff4444] hover:shadow-2xl hover:scale-105 active:scale-100"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-2xl hover:scale-105 active:scale-100"
                )}
              >
                {/* Animated background */}
                {!isSubmitting && (
                  <span className={`absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${tetMode ? 'bg-gradient-to-r from-[#ff4444] to-[#CB0502]' : 'bg-gradient-to-r from-indigo-600 to-blue-600'}`}></span>
                )}
                
                {/* Button content */}
                <span className="relative flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
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
                      <span>{t("processing")}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{mode === "create" ? t("create") : t("edit")}</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </div>

          </form>
        </div>
      
      </div>
    </div>
  );
};

export default CreateAuctionForm;
