#!/usr/bin/env python3
"""
Real Multimodal AI Director for Reel Motion Studio.

Supports:
1. Google Gemini API (e.g. `gemini-2.5-flash` / `gemini-2.5-pro`) — natively inspects uploaded
   logo, reference screenshots, and product screenshots (vision) + full timestamped transcript.
2. Any OpenAI-compatible API (OpenAI, OpenRouter, DeepSeek, local Ollama/LM Studio) via base URL + API key.
3. Smart local heuristic fallback if no API key is configured yet, while clearly informing the user.

Produces a complete, richly detailed JSON editing plan:
- `analysisReport` (Persian executive summary explaining WHY each style, layout, palette, pacing,
  typography, audio mix, and beat visual was chosen based on the uploaded files)
- `style`, `designSystemRef`, `layout` (A/B/C/D/E), `brand` (colors, fonts, handlePos)
- `options` (textMode, headlinePos, captionPos, fontScale, flowlineRibbon, cornerBlurAccents,
  spatialScroll, footageFx, footageOpacity, music, musicGain, sfxGain, voiceEnhance, musicDucking)
- `beats[]` (time-synced Persian headlines, boxed keywords, exact screenshot/3D-icon assignment,
  visualType, transition, sfx, and detailed motion `aiNote`)
- `cover` (line1, line2, badge)
"""

from __future__ import annotations

import base64
import json
import os
import re
import urllib.request
from pathlib import Path
from typing import Any

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
STUDIO_DIR = ROOT / "studio"
ASSETS_DIR = ROOT / "assets"
CONFIG_PATH = STUDIO_DIR / "ai_config.json"


def load_ai_config() -> dict[str, Any]:
    defaults = {
        "provider": "gemini",  # gemini | openai
        "apiKey": os.environ.get("GEMINI_API_KEY") or os.environ.get("OPENAI_API_KEY") or "",
        "model": "gemini-2.5-flash",
        "baseUrl": "https://api.openai.com/v1",
    }
    if CONFIG_PATH.exists():
        try:
            saved = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
            defaults.update({k: v for k, v in saved.items() if v is not None})
        except Exception:
            pass
    return defaults


def save_ai_config(cfg: dict[str, Any]) -> dict[str, Any]:
    cur = load_ai_config()
    for k in ("provider", "apiKey", "model", "baseUrl"):
        if k in cfg and cfg[k] is not None:
            cur[k] = str(cfg[k]).strip()
    CONFIG_PATH.write_text(json.dumps(cur, ensure_ascii=False, indent=2), encoding="utf-8")
    return cur


def encode_image_b64(path_str: str, max_side: int = 512) -> tuple[str, str] | None:
    """Resize an image safely and return (mime_type, base64_data) for multimodal LLM inspection."""
    p = Path(path_str)
    if not p.exists() or p.suffix.lower() not in (".png", ".jpg", ".jpeg", ".webp"):
        return None
    try:
        im = Image.open(p).convert("RGB")
        im.thumbnail((max_side, max_side))
        import io
        buf = io.BytesIO()
        im.save(buf, format="JPEG", quality=80)
        return "image/jpeg", base64.b64encode(buf.getvalue()).decode("ascii")
    except Exception:
        return None


