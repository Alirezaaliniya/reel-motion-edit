---
name: reel-motion-edit
description: Edits a talking-head / screen-recording video or a voice-over (Instagram Reel, Shorts, TikTok, Camtasia export, tutorial) into a motion-graphics cut in a style the user picks at the start from 11 presets — 7 overlay styles on the footage (modern gradient, bold pop, neon tech, clean minimal, hand-drawn doodle, retro VHS, broadcast news) and 4 full-frame animated explainer styles (cinematic line-art, data HUD, warm cream tutorial, pictogram infographic) — or one Claude recommends. It adds text and graphics timed to the spoken words, self-drawing illustrations, sound effects that land on real events, transitions, camera moves, a CTA ending, and optional styled subtitles, voice cleanup, pause trimming, a cover image, the user's own mascot and an @handle watermark. Persian/RTL is the first-class case, with bundled Persian fonts. Use this whenever the user hands over a video or voice-over and asks to "edit", "motion graphic", "explainer", "animate", "add effects/elements/sound effects", "make it engaging", or says things like «ادیت موشن گرافیک», «افکت صوتی بذار», «المان اضافه کن», «ترنزیشن», «زیرنویس خلاقانه», «سبک ادیت», «انیمیشن توضیحی», «موشن روی ویس» — even if they don't name this skill.
---

# Reel motion-graphics edit

Turns a raw vertical video (or a voice-over) into a finished motion-graphics edit:

```
ASK FIRST: edit type + style (or "suggest one") → setup + analyze (in the background)
→ style board / recommendation (if asked) + prep options → beat sheet → plan.json
→ check + preview loop → render overlay → compose → verify → OFFER: subtitles + extras
```

The overlay is HTML/GSAP rendered frame-by-frame with a transparent background (`assets/engine.html`), so Persian shaping, fonts and gradients are pixel-perfect. You never hand-write animation code: you write a **plan.json** that lists components and their times. The engine animates them in the chosen **style preset**, which sets the look, motion, transitions and sound palette, and gives each component its default sound effects.

There are two **modes**:
- **overlay** (default): graphics on top of the user's footage (talking head, screen recording).
- **explainer** (`"mode": "explainer"`): the whole frame is graphics — self-drawing line art, diagrams, UI cards, a word-by-word subtitle — driven by the voice. The source can be an audio file; the real video can still appear in `footage` windows. Read `references/explainer.md` whenever this mode is chosen.

Talk to the user in their language (usually Persian). Keep the progress updates short.

## Why the edit should feel "exactly in place" — and not samey

Viewers notice when a graphic or sound is half a second off, or when it has nothing to do with what's being said. That is what makes an edit look amateur. Earlier edits were criticized for exactly that: decorative badges appeared over the speaker's face that didn't match what he was saying. Later, the user also said the edits had started to look **repetitive**, then that there were **too many, too loud sound effects**, **no intro**, **no colour correction**, and **emoji he doesn't want**. These ideas fix all of that, and the tools enforce most of them:

