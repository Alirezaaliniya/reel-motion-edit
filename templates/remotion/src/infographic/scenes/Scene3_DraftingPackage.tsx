import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { InfographicCaption } from "../InfographicCaption";

export const Scene3_DraftingPackage: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const drawBox = interpolate(frame, [0, 30], [800, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const stampOpacity = interpolate(frame, [35, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
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
      }}
    >
      <InfographicCaption
        fontFamily={fontFamily}
        badge="فاز ۳: بحران ارسال مرسوله"
        accentColor="#DC2626"
        headline="مخصوصاً وقتی سفارش مشکلی داشته باشه!"
        highlightWords={["سفارش", "مشکلی"]}
        subtitle="عدم هماهنگی آدرس، کسری موجودی انبار یا نیاز به پیگیری فوری"
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
          {/* Isometric Technical Parcel Blueprint */}
          <g transform="translate(300, 300) scale(1.35)">
            {/* Top Plane */}
            <polygon
              points="0,-120 130,-50 0,20 -130,-50"
              fill="rgba(30, 41, 59, 0.5)"
              stroke="#F1F5F9"
              strokeWidth="1.5"
              strokeDasharray="800"
              strokeDashoffset={drawBox}
            />
            {/* Left Plane with Hatching */}
            <polygon
              points="-130,-50 0,20 0,140 -130,70"
              fill="url(#hatch-gray)"
              stroke="#F1F5F9"
              strokeWidth="1.5"
            />
            {/* Right Plane */}
            <polygon
              points="0,20 130,-50 130,70 0,140"
              fill="rgba(15, 23, 42, 0.8)"
              stroke="#F1F5F9"
              strokeWidth="1.5"
            />

            {/* Dimension Lines (Technical Callouts) */}
            <line x1="-150" y1="-50" x2="-150" y2="70" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
            <text x="-165" y="15" fill="#94A3B8" fontSize="12" fontFamily="monospace" textAnchor="end">
              H: 200mm
            </text>

            <line x1="0" y1="160" x2="130" y2="90" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
            <text x="75" y="145" fill="#94A3B8" fontSize="12" fontFamily="monospace" textAnchor="start">
              W: 350mm
            </text>

            {/* Caution Hatch Stamp (Frame 35+) */}
            <g transform="translate(65, 40) rotate(-28)" opacity={stampOpacity}>
              <rect
                x="-55"
                y="-18"
                width="110"
                height="36"
                fill="rgba(220, 38, 38, 0.2)"
                stroke="#DC2626"
                strokeWidth="1.5"
              />
              <text x="0" y="5" fill="#EF4444" fontSize="13" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                [ HOLD: ERROR ]
              </text>
            </g>
          </g>

          {/* Delivery Route Blocked Node (Bottom) */}
          <g transform="translate(300, 490)">
            <line x1="-180" y1="0" x2="180" y2="0" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="6 6" />
            <rect
              x="-120"
              y="-16"
              width="240"
              height="32"
              fill="#0F172A"
              stroke="#DC2626"
              strokeWidth="1"
            />
            <text x="0" y="5" fill="#F87171" fontSize="13" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              مسیر ارسال: متوقف در انبار مرکزی
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
