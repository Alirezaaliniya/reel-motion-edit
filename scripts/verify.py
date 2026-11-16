"""Check technical delivery. Visual, editorial and listening review remain manual."""
import argparse
import json
import subprocess
from pathlib import Path


def probe(path):
    return json.loads(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)]
    ))


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("video", type=Path)
    ap.add_argument("--cover", type=Path)
    ap.add_argument("--post", type=Path)
    ap.add_argument("--instagram", action="store_true", help="require the complete release package")
    ap.add_argument("--duration", type=float, help="expected duration in seconds")
    a = ap.parse_args()
    try:
        data = probe(a.video)
        v = next(s for s in data["streams"] if s["codec_type"] == "video")
        audio = next(s for s in data["streams"] if s["codec_type"] == "audio")
        duration = float(data["format"]["duration"])
        assert duration > 0
    except (OSError, subprocess.CalledProcessError, KeyError, StopIteration, ValueError, AssertionError):
        ap.error("could not verify a valid video stream, audio stream and duration")
    if a.duration is not None and abs(duration - a.duration) > 0.15:
        ap.error(f"duration mismatch: got {duration:.3f}s, expected {a.duration:.3f}s")
    if a.instagram:
        if a.video.suffix.lower() != ".mp4" or (v["width"], v["height"], v["codec_name"], v.get("pix_fmt"), audio["codec_name"]) != (1080, 1920, "h264", "yuv420p", "aac"):
            ap.error("expected project release profile: MP4, 1080x1920, H.264 yuv420p and AAC")
        if not (a.cover and a.post):
            ap.error("--instagram requires --cover and --post")
    if a.cover:
        try:
            image = next(s for s in probe(a.cover)["streams"] if s["codec_type"] == "video")
            if image["width"] * 16 != image["height"] * 9 or image["codec_name"] not in ("mjpeg", "png"):
                ap.error("expected a 9:16 JPG or PNG cover master")
        except (OSError, subprocess.CalledProcessError, StopIteration, KeyError, ValueError):
            ap.error("could not read cover")
    if a.post:
        try:
            if not a.post.read_text(encoding="utf-8-sig").strip():
                ap.error("post text is empty")
        except (OSError, UnicodeError):
            ap.error("could not read UTF-8 post text")
    print(f"Pass: {v['width']}x{v['height']} {v['codec_name']}, {audio['codec_name']} audio, {duration:.2f}s")
    print("Manual review: mobile framing, cover text/crops, RTL and sync, speech and music balance.")


if __name__ == "__main__":
    main()
