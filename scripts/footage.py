"""Original effect footage (loops, 1080x1920, 30 fps, H.264), generated from code: no licence questions.

usage: python footage.py [out_dir] [--only name,name]     (default out: <skill>/assets/footage)

Most clips are light on black: lay them over the picture with blend "screen" (black = no change).
film_grain is grey-centred: blend "overlay" (mid grey = no change). gradient_mesh is a full background.
compose.py applies them from plan "fx" (see references/components.md → "Effect footage").
"""
import os, sys, subprocess
import numpy as np

W, H, FPS = 1080, 1920, 30
rng = np.random.default_rng(5)


def grid(w, h):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    return x / w, y / h


def blob(x, y, cx, cy, r):
    return np.exp(-(((x - cx) ** 2) / (r * r * .56) + ((y - cy) ** 2) / (r * r)))


def write(out, name, frames_fn, n, w, h, crf=22, scale=True):
    path = os.path.join(out, name + ".mp4")
    vf = f"scale={W}:{H}:flags=bicubic," if scale and (w, h) != (W, H) else ""
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-r", str(FPS),
                          "-i", "-", "-vf", vf + "format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", str(crf),
                          "-movflags", "+faststart", path], stdin=subprocess.PIPE)
    for i in range(n):
        f = np.clip(frames_fn(i, n), 0, 255).astype(np.uint8)
        p.stdin.write(f.tobytes())
    p.stdin.close(); p.wait()
    print(f"  {name:18s} {n / FPS:.1f}s  {os.path.getsize(path) / 1e6:.1f} MB")


def leak(colors, seed):
    w, h = 270, 480; x, y = grid(w, h); r = np.random.default_rng(seed)
    P = [(r.uniform(-.2, 1.2), r.uniform(-.1, 1.1), r.uniform(.25, .5), r.uniform(0, 2 * np.pi), np.array(c, np.float32)) for c in colors]

    def f(i, n):
        ph = 2 * np.pi * i / n; img = np.zeros((h, w, 3), np.float32)
        for k, (cx, cy, rad, o, col) in enumerate(P):
            mx = cx + .22 * np.sin(ph + o); my = cy + .18 * np.cos(ph * (1 + k % 2) + o)
            a = blob(x, y, mx, my, rad) * (.65 + .35 * np.sin(ph * 2 + o))
            img += a[..., None] * col
        return img
    return f, w, h


