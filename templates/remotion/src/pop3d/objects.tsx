import React, { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { CatmullRomCurve3, Vector3 } from "three";
import { faText, roundRect, useCanvasTexture } from "./fonts";
import { checkGeometry, gearGeometry, Glossy, Matte, Metal, mix } from "./materials";
import { clamp, easeOutCubic, fa, rand } from "./timing";
import { useLook } from "./look";

/* ---------------- Question mark ---------------- */
export const QuestionMark: React.FC<{ color?: string }> = ({ color = "#FFE14D" }) => {
  const curve = useMemo(
    () =>
      new CatmullRomCurve3(
        [
          [-0.5, 0.55],
          [-0.42, 0.95],
          [0, 1.15],
          [0.44, 0.98],
          [0.5, 0.58],
          [0.22, 0.25],
          [0.02, 0.02],
          [0, -0.28],
        ].map(([x, y]) => new Vector3(x, y, 0)),
      ),
    [],
  );
  return (
    <group position={[0, -0.25, 0]}>
      <mesh castShadow>
        <tubeGeometry args={[curve, 80, 0.16, 24, false]} />
        <Glossy color={color} />
      </mesh>
      <mesh position={[0, 0.55 - 0.83, 0]} castShadow>
        <sphereGeometry args={[0.16, 32, 32]} />
        <Glossy color={color} />
      </mesh>
      <mesh position={[0, -0.72, 0]} castShadow>
        <sphereGeometry args={[0.2, 32, 32]} />
        <Glossy color={color} />
      </mesh>
    </group>
  );
};

/* ---------------- Parcel box ---------------- */
export const Parcel: React.FC<{ warn?: number; tint?: string }> = ({ warn = 0, tint = "#d39556" }) => {
  const sticker = useCanvasTexture(
    256,
    256,
    (ctx) => {
      ctx.fillStyle = "#ffd23f";
      ctx.beginPath();
      ctx.moveTo(128, 18);
      ctx.lineTo(240, 222);
      ctx.lineTo(16, 222);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1b1b2f";
      ctx.lineWidth = 12;
      ctx.lineJoin = "round";
      ctx.stroke();
      faText(ctx, "!", 128, 150, 130, "#1b1b2f", { weight: 900 });
    },
    [],
  );
  return (
    <group>
      <RoundedBox args={[1.5, 1.1, 1.1]} radius={0.06} smoothness={4} castShadow>
        <Matte color={tint} rough={0.8} />
      </RoundedBox>
      {/* tape */}
      <mesh position={[0, 0.555, 0]}>
        <boxGeometry args={[0.32, 0.012, 1.12]} />
        <Matte color="#f1d29b" rough={0.4} />
      </mesh>
      <mesh position={[0, 0.2, 0.556]}>
        <boxGeometry args={[0.32, 0.72, 0.012]} />
        <Matte color="#f1d29b" rough={0.4} />
      </mesh>
      {/* warning sticker */}
      <mesh position={[0.38, -0.12, 0.565]} scale={warn} rotation={[0, 0, -0.12]}>
        <planeGeometry args={[0.55, 0.55]} />
        <meshBasicMaterial map={sticker} transparent toneMapped={false} />
      </mesh>
    </group>
  );
};

/* ---------------- Track: tiles → wall or house ---------------- */
export const Track: React.FC<{ t0: number; t: number; mode: "dead" | "open"; boxAt: number; color: string }> = ({
  t0,
  t,
  mode,
  boxAt,
  color,
}) => {
  const n = 7;
  const tiles = Array.from({ length: n }, (_, i) => i);
  const startX = 1.65;
  const step = 0.52;
  const endX = startX - step * (n - 1);
  const { back: easeOutBack } = useLook();
  return (
    <group>
      {tiles.map((i) => {
        const s = easeOutBack(clamp((t - t0 - i * 0.06) / 0.35), 2);
        return (
          <RoundedBox
            key={i}
            args={[0.4, 0.08, 0.6]}
            radius={0.03}
            smoothness={3}
            position={[startX - i * step, 0, 0]}
            scale={[s, s, s]}
            receiveShadow
          >
            <Glossy color={color} />
          </RoundedBox>
        );
      })}
      {mode === "dead" ? (
        <group position={[endX - 0.62, 0.55, 0]} scale={easeOutBack(clamp((t - t0 - 0.5) / 0.4), 2.5)}>
          {[0, 1, 2].map((k) => (
            <RoundedBox key={k} args={[0.24, 1.1, 1]} radius={0.04} position={[0, 0, -0.33 + k * 0.33]} castShadow>
              <Glossy color={k % 2 ? "#ffffff" : "#ff3b4e"} />
            </RoundedBox>
          ))}
        </group>
      ) : (
        <group position={[endX - 0.75, 0.04, 0]} scale={easeOutBack(clamp((t - t0 - 0.5) / 0.4), 2.2)}>
          <House />
        </group>
      )}
      {/* moving parcel */}
      <group
        position={[startX - boxAt * (step * (n - 1) + (mode === "dead" ? 0.2 : 0.15)), 0.32, 0]}
        rotation={[0, 0.25, 0]}
        scale={0.4}
      >
        <Parcel warn={mode === "dead" ? 1 : 0} tint={mode === "dead" ? "#c98a4b" : "#d39556"} />
      </group>
    </group>
  );
};

export const House: React.FC = () => (
  <group>
    <RoundedBox args={[0.9, 0.7, 0.8]} radius={0.04} position={[0, 0.35, 0]} castShadow>
      <Glossy color="#ffffff" />
    </RoundedBox>
    <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[0.72, 0.55, 4]} />
      <Glossy color="#ff5c8a" />
    </mesh>
    <RoundedBox args={[0.24, 0.38, 0.05]} radius={0.03} position={[0, 0.2, 0.41]}>
      <Glossy color="#6c3bff" />
    </RoundedBox>
  </group>
);

