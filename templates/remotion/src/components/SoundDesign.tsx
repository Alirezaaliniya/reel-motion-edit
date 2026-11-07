import React from "react";
import { Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";

export const SoundDesign: React.FC = () => {
  return (
    <>
      {/* 1. Ambient Background Tech Track */}
      <Audio src={staticFile("sfx/bgm.wav")} volume={0.3} />

      {/* 2. Impact Boom at Hook & Solution */}
      <Sequence from={0} durationInFrames={35} name="SFX: Intro Impact">
        <Audio src={staticFile("sfx/impact.wav")} volume={0.65} />
      </Sequence>

      <Sequence from={380} durationInFrames={35} name="SFX: Solution Spark Impact">
        <Audio src={staticFile("sfx/impact.wav")} volume={0.6} />
      </Sequence>

      {/* 3. Scene Transition Whooshes */}
      {[130, 210, 300, 440, 535, 685, 810, 975, 1125].map((frameCut, idx) => (
        <Sequence
          key={idx}
          from={frameCut - 8}
          durationInFrames={20}
          name={`SFX: Transition ${idx + 1}`}
        >
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.4} />
        </Sequence>
      ))}

      {/* 4. Mechanical Lock Snap in Scene 6 */}
      <Sequence from={575} durationInFrames={20} name="SFX: Padlock Snap">
        <Audio src={staticFile("sfx/lock.wav")} volume={0.8} />
      </Sequence>

      {/* 5. Success Chime in Scene 5 (OTP) and Scene 7 (Unlocked) */}
      <Sequence from={505} durationInFrames={30} name="SFX: OTP Verified Chime">
        <Audio src={staticFile("sfx/success.wav")} volume={0.7} />
      </Sequence>

      <Sequence from={730} durationInFrames={30} name="SFX: Checkout Unlocked Chime">
        <Audio src={staticFile("sfx/success.wav")} volume={0.7} />
      </Sequence>

      {/* 6. UI Typing Blip in Scene 10 */}
      <Sequence from={1140} durationInFrames={15} name="SFX: Comment Typing Blip">
        <Audio src={staticFile("sfx/blip.wav")} volume={0.5} />
      </Sequence>
    </>
  );
};
