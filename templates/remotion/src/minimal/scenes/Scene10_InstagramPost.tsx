import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export const Scene10_InstagramPost: React.FC<{ fontFamily: string }> = ({
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
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 500,
          height: 900,
        }}
      >
        <svg
          viewBox="0 0 500 900"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* Hand Holding the Phone (Exact match to reference video ref_frame_50s.jpg) */}
          {/* Thumb */}
          <path
            d="M 430 520 C 490 520 490 580 430 580"
            fill="#000000"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 430 550 C 370 550 360 560 360 575 C 360 590 380 600 430 600"
            fill="#000000"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 440 600 C 490 640 450 720 340 760"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Left fingers */}
          <path d="M 68 440 C 50 440 50 470 68 470" fill="none" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M 68 480 C 50 480 50 510 68 510" fill="none" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M 68 520 C 50 520 50 550 68 550" fill="none" stroke="#FFFFFF" strokeWidth="3" />

          {/* Phone Outer Body */}
          <rect
            x="70"
            y="120"
            width="360"
            height="660"
            rx="46"
            fill="#000000"
            stroke="#FFFFFF"
            strokeWidth="3.5"
          />

          {/* Phone Screen (Clean Light Paper White Background) */}
          <rect
            x="84"
            y="134"
            width="332"
            height="632"
            rx="36"
            fill="#F4F4F5"
          />

          {/* Dynamic Island Notch */}
          <rect
            x="200"
            y="148"
            width="100"
            height="26"
            rx="13"
            fill="#000000"
          />

          {/* Screen Content: Instagram Post with Nias Logo / Lock Illustration */}
          <g transform="translate(250, 260)">
            {/* Post image container */}
            <rect x="-140" y="-80" width="280" height="150" fill="#E4E4E7" stroke="#D4D4D8" strokeWidth="1" />
            {/* Logo / Lock inside post image */}
            <circle cx="0" cy="-5" r="28" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
            <path d="M -8 -8 C -8 -18 8 -18 8 -8 L 8 -2" fill="none" stroke="#18181B" strokeWidth="2" />
            <rect x="-10" y="-2" width="20" height="16" rx="3" fill="#18181B" />
          </g>

          {/* Post Action Icons Bar (Like, Comment, Share, Bookmark) */}
          <g transform="translate(250, 370)">
            {/* Heart */}
            <path
              d="M 120 -8 C 120 -15 110 -18 105 -12 C 100 -18 90 -15 90 -8 C 90 2 105 12 105 12 C 105 12 120 2 120 -8 Z"
              fill="none"
              stroke="#18181B"
              strokeWidth="1.8"
            />
            {/* Comment Bubble */}
            <path
              d="M 65 -12 C 55 -12 47 -5 47 4 C 47 9 50 14 55 16 L 53 22 L 60 19 C 62 20 64 20 65 20 C 75 20 83 13 83 4 C 83 -5 75 -12 65 -12 Z"
              fill="none"
              stroke="#18181B"
              strokeWidth="1.8"
            />
            {/* Share Paperplane */}
            <path
              d="M 25 -8 L 5 2 L 12 5 L 14 14 L 18 8 L 25 -8 Z"
              fill="none"
              stroke="#18181B"
              strokeWidth="1.8"
            />

            {/* Bookmark on left */}
            <path
              d="M -120 -12 L -100 -12 L -100 12 L -110 5 L -120 12 Z"
              fill="none"
              stroke="#18181B"
              strokeWidth="1.8"
            />
          </g>

          {/* Interactive Comment Input Box at Bottom of Screen */}
          <g transform="translate(250, 520)">
            <rect
              x="-140"
              y="-30"
              width="280"
              height="60"
              rx="30"
              fill="#FFFFFF"
              stroke="#18181B"
              strokeWidth="2"
            />

            <g transform="translate(60, 10)">
              <text
                x="0"
                y="0"
                fill="#18181B"
                fontSize="28"
                fontWeight="900"
                fontFamily={fontFamily}
                textAnchor="end"
              >
                {currentTyped}
              </text>
              {cursorBlink && (
                <line x1="-80" y1="-22" x2="-80" y2="4" stroke="#18181B" strokeWidth="2.5" />
              )}
            </g>

            {/* Send Arrow Button */}
            <g transform="translate(-105, 0)">
              <circle cx="0" cy="0" r="16" fill="#18181B" />
              <path d="M 4 0 L -4 -5 L -2 0 L -4 5 Z" fill="#FFFFFF" />
            </g>
          </g>

          {/* Call to action arrow under phone */}
          <g transform="translate(250, 830)">
            <text
              x="0"
              y="0"
              fill="#FFFFFF"
              fontSize="18"
              fontWeight="bold"
              fontFamily={fontFamily}
              textAnchor="middle"
            >
              👇 کلمه «لاگین» رو در کامنت‌ها بنویسید 👇
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
