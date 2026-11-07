import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { InfographicCaption } from "../InfographicCaption";

export const Scene7_DraftingWorkflow: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const isUnlocked = frame >= 45;
  const openShackleAngle = interpolate(frame, [45, 60], [0, -32], {
    extrapolateLeft: "clamp",
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
        badge="فاز ۶: فرآیند مرحله‌به‌مرحله"
        accentColor="#10B981"
        headline="ثبت نهایی سفارش، مشروط به تایید شماره!"
        highlightWords={["ثبت", "تایید", "شماره"]}
        subtitle="کاربر ابتدا شماره واقعی خود را تایید می‌کند، سپس مجاز به پرداخت می‌شود"
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
          {/* Horizontal Technical Process Architecture */}
          {/* Step 1 */}
          <g transform="translate(130, 200)">
            <rect x="-55" y="-50" width="110" height="100" fill="#0F172A" stroke="#F1F5F9" strokeWidth="1.5" />
            <text x="0" y="-15" fill="#D97706" fontSize="13" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              STEP 01
            </text>
            <text x="0" y="15" fill="#F1F5F9" fontSize="14" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              ورود شماره
            </text>
          </g>

          {/* Process arrow 1 -> 2 */}
          <line x1="185" y1="200" x2="275" y2="200" stroke="#F1F5F9" strokeWidth="1.5" markerEnd="url(#tech-arrow-chalk)" />

          {/* Step 2 */}
          <g transform="translate(330, 200)">
            <rect x="-55" y="-50" width="110" height="100" fill="#0F172A" stroke="#F1F5F9" strokeWidth="1.5" />
            <text x="0" y="-15" fill="#D97706" fontSize="13" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              STEP 02
            </text>
            <text x="0" y="15" fill="#F1F5F9" fontSize="14" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              تایید پیامک
            </text>
          </g>

          {/* Process arrow 2 -> 3 */}
          <line x1="385" y1="200" x2="475" y2="200" stroke={isUnlocked ? "#10B981" : "#F1F5F9"} strokeWidth="1.5" markerEnd={isUnlocked ? "url(#tech-arrow-green)" : "url(#tech-arrow-chalk)"} />

          {/* Step 3 */}
          <g transform="translate(530, 200)">
            <rect x="-55" y="-50" width="110" height="100" fill={isUnlocked ? "rgba(16, 185, 129, 0.15)" : "#0F172A"} stroke={isUnlocked ? "#10B981" : "#F1F5F9"} strokeWidth="1.5" />
            <text x="0" y="-15" fill={isUnlocked ? "#34D399" : "#94A3B8"} fontSize="13" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              STEP 03
            </text>
            <text x="0" y="15" fill={isUnlocked ? "#34D399" : "#F1F5F9"} fontSize="14" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              آزادسازی
            </text>
          </g>

          {/* Unlocked Gate Status Panel */}
          <g transform="translate(330, 390)">
            <rect
              x="-220"
              y="-35"
              width="440"
              height="70"
              fill={isUnlocked ? "rgba(16, 185, 129, 0.15)" : "rgba(15, 23, 42, 0.8)"}
              stroke={isUnlocked ? "#10B981" : "#F1F5F9"}
              strokeWidth="1.5"
            />

            {/* Unlocking Padlock Graphic */}
            <g transform="translate(-150, 0)">
              <path
                d="M -10 -6 C -10 -20 10 -20 10 -6"
                fill="none"
                stroke={isUnlocked ? "#10B981" : "#F1F5F9"}
                strokeWidth="3.5"
                strokeLinecap="round"
                transform={`rotate(${openShackleAngle}, 10, -6)`}
              />
              <rect x="-14" y="-4" width="28" height="24" fill="#0F172A" stroke={isUnlocked ? "#10B981" : "#F1F5F9"} strokeWidth="2" />
            </g>

            <text x="25" y="8" fill={isUnlocked ? "#34D399" : "#F1F5F9"} fontSize="18" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              {isUnlocked
                ? "قفل پرداخت باز شد • سفارش تایید گردید"
                : "در انتظار دریافت تاییدیه شماره..."}
            </text>
          </g>

          {/* Verification Hash Tag */}
          <text x="330" y="480" fill="#94A3B8" fontSize="12" fontFamily="monospace" textAnchor="middle">
            AUTH_HASH: 9A81-VERIFIED // LATENCY: 0.2s
          </text>
        </svg>
      </div>
    </div>
  );
};
