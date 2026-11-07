import React from "react";
import { AbsoluteFill, interpolateColors } from "remotion";
import { BODY, HEAD } from "./fonts";
import { clamp, easeInCubic, easeOutBack, easeOutCubic, prog, SEGMENTS, T } from "./timing";

/* ================= BACKGROUND ================= */
type BgKey = { t: number; c: string; c2: string; x: number; y: number; dur: number };
const BG: BgKey[] = [
  { t: -1, c: "#FFD23F", c2: "#FFB703", x: 50, y: 50, dur: 0.01 },
  { t: T.wrong, c: "#FF6B5B", c2: "#E63946", x: 50, y: 52, dur: 0.45 },
  { t: T.noWay, c: "#B3123B", c2: "#5C0A22", x: 50, y: 60, dur: 0.6 },
  { t: T.drop, c: "#7B3FFF", c2: "#4B1FD1", x: 50, y: 50, dur: 0.38 },
  { t: T.pay, c: "#3546E8", c2: "#1E2A9E", x: 50, y: 55, dur: 0.5 },
  { t: 24.9, c: "#00C9A7", c2: "#00997F", x: 50, y: 55, dur: 0.45 },
  { t: T.shop, c: "#29B6F6", c2: "#0277BD", x: 50, y: 62, dur: 0.5 },
  { t: T.cta, c: "#FF4FA3", c2: "#C2187A", x: 50, y: 50, dur: 0.45 },
];

const Layer: React.FC<{ k: BgKey; t: number; darken?: number }> = ({ k, t, darken = 0 }) => {
  const g = `radial-gradient(120% 75% at 50% 32%, ${k.c} 0%, ${k.c} 35%, ${k.c2} 100%)`;
  return <AbsoluteFill style={{ background: g, filter: darken ? `brightness(${1 - darken})` : undefined }} />;
};

export const premiumAccent = (t: number) =>
  interpolateColors(
    t,
    [0, 2.7, 3.1, 9.6, 10.2, 12.4, 12.7, 24.7, 25.1, 32.4, 32.8, 37.2, 37.6],
    ["#6b7cff", "#6b7cff", "#e5484d", "#e5484d", "#b3262f", "#b3262f", "#8b6cff", "#8b6cff", "#2fbf88", "#2fbf88", "#5b8cff", "#5b8cff", "#8b6cff"],
  );

