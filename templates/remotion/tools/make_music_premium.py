"""Original synthesized music bed for the Pop3D edit (CC0 – generated here, no samples).
Problem part (0 – 12.56 s): sparse, minor, filtered pulse.
Drop at 12.56 s ("اما راه حلش"): bright major groove until the end.
"""
import os
import sys
import wave
import numpy as np

SR = 44100
DUR = float(os.environ.get("MUSIC_DUR", 42.2))  # voice length + ~0.4 s
DROP = float(os.environ.get("MUSIC_DROP", 12.56))  # turning-point word (s)
PREMIUM = len(sys.argv) > 2 and sys.argv[2] == "premium"
BPM = 92 if PREMIUM else 120
BEAT = 60 / BPM
N = int(SR * DUR)
t = np.arange(N) / SR
out = np.zeros((N, 2))
rng = np.random.default_rng(7)


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l = gain * np.cos((pan + 1) * np.pi / 4)
    r = gain * np.sin((pan + 1) * np.pi / 4)
    out[i : i + len(sig), 0] += sig * l
    out[i : i + len(sig), 1] += sig * r


def env(n, a=0.005, d=0.2, s=0.0, total=None):
    total = total or n / SR
    tt = np.arange(n) / SR
    e = np.where(tt < a, tt / a, s + (1 - s) * np.exp(-(tt - a) / d))
    return e


def kick():
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    f = 50 + 110 * np.exp(-tt * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * 9)


def clap():
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # crude band-pass: difference of smoothed noise
    k1 = np.convolve(noise, np.ones(3) / 3, "same")
    k2 = np.convolve(noise, np.ones(18) / 18, "same")
    bp = k1 - k2
    e = np.exp(-tt * 22) + 0.6 * np.exp(-np.maximum(tt - 0.012, 0) * 30) * (tt > 0.012)
    return bp * e * 0.9


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    hp = noise - np.convolve(noise, np.ones(4) / 4, "same")
    return hp * np.exp(-tt * (14 if open_ else 70))


def note(freq, dur, kind="pluck"):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    if kind == "pluck":
        s = sum(np.sin(2 * np.pi * freq * h * tt) / h ** 1.3 for h in range(1, 6))
        return s * np.exp(-tt * 5.5) * np.minimum(tt / 0.003, 1)
    if kind == "bass":
        s = np.sin(2 * np.pi * freq * tt) + 0.35 * np.sin(2 * np.pi * freq * 2 * tt)
        return s * np.minimum(tt / 0.01, 1) * np.exp(-tt * 2.2)
    if kind == "pad":
        s = sum(np.sin(2 * np.pi * freq * (1 + d) * tt) for d in (-0.004, 0, 0.005))
        a = np.minimum(tt / 0.6, 1) * np.minimum((dur - tt) / 0.5, 1)
        return s * a / 3
    if kind == "bell":
        s = np.sin(2 * np.pi * freq * tt + 2.2 * np.sin(2 * np.pi * freq * 3.5 * tt) * np.exp(-tt * 6))
        return s * np.exp(-tt * 3.2)
    raise ValueError(kind)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------- problem section: A minor, sparse ----------
prob_chords = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]]  # Am F G Em
bar = 4 * BEAT
b = 0.0
ci = 0
while b < DROP - 0.05:
    ch = prob_chords[ci % 4]
    length = min(bar, DROP - b)
    for m in ch:
        add(note(hz(m), length + 0.4, "pad"), b, 0.05, pan=rng.uniform(-0.4, 0.4))
    add(note(hz(ch[0] - 24), length, "bass"), b, 0.18)
    # heartbeat-ish pulse on beats 1 and 3
    for k in (0, 2):
        if b + k * BEAT < DROP - 0.1:
            add(kick() * 0.55, b + k * BEAT, 0.5)
    # ticking hats, quiet
    for k in range(8):
        tt_ = b + k * BEAT / 2
        if tt_ < DROP - 0.1:
            add(hat(), tt_, (0.0 if PREMIUM else 0.05 + 0.03 * (k % 2)), pan=0.3)
    b += bar
    ci += 1

# riser into the drop
rn = int(1.5 * SR)
rt = np.arange(rn) / SR
noise = rng.standard_normal(rn)
riser = (noise - np.convolve(noise, np.ones(6) / 6, "same")) * (rt / 1.5) ** 2.2
riser += 0.4 * np.sin(2 * np.pi * (200 + 900 * (rt / 1.5) ** 2) * rt) * (rt / 1.5) ** 2
add(riser, DROP - 1.5, 0.12 if PREMIUM else 0.22)

# ---------- solution section: C major groove ----------
sol_chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]  # C G Am F
b = DROP
ci = 0
step = BEAT / 2
melody = [72, 76, 79, 76, 74, 79, 74, 71, 72, 76, 81, 76, 77, 72, 74, 76]
while b < DUR:
    ch = sol_chords[ci % 4]
    for k in range(4):
        tk = b + k * BEAT
        add(kick(), tk, 0.38 if PREMIUM else 0.62)
        if k in (1, 3):
            add(clap(), tk, 0.1 if PREMIUM else 0.32, pan=0.05)
        add(hat(), tk + BEAT / 2, 0.035 if PREMIUM else 0.09, pan=0.35)
        add(hat(open_=k == 3), tk + 3 * BEAT / 4, 0.0 if PREMIUM else 0.05, pan=-0.35)
    # offbeat bass
    for k in range(8):
        add(note(hz(ch[0] - 24), step * 0.9, "bass"), b + k * step + (step / 2 if k % 2 else 0) * 0, 0.16 if k % 2 else 0.2)
    # chord plucks, syncopated
    for off in (0, 0.75, 1.5, 2.5, 3.0):
        for m in ch:
            add(note(hz(m + 12), 0.9 if PREMIUM else 0.5, "bell" if PREMIUM else "pluck"), b + off * BEAT, 0.02 if PREMIUM else 0.045, pan=rng.uniform(-0.5, 0.5))
    for m in ch:
        add(note(hz(m), bar + 0.3, "pad"), b, 0.06 if PREMIUM else 0.03)
    # little bell melody every other bar
    if ci % 2 == 1:
        for k in range(8):
            mm = melody[(ci * 8 + k) % len(melody)]
            add(note(hz(mm), 0.6, "bell"), b + k * step, 0.03, pan=0.2)
    b += bar
    ci += 1

# drop hit
n = int(1.2 * SR)
tt = np.arange(n) / SR
boom = np.sin(2 * np.pi * (45 + 60 * np.exp(-tt * 8)) * tt) * np.exp(-tt * 2.5)
add(boom, DROP, 0.35 if PREMIUM else 0.5)

# fade out
fo = int(2.0 * SR)
out[-fo:] *= np.linspace(1, 0, fo)[:, None]
out[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))[:, None]

out /= np.max(np.abs(out)) * 1.12
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", sys.argv[1])
