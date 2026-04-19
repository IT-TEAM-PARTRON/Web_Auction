import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { BASE_URL } from "../../config";

const ImageModal = ({ isOpen, onClose, images, initialIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex || 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, initialIndex]);

  if (!isOpen || !images || images.length === 0) return null;

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-[3010]"
      >
        <X size={32} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 text-white hover:bg-white/20 rounded-full z-[3010] transition-colors"
          >
            <ChevronLeft size={36} />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 text-white hover:bg-white/20 rounded-full z-[3010] transition-colors"
          >
            <ChevronRight size={36} />
          </button>
        </>
      )}

      <div 
        className="max-w-[95vw] max-h-[90vh] relative flex flex-col items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={`${BASE_URL}${images[currentIndex]}`}
          alt={`auction-image-${currentIndex}`}
          className="max-w-full max-h-[85vh] object-contain select-none shadow-2xl rounded-sm"
        />
        {images.length > 1 && (
          <div className="absolute -bottom-6 sm:-bottom-10 text-white text-sm sm:text-lg tracking-widest bg-black/50 px-4 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;
