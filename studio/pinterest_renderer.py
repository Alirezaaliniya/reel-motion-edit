#!/usr/bin/env python3
"""
Production Pinterest Faceless / Editorial Poster Motion Renderer for Reel Motion Studio (v2).

Full feature parity with Studio UI:
- Persian HarfBuzz + FreeType BiDi-safe typography with automatic smart Word-Wrap (never overflows 720px frame)
- Real Intro scenes (`logo-burst`, `kinetic-hook`, `question-hook`, `iris-reveal`)
- Real Outro scenes (`comment-cta` with left-cropped giant logo, `follow-save-cta`, `logo-lockup`)
- Varied beat layouts (`card-ribbon`, `ui-showcase`, `compare`, `counter`, `icon-focus`, `kinetic-text`)
- True arc-length smooth Bezier flowline ribbon behind cards (zero polygon gaps)
- Seamless spatial scroll with 7-tap Gaussian shutter blur + Iris Wipe transitions
- Configurable headline/caption positions, fontScale, textMode, and @handle watermark placement
- Real FFmpeg compositing of:
  * Background music with gain & auto-ducking
  * Per-beat SFX overlays
  * Overlay footage FX (`lightleak_warm`, `film_grain`, `dust_scratches`, etc.) with `screen` blend & opacity
- Emits `PROGRESS: <0..100>` lines to stdout for live UI progress bar
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from functools import lru_cache
from math import ceil, cos, exp, pi, sin
from pathlib import Path
from typing import Any

import freetype as ft
import numpy as np
import uharfbuzz as hb
from PIL import Image, ImageColor, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "assets"
PROJECTS_DIR = ROOT / "studio" / "projects"

W, H = 720, 1280
FPS = 30

# ---------------- Math & Easing ----------------

def clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def ease_out_quart(x: float) -> float:
    x = clamp01(x)
    return 1.0 - (1.0 - x) ** 4


def ease_in_out_quint(x: float) -> float:
    x = clamp01(x)
    return 16.0 * x ** 5 if x < 0.5 else 1.0 - ((-2.0 * x + 2.0) ** 5) / 2.0


def ease_scroll(x: float) -> float:
    x = clamp01(x)
    if x < 0.38:
        u = x / 0.38
        return 0.5 * (u * u * (3.0 - 2.0 * u))
    u = (x - 0.38) / 0.62
    return 0.5 + 0.5 * (1.0 - (1.0 - u) ** 3.4)


def scroll_velocity(x: float) -> float:
    x = clamp01(x)
    if x <= 0.05 or x >= 0.85:
        return 0.0
    return sin(pi * (x - 0.05) / 0.80) ** 2.2


def eval_motion_preset(dt: float, preset: dict[str, Any] | None) -> tuple[float, float, float, float]:
    """
    Evaluate an imported motion preset (including exact Karo Bounce AE expression physics).
    Returns (alpha_0_1, scale_factor, dx_px, dy_px).
    """
    if dt < 0:
        return 0.0, 0.8, 0.0, 24.0
    if not preset or preset.get("kind") == "smooth-quart":
        dur = float((preset or {}).get("params", {}).get("duration", 0.26))
        p = ease_out_quart(clamp01(dt / max(0.05, dur)))
        return p, 1.0, 0.0, round(18.0 * (1.0 - p))

    kind = preset.get("kind")
    params = preset.get("params") or {}
    dur = max(0.06, float(params.get("duration", 0.18)))
    freq = float(params.get("freq", 2.6))
    decay = float(params.get("decay", 5.8))

    if kind == "elastic-bounce":
        # Exact Karo Bounce inertial elastic formula extracted from Karo Bounce.ffx:
        # startVal=0 -> endVal=1; linear until duration, then damped sinusoid overshoot
        if dt < dur:
            val = dt / dur
        else:
            t_over = dt - dur
            w = max(0.5, freq * 2.0 * pi)
            amp = 1.0 / dur
            val = 1.0 + amp * (sin(t_over * w) / exp(decay * t_over) / w)
        alpha = clamp01(dt / (dur * 0.65))
        scale_boost = float(params.get("scaleBoost", 0.22))
        scale = max(0.35, 1.0 + (val - 1.0) * scale_boost + (0.0 if dt >= dur else -(1.0 - val) * 0.22))
        dy = round(26.0 * (1.0 - val))
        return alpha, scale, 0.0, dy

    if kind == "wiggle-shake":
        p = ease_out_quart(clamp01(dt / dur))
        amp_px = float(params.get("ampPx", 14.0)) * exp(-decay * dt)
        dx = round(sin(dt * freq * 2.0 * pi) * amp_px)
        dy = round(cos(dt * freq * 1.7 * pi) * amp_px * 0.6)
        return p, 1.0, dx, dy

    p = ease_out_quart(clamp01(dt / dur))
    return p, 1.0, 0.0, round(18.0 * (1.0 - p))


def load_active_motion_preset(state: dict[str, Any]) -> dict[str, Any] | None:
    pid = (state.get("options") or {}).get("motionPreset") or "smooth-quart"
    p_file = ASSETS_DIR / "motion-presets.json"
    if p_file.exists():
        try:
            all_p = json.loads(p_file.read_text(encoding="utf-8"))
            if pid in all_p:
                return all_p[pid]
        except Exception:
            pass
    return None


def hex_to_rgb(c: str, default=(0, 122, 255)) -> tuple[int, int, int]:
    try:
        return ImageColor.getrgb(c)
    except Exception:
        return default


def contrast_text(bg_hex: str) -> str:
    r, g, b = hex_to_rgb(bg_hex, (248, 209, 70))
    return "#FFFFFF" if (0.299 * r + 0.587 * g + 0.114 * b) < 145 else "#111827"


# ---------------- Persian HarfBuzz + FreeType Shaping + Smart Word-Wrap ----------------

def resolve_font_path(family: str) -> Path:
    f = (family or "Pinar").lower()
    candidates = {
        "hasti": ASSETS_DIR / "fonts/user/Hasti/Hasti-Heavy.ttf",
        "pinar": ASSETS_DIR / "fonts/user/Pinar/Pinar-VF.ttf",
        "morabba": ASSETS_DIR / "fonts/user/Morabba/Morabba-VF.ttf",
        "yekanbakh": ASSETS_DIR / "fonts/user/YekanBakh/YekanBakh-Bold [@ClubEdits].ttf",
        "lalezar": ASSETS_DIR / "fonts/Lalezar.ttf",
        "changa": ASSETS_DIR / "fonts/Changa.ttf",
        "peyda": ASSETS_DIR / "fonts/user/Pinar/Pinar-VF.ttf",
        "vazirmatn": ASSETS_DIR / "fonts/user/Pinar/Pinar-VF.ttf",
        "iransansx": ASSETS_DIR / "fonts/user/YekanBakh/YekanBakh-VF.ttf",
    }
    p = candidates.get(f, ASSETS_DIR / "fonts/user/Pinar/Pinar-VF.ttf")
    return p if p.exists() else (ASSETS_DIR / "fonts/user/Hasti/Hasti-Heavy.ttf")


@lru_cache(maxsize=16)
def load_hb_face(font_path_str: str):
    raw = Path(font_path_str).read_bytes()
    return ft.Face(font_path_str), hb.Font(hb.Face(raw))


def fix_bidi_runs(text: str) -> str:
    text = re.sub(r"[✓✔✕✖⚠•●▪▫►▶]+", "", text).strip()
    def _rev(m: re.Match) -> str:
        return m.group(0)[::-1]
    return re.sub(r"@?[A-Za-z0-9\u06F0-\u06F9]+(?:[.,:/%+\-_@][A-Za-z0-9\u06F0-\u06F9]+)*", _rev, text)


@lru_cache(maxsize=768)
def render_text_mask(text: str, size: int, family: str) -> Image.Image:
    shaped_txt = fix_bidi_runs(text)
    if not shaped_txt:
        return Image.new("L", (1, 1), 0)
    fpath = str(resolve_font_path(family))
    face, hb_font = load_hb_face(fpath)
    face.set_pixel_sizes(0, size)
    hb_font.scale = (size * 64, size * 64)

    buf = hb.Buffer()
    buf.add_str(shaped_txt)
    buf.direction = "rtl"
    buf.script = "arab"
    buf.language = "fa"
    hb.shape(hb_font, buf)

    infos = buf.glyph_infos
    positions = buf.glyph_positions
    pen_x, pen_y = 0, 0
    glyphs = []
    min_x, min_y = 10**9, 10**9
    max_x, max_y = -10**9, -10**9

    for info, pos in zip(infos, positions):
        face.load_glyph(info.codepoint, ft.FT_LOAD_RENDER)
        bm = face.glyph.bitmap
        gx = (pen_x + pos.x_offset) // 64 + face.glyph.bitmap_left
        gy = (pen_y - pos.y_offset) // 64 - face.glyph.bitmap_top
        if bm.width > 0 and bm.rows > 0:
            arr = np.array(bm.buffer, dtype=np.uint8).reshape(bm.rows, bm.width)
            glyphs.append((gx, gy, arr))
            min_x = min(min_x, gx)
            min_y = min(min_y, gy)
            max_x = max(max_x, gx + bm.width)
            max_y = max(max_y, gy + bm.rows)
        pen_x += pos.x_advance
        pen_y += pos.y_advance

    if not glyphs:
        return Image.new("L", (1, 1), 0)

    pad = 4
    cw = max(1, max_x - min_x + pad * 2)
    ch = max(1, max_y - min_y + pad * 2)
    canvas = np.zeros((ch, cw), dtype=np.uint8)
    for gx, gy, arr in glyphs:
        x0 = gx - min_x + pad
        y0 = gy - min_y + pad
        h_g, w_g = arr.shape
        canvas[y0 : y0 + h_g, x0 : x0 + w_g] = np.maximum(canvas[y0 : y0 + h_g, x0 : x0 + w_g], arr)
    return Image.fromarray(canvas, mode="L")


def wrap_persian_lines(text: str, size: int, family: str, max_w: int = 610) -> list[str]:
    """Automatically wrap long Persian strings into 1-3 balanced lines so text never clips off-frame."""
    text = text.strip()
    if not text:
        return []
    if render_text_mask(text, size, family).width <= max_w:
        return [text]
    words = text.split()
    lines: list[str] = []
    cur: list[str] = []
    for w in words:
        cand = " ".join(cur + [w])
        if cur and render_text_mask(cand, size, family).width > max_w:
            lines.append(" ".join(cur))
            cur = [w]
        else:
            cur.append(w)
    if cur:
        lines.append(" ".join(cur))
    return lines[:3]


def paste_center(dst: Image.Image, src: Image.Image, cx: float, cy: float) -> None:
    x0 = round(cx - src.width / 2)
    y0 = round(cy - src.height / 2)
    if src.mode == "RGBA":
        dst.alpha_composite(src, (x0, y0)) if dst.mode == "RGBA" else dst.paste(src, (x0, y0), src)
    else:
        dst.paste(src, (x0, y0))


def draw_styled_headline(
    canvas: Image.Image,
    text: str,
    cx: float,
    cy: float,
    size: int,
    color_hex: str,
    accent_hex: str,
    family: str,
    t_now: float,
    t_in: float,
    text_anim: str = "classic-rise",
    motion_preset: dict[str, Any] | None = None,
    max_w: int = 610,
) -> None:
    """
    Advanced Persian text reveal modes:
    - `word-unblur`: Each word transitions one-by-one from GaussianBlur(10px) -> sharp!
    - `emphasis-word`: The strongest/last content word renders +34% larger in primary/accent highlight!
    - `word-pop`: Words pop in sequentially with bounce.
    - `typewriter`: Words appear crisply one after another.
    - `classic-rise`: Clean unified editorial reveal with underline.
    """
    if not text or t_now < t_in:
        return
    if text_anim in ("classic-rise", "auto", ""):
        draw_word(canvas, text, cx, cy, size, color_hex, family, t_now, t_in, 0.28, badge="underline", badge_color=accent_hex, max_w=max_w, motion_preset=motion_preset)
        return

    lines = wrap_persian_lines(text, size, family, max_w=max_w)
    line_gap = round(size * 1.32)
    start_y = cy - line_gap * (len(lines) - 1) / 2.0
    r_base, g_base, b_base = hex_to_rgb(color_hex, (38, 43, 46))
    r_acc, g_acc, b_acc = hex_to_rgb(accent_hex, (0, 122, 255))

    # Pick emphasis word index (longest meaningful word in text)
    all_words = text.split()
    emph_word = max(all_words, key=len) if all_words else ""

    word_global_idx = 0
    for li, ln in enumerate(lines):
        ly = start_y + li * line_gap
        words = ln.split()
        if not words:
            continue
        # Measure each word mask in RTL order (right-to-left)
        word_entries = []
        space_w = max(10, round(size * 0.34))
        total_w = 0
        for w_txt in words:
            is_emph = (text_anim == "emphasis-word" and w_txt == emph_word)
            w_size = round(size * 1.32) if is_emph else size
            m = render_text_mask(w_txt, w_size, family)
            word_entries.append((w_txt, m, is_emph, word_global_idx))
            total_w += m.width + space_w
            word_global_idx += 1
        total_w -= space_w

        # Place RTL: first word starts on the RIGHT edge (cx + total_w/2)
        cursor_x = cx + total_w / 2.0
        for w_txt, mask, is_emph, g_idx in word_entries:
            w_cx = cursor_x - mask.width / 2.0
            cursor_x -= (mask.width + space_w)

            t_w = t_in + g_idx * (0.14 if text_anim == "word-unblur" else 0.11)
            dt_w = t_now - t_w
            if dt_w < 0:
                continue

            if text_anim == "word-unblur":
                u = clamp01(dt_w / 0.32)
                p = ease_out_quart(u)
                blur_r = max(0.0, 9.5 * (1.0 - p))
                txt_im = Image.new("RGBA", (mask.width + 28, mask.height + 28), (0, 0, 0, 0))
                col_im = Image.new("RGBA", mask.size, (r_base, g_base, b_base, 255))
                col_im.putalpha(mask.point(lambda v: round(v * p)))
                txt_im.alpha_composite(col_im, (14, 14))
                if blur_r > 0.3:
                    txt_im = txt_im.filter(ImageFilter.GaussianBlur(blur_r))
                paste_center(canvas, txt_im, w_cx, ly + round(10 * (1.0 - p)))
            elif text_anim == "emphasis-word":
                p, sc, dx, dy = eval_motion_preset(dt_w, motion_preset)
                rc, gc, bc = (r_acc, g_acc, b_acc) if is_emph else (r_base, g_base, b_base)
                if is_emph:
                    # Subtle highlight bar behind emphasized word
                    bw, bh = mask.width + 20, mask.height + 10
                    hl_im = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
                    ImageDraw.Draw(hl_im).rounded_rectangle((0, 0, bw - 1, bh - 1), radius=10, fill=(r_acc, g_acc, b_acc, round(42 * p)))
                    paste_center(canvas, hl_im, w_cx + dx, ly + dy)
                txt_im = Image.new("RGBA", mask.size, (rc, gc, bc, 255))
                txt_im.putalpha(mask.point(lambda v: round(v * p)))
                paste_center(canvas, txt_im, w_cx + dx, ly + dy)
            elif text_anim == "typewriter":
                txt_im = Image.new("RGBA", mask.size, (r_base, g_base, b_base, 255))
                txt_im.putalpha(mask)
                paste_center(canvas, txt_im, w_cx, ly)
            else:  # word-pop
                p, sc, dx, dy = eval_motion_preset(dt_w, motion_preset or {"kind": "elastic-bounce", "params": {"duration": 0.18, "freq": 2.4, "decay": 6.0, "scaleBoost": 0.2}})
                txt_im = Image.new("RGBA", mask.size, (r_base, g_base, b_base, 255))
                txt_im.putalpha(mask.point(lambda v: round(v * p)))
                if abs(sc - 1.0) > 0.02:
                    txt_im = txt_im.resize((max(2, round(txt_im.width * sc)), max(2, round(txt_im.height * sc))), Image.Resampling.BILINEAR)
                paste_center(canvas, txt_im, w_cx + dx, ly + dy)


def draw_word(
    canvas: Image.Image,
    text: str,
    cx: float,
    cy: float,
    size: int,
    color_hex: str,
    family: str,
    t_now: float,
    t_in: float,
    dur: float = 0.26,
    badge: str | None = None,
    badge_color: str = "#F8D146",
    max_w: int = 610,
    motion_preset: dict[str, Any] | None = None,
) -> None:
    if not text or t_now < t_in:
        return
    dt = t_now - t_in
    p, scale_f, dx, dy = eval_motion_preset(dt, motion_preset)
    lines = wrap_persian_lines(text, size, family, max_w=max_w)
    if not lines:
        return

    line_gap = round(size * 1.28)
    total_h = line_gap * (len(lines) - 1)
    start_y = cy - total_h / 2.0
    r, g, b = hex_to_rgb(color_hex, (38, 43, 46))

    for li, ln in enumerate(lines):
        ly = start_y + li * line_gap
        mask = render_text_mask(ln, size, family)
        if mask.width <= 1:
            continue

        if badge in ("box", "pill"):
            px, py = 18, 10
            bw, bh = mask.width + px * 2, mask.height + py * 2
            rad = bh // 2 if badge == "pill" else 12
            br, bg, bb = hex_to_rgb(badge_color, (248, 209, 70))
            box_im = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
            ImageDraw.Draw(box_im).rounded_rectangle((0, 0, bw - 1, bh - 1), radius=rad, fill=(br, bg, bb, round(255 * p)))
            if abs(scale_f - 1.0) > 0.015:
                box_im = box_im.resize((max(2, round(bw * scale_f)), max(2, round(bh * scale_f))), Image.Resampling.BILINEAR)
            paste_center(canvas, box_im, cx + dx, ly + dy)
        elif badge == "underline" and li == len(lines) - 1:
            uw = round(mask.width * clamp01(p))
            if uw > 2:
                br, bg, bb = hex_to_rgb(badge_color, (0, 122, 255))
                u_im = Image.new("RGBA", (uw, 8), (br, bg, bb, round(235 * p)))
                paste_center(canvas, u_im, cx + dx, ly + dy + mask.height // 2 + 8)

        txt_im = Image.new("RGBA", mask.size, (r, g, b, 255))
        txt_im.putalpha(mask.point(lambda v: round(v * p)))
        if abs(scale_f - 1.0) > 0.015:
            txt_im = txt_im.resize((max(2, round(txt_im.width * scale_f)), max(2, round(txt_im.height * scale_f))), Image.Resampling.BILINEAR)
        paste_center(canvas, txt_im, cx + dx, ly + dy)


# ---------------- Studio Backdrop, Ribbon & Corner Accents ----------------

@lru_cache(maxsize=16)
def build_studio_backdrop(bg_hex: str) -> Image.Image:
    r, g, b = hex_to_rgb(bg_hex, (244, 245, 242))
    is_dark = (0.299 * r + 0.587 * g + 0.114 * b) < 130
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dist = np.hypot((xx - W * 0.5) / (W * 0.65), (yy - H * 0.48) / (H * 0.65))
    vig = np.clip(1.0 - 0.14 * (dist ** 1.6), 0.78, 1.0)
    center_boost = np.clip(1.0 - dist, 0.0, 1.0) * (14.0 if not is_dark else 20.0)

    arr = np.zeros((H, W, 3), dtype=np.float32)
    for ch, val in enumerate((r, g, b)):
        arr[:, :, ch] = np.clip(val * vig + center_boost, 0, 255)
    im = Image.fromarray(arr.astype(np.uint8), mode="RGB")

    ring_col = (255, 255, 255, 16) if is_dark else (0, 0, 0, 10)
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for rad in (210, 320, 440):
        d.ellipse((W // 2 - rad, H // 2 - rad, W // 2 + rad, H // 2 + rad), outline=ring_col, width=2)
    return Image.alpha_composite(im.convert("RGBA"), ov).convert("RGB")


def sample_cubic_bezier(ctrl, n=160):
    p0, p1, p2, p3 = [np.array(p, dtype=np.float32) for p in ctrl]
    ts = np.linspace(0.0, 1.0, n)
    pts = np.array([(1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3 for t in ts])
    diffs = np.diff(pts, axis=0)
    seg_lens = np.hypot(diffs[:, 0], diffs[:, 1])
    cum = np.concatenate([[0.0], np.cumsum(seg_lens)])
    cum /= max(cum[-1], 1e-5)
    return pts, cum


def draw_flowline_ribbon(
    canvas: Image.Image,
    ctrl,
    t_now: float,
    t_start: float,
    draw_dur: float = 0.75,
    width: float = 42.0,
    color_hex: str = "#007AFF",
    t_exit: float | None = None,
    exit_dur: float = 0.35,
) -> None:
    if t_now < t_start:
        return
    p_in = ease_in_out_quint(clamp01((t_now - t_start) / max(0.05, draw_dur)))
    p_out = ease_in_out_quint(clamp01((t_now - t_exit) / max(0.05, exit_dur))) if (t_exit is not None and t_now >= t_exit) else 0.0
    if p_out >= 0.99 or p_in <= 0.01 or p_in <= p_out:
        return

    pts, cum = sample_cubic_bezier(ctrl, 160)
    sub = [tuple(pt) for pt, s in zip(pts, cum) if p_out <= s <= p_in]
    if len(sub) < 2:
        return

    r, g, b = hex_to_rgb(color_hex, (0, 122, 255))
    d = ImageDraw.Draw(canvas)
    rad = width / 2.0
    col = (r, g, b, 255)
    for x, y in sub:
        d.ellipse((x - rad, y - rad, x + rad, y + rad), fill=col)


@lru_cache(maxsize=8)
def build_blurred_corner_sprite(color_hex: str) -> Image.Image:
    r, g, b = hex_to_rgb(color_hex, (38, 43, 46))
    s = 240
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, cy = s // 2, s // 2
    for ang_deg in (0, 72, 144, 216, 288):
        ang = ang_deg * pi / 180.0
        px = cx + cos(ang) * 42
        py = cy + sin(ang) * 42
        d.ellipse((px - 26, py - 14, px + 26, py + 14), fill=(r, g, b, 185))
    d.ellipse((cx - 20, cy - 20, cx + 20, cy + 20), fill=(r, g, b, 210))
    return im.filter(ImageFilter.GaussianBlur(8.0))


def draw_corner_accents(canvas: Image.Image, t_now: float, color_hex: str) -> None:
    sp = build_blurred_corner_sprite(color_hex)
    rot = sp.rotate(sin(t_now * 0.7) * 6.0, Image.Resampling.BICUBIC, expand=False)
    paste_center(canvas, rot, W - 24, 46)
    paste_center(canvas, rot.rotate(140), 24, H - 52)


def resolve_local_asset(asset_url: str) -> Path | None:
    if not asset_url:
        return None
    if asset_url.startswith("/assets/"):
        p = ASSETS_DIR / asset_url[len("/assets/"):]
        return p if p.exists() else None
    if asset_url.startswith("/projects-files/"):
        p = PROJECTS_DIR / asset_url[len("/projects-files/"):]
        return p if p.exists() else None
    p = Path(asset_url)
    return p if p.exists() else None


def find_perspective_coeffs(src_pts, dst_pts):
    """Solve 8-DOF homography coefficients for Pillow Image.Transform.PERSPECTIVE."""
    matrix = []
    for p1, p2 in zip(dst_pts, src_pts):
        matrix.append([p1[0], p1[1], 1, 0, 0, 0, -p2[0] * p1[0], -p2[0] * p1[1]])
        matrix.append([0, 0, 0, p1[0], p1[1], 1, -p2[1] * p1[0], -p2[1] * p1[1]])
    A = np.array(matrix, dtype=np.float64)
    B = np.array(src_pts, dtype=np.float64).reshape(8)
    res = np.linalg.solve(A, B)
    return tuple(res.tolist())


def apply_3d_perspective_tilt(im: Image.Image, tilt_x: float = 0.08, tilt_y: float = 0.05, rot_z: float = -3.5) -> Image.Image:
    """Apply subtle cinema-grade 3D perspective tilt + Z rotation with soft drop shadow."""
    w, h = im.size
    src = [(0, 0), (w, 0), (w, h), (0, h)]
    dx = w * abs(tilt_x)
    dy = h * abs(tilt_y)
    if tilt_x >= 0:
        dst = [(dx, dy * 0.6), (w - dx * 0.35, 0), (w - dx * 0.2, h - dy * 0.5), (dx * 0.4, h)]
    else:
        dst = [(dx * 0.35, 0), (w - dx, dy * 0.6), (w - dx * 0.4, h), (dx * 0.2, h - dy * 0.5)]
    coeffs = find_perspective_coeffs(src, dst)
    warped = im.transform((w, h), Image.Transform.PERSPECTIVE, coeffs, Image.Resampling.BICUBIC)
    if abs(rot_z) > 0.1:
        warped = warped.rotate(rot_z, Image.Resampling.BICUBIC, expand=True)
    return warped


def draw_macos_cursor_and_click(
    canvas: Image.Image,
    cx: float,
    cy: float,
    t_now: float,
    t_click: float,
    scale: float = 1.0,
) -> None:
    """Draw a crisp oversized macOS-style pointer cursor + expanding click ripple ring."""
    # 1. Click ripple rings (when t_now >= t_click)
    dt_c = t_now - t_click
    if 0.0 <= dt_c <= 0.55:
        u = dt_c / 0.55
        p = ease_out_quart(u)
        alpha = round(230 * (1.0 - u))
        rad = round(14 + 54 * p)
        ring = Image.new("RGBA", (rad * 2 + 12, rad * 2 + 12), (0, 0, 0, 0))
        d_r = ImageDraw.Draw(ring)
        d_r.ellipse((6, 6, rad * 2 + 6, rad * 2 + 6), outline=(0, 122, 255, alpha), width=5)
        if dt_c < 0.25:
            rad2 = round(8 + 26 * (dt_c / 0.25))
            d_r.ellipse((rad + 6 - rad2, rad + 6 - rad2, rad + 6 + rad2, rad + 6 + rad2), fill=(0, 122, 255, round(110 * (1.0 - dt_c / 0.25))))
        paste_center(canvas, ring, cx, cy)

    # 2. Cursor press-tap compression at click moment
    tap_s = 1.0 - (0.16 * sin(pi * clamp01(dt_c / 0.18)) if 0.0 <= dt_c <= 0.18 else 0.0)
    s = scale * tap_s * 1.35

    # Vector macOS arrow polygon anchored at tip (0,0)
    pts_base = [(0, 0), (0, 44), (11, 34), (18, 49), (25, 46), (18, 31), (32, 31)]
    pts = [(round(cx + x * s), round(cy + y * s)) for x, y in pts_base]
    sh_pts = [(x + 4, y + 6) for x, y in pts]

    ov = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    d.polygon(sh_pts, fill=(0, 0, 0, 75))
    d.polygon(pts, fill=(18, 22, 28, 255), outline=(255, 255, 255, 255))
    # Crisp white outline stroke around arrow
    for i in range(len(pts)):
        d.line([pts[i], pts[(i + 1) % len(pts)]], fill=(255, 255, 255, 255), width=3)
    canvas.alpha_composite(ov)


def render_cinematic_screen_stage(
    canvas: Image.Image,
    asset_p: Path,
    beat: dict[str, Any],
    t_now: float,
    t0: float,
    t1: float,
) -> None:
    """
    TRUE 100% Edge-to-Edge Full-Bleed Screen Stage (ZERO borders/frames, even when 3D tilted):
    - Camera smoothly pans & zooms synchronized WITH the moving macOS cursor (Camera-Follow-Cursor).
    - When 3D tilt is enabled, overscans by 1.32x before perspective warp and center-crops to 720x1280
      so the tilted UI still fills 100% of the entire reel frame without any border or box.
    """
    raw = Image.open(asset_p).convert("RGBA")
    smode = beat.get("screenMotion") or "zoom-in-click"
    fx = clamp01(float(beat.get("focusX", 50)) / 100.0)
    fy = clamp01(float(beat.get("focusY", 42)) / 100.0)
    use_3d = bool(beat.get("tilt3d", smode == "tilt-3d-click"))
    use_cursor = bool(beat.get("cursorClick", smode in ("zoom-in-click", "tilt-3d-click", "pan-glide")))

    dur = max(0.8, t1 - t0)
    u = clamp01((t_now - t0) / dur)
    t_click = t0 + min(1.25, dur * 0.56)
    u_move = ease_in_out_quint(clamp01((t_now - t0) / max(0.35, t_click - t0)))

    # Cursor path in normalized screenshot space: glides from start point -> focus target
    start_x = clamp01(fx + (0.28 if fx < 0.55 else -0.28))
    start_y = clamp01(fy + 0.22)
    cur_norm_x = start_x + (fx - start_x) * u_move
    cur_norm_y = start_y + (fy - start_y) * u_move

    # Camera follows cursor smoothly with slight cinematic lag (Screen Studio feel)
    cam_lag = ease_in_out_quint(clamp01((t_now - t0 - 0.08) / max(0.35, t_click - t0)))
    cam_x = start_x + (fx - start_x) * cam_lag
    cam_y = start_y + (fy - start_y) * cam_lag

    # Base scale guarantees 100% full-bleed coverage (with overscan if 3D tilted)
    overscan = 1.32 if use_3d else 1.04
    base_cover = max(W / raw.width, H / raw.height) * overscan

    if smode == "zoom-out-reveal":
        zoom = base_cover * (1.75 - 0.65 * u_move)
    elif smode == "pan-glide":
        zoom = base_cover * 1.45
        cam_x = 0.22 + 0.56 * ease_in_out_quint(u)
        cur_norm_x = cam_x
    else:  # zoom-in-click / tilt-3d-click
        zoom = base_cover * (1.12 + 0.55 * u_move)

    sw, sh = max(round(W * overscan) + 4, round(raw.width * zoom)), max(round(H * overscan) + 4, round(raw.height * zoom))
    scaled = raw.resize((sw, sh), Image.Resampling.LANCZOS)

    vw, vh = (round(W * overscan), round(H * overscan)) if use_3d else (W, H)
    cx_src = cam_x * sw
    cy_src = cam_y * sh
    x0 = max(0, min(sw - vw, round(cx_src - vw / 2)))
    y0 = max(0, min(sh - vh, round(cy_src - vh / 2)))
    viewport = scaled.crop((x0, y0, x0 + vw, y0 + vh))

    # Draw cursor directly in screen-space so it tilts & tracks identically with the UI plane!
    if use_cursor:
        cur_px_x = cur_norm_x * sw - x0
        cur_px_y = cur_norm_y * sh - y0
        draw_macos_cursor_and_click(viewport, cur_px_x, cur_px_y, t_now, t_click, scale=1.18 if use_3d else 1.1)

    if use_3d:
        tilted = apply_3d_perspective_tilt(viewport, tilt_x=0.055 * (0.4 + 0.6 * u_move), tilt_y=0.035, rot_z=-2.2 * (0.4 + 0.6 * u_move))
        # Center-crop tilted overscanned image back to exact 720x1280 -> ZERO borders, 100% edge-to-edge 3D screen!
        tx0 = max(0, (tilted.width - W) // 2)
        ty0 = max(0, (tilted.height - H) // 2)
        full_3d = tilted.crop((tx0, ty0, tx0 + W, ty0 + H))
        canvas.alpha_composite(full_3d, (0, 0))
    else:
        canvas.alpha_composite(viewport, (0, 0))

    # Subtle cinematic top & bottom gradient scrim so overlaid Persian headlines/keywords stay crystal clear
    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scrim)
    for y in range(250):
        a = round(140 * (1.0 - y / 250.0))
        sd.line([(0, y), (W, y)], fill=(8, 12, 20, a))
    for y in range(H - 270, H):
        a = round(155 * ((y - (H - 270)) / 270.0))
        sd.line([(0, y), (W, y)], fill=(8, 12, 20, a))
    canvas.alpha_composite(scrim, (0, 0))


@lru_cache(maxsize=64)
def load_card_image(path_str: str, max_w: int = 520, max_h: int = 440, is_dark: bool = False, frameless: bool = False) -> Image.Image:
    p = Path(path_str)
    if p.suffix.lower() == ".svg":
        png_alt = p.with_suffix(".png")
        if png_alt.exists():
            p = png_alt
        else:
            card = Image.new("RGBA", (260, 260), (0, 0, 0, 0))
            fill = (30, 41, 59, 235) if is_dark else (255, 255, 255, 245)
            ImageDraw.Draw(card).rounded_rectangle((10, 10, 250, 250), radius=42, fill=fill, outline=(0, 122, 255, 180), width=4)
            return card

    raw = Image.open(p).convert("RGBA")
    scale = min(max_w / raw.width, max_h / raw.height, 1.0)
    nw, nh = max(1, round(raw.width * scale)), max(1, round(raw.height * scale))
    resized = raw.resize((nw, nh), Image.Resampling.LANCZOS)
    if frameless:
        return resized

    pad = 22
    cw, ch = nw + pad * 2, nh + pad * 2
    card_bg = (24, 30, 44, 242) if is_dark else (255, 255, 255, 250)
    border_c = (255, 255, 255, 40) if is_dark else (15, 23, 42, 24)

    shadow = Image.new("RGBA", (cw + 48, ch + 48), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((24, 34, 24 + cw, 34 + ch), radius=34, fill=(0, 0, 0, 58))
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))

    card = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    ImageDraw.Draw(card).rounded_rectangle((0, 0, cw - 1, ch - 1), radius=32, fill=card_bg, outline=border_c, width=2)
    card.alpha_composite(resized, (pad, pad))
    shadow.alpha_composite(card, (24, 18))
    return shadow


# ---------------- Intro, Beat & Outro Scene Builders ----------------

def build_timeline_scenes(state: dict[str, Any]) -> list[dict[str, Any]]:
    """Expand state into a full ordered scene list: optional Intro + Beats + optional Outro."""
    opts = state.get("options", {})
    intro_style = opts.get("introStyle", "none")
    intro_dur = float(opts.get("introDur", 2.0)) if intro_style != "none" else 0.0
    outro_style = opts.get("outroStyle", "none")
    outro_dur = float(opts.get("outroDur", 2.8)) if outro_style != "none" else 0.0

    scenes: list[dict[str, Any]] = []
    offset = 0.0
    if intro_style != "none":
        scenes.append({
            "kind": "intro",
            "introStyle": intro_style,
            "t": 0.0,
            "end": intro_dur,
            "transition": "circles" if intro_style == "iris-reveal" else "push",
        })
        offset = intro_dur

    for idx, b in enumerate(state.get("beats", [])):
        b_copy = dict(b)
        b_copy["kind"] = "beat"
        b_copy["beatIdx"] = idx
        b_copy["t"] = round(float(b.get("t", idx * 3.0)) + offset, 3)
        b_copy["end"] = round(float(b.get("end", (idx + 1) * 3.0)) + offset, 3)
        scenes.append(b_copy)

    last_end = scenes[-1]["end"] if scenes else 3.0
    if outro_style != "none":
        scenes.append({
            "kind": "outro",
            "outroStyle": outro_style,
            "t": last_end,
            "end": round(last_end + outro_dur, 3),
            "transition": "push",
        })
    return scenes


def draw_handle_watermark(im: Image.Image, brand: dict[str, Any], t_now: float, t0: float) -> None:
    handle = (brand.get("handle") or "").strip()
    if not handle:
        return
    hpos = brand.get("handlePos", "tr")
    pos_xy = {
        "tr": (W - 115, 76),
        "tc": (W / 2, 76),
        "tl": (115, 76),
        "br": (W - 115, H - 72),
        "bl": (115, H - 72),
        "bc": (W / 2, H - 64),
    }.get(hpos, (W - 115, 76))
    draw_word(im, handle, pos_xy[0], pos_xy[1], 22, brand.get("text", "#262B2E"), brand.get("bodyFont", "Pinar"), t_now, t0, dur=0.12)


def render_intro_fg(scene: dict[str, Any], state: dict[str, Any], t_now: float) -> Image.Image:
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    brand = state.get("brand", {})
    primary = brand.get("primary", "#007AFF")
    accent = brand.get("accent", "#F8D146")
    text_col = brand.get("text", "#262B2E")
    bg_hex = brand.get("bg", "#F4F5F2")
    disp_font = brand.get("displayFont", "Hasti")
    body_font = brand.get("bodyFont", "Pinar")
    r, g, b = hex_to_rgb(bg_hex, (244, 245, 242))
    is_dark = (0.299 * r + 0.587 * g + 0.114 * b) < 130

    t0, t1 = scene["t"], scene["end"]
    istyle = scene["introStyle"]
    title = state.get("title") or (state.get("beats", [{}])[0].get("headline") if state.get("beats") else "شروع ویژه")

    draw_flowline_ribbon(im, ((-28, 360), (170, 620), (545, 560), (748, 840)), t_now, t0 + 0.05, 0.65, 46.0, primary, t_exit=max(t0 + 0.9, t1 - 0.3), exit_dur=0.3)

    if istyle == "kinetic-hook":
        draw_word(im, title, W / 2, H / 2 - 45, 68, text_col, disp_font, t_now, t0 + 0.05, 0.30, badge="underline", badge_color=primary)
        draw_word(im, state.get("cover", {}).get("badge") or "آماده‌ای؟", W / 2, H / 2 + 95, 42, contrast_text(accent), disp_font, t_now, t0 + 0.35, 0.25, badge="pill", badge_color=accent)
    elif istyle == "question-hook":
        q_card = Image.new("RGBA", (540, 260), (0, 0, 0, 0))
        fill = (24, 30, 44, 242) if is_dark else (255, 255, 255, 250)
        ImageDraw.Draw(q_card).rounded_rectangle((0, 0, 539, 259), radius=34, fill=fill, outline=hex_to_rgb(primary) + (220,), width=4)
        paste_center(im, q_card, W / 2, H / 2)
        draw_word(im, "می‌دونستی؟", W / 2, H / 2 - 65, 34, primary, disp_font, t_now, t0 + 0.08, 0.22)
        draw_word(im, title, W / 2, H / 2 + 25, 46, text_col, disp_font, t_now, t0 + 0.25, 0.28, max_w=490)
    else:  # logo-burst / iris-reveal
        logo_p = resolve_local_asset((state.get("media", {}).get("logo") or {}).get("path", ""))
        if logo_p:
            card = load_card_image(str(logo_p), max_w=340, max_h=340, is_dark=is_dark)
            u = ease_out_quart(clamp01((t_now - t0) / 0.35))
            paste_center(im, card, W / 2, 590 + round(35 * (1.0 - u)))
        draw_word(im, title, W / 2, 265, 56, text_col, disp_font, t_now, t0 + 0.15, 0.28, badge="underline", badge_color=primary)
        if brand.get("handle"):
            draw_word(im, brand["handle"], W / 2, 915, 30, contrast_text(accent), body_font, t_now, t0 + 0.35, 0.24, badge="pill", badge_color=accent)

    draw_handle_watermark(im, brand, t_now, t0)
    return im


def render_outro_fg(scene: dict[str, Any], state: dict[str, Any], t_now: float) -> Image.Image:
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    brand = state.get("brand", {})
    opts = state.get("options", {})
    primary = brand.get("primary", "#007AFF")
    accent = brand.get("accent", "#F8D146")
    text_col = brand.get("text", "#262B2E")
    bg_hex = brand.get("bg", "#F4F5F2")
    disp_font = brand.get("displayFont", "Hasti")
    body_font = brand.get("bodyFont", "Pinar")
    r, g, b = hex_to_rgb(bg_hex, (244, 245, 242))
    is_dark = (0.299 * r + 0.587 * g + 0.114 * b) < 130

    t0 = scene["t"]
    ostyle = scene["outroStyle"]
    cta_word = (opts.get("outroCtaWord") or "نیاس").strip()
    cta_sub = (opts.get("outroSubtitle") or "رو کامنت کن تا لینک برات بیاد").strip()
    logo_p = resolve_local_asset((state.get("media", {}).get("logo") or {}).get("path", ""))

    if ostyle == "comment-cta":
        # Signature Pinterest finale: giant logo gliding/cropped on left edge + right-side stepped CTA
        u_slide = ease_in_out_quint(clamp01((t_now - t0 - 0.35) / 0.55))
        if logo_p:
            big_logo = load_card_image(str(logo_p), max_w=460, max_h=460, is_dark=is_dark)
            lx = round(W / 2 - (W / 2 - 40) * u_slide)
            paste_center(im, big_logo, lx, 640)
        draw_word(im, cta_word, 495, 540, 66, contrast_text(primary), disp_font, t_now, t0 + 0.35, 0.28, badge="box", badge_color=primary, max_w=380)
        draw_word(im, cta_sub, 495, 660, 36, text_col, body_font, t_now, t0 + 0.65, 0.28, max_w=390)
        if brand.get("handle"):
            draw_word(im, brand["handle"], 495, 760, 26, primary, body_font, t_now, t0 + 0.85, 0.22)
    elif ostyle == "follow-save-cta":
        draw_flowline_ribbon(im, ((748, 380), (520, 620), (190, 580), (-28, 860)), t_now, t0 + 0.05, 0.65, 44.0, primary)
        card = Image.new("RGBA", (540, 320), (0, 0, 0, 0))
        fill = (24, 30, 44, 242) if is_dark else (255, 255, 255, 250)
        ImageDraw.Draw(card).rounded_rectangle((0, 0, 539, 319), radius=34, fill=fill, outline=hex_to_rgb(primary) + (200,), width=3)
        paste_center(im, card, W / 2, 620)
        draw_word(im, "ذخیره کن و فالو یادت نره", W / 2, 560, 42, text_col, disp_font, t_now, t0 + 0.12, 0.28, max_w=490)
        draw_word(im, brand.get("handle") or cta_word, W / 2, 675, 40, contrast_text(accent), disp_font, t_now, t0 + 0.35, 0.26, badge="pill", badge_color=accent, max_w=460)
    else:  # logo-lockup
        if logo_p:
            card = load_card_image(str(logo_p), max_w=340, max_h=340, is_dark=is_dark)
            paste_center(im, card, W / 2, 570)
        draw_word(im, state.get("title") or cta_word, W / 2, 840, 48, text_col, disp_font, t_now, t0 + 0.15, 0.28)
        if brand.get("handle"):
            draw_word(im, brand["handle"], W / 2, 940, 32, contrast_text(primary), body_font, t_now, t0 + 0.35, 0.24, badge="pill", badge_color=primary)

    return im


def resolve_hybrid_beat_settings(beat: dict[str, Any], idx: int, state: dict[str, Any]) -> tuple[str, dict[str, Any] | None, str]:
    """
    When per-section Smart Hybrid toggles are ON, automatically decide the best:
    - visualType (counter if digits, compare if comparison words, kinetic-text if punchy short hook, else card-ribbon/ui-showcase)
    - motion_preset (karo-bounce on punchy hooks/keywords, smooth-quart on calm UI explainers)
    - text_mode (keywords on short punchy beats, both on longer explanatory beats)
    """
    opts = state.get("options", {})
    hybrid = opts.get("hybrid") or {}
    spoken = (beat.get("spoken") or "").strip()
    headline = (beat.get("headline") or "").strip()
    full = f"{headline} {beat.get('keyword', '')} {spoken}"

    # 1. Hybrid Layout / Visual Type (also activates automatically when beat visualType is 'auto')
    vtype = beat.get("visualType") or "auto"
    if hybrid.get("layout") or vtype == "auto":
        if any(k in full for k in ("مقایسه", "قدیمی", "جدید", "قبل", "بعد", "تفاوت", "بهتر از")):
            vtype = "compare"
        elif re.search(r"[\d\u06F0-\u06F9]+", full) and len(headline.split()) <= 6:
            vtype = "counter"
        elif not beat.get("assetUrl") and len(full.split()) <= 7:
            vtype = "kinetic-text"
        else:
            vtype = "ui-showcase" if (beat.get("assetUrl", "").startswith("/projects-files/")) else ("icon-focus" if idx % 3 == 2 else "card-ribbon")

    # 2. Hybrid Motion Preset (mixes Karo Bounce on hooks/emphasis with Smooth Quart on UI/calm beats)
    if hybrid.get("motion"):
        p_file = ASSETS_DIR / "motion-presets.json"
        all_p = json.loads(p_file.read_text(encoding="utf-8")) if p_file.exists() else {}
        if idx == 0 or vtype in ("kinetic-text", "counter", "icon-focus"):
            mpreset = all_p.get("karo-bounce") or all_p.get("overshoot-pop")
        else:
            mpreset = all_p.get("smooth-quart")
    else:
        mpreset = load_active_motion_preset(state)

    # 3. Hybrid Text Mode (keywords-only on short punchy beats, both on detailed explanatory beats)
    if hybrid.get("textMode"):
        text_mode = "both" if len(spoken.split()) >= 8 else "keywords"
    else:
        text_mode = opts.get("textMode", "keywords")

    return vtype, mpreset, text_mode


def render_beat_fg(beat: dict[str, Any], idx: int, state: dict[str, Any], t_now: float) -> Image.Image:
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    brand = state.get("brand", {})
    opts = state.get("options", {})
    primary = brand.get("primary", "#007AFF")
    accent = brand.get("accent", "#F8D146")
    text_col = brand.get("text", "#262B2E")
    bg_hex = brand.get("bg", "#F4F5F2")
    disp_font = brand.get("displayFont", "Hasti")
    body_font = brand.get("bodyFont", "Pinar")

    r, g, b = hex_to_rgb(bg_hex, (244, 245, 242))
    is_dark = (0.299 * r + 0.587 * g + 0.114 * b) < 130

    t0 = float(beat.get("t", 0.0))
    t1 = float(beat.get("end", t0 + 3.5))
    vtype, mpreset, text_mode = resolve_hybrid_beat_settings(beat, idx, state)

    scale_map = {"sm": 0.84, "md": 1.0, "lg": 1.18, "xl": 1.34}
    f_mul = scale_map.get(opts.get("fontScale", "md"), 1.0)
    hl_y = {"top": 230, "top-right": 230, "center": 410, "bottom": 885}.get(opts.get("headlinePos", "top"), 230)
    cap_y = {"bottom-safe": 1095, "below-card": 905, "center": 640, "top": 150}.get(opts.get("captionPos", "bottom-safe"), 1095)
    headline = (beat.get("headline") or "").strip()
    keyword = (beat.get("keyword") or "").strip()

    # 1. Flowline ribbon BEHIND subject (except kinetic-text full typographic screen)
    if opts.get("flowlineRibbon", True) and vtype != "kinetic-text":
        ctrl = ((-28, 360), (170, 620), (545, 560), (748, 840)) if idx % 2 == 0 else ((748, 390), (530, 640), (190, 590), (-28, 850))
        draw_flowline_ribbon(im, ctrl, t_now, t0 + 0.12, 0.72, 44.0, primary, t_exit=max(t0 + 0.9, t1 - 0.35), exit_dur=0.35)

    # 2. Layout-specific visual body
    asset_p = resolve_local_asset(beat.get("assetUrl", "")) or resolve_local_asset((state.get("media", {}).get("logo") or {}).get("path", ""))

    if vtype == "kinetic-text":
        draw_word(im, headline or keyword, W / 2, 560, round(66 * f_mul), text_col, disp_font, t_now, t0 + 0.06, 0.28, badge="underline", badge_color=primary)
        if keyword and keyword != headline:
            draw_word(im, keyword, W / 2, 725, round(52 * f_mul), contrast_text(accent), disp_font, t_now, t0 + 0.28, 0.26, badge="pill", badge_color=accent)
    elif vtype == "counter":
        # Big animated number highlight card
        num_m = re.search(r"[\d\u06F0-\u06F9]+", f"{headline} {keyword} {beat.get('spoken', '')}")
        big_num = num_m.group(0) if num_m else "۱۰۰٪"
        card = Image.new("RGBA", (480, 300), (0, 0, 0, 0))
        fill = (24, 30, 44, 242) if is_dark else (255, 255, 255, 250)
        ImageDraw.Draw(card).rounded_rectangle((0, 0, 479, 299), radius=36, fill=fill, outline=hex_to_rgb(primary) + (200,), width=4)
        paste_center(im, card, W / 2, 625)
        draw_word(im, big_num, W / 2, 615, 108, primary, disp_font, t_now, t0 + 0.12, 0.34)
        if headline:
            draw_word(im, headline, W / 2, hl_y, round(48 * f_mul), text_col, disp_font, t_now, t0 + 0.06, 0.26, badge="underline", badge_color=primary)
        if keyword and text_mode in ("keywords", "both"):
            draw_word(im, keyword, W / 2, 975, round(42 * f_mul), contrast_text(accent), disp_font, t_now, t0 + 0.32, 0.26, badge="pill", badge_color=accent)
    elif vtype == "compare":
        # Dual side-by-side comparison cards
        for side_i, (cx_c, title_c, col_c) in enumerate([(200, "روش قدیمی", "#EF4444"), (520, keyword or "روش هوشمند", primary)]):
            c_im = Image.new("RGBA", (275, 320), (0, 0, 0, 0))
            fill = (24, 30, 44, 240) if is_dark else (255, 255, 255, 248)
            ImageDraw.Draw(c_im).rounded_rectangle((0, 0, 274, 319), radius=28, fill=fill, outline=hex_to_rgb(col_c) + (210,), width=3)
            u_c = ease_out_quart(clamp01((t_now - t0 - side_i * 0.18) / 0.30))
            paste_center(im, c_im, cx_c, 630 + round(24 * (1.0 - u_c)))
            draw_word(im, title_c, cx_c, 630, 34, col_c, disp_font, t_now, t0 + 0.14 + side_i * 0.18, 0.24, max_w=240)
        if headline:
            draw_word(im, headline, W / 2, hl_y, round(48 * f_mul), text_col, disp_font, t_now, t0 + 0.06, 0.26, badge="underline", badge_color=primary)
    else:
        # Full-bleed Cinematic 3D Screen Motion for UI showcases / screenshots!
        smode = beat.get("screenMotion") or ("zoom-in-click" if vtype == "ui-showcase" else "card")
        is_cinematic_screen = bool(asset_p) and (vtype == "ui-showcase" or smode not in ("card", "auto")) and (
            asset_p.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")
        )
        if is_cinematic_screen and smode != "card":
            render_cinematic_screen_stage(im, asset_p, beat, t_now, t0, t1)
            t_anim = opts.get("textAnimStyle", "classic-rise")
            if headline and opts.get("headlinePos", "top") != "none":
                draw_styled_headline(im, headline, W / 2, hl_y, round(46 * f_mul), "#FFFFFF", accent, disp_font, t_now, t0 + 0.06, text_anim=t_anim, motion_preset=mpreset)
            if keyword and text_mode in ("keywords", "both"):
                draw_word(im, keyword, W / 2, 985, round(40 * f_mul), contrast_text(accent), disp_font, t_now, t0 + 0.32, 0.26, badge="pill", badge_color=accent, motion_preset=mpreset)
        else:
            # Standard card-ribbon / icon-focus
            if asset_p:
                frameless = (vtype == "icon-focus")
                card = load_card_image(str(asset_p), max_w=500, max_h=430, is_dark=is_dark, frameless=frameless)
                u_in = ease_out_quart(clamp01((t_now - t0) / 0.32))
                paste_center(im, card, W / 2, 625 + round(28 * (1.0 - u_in)))
            else:
                ph = Image.new("RGBA", (340, 220), (0, 0, 0, 0))
                fill = (30, 41, 59, 235) if is_dark else (255, 255, 255, 245)
                ImageDraw.Draw(ph).rounded_rectangle((0, 0, 339, 219), radius=30, fill=fill, outline=hex_to_rgb(primary) + (180,), width=3)
                paste_center(im, ph, W / 2, 625)

            t_anim = opts.get("textAnimStyle", "classic-rise")
            if headline and opts.get("headlinePos", "top") != "none":
                draw_styled_headline(im, headline, W / 2, hl_y, round(50 * f_mul), text_col, primary, disp_font, t_now, t0 + 0.06, text_anim=t_anim, motion_preset=mpreset)
            if keyword and text_mode in ("keywords", "both"):
                draw_word(im, keyword, W / 2, 975, round(42 * f_mul), contrast_text(accent), disp_font, t_now, t0 + 0.32, 0.26, badge="pill", badge_color=accent, motion_preset=mpreset)

    spoken = (beat.get("spoken") or "").strip()
    if ((text_mode in ("captions", "description", "both")) or (opts.get("captions", "none") != "none")) and spoken:
        t_anim = opts.get("textAnimStyle", "classic-rise")
        if t_anim in ("word-unblur", "emphasis-word", "word-pop", "typewriter"):
            draw_styled_headline(im, spoken[:96], W / 2, cap_y, round(26 * f_mul), text_col, accent, body_font, t_now, t0 + 0.15, text_anim=t_anim, motion_preset=mpreset, max_w=600)
        else:
            draw_word(im, spoken[:96], W / 2, cap_y, round(25 * f_mul), text_col, body_font, t_now, t0 + 0.15, 0.22, max_w=600, motion_preset=mpreset)

    draw_handle_watermark(im, brand, t_now, t0)
    return im


def eval_scene_fg(scene: dict[str, Any], state: dict[str, Any], t_now: float) -> Image.Image:
    k = scene.get("kind", "beat")
    if k == "intro":
        return render_intro_fg(scene, state, t_now)
    if k == "outro":
        return render_outro_fg(scene, state, t_now)
    return render_beat_fg(scene, scene.get("beatIdx", 0), state, t_now)


def render_master_frame(state: dict[str, Any], scenes: list[dict[str, Any]], frame_idx: int) -> Image.Image:
    t_now = frame_idx / FPS
    brand = state.get("brand", {})
    opts = state.get("options", {})
    base_bg = build_studio_backdrop(brand.get("bg", "#F4F5F2"))
    if not scenes:
        return base_bg

    idx = 0
    for i, sc in enumerate(scenes):
        if t_now >= float(sc["t"]):
            idx = i

    cur_sc = scenes[idx]
    dt = t_now - float(cur_sc["t"])
    hybrid = opts.get("hybrid") or {}
    sc_tr = cur_sc.get("transition")
    if hybrid.get("transitions") or not sc_tr or sc_tr == "auto":
        tr_cycle = ["push", "push", "circles", "push", "circles"]
        tr_kind = tr_cycle[idx % len(tr_cycle)]
    else:
        tr_kind = sc_tr or opts.get("transition") or "push"
    tr_dur = 0.55

    if idx > 0 and dt < tr_dur:
        u = clamp01(dt / tr_dur)
        if tr_kind == "circles":
            prev_comp = Image.alpha_composite(base_bg.convert("RGBA"), eval_scene_fg(scenes[idx - 1], state, t_now)).convert("RGB")
            cur_comp = Image.alpha_composite(base_bg.convert("RGBA"), eval_scene_fg(cur_sc, state, t_now)).convert("RGB")
            rad = round(12 + 780 * ease_in_out_quint(u))
            mask = Image.new("L", (W, H), 0)
            ImageDraw.Draw(mask).ellipse((W // 2 - rad, H // 2 - rad, W // 2 + rad, H // 2 + rad), fill=255)
            frame = Image.composite(cur_comp, prev_comp, mask.filter(ImageFilter.GaussianBlur(2)))
        else:
            prev_fg = eval_scene_fg(scenes[idx - 1], state, t_now)
            cur_fg = eval_scene_fg(cur_sc, state, t_now)
            vertical = (idx % 3 == 2)

            def make_pair(qv: float) -> Image.Image:
                c = base_bg.convert("RGBA")
                if vertical:
                    dy = round(qv * H)
                    paste_center(c, prev_fg, W / 2, H / 2 - dy)
                    paste_center(c, cur_fg, W / 2, H / 2 + (H - dy))
                else:
                    dx = round(qv * W)
                    paste_center(c, prev_fg, W / 2 - dx, H / 2)
                    paste_center(c, cur_fg, W / 2 + (W - dx), H / 2)
                return c.convert("RGB")

            vel = scroll_velocity(u)
            if vel > 0.14 and opts.get("spatialScroll", True):
                taps = (-1.0, -0.66, -0.33, 0.0, 0.33, 0.66, 1.0)
                weights = (0.06, 0.12, 0.20, 0.24, 0.20, 0.12, 0.06)
                span = 0.008 * vel
                acc = np.zeros((H, W, 3), dtype=np.float32)
                for to, wt in zip(taps, weights):
                    acc += np.asarray(make_pair(ease_scroll(clamp01(u + to * span))), dtype=np.float32) * wt
                frame = Image.fromarray(np.uint8(np.clip(acc, 0, 255)))
            else:
                frame = make_pair(ease_scroll(u))
    else:
        frame = Image.alpha_composite(base_bg.convert("RGBA"), eval_scene_fg(cur_sc, state, t_now)).convert("RGB")

    if opts.get("cornerBlurAccents", True):
        rgba_f = frame.convert("RGBA")
        draw_corner_accents(rgba_f, t_now, brand.get("text", "#262B2E"))
        frame = rgba_f.convert("RGB")

    return frame


def resolve_footage_path(name: str) -> Path | None:
    if not name or name == "none":
        return None
    for d in (ASSETS_DIR / "footage", ASSETS_DIR / "footage" / "user"):
        for ext in ("", ".mp4", ".mov"):
            p = d / f"{name}{ext}"
            if p.exists() and p.is_file():
                return p
    return None


def resolve_music_path(name: str) -> Path | None:
    if not name or name == "none":
        return None
    for ext in ("", ".mp3", ".wav", ".ogg", ".m4a"):
        p = ASSETS_DIR / "music" / f"{name}{ext}"
        if p.exists() and p.is_file():
            return p
    return None


def resolve_sfx_path(name: str) -> Path | None:
    if not name:
        return None
    for d in (ASSETS_DIR / "sfx" / "user", ASSETS_DIR / "sfx"):
        for ext in ("", ".wav", ".mp3", ".ogg"):
            p = d / f"{name}{ext}"
            if p.exists() and p.is_file():
                return p
    return None


def render_project_pinterest(project_dir: Path, mode: str = "preview") -> dict[str, str]:
    state = json.loads((project_dir / "studio_state.json").read_text(encoding="utf-8"))
    scenes = build_timeline_scenes(state)
    build_dir = project_dir / "build"
    build_dir.mkdir(parents=True, exist_ok=True)

    if mode == "preview":
        sample_ts = [round(float(sc["t"]) + min(0.95, (float(sc["end"]) - float(sc["t"])) * 0.55), 2) for sc in scenes[:5]] or [0.8]
        tw, th = 300, round(300 * H / W)
        sheet = Image.new("RGB", (tw * len(sample_ts), th))
        for i, ts in enumerate(sample_ts):
            im = render_master_frame(state, scenes, round(ts * FPS)).resize((tw, th), Image.Resampling.LANCZOS)
            sheet.paste(im, (i * tw, 0))
        out_jpg = build_dir / "preview.jpg"
        sheet.save(out_jpg, quality=92)
        print("PROGRESS: 100", flush=True)
        return {"preview": str(out_jpg)}

    # Full MP4 render (Step 1: Raw video track -> Step 2: Mux audio, music, SFX & footage overlay FX)
    duration = float(scenes[-1]["end"]) if scenes else 4.0
    total_frames = max(1, ceil(duration * FPS))
    raw_mp4 = build_dir / "_raw_video.mp4"
    out_mp4 = project_dir / "final.mp4"

    cmd_v = [
        "ffmpeg", "-loglevel", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
        "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-pix_fmt", "yuv420p",
        str(raw_mp4),
    ]
    proc = subprocess.Popen(cmd_v, stdin=subprocess.PIPE)
    assert proc.stdin is not None
    step_report = max(1, total_frames // 20)
    for f_no in range(total_frames):
        proc.stdin.write(render_master_frame(state, scenes, f_no).tobytes())
        if f_no % step_report == 0:
            pct = min(85, round(f_no / total_frames * 85))
            print(f"PROGRESS: {pct}", flush=True)
    proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError("FFmpeg raw video encoding failed")

    # Step 2: Composite optional footage overlay + source audio + background music + beat SFX
    opts = state.get("options", {})
    foot_p = resolve_footage_path(opts.get("footageFx", "none"))
    music_p = resolve_music_path(opts.get("music", "none"))
    src_info = state.get("media", {}).get("source")
    src_p = Path(src_info["path"]) if (src_info and Path(src_info.get("path", "")).exists()) else None

    sfx_events = []
    for sc in scenes:
        if sc.get("kind") == "beat" and sc.get("sfx"):
            sp = resolve_sfx_path(sc["sfx"])
            if sp:
                sfx_events.append((float(sc["t"]), sp))
    sfx_events = sfx_events[:12]  # Cap filter graph complexity cleanly

    inputs = ["-i", str(raw_mp4)]
    next_idx = 1
    v_label = "0:v"
    filters = []

    if foot_p:
        op = max(0.05, min(1.0, float(opts.get("footageOpacity", 0.35))))
        inputs.extend(["-stream_loop", "-1", "-i", str(foot_p)])
        f_idx = next_idx
        next_idx += 1
        filters.append(f"[{f_idx}:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},format=rgba,colorchannelmixer=aa={op:.2f}[fxv]")
        filters.append(f"[0:v][fxv]blend=all_mode=screen:all_opacity={op:.2f}[vout]")
        v_label = "[vout]"

    audio_streams = []
    if src_p:
        inputs.extend(["-i", str(src_p)])
        s_idx = next_idx
        next_idx += 1
        intro_ms = round((float(opts.get("introDur", 2.0)) if opts.get("introStyle", "none") != "none" else 0.0) * 1000)
        af = f"[{s_idx}:a]adelay={intro_ms}|{intro_ms},aformat=sample_rates=44100:channel_layouts=stereo[voice]"
        filters.append(af)
        audio_streams.append("[voice]")

    if music_p:
        inputs.extend(["-stream_loop", "-1", "-i", str(music_p)])
        m_idx = next_idx
        next_idx += 1
        mgain = float(opts.get("musicGain", -20))
        filters.append(f"[{m_idx}:a]volume={mgain}dB,atrim=0:{duration:.2f},aformat=sample_rates=44100:channel_layouts=stereo[bgm]")
        audio_streams.append("[bgm]")

    sfx_gain = float(opts.get("sfxGain", -4))
    for si, (t_ev, sp) in enumerate(sfx_events):
        inputs.extend(["-i", str(sp)])
        x_idx = next_idx
        next_idx += 1
        dms = max(0, round(t_ev * 1000))
        filters.append(f"[{x_idx}:a]volume={sfx_gain}dB,adelay={dms}|{dms},aformat=sample_rates=44100:channel_layouts=stereo[sfx{si}]")
        audio_streams.append(f"[sfx{si}]")

    if not audio_streams:
        inputs.extend(["-f", "lavfi", "-t", f"{duration:.2f}", "-i", "anullsrc=r=44100:cl=stereo"])
        a_label = f"{next_idx}:a"
    elif len(audio_streams) == 1:
        a_label = audio_streams[0]
    else:
        filters.append(f"{''.join(audio_streams)}amix=inputs={len(audio_streams)}:duration=longest:dropout_transition=2,alimiter=limit=0.95[aout]")
        a_label = "[aout]"

    cmd_mix = ["ffmpeg", "-loglevel", "error", "-y", *inputs]
    if filters:
        cmd_mix.extend(["-filter_complex", ";".join(filters)])
    cmd_mix.extend([
        "-map", v_label, "-map", a_label,
        "-t", f"{duration:.2f}",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
        str(out_mp4),
    ])
    proc2 = subprocess.run(cmd_mix, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if proc2.returncode != 0:
        raise RuntimeError(f"FFmpeg final mix failed: {proc2.stderr[-400:]}")
    raw_mp4.unlink(missing_ok=True)
    print("PROGRESS: 100", flush=True)
    return {"video": str(out_mp4)}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python studio/pinterest_renderer.py <project_dir> [preview|full]")
        sys.exit(1)
    print(json.dumps(render_project_pinterest(Path(sys.argv[1]), sys.argv[2] if len(sys.argv) > 2 else "preview"), ensure_ascii=False))
