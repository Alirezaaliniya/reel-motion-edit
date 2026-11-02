# Caption styles (offer 3–4, recommend one for this video)

Each edit style has a default caption style (`captions` in `assets/styles.json`): gradient→karaoke, bold→pop,
neon→kinetic, minimal→minimal, doodle→boxed, retro→boxed (yellow-on-black), news→karaoke (navy bar),
lineglow/hud/pictogram→reveal, warmguide→accent. Recommend that
one first unless the video argues otherwise. The caption look also adapts to the chosen style's colors and fonts.

Describe each to the user in their language, with a one-line "feel" and when it fits. Base the recommendation on the
video: speech pace (words/sec from the transcript), how busy the screen is, and how much text the edit already has.

| style | look | fits when | chunk size |
|---|---|---|---|
| `pop` | big display-font words, appearing one by one with a pop, active word in highlight color, thick stroke | energetic talking-head, hooks, fast speech; most "viral" | 2–3 words |
| `karaoke` | rounded dark pill with a full phrase, active word turns yellow | tutorials with busy screen recordings; readable over any background | 4–5 words |
| `kinetic` | normal-weight phrase, **key words** jump out bigger in display font + color | explanations where a few terms matter (product names, numbers); pass `--keywords` | 3–4 words |
| `boxed` | every word on its own dark tile, active tile in brand color | bold, branded look; short sentences | 3–4 words |
| `minimal` | clean white text with soft shadow, phrase fades in | calm/premium content, or when the edit already has lots of graphics | 5–7 words |
| `reveal` | the whole sentence in dim text, each word lights up as it's spoken and stays lit; `--keywords` bold, `--accent`/`--alt` coloured | explainer styles (lineglow, hud, pictogram): calm narration under a drawing | 7–9 words, up to 4.5 s |
| `accent` | 2–3 heavy words in the text colour, key words in the primary colour, no box | warmguide, or any light-background explainer | 3 words |

Recommendation heuristics:
- Screen recording + PIP with lots of UI → `karaoke` (the pill keeps it legible on white UIs).
- Mostly face, fast and punchy → `pop`.
- Many technical terms or numbers → `kinetic` with those terms as keywords.
- Already heavy overlays → `minimal`.
- Explainer mode → `reveal` (dark styles) or `accent` (warmguide); place them under the drawing (y ≈ 1400–1560).

Placement: lower on full-face shots (≈ y 1350–1450, chest), above the PIP on screen shots (≈ y 1150–1200). Pass these
as `--zones` to captions.py. Captions must not overlap the step chip, callouts or CTA. Run `check`.
