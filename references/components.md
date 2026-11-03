# Components (plan.elements)

Every element has `type`, `t` (start; number or anchor `w:…` / `m:…`), and usually `d` (duration) or `end`.
Common optional props: `id`, `x`/`y` (anchor point, px in the 1080×1920 frame; elements are centered on it unless
`anchor: "tl"|"tr"`), `color` (accent for this element), `size` (px, where noted), `sfx` (`false` to mute, or a list
`[[offset, "name", db], …]` to replace the defaults), `sfxGain` (dB added to all its defaults).

Text props accept `*highlight*` (brand gradient / primary colour), `` `LTR run` ``, `~struck~` (line drawn on at
`strikeAt`, title/keyword) and `^alt^` (secondary colour).

| type | what it is | key props | default SFX |
|---|---|---|---|
| `title` | hook title, word-by-word | `lines[]`, `kicker`, `kickerIcon`, `sub`, `y` (top, default 100), `anim`: slam·rise·glitch·blur, `wordGap`, `jitter`, `scrim` (dark top gradient, default on), `scrimH` | impact, whoosh, pop per word, glitch, swoosh out |
| `steps` | persistent numbered step chip with progress dots, flips between steps | `items[{t,label,sub,y?}]`, `total`, `y` (top, 150), `hide[[a,b]]`, `end` | whoosh + pop per step |
| `keyword` | sticker/neon word that echoes speech | `text`, `icon` (icon name or `img:<file>`; no emoji), `style`: sticker·neon·outline·gradient·plain, `from`: pop·left·right·drop·up, `rotate`, `size` | pop / whoosh |
| `note` | tip card («نکته») | `icon` (icon name or `img:`, default bulb), `title`, `text` | notify |
| `callout` | pill label, optional drawn arrow | `text`, `icon`, `arrow: {from:[x,y], to:[x,y], curve}` | pop (+ swipe) |
| `highlight` | box/circle around a UI target with dimmed surroundings | `rect:[x,y,w,h]`, `shape`: rect·circle·scribble (hand-drawn loop, drawn on), `dim` (0–1, default .35), `label`, `pulse` | pop |
| `click` | ripple on a mouse click | `x`, `y` | click |
| `arrow` | hand-drawn arrow | `from`, `to`, `curve`, `width` | swipe |
| `counter` | number count-up | `from`, `to`, `prefix`, `suffix`, `decimals`, `label`, `count` (sec), `persian` (digits, default true) | ticks + ding |
| `icon` | big built-in icon or image | `icon` (a name below, or `img:<file>`), `size`, `color`, `anim`: bounce·pulse·spin | bubble |
| `cutaway` | hides the footage for [t, t+d]; the elements listed after it build an animated graphic on top | `bg`: style · CSS colour/gradient · blur (compose blurs + darkens the real footage), `enter`/`exit`: wipe·zoom·fade | whoosh |
| `intro` | opening move (added automatically when missing) | `kind`: split·iris·flash·glitch·fade (style default), `dur`, `color`, `x`,`y` (iris centre) | whoosh_heavy / impact |
| `compare` | old (struck) → new | `bad`, `good`, `gap` | error + ding |
| `success` | confetti burst + result card | `x`,`y` (burst origin), `title`, `sub`, `cardY`, `confetti` | success, impact, sparkle |
| `cta` | end buttons | `items[{text, icon, color?}]`, `y` (default 1060) | pops + ding |
| `lowerthird` | name / role | `name`, `role`, `x`, `y` | whoosh |
| `transition` | full-frame overlay transition | `kind`: wipe·circles·glitch·bars·lightleak·flash·fade·paper·static·dissolve·scan·slide, or omit / `auto` to cycle the style's pool; `dur`, `x`,`y` (circles origin) | whoosh / heavy whoosh / glitch / swipe / static / air |
| `scene` | self-drawing line-art illustration (frame coordinates) | `items[{shape, at, …}]` built-in pictograms, `svg` raw markup, `draw`, `glow`, `zoom`, `enter`, `exit` | draw per reveal |
| `readout` | monospace HUD lines, typed out | `lines[]` (`ok:` `err:` `acc:` `hi:` prefixes), `align`, `stagger`, `size`, `typewriter:false` | tick per line |
| `segbar` | segmented step bar (warmguide) | `items[{t,label?}]`, `total`, `word`, `y`, `hide`, `end` | whoosh + pop |
| `ui` | mock UI card | `kind`: terminal·toggle·apps·chips·checklist·input·pill, `w`, `title`, `lines`, `items`, `text`, `keyword` | whoosh, typing, clicks |
| `choice` | pick-one option cards | `options[{label}]`, `pick`, `pickAt`, `cw`, `ch` | whoosh + click |
| `mascot` | the user's own character image | `src` or `poses{}` + `track[{t,pose}]`, `w`, `x`, `y`, `bob` | whoosh |
| `footage` | window showing the source video (explainer mode) | `rect`, `radius`, `frame`: card·phone·none, `src` | whoosh |
| `panel` | style-coloured rectangle (split layouts) | `rect`, `radius`, `color`, `enter`: slide·fade | whoosh |

Scene shapes, explainer workflow and per-style recipes: `references/explainer.md`.

