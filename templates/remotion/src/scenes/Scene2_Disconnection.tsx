import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { PersianCaption } from "../components/PersianCaption";

export const Scene2_Disconnection: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const camZoom = interpolate(frame, [0, 80], [1, 1.05], {
    extrapolateRight: "clamp",
  });

  // Broken line spark effect
  const sparkIntensity = interpolate(
    Math.sin(frame * 0.4),
    [-1, 1],
    [0.3, 1]
  );

  // Question mark floating animation
  const qY = interpolate(Math.sin(frame * 0.15), [-1, 1], [-8, 8]);
  const qRotate = interpolate(Math.sin(frame * 0.1), [-1, 1], [-6, 6]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${camZoom})`,
      }}
    >
      <PersianCaption
        fontFamily={fontFamily}
        badge="بحران ارتباط"
        badgeColor="#F59E0B"
        headline="حالا چطوری باهاش تماس بگیری؟"
        highlightWords={["چطوری", "تماس"]}
        subtitle="ارتباط کاملاً قطع شده و مشتری منتظر پاسخ است!"
      />

      <div
        style={{
          position: "relative",
          marginTop: 180,
          width: 700,
          height: 600,
        }}
      >
        <svg
          viewBox="0 0 700 600"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Background Communication Grid Lines */}
          <line
            x1="100"
            y1="300"
            x2="600"
            y2="300"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />

          {/* Left Node: E-Commerce Store Admin */}
          <g transform="translate(140, 300)">
            {/* Outer Ring */}
            <circle
              cx="0"
              cy="0"
              r="65"
              fill="rgba(15, 23, 42, 0.85)"
              stroke="#38BDF8"
              strokeWidth="2.5"
              style={{ filter: "drop-shadow(0 0 12px #38BDF8)" }}
            />
            {/* Server / Laptop Icon */}
            <rect
              x="-24"
              y="-20"
              width="48"
              height="32"
              rx="4"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2"
            />
            <line x1="-30" y1="18" x2="30" y2="18" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
            <text
              x="0"
              y="105"
              fill="#94A3B8"
              fontSize="18"
              fontWeight="bold"
              fontFamily={fontFamily}
              textAnchor="middle"
            >
              فروشگاه شما
            </text>
          </g>

          {/* Right Node: Customer */}
          <g transform="translate(560, 300)">
            <circle
              cx="0"
              cy="0"
              r="65"
              fill="rgba(15, 23, 42, 0.85)"
              stroke="#F59E0B"
              strokeWidth="2.5"
              style={{ filter: "drop-shadow(0 0 12px #F59E0B)" }}
            />
            {/* User Avatar */}
            <circle cx="0" cy="-10" r="14" fill="none" stroke="#F59E0B" strokeWidth="2" />
            <path
              d="M -22 22 C -22 6 22 6 22 22"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <text
              x="0"
              y="105"
              fill="#94A3B8"
              fontSize="18"
              fontWeight="bold"
              fontFamily={fontFamily}
              textAnchor="middle"
            >
              مشتری خریدار
            </text>
          </g>

          {/* Severed / Disconnected Lightning Connection */}
          {/* Left Segment */}
          <path
            d="M 210 300 L 290 300 L 310 280"
            fill="none"
            stroke="#EF4444"
            strokeWidth="3.5"
            strokeDasharray="6 4"
            style={{ filter: "drop-shadow(0 0 10px #EF4444)" }}
          />

          {/* Right Segment */}
          <path
            d="M 390 320 L 410 300 L 490 300"
            fill="none"
            stroke="#EF4444"
            strokeWidth="3.5"
            strokeDasharray="6 4"
            style={{ filter: "drop-shadow(0 0 10px #EF4444)" }}
          />

          {/* Center Disconnection Break Point */}
          <g
            transform={`translate(350, ${300 + qY}) rotate(${qRotate})`}
            style={{ opacity: sparkIntensity }}
          >
            {/* Red Warning Rhombus */}
            <polygon
              points="0,-50 48,0 0,50 -48,0"
              fill="rgba(239, 68, 68, 0.25)"
              stroke="#EF4444"
              strokeWidth="3"
              style={{ filter: "drop-shadow(0 0 16px #EF4444)" }}
            />

            {/* Glowing Question Mark & Crossed Phone */}
            <text
              x="0"
              y="18"
              fill="#FFFFFF"
              fontSize="48"
              fontWeight="900"
              textAnchor="middle"
              style={{ filter: "drop-shadow(0 0 8px #EF4444)" }}
            >
              ؟
            </text>
          </g>

          {/* Sparks around break */}
          <line
            x1="320"
            y1="270"
            x2="310"
            y2="255"
            stroke="#FDE047"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="380"
            y1="330"
            x2="395"
            y2="345"
            stroke="#FDE047"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="350"
            y1="230"
            x2="350"
            y2="215"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Status Label Underneath */}
          <g transform="translate(350, 420)">
            <rect
              x="-120"
              y="-18"
              width="240"
              height="36"
              rx="18"
              fill="rgba(239, 68, 68, 0.15)"
              stroke="#EF4444"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="6"
              fill="#F87171"
              fontSize="16"
              fontWeight="bold"
              fontFamily={fontFamily}
              textAnchor="middle"
            >
              خط نامعتبر • غیرقابل دسترس
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
