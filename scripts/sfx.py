"""Synthesizes the royalty-free SFX library (44.1 kHz stereo wav) used by the edit.

usage: python sfx.py <out_dir>

Every sound is generated from code, so there are no licensing questions and
the library works offline. Names are what plan.json / components refer to.
"""
import numpy as np, wave, os, sys

SR = 44100
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def lp(x, cutoff):
    """One-pole lowpass; cutoff may vary per sample."""
    c = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    a = np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s
        y[i] = s
    return y


def bp(x, f):
    return lp(x, f) - lp(x, np.asarray(f) * 0.3)


def save(out, name, mono, gain=0.9, width=0.0):
    mono = mono / (np.max(np.abs(mono)) + 1e-9) * gain
    if width:  # tiny Haas delay for stereo width
        d = int(SR * 0.012 * width)
        r = np.concatenate([np.zeros(d), mono[:-d]]) if d else mono
        st = np.stack([mono, r], 1)
    else:
        st = np.stack([mono, mono], 1)
    with wave.open(os.path.join(out, name + ".wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())


def whoosh(d=0.55, f0=300, f1=4500, shape=2.2):
    n = int(SR * d); x = rng.standard_normal(n)
    y = bp(x, np.geomspace(f0, f1, n))
    return y * np.sin(np.pi * np.linspace(0, 1, n)) ** shape


def click_one():
    n = int(SR * 0.025)
    x = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * 0.002))
    return x - lp(x, 2500)


def tone(f, d, dec, harm=((1, 1),)):
    tt = t(d)
    return sum(a * np.sin(2 * np.pi * f * h * tt) for h, a in harm) * np.exp(-tt * dec) * np.clip(tt / 0.002, 0, 1)


def place(buf, snd, at):
    s = int(SR * at); e = min(len(buf), s + len(snd)); buf[s:e] += snd[:e - s]


