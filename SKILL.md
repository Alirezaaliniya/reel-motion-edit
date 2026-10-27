---
name: reel-motion-edit
description: Edits a talking-head / screen-recording video (Instagram Reel, Shorts, TikTok, Camtasia export, tutorial) into a motion-graphics cut in a style the user picks from 7 presets (modern gradient, bold pop, neon tech, clean minimal, hand-drawn doodle, retro VHS, broadcast news). It adds text and graphics timed to the spoken words, sound effects that land on real on-screen events, creative transitions, camera punch-ins, a CTA ending, and optional styled subtitles, voice cleanup, pause trimming, a cover image and an @handle watermark. Persian/RTL is the first-class case, with bundled Persian display fonts. Use this whenever the user hands over a video file and asks to "edit", "motion graphic", "add effects/elements/sound effects", "make it engaging", or says things like «ادیت موشن گرافیک», «افکت صوتی بذار», «المان اضافه کن», «ترنزیشن», «زیرنویس خلاقانه», «سبک ادیت» — even if they don't name this skill.
---

# Reel motion-graphics edit

Turns a raw vertical video into a finished motion-graphics edit:

```
setup → analyze → ASK: style (style board) + prep options → beat sheet → plan.json
→ check + preview loop → render overlay → compose → verify → OFFER: subtitles + extras
```

The overlay is HTML/GSAP rendered frame-by-frame with a transparent background (`assets/engine.html`), so Persian shaping, fonts and gradients are pixel-perfect. You never hand-write animation code: you write a **plan.json** that lists components and their times. The engine animates them in the chosen **style preset**, which sets the look, motion, transitions and sound palette, and gives each component its default sound effects.

Talk to the user in their language (usually Persian). Keep the progress updates short.

## Why the edit should feel "exactly in place" — and not samey

Viewers notice when a graphic or sound is half a second off, or when it has nothing to do with what's being said. That is what makes an edit look amateur. Earlier edits were criticized for exactly that: decorative badges appeared over the speaker's face that didn't match what he was saying. Later, the user also said the edits had started to look **repetitive**. Four ideas fix both, and the tools enforce most of them:

1. **Anchor to the words.** Any text that echoes speech uses a word anchor (`"t": "w:رایگان"`), so it pops on the syllable, not near it. Hand-typed seconds are only for purely visual events.
2. **Anchor to the picture.** Clicks, page changes and layout zooms come from `motion.json` events (`"t": "m:m12"`) and from the timestamped contact sheets you read yourself. A click SFX without a visible click is noise.
3. **Protect the face.** Declare the face and PIP rectangles in `plan.avoid`. `render.js check` then flags any element that covers them. Fix every `COVERS` warning before rendering.
4. **Let the user choose the look, then vary within it.** Ask for a style before designing (Step 2). Then don't fall back on the same recipe every time: vary the hook format, which components carry the ideas, and the transitions. `references/styles.md` has the per-style playbook and a list of hook formats.

## Step 0 — setup (first run on a machine)

```bash
python <skill>/scripts/setup.py
```

Installs faster-whisper, puppeteer-core and gsap into `~/.cache/reel-motion-edit/`, synthesizes the SFX library, and downloads the Whisper model (`large-v3-turbo`, ~1.6 GB; it resumes and falls back to hf-mirror.com if huggingface.co is blocked or drops). This is the "download what you need" step, so do it without asking. Tell the user in one line what is downloading. Run it in the background: the model can take a while on slow connections. Meanwhile you can do the visual analysis with `analyze.py --no-transcript`, then rerun it for the transcript later. Re-run `scripts/sfx.py ~/.cache/reel-motion-edit/sfx` after updating the skill, so new style sounds exist.

If you find a useful extra asset (a font, an icon set, a royalty-free SFX or music track), download it into the work dir. Note its license in `<workdir>/CREDITS.txt`. Prefer OFL/CC0 sources (Google Fonts, Pixabay/Freesound CC0). Bundled fonts: Vazirmatn (body), Lalezar (display), Changa (tech), Lemonada (playful), Noto Kufi Arabic (formal). Fonts the user has installed locally (e.g. Morabba, IRANSansX, Yekan Bakh) can be added via `plan.fonts` and are often the most on-brand choice. Look in `%LOCALAPPDATA%\Microsoft\Windows\Fonts` and `C:\Windows\Fonts`.

**Brand kit.** If `~/.config/reel-motion-edit/brand.json` exists, render.js applies it automatically: `style`, `theme` (brand colors), `fonts`, `handle` (@username watermark), `handleCorner`, `logo`. The plan overrides it; `"brand": false` ignores it for one video. When the user tells you a lasting preference (their handle, a style they always want, brand colors), offer to save it there.

## Step 1 — analyze

Make a work dir next to the video (`<video dir>/<video name>_edit/`) and run:

```bash
python <skill>/scripts/analyze.py "<video>" "<workdir>" --lang fa
```

