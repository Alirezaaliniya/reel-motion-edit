import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export const Scene2_TwoCharacters: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const isBroken = frame >= 25;

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
          width: 700,
          height: 600,
        }}
      >
        <svg
          viewBox="0 0 700 600"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Ground Baseline */}
          <line x1="80" y1="460" x2="620" y2="460" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Left Character: Store Manager (Dashed silhouette like reference video) */}
          <g transform="translate(180, 360)">
            {/* Number badge (1) */}
            <circle cx="0" cy="-140" r="16" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="0" y="-134" fill="#FFFFFF" fontSize="15" fontFamily={fontFamily} textAnchor="middle">
              ۱
            </text>

            {/* Character Head */}
            <circle cx="0" cy="-60" r="24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4" />
            {/* Body */}
            <path
              d="M -30 -30 C -30 -30 0 -35 30 -30 L 25 35 L 12 35 L 10 95 L -10 95 L -12 35 L -25 35 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <text x="0" y="125" fill="#FFFFFF" fontSize="16" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              فروشگاه
            </text>
          </g>

          {/* Right Character: Customer (Dashed silhouette like reference video) */}
          <g transform="translate(520, 360)">
            {/* Number badge (2) */}
            <circle cx="0" cy="-140" r="16" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="0" y="-134" fill="#FFFFFF" fontSize="15" fontFamily={fontFamily} textAnchor="middle">
              ۲
            </text>

            {/* Character Head */}
            <circle cx="0" cy="-60" r="24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4" />
            {/* Body */}
            <path
              d="M -30 -30 C -30 -30 0 -35 30 -30 L 25 35 L 12 35 L 10 95 L -10 95 L -12 35 L -25 35 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <text x="0" y="125" fill="#FFFFFF" fontSize="16" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              مشتری
            </text>
          </g>

          {/* Connection Phone Wave / Line in Middle */}
          {/* Left Line */}
          <line x1="220" y1="330" x2="310" y2="330" stroke="#FFFFFF" strokeWidth="2" strokeDasharray={isBroken ? "6 6" : "none"} />

          {/* Right Line */}
          <line x1="390" y1="330" x2="480" y2="330" stroke="#FFFFFF" strokeWidth="2" strokeDasharray={isBroken ? "6 6" : "none"} />

          {/* Center Disconnection Break & Question Mark */}
          <g transform="translate(350, 330)">
            {isBroken ? (
              <>
                <line x1="-15" y1="-15" x2="15" y2="15" stroke="#E11D48" strokeWidth="3" />
                <line x1="15" y1="-15" x2="-15" y2="15" stroke="#E11D48" strokeWidth="3" />
                <text x="0" y="-35" fill="#FFFFFF" fontSize="36" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
                  ؟
                </text>
              </>
            ) : (
              <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};
