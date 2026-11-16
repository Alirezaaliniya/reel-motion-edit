# Plan Engine workflow

Production decisions and approval follow [SKILL.md](../SKILL.md). This document is the technical reference.

## راهنمای فنی و اجرای ابزارها (Technical Execution Steps)


## Step 2 — setup (first run on a machine)

```bash
python <skill>/scripts/setup.py
```

Installs faster-whisper, puppeteer-core and gsap into `~/.cache/reel-motion-edit/`, synthesizes the SFX library, and downloads the Whisper model (`large-v3-turbo`, ~1.6 GB; it resumes and falls back to hf-mirror.com if huggingface.co is blocked or drops). This is the "download what you need" step, so do it without asking. Tell the user in one line what is downloading. Run it in the background (you can start it while the Step 1 question is open): the model can take a while on slow connections. Meanwhile you can do the visual analysis with `analyze.py --no-transcript`, then rerun it for the transcript later. Re-run `scripts/sfx.py ~/.cache/reel-motion-edit/sfx` after updating the skill, so new style sounds exist. Set `CHROME_PATH` if Chrome/Edge isn't in a standard location.

If you find a useful extra asset (a font, an icon set, a royalty-free SFX or music track), download it into the work dir. **The editor has full download authority** (see the Modern 2025 & Asset Sourcing section): fetch any needed footage, textures, 3D icons, photos, brand icons or sounds from any source without asking, and log licenses in `<workdir>/CREDITS.txt`. Note its license in `<workdir>/CREDITS.txt`. Prefer OFL/CC0 sources (Google Fonts, Pixabay/Freesound CC0). Bundled fonts: Vazirmatn (body), Lalezar (display), Changa (tech), Lemonada (playful), Noto Kufi Arabic (formal), Estedad (rounded geometric, explainer styles), JetBrains Mono (Latin monospace for HUD readouts). **The user's own fonts** live in `assets/fonts/user/<Family>/` (git-ignored, never published — most are commercial): currently `YekanBakh` (Variable + all weights Thin…Fat + FaNum), `IRANSansX` (Variable + all weights Thin…Black), `Peyda` (Thin…Black, Persian digits), `Hasti` (Heavy, display), `Pinar` (Variable + FD), `Morabba` (Variable) and `Kalameh`. They load automatically; use them via `theme` (e.g. `{"display": "Hasti", "body": "Peyda"}` or `{"display": "YekanBakh", "body": "IRANSansX"}`) and prefer them over the bundled fonts, because the user finds those more beautiful. A file ending in a weight word (`-Bold`, `-Black`…) becomes that weight; other files are treated as variable. To add another font, copy it into a new family folder there. Fonts can also be added per video via `plan.fonts`. Look in `%LOCALAPPDATA%\Microsoft\Windows\Fonts` and `C:\Windows\Fonts`.

**Bundled assets (all generated from code, original, CC0 — safe in the public repo).** `assets/sfx/` 27 story sounds on top of the base library (lock, unlock, SMS, vibrate, cash register, stamp, toggle, page flip, cinematic boom, soft premium set…); `assets/footage/` 9 effect loops (light leaks, film grain, dust, bokeh, VHS noise, sparkles, light sweep, gradient mesh) laid over the picture with `footageFx`; `scripts/music.py` makes an original music bed in 6 moods at the video's exact length (previews in `assets/music/`). Usage and which fits which style: `references/components.md` (end). The user's own downloads go in `assets/sfx/user/` and `assets/footage/user/`. Kenney.nl blocks automated downloads, so don't try to fetch packs yourself; the user can download them in a browser and drop them there.

**Brand kit.** If `~/.config/reel-motion-edit/brand.json` exists, render.js applies it automatically: `style`, `theme` (brand colors), `fonts`, `logo`, `mascot`. The plan overrides it; `"brand": false` ignores it for one video. When the user tells you a lasting preference (a style they always want, brand colors, their mascot image), offer to save it there.

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

## Step 3 — style board and optional prep

Use the selected style directly when the user has provided it. If the user requests a comparison or an open choice will materially affect the edit, render a representative moment with the relevant styles:

```powershell
$env:STYLEBOARD_W='540'
node scripts/render.js work/reel/plan.json styleboard 8.6 plan nias glass
```

