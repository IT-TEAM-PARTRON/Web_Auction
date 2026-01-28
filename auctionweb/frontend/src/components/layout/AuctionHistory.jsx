import React, { useState, useEffect } from "react";
import { X, Clock, DollarSign, MapPin, Trophy, FileText } from "lucide-react";
import axiosClient from "../../services/axiosClient";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTetMode } from "../../contexts/TetModeContext";

const AuctionHistory = ({ isOpen, onClose }) => {
  const [auctionHistory, setAuctionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayedItems, setDisplayedItems] = useState(5);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { tetMode } = useTetMode();

  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    setDisplayedItems(5);
    axiosClient
      .get("/bids/user")
      .then((res) => setAuctionHistory(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }
        setError(
          "Lỗi khi tải dữ liệu lịch sử đấu giá" +
            (err.response?.data?.detail || "")
        );
      }        
      )
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleLoadMore = () => setDisplayedItems((prev) => prev + 5);

  const hasMoreItems = displayedItems < auctionHistory.length;

  const formatCurrency = (amount, currency = "USD") =>
    new Intl.NumberFormat(currency === "VND" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: currency === "VND" ? "VND" : "USD",
    }).format(amount);

  const formatDateTime = (dateTime) =>
    new Date(dateTime).toLocaleString("vi-VN");

  const truncateId = (id) =>
    id.length > 50
      ? `${id.substring(0, 30)}...${id.substring(id.length - 8)}`
      : id;

  const handleClose = () => onClose();
  
  return (
    <div
      className={
        "fixed inset-0 flex items-center justify-center z-[2000] max-sm:pt-[60px] bg-black bg-opacity-50 " +
        (isOpen ? "visible" : "invisible")
      }
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
      // onClick={handleClose} 
    >
      <div
        className={
          `sm:mt-[60px] md:mt-[55px] rounded-xl shadow-2xl 2xl:mb-[10px] w-full max-w-lg sm:max-w-2xl md:max-w-4xl lg:max-w-7xl max-h-[95vh] overflow-hidden mx-2 sm:mx-4 md:mx-auto flex flex-col fade-slide-up ${tetMode ? 'bg-[#242526] border border-[#3a3b3c]' : 'bg-white'} ` +
          (isOpen ? "fade-slide-up-visible" : "fade-slide-up-hidden")
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`text-white p-3 flex items-center justify-between relative ${tetMode ? 'bg-gradient-to-r from-[#CB0502] to-[#ff4444]' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
          <div className="flex-1 text-center">
            <h2 className="text-xl font-bold uppercase">{t("auction_history")}</h2>
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
          {loading && <div className={tetMode ? 'text-gray-300' : ''}>Loading data...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && (
            <>
              <div className="space-y-4">
                {auctionHistory
                  .slice(0, displayedItems)
                  .map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`border rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.30)] ${tetMode ? 'bg-[#18191a] border-[#3a3b3c] hover:border-red-500/50' : 'bg-white border-gray-200 hover:border-blue-500'}`}
                      onClick={() => {
                        handleClose();
                        navigate(`/auctions/${bid.auction_id}`);
                      }}
                    >
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              bid.is_winner ? "bg-green-500" : "bg-gray-400"
                            }`}
                          >
                            {bid.is_winner ? (
                              <Trophy size={20} />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${tetMode ? 'text-white' : 'text-gray-900'}`}>
                              Bid #{index + 1}
                            </h3>
                            <p className={`text-sm ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              ID: {truncateId(bid.id)}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            bid.is_winner
                              ? "bg-green-100 text-green-700"
                              : tetMode ? "bg-[#3a3b3c] text-gray-300" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {bid.is_winner ? t("winning") : t("participated")}
                        </div>
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <DollarSign
                              className={`mt-1 ${tetMode ? 'text-red-400' : 'text-blue-500'}`}
                              size={18}
                            />
                            <div>
                              <p className={`text-sm ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {t("bid_amount_usd")}
                              </p>
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(bid.bid_amount, bid.currency)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Clock
                              className={`mt-1 ${tetMode ? 'text-red-400' : 'text-blue-500'}`}
                              size={18}
                            />
                            <div>
                              <p className={`text-sm ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {t("submitted_at")}
                              </p>
                              <p className={`font-medium ${tetMode ? 'text-white' : 'text-gray-900'}`}>
                                {formatDateTime(bid.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <DollarSign className={`mt-1 ${tetMode ? 'text-red-400' : 'text-blue-500'}`} size={18} />
                            <div>
                              <p className={`text-sm ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>{t("starting_price")}</p>
                              <p className={`text-lg font-bold ${tetMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatCurrency(bid.auction_starting_price, bid.currency)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <MapPin
                              className={`mt-1 ${tetMode ? 'text-red-400' : 'text-blue-500'}`}
                              size={18}
                            />
                            <div>
                              <p className={`text-sm ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {t("address")}
                              </p>
                              <p className={tetMode ? 'text-white' : 'text-gray-900'}>{bid.address}</p>
                            </div>
                          </div>

                          {bid.note && (
                            <div className="flex items-start gap-3">
                              <FileText
                                className={`mt-1 ${tetMode ? 'text-red-400' : 'text-blue-500'}`}
                                size={18}
                              />
                              <div>
                                <p className={`text-sm ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {t("additional_notes")}
                                </p>
                                <p className={tetMode ? 'text-white' : 'text-gray-900'}>{bid.note}</p>
                              </div>
                            </div>
                          )}

                          <div className={`rounded-lg p-3 ${tetMode ? 'bg-[#3a3b3c]' : 'bg-gray-200'}`}>
                            <p className={`text-xs mb-1 ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>{t("title")}</p>
                            <p className={`font-mono text-xs ${tetMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {truncateId(bid.auction_title)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              {/* Load More Button */}
              {hasMoreItems && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleLoadMore}
                    className={`px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors ${tetMode ? 'bg-gradient-to-r from-[#CB0502] to-[#ff4444]' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                  >
                    {t("load_more")} ({auctionHistory.length - displayedItems})
                  </button>
                </div>
              )}
            </>
          )}

          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className={`border rounded-lg p-4 ${tetMode ? 'bg-gradient-to-br from-[#18191a] to-[#242526] border-red-900/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
              <div className={`text-sm font-medium ${tetMode ? 'text-red-400' : 'text-blue-600'}`}>
                {t("total_bids")}
              </div>
              <div className={`text-2xl font-bold ${tetMode ? 'text-red-500' : 'text-blue-700'}`}>
                {auctionHistory.length}
              </div>
            </div>
            <div className={`border rounded-lg p-4 ${tetMode ? 'bg-gradient-to-br from-[#18191a] to-[#242526] border-green-900/30' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}`}>
              <div className={`text-sm font-medium ${tetMode ? 'text-green-400' : 'text-green-600'}`}>
                {t("winning_bids")}
              </div>
              <div className={`text-2xl font-bold ${tetMode ? 'text-green-400' : 'text-green-700'}`}>
                {auctionHistory.filter((bid) => bid.is_winner).length}
              </div>
            </div>
            <div className={`border rounded-lg p-4 ${tetMode ? 'bg-gradient-to-br from-[#18191a] to-[#242526] border-yellow-900/30' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'}`}>
              <div className={`text-sm font-medium ${tetMode ? 'text-yellow-400' : 'text-orange-600'}`}>
                {t("highest_value")}
              </div>
              <div className={`text-base font-bold space-y-1 ${tetMode ? 'text-yellow-400' : 'text-orange-700'}`}>
                {/* Hiển thị max cho từng loại tiền */}
                {['USD', 'VND'].map((currency) => {
                  const bidsOfCurrency = auctionHistory.filter(bid => bid.currency === currency);
                  if (bidsOfCurrency.length === 0) return null;
                  const maxBid = Math.max(...bidsOfCurrency.map(bid => bid.bid_amount));
                  return (
                    <div key={currency}>
                      <span className="font-bold">{currency}:</span> {formatCurrency(maxBid, currency)}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={`border rounded-lg p-4 ${tetMode ? 'bg-gradient-to-br from-[#18191a] to-[#242526] border-purple-900/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
              <div className={`text-sm font-medium ${tetMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {t("success_rate")}
              </div>
              <div className={`text-2xl font-bold ${tetMode ? 'text-purple-400' : 'text-purple-700'}`}>
                {auctionHistory.length > 0
                  ? Math.round(
                      (auctionHistory.filter((bid) => bid.is_winner)
                        .length /
                        auctionHistory.length) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionHistory;
