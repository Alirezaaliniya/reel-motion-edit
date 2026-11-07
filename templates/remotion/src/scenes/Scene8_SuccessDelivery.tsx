import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { PersianCaption } from "../components/PersianCaption";

export const Scene8_SuccessDelivery: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const camZoom = interpolate(frame, [0, 165], [1, 1.07], {
    extrapolateRight: "clamp",
  });

  // Road grid animation
  const roadOffset = (frame * 6) % 40;

  // Van bounce
  const vanBounce = Math.sin(frame * 0.4) * 2;

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
        badge="نتیجه نهایی شگفت‌انگیز"
        badgeColor="#10B981"
        headline="اطلاعات دقیق مشتری + پیگیری آسان!"
        highlightWords={["دقیق", "مشتری", "پیگیری"]}
        subtitle="دیگر هیچ بسته‌ای به دلیل شماره اشتباه مرجوع نمی‌شود"
      />

      <div
        style={{
          position: "relative",
          marginTop: 180,
          width: 700,
          height: 600,
        }}
      >
        <svg
          viewBox="0 0 700 600"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Top Panel: Verified Customer Card */}
          <g transform="translate(140, 100)">
            <rect
              x="0"
              y="0"
              width="420"
              height="180"
              rx="18"
              fill="rgba(15, 23, 42, 0.85)"
              stroke="#10B981"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 16px rgba(16, 185, 129, 0.25))" }}
            />

            {/* Row 1 */}
            <g transform="translate(390, 45)">
              <circle cx="-15" cy="-5" r="9" fill="#10B981" />
              <path d="M -19 -5 L -16 -2 L -11 -8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
              <text x="-40" y="0" fill="#FFFFFF" fontSize="17" fontWeight="bold" fontFamily={fontFamily} textAnchor="end">
                شماره همراه: ۰۹۱۲•••۷۸۴۲ (احراز هویت شده)
              </text>
            </g>

            {/* Row 2 */}
            <g transform="translate(390, 95)">
              <circle cx="-15" cy="-5" r="9" fill="#10B981" />
              <path d="M -19 -5 L -16 -2 L -11 -8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
              <text x="-40" y="0" fill="#FFFFFF" fontSize="17" fontWeight="bold" fontFamily={fontFamily} textAnchor="end">
                ارسال پیامک وضعیت سفارش: موفق و آنی
              </text>
            </g>

            {/* Row 3 */}
            <g transform="translate(390, 145)">
              <circle cx="-15" cy="-5" r="9" fill="#10B981" />
              <path d="M -19 -5 L -16 -2 L -11 -8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
              <text x="-40" y="0" fill="#FFFFFF" fontSize="17" fontWeight="bold" fontFamily={fontFamily} textAnchor="end">
                تماس و هماهنگی پیک/پست: بدون معطلی
              </text>
            </g>
          </g>

          {/* Bottom Stage: Speedy Delivery Van on Neon Grid Road */}
          {/* Neon Road */}
          <line x1="60" y1="480" x2="640" y2="480" stroke="#38BDF8" strokeWidth="3" style={{ filter: "drop-shadow(0 0 10px #38BDF8)" }} />
          {/* Road dash lines moving */}
          <line
            x1="60"
            y1="510"
            x2="640"
            y2="510"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="2"
            strokeDasharray="25 25"
            strokeDashoffset={roadOffset}
          />

          {/* Delivery Van Moving Body */}
          <g transform={`translate(350, ${410 + vanBounce})`}>
            {/* Speed trails behind van */}
            <line x1="160" y1="-10" x2="230" y2="-10" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="10 10" />
            <line x1="150" y1="15" x2="260" y2="15" stroke="#34D399" strokeWidth="2.5" strokeDasharray="15 10" />

            {/* Van Body */}
            <path
              d="M 120 30 L -90 30 L -90 -25 L -30 -25 L 20 5 L 120 5 Z"
              fill="rgba(15, 23, 42, 0.95)"
              stroke="#38BDF8"
              strokeWidth="3"
              style={{ filter: "drop-shadow(0 0 14px rgba(56, 189, 248, 0.4))" }}
            />
            {/* Windshield */}
            <polygon points="-25,-20 15,2 -25,2" fill="none" stroke="#38BDF8" strokeWidth="2" />

            {/* Checkmark badge on van side */}
            <circle cx="50" cy="18" r="14" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="2" />
            <path d="M 44 18 L 48 22 L 56 14" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

            {/* Wheels */}
            {/* Front Wheel */}
            <g transform="translate(-50, 32)">
              <circle cx="0" cy="0" r="16" fill="#060913" stroke="#F59E0B" strokeWidth="3" />
              <circle cx="0" cy="0" r="6" fill="#F59E0B" />
            </g>
            {/* Rear Wheel */}
            <g transform="translate(80, 32)">
              <circle cx="0" cy="0" r="16" fill="#060913" stroke="#F59E0B" strokeWidth="3" />
              <circle cx="0" cy="0" r="6" fill="#F59E0B" />
            </g>
          </g>

          {/* Guaranteed Delivery Tag */}
          <g transform="translate(350, 560)">
            <rect
              x="-150"
              y="-18"
              width="300"
              height="36"
              rx="18"
              fill="rgba(16, 185, 129, 0.15)"
              stroke="#10B981"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="6"
              fill="#34D399"
              fontSize="17"
              fontWeight="bold"
              fontFamily={fontFamily}
              textAnchor="middle"
            >
              ۱۰۰٪ ارسال موفق بدون مرجوعی
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
