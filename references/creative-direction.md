# Creative direction

## Relevance first
Every overlay should answer "why is this on screen *right now*?". The answer must be one of:
- it **echoes or condenses what is being said** (keyword, counter, compare, note), anchored to that word;
- it **points at what is being shown** (highlight, click, callout, arrow) while it is shown;
- it **structures the video** (hook title, step chip, transition at a layout change, CTA).

If it is just decoration (generic feature badges, floating icons, particles over the speaker), cut it. On talking-head
sections, less is more: one keyword sticker for the single most important word of a sentence beats four badges.

## No emoji
- Never put emoji in titles, stickers, notes, CTAs or covers. Use the icon set or `img:` images (real logos are better
  than any emoji: e.g. the courier companies' logos next to their names).

## Cutaways (graphics instead of the face)
- When the speaker explains *how something works*, a *comparison* or a *process*, cut away from the face to an animated
  graphic for 4–10 s: diagram with arrows, bar chart, phone/panel mockup that fills in, logos on cards.
- Design it as a picture, never a text list. Every part appears on the word that names it; the subtitle keeps running.
- 2–4 per minute; come back to the face for the hook, opinions, jokes and the CTA.

## Intro and grade
- Every video opens with an intro move (auto) — then the hook title lands on top of it in the first 0.3 s.
- Grade the footage: phone/webcam video in a dim room looks better with `vivid` or `bright`; keep skin natural.

## Placement
- Never cover the eyes or mouth. On full-face shots use the band above the head and the chest area, and keep
  stickers to the sides (x < 300 or x > 780). Declare the face in `avoid` so `check` enforces this.
- On screen-recording sections: keep clear of the PIP and of the UI the cursor is using. The empty top bar of a
  browser screenshot is good real estate for the step chip.
- 9:16 safe area for Reels: keep important text within y 220–1500 (top is covered by the username, bottom by the
  caption/buttons UI) and x 60–1020. The hook title at the very top is fine for the first seconds (no UI is on top yet),
  but the CTA should sit around y 1000–1150, not at the bottom.
- At most 2–3 overlays visible at once. `CLUTTER` warnings mean the viewer can't read anything.

## Timing
- Text that echoes speech appears **on** the word (anchor), stays ≥ 1.2 s (reading time ≈ 0.25 s per word + 0.6 s),
  and leaves before the next idea starts.
- A visual pointer (highlight/callout) appears 0.2–0.4 s **before** the click/action it points to, so the eye gets
  there first. The click ripple sits exactly on the click frame.
- Exits are faster than entrances (≈0.25 s vs 0.45 s).
- Transitions start at the first frame of a layout change (motion event), not in the middle of it.

## Sound
- **Fewer sounds, normal level.** Aim for ~1 sound every 3 s on a talking head: the hook, section changes, the
  payoff, the CTA. Pops on every sticker are noise. Keep the default levels (the user wants them audible).
- An SFX belongs to something you can *see* happen: an entrance, a click, a page change, a success. No sound
  without a visual, and not every visual needs one (repeated ripples → quieter, −8…−12 dB).
- Hierarchy: voice ≫ hits (impact/success) > movement (whoosh) > UI (pop/click/tick).
- Never stack more than 3 sounds inside 0.35 s (`SFXPILE`). When elements enter together, mute all but one.
- Use a `riser` that **ends** on the payoff (start it ~1.4 s before), then `success`/`impact` exactly on it.
- Leave the speaker's sentences readable: if a big hit lands mid-sentence, drop it 3–4 dB.

## Transitions (pick by context, vary them)
- `wipe`: default layout change (face → screen). Clean and on-brand.
- `circles`: big section change or the reveal of the result.
- `glitch`: tech topics, "hack", surprise. Use it at most twice per video.
- `bars`: listing / step jumps.
- `lightleak`: warm, emotional, intro/outro.
- `flash`: hard cut on a beat or impact.

## Explainer mode (whole frame is graphics)
- The voice is the clock: change the picture on sentence starts, never mid-word.
- One idea = one picture metaphor. Build it up in 2–3 reveals (`at` offsets on the words that introduce each
  part) instead of showing everything at once; the viewer's eye follows what is being drawn.
- Keep a visual through-line: reuse the same figure / circle / colour coding across scenes, so the story feels
  like one drawing that evolves (zoom into a detail, start the next scene from it).
- Colour has meaning or it isn't used (hud: teal right vs red wrong). Most strokes stay in the line colour.
- Sound stays quiet and airy: `draw` sounds at −13 dB, a low boom only for the one big reveal, shimmer at the end.
- `check` must show no `EMPTY` gaps. Full details: `references/explainer.md`.

## Creative moves that work in tutorial reels
- Hook title slam + 1 camera punch-in on the promise word.
- Step chip that flips on each step, so the viewer always knows where they are.
- Spotlight (`highlight` with dim) on the exact button to press, with an arrow + callout in the viewer's language.
- `compare` for "paid vs free", "before vs after".
- `counter` for any number spoken (GB, %, price, seconds).
- Payoff: riser → success confetti + card + camera shake/punch.
- Outro: CTA buttons + ding. Keep it under 2.5 s.
