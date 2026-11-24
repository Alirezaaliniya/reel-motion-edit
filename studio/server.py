#!/usr/bin/env python3
"""
Reel Motion Studio — Local Web App Backend (FastAPI)
Lightweight, zero-build-step studio server for `reel-motion-edit`.
Connects:
- 27+ built-in styles & gallery visuals (A/B/C/D/E)
- 67 GitHub Design Systems (`assets/design-knowledge/design-styles-67`)
- 90 UI/UX Pro Max styles (`styles.csv`)
- Local 3D icons, SVG icons, SFX, music, footage, Persian fonts
- Online Iconify search & instant download (200,000+ vector icons)
- Custom Style Builder (saves directly to `assets/styles.json` + custom specs)
- Project workspace manager (upload media, run Whisper `analyze.py`, build interactive storyboard)
- Direct render (`render.js` + `compose.py`) and AI Director Brief exporter
"""

from __future__ import annotations

import csv
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parent.parent
STUDIO_DIR = ROOT / "studio"
STATIC_DIR = STUDIO_DIR / "static"
PROJECTS_DIR = STUDIO_DIR / "projects"
ASSETS_DIR = ROOT / "assets"
GALLERY_DIR = ROOT / "gallery"
SCRIPTS_DIR = ROOT / "scripts"
KNOWLEDGE_DIR = ASSETS_DIR / "design-knowledge"

PROJECTS_DIR.mkdir(parents=True, exist_ok=True)
STATIC_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Reel Motion Studio", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directories safely
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
if GALLERY_DIR.exists():
    app.mount("/gallery", StaticFiles(directory=str(GALLERY_DIR)), name="gallery")
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")
app.mount("/projects-files", StaticFiles(directory=str(PROJECTS_DIR)), name="projects-files")

# Background job registry
JOBS: dict[str, dict[str, Any]] = {}


def slugify(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9_-]+", "-", text.strip().lower()).strip("-")
    return s or f"custom-{uuid.uuid4().hex[:6]}"


def load_styles_json() -> dict[str, Any]:
    p = ASSETS_DIR / "styles.json"
    if not p.exists():
        return {}
    return json.loads(p.read_text(encoding="utf-8"))


def save_styles_json(data: dict[str, Any]) -> None:
    p = ASSETS_DIR / "styles.json"
    p.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")


def map_gallery_images() -> dict[str, dict[str, str]]:
    """Map style IDs (e.g. 'minimal', 'pinterest-faceless') to available A/B/C/D/E gallery images."""
    mapping: dict[str, dict[str, str]] = {}
    if not GALLERY_DIR.exists():
        return mapping
    alias = {
        "glass": "liquid-glass",
        "remotion-minimal-bw": "remotion-minimal",
        "remotion-neon-lineart": "remotion-neon",
    }
    for f in sorted(GALLERY_DIR.glob("*.jpg")):
        name = f.stem
        if name.startswith("_"):
            continue
        m = re.match(r"^([ABCDE])(\d+)-(.+)$", name)
        if not m:
            continue
        letter, _num, raw_id = m.groups()
        style_id = alias.get(raw_id, raw_id)
        mapping.setdefault(style_id, {})[letter] = f"/gallery/{f.name}"
        if raw_id == "glass":
            mapping.setdefault("glass", {})[letter] = f"/gallery/{f.name}"
    return mapping


def load_design_systems_67() -> list[dict[str, Any]]:
    out = []
    d67 = KNOWLEDGE_DIR / "design-styles-67"
    if not d67.exists():
        return out
    meta_p = STATIC_DIR / "ds67-thumbs" / "meta.json"
    meta_map = json.loads(meta_p.read_text(encoding="utf-8")) if meta_p.exists() else {}
    for sub in sorted(d67.iterdir()):
        if not sub.is_dir():
            continue
        design_md = sub / "DESIGN.md"
        skill_md = sub / "SKILL.md"
        summary = ""
        if design_md.exists():
            lines = [ln.strip() for ln in design_md.read_text(encoding="utf-8", errors="replace").splitlines() if ln.strip()]
            for ln in lines[:8]:
                if not ln.startswith("#") and not ln.startswith("---"):
                    summary = ln[:160]
                    break
        m = meta_map.get(sub.name, {})
        out.append({
            "id": sub.name,
            "name": sub.name.replace("-", " ").title(),
            "summary": summary,
            "hasDesign": design_md.exists(),
            "hasSkill": skill_md.exists(),
            "thumb": m.get("thumb", ""),
            "palette": {
                "bg": m.get("bg", "#111827"),
                "text": m.get("text", "#F8FAFC"),
                "primary": m.get("primary", "#3B82F6"),
                "accent": m.get("accent", "#FACC15"),
            },
        })
    return out


def load_pro_max_styles() -> list[dict[str, str]]:
    csv_path = KNOWLEDGE_DIR / "ui-ux-pro-max" / "ui-ux-pro-max" / "data" / "styles.csv"
    if not csv_path.exists():
        return []
    items = []
    with open(csv_path, encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cat = (row.get("Style Category") or "").strip()
            if not cat:
                continue
            items.append({
                "no": (row.get("No") or "").strip(),
                "name": cat,
                "keywords": (row.get("Keywords") or "").strip(),
                "colors": (row.get("Primary Colors") or "").strip(),
                "effects": (row.get("Effects & Animation") or "").strip(),
                "bestFor": (row.get("Best For") or "").strip(),
            })
    return items


def list_media_assets() -> dict[str, Any]:
    sfx = []
    for sub, prefix in [(ASSETS_DIR / "sfx", "/assets/sfx"), (ASSETS_DIR / "sfx" / "user", "/assets/sfx/user")]:
        if sub.exists():
            for f in sorted(sub.iterdir()):
                if f.is_file() and f.suffix.lower() in (".wav", ".mp3", ".ogg"):
                    sfx.append({"name": f.stem, "file": f.name, "url": f"{prefix}/{f.name}", "custom": "user" in prefix})

    music = []
    mdir = ASSETS_DIR / "music"
    if mdir.exists():
        for f in sorted(mdir.iterdir()):
            if f.is_file() and f.suffix.lower() in (".mp3", ".wav", ".ogg", ".m4a"):
                music.append({"name": f.stem, "file": f.name, "url": f"/assets/music/{f.name}"})

    footage = []
    for sub, prefix in [(ASSETS_DIR / "footage", "/assets/footage"), (ASSETS_DIR / "footage" / "user", "/assets/footage/user")]:
        if sub.exists():
            for f in sorted(sub.iterdir()):
                if f.is_file() and f.suffix.lower() in (".mp4", ".mov", ".webm"):
                    footage.append({"name": f.stem, "file": f.name, "url": f"{prefix}/{f.name}"})

    icons_3d = []
    d3 = ASSETS_DIR / "icons-3d"
    if d3.exists():
        for f in sorted(d3.glob("*.png")):
            icons_3d.append({"name": f.stem, "url": f"/assets/icons-3d/{f.name}"})

    icons_svg = []
    dsvg = ASSETS_DIR / "icons-svg"
    if dsvg.exists():
        for f in sorted(dsvg.glob("*.svg")):
            icons_svg.append({"name": f.stem, "url": f"/assets/icons-svg/{f.name}"})

    fonts = [
        {"id": "Peyda", "label": "پیدا (مدرن و خوانا)", "kind": "body"},
        {"id": "Pinar", "label": "پینار (ادیتوریال و ظریف)", "kind": "body"},
        {"id": "Hasti", "label": "هستی (تیتر سنگین و پوستری)", "kind": "display"},
        {"id": "YekanBakh", "label": "یکان بخ (استاندارد UI)", "kind": "body"},
        {"id": "Morabba", "label": "مربع (تیتر مجله‌ای)", "kind": "display"},
        {"id": "IRANSansX", "label": "ایران‌سنس ایکس (تایپ تمیز)", "kind": "body"},
        {"id": "Lalezar", "label": "لاله‌زار (پاپ و پرانرژی)", "kind": "display"},
        {"id": "Vazirmatn", "label": "وزیرمتن (همه‌کاره)", "kind": "body"},
    ]

    return {
        "sfx": sfx,
        "music": music,
        "footage": footage,
        "icons3d": icons_3d,
        "iconsSvg": icons_svg,
        "fonts": fonts,
    }


def load_custom_style_notes() -> dict[str, Any]:
    p = PROJECTS_DIR / "custom_styles_meta.json"
    if p.exists():
        return json.loads(p.read_text(encoding="utf-8"))
    return {}


def save_custom_style_notes(data: dict[str, Any]) -> None:
    p = PROJECTS_DIR / "custom_styles_meta.json"
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# ---------------- API Routes ----------------

@app.get("/", response_class=HTMLResponse)
def serve_index() -> HTMLResponse:
    index_file = STATIC_DIR / "index.html"
    if not index_file.exists():
        return HTMLResponse("<h1>Studio UI not built yet</h1>", status_code=404)
    return HTMLResponse(index_file.read_text(encoding="utf-8"))


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "root": str(ROOT),
        "node": bool(shutil.which("node")),
        "ffmpeg": bool(shutil.which("ffmpeg")),
        "stylesCount": len(load_styles_json()),
    }


