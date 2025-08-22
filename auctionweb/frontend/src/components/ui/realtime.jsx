import React, { useEffect, useState } from "react";

const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeString = time.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const dateString = time.toLocaleDateString("en-EN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div style={{ textAlign: "center", color:"#fff" ,fontFamily: "Arial, sans-serif" }}>
      <div style={{ fontSize: "18px", color:"#fff" , fontWeight: "600" }}>{timeString}</div>
      <div style={{ fontSize: "12px", color:"#fff", marginTop: "4px" }}>
        {dateString}
      </div>
    </div>
  );
};

export default RealTimeClock;