This creates `build/styleboard.jpg` and one rendered tile per selected style. For cutaways, choose a frame where the subject and information hierarchy are clear. Compare the board with the matching reference frame when one is supplied. See the [gallery](../gallery/README.md) for layout and style examples.

Offer pause removal, tighter cuts or voice cleanup when they address an observed issue and fit the user's requested scope. If the user wants to preserve the edit or the media is already cut, keep the original source and analysis timeline. Additional guidance is in [Smart Mode](style-interview.md).

## Step 4 — beat sheet (think before designing)

Write `<workdir>/beats.md`: one line per beat with time range, what is **said**, what is **shown**, and the layout (full face / screen + PIP bottom-left / handheld screen / …). Mark:
- the **hook** (first 1–3 s): pick a hook format from `references/styles.md`, a different one than last time if you know it
- each **step / idea** the speaker explains
- the **payoff moment** (result shown: "connected", "done", the number)
- the **CTA** at the end
- **layout changes** (zoom between camera and screen): transition points
- the **safe zones** per layout: where overlays can sit without hiding the face, the cursor or the thing being demonstrated, intersected with the Reels safe area (rule 2)
- a **Creative moves** section: the ≥3 content-specific ideas (rule 1), each with its time and which component/SFX carries it

Read `references/styles.md` (the chosen style's playbook), `references/text-animations.md` (title/keyword motion),
`references/transitions.md` (the cut vocabulary) and `references/creative-direction.md` (pacing, placement, SFX
rules). `references/creative-editing.md` has the structures, rhythm math and pattern-interrupt menu. They're short
and they're the difference between "busy" and "pro".

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
  "avoid": [{"name": "face", "from": 0, "to": 14.6, "rect": [200, 420, 680, 900]},
            {"name": "pip",  "from": 15, "to": 29.1, "rect": [0, 1300, 510, 620]}],
  "elements": [
    {"type": "keyword", "t": 0, "d": 3.8, "x": 540, "y": 470, "text": "`VPN` *رایگان*", "size": 92},
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
- `OPTION` (ANIM/STYLE/KIND): a `title.anim`, `keyword.style`/`from`, transition `kind`, `captions.style` or `fx.kind`
  that doesn't exist — the report suggests the closest real option (a typo silently falls back to the default look)
- `TRDENSE`: transitions closer together than ~1 per 3.5 s — vary the rhythm or drop some (`references/transitions.md`)
- `DUPTEXT`: a title line repeating what the captions already say at the same moment — say it once
- `EMPTY` (explainer): a stretch ≥ 1 s with nothing but captions on screen
- `NOVIDEO` (explainer): `footage` windows but the source is audio only

Fix blockers and review advisory findings. Inspect key stills before full render; share a preview when a material creative choice needs user input. Then look at `build/preview.jpg`: pick times mid-animation for each important element, and check that callouts and ripples sit exactly on their targets. Read coordinates off full-resolution frames (`ffmpeg -ss T -i video -frames:v 1 f.png`) rather than guessing from thumbnails. Iterate until it's right. Previews are cheap, full renders are not.

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
- ducks the SFX bed under the voice by default for Instagram delivery
- normalizes to −14 LUFS

In explainer mode compose stacks `build/bg.png` → footage windows → overlay and takes only the voice from the source (an audio file is fine); camera moves are already inside the overlay.

Never overwrite the source video. Write a new file, with a version suffix (`- edit v2`) on re-renders.

## Step 8 — verify

Re-check that no text sits in the top 250 px / bottom 420 px / right rail on the output frames. Make a contact sheet of the output (`ffmpeg -i out.mp4 -vf "fps=1/2,scale=216:-1,tile=10x3" sheet.jpg`) and look at it. Check that the duration matches and that audio is present. Report what you verified. Listen to the final mix when playback is available; checking the event list alone does not verify sound quality.

## Gotchas

- Remotion engine: animate only from `useCurrentFrame()`, provide the look context both outside and inside `<ThreeCanvas>`, render with `--gl=angle`, run `npx remotion` from the project folder. More in `references/remotion-3d.md`.
- **Custom motion / GSAP:** the engine animates everything on one paused GSAP timeline; `EasePack`, `CustomEase` and `MotionPathPlugin` are loaded and registered at render time, so bespoke scene/component work can draw along paths and use signature eases. To add a bespoke component, edit `assets/engine.html` following the timeline conventions in `references/gsap.md`; further plugins live in `~/.cache/reel-motion-edit/node/node_modules/gsap/dist/` (register them in `scripts/render.js`).

- Explainer scenes are drawn in frame pixels (1080×1920). Keep drawings in y 300–1300 so the title above and the subtitle below stay clear; preview mid-draw times to check the build-up order.
- The mascot is always the user's own image. Characters, logos or illustrations from reference videos are never redrawn or traced.
- Elements in screen coordinates (click, highlight, callout arrows) misalign if a camera move zooms the same section. Use camera moves on talking-head sections only.
- Camtasia-style animated zooms between face and screen last ~0.5 s. Put the transition element at the *start* of the zoom, and don't put text on screen in that window.
- `steps.hide` hides the step chip during full-face sections and brings it back after.
- Whisper word timestamps can be ~0.1 s late on the first word after a pause. For hard hits (title slam), nudge with `-0.05`.
- Sources that aren't 1080×1920 (e.g. 608×1080 phone exports) are upscaled/cropped to the plan size by compose and preview. Plan coordinates are always in plan-size pixels, so multiply coordinates read off source frames by `1080 / source_width`.
- **Full-res review before the final render:** the preview grid tiles are ~365 px — fine composition, typography, contrast and shadow weight are invisible at that size. Before rendering, view at least 6 key frames at full resolution (`build/preview/o_*.png`) and check: text contrast against its card/background (dark text on dark card is the classic miss — `note` and `glass` components), font weight ≤ 800 on flat paper styles, and shadows only on elements that sit over footage or stickers (flat scenes get soft or no shadows).
- **Learned/bespoke presets must declare `extends`** (closest built-in preset) — the engine keys all per-component CSS (white note cards, soft shadows, caption looks) to `st-<styleName>`, so a preset without a parent falls back to the dark base look. Use the preset's `css` field (namespaced `.st-<key>`) for fine-tuning. See `references/style-dna.md`.
- **Real product names → real logos.** When the video introduces actual tools/brands, download their icon (simple-icons, CC0: `curl https://cdn.simpleicons.org/<slug>/<color>` → `<workdir>/icons/`) and use `img:icons/<slug>.svg` or an `<image>` in the scene svg; fall back to a colored monogram only for brands missing there. Don't copy logos/characters from the user's reference videos, and don't settle for generic glyphs when a real logo is one download away.
- Handheld phone footage of a monitor: the screen drifts, so screen-pinned elements (click, highlight, arrows) won't stay on target. Use structure (steps), word-anchored stickers in the margins, and full-frame transitions instead.
- Titles get a dark top scrim by default (`"scrim": false` to drop it). It keeps them readable over bright screens.
- Sound levels: `sfxMix` defaults are `{gain: 0, minGap: 0.6, perElement: 1, duck: false}` — normal loudness, fewer sounds. For Instagram delivery, ducking defaults on unless the plan overrides it. Tune gain against the final mix.
- Raw `<text>` in scene svg: always set `text-anchor='middle'` (Persian text is RTL, so the default anchor puts it on the wrong side of x) and `direction='ltr'` on Latin/number runs like tracking codes.
- Keep the speaker's own voice untouched (no EQ/compression beyond loudness normalization) unless the user chose voice cleanup.
- Phone videos are often stored 1920×1080 with a −90° rotation flag. `analyze.py` reports the displayed size (1080×1920) and ffmpeg auto-rotates. Don't trust a raw `ffprobe` width/height.
- Text that's too wide for the safe area is fitted automatically: title lines shrink, and wide cards (compare, notes) are capped or scaled to the safe width once the real fonts are loaded. Still read the preview: a shrunken line may be too small to read, and then shortening the text is the better fix.
- Retake-heavy recordings (the speaker repeats a sentence until it comes out right): keep the **last complete** take of each sentence, unless an earlier one is clearly better, and list what you cut in `beats.md` so the user can ask for any part back.
