import React from "react";
import { useCurrentFrame } from "remotion";

export const DraftingFrame: React.FC<{
  fontFamily: string;
  figureNumber?: string;
  topicTitle?: string;
}> = ({
  fontFamily,
  figureNumber = "FIG 01.0",
  topicTitle = "NIAS AUTHENTICATION BLUEPRINT",
}) => {
  const frame = useCurrentFrame();

  const seconds = Math.floor(frame / 30);
  const framesMod = frame % 30;
  const timecode = `T+${String(seconds).padStart(2, "0")}.${String(
    framesMod
  ).padStart(2, "0")}s`;

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
      {/* Outer Fine Technical Border */}
      <div
        style={{
          position: "absolute",
          top: 35,
          left: 35,
          right: 35,
          bottom: 35,
          border: "1px solid rgba(241, 245, 249, 0.15)",
          pointerEvents: "none",
        }}
      />

      {/* Top Header Technical Title Block */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 55,
          right: 55,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "rgba(241, 245, 249, 0.75)",
          fontSize: 15,
          letterSpacing: 1.5,
          fontFamily: "monospace",
          borderBottom: "1px solid rgba(241, 245, 249, 0.12)",
          paddingBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              padding: "2px 8px",
              backgroundColor: "rgba(241, 245, 249, 0.1)",
              border: "1px solid rgba(241, 245, 249, 0.2)",
              color: "#F1F5F9",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {figureNumber}
          </span>
          <span style={{ fontWeight: 600 }}>{topicTitle}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(241, 245, 249, 0.45)" }}>SCALE: 1:1</span>
          <span style={{ color: "#D97706", fontWeight: 700 }}>{timecode}</span>
        </div>
      </div>

      {/* Left Margin Metric Scale Ruler */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 38,
          bottom: 150,
          width: 15,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: 0.35,
        }}
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              width: i % 5 === 0 ? 12 : 6,
              height: 1,
              backgroundColor: "#F1F5F9",
            }}
          />
        ))}
      </div>

      {/* Right Margin Metric Scale Ruler */}
      <div
        style={{
          position: "absolute",
          top: 150,
          right: 38,
          bottom: 150,
          width: 15,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-end",
          opacity: 0.35,
        }}
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              width: i % 5 === 0 ? 12 : 6,
              height: 1,
              backgroundColor: "#F1F5F9",
            }}
          />
        ))}
      </div>
    </div>
  );
};
