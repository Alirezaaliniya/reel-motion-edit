---
name: reel-motion-edit
description: Edits a talking-head / screen-recording video (Instagram Reel, Shorts, TikTok, Camtasia export, tutorial) into a motion-graphics cut. It adds text and graphics timed to the spoken words, sound effects that land on real on-screen events, creative transitions, camera punch-ins, a CTA ending, and optional styled subtitles. Persian/RTL is the first-class case, with bundled Persian display fonts. Use this whenever the user hands over a video file and asks to "edit", "motion graphic", "add effects/elements/sound effects", "make it engaging", or says things like «ادیت موشن گرافیک», «افکت صوتی بذار», «المان اضافه کن», «ترنزیشن», «زیرنویس خلاقانه» — even if they don't name this skill.
---

# Reel motion-graphics edit

Turns a raw vertical video into a finished motion-graphics edit:

```
analyze (transcript + motion + contact sheets) → beat sheet → plan.json
→ check (layout lint) → preview stills → render overlay → compose (camera + SFX + loudness)
→ verify → ask about subtitles
```

The overlay is HTML/GSAP rendered frame-by-frame with a transparent background (`assets/engine.html`), so Persian shaping, fonts and gradients are pixel-perfect. You never hand-write animation code: you write a **plan.json** that lists components and their times, and the engine animates them and assigns each one its default sound effects.

Talk to the user in their language (usually Persian). Keep the progress updates short.

## Why the edit should feel "exactly in place"

Viewers notice when a graphic or sound is half a second off, or when it has nothing to do with what's being said. That is what makes an edit look amateur. Earlier versions of this edit were criticized for exactly that: decorative badges appeared over the speaker's face that didn't match what he was saying. Three ideas fix this, and the tools enforce them:

1. **Anchor to the words.** Any text that echoes speech uses a word anchor (`"t": "w:رایگان"`), so it pops on the syllable, not near it. Hand-typed seconds are only for purely visual events.
2. **Anchor to the picture.** Clicks, page changes and layout zooms come from `motion.json` events (`"t": "m:m12"`) and from the timestamped contact sheets you read yourself. A click SFX without a visible click is noise.
3. **Protect the face.** Declare the face and PIP rectangles in `plan.avoid`. `render.js check` then flags any element that covers them. Fix every `COVERS` warning before rendering.

## Step 0 — setup (first run on a machine)

```bash
python <skill>/scripts/setup.py
```

Installs faster-whisper, puppeteer-core and gsap into `~/.cache/reel-motion-edit/`, synthesizes the SFX library, and downloads the Whisper model (`large-v3-turbo`, ~1.6 GB; it resumes and falls back to hf-mirror.com if huggingface.co is blocked or drops). This is the "download what you need" step, so do it without asking. Tell the user in one line what is downloading. Run it in the background: the model can take a while on slow connections. Meanwhile you can do the visual analysis with `analyze.py --no-transcript`, then rerun it for the transcript later.

If you find a useful extra asset (a font, an icon set, a royalty-free SFX), download it into the work dir. Note its license in `<workdir>/CREDITS.txt`. Prefer OFL/CC0 sources (Google Fonts, Pixabay/Freesound CC0). Bundled fonts: Vazirmatn (body), Lalezar (display), Changa, Lemonada (playful), Noto Kufi Arabic. Fonts the user has installed locally (e.g. Morabba, IRANSansX, Yekan Bakh) can be added via `plan.fonts` and are often the most on-brand choice. Look in `%LOCALAPPDATA%\Microsoft\Windows\Fonts` and `C:\Windows\Fonts`.

## Step 1 — analyze

Make a work dir next to the video (`<video dir>/<video name>_edit/`) and run:

```bash
python <skill>/scripts/analyze.py "<video>" "<workdir>" --lang fa
```

Then **read** `analysis/transcript.txt` and every `analysis/sheets/sheet_*.jpg` (10 s each, 0.5 s per cell, timestamped). The motion events printed by the script (`m0 … mN`, `cut`/`change`) are candidates. Confirm each one against the sheets, because a scroll also shows up as "change".

Whisper sometimes misspells Persian or English product names. Note corrections (they matter for captions and for word anchors: anchor on how Whisper spelled the word).

## Step 2 — beat sheet (think before designing)

Write `<workdir>/beats.md`: one line per beat with time range, what is **said**, what is **shown**, and the layout (full face / screen + PIP bottom-left / …). Mark:
- the **hook** (first 1–3 s): the promise of the video in 2–4 words
- each **step / idea** the speaker explains
- the **payoff moment** (result shown: "connected", "done", the number)
- the **CTA** at the end
- **layout changes** (zoom between camera and screen): transition points
- the **safe zones** per layout: where overlays can sit without hiding the face, the cursor or the thing being demonstrated

Choose a palette from the subject (brand colors of the product being shown), a display font and a body font. Read `references/creative-direction.md` for pacing, placement and SFX rules. It's short and it's the difference between "busy" and "pro".

## Step 3 — plan.json

Write `<workdir>/plan.json`. All components, their props and default SFX are in `references/components.md`. Read it before writing the plan. Minimal shape:

