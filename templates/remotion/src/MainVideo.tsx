import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Vazirmatn";

import { LineArtDefs } from "./components/LineArtDefs";
import { BackgroundHUD } from "./components/BackgroundHUD";
import { CinematicFrame } from "./components/CinematicFrame";
import { TechAudioVisualizer } from "./components/TechAudioVisualizer";
import { KineticSubtitles } from "./components/KineticSubtitles";
import { SoundDesign } from "./components/SoundDesign";
import { SceneTransitions } from "./components/SceneTransitions";

import { Scene1_WrongNumber } from "./scenes/Scene1_WrongNumber";
import { Scene2_Disconnection } from "./scenes/Scene2_Disconnection";
import { Scene3_OrderIssue } from "./scenes/Scene3_OrderIssue";
import { Scene4_SolutionSpark } from "./scenes/Scene4_SolutionSpark";
import { Scene5_PhoneVerify } from "./scenes/Scene5_PhoneVerify";
import { Scene6_NiasLock } from "./scenes/Scene6_NiasLock";
import { Scene7_UnlockFlow } from "./scenes/Scene7_UnlockFlow";
import { Scene8_SuccessDelivery } from "./scenes/Scene8_SuccessDelivery";
import { Scene9_StoreShield } from "./scenes/Scene9_StoreShield";
import { Scene10_CallToAction } from "./scenes/Scene10_CallToAction";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["arabic", "latin"],
  ignoreTooManyRequestsWarning: true,
});

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dynamic Theme Color based on the current scene mood
  const getThemeColor = () => {
    if (frame < 130) return "#38BDF8";
    if (frame < 210) return "#F59E0B";
    if (frame < 300) return "#EF4444";
    if (frame < 440) return frame < 365 ? "#EF4444" : "#10B981";
    if (frame < 535) return "#38BDF8";
    if (frame < 685) return "#F59E0B";
    if (frame < 810) return "#10B981";
    if (frame < 975) return "#10B981";
    if (frame < 1125) return "#38BDF8";
    return "#38BDF8";
  };

  const getCategoryTitle = () => {
    if (frame < 300) return "PROBLEM • LOST CONTACT PROTOCOL";
    if (frame < 440) return "RESOLUTION • NIAS INNOVATION";
    if (frame < 685) return "WOOCOMMERCE INTEGRATION • SECURITY";
    if (frame < 975) return "VERIFIED DATA • ZERO FRICTION";
    return "NIAS LOGIN • TAKE ACTION NOW";
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#060913",
        fontFamily,
        overflow: "hidden",
      }}
    >
      {/* Voiceover Audio */}
      <Audio src={staticFile("audio.mp3")} />

      {/* Cinematic Sound Design & Ambient Tech BGM */}
      <SoundDesign />

      {/* Global SVG Definitions (Filters, Glows, Gradients) */}
      <LineArtDefs />

      {/* Cybernetic HUD Blueprint Background */}
      <BackgroundHUD themeColor={getThemeColor()} />

      {/* Cinematic Framing Overlay & Timecodes */}
      <CinematicFrame
        fontFamily={fontFamily}
        categoryTitle={getCategoryTitle()}
      />

      {/* Cybernetic Audio Waveform Visualizer */}
      <TechAudioVisualizer themeColor={getThemeColor()} />

      {/* Multi-Scene Cinematic Timeline */}
      {/* Scene 1: خرید با شماره اشتباه (0s - 4.33s) */}
      <Sequence from={0} durationInFrames={130} name="Scene 1: Wrong Number">
        <Scene1_WrongNumber fontFamily={fontFamily} />
      </Sequence>

      {/* Scene 2: قطع ارتباط و سردرگمی (4.33s - 7.0s) */}
      <Sequence from={130} durationInFrames={80} name="Scene 2: Disconnection">
        <Scene2_Disconnection fontFamily={fontFamily} />
      </Sequence>

      {/* Scene 3: مشکل در سفارش و انبارداری (7.0s - 10.0s) */}
      <Sequence from={210} durationInFrames={90} name="Scene 3: Order Issue">
        <Scene3_OrderIssue fontFamily={fontFamily} />
      </Sequence>

      {/* Scene 4: بن‌بست تا جرقه راه‌حل (10.0s - 14.66s) */}
      <Sequence from={300} durationInFrames={140} name="Scene 4: Solution Spark">
        <Scene4_SolutionSpark fontFamily={fontFamily} />
      </Sequence>

      {/* Scene 5: احراز هویت پیامکی قبل از خرید (14.66s - 17.83s) */}
      <Sequence from={440} durationInFrames={95} name="Scene 5: Phone OTP">
        <Scene5_PhoneVerify fontFamily={fontFamily} />
      </Sequence>

      {/* Scene 6: افزونه نیاس لاگین و قفل صفحه پرداخت (17.83s - 22.83s) */}
      <Sequence from={535} durationInFrames={150} name="Scene 6: Nias Lock">
        <Scene6_NiasLock fontFamily={fontFamily} />
      </Sequence>

      {/* Scene 7: جریان باز شدن قفل پس از تایید هویت (22.83s - 27.0s) */}
      <Sequence from={685} durationInFrames={125} name="Scene 7: Smart Unlock">
        <Scene7_UnlockFlow fontFamily={fontFamily} />
      </Sequence>

      {/* Scene 8: اطلاعات درست مشتری و ارسال بدون مرجوعی (27.0s - 32.5s) */}
      <Sequence from={810} durationInFrames={165} name="Scene 8: Verified Delivery">
        <Scene8_SuccessDelivery fontFamily={fontFamily} />
      </Sequence>

      {/* Scene 9: سپر امنیتی فروشگاه اینترنتی (32.5s - 37.5s) */}
      <Sequence from={975} durationInFrames={150} name="Scene 9: Store Shield">
        <Scene9_StoreShield fontFamily={fontFamily} />
      </Sequence>

      {/* Scene 10: کامنت کلمه «لاگین» (37.5s - 41.83s) */}
      <Sequence from={1125} durationInFrames={130} name="Scene 10: CTA Comment Login">
        <Scene10_CallToAction fontFamily={fontFamily} />
      </Sequence>

      {/* Kinetic Synced Persian Subtitles */}
      <KineticSubtitles fontFamily={fontFamily} />

      {/* Fast Cybernetic Scene Transitions */}
      <SceneTransitions />
    </AbsoluteFill>
  );
};
