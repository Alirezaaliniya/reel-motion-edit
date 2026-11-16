# Transitions (the cut, the sound, the reason)

A transition is not a decoration you sprinkle between elements — it is the **edit point**. It tells the viewer
"the ground changed": a new section, a new place, a new time, a new argument. If nothing changed, there is no
reason for a transition; if something changed and there is no transition, the cut feels like a mistake.

Two layers, always decided together:

1. **The visual cut** (`type: "transition"` — full-frame overlay in the plan engine).
2. **The reason for the cut** — a layout change (face → screen), a section change (step 1 → step 2), a time jump
   (retake removed), or an emotional beat (problem → solution). Write that reason in `beats.md` next to the time.

---

## Density: how often

| video kind | transitions | note |
|---|---|---|
| talking head, one location | 0–2 total | the hook and the CTA; let the face carry it |
| tutorial with face + screen | 1 per layout change | ~1 per 6–10 s, always at the change, never mid-shot |
| cutaway / explainer | 1 per cutaway + 1 per 2–3 scenes | the graphic enters with its own move |
| fast hook / meme / listicle | 1 per 2–4 s | only with a real beat behind it (music or speech accent) |

`check` reports `TRDENSE` when the average gap drops under ~3.5 s with other elements on screen. Treat it as a
smell, not a law: a genuinely rhythmic montage can be denser, but then the cuts must land **on** the beat.

Rule of thumb: **one transition per ~6 s is a scene change; one per 2 s is a music video.** Pick which one the
content is, and be consistent — random mix of both reads as a bug.

---

## The vocabulary (20 kinds)

| kind | what it looks like | use it for | pairs with |
|---|---|---|---|
| `wipe` | a rotated band sweeps across | the default layout change (face → screen) | `whoosh` |
| `circles` | three coloured discs bloom from a point | biggest section change, the reveal of a result | `whoosh_heavy` |
| `flash` | one bright frame | hard cut on a beat / impact / a photo flashback | `impact` |
| `fade` | dip to a flat colour | calm time jump, end of a chapter | `whoosh_short` |
| `dissolve` | dip to the style background | reflective styles (lineglow, hud, glass), scene changes | `air` |
| `bars` | six horizontal bands shove in | step jumps, "list item 2", broadcast pace | `swipe` |
| `blinds` | venetian slats open then close | retro, archival, "before/after" reveal | `swipe` |
| `tiles` | a 4×6 grid of squares flips | grid/UI content, brutalist and pictogram moods | `swipe` |
| `push` | a coloured sheet shoves the whole frame | a real direction change; `dir: ltr·rtl·up·down` follows the motion | `whoosh` |
| `whip` | blurred bands rush past | speed ramp, "let's go", a fast montage entry | `whoosh_heavy` |
| `zoom` | lens rings rush past the camera | dive into a detail, a scale jump, "look closer" | `whoosh_heavy` |
| `lightleak` | a warm streak of light | emotional peak, intro/outro, sunrise/sunset feeling | `whoosh_short` |
| `burn` | hot white-out that burns through | a hard payoff, a transformation, "and then it changed" | `impact` + `whoosh_heavy` |
| `ink` | a rough ink blot swallows the frame | doodle, print, editorial, a hand-made feel | `paper` |
| `paper` | a sheet of paper slides over | document/paper styles, page turns, stationery | `whoosh` |
| `strip` | diagonal hazard stripes | brutalist, warning, "attention", sale/urgency | `swipe` |
| `scan` | a thin bright line sweeps down | HUD/blueprint, a diagnostic or system check | `soft_whoosh` |
| `slide` | a paper-coloured sheet slides | warmguide step changes, gentle tutorials | `soft_whoosh` |
| `glitch` | RGB slices tear the frame | tech, error, bug, "hidden trick" — max twice per video | `glitch` |
| `static` | analogue TV noise | VHS, a "recording" or "archive" beat | `static` |

`kind` can be omitted: the element then cycles the style's own transition pool (`transitions` in
`assets/styles.json`), which keeps a video coherent without repeating the same move. Use an explicit kind only
when the moment has a specific meaning (a result reveal → `circles`, an error → `glitch`).

