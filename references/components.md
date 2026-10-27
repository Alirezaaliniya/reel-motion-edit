# Components (plan.elements)

Every element has `type`, `t` (start; number or anchor `w:…` / `m:…`), and usually `d` (duration) or `end`.
Common optional props: `id`, `x`/`y` (anchor point, px in the 1080×1920 frame; elements are centered on it unless
`anchor: "tl"|"tr"`), `color` (accent for this element), `size` (px, where noted), `sfx` (`false` to mute, or a list
`[[offset, "name", db], …]` to replace the defaults), `sfxGain` (dB added to all its defaults).

Text props accept `*highlight*` (brand gradient) and `` `LTR run` ``.

| type | what it is | key props | default SFX |
|---|---|---|---|
| `title` | hook title, word-by-word | `lines[]`, `kicker`, `kickerIcon`, `sub`, `y` (top, default 100), `anim`: slam·rise·glitch·blur, `wordGap`, `jitter`, `scrim` (dark top gradient, default on), `scrimH` | impact, whoosh, pop per word, glitch, swoosh out |
| `steps` | persistent numbered step chip with progress dots, flips between steps | `items[{t,label,sub,y?}]`, `total`, `y` (top, 150), `hide[[a,b]]`, `end` | whoosh + pop per step |
| `keyword` | sticker/neon word that echoes speech | `text`, `emoji`, `style`: sticker·neon·outline·gradient·plain, `from`: pop·left·right·drop·up, `rotate`, `size` | pop / whoosh |
| `note` | tip card («نکته») | `icon` (emoji), `title`, `text` | notify |
| `callout` | pill label, optional drawn arrow | `text`, `icon`, `arrow: {from:[x,y], to:[x,y], curve}` | pop (+ swipe) |
| `highlight` | box/circle around a UI target with dimmed surroundings | `rect:[x,y,w,h]`, `shape`: rect·circle·scribble (hand-drawn loop, drawn on), `dim` (0–1, default .35), `label`, `pulse` | pop |
| `click` | ripple on a mouse click | `x`, `y` | click |
| `arrow` | hand-drawn arrow | `from`, `to`, `curve`, `width` | swipe |
| `counter` | number count-up | `from`, `to`, `prefix`, `suffix`, `decimals`, `label`, `count` (sec), `persian` (digits, default true) | ticks + ding |
| `icon` | big emoji or built-in icon | `icon` (emoji or: download check warn star click save follow like share comment lock globe bolt search), `anim`: bounce·pulse·spin | bubble |
| `compare` | ❌ old → ✅ new | `bad`, `good`, `gap` | error + ding |
| `success` | confetti burst + result card | `x`,`y` (burst origin), `title`, `sub`, `cardY`, `confetti` | success, impact, sparkle |
| `cta` | end buttons | `items[{text, icon, color?}]`, `y` (default 1060) | pops + ding |
| `lowerthird` | name / role | `name`, `role`, `x`, `y` | whoosh |
| `transition` | full-frame overlay transition | `kind`: wipe·circles·glitch·bars·lightleak·flash·fade·paper·static, or omit / `auto` to cycle the style's pool; `dur`, `x`,`y` (circles origin) | whoosh / heavy whoosh / glitch / swipe / static |

Global plan keys:
- `style`: preset name (gradient · bold · neon · minimal · doodle · retro · news). It sets look, motion, transitions,
  sound palette, caption default and fx layers. Element props you leave unset come from the preset's `defaults`.
- `theme`: overrides on top of the preset (brand colors / fonts).
- `handle`: `{text, corner: tl|tr|bl|br, logo?, opacity?}`, a persistent @username watermark (or from the brand kit).
- `fxProps`: settings for the preset's look layers, e.g. `{"newsbar": {"tag": "خبر فوری", "text": "…"}}`.
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

Add a matching SFX manually if the moment needs one (punch → `whoosh_short` or nothing; shake → `impact`).

## SFX library (`~/.cache/reel-motion-edit/sfx/`)

movement: `whoosh` `whoosh_short` `whoosh_heavy` `swoosh_out` `swipe`
ui: `pop` `pop_hi` `bubble` `click` `tick` `typing` `blips` `notify` `error` `shutter`
reward: `ding` `success` `coin` `sparkle`
tension/impact: `riser` (1.6 s, place it to end on the hit) `impact` `bass_drop` `glitch` `power_on` `power_off` `heartbeat`
style palettes: `soft_pop` `soft_whoosh` (minimal) · `digital_blip` `digital_seq` (neon) · `scribble` `paper` (doodle) ·
`tape_stop` `static` (retro) · `sting` (news)

A style's `sfxMap` swaps component default sounds for its palette (e.g. minimal turns `pop` into `soft_pop` and drops
`impact`). Sounds you set explicitly in an element's `sfx` or in `plan.sfx` are never remapped.

Gains are dB relative to an already conservative base (−4 dB). Typical values: hits −3…−6, UI −6…−10, ambience
and repeats −10…−14. Any absolute path to a wav also works as a name in manual `sfx`.

## Theme

`theme`: `primary` `secondary` `accent` `ok` `dark` `text` `highlight` (active caption word), `display`
(headline font family), `body` (UI/body font family). Bundled families: `Vazirmatn` `Lalezar` `Changa` `Lemonada`
`NotoKufiArabic`. Add more with `fonts: {"Family": "path.ttf"}`.