def build(out, only=None):
    os.makedirs(out, exist_ok=True)
    jobs = {}

    jobs["lightleak_warm"] = lambda: write(out, "lightleak_warm", *(lambda f, w, h: (f, 120, w, h))(*leak([(255, 120, 30), (255, 60, 40), (255, 190, 90), (200, 40, 90)], 1)))
    jobs["lightleak_cool"] = lambda: write(out, "lightleak_cool", *(lambda f, w, h: (f, 120, w, h))(*leak([(60, 120, 255), (140, 70, 255), (40, 220, 255), (255, 80, 200)], 2)))

    def grain():
        w, h = 360, 640; base = rng.standard_normal((30, h, w)).astype(np.float32)
        return lambda i, n: np.repeat((128 + base[i % 30] * 30)[..., None], 3, 2)
    jobs["film_grain"] = lambda: write(out, "film_grain", grain(), 30, 360, 640, crf=30)  # 1 s loop; compose loops it

    def dust():
        w, h = 540, 960
        def f(i, n):
            r = np.random.default_rng(1000 + i); img = np.zeros((h, w), np.float32)
            for _ in range(r.integers(6, 16)):
                cx, cy, s = r.integers(0, w), r.integers(0, h), r.integers(1, 4)
                img[max(0, cy - s):cy + s, max(0, cx - s):cx + s] = r.uniform(120, 255)
            if r.random() < .35:  # hair / scratch
                x0 = r.integers(20, w - 20); img[:, x0:x0 + 1] = np.maximum(img[:, x0:x0 + 1], r.uniform(60, 160))
            for _ in range(r.integers(0, 3)):  # curly hair
                tt = np.linspace(0, 1, 200); cx, cy = r.integers(0, w), r.integers(0, h)
                xs = (cx + 40 * np.sin(tt * 6 + r.random() * 6) * tt).astype(int); ys = (cy + 80 * tt).astype(int)
                ok = (xs >= 0) & (xs < w) & (ys >= 0) & (ys < h); img[ys[ok], xs[ok]] = 200
            return np.repeat(img[..., None], 3, 2)
        return f
    jobs["dust_scratches"] = lambda: write(out, "dust_scratches", dust(), 120, 540, 960, crf=24)

    def bokeh():
        w, h = 360, 640; x, y = grid(w, h); r = np.random.default_rng(9)
        B = [(r.uniform(0, 1), r.uniform(0, 1), r.uniform(.03, .09), r.uniform(.3, 1), r.integers(1, 3), np.array(c, np.float32))
             for c in r.choice([(255, 200, 120), (255, 150, 90), (140, 190, 255), (255, 255, 255)], 26)]
        def f(i, n):
            ph = i / n; img = np.zeros((h, w, 3), np.float32)
            for cx, cy, rad, a, sp, col in B:
                yy = (cy - ph * sp) % 1.2 - .1; d = np.sqrt(((x - cx) * .5625) ** 2 + (y - yy) ** 2)
                disc = np.clip((rad - d) / (rad * .25), 0, 1) * (.55 + .45 * np.clip(d / rad, 0, 1))
                img += disc[..., None] * col * a * .55
            return img
        return f
    jobs["bokeh"] = lambda: write(out, "bokeh", bokeh(), 180, 360, 640)

    def vhs():
        w, h = 540, 960
        def f(i, n):
            r = np.random.default_rng(3000 + i); img = np.zeros((h, w), np.float32)
            band = int((i / n) * (h + 200)) - 100; y0, y1 = max(0, band), min(h, band + 60)
            if y1 > y0: img[y0:y1] = r.uniform(30, 90, (y1 - y0, w))
            for _ in range(r.integers(3, 9)):
                yy = r.integers(0, h - 2); th = int(r.integers(1, 3)); line = r.uniform(60, 200, (1, w)) * (r.random(w) > .4)
                img[yy:yy + th, :] = np.maximum(img[yy:yy + th, :], line)
            img += r.uniform(0, 18, (h, w))
            return np.repeat(img[..., None], 3, 2)
        return f
    jobs["vhs_noise"] = lambda: write(out, "vhs_noise", vhs(), 90, 540, 960, crf=26)

    def sparkles():
        w, h = 540, 960; r = np.random.default_rng(11); N = 60
        P = np.c_[r.uniform(0, w, N), r.uniform(0, h, N), r.uniform(0, 1, N), r.uniform(2, 5, N)]
        def f(i, n):
            img = np.zeros((h, w), np.float32)
            for cx, cy, o, s in P:
                a = max(0, np.sin(2 * np.pi * (i / n * 2 + o))) ** 6
                if a < .02: continue
                cx, cy, L = int(cx), int(cy), int(s * 4 * a) + 1
                img[cy, max(0, cx - L):cx + L] += 255 * a; img[max(0, cy - L):cy + L, cx] += 255 * a
                img[max(0, cy - 1):cy + 2, max(0, cx - 1):cx + 2] += 255 * a
            return np.repeat(img[..., None], 3, 2) * np.array([1, .95, .8])
        return f
    jobs["sparkles"] = lambda: write(out, "sparkles", sparkles(), 120, 540, 960)

    def sweep():
        w, h = 270, 480; x, y = grid(w, h)
        def f(i, n):
            p = -0.6 + 2.2 * i / (n - 1); d = (x * .9 + y * .5) - p
            a = np.exp(-(d / .07) ** 2) + .35 * np.exp(-(d / .25) ** 2)
            return a[..., None] * np.array([255, 240, 215], np.float32)
        return f
    jobs["light_sweep"] = lambda: write(out, "light_sweep", sweep(), 36, 270, 480)

    def mesh():
        w, h = 270, 480; x, y = grid(w, h)
        C = [np.array(c, np.float32) for c in ((124, 92, 255), (255, 90, 140), (40, 200, 255), (255, 170, 60))]
        def f(i, n):
            ph = 2 * np.pi * i / n; img = np.full((h, w, 3), 14, np.float32)
            for k, c in enumerate(C):
                cx = .5 + .42 * np.sin(ph + k * 1.6); cy = .5 + .38 * np.cos(ph * (1 if k % 2 else -1) + k)
                img += blob(x, y, cx, cy, .42)[..., None] * c * .75
            return img
        return f
    jobs["gradient_mesh"] = lambda: write(out, "gradient_mesh", mesh(), 240, 270, 480)

    for k, job in jobs.items():
        if not only or k in only:
            job()


if __name__ == "__main__":
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    args = [a for a in sys.argv[1:] if not a.startswith("--only")]
    only = None
    if "--only" in sys.argv:
        only = set(sys.argv[sys.argv.index("--only") + 1].split(",")); args = [a for a in args if a != sys.argv[sys.argv.index("--only") + 1]]
    build(args[0] if args else os.path.join(here, "assets", "footage"), only)
