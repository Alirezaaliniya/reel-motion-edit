"""Second SFX library: story sounds the base library lacks (44.1 kHz stereo wav, original, CC0).

usage: python sfx_extra.py [out_dir]      (default: <skill>/assets/sfx)

compose.py and the Remotion template look in ~/.cache/reel-motion-edit/sfx first, then in assets/sfx,
then in assets/sfx/user (sounds the user downloads, e.g. Kenney CC0 packs). Names below are plan sfx names.
"""
import os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import SR, t, lp, bp, save, whoosh, click_one, tone, place  # noqa: E402

rng = np.random.default_rng(21)


def env(n, a=0.002, d=0.2):
    tt = np.arange(n) / SR
    return np.clip(tt / a, 0, 1) * np.exp(-tt / d)


def noise(d):
    return rng.standard_normal(int(SR * d))


def metal_hit(f=420, d=0.5, dec=9):
    # inharmonic partials = metal
    return tone(f, d, dec, ((1, 1), (2.76, .55), (5.4, .3), (8.93, .15)))


def build(out):
    os.makedirs(out, exist_ok=True)
    S = {}

    # --- UI / interface ---------------------------------------------------------
    S["mouse_click"] = np.concatenate([click_one() * 1.0, np.zeros(int(SR * .045)), click_one() * .55, np.zeros(int(SR * .05))])
    b = np.zeros(int(SR * .25)); place(b, tone(1400, .12, 40) * .6, 0); place(b, tone(2100, .12, 45) * .5, .06)
    S["toggle_on"] = b + np.pad(click_one(), (0, len(b) - len(click_one()))) * .6
    b = np.zeros(int(SR * .25)); place(b, tone(2100, .12, 45) * .5, 0); place(b, tone(1400, .12, 40) * .6, .06)
    S["toggle_off"] = b + np.pad(click_one(), (0, len(b) - len(click_one()))) * .6
    n = int(SR * .09); S["key_enter"] = (lp(noise(.09), 1800) * env(n, .001, .02) * 2 + tone(180, .09, 60) * .5)
    b = np.zeros(int(SR * .7)); place(b, tone(1318, .35, 9, ((1, 1), (2, .2))), 0); place(b, tone(1760, .4, 8, ((1, 1), (2, .2))), .13)
    S["sms_receive"] = b
    b = np.zeros(int(SR * .6)); place(b, tone(880, .45, 7, ((1, 1), (3, .08))) * .7, 0)
    S["notify_soft"] = b
    b = np.zeros(int(SR * .6)); place(b, tone(392, .25, 12, ((1, 1), (2, .3))), 0); place(b, tone(330, .3, 10, ((1, 1), (2, .3))), .12)
    S["error_soft"] = b
    b = np.zeros(int(SR * .9)); [place(b, tone(f, .55, 6, ((1, 1), (2, .15))) * .7, i * .09) for i, f in enumerate((659, 784, 988))]
    S["success_soft"] = b
    # phone vibrate: 2 buzz bursts, 150 Hz with rattle
    b = np.zeros(int(SR * 1.0))
    for st in (0, .45):
        tt = t(.3); buzz = np.sign(np.sin(2 * np.pi * 150 * tt)) * .6 + np.sin(2 * np.pi * 300 * tt) * .4
        place(b, lp(buzz, 900) * np.clip(np.minimum(tt, .3 - tt) / .02, 0, 1), st)
    S["phone_vibrate"] = b

    # --- objects / story ----------------------------------------------------------
    n = int(SR * .5)
    thud = lp(noise(.5), 400) * env(n, .001, .05) * 3
    S["lock_close"] = thud + metal_hit(620, .5, 14) * .5 + np.pad(click_one(), (0, n - len(click_one()))) * .8
    b = np.zeros(int(SR * .6)); place(b, click_one() * .9, 0); place(b, metal_hit(880, .4, 16) * .4, .03); place(b, click_one() * .7, .16)
    place(b, metal_hit(1180, .4, 18) * .3, .18)
    S["unlock"] = b
    b = np.zeros(int(SR * 1.3)); place(b, metal_hit(1500, .25, 20) * .5, 0)
    for i, f in enumerate((2093, 2637, 3136)): place(b, tone(f, .9, 4, ((1, 1), (2.01, .3))) * .45, .08 + i * .03)
    place(b, lp(noise(.2), 3000) * env(int(SR * .2), .001, .04), 0)
    S["cash_register"] = b
    n = int(SR * .45); S["stamp"] = lp(noise(.45), 700) * env(n, .001, .06) * 3 + tone(90, .45, 14) * .9
    n = int(SR * .5); x = noise(.5)
    S["page_flip"] = bp(x, np.geomspace(1200, 5000, n)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 3 * np.linspace(1, .4, n)
    n = int(SR * .4); S["card_slide"] = bp(noise(.4), np.geomspace(800, 2500, n)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    b = np.zeros(int(SR * .5)); place(b, lp(noise(.3), 2500) * env(int(SR * .3), .002, .05), 0); place(b, tone(240, .3, 18) * .6, 0)
    S["box_drop"] = b
    b = np.zeros(int(SR * .5)); tt = t(.18); sq = np.sin(2 * np.pi * (2400 + 600 * np.sin(2 * np.pi * 7 * tt)) * tt) * np.sin(np.pi * tt / .18)
    place(b, sq * .35 + bp(rng.standard_normal(len(tt)), 3500) * .3, 0); S["marker_squeak"] = b
    b = np.zeros(int(SR * 1.2))
    for i in range(4): place(b, tone(1000 if i % 2 else 1200, .05, 80) * .7, i * .25); place(b, click_one() * .5, i * .25)
    S["clock_tick"] = b
    S["bell"] = tone(1568, 1.6, 2.5, ((1, 1), (2.4, .4), (4.1, .2), (5.4, .1)))

    # --- cinematic / transitions --------------------------------------------------
    n = int(SR * 2.2); tt = t(2.2)
    S["boom_cinematic"] = (np.sin(2 * np.pi * (55 * np.exp(-tt * .6)) * tt) * np.exp(-tt * 1.4) * 1.2
                           + lp(noise(2.2), 300) * env(n, .002, .4) * 1.2 + lp(noise(2.2), 4000) * env(n, .001, .03) * .4)
    n = int(SR * .9); tt = t(.9)
    S["sub_hit"] = np.sin(2 * np.pi * (70 * np.exp(-tt * 2)) * tt) * np.exp(-tt * 3.5) + lp(noise(.9), 1200) * env(n, .001, .015) * .5
    n = int(SR * 2.5); x = noise(2.5); ramp = np.linspace(0, 1, n)
    S["reverse_cymbal"] = (x - lp(x, 4000)) * ramp ** 3 * (ramp < .995)
    n = int(SR * 3.0); tt = t(3.0); ramp = np.linspace(0, 1, n)
    S["riser_tension"] = (sum(np.sin(2 * np.pi * f * (1 + ramp * 1.5) * tt) for f in (110, 165.4, 220.7)) * .25 * ramp ** 2
                          + bp(noise(3.0), np.geomspace(400, 6000, n)) * ramp ** 2.5 * .8)
    n = int(SR * .7); S["whoosh_reverse"] = whoosh(.7, 400, 5000, 1.2) * np.linspace(0, 1, n) ** 2.5
    n = int(SR * 1.4); tt = t(1.4)
    S["shimmer_long"] = sum(tone(f, 1.4, 2.2) * .3 for f in (1046.5, 1318.5, 1568, 2093)) * (0.6 + .4 * np.sin(2 * np.pi * 6 * tt))
    S["glass_ding"] = tone(2637, 1.2, 3.5, ((1, 1), (2.32, .35), (4.25, .15)))
    b = np.zeros(int(SR * .5))
    for i in range(6): place(b, tone(600 + i * 180, .06, 50) * .5, i * .045)
    S["counter_tick"] = b

    for name, x in S.items():
        save(out, name, x, gain=.85, width=.6)
    print(f"{len(S)} sounds ->", out)
    return list(S)


if __name__ == "__main__":
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    build(sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "assets", "sfx"))
