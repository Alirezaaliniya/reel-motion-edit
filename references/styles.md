# Style playbook

Every preset in `assets/styles.json` sets the theme (colors, fonts), component visuals, default motion,
transition pool, sound palette (`sfxMap`), default caption style and full-frame look layers (`fx`).
The plan just says `"style": "<name>"`. This page is about **how to direct** in each style: which
components carry the ideas, how hard to hit, how fast to cut.

**19 presets.** ★ = explainer styles: they ship their own background and are built for `"mode": "explainer"`
(the whole frame is graphics driven by the voice), see `references/explainer.md`. They also work as overlays on
footage. The rest are overlay styles and can still run in explainer mode — the engine paints a styled backdrop
(`.cutaway.sty`) behind them, so a magazine or glass layout works without footage.

## Overlay / versatile (11)

| style | pick it for | carry ideas with | motion & pace | avoid |
|---|---|---|---|---|
| `gradient` modern gradient | general tech tutorials, product how-tos | step chip, stickers, highlight + callout, confetti payoff | medium, back-out pops | nothing special; it's the safe default |
| `bold` pop | hooks, hot takes, money/number claims, fast talkers | big keyword stickers on almost every key phrase, counters, compare | fast: a punch-in every 3–5 s, flash cuts, shakes on hits | small text, subtle UI; it must be loud and big |
| `neon` tech | hacks, security, VPN, coding, "secret trick" content | glitchy title, neon keywords, steps, notes | sharp, glitch transitions at layout changes, 1–2 shakes | too many colors; keep cyan, magenta and green |
| `minimal` clean | premium/product, calm explainers, design, finance | few elements: one keyword per idea, steps, a clean success card | slow: rise and fade, no shakes, zoom (not punch) camera | confetti, glitch, more than 2 elements at once |
| `doodle` hand-drawn | teaching, kids/beginners, friendly tips, lists | scribble highlights on targets, underlined keywords, notes, arrows | playful: paper transitions, slight rotations | perfect geometry; let it feel handmade |
| `retro` VHS | nostalgia, "old vs new", fun/meme content, gaming | stickers with offset shadows, compare, glitchy title | static/glitch/blinds transitions, tape-stop exits | clean modern UI cards next to VHS grain |
| `news` broadcast | announcements, updates, "X just changed", serious claims | headline title, squared keywords as captions-of-record, ticker text | steady: bars/wipe/strip transitions, sting on the payoff | confetti, emoji overload |
| `editorial` magazine (Morabba + Peyda) | essays, product stories, design/architecture, "the state of X" | long masked headlines, marker highlights, pull-quote notes, photo cards | measured: mask-ins, wipe/slide, still holds with one idea per screen | neon, glitch, more than one accent colour |
| `brutalist` raw (YekanBakh + IRANSansX) | strong opinions, sales, drops, "no bullshit" explainers | block labels, stamped words, hard black slabs, hazard stripes, giant numbers | hard: stamp-ins, tile/flash cuts, no easing decoration | pastel colours, soft shadows, rounded everything |
| `glass` frosted (Peyda) | SaaS, AI tools, premium apps, dark UI showcases | frosted cards, blurred panels, soft outline keywords, glow | airy: blur-ins, dissolve/fade, slow pushes | heavy borders, flat white screens, too many cards |
| `liquid-glass` (Vazirmatn) | clean product demos, premium overlays | translucent lens cards, double rim, moving highlights | fluid expansion on notes, dissolve/fade, slow pushes | stacked lenses, busy backgrounds, scattering focus |
| `explorecore` (Vazirmatn) | process and comparison stories | route, landmarks, stage labels | reveal one stage at a time, dissolve/push | presenting the entire map before the story reaches it |
| `notes-app-chic` (Vazirmatn) | founder diaries, checklists, behind the scenes | ruled cream paper, uneven cards, ink marks | gentle rise, paper/fade | artificial disorder across every frame |
| `reality-warp` (Vazirmatn) | surreal hooks and product reveals | unexpected scale, orbit lines, morphable objects | morph one subject into the next clue, zoom/dissolve | warping the text or hiding the subject |
| `y2k` chrome (Hasti display) | youth, music, gaming, launches, "future" claims | chrome keywords, bubble captions, flip-ins, ring/zoom transitions | glossy: flip/bubble pops, circles/flash cuts | corporate tone, tiny type, muted palettes |

## Explainer-first (8)