const PremiumBackground: React.FC<{ t: number }> = ({ t }) => {
  const acc = premiumAccent(t);
  const dim = t > T.hich && t < T.drop ? 0.45 * prog(t, T.hich, 11.4) : 0;
  const pulse = t >= T.drop && t < T.drop + 0.8 ? 1 - (t - T.drop) / 0.8 : 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 40%, #1a1b23 0%, #0d0d12 55%, #050507 100%)" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(55% 32% at 50% 52%, ${acc} 0%, transparent 100%)`,
          opacity: 0.32 * (1 - dim) + pulse * 0.35,
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1235, height: 2, background: `linear-gradient(90deg, transparent, ${acc}, transparent)`, opacity: 0.35 }} />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0 ${t * 6}px`,
          maskImage: "radial-gradient(70% 50% at 50% 55%, black 0%, transparent 100%)",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(100% 70% at 50% 45%, transparent 50%, rgba(0,0,0,.6) 100%)" }} />
    </AbsoluteFill>
  );
};

export const Background: React.FC<{ t: number; premium?: boolean }> = ({ t, premium }) => {
  if (premium) return <PremiumBackground t={t} />;
  let i = 0;
  for (let j = 0; j < BG.length; j++) if (t >= BG[j].t) i = j;
  const cur = BG[i];
  const prev = BG[Math.max(0, i - 1)];
  const p = clamp((t - cur.t) / cur.dur);
  const r = easeOutCubic(p) * 160;
  // crimson section darkens on «هیچ»
  const darken = t > T.hich && t < T.drop ? 0.35 * prog(t, T.hich, 11.4) : 0;
  return (
    <AbsoluteFill>
      <Layer k={prev} t={t} />
      <AbsoluteFill style={{ clipPath: `circle(${r}% at ${cur.x}% ${cur.y}%)` }}>
        <Layer k={cur} t={t} darken={darken} />
      </AbsoluteFill>
      {/* dotted texture that drifts */}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,.16) 2.5px, transparent 3px)",
          backgroundSize: "46px 46px",
          backgroundPosition: `${t * 12}px ${t * 20}px`,
          maskImage: "radial-gradient(90% 60% at 50% 50%, transparent 30%, black 100%)",
        }}
      />
      {/* big soft orbs */}
      {[0, 1, 2].map((n) => (
        <div
          key={n}
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            left: 540 - 350 + Math.sin(t * 0.3 + n * 2.1) * 380,
            top: 960 - 350 + Math.cos(t * 0.25 + n * 1.7) * 650,
            background: "radial-gradient(circle, rgba(255,255,255,.22), transparent 65%)",
          }}
        />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(110% 70% at 50% 45%, transparent 55%, rgba(0,0,0,.28) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ================= HEADLINES ================= */
type W = { w: string; at?: number; hi?: boolean; fx?: "glitch" | "shake" | "strike" | "stamp" | "grow" };
type Head = {
  a: number;
  b: number;
  lines: W[][];
  anim: "drop" | "pop" | "flip" | "slide" | "stamp" | "swing" | "rise";
  size?: number;
  shade: string; // extrusion colour
  hi: string; // highlight colour
  hiShade?: string;
  y?: number;
};

const w = (s: string, o: Partial<W> = {}): W => ({ w: s, ...o });

const HEADS: Head[] = [
  { a: 0.05, b: 1.62, anim: "drop", shade: "#C98A00", hi: "#6C3BFF", hiShade: "#3a1d99", lines: [[w("مشتری"), w("خرید", { at: 0.92, hi: true, fx: "grow" }), w("کرد", { at: 1.2 })]] },
  {
    a: 1.7,
    b: 4.0,
    anim: "slide",
    shade: "#b02a1f",
    hi: "#FFE14D",
    hiShade: "#a3700a",
    lines: [[w("شماره رو", { at: 2.1 })], [w("اشتباه", { at: T.wrong, hi: true, fx: "glitch" }), w("زد", { at: 3.34 })]],
  },
  { a: 4.08, b: 6.62, anim: "swing", shade: "#b02a1f", hi: "#FFE14D", hiShade: "#a3700a", lines: [[w("حالا"), w("چطوری", { at: 4.92 })], [w("پیداش", { at: 5.62, hi: true }), w("کنی؟", { at: 6.0 })]] },
  { a: 6.74, b: 9.66, anim: "flip", shade: "#b02a1f", hi: "#FFE14D", hiShade: "#a3700a", lines: [[w("سفارشش", { at: 7.82 }), w("هم")], [w("مشکل", { at: 8.68, hi: true, fx: "stamp" }), w("داره!", { at: 9.14 })]] },
  {
    a: 9.76,
    b: 12.42,
    anim: "rise",
    size: 150,
    shade: "#3a0010",
    hi: "#FFE14D",
    hiShade: "#7a4a00",
    lines: [[w("هیچ", { at: T.hich, hi: true, fx: "shake" }), w("راهی", { at: 10.94 })], [w("برای"), w("پیگیری", { at: 11.62, fx: "strike" })]],
  },
  { a: T.drop, b: 14.6, anim: "stamp", size: 170, shade: "#2a0d8a", hi: "#FFE14D", hiShade: "#8a5a00", lines: [[w("راه‌حلش", { at: 13.08 })], [w("خیلی", { at: 13.68 }), w("ساده‌ست", { at: T.simple, hi: true, fx: "grow" })]] },
  { a: 14.7, b: 17.55, anim: "pop", shade: "#2a0d8a", hi: "#FFE14D", hiShade: "#8a5a00", lines: [[w("قبل از خرید")], [w("موبایل رو", { at: 15.76 }), w("احراز کن", { at: T.ehraz, hi: true, fx: "stamp" })]] },
  { a: 17.64, b: 20.7, anim: "slide", shade: "#2a0d8a", hi: "#FFE14D", hiShade: "#8a5a00", lines: [[w("افزونه", { at: 18.1 })], [w("نیاس‌لاگین", { at: T.brand, hi: true, fx: "grow" })]] },
  { a: T.pay, b: 22.9, anim: "drop", shade: "#111a6e", hi: "#FFE14D", hiShade: "#8a5a00", size: 150, lines: [[w("صفحه پرداخت رو", { at: 21.0 })], [w("قفل کن", { at: T.lock, hi: true, fx: "stamp" })]] },
  { a: 22.98, b: 27.0, anim: "flip", shade: "#111a6e", hi: "#FFE14D", hiShade: "#8a5a00", lines: [[w("اول", { at: 23.72 }), w("تأیید", { at: T.confirm, hi: true, fx: "grow" })], [w("بعد", { at: 25.4 }), w("ثبت سفارش", { at: T.submit })]] },
  { a: 27.1, b: 32.4, anim: "pop", shade: "#006b58", hi: "#FFFFFF", hiShade: "#006b58", lines: [[w("نتیجه؟", { hi: true })]] },
  { a: T.shop, b: 35.3, anim: "swing", shade: "#01477a", hi: "#FFE14D", hiShade: "#8a5a00", lines: [[w("فروشگاه", { at: 33.04 }), w("اینترنتی", { at: 33.48 })], [w("داری؟", { at: 34.08, hi: true })]] },
  { a: T.shield, b: 37.2, anim: "stamp", shade: "#01477a", hi: "#FF5C8A", hiShade: "#8a0f3a", lines: [[w("جلوی کلی")], [w("دردسر", { at: T.dardsar, hi: true, fx: "shake" }), w("رو بگیر", { at: 36.6 })]] },
  { a: T.cta, b: 39.75, anim: "rise", shade: "#8a0f4f", hi: "#FFE14D", hiShade: "#8a5a00", lines: [[w("امکانات کامل")], [w("نیاس‌لاگین", { at: 39.18, hi: true })]] },
  { a: 39.88, b: 45, anim: "drop", shade: "#8a0f4f", hi: "#FFE14D", hiShade: "#8a5a00", size: 150, lines: [[w("بنویس", { at: 40.2 }), w("«لاگین»", { at: T.loginWord, hi: true, fx: "stamp" })], [w("توی کامنت‌ها", { at: 41.02 })]] },
];

const extrude = (c: string, depth = 10) => {
  const s: string[] = [];
  for (let i = 1; i <= depth; i++) s.push(`0 ${i}px 0 ${c}`);
  s.push(`0 ${depth + 8}px 26px rgba(0,0,0,.28)`);
  return s.join(",");
};

const enterStyle = (anim: Head["anim"], p: number): React.CSSProperties => {
  const e = easeOutBack(p, 1.9);
  switch (anim) {
    case "drop":
      return { transform: `translateY(${(1 - e) * -160}px)`, opacity: Math.min(1, p * 3) };
    case "pop":
      return { transform: `scale(${e})`, opacity: Math.min(1, p * 3) };
    case "flip":
      return { transform: `perspective(800px) rotateX(${(1 - e) * 95}deg)`, opacity: Math.min(1, p * 3) };
    case "slide":
      return { transform: `translateX(${(1 - e) * 220}px) skewX(${(1 - e) * -12}deg)`, opacity: Math.min(1, p * 3) };
    case "stamp":
      return { transform: `scale(${1 + (1 - easeOutCubic(p)) * 1.6})`, opacity: Math.min(1, p * 2.2), filter: `blur(${(1 - p) * 10}px)` };
    case "swing":
      return { transform: `perspective(900px) rotateY(${(1 - e) * -70}deg)`, transformOrigin: "right center", opacity: Math.min(1, p * 3) };
    case "rise":
    default:
      return { transform: `translateY(${(1 - e) * 120}px)`, opacity: Math.min(1, p * 3) };
  }
};

const PremiumWord: React.FC<{ word: W; t: number; start: number; size: number }> = ({ word, t, start, size }) => {
  const at = word.at ?? start;
  const p = clamp((t - at) / 0.55);
  if (p <= 0) return <span style={{ display: "inline-block", opacity: 0, margin: `0 ${size * 0.14}px` }}>{word.w}</span>;
  const e = easeOutCubic(p);
  const d = t - at;
  const acc = premiumAccent(t);
  let tr = `translateY(${(1 - e) * 36}px)`;
  let shadow = "0 10px 34px rgba(0,0,0,.55)";
  if (word.fx === "glitch" && d < 0.6) {
    const k = Math.floor(t * 30) % 2 ? 1 : -1;
    shadow = `${k * 3 * (1 - d / 0.6)}px 0 0 rgba(229,72,77,.8), ${-k * 3 * (1 - d / 0.6)}px 0 0 rgba(91,140,255,.8), ` + shadow;
  }
  if (word.fx === "shake") tr += ` translateX(${Math.sin(t * 50) * 3 * Math.exp(-d * 2)}px)`;
  if (word.fx === "stamp" && d < 0.45) tr += ` scale(${1 + (1 - easeOutCubic(d / 0.45)) * 0.12})`;
  const strikeP = word.fx === "strike" ? clamp((d - 0.25) / 0.4) : 0;
  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        color: word.hi ? acc : strikeP > 0 ? "rgba(255,255,255,.55)" : "#ffffff",
        textShadow: shadow,
        opacity: e,
        filter: `blur(${(1 - e) * 10}px)`,
        transform: tr,
        margin: `0 ${size * 0.14}px`,
      }}
    >
      {word.w}
      {strikeP > 0 && (
        <span style={{ position: "absolute", right: -6, top: "55%", height: 6, width: `calc(${strikeP * 100}% + 12px)`, background: acc, borderRadius: 6 }} />
      )}
    </span>
  );
};

const Word: React.FC<{ word: W; t: number; start: number; head: Head; size: number }> = ({ word, t, start, head, size }) => {
  const at = word.at ?? start;
  const p = clamp((t - at) / 0.42);
  if (p <= 0) return <span style={{ display: "inline-block", opacity: 0 }}>{word.w}</span>;
  const base = enterStyle(head.anim, p);
  let extra = "";
  let color = word.hi ? head.hi : "#ffffff";
  let shadow = extrude(word.hi ? head.hiShade ?? head.shade : head.shade);
  const d = t - at;
  if (word.fx === "glitch" && d < 0.9) {
    const k = Math.floor(t * 30) % 4;
    extra = ` translate(${[8, -10, 4, -6][k] * (1 - d)}px, ${[-3, 4, -5, 2][k] * (1 - d)}px)`;
    shadow = `${(k % 2 ? 7 : -7) * (1 - d)}px 0 0 #00F0FF, ${(k % 2 ? -7 : 7) * (1 - d)}px 0 0 #FF2E63, ` + shadow;
  }
  if (word.fx === "shake") extra = ` rotate(${Math.sin(t * 40) * 3 * Math.exp(-d * 1.2)}deg) translateX(${Math.sin(t * 55) * 6 * Math.exp(-d * 1.5)}px)`;
  if (word.fx === "grow") extra = ` scale(${1 + 0.18 * Math.sin(clamp(d / 0.5) * Math.PI)})`;
  if (word.fx === "stamp" && d < 0.35) extra = ` scale(${1 + (1 - easeOutCubic(d / 0.35)) * 0.8}) rotate(${(1 - d / 0.35) * -6}deg)`;
  const strikeP = word.fx === "strike" ? clamp((d - 0.25) / 0.35) : 0;
  if (word.fx === "strike" && strikeP > 0) color = "rgba(255,255,255,.75)";
  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        color,
        textShadow: shadow,
        ...base,
        transform: `${base.transform ?? ""}${extra}`,
        margin: `0 ${size * 0.12}px`,
      }}
    >
      {word.w}
      {strikeP > 0 && (
        <span
          style={{
            position: "absolute",
            right: -10,
            top: "52%",
            height: size * 0.12,
            width: `calc(${strikeP * 100}% + 20px)`,
            background: "#FFE14D",
            borderRadius: 20,
            transform: "rotate(-4deg)",
            boxShadow: "0 6px 0 #7a4a00",
          }}
        />
      )}
    </span>
  );
};

