import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { InfographicCaption } from "../InfographicCaption";

export const Scene1_DraftingOrder: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  // Line drawing offset for smartphone
  const drawPhone = interpolate(frame, [0, 35], [1200, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Dimension lines drawing
  const drawDims = interpolate(frame, [15, 40], [300, 0], {
    extrapolateRight: "clamp",
  });

  // Error trigger at frame 45
  const isError = frame >= 45;
  const errorOpacity = interpolate(frame, [45, 60], [0, 1], {
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
        badge="فاز ۱: ثبت سفارش در فروشگاه"
        accentColor={isError ? "#DC2626" : "#D97706"}
        headline="مشتری خرید کرد، اما شماره اشتباه است!"
        highlightWords={["خرید", "اشتباه"]}
        subtitle="عدم اعتبارسنجی در لحظه ثبت سفارش باعث ورود داده‌های ناقص می‌شود"
      />

      {/* Main Drafting Canvas */}
      <div
        style={{
          position: "relative",
          marginTop: 180,
          width: 600,
          height: 680,
        }}
      >
        <svg
          viewBox="0 0 600 680"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Construction Blueprint Guidelines (Faint) */}
          <line x1="80" y1="20" x2="80" y2="650" stroke="#F1F5F9" strokeWidth="0.75" strokeDasharray="3 6" opacity="0.25" />
          <line x1="520" y1="20" x2="520" y2="650" stroke="#F1F5F9" strokeWidth="0.75" strokeDasharray="3 6" opacity="0.25" />

          {/* Dimension Line (Top: 75.00 mm) */}
          <g opacity="0.6">
            <line x1="120" y1="50" x2="480" y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="300" strokeDashoffset={drawDims} markerStart="url(#tech-dot)" markerEnd="url(#tech-dot)" />
            <text x="300" y="42" fill="#F1F5F9" fontSize="13" fontFamily="monospace" textAnchor="middle">
              DIM: 75.00 mm
            </text>
          </g>

          {/* Smartphone Technical Drawing Body */}
          <rect
            x="120"
            y="70"
            width="360"
            height="540"
            rx="20"
            fill="rgba(15, 23, 42, 0.6)"
            stroke={isError ? "#DC2626" : "#F1F5F9"}
            strokeWidth="2"
            strokeDasharray="1800"
            strokeDashoffset={drawPhone}
          />

          {/* Screen Inner Bezel */}
          <rect
            x="140"
            y="110"
            width="320"
            height="460"
            fill="none"
            stroke="rgba(241, 245, 249, 0.2)"
            strokeWidth="1"
            strokeDasharray="6 4"
          />

          {/* Cart Blueprint Icon */}
          <g transform="translate(300, 190)">
            <circle cx="0" cy="0" r="38" fill="none" stroke="#D97706" strokeWidth="1.5" strokeDasharray="4 4" />
            <path
              d="M -16 -8 L -10 -8 L -2 12 L 14 12 L 18 -2 L -6 -2"
              fill="none"
              stroke="#D97706"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="0" cy="18" r="2.5" fill="#D97706" />
            <circle cx="12" cy="18" r="2.5" fill="#D97706" />
          </g>

          {/* Order Details Line Item */}
          <g transform="translate(300, 260)">
            <text x="0" y="0" fill="#94A3B8" fontSize="14" fontFamily="monospace" textAnchor="middle">
              CHECKOUT // ORDER #48920
            </text>
            <line x1="-100" y1="12" x2="100" y2="12" stroke="rgba(241, 245, 249, 0.2)" strokeWidth="1" />
          </g>

          {/* Phone Input Technical Box */}
          <g transform="translate(300, 360)">
            <rect
              x="-130"
              y="-35"
              width="260"
              height="70"
              fill={isError ? "url(#hatch-red)" : "rgba(30, 41, 59, 0.5)"}
              stroke={isError ? "#DC2626" : "#F1F5F9"}
              strokeWidth="1.5"
            />
            <text x="110" y="-12" fill="#94A3B8" fontSize="12" fontFamily={fontFamily} textAnchor="end">
              شماره تماس وارد شده:
            </text>
            <text
              x="0"
              y="20"
              fill={isError ? "#FCA5A5" : "#F1F5F9"}
              fontSize="20"
              fontWeight="bold"
              fontFamily="monospace"
              letterSpacing="3"
              textAnchor="middle"
            >
              {isError ? "0912-ERR-????" : "0912 345 6789"}
            </text>
          </g>

          {/* Error Callout Leader Line and Annotation */}
          {isError && (
            <g opacity={errorOpacity} transform="translate(300, 480)">
              {/* Technical Callout Leader Line */}
              <polyline
                points="0,-45 40,-15 150,-15"
                fill="none"
                stroke="#DC2626"
                strokeWidth="1.5"
                markerStart="url(#tech-dot)"
              />
              <rect
                x="-120"
                y="-5"
                width="240"
                height="34"
                fill="rgba(220, 38, 38, 0.15)"
                stroke="#DC2626"
                strokeWidth="1"
              />
              <text
                x="0"
                y="18"
                fill="#F87171"
                fontSize="14"
                fontWeight="bold"
                fontFamily={fontFamily}
                textAnchor="middle"
              >
                خطای احراز: شماره نامعتبر است!
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
