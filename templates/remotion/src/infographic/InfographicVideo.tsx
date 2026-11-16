import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Vazirmatn";

import { InfographicDefs } from "./InfographicDefs";
import { InfographicBackground } from "./InfographicBackground";
import { DraftingFrame } from "./DraftingFrame";
import { InfographicSubtitles } from "./InfographicSubtitles";
import { InfographicSound } from "./InfographicSound";

import { Scene1_DraftingOrder } from "./scenes/Scene1_DraftingOrder";
import { Scene2_DraftingBreak } from "./scenes/Scene2_DraftingBreak";
import { Scene3_DraftingPackage } from "./scenes/Scene3_DraftingPackage";
import { Scene4_DraftingSolution } from "./scenes/Scene4_DraftingSolution";
import { Scene5_DraftingOTP } from "./scenes/Scene5_DraftingOTP";
import { Scene6_DraftingNiasLock } from "./scenes/Scene6_DraftingNiasLock";
import { Scene7_DraftingWorkflow } from "./scenes/Scene7_DraftingWorkflow";
import { Scene8_DraftingDelivery } from "./scenes/Scene8_DraftingDelivery";
import { Scene9_DraftingShield } from "./scenes/Scene9_DraftingShield";
import { Scene10_DraftingCTA } from "./scenes/Scene10_DraftingCTA";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["arabic", "latin"],
  ignoreTooManyRequestsWarning: true,
});

export const InfographicVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const getTopicTitle = () => {
    if (frame < 300) return "DIAGNOSTIC // DATA INTEGRITY AUDIT";
    if (frame < 440) return "ANALYSIS // PROCESS BOTTLENECK";
    if (frame < 685) return "ARCHITECTURE // SMS VERIFICATION GATEWAY";
    if (frame < 975) return "EXECUTION // VERIFIED LOGISTICS PIPELINE";
    return "ACTION // NIAS LOGIN INTEGRATION";
  };

  const getFigureNumber = () => {
    const num = Math.min(10, Math.floor(frame / 125) + 1);
    return `FIG 0${num}.0`;
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B1120",
        fontFamily,
        overflow: "hidden",
      }}
    >
      {/* Spoken Voiceover */}
      <Audio src={staticFile("audio.mp3")} />

      {/* Realistic Drafting & Pencil SFX */}
      <InfographicSound />

      {/* SVG Patterns and Markers */}
      <InfographicDefs />

      {/* Matte Blueprint Drafting Backdrop */}
      <InfographicBackground />

      {/* Technical Framing, Margins & Metrology Ticks */}
      <DraftingFrame
        fontFamily={fontFamily}
        figureNumber={getFigureNumber()}
        topicTitle={getTopicTitle()}
      />

      {/* Multi-Scene Drafting Sequence */}
      <Sequence from={0} durationInFrames={130} name="FIG 01: Order Drafting">
        <Scene1_DraftingOrder fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={130} durationInFrames={80} name="FIG 02: Severed Circuit">
        <Scene2_DraftingBreak fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={210} durationInFrames={90} name="FIG 03: Parcel Blueprint">
        <Scene3_DraftingPackage fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={300} durationInFrames={140} name="FIG 04: Flowchart Solution">
        <Scene4_DraftingSolution fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={440} durationInFrames={95} name="FIG 05: SMS Specification">
        <Scene5_DraftingOTP fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={535} durationInFrames={150} name="FIG 06: WooCommerce Blueprint">
        <Scene6_DraftingNiasLock fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={685} durationInFrames={125} name="FIG 07: Process Architecture">
        <Scene7_DraftingWorkflow fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={810} durationInFrames={165} name="FIG 08: Logistics Elevation">
        <Scene8_DraftingDelivery fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={975} durationInFrames={150} name="FIG 09: Storefront Elevation">
        <Scene9_DraftingShield fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={1125} durationInFrames={130} name="FIG 10: Action CTA Blueprint">
        <Scene10_DraftingCTA fontFamily={fontFamily} />
      </Sequence>

      {/* Editorial Synced Subtitles */}
      <InfographicSubtitles fontFamily={fontFamily} />
    </AbsoluteFill>
  );
};
