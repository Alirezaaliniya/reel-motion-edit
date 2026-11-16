import React from "react";
import { useCurrentFrame } from "remotion";

interface SubtitleItem {
  startFrame: number;
  endFrame: number;
  text: string;
}

const SUBTITLES: SubtitleItem[] = [
  {
    startFrame: 0,
    endFrame: 125,
    text: "مشتری از سایتت خرید کرده، ولی شماره موبایلش رو اشتباه وارد کرده.",
  },
  {
    startFrame: 135,
    endFrame: 205,
    text: "حالا چطوری باید باهاش ارتباط بگیری؟",
  },
  {
    startFrame: 210,
    endFrame: 295,
    text: "مخصوصاً وقتی سفارش‌اش هم یه مشکلی داشته باشه.",
  },
  {
    startFrame: 300,
    endFrame: 375,
    text: "عملاً هیچ راهی برای پیگیری نداری.",
  },
  {
    startFrame: 380,
    endFrame: 440,
    text: "اما راه حلش خیلی ساده‌ست.",
  },
  {
    startFrame: 445,
    endFrame: 530,
    text: "قبل از خرید، شماره موبایل کاربر رو احراز کن.",
  },
  {
    startFrame: 535,
    endFrame: 690,
    text: "با افزونه نیاس لاگین، صفحه پرداخت ووکامرس رو قفل کن،",
  },
  {
    startFrame: 695,
    endFrame: 810,
    text: "تا کاربر فقط بعد از تایید شماره موبایلش بتونه سفارش ثبت کنه.",
  },
  {
    startFrame: 815,
    endFrame: 975,
    text: "این‌طوری هم اطلاعات مشتری درست ثبت میشه، هم به مشکل نمی‌خوری.",
  },
  {
    startFrame: 980,
    endFrame: 1120,
    text: "اگه فروشگاه اینترنتی داری، این قابلیت جلوی کلی دردسر رو می‌گیره.",
  },
  {
    startFrame: 1125,
    endFrame: 1250,
    text: "برای آشنایی با نیاس لاگین، کلمه لاگین رو کامنت کن.",
  },
];

export const MinimalSubtitles: React.FC<{ fontFamily: string }> = ({
  fontFamily,
}) => {
  const frame = useCurrentFrame();

  const currentSub = SUBTITLES.find(
    (s) => frame >= s.startFrame && frame <= s.endFrame
  );

  if (!currentSub) return null;

  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        bottom: 120,
        left: 50,
        right: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        zIndex: 50,
        pointerEvents: "none",
        fontFamily,
      }}
    >
      <span
        style={{
          color: "#FFFFFF",
          fontSize: 27,
          fontWeight: 600,
          lineHeight: 1.5,
          letterSpacing: 0.3,
          maxWidth: 900,
        }}
      >
        {currentSub.text}
      </span>
    </div>
  );
};