```json
{
  "video": "D:/videos/vpn firefox.mp4",
  "size": [1080, 1920], "fps": 30,
  "theme": {"primary": "#FF7139", "secondary": "#9059FF", "accent": "#FF2A8A", "display": "Lalezar", "body": "Vazirmatn"},
  "fonts": {"Morabba": "C:/Users/me/AppData/Local/Microsoft/Windows/Fonts/MorabbaVF.ttf"},
  "avoid": [{"name": "face", "from": 0, "to": 14.6, "rect": [200, 420, 680, 900]},
            {"name": "pip",  "from": 15, "to": 29.1, "rect": [0, 1300, 510, 620]}],
  "elements": [
    {"type": "title", "t": 0, "d": 3.8, "y": 90, "kicker": "آموزش ۶۰ ثانیه‌ای", "lines": ["`VPN` *رایگان*"], "sub": "با سرورهای فایرفاکس"},
    {"type": "transition", "t": "m:m3-0.1", "kind": "wipe"},
    {"type": "steps", "items": [{"t": "w:گوگل", "label": "جستجو در گوگل", "sub": "`vpn firefox github`"}], "hide": [[29.0, 34.1]]},
    {"type": "click", "t": 21.0, "x": 990, "y": 615},
    {"type": "success", "t": "w:وصل", "x": 405, "y": 678, "title": "وصل شدی!"},
    {"type": "cta", "t": 57.4, "items": [{"text": "سیو کن", "icon": "save"}, {"text": "فالو کن", "icon": "follow"}]}
  ],
  "camera": [{"t": "w:رایگان", "d": 1.2, "type": "punch", "scale": 1.12, "cx": 540, "cy": 700}],
  "sfx": [{"t": 16.2, "name": "typing", "db": -8}]
}
```

Text syntax: `*word*` = gradient highlight, `` `latin` `` = isolated LTR run (keeps "VPN"/URLs from flipping inside RTL text).

## Step 4 — check, preview, fix (loop)

```bash
node <skill>/scripts/render.js "<workdir>/plan.json" check
node <skill>/scripts/render.js "<workdir>/plan.json" preview 1 5.5 15.8 21.1 27.4 54
```

`check` prints the resolved timeline and lints for `COVERS` (element over a protected zone), `OFFFRAME`, `CLUTTER` (more than 3 overlays at once) and `SFXPILE` (sounds stacked inside 0.35 s). Fix every issue. Then look at `build/preview.jpg`: pick times mid-animation for each important element, and check that callouts and ripples sit exactly on their targets. Read coordinates off full-resolution frames (`ffmpeg -ss T -i video -frames:v 1 f.png`) rather than guessing from thumbnails. Iterate until it's right. Previews are cheap, full renders are not.

## Step 5 — render and compose

```bash
node <skill>/scripts/render.js "<workdir>/plan.json" full        # build/overlay.mov (≈3–6 min / minute of video)
python <skill>/scripts/compose.py "<workdir>/plan.json" --out "<video dir>/<name> - edit.mp4"
```

Run the full render in the background. `compose.py` applies the camera moves to the video only, overlays the graphics, mixes the SFX bed under the voice (optionally music with ducking: `"music": {"file": "...", "db": -20}`), and normalizes to −14 LUFS. Never overwrite the source video. Write a new file, with a version suffix (`- edit v2`) on re-renders.

## Step 6 — verify

Make a contact sheet of the output (`ffmpeg -i out.mp4 -vf "fps=1/2,scale=216:-1,tile=10x3" sheet.jpg`) and look at it. Check that the duration matches and that audio is present. Report honestly what you checked (frames) and what you couldn't (you can't listen; the SFX timing is verified against the event list, not by ear).

## Step 7 — ask about subtitles (always, at the end)

Once the edit is delivered, ask with AskUserQuestion whether to add creative subtitles. Offer 3–4 styles from `references/caption-styles.md`, put your recommendation first with the reason based on *this* video (pace of speech, how busy the screen is, audience), and include a short preview description of each. If they say yes:

```bash
python <skill>/scripts/captions.py "<workdir>" --style pop --zones "0-14.6:1400,29.4-33.8:1400" --default-y 1170 --keywords "رایگان,VPN" --fix "غلط=درست"
```

Proof-read the printed chunks (fix Whisper spellings with `--fix`). Add `"captions": {"file": "captions.json", "style": "pop"}` to the plan, run `check` (captions must not cover the face either), then render and compose again as a new version.

## Gotchas

- Elements in screen coordinates (click, highlight, callout arrows) misalign if a camera move zooms the same section. Use camera moves on talking-head sections only.
- Camtasia-style animated zooms between face and screen last ~0.5 s. Put the transition element at the *start* of the zoom, and don't put text on screen in that window.
- `steps.hide` hides the step chip during full-face sections and brings it back after.
- Whisper word timestamps can be ~0.1 s late on the first word after a pause. For hard hits (title slam), nudge with `-0.05`.
- Keep the speaker's own voice untouched (no EQ/compression beyond loudness normalization) unless asked.
