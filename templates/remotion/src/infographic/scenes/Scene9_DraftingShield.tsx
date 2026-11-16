import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { InfographicCaption } from "../InfographicCaption";

export const Scene9_DraftingShield: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const drawStore = interpolate(frame, [0, 25], [1000, 0], {
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
      }}
    >
      <InfographicCaption
        fontFamily={fontFamily}
        badge="فاز ۸: بازدهی مالی و پایداری"
        accentColor="#D97706"
        headline="جلوی کلی دردسر و خسارت مالی رو بگیر!"
        highlightWords={["فروشگاه", "دردسر", "خسارت"]}
        subtitle="حذف اتلاف هزینه‌های پستی، بسته‌بندی بیهوده و زمان کارشناسان پشتیبانی"
      />

      <div
        style={{
          position: "relative",
          marginTop: 180,
          width: 660,
          height: 600,
        }}
      >
        <svg
          viewBox="0 0 660 600"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Architectural Elevation of Storefront */}
          <g transform="translate(330, 310)">
            {/* Store Body */}
            <rect
              x="-120"
              y="-100"
              width="240"
              height="150"
              fill="rgba(15, 23, 42, 0.85)"
              stroke="#F1F5F9"
              strokeWidth="1.5"
              strokeDasharray="1000"
              strokeDashoffset={drawStore}
            />

            {/* Architectural Canopy */}
            <polygon
              points="-140,-100 140,-100 120,-60 -120,-60"
              fill="rgba(217, 119, 6, 0.2)"
              stroke="#D97706"
              strokeWidth="1.5"
            />
            <line x1="-70" y1="-100" x2="-60" y2="-60" stroke="#D97706" strokeWidth="1" />
            <line x1="0" y1="-100" x2="0" y2="-60" stroke="#D97706" strokeWidth="1" />
            <line x1="70" y1="-100" x2="60" y2="-60" stroke="#D97706" strokeWidth="1" />

            {/* Doorway */}
            <rect x="-30" y="-10" width="60" height="60" fill="none" stroke="#F1F5F9" strokeWidth="1" />

            {/* Store Name Block */}
            <rect x="-70" y="-125" width="140" height="25" fill="#0F172A" stroke="#F1F5F9" strokeWidth="1" />
            <text x="0" y="-108" fill="#F1F5F9" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              ECOMMERCE_SYSTEM
            </text>
          </g>

          {/* Technical Protective Perimeter (Boundary Line) */}
          <ellipse
            cx="330"
            cy="360"
            rx="250"
            ry="110"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="8 6"
          />

          {/* Infographic KPI Metrics Cards (Bottom) */}
          <g transform="translate(330, 480)">
            {/* Card 1 */}
            <g transform="translate(-160, 0)">
              <rect x="-70" y="-25" width="140" height="50" fill="#0F172A" stroke="#10B981" strokeWidth="1" />
              <text x="0" y="-5" fill="#34D399" fontSize="16" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                -100%
              </text>
              <text x="0" y="16" fill="#94A3B8" fontSize="11" fontFamily={fontFamily} textAnchor="middle">
                سفارش‌های مخدوش
              </text>
            </g>

            {/* Card 2 */}
            <g transform="translate(0, 0)">
              <rect x="-70" y="-25" width="140" height="50" fill="#0F172A" stroke="#D97706" strokeWidth="1" />
              <text x="0" y="-5" fill="#F59E0B" fontSize="16" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                0 Tomans
              </text>
              <text x="0" y="16" fill="#94A3B8" fontSize="11" fontFamily={fontFamily} textAnchor="middle">
                خسارت مرجوعی
              </text>
            </g>

            {/* Card 3 */}
            <g transform="translate(160, 0)">
              <rect x="-70" y="-25" width="140" height="50" fill="#0F172A" stroke="#10B981" strokeWidth="1" />
              <text x="0" y="-5" fill="#34D399" fontSize="16" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                100%
              </text>
              <text x="0" y="16" fill="#94A3B8" fontSize="11" fontFamily={fontFamily} textAnchor="middle">
                صحت شماره‌ها
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