def build_director_prompt(state: dict[str, Any], catalog_summary: dict[str, Any]) -> str:
    src_info = state.get("sourceInfo") or {}
    media = state.get("media") or {}
    transcript = state.get("transcript") or []
    existing_beats = state.get("beats") or []

    shots_desc = [{"name": s["name"], "url": s["url"]} for s in media.get("screenshots", [])]
    refs_desc = [r["name"] for r in media.get("references", [])]
    transcript_lines = [
        f"[{seg.get('start', 0)}s - {seg.get('end', 0)}s] {seg.get('text', '')}"
        for seg in transcript[:80]
    ]
    if not transcript_lines and existing_beats:
        transcript_lines = [
            f"[{b.get('t', 0)}s - {b.get('end', 3)}s] {b.get('spoken') or b.get('headline') or ''}"
            for b in existing_beats
        ]

    payload = {
        "projectTitle": state.get("title", ""),
        "userFreeformIdea": state.get("freeformDirection", ""),
        "sourceMedia": {
            "uploaded": bool(media.get("source")),
            "filename": (media.get("source") or {}).get("name", ""),
            "hasVideo": bool(src_info.get("has_video")),
            "durationSec": src_info.get("duration") or max((float(b.get("end", 4)) for b in existing_beats), default=12.0),
        },
        "hasLogo": bool(media.get("logo")),
        "uploadedScreenshots": shots_desc,
        "uploadedReferenceFiles": refs_desc,
        "transcriptSegments": transcript_lines,
        "availableStyles": catalog_summary["styleIds"],
        "availableDesignSystems67": catalog_summary["designSystems67"][:40],
        "availableFonts": ["Hasti", "Pinar", "Peyda", "YekanBakh", "Morabba", "IRANSansX", "Lalezar", "Vazirmatn"],
        "available3DIcons": catalog_summary["icons3d"],
        "availableSfx": catalog_summary["sfx"],
        "availableMusic": catalog_summary["music"],
        "availableFootageFx": catalog_summary["footage"],
    }

    return f"""You are a Senior Persian Motion Graphics Director & Video Editor.
Analyze ALL uploaded project files (source audio/video info, timestamped Persian transcript, product screenshots, logo, and any attached visual reference images) and design a COMPLETE, publication-ready vertical 9:16 Reel edit plan.

Rules:
1. Choose the single best `style` from `availableStyles` (e.g., if audio-only product/app showcase or Pinterest reference -> `pinterest-faceless`, `liquid-glass`, `explorecore`, or `minimal`; if talking-head video -> `A` or `E` layout with `minimal`, `bold`, `neon`, `editorial`, `gradient`).
2. Inspect any attached logo/reference images carefully to match palette (`primary`, `accent`, `bg`, `text`) and mood.
3. Decide exact text display (`textMode`: "keywords" | "captions" | "description" | "both"), `headlinePos` ("top" | "center" | "bottom"), `captionPos` ("bottom-safe" | "below-card" | "top"), `fontScale` ("sm" | "md" | "lg"), and `handlePos` ("tr" | "tl" | "br" | "bl" | "bc").
4. Break the entire duration into engaging, well-paced Persian `beats` (scenes). For each beat:
   - Write a punchy short Persian `headline` (2–5 words) and a `keyword` (1–3 words for pill/box highlight).
   - Assign the most relevant `assetUrl` from `uploadedScreenshots` (using its exact `url`) OR from `available3DIcons` (using its exact `/assets/icons-3d/...` URL).
   - Pick varied `visualType` (`card-ribbon`, `ui-showcase`, `compare`, `counter`, `icon-focus`, `kinetic-text`), varied `transition` (`push`, `circles`, `zoom`, `dissolve`), and matching `sfx` from `availableSfx`.
   - Write a specific Persian director instruction in `aiNote` describing the exact animation inside that beat.
5. Write a clear, detailed Persian `analysisReport` (4–6 bullet points) explaining WHY you chose this style, color palette, typography, pacing, footage effect, audio mix, and visual sequence based on the uploaded files.

Project Context JSON:
{json.dumps(payload, ensure_ascii=False, indent=2)}

Return ONLY valid JSON (no markdown code fences) matching this exact schema:
{{
  "analysisReport": "گزارش تحلیلی کامل به فارسی...",
  "style": "pinterest-faceless",
  "designSystemRef": "editorial",
  "layout": "C",
  "brand": {{
    "primary": "#007AFF",
    "accent": "#F8D146",
    "bg": "#F4F5F2",
    "text": "#262B2E",
    "displayFont": "Hasti",
    "bodyFont": "Pinar",
    "handlePos": "tr"
  }},
  "options": {{
    "flowlineRibbon": true,
    "cornerBlurAccents": true,
    "spatialScroll": true,
    "textMode": "keywords",
    "headlinePos": "top",
    "captionPos": "bottom-safe",
    "fontScale": "md",
    "captions": "none",
    "footageFx": "none",
    "footageOpacity": 0.35,
    "music": "corporate",
    "musicGain": -20,
    "sfxGain": -4,
    "voiceEnhance": true,
    "musicDucking": true,
    "transition": "push"
  }},
  "cover": {{
    "line1": "تیتر کوتاه خط اول",
    "line2": "وعده جذاب خط دوم",
    "badge": "برچسب کوتاه"
  }},
  "beats": [
    {{
      "id": "b1",
      "t": 0.0,
      "end": 3.5,
      "spoken": "متن گفتار این بخش",
      "headline": "تیتر کوتاه",
      "keyword": "کلمه کلیدی",
      "visualType": "card-ribbon",
      "assetUrl": "/assets/icons-3d/rocket.png",
      "transition": "push",
      "sfx": "whoosh",
      "aiNote": "توضیح دقیق حرکت و انیمیشن این سکانس"
    }}
  ]
}}"""