@app.post("/api/shutdown")
def shutdown_server() -> dict[str, Any]:
    """Allow the user to cleanly shut down the local Studio server from the UI."""
    def _exit():
        time.sleep(0.4)
        os._exit(0)
    threading.Thread(target=_exit, daemon=True).start()
    return {"ok": True, "message": "Studio server shutting down"}


@app.get("/api/skills/status")
def get_skills_status() -> dict[str, Any]:
    """Check which local AI skills & engines are installed and ready on this machine."""
    skills_root = Path.home() / ".gemini" / "config" / "skills"
    targets = [
        ("reel-motion-edit", "موتور اصلی ریلز (Plan Engine + FFmpeg)", ROOT / "SKILL.md"),
        ("pinterest-studio", "موتور پینترستی و اسکرین سه‌بعدی استودیو", STUDIO_DIR / "pinterest_renderer.py"),
        ("motion-doctrine", "قوانین حرکت پیوسته و کارگردانی سینمایی", skills_root / "motion-doctrine" / "SKILL.md"),
        ("cut-the-curve", "کاتالوگ ترنزیشن‌های سرعت‌محور (Zoom/Waterfall)", skills_root / "cut-the-curve" / "SKILL.md"),
        ("oversized-cursor", "تکنیک موس بزرگ macOS و افکت کلیک", skills_root / "oversized-cursor" / "SKILL.md"),
        ("hyperframes", "رندر ویدیوی HTML/GSAP (HyperFrames)", skills_root / "hyperframes" / "SKILL.md"),
        ("remotion-best-practices", "موشن‌گرافیک سه‌بعدی و کدی Remotion", skills_root / "remotion-best-practices" / "SKILL.md"),
        ("ffmpeg-skill", "تدوین، میکس صدا و افکت‌های FFmpeg", skills_root / "ffmpeg-skill" / "SKILL.md"),
        ("ui-ux-pro-max", "بانک ۹۰ سبک طراحی و پالت رنگ", skills_root / "ui-ux-pro-max" / "SKILL.md"),
    ]
    items = []
    for sid, label, path in targets:
        items.append({"id": sid, "label": label, "path": str(path), "installed": path.exists()})
    mcp_config = {
        "mcpServers": {
            "reel-motion-studio": {
                "command": "python",
                "args": [str(STUDIO_DIR / "mcp_server.py")],
            }
        }
    }
    return {"ok": True, "skills": items, "mcpConfig": json.dumps(mcp_config, ensure_ascii=False, indent=2)}


@app.get("/api/catalog")
def get_catalog() -> dict[str, Any]:
    styles_raw = load_styles_json()
    gallery_map = map_gallery_images()
    custom_meta = load_custom_style_notes()

    styles_list = []
    for sid, cfg in styles_raw.items():
        thumbs = gallery_map.get(sid, {})
        primary_thumb = thumbs.get("C") or thumbs.get("A") or thumbs.get("E") or thumbs.get("B") or thumbs.get("D") or ""
        if sid in custom_meta and custom_meta[sid].get("referenceImage"):
            primary_thumb = custom_meta[sid]["referenceImage"]
        styles_list.append({
            "id": sid,
            "label": cfg.get("label", sid),
            "en": cfg.get("en", sid),
            "feel": cfg.get("feel", ""),
            "theme": cfg.get("theme", {}),
            "transitions": cfg.get("transitions", []),
            "captions": cfg.get("captions", "minimal"),
            "thumbs": thumbs,
            "thumb": primary_thumb,
            "isCustom": sid in custom_meta,
            "customNotes": custom_meta.get(sid, {}),
        })

    import sys as _sys
    _sys.path.insert(0, str(STUDIO_DIR))
    import ffx_importer as ffxi

    return {
        "styles": styles_list,
        "designSystems67": load_design_systems_67(),
        "proMaxStyles": load_pro_max_styles(),
        "motionPresets": list(ffxi.load_motion_presets().values()),
        "assets": list_media_assets(),
    }


@app.post("/api/presets/import-ffx")
async def import_ffx_preset(
    file: UploadFile = File(...),
    label: str = Form(""),
) -> dict[str, Any]:
    """Import an Adobe After Effects .ffx motion preset file and convert its expression/physics to a Studio Motion Preset."""
    import sys as _sys
    _sys.path.insert(0, str(STUDIO_DIR))
    import ffx_importer as ffxi

    up_dir = PROJECTS_DIR / "_ffx_uploads"
    up_dir.mkdir(parents=True, exist_ok=True)
    orig = Path(file.filename or "preset.ffx")
    safe_name = re.sub(r"[^a-zA-Z0-9._ -]", "_", orig.name)
    dest = up_dir / safe_name
    dest.write_bytes(await file.read())

    try:
        preset = ffxi.import_and_register_ffx(dest, custom_label=label)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {"ok": True, "preset": preset, "motionPresets": list(ffxi.load_motion_presets().values())}


@app.get("/api/design-system/{style_id}")
def get_design_system_detail(style_id: str) -> dict[str, Any]:
    safe_id = re.sub(r"[^a-zA-Z0-9_-]", "", style_id)
    folder = KNOWLEDGE_DIR / "design-styles-67" / safe_id
    if not folder.exists():
        raise HTTPException(status_code=404, detail="Design system not found")
    design_md = (folder / "DESIGN.md").read_text(encoding="utf-8", errors="replace") if (folder / "DESIGN.md").exists() else ""
    skill_md = (folder / "SKILL.md").read_text(encoding="utf-8", errors="replace") if (folder / "SKILL.md").exists() else ""
    return {"id": safe_id, "designMd": design_md, "skillMd": skill_md}


@app.get("/api/icons/search")
def search_online_icons(q: str, limit: int = 24) -> dict[str, Any]:
    if not q or len(q.strip()) < 2:
        return {"icons": []}
    url = f"https://api.iconify.design/search?query={urllib.parse.quote(q.strip())}&limit={min(limit, 48)}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 reel-motion-studio"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        icons = []
        for ic in data.get("icons", []):
            if ":" in ic:
                prefix, name = ic.split(":", 1)
                icons.append({
                    "id": ic,
                    "prefix": prefix,
                    "name": name,
                    "previewUrl": f"https://api.iconify.design/{prefix}/{name}.svg?height=96",
                })
        return {"icons": icons}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Iconify search failed: {exc}")


class IconDownloadReq(BaseModel):
    iconId: str
    color: str | None = None


@app.post("/api/icons/download")
def download_online_icon(req_body: IconDownloadReq) -> dict[str, Any]:
    ic = req_body.iconId.strip()
    if ":" not in ic:
        raise HTTPException(status_code=400, detail="iconId must be prefix:name")
    prefix, name = ic.split(":", 1)
    safe_file = re.sub(r"[^a-zA-Z0-9_-]", "_", f"{prefix}_{name}") + ".svg"
    out_dir = ASSETS_DIR / "icons-svg"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / safe_file
    params = "?height=256"
    if req_body.color:
        params += f"&color={urllib.parse.quote(req_body.color)}"
    url = f"https://api.iconify.design/{prefix}/{name}.svg{params}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 reel-motion-studio"})
        with urllib.request.urlopen(req, timeout=12) as resp:
            out_path.write_bytes(resp.read())
        return {"ok": True, "name": out_path.stem, "url": f"/assets/icons-svg/{safe_file}"}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Download failed: {exc}")


class CustomStyleReq(BaseModel):
    id: str | None = None
    label: str
    en: str = ""
    feel: str = ""
    primary: str = "#007AFF"
    secondary: str = "#0055FF"
    accent: str = "#F8D146"
    dark: str = "#F4F5F2"
    text: str = "#262B2E"
    displayFont: str = "Hasti"
    bodyFont: str = "Pinar"
    transitions: list[str] = ["push", "circles"]
    captions: str = "none"
    flowlineRibbon: bool = True
    cornerBlurAccents: bool = True
    spatialScroll: bool = True
    freeformPrompt: str = ""
    referenceImage: str = ""


