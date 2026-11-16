# Creative editing (structure, rhythm, variety)

The style preset decides *how* a thing looks. This page decides *what happens when* — the sequencing that makes
an edit feel directed instead of decorated. It is engine-agnostic: every device below maps to plan elements.

The one rule that outranks everything here: **the edit serves the spoken idea.** Graphics that don't answer
"why now?" are decoration.

---

## 1. The shot, not the element

Plan elements are paint; the viewer perceives **shots**. A shot is "what the frame is doing for the next few
seconds": a face, a screen, a graphic, a split layout, a card. Before writing elements, sketch 8–20 shots for a
60 s reel in `beats.md`:

```
0.0–2.6   SHOT 1  face, chest full    hook title slams, no other graphics
2.6–5.0   SHOT 2  full-frame graphic  "چرا؟" -> 3 bars, one highlighted
5.0–12.0  SHOT 3  screen + no face    step chip, spotlight on the button
```

Two consequences:
- **Elements inside one shot** may enter and leave freely (a keyword, a callout) — no transition needed.
- **Between shots** something must change the ground: a transition, a cutaway, a camera punch, a layout swap.
  A shot change with no marker is perceived as a glitch.

## 2. Cut grammar (when to cut)

| cut on | how | feel |
|---|---|---|
| the word | anchor the transition/cutaway to `w:word` | the edit is "listening" — best default |
| the pause | between sentences, after a breath | calm, documentary |
| the beat | music transients (`music.py` gives a tempo) | energetic; needs a real beat |
| the action | the click/scroll frame from `analysis/motion.json` | invisible, professional |
| the punchline | right before the payoff word | comedic timing |

Cutting **mid-word** is almost always wrong, except a deliberate `whip` into a montage where the sentence
continues across the cut.

## 3. Structures (pick one, don't freestyle)

1. **Classic tutorial** — hook → "۳ مرحله" → step 1/2/3 (screen + step chip) → payoff → CTA.
2. **Cold open** — open on the middle of the action, then a `title` "بذار از اول نشونت بدم"; loop back.
3. **Flash-forward** — show the end result for 2 s, then rewind to the start (`push` + `flash` backwards).
4. **Problem → fix** — the error on screen, red treatment, `glitch`, then the fix in the style accent, `success`.
5. **Myth vs fact** — `compare` twice, each time on the claim word (`~غلط~` → `*درست*`).
6. **Staircase** — the same layout repeated 3 times, each time one more element revealed; no transitions, just
   an added layer. Great for "۱، ۲، ۳ برابر".
7. **One-take zoom** — no cuts at all: `panel`/`ui` elements scale up as the camera pushes in; disorienting if
   overused, unforgettable once.
8. **Montage** — 6–10 screenshots/details at 0.5–0.9 s each on the beat, no captions (the voice lists them).
9. **Split screen** — `panel` on one side + `footage` window on the other; alternate sides per beat.
10. **Question loop** — open with the question the video answers, close with the same frame + answer (loops on
    replay).
11. **Text-led** — the type *is* the video (`type`, `print`, `brutalist` styles): captions become headlines,
    one word per beat.
12. **Silent beat** — 0.4–0.8 s with no graphics and no SFX before the payoff. The cheapest retention trick
    there is.

## 4. Rhythm and intensity

Think in an intensity curve, not a constant level:

```
hook      body 1     body 2     payoff      CTA
█████     ███        ████       ███████     ██
loud      calm       build      peak        clear
```

- **Density budget:** 2–3 overlays max on screen; 1 new idea per 3–5 s in the body.
- **Accelerando:** shorten shot lengths toward the payoff (5 s → 3 s → 1.5 s). Slowing down before it is the
  opposite and equally valid: a held shot + riser.
- **Contrast, not volume.** The punch lands because the 4 s before it were quiet. If everything is loud, nothing is.
- **Breathe after the payoff:** 1–1.5 s of clean frame before the CTA lets the win register.
- Words per second from the transcript tell you the pace: > 4.5 w/s → cut every 3–4 s; < 2.5 w/s → let drawings
  and holds do the work.

## 5. Pattern interrupts (one every 4–7 s)

Rotate through different *kinds*, not different decorations:

