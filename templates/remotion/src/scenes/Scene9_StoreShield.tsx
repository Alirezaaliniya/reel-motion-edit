import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { PersianCaption } from "../components/PersianCaption";

export const Scene9_StoreShield: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const camZoom = interpolate(frame, [0, 150], [1, 1.07], {
    extrapolateRight: "clamp",
  });

  // Shield pulsing energy
  const shieldGlow = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.7, 1]
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
        badge="محافظت از کسب‌وکار آنلاین"
        badgeColor="#38BDF8"
        headline="جلوی کلی دردسر و خسارت مالی رو بگیر!"
        highlightWords={["فروشگاه", "دردسر", "خسارت"]}
        subtitle="حذف سفارش‌های فیک، شماره‌های خاموش و هزینه‌های اضافه ارسال"
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
          {/* Ground Grid Platform */}
          <ellipse
            cx="330"
            cy="470"
            rx="240"
            ry="60"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeDasharray="10 8"
            opacity="0.4"
          />

          {/* Futuristic E-Commerce Storefront Line Art */}
          <g transform="translate(330, 360)">
            {/* Store Building Base */}
            <rect
              x="-120"
              y="-100"
              width="240"
              height="150"
              rx="12"
              fill="rgba(15, 23, 42, 0.9)"
              stroke="#38BDF8"
              strokeWidth="2.5"
            />

            {/* Modern Store Canopy Awning */}
            <polygon
              points="-140,-100 140,-100 120,-60 -120,-60"
              fill="rgba(30, 58, 138, 0.4)"
              stroke="#F59E0B"
              strokeWidth="2.5"
            />
            {/* Awning stripes */}
            <line x1="-70" y1="-100" x2="-60" y2="-60" stroke="#F59E0B" strokeWidth="2" />
            <line x1="0" y1="-100" x2="0" y2="-60" stroke="#F59E0B" strokeWidth="2" />
            <line x1="70" y1="-100" x2="60" y2="-60" stroke="#F59E0B" strokeWidth="2" />

            {/* Entrance Doorway with Light */}
            <rect
              x="-35"
              y="-10"
              width="70"
              height="60"
              rx="4"
              fill="rgba(56, 189, 248, 0.15)"
              stroke="#38BDF8"
              strokeWidth="2"
            />

            {/* Display Windows */}
            <rect x="-100" y="-30" width="45" height="50" rx="4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <rect x="55" y="-30" width="45" height="50" rx="4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

            {/* Store Signboard / Logo on Top */}
            <g transform="translate(0, -125)">
              <rect
                x="-80"
                y="-18"
                width="160"
                height="36"
                rx="18"
                fill="rgba(15, 23, 42, 0.95)"
                stroke="#38BDF8"
                strokeWidth="2"
                style={{ filter: "drop-shadow(0 0 10px #38BDF8)" }}
              />
              <text
                x="0"
                y="6"
                fill="#38BDF8"
                fontSize="15"
                fontWeight="900"
                fontFamily={fontFamily}
                textAnchor="middle"
              >
                ONLINE STORE
              </text>
            </g>
          </g>

          {/* Protective Forcefield Energy Shield Dome */}
          <g style={{ opacity: shieldGlow }}>
            <path
              d="M 110 470 A 220 220 0 0 1 550 470"
              fill="rgba(56, 189, 248, 0.08)"
              stroke="#38BDF8"
              strokeWidth="3.5"
              style={{ filter: "drop-shadow(0 0 20px #38BDF8)" }}
            />
            {/* Hexagon pattern on shield */}
            <circle
              cx="330"
              cy="310"
              r="200"
              fill="none"
              stroke="#34D399"
              strokeWidth="1.5"
              strokeDasharray="25 15 5 15"
              opacity="0.6"
            />
          </g>

          {/* Deflected Error Sparks bouncing off shield */}
          <g transform="translate(160, 260)">
            <circle cx="0" cy="0" r="12" fill="rgba(239, 68, 68, 0.3)" stroke="#EF4444" strokeWidth="2" />
            <line x1="-5" y1="-5" x2="5" y2="5" stroke="#EF4444" strokeWidth="2" />
            <line x1="5" y1="-5" x2="-5" y2="5" stroke="#EF4444" strokeWidth="2" />
            {/* Deflection angle rays */}
            <line x1="-20" y1="-20" x2="-8" y2="-8" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" />
          </g>

          <g transform="translate(500, 270)">
            <circle cx="0" cy="0" r="12" fill="rgba(239, 68, 68, 0.3)" stroke="#EF4444" strokeWidth="2" />
            <line x1="-5" y1="-5" x2="5" y2="5" stroke="#EF4444" strokeWidth="2" />
            <line x1="5" y1="-5" x2="-5" y2="5" stroke="#EF4444" strokeWidth="2" />
            <line x1="20" y1="-20" x2="8" y2="-8" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" />
          </g>
        </svg>
      </div>
    </div>
  );
};
