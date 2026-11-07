import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export const Scene3_Parcel: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const isAlert = frame >= 25;

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
          {/* Ground Line */}
          <line x1="100" y1="460" x2="500" y2="460" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Minimal 3D Box Outline */}
          <g transform="translate(300, 310)">
            {/* Top Plane */}
            <polygon
              points="0,-100 120,-40 0,20 -120,-40"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            {/* Left Plane */}
            <polygon
              points="-120,-40 0,20 0,140 -120,80"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            {/* Right Plane */}
            <polygon
              points="0,20 120,-40 120,80 0,140"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />

            {/* Tape Line */}
            <line x1="-50" y1="-70" x2="50" y2="-10" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="6 4" />

            {/* Warning Stamp on Box Face */}
            {isAlert && (
              <g transform="translate(60, 50) rotate(-25)">
                <rect x="-45" y="-16" width="90" height="32" rx="4" fill="none" stroke="#E11D48" strokeWidth="2" />
                <text x="0" y="5" fill="#E11D48" fontSize="13" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
                  مشکل در ارسال
                </text>
              </g>
            )}
          </g>

          {/* Alert Icon Floating Above */}
          {isAlert && (
            <g transform="translate(300, 140)">
              <circle cx="0" cy="0" r="28" fill="none" stroke="#E11D48" strokeWidth="2" strokeDasharray="4 4" />
              <text x="0" y="10" fill="#E11D48" fontSize="26" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                !
              </text>
            </g>
          )}

          {/* Label under box */}
          <text x="300" y="520" fill="#A1A1AA" fontSize="16" fontFamily={fontFamily} textAnchor="middle">
            نیاز به هماهنگی فوری با مشتری جهت ویرایش سفارش
          </text>
        </svg>
      </div>
    </div>
  );
};
