import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface Props {
  fontFamily: string;
  badge?: string;
  headline: string;
  highlightWords?: string[];
  subtitle?: string;
  accentColor?: string;
}

export const InfographicCaption: React.FC<Props> = ({
  fontFamily,
  badge,
  headline,
  highlightWords = [],
  subtitle,
  accentColor = "#D97706",
}) => {
  const frame = useCurrentFrame();

  const translateY = interpolate(frame, [0, 16], [24, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const opacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
  });

  const rulerProgress = interpolate(frame, [8, 30], [0, 100], {
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
            color: isHighlighted ? accentColor : "#F1F5F9",
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
        top: 135,
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
      {/* Editorial Technical Badge */}
      {badge && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 20px",
            background: "rgba(15, 23, 42, 0.9)",
            border: `1.5px solid ${accentColor}`,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              backgroundColor: accentColor,
            }}
          />
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#F1F5F9",
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
          fontSize: 42,
          lineHeight: 1.45,
          fontWeight: 800,
          maxWidth: 920,
          color: "#F1F5F9",
        }}
      >
        {renderWords(headline)}
      </h1>

      {/* Technical Drafting Ruler Line */}
      <div
        style={{
          position: "relative",
          width: `${rulerProgress}%`,
          maxWidth: 380,
          height: 1,
          backgroundColor: accentColor,
          marginTop: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ width: 4, height: 4, backgroundColor: accentColor, transform: "rotate(45deg)" }} />
        <span style={{ width: 4, height: 4, backgroundColor: accentColor, transform: "rotate(45deg)" }} />
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            margin: 0,
            marginTop: 16,
            fontSize: 24,
            lineHeight: 1.5,
            color: "rgba(226, 232, 240, 0.75)",
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
