"""Final composite: camera moves on the source video + overlay.mov + SFX bed (+ optional music).

usage: python compose.py <plan.json> [--out final.mp4] [--crf 18] [--no-loudnorm]

Reads build/plan.resolved.json, build/sfx.json and build/overlay.mov written by render.js.
- camera: [{t, d, type: punch|zoom|shake, scale, cx, cy, amp}] — moves the *video* only
  (overlay stays put), via ffmpeg perspective with sub-pixel interpolation.
- SFX are summed in numpy into build/sfx_track.wav (gain per event in dB, relative to -4 dB).
- music: {file, db:-20, duck:true} is looped/trimmed and ducked under the voice.
- voice: "enhance" (or --voice enhance) cleans the voice: rumble cut, denoise, presence boost, gentle compression.
- grade: the colour grade resolved by render.js (P.gradeFilter, from plan.grade / the style) is applied to the
  footage before the graphics, in both modes.
- plan.sfxMix.duck: true ducks the SFX bed under the voice (sidechain). Off by default: the user wants the
  effects at their normal level.
- cutaway elements with bg "blur" blur + darken the footage for their time range.
- loudness is normalized to -14 LUFS / -1.5 dBTP (Instagram/TikTok target).
- mode "explainer": the picture is build/bg.png + footage windows (elements of type "footage", the source
  video cropped into their rect with rounded corners) + overlay.mov; the source only supplies the voice
  (it may be an audio file). Camera moves were already applied inside the overlay by the engine.
"""
import argparse, sys, json, subprocess, wave
from pathlib import Path
import numpy as np

SR = 44100
SFX_DIR = Path.home() / ".cache" / "reel-motion-edit" / "sfx"


def read_wav(p):
    with wave.open(str(p)) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        return a.reshape(-1, w.getnchannels())


def sfx_track(events, dur, out):
    buf = np.zeros((int(SR * (dur + 2)), 2), np.float32)
    cache = {}
    for e in events:
        name = e["name"]
        if name not in cache:
            p = SFX_DIR / f"{name}.wav"
            if not p.exists():
                p = Path(name)  # allow a custom file path as the name
            cache[name] = read_wav(p)
        s = cache[name] * (10 ** ((e.get("db", 0) - 4) / 20))
        i = int(max(0, e["t"]) * SR); j = min(len(buf), i + len(s))
        buf[i:j] += s[: j - i]
    buf = buf[: int(SR * dur)]
    peak = np.abs(buf).max()
    if peak > 0.98:
        buf *= 0.98 / peak
    with wave.open(str(out), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((buf * 32767).astype(np.int16).tobytes())


def smooth(u):
    u = f"clip({u},0,1)"
    return f"({u}*{u}*(3-2*{u}))"


def camera_filter(moves, W, H, fps):
    """perspective (sense=source) maps a moving source rectangle onto the full frame."""
    if not moves:
        return None
    T = f"(in/{fps})"
    zs, cxs, cys, dxs, dys = ["1"], [f"{W/2}"], [f"{H/2}"], ["0"], ["0"]
    for m in moves:
        t0, d = m["t"], m.get("d", 1.0)
        typ = m.get("type", "punch")
        rin, rout = {"punch": (0.001, 0.25), "zoom": (0.45, 0.45), "shake": (0.001, 0.15)}[typ]
        env = f"min({smooth(f'({T}-{t0})/{rin}')},{smooth(f'({t0 + d + rout}-{T})/{rout}')})*between({T},{t0},{t0 + d + rout})"
        if typ in ("punch", "zoom"):
            s = m.get("scale", 1.15)
            zs.append(f"{s - 1}*{env}")
            cxs.append(f"{m.get('cx', W / 2) - W / 2}*{env}")
            cys.append(f"{m.get('cy', H / 2) - H / 2}*{env}")
        else:
            a = m.get("amp", 14)
            zs.append(f"{0.04}*{env}")
            dxs.append(f"{a}*{env}*sin({T}*71)")
            dys.append(f"{a}*{env}*cos({T}*53)")
    Z, CX, CY = "+".join(zs), "+".join(cxs), "+".join(cys)
    DX, DY = "+".join(dxs), "+".join(dys)
    hw, hh = f"({W}/2/({Z}))", f"({H}/2/({Z}))"
    # clamp the window inside the frame
    cx = f"clip({CX}+{DX},{hw},{W}-{hw})"; cy = f"clip({CY}+{DY},{hh},{H}-{hh})"
    x0, x1, y0, y1 = f"{cx}-{hw}", f"{cx}+{hw}", f"{cy}-{hh}", f"{cy}+{hh}"
    q = lambda e: "'" + e.replace("'", "") + "'"
    return (f"perspective=x0={q(x0)}:y0={q(y0)}:x1={q(x1)}:y1={q(y0)}:x2={q(x0)}:y2={q(y1)}:x3={q(x1)}:y3={q(y1)}"
            f":interpolation=cubic:sense=source:eval=frame")


def has_stream(path, kind):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", kind[0], "-show_entries", "stream=codec_type", "-of", "csv=p=0", path],
                       capture_output=True, text=True)
    return kind in r.stdout


