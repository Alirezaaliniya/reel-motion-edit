import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { PersianCaption } from "../components/PersianCaption";

export const Scene1_WrongNumber: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  // Floating smartphone entrance
  const phoneScale = interpolate(frame, [0, 25], [0.85, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const phoneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Camera slow cinematic zoom
  const camZoom = interpolate(frame, [0, 130], [1, 1.07], {
    extrapolateRight: "clamp",
  });

  // Error trigger at frame 45
  const errorProgress = interpolate(frame, [45, 65], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const errorStrokeColor = interpolate(errorProgress, [0, 1], [0, 1]);
  const strokeColor = errorStrokeColor > 0.5 ? "#EF4444" : "#38BDF8";

  // Pulse rings after error
  const pulseScale = interpolate((frame - 60) % 35, [0, 35], [1, 2.2], {
    extrapolateLeft: "clamp",
  });
  const pulseOpacity = interpolate((frame - 60) % 35, [0, 35], [0.8, 0], {
    extrapolateLeft: "clamp",
  });

  // Stroke dash offset for line drawing animation
  const drawOffset = interpolate(frame, [5, 40], [1200, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

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
        badge="فروشگاه اینترنتی"
        badgeColor={errorProgress > 0.5 ? "#EF4444" : "#38BDF8"}
        headline="مشتری از سایتت خرید کرده!"
        highlightWords={["خرید", "اشتباه"]}
        subtitle="اما شماره موبایلش رو اشتباه وارد کرده..."
      />

      {/* Center Cinematic Line Art Stage */}
      <div
        style={{
          position: "relative",
          marginTop: 180,
          width: 500,
          height: 680,
          transform: `scale(${phoneScale})`,
          opacity: phoneOpacity,
        }}
      >
        <svg
          viewBox="0 0 500 680"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Ambient glow under phone */}
          <ellipse
            cx="250"
            cy="650"
            rx="180"
            ry="25"
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeDasharray="6 8"
            opacity="0.4"
          />

          {/* Smartphone Body Outline */}
          <rect
            x="70"
            y="40"
            width="360"
            height="580"
            rx="36"
            fill="rgba(10, 16, 32, 0.75)"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeDasharray="1600"
            strokeDashoffset={drawOffset}
            style={{
              filter: `drop-shadow(0 0 16px ${strokeColor}66)`,
            }}
          />

          {/* Speaker ear slit */}
          <line
            x1="210"
            y1="70"
            x2="290"
            y2="70"
            stroke="#94A3B8"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Screen Content Frame */}
          <rect
            x="95"
            y="95"
            width="310"
            height="480"
            rx="16"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
          />

          {/* Shopping Cart Icon (top) */}
          <g
            transform="translate(250, 160)"
            style={{
              filter: `drop-shadow(0 0 10px #38BDF8)`,
            }}
          >
            <circle cx="0" cy="0" r="42" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="6 4" />
            <path
              d="M -18 -8 L -10 -8 L -2 14 L 14 14 L 20 -2 L -6 -2"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="1" cy="20" r="2.5" fill="#38BDF8" />
            <circle cx="12" cy="20" r="2.5" fill="#38BDF8" />
          </g>

          {/* Order Successful Badge */}
          <g transform="translate(250, 235)">
            <rect
              x="-110"
              y="-18"
              width="220"
              height="36"
              rx="18"
              fill="rgba(34, 197, 94, 0.12)"
              stroke="#22C55E"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="6"
              fill="#4ADE80"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily={fontFamily}
            >
              ثبت سفارش: #۹۴۸۱
            </text>
          </g>

          {/* Phone Input Box Field */}
          <g transform="translate(250, 340)">
            <rect
              x="-130"
              y="-35"
              width="260"
              height="70"
              rx="16"
              fill={errorProgress > 0.5 ? "rgba(239, 68, 68, 0.15)" : "rgba(30, 41, 59, 0.6)"}
              stroke={strokeColor}
              strokeWidth={errorProgress > 0.5 ? "2.5" : "1.5"}
              style={{
                filter: `drop-shadow(0 0 14px ${strokeColor}88)`,
              }}
            />

            {/* Input Label */}
            <text
              x="110"
              y="-12"
              fill="rgba(255,255,255,0.6)"
              fontSize="13"
              fontFamily={fontFamily}
              textAnchor="end"
            >
              شماره موبایل گیرنده:
            </text>

            {/* Phone Number Digits */}
            <text
              x="0"
              y="20"
              fill={errorProgress > 0.5 ? "#F87171" : "#F8FAFC"}
              fontSize="22"
              fontWeight="bold"
              fontFamily="monospace"
              letterSpacing="3"
              textAnchor="middle"
            >
              {errorProgress > 0.5 ? "0912 ••• ????" : "0912 345 6789"}
            </text>
          </g>

          {/* Red Alert Icon and Warning Ripple */}
          {errorProgress > 0.5 && (
            <g transform="translate(250, 470)">
              {/* Expanding Warning Rings */}
              <circle
                cx="0"
                cy="0"
                r={36 * pulseScale}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                opacity={pulseOpacity}
              />
              <circle
                cx="0"
                cy="0"
                r="40"
                fill="rgba(239, 68, 68, 0.2)"
                stroke="#EF4444"
                strokeWidth="2.5"
                style={{
                  filter: "drop-shadow(0 0 16px #EF4444)",
                }}
              />
              {/* Alert Triangle */}
              <path
                d="M 0 -22 L 20 14 L -20 14 Z"
                fill="none"
                stroke="#FCA5A5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="0" y1="-8" x2="0" y2="4" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="0" cy="9" r="1.5" fill="#FFFFFF" />

              <text
                x="0"
                y="55"
                fill="#EF4444"
                fontSize="17"
                fontWeight="800"
                fontFamily={fontFamily}
                textAnchor="middle"
              >
                شماره نامعتبر / اشتباه!
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