export const Headlines: React.FC<{ t: number; premium?: boolean }> = ({ t, premium }) => {
  return (
    <AbsoluteFill>
      {HEADS.map((h, i) => {
        if (t < h.a || t > h.b + 0.3) return null;
        const out = easeInCubic(clamp((t - h.b) / 0.25));
        const size = (h.size ?? 132) * (premium ? 0.74 : 1);
        let n = 0;
        return (
          <div
            key={i}
            dir="rtl"
            lang="fa"
            style={{
              position: "absolute",
              top: premium ? 320 : h.y ?? 285,
              left: 70,
              right: 70,
              textAlign: "center",
              fontFamily: premium ? BODY : HEAD,
              fontWeight: premium ? 800 : 900,
              fontSize: size,
              lineHeight: premium ? 1.3 : 1.12,
              opacity: 1 - out,
              transform: `scale(${1 - out * 0.15}) translateY(${-out * 40}px)`,
            }}
          >
            {h.lines.map((line, li) => (
              <div key={li} style={{ whiteSpace: "nowrap" }}>
                {line.map((word, wi) => {
                  const start = h.a + n++ * 0.09;
                  return premium ? (
                    <PremiumWord key={wi} word={word} t={t} start={start} size={size} />
                  ) : (
                    <Word key={wi} word={word} t={t} start={start} head={h} size={size} />
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ================= RESULT CHIPS (27–32 s) ================= */
const Chip: React.FC<{ t: number; at: number; label: string; y: number; premium?: boolean }> = ({ t, at, label, y, premium }) => {
  const p = clamp((t - at) / 0.45);
  const out = easeInCubic(clamp((t - 32.35) / 0.25));
  if (p <= 0) return null;
  const e = premium ? easeOutCubic(p) : easeOutBack(p, 2.2);
  if (premium)
    return (
      <div dir="rtl" style={{ position: "absolute", top: y - 40, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: e * (1 - out), transform: `translateY(${(1 - e) * 24}px)` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            background: "rgba(255,255,255,.07)",
            border: "1.5px solid rgba(255,255,255,.16)",
            borderRadius: 60,
            padding: "14px 30px 14px 20px",
            boxShadow: "0 20px 50px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.12)",
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 44,
            color: "#f2f2f5",
          }}
        >
          <span>{label}</span>
          <svg width="52" height="52" viewBox="0 0 74 74">
            <circle cx="37" cy="37" r="33" fill="none" stroke="#2fbf88" strokeWidth="5" />
            <path d="M22 38 L33 49 L53 27" stroke="#2fbf88" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset={60 * (1 - clamp((t - at - 0.15) / 0.35))} />
          </svg>
        </div>
      </div>
    );
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: y,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: 1 - out,
        transform: `scale(${e * (1 - out * 0.2)}) rotate(${(1 - e) * 8}deg)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          background: "#ffffff",
          borderRadius: 80,
          padding: "16px 34px 16px 22px",
          boxShadow: "0 12px 0 #00806a, 0 26px 40px rgba(0,0,0,.25)",
          fontFamily: BODY,
          fontWeight: 900,
          fontSize: 60,
          color: "#0b3d33",
        }}
      >
        <span>{label}</span>
        <svg width="74" height="74" viewBox="0 0 74 74">
          <circle cx="37" cy="37" r="35" fill="#18c37e" />
          <path d="M20 38 L32 50 L55 25" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset={60 * (1 - clamp((t - at - 0.15) / 0.3))} />
        </svg>
      </div>
    </div>
  );
};

export const Chips: React.FC<{ t: number; premium?: boolean }> = ({ t, premium }) => (
  <AbsoluteFill>
    <Chip t={t} at={27.88} label="اطلاعات درست" y={470} premium={premium} />
    <Chip t={t} at={30.5} label="پیگیری بی‌دردسر" y={600} premium={premium} />
  </AbsoluteFill>
);

/* ================= CAPTIONS ================= */
type Chunk = { a: number; b: number; words: { t: number; w: string }[] };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const s of SEGMENTS) {
    const n = s.words.length;
    const parts = n <= 5 ? [s.words] : [s.words.slice(0, Math.ceil(n / 2)), s.words.slice(Math.ceil(n / 2))];
    parts.forEach((p, i) => {
      const next = parts[i + 1];
      out.push({ a: p[0].t, b: next ? next[0].t : s.b, words: p });
    });
  }
  return out;
})();

export const Captions: React.FC<{ t: number; accent: string; premium?: boolean }> = ({ t, accent, premium }) => {
  const c = CHUNKS.find((k) => t >= k.a - 0.05 && t < k.b);
  if (!c) return null;
  const p = clamp((t - c.a + 0.05) / 0.2);
  return (
    <div
      dir="rtl"
      lang="fa"
      style={{
        position: "absolute",
        top: 1370,
        left: 80,
        right: 80,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "6px 4px",
        fontFamily: BODY,
        fontWeight: premium ? 600 : 800,
        fontSize: premium ? 46 : 54,
        transform: `translateY(${(1 - easeOutCubic(p)) * 30}px)`,
        opacity: p,
      }}
    >
      {c.words.map((wd, i) => {
        const nextT = c.words[i + 1]?.t ?? c.b;
        const active = t >= wd.t && t < nextT;
        const said = t >= wd.t;
        if (premium)
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                padding: "2px 9px 8px",
                color: active ? premiumAccent(t) : said ? "#ffffff" : "rgba(255,255,255,.42)",
                textShadow: "0 4px 18px rgba(0,0,0,.6)",
                borderBottom: active ? `3px solid ${premiumAccent(t)}` : "3px solid transparent",
              }}
            >
              {wd.w}
            </span>
          );
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              padding: "4px 18px 10px",
              borderRadius: 18,
              background: active ? "#ffffff" : "rgba(0,0,0,.22)",
              color: active ? accent : said ? "#ffffff" : "rgba(255,255,255,.65)",
              transform: `scale(${active ? 1.08 : 1}) translateY(${active ? -4 : 0}px)`,
              boxShadow: active ? "0 7px 0 rgba(0,0,0,.25)" : "none",
            }}
          >
            {wd.w}
          </span>
        );
      })}
    </div>
  );
};

export const captionAccent = (t: number) =>
  interpolateColors(
    t,
    [0, 2.9, 3.0, 12.5, 12.6, 24.8, 25, 32.5, 32.6, 37.3, 37.4],
    ["#C98A00", "#C98A00", "#E63946", "#E63946", "#5B2BE0", "#2B3BD6", "#00997F", "#00997F", "#0277BD", "#0277BD", "#C2187A"],
  );

/* ================= FLASHES ================= */
export const Flashes: React.FC<{ t: number; premium?: boolean }> = ({ t, premium }) => {
  const hits = [T.drop, T.lock, 24.9];
  let o = 0;
  const k = premium ? 0.16 : 0.55;
  for (const h of hits) if (t >= h && t < h + 0.25) o = Math.max(o, k * (1 - (t - h) / 0.25));
  return o > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: o }} /> : null;
};