1. **Anchor to the words.** Any text that echoes speech uses a word anchor (`"t": "w:رایگان"`), so it pops on the syllable, not near it. Hand-typed seconds are only for purely visual events.
2. **Anchor to the picture.** Clicks, page changes and layout zooms come from `motion.json` events (`"t": "m:m12"`) and from the timestamped contact sheets you read yourself. A click SFX without a visible click is noise.
3. **Protect the face.** Declare the face and PIP rectangles in `plan.avoid`. `render.js check` then flags any element that covers them. Fix every `COVERS` warning before rendering.
4. **Fewer sounds, at their normal level.** The user said there were too many sound effects; after trying quieter ones he asked for the original loudness back. So `render.js` thins them (`sfxMix`: one per element, 0.6 s apart) but keeps their level (`gain: 0`, no ducking). Add manual `sfx` only for the hook, a section change, the payoff and the CTA, and mute (`"sfx": false`) the parts of a cutaway graphic that don't need their own sound. `check` warns `SFXDENSE` above ~1 sound per 2.5 s.
5. **No emoji.** The user doesn't want emoji anywhere in the edit. Use the built-in icons (`icon` / `kickerIcon` / `items[].icon` names, see `references/components.md`) or an image (`"icon": "img:<file>"`, PNG/SVG next to the plan). `check` flags every emoji as `EMOJI`; fix them all.
6. **Always open with an intro and grade the picture.** Every edit starts with an intro move (style default: flash / split / iris / glitch / fade, plus a short punch-out of the footage) — render.js adds one if the plan has none; tune it with `"intro": {"kind": "iris"}` or `false`. The footage gets a **visible** colour correction (`"grade"`: `punchy` · `glow` · `film` are the strong ones and the style defaults; `natural` · `vivid` · `warm` · `cool` · `cinematic` · `bright` are subtle — the user found those invisible, so don't pick them unless asked; a raw ffmpeg filter or `false` also work). Unsure which? Render a before/after strip of one frame with 2–3 grades and let the user pick. The preview shows the grade.
7. **Cut away from the face to animated graphics.** It's fine — and the user wants it — to hide the footage completely for a few seconds and show an animated element instead while the voice continues: a `cutaway` element (style background, or `"bg": "blur"`) followed by the elements that build the graphic. Use it where the speaker explains a mechanism, a comparison or a process (2–4 per minute, 4–10 s each, never the hook's first 3 s or the CTA). **Make it a designed visual, not a text list**: a diagram with arrows (you → middle service → post/courier), a bar chart for prices, a phone mockup whose screen fills in step by step (order card → "registered" pill → barcode tracking code → arrow to the customer with a message bubble), logos, icons — drawn with `scene` svg + `icon`/`keyword`/`ui`, each part revealed on the word that names it (`data-at`). A `ui` checklist of plain lines is not enough. The face zone isn't protected inside a cutaway (`check` skips COVERS/CLUTTER there).
8. **Let the user choose the look, then vary within it.** Ask for a style at the very start (Step 1). Then don't fall back on the same recipe every time: vary the hook format, which components carry the ideas, and the transitions. `references/styles.md` has the per-style playbook and a list of hook formats.

## Step 1 — ask first: edit type + style (before any work)

As soon as the user hands over the file, ask with AskUserQuestion — before setup or analysis, so nothing is designed in the wrong direction. Skip a question the user already answered in their message, or that the brand kit (`style`) answers, unless they ask for something different. Ask both in one call:

- **Q1 — edit type** (skip when the source is audio only: that is always explainer):
  - *My video + animated cutaways (Recommended for talking heads)* — overlay edit where the explanation parts cut away from the face to designed animated graphics (diagram, chart, phone mockup, logos). The user's favourite recipe: follow `references/cutaway-edit.md`.
  - *Graphics on my video* (overlay) — text, stickers, steps, SFX over the footage.
  - *Full animated explainer* — the frame becomes drawings/diagrams driven by the voice; the face can appear in windows.
  - *Not sure — suggest* — decide after reading the transcript.
- **Q2 — style**:
  - *Suggest one for me (Recommended)* — after the analysis you recommend with a one-line reason and show the style board.
  - *Show me the style board first* — render it (Step 3) and ask again with the best 4 for this video.
  - *Overlay styles* — description lists: گرادیانی مدرن `gradient` · پاپ جسور `bold` · نئون `neon` · مینیمال `minimal` · دست‌نویس `doodle` · رترو VHS `retro` · خبری `news`.
  - *Explainer styles* — لاین‌آرت سینمایی `lineglow` · دیتا / HUD `hud` · آموزشی کرم-نارنجی `warmguide` · اینفوگرافیک پیکتوگرامی `pictogram`.
  Say in the question that a style name can be typed via "Other". If the user picks a *family*, ask one follow-up with that family's styles (4 max per question: recommend the best fit first, the rest via "Other").

`assets/styles.json` has each style's `label`, `en` and `feel`; use them for one-line descriptions. If the user doesn't care ("just edit it"), pick for them, say which and why, and go. **How to recommend** is in `references/styles.md` ("Recommending a style"). For explainer styles, the reference examples are in `references/` (`سبک 1.mp4` lineglow, `سبک 2.mp4` hud, `سبک 3.mp4` warmguide, `سبک 4.mp4` pictogram).

