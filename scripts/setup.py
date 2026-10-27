"""Checks and installs everything the reel-motion-edit pipeline needs.

usage: python setup.py [--model large-v3-turbo] [--skip-model]

Creates ~/.cache/reel-motion-edit/ with:
  node/       puppeteer-core + gsap (npm)
  sfx/        synthesized sound-effect library (via sfx.py)
Downloads the faster-whisper model into the normal Hugging Face cache, falling
back to hf-mirror.com when huggingface.co is unreachable. Prints a JSON summary
on the last line so the caller can read paths from it.
"""
import argparse, json, os, shutil, subprocess, sys, importlib.util
from pathlib import Path

HERE = Path(__file__).resolve().parent
CACHE = Path.home() / ".cache" / "reel-motion-edit"
CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
]


def log(*a):
    print("[setup]", *a, flush=True)


def need(cmd):
    p = shutil.which(cmd)
    if not p:
        sys.exit(f"[setup] missing required tool: {cmd} (install it and re-run)")
    return p


def ensure_pip(pkg, mod=None):
    if importlib.util.find_spec(mod or pkg) is None:
        log(f"pip install {pkg}")
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", pkg], check=True)


def ensure_node():
    nd = CACHE / "node"
    nd.mkdir(parents=True, exist_ok=True)
    if not (nd / "node_modules" / "puppeteer-core").exists() or not (nd / "node_modules" / "gsap").exists():
        log("npm install puppeteer-core gsap (no bundled browser download)")
        if not (nd / "package.json").exists():
            (nd / "package.json").write_text('{"name":"rme-cache","private":true}')
        npm = shutil.which("npm") or shutil.which("npm.cmd")
        subprocess.run([npm, "i", "--no-audit", "--no-fund", "puppeteer-core@23.11.1", "gsap@3.12.5"],
                       cwd=nd, check=True, shell=os.name == "nt")
    return nd


def find_browser():
    for c in CHROME_CANDIDATES:
        if os.path.exists(c):
            return c
    for name in ("google-chrome", "chromium", "chrome", "msedge"):
        p = shutil.which(name)
        if p:
            return p
    sys.exit("[setup] no Chrome/Edge found — install Google Chrome")


def ensure_model(name):
    """Download the faster-whisper model; retry through the mirror on failure."""
    from faster_whisper.utils import download_model
    os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
    last = None
    for endpoint in (None, "https://hf-mirror.com"):
        if endpoint:
            os.environ["HF_ENDPOINT"] = endpoint
            log("retrying via", endpoint)
        for attempt in range(3):  # resumable — partial files are kept between attempts
            try:
                path = download_model(name)
                return path
            except Exception as e:  # network drops are common on big downloads
                last = e
                log(f"model download attempt {attempt + 1} failed: {type(e).__name__}: {e}")
    sys.exit(f"[setup] could not download whisper model {name}: {last}")


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="large-v3-turbo")
    ap.add_argument("--skip-model", action="store_true")
    a = ap.parse_args()

    CACHE.mkdir(parents=True, exist_ok=True)
    ff = need("ffmpeg"); need("ffprobe"); need("node")
    ensure_pip("numpy")
    ensure_pip("faster-whisper", "faster_whisper")
    nd = ensure_node()
    browser = find_browser()

    sfx_dir = CACHE / "sfx"
    if not (sfx_dir / "whoosh.wav").exists() or (HERE / "sfx.py").stat().st_mtime > (sfx_dir / "whoosh.wav").stat().st_mtime:
        log("synthesizing SFX library")
        subprocess.run([sys.executable, str(HERE / "sfx.py"), str(sfx_dir)], check=True)

    model = None
    if not a.skip_model:
        log(f"ensuring whisper model {a.model} (≈1.6 GB on first run)")
        model = ensure_model(a.model)

    print(json.dumps({"cache": str(CACHE), "node_modules": str(nd / "node_modules"), "browser": browser,
                      "sfx": str(sfx_dir), "ffmpeg": ff, "model": model}, ensure_ascii=False))


if __name__ == "__main__":
    main()
