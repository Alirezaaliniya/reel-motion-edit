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
    themeColor: "#DC2626",
  },
  {
    startFrame: 135,
    endFrame: 205,
    text: "حالا چطوری باید باهاش ارتباط بگیری؟",
    highlights: ["چطوری", "ارتباط"],
    themeColor: "#D97706",
  },
  {
    startFrame: 210,
    endFrame: 295,
    text: "مخصوصاً وقتی سفارش‌اش هم یه مشکلی داشته باشه.",
    highlights: ["سفارش‌اش", "مشکلی"],
    themeColor: "#DC2626",
  },
  {
    startFrame: 300,
    endFrame: 375,
    text: "عملاً هیچ راهی برای پیگیری نداری.",
    highlights: ["هیچ", "راهی", "نداری"],
    themeColor: "#DC2626",
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
    themeColor: "#D97706",
  },
  {
    startFrame: 535,
    endFrame: 690,
    text: "با افزونه نیاس لاگین، صفحه پرداخت ووکامرس رو قفل کن!",
    highlights: ["نیاس", "لاگین", "ووکامرس", "قفل"],
    themeColor: "#D97706",
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
    themeColor: "#D97706",
  },
  {
    startFrame: 1125,
    endFrame: 1250,
    text: "برای آشنایی با نیاس لاگین، کلمه «لاگین» رو کامنت کن!",
    highlights: ["نیاس", "لاگین", "لاگین", "کامنت"],
    themeColor: "#D97706",
  },
];

export const InfographicSubtitles: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const currentSub = SUBTITLES.find(
    (s) => frame >= s.startFrame && frame <= s.endFrame
  );

  if (!currentSub) return null;

  const localFrame = frame - currentSub.startFrame;
  const duration = currentSub.endFrame - currentSub.startFrame;

  const enterOpacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

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
        bottom: 95,
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
          padding: "14px 28px",
          background: "#0F172A",
          border: `1px solid ${currentSub.themeColor}99`,
          maxWidth: 960,
          opacity: enterOpacity,
        }}
      >
        {words.map((w, idx) => {
          const isSpoken = idx <= activeWordIdx;
          const isCurrentWord = idx === activeWordIdx;
          const isHighlightTarget = currentSub.highlights.some((h) =>
            w.includes(h)
          );

          let color = "rgba(241, 245, 249, 0.45)";
          let fontWeight = 600;
          let borderBottom = "none";

          if (isCurrentWord) {
            color = isHighlightTarget ? currentSub.themeColor : "#F1F5F9";
            fontWeight = 900;
            borderBottom = `2px solid ${currentSub.themeColor}`;
          } else if (isSpoken) {
            color = isHighlightTarget ? currentSub.themeColor : "#F1F5F9";
            fontWeight = isHighlightTarget ? 800 : 700;
          }

          return (
            <span
              key={idx}
              style={{
                display: "inline-block",
                margin: "4px 6px",
                fontSize: 25,
                lineHeight: 1.4,
                color,
                fontWeight,
                borderBottom,
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
