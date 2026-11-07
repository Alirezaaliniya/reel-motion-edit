import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface SubtitleItem {
  startFrame: number;
  endFrame: number;
  text: string;
  highlights: string[];
  themeColor: string;
}

const SUBTITLES: SubtitleItem[] = [
  {
    startFrame: 0,
    endFrame: 125,
    text: "مشتری از سایتت خرید کرده، ولی شماره موبایلش رو اشتباه وارد کرده.",
    highlights: ["خرید", "شماره", "موبایلش", "اشتباه"],
    themeColor: "#EF4444",
  },
  {
    startFrame: 135,
    endFrame: 205,
    text: "حالا چطوری باید باهاش ارتباط بگیری؟",
    highlights: ["چطوری", "ارتباط"],
    themeColor: "#F59E0B",
  },
  {
    startFrame: 210,
    endFrame: 295,
    text: "مخصوصاً وقتی سفارش‌اش هم یه مشکلی داشته باشه.",
    highlights: ["سفارش‌اش", "مشکلی"],
    themeColor: "#EF4444",
  },
  {
    startFrame: 300,
    endFrame: 375,
    text: "عملاً هیچ راهی برای پیگیری نداری.",
    highlights: ["هیچ", "راهی", "نداری"],
    themeColor: "#EF4444",
  },
  {
    startFrame: 380,
    endFrame: 440,
    text: "اما راه حلش خیلی ساده‌ست.",
    highlights: ["راه", "حلش", "ساده‌ست"],
    themeColor: "#10B981",
  },
  {
    startFrame: 445,
    endFrame: 530,
    text: "قبل از خرید، شماره موبایل کاربر رو احراز کن.",
    highlights: ["قبل", "خرید", "احراز"],
    themeColor: "#38BDF8",
  },
  {
    startFrame: 535,
    endFrame: 690,
    text: "با افزونه نیاس لاگین، صفحه پرداخت ووکامرس رو قفل کن!",
    highlights: ["نیاس", "لاگین", "ووکامرس", "قفل"],
    themeColor: "#F59E0B",
  },
  {
    startFrame: 695,
    endFrame: 810,
    text: "تا کاربر فقط بعد از تایید شماره موبایلش بتونه سفارش ثبت کنه.",
    highlights: ["فقط", "تایید", "شماره", "ثبت"],
    themeColor: "#10B981",
  },
  {
    startFrame: 815,
    endFrame: 975,
    text: "اطلاعات مشتری درست ثبت میشه و موقع پیگیری به مشکل نمی‌خوری.",
    highlights: ["درست", "ثبت", "پیگیری"],
    themeColor: "#10B981",
  },
  {
    startFrame: 980,
    endFrame: 1120,
    text: "اگه فروشگاه اینترنتی داری، جلوی کلی دردسر و خسارت رو می‌گیره.",
    highlights: ["فروشگاه", "اینترنتی", "دردسر"],
    themeColor: "#38BDF8",
  },
  {
    startFrame: 1125,
    endFrame: 1250,
    text: "برای آشنایی با نیاس لاگین، کلمه «لاگین» رو کامنت کن!",
    highlights: ["نیاس", "لاگین", "لاگین", "کامنت"],
    themeColor: "#38BDF8",
  },
];

export const KineticSubtitles: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const currentSub = SUBTITLES.find(
    (s) => frame >= s.startFrame && frame <= s.endFrame
  );

  if (!currentSub) return null;

  // Local frame within current subtitle
  const localFrame = frame - currentSub.startFrame;
  const duration = currentSub.endFrame - currentSub.startFrame;

  // Pop-in scale and opacity
  const enterScale = interpolate(localFrame, [0, 8], [0.92, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const enterOpacity = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Calculate active word index based on timing progress
  const words = currentSub.text.split(" ");
  const activeWordIdx = Math.min(
    words.length - 1,
    Math.floor((localFrame / duration) * words.length * 1.05)
  );

  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        bottom: 140,
        left: 60,
        right: 60,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 60,
        pointerEvents: "none",
        fontFamily,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          padding: "16px 32px",
          borderRadius: 24,
          background: "rgba(10, 15, 29, 0.88)",
          backdropFilter: "blur(16px)",
          border: `1.5px solid ${currentSub.themeColor}77`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px ${currentSub.themeColor}33`,
          maxWidth: 960,
          transform: `scale(${enterScale})`,
          opacity: enterOpacity,
        }}
      >
        {words.map((w, idx) => {
          const isSpoken = idx <= activeWordIdx;
          const isCurrentWord = idx === activeWordIdx;
          const isHighlightTarget = currentSub.highlights.some((h) =>
            w.includes(h)
          );

          let color = "rgba(255, 255, 255, 0.65)";
          let textShadow = "none";
          let fontWeight = 700;
          let scale = 1;

          if (isCurrentWord) {
            color = isHighlightTarget ? currentSub.themeColor : "#FFFFFF";
            textShadow = `0 0 16px ${currentSub.themeColor}`;
            fontWeight = 900;
            scale = 1.08;
          } else if (isSpoken) {
            color = isHighlightTarget ? currentSub.themeColor : "#FFFFFF";
            fontWeight = isHighlightTarget ? 800 : 700;
          }

          return (
            <span
              key={idx}
              style={{
                display: "inline-block",
                margin: "4px 6px",
                fontSize: 27,
                lineHeight: 1.45,
                color,
                textShadow,
                fontWeight,
                transform: `scale(${scale})`,
                transition: "all 0.1s ease-out",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
