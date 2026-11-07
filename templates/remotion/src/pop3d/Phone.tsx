import React from "react";
import { RoundedBox } from "@react-three/drei";
import { faText, roundRect, useCanvasTexture } from "./fonts";
import { Glossy } from "./materials";
import { clamp, fa, T } from "./timing";
import { useLook } from "./look";

const W = 560;
const H = 1160;

const drawCheck = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string, p = 1) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.16;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const pts: [number, number][] = [
    [x - s * 0.4, y],
    [x - s * 0.1, y + s * 0.3],
    [x + s * 0.45, y - s * 0.35],
  ];
  ctx.beginPath();
  ctx.moveTo(...pts[0]);
  if (p < 0.4) {
    const q = p / 0.4;
    ctx.lineTo(pts[0][0] + (pts[1][0] - pts[0][0]) * q, pts[0][1] + (pts[1][1] - pts[0][1]) * q);
  } else {
    ctx.lineTo(...pts[1]);
    const q = (p - 0.4) / 0.6;
    ctx.lineTo(pts[1][0] + (pts[2][0] - pts[1][0]) * q, pts[1][1] + (pts[2][1] - pts[1][1]) * q);
  }
  ctx.stroke();
  ctx.restore();
};

const statusBar = (ctx: CanvasRenderingContext2D, dark = false) => {
  const c = dark ? "#fff" : "#1b1b2f";
  ctx.fillStyle = c;
  ctx.font = "700 26px Peyda";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("۹:۴۱", 44, 52);
  roundRect(ctx, W - 96, 40, 48, 24, 7);
  ctx.strokeStyle = c;
  ctx.lineWidth = 3;
  ctx.stroke();
  roundRect(ctx, W - 92, 44, 34, 16, 4);
  ctx.fill();
  // notch
  ctx.fillStyle = "#0d0d1a";
  roundRect(ctx, W / 2 - 80, 28, 160, 44, 22);
  ctx.fill();
};

const drawShop = (ctx: CanvasRenderingContext2D, t: number, premium = false) => {
  ctx.fillStyle = "#fff8e6";
  ctx.fillRect(0, 0, W, H);
  statusBar(ctx);
  faText(ctx, "فروشگاه من", W / 2, 130, 40, "#1b1b2f", { weight: 900 });
  // product card
  ctx.fillStyle = premium ? "#e9e9f0" : "#ffd23f";
  roundRect(ctx, 50, 190, W - 100, 420, 40);
  ctx.fill();
  // a simple shopping bag
  ctx.fillStyle = premium ? "#7c5cff" : "#ff5c8a";
  roundRect(ctx, W / 2 - 110, 300, 220, 230, 26);
  ctx.fill();
  ctx.strokeStyle = premium ? "#7c5cff" : "#ff5c8a";
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(W / 2, 300, 60, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(W / 2, 410, 34, 0, Math.PI * 2);
  ctx.fill();
  faText(ctx, "کیف چرمی", W / 2, 670, 40, "#1b1b2f", { weight: 800 });
  faText(ctx, "۸۹۰٬۰۰۰ تومان", W / 2, 730, 34, "#6b6b80", { weight: 700 });
  const p = clamp((t - 0.92) / 0.35);
  ctx.fillStyle = p > 0 ? "#18c37e" : "#6c3bff";
  roundRect(ctx, 60, 850, W - 120, 120, 60);
  ctx.fill();
  if (p > 0) {
    faText(ctx, "خرید موفق", W / 2 + 30, 910, 40, "#fff", { weight: 900 });
    drawCheck(ctx, 150, 910, 56, "#fff", p);
  } else {
    faText(ctx, "پرداخت", W / 2, 910, 40, "#fff", { weight: 900 });
  }
};

const drawForm = (ctx: CanvasRenderingContext2D, t: number) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  statusBar(ctx);
  faText(ctx, "اطلاعات ارسال", W / 2, 140, 42, "#1b1b2f", { weight: 900 });
  // name field (already filled)
  faText(ctx, "نام", W - 60, 240, 28, "#8a8aa0", { align: "right" });
  ctx.strokeStyle = "#e3e3ef";
  ctx.lineWidth = 4;
  roundRect(ctx, 50, 270, W - 100, 100, 26);
  ctx.stroke();
  faText(ctx, "سارا محمدی", W - 80, 320, 34, "#1b1b2f", { align: "right" });
  // phone field
  faText(ctx, "شماره موبایل", W - 60, 430, 28, "#8a8aa0", { align: "right" });
  const wrong = t >= T.wrong;
  ctx.strokeStyle = wrong ? "#ff3b4e" : "#6c3bff";
  ctx.lineWidth = wrong ? 7 : 5;
  roundRect(ctx, 50, 460, W - 100, 110, 28);
  ctx.stroke();
  const digits = "09123456789";
  const shown = Math.floor(clamp((t - 2.05) / 0.8) * digits.length);
  ctx.save();
  ctx.font = "800 46px Peyda";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  let x = 90;
  for (let i = 0; i < shown; i++) {
    const isWrong = wrong && (i === 6 || i === 7);
    ctx.fillStyle = isWrong ? "#ff3b4e" : "#1b1b2f";
    const d = fa(digits[i]);
    // the wrong pair is swapped: 6 5 instead of 5 6 after the mistake
    const ch = isWrong ? fa(i === 6 ? "6" : "5") : d;
    ctx.fillText(ch, x, 516 + (isWrong ? Math.sin(t * 60) * 3 : 0));
    x += 36 + (i === 3 || i === 6 ? 14 : 0);
  }
  if (!wrong && shown < digits.length && Math.floor(t * 4) % 2 === 0) {
    ctx.fillStyle = "#6c3bff";
    ctx.fillRect(x, 490, 4, 54);
  }
  ctx.restore();
  if (wrong) {
    ctx.fillStyle = "#ff3b4e";
    ctx.beginPath();
    ctx.arc(W - 100, 640, 26, 0, Math.PI * 2);
    ctx.fill();
    faText(ctx, "!", W - 100, 642, 34, "#fff", { weight: 900 });
    faText(ctx, "دو رقم جابه‌جا شد", W - 145, 642, 30, "#ff3b4e", { weight: 800, align: "right" });
  }
  // submit goes through anyway – nobody checks
  const sent = clamp((t - 3.4) / 0.3);
  ctx.fillStyle = sent > 0 ? "#18c37e" : "#6c3bff";
  roundRect(ctx, 60, 900, W - 120, 120, 60);
  ctx.fill();
  faText(ctx, sent > 0 ? "سفارش ثبت شد" : "ثبت سفارش", W / 2, 960, 40, "#fff", { weight: 900 });
};