def round_mask(w, h, r, out):
    """white rounded rectangle on black: the alpha matte of a footage window"""
    r = max(0, min(r, w // 2, h // 2))
    e = (f"if(lte(hypot(max(0,max({r}-X,X-({w - 1 - r}))),max(0,max({r}-Y,Y-({h - 1 - r})))),{r}),255,0)") if r else "255"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=black:s={w}x{h}", "-vf", f"format=gray,geq=lum='{e}'",
                    "-frames:v", "1", str(out)], check=True)


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser()
    ap.add_argument("plan"); ap.add_argument("--out"); ap.add_argument("--crf", default="18")
    ap.add_argument("--no-loudnorm", action="store_true")
    ap.add_argument("--voice", choices=["raw", "enhance"], help="override plan.voice")
    a = ap.parse_args()
    pd = Path(a.plan).resolve().parent; b = pd / "build"
    P = json.loads((b / "plan.resolved.json").read_text(encoding="utf-8"))
    ev = json.loads((b / "sfx.json").read_text(encoding="utf-8"))
    video = P["video"] if Path(P["video"]).is_absolute() else str(pd / P["video"])
    W, H = P.get("size", [1080, 1920]); fps = P.get("fps", 30); dur = P["duration"]
    out = a.out or str(Path(video).with_name(Path(video).stem + " - edit.mp4"))

    sfx_track(ev, dur, b / "sfx_track.wav")
    inputs = ["-i", video, "-i", str(b / "overlay.mov"), "-i", str(b / "sfx_track.wav")]
    grade = ("," + P["gradeFilter"]) if P.get("gradeFilter") else ""
    if P.get("mode") == "explainer":
        # base = style background still; footage windows from the source video; graphics on top
        inputs += ["-loop", "1", "-framerate", str(fps), "-i", str(b / "bg.png")]
        fc = [f"[3:v]trim=duration={dur},setsar=1,format=yuv420p[base0]"]
        last, k = "[base0]", 0
        wins = [e for e in P.get("elements", []) if e.get("type") == "footage"]
        if wins and not has_stream(video, "video"):
            print("warning: footage windows skipped, the source has no picture"); wins = []
        for i, e in enumerate(wins):
            x, y, w, h = [int(round(v)) for v in e["rect"]]
            t0, d = float(e["t"]), float(e["d"]); src = float(e.get("src", t0))
            mask = b / f"mask_{i}.png"; round_mask(w, h, int(e.get("radius", 36)), mask)
            inputs += ["-loop", "1", "-framerate", str(fps), "-i", str(mask)]
            mi = 4 + i
            fc.append(f"[0:v]trim=start={src}:duration={d},setpts=PTS-STARTPTS+{t0}/TB,"
                      f"scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,crop={w}:{h},setsar=1{grade},format=yuva420p[fv{i}]")
            fc.append(f"[{mi}:v]format=gray,trim=duration={dur},setpts=PTS-STARTPTS[mk{i}]")
            fc.append(f"[fv{i}][mk{i}]alphamerge,fade=t=in:st={t0}:d=0.3:alpha=1,fade=t=out:st={t0 + d - 0.3}:d=0.3:alpha=1[fw{i}]")
            fc.append(f"{last}[fw{i}]overlay={x}:{y}:eof_action=pass:repeatlast=0[base{i + 1}]")
            last = f"[base{i + 1}]"
        fc.append(f"{last}[1:v]overlay=0:0:format=auto,format=yuv420p[v]")
    else:
        cam = camera_filter(P.get("camera"), W, H, fps)
        # sources that aren't plan-sized (e.g. 608x1080 phone exports) are upscaled/cropped to fill the frame
        blur = "".join(f",boxblur=26:3:enable='between(t,{e['t']},{e['t'] + e['d']})',eq=brightness=-0.12:enable='between(t,{e['t']},{e['t'] + e['d']})'"
                       for e in P.get("elements", []) if e.get("type") == "cutaway" and e.get("bg") == "blur")
        fit = f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},setsar=1{grade}{blur}"
        v = f"[0:v]{fit},{cam},format=yuv420p[cv];[cv][1:v]" if cam else f"[0:v]{fit}[cv];[cv][1:v]"
        fc = [f"{v}overlay=0:0:format=auto,format=yuv420p[v]"]
    # voice: untouched by default; "enhance" = rumble cut, denoise, presence, gentle compression
    voice = "aresample=44100,aformat=channel_layouts=stereo"
    if (a.voice or P.get("voice")) == "enhance":
        voice += (",highpass=f=80,afftdn=nf=-25:tn=1,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=2.5"
                  ",acompressor=threshold=-20dB:ratio=3:attack=8:release=160:makeup=2")
    mix = [f"[0:a]{voice}[voice]"]
    if (P.get("sfxMix") or {}).get("duck", False):
        # the voice keys a compressor on the SFX bed: effects dip while he talks, come back in the gaps
        mix += ["[voice]asplit[voice][vk]", "[2:a][vk]sidechaincompress=threshold=0.02:ratio=4:attack=10:release=300:makeup=1[fx]"]
    else:
        mix.append("[2:a]anull[fx]")
    labels = "[voice][fx]"
    mu = P.get("music")
    if mu:
        mi = len([x for x in inputs if x == "-i"])
        inputs += ["-stream_loop", "-1", "-i", mu["file"]]
        mix.append(f"[{mi}:a]aresample=44100,aformat=channel_layouts=stereo,volume={mu.get('db', -20)}dB,afade=t=out:st={dur - 1.5}:d=1.5[mraw]")
        if mu.get("duck", True):
            mix.append("[voice]asplit[voice][vkey]")
            mix.append("[mraw][vkey]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=350[mus]")
        else:
            mix.append("[mraw]anull[mus]")
        labels += "[mus]"
    n = labels.count("[")
    tail = "alimiter=limit=0.95" if a.no_loudnorm else "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100"
    mix.append(f"{labels}amix=inputs={n}:normalize=0:duration=first,{tail}[a]")
    fc += mix
    # camera expressions get long; a script file avoids the Windows 32k command-line limit
    (b / "filtergraph.txt").write_text(";".join(fc), encoding="utf-8")
    cmd = ["ffmpeg", "-v", "error", "-y", *inputs, "-/filter_complex", str(b / "filtergraph.txt"), "-map", "[v]", "-map", "[a]",
           "-c:v", "libx264", "-preset", "medium", "-crf", a.crf, "-r", str(fps), "-c:a", "aac", "-b:a", "192k",
           "-movflags", "+faststart", "-t", str(dur), out]
    subprocess.run(cmd, check=True)
    print("final →", out, f"({len(ev)} sfx, {len(P.get('camera') or [])} camera moves)")


if __name__ == "__main__":
    main()
