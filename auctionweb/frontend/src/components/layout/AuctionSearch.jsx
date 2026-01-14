import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import RangeCalender from "../ui/RangeCalender";
import RenderCardAuction from "../ui/CardComponent";
import { useEffect, useState } from "react";
import { getAll } from "../../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import Pagination from "../ui/Pagination";
import AnimatedContent from "../ui/animatedContent";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const AuctionSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [auction_type, setAuction_type] = useState(null);
  const [category_id, setCategory_id] = useState(null);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState(null);
  const [sortBy, setSortBy] = useState("");
  const [sortOder, setSortOder] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [searchParam, setSearchParam] = useState({});
  const [arrAuction, setArrAuction] = useState([]);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndexPage, setCurrentIndexPage] = useState(0);

  const navigate = useNavigate();

  const searchData = async (page = 1) => {
    try {
      setIsLoading(true);
      const lang = sessionStorage.getItem("lang") || "en";
      const paramWithPage = { ...searchParam, page, lang };
      const response = await getAll("auctions/search", false, paramWithPage); 
      // Set the total number of auctions and the current page's auction data
      setTotal(response.data.total);
      setArrAuction(response.data.auctions);
      setTotalPage(
        Math.ceil(response.data.total / Number(import.meta.env.VITE_PAGE_SIZE))
      );
    } catch (err) {
      const detail = err.response?.data?.detail || t("error.error_get_data");
      toast.error(detail);
    } finally {
      setIsLoading(false);
      setCurrentIndexPage(page - 1);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const dataGroup = await getAll("categories", false);
      setCategories(Array.isArray(dataGroup) ? dataGroup : dataGroup.data.Categories || []);
      };
      fetchCategories();
  }, []);

  const setDataForParam = () => {
    setSearchParam({
      title: searchText.trim(),
      auction_type: auction_type || "",
      category_id: category_id || "",
      type: "", 
      status: status,
      sort_by: sortBy,
      sort_order: sortOder,
      start_time: dateRange[0] ? dateRange[0].toISOString() : undefined,
      end_time: dateRange[1] ? dateRange[1].toISOString() : undefined,
    });
  };

  useEffect(() => {
    if (Object.keys(searchParam).length > 0) {
      searchData();
    }
  }, [searchParam]);

  // Đọc status từ URL query parameter và tự động search
  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl !== null) {
      setStatus(statusFromUrl);
      setSearchParam({
        status: statusFromUrl,        
        category_id: "",
        type: "",
        sort_by: "",
        sort_order: "",
        start_time: undefined,
        end_time: undefined,
      });
    }
  }, [searchParams]);

  const handleClick = (id) => {
    navigate(`/auctions/${id}`);
  };

  const handleSeeAll = () => {
    navigate(`/auctions/search?status=${status}`);
  };

  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  // Chỉ search khi không có status từ URL
  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (!statusFromUrl) {
      searchData();
    }
  }, []);

  return (
    <AnimatedContent>
      <div className="shadow-[0_4px_24px_rgba(0,0,0,0.30)] mt-[250px] sm:mt-[160px] md:mt-[190px] lg:mt-[150px] xl:mt-[100px] p-4 text-xs rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-4 items-end">
          {/* Search input */}
          <div className="relative col-span-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              placeholder={t("enter_title")}
              className="pl-10 border pr-4 py-2 w-full rounded border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Group select */}
          <div className="col-span-1">
            <label className="text-sm text-gray-600 mb-1 mr-2 block">
              {t("type")}
            </label>
            <select
              onChange={(e) =>
                setCategory_id(e.target.value === "" ? null : e.target.value)
              }
              className="border border-gray-400 rounded-lg px-3 py-2 w-full"
              value={category_id || ""}
            >
              <option value="">{t("select_group")}</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Auction type select */}
          <div className="col-span-1">
            <label className="text-sm text-gray-600 mb-1 mr-2 block">
              {t("auction_type")}
            </label>
            <select onChange={(e) =>
                setAuction_type(e.target.value === "" ? null : e.target.value)
              }
              className="border border-gray-400 rounded-lg px-3 py-2 w-full"
              value={auction_type || ""}>
              <option value="">{t("select_group")}</option>
              <option value="SELL">{t("sell")}</option>
              <option value="BUY">{t("buy")}</option>
            </select>
          </div>
          
          {/* Status select */}
          <div className="col-span-1">
            <label className="text-sm text-gray-600 mb-1 mr-2 block">
              {t("status")}
            </label>
            <select
              onChange={(e) =>
                setStatus(e.target.value === "" ? null : e.target.value)
              }
              className="border border-gray-400 rounded-lg px-3 py-2 w-full"
            >
              <option value="">{t("select_status")}</option>
              <option value="0">{t("ongoing_auctions")}</option>
              <option value="1">{t("upcoming_auctions")}</option>
              <option value="2">{t("ended_auctions")}</option>
            </select>
          </div>

          {/* Sort select */}
          <div className="col-span-1">
            <label className="text-sm text-gray-600 mb-1 mr-2 block">
              {t("sort_by")}
            </label>
            <select
              onChange={(e) => {
                const selectedOption = e.target.selectedOptions[0];
                setSortBy(selectedOption.value);
                setSortOder(selectedOption.dataset.order);
              }}
              className="border border-gray-400 rounded-lg px-3 py-2 w-full"
            >
              <option value="">{t("select_sort")}</option>
              <option value="title" data-order="asc">
                {t("sort_title_asc")}
              </option>
              <option value="title" data-order="desc">
                {t("sort_title_desc")}
              </option>
              <option value="create_at" data-order="asc">
                {t("sort_create_at_asc")}
              </option>
              <option value="create_at" data-order="desc">
                {t("sort_create_at_desc")}
              </option>
              <option value="start_time" data-order="asc">
                {t("sort_start_time_asc")}
              </option>
              <option value="start_time" data-order="desc">
                {t("sort_start_time_desc")}
              </option>
              <option value="end_time" data-order="asc">
                {t("sort_end_time_asc")}
              </option>
              <option value="end_time" data-order="desc">
                {t("sort_end_time_desc")}
              </option>
            </select>
          </div>

          {/* Calendar */}
          <div className="col-span-1">
            <label className="text-sm text-gray-600 mb-1 block">
              {t("calendar")}
            </label>
            <RangeCalender
              value={dateRange}
              onChange={setDateRange}
              allowMinDate={true}
            />
          </div>

          {/* Search button */}
          <div className="col-span-1 px-4 flex items-end ">
            <button
              onClick={() => setDataForParam()}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out w-full font-semibold tracking-wide"
            >
              <FontAwesomeIcon icon={faSearch} className="mr-2" />
              {t("search_btn")}
            </button>
          </div>
        </div>

        <div className="text-gray-600 text-sm font-medium mb-4">
          {t("result_found")}:{" "}
          <span className="font-bold text-red-500">{total}</span>
        </div>
        {isLoading ? (
          <div className="loader my-5" />
        ) : (
          <RenderCardAuction
            arrAuction={arrAuction}
            numberCol={4}
            clickCard={handleClick}
          />
        )}
        <Pagination
          currentPage={currentIndexPage}
          totalPage={totalPage}
          onPageChange={searchData}
        />
      </div>
    </AnimatedContent>
  );
};

export default AuctionSearch;