const drawCall = (ctx: CanvasRenderingContext2D, t: number) => {
  const failed = t >= 5.82;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, failed ? "#4a0d1c" : "#22184d");
  g.addColorStop(1, failed ? "#1a0509" : "#0c0820");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  statusBar(ctx, true);
  // pulsing rings
  for (let i = 0; i < 3; i++) {
    const p = ((t * 0.9 + i / 3) % 1);
    ctx.strokeStyle = failed ? `rgba(255,59,78,${(1 - p) * 0.5})` : `rgba(160,140,255,${(1 - p) * 0.6})`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(W / 2, 360, 110 + p * 140, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = failed ? "#ff3b4e" : "#8b6bff";
  ctx.beginPath();
  ctx.arc(W / 2, 360, 110, 0, Math.PI * 2);
  ctx.fill();
  // user glyph
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(W / 2, 330, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(W / 2, 420, 62, 40, 0, Math.PI, 0);
  ctx.fill();
  faText(ctx, "سارا محمدی", W / 2, 560, 42, "#fff", { weight: 900 });
  faText(ctx, fa("0912 346 5789"), W / 2, 620, 32, "rgba(255,255,255,.7)", { weight: 700 });
  const dots = ".".repeat(1 + (Math.floor(t * 3) % 3));
  faText(
    ctx,
    failed ? "شماره نامعتبر است" : "در حال تماس" + dots,
    W / 2,
    720,
    36,
    failed ? "#ff8a95" : "#cfc4ff",
    { weight: 800 },
  );
  // hang-up button
  ctx.fillStyle = "#ff3b4e";
  ctx.beginPath();
  ctx.arc(W / 2, 960, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(W / 2, 985, 38, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
};

const drawOtp = (ctx: CanvasRenderingContext2D, t: number) => {
  const ok = t >= T.ehraz;
  ctx.fillStyle = "#f6f3ff";
  ctx.fillRect(0, 0, W, H);
  statusBar(ctx);
  // shield badge
  ctx.fillStyle = ok ? "#18c37e" : "#6c3bff";
  ctx.beginPath();
  ctx.moveTo(W / 2, 150);
  ctx.lineTo(W / 2 + 90, 190);
  ctx.lineTo(W / 2 + 80, 300);
  ctx.quadraticCurveTo(W / 2, 370, W / 2, 370);
  ctx.quadraticCurveTo(W / 2, 370, W / 2 - 80, 300);
  ctx.lineTo(W / 2 - 90, 190);
  ctx.closePath();
  ctx.fill();
  if (ok) drawCheck(ctx, W / 2, 262, 80, "#fff", clamp((t - T.ehraz) / 0.35));
  else faText(ctx, "۴", W / 2, 262, 70, "#fff", { weight: 900 });
  faText(ctx, ok ? "شماره تأیید شد" : "تأیید شماره موبایل", W / 2, 440, 42, ok ? "#18a36b" : "#1b1b2f", { weight: 900 });
  faText(ctx, "کد ارسال‌شده به " + fa("0912•••4567"), W / 2, 500, 28, "#6b6b80", { weight: 700 });
  // the 4 slots on screen (3D tiles float in front of them)
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = ok ? "#18c37e" : "#cbbcff";
    ctx.lineWidth = 5;
    roundRect(ctx, 70 + i * 110, 600, 90, 110, 22);
    ctx.stroke();
  }
  ctx.fillStyle = ok ? "#18c37e" : "#6c3bff";
  roundRect(ctx, 60, 900, W - 120, 120, 60);
  ctx.fill();
  faText(ctx, ok ? "ادامه خرید" : "تأیید", W / 2, 960, 40, "#fff", { weight: 900 });
};

export const Phone: React.FC<{ t: number }> = ({ t }) => {
  const mode = t < 1.7 ? "shop" : t < 4.08 ? "form" : t < 7 ? "call" : "otp";
  const frameKey = Math.round(t * 30);
  const { premium } = useLook();
  const tex = useCanvasTexture(
    W,
    H,
    (ctx) => {
      if (mode === "shop") drawShop(ctx, t, premium);
      else if (mode === "form") drawForm(ctx, t);
      else if (mode === "call") drawCall(ctx, t);
      else drawOtp(ctx, t);
    },
    [frameKey],
  );
  return (
    <group>
      <RoundedBox args={[1.5, 3.05, 0.16]} radius={0.075} smoothness={6} castShadow>
        <Glossy color="#1b1b2f" rough={0.2} />
      </RoundedBox>
      {/* side button */}
      <mesh position={[0.77, 0.6, 0]}>
        <boxGeometry args={[0.03, 0.3, 0.06]} />
        <Glossy color="#2c2c48" />
      </mesh>
      <mesh position={[0, 0, 0.082]}>
        <planeGeometry args={[1.38, 2.86]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
};