| interrupt | cost | plan move |
|---|---|---|
| layout change | free | face → screen, or `panel` split |
| scale change | free | `punch` in on a word, `zoom` out on a conclusion |
| colour flip | free | the style accent appears after 10 s of neutral |
| silence + hold | free | mute SFX for 0.5 s |
| a full-frame graphic | 1 cutaway | `cutaway` + `scene` |
| a real photo/logo | asset | `icon` with `img:` |
| text-only beat | free | `keyword` big, everything else cleared |
| sound gag | 1 SFX | `glitch`, `static`, tape-stop |

## 6. Creative devices that read as "edited by a human"

- **Match cut:** end a sentence on a shape (a circle/ring) and start the next scene with the same shape at a
  different scale — `scene` with `ring`, then the next scene's `ring` zoomed.
- **Ride the scroll:** a `push` in the scroll direction, then the new screen already moving. The transition
  disappears into the footage's own motion.
- **Kill the filler:** every retake and "اِ…" out (`tighten.py`), then a `punch` on the join so the jump-cut reads
  as style, not as a mistake.
- **Number as character:** one `counter` that keeps rolling across beats, growing as the argument grows.
- **Recurring object:** the same icon (a document, a lock, a phone) returns in every scene, changing state. It
  becomes the video's mascot without an asset.
- **Colour as argument:** red only for the problem, the style's primary only for the solution. Once the viewer
  learns it, you can stop explaining.
- **Text that acts:** «حذف» gets erased by a mask, «سریع» crosses the frame in 0.2 s, «قفل» locks with a click.
- **The 1-frame black:** a single black frame at a hard cut reads as a camera flash and costs nothing.
- **Sound before picture:** start the `whoosh` 0.08 s before the cut; the eye is already moving when the frame
  changes.
- **Callback:** reuse the hook's layout for the CTA, with the answer filled in. Free closure.

## 7. Montage from stills (screenshots, products, logos)

- 6–10 items, 0.5–0.9 s each, cut on the voice's list items (`w:…` per item).
- One shared frame: same card size, same corner radius, same shadow; vary only the content. Consistency is what
  makes a montage feel designed.
- Camera: tiny alternating punch (1.02 / 1.06) per item so the cuts have energy without transitions.
- Optional: a `counter` or step chip that ticks with each item.
- Sound: one `swipe` per 2 items, not per item.

## 8. Variety across videos (the anti-repetition system)

The opening signature (SKILL.md) covers the first 3 s. Extend it to the whole edit — check the last 2–3 videos
and change **at least** these axes:

| axis | options | how to vary |
|---|---|---|
| structure | the 12 above | pick a different one, not a reskin |
| style | 19 presets | one step away (bold → brutalist) or a leap (bold → chalk) |
| hook format | 10 in SKILL.md | never the same twice in a row |
| title anim | 10 | must differ from the last video |
| transition motif | 20 | new motif (e.g. everything `tiles` this time) |
| caption style | 12 | change with the style, not randomly |
| layout | full / split / PIP / graphic | at least one layout you didn't use last time |
| sound motif | palette in styles.json | one signature sound reused 2–3 times, not everywhere |
| colour grade | grades.json | visible grade, not the default every time |

Write the chosen row in `beats.md` as one line, then commit to it. Random variety per element is noise; one
varied system per video is style.

## 9. What to avoid (the cliché list)

- Sticker on every sentence. Two stickers in a row is already a pattern.
- `glitch` as a default transition. It means "error"; it can't mean "next".
- Slow-motion + boom on a non-event.
- Zoom `punch` on every word (seasick).
- Captions that repeat a title that's still on screen (`DUPTEXT`).
- More than one "signature moment" — if everything is the peak, the payoff isn't.
- Emoji, @handles, stock "subscribe" animations, arrow + circle + label all pointing at one button.
- The same intro move two videos running, even in a different colour.

## 10. Variants worth rendering (cheap A/B)

- **Style variant:** same plan, different `style` (`render.js full` again) — the fastest A/B there is.
- **Hook variant:** same body, two different 3 s hooks — test in the first hour, keep the winner.
- **Length variant:** 60 s cut and a 25 s cut of the same recording. The short one is not a trim; it's a
  different structure (hook → payoff → CTA).
- **Caption variant:** `pop` vs `karaoke` on the same edit. Different audiences, same footage.

Related: `references/transitions.md`, `references/text-animations.md`, `references/styles.md`,
`references/creative-direction.md` (relevance, placement, sound rules).
