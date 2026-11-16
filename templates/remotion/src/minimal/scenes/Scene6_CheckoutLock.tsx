import React from "react";
import { useCurrentFrame } from "remotion";

export const Scene6_CheckoutLock: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const isLocked = frame >= 38;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 600,
          height: 600,
        }}
      >
        <svg
          viewBox="0 0 600 600"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Minimalist WooCommerce Window */}
          <rect
            x="60"
            y="90"
            width="480"
            height="420"
            rx="24"
            fill="#000000"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />

          {/* Window Header */}
          <line x1="60" y1="150" x2="540" y2="150" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="90" cy="120" r="5" fill="#FFFFFF" />
          <circle cx="110" cy="120" r="5" fill="#FFFFFF" />
          <circle cx="130" cy="120" r="5" fill="#FFFFFF" />
          <text x="300" y="126" fill="#A1A1AA" fontSize="14" fontFamily="monospace" textAnchor="middle">
            WooCommerce Settings // Nias Login
          </text>

          {/* Setting Row */}
          <g transform="translate(100, 220)">
            <text x="400" y="18" fill="#FFFFFF" fontSize="16" fontWeight="bold" fontFamily={fontFamily} textAnchor="end">
              قفل پرداخت تا تایید شماره موبایل:
            </text>
            {/* Toggle Switch */}
            <rect x="20" y="-4" width="56" height="28" rx="14" fill="#FFFFFF" />
            <circle cx="58" cy="10" r="10" fill="#000000" />
          </g>

          {/* Skeleton lines */}
          <line x1="100" y1="290" x2="420" y2="290" stroke="#3F3F46" strokeWidth="6" strokeLinecap="round" />
          <line x1="100" y1="320" x2="340" y2="320" stroke="#27272A" strokeWidth="6" strokeLinecap="round" />

          {/* Locked Checkout Button */}
          <g transform="translate(300, 420)">
            <rect
              x="-180"
              y="-30"
              width="360"
              height="60"
              rx="16"
              fill={isLocked ? "#18181B" : "#FFFFFF"}
              stroke="#FFFFFF"
              strokeWidth="2"
            />

            {/* Padlock Icon */}
            <g transform="translate(-110, 0)">
              <path
                d="M -10 -8 C -10 -20 10 -20 10 -8 L 10 -2"
                fill="none"
                stroke={isLocked ? "#FFFFFF" : "#000000"}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <rect x="-14" y="-2" width="28" height="24" rx="4" fill={isLocked ? "#000000" : "#FFFFFF"} stroke={isLocked ? "#FFFFFF" : "#000000"} strokeWidth="2" />
            </g>

            <text
              x="20"
              y="6"
              fill={isLocked ? "#FFFFFF" : "#000000"}
              fontSize="17"
              fontWeight="bold"
              fontFamily={fontFamily}
              textAnchor="middle"
            >
              صفحه پرداخت قفل شد
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
