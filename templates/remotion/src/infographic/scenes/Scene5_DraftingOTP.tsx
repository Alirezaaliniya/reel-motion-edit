import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { InfographicCaption } from "../InfographicCaption";

export const Scene5_DraftingOTP: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const digit1 = frame >= 18 ? "6" : "";
  const digit2 = frame >= 30 ? "3" : "";
  const digit3 = frame >= 42 ? "8" : "";
  const digit4 = frame >= 54 ? "2" : "";

  const isVerified = frame >= 65;
  const stampOpacity = interpolate(frame, [65, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
        badge="فاز ۴: مکانیزم اعتبارسنجی پیامکی"
        accentColor="#D97706"
        headline="قبل از خرید، شماره کاربر رو احراز کن!"
        highlightWords={["قبل", "خرید", "احراز"]}
        subtitle="ارسال رمز یکبارمصرف پیامکی سریع جهت تایید مالکیت خط تلفن"
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
          {/* Main Technical Blueprint Card */}
          <rect
            x="80"
            y="70"
            width="480"
            height="440"
            fill="rgba(15, 23, 42, 0.7)"
            stroke="#F1F5F9"
            strokeWidth="1.5"
          />

          {/* Technical Spec Header */}
          <line x1="80" y1="130" x2="560" y2="130" stroke="rgba(241, 245, 249, 0.2)" strokeWidth="1" />
          <text x="110" y="108" fill="#94A3B8" fontSize="13" fontFamily="monospace">
            PROTOCOL: SMS_OTP_AUTHENTICATION
          </text>
          <text x="530" y="108" fill="#D97706" fontSize="12" fontFamily="monospace" textAnchor="end">
            PORT: 443 // TLS
          </text>

          {/* Input Label */}
          <text x="320" y="200" fill="#F1F5F9" fontSize="17" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
            کد اعتبارسنجی ۴ رقمی ارسال شده به کاربر:
          </text>

          {/* 4 Technical OTP Cells */}
          <g transform="translate(320, 270)">
            {/* Cell 1 */}
            <g transform="translate(-135, 0)">
              <rect x="-30" y="-35" width="60" height="70" fill="#0F172A" stroke={digit1 ? "#D97706" : "rgba(241, 245, 249, 0.3)"} strokeWidth="1.5" />
              <text x="0" y="12" fill="#F1F5F9" fontSize="30" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {digit1}
              </text>
            </g>
            {/* Cell 2 */}
            <g transform="translate(-45, 0)">
              <rect x="-30" y="-35" width="60" height="70" fill="#0F172A" stroke={digit2 ? "#D97706" : "rgba(241, 245, 249, 0.3)"} strokeWidth="1.5" />
              <text x="0" y="12" fill="#F1F5F9" fontSize="30" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {digit2}
              </text>
            </g>
            {/* Cell 3 */}
            <g transform="translate(45, 0)">
              <rect x="-30" y="-35" width="60" height="70" fill="#0F172A" stroke={digit3 ? "#D97706" : "rgba(241, 245, 249, 0.3)"} strokeWidth="1.5" />
              <text x="0" y="12" fill="#F1F5F9" fontSize="30" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {digit3}
              </text>
            </g>
            {/* Cell 4 */}
            <g transform="translate(135, 0)">
              <rect x="-30" y="-35" width="60" height="70" fill="#0F172A" stroke={digit4 ? "#D97706" : "rgba(241, 245, 249, 0.3)"} strokeWidth="1.5" />
              <text x="0" y="12" fill="#F1F5F9" fontSize="30" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {digit4}
              </text>
            </g>
          </g>

          {/* Verification Technical Stamp (Frame 65+) */}
          {isVerified && (
            <g transform="translate(320, 420)" opacity={stampOpacity}>
              <rect
                x="-150"
                y="-25"
                width="300"
                height="50"
                fill="rgba(16, 185, 129, 0.15)"
                stroke="#10B981"
                strokeWidth="2"
              />
              <path d="M -90 0 L -75 14 L -45 -12" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <text x="25" y="7" fill="#34D399" fontSize="16" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
                شماره تایید شد [VERIFIED]
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
