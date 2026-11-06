"""Cut a video BEFORE analysis: jump-cut long pauses and/or remove the parts the user asks for.

usage: python tighten.py <video> <out.mp4> [--min-gap 0.45] [--keep 0.12] [--db -35] [--dry-run]
                         [--cut "12.4-15.0,40-42.5"] [--only "0-58"] [--no-pauses] [--xfade 0.04]

  --cut      remove these source ranges (mistakes, retakes, off-topic bits, dead intro/outro)
  --only     keep only these source ranges (everything else is dropped)
  --no-pauses  apply only --cut/--only, don't trim silences
  --xfade    short audio fade at every join so cuts don't click (seconds, 0 = off)

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


def ranges(spec):
    out = []
    for part in filter(None, (p.strip() for p in spec.split(","))):
        s, e = part.split("-"); out.append((float(s), float(e)))
    return out


def merge(rs, dur):
    rs = sorted((max(0.0, s), min(dur, e)) for s, e in rs if e > s)
    out = []
    for s, e in rs:
        if out and s <= out[-1][1]: out[-1] = (out[-1][0], max(out[-1][1], e))
        else: out.append((s, e))
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
    ap.add_argument("--cut", default=""); ap.add_argument("--only", default="")
    ap.add_argument("--no-pauses", action="store_true"); ap.add_argument("--xfade", type=float, default=0.04)
    a = ap.parse_args()

    dur = duration(a.video)
    removed_ranges = [] if a.no_pauses else [(s + a.keep, e - a.keep) for s, e in silences(a.video, a.db, a.min_gap)
                                             if (e - a.keep) - (s + a.keep) > 0.05]
    removed_ranges += ranges(a.cut)
    if a.only:  # everything outside the --only ranges is removed
        cur = 0.0
        for s, e in sorted(ranges(a.only)):
            removed_ranges.append((cur, s)); cur = e
        removed_ranges.append((cur, dur))
    keep, cur = [], 0.0
    for s, e in merge(removed_ranges, dur):
        keep.append((round(cur, 3), round(s, 3))); cur = e
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
    # audio-only voice-overs (explainer mode) are cut the same way without a picture; write e.g. out.m4a/.wav
    vid = "video" in subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=codec_type", "-of", "csv=p=0", a.video],
                                    capture_output=True, text=True).stdout
    def fade(i, ln):  # tiny fades at the joins kill the click of a hard audio cut
        f = min(a.xfade, ln / 4)
        if f <= 0: return ""
        return (f",afade=t=in:d={f}" if i else "") + (f",afade=t=out:st={ln - f:.3f}:d={f}" if i < len(keep) - 1 else "")
    parts, labels = [], ""
    for i, (s, e) in enumerate(keep):
        parts.append((f"[0:v]trim={s}:{e},setpts=PTS-STARTPTS[v{i}];" if vid else "") + f"[0:a]atrim={s}:{e},asetpts=PTS-STARTPTS{fade(i, e - s)}[a{i}]")
        labels += (f"[v{i}]" if vid else "") + f"[a{i}]"
    out = Path(a.out)
    script = out.with_suffix(".filter.txt")
    script.write_text(";".join(parts) + f";{labels}concat=n={len(keep)}:v={int(vid)}:a=1" + ("[v][a]" if vid else "[a]"), encoding="utf-8")
    vmap = ["-map", "[v]", "-c:v", "libx264", "-crf", "16", "-preset", "medium"] if vid else []
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-/filter_complex", str(script), *vmap, "-map", "[a]",
                    *(["-c:a", "aac", "-b:a", "192k"] if out.suffix.lower() not in (".wav",) else []), str(out)], check=True)
    out.with_suffix(".cuts.json").write_text(json.dumps({"source": a.video, "keep": keep}, indent=1))
    print("tightened →", out)


if __name__ == "__main__":
    main()
