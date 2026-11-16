import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { PersianCaption } from "../components/PersianCaption";

export const Scene10_CallToAction: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const camZoom = interpolate(frame, [0, 130], [1, 1.08], {
    extrapolateRight: "clamp",
  });

  // Typing effect for the keyword "لاگین"
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

  // Blinking typing cursor
  const cursorBlink = Math.floor(frame / 12) % 2 === 0;

  // Pulsing button glow
  const btnPulse = interpolate(
    Math.sin(frame * 0.25),
    [-1, 1],
    [1, 1.06]
  );

  // Floating arrows pointing down
  const arrowY = interpolate(Math.sin(frame * 0.3), [-1, 1], [-8, 8]);

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
        badge="دانلود و مشاوره رایگان"
        badgeColor="#38BDF8"
        headline="کلمه «لاگین» رو در کامنت‌ها بنویس!"
        highlightWords={["لاگین", "کامنت"]}
        subtitle="تا لینک مستقیم و راهنمای نصب افزونه نیاس لاگین فوراً برات ارسال بشه"
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
          {/* Glowing Aura behind Comment Box */}
          <ellipse
            cx="330"
            cy="270"
            rx="260"
            ry="110"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeDasharray="8 8"
            opacity="0.3"
          />

          {/* Social Media Comment Container Mockup */}
          <g transform="translate(330, 270)">
            {/* Box Outer Rim */}
            <rect
              x="-260"
              y="-70"
              width="520"
              height="140"
              rx="30"
              fill="rgba(15, 23, 42, 0.9)"
              stroke="#38BDF8"
              strokeWidth="3"
              style={{
                filter: "drop-shadow(0 0 24px rgba(56, 189, 248, 0.4))",
              }}
            />

            {/* Comment Icon (Speech Bubble) */}
            <g transform="translate(200, 0)">
              <circle cx="0" cy="0" r="28" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="2" />
              <path
                d="M -10 -6 L 10 -6 C 14 -6 14 -6 14 -2 L 14 6 C 14 10 14 10 10 10 L -2 10 L -8 15 L -6 10 L -10 10 C -14 10 -14 10 -14 6 L -14 -2 C -14 -6 -14 -6 -10 -6 Z"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </g>

            {/* Keyword Typing in Persian */}
            <g transform="translate(130, 15)">
              <text
                x="0"
                y="0"
                fill="#38BDF8"
                fontSize="48"
                fontWeight="900"
                fontFamily={fontFamily}
                textAnchor="end"
                style={{
                  filter: "drop-shadow(0 0 16px #38BDF8)",
                }}
              >
                {currentTyped}
              </text>

              {/* Glowing cursor bar */}
              {cursorBlink && (
                <line
                  x1="-135"
                  y1="-38"
                  x2="-135"
                  y2="5"
                  stroke="#FDE047"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 8px #FDE047)" }}
                />
              )}
            </g>

            {/* Send / Paperplane Button */}
            <g
              transform={`translate(-180, 0) scale(${btnPulse})`}
              style={{ filter: "drop-shadow(0 0 16px #10B981)" }}
            >
              <circle cx="0" cy="0" r="34" fill="rgba(16, 185, 129, 0.3)" stroke="#10B981" strokeWidth="2.5" />
              {/* Paper plane icon */}
              <path
                d="M 12 0 L -12 -12 L -6 0 L -12 12 Z"
                fill="none"
                stroke="#34D399"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </g>
          </g>

          {/* Interactive Call to Action Banner Below */}
          <g transform={`translate(330, ${470 + arrowY})`}>
            {/* Pulsing Button */}
            <rect
              x="-200"
              y="-28"
              width="400"
              height="56"
              rx="28"
              fill="rgba(56, 189, 248, 0.2)"
              stroke="#38BDF8"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 16px rgba(56, 189, 248, 0.5))" }}
            />
            <text
              x="0"
              y="9"
              fill="#FFFFFF"
              fontSize="24"
              fontWeight="900"
              fontFamily={fontFamily}
              textAnchor="middle"
            >
              👇 همین الان بنویس: لاگین 👇
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