If warmguide (or any style) should show the user's own character, ask for a transparent PNG of it (`plan.mascot` / brand kit `mascot`). Never recreate a character from someone else's video.

## Step 2 — setup (first run on a machine)

```bash
python <skill>/scripts/setup.py
```

Installs faster-whisper, puppeteer-core and gsap into `~/.cache/reel-motion-edit/`, synthesizes the SFX library, and downloads the Whisper model (`large-v3-turbo`, ~1.6 GB; it resumes and falls back to hf-mirror.com if huggingface.co is blocked or drops). This is the "download what you need" step, so do it without asking. Tell the user in one line what is downloading. Run it in the background (you can start it while the Step 1 question is open): the model can take a while on slow connections. Meanwhile you can do the visual analysis with `analyze.py --no-transcript`, then rerun it for the transcript later. Re-run `scripts/sfx.py ~/.cache/reel-motion-edit/sfx` after updating the skill, so new style sounds exist. Set `CHROME_PATH` if Chrome/Edge isn't in a standard location.

If you find a useful extra asset (a font, an icon set, a royalty-free SFX or music track), download it into the work dir. Note its license in `<workdir>/CREDITS.txt`. Prefer OFL/CC0 sources (Google Fonts, Pixabay/Freesound CC0). Bundled fonts: Vazirmatn (body), Lalezar (display), Changa (tech), Lemonada (playful), Noto Kufi Arabic (formal), Estedad (rounded geometric, explainer styles), JetBrains Mono (Latin monospace for HUD readouts). **The user's own fonts** live in `assets/fonts/user/<Family>/` (git-ignored, never published — most are commercial): currently `Peyda` (Thin…Black, Persian digits), `Hasti` (Heavy, display), `Pinar` and `Morabba` (variable). They load automatically; use them via `theme` (e.g. `{"display": "Hasti", "body": "Peyda"}`) and prefer them over the bundled fonts, because the user finds those more beautiful. A file ending in a weight word (`-Bold`, `-Black`…) becomes that weight; other files are treated as variable. To add another font, copy it into a new family folder there. Fonts can also be added per video via `plan.fonts`. Look in `%LOCALAPPDATA%\Microsoft\Windows\Fonts` and `C:\Windows\Fonts`.

**Brand kit.** If `~/.config/reel-motion-edit/brand.json` exists, render.js applies it automatically: `style`, `theme` (brand colors), `fonts`, `handle` (@username watermark), `handleCorner`, `logo`, `mascot`. The plan overrides it; `"brand": false` ignores it for one video. When the user tells you a lasting preference (their handle, a style they always want, brand colors, their mascot image), offer to save it there.

## Step 2b — analyze

Make a work dir next to the video (`<video dir>/<video name>_edit/`) and run:

```bash
python <skill>/scripts/analyze.py "<video or audio>" "<workdir>" --lang fa
```

Then **read** `analysis/transcript.txt` and every `analysis/sheets/sheet_*.jpg` (10 s each, 0.5 s per cell, timestamped). The motion events printed by the script (`m0 … mN`, `cut`/`change`) are candidates. Confirm each one against the sheets, because a scroll also shows up as "change". An audio-only source has no sheets or motion events: the transcript is your only clock.

Whisper sometimes misspells Persian or English product names. Note corrections (they matter for captions and for word anchors: anchor on how Whisper spelled the word).

## Step 3 — style board / recommendation + prep options

If the user asked for a suggestion or the board (Step 1), build a **style board**: one representative frame rendered in every preset. Write a minimal plan first (video + `mode` + a title + one keyword + steps if the video has steps), then run:

```bash
node <skill>/scripts/render.js "<workdir>/plan.json" styleboard <T>    # → build/styleboard.jpg
```

