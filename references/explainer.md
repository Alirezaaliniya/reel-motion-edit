# Explainer mode (full-frame animated video)

`"mode": "explainer"` turns the whole frame into graphics: a voice-over (audio file, or a video whose picture is
dropped) drives scenes of line drawings, diagrams, UI cards and a subtitle. It is how the four explainer styles
(`lineglow`, `hud`, `warmguide`, `pictogram`) are meant to be used, and any other preset can use it with `plan.bg`.

Layer stack (compose.py): `build/bg.png` (style background) → **footage windows** (the source video cropped into
`footage` rects, rounded, fading in/out) → `overlay.mov` (all graphics + captions). Camera moves (`plan.camera`)
are applied by the engine to the drawing layer only, so captions, the step bar, the mascot and the handle stay put.
Extra camera type here: `drift` (slow push for `d` seconds, `dx`/`dy` pan, `back` = return time).

Reference examples of each style live next to this file: `references/سبک 1.mp4` = lineglow, `سبک 2.mp4` = hud,
`سبک 3.mp4` = warmguide, `سبک 4.mp4` = pictogram. If unsure what a style should feel like, extract a contact
sheet of its reference (`ffmpeg -i "references/سبک 2.mp4" -vf "fps=1/2.5,scale=240:-1,tile=8x3" ref.jpg`) and look.

## Workflow differences

1. **analyze** works on an audio file too (no sheets/motion). Word anchors (`w:…`) are your only clock, so read
   the transcript closely. `tighten.py` also cuts audio-only files (write `.m4a`/`.wav`).
2. **Script → scenes.** Write `beats.md` as one line per sentence/idea: what is said → the *picture metaphor*
   (an ant on a floor plan → the city → the globe; a perfect teal circle vs a shaky red one; people on pedestals
   of different heights). One idea = one scene. Scene changes land on sentence starts (`w:` of the first word).
3. **Every second needs a picture.** `render.js check` reports `EMPTY a–b s` when only captions are on screen
   for ≥1 s. Overlap scenes by ~0.2 s, or bridge with a `transition` (`dissolve` is the calm default).
4. Captions are part of the design here, not an extra: plan them from the start (Step 8 still offers changes).
   `captions.py --style reveal` (or `accent` for warmguide); pass `--keywords` (bold), `--accent` (primary colour)
   and `--alt` (secondary colour) word lists.
5. Previews composite `bg.png` + footage + overlay, so they show the real frame. The style board in explainer
   mode shows only the explainer styles, each on its own background with a demo drawing.

## Drawing scenes (`scene`)

Coordinates are frame pixels (1080×1920). The illustration should live in roughly y 300–1300; captions sit
around y 1400–1560 (`--default-y`), the step bar / title above y 300.

