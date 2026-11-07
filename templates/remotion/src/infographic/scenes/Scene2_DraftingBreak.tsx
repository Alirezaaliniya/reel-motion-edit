import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { InfographicCaption } from "../InfographicCaption";

export const Scene2_DraftingBreak: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const drawLine = interpolate(frame, [0, 25], [400, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const isBroken = frame >= 30;

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
        badge="فاز ۲: قطع کانال ارتباطی"
        accentColor="#D97706"
        headline="حالا چطوری باید باهاش ارتباط بگیری؟"
        highlightWords={["چطوری", "ارتباط"]}
        subtitle="کانال تماس مسدود شده و هیچ راه دسترسی مستقیمی به خریدار وجود ندارد"
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
          {/* Construction Blueprint Guidelines */}
          <line x1="50" y1="300" x2="610" y2="300" stroke="#F1F5F9" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.2" />

          {/* Node 1: Store Server / Admin */}
          <g transform="translate(130, 300)">
            <rect
              x="-65"
              y="-55"
              width="130"
              height="110"
              fill="rgba(15, 23, 42, 0.7)"
              stroke="#F1F5F9"
              strokeWidth="1.5"
            />
            {/* Terminal lines */}
            <line x1="-45" y1="-25" x2="45" y2="-25" stroke="#94A3B8" strokeWidth="1" />
            <line x1="-45" y1="-5" x2="25" y2="-5" stroke="#94A3B8" strokeWidth="1" />
            <line x1="-45" y1="15" x2="35" y2="15" stroke="#94A3B8" strokeWidth="1" />
            <text x="0" y="85" fill="#F1F5F9" fontSize="16" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              سرور فروشگاه
            </text>
            <text x="0" y="105" fill="#94A3B8" fontSize="12" fontFamily="monospace" textAnchor="middle">
              NODE_01: STORE
            </text>
          </g>

          {/* Node 2: Customer */}
          <g transform="translate(530, 300)">
            <rect
              x="-65"
              y="-55"
              width="130"
              height="110"
              fill="rgba(15, 23, 42, 0.7)"
              stroke={isBroken ? "#DC2626" : "#F1F5F9"}
              strokeWidth="1.5"
            />
            {/* User Icon */}
            <circle cx="0" cy="-15" r="16" fill="none" stroke={isBroken ? "#DC2626" : "#F1F5F9"} strokeWidth="1.5" />
            <path
              d="M -22 20 C -22 5 22 5 22 20"
              fill="none"
              stroke={isBroken ? "#DC2626" : "#F1F5F9"}
              strokeWidth="1.5"
            />
            <text x="0" y="85" fill="#F1F5F9" fontSize="16" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              مشتری خریدار
            </text>
            <text x="0" y="105" fill="#94A3B8" fontSize="12" fontFamily="monospace" textAnchor="middle">
              NODE_02: CLIENT
            </text>
          </g>

          {/* Circuit Trace Connection Line */}
          {/* Left Segment */}
          <path
            d="M 195 300 L 290 300"
            fill="none"
            stroke={isBroken ? "#DC2626" : "#F1F5F9"}
            strokeWidth="2"
            strokeDasharray="400"
            strokeDashoffset={drawLine}
          />

          {/* Right Segment */}
          <path
            d="M 370 300 L 465 300"
            fill="none"
            stroke={isBroken ? "#DC2626" : "#F1F5F9"}
            strokeWidth="2"
            strokeDasharray="400"
            strokeDashoffset={drawLine}
          />

          {/* Center Schematic Disconnect Symbol */}
          {isBroken ? (
            <g transform="translate(330, 300)">
              {/* Break lightning / cross */}
              <line x1="-30" y1="-30" x2="30" y2="30" stroke="#DC2626" strokeWidth="2.5" />
              <line x1="30" y1="-30" x2="-30" y2="30" stroke="#DC2626" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="42" fill="none" stroke="#DC2626" strokeWidth="1" strokeDasharray="3 3" />

              {/* Technical Callout Tag */}
              <rect
                x="-90"
                y="-90"
                width="180"
                height="32"
                fill="#0F172A"
                stroke="#DC2626"
                strokeWidth="1"
              />
              <text x="0" y="-70" fill="#F87171" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                SIGNAL_LOSS // 0%
              </text>
            </g>
          ) : (
            <line x1="290" y1="300" x2="370" y2="300" stroke="#F1F5F9" strokeWidth="2" />
          )}

          {/* Status Diagnostic Bar Bottom */}
          <g transform="translate(330, 470)">
            <rect
              x="-180"
              y="-18"
              width="360"
              height="36"
              fill="rgba(15, 23, 42, 0.9)"
              stroke="#D97706"
              strokeWidth="1"
            />
            <text x="0" y="6" fill="#F1F5F9" fontSize="14" fontFamily={fontFamily} textAnchor="middle">
              وضعیت: عدم امکان ارسال پیامک یا برقراری تماس
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
