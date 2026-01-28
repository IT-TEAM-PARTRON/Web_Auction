import clsx from "clsx";
import imagedefault from "../../assets/images/imagedefault.png";
import CountdownTimer from "../../common/CountDownTime";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { BASE_URL } from "../../config";
import { useTetMode } from "../../contexts/TetModeContext";

const RenderCardAuction = ({ arrAuction, numberCol, clickCard }) => {
  const { t, i18n } = useTranslation();
  const { tetMode } = useTetMode();

  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    if (savedLang) i18n.changeLanguage(savedLang);
  }, [i18n]);

  const gridClass = clsx(
    "grid gap-4 justify-items-center",
    "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    numberCol &&
      numberCol >= 1 &&
      numberCol <= 4 &&
      `xl:grid-cols-${numberCol}`,
  );

  return (
    <div className={gridClass}>
      {!arrAuction || arrAuction.length === 0 ? (
        <p className={`col-span-full text-center ${tetMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {t("no_data")}
        </p>
      ) : (
        arrAuction.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => clickCard(item.id)}
            onKeyDown={(e) => e.key === "Enter" && clickCard(item.id)}
            className={`
              w-full max-w-[350px] mx-auto
              rounded-bl-[10px] rounded-br-[10px]
              transition-all duration-300 ease-in-out
              shadow-[0_4px_16px_rgba(0,0,0,0.20)]
              flex flex-col h-full
              group
              cursor-pointer
              ${tetMode 
                ? 'bg-[#242526] hover:shadow-[0_8px_32px_rgba(220,38,38,0.4)] border border-[#3a3b3c]' 
                : 'bg-transparent hover:shadow-[0_8px_32px_rgba(29,180,255,0.4)]'
              }
            `}
          >
            {/* IMAGE (GIỮ NGUYÊN) */}
            <div className="h-[200px] flex items-center justify-center relative overflow-hidden">
              {item.status === 0 && (
                <CountdownTimer targetTime={item.end_time} />
              )}
              {item.status === 1 && (
                <CountdownTimer targetTime={item.start_time} />
              )}

              <img
                src={
                  item.image_url?.length
                    ? `${BASE_URL}${item.image_url[0]}`
                    : imagedefault
                }
                alt={item.title || "Auction"}
                className={
                  (item.image_url?.length
                    ? "w-full h-full object-cover"
                    : "img-no") +
                  ` transition-transform duration-500 ease-in-out border-4 will-change-transform group-hover:scale-110 ${tetMode ? 'border-[#3a3b3c]' : 'border-white'}`
                }
              />
            </div>

            {/* CONTENT (CHỈ ĐỔI LAYOUT) */}
            <div className={`p-3 text-sm leading-[1.5] flex-grow text-left rounded-b-[10px] ${tetMode ? 'bg-[#242526]' : 'bg-white'}`}>
              <p className="flex justify-between relative overflow-visible">
                <span className={`relative break-words w-0 flex-1 min-w-0 text-left text-[16px] font-[600] group/title ${tetMode ? 'text-white' : ''}`}>
                  {item.title.length > 70
                    ? item.title.slice(0, 70) + "..."
                    : item.title}

                  {item.title.length > 70 && (
                    <span
                      className="absolute z-[1000] font-normal text-center left-1/2 bottom-full mb-2 
                        -translate-x-1/2 w-max max-w-[350px] rounded-lg bg-[#0082c8] px-3 py-2 
                        text-white text-sm shadow-lg opacity-0 pointer-events-none
                        transition-all duration-500 ease-in-out
                        transform translate-y-1
                        group-hover/title:opacity-100 group-hover/title:translate-y-0
                      "
                    >
                      {item.title}
                      <span
                        className="absolute top-full left-1/2 -translate-x-1/2 border-4 
          border-transparent border-t-[#0082c8]"
                      ></span>
                    </span>
                  )}
                </span>
              </p>

              {/* GRID INFO – FIX iOS */}
              <div className="grid grid-cols-[auto_1fr] gap-y-1">
                <span className={tetMode ? 'text-gray-400' : 'text-gray-500'}>{t("starting_price")}:</span>
                <span className={`text-right font-[600] ${tetMode ? 'text-white' : ''}`}>
                  {item.starting_price
                    ? item.starting_price.toLocaleString(
                        item.currency === "VND" ? "vi-VN" : "en-US",
                        {
                          style: "currency",
                          currency: item.currency === "VND" ? "VND" : "USD",
                        },
                      )
                    : t("see_file")}
                </span>

                <span className={tetMode ? 'text-gray-400' : 'text-gray-500'}>{t("step_price")}:</span>
                <span className={`text-right font-[600] ${tetMode ? 'text-white' : ''}`}>
                  {item.step_price?.toLocaleString(
                    item.currency === "VND" ? "vi-VN" : "en-US",
                    {
                      style: "currency",
                      currency: item.currency === "VND" ? "VND" : "USD",
                    },
                  )}
                </span>

                <span className={tetMode ? 'text-gray-400' : 'text-gray-500'}>{t("start_time")}:</span>
                <span className={`text-right font-[600] ${tetMode ? 'text-white' : ''}`}>
                  {new Date(item.start_time).toLocaleString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </span>

                <span className={tetMode ? 'text-gray-400' : 'text-gray-500'}>{t("end_time")}:</span>
                <span className={`text-right font-[600] ${tetMode ? 'text-white' : ''}`}>
                  {new Date(item.end_time).toLocaleString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </span>

                <span className={tetMode ? 'text-gray-400' : 'text-gray-500'}>{t("type")}:</span>
                <span className={`text-right ${tetMode ? 'text-white' : ''}`}>
                  {item.category?.category_name || t("unknown")}
                </span>

                {item.status === 2 && (
                  <>
                    <span className={`font-semibold ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t("winning_bid_price")}:
                    </span>
                    {item.highest_amount !== null &&
                    item.winner_info !== null ? (
                      <span className={`font-bold text-right ${tetMode ? 'text-yellow-400' : 'text-red-500'}`}>
                        {item.highest_amount?.toLocaleString(
                          item.currency === "VND" ? "vi-VN" : "en-US",
                          {
                            style: "currency",
                            currency: item.currency === "VND" ? "VND" : "USD",
                          },
                        )}
                      </span>
                    ) : (
                      <span className={`font-bold text-right ${tetMode ? 'text-yellow-400' : 'text-red-500'}`}>
                        {t("unsuccessful")}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RenderCardAuction;
