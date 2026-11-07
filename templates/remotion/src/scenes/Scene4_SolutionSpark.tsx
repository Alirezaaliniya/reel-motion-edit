import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { PersianCaption } from "../components/PersianCaption";

export const Scene4_SolutionSpark: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  // Switch point at frame 65
  const isSolutionPhase = frame >= 65;

  const camZoom = interpolate(frame, [0, 140], [1, 1.08], {
    extrapolateRight: "clamp",
  });

  // Transition between problem and solution
  const solutionProgress = interpolate(frame, [60, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Spark burst scale
  const burstScale = interpolate(frame, [65, 100], [0.2, 2.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const burstOpacity = interpolate(frame, [65, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Key rotation and floating
  const keyFloat = interpolate(Math.sin(frame * 0.1), [-1, 1], [-8, 8]);

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
        badge={isSolutionPhase ? "نقطه تحول هوشمند" : "بن‌بست کامل"}
        badgeColor={isSolutionPhase ? "#10B981" : "#EF4444"}
        headline={
          isSolutionPhase
            ? "اما راه حلش فوق‌العاده ساده‌ست!"
            : "عملاً هیچ راهی برای پیگیری نداری..."
        }
        highlightWords={
          isSolutionPhase ? ["راه", "حلش", "ساده‌ست"] : ["هیچ", "راهی", "نداری"]
        }
        subtitle={
          isSolutionPhase
            ? "یک راهکار اصولی و قطعی برای همیشه"
            : "نه شماره درستی ثبت شده، نه راه تماسی باقی مانده!"
        }
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
          {/* Phase 1: Problem / Dead-end wall */}
          <g
            style={{
              opacity: 1 - solutionProgress,
              transform: `scale(${1 - solutionProgress * 0.3})`,
              transformOrigin: "300px 300px",
            }}
          >
            {/* Labyrinth / Dead End Lines */}
            <circle
              cx="300"
              cy="300"
              r="180"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="12 12"
              opacity="0.4"
            />
            {/* Red Stop Shield */}
            <polygon
              points="300,160 410,220 410,380 300,440 190,380 190,220"
              fill="rgba(239, 68, 68, 0.15)"
              stroke="#EF4444"
              strokeWidth="3.5"
              style={{ filter: "drop-shadow(0 0 16px #EF4444)" }}
            />
            {/* Deadlock cross icon */}
            <line x1="260" y1="260" x2="340" y2="340" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
            <line x1="340" y1="260" x2="260" y2="340" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
          </g>

          {/* Flash burst at frame 65 */}
          {frame >= 65 && (
            <circle
              cx="300"
              cy="300"
              r={120 * burstScale}
              fill="none"
              stroke="#34D399"
              strokeWidth="4"
              opacity={burstOpacity}
            />
          )}

          {/* Phase 2: Solution Key & Golden Rays */}
          <g
            style={{
              opacity: solutionProgress,
              transform: `scale(${solutionProgress}) translate(0px, ${keyFloat}px)`,
              transformOrigin: "300px 300px",
            }}
          >
            {/* Radiant Rotating Aura Rings */}
            <circle
              cx="300"
              cy="300"
              r="190"
              fill="none"
              stroke="#34D399"
              strokeWidth="2"
              strokeDasharray="20 15 5 15"
              style={{ filter: "drop-shadow(0 0 16px #34D399)" }}
            />
            <circle
              cx="300"
              cy="300"
              r="140"
              fill="rgba(16, 185, 129, 0.1)"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeDasharray="8 8"
            />

            {/* Glowing Golden / Emerald Key of Solution */}
            <g
              transform="translate(300, 300) rotate(-45)"
              style={{ filter: "drop-shadow(0 0 24px #34D399)" }}
            >
              {/* Key Head Ring */}
              <circle cx="-60" cy="0" r="38" fill="none" stroke="#FDE047" strokeWidth="5" />
              <circle cx="-60" cy="0" r="18" fill="none" stroke="#34D399" strokeWidth="3" />

              {/* Key Shaft */}
              <line x1="-22" y1="0" x2="80" y2="0" stroke="#FDE047" strokeWidth="6" strokeLinecap="round" />

              {/* Key Teeth */}
              <line x1="50" y1="0" x2="50" y2="28" stroke="#FDE047" strokeWidth="5" strokeLinecap="round" />
              <line x1="72" y1="0" x2="72" y2="22" stroke="#FDE047" strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* Sparkles around key */}
            <g transform="translate(300, 300)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
                <line
                  key={idx}
                  x1="0"
                  y1="-110"
                  x2="0"
                  y2="-130"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform={`rotate(${angle})`}
                  style={{ filter: "drop-shadow(0 0 8px #38BDF8)" }}
                />
              ))}
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
