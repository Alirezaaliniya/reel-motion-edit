import React from "react";
import { useCurrentFrame } from "remotion";

export const Scene5_SMSVerify: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const digit1 = frame >= 18 ? "7" : "";
  const digit2 = frame >= 30 ? "4" : "";
  const digit3 = frame >= 42 ? "9" : "";
  const digit4 = frame >= 54 ? "1" : "";

  const isVerified = frame >= 65;

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
          width: 500,
          height: 800,
        }}
      >
        <svg
          viewBox="0 0 500 800"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Minimal Smartphone Card */}
          <rect
            x="70"
            y="90"
            width="360"
            height="620"
            rx="40"
            fill="#000000"
            stroke="#FFFFFF"
            strokeWidth="3"
          />

          {/* Screen Content area */}
          <rect
            x="84"
            y="104"
            width="332"
            height="592"
            rx="30"
            fill="#FAFAFA"
          />

          {/* Notch */}
          <rect x="200" y="118" width="100" height="22" rx="11" fill="#000000" />

          {/* SMS Shield Icon */}
          <g transform="translate(250, 230)">
            <circle cx="0" cy="0" r="35" fill="none" stroke="#18181B" strokeWidth="2" />
            <path
              d="M -15 -10 L 15 -10 C 18 -10 18 -10 18 -6 L 18 8 C 18 12 18 12 14 12 L -5 12 L -14 18 L -12 12 L -15 12 Z"
              fill="none"
              stroke="#18181B"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </g>

          <text
            x="250"
            y="310"
            fill="#18181B"
            fontSize="18"
            fontWeight="bold"
            fontFamily={fontFamily}
            textAnchor="middle"
          >
            تایید شماره موبایل
          </text>
          <text
            x="250"
            y="340"
            fill="#71717A"
            fontSize="14"
            fontFamily={fontFamily}
            textAnchor="middle"
          >
            کد پیامک‌شده را وارد کنید:
          </text>

          {/* 4 Clean Input Boxes */}
          <g transform="translate(250, 420)">
            <rect x="-120" y="-30" width="50" height="60" rx="8" fill="#FFFFFF" stroke="#D4D4D8" strokeWidth="1.5" />
            <text x="-95" y="10" fill="#18181B" fontSize="26" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              {digit1}
            </text>

            <rect x="-45" y="-30" width="50" height="60" rx="8" fill="#FFFFFF" stroke="#D4D4D8" strokeWidth="1.5" />
            <text x="-20" y="10" fill="#18181B" fontSize="26" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              {digit2}
            </text>

            <rect x="30" y="-30" width="50" height="60" rx="8" fill="#FFFFFF" stroke="#D4D4D8" strokeWidth="1.5" />
            <text x="55" y="10" fill="#18181B" fontSize="26" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              {digit3}
            </text>

            <rect x="105" y="-30" width="50" height="60" rx="8" fill="#FFFFFF" stroke="#D4D4D8" strokeWidth="1.5" />
            <text x="130" y="10" fill="#18181B" fontSize="26" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              {digit4}
            </text>
          </g>

          {/* Verified Checkmark Banner */}
          {isVerified && (
            <g transform="translate(250, 540)">
              <rect x="-110" y="-20" width="220" height="40" rx="20" fill="#18181B" />
              <path d="M -50 0 L -40 10 L -20 -8" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <text x="15" y="6" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
                شماره تایید شد ✓
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
