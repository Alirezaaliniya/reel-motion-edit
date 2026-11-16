import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { InfographicCaption } from "../InfographicCaption";

export const Scene6_DraftingNiasLock: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const drawPanel = interpolate(frame, [0, 25], [1400, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const isLocked = frame >= 38;

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
        badge="فاز ۵: یکپارچگی با ووکامرس"
        accentColor="#D97706"
        headline="قفل هوشمند صفحه پرداخت با نیاس لاگین!"
        highlightWords={["نیاس", "لاگین", "قفل", "ووکامرس"]}
        subtitle="مسدودسازی مستقیم فرآیند پرداخت تا زمان احراز کامل شماره کاربر"
      />

      <div
        style={{
          position: "relative",
          marginTop: 180,
          width: 660,
          height: 600,
          transform: "scale(1.18)",
          transformOrigin: "center center",
        }}
      >
        <svg
          viewBox="0 0 660 600"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Main WooCommerce Settings Blueprint */}
          <rect
            x="70"
            y="60"
            width="520"
            height="460"
            fill="rgba(15, 23, 42, 0.75)"
            stroke="#F1F5F9"
            strokeWidth="1.5"
            strokeDasharray="1600"
            strokeDashoffset={drawPanel}
          />

          {/* Blueprint Title Bar */}
          <line x1="70" y1="120" x2="590" y2="120" stroke="rgba(241, 245, 249, 0.2)" strokeWidth="1" />
          <text x="100" y="98" fill="#94A3B8" fontSize="13" fontFamily="monospace">
            MODULE: NIAS_LOGIN_INTEGRATION // WOOCOMMERCE
          </text>

          {/* Setting Parameter Row */}
          <g transform="translate(100, 180)">
            <text x="460" y="16" fill="#F1F5F9" fontSize="16" fontWeight="bold" fontFamily={fontFamily} textAnchor="end">
              قفل خودکار دکمه ثبت سفارش تا احراز پیامکی:
            </text>
            {/* Toggle Switch */}
            <rect x="20" y="-6" width="56" height="28" rx="14" fill="rgba(217, 119, 6, 0.25)" stroke="#D97706" strokeWidth="1.5" />
            <circle cx="58" cy="8" r="9" fill="#D97706" />
          </g>

          {/* Technical Architecture Flow representation */}
          <g transform="translate(330, 260)">
            <line x1="-180" y1="0" x2="180" y2="0" stroke="rgba(241, 245, 249, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
            <text x="0" y="-12" fill="#94A3B8" fontSize="12" fontFamily="monospace" textAnchor="middle">
              CHECKOUT_GATEWAY_SECURITY_CHECK
            </text>
          </g>

          {/* Locked Checkout Action Bar */}
          <g transform="translate(330, 390)">
            <rect
              x="-200"
              y="-35"
              width="400"
              height="70"
              fill={isLocked ? "url(#hatch-amber)" : "rgba(30, 41, 59, 0.8)"}
              stroke={isLocked ? "#D97706" : "#F1F5F9"}
              strokeWidth="1.5"
            />

            {/* Technical Mechanical Padlock */}
            <g transform="translate(-130, 0)">
              {/* Shackle */}
              <path
                d="M -12 -10 C -12 -24 12 -24 12 -10 L 12 -2"
                fill="none"
                stroke={isLocked ? "#D97706" : "#F1F5F9"}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <rect x="-16" y="-2" width="32" height="28" fill="#0F172A" stroke={isLocked ? "#D97706" : "#F1F5F9"} strokeWidth="2" />
              <circle cx="0" cy="10" r="2.5" fill={isLocked ? "#D97706" : "#F1F5F9"} />
            </g>

            <text x="25" y="8" fill="#F1F5F9" fontSize="18" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              دکمه پرداخت قفل است [LOCKED]
            </text>
          </g>

          {/* Technical Note at bottom */}
          <text x="330" y="485" fill="#94A3B8" fontSize="12" fontFamily="monospace" textAnchor="middle">
            STATUS: RESTRICTED UNTIL PHONE VALIDATION
          </text>
        </svg>
      </div>
    </div>
  );
};
