#!/usr/bin/env python3
"""
Reference Style Cloner for Reel Motion Studio.

Analyzes any uploaded reference video (.mp4/.mov/.webm) or image (.png/.jpg/.webp) and extracts:
1. Metadata (width, height, fps, duration)
2. Scene cuts & exact pacing (average shot duration, pace profile: fast/medium/calm)
3. Transition & motion fingerprint (horizontal/vertical spatial scroll vs zoom vs dissolve/cut)
4. Exact dominant studio palette (bg, text, primary, accent) via saturation-weighted quantization
5. Keyframe contact sheet (`contact_sheet.jpg`) + clean 540x960 gallery card thumbnail (`thumb.jpg`)
6. Structured Persian technical breakdown + AI Deep-Clone request JSON for zero-API MCP/Agent refinement
"""

from __future__ import annotations

import json
import subprocess
import uuid
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
STUDIO_DIR = ROOT / "studio"
CLONES_DIR = STUDIO_DIR / "projects" / "_ref_clones"
CLONES_DIR.mkdir(parents=True, exist_ok=True)


def run_cmd(cmd: list[str]) -> bytes:
    proc = subprocess.run(cmd, capture_output=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.decode("utf-8", errors="ignore")[-400:])
    return proc.stdout


def probe_media(path: Path) -> dict[str, Any]:
    out = run_cmd(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)])
    j = json.loads(out.decode("utf-8", errors="ignore"))
    v = next((s for s in j.get("streams", []) if s.get("codec_type") == "video"), None)
    if not v:
        raise ValueError("فایل ویدیویی یا تصویری معتبر نیست.")
    num, den = map(int, (v.get("r_frame_rate") or "30/1").split("/"))
    fps = round(num / max(den, 1), 2)
    dur = float(j.get("format", {}).get("duration") or 0.0)
    return {
        "width": int(v.get("width") or 720),
        "height": int(v.get("height") or 1280),
        "fps": fps,
        "duration": round(dur, 2),
        "hasAudio": any(s.get("codec_type") == "audio" for s in j.get("streams", [])),
    }


