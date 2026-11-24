#!/usr/bin/env python3
"""
fetch_assets.py — Automatic Online Asset Resolver & Downloader for reel-motion-edit.

Lets the agent or user download on demand:
1. Any vector icon or brand logo from Iconify's 200,000+ icon catalog (Solar, Lucide, Phosphor, Logos, Fluent, etc.)
   into `assets/icons-svg/`.
2. Any 3D Microsoft Fluent Emoji PNG (`256x256` transparent) into `assets/icons-3d/`.
3. Search the local 67+ Design Styles & UI/UX Pro Max CSV databases in `assets/design-knowledge/`.
4. Search or pull stock photos / videos / SFX from Pexels, Pixabay, or Freesound if API keys are set in environment
   variables (`PEXELS_API_KEY`, `PIXABAY_API_KEY`, `FREESOUND_API_KEY`).

Usage examples:
  python scripts/fetch_assets.py --search-icon "certificate"
  python scripts/fetch_assets.py --download-icon "solar:diploma-verified-bold-duotone" "logos:wordpress-icon"
  python scripts/fetch_assets.py --search-style "bento"
  python scripts/fetch_assets.py --list-styles
"""

import argparse
import csv
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "assets"
ICONS_SVG_DIR = ASSETS_DIR / "icons-svg"
ICONS_3D_DIR = ASSETS_DIR / "icons-3d"
SFX_USER_DIR = ASSETS_DIR / "sfx" / "user"
FOOTAGE_USER_DIR = ASSETS_DIR / "footage" / "user"
KNOWLEDGE_DIR = ASSETS_DIR / "design-knowledge"


def http_get(url: str, headers: dict | None = None, timeout: int = 15) -> bytes:
    h = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) reel-motion-edit/2.0"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def search_iconify(query: str, limit: int = 20) -> list[str]:
    url = f"https://api.iconify.design/search?query={urllib.parse.quote(query)}&limit={limit}"
    data = json.loads(http_get(url).decode("utf-8"))
    return data.get("icons", [])


def download_iconify_svg(icon_id: str, height: int = 256, color: str | None = None) -> Path:
    ICONS_SVG_DIR.mkdir(parents=True, exist_ok=True)
    if ":" not in icon_id:
        raise ValueError(f"Icon ID must be 'prefix:name' (e.g. 'solar:rocket-2-bold-duotone'), got: {icon_id}")
    prefix, name = icon_id.split(":", 1)
    params = f"?height={height}"
    if color:
        params += f"&color={urllib.parse.quote(color)}"
    url = f"https://api.iconify.design/{prefix}/{name}.svg{params}"
    svg_bytes = http_get(url)
    out_path = ICONS_SVG_DIR / f"{prefix}_{name}.svg"
    out_path.write_bytes(svg_bytes)
    return out_path


def download_fluent_3d(folder_name: str, file_stem: str | None = None) -> Path:
    """
    Download a 256x256 transparent 3D PNG from Microsoft Fluent Emoji via jsDelivr CDN.
    Example: folder_name="Rocket" -> assets/Rocket/3D/rocket_3d.png
    """
    ICONS_3D_DIR.mkdir(parents=True, exist_ok=True)
    stem = file_stem or folder_name.lower().replace(" ", "_")
    encoded_folder = urllib.parse.quote(folder_name)
    url = f"https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/{encoded_folder}/3D/{stem}_3d.png"
    png_bytes = http_get(url)
    out_path = ICONS_3D_DIR / f"{stem}.png"
    out_path.write_bytes(png_bytes)
    return out_path


def list_design_styles() -> None:
    styles_67 = KNOWLEDGE_DIR / "design-styles-67"
    if styles_67.exists():
        dirs = sorted([d.name for d in styles_67.iterdir() if d.is_dir()])
        print(f"=== 67 Full Design Systems in assets/design-knowledge/design-styles-67 ({len(dirs)}) ===")
        print(", ".join(dirs))
        print()

    csv_styles = KNOWLEDGE_DIR / "ui-ux-pro-max" / "ui-ux-pro-max" / "data" / "styles.csv"
    if csv_styles.exists():
        print("=== UI/UX Pro Max Styles Catalog (styles.csv) ===")
        with open(csv_styles, encoding="utf-8", errors="replace") as f:
            reader = csv.DictReader(f)
            for row in reader:
                no = row.get("No", "")
                cat = row.get("Style Category", "")
                kw = row.get("Keywords", "")
                print(f"  [{no}] {cat} — {kw[:80]}")


