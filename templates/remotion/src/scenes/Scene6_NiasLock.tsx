import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { PersianCaption } from "../components/PersianCaption";

export const Scene6_NiasLock: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const camZoom = interpolate(frame, [0, 150], [1, 1.07], {
    extrapolateRight: "clamp",
  });

  // Lock animation: shackle snaps down onto lock body around frame 40
  const shackleY = interpolate(frame, [25, 42], [-20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const lockGlow = frame >= 42 ? "#F59E0B" : "#38BDF8";

  // Concentric rings rotation
  const ringRot = (frame * 1.5) % 360;

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
        badge="افزونه قدرتمند نیاس لاگین"
        badgeColor="#F59E0B"
        headline="قفل هوشمند صفحه پرداخت ووکامرس!"
        highlightWords={["نیاس", "لاگین", "قفل", "ووکامرس"]}
        subtitle="با یک کلیک در تنظیمات، دکمه پرداخت را تا احراز کامل شماره قفل کنید"
      />

      <div
        style={{
          position: "relative",
          marginTop: 180,
          width: 640,
          height: 600,
        }}
      >
        <svg
          viewBox="0 0 640 600"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          {/* WooCommerce Checkout Window Mockup */}
          <rect
            x="70"
            y="60"
            width="500"
            height="460"
            rx="24"
            fill="rgba(15, 23, 42, 0.85)"
            stroke="#38BDF8"
            strokeWidth="2.5"
            style={{ filter: "drop-shadow(0 0 20px rgba(56, 189, 248, 0.2))" }}
          />

          {/* Window Header Bar */}
          <line x1="70" y1="120" x2="570" y2="120" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          <circle cx="100" cy="90" r="5" fill="#EF4444" />
          <circle cx="120" cy="90" r="5" fill="#F59E0B" />
          <circle cx="140" cy="90" r="5" fill="#10B981" />
          <text
            x="320"
            y="96"
            fill="#94A3B8"
            fontSize="15"
            fontFamily="monospace"
            textAnchor="middle"
          >
            WooCommerce Checkout Settings
          </text>

          {/* Setting Row: Lock Checkout Switch */}
          <g transform="translate(110, 180)">
            <text
              x="360"
              y="18"
              fill="#FFFFFF"
              fontSize="18"
              fontWeight="bold"
              fontFamily={fontFamily}
              textAnchor="end"
            >
              قفل پرداخت تا احراز شماره موبایل:
            </text>
            {/* Toggle Switch ON */}
            <rect
              x="20"
              y="-4"
              width="60"
              height="30"
              rx="15"
              fill="rgba(16, 185, 129, 0.3)"
              stroke="#10B981"
              strokeWidth="2"
            />
            <circle cx="62" cy="11" r="10" fill="#34D399" style={{ filter: "drop-shadow(0 0 6px #10B981)" }} />
          </g>

          {/* Cart Summary skeleton lines */}
          <line x1="110" y1="250" x2="420" y2="250" stroke="rgba(255,255,255,0.15)" strokeWidth="8" strokeLinecap="round" />
          <line x1="110" y1="285" x2="350" y2="285" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />

          {/* Locked Checkout Action Button */}
          <g transform="translate(320, 390)">
            {/* Ambient Lock aura */}
            <circle
              cx="0"
              cy="-20"
              r="75"
              fill="none"
              stroke={lockGlow}
              strokeWidth="1.5"
              strokeDasharray="4 8"
              style={{
                transform: `rotate(${ringRot}deg)`,
                transformOrigin: "0px -20px",
              }}
            />

            {/* Button Box */}
            <rect
              x="-190"
              y="-15"
              width="380"
              height="66"
              rx="18"
              fill="rgba(30, 41, 59, 0.9)"
              stroke={lockGlow}
              strokeWidth="2.5"
              style={{ filter: `drop-shadow(0 0 16px ${lockGlow}66)` }}
            />

            {/* Button Text */}
            <text
              x="30"
              y="26"
              fill="#E2E8F0"
              fontSize="20"
              fontWeight="bold"
              fontFamily={fontFamily}
              textAnchor="middle"
            >
              صفحه پرداخت قفل شد
            </text>

            {/* Glowing Cybernetic Padlock */}
            <g transform="translate(-115, 18)">
              {/* Shackle */}
              <path
                d="M -14 -14 C -14 -32 14 -32 14 -14 L 14 -6"
                fill="none"
                stroke={lockGlow}
                strokeWidth="4.5"
                strokeLinecap="round"
                transform={`translate(0, ${shackleY})`}
              />
              {/* Lock Body */}
              <rect
                x="-20"
                y="-6"
                width="40"
                height="34"
                rx="8"
                fill="rgba(15, 23, 42, 0.95)"
                stroke={lockGlow}
                strokeWidth="3"
                style={{ filter: `drop-shadow(0 0 8px ${lockGlow})` }}
              />
              {/* Keyhole */}
              <circle cx="0" cy="8" r="3.5" fill={lockGlow} />
              <line x1="0" y1="9" x2="0" y2="16" stroke={lockGlow} strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