def extract_palette_from_images(images: list[Image.Image]) -> dict[str, str]:
    """Extract bg, text, primary, accent from representative frames."""
    bg_pixels = []
    vivid_pixels = []
    for im in images:
        small = im.convert("RGB").resize((90, 160), Image.Resampling.BILINEAR)
        arr = np.asarray(small, dtype=np.uint8)
        # Border strips represent studio background
        border = np.concatenate([
            arr[:18, :, :].reshape(-1, 3),
            arr[-18:, :, :].reshape(-1, 3),
            arr[:, :12, :].reshape(-1, 3),
            arr[:, -12:, :].reshape(-1, 3),
        ], axis=0)
        bg_pixels.append(border)
        vivid_pixels.append(arr.reshape(-1, 3))

    all_bg = np.concatenate(bg_pixels, axis=0)
    bg_rgb = tuple(int(x) for x in np.median(all_bg, axis=0))
    bg_hex = "#{:02X}{:02X}{:02X}".format(*bg_rgb)
    bg_lum = 0.299 * bg_rgb[0] + 0.587 * bg_rgb[1] + 0.114 * bg_rgb[2]
    text_hex = "#F4F6FA" if bg_lum < 125 else "#1E2428"

    all_px = np.concatenate(vivid_pixels, axis=0)
    # Sample up to 12000 pixels for fast median-cut quantization
    step = max(1, len(all_px) // 12000)
    sample = all_px[::step]
    s_im = Image.fromarray(sample.reshape(1, -1, 3), mode="RGB")
    quant = s_im.quantize(colors=10, method=Image.Quantize.MEDIANCUT).convert("RGB")
    counts = quant.getcolors(maxcolors=32) or []

    def score(item):
        cnt, (r, g, b) = item
        mx, mn = max(r, g, b), min(r, g, b)
        sat = (mx - mn) / max(mx, 1)
        dist_bg = abs(r - bg_rgb[0]) + abs(g - bg_rgb[1]) + abs(b - bg_rgb[2])
        if dist_bg < 55:
            return 0.0
        return cnt * (0.15 + 4.0 * (sat ** 1.5))

    counts.sort(key=score, reverse=True)
    vivids = [c[1] for c in counts if score(c) > 0]
    primary = "#{:02X}{:02X}{:02X}".format(*vivids[0]) if vivids else "#007AFF"
    accent = "#{:02X}{:02X}{:02X}".format(*vivids[1]) if len(vivids) > 1 else "#F8D146"
    return {
        "bg": bg_hex,
        "text": text_hex,
        "primary": primary,
        "accent": accent,
        "isDark": bg_lum < 125,
    }


def analyze_video_motion_and_cuts(path: Path, dur: float) -> dict[str, Any]:
    """Sample 6fps grayscale frames to detect cuts, pacing, and directional scroll vs zoom/cut."""
    fps_s = 6
    w, h = 64, 112
    raw = run_cmd([
        "ffmpeg", "-v", "error", "-i", str(path),
        "-vf", f"fps={fps_s},scale={w}:{h},format=gray",
        "-f", "rawvideo", "-",
    ])
    if not raw:
        return {"cuts": [], "avgShotSec": dur, "pace": "medium", "dominantTransition": "push", "motionProfile": {}}

    fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
    n = len(fr)
    if n < 3:
        return {"cuts": [], "avgShotSec": dur, "pace": "medium", "dominantTransition": "push", "motionProfile": {}}

    diffs = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
    med = float(np.median(diffs)) + 0.5
    cuts = []
    for i in range(1, len(diffs) - 1):
        if diffs[i] >= diffs[i - 1] and diffs[i] >= diffs[i + 1] and diffs[i] > max(3.2 * med, 7.5):
            t_sec = round((i + 1) / fps_s, 2)
            if not cuts or (t_sec - cuts[-1]) >= 0.45:
                cuts.append(t_sec)

    # Estimate horizontal vs vertical scroll energy across active motion frames
    horiz_score = 0.0
    vert_score = 0.0
    static_frames = 0
    for i in range(n - 1):
        d = diffs[i]
        if d < 1.2:
            static_frames += 1
            continue
        a, b = fr[i], fr[i + 1]
        # Compare 4px shift error in X vs Y
        ex_r = float(np.abs(a[:, :-4] - b[:, 4:]).mean())
        ex_l = float(np.abs(a[:, 4:] - b[:, :-4]).mean())
        ey_d = float(np.abs(a[:-4, :] - b[4:, :]).mean())
        ey_u = float(np.abs(a[4:, :] - b[:-4, :]).mean())
        base_e = float(np.abs(a - b).mean())
        best_x = min(ex_r, ex_l)
        best_y = min(ey_d, ey_u)
        if best_x < base_e * 0.88 and best_x < best_y:
            horiz_score += 1.0
        elif best_y < base_e * 0.88 and best_y < best_x:
            vert_score += 1.0

    num_shots = max(1, len(cuts) + 1)
    avg_shot = round(max(dur, 1.0) / num_shots, 2)
    pace = "تند و پرانرژی" if avg_shot < 2.2 else ("متعادل و ادیتوریال" if avg_shot < 4.8 else "آرام و سینمایی")

    if horiz_score + vert_score >= max(2.0, n * 0.06):
        dom_tr = "push"
        tr_desc = f"اسکرول فضایی پیوسته ({'افقی' if horiz_score >= vert_score else 'عمودی'} / Spatial Scroll)"
    elif len(cuts) >= max(2, int(dur / 3.0)):
        dom_tr = "zoom"
        tr_desc = "برش‌های سریع و زوم‌محور (Cut / Zoom)"
    else:
        dom_tr = "circles"
        tr_desc = "ترنزیشن نرم / دایره‌ای (Iris / Dissolve)"

    hold_ratio = round(static_frames / max(n - 1, 1) * 100, 1)
    return {
        "cuts": cuts,
        "shotCount": num_shots,
        "avgShotSec": avg_shot,
        "pace": pace,
        "dominantTransition": dom_tr,
        "transitionDesc": tr_desc,
        "holdRatioPct": hold_ratio,
        "hasSpatialScroll": (horiz_score + vert_score) >= max(2.0, n * 0.05),
    }


def extract_keyframe(video_path: Path, t_sec: float, out_jpg: Path) -> Image.Image:
    run_cmd([
        "ffmpeg", "-v", "error", "-y", "-ss", f"{max(0.0, t_sec):.2f}",
        "-i", str(video_path), "-frames:v", "1", "-q:v", "2", str(out_jpg),
    ])
    return Image.open(out_jpg).convert("RGB")


def clone_reference(file_path: Path, display_name: str = "") -> dict[str, Any]:
    clone_id = f"ref-{uuid.uuid4().hex[:8]}"
    work = CLONES_DIR / clone_id
    work.mkdir(parents=True, exist_ok=True)

    is_image = file_path.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")
    keyframes: list[Image.Image] = []
    key_times: list[float] = []

    if is_image:
        im = Image.open(file_path).convert("RGB")
        keyframes = [im]
        key_times = [0.0]
        info = {"width": im.width, "height": im.height, "fps": 30, "duration": 0.0, "hasAudio": False, "isImage": True}
        motion = {
            "cuts": [],
            "shotCount": 1,
            "avgShotSec": 3.5,
            "pace": "متعادل و ادیتوریال",
            "dominantTransition": "push",
            "transitionDesc": "اسکرول فضایی یا دیزالو نرم (بر اساس تصویر رفرنس)",
            "holdRatioPct": 100.0,
            "hasSpatialScroll": True,
        }
    else:
        info = probe_media(file_path)
        info["isImage"] = False
        dur = max(info["duration"], 1.0)
        motion = analyze_video_motion_and_cuts(file_path, dur)

        # Pick 6 representative timestamps across shots
        cuts = motion["cuts"]
        if len(cuts) >= 4:
            bounds = [0.0] + cuts + [dur]
            mids = [(bounds[i] + bounds[i + 1]) / 2.0 for i in range(len(bounds) - 1)]
            step = max(1, len(mids) // 6)
            key_times = [round(t, 2) for t in mids[::step][:6]]
        else:
            key_times = [round(dur * f, 2) for f in (0.08, 0.24, 0.42, 0.60, 0.78, 0.92)]

        for idx, ts in enumerate(key_times):
            kf_p = work / f"kf_{idx:02d}.jpg"
            try:
                keyframes.append(extract_keyframe(file_path, ts, kf_p))
            except Exception:
                pass

    if not keyframes:
        raise RuntimeError("استخراج فریم کلیدی از فایل رفرنس ناموفق بود.")

    palette = extract_palette_from_images(keyframes)

    # Pick cleanest middle keyframe as the official 540x960 gallery card thumbnail
    hero_kf = keyframes[min(1, len(keyframes) - 1)]
    thumb_im = hero_kf.copy()
    # Center-crop to 9:16 then resize to 540x960
    target_ar = 540 / 960
    cur_ar = thumb_im.width / max(thumb_im.height, 1)
    if cur_ar > target_ar:
        new_w = round(thumb_im.height * target_ar)
        x0 = (thumb_im.width - new_w) // 2
        thumb_im = thumb_im.crop((x0, 0, x0 + new_w, thumb_im.height))
    else:
        new_h = round(thumb_im.width / target_ar)
        y0 = (thumb_im.height - new_h) // 2
        thumb_im = thumb_im.crop((0, y0, thumb_im.width, y0 + new_h))
    thumb_im = thumb_im.resize((540, 960), Image.Resampling.LANCZOS)
    thumb_path = work / "thumb.jpg"
    thumb_im.save(thumb_path, quality=93)

    # Build keyframe contact sheet (up to 6 frames side by side)
    tw, th = 220, 390
    sheet = Image.new("RGB", (tw * len(keyframes), th), (15, 18, 26))
    font = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 14)
    for i, kf in enumerate(keyframes):
        tile = kf.resize((tw, th), Image.Resampling.LANCZOS)
        d = ImageDraw.Draw(tile)
        d.rectangle((6, 6, 78, 28), fill=(0, 0, 0))
        d.text((12, 9), f"{key_times[i]:.1f}s", fill=(250, 204, 21), font=font)
        sheet.paste(tile, (i * tw, 0))
    sheet_path = work / "contact_sheet.jpg"
    sheet.save(sheet_path, quality=90)

    # Build rich Persian technical blueprint
    suggested_label = display_name.strip() or f"سبک کلون‌شده ({file_path.stem[:18]})"
    summary_lines = [
        f"• **ابعاد و ریتم رفرنس:** {info['width']}×{info['height']} | نرخ فریم `{info['fps']}fps` | مدت `{info['duration']}s` | تعداد سکانس تقریبی: `{motion['shotCount']}` (میانگین هر سکانس `{motion['avgShotSec']}s` — ریتم **{motion['pace']}**).",
        f"• **الگوی حرکت و ترنزیشن:** {motion['transitionDesc']} | درصد مکث خوانایی روی فریم‌ها: `{motion['holdRatioPct']}%`.",
        f"• **پالت رنگ استخراج‌شده:** پس‌زمینه `{palette['bg']}` ({'تم تیره' if palette['isDark'] else 'تم روشن'}) | متن `{palette['text']}` | رنگ اصلی `{palette['primary']}` | رنگ تأکید `{palette['accent']}`.",
        f"• **پیشنهاد تایپوگرافی و افکت:** تیتر با فونت `Hasti` و متن با `Pinar`، خط منحنی پشت کارت: `{'فعال' if not palette['isDark'] else 'اختیاری'}`، اسکرول فضایی: `{'فعال' if motion['hasSpatialScroll'] else 'ترکیبی'}`.",
    ]

    result = {
        "cloneId": clone_id,
        "sourcePath": str(file_path),
        "suggestedLabel": suggested_label,
        "info": info,
        "motion": motion,
        "palette": palette,
        "thumbPath": str(thumb_path),
        "thumbUrl": f"/projects-files/_ref_clones/{clone_id}/thumb.jpg",
        "sheetPath": str(sheet_path),
        "sheetUrl": f"/projects-files/_ref_clones/{clone_id}/contact_sheet.jpg",
        "report": "\n".join(summary_lines),
        "recommendedStyle": {
            "label": suggested_label,
            "primary": palette["primary"],
            "accent": palette["accent"],
            "dark": palette["bg"],
            "text": palette["text"],
            "displayFont": "Hasti",
            "bodyFont": "Pinar",
            "transitions": [motion["dominantTransition"], "circles"],
            "captions": "none" if not palette["isDark"] else "highlight",
            "flowlineRibbon": not palette["isDark"],
            "cornerBlurAccents": not palette["isDark"],
            "spatialScroll": motion["hasSpatialScroll"],
        },
        "deepAiCommand": (
            f"کانتکت‌شیت رفرنس در `{sheet_path}` و ویدیوی `{file_path}` را فریم‌به‌فریم بررسی کن، "
            f"تمام جزئیات ریز حرکت، افکت متن، عمق لایه‌ها و ترنزیشن‌ها را استخراج کن و با اندپوینت "
            f"`POST /api/styles/custom` (با referenceImage=`/projects-files/_ref_clones/{clone_id}/thumb.jpg`) "
            f"به‌عنوان یک سبک کامل و دقیق در گالری ذخیره کن."
        ),
    }
    (work / "analysis.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return result


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python studio/reference_cloner.py <video_or_image_path>")
        sys.exit(1)
    res = clone_reference(Path(sys.argv[1]))
    print(json.dumps(res, ensure_ascii=False, indent=2))