@app.post("/api/styles/custom")
def create_custom_style(body: CustomStyleReq) -> dict[str, Any]:
    styles = load_styles_json()
    sid = slugify(body.id or body.en or body.label)
    if sid in styles and not body.id:
        sid = f"{sid}-{uuid.uuid4().hex[:4]}"

    styles[sid] = {
        "label": body.label.strip(),
        "en": body.en.strip() or body.label.strip(),
        "feel": body.feel.strip() or body.freeformPrompt.strip()[:160] or "Custom user-authored visual style",
        "theme": {
            "primary": body.primary,
            "secondary": body.secondary,
            "accent": body.accent,
            "dark": body.dark,
            "text": body.text,
            "dim": "#6B7278",
            "highlight": body.accent,
            "ok": "#16A34A",
            "line": body.primary,
            "display": body.displayFont,
            "body": body.bodyFont,
        },
        "defaults": {
            "title": {"anim": "rise", "jitter": False, "scrim": False},
            "keyword": {"style": "sticker", "rotate": 0, "wiggle": False},
            "scene": {"draw": 0.72},
        },
        "transitions": body.transitions or ["push", "fade"],
        "captions": body.captions,
        "fx": [],
        "sfxMap": {},
        "intro": False,
        "grade": False,
    }
    save_styles_json(styles)

    meta = load_custom_style_notes()
    meta[sid] = {
        "flowlineRibbon": body.flowlineRibbon,
        "cornerBlurAccents": body.cornerBlurAccents,
        "spatialScroll": body.spatialScroll,
        "freeformPrompt": body.freeformPrompt,
        "referenceImage": body.referenceImage,
        "createdAt": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    save_custom_style_notes(meta)

    return {"ok": True, "id": sid, "style": styles[sid], "meta": meta[sid]}


@app.post("/api/reference/analyze")
async def analyze_reference_media(
    file: UploadFile = File(...),
    label: str = Form(""),
) -> dict[str, Any]:
    """Upload a reference video or image and extract cuts, motion/transitions, palette, contact sheet & 540x960 card."""
    import sys as _sys
    _sys.path.insert(0, str(STUDIO_DIR))
    import reference_cloner as rc

    up_dir = PROJECTS_DIR / "_ref_uploads"
    up_dir.mkdir(parents=True, exist_ok=True)
    orig = Path(file.filename or "reference.mp4")
    safe_name = f"ref_{uuid.uuid4().hex[:6]}_{re.sub(r'[^a-zA-Z0-9._-]', '_', orig.name)}"
    dest = up_dir / safe_name
    dest.write_bytes(await file.read())

    result = rc.clone_reference(dest, display_name=label)
    return {"ok": True, **result}


class SaveRefStyleReq(BaseModel):
    cloneId: str
    label: str
    id: str | None = None
    primary: str = "#007AFF"
    accent: str = "#F8D146"
    dark: str = "#F4F5F2"
    text: str = "#262B2E"
    displayFont: str = "Hasti"
    bodyFont: str = "Pinar"
    transitions: list[str] = ["push", "circles"]
    captions: str = "none"
    flowlineRibbon: bool = True
    cornerBlurAccents: bool = True
    spatialScroll: bool = True
    notes: str = ""


@app.post("/api/reference/save-style")
def save_cloned_reference_style(body: SaveRefStyleReq) -> dict[str, Any]:
    """Persist an analyzed reference clone as a permanent visual style with its own gallery JPG card."""
    safe_clone = re.sub(r"[^a-zA-Z0-9_-]", "", body.cloneId)
    clone_dir = PROJECTS_DIR / "_ref_clones" / safe_clone
    thumb_src = clone_dir / "thumb.jpg"
    analysis_p = clone_dir / "analysis.json"
    if not thumb_src.exists():
        raise HTTPException(status_code=404, detail="تحلیل رفرنس پیدا نشد؛ لطفاً دوباره فایل را تحلیل کنید.")

    styles = load_styles_json()
    sid = slugify(body.id or body.label)
    if sid in styles and not body.id:
        sid = f"{sid}-{uuid.uuid4().hex[:4]}"

    # Save official gallery thumbnail in gallery/
    gallery_filename = f"C_{sid}.jpg"
    gallery_dest = GALLERY_DIR / gallery_filename
    shutil.copy2(thumb_src, gallery_dest)
    gallery_url = f"/gallery/{gallery_filename}"

    analysis_data = json.loads(analysis_p.read_text(encoding="utf-8")) if analysis_p.exists() else {}
    feel_text = body.notes.strip() or analysis_data.get("report", "").replace("\n", " | ")[:220] or "Cloned from user reference video"

    styles[sid] = {
        "label": body.label.strip(),
        "en": sid,
        "feel": feel_text,
        "theme": {
            "primary": body.primary,
            "secondary": body.primary,
            "accent": body.accent,
            "dark": body.dark,
            "text": body.text,
            "dim": "#6B7278",
            "highlight": body.accent,
            "ok": "#16A34A",
            "line": body.primary,
            "display": body.displayFont,
            "body": body.bodyFont,
        },
        "defaults": {
            "title": {"anim": "rise", "jitter": False, "scrim": False},
            "keyword": {"style": "sticker", "rotate": 0, "wiggle": False},
            "scene": {"draw": 0.72},
        },
        "transitions": body.transitions or ["push", "circles"],
        "captions": body.captions,
        "fx": [],
        "sfxMap": {},
        "intro": False,
        "grade": False,
    }
    save_styles_json(styles)

    meta = load_custom_style_notes()
    meta[sid] = {
        "clonedFromReference": True,
        "cloneId": safe_clone,
        "referenceImage": gallery_url,
        "contactSheet": analysis_data.get("sheetUrl", ""),
        "motionBlueprint": analysis_data.get("motion", {}),
        "report": analysis_data.get("report", ""),
        "flowlineRibbon": body.flowlineRibbon,
        "cornerBlurAccents": body.cornerBlurAccents,
        "spatialScroll": body.spatialScroll,
        "freeformPrompt": body.notes,
        "createdAt": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    save_custom_style_notes(meta)
    return {"ok": True, "id": sid, "thumbUrl": gallery_url, "style": styles[sid]}


# ---------------- Project Management ----------------

def project_path(project_id: str) -> Path:
    safe = re.sub(r"[^a-zA-Z0-9_-]", "", project_id)
    if not safe:
        raise HTTPException(status_code=400, detail="Invalid project id")
    return PROJECTS_DIR / safe


@app.get("/api/projects")
def list_projects() -> dict[str, Any]:
    items = []
    for d in sorted(PROJECTS_DIR.iterdir(), key=lambda x: x.stat().st_mtime, reverse=True):
        if d.is_dir():
            state_p = d / "studio_state.json"
            if state_p.exists():
                st = json.loads(state_p.read_text(encoding="utf-8"))
                items.append({
                    "id": d.name,
                    "title": st.get("title", d.name),
                    "style": st.get("style", "pinterest-faceless"),
                    "updatedAt": st.get("updatedAt", ""),
                    "beatsCount": len(st.get("beats", [])),
                })
    return {"projects": items}


class CreateProjectReq(BaseModel):
    title: str = "پروژه جدید ریلز"
    mode: str = "explainer"
    style: str = "pinterest-faceless"


@app.post("/api/projects")
def create_project(body: CreateProjectReq) -> dict[str, Any]:
    pid = f"proj-{time.strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:4]}"
    pdir = PROJECTS_DIR / pid
    (pdir / "uploads").mkdir(parents=True, exist_ok=True)
    state = {
        "id": pid,
        "title": body.title,
        "mode": body.mode,
        "style": body.style,
        "designSystemRef": "",
        "layout": "C",
        "brand": {
            "primary": "#007AFF",
            "accent": "#F8D146",
            "bg": "#F4F5F2",
            "text": "#262B2E",
            "displayFont": "Hasti",
            "bodyFont": "Pinar",
            "handle": "",
            "handlePos": "tr",
        },
        "options": {
            "flowlineRibbon": True,
            "cornerBlurAccents": True,
            "spatialScroll": True,
            "captions": "none",
            "textMode": "keywords",
            "headlinePos": "top",
            "captionPos": "bottom-safe",
            "fontScale": "md",
            "footageFx": "none",
            "footageOpacity": 0.45,
            "footageBlend": "screen",
            "music": "corporate",
            "musicGain": -20,
            "sfxGain": -4,
            "voiceEnhance": True,
            "musicDucking": True,
            "sfx": "whoosh",
            "transition": "push",
            "introStyle": "logo-burst",
            "introDur": 2.0,
            "outroStyle": "comment-cta",
            "outroDur": 2.8,
            "outroCtaWord": "نیاس",
            "outroSubtitle": "رو کامنت کن تا لینک برات بیاد",
            "motionPreset": "smooth-quart",
            "hybrid": {
                "layout": False,
                "transitions": False,
                "motion": False,
                "textMode": False,
                "fx": False,
            },
        },
        "cover": {
            "line1": body.title,
            "line2": "راهنمای کامل و سریع",
            "badge": "نسخه جدید",
        },
        "freeformDirection": "",
        "media": {
            "source": None,
            "logo": None,
            "screenshots": [],
            "references": [],
        },
        "transcript": [],
        "beats": [
            {
                "id": "b1",
                "t": 0.0,
                "end": 4.0,
                "spoken": "جملهٔ قلاب آغازین ویدیو",
                "headline": "معرفی نسخهٔ جدید",
                "keyword": "بدون کدنویسی",
                "visualType": "card-ribbon",
                "assetUrl": "",
                "transition": "push",
                "sfx": "whoosh",
                "aiNote": "خط آبی منحنی از چپ وارد شود و از پشت کارت رد شود.",
            }
        ],
        "updatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    (pdir / "studio_state.json").write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    return state


@app.get("/api/projects/{project_id}")
def get_project(project_id: str) -> dict[str, Any]:
    pdir = project_path(project_id)
    state_p = pdir / "studio_state.json"
    if not state_p.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    return json.loads(state_p.read_text(encoding="utf-8"))


@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str) -> dict[str, Any]:
    pdir = project_path(project_id)
    if not pdir.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    shutil.rmtree(pdir, ignore_errors=True)
    return {"ok": True, "deleted": project_id}


@app.post("/api/projects/{project_id}/upload")
async def upload_project_file(
    project_id: str,
    role: str = Form(...),  # source | logo | screenshot | reference
    file: UploadFile = File(...),
) -> dict[str, Any]:
    pdir = project_path(project_id)
    state_p = pdir / "studio_state.json"
    if not state_p.exists():
        raise HTTPException(status_code=404, detail="Project not found")

    uploads = pdir / "uploads"
    uploads.mkdir(parents=True, exist_ok=True)
    orig = Path(file.filename or "file.bin")
    safe_name = f"{role}_{uuid.uuid4().hex[:6]}_{re.sub(r'[^a-zA-Z0-9._-]', '_', orig.name)}"
    dest = uploads / safe_name
    content = await file.read()
    dest.write_bytes(content)

    rel_url = f"/projects-files/{project_id}/uploads/{safe_name}"
    file_info = {"name": orig.name, "storedName": safe_name, "path": str(dest), "url": rel_url, "size": len(content)}

    state = json.loads(state_p.read_text(encoding="utf-8"))
    if role == "source":
        state["media"]["source"] = file_info
    elif role == "logo":
        state["media"]["logo"] = file_info
    elif role == "screenshot":
        state["media"]["screenshots"].append(file_info)
    elif role == "reference":
        state["media"]["references"].append(file_info)
    elif role == "footage":
        # Also copy to assets/footage/user so Plan Engine recognizes it directly
        user_foot = ASSETS_DIR / "footage" / "user"
        user_foot.mkdir(parents=True, exist_ok=True)
        shutil.copy2(dest, user_foot / safe_name)
        state["media"].setdefault("footages", []).append(file_info)

    state["updatedAt"] = time.strftime("%Y-%m-%d %H:%M:%S")
    state_p.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"ok": True, "file": file_info, "media": state["media"]}


def start_job(kind: str, fn) -> str:
    jid = uuid.uuid4().hex[:10]
    JOBS[jid] = {"id": jid, "kind": kind, "status": "running", "log": "", "result": None, "error": None}

    def runner():
        try:
            res = fn(JOBS[jid])
            JOBS[jid]["result"] = res
            JOBS[jid]["status"] = "done"
        except Exception as exc:
            JOBS[jid]["error"] = str(exc)
            JOBS[jid]["status"] = "error"

    threading.Thread(target=runner, daemon=True).start()
    return jid


@app.get("/api/jobs/{job_id}")
def get_job_status(job_id: str) -> dict[str, Any]:
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    return JOBS[job_id]


class ScriptToBeatsReq(BaseModel):
    script: str
    secPerBeat: float = 3.5


@app.post("/api/projects/{project_id}/from-script")
def build_beats_from_script(project_id: str, body: ScriptToBeatsReq) -> dict[str, Any]:
    """Convert user's raw Persian script or topic lines directly into timed storyboard beats."""
    pdir = project_path(project_id)
    state_p = pdir / "studio_state.json"
    if not state_p.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    state = json.loads(state_p.read_text(encoding="utf-8"))

    raw = body.script.strip()
    if not raw:
        raise HTTPException(status_code=400, detail="لطفاً متن سناریو یا خطوط موضوع را وارد کنید.")

    # Split by newlines; if user wrote one paragraph, split by Persian/English sentence punctuation
    lines = [ln.strip() for ln in raw.splitlines() if ln.strip()]
    if len(lines) == 1:
        parts = [p.strip() for p in re.split(r"[.!؟\n]+", raw) if p.strip()]
        if len(parts) > 1:
            lines = parts

    shots = state.get("media", {}).get("screenshots", [])
    beats = []
    t_cur = 0.0
    for idx, ln in enumerate(lines):
        words = ln.split()
        dur = max(2.2, min(6.0, round(max(body.secPerBeat, len(words) * 0.42), 1)))
        headline = " ".join(words[:5]) if len(words) > 5 else ln
        keyword = " ".join(words[5:8]) if len(words) > 5 else (words[-1] if words else "")
        beats.append({
            "id": f"b{idx + 1}",
            "t": round(t_cur, 2),
            "end": round(t_cur + dur, 2),
            "spoken": ln,
            "headline": headline,
            "keyword": keyword,
            "visualType": "ui-showcase" if (shots and idx % 2 == 1) else "card-ribbon",
            "assetUrl": shots[idx % len(shots)]["url"] if shots else "",
            "transition": "circles" if idx % 3 == 2 else "push",
            "sfx": "whoosh" if idx % 2 == 0 else "pop",
            "aiNote": "",
        })
        t_cur += dur

    state["scriptText"] = raw
    state["beats"] = beats
    state["updatedAt"] = time.strftime("%Y-%m-%d %H:%M:%S")
    state_p.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    _plan, brief = build_plan_and_brief(pdir, state)
    return {"ok": True, "beatsCount": len(beats), "state": state, "brief": brief}


@app.post("/api/projects/{project_id}/analyze")
def analyze_project_source(project_id: str, lang: str = "fa", model: str = "small") -> dict[str, Any]:
    pdir = project_path(project_id)
    state_p = pdir / "studio_state.json"
    if not state_p.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    state = json.loads(state_p.read_text(encoding="utf-8"))
    src = state.get("media", {}).get("source")
    if not src or not Path(src["path"]).exists():
        raise HTTPException(status_code=400, detail="ابتدا فایل صوتی یا ویدیویی اصلی را آپلود کنید.")

    def do_analyze(job: dict[str, Any]):
        cmd = [sys.executable, str(SCRIPTS_DIR / "analyze.py"), src["path"], str(pdir), "--lang", lang, "--model", model]
        job["log"] += f"Running: {' '.join(cmd)}\n"
        proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        job["log"] += proc.stdout + "\n" + proc.stderr
        if proc.returncode != 0:
            raise RuntimeError(f"analyze.py exited with {proc.returncode}: {proc.stderr[-400:]}")

        t_json = pdir / "analysis" / "transcript.json"
        segs = json.loads(t_json.read_text(encoding="utf-8")) if t_json.exists() else []
        info_json = pdir / "analysis" / "info.json"
        info = json.loads(info_json.read_text(encoding="utf-8")) if info_json.exists() else {}

        # Auto-generate storyboard beats from transcript segments
        cur_state = json.loads(state_p.read_text(encoding="utf-8"))
        cur_state["transcript"] = segs
        cur_state["sourceInfo"] = info
        if segs:
            beats = []
            shots = cur_state.get("media", {}).get("screenshots", [])
            for idx, seg in enumerate(segs):
                txt = seg.get("text", "").strip()
                words = txt.split()
                headline = " ".join(words[:4]) if words else f"صحنه {idx + 1}"
                keyword = " ".join(words[4:7]) if len(words) > 4 else ""
                beats.append({
                    "id": f"b{idx + 1}",
                    "t": round(float(seg.get("start", 0)), 2),
                    "end": round(float(seg.get("end", 3)), 2),
                    "spoken": txt,
                    "headline": headline,
                    "keyword": keyword,
                    "visualType": "card-ribbon" if idx % 2 == 0 else "ui-showcase",
                    "assetUrl": shots[idx % len(shots)]["url"] if shots else "",
                    "transition": "push" if idx % 3 != 2 else "circles",
                    "sfx": "whoosh_short",
                    "aiNote": "",
                })
            cur_state["beats"] = beats
        cur_state["updatedAt"] = time.strftime("%Y-%m-%d %H:%M:%S")
        state_p.write_text(json.dumps(cur_state, ensure_ascii=False, indent=2), encoding="utf-8")
        return {"segments": len(segs), "duration": info.get("duration", 0), "beats": cur_state["beats"]}

    jid = start_job("analyze", do_analyze)
    return {"ok": True, "jobId": jid}


def build_plan_and_brief(pdir: Path, state: dict[str, Any]) -> tuple[dict[str, Any], str]:
    """Generate both engine-compatible `plan.json` and a human+AI Director Brief markdown."""
    beats = state.get("beats", [])
    duration = state.get("sourceInfo", {}).get("duration") or (max((b.get("end", 4) for b in beats), default=12.0))
    brand = state.get("brand", {})
    opts = state.get("options", {})
    src = state.get("media", {}).get("source")

    elements = []
    sfx_events = []
    transitions = []

    for idx, b in enumerate(beats):
        t0 = float(b.get("t", idx * 3.0))
        t1 = float(b.get("end", t0 + 3.0))
        dur = max(0.8, round(t1 - t0, 2))
        if b.get("headline"):
            elements.append({
                "type": "title",
                "t": t0,
                "d": dur,
                "y": 260,
                "lines": [b["headline"]],
            })
        if b.get("keyword"):
            elements.append({
                "type": "keyword",
                "t": round(t0 + 0.35, 2),
                "d": max(0.6, round(dur - 0.35, 2)),
                "text": b["keyword"],
                "y": 1480,
            })
        if idx > 0:
            transitions.append({"t": t0, "kind": b.get("transition") or opts.get("transition") or "push"})
        if b.get("sfx"):
            sfx_events.append({"t": t0, "name": b["sfx"]})

    plan = {
        "source": src["path"] if src else "",
        "mode": "explainer" if state.get("layout") in ("C", "D") else "overlay",
        "style": state.get("style", "pinterest-faceless"),
        "duration": round(float(duration), 2),
        "theme": {
            "primary": brand.get("primary", "#007AFF"),
            "accent": brand.get("accent", "#F8D146"),
            "dark": brand.get("bg", "#F4F5F2"),
            "text": brand.get("text", "#262B2E"),
            "display": brand.get("displayFont", "Hasti"),
            "body": brand.get("bodyFont", "Pinar"),
        },
        "elements": elements,
        "transitions": transitions,
        "sfx": sfx_events,
    }
    if opts.get("music") and opts.get("music") != "none":
        plan["music"] = {"file": opts["music"], "gain": opts.get("musicGain", -20)}
    if opts.get("footageFx") and opts.get("footageFx") != "none":
        plan["footageFx"] = [{
            "file": opts["footageFx"],
            "blend": opts.get("footageBlend", "screen"),
            "opacity": float(opts.get("footageOpacity", 0.45)),
        }]
    if brand.get("handle"):
        plan["handle"] = {"text": brand["handle"], "corner": brand.get("handlePos", "tr")}
    cov = state.get("cover", {})
    if cov.get("line1") or cov.get("line2"):
        plan["cover"] = {"lines": [x for x in [cov.get("line1"), cov.get("line2")] if x]}

    # Build complete, self-contained AI Director & Execution Brief (Markdown)
    skills_root = Path.home() / ".gemini" / "config" / "skills"
    exec_mode = opts.get("executionMode") or "auto"
    selected_skills = opts.get("selectedSkills") or ["pinterest-studio", "motion-doctrine", "cut-the-curve", "oversized-cursor"]
    hybrid = opts.get("hybrid") or {}
    cov = state.get("cover") or {}

    skill_paths_map = {
        "reel-motion-edit": str(ROOT / "SKILL.md"),
        "pinterest-studio": str(STUDIO_DIR / "pinterest_renderer.py"),
        "motion-doctrine": str(skills_root / "motion-doctrine" / "SKILL.md"),
        "cut-the-curve": str(skills_root / "cut-the-curve" / "SKILL.md"),
        "oversized-cursor": str(skills_root / "oversized-cursor" / "SKILL.md"),
        "hyperframes": str(skills_root / "hyperframes" / "SKILL.md"),
        "remotion-best-practices": str(skills_root / "remotion-best-practices" / "SKILL.md"),
        "ffmpeg-skill": str(skills_root / "ffmpeg-skill" / "SKILL.md"),
        "ui-ux-pro-max": str(skills_root / "ui-ux-pro-max" / "SKILL.md"),
    }

    lines = [
        f"# دستورالعمل جامع و خودکفای تدوین هوشمند: {state.get('title', 'ریلز')}",
        "",
        "## ۰. نحوهٔ اجرا و اسکیل‌های الزامی برای هوش مصنوعی (Execution Contract)",
        f"- **حالت اجرا:** `{exec_mode}` (`auto` = بهترین موتور متناسب با سبک | `skills` = استفاده از اسکیل‌های مشخص‌شده | `custom-code` = کدنویسی مستقیم بدون محدودیت قالب)",
        f"- **پروژهٔ استودیو:** `{state.get('id', pdir.name)}` | پوشهٔ پروژه: `{pdir}`",
        "- **فایل‌ها و اسکیل‌هایی که قبل از تدوین باید مطالعه/استفاده شوند:**",
    ]
    if exec_mode == "custom-code":
        lines.append("  - **بدون استفاده از اسکیل قالب آماده:** کل تدوین را مستقیم با پایتون/Pillow/HarfBuzz/FFmpeg یا HTML/GSAP با نهایت خلاقیت کدنویسی کن.")
    else:
        for sk in selected_skills:
            if sk in skill_paths_map:
                lines.append(f"  - `{sk}` → `{skill_paths_map[sk]}`")

    lines.extend([
        "",
        "## ۱. مشخصات سبک، کادر، اینترو/اوترو و هویت بصری",
        f"- **سبک انتخابی:** `{state.get('style')}` | **چیدمان قاب:** `{state.get('layout', 'C')}` | **نسبت تصویر:** `{opts.get('aspectRatio', '9:16')}`",
        f"- **سیستم طراحی مرجع (گیت‌هاب ۶۷ سبک):** `{state.get('designSystemRef') or 'بدون ارجاع اضافه'}`",
        f"- **پالت رنگ:** اصلی `{brand.get('primary')}` | تأکید `{brand.get('accent')}` | پس‌زمینه `{brand.get('bg')}` | متن `{brand.get('text')}`",
        f"- **فونت‌ها:** تیتر `{brand.get('displayFont')}` | متن `{brand.get('bodyFont')}` | مقیاس فونت: `{opts.get('fontScale', 'md')}`",
        f"- **نام/آیدی پیج:** `{brand.get('handle') or 'ندارد'}` (جایگاه روی کادر: `{brand.get('handlePos', 'tr')}`)",
        f"- **حالت متن و جایگاه‌ها:** نوع نمایش `{opts.get('textMode', 'keywords')}` | افکت نمایش/تأکید کلمات `{opts.get('textAnimStyle', 'classic-rise')}` | جایگاه تیتر `{opts.get('headlinePos', 'top')}` | جایگاه زیرنویس `{opts.get('captionPos', 'bottom-safe')}` | سبک زیرنویس `{opts.get('captions')}`",
        f"- **تنظیمات حرکتی و فوتیج:** خط منحنی پشت کارت: `{'بله' if opts.get('flowlineRibbon') else 'خیر'}` | المان‌های بلر گوشه: `{'بله' if opts.get('cornerBlurAccents') else 'خیر'}` | اسکرول فضایی: `{'بله' if opts.get('spatialScroll') else 'خیر'}` | فوتیج افکت: `{opts.get('footageFx', 'none')}` (حالت `{opts.get('footageBlend', 'screen')}`، شفافیت `{opts.get('footageOpacity', 0.45)}`)",
        f"- **اینترو و اوترو:** سبک اینترو `{opts.get('introStyle', 'none')}` ({opts.get('introDur', 2.0)}s) | سبک اوترو `{opts.get('outroStyle', 'none')}` ({opts.get('outroDur', 2.8)}s) | واژه CTA: `{opts.get('outroCtaWord', '')}` ({opts.get('outroSubtitle', '')})",
        f"- **پریست حرکتی (FFX) و حالت‌های ترکیبی هوشمند (Smart Hybrid):** پریست پایه `{opts.get('motionPreset', 'smooth-quart')}` (فایل پارامترها: `{ASSETS_DIR / 'motion-presets.json'}`) | ترکیبی چیدمان: `{'فعال' if hybrid.get('layout') else 'خیر'}` | ترکیبی ترنزیشن‌ها: `{'فعال' if hybrid.get('transitions') else 'خیر'}` | ترکیبی انیمیشن متن: `{'فعال' if hybrid.get('motion') else 'خیر'}` | ترکیبی نمایش متن/زیرنویس: `{'فعال' if hybrid.get('textMode') else 'خیر'}` | ترکیبی افکت/فوتیج: `{'فعال' if hybrid.get('fx') else 'خیر'}`",
        f"- **موسیقی و میکس صدا:** موزیک `{opts.get('music')}` (گین `{opts.get('musicGain')} dB`، داکینگ: `{'فعال' if opts.get('musicDucking', True) else 'خیر'}`) | گین افکت صوتی `{opts.get('sfxGain', -4)} dB` | بهبود صدای گوینده: `{'فعال' if opts.get('voiceEnhance', True) else 'خیر'}`",
        f"- **کاور اینستاگرام (۱۰۸۰×۱۹۲۰):** خط اول `{cov.get('line1', '')}` | خط دوم `{cov.get('line2', '')}` | برچسب `{cov.get('badge', '')}`",
        "",
        "## ۲. نقشهٔ مخازن و ابزارهای آماده روی سیستم (Assets & Tools Map)",
        f"- **فونت‌های فارسی:** `{ASSETS_DIR / 'fonts' / 'user'}` (شامل `Hasti`, `Pinar`, `Peyda`, `YekanBakh`, `Morabba`, `IRANSansX`)",
        f"- **آیکون‌های ۳ بعدی شفاف (PNG):** `{ASSETS_DIR / 'icons-3d'}`",
        f"- **آیکون‌های وکتور و لوگوی برندها (SVG):** `{ASSETS_DIR / 'icons-svg'}`",
        f"- **افکت‌های صوتی (SFX):** `{ASSETS_DIR / 'sfx'}` و `{ASSETS_DIR / 'sfx' / 'user'}`",
        f"- **موزیک پس‌زمینه:** `{ASSETS_DIR / 'music'}` | **فوتیج‌های افکت نوری:** `{ASSETS_DIR / 'footage'}`",
        f"- **دیتابیس ۶۷ سیستم طراحی + ۲۰۰ صحنه Remotion:** `{KNOWLEDGE_DIR}`",
        f"- **دانلود خودکار از ۲۰۰,۰۰۰ آیکون آنلاین Iconify:** `python {SCRIPTS_DIR / 'fetch_assets.py'} --search-icon <word>`",
        "",
        "## ۳. ایده آزاد کاربر و سناریوی خام",
        state.get("freeformDirection") or "— (مطابق سبک و جزئیات انتخابی اجرا شود)",
    ])
    if state.get("scriptText"):
        lines.extend(["", "### متن کامل سناریوی کاربر:", state["scriptText"]])

    lines.extend([
        "",
        "## ۴. فایل‌های ورودی پروژه",
        f"- **فایل صدا/ویدیو اصلی:** `{src['path'] if src else 'آپلود نشده'}`",
        f"- **لوگو:** `{(state.get('media', {}).get('logo') or {}).get('path', 'آپلود نشده')}`",
    ])
    shots = state.get("media", {}).get("screenshots", [])
    if shots:
        lines.append("- **اسکرین‌شات‌ها و تصاویر محصول:**")
        for s in shots:
            lines.append(f"  - `{s['name']}` → `{s['path']}`")
    refs = state.get("media", {}).get("references", [])
    if refs:
        lines.append("- **فایل‌های رفرنس کاربر:**")
        for r in refs:
            lines.append(f"  - `{r['name']}` → `{r['path']}`")

    lines.extend(["", "## ۵. استوری‌بورد و بیت‌شیت سکانس‌به‌سکانس", ""])
    for idx, b in enumerate(beats, 1):
        vtype_txt = b.get("visualType") if (b.get("visualType") and b.get("visualType") != "auto") else "پیشنهاد خود هوش مصنوعی"
        tr_txt = b.get("transition") if (b.get("transition") and b.get("transition") != "auto") else "پیشنهاد خود هوش مصنوعی"
        sfx_txt = "بدون صدا" if b.get("sfx") == "none" else (b.get("sfx") or "پیشنهاد خود هوش مصنوعی")
        asset_txt = b.get("assetUrl") or "پیشنهاد خود هوش مصنوعی (بر اساس متن گفتار بهترین تصویر، اسکرین‌شات یا آیکون ۳ بعدی را انتخاب کن)"
        lines.append(f"### سکانس {idx} (`{b.get('t')}s` تا `{b.get('end')}s`)")
        lines.append(f"- **گفتار:** {b.get('spoken') or '—'}")
        lines.append(f"- **تیتر روی صفحه:** `{b.get('headline') or 'پیشنهاد هوش مصنوعی'}` | **واژهٔ تأکید:** `{b.get('keyword') or 'پیشنهاد هوش مصنوعی'}`")
        lines.append(f"- **نوع چیدمان/انیمیشن:** `{vtype_txt}` | **ترنزیشن:** `{tr_txt}` | **افکت صوتی:** `{sfx_txt}`")
        lines.append(f"- **المان/تصویر سکانس:** `{asset_txt}`")
        if b.get("screenMotion") and b.get("screenMotion") != "auto":
            lines.append(
                f"- **کارگردانی اسکرین‌شات (تمام‌صفحه بدون کادر):** حالت `{b.get('screenMotion')}` | نقطه زوم `X={b.get('focusX', 50)}% , Y={b.get('focusY', 42)}%` | "
                f"زاویه سه‌بعدی پرسپکتیو: `{'فعال' if b.get('tilt3d') else 'خیر'}` | دوربین همگام با موس و افکت کلیک: `{'فعال' if b.get('cursorClick') else 'خیر'}`"
            )
        if b.get("aiNote"):
            lines.append(f"- **دستور اختصاصی کاربر به هوش مصنوعی:** {b.get('aiNote')}")
        lines.append("")

    lines.extend([
        "## ۶. استاندارد تحویل و چک‌لیست بازبینی کیفیت (الزامی قبل از تحویل نهایی)",
        f"1. خروجی نهایی را در `{pdir / 'final.mp4'}` (30fps، H.264، yuv420p، صدای AAC 192k) و کاور را در `{pdir / 'build' / 'cover.jpg'}` ذخیره کن.",
        "2. حتماً از فریم‌های کلیدی (اینترو، میانهٔ سکانس‌ها، لحظهٔ کلیک موس/ترنزیشن و اوترو) شیت تصویری بساز و با چشم بررسی کن که هیچ متن فارسی برعکس، بریده‌شده یا خارج از ناحیه امن ریلز (Safe-Zone) نباشد.",
        "3. اگر اسکرین‌شات روی حالت تمام‌صفحه یا سه‌بعدی است، ۱۰۰٪ کادر را بدون حاشیه پر کند و دوربین همگام با موس حرکت کند.",
        "4. در پایان، مسیر فایل‌های نهایی و گزارش کوتاه بازبینی را تحویل بده.",
    ])

    brief_md = "\n".join(lines)
    (pdir / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=2), encoding="utf-8")
    (pdir / "ai-director-brief.md").write_text(brief_md, encoding="utf-8")
    return plan, brief_md


