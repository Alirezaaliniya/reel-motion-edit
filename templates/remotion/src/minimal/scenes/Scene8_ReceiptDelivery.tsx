import React from "react";
import { useCurrentFrame } from "remotion";

export const Scene8_ReceiptDelivery: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const carX = ((frame * 3) % 240) - 120;

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
          {/* Top Receipt Card (White Fill with Black Lines) */}
          <g transform="translate(130, 90)">
            <rect x="0" y="0" width="400" height="160" rx="16" fill="#FAFAFA" stroke="#FFFFFF" strokeWidth="2" />
            <text x="360" y="45" fill="#18181B" fontSize="16" fontWeight="bold" fontFamily={fontFamily} textAnchor="end">
              ✓ شماره مشتری: ۰۹۱۲•••۷۸۴۲ (تایید شده)
            </text>
            <text x="360" y="85" fill="#18181B" fontSize="16" fontWeight="bold" fontFamily={fontFamily} textAnchor="end">
              ✓ پیامک پیگیری: با موفقیت ارسال شد
            </text>
            <text x="360" y="125" fill="#18181B" fontSize="16" fontWeight="bold" fontFamily={fontFamily} textAnchor="end">
              ✓ هماهنگی تحویل: بدون مغایرت و معطلی
            </text>
          </g>

          {/* Ground Baseline */}
          <line x1="80" y1="460" x2="580" y2="460" stroke="#FFFFFF" strokeWidth="2" />

          {/* Minimalist Car Outline (Matching Reference Video Style in ref_frame_50s.jpg) */}
          <g transform={`translate(${330 + carX}, 415)`}>
            {/* Speed trails */}
            <line x1="120" y1="-5" x2="160" y2="-5" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="110" y1="15" x2="180" y2="15" stroke="#FFFFFF" strokeWidth="2" />

            {/* Car Body Curve */}
            <path
              d="M 100 25 L -80 25 C -75 5 -60 -5 -40 -12 C -20 -25 20 -25 50 -10 C 70 -5 90 10 100 25 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            {/* Car Cabin Windows */}
            <path
              d="M -30 -10 C -15 -20 15 -20 40 -8 L 40 8 L -30 8 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {/* Window divider */}
            <line x1="5" y1="-18" x2="5" y2="8" stroke="#FFFFFF" strokeWidth="1.5" />

            {/* Wheels */}
            <circle cx="-40" cy="25" r="14" fill="#000000" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="-40" cy="25" r="5" fill="#FFFFFF" />

            <circle cx="65" cy="25" r="14" fill="#000000" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="65" cy="25" r="5" fill="#FFFFFF" />
          </g>

          <text x="330" y="520" fill="#A1A1AA" fontSize="15" fontFamily={fontFamily} textAnchor="middle">
            تحویل ۱۰۰٪ موفق • بدون مرجوعی کالا
          </text>
        </svg>
      </div>
    </div>
  );
};