def extract_json_object(raw_text: str) -> dict[str, Any]:
    txt = raw_text.strip()
    if txt.startswith("```"):
        txt = re.sub(r"^```(?:json)?\s*", "", txt)
        txt = re.sub(r"\s*```$", "", txt)
    start = txt.find("{")
    end = txt.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("LLM response did not contain a valid JSON object")
    return json.loads(txt[start : end + 1])


def call_gemini(cfg: dict[str, Any], prompt: str, images: list[tuple[str, str]]) -> dict[str, Any]:
    model = cfg.get("model") or "gemini-2.5-flash"
    api_key = cfg["apiKey"]
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    parts: list[dict[str, Any]] = [{"text": prompt}]
    for mime, b64 in images[:5]:
        parts.append({"inline_data": {"mime_type": mime, "data": b64}})

    body = {
        "contents": [{"parts": parts}],
        "generationConfig": {"temperature": 0.4, "responseMimeType": "application/json"},
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        res = json.loads(resp.read().decode("utf-8"))
    text = res["candidates"][0]["content"]["parts"][0]["text"]
    return extract_json_object(text)


def call_openai_compatible(cfg: dict[str, Any], prompt: str, images: list[tuple[str, str]]) -> dict[str, Any]:
    base_url = (cfg.get("baseUrl") or "https://api.openai.com/v1").rstrip("/")
    model = cfg.get("model") or "gpt-4o-mini"
    api_key = cfg["apiKey"]

    content: list[dict[str, Any]] = [{"type": "text", "text": prompt}]
    for mime, b64 in images[:4]:
        content.append({"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}})

    body = {
        "model": model,
        "temperature": 0.4,
        "messages": [
            {"role": "system", "content": "You are a senior Persian motion graphics director. Return ONLY valid JSON."},
            {"role": "user", "content": content},
        ],
    }
    req = urllib.request.Request(
        f"{base_url}/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        res = json.loads(resp.read().decode("utf-8"))
    text = res["choices"][0]["message"]["content"]
    return extract_json_object(text)


def run_ai_director(state: dict[str, Any], catalog_summary: dict[str, Any], extracted_colors: dict[str, Any] | None = None) -> tuple[dict[str, Any], str]:
    """
    Runs the real multimodal LLM Director if an API key is configured.
    Returns (plan_dict, engine_used: 'gemini' | 'openai' | 'local-fallback').
    """
    cfg = load_ai_config()
    api_key = (cfg.get("apiKey") or "").strip()

    # Collect visual attachments (logo, reference images, first 2 screenshots)
    media = state.get("media") or {}
    images: list[tuple[str, str]] = []
    if media.get("logo") and media["logo"].get("path"):
        enc = encode_image_b64(media["logo"]["path"])
        if enc:
            images.append(enc)
    for ref in media.get("references", [])[:2]:
        enc = encode_image_b64(ref.get("path", ""))
        if enc:
            images.append(enc)
    for shot in media.get("screenshots", [])[:2]:
        enc = encode_image_b64(shot.get("path", ""))
        if enc:
            images.append(enc)

    if api_key:
        prompt = build_director_prompt(state, catalog_summary)
        provider = cfg.get("provider", "gemini")
        if provider == "openai":
            result = call_openai_compatible(cfg, prompt, images)
            return result, f"openai ({cfg.get('model')})"
        result = call_gemini(cfg, prompt, images)
        return result, f"gemini ({cfg.get('model')})"

    # Fallback: rich deterministic analysis when no LLM API key is set yet
    return run_local_smart_fallback(state, catalog_summary, extracted_colors), "local-fallback"


def run_local_smart_fallback(state: dict[str, Any], catalog_summary: dict[str, Any], extracted_colors: dict[str, Any] | None = None) -> dict[str, Any]:
    full_text = " ".join([state.get("title", ""), state.get("freeformDirection", "")] + [b.get("spoken", "") for b in state.get("beats", [])]).lower()
    src_info = state.get("sourceInfo") or {}
    has_video_face = bool(src_info.get("has_video"))
    shots = (state.get("media") or {}).get("screenshots", [])
    refs = (state.get("media") or {}).get("references", [])

    if refs:
        rec_style, rec_ds, rec_music, rec_foot = "pinterest-faceless", "editorial", "corporate", "none"
        tone_desc = "وجود فایل رفرنس سبکی (پینترستی / ادیتوریال)"
    elif any(k in full_text for k in ("هک", "امنیت", "کد", "برنامه", "ai", "هوش مصنوعی", "vpn")):
        rec_style, rec_ds, rec_music, rec_foot = ("neon" if has_video_face else "pinterest-faceless"), "futuristic", "tech", "light_sweep"
        tone_desc = "محتوای فناوری، هوش مصنوعی و امنیت"
    elif any(k in full_text for k in ("فروش", "تخفیف", "پول", "درآمد", "میلیون", "رایگان")):
        rec_style, rec_ds, rec_music, rec_foot = ("bold" if has_video_face else "pinterest-faceless"), "bold", "upbeat", "lightleak_warm"
        tone_desc = "محتوای فروش، قلاب پرانرژی و دعوت به اقدام"
    else:
        rec_style, rec_ds, rec_music, rec_foot = ("minimal" if has_video_face else "pinterest-faceless"), "bento", "corporate", "none"
        tone_desc = "معرفی محصول، آموزش و ارائه حرفه‌ای"

    primary = (extracted_colors or {}).get("primary") or state.get("brand", {}).get("primary") or "#007AFF"
    accent = (extracted_colors or {}).get("accent") or state.get("brand", {}).get("accent") or "#F8D146"
    bg = "#0B0E17" if rec_style in ("neon", "liquid-glass") else "#F4F5F2"
    text_col = "#F3F6FB" if bg == "#0B0E17" else "#262B2E"

    icon_rules = [
        (("امنیت", "قفل", "ضد دانلود", "لایسنس", "حفاظت", "اسپات"), "/assets/icons-3d/shield.png", "کارت شناور با آیکون سپر امنیتی و خط منحنی پشت کارت"),
        (("سرعت", "شروع", "پرتاب", "رشد", "نسخه", "جدید"), "/assets/icons-3d/rocket.png", "ورود پرشتاب موشک سه‌بعدی همراه با خط راهنما از چپ به راست"),
        (("پول", "فروش", "درآمد", "ووکامرس", "پرداخت", "تخفیف", "قیمت"), "/assets/icons-3d/money_bag.png", "مقایسه بصری ارزش و فروش با هایلایت عدد"),
        (("آموزش", "دوره", "مدرک", "گواهینامه", "کلاس", "درس"), "/assets/icons-3d/graduation_cap.png", "نمایش ساختار آموزشی روی کارت سفید با سایه نرم"),
        (("تنظیم", "ماژول", "سیستم", "ابزار", "ساخت"), "/assets/icons-3d/gear.png", "نمایش ماژول‌ها با حرکت روان و تغییر وضعیت"),
        (("هوش", "ai", "ربات", "اتوماتیک", "هوشمند"), "/assets/icons-3d/robot.png", "تأکید بر اتوماسیون هوشمند با آیکون سه‌بعدی"),
        (("آمار", "نمودار", "گزارش", "نتیجه"), "/assets/icons-3d/chart_increasing.png", "شمارنده عدد و نمودار صعودی"),
        (("ایده", "نکته", "راز", "ترفند"), "/assets/icons-3d/light_bulb.png", "تأکید ناگهانی روی نکته کلیدی با کادر رنگی"),
    ]
    available_3d = catalog_summary["icons3d"]
    tr_cycle = ["push", "push", "circles", "push", "zoom"]
    sfx_cycle = ["whoosh", "pop", "card_slide", "glass_ding", "whoosh"]

    beats = []
    src_beats = state.get("beats", [])
    for idx, b in enumerate(src_beats):
        sp = (b.get("spoken") or b.get("headline") or "").strip()
        words = sp.split()
        hl = b.get("headline") if (b.get("headline") and not b["headline"].startswith("عنوان سکانس")) else (" ".join(words[:4]) if words else f"سکانس {idx + 1}")
        kw = b.get("keyword") if (b.get("keyword") and b["keyword"] != "نکته کلیدی") else (" ".join(words[4:6]) if len(words) > 4 else (words[-1] if words else "نکته کلیدی"))
        matched_asset = b.get("assetUrl") or ""
        matched_note = b.get("aiNote") or "حرکت نرم ورود کارت و رسم خط منحنی پشت سوژه"
        if not matched_asset:
            low_sp = sp.lower()
            for kws, ic_url, note in icon_rules:
                if any(k in low_sp for k in kws) and ic_url in available_3d:
                    matched_asset = ic_url
                    matched_note = note
                    break
            if not matched_asset and shots:
                matched_asset = shots[idx % len(shots)]["url"]
                matched_note = f"نمایش واقعی اسکرین‌شات «{shots[idx % len(shots)]['name']}» داخل قاب شناور با زوم ظریف"
            elif not matched_asset and available_3d:
                matched_asset = available_3d[idx % len(available_3d)]

        beats.append({
            "id": b.get("id") or f"b{idx + 1}",
            "t": b.get("t", idx * 3.5),
            "end": b.get("end", (idx + 1) * 3.5),
            "spoken": sp,
            "headline": hl,
            "keyword": kw,
            "visualType": "ui-showcase" if (shots and matched_asset.startswith("/projects-files/")) else "card-ribbon",
            "assetUrl": matched_asset,
            "transition": tr_cycle[idx % len(tr_cycle)],
            "sfx": sfx_cycle[idx % len(sfx_cycle)],
            "aiNote": matched_note,
        })

    report = "\n".join([
        f"• **تشخیص موضوع و لحن:** {tone_desc} ({'ویدیو با چهره' if has_video_face else 'تمام‌موشن بدون چهره'}).",
        f"• **سبک و سیستم طراحی پیشنهادی:** سبک `{rec_style}` با الهام از سیستم طراحی `{rec_ds}` و چیدمان `{'A' if has_video_face else 'C'}`.",
        f"• **پالت رنگ و تایپوگرافی:** رنگ اصلی `{primary}` و تأکید `{accent}` {'(استخراج‌شده از لوگوی آپلودشده)' if extracted_colors else ''} با ترکیب فونت `Hasti` و `Pinar`.",
        f"• **تدوین صدا و تصویر:** موزیک `{rec_music}` با داکینگ خودکار (`-20 dB`)، پاکسازی صدای گوینده، فوتیج افکت `{rec_foot}` و چیدمان {len(beats)} سکانس با {len(shots)} اسکرین‌شات و آیکون‌های ۳ بعدی متناسب با متن هر جمله.",
        "• **نکته مهم (ارتقا به هوش مصنوعی چندرسانه‌ای):** برای اینکه مدل هوش مصنوعی (Gemini / GPT) عکس‌های رفرنس، اسکرین‌شات‌ها و متن کامل شما را عمیق‌تر تحلیل و کارگردانی کند، کافی است روی دکمه **«⚙️ تنظیمات هوش مصنوعی»** در بالا کلیک کرده و کلید API خود را وارد کنید.",
    ])

    return {
        "analysisReport": report,
        "style": rec_style,
        "designSystemRef": rec_ds,
        "layout": "A" if has_video_face else "C",
        "brand": {
            "primary": primary,
            "accent": accent,
            "bg": bg,
            "text": text_col,
            "displayFont": "Hasti",
            "bodyFont": "Pinar",
            "handlePos": state.get("brand", {}).get("handlePos", "tr"),
        },
        "options": {
            "flowlineRibbon": rec_style == "pinterest-faceless",
            "cornerBlurAccents": rec_style == "pinterest-faceless",
            "spatialScroll": True,
            "textMode": "both" if has_video_face else "keywords",
            "headlinePos": "top",
            "captionPos": "bottom-safe",
            "fontScale": "md",
            "captions": "highlight" if has_video_face else "none",
            "footageFx": rec_foot,
            "footageOpacity": 0.35,
            "music": rec_music,
            "musicGain": -20,
            "sfxGain": -4,
            "voiceEnhance": True,
            "musicDucking": True,
            "transition": "push",
        },
        "cover": {
            "line1": state.get("title") or (beats[0]["headline"] if beats else "معرفی ویژه"),
            "line2": beats[0]["keyword"] if beats and beats[0].get("keyword") else "بدون کدنویسی و سریع",
            "badge": "پیشنهاد هوشمند",
        },
        "beats": beats,
    }
