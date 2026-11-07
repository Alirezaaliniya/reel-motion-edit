import React from "react";
import { useCurrentFrame } from "remotion";

export const InfographicBackground: React.FC<{ accentColor?: string }> = ({
  accentColor = "#F1F5F9",
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#0B1120", // Deep matte drafting slate
        backgroundImage: `
          linear-gradient(rgba(241, 245, 249, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(241, 245, 249, 0.035) 1px, transparent 1px),
          radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, rgba(11, 17, 32, 0.95) 100%)
        `,
        backgroundSize: "60px 60px, 60px 60px, 100% 100%",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Precision Drafting Grid Marks (+) */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.15,
        }}
      >
        {[...Array(9)].map((_, col) =>
          [...Array(16)].map((_, row) => {
            const x = (col + 1) * 120;
            const y = (row + 1) * 120;
            return (
              <g key={`${col}-${row}`} transform={`translate(${x}, ${y})`}>
                <line x1="-5" y1="0" x2="5" y2="0" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="-5" x2="0" y2="5" stroke="#F1F5F9" strokeWidth="1" />
              </g>
            );
          })
        )}
      </svg>

      {/* Subtle Architectural Construction Compass Circles (Slowly Rotating) */}
      <svg
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          width: 800,
          height: 800,
          transform: `translate(-50%, -50%) rotate(${frame * 0.15}deg)`,
          opacity: 0.08,
        }}
        viewBox="0 0 800 800"
      >
        <circle cx="400" cy="400" r="380" fill="none" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="400" cy="400" r="280" fill="none" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="12 12" />
        <circle cx="400" cy="400" r="160" fill="none" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="2 6" />
        <line x1="400" y1="0" x2="400" y2="800" stroke="#F1F5F9" strokeWidth="0.75" />
        <line x1="0" y1="400" x2="800" y2="400" stroke="#F1F5F9" strokeWidth="0.75" />
      </svg>

      {/* Subtle Matte Paper Texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(11, 17, 32, 0.4) 0%, transparent 20%, transparent 80%, rgba(11, 17, 32, 0.6) 100%)",
        }}
      />
    </div>
  );
};