@app.post("/api/projects/{project_id}/save")
def save_project_state(project_id: str, state: dict[str, Any]) -> dict[str, Any]:
    pdir = project_path(project_id)
    pdir.mkdir(parents=True, exist_ok=True)
    state["id"] = project_id
    state["updatedAt"] = time.strftime("%Y-%m-%d %H:%M:%S")
    (pdir / "studio_state.json").write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    plan, brief = build_plan_and_brief(pdir, state)
    return {
        "ok": True,
        "planPath": str(pdir / "plan.json"),
        "briefPath": str(pdir / "ai-director-brief.md"),
        "brief": brief,
        "plan": plan,
    }


class RenderReq(BaseModel):
    mode: str = "check"  # check | preview | full
    engine: str = "auto"  # auto | pinterest | plan-engine
    previewTimes: list[float] = [1.0, 4.0]


@app.post("/api/projects/{project_id}/extract-brand-colors")
def extract_brand_colors(project_id: str) -> dict[str, Any]:
    """Extract dominant primary & accent hex colors from the project's uploaded logo."""
    from PIL import Image

    pdir = project_path(project_id)
    state_p = pdir / "studio_state.json"
    if not state_p.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    state = json.loads(state_p.read_text(encoding="utf-8"))
    logo = state.get("media", {}).get("logo")
    if not logo or not Path(logo.get("path", "")).exists():
        raise HTTPException(status_code=400, detail="ابتدا لوگوی برند را در تب ۲ آپلود کنید.")

    im = Image.open(logo["path"]).convert("RGBA")
    im.thumbnail((120, 120))
    # Keep non-transparent, non-near-white, non-near-black pixels
    pixels = []
    for r, g, b, a in im.getdata():
        if a < 140:
            continue
        if (r > 238 and g > 238 and b > 238) or (r < 20 and g < 20 and b < 20):
            continue
        pixels.append((r, g, b))

    if not pixels:
        return {"ok": True, "primary": "#007AFF", "accent": "#F8D146"}

    sample_im = Image.new("RGB", (len(pixels), 1))
    sample_im.putdata(pixels)
    quant = sample_im.quantize(colors=8, method=Image.Quantize.MEDIANCUT).convert("RGB")
    counts = quant.getcolors(maxcolors=32) or []

    def sat_score(item):
        cnt, (r, g, b) = item
        mx, mn = max(r, g, b), min(r, g, b)
        sat = (mx - mn) / max(mx, 1)
        return cnt * (0.25 + 3.0 * (sat ** 1.4))

    counts.sort(key=sat_score, reverse=True)

    def to_hex(rgb):
        return "#{:02X}{:02X}{:02X}".format(*rgb)

    primary = to_hex(counts[0][1]) if counts else "#007AFF"
    accent = to_hex(counts[1][1]) if len(counts) > 1 else "#F8D146"
    return {"ok": True, "primary": primary, "accent": accent, "palette": [to_hex(c[1]) for c in counts[:5]]}


