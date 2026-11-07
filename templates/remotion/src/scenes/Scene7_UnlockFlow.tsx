import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { PersianCaption } from "../components/PersianCaption";

export const Scene7_UnlockFlow: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const camZoom = interpolate(frame, [0, 125], [1, 1.06], {
    extrapolateRight: "clamp",
  });

  // Unlock transition at frame 45
  const isUnlocked = frame >= 45;

  const openShackleAngle = interpolate(frame, [45, 60], [0, -35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const greenGlow = interpolate(frame, [45, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stateColor = isUnlocked ? "#10B981" : "#38BDF8";

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
        badge="تضمین ۱۰۰٪ صحت شماره"
        badgeColor="#10B981"
        headline="ثبت سفارش فقط بعد از تایید شماره!"
        highlightWords={["تایید", "شماره", "سفارش"]}
        subtitle="کاربر ابتدا شماره‌اش را تایید می‌کند، سپس به درگاه پرداخت هدایت می‌شود"
      />

      <div
        style={{
          position: "relative",
          marginTop: 180,
          width: 640,
          height: 600,
        }}
      >
        <svg
          viewBox="0 0 640 600"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* 3 Step Interactive Line Art Pipeline */}
          {/* Step 1: Phone input */}
          <g transform="translate(130, 200)">
            <circle
              cx="0"
              cy="0"
              r="48"
              fill="rgba(15, 23, 42, 0.85)"
              stroke="#38BDF8"
              strokeWidth="2.5"
              style={{ filter: "drop-shadow(0 0 10px #38BDF8)" }}
            />
            {/* Phone outline */}
            <rect x="-14" y="-22" width="28" height="44" rx="4" fill="none" stroke="#38BDF8" strokeWidth="2" />
            <circle cx="0" cy="14" r="2" fill="#38BDF8" />
            <text x="0" y="75" fill="#E2E8F0" fontSize="16" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              ۱. درج شماره
            </text>
          </g>

          {/* Flow Connector Arrow 1 -> 2 */}
          <path
            d="M 185 200 L 270 200"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="3"
            strokeDasharray="6 4"
            markerEnd="url(#arrow)"
          />

          {/* Step 2: SMS OTP */}
          <g transform="translate(320, 200)">
            <circle
              cx="0"
              cy="0"
              r="48"
              fill="rgba(15, 23, 42, 0.85)"
              stroke="#38BDF8"
              strokeWidth="2.5"
              style={{ filter: "drop-shadow(0 0 10px #38BDF8)" }}
            />
            {/* SMS Key */}
            <path d="M -16 -10 L 16 -10 L 0 5 Z" fill="none" stroke="#38BDF8" strokeWidth="2" />
            <rect x="-16" y="-10" width="32" height="22" rx="2" fill="none" stroke="#38BDF8" strokeWidth="2" />
            <text x="0" y="75" fill="#E2E8F0" fontSize="16" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              ۲. کد پیامکی
            </text>
          </g>

          {/* Flow Connector Arrow 2 -> 3 */}
          <path
            d="M 375 200 L 460 200"
            fill="none"
            stroke={isUnlocked ? "#10B981" : "rgba(255,255,255,0.2)"}
            strokeWidth="3"
            strokeDasharray="6 4"
          />

          {/* Step 3: Unlocked Access */}
          <g transform="translate(510, 200)">
            <circle
              cx="0"
              cy="0"
              r="48"
              fill="rgba(15, 23, 42, 0.85)"
              stroke={isUnlocked ? "#10B981" : "#64748B"}
              strokeWidth="2.5"
              style={{ filter: `drop-shadow(0 0 12px ${stateColor})` }}
            />
            {/* Checkmark or open lock */}
            <path
              d="M -15 2 L -5 12 L 15 -8"
              fill="none"
              stroke={isUnlocked ? "#34D399" : "#64748B"}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="0" y="75" fill="#E2E8F0" fontSize="16" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              ۳. اجازه پرداخت
            </text>
          </g>

          {/* Big Interactive Transformation Display (Bottom) */}
          <g transform="translate(320, 390)">
            {/* Glowing Panel */}
            <rect
              x="-240"
              y="-40"
              width="480"
              height="80"
              rx="20"
              fill={isUnlocked ? "rgba(16, 185, 129, 0.2)" : "rgba(30, 41, 59, 0.8)"}
              stroke={stateColor}
              strokeWidth="2.5"
              style={{ filter: `drop-shadow(0 0 18px ${stateColor}77)` }}
            />

            {/* Lock Icon */}
            <g transform="translate(-160, 0)">
              {/* Shackle */}
              <path
                d="M -10 -8 C -10 -22 10 -22 10 -8"
                fill="none"
                stroke={stateColor}
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${openShackleAngle}, 10, -8)`}
              />
              <rect x="-14" y="-5" width="28" height="24" rx="5" fill="none" stroke={stateColor} strokeWidth="3" />
            </g>

            <text
              x="20"
              y="10"
              fill={isUnlocked ? "#34D399" : "#FFFFFF"}
              fontSize="24"
              fontWeight="900"
              fontFamily={fontFamily}
              textAnchor="middle"
            >
              {isUnlocked
                ? "قفل باز شد • ثبت سفارش مجاز است"
                : "در انتظار احراز شماره موبایل..."}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
