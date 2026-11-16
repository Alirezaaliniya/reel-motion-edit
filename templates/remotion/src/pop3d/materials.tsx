import React from "react";
import { Color, Shape, ExtrudeGeometry } from "three";
import { useLook } from "./look";

export const Glossy: React.FC<{ color: string; emissive?: string; emissiveIntensity?: number; opacity?: number; rough?: number }> = ({
  color,
  emissive,
  emissiveIntensity = 0,
  opacity = 1,
  rough = 0.28,
}) => {
  const L = useLook();
  // premium: satin / anodised finish instead of candy plastic
  return (
    <meshPhysicalMaterial
      color={L.c(color)}
      roughness={L.premium ? Math.max(rough, 0.42) : rough}
      metalness={L.premium ? 0.25 : 0}
      clearcoat={L.premium ? 0.35 : 1}
      clearcoatRoughness={L.premium ? 0.3 : 0.08}
      emissive={emissive ? L.c(emissive) : "#000"}
      emissiveIntensity={emissiveIntensity}
      transparent={opacity < 1}
      opacity={opacity}
      envMapIntensity={L.premium ? 0.9 : 1.1}
    />
  );
};

export const Metal: React.FC<{ color: string; emissive?: string; emissiveIntensity?: number }> = ({
  color,
  emissive,
  emissiveIntensity = 0,
}) => {
  const L = useLook();
  return (
    <meshPhysicalMaterial
      color={L.c(color)}
      roughness={L.premium ? 0.32 : 0.22}
      metalness={L.premium ? 0.95 : 0.85}
      clearcoat={L.premium ? 0.2 : 0.6}
      emissive={emissive ? L.c(emissive) : "#000"}
      emissiveIntensity={emissiveIntensity}
      envMapIntensity={1.4}
    />
  );
};

export const Matte: React.FC<{ color: string; rough?: number }> = ({ color, rough = 0.75 }) => {
  const L = useLook();
  return <meshStandardMaterial color={L.c(color)} roughness={rough} metalness={0} />;
};

export const mix = (a: string, b: string, t: number) =>
  "#" + new Color(a).lerp(new Color(b), Math.min(1, Math.max(0, t))).getHexString();

export const gearGeometry = (teeth: number, rOuter: number, rInner: number, hole: number, depth: number) => {
  const s = new Shape();
  const steps = teeth * 4;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const phase = i % 4;
    const r = phase === 1 || phase === 2 ? rOuter : rInner;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  const h = new Shape();
  h.absarc(0, 0, hole, 0, Math.PI * 2, true);
  s.holes.push(h);
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 4, curveSegments: 24 });
  g.center();
  return g;
};

export const checkGeometry = (size: number, depth: number) => {
  const s = new Shape();
  const k = size;
  s.moveTo(-0.55 * k, 0.05 * k);
  s.lineTo(-0.3 * k, 0.3 * k);
  s.lineTo(-0.12 * k, -0.02 * k);
  s.lineTo(0.42 * k, 0.55 * k);
  s.lineTo(0.62 * k, 0.32 * k);
  s.lineTo(-0.12 * k, -0.45 * k);
  s.closePath();
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 });
  g.center();
  return g;
};
