import React, { useLayoutEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { PMREMGenerator, PerspectiveCamera as PC } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Phone } from "./Phone";
import {
  Card,
  CheckCoin,
  CommentBubble,
  Confetti,
  Gears,
  OtpTile,
  Padlock,
  Parcel,
  QuestionMark,
  Shop,
  Toggle,
  Track,
  TroubleBall,
} from "./objects";
import { faText, roundRect } from "./fonts";
import { Glossy } from "./materials";
import { clamp, easeInCubic, easeOutCubic, fa, keys, lerp, presence as rawPresence, prog, rand, T } from "./timing";
import { useLook } from "./look";

const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pm = new PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
};

const shakeAt = (t: number, hits: [number, number][]) => {
  let x = 0;
  let y = 0;
  for (const [ti, amp] of hits) {
    const d = t - ti;
    if (d < 0 || d > 0.7) continue;
    const e = Math.exp(-d * 7) * amp;
    x += Math.sin(d * 63) * e;
    y += Math.cos(d * 51) * e;
  }
  return [x, y] as const;
};

const Camera: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<PC>(null);
  const k = useLook().premium ? 0.45 : 1;
  const [sx0, sy0] = shakeAt(t, [
    [T.wrong, 0.06],
    [7.15, 0.09],
    [11.62, 0.07],
    [T.drop, 0.08],
    [T.lock, 0.16],
    [T.submit, 0.05],
  ]);
  const sx = sx0 * k;
  const sy = sy0 * k;
  // gentle dolly that breathes per section
  const z = keys(t, [
    [0, 9.5],
    [1.2, 10.7],
    [9.76, 10.9],
    [12.4, 11.9],
    [12.56, 10.3],
    [14, 10.8],
    [22.3, 10.6],
    [22.42, 10.0],
    [23.2, 10.7],
    [32.5, 10.9],
    [37.3, 10.5],
    [41.8, 9.9],
  ]);
  const camX = Math.sin(t * 0.35) * 0.25 + sx;
  const camY = 0.35 + Math.cos(t * 0.27) * 0.12 + sy;
  useLayoutEffect(() => {
    ref.current?.lookAt(sx * 0.4, 0.15 + sy * 0.4, 0);
  });
  return <PerspectiveCamera ref={ref} makeDefault fov={36} position={[camX, camY, z]} near={0.1} far={100} />;
};

