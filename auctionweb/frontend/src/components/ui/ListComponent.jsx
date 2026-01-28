import imagedefault from "../../assets/images/imagedefault.png";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { BASE_URL } from "../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faTag, faGavel, faChartLine, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { useTetMode } from "../../contexts/TetModeContext";

const RenderListAuction = ({ arrAuction, clickCard }) => {
  const { t, i18n } = useTranslation();
  const { tetMode } = useTetMode();

  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    if (savedLang) i18n.changeLanguage(savedLang);
  }, [i18n]);

  // Format giá tiền
  const formatPrice = (price, currency) => {
    if (!price) return t("see_file");
    return price.toLocaleString(currency === "VND" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: currency === "VND" ? "VND" : "USD",
    });
  };

  // Format thời gian
  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Status badge config
  const getStatusConfig = (status) => {
    const configs = {
      0: {
        label: t("ongoing_auctions"),
        bgColor: "bg-blue-200",
        textColor: "text-blue-800 font-semibold",
        dotColor: "bg-blue-500",
        animate: true,
      },
      1: {
        label: t("upcoming_auctions"),
        bgColor: "bg-yellow-200",
        textColor: "text-yellow-800 font-semibold",
        dotColor: "bg-yellow-500",
        animate: false,
      },
      2: {
        label: t("ended_auctions"),
        bgColor: "bg-green-200",
        textColor: "text-green-800 font-semibold",
        dotColor: "bg-green-500",
        animate: false,
      },
    };
    return configs[status] || { 
      label: "", 
      bgColor: "bg-gray-200", 
      textColor: "text-gray-800 font-semibold",
      dotColor: "bg-gray-500",
      animate: false 
    };
  };

  if (!arrAuction || arrAuction.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <FontAwesomeIcon icon={faGavel} className={`text-5xl mb-4 ${tetMode ? 'text-red-400' : 'text-blue-300'}`} />
        <p className="text-lg font-medium">{t("no_data")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {arrAuction.map((item) => {
        const statusConfig = getStatusConfig(item.status);
        
        return (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => clickCard(item.id)}
            onKeyDown={(e) => e.key === "Enter" && clickCard(item.id)}
            className={`
              rounded-xl overflow-hidden
              transition-all duration-300 ease-out
              shadow-sm hover:shadow-xl
              cursor-pointer group
              relative
              ${tetMode 
                ? 'bg-[#242526] border border-[#3a3b3c] hover:border-red-500/50 hover:shadow-[0_8px_32px_rgba(220,38,38,0.3)]' 
                : 'bg-white border border-gray-100 hover:border-blue-200'
              }
            `}
          >
            {/* Status ribbon */}
            <div className={`absolute top-4 left-0 z-20 ${statusConfig.bgColor} ${statusConfig.textColor} 
              px-2 py-1.5 text-xs font-semibold rounded-r-full shadow-lg flex items-center gap-2`}>
              <span className={`w-2 h-2 ${statusConfig.dotColor} rounded-full ${statusConfig.animate ? 'animate-pulse' : ''}`}></span>
              {statusConfig.label}
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Image Section */}
              <div className={`relative w-full lg:w-72 h-52 lg:h-48 flex-shrink-0 overflow-hidden ${tetMode ? 'bg-[#18191a]' : 'bg-gray-100'}`}>
                <img
                  src={item.image_url?.length ? `${BASE_URL}${item.image_url[0]}` : imagedefault}
                  alt={item.title || "Auction"}
                  className={`
                    ${item.image_url?.length ? "object-cover" : "object-contain p-4"}
                    w-full h-full
                    transition-transform duration-500 ease-out
                    group-hover:scale-110
                  `}
                />
                
                {/* Image overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-5 flex flex-col justify-between min-h-[180px]">
                {/* Header */}
                <div>
                  {/* Title & Category */}
                  <div className="flex flex-wrap items-start gap-2 mb-3">
                    <h3 className={`flex-1 text-lg font-bold line-clamp-2 transition-colors duration-200 leading-tight ${tetMode ? 'text-white' : 'text-gray-800'}`}>
                      {item.title}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${tetMode ? 'text-red-400 bg-red-900/30' : 'text-blue-600 bg-blue-50'}`}>
                      <FontAwesomeIcon icon={faTag} className="text-[10px]" />
                      {item.category?.category_name || t("unknown")}
                    </span>
                  </div>

                  {/* Price Info */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {/* Starting Price */}
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${tetMode ? 'bg-red-600' : 'bg-blue-500'}`}>
                        <FontAwesomeIcon icon={faGavel} className="text-white text-sm" />
                      </div>
                      <div>
                        <p className={`text-[11px] uppercase tracking-wide ${tetMode ? 'text-gray-500' : 'text-gray-400'}`}>{t("starting_price")}</p>
                        <p className={`text-base font-bold ${tetMode ? 'text-white' : 'text-gray-800'}`}>
                          {formatPrice(item.starting_price, item.currency)}
                        </p>
                      </div>
                    </div>

                    {/* Step Price */}
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${tetMode ? 'bg-red-600' : 'bg-blue-500'}`}>
                        <FontAwesomeIcon icon={faChartLine} className="text-white text-sm" />
                      </div>
                      <div>
                        <p className={`text-[11px] uppercase tracking-wide ${tetMode ? 'text-gray-500' : 'text-gray-400'}`}>{t("step_price")}</p>
                        <p className={`text-base font-bold ${tetMode ? 'text-white' : 'text-gray-800'}`}>
                          {formatPrice(item.step_price, item.currency)}
                        </p>
                      </div>
                    </div>

                    {/* Winning Bid (if ended) */}
                    {item.status === 2 && (
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${tetMode ? 'bg-yellow-500' : 'bg-blue-500'}`}>
                          <FontAwesomeIcon icon={faGavel} className="text-white text-sm" />
                        </div>
                        <div>
                          <p className={`text-[11px] uppercase tracking-wide ${tetMode ? 'text-gray-500' : 'text-gray-400'}`}>{t("winning_bid_price")}</p>
                          <p className={`text-base font-bold ${tetMode ? 'text-yellow-400' : 'text-red-600'}`}>
                            {item.highest_amount !== null && item.winner_info !== null
                              ? formatPrice(item.highest_amount, item.currency)
                              : t("unsuccessful")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer - Time Info */}
                <div className={`flex flex-wrap items-center gap-4 pt-3 border-t ${tetMode ? 'border-[#3a3b3c]' : 'border-gray-100'}`}>
                  <div className={`flex items-center gap-2 text-sm ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FontAwesomeIcon icon={faCalendarAlt} className={tetMode ? 'text-red-400' : 'text-blue-500'} />
                    <span className="font-medium">{t("start_time")}:</span>
                    <span className={tetMode ? 'text-gray-300' : 'text-gray-700'}>{formatDateTime(item.start_time)}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FontAwesomeIcon icon={faClock} className={tetMode ? 'text-red-300' : 'text-blue-400'} />
                    <span className="font-medium">{t("end_time")}:</span>
                    <span className={tetMode ? 'text-gray-300' : 'text-gray-700'}>{formatDateTime(item.end_time)}</span>
                  </div>
                </div>
              </div>

              {/* Action Arrow */}
              <div className={`hidden lg:flex items-center justify-center w-16 bg-gradient-to-l ${tetMode ? 'from-[#18191a] to-transparent' : 'from-gray-50 to-transparent'}`}>
                <div className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ${tetMode ? 'bg-[#3a3b3c] group-hover:bg-red-600 group-hover:shadow-red-500/30' : 'bg-white group-hover:bg-blue-500 group-hover:shadow-blue-200'}`}>
                  <svg 
                    className={`w-5 h-5 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300 ${tetMode ? 'text-gray-400' : 'text-gray-400'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RenderListAuction;
