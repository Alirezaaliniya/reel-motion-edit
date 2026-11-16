"""Original music beds, synthesized from code (CC0, no samples). Length always matches the video.

usage: python music.py <out.wav|.mp3> --mood calm|upbeat|corporate|tension|cinematic|tech
                       [--dur 42.2] [--drop 12.56] [--seed 7]

moods (pick from the interview's mood / music answers):
  calm       80 BPM  soft pads, bell melody, light kick         serious, premium, warm tutorials
  upbeat     120 BPM pop groove, plucks, claps                 energetic, bold/pop styles
  corporate  100 BPM inspiring piano-like plucks, claps        products, B2B, explainers
  tension    92 BPM  minor, sparse until --drop, then major    problem → solution stories (drop on the turning word)
  cinematic  70 BPM  slow pads, low booms, no drums            lineglow, storytelling
  tech       110 BPM arpeggio, tight hats, sub bass            neon, hud, dev topics
Use it in plan.json as "music": {"file": "music.mp3", "db": -20} (ducked under the voice by compose).
"""
import argparse, os, subprocess, sys, wave
import numpy as np

SR = 44100
MOODS = {
    "calm":      dict(bpm=80,  key=[[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], drums=.35, pluck="bell", hats=0.0, claps=0.0, pad=.07, arp=False, minor_intro=False),
    "upbeat":    dict(bpm=120, key=[[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]], drums=.62, pluck="pluck", hats=.09, claps=.32, pad=.03, arp=False, minor_intro=False),
    "corporate": dict(bpm=100, key=[[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], drums=.45, pluck="pluck", hats=.05, claps=.18, pad=.05, arp=False, minor_intro=False),
    "tension":   dict(bpm=92,  key=[[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]], drums=.38, pluck="bell", hats=.035, claps=.1, pad=.06, arp=False, minor_intro=True),
    "cinematic": dict(bpm=70,  key=[[50, 57, 62], [46, 53, 58], [53, 57, 60], [48, 55, 60]], drums=0.0, pluck="bell", hats=0.0, claps=0.0, pad=.11, arp=False, minor_intro=False),
    "tech":      dict(bpm=110, key=[[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]], drums=.5, pluck="pluck", hats=.08, claps=.12, pad=.03, arp=True, minor_intro=False),
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out"); ap.add_argument("--mood", default="calm", choices=list(MOODS))
    ap.add_argument("--dur", type=float, default=30.0); ap.add_argument("--drop", type=float, default=None)
    ap.add_argument("--seed", type=int, default=7)
    a = ap.parse_args()
    M = MOODS[a.mood]; rng = np.random.default_rng(a.seed)
    DUR = a.dur; N = int(SR * DUR); out = np.zeros((N, 2))
    BEAT = 60 / M["bpm"]; bar = 4 * BEAT
    DROP = a.drop if a.drop is not None else (min(8 * BEAT * 2, DUR * .3) if M["minor_intro"] else 0.0)

    def add(sig, start, gain=1.0, pan=0.0):
        i = int(start * SR)
        if i >= N or i < 0: return
        sig = sig[:N - i]
        out[i:i + len(sig), 0] += sig * gain * np.cos((pan + 1) * np.pi / 4)
        out[i:i + len(sig), 1] += sig * gain * np.sin((pan + 1) * np.pi / 4)

    def kick():
        tt = np.arange(int(.35 * SR)) / SR; f = 50 + 110 * np.exp(-tt * 30)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)

    def clap():
        n = int(.25 * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n)
        b = np.convolve(x, np.ones(3) / 3, "same") - np.convolve(x, np.ones(18) / 18, "same")
        return b * (np.exp(-tt * 22) + .6 * np.exp(-np.maximum(tt - .012, 0) * 30) * (tt > .012)) * .9

    def hat(open_=False):
        n = int((.18 if open_ else .05) * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n)
        return (x - np.convolve(x, np.ones(4) / 4, "same")) * np.exp(-tt * (14 if open_ else 70))

    def note(f, dur, kind):
        n = int(dur * SR); tt = np.arange(n) / SR
        if kind == "pluck": return sum(np.sin(2 * np.pi * f * h * tt) / h ** 1.3 for h in range(1, 6)) * np.exp(-tt * 5.5) * np.minimum(tt / .003, 1)
        if kind == "bass": return (np.sin(2 * np.pi * f * tt) + .35 * np.sin(4 * np.pi * f * tt)) * np.minimum(tt / .01, 1) * np.exp(-tt * 2.2)
        if kind == "pad": return sum(np.sin(2 * np.pi * f * (1 + d) * tt) for d in (-.004, 0, .005)) * np.minimum(tt / .6, 1) * np.clip((dur - tt) / .5, 0, 1) / 3
        if kind == "bell": return np.sin(2 * np.pi * f * tt + 2.2 * np.sin(2 * np.pi * f * 3.5 * tt) * np.exp(-tt * 6)) * np.exp(-tt * 3.2)
        raise ValueError(kind)

    hz = lambda m: 440 * 2 ** ((m - 69) / 12)

    # minor, sparse intro (tension) up to DROP
    b = 0.0; ci = 0
    if M["minor_intro"]:
        prob = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]]
        while b < DROP - .05:
            ch = prob[ci % 4]; L = min(bar, DROP - b)
            for m in ch: add(note(hz(m), L + .4, "pad"), b, .05, rng.uniform(-.4, .4))
            add(note(hz(ch[0] - 24), L, "bass"), b, .18)
            for k in (0, 2):
                if b + k * BEAT < DROP - .1: add(kick() * .55, b + k * BEAT, .5)
            b += bar; ci += 1
        rn = int(1.5 * SR); rt = np.arange(rn) / SR; x = rng.standard_normal(rn)
        add((x - np.convolve(x, np.ones(6) / 6, "same")) * (rt / 1.5) ** 2.2, DROP - 1.5, .14)
        tt = np.arange(int(1.2 * SR)) / SR
        add(np.sin(2 * np.pi * (45 + 60 * np.exp(-tt * 8)) * tt) * np.exp(-tt * 2.5), DROP, .4)
        b = DROP; ci = 0

    step = BEAT / 2; mel = [72, 76, 79, 76, 74, 79, 74, 71, 72, 76, 81, 76, 77, 72, 74, 76]
    while b < DUR:
        ch = M["key"][ci % 4]
        for k in range(4):
            tk = b + k * BEAT
            if M["drums"] and (M["bpm"] >= 90 or k in (0, 2)): add(kick(), tk, M["drums"])
            if M["claps"] and k in (1, 3): add(clap(), tk, M["claps"], .05)
            if M["hats"]:
                add(hat(), tk + BEAT / 2, M["hats"], .35)
                if a.mood in ("upbeat", "tech"): add(hat(), tk + BEAT / 4, M["hats"] * .6, -.3)
        if M["drums"] or a.mood == "cinematic":
            for k in range(8 if M["drums"] else 1):
                add(note(hz(ch[0] - 24), (step * .9) if M["drums"] else bar, "bass"), b + k * step, .18 if M["drums"] else .12)
        if M["arp"]:
            for k in range(16):
                add(note(hz(ch[k % 3] + 12 * (1 + (k // 3) % 2)), .18, "pluck"), b + k * BEAT / 4, .03, (k % 2 - .5) * .6)
        elif a.mood != "cinematic":
            for off in ((0, .75, 1.5, 2.5, 3.0) if M["bpm"] >= 100 else (0, 2)):
                for m in ch: add(note(hz(m + 12), .9 if M["pluck"] == "bell" else .5, M["pluck"]), b + off * BEAT, .025 if M["pluck"] == "bell" else .045, rng.uniform(-.5, .5))
        for m in ch: add(note(hz(m), bar + .3, "pad"), b, M["pad"])
        if a.mood == "cinematic" and ci % 2 == 0:
            tt = np.arange(int(2 * SR)) / SR; add(np.sin(2 * np.pi * (40 + 30 * np.exp(-tt * 4)) * tt) * np.exp(-tt * 1.6), b, .3)
        if ci % 2 == 1 and a.mood in ("calm", "corporate", "tension", "cinematic"):
            for k in range(8 if a.mood != "cinematic" else 4):
                add(note(hz(mel[(ci * 8 + k) % len(mel)] - (12 if a.mood == "cinematic" else 0)), .8, "bell"), b + k * step * (2 if a.mood == "cinematic" else 1), .03, .2)
        b += bar; ci += 1

    fo = int(min(2.0, DUR / 4) * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
    fi = int(.3 * SR); out[:fi] *= np.linspace(0, 1, fi)[:, None]
    out /= np.max(np.abs(out)) * 1.12
    pcm = (out * 32767).astype(np.int16)
    wav = a.out if a.out.lower().endswith(".wav") else a.out + ".tmp.wav"
    with wave.open(wav, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    if wav != a.out:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-b:a", "160k", a.out], check=True); os.remove(wav)
    print(f"{a.mood} {DUR:.1f}s ->", a.out)


if __name__ == "__main__":
    main()
