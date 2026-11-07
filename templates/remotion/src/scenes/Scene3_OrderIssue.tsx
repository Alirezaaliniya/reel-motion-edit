import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { PersianCaption } from "../components/PersianCaption";

export const Scene3_OrderIssue: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const camZoom = interpolate(frame, [0, 90], [1, 1.06], {
    extrapolateRight: "clamp",
  });

  const boxY = interpolate(frame, [0, 20], [-30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const alertPulse = interpolate(
    Math.sin(frame * 0.2),
    [-1, 1],
    [0.9, 1.1]
  );

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
        badge="چالش ارسال و انبار"
        badgeColor="#EF4444"
        headline="مخصوصاً وقتی سفارش مشکل داشته باشه!"
        highlightWords={["سفارش", "مشکل"]}
        subtitle="اتمام موجودی، تغییر آدرس، یا نیاز به هماهنگی فوری با مشتری..."
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
          {/* Isometric Shadow Platform */}
          <ellipse
            cx="300"
            cy="460"
            rx="180"
            ry="40"
            fill="none"
            stroke="#EF4444"
            strokeWidth="1.5"
            strokeDasharray="8 6"
            opacity="0.3"
          />

          {/* 3D Isometric Line Art Parcel / Box */}
          <g transform={`translate(300, ${320 + boxY})`}>
            {/* Box Top Face */}
            <polygon
              points="0,-120 120,-60 0,0 -120,-60"
              fill="rgba(30, 41, 59, 0.7)"
              stroke="#F59E0B"
              strokeWidth="3"
              style={{ filter: "drop-shadow(0 0 10px #F59E0B44)" }}
            />
            {/* Box Left Face */}
            <polygon
              points="-120,-60 0,0 0,110 -120,50"
              fill="rgba(15, 23, 42, 0.85)"
              stroke="#F59E0B"
              strokeWidth="3"
            />
            {/* Box Right Face */}
            <polygon
              points="0,0 120,-60 120,50 0,110"
              fill="rgba(10, 16, 32, 0.95)"
              stroke="#F59E0B"
              strokeWidth="3"
            />

            {/* Tape across box top */}
            <line x1="-50" y1="-85" x2="50" y2="-35" stroke="#FDE047" strokeWidth="6" strokeDasharray="6 4" />

            {/* Caution Stamp on Box Front */}
            <g transform="translate(60, 50) rotate(-26)">
              <rect
                x="-40"
                y="-14"
                width="80"
                height="28"
                rx="4"
                fill="rgba(239, 68, 68, 0.2)"
                stroke="#EF4444"
                strokeWidth="2"
              />
              <text
                x="0"
                y="5"
                fill="#EF4444"
                fontSize="12"
                fontWeight="900"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                HOLD / ERROR
              </text>
            </g>
          </g>

          {/* Floating Urgent Warning Hologram Badge */}
          <g
            transform={`translate(300, 200) scale(${alertPulse})`}
            style={{ filter: "drop-shadow(0 0 20px #EF4444)" }}
          >
            {/* Hexagonal Alert Shield */}
            <polygon
              points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30"
              fill="rgba(239, 68, 68, 0.25)"
              stroke="#EF4444"
              strokeWidth="3.5"
            />
            {/* Exclamation point */}
            <line x1="0" y1="-26" x2="0" y2="10" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
            <circle cx="0" cy="26" r="3.5" fill="#FFFFFF" />
          </g>

          {/* Broken Delivery Route Line */}
          <path
            d="M 120 480 C 180 520, 240 450, 300 480 C 360 510, 420 460, 480 480"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2.5"
            strokeDasharray="6 8"
          />
          {/* Crossed out destination pin */}
          <g transform="translate(480, 480)">
            <circle cx="0" cy="-20" r="14" fill="rgba(239,68,68,0.3)" stroke="#EF4444" strokeWidth="2" />
            <line x1="-8" y1="-28" x2="8" y2="-12" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="8" y1="-28" x2="-8" y2="-12" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  );
};
