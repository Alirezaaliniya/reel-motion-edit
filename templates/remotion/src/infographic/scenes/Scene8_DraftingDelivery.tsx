import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { InfographicCaption } from "../InfographicCaption";

export const Scene8_DraftingDelivery: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const roadOffset = (frame * 4) % 30;

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
        badge="فاز ۷: یکپارچگی داده و لجستیک"
        accentColor="#10B981"
        headline="داده‌های بی‌نقص مشتری + ارسال روان!"
        highlightWords={["داده‌های", "مشتری", "ارسال"]}
        subtitle="حذف کامل بسته‌های مرجوعی و ایجاد پایگاه داده‌ای تمیز و قابل استناد"
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
          {/* Top Technical Database Record Table */}
          <g transform="translate(100, 90)">
            <rect x="0" y="0" width="460" height="170" fill="rgba(15, 23, 42, 0.85)" stroke="#F1F5F9" strokeWidth="1.5" />

            {/* Table Header */}
            <rect x="0" y="0" width="460" height="34" fill="rgba(241, 245, 249, 0.08)" />
            <text x="230" y="22" fill="#F1F5F9" fontSize="13" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              DATABASE RECORD: ORDER_VERIFIED
            </text>

            {/* Row 1 */}
            <g transform="translate(430, 68)">
              <circle cx="-10" cy="-4" r="6" fill="#10B981" />
              <text x="-25" y="0" fill="#F1F5F9" fontSize="15" fontWeight="bold" fontFamily={fontFamily} textAnchor="end">
                شماره همراه: ۰۹۱۲-XXX-۷۸۴۲ [تایید شده]
              </text>
            </g>

            {/* Row 2 */}
            <g transform="translate(430, 110)">
              <circle cx="-10" cy="-4" r="6" fill="#10B981" />
              <text x="-25" y="0" fill="#F1F5F9" fontSize="15" fontWeight="bold" fontFamily={fontFamily} textAnchor="end">
                کد رهگیری پستی: پیامک شد [موفق]
              </text>
            </g>

            {/* Row 3 */}
            <g transform="translate(430, 150)">
              <circle cx="-10" cy="-4" r="6" fill="#10B981" />
              <text x="-25" y="0" fill="#F1F5F9" fontSize="15" fontWeight="bold" fontFamily={fontFamily} textAnchor="end">
                هماهنگی تحویل: مستقیم و بدون خطا
              </text>
            </g>
          </g>

          {/* Bottom Vehicle Architectural Elevation Blueprint */}
          {/* Road baseline */}
          <line x1="60" y1="460" x2="600" y2="460" stroke="#F1F5F9" strokeWidth="1.5" />
          <line x1="60" y1="480" x2="600" y2="480" stroke="#94A3B8" strokeWidth="1" strokeDasharray="15 15" strokeDashoffset={roadOffset} />

          {/* Delivery Van Elevation */}
          <g transform="translate(330, 400)">
            {/* Van Technical Outline */}
            <path
              d="M 110 25 L -80 25 L -80 -25 L -20 -25 L 25 2 L 110 2 Z"
              fill="rgba(15, 23, 42, 0.9)"
              stroke="#F1F5F9"
              strokeWidth="1.5"
            />
            {/* Windshield */}
            <polygon points="-15,-20 20,0 -15,0" fill="none" stroke="#94A3B8" strokeWidth="1" />

            {/* Wheels */}
            <circle cx="-45" cy="27" r="14" fill="#0B1120" stroke="#D97706" strokeWidth="2" />
            <circle cx="70" cy="27" r="14" fill="#0B1120" stroke="#D97706" strokeWidth="2" />

            {/* Verified Technical Badge on Van Side */}
            <rect x="-40" y="-14" width="70" height="22" fill="#0F172A" stroke="#10B981" strokeWidth="1" />
            <text x="-5" y="1" fill="#34D399" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              VERIFIED
            </text>
          </g>

          {/* Metric Status Label */}
          <text x="330" y="525" fill="#94A3B8" fontSize="12" fontFamily="monospace" textAnchor="middle">
            LOGISTICS SUCCESS RATE: 100% // ZERO RETURNS
          </text>
        </svg>
      </div>
    </div>
  );
};