Then **read** `analysis/transcript.txt` and every `analysis/sheets/sheet_*.jpg` (10 s each, 0.5 s per cell, timestamped). The motion events printed by the script (`m0 … mN`, `cut`/`change`) are candidates. Confirm each one against the sheets, because a scroll also shows up as "change".

Whisper sometimes misspells Persian or English product names. Note corrections (they matter for captions and for word anchors: anchor on how Whisper spelled the word).

## Step 2 — ask the user: style + prep options (before designing anything)

Different videos and audiences want different looks, and the user wants to choose. Build a **style board**: one representative frame of *their* video rendered in all 7 presets, with a title, step chip, sticker and subtitle line. Write a minimal plan first (video + a title + one keyword + steps if the video has steps), then run:

```bash
node <skill>/scripts/render.js "<workdir>/plan.json" styleboard <T>    # → build/styleboard.jpg
```

Pick T where the frame is typical (not a transition). Send the image to the user (SendUserFile, display render), then ask with AskUserQuestion. Skip the style question if the brand kit already has a `style`, unless the user asks for something different.

- **Q1 — style** (4 options max: recommend the best fit for this content first, with a one-line reason, plus three contrasting alternatives; say the others can be typed via "Other"). Presets: `gradient` modern gradient, `bold` pop/Hormozi, `neon` tech/cyber, `minimal` clean Apple-like, `doodle` hand-drawn, `retro` VHS, `news` broadcast. Descriptions are in `assets/styles.json` (`label`, `feel`).
- **Q2 — prep options** (multiSelect), only the ones that apply:
  - *Trim pauses (jump cuts)*: `tighten.py` removes silences longer than ~0.45 s. Best for talking-head videos. On screen recordings, warn that silent stretches may be where the clicking happens. It changes the timeline, so it runs **before** analysis: re-run analyze on the tightened file.
  - *Voice cleanup*: `"voice": "enhance"` (denoise, rumble cut, presence, gentle compression). Recommend it for phone or room audio.
  - *@handle watermark*: ask for the handle if the brand kit doesn't have one.
  - *Background music*: only if the user has a track or wants you to find a CC0 one. It's ducked under the voice automatically.

If the user just wants the edit and doesn't care, pick for them, say which style you picked and why, and go.

## Step 3 — beat sheet (think before designing)

Write `<workdir>/beats.md`: one line per beat with time range, what is **said**, what is **shown**, and the layout (full face / screen + PIP bottom-left / handheld screen / …). Mark:
- the **hook** (first 1–3 s): pick a hook format from `references/styles.md`, a different one than last time if you know it
- each **step / idea** the speaker explains
- the **payoff moment** (result shown: "connected", "done", the number)
- the **CTA** at the end
- **layout changes** (zoom between camera and screen): transition points
- the **safe zones** per layout: where overlays can sit without hiding the face, the cursor or the thing being demonstrated

Read `references/styles.md` (the chosen style's playbook) and `references/creative-direction.md` (pacing, placement, SFX rules). They're short and they're the difference between "busy" and "pro".

## Step 4 — plan.json

Write `<workdir>/plan.json`. All components, their props and default SFX are in `references/components.md`. Read it before writing the plan. Minimal shape:

```json
{
  "video": "D:/videos/vpn firefox.mp4",
  "size": [1080, 1920], "fps": 30,
  "style": "neon",
  "voice": "enhance",
  "handle": {"text": "@your_handle", "corner": "tl"},
  "avoid": [{"name": "face", "from": 0, "to": 14.6, "rect": [200, 420, 680, 900]},
            {"name": "pip",  "from": 15, "to": 29.1, "rect": [0, 1300, 510, 620]}],
  "elements": [
    {"type": "title", "t": 0, "d": 3.8, "y": 90, "kicker": "آموزش ۶۰ ثانیه‌ای", "lines": ["`VPN` *رایگان*"], "sub": "با سرورهای فایرفاکس"},
    {"type": "transition", "t": "m:m3-0.1"},
    {"type": "steps", "items": [{"t": "w:گوگل", "label": "جستجو در گوگل", "sub": "`vpn firefox github`"}], "hide": [[29.0, 34.1]]},
    {"type": "keyword", "t": "w:رایگان", "x": 540, "y": 1640, "text": "رایگان", "emoji": "🎁"},
    {"type": "success", "t": "w:وصل", "x": 405, "y": 678, "title": "وصل شدی!"},
    {"type": "cta", "t": 57.4, "items": [{"text": "سیو کن", "icon": "save"}, {"text": "فالو کن", "icon": "follow"}]}
  ],
  "camera": [{"t": "w:رایگان", "d": 1.2, "type": "punch", "scale": 1.12, "cx": 540, "cy": 700}],
  "sfx": [{"t": 16.2, "name": "typing", "db": -8}],
  "cover": {"lines": ["`VPN` *رایگان*"], "sub": "آموزش ۶۰ ثانیه‌ای"}
}
```

**Let the style decide the look.** Leave visual props (`theme` colors, keyword `style`/`rotate`/`from`, transition `kind`, title `anim`, caption style) unset unless you have a semantic reason (red for an error, a brand color). The preset fills them in, and that is what makes styles feel different. A transition without `kind` cycles through the style's transitions. `theme` in the plan only overrides the preset (e.g. the product's brand color).

