import React from "react";
import { Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";

export const InfographicSound: React.FC = () => {
  return (
    <>
      {/* 1. Ambient Background Music (soft at 0.22 volume) */}
      <Audio src={staticFile("sfx/bgm.wav")} volume={0.22} />

      {/* 2. Pencil sketching sounds when diagrams are drawn */}
      {[0, 130, 210, 440, 535, 685, 810, 975].map((frameStart, idx) => (
        <Sequence
          key={idx}
          from={frameStart + 5}
          durationInFrames={18}
          name={`SFX: Pencil Sketch ${idx + 1}`}
        >
          <Audio src={staticFile("sfx/pencil.wav")} volume={0.4} />
        </Sequence>
      ))}

      {/* 3. Paper slide transitions between scenes */}
      {[130, 210, 300, 440, 535, 685, 810, 975, 1125].map((frameCut, idx) => (
        <Sequence
          key={idx}
          from={frameCut - 5}
          durationInFrames={15}
          name={`SFX: Paper Slide ${idx + 1}`}
        >
          <Audio src={staticFile("sfx/paper_slide.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* 4. Minimal Technical Clicks */}
      <Sequence from={45} durationInFrames={10} name="SFX: Error Tech Click">
        <Audio src={staticFile("sfx/tech_click.wav")} volume={0.6} />
      </Sequence>

      <Sequence from={575} durationInFrames={10} name="SFX: Lock Tech Click">
        <Audio src={staticFile("sfx/tech_click.wav")} volume={0.7} />
      </Sequence>

      <Sequence from={730} durationInFrames={10} name="SFX: Unlock Tech Click">
        <Audio src={staticFile("sfx/tech_click.wav")} volume={0.7} />
      </Sequence>

      <Sequence from={1140} durationInFrames={10} name="SFX: Typing Tech Click">
        <Audio src={staticFile("sfx/tech_click.wav")} volume={0.5} />
      </Sequence>
    </>
  );
};
