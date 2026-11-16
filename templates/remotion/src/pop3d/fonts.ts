import { loadFont } from "@remotion/fonts";
import { useEffect, useMemo, useState } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { continueRender, delayRender, staticFile } from "remotion";

export const HEAD = "Hasti";
export const BODY = "Peyda";

export const fontsLoaded = Promise.all([
  loadFont({ family: HEAD, url: staticFile("pop3d/fonts/Hasti-Heavy.ttf"), weight: "900" }),
  loadFont({ family: BODY, url: staticFile("pop3d/fonts/PeydaFaNumWeb-Medium.woff2"), weight: "500" }),
  loadFont({ family: BODY, url: staticFile("pop3d/fonts/PeydaFaNumWeb-Bold.woff2"), weight: "700" }),
  loadFont({ family: BODY, url: staticFile("pop3d/fonts/PeydaFaNumWeb-ExtraBold.woff2"), weight: "800" }),
  loadFont({ family: BODY, url: staticFile("pop3d/fonts/PeydaFaNumWeb-Black.woff2"), weight: "900" }),
]);

/** True once the local fonts are usable by <canvas>. Holds the render until then. */
export const useFontsReady = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("pop3d fonts"));
  useEffect(() => {
    fontsLoaded
      .then(() => document.fonts.ready)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  return ready;
};

/**
 * A CanvasTexture redrawn whenever `deps` change (pass the frame).
 * draw(ctx, w, h) paints the full canvas.
 */
export const useCanvasTexture = (
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  deps: unknown[],
) => {
  const ready = useFontsReady();
  const { canvas, tex } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    return { canvas: c, tex: t };
  }, [w, h]);
  useMemo(() => {
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h);
    tex.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, ...deps]);
  return tex;
};

export const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

export const faText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  opts: { weight?: number; family?: string; align?: CanvasTextAlign } = {},
) => {
  ctx.save();
  ctx.direction = "rtl";
  ctx.font = `${opts.weight ?? 700} ${size}px ${opts.family ?? BODY}`;
  ctx.fillStyle = color;
  ctx.textAlign = opts.align ?? "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
};