- `items` = built-in pictograms (list below), each with optional `at` (seconds after the scene's `t`),
  `pulse`, `float`, `out` (fade out at that offset), `cls` (`dim`·`acc`·`alt`·`thin`·`bold`·`dash`).
- `svg` = raw SVG markup for anything bespoke (floor plan, ant, teapot, bed, window with moon, chart lines…).
  Stroke-only drawings, `fill="none"` is the default; use `class="fill"` for solid dots, `<text class="mono">`
  for HUD labels, and `data-at="1.2"` on an element or `<g>` for a delayed reveal. Keep paths simple:
  a few clean strokes read better than detail.
- Every stroke draws itself over `draw` seconds (style default 0.7–1.2 s); fills and text fade in.
- `zoom: {to: 1.1, cx, cy}` pushes slowly inside the scene for its duration (or `[from, to]`).
  Zooming **into** a detail and starting the next scene from it is the signature move of `lineglow`.
- `enter`: draw (default) · fade · rise · scale. `exit`: fade (default) · blur · zoom · none.
- `glow` (0–1) adds a soft bloom (lineglow default 0.6).

Built-in shapes (`shape`, plus its props):

| shape | props | use |
|---|---|---|
| `person` | `x, y` (feet), `s` (scale, 1 ≈ 100 px), `pose: raise`, `crown`, `label` | Isotype figure |
| `crowd` | `x, y` (centre), `cols, rows, s, gap, gapY`, `hi:[i]` bright ones, `crowns:[i]` | "1 in 100", masses |
| `pedestal` | `x, y` (ground), `w, h, n` (number), `person:false`, `crown` | status / income |
| `bars` | `x, y, values[], labels[], hi, w, gap, hmax, people:false, numbers:false` | pictogram bar chart |
| `label` | `from:[x,y]` (target), `to:[x,y]` (text), `text` | annotate someone/something |
| `card` | `x, y, w, h, r, badge, radio, selected` | screen / option frame |
| `phone` | `x, y, w, h` | phone outline |
| `globe` | `x, y, r, grid:false` | earth / world scale |
| `ring` | `x, y, r, w` | circles, targets, AI-vs-human |
| `eye` | `x, y, r` | the observer / sun mark |
| `text` | `x, y, text, size, font: display`, `cls: mono` | any label |
| `line` / `arrow` | `from, to` | connectors |
| `beam` | `x, y` (apex), `w, h, opacity` | spotlight cone |
| `glow` | `x, y, r, color, opacity` | halo behind a subject |
| `stars` | `rect, n, max` | dust / star field |
| `grid` | `rect, cell` | floor plan / HUD grid |

## Other explainer components

- `readout` — monospace HUD lines (`lines`, prefix `ok:` `err:` `acc:` `hi:`), typed out; `align: center`.
- `segbar` — segmented step bar at the top: `items[{t, label?}]`, `total`, `word` (default «مرحله»).
- `ui` — mock interface cards, `kind`: `terminal` (`title`, `lines` with `ok:`/`err:`/`dim:`), `toggle`
  (`items[{label, sub, on}]`), `apps` (`items[{icon, label, ok, at}]` → ✓/✕ badges), `chips`, `checklist`,
  `input` (`text` typed, `send` offset), `pill` (`text`, `keyword` → «کامنت بذار «ادیت»» CTA).
- `choice` — N option cards with radio dots; `pick` index at `pickAt`.
- `mascot` — **the user's own** character PNG (transparent). `src` or `poses: {name: file}` + `track[{t, pose}]`,
  `w, x, y`. Set once as `plan.mascot` (or in the brand kit as `mascot`). Never draw or imitate a character from
  a reference video; if the user has no image, leave it out.
- `footage` — a window that shows the source video: `rect`, `radius`, `frame: card|phone|none`, `src` (source
  time to start from, default = `t`). Use it for "here is the real thing" moments (style 3 shows the speaker in a card).
- `panel` — a style-coloured rectangle (`rect`, `enter: slide|fade`); in overlay mode it makes split layouts
  (graphics on the top half, the speaker below).
- Text syntax also has `~struck~` (line drawn at `strikeAt`) and `^alt colour^`.

## Per-style recipes

- **lineglow** (story / philosophy): black, white strokes, beams and glows on the hero, dust layer. One metaphor
  per sentence, slow `zoom` inside each scene, `dissolve` between scenes, scale changes (small → huge) as the
  story arc. Captions `reveal`. Sound: air, low boom on the big reveal, shimmer on the ending. No UI cards.
- **hud** (smart tech essay): charcoal, teal = correct/AI, red (`alt`) = human/wrong. Thin strokes, monospace
  readouts (`ERROR 0.000`, `USERS · SAME PROMPT`), `counter` with `persian: false` for big numbers, rings in grids.
  Captions `reveal` with `--accent` on AI terms, `--alt` on human/wrong terms. End with a `ui` pill CTA.
- **warmguide** (step-by-step tutorial): cream paper, `segbar` for the steps, a big `title` per step with one
  `*orange*` word, `ui` cards for the tools (terminal, toggles, app icons, file chips), `footage` windows for real
  results, `mascot` bottom-left if the user has one, `counter` for times («۱۳ دقیقه»), `~strike~` for twists.
  Captions `accent`. CTA: big «سیو کن» title + `ui` pill with the comment keyword.
- **pictogram** (psychology / society / data story): black, Isotype people, `pedestal`/`bars` for comparisons,
  `label` lines naming people, `choice` cards for "pick one" questions, `phone`/room drawings for daily life,
  `eye` for "the observer". Captions `reveal`. Calm pacing, `dissolve` or `fade`.

## Overlay mode with these styles

On a talking-head video (`mode` unset) the four styles style every normal component (titles, keywords, steps,
notes, CTA) in their palette and fonts, and the explainer components work as overlays: `readout` lines beside the
face (hud), `ui` cards in the empty band (warmguide), small `scene` drawings over a `panel` (lineglow/pictogram).
For a half-and-half layout, put a `panel` over the top half and draw inside it. `reveal` captions get a shadow
over footage, but `karaoke` is more legible on busy video.
