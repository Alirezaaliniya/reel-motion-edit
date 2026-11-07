---
name: reel-motion-edit
description: Edits a talking-head / screen-recording video or a voice-over (Instagram Reel, Shorts, TikTok, Camtasia export, tutorial) into a motion-graphics cut in a style the user picks at the start from 11 presets — 7 overlay styles on the footage (modern gradient, bold pop, neon tech, clean minimal, hand-drawn doodle, retro VHS, broadcast news) and 4 full-frame animated explainer styles (cinematic line-art, data HUD, warm cream tutorial, pictogram infographic) — plus real 3D looks built with Remotion + Three.js (glossy 3D pop, premium dark 3D) and three custom 2D looks, all shown on one frame in a style gallery; it interviews the user about style, mood, colour, motion, font, sound and captions before designing, or recommends. It adds text and graphics timed to the spoken words, self-drawing illustrations, sound effects that land on real events, transitions, camera moves, a CTA ending, and optional styled subtitles, voice cleanup, pause trimming, a cover image, the user's own mascot and an @handle watermark. Persian/RTL is the first-class case, with bundled Persian fonts. Use this whenever the user hands over a video or voice-over and asks to "edit", "motion graphic", "explainer", "animate", "add effects/elements/sound effects", "make it engaging", or says things like «ادیت موشن گرافیک», «افکت صوتی بذار», «المان اضافه کن», «ترنزیشن», «زیرنویس خلاقانه», «سبک ادیت», «انیمیشن توضیحی», «موشن روی ویس», «کات بزن», «این قسمت رو حذف کن», «کادر امن ریلز», «کات‌اوی», «سه‌بعدی», «سبک پریمیوم» — even if they don't name this skill. Every edit is held to three hard rules: creative (no template recipe), all text inside the Instagram Reels safe area, and cutting (retakes, ranges) offered and applied when the user wants it.
---

# Reel motion-graphics edit

Turns a raw vertical video (or a voice-over) into a finished motion-graphics edit:

```
INTERVIEW (gallery + 4 short question rounds → brief.json) → setup + analyze (in the background)
→ style board on this video + prep options → beat sheet → plan.json (or Remotion 3D project)
→ check + preview loop (approve stills) → render → compose → verify → OFFER: subtitles + extras
```

The overlay is HTML/GSAP rendered frame-by-frame with a transparent background (`assets/engine.html`), so Persian shaping, fonts and gradients are pixel-perfect. You never hand-write animation code: you write a **plan.json** that lists components and their times. The engine animates them in the chosen **style preset**, which sets the look, motion, transitions and sound palette, and gives each component its default sound effects.

There are two **engines**:
- **plan engine** (default): `scripts/render.js` + `assets/engine.html`, driven by plan.json, 11 style presets. Fast to iterate.
- **Remotion engine** (`templates/remotion/`): React + Three.js code per video for real 3D objects (glossy pop or premium dark 3D) and three custom 2D looks. Use it when the user picks gallery styles 12–16 or asks for 3D. Read `references/remotion-3d.md`, start with `scripts/remotion_init.py`.

`gallery/` shows **every style on the same moment, in every way the speaker's face can be used**: A = graphics over the user's talking-head video, B = explainer with the face in a window, C = full-frame graphics without the face, D = Remotion 3D/2D. Style numbers 01–16 stay the same across letters (A04 and C04 are both «مینیمال تمیز»). Sheets: `_gallery-face.jpg` (A+B), `_gallery-graphics.jpg` (C+D), `_gallery.jpg` (all); index in `gallery/README.md`. Show the matching sheet whenever the style is being chosen.

The plan engine has two **modes**:
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
8. **Let the user choose the look, then vary within it.** Interview the user at the very start (Step 1) and build from their answers. Then don't fall back on the same recipe every time: vary the hook format, which components carry the ideas, and the transitions. `references/styles.md` has the per-style playbook and a list of hook formats.

## Step 1 — interview first: ask about the style in detail (before any work)

The user wants every edit to be driven by **questions**: ask about their taste for *this* video before designing anything, and build from the answers. Follow `references/style-interview.md` — it is mandatory. In short:

