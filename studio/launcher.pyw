#!/usr/bin/env python3
"""
Reel Motion Studio — Smart Silent Desktop Launcher
- Checks if the Studio server is already running on http://127.0.0.1:8765 (no duplicate port errors).
- If not running, starts `studio/server.py` silently in the background (no black CMD window).
- Waits until `/api/health` responds 200 OK.
- Opens the Studio in a clean native-like app window (Edge/Chrome `--app=` mode) or falls back to default browser.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SERVER_SCRIPT = ROOT / "studio" / "server.py"
PORT = int(os.environ.get("STUDIO_PORT", "8765"))
URL = f"http://127.0.0.1:{PORT}"
HEALTH_URL = f"{URL}/api/health"


def is_server_alive() -> bool:
    try:
        with urllib.request.urlopen(HEALTH_URL, timeout=1.0) as r:
            return r.status == 200
    except Exception:
        return False


def start_server_silently() -> None:
    pythonw = Path(sys.executable).with_name("pythonw.exe")
    exe = str(pythonw) if pythonw.exists() else sys.executable
    flags = 0
    if os.name == "nt":
        flags = subprocess.CREATE_NO_WINDOW | subprocess.DETACHED_PROCESS
    subprocess.Popen(
        [exe, str(SERVER_SCRIPT)],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=flags,
    )


def open_app_window() -> None:
    browsers = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    for b in browsers:
        if os.path.exists(b):
            subprocess.Popen([b, f"--app={URL}"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return
    webbrowser.open(URL)


def main() -> None:
    if not is_server_alive():
        start_server_silently()
        for _ in range(40):
            if is_server_alive():
                break
            time.sleep(0.25)
    open_app_window()


if __name__ == "__main__":
    main()
