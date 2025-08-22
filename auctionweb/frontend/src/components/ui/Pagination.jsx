import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

const Pagination = ({
  totalPage,
  onPageChange,
  currentPage,
  className = "flex justify-center mt-10",
}) => {
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
          "w-10 h-10 flex items-center justify-center rounded border border-gray-300 bg-white transition-all duration-150",
          currentPage === 0
            ? "cursor-not-allowed opacity-50"
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
                ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400"
            )}
          >
            {i + 1}
          </button>
        );
      })}

      <span
        className={clsx(
          "w-10 h-10 flex items-center justify-center rounded border border-gray-300 bg-white transition-all duration-150",
          currentPage === totalPage - 1
            ? "cursor-not-allowed opacity-50"
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
