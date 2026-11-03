"""Turns logo files (PNG/WebP/JPG/SVG) into white rounded "logo cards" with a soft shadow, ready for
{"type": "icon", "icon": "img:logos/card_<name>.png"} in a plan.

usage: python logocard.py <out_dir> <logo> [<logo> ...] [--height 120] [--pad 30]
SVGs need cairosvg (pip install cairosvg).
"""
import argparse, os, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter


def load(p):
    if p.suffix.lower() == ".svg":
        import cairosvg, io
        return Image.open(io.BytesIO(cairosvg.svg2png(url=str(p), output_width=512))).convert("RGBA")
    return Image.open(p).convert("RGBA")


def card(im, h, pad, r=34, s=18):
    w = round(im.width * h / im.height); im = im.resize((w, h), Image.LANCZOS)
    W, H = w + 2 * pad, h + 2 * pad
    c = Image.new("RGBA", (W + 2 * s, H + 2 * s), (0, 0, 0, 0))
    sh = Image.new("RGBA", c.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((s + 6, s + 10, s + W + 6, s + H + 10), radius=r, fill=(0, 0, 0, 150))
    c.alpha_composite(sh.filter(ImageFilter.GaussianBlur(9)))
    ImageDraw.Draw(c).rounded_rectangle((s, s, s + W, s + H), radius=r, fill=(255, 255, 255, 255))
    c.alpha_composite(im, (s + pad, s + pad))
    return c


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("out"); ap.add_argument("logos", nargs="+")
    ap.add_argument("--height", type=int, default=120); ap.add_argument("--pad", type=int, default=30)
    a = ap.parse_args(); out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    for f in map(Path, a.logos):
        dst = out / f"card_{f.stem}.png"; card(load(f), a.height, a.pad).save(dst); print(dst)


if __name__ == "__main__":
    main()
