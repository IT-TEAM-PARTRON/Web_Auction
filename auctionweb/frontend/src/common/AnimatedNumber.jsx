import { useEffect, useState } from "react";

const Digit = ({ digit, height }) => {
  return (
    <div
      className="digit-container"
      style={{
        height,
        overflow: "hidden",
        display: "inline-block",
      }}
    >
      <div
        className="digit-strip"
        style={{
          transform: `translateY(-${digit * height}px)`,
          transition: "transform 0.5s ease-in-out",
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="digit"
            style={{
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
};

const AnimatedCounter = ({ value, height = 24 }) => {
  const [digits, setDigits] = useState([]);

  useEffect(() => {
    if (value == null) return;
    const numberStr = value.toString().padStart(2, "0");
    setDigits(numberStr.split("").map(Number));
  }, [value]);

  return (
    <div
      className="animated-counter"
      style={{
        height,
        gap: 2,
      }}
    >
      {digits.map((d, idx) => (
        <Digit key={idx} digit={d} height={height} />
      ))}
    </div>
  );
};

export default AnimatedCounter;
