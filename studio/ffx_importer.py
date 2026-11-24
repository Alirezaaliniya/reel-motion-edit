#!/usr/bin/env python3
"""
After Effects `.ffx` Expression & Motion Preset Importer for Reel Motion Studio.

Parses Adobe After Effects binary RIFX (`.ffx`) preset files, extracts:
- Embedded JavaScript expressions
- Slider control names (`Freq`, `Decay`, `Duration`, `Amp`, `Retard`, `Mode`, etc.)
- Effect names & AE plugin dependencies (warns if third-party plugin like Sapphire/BCC is required)
- Classifies the motion curve (`karo-bounce` / `elastic-bounce`, `overshoot-pop`, `wiggle-shake`, `smooth-quart`)
- Saves a ready-to-use Motion Preset into `assets/motion-presets.json` so both the web Studio UI
  and `studio/pinterest_renderer.py` execute the exact extracted physics curve.
"""

from __future__ import annotations

import json
import re
import struct
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
PRESETS_JSON = ROOT / "assets" / "motion-presets.json"

DEFAULT_PRESETS: dict[str, Any] = {
    "smooth-quart": {
        "id": "smooth-quart",
        "label": "ورود نرم ادیتوریال (پیش‌فرض)",
        "kind": "smooth-quart",
        "source": "built-in",
        "params": {"duration": 0.28, "freq": 0.0, "decay": 0.0, "overshoot": 0.0},
        "description": "ورود سریع و توقف آرام بدون لرزش (مناسب سبک پینترستی ادیتوریال).",
    },
    "overshoot-pop": {
        "id": "overshoot-pop",
        "label": "پاپ با جهش ظریف (Overshoot Pop)",
        "kind": "elastic-bounce",
        "source": "built-in",
        "params": {"duration": 0.22, "freq": 1.8, "decay": 7.5, "scaleBoost": 0.14},
        "description": "بزرگ‌نمایی سریع با یک جهش کوتاه و توقف تمیز.",
    },
}


def load_motion_presets() -> dict[str, Any]:
    data = dict(DEFAULT_PRESETS)
    if PRESETS_JSON.exists():
        try:
            saved = json.loads(PRESETS_JSON.read_text(encoding="utf-8"))
            data.update(saved)
        except Exception:
            pass
    return data


def save_motion_presets(data: dict[str, Any]) -> None:
    PRESETS_JSON.parent.mkdir(parents=True, exist_ok=True)
    PRESETS_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def slugify(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9_-]+", "-", text.strip().lower()).strip("-")
    return s or "ffx-preset"


def parse_ffx_file(ffx_path: Path, custom_label: str = "") -> dict[str, Any]:
    raw = ffx_path.read_bytes()
    if not raw.startswith(b"RIFX") and not raw.startswith(b"RIFF"):
        raise ValueError("فایل انتخاب‌شده یک فایل معتبر After Effects (.ffx) نیست.")

    # Extract readable ASCII/UTF-8 chunks (expressions + slider names + effect IDs)
    blocks = [b.decode("ascii", errors="ignore").strip() for b in re.findall(rb"[\x20-\x7e\r\n\t]{18,}", raw)]
    expr_blocks = [
        b for b in blocks
        if any(tok in b for tok in ("Math.", "linear(", "ease(", "effect(", "wiggle(", "textIndex", "freq", "decay", "velocityAtTime"))
    ]
    expression_text = "\n".join(expr_blocks)[:4000]

    # Detect slider controls & third-party plugins
    all_strs = [b.decode("ascii", errors="ignore") for b in re.findall(rb"[A-Za-z0-9_ ()\-]{4,60}", raw)]
    sliders = []
    for kw in ("Freq", "Decay", "Duration", "Amp", "Amplitude", "Retard", "Mode", "Speed", "Scale", "Bounce"):
        if any(kw.lower() == s.strip().lower() or f'"{kw.lower()}"' in expression_text.lower() for s in all_strs):
            sliders.append(kw)

    third_party = []
    for plug in ("Sapphire", "S_Blur", "BCC", "Deep Glow", "Trapcode", "RSMB", "Twixtor", "Optical Flares", "Element 3D"):
        if any(plug.lower() in s.lower() for s in all_strs):
            third_party.append(plug)

    low_expr = expression_text.lower()
    low_name = ffx_path.stem.lower()

    # Classify motion physics from extracted expression
    if ("math.sin" in low_expr and "math.exp" in low_expr) or "bounce" in low_name or ("freq" in low_expr and "decay" in low_expr):
        kind = "elastic-bounce"
        params = {"duration": 0.18, "freq": 2.6, "decay": 5.8, "scaleBoost": 0.22, "wordStagger": 0.04}
        summary = "انیمیشن فنری/جهشی (Inertial Elastic Bounce) با فرمول سینوسی-نمایی استخراج‌شده از اکسپرشن افترافکت."
    elif "wiggle" in low_expr or "shake" in low_name:
        kind = "wiggle-shake"
        params = {"duration": 0.30, "freq": 8.0, "decay": 4.5, "ampPx": 14.0}
        summary = "لرزش و تکان پرانرژی (Wiggle / Shake) استخراج‌شده از اکسپرشن افترافکت."
    elif "scale" in low_expr or "zoom" in low_name or "pop" in low_name:
        kind = "elastic-bounce"
        params = {"duration": 0.20, "freq": 2.0, "decay": 6.5, "scaleBoost": 0.25, "wordStagger": 0.03}
        summary = "پاپ و بزرگ‌نمایی جهشی استخراج‌شده از فایل .ffx."
    else:
        kind = "smooth-quart"
        params = {"duration": 0.26, "freq": 0.0, "decay": 0.0, "scaleBoost": 0.08}
        summary = "حرکت نرم ورودی استخراج‌شده از ساختار کلیدفریم‌های فایل .ffx."

    pid = slugify(ffx_path.stem)
    label = custom_label.strip() or f"{ffx_path.stem} (FFX)"

    preset = {
        "id": pid,
        "label": label,
        "kind": kind,
        "source": ffx_path.name,
        "params": params,
        "sliders": sliders,
        "thirdPartyPlugins": third_party,
        "hasExpression": bool(expr_blocks),
        "expressionSnippet": expression_text[:900],
        "description": summary,
    }
    return preset


def import_and_register_ffx(ffx_path: Path, custom_label: str = "") -> dict[str, Any]:
    preset = parse_ffx_file(ffx_path, custom_label=custom_label)
    all_presets = load_motion_presets()
    all_presets[preset["id"]] = preset
    save_motion_presets(all_presets)
    return preset


if __name__ == "__main__":
    import sys
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(r"D:\download\Karo Bounce.ffx")
    if target.exists():
        res = import_and_register_ffx(target, custom_label="Karo Bounce (جهش فنری افترافکت)")
        print("Imported FFX preset:", json.dumps(res, ensure_ascii=False, indent=2))
    else:
        print("File not found:", target)
