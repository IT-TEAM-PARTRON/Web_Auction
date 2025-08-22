import { getOne } from "../../services/api";
import { useEffect, useState } from "react";
import clsx from "clsx";
import imagedefault from "../../assets/images/imagedefault.png";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { X } from "lucide-react";
const ModalDetailAuction = ({ idAuction, isOpen, clickClose }) => {
  const [bids, setBids] = useState([]);
  const [auction, setAuction] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [highestBid, setHighestBid] = useState(0);
  const { t, i18n } = useTranslation();
  const handleDownload = async (id) => {
    try {
      const res = await fetch(`/api/v1/download/excel/by-auction/${id}`);
      if (!res.ok) throw new Error("Dowload file fail!");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auction-${id}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error download file:", error);
    }
  };

  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setIsLoading(true);
        const response = await getOne("auctions", idAuction, false, {
          lang: sessionStorage.getItem("lang") || "en",
        });
        setAuction(response.data);
        const fetchedBids = response.data.bids;
        setBids(fetchedBids);
        const maxBid =
          fetchedBids.length > 0
            ? Math.max(...fetchedBids.map((b) => b.bid_amount))
            : 0;
        setHighestBid(maxBid);
      } catch (error) {
        const detail = error.response?.data?.detail;
        toast.error(detail || t("error.fetch_bids", "Failed to fetch bids"));
      } finally {
        setIsLoading(false);
      }
    };
    if (isOpen && idAuction) {
      fetchBids();
    }
  }, [isOpen, idAuction]);

  return (
    <div
      className={
        "fixed inset-0 flex items-center justify-center z-50 max-sm:pt-[60px] bg-black bg-opacity-50 " +
        (isOpen ? "visible" : "invisible")
      }
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
      onClick={clickClose}
    >
      <div
        className={
          "mt-[220px] sm:mt-[60px] md:mt-[55px] bg-white rounded-xl shadow-2xl 2xl:mb-[10px] w-full max-w-lg sm:max-w-2xl md:max-w-4xl lg:max-w-7xl max-h-[95vh] overflow-hidden mx-2 sm:mx-4 md:mx-auto flex flex-col fade-slide-up " +
          (isOpen ? "fade-slide-up-visible" : "fade-slide-up-hidden")
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 flex items-center justify-between relative">
          <div className="flex-1 text-center">
            <h2 className="text-xl font-bold uppercase">
              {t("auction_detail")}
            </h2>
          </div>
          <button
            onClick={clickClose}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors absolute right-4 sm:right-6"
            style={{ top: "50%", transform: "translateY(-50%)" }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/2 w-full">
              <img
                src={
                  auction.image_url && auction.image_url.length > 0
                    ? `${import.meta.env.VITE_BASE_URL}${auction.image_url[0]}`
                    : imagedefault
                }
                alt="Auction Image"
                className="w-full h-64 object-cover hover:scale-105 transition ease-out duration-500 rounded-2xl"
              />
              <div className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow flex items-center justify-between w-full">
                <p className="text-sm font-semibold">{t("current_status")}</p>
                <span className="text-sm font-medium bg-white text-gray-600 px-4 py-1 rounded-lg shadow-sm">
                  {auction.status === 0
                    ? t("ongoing_auctions")
                    : auction.status === 1
                    ? t("upcoming_auctions")
                    : t("ended_auctions")}
                </span>
              </div>
              <div className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow flex items-center justify-between w-full">
                <p className="text-sm text-white-500 font-semibold">{t("type")}</p>
                <span className="text-sm font-medium bg-white text-gray-600 px-4 py-1 rounded-lg shadow-sm">
                  {auction.category?.category_name || "N/A"}
                </span>
              </div>
            </div>

            <div className="lg:w-1/2 w-full space-y-3">
              <div className="bg-gray-100 p-4 rounded-xl flex items-start rounded-r-3xl rounded-l-md border-l-4 border-purple-500 shadow-sm">
                <p className="text-lg font-semibold text-black-700 text-left break-words w-full">
                  {auction.title || "No title"}
                </p>
              </div>

              <div className="bg-white border border-gray-400 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-300 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    {t("deadline")}
                  </p>
                  <p className="font-semibold text-gray-800">
                    {auction.end_time
                      ? new Date(auction.end_time).toLocaleString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })
                      : "-"}
                  </p>
                </div>

                <div className="bg-white border border-gray-300 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    {t("starting_price")}
                  </p>
                  <p className="text-black-600 font-bold text-lg">
                    {auction.starting_price?.toLocaleString(
                      auction.currency === "VND" ? "vi-VN" : "en-US",
                      {
                        style: "currency",
                        currency: auction.currency === "VND" ? "VND" : "USD",
                      }
                    )}
                  </p>
                </div>

                <div className="bg-white border border-gray-300 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    {t("step_price")}
                  </p>
                  <p className="text-black-700 font-bold text-lg">
                    {auction.step_price?.toLocaleString(
                      auction.currency === "VND" ? "vi-VN" : "en-US",
                      {
                        style: "currency",
                        currency: auction.currency === "VND" ? "VND" : "USD",
                      }
                    )}
                  </p>
                </div>

                <div className="bg-white border border-gray-300 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    {t("attached_file")}
                  </p>
                  <p className="text-red-600 font-bold text-lg">
                    {auction.file_exel ? (
                      <button
                        onClick={() => handleDownload(auction.id)}
                        className="text-blue-600 text-left hover:underline font-medium"
                      >
                        <p title={auction.file_exel.split("/").pop()}>
                          {auction.file_exel.split("/").pop().length > 30
                            ? auction.file_exel.split("/").pop().slice(0, 20) +
                              "..."
                            : auction.file_exel.split("/").pop()}
                        </p>
                      </button>
                    ) : (
                      <span className="text-gray-400 italic">
                        {t("no_file")}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-500">
                  {t("description")}
                </p>
                <p className="text-gray-700 text-sm max-h-20 overflow-y-auto">
                  {auction.description || t("no_description_available")}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-700 px-4 py-2">
            <div>
              {t("total_bids")}:{" "}
              <span className="text-gray-500">{bids?.length || 0}</span>
            </div>
            <div>
              <span className="font-medium text-purple-600">
                {t("highest_bid")}:{" "}
                {highestBid?.toLocaleString(
                  auction.currency === "VND" ? "vi-VN" : "en-US",
                  {
                    style: "currency",
                    currency: auction.currency === "VND" ? "VND" : "USD",
                  }
                )}
              </span>
            </div>
          </div>

          <div className=" border rounded-xl max-h-60 overflow-y-auto">
            <table className="table-fixed min-w-full text-sm text-left">
              <thead className="bg-gray-200 text-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 font-semibold uppercase">#</th>
                  <th className="px-4 py-2 font-semibold uppercase">
                    {t("supplier_email")}
                  </th>
                  <th className="px-4 py-2 font-semibold uppercase">
                    {t("user_name")}
                  </th>
                  <th className="px-4 py-2 font-semibold uppercase">
                    {t("bid_amount_usd")}
                  </th>
                  <th className="px-4 py-2 font-semibold uppercase">
                    {t("submitted_at")}
                  </th>
                  <th className="px-4 py-2 font-semibold uppercase">
                    {t("additional_notes")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {!isLoading ? (
                  bids?.map((bid, idx) => (
                    <tr
                      key={idx}
                      className={clsx(
                        "border-t",
                        idx === 0 ? "bg-yellow-100" : "bg-white",
                        "even:bg-gray-50"
                      )}
                    >
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2">{bid.email || "-"}</td>
                      <td className="px-4 py-2">{bid.user_name || "-"}</td>
                      <td className="px-4 text-green-500 py-2">
                        {bid.bid_amount != null
                          ? bid.bid_amount.toLocaleString(
                              auction.currency === "VND" ? "vi-VN" : "en-US",
                              {
                                style: "currency",
                                currency: auction.currency === "VND" ? "VND" : "USD",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-2">
                        {bid.created_at
                          ? new Date(bid.created_at).toLocaleString("en-US", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: false,
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-2 w-[200px] break-all whitespace-normal">
                        {bid.note || "null"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Loading bids...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailAuction;
