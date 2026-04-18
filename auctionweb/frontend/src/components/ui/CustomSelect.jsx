import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTetMode } from "../../contexts/TetModeContext";

const CustomSelect = ({ value, onChange, options, placeholder, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const { tetMode } = useTetMode();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(options[highlightedIndex].value);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (selectedValue) => {
    onChange(selectedValue === "" ? null : selectedValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === (value || ""));

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          w-full flex items-center justify-between px-3 py-2 rounded-lg border
          transition-all duration-200 ease-in-out
          ${
            tetMode
              ? "bg-[#242526] border-[#3a3b3c] text-white hover:border-red-500"
              : "bg-white border-gray-400 hover:border-blue-500"
          }
          ${isOpen ? (tetMode ? "ring-2 ring-red-500 border-red-500" : "ring-2 ring-blue-400 border-blue-500") : ""}
          focus:outline-none focus:ring-2 ${tetMode ? "focus:ring-red-500" : "focus:ring-blue-400"}
        `}
      >
        <span className={`flex items-center gap-2 ${!selectedOption ? (tetMode ? "text-gray-400" : "text-gray-500") : ""}`}>
          {icon && <span className={tetMode ? "text-gray-400" : "text-gray-500"}>{icon}</span>}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${
            tetMode ? "text-gray-400" : "text-gray-500"
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`
          absolute z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden
          transition-all duration-300 ease-in-out origin-top
          ${
            tetMode
              ? "bg-[#242526] border border-[#3a3b3c]"
              : "bg-white border border-gray-200"
          }
          ${
            isOpen
              ? "opacity-100 scale-y-100 max-h-60 visible"
              : "opacity-0 scale-y-95 max-h-0 invisible"
          }
        `}
      >
        <div className="overflow-y-auto max-h-60 custom-scrollbar">
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                w-full px-3 py-2.5 text-left transition-colors duration-150
                ${
                  value === option.value
                    ? tetMode
                      ? "bg-red-600 text-white font-medium"
                      : "bg-blue-500 text-white font-medium"
                    : highlightedIndex === index
                    ? tetMode
                      ? "bg-[#3a3b3c] text-white"
                      : "bg-gray-100 text-gray-900"
                    : tetMode
                    ? "text-gray-300 hover:bg-[#3a3b3c]"
                    : "text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomSelect;
