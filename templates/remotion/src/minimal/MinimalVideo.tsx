import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Vazirmatn";

import { MinimalSubtitles } from "./MinimalSubtitles";

import { Scene1_HandPhone } from "./scenes/Scene1_HandPhone";
import { Scene2_TwoCharacters } from "./scenes/Scene2_TwoCharacters";
import { Scene3_Parcel } from "./scenes/Scene3_Parcel";
import { Scene4_ComparisonBoxes } from "./scenes/Scene4_ComparisonBoxes";
import { Scene5_SMSVerify } from "./scenes/Scene5_SMSVerify";
import { Scene6_CheckoutLock } from "./scenes/Scene6_CheckoutLock";
import { Scene7_ThreeSteps } from "./scenes/Scene7_ThreeSteps";
import { Scene8_ReceiptDelivery } from "./scenes/Scene8_ReceiptDelivery";
import { Scene9_ProtectedStore } from "./scenes/Scene9_ProtectedStore";
import { Scene10_InstagramPost } from "./scenes/Scene10_InstagramPost";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "900"],
  subsets: ["arabic", "latin"],
  ignoreTooManyRequestsWarning: true,
});

export const MinimalVideo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        fontFamily,
        overflow: "hidden",
      }}
    >
      {/* Spoken Voiceover */}
      <Audio src={staticFile("audio.mp3")} />

      {/* Subtle Minimal Ambient Groove (quiet at 0.18) */}
      <Audio src={staticFile("sfx/bgm.wav")} volume={0.18} />

      {/* Subtle UI & Click SFX */}
      <Sequence from={45} durationInFrames={10} name="SFX: Error Click">
        <Audio src={staticFile("sfx/tech_click.wav")} volume={0.5} />
      </Sequence>

      <Sequence from={575} durationInFrames={10} name="SFX: Lock Click">
        <Audio src={staticFile("sfx/tech_click.wav")} volume={0.6} />
      </Sequence>

      <Sequence from={730} durationInFrames={10} name="SFX: Unlock Click">
        <Audio src={staticFile("sfx/tech_click.wav")} volume={0.6} />
      </Sequence>

      {/* 10 Minimal Line-Art Scenes */}
      <Sequence from={0} durationInFrames={130} name="Scene 1: Hand Holding Phone">
        <Scene1_HandPhone fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={130} durationInFrames={80} name="Scene 2: Two Characters">
        <Scene2_TwoCharacters fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={210} durationInFrames={90} name="Scene 3: Problem Parcel">
        <Scene3_Parcel fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={300} durationInFrames={140} name="Scene 4: Comparison Boxes">
        <Scene4_ComparisonBoxes fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={440} durationInFrames={95} name="Scene 5: SMS OTP Verify">
        <Scene5_SMSVerify fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={535} durationInFrames={150} name="Scene 6: Checkout Lock">
        <Scene6_CheckoutLock fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={685} durationInFrames={125} name="Scene 7: Three Step Flow">
        <Scene7_ThreeSteps fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={810} durationInFrames={165} name="Scene 8: Receipt and Car">
        <Scene8_ReceiptDelivery fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={975} durationInFrames={150} name="Scene 9: Protected Store">
        <Scene9_ProtectedStore fontFamily={fontFamily} />
      </Sequence>

      <Sequence from={1125} durationInFrames={130} name="Scene 10: Instagram Post">
        <Scene10_InstagramPost fontFamily={fontFamily} />
      </Sequence>

      {/* Minimal Clean Subtitles */}
      <MinimalSubtitles fontFamily={fontFamily} />
    </AbsoluteFill>
  );
};
