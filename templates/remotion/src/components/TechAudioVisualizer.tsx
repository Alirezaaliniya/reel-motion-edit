import React from "react";
import { useCurrentFrame } from "remotion";

export const TechAudioVisualizer: React.FC<{ themeColor?: string }> = ({
  themeColor = "#38BDF8",
}) => {
  const frame = useCurrentFrame();

  const barCount = 36;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 75,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 5,
        height: 50,
        pointerEvents: "none",
        zIndex: 45,
      }}
    >
      {[...Array(barCount)].map((_, i) => {
        // Multi-frequency simulated audio waveform
        const wave1 = Math.sin(frame * 0.3 + i * 0.4);
        const wave2 = Math.cos(frame * 0.18 + i * 0.6);
        const height = Math.max(
          6,
          Math.min(42, Math.abs(wave1 * 22 + wave2 * 14))
        );

        return (
          <div
            key={i}
            style={{
              width: 3.5,
              height,
              backgroundColor: themeColor,
              borderRadius: 2,
              opacity: 0.65,
              boxShadow: `0 0 6px ${themeColor}`,
            }}
          />
        );
      })}
    </div>
  );
};