def build(out):
    os.makedirs(out, exist_ok=True)
    S = lambda n, x, **k: save(out, n, x, **k)

    # --- movement ---
    S("whoosh", whoosh(), width=1)
    S("whoosh_short", whoosh(0.32, 600, 6000), width=1)
    S("whoosh_heavy", whoosh(0.9, 120, 2500, 1.6) + 0.4 * np.sin(2 * np.pi * np.cumsum(np.geomspace(60, 160, int(SR * .9))) / SR) * np.sin(np.pi * np.linspace(0, 1, int(SR * .9))), width=1)
    S("swoosh_out", whoosh(0.45, 5000, 400), width=1)
    S("swipe", whoosh(0.18, 2000, 9000, 1.2), gain=0.7)

    # --- pops & ui ---
    tt = t(0.12); S("pop", np.sin(2 * np.pi * (900 * tt - 2500 * tt ** 2)) * np.exp(-tt * 40))
    tt = t(0.09); S("pop_hi", np.sin(2 * np.pi * (1500 * tt - 4000 * tt ** 2)) * np.exp(-tt * 55))
    tt = t(0.16); S("bubble", np.sin(2 * np.pi * (300 * tt + 9000 * tt ** 2)) * np.exp(-tt * 28))
    c = np.zeros(int(SR * .09)); place(c, click_one(), 0); place(c, click_one() * .6, .055)
    S("click", c, gain=0.8)
    S("tick", lp(click_one(), 6000), gain=0.6)
    n = int(SR * 1.1); ty = np.zeros(n); p = 0.0
    while p < 1.05:
        place(ty, lp(click_one() * rng.uniform(.5, 1), rng.uniform(3000, 7000)), p); p += rng.uniform(.06, .13)
    S("typing", ty, gain=0.6)
    seq = np.zeros(int(SR * .6))
    for i, f in enumerate([660, 880, 1320]): place(seq, tone(f, .12, 25), .13 * i)
    S("blips", seq, gain=0.7)
    seq = np.zeros(int(SR * .7))
    for i, f in enumerate([988, 1319]): place(seq, tone(f, .5, 9, ((1, 1), (2, .3))), .1 * i)
    S("notify", seq, gain=0.7)
    tt = t(.45); S("error", np.sign(np.sin(2 * np.pi * 140 * tt)) * np.exp(-tt * 5) * (np.sin(2 * np.pi * 9 * tt) > -.2), gain=.45)
    sh = np.zeros(int(SR * .25)); place(sh, click_one(), 0); place(sh, lp(rng.standard_normal(int(SR * .08)), 5000) * np.exp(-np.arange(int(SR * .08)) / (SR * .02)), .06)
    S("shutter", sh, gain=0.7)

    # --- positive / reward ---
    S("ding", tone(1318, 1.4, 3.2, ((1, 1), (2, .45), (3, .25), (1.5, .3))))
    seq = np.zeros(int(SR * 1.6))
    for i, f in enumerate([784, 988, 1175, 1568]): place(seq, tone(f, 1.0, 4.5, ((1, 1), (2, .35))), .09 * i)
    S("success", seq)
    seq = np.zeros(int(SR * .9))
    for i, f in enumerate([1975, 2637]): place(seq, tone(f, .6, 8, ((1, 1), (2.7, .4))), .08 * i)
    S("coin", seq, gain=.7)
    n = int(SR * 1.2); sp = np.zeros(n)
    for k in range(18):
        place(sp, tone(rng.uniform(2500, 6000), .25, 18) * rng.uniform(.3, 1), rng.uniform(0, .9))
    S("sparkle", sp, gain=.6, width=1)

    # --- tension / impact ---
    d = 1.6; n = int(SR * d); x = rng.standard_normal(n); fr = np.geomspace(200, 8000, n)
    S("riser", bp(x, fr) * np.linspace(0, 1, n) ** 2 + np.sin(2 * np.pi * np.cumsum(np.geomspace(120, 900, n)) / SR) * np.linspace(0, 1, n) ** 3 * .4, width=1)
    tt = t(1.2)
    S("impact", np.sin(2 * np.pi * (80 * tt - 30 * tt ** 2)) * np.exp(-tt * 5) + lp(rng.standard_normal(len(tt)) * np.exp(-tt * 30), 1800) * .8)
    tt = t(1.5); S("bass_drop", np.sin(2 * np.pi * np.cumsum(np.geomspace(140, 35, len(tt))) / SR) * np.exp(-tt * 2.2))
    n = int(SR * .35); g = np.zeros(n); p = 0
    while p < n:
        L = int(SR * rng.uniform(.01, .04)); f = rng.uniform(200, 2500)
        seg = np.sign(np.sin(2 * np.pi * f * np.arange(L) / SR)) * rng.uniform(.3, 1) * (rng.random() > .3)
        g[p:p + L] = seg[:n - p]; p += L
    S("glitch", lp(g, 6000) * (1 - np.linspace(0, 1, n)) ** 1.2, gain=.55)
    tt = t(.9)
    S("power_on", np.sin(2 * np.pi * np.cumsum(np.geomspace(150, 1200, len(tt))) / SR) * np.sin(np.pi * tt / .9) ** 1.5, gain=.6)
    tt = t(.6)
    S("power_off", np.sin(2 * np.pi * np.cumsum(np.geomspace(1000, 120, len(tt))) / SR) * np.sin(np.pi * tt / .6) ** 1.5, gain=.6)
    tt = t(.5); S("heartbeat", (np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 18)) + np.concatenate([np.zeros(int(SR * .18)), (np.sin(2 * np.pi * 50 * tt) * np.exp(-tt * 18))[:len(tt) - int(SR * .18)]]) * .7)

    # --- style palettes (styles.json maps component defaults onto these) ---
    # minimal: soft, short, low-key
    tt = t(.1); S("soft_pop", lp(np.sin(2 * np.pi * (520 * tt - 900 * tt ** 2)) * np.exp(-tt * 45), 2500), gain=.6)
    S("soft_whoosh", lp(whoosh(.45, 400, 2200, 2.6), 3000), gain=.45, width=1)
    # neon / tech: square-ish digital blips
    tt = t(.08); S("digital_blip", lp(np.sign(np.sin(2 * np.pi * 1760 * tt)) * np.exp(-tt * 40), 7000), gain=.4)
    seq = np.zeros(int(SR * .35))
    for i, f in enumerate([1320, 1760, 2637]):
        tt = t(.06); place(seq, np.sign(np.sin(2 * np.pi * f * tt)) * np.exp(-tt * 50), .07 * i)
    S("digital_seq", lp(seq, 7000), gain=.4)
    # doodle: pencil scribble + paper
    n = int(SR * .5); sc = np.zeros(n); p = 0.0
    while p < .45:
        L = rng.uniform(.04, .09); seg = bp(rng.standard_normal(int(SR * L)), rng.uniform(2500, 5000))
        place(sc, seg * np.sin(np.pi * np.linspace(0, 1, len(seg))), p); p += L * .8
    S("scribble", sc, gain=.55)
    n = int(SR * .45); x = rng.standard_normal(n)
    S("paper", bp(x, np.full(n, 3500.0)) * (np.abs(np.sin(np.linspace(0, 9, n))) ** 3) * np.linspace(1, .2, n), gain=.5, width=1)
    # retro VHS: tape stop + static
    tt = t(.7); f = np.geomspace(700, 40, len(tt))
    S("tape_stop", np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 - tt / .7) + lp(rng.standard_normal(len(tt)), 2000) * .15, gain=.6)
    n = int(SR * .4); S("static", (rng.standard_normal(n) - lp(rng.standard_normal(n), 300)) * np.exp(-np.linspace(0, 4, n)), gain=.35)
    # news: broadcast sting (brassy two-tone)
    seq = np.zeros(int(SR * 1.2))
    for i, f in enumerate([523, 784]):
        place(seq, tone(f, .9, 3.5, ((1, 1), (2, .6), (3, .45), (4, .3), (5, .2))), .12 * i)
    S("sting", lp(seq, 5000), gain=.7)

    print("sfx:", " ".join(sorted(f[:-4] for f in os.listdir(out) if f.endswith(".wav"))))


if __name__ == "__main__":
    build(sys.argv[1])