**Icons** (use these instead of emoji — the user doesn't want emoji): download check x warn star click save follow
like heart share send comment lock globe bolt search truck box money coin up down chart deal fire bulb pointdown
clock phone cart gift rocket question user map play. Any icon prop also takes `img:<path>` (PNG/SVG/WebP, path
relative to the plan) for a real logo or photo, e.g. the courier companies' logos. Icons take the element's text
colour (`color` overrides).

Global plan keys:
- `mode`: `overlay` (default, graphics over the source video) or `explainer` (whole frame is graphics; the source
  may be audio only). `bg`: `{color, gradient, image}` overrides the style's explainer background.
- `mascot`: `{src | poses, track, w, x, y}` the user's own character for the whole video (or brand kit `mascot`).
- `style`: preset name (gradient · bold · neon · minimal · doodle · retro · news · lineglow · hud · warmguide · pictogram). It sets look, motion, transitions,
  sound palette, caption default and fx layers. Element props you leave unset come from the preset's `defaults`.
- `theme`: overrides on top of the preset (brand colors / fonts).
- `handle`: `{text, corner: tl|tr|bl|br, logo?, opacity?}`, a persistent @username watermark (or from the brand kit).
- `fxProps`: settings for the preset's look layers, e.g. `{"newsbar": {"tag": "خبر فوری", "text": "…"}}`.
- `intro`: `false`, or `{kind, dur, color}` to tune the automatic intro (overlay mode also gets a 0.35 s punch-out).
- `grade`: colour correction of the footage — visible: `punchy` (contrast + colour, warm skin, vignette), `glow`
  (lifted shadows, warm), `film` (dark teal background, warm face); subtle: `natural` · `vivid` · `warm` · `cool` ·
  `cinematic` · `bright` (`assets/grades.json`); a raw ffmpeg filter string, or `false`. Default from the style.
- `sfxMix`: `{gain: 0, minGap: 0.6, perElement: 1, duck: false}` — fewer sounds at normal level (see SKILL.md).
- `voice`: `"enhance"` for voice cleanup in compose. `music`: `{file, db, duck}`.
- `cover`: `{lines, sub, kicker, y, blur}` for `render.js cover T`.
- `brand`: `false` to ignore `~/.config/reel-motion-edit/brand.json` for this video.
- `progress` (bottom progress bar, default on; `false` to disable), `sfx` (manual events `{t, name, db}`), `camera`
  (see below), `captions`, `avoid`, `fonts`.

## Camera moves (`plan.camera`, applied to the video in compose.py)

`{t, d, type, scale, cx, cy, amp}`:
- `punch`: instant cut-in to `scale` (1.08–1.2) centered on `cx,cy`, eases back out. Use it on an emphasized word.
- `zoom`: slow ease in/out push (0.45 s ramps). Use it on a calm explanation or a reveal.
- `shake`: short jitter (`amp` px, ~10–18) for an impact moment. Pair it with `impact`/`bass_drop`.
- `drift` (explainer only): slow push over `d` seconds with optional `dx`/`dy` pan, back in `back` s.

In explainer mode the engine applies camera moves to the drawing layer (captions, HUD, mascot stay fixed);
compose.py doesn't touch them.

Add a matching SFX manually if the moment needs one (punch → `whoosh_short` or nothing; shake → `impact`).

## SFX library (`~/.cache/reel-motion-edit/sfx/`)

movement: `whoosh` `whoosh_short` `whoosh_heavy` `swoosh_out` `swipe`
ui: `pop` `pop_hi` `bubble` `click` `tick` `typing` `blips` `notify` `error` `shutter`
reward: `ding` `success` `coin` `sparkle`
tension/impact: `riser` (1.6 s, place it to end on the hit) `impact` `bass_drop` `glitch` `power_on` `power_off` `heartbeat`
style palettes: `soft_pop` `soft_whoosh` (minimal) · `digital_blip` `digital_seq` (neon) · `scribble` `paper` (doodle) ·
`tape_stop` `static` (retro) · `sting` (news) · `draw` `draw_soft` `air` `low_boom` `shimmer` `soft_tick` (explainer styles)

A style's `sfxMap` swaps component default sounds for its palette (e.g. minimal turns `pop` into `soft_pop` and drops
`impact`). Sounds you set explicitly in an element's `sfx` or in `plan.sfx` are never remapped.

Gains are dB relative to an already conservative base (−4 dB). Typical values: hits −3…−6, UI −6…−10, ambience
and repeats −10…−14. Any absolute path to a wav also works as a name in manual `sfx`.

## Theme

`theme`: `primary` `secondary` `accent` `ok` `dark` `text` `highlight` (active caption word), `line` (scene
stroke colour), `dim` (dim strokes / unspoken caption words), `card` (ui card background), `display` (headline
font family), `body` (UI/body font family), `mono` (readouts). Bundled families: `Vazirmatn` `Lalezar` `Changa`
`Lemonada` `NotoKufiArabic` `Estedad` (rounded geometric, explainer styles) `JetBrainsMono` (Latin monospace).
A file named `Family.latin.woff2` next to `Family.woff2` adds a Latin subset to the same family. Add more with `fonts: {"Family": "path.ttf"}`.
