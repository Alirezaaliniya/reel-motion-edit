"""Start a Remotion (3D / 2D) project for one video from templates/remotion.

    python remotion_init.py <workdir> --audio <voice.mp3|video> [--drop 12.56] [--install]

- copies templates/remotion -> <workdir>/remotion (refuses to overwrite an existing one)
- copies the user's fonts (assets/fonts/user: Hasti, Peyda) -> public/pop3d/fonts
- converts the voice to public/audio.mp3 and reads its duration
- synthesizes both music beds with that duration (MUSIC_DUR) and drop (MUSIC_DROP)
- --install runs npm install
Then adapt src/pop3d/timing.ts (DURATION_S, SEGMENTS, T) and the story files: references/remotion-3d.md.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
TPL = SKILL / "templates" / "remotion"
FONTS = SKILL / "assets" / "fonts" / "user"
NEED = ["Hasti/Hasti-Heavy.ttf", "Peyda/PeydaFaNumWeb-Medium.woff2", "Peyda/PeydaFaNumWeb-Bold.woff2",
        "Peyda/PeydaFaNumWeb-ExtraBold.woff2", "Peyda/PeydaFaNumWeb-Black.woff2"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("workdir")
    ap.add_argument("--audio", required=True)
    ap.add_argument("--drop", type=float, default=None, help="seconds of the turning-point word (music drop)")
    ap.add_argument("--install", action="store_true")
    a = ap.parse_args()

    dst = Path(a.workdir) / "remotion"
    if dst.exists():
        sys.exit(f"{dst} already exists; remove it or pick another workdir")
    shutil.copytree(TPL, dst, ignore=shutil.ignore_patterns("node_modules", "build", "out"))

    fdir = dst / "public" / "pop3d" / "fonts"
    fdir.mkdir(parents=True, exist_ok=True)
    missing = []
    for rel in NEED:
        src = FONTS / rel
        if src.exists():
            shutil.copy2(src, fdir / src.name)
        else:
            missing.append(rel)
    if missing:
        print("WARNING missing user fonts (copy them into assets/fonts/user):", ", ".join(missing))

    audio = dst / "public" / "audio.mp3"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.audio, "-vn", "-ac", "2", "-ar", "44100", "-b:a", "192k", str(audio)], check=True)
    pr = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(audio)], capture_output=True, text=True, check=True)
    dur = float(json.loads(pr.stdout)["format"]["duration"])

    env = {**os.environ, "MUSIC_DUR": f"{dur + 0.4:.2f}"}
    if a.drop is not None:
        env["MUSIC_DROP"] = str(a.drop)
    tools = dst / "tools"
    subprocess.run([sys.executable, str(tools / "make_music.py"), str(dst / "public/pop3d/music.wav")], env=env, check=True)
    subprocess.run([sys.executable, str(tools / "make_music_premium.py"), str(dst / "public/pop3d/music_premium.wav"), "premium"], env=env, check=True)

    if a.install:
        subprocess.run("npm install", cwd=dst, shell=True, check=True)

    print(f"remotion project -> {dst}")
    print(f"voice duration {dur:.2f}s -> set DURATION_S = {dur:.2f} in src/pop3d/timing.ts")
    if a.drop is None:
        print("music drop left at the template's 12.56 s: rerun the music tools with MUSIC_DROP=<turning point>")


if __name__ == "__main__":
    main()