/* ---------------- Gears ---------------- */
export const Gears: React.FC<{ t: number }> = ({ t }) => {
  const big = useMemo(() => gearGeometry(12, 0.82, 0.66, 0.26, 0.26), []);
  const small = useMemo(() => gearGeometry(8, 0.52, 0.38, 0.16, 0.26), []);
  const a = t * 1.4;
  return (
    <group>
      <mesh geometry={big} rotation={[0, 0, a]} position={[-0.35, 0.2, 0]} castShadow>
        <Glossy color="#ffffff" />
      </mesh>
      <mesh geometry={small} rotation={[0, 0, -a * (12 / 8) + 0.2]} position={[0.85, -0.55, 0.05]} castShadow>
        <Glossy color="#FFE14D" />
      </mesh>
    </group>
  );
};

/* ---------------- Generic textured card ---------------- */
export const Card: React.FC<{
  w: number;
  h: number;
  color?: string;
  draw: (ctx: CanvasRenderingContext2D, W: number, H: number) => void;
  deps: unknown[];
}> = ({ w, h, color = "#ffffff", draw, deps }) => {
  const px = 360;
  const tex = useCanvasTexture(Math.round(w * px), Math.round(h * px), draw, deps);
  return (
    <group>
      <RoundedBox args={[w, h, 0.12]} radius={0.06} smoothness={4} castShadow>
        <Glossy color={color} />
      </RoundedBox>
      <mesh position={[0, 0, 0.062]}>
        <planeGeometry args={[w - 0.06, h - 0.06]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
};

/* ---------------- Toggle ---------------- */
export const Toggle: React.FC<{ on: number }> = ({ on }) => (
  <group>
    <RoundedBox args={[0.8, 0.42, 0.2]} radius={0.2} smoothness={6}>
      <Glossy color={mix("#c9c3e6", "#18c37e", on)} />
    </RoundedBox>
    <mesh position={[-0.19 + 0.38 * on, 0, 0.12]} castShadow>
      <sphereGeometry args={[0.17, 32, 32]} />
      <Glossy color="#ffffff" />
    </mesh>
  </group>
);

/* ---------------- Padlock ---------------- */
export const Padlock: React.FC<{ open: number; glow: number; color?: string }> = ({ open, glow, color = "#FFC93C" }) => {
  // open: 0 closed .. 1 fully open (raised and swung)
  const lift = 0.5 * open;
  const swing = 0.9 * clamp((open - 0.5) / 0.5);
  return (
    <group>
      <RoundedBox args={[1.6, 1.25, 0.55]} radius={0.16} smoothness={6} castShadow>
        <Metal color={color} emissive="#18c37e" emissiveIntensity={glow * 0.8} />
      </RoundedBox>
      {/* keyhole */}
      <mesh position={[0, 0.1, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.04, 32]} />
        <Matte color="#3a2a08" />
      </mesh>
      <mesh position={[0, -0.12, 0.28]}>
        <boxGeometry args={[0.1, 0.3, 0.04]} />
        <Matte color="#3a2a08" />
      </mesh>
      {/* shackle pivots on the left leg */}
      <group position={[-0.45, 0.62 + lift, 0]} rotation={[0, swing, 0]}>
        <group position={[0.45, 0, 0]}>
          <mesh position={[0, 0.45, 0]}>
            <torusGeometry args={[0.45, 0.12, 24, 48, Math.PI]} />
            <Metal color="#d9dde8" />
          </mesh>
          <mesh position={[-0.45, 0.2, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.5, 24]} />
            <Metal color="#d9dde8" />
          </mesh>
          <mesh position={[0.45, 0.2, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.5, 24]} />
            <Metal color="#d9dde8" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/* ---------------- Check coin ---------------- */
export const CheckCoin: React.FC<{ spin: number }> = ({ spin }) => {
  const check = useMemo(() => checkGeometry(0.5, 0.08), []);
  return (
    <group rotation={[0, spin, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.14, 48]} />
        <Glossy color="#18c37e" />
      </mesh>
      <mesh geometry={check} position={[0, 0, 0.1]}>
        <Glossy color="#ffffff" />
      </mesh>
      <mesh geometry={check} position={[0, 0, -0.1]} rotation={[0, Math.PI, 0]}>
        <Glossy color="#ffffff" />
      </mesh>
    </group>
  );
};

/* ---------------- Confetti burst ---------------- */
const CONF = ["#FFE14D", "#ff5c8a", "#6c3bff", "#ffffff", "#18c37e", "#29B6F6"];
export const Confetti: React.FC<{ p: number; n?: number; seed?: number }> = ({ p, n = 36, seed = 1 }) => {
  const L = useLook();
  if (p <= 0 || p >= 1) return null;
  if (L.premium) {
    return (
      <group rotation={[Math.PI / 2 - 0.35, 0, 0]}>
        {[0, 0.18].map((d, k) => {
          const q = Math.min(1, Math.max(0, (p - d) / (1 - d)));
          if (q <= 0) return null;
          return (
            <mesh key={k} scale={0.4 + easeOutCubic(q) * 2.2}>
              <torusGeometry args={[1, 0.012, 8, 96]} />
              <meshBasicMaterial color={L.c("#18c37e")} transparent opacity={(1 - q) * 0.9} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
    );
  }
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const a = rand(i + seed) * Math.PI * 2;
        const v = 1.4 + rand(i * 3 + seed) * 2;
        const up = 1.5 + rand(i * 7 + seed) * 2;
        const x = Math.cos(a) * v * p;
        const y = up * p - 3.2 * p * p;
        const z = Math.sin(a) * v * p * 0.6;
        const s = 1 - p * 0.6;
        return (
          <mesh key={i} position={[x, y, z]} rotation={[p * 10 * rand(i), p * 8, p * 6 * rand(i + 9)]} scale={s}>
            {i % 3 === 0 ? <sphereGeometry args={[0.06, 12, 12]} /> : <boxGeometry args={[0.14, 0.06, 0.02]} />}
            <Glossy color={CONF[i % CONF.length]} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ---------------- Shop ---------------- */
export const Shop: React.FC = () => (
  <group>
    <RoundedBox args={[1.9, 1.3, 1.1]} radius={0.06} position={[0, 0.65, 0]} castShadow receiveShadow>
      <Glossy color="#ffffff" />
    </RoundedBox>
    {/* awning stripes */}
    {Array.from({ length: 7 }, (_, i) => (
      <mesh key={i} position={[-0.84 + i * 0.28, 1.36, 0.62]} rotation={[0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.28, 0.04, 0.55]} />
        <Glossy color={i % 2 ? "#ffffff" : "#ff5c8a"} />
      </mesh>
    ))}
    {/* door + window */}
    <RoundedBox args={[0.45, 0.75, 0.05]} radius={0.04} position={[0.45, 0.4, 0.56]}>
      <Glossy color="#6c3bff" />
    </RoundedBox>
    <RoundedBox args={[0.7, 0.45, 0.05]} radius={0.04} position={[-0.35, 0.6, 0.56]}>
      <Glossy color="#29B6F6" />
    </RoundedBox>
    {/* sign */}
    <RoundedBox args={[1.2, 0.36, 0.1]} radius={0.06} position={[0, 1.65, 0.3]} castShadow>
      <Glossy color="#FFE14D" />
    </RoundedBox>
  </group>
);

/* ---------------- Trouble ball ---------------- */
export const TroubleBall: React.FC = () => (
  <group>
    <mesh castShadow>
      <sphereGeometry args={[0.2, 32, 32]} />
      <Glossy color="#ff3b4e" />
    </mesh>
    <mesh position={[0, 0.04, 0.19]}>
      <boxGeometry args={[0.05, 0.13, 0.03]} />
      <Matte color="#fff" />
    </mesh>
    <mesh position={[0, -0.08, 0.19]}>
      <sphereGeometry args={[0.03, 12, 12]} />
      <Matte color="#fff" />
    </mesh>
  </group>
);

/* ---------------- Comment bubble ---------------- */
export const CommentBubble: React.FC<{ t: number; typeAt: number }> = ({ t, typeAt }) => {
  const L = useLook();
  const word = "لاگین";
  const frameKey = Math.round(t * 30);
  return (
    <group>
      <Card
        w={2.7}
        h={1.35}
        draw={(ctx, W, H) => {
          ctx.clearRect(0, 0, W, H);
          // input
          ctx.fillStyle = "#f2efff";
          roundRect(ctx, 40, 60, W - 80, H - 120, 60);
          ctx.fill();
          const p = clamp((t - typeAt) / 0.5);
          const shown = word.slice(0, Math.ceil(p * word.length));
          if (p > 0) faText(ctx, shown, W - 300, H / 2, 150, "#1b1b2f", { weight: 900, family: L.head });
          else faText(ctx, "کامنت بنویس…", W - 330, H / 2, 70, "#a39ccc", { weight: 700 });
          if (Math.floor(t * 3) % 2 === 0 && p < 1) {
            ctx.fillStyle = "#6c3bff";
            ctx.fillRect(W - 300 - (p > 0 ? 200 : 0) - 20, H / 2 - 70, 8, 140);
          }
          // send button
          const sent = t > typeAt + 0.65;
          ctx.fillStyle = L.c(sent ? "#18c37e" : "#6c3bff");
          ctx.beginPath();
          ctx.arc(170, H / 2, 95, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.moveTo(130, H / 2 - 45);
          ctx.lineTo(225, H / 2);
          ctx.lineTo(130, H / 2 + 45);
          ctx.lineTo(148, H / 2);
          ctx.closePath();
          ctx.fill();
        }}
        deps={[frameKey]}
      />
      <mesh position={[0.9, -0.78, 0]} rotation={[0, 0, Math.PI * 0.85]} castShadow>
        <coneGeometry args={[0.22, 0.42, 3]} />
        <Glossy color="#ffffff" />
      </mesh>
    </group>
  );
};

/* ---------------- OTP tiles ---------------- */
export const OtpTile: React.FC<{ digit: string; p: number; ok: boolean }> = ({ digit, p, ok }) => {
  const { back: easeOutBack, premium } = useLook();
  const tex = useCanvasTexture(
    256,
    256,
    (ctx) => {
      faText(ctx, digit, 128, 140, 190, ok ? "#ffffff" : premium ? "#2b2c33" : "#6c3bff", { weight: 900 });
    },
    [digit, ok, premium],
  );
  const s = easeOutBack(clamp(p / 0.6), 2.4);
  return (
    <group scale={s} rotation={[(1 - easeOutCubic(clamp(p))) * Math.PI, 0, 0]}>
      <RoundedBox args={[0.42, 0.5, 0.22]} radius={0.08} smoothness={5} castShadow>
        <Glossy color={ok ? "#18c37e" : "#ffffff"} />
      </RoundedBox>
      <mesh position={[0, 0, 0.115]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
};

export { fa };
