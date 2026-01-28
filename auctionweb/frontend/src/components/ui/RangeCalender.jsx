import flatpickr from "flatpickr";
import { useEffect, useRef } from "react";
import "flatpickr/dist/flatpickr.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { useTetMode } from "../../contexts/TetModeContext";

function RangeCalender({ onChange, value, allowMinDate }) {
  const calendarRef = useRef(null);
  const containerRef = useRef(null);
  const { t, i18n } = useTranslation();
  const { tetMode } = useTetMode();
  const handleFocus = () => {
    calendarRef.current?.focus();
  };

  const fpInstance = useRef(null);

  // Khởi tạo flatpickr một lần
  useEffect(() => {
    fpInstance.current = flatpickr(calendarRef.current, {
      mode: "range",
      enableTime: true,
      time_24hr: true,
      minDate: allowMinDate ? null : "today",
      dateFormat: "d-m-Y H:i:S",
      defaultDate: value || [],
      onChange: (selectedDates) => {
        onChange?.(selectedDates);
      },
    });

    return () => {
      if (fpInstance.current) {
        fpInstance.current.destroy();
        fpInstance.current = null;
      }
    };
  }, [allowMinDate]); // Chỉ phụ thuộc vào allowMinDate

  // Cập nhật giá trị khi value thay đổi
  useEffect(() => {
    if (fpInstance.current && value) {
      fpInstance.current.setDate(value, false);
    }
  }, [value]);

  // Khi load trang, ưu tiên lấy ngôn ngữ từ sessionStorage nếu có
  useEffect(() => {
    const savedLang = sessionStorage.getItem("lang");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  // Xử lý click outside để đóng calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Kiểm tra xem click có nằm ngoài container và calendar popup không
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        fpInstance.current
      ) {
        // Kiểm tra xem click có phải vào flatpickr calendar popup không
        const flatpickrCalendar = document.querySelector('.flatpickr-calendar');
        if (!flatpickrCalendar || !flatpickrCalendar.contains(event.target)) {
          fpInstance.current.close();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={`flex items-center border rounded overflow-hidden ${tetMode ? 'border-[#3a3b3c]' : ''}`}>
      <div
        onClick={handleFocus}
        className={`h-8 flex items-center px-3 ${tetMode ? 'bg-[#CB0502]' : 'bg-blue-500'}`}
      >
        <FontAwesomeIcon
          icon={faCalendar}
          className="text-white cursor-pointer"
        />
      </div>
      <input
        ref={calendarRef}
        placeholder={t("select_time_range")}
        className={`p-2 w-full h-full focus:outline-none ${tetMode ? 'bg-[#3a3b3c] text-white placeholder-gray-400' : ''}`}
      />
    </div>
  );
}

export default RangeCalender;
