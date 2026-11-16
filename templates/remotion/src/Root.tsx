import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { InfographicVideo } from "./infographic/InfographicVideo";
import { MinimalVideo } from "./minimal/MinimalVideo";
import { Pop3DVideo } from "./pop3d/Pop3DVideo";
import { DURATION_FRAMES } from "./pop3d/timing";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 4. Glossy 3D Pop (Three.js) */}
      <Composition
        id="Pop3DVideo"
        component={Pop3DVideo}
        durationInFrames={DURATION_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 5. Premium dark 3D */}
      <Composition
        id="Premium3DVideo"
        component={Pop3DVideo}
        defaultProps={{ premium: true }}
        durationInFrames={DURATION_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 1. Minimalist Black & White Line Art Style (مطابق رفرنس سبک ۴) */}
      <Composition
        id="MinimalVideo"
        component={MinimalVideo}
        durationInFrames={1255}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 2. Cinematic Infographic Drawing (Non-Neon, Blueprint / Drafting Style) */}
      <Composition
        id="InfographicVideo"
        component={InfographicVideo}
        durationInFrames={1255}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 3. Cybernetic Neon Line Art Edition */}
      <Composition
        id="MainVideo"
        component={MainVideo}
        durationInFrames={1255}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
