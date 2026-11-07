import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

const CUT_FRAMES = [130, 210, 300, 440, 535, 685, 810, 975, 1125];

export const SceneTransitions: React.FC = () => {
  const frame = useCurrentFrame();

  // Find if we are near any cut frame (within 4 frames before or after)
  const activeCut = CUT_FRAMES.find((c) => Math.abs(frame - c) <= 4);

  if (!activeCut) return null;

  const diff = Math.abs(frame - activeCut);
  const flashOpacity = interpolate(diff, [0, 4], [0.35, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#FFFFFF",
        opacity: flashOpacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
        zIndex: 80,
      }}
    />
  );
};
