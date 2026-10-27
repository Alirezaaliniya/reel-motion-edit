"""Groups whisper word timings into caption chunks for the engine's captions layer.

usage: python captions.py <workdir> --style pop [--max-words 3] [--zones "0-14.6:1400,29.4-33.8:1400"] [--default-y 1170]
                          [--keywords "رایگان,VPN"] [--fix "اشتباه=درست,..."]

Writes <workdir>/captions.json and prints the chunks so they can be proof-read.
--zones maps time ranges to a caption y (e.g. lower on full-face shots, above a PIP on screen shots).
--keywords marks words for the 'kinetic' style (and gets highlighted in others).
--fix applies corrections to whisper output; a multi-word source ("وی پی این=VPN") merges those tokens.
"""
import argparse, sys, json
from pathlib import Path

PUNCT = ".!?؟،,"
STYLE_DEFAULTS = {"pop": 3, "karaoke": 5, "kinetic": 4, "minimal": 7, "boxed": 4}


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser()
    ap.add_argument("workdir"); ap.add_argument("--style", default="karaoke")
    ap.add_argument("--max-words", type=int); ap.add_argument("--zones", default="")
    ap.add_argument("--default-y", type=int, default=1170); ap.add_argument("--keywords", default="")
    ap.add_argument("--fix", default="")
    a = ap.parse_args()
    wd = Path(a.workdir)
    segs = json.loads((wd / "analysis" / "transcript.json").read_text(encoding="utf-8"))
    fixes = dict(p.split("=", 1) for p in a.fix.split(",") if "=" in p)
    keys = {k.strip() for k in a.keywords.split(",") if k.strip()}
    zones = []
    for z in filter(None, a.zones.split(",")):
        rng, y = z.split(":"); s, e = rng.split("-"); zones.append((float(s), float(e), int(y)))
    maxw = a.max_words or STYLE_DEFAULTS.get(a.style, 4)
    maxc = {3: 18, 4: 24, 5: 30}.get(maxw, 34)

    # whisper segments ≈ sentences; chunks never cross them
    words = [{"w": w["w"].strip(), "s": w["s"], "e": w["e"], "seg": k}
             for k, s in enumerate(segs) for w in s["words"] if w["w"].strip()]
    # multi-word fixes ("وی پی این=VPN") merge the tokens, keeping first start / last end
    for src, dst in sorted(fixes.items(), key=lambda kv: -len(kv[0].split())):
        pat = src.split()
        i = 0
        while i + len(pat) <= len(words):
            if [w["w"] for w in words[i:i + len(pat)]] == pat:
                words[i:i + len(pat)] = [{**words[i], "w": dst, "e": words[i + len(pat) - 1]["e"]}]
            i += 1

    # sentence units: split a segment at punctuation and long pauses
    units, cur = [], []
    for w in words:
        if cur and (w["seg"] != cur[-1]["seg"] or w["s"] - cur[-1]["e"] > 0.45):
            units.append(cur); cur = []
        cur.append(w)
        if w["w"][-1:] in PUNCT:
            units.append(cur); cur = []
    if cur:
        units.append(cur)

    def fits(ws):
        return len(ws) <= maxw and len(" ".join(x["w"] for x in ws)) <= maxc and ws[-1]["e"] - ws[0]["s"] <= 2.2

    chunks = []
    for u in units:
        # fewest balanced pieces that all fit, so lines are even instead of 5 + 1
        for k in range(1, len(u) + 1):
            size = -(-len(u) // k)
            parts = [u[i:i + size] for i in range(0, len(u), size)]
            if all(fits(p) for p in parts):
                break
        for p in parts:
            s0 = p[0]["s"]
            y = next((zy for zs, ze, zy in zones if zs <= s0 < ze), a.default_y)
            chunks.append({"s": round(s0, 2), "e": round(p[-1]["e"] + 0.1, 2), "y": y,
                           "words": [{"w": w["w"].rstrip(PUNCT) if a.style in ("pop", "kinetic") else w["w"],
                                      "s": round(w["s"], 2),
                                      **({"key": True} if w["w"].rstrip(PUNCT) in keys else {})} for w in p]})
    for x, nx in zip(chunks, chunks[1:]):
        x["e"] = min(x["e"], round(nx["s"] - 0.02, 2))
    (wd / "captions.json").write_text(json.dumps(chunks, ensure_ascii=False, indent=1), encoding="utf-8")
    for c in chunks:
        print(f'{c["s"]:6.2f}-{c["e"]:6.2f} y={c["y"]}  ' + " ".join(("*" + w["w"] + "*") if w.get("key") else w["w"] for w in c["words"]))
    print(f"{len(chunks)} chunks → {wd / 'captions.json'}")


if __name__ == "__main__":
    main()
