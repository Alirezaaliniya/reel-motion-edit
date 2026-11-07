import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface Props {
  fontFamily: string;
  badge?: string;
  headline: string;
  highlightWords?: string[];
  subtitle?: string;
  badgeColor?: string;
}

export const PersianCaption: React.FC<Props> = ({
  fontFamily,
  badge,
  headline,
  highlightWords = [],
  subtitle,
  badgeColor = "#38BDF8",
}) => {
  const frame = useCurrentFrame();

  const translateY = interpolate(frame, [0, 15], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(frame, [5, 25], [0, 100], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const renderWords = (text: string) => {
    const words = text.split(" ");
    return words.map((w, idx) => {
      const isHighlighted = highlightWords.some((hw) =>
        w.toLowerCase().includes(hw.toLowerCase())
      );
      return (
        <span
          key={idx}
          style={{
            display: "inline-block",
            margin: "0 5px",
            color: isHighlighted ? badgeColor : "#FFFFFF",
            textShadow: isHighlighted ? `0 0 20px ${badgeColor}99` : "none",
            fontWeight: isHighlighted ? 900 : 700,
          }}
        >
          {w}
        </span>
      );
    });
  };

  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 130,
        left: 60,
        right: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        zIndex: 40,
        fontFamily,
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      {/* Category / Context Pill Badge */}
      {badge && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 24px",
            borderRadius: 999,
            background: "rgba(15, 23, 42, 0.8)",
            border: `1.5px solid ${badgeColor}`,
            boxShadow: `0 0 16px ${badgeColor}40`,
            marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: badgeColor,
              boxShadow: `0 0 8px ${badgeColor}`,
            }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: 0.5,
            }}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Main Headline */}
      <h1
        style={{
          margin: 0,
          fontSize: 44,
          lineHeight: 1.45,
          fontWeight: 800,
          maxWidth: 920,
        }}
      >
        {renderWords(headline)}
      </h1>

      {/* Animated Glowing Accent Line */}
      <div
        style={{
          position: "relative",
          width: `${lineWidth}%`,
          maxWidth: 320,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${badgeColor}, transparent)`,
          marginTop: 18,
          boxShadow: `0 0 10px ${badgeColor}`,
        }}
      />

      {/* Subtitle / Narration support */}
      {subtitle && (
        <p
          style={{
            margin: 0,
            marginTop: 16,
            fontSize: 26,
            lineHeight: 1.5,
            color: "rgba(226, 232, 240, 0.85)",
            maxWidth: 820,
            fontWeight: 500,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