| style | pick it for | carry ideas with | motion & pace | avoid |
|---|---|---|---|---|
| `lineglow` cinematic line-art ★ | reflective stories, philosophy, "you are small in the universe", motivation | self-drawing white `scene`s with beams/glows, scale metaphors, `reveal` captions | slow: one scene per sentence, `zoom` inside scenes, `dissolve`/`ink` cuts, dust layer | UI cards, colour, fast cuts, emoji |
| `hud` data HUD ★ | AI / tech essays, "why X", comparisons of right vs wrong, numbers | thin diagrams, teal vs red, `readout` lines, `counter`, ring grids | precise: strokes draw on, typed readouts, `scan`/`blinds` | thick shapes, many colours, playful motion |
| `warmguide` warm guide ★ | step-by-step tutorials, tools/workflows, "how I did X in 7 steps" | `segbar` + one big `title` per step, `ui` cards, `footage` windows, optional user `mascot` | friendly: rise-ins, `slide` between steps, typed terminals, toggles clicking on | dark backgrounds, glitch, cluttered cards |
| `pictogram` pictogram infographic ★ | psychology, society, money/status, research findings, "pick one" questions | Isotype people, `pedestal`/`bars`, `label` lines, `choice` cards, phone/room drawings | calm: draw-on, labels one by one, `dissolve`/`tiles` | text-heavy screens, colour |
| `print` risograph ★ | documentation, indie products, editorial explainers, "made by hand" | overprint blocks, halftone, stamped keywords, tracked headlines, paper cuts | deliberate: `track` titles, paper/wipe, stamped reveals | glossy gradients, dark UI, neon |
| `type` kinetic typography ★ | manifesto, spoken-word, strong scripts, hooks with rhythm | type as the picture: one word per beat, huge lines, `letterbox` bars, `stagger` captions | rhythmic: whip/push cuts, typed and staggered words | long sentences, busy illustrations, quiet pacing |
| `chalk` chalkboard ★ | teaching, kids, simple explanations, "let me draw it" | chalk line drawings, wavy titles, hand circles, paper transitions | soft: wave-ins, drawn strokes, gentle dissolves | sharp corporate UI, neon, high contrast photography |
| `blueprint` technical ★ | engineering, architecture, process/system explanations, specs | blueprint grids, dimension lines, outlined keywords, schematic labels | methodical: scan cuts, drawn measurements, mono labels | emotion-first stories, playful type, warm colours |

Notes:
- Overlay styles in explainer mode have no photo background of their own; the engine draws a styled backdrop.
  Pass `plan.bg` if you want a specific colour/gradient instead.
- `news`: set the ticker with `"fxProps": {"newsbar": {"tag": "خبر فوری", "text": "…"}}`.
- `retro`: the REC/timecode layer runs automatically. `glass`/`chalk`/`blueprint` carry a vignette by default.

## Recommending a style when the user doesn't know

Base it on the content, and say why in one line:
- Speaker on camera + screen recording, tutorial → `gradient` (safe), `bold` (hooky, fast talker), `minimal` (premium).
- Hack / security / coding → `neon`. Kids, beginners, friendly lists → `doodle`. Fun, nostalgia → `retro`. Announcements → `news`.
- Essay / opinion / product story → `editorial` (magazine calm) or `brutalist` (loud claim).
- SaaS / AI / dark UI → `glass`. Youth / music / launch → `y2k`.
- Voice-over only, or the speaker isn't the point (an essay, a story, an idea) → an explainer style:
  story/philosophy → `lineglow`; AI/tech argument with right-vs-wrong → `hud`; tool tutorial in steps → `warmguide`;
  people, society, comparisons, statistics → `pictogram`; docs/print feel → `print`; spoken-word rhythm → `type`;
  teaching with drawings → `chalk`; systems/specs → `blueprint`.
- A talking-head video whose topic is an idea rather than a demo can still go explainer: the speaker's audio drives
  the scenes and the face appears in `footage` windows at key moments.

## Hook formats: rotate them, don't reuse the last one

The first 1–3 s decide retention. Pick the format that fits what the speaker actually says first:

1. **Promise title**: "`VPN` *رایگان*" plus a sub-line (default).
2. **Question**: the speaker asks ("ویندسکرایب داری؟"). Show the question as the title, then pop the answer as a keyword when it comes.
3. **Problem first**: open on the error or pain on screen. Glitch transition, red neon keyword, then «راه حل» with the `bulb` icon.
4. **Number hook**: `counter` on the spoken number (۵۰ گیگ, ۳ ثانیه, ۱۰ برابر) as the first element.
5. **Before → after**: `compare` (پولی → رایگان) in the first 2 s.
6. **Result first**: show the payoff frame/success card first, then "بذار نشونت بدم چطوری" and the steps.
7. **POV / you**: kicker "اگه تو هم…" plus a title addressed to the viewer.
8. **Quote / claim**: an `editorial`-style pull quote with the speaker's own words in `mask`.
9. **Spec card**: `blueprint`/`hud` readout of the exact numbers in the first 2 s.
10. **One word** (`type`/`chalk`): a single huge word, then the voice explains it.

Details of each title animation and keyword look: `references/text-animations.md`.

## Variety inside one video

- Don't use the same component twice in a row for consecutive ideas (sticker, sticker, sticker). Alternate keyword / note / compare / counter / icon.
- Vary sticker positions (left-high, right-low, center-bottom) within the safe zones, not always center-bottom.
- Let transitions cycle (omit `kind`); use a special one (circles, glitch) only for the biggest section change.
- One "signature moment" per video: the payoff with riser → success, or a big camera shake on the problem reveal.
- Change the layout at least once (full frame → split → graphic). Same frame for 20 s reads as a slideshow.
- Pick one transition motif for the whole video (`references/transitions.md`) and vary the hook every time.

Sequencing, structures and pattern interrupts: `references/creative-editing.md`.

## نیاس (نیازمند Plan Engine)

Use `style: "nias"` with the [Nias recipe](nias.md) for an editorial petrol-and-copper cut.
