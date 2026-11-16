import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

export const Scene7_ThreeSteps: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const isUnlocked = frame >= 45;
  const shackleAngle = interpolate(frame, [45, 60], [0, -35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

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
          width: 660,
          height: 600,
        }}
      >
        <svg
          viewBox="0 0 660 600"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* 3 Step Minimal Circles */}
          {/* Step 1 */}
          <g transform="translate(130, 240)">
            <circle cx="0" cy="0" r="48" fill="#000000" stroke="#FFFFFF" strokeWidth="2" />
            <text x="0" y="6" fill="#FFFFFF" fontSize="22" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              ۱
            </text>
            <text x="0" y="75" fill="#FFFFFF" fontSize="15" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              ثبت شماره
            </text>
          </g>

          {/* Line 1 -> 2 */}
          <line x1="185" y1="240" x2="275" y2="240" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4" />

          {/* Step 2 */}
          <g transform="translate(330, 240)">
            <circle cx="0" cy="0" r="48" fill="#000000" stroke="#FFFFFF" strokeWidth="2" />
            <text x="0" y="6" fill="#FFFFFF" fontSize="22" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              ۲
            </text>
            <text x="0" y="75" fill="#FFFFFF" fontSize="15" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              کد پیامکی
            </text>
          </g>

          {/* Line 2 -> 3 */}
          <line x1="385" y1="240" x2="475" y2="240" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4" />

          {/* Step 3 */}
          <g transform="translate(530, 240)">
            <circle cx="0" cy="0" r="48" fill={isUnlocked ? "#FFFFFF" : "#000000"} stroke="#FFFFFF" strokeWidth="2" />
            <text x="0" y="6" fill={isUnlocked ? "#000000" : "#FFFFFF"} fontSize="22" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              ۳
            </text>
            <text x="0" y="75" fill="#FFFFFF" fontSize="15" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              ثبت نهایی
            </text>
          </g>

          {/* Bottom Unlocked Gate Action */}
          <g transform="translate(330, 420)">
            <rect
              x="-200"
              y="-30"
              width="400"
              height="60"
              rx="16"
              fill={isUnlocked ? "#FFFFFF" : "#18181B"}
              stroke="#FFFFFF"
              strokeWidth="2"
            />

            {/* Padlock Icon */}
            <g transform="translate(-130, 0)">
              <path
                d="M -10 -6 C -10 -18 10 -18 10 -6"
                fill="none"
                stroke={isUnlocked ? "#000000" : "#FFFFFF"}
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${shackleAngle}, 10, -6)`}
              />
              <rect x="-14" y="-3" width="28" height="22" rx="4" fill={isUnlocked ? "#FFFFFF" : "#000000"} stroke={isUnlocked ? "#000000" : "#FFFFFF"} strokeWidth="2" />
            </g>

            <text
              x="25"
              y="6"
              fill={isUnlocked ? "#000000" : "#FFFFFF"}
              fontSize="17"
              fontWeight="bold"
              fontFamily={fontFamily}
              textAnchor="middle"
            >
              {isUnlocked
                ? "قفل باز شد • ثبت سفارش مجاز است"
                : "در انتظار تایید شماره موبایل..."}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