class AIConfigReq(BaseModel):
    provider: str = "agent-bridge"  # agent-bridge | gemini | openai | ollama
    apiKey: str = ""
    model: str = "gemini-2.5-flash"
    baseUrl: str = "https://api.openai.com/v1"


@app.get("/api/ai/config")
def get_ai_config() -> dict[str, Any]:
    import sys as _sys
    _sys.path.insert(0, str(STUDIO_DIR))
    import ai_director as aid
    cfg = aid.load_ai_config()
    return {
        "provider": cfg.get("provider", "agent-bridge"),
        "model": cfg.get("model", "gemini-2.5-flash"),
        "baseUrl": cfg.get("baseUrl", "https://api.openai.com/v1"),
        "hasApiKey": bool(cfg.get("apiKey")),
    }


@app.post("/api/ai/config")
def set_ai_config(body: AIConfigReq) -> dict[str, Any]:
    import sys as _sys
    _sys.path.insert(0, str(STUDIO_DIR))
    import ai_director as aid
    saved = aid.save_ai_config(body.model_dump())
    return {"ok": True, "provider": saved["provider"], "model": saved["model"], "hasApiKey": bool(saved.get("apiKey"))}


def apply_ai_plan_to_state(pdir: Path, state: dict[str, Any], ai_plan: dict[str, Any], engine_label: str) -> tuple[dict[str, Any], str]:
    if ai_plan.get("style"):
        state["style"] = ai_plan["style"]
    if ai_plan.get("designSystemRef") is not None:
        state["designSystemRef"] = ai_plan["designSystemRef"]
    if ai_plan.get("layout"):
        state["layout"] = ai_plan["layout"]
    if isinstance(ai_plan.get("brand"), dict):
        state.setdefault("brand", {}).update({k: v for k, v in ai_plan["brand"].items() if v is not None})
    if isinstance(ai_plan.get("options"), dict):
        state.setdefault("options", {}).update({k: v for k, v in ai_plan["options"].items() if v is not None})
    if isinstance(ai_plan.get("cover"), dict):
        state.setdefault("cover", {}).update({k: v for k, v in ai_plan["cover"].items() if v is not None})
    if isinstance(ai_plan.get("beats"), list) and ai_plan["beats"]:
        state["beats"] = ai_plan["beats"]

    state["aiAnalysisReport"] = ai_plan.get("analysisReport") or ""
    state["aiEngineUsed"] = engine_label
    state["aiPendingBridge"] = False
    state["updatedAt"] = time.strftime("%Y-%m-%d %H:%M:%S")
    (pdir / "studio_state.json").write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    _plan, brief = build_plan_and_brief(pdir, state)
    return state, brief