In overlay mode it shows a frame of *their* video in all 11 presets (the explainer ones as a tinted panel); in explainer mode it shows the 4 explainer styles on their own backgrounds with a demo drawing and their subtitle look. Pick T where the frame is typical (not a transition). Send the image (SendUserFile, display render), give your recommendation with a one-line reason based on *this* content, and confirm with AskUserQuestion (recommended first, three contrasting alternatives, others via "Other"). If the user already named a style, skip the board.

Ask the **prep options** (multiSelect) in the same call, only the ones that apply:
  - *Trim pauses (jump cuts)*: `tighten.py` removes silences longer than ~0.45 s. Best for talking-head videos and voice-overs (audio-only files work too). On screen recordings, warn that silent stretches may be where the clicking happens. It changes the timeline, so it runs **before** analysis: re-run analyze on the tightened file.
  - *Voice cleanup*: `"voice": "enhance"` (denoise, rumble cut, presence, gentle compression). Recommend it for phone or room audio.
  - *@handle watermark*: ask for the handle if the brand kit doesn't have one.
  - *Background music*: only if the user has a track or wants you to find a CC0 one. It's ducked under the voice automatically.

## Step 4 — beat sheet (think before designing)

Write `<workdir>/beats.md`: one line per beat with time range, what is **said**, what is **shown**, and the layout (full face / screen + PIP bottom-left / handheld screen / …). Mark:
- the **hook** (first 1–3 s): pick a hook format from `references/styles.md`, a different one than last time if you know it
- each **step / idea** the speaker explains
- the **payoff moment** (result shown: "connected", "done", the number)
- the **CTA** at the end
- **layout changes** (zoom between camera and screen): transition points
- the **safe zones** per layout: where overlays can sit without hiding the face, the cursor or the thing being demonstrated

Read `references/styles.md` (the chosen style's playbook) and `references/creative-direction.md` (pacing, placement, SFX rules). They're short and they're the difference between "busy" and "pro".

**Cutaway edit:** also mark the 2–4 explanation stretches that become cutaways and the picture each one gets; `references/cutaway-edit.md` has the layout bands, ready-made blocks (flow diagram, price bars, phone mockup, logo cards) and the approved plan as `examples/plan.cutaway.json`.

**Explainer mode:** the beat sheet is one line per sentence: words → the picture metaphor → how it builds (which word reveals which part) → the transition to the next scene. Read `references/explainer.md` first; it has the scene shapes and per-style recipes.

## Step 5 — plan.json

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
    {"type": "keyword", "t": "w:رایگان", "x": 540, "y": 1640, "text": "رایگان", "icon": "gift"},
    {"type": "success", "t": "w:وصل", "x": 405, "y": 678, "title": "وصل شدی!"},
    {"type": "cta", "t": 57.4, "items": [{"text": "سیو کن", "icon": "save"}, {"text": "فالو کن", "icon": "follow"}]}
  ],
  "camera": [{"t": "w:رایگان", "d": 1.2, "type": "punch", "scale": 1.12, "cx": 540, "cy": 700}],
  "sfx": [{"t": 16.2, "name": "typing", "db": -8}],
  "cover": {"lines": ["`VPN` *رایگان*"], "sub": "آموزش ۶۰ ثانیه‌ای"}
}
```

**Explainer plans** add `"mode": "explainer"` and are mostly `scene` elements (built-in pictogram `items` and/or raw `svg`), plus `readout`, `segbar`, `ui`, `choice`, `counter`, `title`, `footage` windows and captions planned from the start. See `examples/plan.explainer.json` and `references/explainer.md`. Run `check` until there is no `EMPTY` gap.

**Let the style decide the look.** Leave visual props (`theme` colors, keyword `style`/`rotate`/`from`, transition `kind`, title `anim`, caption style) unset unless you have a semantic reason (red for an error, a brand color). The preset fills them in, and that is what makes styles feel different. A transition without `kind` cycles through the style's transitions. `theme` in the plan only overrides the preset (e.g. the product's brand color).

Text syntax: `*word*` or `*two words*` = highlight, `` `latin` `` = isolated LTR run (keeps "VPN"/URLs from flipping inside RTL text), `~word~` = struck through (line drawn on), `^word^` = secondary colour.

## Step 6 — check, preview, fix (loop)

```bash
node <skill>/scripts/render.js "<workdir>/plan.json" check
node <skill>/scripts/render.js "<workdir>/plan.json" preview 1 5.5 15.8 21.1 27.4 54
```

`check` prints the resolved timeline and lints for:
- `COVERS`: an element over a protected zone
- `OFFFRAME`
- `CLUTTER`: more than 3 overlays at once
- `SFXPILE`: sounds stacked inside 0.35 s
- `SFXDENSE`: too many sounds overall (more than ~1 per 2.5 s)
- `EMOJI`: an emoji in any text/icon prop — replace it with an icon name or `img:<file>`
- `ORDER`: a word anchor hit an earlier occurrence, so use `w:word#2`
- `EMPTY` (explainer): a stretch ≥ 1 s with nothing but captions on screen
- `NOVIDEO` (explainer): `footage` windows but the source is audio only

