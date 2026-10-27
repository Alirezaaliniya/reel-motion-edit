"""Analyzes a source video so overlays and SFX can be timed to real events.

usage: python analyze.py <video> <workdir> [--lang fa] [--model large-v3-turbo] [--step 0.5] [--force]

Writes into <workdir>/analysis/:
  info.json        width/height/fps/duration
  audio.wav        16 kHz mono (for whisper)
  transcript.json  [{start,end,text,words:[{s,e,w}]}]  — word-level timing
  transcript.txt   human-readable, one line per word group with timestamps
  motion.json      per-0.1s visual change + detected events (cuts, motion bursts)
  silence.json     [[start,end],...] pauses in the voice
  sheets/sheet_<start>.jpg  timestamped contact sheets (10 s each, <step> s per cell)
"""
import argparse, json, os, subprocess, sys
from pathlib import Path
import numpy as np


def run(cmd, **k):
    return subprocess.run(cmd, check=True, capture_output=True, **k)


def probe(video):
    out = run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", video]).stdout
    j = json.loads(out)
    v = next(s for s in j["streams"] if s["codec_type"] == "video")
    num, den = map(int, v["r_frame_rate"].split("/"))
    return {"width": int(v["width"]), "height": int(v["height"]), "fps": round(num / den, 3),
            "duration": float(j["format"]["duration"]),
            "has_audio": any(s["codec_type"] == "audio" for s in j["streams"])}


def label_font():
    for p in [r"C:\Windows\Fonts\arial.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        if os.path.exists(p):
            return p.replace("\\", "/").replace(":", "\\:")
    return None


def sheets(video, out, dur, step):
    out.mkdir(parents=True, exist_ok=True)
    f = label_font()
    per = int(round(10 / step)); cols = min(per, 10); rows = -(-per // cols)
    dt = (f"drawtext=fontfile='{f}':" if f else "drawtext=") + \
        "text='%{pts\\:hms}':fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.7:x=4:y=4"
    for s in np.arange(0, dur, 10):
        name = out / f"sheet_{int(s):03d}.jpg"
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{s}", "-copyts", "-t", "10", "-i", video,
             "-vf", f"fps=1/{step},scale=200:-1,{dt},tile={cols}x{rows}:padding=4", "-frames:v", "1", str(name)])


def motion(video, dur, fps_s=10):
    w, h = 48, 85
    raw = run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"fps={fps_s},scale={w}:{h},format=gray",
               "-f", "rawvideo", "-"]).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
    d = np.concatenate([[0], np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))])
    med = float(np.median(d)) + 1e-3
    ev = []
    for i in range(1, len(d) - 1):
        if d[i] >= d[i - 1] and d[i] >= d[i + 1] and d[i] > max(6 * med, 4):
            kind = "cut" if d[i] > 25 else "change"
            ev.append({"t": round(i / fps_s, 2), "kind": kind, "score": round(float(d[i]), 1)})
    # merge peaks closer than 0.3 s (keep strongest)
    merged = []
    for e in ev:
        if merged and e["t"] - merged[-1]["t"] < 0.3:
            if e["score"] > merged[-1]["score"]:
                merged[-1] = e
        else:
            merged.append(e)
    for k, e in enumerate(merged):
        e["id"] = f"m{k}"
    return {"rate": fps_s, "diff": [round(float(x), 2) for x in d], "events": merged}


def silences(wav):
    p = subprocess.run(["ffmpeg", "-i", str(wav), "-af", "silencedetect=n=-35dB:d=0.35", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="ignore")
    st, out = None, []
    for line in p.stderr.splitlines():
        if "silence_start" in line:
            st = float(line.split("silence_start:")[1])
        elif "silence_end" in line and st is not None:
            out.append([round(st, 2), round(float(line.split("silence_end:")[1].split("|")[0]), 2)]); st = None
    return out


def transcribe(wav, lang, model_name):
    os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
    from faster_whisper import WhisperModel
    import wave
    # pass samples, not a path: faster-whisper's PyAV decoder breaks across av versions
    with wave.open(str(wav)) as w:
        wav = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    try:
        m = WhisperModel(model_name, device="cuda", compute_type="float16")
        segs, _ = m.transcribe(wav, language=lang, word_timestamps=True, vad_filter=True)
        segs = list(segs)
    except Exception:
        m = WhisperModel(model_name, device="cpu", compute_type="int8")
        segs, _ = m.transcribe(wav, language=lang, word_timestamps=True, vad_filter=True)
        segs = list(segs)
    return [{"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
             "words": [{"s": round(w.start, 2), "e": round(w.end, 2), "w": w.word.strip()} for w in s.words]}
            for s in segs]


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("workdir")
    ap.add_argument("--lang", default="fa"); ap.add_argument("--model", default="large-v3-turbo")
    ap.add_argument("--step", type=float, default=0.5); ap.add_argument("--force", action="store_true")
    ap.add_argument("--no-transcript", action="store_true")
    a = ap.parse_args()

    out = Path(a.workdir) / "analysis"; out.mkdir(parents=True, exist_ok=True)
    info = probe(a.video); (out / "info.json").write_text(json.dumps(info, indent=1))
    print("info:", info, flush=True)

    print("contact sheets…", flush=True); sheets(a.video, out / "sheets", info["duration"], a.step)
    print("motion…", flush=True)
    mo = motion(a.video, info["duration"]); (out / "motion.json").write_text(json.dumps(mo))
    for e in mo["events"]:
        print(f'  {e["id"]:>4} {e["t"]:7.2f}s {e["kind"]:<6} {e["score"]}')

    if info["has_audio"]:
        wav = out / "audio.wav"
        if a.force or not wav.exists():
            run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-ac", "1", "-ar", "16000", str(wav)])
        sil = silences(wav); (out / "silence.json").write_text(json.dumps(sil))
        tj = out / "transcript.json"
        if not a.no_transcript and (a.force or not tj.exists()):
            print(f"transcribing with {a.model}…", flush=True)
            segs = transcribe(wav, a.lang, a.model)
            tj.write_text(json.dumps(segs, ensure_ascii=False, indent=1), encoding="utf-8")
        if tj.exists():
            segs = json.loads(tj.read_text(encoding="utf-8"))
            lines = []
            for s in segs:
                lines.append(f'[{s["start"]:6.2f}–{s["end"]:6.2f}] {s["text"]}')
                lines.append("    " + "  ".join(f'{w["s"]:.2f}:{w["w"]}' for w in s["words"]))
            (out / "transcript.txt").write_text("\n".join(lines), encoding="utf-8")
            print("\n".join(lines))
    print("done →", out)


if __name__ == "__main__":
    main()
