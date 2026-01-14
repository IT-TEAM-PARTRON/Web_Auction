import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
  
const CountdownTimer = ({ targetTime }) => {
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const distance = new Date(targetTime).getTime() - now;
    if (distance <= 0) return null;
   
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    return { days, hours, minutes, seconds };
  };
  const { t, i18n } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!timeLeft) return;

    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  if (!timeLeft) return <span className="countdown-ended"></span>;

  const { days, hours, minutes, seconds } = timeLeft;
  return (
    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white opacity-80 md:scale-75 lg:scale-[0.8] xl:scale-100 2xl:scale-100 rounded-full shadow-md flex items-center px-6 py-1 space-x-3 z-[1000] text-sm">
      {/* Days */}
      <div className="flex flex-col items-center">
        <span className="font-bold text-lg text-black">{days}</span>
        <span className="text-xs text-gray-600">{t("days")}</span>
      </div>

      <span className="text-gray-400 text-sm">:</span>

      {/* Hours */}
      <div className="flex flex-col items-center">
        <span className="font-bold text-lg text-black">{hours}</span>
        <span className="text-xs text-gray-600">{t("hours")}</span>
      </div>

      <span className="text-gray-400 text-sm">:</span>

      {/* Minutes */}
      <div className="flex flex-col items-center">
        <span className="font-bold text-lg text-black">{minutes}</span>
        <span className="text-xs text-gray-600">{t("minutes")}</span>
      </div>

      <span className="text-gray-400 text-sm">:</span>

      {/* Seconds */}
      <div className="flex flex-col items-center">
        <span className="font-bold text-lg text-black">{seconds}</span>
        <span className="text-xs text-gray-600">{t("seconds")}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
