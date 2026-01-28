import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";
import { useTetMode } from "../../contexts/TetModeContext";

const Pagination = ({
  totalPage,
  onPageChange,
  currentPage,
  className = "flex justify-center mt-10",
}) => {
  const { tetMode } = useTetMode();
  const maxPageShow = 5;
  let startPage = Math.max(0, currentPage - Math.floor(maxPageShow / 2));
  let endPage = startPage + maxPageShow - 1;
  if (endPage >= totalPage) {
    endPage = totalPage - 1;
    startPage = Math.max(0, endPage - maxPageShow + 1);
  }

  const handleClickPagination = (index) => {
    onPageChange(index + 1);
  };

  return (
    <div className={clsx("flex justify-center", className)}>
      <span
        className={clsx(
          "w-10 h-10 flex items-center justify-center rounded border transition-all duration-150",
          tetMode ? "border-[#4a4b4c] bg-[#3a3b3c] text-gray-300" : "border-gray-300 bg-white",
          currentPage === 0
            ? "cursor-not-allowed opacity-50"
            : tetMode 
              ? "hover:bg-[#CB0502] group cursor-pointer"
              : "hover:bg-[#a8a8a8d0] group cursor-pointer"
        )}
        onClick={() => {
          if (currentPage !== 0)
            handleClickPagination(Math.max(currentPage - 1, 0));
        }}
      >
        <FontAwesomeIcon
          icon={faAnglesLeft}
          className="group-hover:text-white"
        />
      </span>

      {Array.from({ length: endPage - startPage + 1 }, (_, idx) => {
        const i = startPage + idx;
        return (
          <button
            onClick={() => handleClickPagination(i)}
            key={i}
            className={clsx(
              "mx-1 px-4 py-2 rounded-lg border font-semibold transition-all duration-150",
              currentPage === i
                ? tetMode 
                  ? "bg-gradient-to-r from-[#CB0502] to-[#ff4444] text-white border-[#CB0502] shadow-md scale-105"
                  : "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                : tetMode
                  ? "bg-[#3a3b3c] text-gray-300 border-[#4a4b4c] hover:bg-[#4a4b4c] hover:text-white hover:border-[#CB0502]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400"
            )}
          >
            {i + 1}
          </button>
        );
      })}

      <span
        className={clsx(
          "w-10 h-10 flex items-center justify-center rounded border transition-all duration-150",
          tetMode ? "border-[#4a4b4c] bg-[#3a3b3c] text-gray-300" : "border-gray-300 bg-white",
          currentPage === totalPage - 1
            ? "cursor-not-allowed opacity-50"
            : tetMode
              ? "hover:bg-[#CB0502] group cursor-pointer"
              : "hover:bg-[#a8a8a8d0] group cursor-pointer"
        )}
        onClick={() => {
          if (currentPage !== totalPage - 1)
            handleClickPagination(Math.min(currentPage + 1, totalPage - 1));
        }}
      >
        <FontAwesomeIcon
          icon={faAnglesRight}
          className="group-hover:text-white"
        />
      </span>
    </div>
  );
};

export default Pagination;
