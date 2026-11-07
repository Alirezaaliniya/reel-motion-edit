import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

export const Scene1_HandPhone: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const phoneY = interpolate(frame, [0, 20], [60, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const isError = frame >= 40;

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
          height: 900,
          transform: `translateY(${phoneY}px)`,
        }}
      >
        <svg
          viewBox="0 0 500 900"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Hand Holding the Phone (Minimalist White Outline) */}
          {/* Thumb */}
          <path
            d="M 430 520 C 490 520 490 580 430 580"
            fill="#000000"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 430 550 C 370 550 360 560 360 575 C 360 590 380 600 430 600"
            fill="#000000"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Palm curve */}
          <path
            d="M 440 600 C 490 640 450 720 340 760"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Left fingers wrapping around phone */}
          <path d="M 68 440 C 50 440 50 470 68 470" fill="none" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M 68 480 C 50 480 50 510 68 510" fill="none" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M 68 520 C 50 520 50 550 68 550" fill="none" stroke="#FFFFFF" strokeWidth="3" />

          {/* Phone Outer Body */}
          <rect
            x="70"
            y="120"
            width="360"
            height="660"
            rx="46"
            fill="#000000"
            stroke="#FFFFFF"
            strokeWidth="3.5"
          />

          {/* Phone Screen (Clean Light Paper White Background) */}
          <rect
            x="84"
            y="134"
            width="332"
            height="632"
            rx="36"
            fill="#F4F4F5"
          />

          {/* Dynamic Island Notch */}
          <rect
            x="200"
            y="148"
            width="100"
            height="26"
            rx="13"
            fill="#000000"
          />

          {/* Screen Content: Online Checkout */}
          {/* Header */}
          <g transform="translate(250, 220)">
            {/* Cart Icon */}
            <circle cx="0" cy="0" r="30" fill="none" stroke="#18181B" strokeWidth="2" />
            <path
              d="M -12 -6 L -8 -6 L -2 10 L 10 10 L 14 -2 L -5 -2"
              fill="none"
              stroke="#18181B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="0" cy="15" r="2" fill="#18181B" />
            <circle cx="9" cy="15" r="2" fill="#18181B" />
          </g>

          <text
            x="250"
            y="290"
            fill="#18181B"
            fontSize="18"
            fontWeight="bold"
            fontFamily={fontFamily}
            textAnchor="middle"
          >
            صفحه تسویه‌حساب سفارش
          </text>

          {/* Skeleton Order Items */}
          <line x1="120" y1="330" x2="380" y2="330" stroke="#D4D4D8" strokeWidth="8" strokeLinecap="round" />
          <line x1="120" y1="355" x2="310" y2="355" stroke="#E4E4E7" strokeWidth="8" strokeLinecap="round" />

          {/* Phone Input Box Field */}
          <g transform="translate(250, 440)">
            <rect
              x="-125"
              y="-35"
              width="250"
              height="70"
              rx="12"
              fill="#FFFFFF"
              stroke={isError ? "#E11D48" : "#A1A1AA"}
              strokeWidth={isError ? "2" : "1.5"}
            />
            <text
              x="105"
              y="-12"
              fill="#71717A"
              fontSize="12"
              fontFamily={fontFamily}
              textAnchor="end"
            >
              شماره موبایل گیرنده:
            </text>
            <text
              x="0"
              y="18"
              fill={isError ? "#E11D48" : "#18181B"}
              fontSize="20"
              fontWeight="bold"
              fontFamily="monospace"
              letterSpacing="2"
              textAnchor="middle"
            >
              {isError ? "0912 ••• ????" : "0912 345 6789"}
            </text>
          </g>

          {/* Error Notification Pill below input */}
          {isError && (
            <g transform="translate(250, 520)">
              <rect
                x="-100"
                y="-15"
                width="200"
                height="30"
                rx="15"
                fill="#FFE4E6"
                stroke="#E11D48"
                strokeWidth="1"
              />
              <text
                x="0"
                y="5"
                fill="#E11D48"
                fontSize="12"
                fontWeight="bold"
                fontFamily={fontFamily}
                textAnchor="middle"
              >
                شماره اشتباه است!
              </text>
            </g>
          )}

          {/* Checkout Button */}
          <g transform="translate(250, 640)">
            <rect
              x="-125"
              y="-24"
              width="250"
              height="48"
              rx="24"
              fill="#18181B"
            />
            <text
              x="0"
              y="6"
              fill="#FFFFFF"
              fontSize="15"
              fontWeight="bold"
              fontFamily={fontFamily}
              textAnchor="middle"
            >
              ثبت نهایی سفارش
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
