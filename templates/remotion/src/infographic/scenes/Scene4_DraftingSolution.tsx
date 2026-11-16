import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { InfographicCaption } from "../InfographicCaption";

export const Scene4_DraftingSolution: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();
  const isSolution = frame >= 65;

  const branchProgress = interpolate(frame, [65, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
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
        badge={isSolution ? "تحلیل سیستمی: راهبرد اصلاحی" : "تحلیل سیستمی: بن‌بست فرآیند"}
        accentColor={isSolution ? "#10B981" : "#DC2626"}
        headline={
          isSolution
            ? "اما راه حلش فوق‌العاده ساده‌ست!"
            : "عملاً هیچ راهی برای پیگیری نداری..."
        }
        highlightWords={
          isSolution ? ["راه", "حلش", "ساده‌ست"] : ["هیچ", "راهی", "نداری"]
        }
        subtitle={
          isSolution
            ? "تغییر معماری فرآیند خرید: اعتبارسنجی پیش از نهایی‌سازی سفارش"
            : "انباشت بسته‌های مرجوعی و تماس‌های بی‌پاسخ در سیستم سفارشات"
        }
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
          {/* Top Starting Node */}
          <g transform="translate(330, 80)">
            <rect
              x="-90"
              y="-22"
              width="180"
              height="44"
              fill="#0F172A"
              stroke="#F1F5F9"
              strokeWidth="1.5"
            />
            <text x="0" y="6" fill="#F1F5F9" fontSize="15" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              نقطه ورود کاربر به سایت
            </text>
          </g>

          {/* Flow Branch Left: Old Broken Flow (Problem) */}
          <path
            d="M 280 102 L 170 180 L 170 240"
            fill="none"
            stroke="#DC2626"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            markerEnd="url(#tech-arrow-chalk)"
          />

          <g transform="translate(170, 270)">
            <rect
              x="-85"
              y="-30"
              width="170"
              height="60"
              fill="rgba(220, 38, 38, 0.12)"
              stroke="#DC2626"
              strokeWidth="1.5"
            />
            <text x="0" y="-8" fill="#FCA5A5" fontSize="13" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              روش سنتی
            </text>
            <text x="0" y="14" fill="#94A3B8" fontSize="12" fontFamily={fontFamily} textAnchor="middle">
              ثبت شماره بدون راستی‌آزمایی
            </text>
          </g>

          {/* Old Flow Endpoint (Dead End) */}
          <line x1="170" y1="300" x2="170" y2="380" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3 3" />
          <g transform="translate(170, 420)">
            <circle cx="0" cy="0" r="32" fill="url(#hatch-red)" stroke="#DC2626" strokeWidth="2" />
            <line x1="-14" y1="-14" x2="14" y2="14" stroke="#DC2626" strokeWidth="2.5" />
            <line x1="14" y1="-14" x2="-14" y2="14" stroke="#DC2626" strokeWidth="2.5" />
            <text x="0" y="52" fill="#F87171" fontSize="13" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              بن‌بست پیگیری و مرجوعی
            </text>
          </g>

          {/* Flow Branch Right: New Solution Flow (Nias Login) */}
          <path
            d="M 380 102 L 490 180 L 490 240"
            fill="none"
            stroke={isSolution ? "#10B981" : "rgba(241, 245, 249, 0.2)"}
            strokeWidth="2"
            markerEnd="url(#tech-arrow-green)"
          />

          <g transform="translate(490, 270)" opacity={isSolution ? 1 : 0.4}>
            <rect
              x="-85"
              y="-30"
              width="170"
              height="60"
              fill={isSolution ? "rgba(16, 185, 129, 0.15)" : "#0F172A"}
              stroke={isSolution ? "#10B981" : "rgba(241, 245, 249, 0.3)"}
              strokeWidth="1.5"
            />
            <text x="0" y="-8" fill={isSolution ? "#34D399" : "#94A3B8"} fontSize="13" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
              معماری هوشمند نیاس
            </text>
            <text x="0" y="14" fill="#94A3B8" fontSize="12" fontFamily={fontFamily} textAnchor="middle">
              احراز پیش از تکمیل خرید
            </text>
          </g>

          {/* New Flow Endpoint (Success Key) */}
          {isSolution && (
            <g transform="translate(490, 420)" opacity={branchProgress}>
              <circle cx="0" cy="0" r="36" fill="rgba(16, 185, 129, 0.1)" stroke="#10B981" strokeWidth="2" />
              {/* Technical Key Icon */}
              <circle cx="-8" cy="-8" r="10" fill="none" stroke="#10B981" strokeWidth="2" />
              <line x1="-1" y1="-1" x2="16" y2="16" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="10" y1="10" x2="16" y2="4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
              <text x="0" y="55" fill="#34D399" fontSize="14" fontWeight="bold" fontFamily={fontFamily} textAnchor="middle">
                تضمین ۱۰۰٪ صحت داده
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
