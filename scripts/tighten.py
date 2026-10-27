"""Jump-cut long pauses out of a video BEFORE analysis (talking-head pacing).

usage: python tighten.py <video> <out.mp4> [--min-gap 0.45] [--keep 0.12] [--db -35] [--dry-run]

Pauses longer than --min-gap are shortened to --keep seconds of silence on each side of the cut.
Writes <out>.cuts.json (kept segments, in source time) so later steps can map times if needed.
Run analyze.py on the tightened file afterwards: all transcript / motion times then refer to it.

Caution: on screen recordings, silent stretches are often where the clicking happens. Use
--dry-run to see what would be cut, and prefer it for talking-head sections.
"""
import argparse, json, subprocess, sys
from pathlib import Path


def silences(video, db, min_gap):
    p = subprocess.run(["ffmpeg", "-i", video, "-af", f"silencedetect=n={db}dB:d={min_gap}", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="ignore")
    out, st = [], None
    for line in p.stderr.splitlines():
        if "silence_start" in line:
            st = float(line.split("silence_start:")[1])
        elif "silence_end" in line and st is not None:
            out.append((max(0.0, st), float(line.split("silence_end:")[1].split("|")[0]))); st = None
    return out


def duration(video):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video],
                                capture_output=True, text=True).stdout.strip())


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("out")
    ap.add_argument("--min-gap", type=float, default=0.45); ap.add_argument("--keep", type=float, default=0.12)
    ap.add_argument("--db", type=float, default=-35); ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    dur = duration(a.video)
    keep, cur = [], 0.0
    for s, e in silences(a.video, a.db, a.min_gap):
        cut_s, cut_e = s + a.keep, e - a.keep
        if cut_e - cut_s > 0.05:
            keep.append((round(cur, 3), round(cut_s, 3))); cur = cut_e
    keep.append((round(cur, 3), round(dur, 3)))
    keep = [(s, e) for s, e in keep if e - s > 0.04]
    removed = dur - sum(e - s for s, e in keep)
    for s, e in keep:
        print(f"keep {s:7.2f} – {e:7.2f}")
    print(f"{len(keep) - 1} cuts, {removed:.2f}s removed ({dur:.2f}s → {dur - removed:.2f}s)")
    if a.dry_run or len(keep) == 1:
        return

    # trim/atrim per kept segment + concat keeps audio and video cut at the same points
    # (aselect doesn't reliably drop audio frames)
    parts, labels = [], ""
    for i, (s, e) in enumerate(keep):
        parts.append(f"[0:v]trim={s}:{e},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={s}:{e},asetpts=PTS-STARTPTS[a{i}]")
        labels += f"[v{i}][a{i}]"
    out = Path(a.out)
    script = out.with_suffix(".filter.txt")
    script.write_text(";".join(parts) + f";{labels}concat=n={len(keep)}:v=1:a=1[v][a]", encoding="utf-8")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-/filter_complex", str(script), "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-c:a", "aac", "-b:a", "192k", str(out)], check=True)
    out.with_suffix(".cuts.json").write_text(json.dumps({"source": a.video, "keep": keep}, indent=1))
    print("tightened →", out)


if __name__ == "__main__":
    main()
