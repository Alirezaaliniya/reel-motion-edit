import React from "react";
import { useCurrentFrame } from "remotion";

export const CinematicFrame: React.FC<{
  fontFamily: string;
  categoryTitle?: string;
}> = ({ fontFamily, categoryTitle = "NIAS LOGIN • SECURITY PROTOCOL" }) => {
  const frame = useCurrentFrame();

  const seconds = Math.floor(frame / 30);
  const framesMod = frame % 30;
  const timecode = `00:${String(seconds).padStart(2, "0")}:${String(
    framesMod
  ).padStart(2, "0")}`;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
        boxSizing: "border-box",
        padding: "45px 40px",
      }}
    >
      {/* 4 Glowing Corner Brackets */}
      {/* Top Left */}
      <svg
        style={{ position: "absolute", top: 40, left: 40, width: 45, height: 45 }}
        viewBox="0 0 50 50"
      >
        <path
          d="M 50 4 L 4 4 L 4 50"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3" fill="#38BDF8" />
      </svg>

      {/* Top Right */}
      <svg
        style={{ position: "absolute", top: 40, right: 40, width: 45, height: 45 }}
        viewBox="0 0 50 50"
      >
        <path
          d="M 0 4 L 46 4 L 46 50"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="38" cy="12" r="3" fill="#38BDF8" />
      </svg>

      {/* Bottom Left */}
      <svg
        style={{
          position: "absolute",
          bottom: 40,
          left: 40,
          width: 45,
          height: 45,
        }}
        viewBox="0 0 50 50"
      >
        <path
          d="M 50 46 L 4 46 L 4 0"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="38" r="3" fill="#38BDF8" />
      </svg>

      {/* Bottom Right */}
      <svg
        style={{
          position: "absolute",
          bottom: 40,
          right: 40,
          width: 45,
          height: 45,
        }}
        viewBox="0 0 50 50"
      >
        <path
          d="M 0 46 L 46 46 L 46 0"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="38" cy="38" r="3" fill="#38BDF8" />
      </svg>

      {/* Top Header HUD Bar */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 100,
          right: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "rgba(255,255,255,0.7)",
          fontSize: 18,
          letterSpacing: 2,
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              backgroundColor: "#22C55E",
              boxShadow: "0 0 8px #22C55E",
            }}
          />
          <span style={{ color: "#38BDF8", fontWeight: 700 }}>
            {categoryTitle}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>FPS 30</span>
          <span style={{ color: "#FDE047" }}>{timecode}</span>
        </div>
      </div>

      {/* Subtle Side Measurement Ticks */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: 45,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          opacity: 0.35,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              width: i % 2 === 0 ? 14 : 7,
              height: 1.5,
              backgroundColor: "#38BDF8",
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          top: "40%",
          right: 45,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          opacity: 0.35,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              width: i % 2 === 0 ? 14 : 7,
              height: 1.5,
              backgroundColor: "#38BDF8",
            }}
          />
        ))}
      </div>
    </div>
  );
};
