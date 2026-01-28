import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faThLarge, faList } from "@fortawesome/free-solid-svg-icons";
import RangeCalender from "../ui/RangeCalender";
import RenderCardAuction from "../ui/CardComponent";
import RenderListAuction from "../ui/ListComponent";
import { useEffect, useState } from "react";
import { getAll } from "../../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import Pagination from "../ui/Pagination";
import AnimatedContent from "../ui/animatedContent";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useTetMode } from "../../contexts/TetModeContext";

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
  const { tetMode } = useTetMode();
  const [searchParams] = useSearchParams();
  const [searchParam, setSearchParam] = useState({});
  const [arrAuction, setArrAuction] = useState([]);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndexPage, setCurrentIndexPage] = useState(0);
  const [viewMode, setViewMode] = useState(() => {
    // Lấy viewMode từ localStorage, mặc định là 'grid'
    return localStorage.getItem('auctionViewMode') || 'grid';
  });

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

  // Lưu viewMode vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('auctionViewMode', viewMode);
  }, [viewMode]);

  return (
    <AnimatedContent>
      <div 
        className={`shadow-[0_4px_24px_rgba(0,0,0,0.30)] sm:mt-[160px] md:mt-[190px] mt-[160px] lg:mt-[150px] xl:mt-[100px] p-4 text-xs rounded-xl transition-colors duration-500 ${tetMode ? 'bg-[#18191a]' : ''}`}
      >
        <div className="flex flex-wrap gap-3 mb-4 items-end">
          {/* Search input */}
          <div className="relative flex-1 min-w-[150px]">
            <span className={`absolute inset-y-0 left-0 pl-3 flex items-center ${tetMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              placeholder={t("enter_title")}
              className={`pl-10 border pr-4 py-2 w-full rounded shadow-sm focus:outline-none focus:ring-2 ${tetMode ? 'bg-[#242526] border-[#3a3b3c] text-white placeholder-gray-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-400'}`}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Group select */}
          <div className="flex-1 min-w-[130px]">
            <label className={`text-sm mb-1 mr-2 block ${tetMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t("type")}
            </label>
            <select
              onChange={(e) =>
                setCategory_id(e.target.value === "" ? null : e.target.value)
              }
              className={`border rounded-lg px-3 py-2 w-full ${tetMode ? 'bg-[#242526] border-[#3a3b3c] text-white' : 'border-gray-400'}`}
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
          <div className="flex-1 min-w-[120px]">
            <label className={`text-sm mb-1 mr-2 block ${tetMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t("auction_type")}
            </label>
            <select onChange={(e) =>
                setAuction_type(e.target.value === "" ? null : e.target.value)
              }
              className={`border rounded-lg px-3 py-2 w-full ${tetMode ? 'bg-[#242526] border-[#3a3b3c] text-white' : 'border-gray-400'}`}
              value={auction_type || ""}>
              <option value="">{t("select_group")}</option>
              <option value="SELL">{t("sell")}</option>
              <option value="BUY">{t("buy")}</option>
            </select>
          </div>
          
          {/* Status select */}
          <div className="flex-1 min-w-[120px]">
            <label className={`text-sm mb-1 mr-2 block ${tetMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t("status")}
            </label>
            <select
              onChange={(e) =>
                setStatus(e.target.value === "" ? null : e.target.value)
              }
              className={`border rounded-lg px-3 py-2 w-full ${tetMode ? 'bg-[#242526] border-[#3a3b3c] text-white' : 'border-gray-400'}`}
            >
              <option value="">{t("select_status")}</option>
              <option value="0">{t("ongoing_auctions")}</option>
              <option value="1">{t("upcoming_auctions")}</option>
              <option value="2">{t("ended_auctions")}</option>
            </select>
          </div>

          {/* Sort select */}
          <div className="flex-1 min-w-[150px]">
            <label className={`text-sm mb-1 mr-2 block ${tetMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t("sort_by")}
            </label>
            <select
              onChange={(e) => {
                const selectedOption = e.target.selectedOptions[0];
                setSortBy(selectedOption.value);
                setSortOder(selectedOption.dataset.order);
              }}
              className={`border rounded-lg px-3 py-2 w-full ${tetMode ? 'bg-[#242526] border-[#3a3b3c] text-white' : 'border-gray-400'}`}
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
          <div className="flex-1 min-w-[150px]">
            <label className={`text-sm mb-1 block ${tetMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t("calendar")}
            </label>
            <RangeCalender
              value={dateRange}
              onChange={setDateRange}
              allowMinDate={true}
            />
          </div>

          {/* View Toggle Button */}
          <div className="w-[100px] flex-shrink-0">
            <label className={`text-sm mb-1 block opacity-0 select-none ${tetMode ? 'text-gray-300' : 'text-gray-600'}`}>
              &nbsp;
            </label>
            <div className={`flex border rounded-lg overflow-hidden shadow-sm w-full ${tetMode ? 'border-[#3a3b3c]' : 'border-gray-300'}`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-4 py-2 font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? tetMode 
                      ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-md'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : tetMode
                      ? 'bg-[#242526] text-gray-300 hover:bg-[#3a3b3c]'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Grid View"
              >
                <FontAwesomeIcon icon={faThLarge} className="text-lg" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-4 py-2 font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? tetMode
                      ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-md'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : tetMode
                      ? 'bg-[#242526] text-gray-300 hover:bg-[#3a3b3c]'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="List View"
              >
                <FontAwesomeIcon icon={faList} className="text-lg" />
              </button>
            </div>
          </div>

          {/* Search button */}
          <div className="w-[130px] flex-shrink-0">
            <label className={`text-sm mb-1 block opacity-0 select-none ${tetMode ? 'text-gray-300' : 'text-gray-600'}`}>
              &nbsp;
            </label>
            <button
              onClick={() => setDataForParam()}
              className={`text-white px-6 py-2 rounded-lg shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out w-full font-semibold tracking-wide h-[40px] flex items-center justify-center ${tetMode ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900' : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:bg-blue-600'}`}
            >
              <FontAwesomeIcon icon={faSearch} className="mr-2" />
              {t("search_btn")}
            </button>
          </div>
        </div>

        <div className={`text-sm font-medium mb-4 ${tetMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {t("result_found")}:{" "}
          <span className={`font-bold ${tetMode ? 'text-yellow-400' : 'text-red-500'}`}>{total}</span>
        </div>
        {isLoading ? (
          <div className="loader my-5" />
        ) : viewMode === 'grid' ? (
          <RenderCardAuction
            arrAuction={arrAuction}
            numberCol={4}
            clickCard={handleClick}
          />
        ) : (
          <RenderListAuction
            arrAuction={arrAuction}
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