@app.post("/api/projects/{project_id}/apply-ai-plan")
def apply_external_ai_plan(project_id: str, ai_plan: dict[str, Any]) -> dict[str, Any]:
    """Endpoint for local AI Agent / MCP server to push a completed direction plan directly into the live web Studio."""
    pdir = project_path(project_id)
    state_p = pdir / "studio_state.json"
    if not state_p.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    state = json.loads(state_p.read_text(encoding="utf-8"))
    updated, brief = apply_ai_plan_to_state(pdir, state, ai_plan, ai_plan.get("engine", "mcp-agent"))
    return {"ok": True, "state": updated, "brief": brief}


class AutoDirectReq(BaseModel):
    mode: str = "auto"  # auto | agent-bridge | llm | local


@app.post("/api/projects/{project_id}/auto-direct")
def auto_direct_project(project_id: str, body: AutoDirectReq | None = None) -> dict[str, Any]:
    """
    Smart AI Director:
    - mode='agent-bridge': writes `ai_request.json` with all uploaded files & context for local Antigravity/MCP Agent
      (ZERO API key required) and enables Live Auto-Sync in the web UI.
    - mode='llm' or 'auto' (with API key): calls multimodal Gemini / OpenAI-compatible / Ollama model.
    - fallback: runs local smart analyzer + extracts logo colors.
    """
    import sys as _sys
    _sys.path.insert(0, str(STUDIO_DIR))
    import ai_director as aid

    req_mode = body.mode if body else "auto"
    pdir = project_path(project_id)
    state_p = pdir / "studio_state.json"
    if not state_p.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    state = json.loads(state_p.read_text(encoding="utf-8"))

    # Build catalog summary for AI
    media_assets = list_media_assets()
    catalog_summary = {
        "styleIds": list(load_styles_json().keys()),
        "designSystems67": [d["id"] for d in load_design_systems_67()],
        "icons3d": [ic["url"] for ic in media_assets["icons3d"]],
        "sfx": [s["name"] for s in media_assets["sfx"]],
        "music": [m["name"] for m in media_assets["music"]],
        "footage": [f["name"] for f in media_assets["footage"]],
    }

    extracted_colors = None
    logo = state.get("media", {}).get("logo")
    if logo and Path(logo.get("path", "")).exists():
        try:
            extracted_colors = extract_brand_colors(project_id)
        except Exception:
            pass

    cfg = aid.load_ai_config()
    effective_mode = req_mode
    if effective_mode == "auto":
        if cfg.get("provider") == "agent-bridge" or not cfg.get("apiKey"):
            effective_mode = "local"
        else:
            effective_mode = "llm"

    if effective_mode == "agent-bridge":
        prompt_text = aid.build_director_prompt(state, catalog_summary)
        req_file = pdir / "ai_request.json"
        req_file.write_text(json.dumps({
            "projectId": project_id,
            "projectDir": str(pdir),
            "applyEndpoint": f"http://127.0.0.1:8765/api/projects/{project_id}/apply-ai-plan",
            "extractedLogoColors": extracted_colors,
            "prompt": prompt_text,
        }, ensure_ascii=False, indent=2), encoding="utf-8")

        state["aiPendingBridge"] = True
        state["updatedAt"] = time.strftime("%Y-%m-%d %H:%M:%S")
        state_p.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")

        agent_command = (
            f"پروژه استودیو `{project_id}` را با بررسی کامل فایل‌های آپلودشده (فایل `{req_file}`) "
            f"به‌صورت هوشمند کارگردانی کن و خروجی JSON را مستقیم روی آن اعمال کن."
        )
        return {
            "ok": True,
            "bridgePending": True,
            "requestFile": str(req_file),
            "agentCommand": agent_command,
            "state": state,
        }

    if effective_mode == "llm":
        ai_plan, engine_used = aid.run_ai_director(state, catalog_summary, extracted_colors)
    else:
        ai_plan = aid.run_local_smart_fallback(state, catalog_summary, extracted_colors)
        engine_used = "local-smart"

    updated, brief = apply_ai_plan_to_state(pdir, state, ai_plan, engine_used)
    return {
        "ok": True,
        "bridgePending": False,
        "engine": engine_used,
        "reason": f"انجام شد با موتور: {engine_used}",
        "state": updated,
        "brief": brief,
    }


