import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export const Scene4_ComparisonBoxes: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const isSolution = frame >= 65;

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
          height: 800,
        }}
      >
        <svg
          viewBox="0 0 700 800"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Card 1: Left / Option 1 (Dead End) */}
          <g transform="translate(190, 420)">
            {/* Top Badge Circle 1 */}
            <circle cx="0" cy="-250" r="18" fill="#000000" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="0" y="-244" fill="#FFFFFF" fontSize="15" fontFamily={fontFamily} textAnchor="middle">
              ۱
            </text>

            {/* Card Body */}
            <rect
              x="-145"
              y="-250"
              width="290"
              height="510"
              rx="24"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="2"
            />

            {/* Inner Ground Line */}
            <line x1="-120" y1="180" x2="120" y2="180" stroke="#FFFFFF" strokeWidth="1.5" />

            {/* Silhouette inside Card 1 */}
            <g transform="translate(0, 100)">
              <circle cx="0" cy="-60" r="22" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4" />
              <path
                d="M -26 -30 C -26 -30 0 -35 26 -30 L 22 35 L 10 35 L 8 80 L -8 80 L -10 35 L -22 35 Z"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </g>

            {/* Red Deadlock Cross in Card 1 */}
            <g transform="translate(0, -60)">
              <circle cx="0" cy="0" r="30" fill="none" stroke="#E11D48" strokeWidth="2" />
              <line x1="-14" y1="-14" x2="14" y2="14" stroke="#E11D48" strokeWidth="2.5" />
              <line x1="14" y1="-14" x2="-14" y2="14" stroke="#E11D48" strokeWidth="2.5" />
              <text x="0" y="55" fill="#E11D48" fontSize="14" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
                هیچ راه پیگیری نیست
              </text>
            </g>
          </g>

          {/* Card 2: Right / Option 2 (The Solution) */}
          <g transform="translate(510, 420)">
            {/* Top Badge Circle 2 */}
            <circle cx="0" cy="-250" r="18" fill="#000000" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="0" y="-244" fill={isSolution ? "#000000" : "#FFFFFF"} fontSize="15" fontFamily={fontFamily} textAnchor="middle">
              ۲
            </text>

            {/* Card Body */}
            <rect
              x="-145"
              y="-250"
              width="290"
              height="510"
              rx="24"
              fill={isSolution ? "#FFFFFF" : "#000000"}
              stroke="#FFFFFF"
              strokeWidth="2"
            />

            {/* Inner Ground Line */}
            <line x1="-120" y1="180" x2="120" y2="180" stroke={isSolution ? "#18181B" : "#FFFFFF"} strokeWidth="1.5" />

            {/* Silhouette inside Card 2 */}
            <g transform="translate(0, 100)">
              <circle cx="0" cy="-60" r="22" fill="none" stroke={isSolution ? "#18181B" : "#FFFFFF"} strokeWidth="2" strokeDasharray="4 4" />
              <path
                d="M -26 -30 C -26 -30 0 -35 26 -30 L 22 35 L 10 35 L 8 80 L -8 80 L -10 35 L -22 35 Z"
                fill="none"
                stroke={isSolution ? "#18181B" : "#FFFFFF"}
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </g>

            {/* Solution Icon (Key / Checkmark) in Card 2 */}
            {isSolution && (
              <g transform="translate(0, -60)">
                <circle cx="0" cy="0" r="32" fill="#18181B" />
                {/* Clean Key Outline */}
                <circle cx="-6" cy="-6" r="8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="0" y1="0" x2="14" y2="14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="8" y1="8" x2="14" y2="3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <text x="0" y="55" fill="#18181B" fontSize="15" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
                  راهکار نیاس لاگین
                </text>
              </g>
            )}
          </g>

          {/* Dots Indicator below cards */}
          <circle cx="335" cy="730" r="5" fill="#FFFFFF" opacity={isSolution ? 0.3 : 1} />
          <circle cx="365" cy="730" r="5" fill="#FFFFFF" opacity={isSolution ? 1 : 0.3} />
        </svg>
      </div>
    </div>
  );
};
