import { Easing, interpolate } from "remotion";

export const FPS = 30;
export const DURATION_S = 41.84;
export const DURATION_FRAMES = Math.ceil(DURATION_S * FPS);

export const sec = (frame: number) => frame / FPS;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0→1 progress of t between a and b with easing */
export const prog = (
  t: number,
  a: number,
  b: number,
  ease: (x: number) => number = Easing.inOut(Easing.cubic),
) => ease(clamp((t - a) / (b - a)));

export const easeOutBack = (x: number, s = 1.70158) => {
  const c3 = s + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
};
export const easeOutElastic = (x: number) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
};
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInCubic = (x: number) => x * x * x;

/** Presence of an element living in [a, b] with pop-in / quick-out (seconds). */
export const presence = (t: number, a: number, b: number, inDur = 0.45, outDur = 0.3, smooth = false) => {
  if (t < a || t > b + outDur) return 0;
  const i = smooth ? easeOutCubic(clamp((t - a) / (inDur * 1.4))) : easeOutBack(clamp((t - a) / inDur), 2.2);
  const o = 1 - easeInCubic(clamp((t - b) / outDur));
  return i * o;
};

/** Piecewise keyframes: [[t, value], ...] with smooth easing between keys. */
export const keys = (t: number, k: [number, number][], ease = Easing.inOut(Easing.cubic)) =>
  interpolate(
    t,
    k.map((x) => x[0]),
    k.map((x) => x[1]),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease },
  );

/** Deterministic pseudo random */
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export type Word = { t: number; w: string };

/** Whisper word timings, spellings corrected. */
export const SEGMENTS: { a: number; b: number; words: Word[] }[] = [
  { a: 0, b: 1.7, words: [[0, "مشتری"], [0.46, "از"], [0.62, "سایتت"], [0.92, "خرید"], [1.32, "کرده"]] },
  { a: 1.7, b: 4.08, words: [[1.7, "ولی"], [2.1, "شماره"], [2.4, "موبایلش"], [2.82, "رو"], [2.92, "اشتباه"], [3.34, "وارد"], [3.64, "کرده"]] },
  { a: 4.08, b: 6.74, words: [[4.08, "حالا"], [4.92, "چطوری"], [5.42, "باید"], [5.62, "باهاش"], [5.82, "ارتباط"], [6.22, "بگیری؟"]] },
  { a: 6.74, b: 9.76, words: [[6.74, "مخصوصاً"], [7.54, "وقتی"], [7.82, "سفارشش"], [8.42, "هم"], [8.54, "یه"], [8.68, "مشکلی"], [9.14, "داشته"], [9.42, "باشه"]] },
  { a: 9.76, b: 12.56, words: [[9.76, "عملاً"], [10.56, "هیچ"], [10.94, "راهی"], [11.38, "برای"], [11.62, "پیگیری"], [12.06, "نداری"]] },
  { a: 12.56, b: 14.7, words: [[12.56, "اما"], [13.08, "راه"], [13.3, "حلش"], [13.68, "خیلی"], [14.14, "ساده"], [14.58, "است"]] },
  { a: 14.7, b: 17.64, words: [[14.7, "قبل"], [15.22, "از"], [15.36, "خرید"], [15.76, "شماره"], [16.2, "موبایل"], [16.54, "کاربر"], [16.9, "رو"], [17.06, "احراز"], [17.46, "کن"]] },
  { a: 17.64, b: 20.78, words: [[17.64, "با"], [18.1, "افزونه"], [18.52, "نیاس‌لاگین"], [19.28, "می‌تونی"], [19.68, "از"], [19.82, "بخش"], [20.06, "تنظیمات"]] },
  { a: 20.78, b: 22.98, words: [[20.78, "صفحه"], [21.18, "پرداخت"], [21.68, "ووکامرس"], [22.24, "رو"], [22.42, "قفل"], [22.74, "کنی"]] },
  { a: 22.98, b: 27.1, words: [[22.98, "تا"], [23.4, "کاربر"], [23.72, "فقط"], [24.18, "بعد"], [24.42, "از"], [24.58, "تأیید"], [24.88, "شماره"], [25.28, "موبایلش"], [25.78, "بتونه"], [26.1, "سفارش"], [26.52, "ثبت"], [26.82, "کنه"]] },
  { a: 27.1, b: 29.86, words: [[27.1, "اینطوری"], [27.68, "هم"], [27.88, "اطلاعات"], [28.34, "مشتری"], [28.78, "درست"], [29.2, "ثبت"], [29.56, "میشه"]] },
  { a: 29.86, b: 32.54, words: [[29.86, "هم"], [30.28, "موقع"], [30.5, "پیگیری"], [30.94, "سفارش"], [31.52, "به"], [31.64, "مشکل"], [32.08, "نمی‌خوری"]] },
  { a: 32.54, b: 34.34, words: [[32.54, "اگه"], [33.04, "فروشگاه"], [33.48, "اینترنتی"], [34.08, "داری"]] },
  { a: 34.34, b: 37.32, words: [[34.34, "این"], [34.6, "قابلیت"], [35.12, "می‌تونه"], [35.44, "جلوی"], [35.72, "کلی"], [36.24, "دردسر"], [36.52, "رو"], [36.78, "بگیره"]] },
  { a: 37.32, b: 39.88, words: [[37.32, "برای"], [37.8, "آشنایی"], [38.18, "بیشتر"], [38.6, "با"], [38.74, "امکانات"], [39.18, "نیاس‌لاگین"]] },
  { a: 39.88, b: 41.6, words: [[39.88, "کلمه‌ی"], [40.4, "لاگین"], [40.84, "رو"], [41.02, "کامنت"], [41.36, "کن"]] },
].map((s) => ({ a: s.a, b: s.b, words: (s.words as unknown as [number, string][]).map(([t, w]) => ({ t, w })) }));

/** Key moments (seconds) */
export const T = {
  wrong: 2.92,
  call: 4.08,
  box: 6.74,
  noWay: 9.76,
  hich: 10.56,
  drop: 12.56,
  simple: 14.14,
  verify: 14.7,
  ehraz: 17.06,
  plugin: 17.64,
  brand: 18.52,
  settings: 20.06,
  pay: 20.78,
  lock: 22.42,
  confirm: 24.58,
  submit: 26.52,
  info: 27.1,
  track: 29.86,
  shop: 32.54,
  shield: 35.44,
  dardsar: 36.24,
  cta: 37.32,
  loginWord: 40.4,
  end: 41.84,
};

export const fa = (n: number | string) =>
  String(n).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
