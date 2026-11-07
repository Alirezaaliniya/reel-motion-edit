import React from "react";
import { useCurrentFrame } from "remotion";

export const Scene9_ProtectedStore: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

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
          {/* Ground Line */}
          <line x1="80" y1="460" x2="580" y2="460" stroke="#FFFFFF" strokeWidth="2" />

          {/* Minimalist Store Outline */}
          <g transform="translate(330, 340)">
            {/* Building box */}
            <rect x="-100" y="-80" width="200" height="120" fill="#000000" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Awning */}
            <polygon points="-120,-80 120,-80 100,-45 -100,-45" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="-50" y1="-80" x2="-45" y2="-45" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="0" y1="-80" x2="0" y2="-45" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="50" y1="-80" x2="45" y2="-45" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Door */}
            <rect x="-25" y="-10" width="50" height="50" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          </g>

          {/* Clean Protective Shield Arc */}
          <path
            d="M 120 460 A 210 210 0 0 1 540 460"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeDasharray="10 8"
          />

          {/* Bouncing Cross / Spam Order Markers */}
          <g transform="translate(160, 270)">
            <line x1="-10" y1="-10" x2="10" y2="10" stroke="#E11D48" strokeWidth="2.5" />
            <line x1="10" y1="-10" x2="-10" y2="10" stroke="#E11D48" strokeWidth="2.5" />
            <line x1="-22" y1="-22" x2="-10" y2="-10" stroke="#E11D48" strokeWidth="1.5" strokeDasharray="3 3" />
          </g>

          <g transform="translate(500, 280)">
            <line x1="-10" y1="-10" x2="10" y2="10" stroke="#E11D48" strokeWidth="2.5" />
            <line x1="10" y1="-10" x2="-10" y2="10" stroke="#E11D48" strokeWidth="2.5" />
            <line x1="22" y1="-22" x2="10" y2="-10" stroke="#E11D48" strokeWidth="1.5" strokeDasharray="3 3" />
          </g>

          <text x="330" y="520" fill="#A1A1AA" fontSize="16" fontFamily={fontFamily} textAnchor="middle">
            محافظت از اعتبار و سودآوری فروشگاه آنلاین
          </text>
        </svg>
      </div>
    </div>
  );
};
