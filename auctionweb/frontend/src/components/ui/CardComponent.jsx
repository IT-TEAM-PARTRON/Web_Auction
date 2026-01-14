import clsx from "clsx";
import imagedefault from "../../assets/images/imagedefault.png";
import CountdownTimer from "../../common/CountDownTime";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { BASE_URL } from "../../config";

const RenderCardAuction = ({ arrAuction, numberCol, clickCard }) => {
  const { t, i18n } = useTranslation();

  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  const gridClass = clsx(
    "grid gap-4",
    "grid-cols-1",
    "sm:grid-cols-2",
    "md:grid-cols-3",
    "lg:grid-cols-4",
    numberCol && {
      [`xl:grid-cols-${numberCol}`]: numberCol >= 1 && numberCol <= 4,
    }
  );
  return (
    <div className={gridClass}>
      {!arrAuction || arrAuction.length === 0 ? (
        <p className="text-gray-600 col-span-full text-center">
          {t("no_data")}
        </p>
      ) : (
        arrAuction.map((item) => (
          <button
            className="max-w-[350px] rounded-bl-[10px] rounded-br-[10px] transition-transform duration-[600] ease-in-out shadow-[0_4px_16px_rgba(0,0,0,0.20)] flex flex-col h-full hover:shadow-[0_8px_32px_rgba(29,180,255,0.4)] group"
            key={item.id}
            style={{ cursor: "pointer" }}
            onClick={() => clickCard(item.id)}          >            
            <div className="h-[200px] flex items-center justify-center relative overflow-hidden">
              {item.status == 0 ? (
                <CountdownTimer targetTime={item.end_time} />
              ) : item.status == 1 ? (
                <CountdownTimer targetTime={item.start_time} />
              ) : null}
              <img
                src={
                  item.image_url && item.image_url.length > 0
                    ? `${BASE_URL}${item.image_url[0]}`
                    : imagedefault
                }
                alt={item.title || "Auction"}
                className={
                  (item.image_url && item.image_url.length > 0
                    ? "w-full h-full object-cover"
                    : "img-no") +
                  " transition-transform duration-500 ease-in-out border-4 border-white will-change-transform group-hover:scale-110"
                }
              />
            </div>            
            <div className="bg-white p-3 text-sm leading-[1.5] flex-grow">
              {/* title */}
              <p className="flex justify-between relative overflow-visible">
                <span className="relative break-words w-0 flex-1 min-w-0 text-left text-[16px] font-[600] group/title">
                  {item.title.length > 70 ? item.title.slice(0, 70) + "..." : item.title}
                  {/* Tooltip - chỉ hiển thị khi hover vào title */}
                  {item.title.length > 70 && (
                    <span className="absolute z-[1000] font-normal text-center left-1/2 bottom-full mb-2 -translate-x-1/2 w-max max-w-[350px] rounded-lg bg-[#0082c8] px-3 py-2 text-white text-sm shadow-lg opacity-0 group-hover/title:opacity-100 pointer-events-none transition-all duration-500 ease-in-out transform group-hover/title:translate-y-0 translate-y-1">
                      {item.title}
                      {/* Arrow */}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0082c8]"></span>
                    </span>
                  )}
                </span>
              </p>
              {/* starting price */}
              <p className="flex justify-between">
                <span className="text-gray-500 text-left">{t("starting_price")}:</span>
                <span className="text-right font-[600]">
                  {item.starting_price
                  ? item.starting_price.toLocaleString(
                      item.currency === "VND" ? "vi-VN" : "en-US",
                      {
                        style: "currency",
                        currency: item.currency === "VND" ? "VND" : "USD",
                      }
                    )
                  : t("see_file")}
                </span>
              </p>
              {/* step price */}
              <p className="flex justify-between">
                <span className="text-gray-500 text-left">{t("step_price")}:</span>
                <span className="text-right font-[600]">
                  {item.step_price?.toLocaleString(
                    item.currency === "VND" ? "vi-VN" : "en-US",
                    {
                      style: "currency",
                      currency: item.currency === "VND" ? "VND" : "USD",
                    }
                  )}
                </span>
              </p>
              {/* start time */}
              <p className="flex justify-between">
                <span className="text-gray-500 text-left">{t("start_time")}:</span>
                <span className="text-right font-[600]">
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
              </p>
              {/* end time */}
              <p className="flex justify-between">
                <span className="text-gray-500 text-left">{t("end_time")}:</span>
                <span className="text-right font-[600]">
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
              </p>
              {/* category type */}
              <p className="flex justify-between">
                <span className="text-gray-500 text-left">{t("type")}:</span>
                <span className="text-right">
                  {item.category?.category_name || t("unknown")}
                </span>
              </p>
              {/* auction type */}
              {/* <p className="flex justify-between">
                <span className="text-gray-500 text-left">{t("auction_type")}:</span>
                <span className="text-right">
                  {item.auction_type === "SELL"
                    ? t("sell").toLocaleUpperCase()
                    : item.auction_type === "BUY"
                    ? t("buy").toLocaleUpperCase()
                    : t("unknown").toLocaleUpperCase()}
                </span>
              </p> */}
                    
              {item.status === 2 ? (
                item.highest_amount !== null && item.winner_info !== null ? (
                  <p className="flex justify-between text-left">
                    <span className="font-semibold text-gray-500">
                      {t("winning_bid_price")}:
                    </span>
                    <span className="text-red-500 font-bold">
                      {item.highest_amount?.toLocaleString(
                        item.currency === "VND" ? "vi-VN" : "en-US",
                        {
                          style: "currency",
                          currency: item.currency === "VND" ? "VND" : "USD",
                        }
                      )}
                    </span>
                  </p>
                ) : (
                  <p className="flex justify-end">
                    <span className="font-semibold text-red-500">
                      {t("unsuccessful")}
                    </span>
                  </p>
                )
              ) : null}
            </div>
          </button>
        ))
      )}
    </div>
  );
};

export default RenderCardAuction;
