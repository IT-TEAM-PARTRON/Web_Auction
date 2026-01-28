import { useMemo, useRef } from 'react';
import './FallingFlowers.css';

const FallingFlowers = ({ count = 40 }) => {
  const containerRef = useRef(null);

  const flowers = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const depth = Math.random(); // 0 = xa (nhỏ, mờ, chậm), 1 = gần (to, rõ, nhanh)
      const sizeBase = 15 + Math.random() * 10; // Kích thước cơ bản to hơn xíu để rõ chi tiết hoa
      
      return {
        id: i,
        // Vị trí xuất phát ngẫu nhiên
        left: Math.random() * 100, 
        startDelay: Math.random() * -30, // Negative delay để hoa xuất hiện ngay lập tức rải rác
        
        // Parallax & Appearance
        size: sizeBase * (0.6 + depth * 0.4),
        opacity: 0.7 + depth * 0.3, // Hoa tết nên tươi sáng, không nên quá mờ
        blur: depth < 0.2 ? 1 : 0, // Chỉ làm mờ những bông rất xa
        zIndex: Math.floor(depth * 100),
        
        // Physics Logic
        fallDuration: 10 + Math.random() * 15 + (1 - depth) * 10, // 10s - 35s
        swayDuration: 4 + Math.random() * 4, 
        rotateDuration: 5 + Math.random() * 10,
        
        // Sway & Rotation
        swayAmount: 50 + Math.random() * 60, 
        rotateDirection: Math.random() > 0.5 ? 1 : -1,
        
        // Loại hoa & Màu sắc
        // Tỉ lệ: 40% Mai, 40% Đào, 20% Cánh rơi
        flowerType: Math.random() > 0.6 ? 'petal' : (Math.random() > 0.5 ? 'mai' : 'dao'), 
        colorVariant: Math.random(), // Dùng để chọn biến thể màu trong component con
      };
    });
  }, [count]);

  return (
    <div ref={containerRef} className="falling-flowers-container" aria-hidden="true">
      {flowers.map(flower => (
        <div
          key={flower.id}
          className="flower-wrapper"
          style={{
            left: `${flower.left}%`,
            zIndex: flower.zIndex,
            animationDuration: `${flower.fallDuration}s`,
            animationDelay: `${flower.startDelay}s`,
          }}
        >
          <div
            className="flower-sway"
            style={{
              animationDuration: `${flower.swayDuration}s`,
              '--sway-amount': `${flower.swayAmount}px`,
            }}
          >
            <div
              className="flower-rotate"
              style={{
                animationDuration: `${flower.rotateDuration}s`,
                animationDirection: flower.rotateDirection > 0 ? 'normal' : 'reverse',
              }}
            >
              <div
                className="flower-visual"
                style={{
                  width: flower.size,
                  height: flower.size,
                  opacity: flower.opacity,
                  filter: flower.blur > 0 ? `blur(${flower.blur}px)` : 'none',
                }}
              >
                <TetFlower type={flower.flowerType} variant={flower.colorVariant} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Component render SVG chi tiết cho hoa Tết
const TetFlower = ({ type, variant }) => {
  // Palette màu Tết
  const colors = {
    mai: ['#FFD700', '#FFEC8B', '#FDD017'], // Vàng gold, Vàng nhạt, Vàng nghệ
    dao: ['#FF69B4', '#FFB7C5', '#FFC0CB'], // Hồng đậm, Hồng phấn, Pink
    nhuy: '#8B4513' // Nâu gỗ cho nhụy
  };

  const getColor = (palette) => palette[Math.floor(variant * palette.length)];

  if (type === 'mai') {
    const color = getColor(colors.mai);
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
         {/* 5 cánh hoa mai tròn đều */}
        <g fill={color} opacity="0.95">
          <path d="M50 50 C50 20, 30 10, 30 30 C20 40, 40 50, 50 50" transform="rotate(0 50 50)" />
          <path d="M50 50 C80 20, 90 40, 70 50 C60 60, 50 50, 50 50" transform="rotate(72 50 50)" />
          <path d="M50 50 C80 80, 70 90, 50 70 C40 60, 50 50, 50 50" transform="rotate(144 50 50)" />
          <path d="M50 50 C20 80, 10 70, 30 50 C40 40, 50 50, 50 50" transform="rotate(216 50 50)" />
          <path d="M50 50 C20 20, 10 40, 30 50 C40 60, 50 50, 50 50" transform="rotate(288 50 50)" />
          {/* Cánh đầy đặn hơn */}
          <circle cx="50" cy="25" r="15" />
          <circle cx="74" cy="42" r="15" />
          <circle cx="65" cy="71" r="15" />
          <circle cx="35" cy="71" r="15" />
          <circle cx="26" cy="42" r="15" />
        </g>
        {/* Nhụy hoa */}
        <circle cx="50" cy="50" r="8" fill="#D2691E" />
        <g stroke="#8B4513" strokeWidth="1">
            <line x1="50" y1="50" x2="50" y2="35" />
            <line x1="50" y1="50" x2="65" y2="55" />
            <line x1="50" y1="50" x2="40" y2="62" />
        </g>
      </svg>
    );
  }

  if (type === 'dao') {
    const color = getColor(colors.dao);
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`grad-${variant}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FFF0F5" />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
        </defs>
        {/* Hoa đào cánh nhọn hơn chút và xếp lớp */}
        <g fill={`url(#grad-${variant})`} opacity="0.9">
             {[0, 72, 144, 216, 288].map(deg => (
                <ellipse 
                    key={deg} 
                    cx="50" cy="22" rx="12" ry="22" 
                    transform={`rotate(${deg} 50 50)`} 
                />
             ))}
        </g>
        <circle cx="50" cy="50" r="5" fill="#FF1493" opacity="0.8" />
        {/* Điểm xuyết nhụy trắng */}
        <circle cx="48" cy="48" r="2" fill="white" />
        <circle cx="52" cy="52" r="2" fill="white" />
      </svg>
    );
  }

  // Cánh hoa rơi tự do (Petal)
  const isMaiPetal = variant > 0.5;
  const petalColor = isMaiPetal ? getColor(colors.mai) : getColor(colors.dao);
  
  return (
    <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M25 0 C35 15, 45 35, 25 50 C5 35, 15 15, 25 0 Z" 
        fill={petalColor} 
        opacity="0.8"
      />
      {/* Đường gân nhẹ */}
      <path d="M25 10 Q25 30 25 45" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    </svg>
  );
};

export default FallingFlowers;