/* Small helper: pop-in group */
const Pop: React.FC<{
  t: number;
  a: number;
  b: number;
  inDur?: number;
  outDur?: number;
  children: React.ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}> = ({ t, a, b, inDur = 0.5, outDur = 0.3, children, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  const p = rawPresence(t, a, b, inDur, outDur, useLook().premium);
  if (p <= 0.001) return null;
  return (
    <group position={position} rotation={rotation} scale={p * scale}>
      {children}
    </group>
  );
};

export const World: React.FC<{ t: number }> = ({ t }) => {
  const L = useLook();
  const easeOutBack = L.back;
  const presence = (tt: number, a: number, b: number, i?: number, o?: number) => rawPresence(tt, a, b, i, o, L.premium);
  /* ---------- PHONE (two lives) ---------- */
  const phoneLife1 = t < 7.0;
  const phoneLife2 = t >= 14.5 && t < 18.0;
  let phone: React.ReactNode = null;
  if (phoneLife1) {
    const drop = clamp(t / 0.7);
    const y0 = lerp(5, 0.15, easeOutBack(drop, 1.3));
    const spin = (1 - easeOutCubic(drop)) * Math.PI * 2;
    const callShift = prog(t, 4.08, 4.6);
    const x = lerp(0, -0.55, callShift);
    const wrongShake = t > T.wrong && t < T.wrong + 0.6 ? Math.sin((t - T.wrong) * 70) * 0.12 * (1 - (t - T.wrong) / 0.6) : 0;
    const ring = t > 4.3 && t < 5.8 ? Math.sin(t * 90) * 0.03 : 0;
    const exit = prog(t, 6.55, 6.95, easeInCubic);
    phone = (
      <group
        position={[x - exit * 3, y0 + exit * 0.5, 0]}
        rotation={[0.08, -0.28 + spin + Math.sin(t * 1.3) * 0.12 + callShift * 0.35, wrongShake + ring + exit * 0.6]}
        scale={0.85 * (1 - exit * 0.4)}
      >
        <Phone t={t} />
      </group>
    );
  } else if (phoneLife2) {
    const inn = prog(t, 14.5, 15.15, (x) => easeOutBack(x, 1.4));
    const exit = prog(t, 17.6, 18.0, easeInCubic);
    const digits = ["3", "8", "1", "5"];
    const at = [15.36, 15.76, 16.2, 16.54];
    phone = (
      <group scale={0.85} position={[exit * 3.5, lerp(-5, 0.1, inn), 0]} rotation={[0.05, 0.22 + Math.sin(t * 1.1) * 0.1 - exit, -exit * 0.5]}>
        <Phone t={t} />
        {digits.map((d, i) => (
          <group key={i} position={[-0.69 + i * 0.46, -0.2, 0.55 + Math.sin(t * 3 + i) * 0.03]}>
            <OtpTile digit={fa(d)} p={clamp((t - at[i]) / 0.45)} ok={t >= T.ehraz + i * 0.06} />
          </group>
        ))}
      </group>
    );
  }

  /* ---------- QUESTION MARK ---------- */
  const qm = (
    <Pop t={t} a={4.75} b={6.6} position={[1.05, 0.95 + Math.sin(t * 2.2) * 0.08, 0.3]} rotation={[0, t * 1.6, Math.sin(t * 2) * 0.15]} scale={0.75}>
      <QuestionMark />
    </Pop>
  );

  /* ---------- PARCEL (problem) ---------- */
  let parcel: React.ReactNode = null;
  if (t >= 6.75 && t < 10.1) {
    const fall = clamp((t - 6.75) / 0.4);
    const y = lerp(5, -0.15, easeInCubic(fall));
    const land = t - 7.15;
    const squash = land > 0 && land < 0.5 ? Math.sin(land * 18) * Math.exp(-land * 7) * 0.25 : 0;
    const tilt = t > 8.68 ? Math.sin((t - 8.68) * 9) * 0.12 * Math.exp(-(t - 8.68) * 1.5) : 0;
    const shrink = prog(t, 9.76, 10.1);
    parcel = (
      <group position={[0, y, 0]} rotation={[0.25, -0.5 + t * 0.15, tilt]} scale={[(1 + squash) * (1 - shrink), (1 - squash) * (1 - shrink), (1 + squash) * (1 - shrink)]}>
        <Parcel warn={easeOutBack(clamp((t - 8.68) / 0.35), 3)} />
      </group>
    );
  }

  /* ---------- DEAD-END TRACK ---------- */
  const deadP = presence(t, 9.85, 12.25, 0.4, 0.3);
  const bump = t > 11.62 ? Math.sin((t - 11.62) * 30) * 0.04 * Math.exp(-(t - 11.62) * 4) : 0;
  const dead =
    deadP > 0.001 ? (
      <group position={[0.7, -0.4, 0]} rotation={[0.55, -0.18, 0]} scale={deadP * 0.88}>
        <Track t0={9.85} t={t} mode="dead" color="#ffb3c0" boxAt={clamp(prog(t, 10.2, 11.62, (x) => x) + bump)} />
      </group>
    ) : null;

  /* ---------- DROP: orbit of shapes ---------- */
  const orbitP = presence(t, T.drop, 14.55, 0.5, 0.3);
  const orbit =
    orbitP > 0.001 ? (
      <group position={[0, -0.1, 0]} scale={orbitP} rotation={[0.35, 0, 0]}>
        {L.premium && [0, 1, 2].map((i) => (
          <mesh key={"g" + i} rotation={[t * (0.6 + i * 0.3) + i, t * (0.4 + i * 0.2) + i * 1.3, 0]} scale={1.15 + i * 0.22}>
            <torusGeometry args={[1, 0.022, 16, 128]} />
            <meshPhysicalMaterial color={i === 1 ? "#7c5cff" : "#cfd2dc"} metalness={0.95} roughness={0.25} emissive={i === 1 ? "#7c5cff" : "#000"} emissiveIntensity={i === 1 ? 0.6 : 0} />
          </mesh>
        ))}
        {!L.premium && Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 + t * 1.2;
          const r = 1.55 + Math.sin(t * 3 + i) * 0.08;
          const col = ["#FFE14D", "#ffffff", "#ff5c8a", "#18c37e"][i % 4];
          return (
            <mesh key={i} position={[Math.cos(a) * r, Math.sin(i * 1.7 + t * 2) * 0.15, Math.sin(a) * r]} rotation={[t * 2 + i, t * 1.5, 0]} castShadow>
              {i % 3 === 0 ? (
                <torusGeometry args={[0.16, 0.07, 16, 32]} />
              ) : i % 3 === 1 ? (
                <sphereGeometry args={[0.17, 24, 24]} />
              ) : (
                <boxGeometry args={[0.24, 0.24, 0.24]} />
              )}
              <Glossy color={col} />
            </mesh>
          );
        })}
        <group rotation={[-0.35, t * 1.4, 0]} scale={1.3}>
          <CheckCoin spin={0} />
        </group>
      </group>
    ) : null;

  /* ---------- GEARS + BRAND / SETTINGS ---------- */
  const gears = (
    <Pop t={t} a={17.65} b={20.65} position={[0.15, 0.75, -0.8]} rotation={[0.2, -0.3, 0]} scale={1}>
      <Gears t={t} />
    </Pop>
  );
  const brandOn = t < 19.8;
  const brand = (
    <Pop t={t} a={18.4} b={19.7} position={[0, -0.55, 0.6]} rotation={[0.05, Math.sin(t * 1.2) * 0.15, 0]}>
      <Card
        w={2.5}
        h={0.95}
        color="#ffffff"
        draw={(ctx, W, H) => {
          ctx.fillStyle = L.c("#6c3bff");
          roundRect(ctx, 30, 30, 260, H - 60, 50);
          ctx.fill();
          // phone glyph
          ctx.fillStyle = "#fff";
          roundRect(ctx, 115, 70, 90, H - 140, 18);
          ctx.fill();
          ctx.fillStyle = "#6c3bff";
          ctx.beginPath();
          ctx.arc(160, H - 105, 10, 0, Math.PI * 2);
          ctx.fill();
          faText(ctx, "نیاس‌لاگین", W - 60, H / 2 - 40, 120, "#1b1b2f", { weight: 900, family: L.head, align: "right" });
          faText(ctx, "ورود و احراز با موبایل", W - 60, H / 2 + 80, 50, "#6b6b80", { weight: 700, align: "right" });
        }}
        deps={[brandOn, L.head]}
      />
    </Pop>
  );
  const toggleOn = easeOutCubic(prog(t, 20.25, 20.5, (x) => x));
  const settings = (
    <Pop t={t} a={19.82} b={20.75} position={[0, -0.55, 0.6]} rotation={[0.05, Math.sin(t * 1.2) * 0.12, 0]}>
      <Card
        w={2.6}
        h={1.05}
        draw={(ctx, W, H) => {
          faText(ctx, "تنظیمات", W - 60, 85, 54, "#8a8aa0", { weight: 800, align: "right" });
          faText(ctx, "قفل صفحه پرداخت", W - 60, H / 2 + 50, 70, "#1b1b2f", { weight: 900, align: "right" });
        }}
        deps={[]}
      />
      <group position={[-0.88, -0.05, 0.12]} scale={0.75}>
        <Toggle on={toggleOn} />
      </group>
    </Pop>
  );

  /* ---------- PADLOCK ---------- */
  let lock: React.ReactNode = null;
  if (t >= 20.8 && t < 26.0) {
    const inn = prog(t, 20.8, 21.35, (x) => easeOutBack(x, 1.6));
    // open → slam at T.lock → opens again after confirm
    let open = 1;
    if (t >= 22.28) {
      const s = clamp((t - 22.28) / (T.lock - 22.28));
      open = 1 - easeInCubic(s);
      if (t > T.lock) open = Math.max(0, Math.sin((t - T.lock) * 25) * 0.06 * Math.exp(-(t - T.lock) * 8));
    }
    if (t >= 24.9) open = easeOutBack(clamp((t - 24.9) / 0.45), 2);
    const glow = t > T.confirm ? Math.exp(-(t - T.confirm) * 2) : 0;
    const exit = prog(t, 25.55, 26.0, easeInCubic);
    lock = (
      <group
        position={[exit * -3, lerp(-4, -0.5, inn) + exit * 1.5, 0.3]}
        rotation={[0.12, Math.sin(t * 1.1) * 0.25 - 0.1, -exit]}
        scale={0.88 * (1 - exit * 0.5)}
      >
        <Padlock open={open} glow={glow} color={t > T.confirm ? "#7ee2b0" : "#FFC93C"} />
      </group>
    );
  }
  const checkout = (
    <Pop t={t} a={20.9} b={25.5} position={[0.3, 0.2, -1.4]} rotation={[0, -0.25, 0.04]}>
      <Card
        w={2.4}
        h={1.7}
        draw={(ctx, W, H) => {
          faText(ctx, "پرداخت سفارش", W - 50, 80, 64, "#1b1b2f", { weight: 900, align: "right" });
          for (let i = 0; i < 2; i++) {
            ctx.fillStyle = "#efeaff";
            roundRect(ctx, 40, 150 + i * 120, W - 80, 90, 24);
            ctx.fill();
          }
          ctx.fillStyle = "#6c3bff";
          roundRect(ctx, 40, H - 140, W - 80, 100, 50);
          ctx.fill();
          faText(ctx, "پرداخت", W / 2, H - 90, 54, "#fff", { weight: 900 });
        }}
        deps={[]}
      />
    </Pop>
  );
  // the confirm coin flies into the keyhole
  let coin: React.ReactNode = null;
  if (t >= 23.9 && t < T.confirm + 0.05) {
    const p = prog(t, 23.9, T.confirm, (x) => x * x * (3 - 2 * x));
    coin = (
      <group position={[lerp(2.4, 0, p), lerp(1.6, -0.4, p) + Math.sin(p * Math.PI) * 0.6, lerp(1.2, 0.65, p)]} scale={lerp(0.9, 0.25, p * p)}>
        <CheckCoin spin={p * Math.PI * 4} />
      </group>
    );
  }

  /* ---------- SUBMIT BUTTON ---------- */
  const pressP = t > T.submit ? Math.exp(-(t - T.submit) * 6) * Math.sin(Math.min(1, (t - T.submit) / 0.12) * Math.PI) : 0;
  const submit = (
    <Pop t={t} a={25.65} b={27.05} position={[0, -0.1, 0.4]} rotation={[0.25, Math.sin(t * 1.4) * 0.15, 0]}>
      <group scale={[1, 1 - pressP * 0.25, 1 - pressP * 0.5]}>
        <Card
          w={2.4}
          h={0.75}
          color={t > T.submit ? "#18c37e" : "#6c3bff"}
          draw={(ctx, W, H) => {
            faText(ctx, t > T.submit ? "سفارش ثبت شد" : "ثبت سفارش", W / 2, H / 2 + 6, 92, "#ffffff", { weight: 900, family: L.head });
          }}
          deps={[t > T.submit, L.head]}
        />
      </group>
      <Confetti p={(t - T.submit) / 1.1} seed={3} />
    </Pop>
  );

  /* ---------- INFO CARD + OPEN TRACK ---------- */
  const infoUp = 0;
  const info = (
    <Pop t={t} a={27.6} b={29.75} position={[0, lerp(0.15, 0.95, infoUp), lerp(0.3, -0.4, infoUp)]} rotation={[0.05, Math.sin(t) * 0.12, 0]} scale={lerp(1, 0.78, infoUp)}>
      <Card
        w={2.5}
        h={1.2}
        draw={(ctx, W, H) => {
          ctx.fillStyle = "#e9fbf3";
          ctx.beginPath();
          ctx.arc(W - 130, H / 2, 85, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#18c37e";
          ctx.beginPath();
          ctx.arc(W - 130, H / 2 - 22, 30, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(W - 130, H / 2 + 45, 50, 32, 0, Math.PI, 0);
          ctx.fill();
          faText(ctx, "سارا محمدی", W - 250, H / 2 - 55, 76, "#1b1b2f", { weight: 900, align: "right" });
          faText(ctx, fa("0912 345 6789"), W - 250, H / 2 + 45, 54, "#18a36b", { weight: 800, align: "right" });
          // verified badge
          ctx.fillStyle = "#18c37e";
          roundRect(ctx, 40, 40, 230, 84, 42);
          ctx.fill();
          faText(ctx, "تأیید شده", 155, 84, 42, "#fff", { weight: 900 });
        }}
        deps={[]}
      />
    </Pop>
  );
  const openP = presence(t, 29.9, 32.35, 0.4, 0.3);
  const open =
    openP > 0.001 ? (
      <group position={[0.5, -0.6, 0.2]} rotation={[0.55, -0.18, 0]} scale={openP * 0.92}>
        <Track t0={29.9} t={t} mode="open" color="#ffffff" boxAt={prog(t, 30.4, 31.8)} />
        <group position={[-1.95, 0.9, 0]}>
          <Confetti p={(t - 31.85) / 1} n={20} seed={11} />
        </group>
      </group>
    ) : null;

  /* ---------- SHOP + SHIELD ---------- */
  const shopP = presence(t, 32.65, 37.15, 0.55, 0.3);
  let shop: React.ReactNode = null;
  if (shopP > 0.001) {
    const domeP = easeOutBack(clamp((t - 35.25) / 0.4), 1.8);
    const balls = Array.from({ length: 7 }, (_, i) => {
      const hit = 35.44 + i * 0.22 + (i > 3 ? 0.35 : 0);
      const ang = -0.3 + (i / 6) * (Math.PI + 0.6);
      const dir = [Math.cos(ang), Math.sin(ang) * 0.45 + 0.2, 0.4 + rand(i) * 0.4];
      const len = Math.hypot(dir[0], dir[1], dir[2]);
      const ux = dir[0] / len;
      const uy = dir[1] / len;
      const uz = dir[2] / len;
      const R = 1.75;
      let d: number;
      const start = hit - 0.75;
      if (t < start) return null;
      if (t < hit) d = lerp(4.5, R, easeInCubic((t - start) / 0.75));
      else d = R + (t - hit) * 4.5;
      if (d > 3.0) return null;
      const yb = t > hit ? -(t - hit) * (t - hit) * 2 : 0;
      return (
        <group key={i} position={[ux * d, 0.55 + uy * d + yb, uz * d]} rotation={[t * 4 + i, t * 3, 0]}>
          <TroubleBall />
        </group>
      );
    });
    shop = (
      <group position={[0, -0.9, 0]} scale={shopP}>
        <group rotation={[0.12, -0.4 + Math.sin(t * 0.8) * 0.1, 0]}>
          <Shop />
        </group>
        {domeP > 0.001 && (
          <mesh position={[0, 0.0, 0]} scale={domeP}>
            <sphereGeometry args={[1.75, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial
              color="#bff3ff"
              transparent
              opacity={0.28 + (t > 35.44 && t < 37 ? 0.12 * Math.abs(Math.sin(t * 9)) : 0)}
              roughness={0.05}
              clearcoat={1}
              emissive="#7fe8ff"
              emissiveIntensity={0.35}
              depthWrite={false}
            />
          </mesh>
        )}
        {balls}
      </group>
    );
  }

  /* ---------- CTA: comment bubble + orbiting callbacks ---------- */
  const ctaP = presence(t, 37.4, 45, 0.6, 0.3);
  let cta: React.ReactNode = null;
  if (ctaP > 0.001) {
    const orbit = (i: number, child: React.ReactNode, s: number) => {
      const a = t * 0.9 + (i / 4) * Math.PI * 2;
      return (
        <group key={i} position={[Math.cos(a) * 1.75, 0.15 + Math.sin(a * 2) * 0.25, Math.sin(a) * 0.9 - 0.2]} rotation={[0.2, t + i, 0]} scale={s}>
          {child}
        </group>
      );
    };
    cta = (
      <group position={[0, -0.1, 0]} scale={ctaP}>
        <group rotation={[0.08, Math.sin(t * 1.1) * 0.2, 0]}>
          <CommentBubble t={t} typeAt={T.loginWord} />
        </group>
        {orbit(0, <Padlock open={0} glow={0} />, 0.28)}
        {orbit(1, <CheckCoin spin={0} />, 0.5)}
        {orbit(2, <Parcel />, 0.3)}
        {orbit(3, <Toggle on={1} />, 0.45)}
        <group position={[0, 0.4, 0]}>
          <Confetti p={(t - (T.loginWord + 0.65)) / 1.2} seed={21} />
        </group>
      </group>
    );
  }

  return (
    <>
      <Camera t={t} />
      <Env />
      <ambientLight intensity={L.premium ? 0.12 : 0.35} />
      <hemisphereLight args={L.premium ? ["#d8dcff", "#101018", 0.35] : ["#ffffff", "#7a6aa8", 0.55]} />
      {L.premium && <pointLight position={[-3.5, 1.5, -2.5]} intensity={18} color="#7c5cff" distance={12} />}
      {L.premium && <pointLight position={[3.5, -0.5, -2]} intensity={10} color="#6aa8ff" distance={10} />}
      <directionalLight
        position={[1.5, 10, 4]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-5, 2, -4]} intensity={L.premium ? 0.6 : 1.2} color={L.premium ? "#c9c2ff" : "#ffd9f0"} />
      {/* shadow catcher */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={L.premium ? 0.45 : 0.22} />
      </mesh>
      {phone}
      {qm}
      {parcel}
      {dead}
      {orbit}
      {gears}
      {brand}
      {settings}
      {checkout}
      {lock}
      {coin}
      {submit}
      {info}
      {open}
      {shop}
      {cta}
    </>
  );
};