@app.post("/api/projects/{project_id}/tighten")
def tighten_project_source(project_id: str) -> dict[str, Any]:
    """Remove dead air / silences automatically using scripts/tighten.py."""
    pdir = project_path(project_id)
    state_p = pdir / "studio_state.json"
    if not state_p.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    state = json.loads(state_p.read_text(encoding="utf-8"))
    src = state.get("media", {}).get("source")
    if not src or not Path(src["path"]).exists():
        raise HTTPException(status_code=400, detail="ابتدا فایل صوتی یا ویدیویی اصلی را آپلود کنید.")

    def do_tighten(job: dict[str, Any]):
        src_p = Path(src["path"])
        out_name = f"tightened_{src_p.stem}{src_p.suffix}"
        out_p = pdir / "uploads" / out_name
        cmd = [sys.executable, str(SCRIPTS_DIR / "tighten.py"), str(src_p), str(out_p)]
        job["log"] += f"Running: {' '.join(cmd)}\n"
        proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        job["log"] += proc.stdout + "\n" + proc.stderr
        if proc.returncode != 0:
            raise RuntimeError(f"tighten.py failed ({proc.returncode}): {(proc.stderr or proc.stdout)[-400:]}")
        cur = json.loads(state_p.read_text(encoding="utf-8"))
        cur["media"]["source"] = {
            "name": out_name,
            "storedName": out_name,
            "path": str(out_p),
            "url": f"/projects-files/{project_id}/uploads/{out_name}",
            "size": out_p.stat().st_size if out_p.exists() else 0,
        }
        cur["updatedAt"] = time.strftime("%Y-%m-%d %H:%M:%S")
        state_p.write_text(json.dumps(cur, ensure_ascii=False, indent=2), encoding="utf-8")
        return {"source": cur["media"]["source"]}

    jid = start_job("tighten", do_tighten)
    return {"ok": True, "jobId": jid}