Text syntax: `*word*` or `*two words*` = highlight, `` `latin` `` = isolated LTR run (keeps "VPN"/URLs from flipping inside RTL text).

## Step 5 — check, preview, fix (loop)

```bash
node <skill>/scripts/render.js "<workdir>/plan.json" check
node <skill>/scripts/render.js "<workdir>/plan.json" preview 1 5.5 15.8 21.1 27.4 54
```

`check` prints the resolved timeline and lints for:
- `COVERS`: an element over a protected zone
- `OFFFRAME`
- `CLUTTER`: more than 3 overlays at once
- `SFXPILE`: sounds stacked inside 0.35 s
- `ORDER`: a word anchor hit an earlier occurrence, so use `w:word#2`

Fix every issue. Then look at `build/preview.jpg`: pick times mid-animation for each important element, and check that callouts and ripples sit exactly on their targets. Read coordinates off full-resolution frames (`ffmpeg -ss T -i video -frames:v 1 f.png`) rather than guessing from thumbnails. Iterate until it's right. Previews are cheap, full renders are not.

## Step 6 — render and compose

```bash
node <skill>/scripts/render.js "<workdir>/plan.json" full        # build/overlay.mov (≈3–6 min / minute of video)
python <skill>/scripts/compose.py "<workdir>/plan.json" --out "<video dir>/<name> - edit.mp4"
node <skill>/scripts/render.js "<workdir>/plan.json" cover <T>   # build/cover.jpg — post cover (blurred frame T + title)
```

Run the full render in the background. `compose.py` does the following:
- applies the camera moves to the video only
- overlays the graphics
- applies `voice` cleanup if set
- mixes the SFX bed under the voice, plus music with ducking if set: `"music": {"file": "...", "db": -20}`
- normalizes to −14 LUFS

Never overwrite the source video. Write a new file, with a version suffix (`- edit v2`) on re-renders.

## Step 7 — verify

Make a contact sheet of the output (`ffmpeg -i out.mp4 -vf "fps=1/2,scale=216:-1,tile=10x3" sheet.jpg`) and look at it. Check that the duration matches and that audio is present. Report honestly what you checked (frames) and what you couldn't (you can't listen; the SFX timing is verified against the event list, not by ear).

## Step 8 — offer subtitles and extras (always, at the end)

Once the edit is delivered, ask with AskUserQuestion (multiSelect where it fits). Only offer what wasn't already done:
- **Subtitles**: 3–4 styles from `references/caption-styles.md`, with the chosen style's default (`captions` in styles.json) recommended first and the reason based on *this* video.
- **Cover image** for the post (`render.js cover`).
- **Instagram caption text**: write `<workdir>/post.txt` from the transcript: a hook line, 2–4 short lines of value, the CTA, the link or comment keyword the speaker mentioned, and 8–15 relevant Persian + English hashtags.
- **Save to brand kit**: the chosen style, handle and colors, so the next video starts there.
- **Another style version**: re-render the same plan with a different `style` for A/B testing (only the overlay changes).

For subtitles:

```bash
python <skill>/scripts/captions.py "<workdir>" --style karaoke --zones "0-14.6:1400,29.4-33.8:1400" --default-y 1170 --keywords "رایگان,VPN" --fix "غلط=درست,وی پی این=VPN"
```

Proof-read the printed chunks. Fix Whisper spellings with `--fix`; a multi-word source merges tokens. Add `"captions": {"file": "captions.json"}` to the plan (style defaults to the preset's; set `"style"` to override), run `check` (captions must not cover the face or the stickers either), then render and compose again as a new version.

## Gotchas

- Elements in screen coordinates (click, highlight, callout arrows) misalign if a camera move zooms the same section. Use camera moves on talking-head sections only.
- Camtasia-style animated zooms between face and screen last ~0.5 s. Put the transition element at the *start* of the zoom, and don't put text on screen in that window.
- `steps.hide` hides the step chip during full-face sections and brings it back after.
- Whisper word timestamps can be ~0.1 s late on the first word after a pause. For hard hits (title slam), nudge with `-0.05`.
- Sources that aren't 1080×1920 (e.g. 608×1080 phone exports) are upscaled/cropped to the plan size by compose and preview. Plan coordinates are always in plan-size pixels, so multiply coordinates read off source frames by `1080 / source_width`.
- Handheld phone footage of a monitor: the screen drifts, so screen-pinned elements (click, highlight, arrows) won't stay on target. Use structure (steps), word-anchored stickers in the margins, and full-frame transitions instead.
- Titles get a dark top scrim by default (`"scrim": false` to drop it). It keeps them readable over bright screens.
- Keep the speaker's own voice untouched (no EQ/compression beyond loudness normalization) unless the user chose voice cleanup.
