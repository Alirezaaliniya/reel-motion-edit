# Creative direction

## Relevance first
Every overlay should answer "why is this on screen *right now*?". The answer must be one of:
- it **echoes or condenses what is being said** (keyword, counter, compare, note), anchored to that word;
- it **points at what is being shown** (highlight, click, callout, arrow) while it is shown;
- it **structures the video** (hook title, step chip, transition at a layout change, CTA).

If it is just decoration (generic feature badges, floating icons, particles over the speaker), cut it. On talking-head
sections, less is more: one keyword sticker for the single most important word of a sentence beats four badges.

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

## Creative moves that work in tutorial reels
- Hook title slam + 1 camera punch-in on the promise word.
- Step chip that flips on each step, so the viewer always knows where they are.
- Spotlight (`highlight` with dim) on the exact button to press, with an arrow + callout in the viewer's language.
- `compare` for "paid vs free", "before vs after".
- `counter` for any number spoken (GB, %, price, seconds).
- Payoff: riser → success confetti + card + camera shake/punch.
- Outro: CTA buttons + ding. Keep it under 2.5 s.
