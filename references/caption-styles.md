# Caption styles (offer 3–4, recommend one for this video)

Each edit style has a default caption style (`captions` in `assets/styles.json`): gradient→karaoke, bold→pop,
neon→kinetic, minimal→minimal, doodle→boxed, retro→boxed (yellow-on-black), news→karaoke (navy bar),
editorial/print→highlight, brutalist→block, glass→mask, y2k→bubble, type→stagger,
lineglow/hud/pictogram/chalk→reveal, warmguide→accent, blueprint→minimal. Recommend that
one first unless the video argues otherwise. The caption look also adapts to the chosen style's colors and fonts.

**12 styles.** Describe each to the user in their language, with a one-line "feel" and when it fits. Base the
recommendation on the video: speech pace (words/sec from the transcript), how busy the screen is, and how much
text the edit already has.

| style | look | fits when | chunk size |
|---|---|---|---|
| `pop` | big display-font words, appearing one by one with a pop, active word in highlight color, thick stroke | energetic talking-head, hooks, fast speech; most "viral" | 2–3 words |
| `karaoke` | rounded dark pill with a full phrase, active word turns yellow | tutorials with busy screen recordings; readable over any background | 4–5 words |
| `kinetic` | normal-weight phrase, **key words** jump out bigger in display font + color | explanations where a few terms matter (product names, numbers); pass `--keywords` | 3–4 words |
| `boxed` | every word on its own dark tile, active tile in brand color | bold, branded look; short sentences | 3–4 words |
| `minimal` | clean white text with soft shadow, phrase fades in | calm/premium content, or when the edit already has lots of graphics | 5–7 words |
| `stagger` | bold phrase, each word rises into place word by word, active word in highlight | kinetic-type and fast-cut videos where the text is part of the rhythm | 3–5 words |
| `reveal` | the whole sentence in dim text, each word lights up as it's spoken and stays lit; `--keywords` bold, `--accent`/`--alt` coloured | explainer styles (lineglow, hud, pictogram, chalk): calm narration under a drawing | 7–9 words, up to 4.5 s |
| `accent` | 2–3 heavy words in the text colour, key words in the primary colour, no box | warmguide, or any light-background explainer | 3 words |
| `highlight` | white text that gets a coloured highlighter stripe behind the active word (skewed, printed look) | editorial/print, documentation, "notes" feel | 3–5 words |
| `mask` | the whole chunk is clipped open top-to-bottom (one clean wipe per chunk), active word in highlight | glass/minimal premium edits; quiet and designed | 4–6 words |
| `bubble` | every word on its own white rounded bubble, active bubble fills with the brand colour | y2k, playful products, quizzes | 2–4 words |
| `block` | one solid dark slab per chunk with a coloured active word | brutalist, raw announcements, high-contrast claims | 2–4 words |

Recommendation heuristics:
- Screen recording + PIP with lots of UI → `karaoke` (the pill keeps it legible on white UIs).
- Mostly face, fast and punchy → `pop` or `stagger`.
- Many technical terms or numbers → `kinetic` with those terms as keywords.
- Already heavy overlays → `minimal` (or `mask` if the edit is calm enough to carry a wipe).
- Printed / notes / magazine feel → `highlight`. Loud claim → `block`. Playful → `bubble`.
- Explainer mode → `reveal` (dark styles) or `accent` (warmguide); place them under the drawing (y ≈ 1400–1560).

Placement: lower on full-face shots (≈ y 1350–1450, chest), above the PIP on screen shots (≈ y 1150–1200). Pass these
as `--zones` to captions.py. Captions must not overlap the step chip, callouts or CTA. Run `check`.

Word-level props come from the transcript (`captions.json`): `key` (the important term), `acc` / `alt` (the two
accent colours), and the per-word start time. `highlight`, `reveal`, `accent` and `stagger` depend on them;
`pop`, `boxed`, `bubble` and `block` mostly use `key`. Chunking is the other half of the design: 2–3 words
reads as a chant, 7–9 words as narration — pick the one that matches the pace of the speech, then keep it for
the whole video.

Nias uses `highlight` by default; use short chunks for fast technical speech.
