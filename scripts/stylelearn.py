#!/usr/bin/env python3
"""Extract visual DNA from reference video(s) so a bespoke style preset can be authored.

For each input video it produces, in --out (default: <video dir>/<name>_style_dna/ or --out):
  sheet_<n>.jpg     contact sheet (6x6 tiles, timestamped) — READ it, then design against it
  dna_<n>.json      measured DNA: palette, background luminance, cut rhythm, size, duration
  dna.json          merged summary of all inputs

Uses only ffmpeg/ffprobe + the standard library.

Usage:
  python stylelearn.py "ref1.mp4" "ref2.mp4" [--out DIR] [--frames 24] [--cut-th 0.28]
"""
import argparse, json, os, re, subprocess, sys, statistics as st

def run(cmd, raw=False):
    return subprocess.run(cmd, capture_output=True, **({} if raw else {"text": True, "encoding": "utf-8", "errors": "replace"}))

def probe(path):
    r = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
             "stream=width,height,r_frame_rate:format=duration", "-of", "json", path])
    d = json.loads(r.stdout or "{}")
    s = (d.get("streams") or [{}])[0]
    num, _, den = (s.get("r_frame_rate") or "30/1").partition("/")
    fps = float(num) / float(den or 1)
    return {"w": s.get("width"), "h": s.get("height"), "fps": round(fps, 2),
            "duration": float((d.get("format") or {}).get("duration") or 0)}

def hexc(rgb):
    return "#%02X%02X%02X" % rgb

def lum(rgb):
    r, g, b = [v / 255 for v in rgb]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def palette(path, dur, frames):
    """Sample frames, quantize to a coarse grid, rank colors. Returns [{hex, share, lum}]."""
    picks = [dur * f / (frames + 1) for f in range(1, frames + 1)]
    counts = {}
    for t in picks:
        r = run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", path, "-frames:v", "1",
                 "-vf", "scale=3:3", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], raw=True)
        px = r.stdout
        if not px:
            continue
        px = px[:27]
        for i in range(0, len(px) - 2, 3):
            q = tuple(v - v % 16 + 8 for v in px[i:i + 3])  # 16-level quantization
            counts[q] = counts.get(q, 0) + 1
    total = sum(counts.values()) or 1
    # merge near-duplicates (manhattan distance <= 48) into clusters
    clusters = []
    for rgb, n in sorted(counts.items(), key=lambda kv: -kv[1]):
        for c in clusters:
            if sum(abs(x - y) for x, y in zip(rgb, c["rgb"])) <= 48:
                w = c["n"] + n
                c["rgb"] = tuple(round((c["rgb"][k] * c["n"] + rgb[k] * n) / w) for k in range(3))
                c["n"] = w
                break
        else:
            clusters.append({"rgb": rgb, "n": n})
    return [{"hex": hexc(c["rgb"]), "share": round(c["n"] / total, 3),
             "lum": round(lum(c["rgb"]), 2)} for c in clusters[:10]]

def cut_rhythm(path, th):
    r = run(["ffmpeg", "-v", "info", "-i", path, "-vf",
             f"select='gt(scene,{th})',showinfo", "-f", "null", "-"])
    times = [float(m.group(1)) for m in
             re.finditer(r"pts_time:([\d.]+)", r.stderr or "") if float(m.group(1)) > 0.4]
    deltas = [b - a for a, b in zip(times, times[1:])]
    if not deltas:
        return {"cuts": 0, "median": None, "pacing": "single-take"}
    q = st.quantiles(deltas, n=4) if len(deltas) >= 4 else [min(deltas), 0, 0, max(deltas)]
    med = st.median(deltas)
    pacing = "fast" if med < 2.2 else "medium" if med < 4.5 else "slow"
    return {"cuts": len(times), "median": round(med, 2), "pacing": pacing,
            "p25": round(q[0], 2), "p75": round(q[2], 2)}

def motion_level(path, dur, pairs=10):
    """Mean abs pixel diff between consecutive sampled 8x8 frames (0..255). Low = scenes hold still."""
    diffs = []
    for i in range(pairs):
        t = dur * (i + 1) / (pairs + 1)
        frames = []
        for tt in (t, t + 0.5):
            r = run(["ffmpeg", "-v", "error", "-ss", f"{tt:.2f}", "-i", path, "-frames:v", "1",
                     "-vf", "scale=8:8", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], raw=True)
            frames.append(r.stdout[:192])
        if len(frames[0]) == 192 == len(frames[1]):
            diffs.append(st.mean(abs(frames[0][k] - frames[1][k]) for k in range(192)))
    return round(st.mean(diffs), 1) if diffs else None  # <8 ≈ static scenes with slow drift

def learn(path, outdir, frames, cut_th, idx):
    base = os.path.splitext(os.path.basename(path))[0]
    info = probe(path)
    dur = info["duration"]
    sheet = os.path.join(outdir, f"sheet_{idx}.jpg")
    run(["ffmpeg", "-y", "-v", "error", "-i", path, "-vf",
         f"fps=1/{max(dur / 36, .5)},scale=240:-1,tile=6x6", sheet])
    dna = {
        "file": os.path.basename(path),
        **{k: info[k] for k in ("w", "h", "fps", "duration")},
        "palette": palette(path, dur, frames),
        "cuts": cut_rhythm(path, cut_th),
        "motion": motion_level(path, dur),
        "sheet": os.path.basename(sheet),
    }
    med = st.median([p["lum"] for p in dna["palette"][:4]]) if dna["palette"] else 0.5
    dna["family"] = "dark" if med < 0.35 else "light" if med > 0.6 else "mid"
    with open(os.path.join(outdir, f"dna_{idx}.json"), "w", encoding="utf-8") as f:
        json.dump(dna, f, ensure_ascii=False, indent=1)
    pal = " ".join(p["hex"] for p in dna["palette"][:6])
    print(f"[{idx}] {base}: {dur:.0f}s {dna['family']} | cuts {dna['cuts']['pacing']}"
          f" ({dna['cuts'].get('median')}s) | motion {dna['motion']} | {pal}")
    return dna

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("inputs", nargs="+")
    ap.add_argument("--out")
    ap.add_argument("--frames", type=int, default=24)
    ap.add_argument("--cut-th", type=float, default=0.28)
    a = ap.parse_args()
    outdir = a.out or os.path.join(os.path.dirname(os.path.abspath(a.inputs[0])), "style_dna")
    os.makedirs(outdir, exist_ok=True)
    all_dna = {}
    for i, p in enumerate(a.inputs, 1):
        if not os.path.isfile(p):
            print(f"skip missing: {p}", file=sys.stderr); continue
        all_dna[os.path.basename(p)] = learn(p, outdir, a.frames, a.cut_th, i)
    with open(os.path.join(outdir, "dna.json"), "w", encoding="utf-8") as f:
        json.dump(all_dna, f, ensure_ascii=False, indent=1)
    print(f"\nDNA + contact sheets -> {outdir}\nNow: READ every sheet, note typography/caption/"
          f"motif/spacing by eye, then author the preset per references/style-dna.md.")

if __name__ == "__main__":
    main()