1. **Round 1, right away** (setup can start in the background): settle **whether the user appears on camera** and how (whole video with overlays / face + cutaways / face in a window / no face), send the matching gallery sheet (`_gallery-face.jpg` or `_gallery-graphics.jpg`), then ask the **edit type** (always, even when the style is known: the user decides it per video) and the **style** (your best 3 gallery codes for this content, e.g. A04, D13 + "suggest after analysis"; any gallery number via "Other"), and 2D vs real 3D when that is open. Send the chosen style's single image(s) large afterwards.
2. **Round 2, after the transcript**: mood (serious / warm / energetic / cinematic), colours (brand / style default / dark + one accent / light), motion intensity (smooth / medium / bouncy), font (the user's Peyda / Hasti / Morabba / Pinar).
3. **Round 3**: SFX amount, music, captions style, hook / intro.
4. **Round 4** (multiSelect, only what applies): real screens from the local site, cut / pause trim / voice cleanup, @handle, CTA wording.

Write the answers to `<workdir>/brief.json` and design only from it. Put your recommendation first in each question with the reason drawn from this video. Skip a question only when the user's message or the brand kit already answers it; if the user says «خودت انتخاب کن», fill the brief yourself and confirm it with one question — never skip the interview silently. Warn once when a choice clashes with the content (a playful toy-like look on a serious product reads as childish).

Edit types for Q1 (skip when the source is audio only: that is always explainer or Remotion):
- *My video + animated cutaways (Recommended for talking heads)* — overlay edit where the explanation parts cut away from the face to designed animated graphics (diagram, chart, phone mockup, logos). Wherever the speaker explains a **product, plugin, setting or a purchase / checkout flow**, the cutaway is a **screen mockup of that feature** (`ui` kind `page`: the WordPress settings page with the toggle being switched on, the checkout form with its login modal, the «my orders» panel empty → filled), built step by step on the words. The user's favourite recipe: follow `references/cutaway-edit.md`.
- *Graphics on my video* (overlay) — text, stickers, steps, SFX over the footage.
- *Full animated explainer* — the frame becomes drawings/diagrams driven by the voice (plan engine explainer styles, or Remotion 2D/3D); the face can appear in windows.
- *Not sure — suggest* — decide after reading the transcript.

Styles (gallery numbers; the letter in front of a number says how the face is used): overlay 01 گرادیانی مدرن `gradient` · 02 پاپ جسور `bold` · 03 نئون `neon` · 04 مینیمال `minimal` · 05 دست‌نویس `doodle` · 06 رترو VHS `retro` · 07 خبری `news`; explainer 08 لاین‌آرت سینمایی `lineglow` · 09 دیتا / HUD `hud` · 10 آموزشی کرم-نارنجی `warmguide` · 11 پیکتوگرامی `pictogram`; Remotion 12 پاپ سه‌بعدی براق `3d-pop` · 13 پریمیوم تیره سه‌بعدی `3d-premium` · 14 مینیمال سیاه‌وسفید · 15 اینفوگرافیک نقشه‌کشی · 16 لاین‌آرت نئونی.

`assets/styles.json` has each plan-engine style's `label`, `en` and `feel`; `gallery/README.md` has all 16 with "best for". **How to recommend** is in `references/styles.md` ("Recommending a style"). For explainer styles, the reference examples are in `references/` (`سبک 1.mp4` lineglow, `سبک 2.mp4` hud, `سبک 3.mp4` warmguide, `سبک 4.mp4` pictogram).

If warmguide (or any style) should show the user's own character, ask for a transparent PNG of it (`plan.mascot` / brand kit `mascot`). Never recreate a character from someone else's video.

## Four hard rules (the user asked for these on every edit)

1. **Creative, not template.** Every edit needs at least **3 creative moves** that come from *this* video's content, not from the generic recipe: a visual metaphor for the topic (e.g. a lock that breaks for a login error, a loading bar that fails), a text animation that acts out the word (a word that shakes on «خطا», types itself on «تایپ», gets crossed out on «اشتباه»), a "reveal" of the payoff, a match cut or transition that rides on the screen motion, a sound design idea tied to the story (error buzz → success chime). Write them in `beats.md` under **Creative moves** *before* writing the plan, and say them to the user in one line when you deliver. If an element would look the same on any other video, it isn't one of the three.
2. **Instagram Reels safe area.** All text, stickers, captions, the CTA and the @handle stay inside **x 60–1020, y 250–1500** (plan px, 1080×1920), and out of the right action rail (**x > 930 for y 1150–1500**) where the like/comment/share buttons sit. Nothing readable goes in the top 250 px (header/username) or the bottom 420 px (caption + audio line). `render.js check` reports a `SAFE` issue for any element that leaves the area at any moment of its animation, so fix every `SAFE` line like a `COVERS` line. Engine defaults (title, step chip, handle) already sit inside it. `"safe": {...}` in the plan overrides the numbers; `"safe": false` only for non-Reels exports (YouTube 16:9).
3. **Cutting when the user wants it.** Always offer cutting in the Step 3 prep options. Also, whenever the user asks to cut, shorten or remove something («کات بزن», «اینجا رو حذف کن», «از ثانیه ۱۰ تا ۱۵ رو بردار», «فقط تا دقیقه ۱»), do it with `tighten.py` (Step 2c). You can also suggest cuts yourself from the transcript: repeated sentences / retakes, "اِ… ببخشید", false starts, a long silent intro, an off-topic tangent. List them with times and get a yes before cutting. Never cut without the user agreeing; pause trimming is a separate opt-in.
4. **Real screens come from the user's LOCAL site, never from a public website.** When a cutaway shows the plugin, a setting, the checkout, the login form or the customer panel, use real screenshots of the user's own local WordPress (e.g. `http://localhost/<site>/`) that they open for you in the built-in browser — not their public site, not Google, not a competitor. Ask for the local URL if you don't have it. Mockups (`ui` kind `page`) are only a fallback for states the local site can't show (say which, in the delivery message). How to capture: see "Capturing real screens" in `references/cutaway-edit.md`.

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

## Step 2c — cut (only if the user wants it)

```bash
# remove ranges (source seconds), keep only a range, and/or trim pauses — preview with --dry-run first
python <skill>/scripts/tighten.py "<video>" "<workdir>/cut.mp4" --cut "12.4-15.0,40-42.5" --no-pauses --dry-run
python <skill>/scripts/tighten.py "<video>" "<workdir>/cut.mp4" --only "3.2-61" --cut "20.1-23.4"
python <skill>/scripts/tighten.py "<video>" "<workdir>/cut.mp4" --cut "12.4-15.0"       # + pause trimming
```

Snap cut points to word boundaries from `analysis/transcript.json` (cut at the end of the last kept word + 0.08 s, resume 0.08 s before the next kept word) so no syllable is clipped. Joins get a 40 ms audio fade automatically. Put a `transition` (`flash`/`wipe`) or a camera `punch` on hard visual jumps so the cut feels intentional. Then **re-run analyze.py on `cut.mp4`** and set `"video"` in the plan to it: all times now refer to the cut file. `cut.cuts.json` records the kept source ranges.

Whisper sometimes misspells Persian or English product names. Note corrections (they matter for captions and for word anchors: anchor on how Whisper spelled the word).

## Step 3 — style board / recommendation + prep options

**Redesign board (cutaway & explainer edits — always).** The user wants to see their own video redesigned before choosing. Once the beat sheet exists, write the plan for the **first cutaway** (its `cutaway` + `ui`/`scene` elements, with the user's fonts in `theme`), pick T in the middle of it when most parts are on screen, and run:

```bash
node <skill>/scripts/render.js "<workdir>/plan.json" styleboard <T> plan            # every style
node <skill>/scripts/render.js "<workdir>/plan.json" styleboard <T> plan bold neon minimal doodle   # a shortlist
```

That renders *this video's* cutaway frame in each style (`build/styleboard.jpg`). Send it, recommend one with a one-line reason, and ask with AskUserQuestion (recommended first + 3 contrasting ones, others via "Other"). Only then design the rest. `STYLEBOARD_W=540` renders bigger tiles; each style is also saved alone as `build/styleboard/<style>.jpg`. If the interview already settled the style, render only that style plus 2–3 close alternatives so the user sees it on their own content. For a plain overlay edit the classic board below is enough.

If the user asked for a suggestion or the board (Step 1), build a **style board**: one representative frame rendered in every preset. Write a minimal plan first (video + `mode` + a title + one keyword + steps if the video has steps), then run:

```bash
node <skill>/scripts/render.js "<workdir>/plan.json" styleboard <T>    # → build/styleboard.jpg
```

In overlay mode it shows a frame of *their* video in all 11 presets (the explainer ones as a tinted panel); in explainer mode it shows the 4 explainer styles on their own backgrounds with a demo drawing and their subtitle look. Pick T where the frame is typical (not a transition). Send the image (SendUserFile, display render), give your recommendation with a one-line reason based on *this* content, and confirm with AskUserQuestion (recommended first, three contrasting alternatives, others via "Other"). If the user already named a style, skip the board.

Ask the **prep options** (multiSelect) in the same call, only the ones that apply:
  - *Cut parts of the video*: always offer it. Show the cut candidates you found (retakes, false starts, dead intro/outro) with times, or let the user type ranges. Runs `tighten.py --cut/--only` (Step 2c) before the final analysis.
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
- the **safe zones** per layout: where overlays can sit without hiding the face, the cursor or the thing being demonstrated, intersected with the Reels safe area (rule 2)
- a **Creative moves** section: the ≥3 content-specific ideas (rule 1), each with its time and which component/SFX carries it

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
    {"type": "title", "t": 0, "d": 3.8, "kicker": "آموزش ۶۰ ثانیه‌ای", "lines": ["`VPN` *رایگان*"], "sub": "با سرورهای فایرفاکس"},
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
- `SAFE`: text outside the Instagram Reels safe area (hard rule 2) — move it in (y 250–1500, x 60–1020, off the right rail)
- `ORDER`: a word anchor hit an earlier occurrence, so use `w:word#2`
- `EMPTY` (explainer): a stretch ≥ 1 s with nothing but captions on screen
- `NOVIDEO` (explainer): `footage` windows but the source is audio only

Fix every issue. Before the full render, send the user 3–6 preview stills of the key beats and ask one question (approve / change something), as the interview reference says. Then look at `build/preview.jpg`: pick times mid-animation for each important element, and check that callouts and ripples sit exactly on their targets. Read coordinates off full-resolution frames (`ffmpeg -ss T -i video -frames:v 1 f.png`) rather than guessing from thumbnails. Iterate until it's right. Previews are cheap, full renders are not.

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

Re-check that no text sits in the top 250 px / bottom 420 px / right rail on the output frames. Make a contact sheet of the output (`ffmpeg -i out.mp4 -vf "fps=1/2,scale=216:-1,tile=10x3" sheet.jpg`) and look at it. Check that the duration matches and that audio is present. Report honestly what you checked (frames) and what you couldn't (you can't listen; the SFX timing is verified against the event list, not by ear).

## Step 9 — offer subtitles and extras (always, at the end)

Once the edit is delivered, ask with AskUserQuestion (multiSelect where it fits). Only offer what wasn't already done:
- **Subtitles**: 3–4 styles from `references/caption-styles.md`, with the chosen style's default (`captions` in styles.json) recommended first and the reason based on *this* video.
- **Cover image** for the post (`render.js cover`).
- **Instagram caption text**: write `<workdir>/post.txt` from the transcript: a hook line, 2–4 short lines of value, the CTA, the link or comment keyword the speaker mentioned, and 8–15 relevant Persian + English hashtags.
- **Save to brand kit**: the chosen style, handle and colors, so the next video starts there.
- **Another style version**: re-render the same plan with a different `style` for A/B testing (only the overlay changes).

For subtitles:

```bash
python <skill>/scripts/captions.py "<workdir>" --style karaoke --zones "0-14.6:1340,29.4-33.8:1340" --default-y 1170 --keywords "رایگان,VPN" --fix "غلط=درست,وی پی این=VPN"
```

Proof-read the printed chunks. Fix Whisper spellings with `--fix`; a multi-word source merges tokens. Add `"captions": {"file": "captions.json"}` to the plan (style defaults to the preset's; set `"style"` to override), run `check` (captions must not cover the face or the stickers either), then render and compose again as a new version.

## Gotchas

- Remotion engine: animate only from `useCurrentFrame()`, provide the look context both outside and inside `<ThreeCanvas>`, render with `--gl=angle`, run `npx remotion` from the project folder. More in `references/remotion-3d.md`.

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
- Phone videos are often stored 1920×1080 with a −90° rotation flag. `analyze.py` reports the displayed size (1080×1920) and ffmpeg auto-rotates. Don't trust a raw `ffprobe` width/height.
- Text that's too wide for the safe area is fitted automatically: title lines shrink, and wide cards (compare, notes) are capped or scaled to the safe width once the real fonts are loaded. Still read the preview: a shrunken line may be too small to read, and then shortening the text is the better fix.
- Retake-heavy recordings (the speaker repeats a sentence until it comes out right): keep the **last complete** take of each sentence, unless an earlier one is clearly better, and list what you cut in `beats.md` so the user can ask for any part back.
