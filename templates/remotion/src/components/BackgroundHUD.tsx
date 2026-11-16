import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export const BackgroundHUD: React.FC<{ themeColor?: string }> = ({
  themeColor = "#38BDF8",
}) => {
  const frame = useCurrentFrame();

  // Subtle continuous rotation and pulse
  const ringRotation = (frame * 0.4) % 360;
  const pulseOpacity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.15, 0.35]
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#060913",
        backgroundImage: `
          radial-gradient(circle at 50% 40%, rgba(30, 58, 138, 0.28) 0%, rgba(6, 9, 19, 0.95) 70%),
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 60px 60px, 60px 60px",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Dynamic Ambient Glow Orb */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          width: 700,
          height: 700,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${themeColor}22 0%, transparent 65%)`,
          filter: "blur(40px)",
          opacity: pulseOpacity,
        }}
      />

      {/* Rotating Line Art Reticle Rings */}
      <svg
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          width: 900,
          height: 900,
          transform: `translate(-50%, -50%) rotate(${ringRotation}deg)`,
          opacity: 0.18,
        }}
        viewBox="0 0 900 900"
      >
        <circle
          cx="450"
          cy="450"
          r="400"
          fill="none"
          stroke={themeColor}
          strokeWidth="1.5"
          strokeDasharray="20 40 80 40"
        />
        <circle
          cx="450"
          cy="450"
          r="340"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          strokeDasharray="10 15"
        />
        <circle
          cx="450"
          cy="450"
          r="260"
          fill="none"
          stroke={themeColor}
          strokeWidth="1"
          strokeDasharray="180 30 60 30"
        />
        {/* Radar crosshairs */}
        <line x1="450" y1="30" x2="450" y2="120" stroke={themeColor} strokeWidth="2" />
        <line x1="450" y1="780" x2="450" y2="870" stroke={themeColor} strokeWidth="2" />
        <line x1="30" y1="450" x2="120" y2="450" stroke={themeColor} strokeWidth="2" />
        <line x1="780" y1="450" x2="870" y2="450" stroke={themeColor} strokeWidth="2" />
      </svg>

      {/* Counter-rotating Inner Tech Hexagon Ring */}
      <svg
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          width: 600,
          height: 600,
          transform: `translate(-50%, -50%) rotate(${-ringRotation * 0.7}deg)`,
          opacity: 0.12,
        }}
        viewBox="0 0 600 600"
      >
        <polygon
          points="300,50 516,175 516,425 300,550 84,425 84,175"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeDasharray="8 12"
        />
      </svg>

      {/* Floating Star/Dust Particles */}
      {[...Array(16)].map((_, i) => {
        const x = (i * 67 + 30) % 100;
        const baseY = (i * 123 + 45) % 100;
        const y = (baseY - (frame * (0.05 + (i % 5) * 0.02))) % 100;
        const normalizedY = y < 0 ? y + 100 : y;
        const size = (i % 3) + 2;
        const particleOpacity = (Math.sin(frame * 0.05 + i) + 1) * 0.3 + 0.1;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${normalizedY}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: i % 2 === 0 ? themeColor : "#FFFFFF",
              opacity: particleOpacity,
              boxShadow: `0 0 6px ${i % 2 === 0 ? themeColor : "#FFFFFF"}`,
            }}
          />
        );
      })}

      {/* Top and Bottom Cinematic Vignette gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(3,5,10,0.85) 0%, transparent 18%, transparent 82%, rgba(3,5,10,0.92) 100%)",
        }}
      />
    </div>
  );
};