def search_design_knowledge(query: str) -> None:
    q = query.lower()
    # 1. Check 67 design-styles folders
    styles_67 = KNOWLEDGE_DIR / "design-styles-67"
    if styles_67.exists():
        for d in sorted(styles_67.iterdir()):
            if d.is_dir() and q in d.name.lower():
                design_md = d / "DESIGN.md"
                skill_md = d / "SKILL.md"
                print(f"[Match in 67 Design Styles] {d.name}:")
                if design_md.exists():
                    print(f"  DESIGN.md: {design_md}")
                if skill_md.exists():
                    print(f"  SKILL.md:  {skill_md}")

    # 2. Search UI/UX Pro Max CSVs
    data_dir = KNOWLEDGE_DIR / "ui-ux-pro-max" / "ui-ux-pro-max" / "data"
    if data_dir.exists():
        for csv_file in sorted(data_dir.glob("*.csv")):
            text = csv_file.read_text(encoding="utf-8", errors="replace")
            for line in text.splitlines():
                if q in line.lower():
                    print(f"[{csv_file.name}] {line[:160]}...")


def download_pexels_media(query: str, kind: str = "photos", limit: int = 3) -> list[Path]:
    api_key = os.environ.get("PEXELS_API_KEY", "").strip()
    if not api_key:
        print("PEXELS_API_KEY is not set in environment. Set it to download Pexels stock photos/videos.")
        return []
    FOOTAGE_USER_DIR.mkdir(parents=True, exist_ok=True)
    if kind == "videos":
        url = f"https://api.pexels.com/videos/search?query={urllib.parse.quote(query)}&per_page={limit}&orientation=portrait"
    else:
        url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(query)}&per_page={limit}&orientation=portrait"
    data = json.loads(http_get(url, headers={"Authorization": api_key}).decode("utf-8"))
    saved = []
    if kind == "videos":
        for v in data.get("videos", []):
            vid_id = v.get("id")
            files = v.get("video_files", [])
            if files:
                best = sorted(files, key=lambda x: abs((x.get("width") or 0) - 720))[0]
                out = FOOTAGE_USER_DIR / f"pexels_{vid_id}.mp4"
                out.write_bytes(http_get(best["link"], timeout=45))
                saved.append(out)
    else:
        for p in data.get("photos", []):
            pid = p.get("id")
            src = p.get("src", {}).get("large2x") or p.get("src", {}).get("original")
            if src:
                out = FOOTAGE_USER_DIR / f"pexels_{pid}.jpg"
                out.write_bytes(http_get(src, timeout=30))
                saved.append(out)
    return saved


def main() -> None:
    parser = argparse.ArgumentParser(description="Search & download icons, 3D assets, stock media, and design style specs.")
    parser.add_argument("--search-icon", help="Search 200,000+ vector icons on Iconify by keyword")
    parser.add_argument("--download-icon", nargs="+", help="Download one or more Iconify SVGs (e.g. solar:rocket-2-bold-duotone)")
    parser.add_argument("--download-3d", nargs="+", help="Download Fluent 3D Emoji PNGs by folder name (e.g. 'Rocket' 'Fire')")
    parser.add_argument("--list-styles", action="store_true", help="List all 67 Design Systems and UI/UX Pro Max styles")
    parser.add_argument("--search-style", help="Search design styles, palettes, typography, and motion rules by keyword")
    parser.add_argument("--pexels", help="Download portrait stock photos/videos from Pexels (requires PEXELS_API_KEY)")
    parser.add_argument("--pexels-kind", choices=["photos", "videos"], default="photos")
    args = parser.parse_args()

    if args.search_icon:
        icons = search_iconify(args.search_icon)
        print(f"Found {len(icons)} icons for '{args.search_icon}':")
        for ic in icons:
            print(" ", ic)

    if args.download_icon:
        for ic in args.download_icon:
            p = download_iconify_svg(ic)
            print("Saved SVG:", p)

    if args.download_3d:
        for name in args.download_3d:
            p = download_fluent_3d(name)
            print("Saved 3D PNG:", p)

    if args.list_styles:
        list_design_styles()

    if args.search_style:
        search_design_knowledge(args.search_style)

    if args.pexels:
        files = download_pexels_media(args.pexels, kind=args.pexels_kind)
        for f in files:
            print("Saved Pexels media:", f)


if __name__ == "__main__":
    main()