---

## Parameters that matter

- `dur` (default .55): .3–.4 feels like a hard cut with a flourish; .6–.8 feels like a scene change. Above 1 s it
  becomes an effect the viewer watches instead of the content.
- `x`, `y`: origin of `circles` (default centre — put it on the thing being revealed).
- `dir` (`ltr` · `rtl` · `up` · `down`): `push` only. Match the direction of the motion already in the shot, and in
  RTL edits prefer `rtl` unless the footage moves the other way. **Never push up on a scroll that goes down.**
- `color`: `flash`/`fade` override, for a brand-coloured dip.

---

## Pairing with sound

| transition | sound | level |
|---|---|---|
| wipe, bars, tiles, blinds, strip, paper, slide | `swipe` / `whoosh` / `soft_whoosh` | −6 … −10 |
| circles, whip, zoom, burn | `whoosh_heavy` | −6 … −8 |
| flash, burn | `impact` | −8 … −10 |
| glitch | `glitch` | −6 |
| static | `static` | −6 |
| fade, dissolve | `air` / `whoosh_short` | −10 … −12 |

One transition = one sound. Two transitions 0.3 s apart = one sound (`SFXPILE` will tell you). If a transition
lands inside a sentence, drop it 3–4 dB so the words stay on top.

---

## Choreography: three ways to make a cut feel intentional

1. **Cut + camera.** A transition at the same frame as a camera `punch` on the new shot: the move hides the cut.
   Overlay-mode camera moves are applied to the footage in `compose.py`, so keep the punch inside the new shot.
2. **Cut + word.** Anchor the transition to the exact word that starts the new idea (`"t": "w:حالا"`), not to a
   rounded second. The ear hears the cut as part of the sentence.
3. **Cut + layout.** A cut that also changes the layout (full frame → split with PIP) is perceived as a new
   "scene" even with the cheapest transition. Cheapest big win in a tutorial edit.

---

## Style pools (what `auto` will pick)

| style | pool | reads as |
|---|---|---|
| gradient | wipe · circles · bars · lightleak · push · zoom | clean, modern, safe |
| bold | flash · bars · tiles · burn | loud, punchy |
| neon | glitch · bars · whip · scan | tech, fast |
| minimal | fade · wipe · dissolve | quiet, premium |
| doodle | paper · wipe · ink | hand-made |
| retro | static · glitch · blinds · burn | analogue, nostalgic |
| news | bars · wipe · strip · push | broadcast |
| editorial | wipe · slide · fade | print, magazine |
| brutalist | tiles · bars · flash | raw, loud |
| glass | dissolve · fade · lightleak | soft, airy |
| y2k | circles · flash · zoom | glossy, playful |
| lineglow | fade · dissolve · ink | cinematic, slow |
| hud | fade · scan · blinds | precise |
| warmguide | slide · fade · push | gentle steps |
| pictogram | fade · dissolve · tiles | calm infographic |
| print | paper · wipe · fade | risograph, papery |
| type | whip · push · fade | kinetic type |
| chalk | paper · dissolve | handmade, soft |
| blueprint | scan · dissolve · strip | technical drawing |

---

## Do / don't

- **Do** put the transition at the **first frame** of the change (the motion event from `analysis/motion.json`).
  Half a second late and the old shot is still on screen.
- **Do** vary within the pool: wipe, wipe, wipe is a tic. If you must repeat one, that repetition is a motif —
  make it deliberate (every step change = `slide`).
- **Don't** put text on screen during the transition window; it gets sliced.
- **Don't** use `glitch` for anything that isn't an error/tech beat, and never more than twice.
- **Don't** use two dramatic transitions back to back (burn into circles). The second one reads as nothing.
- **Don't** transition into a caption start; shift the caption 0.2 s after the cut instead.
- **Do** open with the style's intro *and* one transition on the first layout change — the intro is the door, the
  transition is the hallway.

Related: `references/text-animations.md` (what the title/keyword does), `references/creative-editing.md`
(sequencing the whole edit), `references/styles.md` (playbook per style).
