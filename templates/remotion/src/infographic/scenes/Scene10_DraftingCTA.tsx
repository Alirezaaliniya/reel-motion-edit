import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { InfographicCaption } from "../InfographicCaption";

export const Scene10_DraftingCTA: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const textChars = "لاگین";
  const typedLength = Math.min(
    textChars.length,
    Math.floor(
      interpolate(frame, [15, 45], [0, textChars.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );
  const currentTyped = textChars.slice(0, typedLength);
  const cursorBlink = Math.floor(frame / 12) % 2 === 0;

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
        badge="فاز نهایی: دریافت افزونه"
        accentColor="#D97706"
        headline="کلمه «لاگین» رو در کامنت‌ها بنویس!"
        highlightWords={["لاگین", "کامنت"]}
        subtitle="ارسال آنی لینک دانلود، ویدیوهای آموزشی و راهنمای راه‌اندازی سریع"
      />

      <div
        style={{
          position: "relative",
          marginTop: 180,
          width: 660,
          height: 600,
          transform: "scale(1.22)",
          transformOrigin: "center center",
        }}
      >
        <svg
          viewBox="0 0 660 600"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Main Comment Box Drafting Card */}
          <g transform="translate(330, 270)">
            <rect
              x="-240"
              y="-65"
              width="480"
              height="130"
              fill="rgba(15, 23, 42, 0.9)"
              stroke="#F1F5F9"
              strokeWidth="1.5"
            />

            {/* Input Label Top */}
            <text x="210" y="-35" fill="#94A3B8" fontSize="13" fontFamily={fontFamily} textAnchor="end">
              درج عبارت دستوری در بخش نظرات:
            </text>

            {/* Typing text area */}
            <g transform="translate(140, 22)">
              <text
                x="0"
                y="0"
                fill="#D97706"
                fontSize="44"
                fontWeight="900"
                fontFamily={fontFamily}
                textAnchor="end"
              >
                {currentTyped}
              </text>
              {cursorBlink && (
                <line x1="-120" y1="-32" x2="-120" y2="4" stroke="#F1F5F9" strokeWidth="2.5" />
              )}
            </g>

            {/* Paperplane / Action Send Icon */}
            <g transform="translate(-180, 5)">
              <rect x="-25" y="-25" width="50" height="50" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
              <path d="M 8 0 L -10 -8 L -5 0 L -10 8 Z" fill="none" stroke="#10B981" strokeWidth="2" strokeLinejoin="round" />
            </g>
          </g>

          {/* Technical Arrow Pointer to Comment section */}
          <g transform="translate(330, 440)">
            <line x1="0" y1="-30" x2="0" y2="25" stroke="#D97706" strokeWidth="2" markerEnd="url(#tech-arrow-amber)" />
            <rect
              x="-180"
              y="35"
              width="360"
              height="40"
              fill="#0F172A"
              stroke="#D97706"
              strokeWidth="1"
            />
            <text x="0" y="60" fill="#F1F5F9" fontSize="15" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              ارسال کلمه «لاگین» در بخش کامنت‌ها
            </text>
          </g>

          {/* System Spec Footer */}
          <text x="330" y="550" fill="#94A3B8" fontSize="12" fontFamily="monospace" textAnchor="middle">
            NIAS LOGIN PLUGIN // WOOMCOMMERCE AUTH ENGINE
          </text>
        </svg>
      </div>
    </div>
  );
};
