import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { PersianCaption } from "../components/PersianCaption";

export const Scene5_PhoneVerify: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const camZoom = interpolate(frame, [0, 95], [1, 1.05], {
    extrapolateRight: "clamp",
  });

  // Digits typing in one by one
  const digit1 = frame >= 20 ? "7" : "";
  const digit2 = frame >= 32 ? "4" : "";
  const digit3 = frame >= 44 ? "9" : "";
  const digit4 = frame >= 56 ? "1" : "";

  // Success trigger after all 4 digits entered
  const isVerified = frame >= 65;
  const checkScale = interpolate(frame, [65, 80], [0, 1], {
    extrapolateLeft: "clamp",
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
        badge="گام اول: پیشگیری"
        badgeColor="#38BDF8"
        headline="قبل از خرید، شماره کاربر رو احراز کن!"
        highlightWords={["قبل", "خرید", "احراز"]}
        subtitle="تایید شماره موبایل با کد یکبارمصرف پیامکی سریع و بدون معطلی"
      />

      <div
        style={{
          position: "relative",
          marginTop: 180,
          width: 600,
          height: 600,
        }}
      >
        <svg
          viewBox="0 0 600 600"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Cybernetic Shield Base */}
          <polygon
            points="300,80 470,140 470,360 300,500 130,360 130,140"
            fill="rgba(15, 23, 42, 0.8)"
            stroke={isVerified ? "#10B981" : "#38BDF8"}
            strokeWidth="3"
            style={{
              filter: `drop-shadow(0 0 20px ${isVerified ? "#10B981" : "#38BDF8"}66)`,
            }}
          />

          {/* SMS / Phone Icon Top */}
          <g transform="translate(300, 180)">
            <circle
              cx="0"
              cy="0"
              r="40"
              fill="rgba(56, 189, 248, 0.1)"
              stroke="#38BDF8"
              strokeWidth="2"
            />
            {/* Message bubble */}
            <path
              d="M -16 -12 L 16 -12 C 20 -12 20 -12 20 -8 L 20 8 C 20 12 20 12 16 12 L -6 12 L -16 18 L -14 12 L -16 12 C -20 12 -20 12 -20 8 L -20 -8 C -20 -12 -20 -12 -16 -12 Z"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>

          <text
            x="300"
            y="255"
            fill="#E2E8F0"
            fontSize="18"
            fontWeight="bold"
            fontFamily={fontFamily}
            textAnchor="middle"
          >
            کد تایید ارسال شده را وارد کنید:
          </text>

          {/* 4 OTP Digit Input Boxes */}
          <g transform="translate(300, 310)">
            {/* Box 1 */}
            <g transform="translate(-135, 0)">
              <rect
                x="-30"
                y="-35"
                width="60"
                height="70"
                rx="12"
                fill="rgba(30, 41, 59, 0.7)"
                stroke={digit1 ? "#38BDF8" : "rgba(255,255,255,0.2)"}
                strokeWidth={digit1 ? "2.5" : "1.5"}
                style={digit1 ? { filter: "drop-shadow(0 0 10px #38BDF8)" } : {}}
              />
              <text x="0" y="12" fill="#FFFFFF" fontSize="32" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {digit1}
              </text>
            </g>

            {/* Box 2 */}
            <g transform="translate(-45, 0)">
              <rect
                x="-30"
                y="-35"
                width="60"
                height="70"
                rx="12"
                fill="rgba(30, 41, 59, 0.7)"
                stroke={digit2 ? "#38BDF8" : "rgba(255,255,255,0.2)"}
                strokeWidth={digit2 ? "2.5" : "1.5"}
                style={digit2 ? { filter: "drop-shadow(0 0 10px #38BDF8)" } : {}}
              />
              <text x="0" y="12" fill="#FFFFFF" fontSize="32" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {digit2}
              </text>
            </g>

            {/* Box 3 */}
            <g transform="translate(45, 0)">
              <rect
                x="-30"
                y="-35"
                width="60"
                height="70"
                rx="12"
                fill="rgba(30, 41, 59, 0.7)"
                stroke={digit3 ? "#38BDF8" : "rgba(255,255,255,0.2)"}
                strokeWidth={digit3 ? "2.5" : "1.5"}
                style={digit3 ? { filter: "drop-shadow(0 0 10px #38BDF8)" } : {}}
              />
              <text x="0" y="12" fill="#FFFFFF" fontSize="32" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {digit3}
              </text>
            </g>

            {/* Box 4 */}
            <g transform="translate(135, 0)">
              <rect
                x="-30"
                y="-35"
                width="60"
                height="70"
                rx="12"
                fill="rgba(30, 41, 59, 0.7)"
                stroke={digit4 ? "#38BDF8" : "rgba(255,255,255,0.2)"}
                strokeWidth={digit4 ? "2.5" : "1.5"}
                style={digit4 ? { filter: "drop-shadow(0 0 10px #38BDF8)" } : {}}
              />
              <text x="0" y="12" fill="#FFFFFF" fontSize="32" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {digit4}
              </text>
            </g>
          </g>

          {/* Success Checkmark Banner */}
          {isVerified && (
            <g transform={`translate(300, 420) scale(${checkScale})`}>
              <rect
                x="-140"
                y="-22"
                width="280"
                height="44"
                rx="22"
                fill="rgba(16, 185, 129, 0.2)"
                stroke="#10B981"
                strokeWidth="2"
                style={{ filter: "drop-shadow(0 0 16px #10B981)" }}
              />
              <path
                d="M -70 2 L -56 12 L -34 -8"
                fill="none"
                stroke="#34D399"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x="20"
                y="8"
                fill="#34D399"
                fontSize="18"
                fontWeight="bold"
                fontFamily={fontFamily}
                textAnchor="middle"
              >
                شماره تایید شد ✓
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