Fix every issue. Then look at `build/preview.jpg`: pick times mid-animation for each important element, and check that callouts and ripples sit exactly on their targets. Read coordinates off full-resolution frames (`ffmpeg -ss T -i video -frames:v 1 f.png`) rather than guessing from thumbnails. Iterate until it's right. Previews are cheap, full renders are not.

## Step 7 — render and compose

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
- applies the colour grade (`grade`) to the footage
- ducks the SFX bed under the voice
- normalizes to −14 LUFS

In explainer mode compose stacks `build/bg.png` → footage windows → overlay and takes only the voice from the source (an audio file is fine); camera moves are already inside the overlay.

Never overwrite the source video. Write a new file, with a version suffix (`- edit v2`) on re-renders.

## Step 8 — verify

Make a contact sheet of the output (`ffmpeg -i out.mp4 -vf "fps=1/2,scale=216:-1,tile=10x3" sheet.jpg`) and look at it. Check that the duration matches and that audio is present. Report honestly what you checked (frames) and what you couldn't (you can't listen; the SFX timing is verified against the event list, not by ear).

## Step 9 — offer subtitles and extras (always, at the end)

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

- Explainer scenes are drawn in frame pixels (1080×1920). Keep drawings in y 300–1300 so the title above and the subtitle below stay clear; preview mid-draw times to check the build-up order.
- The mascot is always the user's own image. Characters, logos or illustrations from reference videos are never redrawn or traced.
- Elements in screen coordinates (click, highlight, callout arrows) misalign if a camera move zooms the same section. Use camera moves on talking-head sections only.
- Camtasia-style animated zooms between face and screen last ~0.5 s. Put the transition element at the *start* of the zoom, and don't put text on screen in that window.
- `steps.hide` hides the step chip during full-face sections and brings it back after.
- Whisper word timestamps can be ~0.1 s late on the first word after a pause. For hard hits (title slam), nudge with `-0.05`.
- Sources that aren't 1080×1920 (e.g. 608×1080 phone exports) are upscaled/cropped to the plan size by compose and preview. Plan coordinates are always in plan-size pixels, so multiply coordinates read off source frames by `1080 / source_width`.
- Handheld phone footage of a monitor: the screen drifts, so screen-pinned elements (click, highlight, arrows) won't stay on target. Use structure (steps), word-anchored stickers in the margins, and full-frame transitions instead.
- Titles get a dark top scrim by default (`"scrim": false` to drop it). It keeps them readable over bright screens.
- Sound levels: `sfxMix` defaults are `{gain: 0, minGap: 0.6, perElement: 1, duck: false}` — normal loudness, fewer sounds. Change the level only when the user asks (`gain` in dB, `duck: true` to dip effects under speech).
- Raw `<text>` in scene svg: always set `text-anchor='middle'` (Persian text is RTL, so the default anchor puts it on the wrong side of x) and `direction='ltr'` on Latin/number runs like tracking codes.
- Keep the speaker's own voice untouched (no EQ/compression beyond loudness normalization) unless the user chose voice cleanup.
