import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { ACESFilmicToneMapping, PCFSoftShadowMap } from "three";
import { World } from "./World";
import { Background, Captions, captionAccent, Chips, Flashes, Headlines } from "./Overlay";
import { FPS, T } from "./timing";
import { useFontsReady } from "./fonts";
import { LookProvider } from "./look";

// [time s, file, volume]
const SFX: [number, string, number][] = [
  [0.0, "whoosh", 0.55],
  [0.92, "coin", 0.6],
  [T.wrong, "error", 0.55],
  [4.75, "pop_hi", 0.4],
  [7.12, "impact", 0.55],
  [8.68, "pop", 0.45],
  [T.hich, "low_boom", 0.7],
  [11.62, "error", 0.35],
  [T.drop - 0.12, "whoosh_heavy", 0.55],
  [T.simple, "pop_hi", 0.45],
  [15.36, "tick", 0.4],
  [T.ehraz, "success", 0.5],
  [T.brand, "whoosh_short", 0.45],
  [20.25, "click", 0.6],
  [T.lock - 0.02, "impact", 0.85],
  [T.confirm - 0.05, "coin", 0.6],
  [24.9, "ding", 0.55],
  [T.submit, "click", 0.6],
  [T.submit + 0.05, "sparkle", 0.45],
  [27.88, "pop", 0.4],
  [30.5, "pop", 0.4],
  [31.85, "ding", 0.45],
  [T.shield - 0.15, "whoosh_heavy", 0.45],
  [35.44, "pop_hi", 0.35],
  [36.3, "pop_hi", 0.3],
  [T.cta, "whoosh", 0.5],
  [T.loginWord, "typing", 0.45],
  [T.loginWord + 0.65, "notify", 0.55],
];

// premium: softer palette of sounds, fewer hits
const SOFT: Record<string, string> = { whoosh: "soft_whoosh", whoosh_short: "soft_whoosh", whoosh_heavy: "air", pop: "soft_pop", pop_hi: "soft_pop", tick: "soft_tick", sparkle: "shimmer", coin: "soft_tick", typing: "soft_tick" };
const SKIP_PREMIUM = new Set([4.75, 8.68, 11.62, 27.88, 30.5, 35.44, 36.3]);

export const Pop3DVideo: React.FC<{ premium?: boolean }> = ({ premium = false }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / FPS;
  useFontsReady();
  return (
    <LookProvider premium={premium}>
    <AbsoluteFill style={{ backgroundColor: premium ? "#0d0d12" : "#FFD23F" }}>
      <Background t={t} premium={premium} />
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: PCFSoftShadowMap }}
        gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: premium ? 1.15 : 1.05, preserveDrawingBuffer: true }}
        style={{ position: "absolute", inset: 0 }}
      >
        <LookProvider premium={premium}>
          <World t={t} />
        </LookProvider>
      </ThreeCanvas>
      <Headlines t={t} premium={premium} />
      <Chips t={t} premium={premium} />
      <Captions t={t} accent={captionAccent(t)} premium={premium} />
      <Flashes t={t} premium={premium} />

      <Audio src={staticFile("audio.mp3")} />
      <Audio
        src={staticFile(premium ? "pop3d/music_premium.wav" : "pop3d/music.wav")}
        volume={(f) => {
          const s = f / FPS;
          const base = premium ? 0.2 : s < T.drop ? 0.2 : 0.17;
          const fadeOut = s > 40.8 ? Math.max(0, 1 - (s - 40.8) / 1.0) : 1;
          return base * fadeOut;
        }}
      />
      {SFX.filter(([s]) => !(premium && SKIP_PREMIUM.has(s))).map(([s, name, vol], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s * FPS))} durationInFrames={FPS * 3} layout="none">
          <Audio src={staticFile(`pop3d/sfx/${premium ? SOFT[name] ?? name : name}.wav`)} volume={premium ? vol * 0.75 : vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
    </LookProvider>
  );
};
