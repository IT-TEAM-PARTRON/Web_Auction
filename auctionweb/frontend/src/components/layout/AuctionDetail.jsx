import ModalAuction from "./formAuction";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import AnimatedContent from "../ui/animatedContent";
import AuctionSection from "./Auctions";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import imagedefault from "../../assets/images/imagedefault.png";
import { getOne } from "../../services/api";
import { toast } from "react-hot-toast";
import { BASE_URL } from "../../config";
import { CheckCircle, ClockFading, AlarmClockCheck, ClockIcon, Banknote, ArrowUp01,Boxes, Group, File,Users, Trophy } from "lucide-react";

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [clonedImages, setClonedImages] = useState([]);
  const [selectImg, setselectImg] = useState(1);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    getAuction();
  }, [id]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);
  const { t, i18n } = useTranslation();
  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  function isTokenValid() {
    const getUser = () => {
      try {
        const sessionUser = sessionStorage.getItem("user");
        if (sessionUser) return JSON.parse(sessionUser);
      } catch (e) {
        sessionStorage.removeItem("user");
      }
      try {
        const localUser = localStorage.getItem("user");
        if (localUser) return JSON.parse(localUser);
      } catch (e) {
        localStorage.removeItem("user");
      }
      return null;
    };

    const user = getUser();
    if (!user || !user.access_token) return false;

    try {
      const token = user.access_token;
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("Invalid token format");
      const payload = JSON.parse(atob(parts[1]));
      const isValid = payload.exp * 1000 > Date.now();

      if (!isValid) {
        sessionStorage.removeItem("user");
        localStorage.removeItem("user");
      }

      return isValid;
    } catch {
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
      return false;
    }
  }

  function getUser() {
    try {
      const sessionUser = sessionStorage.getItem("user");
      if (sessionUser) return JSON.parse(sessionUser);
    } catch (e) {
      sessionStorage.removeItem("user");
    }
    try {
      const localUser = localStorage.getItem("user");
      if (localUser) return JSON.parse(localUser);
    } catch (e) {
      localStorage.removeItem("user");
    }
    return null;
  }

  const getAuction = async () => {
    try {
      const response = await getOne("auctions", id, false, {
        lang: sessionStorage.getItem("lang") || "en",
      });
      setAuction(response.data);
      setLoading(false);
    } catch (error) {
      toast.error(t("error.error_get_data"));
      console.log(error);
    }
  };

  useEffect(() => {
    if (
      !auction ||
      !Array.isArray(auction.image_url) ||
      auction.image_url.length <= 1
    )
      return;
    let images = auction.image_url;
    setClonedImages([
      images[images.length - 1], // last
      ...images,
      images[0], //first
    ]);
    resetInterval();
    return () => clearInterval(intervalRef.current);
  }, [auction]);

  useEffect(() => {
    if (!clonedImages.length > 0) return;
    if (sliderRef.current) {
      sliderRef.current.style.transition = "transform 0.7s ease-in-out";
      sliderRef.current.style.transform = `translateX(-${selectImg * 100}%)`;

      // Logic xử lý khi đến clone
      const totalSlides = auction.image_url.length;
      const timeout = setTimeout(() => {
        if (selectImg === 0) {
          sliderRef.current.style.transition = "none";
          sliderRef.current.style.transform = `translateX(-${
            totalSlides * 100
          }%)`;
          requestAnimationFrame(() => {
            setselectImg(totalSlides);
          });
        } else if (selectImg === totalSlides + 1) {
          sliderRef.current.style.transition = "none";
          sliderRef.current.style.transform = `translateX(-100%)`;

          requestAnimationFrame(() => {
            setselectImg(1);
          });
        }
      }, 700); // Delay bằng với transition

      return () => clearTimeout(timeout);
    }
  }, [selectImg, auction]);

  const getCurrentDotIndex = () => {
    const totalSlides = auction.image_url.length;
    if (selectImg === 0) return totalSlides - 1; // clone đầu → dot cuối
    if (selectImg === totalSlides + 1) return 0; // clone cuối → dot đầu
    return selectImg - 1; // các ảnh thật
  };

  //xử lý token hết hạn bắt user login để thực hiện thao tác đấu giá
  const openAuctionForm = () => {
    if (!isTokenValid()) {
      // toast.error("You must be logged in to participate in the auction!");
      toast.error(t("error.must_logged"));
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return;
    }
    //chặn người dùng đấu giá khi phiên đấu giá đã kết thúc
    if (auction.status === 2) {
      // toast.error("This auction has ended!");
      toast.error(t("error.auction_ended"));
      return;
    }
    //chặn người dùng đấu giá khi phiên đấu giá chưa diễn ra
    else if (auction.status === 1) {
      // toast.error("This auction has not started yet.");
      toast.error(t("error.auction_not_start"));
      return;
    }
    setIsOpen(true);
  };

  // const handleDownload = async (id) => {
  //   try {
  //     const res = await fetch(`/api/v1/download/excel/by-auction/${id}`);
  //     if (!res.ok) throw new Error("Dowload file fail!");
  //     const blob = await res.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = `auction-${id}.xlsx`;
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     const detail = error?.response?.data?.detail;
  //     toast.error(detail || "Error download file:", error);
  //     console.error("Error download file:", error);
  //   }
  // };

  const handleDownload = (id) => {
    window.open(`${BASE_URL}/api/v1/download/excel/by-auction/${id}`, "_self");
  }
  const handleSelectImg = (index) => {
    setselectImg(index);
    resetInterval();
  };

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setselectImg((prev) => prev + 1);
    }, 3000);
  };

  useEffect(() => {
    if (clonedImages.length > 0 && sliderRef.current) {
      // Gán transform ngay từ đầu
      sliderRef.current.style.transition = "none";
      sliderRef.current.style.transform = `translateX(-${selectImg * 100}%)`;
    }
  }, [clonedImages]);

  const clickNextButton = () => {
    resetInterval();
    setselectImg((prev) =>
      prev + 1 >= auction.image_url.length + 2 ? 0 : prev + 1
    );
  };

  const clickPreButton = () => {
    resetInterval();
    setselectImg((prev) =>
      prev - 1 < 0 ? auction.image_url.length - 1 : prev - 1
    );
  };

  if (loading) return <div className="loader"></div>;
  if (!auction) return <p>{t("no_data")}</p>;

  return (
    <>
      {/* Modal đấu giá */}
      <ModalAuction
        isOpen={isOpen}
        email={getUser()?.email}
        username={getUser()?.username}
        auctionId={auction.id}
        currency={auction.currency || "USD"}
        onClose={() => setIsOpen(false)}
      />
      <AnimatedContent>
        <h1 className="text-2xl mt-[250px] sm:mt-[200px] md:mt-[220px] lg:mt-[150px] xl:mt-[100px] sm:w-[100%] lg:w-[50%] font-bold text-left text-black-300 drop-shadow break-words">
          {auction.title}
        </h1>
        {/* status */}
        <p className="justify-start flex items-center gap-2 mt-2 mb-2">
          <span className="text-gray-500 text-sm">{t("status")}:{" "}</span>
          <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium
            ${auction.status === 0 
              ? "bg-blue-200 text-blue-800 font-semibold" 
              : auction.status === 1 
              ? "bg-yellow-200 text-yellow-800 font-semibold" 
              : auction.status === 2 
              ? "bg-green-200 text-green-800 font-semibold" 
              : "bg-gray-200 text-gray-800 font-semibold"}`}
        >
          {auction.status === 0 && (
            <AlarmClockCheck className="w-5 h-5" />
            
          )}
          {auction.status === 1 && (
            <ClockFading className="w-5 h-5" />
          )}
          {auction.status === 2 && (
            <CheckCircle className="h-4 w-4" />
          )}

          {auction.status === 0
            ? t("ongoing_auctions")
            : auction.status === 1
            ? t("upcoming_auctions")
            : auction.status === 2
            ? t("ended_auctions")
            : auction.status}
        </span>

        </p>
        <div className="flex flex-col lg:flex-row items-start gap-10">
          {/* Slider Image */}
          <div className="flex-1 overflow-hidden relative rounded-lg shadow-lg border border-gray-300">
            {/* Prev Button */}
            <button
              onClick={clickPreButton}
              className="absolute left-0 top-1/2 -translate-y-1/2 px-4 py-2 text-white text-3xl rounded-r hover:bg-black/70 z-10"
            >
              &#10094;
            </button>
            {/* Next Button */}
            <button
              onClick={clickNextButton}
              className="absolute right-0 top-1/2 -translate-y-1/2 px-4 py-2  text-white text-3xl rounded-l hover:bg-black/70 z-10"
            >
              &#10095;
            </button>
            
            <div
              ref={sliderRef}
              className="flex transition-transform duration-700 ease-in-out"
            >
              {auction.image_url.length > 1 ? (
                clonedImages.map((imageUrl, index) => (
                  <img
                    key={`${imageUrl}-${index}`}
                    src={`${BASE_URL}${imageUrl}`}
                    alt={auction.title}
                    className="min-w-full h-[400px] object-cover"
                  />
                ))
              ) : auction.image_url.length > 0 ? (
                <img
                  src={`${BASE_URL}${
                    auction.image_url[0]
                  }`}
                  alt={auction.title}
                  className="min-w-full h-[400px] object-cover"
                />
              ) : (
                <img
                  src={imagedefault}
                  alt="default"
                  className="min-w-full h-[400px] object-cover"
                />
              )}
            </div>

            {/* Indicator dots nằm absolute bên trong ảnh */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {auction.image_url.length > 0 &&
                auction.image_url.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectImg(index + 1)}
                    className={clsx(
                      "w-4 h-4 rounded-full",
                      getCurrentDotIndex() === index
                        ? "bg-blue-700"
                        : "bg-gray-300 hover:bg-blue-500"
                    )}
                  />
                ))}
            </div>
          </div>

          {/* Auction Info */}
          <div className="flex-1 text-xl w-full font-medium space-y-6 text-gray-800">
            {/* deadline */}
            <div className="relative p-4 rounded-lg shadow-md bg-gradient-to-r from-blue-50 to-white border border-blue-100">
              <p className="text-blue-600 text-sm font-medium">{t("deadline")}</p>
              <p className="text-red-500 text-2xl font-semibold">
                {new Date(auction.end_time).toLocaleString("vi-VN")}
              </p>
              <div className="absolute bottom-2 right-2 text-blue-500 opacity-40">
                <ClockIcon className="h-10 w-10" />
              </div>
            </div>
            {/* starting price & step price */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* starting price */}
              <div className="relative flex-1 p-4 rounded-lg shadow-md bg-gradient-to-r from-blue-50 to-white border border-blue-100">
                <p className="text-blue-600 text-sm font-medium">{t("starting_price")}</p>
                <p className="text-blue-600 text- xl font-semibold">
                  {auction.starting_price && auction.starting_price !== 0
                    ? auction.starting_price.toLocaleString(
                        auction.currency === "VND" ? "vi-VN" : "en-US",
                        {
                          style: "currency",
                          currency: auction.currency === "VND" ? "VND" : "USD",
                        }
                      )
                    : t("see_file")}
                </p>
                <div className="absolute bottom-2 right-2 text-blue-500 opacity-40">
                  <Banknote className="h-10 w-10" />
                </div>
              </div>
              {/* step price */}
              <div className="relative flex-1 p-4 rounded-lg shadow-md bg-gradient-to-r from-blue-50 to-white border border-blue-100">
                <p className="text-blue-600 text-sm font-medium">{t("step_price")}</p>
                <p className="text-blue-600 text-xl font-semibold">
                  {auction.step_price !== null && auction.step_price !== undefined
                    ? auction.step_price.toLocaleString(
                        auction.currency === "VND" ? "vi-VN" : "en-US",
                        {
                          style: "currency",
                          currency: auction.currency === "VND" ? "VND" : "USD",
                        }
                      )
                    : t("see_file")}
                </p>
                <div className="absolute bottom-2 right-2 text-blue-500 opacity-40">
                  <ArrowUp01 className="h-10 w-10" />
                </div>
              </div>
            </div>
            {/* type category & type auction */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* type category */}
              <div className="relative flex-1 p-4 rounded-lg shadow-md bg-gradient-to-r from-gray-100 to-white border border-blue-100">
                <p className="text-gray-600 text-sm font-medium">{t("type")}</p>
                <p className="text-gray-600 text-lg font-semibold">
                  {auction.category.category_name || t("unknown")}
                </p>
                <div className="absolute bottom-2 right-2 text-blue-500 opacity-40">
                  <Boxes className="h-10 w-10" />
                </div>
              </div>
              {/* type auction */}
              <div className="relative flex-1 p-4 rounded-lg shadow-md bg-gradient-to-r from-gray-100 to-white border border-blue-100">
                <p className="text-gray-600 text-sm font-medium">{t("auction_type")}</p>
                <p className="text-gray-600 text-lg font-semibold">
                  {auction.auction_type === "SELL" ? t("sell") : t("buy")}
                </p>
                <div className="absolute bottom-2 right-2 text-blue-500 opacity-40">
                  <Group className="h-10 w-10" />
                </div>
              </div>
            </div>
            {/* file excel & number of bids */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* file excel */}
              <div className="relative flex-1 p-4 rounded-lg shadow-md bg-gradient-to-r from-gray-100 to-white border border-blue-100">
                <p className="text-gray-600 text-sm font-medium">{t("attached_file")}</p>
                <div className="text-blue-600 text-lg font-semibold">
                  {auction.file_exel ? (
                    <button
                      onClick={() => handleDownload(auction.id)}
                      className="text-blue-600 hover:underline font-semibold"
                      title={auction.file_exel.split("/").pop()}
                    >
                      <p>
                        {auction.file_exel.split("/").pop().length > 15
                          ? auction.file_exel.split("/").pop().slice(0, 15) +
                            "...xlsx"
                          : auction.file_exel.split("/").pop()}
                      </p>
                    </button>
                  ) : (
                    <span className="text-gray-400 italic">{t("no_file")}</span>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 text-blue-500 opacity-40">
                  <File className="h-10 w-10" />
                </div>
              </div>
              {/* số người tham gia đấu giá */}   
              <div className="relative flex-1 p-4 rounded-lg shadow-md bg-gradient-to-r from-gray-100 to-white border border-blue-100">
                <p className="text-gray-600 text-sm font-medium">{t("participants")}</p>
                <div className="text-gray-600 text-lg font-semibold">
                  {(auction.status === 0 || auction.status === 2) &&
                  auction.count_users != null ? (
                    <span>
                      {t("number_of_bids")}: {auction.count_users}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">{t("no_data")}</span>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 text-blue-500 opacity-40">
                  <Users className="h-10 w-10" />
                </div>
              </div>
            </div>
            {/* Winner info - chỉ hiển thị khi đấu giá kết thúc */}
            {auction.status === 2 && (
              <div className="relative p-4 rounded-lg shadow-md bg-gradient-to-r from-green-50 to-white border border-green-100">
                <p className="text-green-600 text-sm font-medium text-center">{t("winner")}</p>
                <div className="text-green-600 text-2xl text-center font-semibold">
                  {Array.isArray(auction.bids) &&
                  auction.bids.find((bid) => bid.is_winner) ? (
                    <span>
                      <span className="font-semibold text-green-700">
                        {auction.bids.find((bid) => bid.is_winner).user_name}
                      </span>
                    </span>
                  ) : (
                    <span className="text-red-500 font-semibold">
                      {t("no_winner")}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 text-green-500 opacity-20">
                  <Trophy className="h-10 w-10" />
                </div>
              </div>
            )}            
          </div>
        </div>
        {/* Mô tả */}
        <div className="w-full p-6 rounded-lg text-base text-justify leading-relaxed text-gray-700">
          <hr className=" border-gray-600" />
          {auction.description && auction.description.trim() !== "" ? (
            <div>
              <span className="font-semibold text-xl text-gray-800">
                {t("description")}:
              </span>
              <div
                className="mt-2 prose prose-slate max-w-none ck-content"
                dangerouslySetInnerHTML={{ __html: auction.description }}
              />
            </div>
          ) : (
            <p className="text-gray-400 italic">
              {t("no_description_available")}
            </p>
          )}
        </div>

        {/* Nút đấu giá */}
        <div className="flex justify-center">
          <button
            onClick={openAuctionForm}
            className="uppercase px-8 py-4 will-change-transform bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xl font-semibold tracking-wide rounded-2xl shadow-md hover:from-blue-600 hover:to-indigo-600 hover:scale-[1.03] hover:shadow-lg border transition duration-300 ease-in-out "
          >
            {t("auction")}
          </button>
        </div>      
      {/* Các phiên đấu giá liên quan */}
      </AnimatedContent>      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-1 text-gray-600 font-rele">
          <u>{t("other_auctions").toUpperCase()}</u>
        </h2>

        {auction.status === 0 && (
          <AuctionSection titleKey="ongoing_auctions" type="ongoing" limit={4} excludeId={auction?.id} />
        )}
        {auction.status === 1 && (
          <AuctionSection titleKey="upcoming_auctions" type="upcoming" limit={4} excludeId={auction?.id} />
        )}
        {auction.status === 2 && (
          <AuctionSection titleKey="ended_auctions" type="ended" limit={4} excludeId={auction?.id} />
        )}
      </div>
    </>
  );
};

export default AuctionDetail;