class CoverReq(BaseModel):
    line1: str = ""
    line2: str = ""
    badge: str = ""


@app.post("/api/projects/{project_id}/cover")
def generate_project_cover(project_id: str, body: CoverReq) -> dict[str, Any]:
    """Generate a high-impact 1080x1920 Instagram Reels cover image using the project's brand & Persian typography."""
    import sys as _sys
    _sys.path.insert(0, str(STUDIO_DIR))
    import pinterest_renderer as pr
    from PIL import Image

    pdir = project_path(project_id)
    state_p = pdir / "studio_state.json"
    if not state_p.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    state = json.loads(state_p.read_text(encoding="utf-8"))
    state["cover"] = {"line1": body.line1, "line2": body.line2, "badge": body.badge}
    state_p.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")

    brand = state.get("brand", {})
    bg = pr.build_studio_backdrop(brand.get("bg", "#F4F5F2")).convert("RGBA")
    primary = brand.get("primary", "#007AFF")
    accent = brand.get("accent", "#F8D146")
    text_col = brand.get("text", "#262B2E")
    disp_font = brand.get("displayFont", "Hasti")

    # Flowline across background
    pr.draw_flowline_ribbon(bg, ((-28, 380), (180, 620), (540, 580), (748, 860)), 1.0, 0.0, 0.5, 48.0, primary)

    # Center hero logo or first beat asset
    hero_p = None
    if state.get("media", {}).get("logo"):
        hero_p = pr.resolve_local_asset(state["media"]["logo"].get("path", ""))
    if not hero_p and state.get("beats"):
        hero_p = pr.resolve_local_asset(state["beats"][0].get("assetUrl", ""))
    if hero_p:
        r, g, b = pr.hex_to_rgb(brand.get("bg", "#F4F5F2"))
        is_dark = (0.299 * r + 0.587 * g + 0.114 * b) < 130
        card = pr.load_card_image(str(hero_p), max_w=420, max_h=380, is_dark=is_dark)
        pr.paste_center(bg, card, pr.W / 2, 650)

    if body.badge:
        pr.draw_word(bg, body.badge, pr.W / 2, 230, 32, "#FFFFFF", disp_font, 1.0, 0.0, 0.2, badge="pill", badge_color=primary)
    if body.line1:
        pr.draw_word(bg, body.line1, pr.W / 2, 330, 62, text_col, disp_font, 1.0, 0.0, 0.2, badge="underline", badge_color=primary)
    if body.line2:
        ar, ag, ab = pr.hex_to_rgb(accent)
        kw_col = "#FFFFFF" if (0.299 * ar + 0.587 * ag + 0.114 * ab) < 145 else "#111827"
        pr.draw_word(bg, body.line2, pr.W / 2, 985, 52, kw_col, disp_font, 1.0, 0.0, 0.2, badge="pill", badge_color=accent)

    if brand.get("handle"):
        pr.draw_word(bg, brand["handle"], pr.W / 2, 1140, 26, text_col, brand.get("bodyFont", "Pinar"), 1.0, 0.0, 0.2)

    pr.draw_corner_accents(bg, 0.5, text_col)
    build_dir = pdir / "build"
    build_dir.mkdir(parents=True, exist_ok=True)
    out_jpg = build_dir / "cover.jpg"
    bg.convert("RGB").resize((1080, 1920), Image.Resampling.LANCZOS).save(out_jpg, quality=94)
    return {"ok": True, "coverUrl": f"/projects-files/{project_id}/build/cover.jpg?v={int(time.time())}", "path": str(out_jpg)}


@app.post("/api/projects/{project_id}/render")
def render_project(project_id: str, body: RenderReq) -> dict[str, Any]:
    pdir = project_path(project_id)
    plan_p = pdir / "plan.json"
    state_p = pdir / "studio_state.json"
    if not plan_p.exists() or not state_p.exists():
        raise HTTPException(status_code=400, detail="ابتدا پروژه را ذخیره کنید تا plan.json ساخته شود.")

    st_data = json.loads(state_p.read_text(encoding="utf-8"))
    use_pinterest = (body.engine == "pinterest") or (body.engine == "auto" and st_data.get("style") == "pinterest-faceless")

    def do_render(job: dict[str, Any]):
        if use_pinterest and body.mode in ("preview", "full"):
            cmd = [sys.executable, str(STUDIO_DIR / "pinterest_renderer.py"), str(pdir), body.mode]
            job["log"] += f"Running Pinterest Faceless Engine: {' '.join(cmd)}\n"
            job["progress"] = 5
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding="utf-8", errors="replace")
            assert proc.stdout is not None
            for line in proc.stdout:
                job["log"] += line
                if line.startswith("PROGRESS:"):
                    try:
                        job["progress"] = int(line.split(":", 1)[1].strip())
                    except Exception:
                        pass
            if proc.wait() != 0:
                raise RuntimeError(f"pinterest_renderer.py failed ({proc.returncode}): {job['log'][-500:]}")
            job["progress"] = 100
            out_urls = {}
            if (pdir / "build" / "preview.jpg").exists():
                out_urls["preview"] = f"/projects-files/{project_id}/build/preview.jpg?v={int(time.time())}"
            if body.mode == "full" and (pdir / "final.mp4").exists():
                out_urls["video"] = f"/projects-files/{project_id}/final.mp4?v={int(time.time())}"
            return {"mode": body.mode, "engine": "pinterest", "outputs": out_urls}

        if body.mode == "check":
            cmd = ["node", str(SCRIPTS_DIR / "render.js"), str(plan_p), "check"]
        elif body.mode == "preview":
            ts = [str(t) for t in (body.previewTimes or [1.0])]
            cmd = ["node", str(SCRIPTS_DIR / "render.js"), str(plan_p), "preview", *ts]
        elif body.mode == "full":
            cmd = ["node", str(SCRIPTS_DIR / "render.js"), str(plan_p), "full"]
        else:
            raise ValueError(f"Unknown mode: {body.mode}")

        job["log"] += f"Running: {' '.join(cmd)}\n"
        proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        job["log"] += proc.stdout + "\n" + proc.stderr
        if proc.returncode != 0:
            raise RuntimeError(f"render.js failed ({proc.returncode}): {(proc.stderr or proc.stdout)[-500:]}")

        out_urls = {}
        preview_jpg = pdir / "build" / "preview.jpg"
        if preview_jpg.exists():
            out_urls["preview"] = f"/projects-files/{project_id}/build/preview.jpg?v={int(time.time())}"

        if body.mode == "full":
            out_mp4 = pdir / "final.mp4"
            cmd2 = [sys.executable, str(SCRIPTS_DIR / "compose.py"), str(plan_p), "--out", str(out_mp4)]
            job["log"] += f"\nRunning: {' '.join(cmd2)}\n"
            proc2 = subprocess.run(cmd2, capture_output=True, text=True, encoding="utf-8", errors="replace")
            job["log"] += proc2.stdout + "\n" + proc2.stderr
            if proc2.returncode != 0:
                raise RuntimeError(f"compose.py failed ({proc2.returncode}): {(proc2.stderr or proc2.stdout)[-500:]}")
            out_urls["video"] = f"/projects-files/{project_id}/final.mp4?v={int(time.time())}"

        return {"mode": body.mode, "engine": "plan-engine", "outputs": out_urls}

    jid = start_job(f"render-{body.mode}", do_render)
    return {"ok": True, "jobId": jid}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("STUDIO_PORT", "8765"))
    print(f"\n  Reel Motion Studio running at: http://127.0.0.1:{port}\n")
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
