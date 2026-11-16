# Text animation (titles, keywords, captions)

Three different jobs, three different behaviours. Mixing them up is the most common reason a reel looks
"template-y": a hook that screams like a keyword, a keyword that whispers like a caption, a caption doing
cartwheels over a calm explanation.

| layer | job | size | lives for | default motion |
|---|---|---|---|---|
| **title** | hook — the promise / the question | 70–120 px/line | 2.4–3.8 s, hook only | slam · rise · glitch · blur · mask … |
| **keyword** | one punchy word that echoes speech | 60–100 px | 1.2–2.4 s | pop from center, wiggle |
| **caption** | the spoken words, readable | 46–62 px | per chunk, whole sentence | word-by-word reveal |

Caption styles have their own page: `references/caption-styles.md` (12 styles, when to use each).
This page is about **titles and keywords**, plus the rhythm rules that apply to all text.

---

## Title animations (`title.anim`)

For the `focus` animation, wrap one short phrase in asterisks in `lines`. Its line is larger, and the marked phrase enters as a group with an underline. `focusAt` sets its delay from the title start. The unmarked words arrive first. A title without a marked phrase uses `mask`.

Ten entrance styles. All of them animate **word by word** (`gap` = `wordGap`, default .22 s; `type` defaults to
.07 s so it reads as typing). The `*highlight*` word keeps its colour in every one.

| anim | what happens | reads as | best for |
|---|---|---|---|
| `slam` | each word drops in huge, overshoots and lands (scale 2.6 → 1, rotate ±8°) | a punch, an announcement | bold, gradient, the default hook |
| `rise` | words slide up from behind their own line | calm, editorial | minimal, news, warmguide |
| `mask` | a clip-reveal: words are wiped open from the bottom | designed, "type set by a person" | editorial, print, magazine layouts |
| `type` | letter-by-letter with a blinking caret | a machine is typing / a message | tech, terminal, "prompt" content |
| `flip` | each word flips up on its X axis like a card | playful, glossy | y2k, playful product |
| `wave` | words bounce in one after another with alternating tilt | friendly, bouncy | doodle, kids, light topics |
| `stamp` | each word slams flat, no bounce (power4.in) | a stamp, a verdict | brutalist, protest, hard claims |
| `track` | the whole line's letter-spacing contracts from wide to normal while the words fade in | cinematic, premium | print, film titles, chapter cards |
| `glitch` | words appear in stepped RGB-sliced jumps | error / hack / surprise | neon, retro (max once) |
| `blur` | words sharpen out of a heavy blur | dreamy, memory | lineglow, glass, emotional |

Other knobs:
- `wordGap` — seconds between words. .18–.26 normal, .07–.1 for `type`, .3+ for dramatic single words.
- `jitter` — micro-shake of the whole title after the last word (`false` to stop it). Keep `true` for loud
  styles, `false` for calm ones.
- `kicker` / `kickerIcon` — a small pill above the title; it drops in *before* the words (0.45 s). Use it for
  context ("آموزش ۶۰ ثانیهای", "۳ نکته") — never a second sentence.
- `sub` — appears 0.35 s **after the last word**, as a quieter second line. This is where the qualifier goes
  ("بدون فوتوشاپ"), not into the big line.
- `scrim` — dark gradient behind the title so it survives a bright screen (default on; `scrimH` controls depth).
- `y` / `size` — the title is laid out inside the safe width automatically; long lines shrink. If a line shrinks
  below ~45 px it is too long — cut words, don't shrink further.

**Do not** run two different title anims in one video's hook. One signature entrance per video, chosen in the
"opening signature" step (SKILL.md). Inside the body, title text should not appear at all while captions run
(`DUPTEXT` lint).

### Animation by style (suggested, not mandatory)

| style | title | keyword look | caption |
|---|---|---|---|
| gradient | `slam` | `sticker` | karaoke |
| bold | `slam` | `sticker` big | pop |
| neon | `glitch` | `neon` | kinetic |
| minimal | `rise` | `plain` / `outline` | minimal |
| doodle | `rise` | `sticker` tilted | boxed |
| retro | `glitch` | `sticker` offset | boxed |
| news | `rise` | `plain`, squared | karaoke |
| editorial | `mask` | `marker` | highlight |
| print | `track` | `stamp` | highlight |
| brutalist | `stamp` | `block` | block |
| type | `type` | `chrome` / `block` | stagger |
| glass | `blur` | `outline` | mask |
| y2k | `flip` | `chrome` | bubble |
| lineglow | `blur` | `plain` | reveal |
| hud | `rise` | `plain` mono | reveal |
| warmguide | `rise` | `sticker` small | accent |
| pictogram | `rise` | `plain` | reveal |
| chalk | `wave` | `marker` | reveal |
| blueprint | `rise` | `outline` | minimal |

---

## Keyword entrances (`keyword.from`)

| `from` | move | use |
|---|---|---|
| `pop` | scale 0.6 → 1 with overshoot (default) | a punch on a key word |
| `left` / `right` | slides in from that side | matching the direction of a scroll or a pointing arrow |
| `drop` | falls from above | "و اینجاست که…", a banner dropping |
| `up` | rises from below | a reveal after something was removed |

Duration is 0.5 s with `back.out(2.2)`. Exits are faster (0.25 s, scale down) so the screen clears for the next
idea. Set `wiggle: false` when the keyword sits next to UI text (a wiggling label looks broken on a screenshot).

---

## Keyword looks (`keyword.style`)

| style | look | reads as | notes |
|---|---|---|---|
| `sticker` | filled rounded label with a drop shadow | default social sticker | colour comes from the style |
| `neon` | glowing text, no box | electric, tech | needs a dark background |
| `outline` | outlined transparent text | graphic, poster | best at 80 px+ |
| `gradient` | gradient-filled text | modern, glossy | one per video |
| `plain` | text + soft shadow only | quiet, editorial | the safe choice on any footage |
| `marker` | highlighter stripe behind the word | notes, study, hand-made | editorial/print/chalk |
| `tape` | torn paper tape with a rough edge | scrapbook, "pinned" | doodle/editorial; tilt it |
| `stamp` | double-ruled box, uppercase-ish letterspacing | verdict, official | brutalist/print; don't wiggle |
| `chrome` | liquid-metal vertical gradient | y2k, glossy tech | needs to be big |
| `block` | solid dark slab with a coloured edge | broadcast/label | brutalist/type; pairs with `stamp` |

Keyword rules:
- **One keyword at a time**, one per idea. Two stickers side by side is a slide, not a reel.
- 1.2–2.4 s of screen time; the keyword leaves *before* the next sentence starts.
- Keep it inside the safe area; `check` (`SAFE`) is the referee.
- Text syntax works: `*word*` for the accent, `` `Latin` `` for LTR runs, `~word~` + `strikeAt` to strike a wrong
  term out on the word that corrects it.

---

## Rhythm rules (all text)

1. **Text lands on the word.** Anchor `t` to `w:…`, not to a rounded second. For the first word after a pause,
   `-0.05` corrects Whisper's lateness.
2. **Reading time** ≈ 0.25 s per word + 0.6 s. A 4-word keyword needs ≥ 1.6 s on screen; a 3-word title ≥ 1.3 s
   after its last word animates in.
3. **One entrance per moment.** If a title and a keyword enter together, mute one, offset the other by 0.2–0.3 s.
4. **Exits are quieter than entrances** (0.25 s vs 0.45 s) and move *away* from where the next element comes from.
5. **Don't stack text layers.** Title + keyword + caption + note on one frame is `CLUTTER`; the eye gives up.
6. **Let the type breathe between ideas**: 0.3–0.5 s with only the caption is a palate cleanser, not dead air.
7. **Numbers**: use `counter` for any spoken number instead of typing it into a keyword; the count-up is the proof.

## RTL / Persian specifics

- Keep Latin words, product names, URLs and code in backticks: `` `WordPress` ``. Without them the bidi algorithm
  can flip the order of the surrounding Persian.
- `track` animates `letter-spacing`. Persian is a connected script: at wide spacing the joins look stretched, so
  use `track` on **short** headlines (≤ 4 words) and only once per video. Never letterspace body/caption text.
- `type` types letter by letter. In Persian that also disconnects/reconnects joins while typing — charming for a
  short URL or a name in Latin, questionable for a whole Persian sentence. Prefer it on `` `English` `` runs.
- `stamp` uppercases via CSS `text-transform`, which does nothing to Persian — it still works (the double border
  carries the look), just don't expect capitals.
- Font pairing: display = the personality (Hasti, Morabba, YekanBakh), body = legibility (Peyda, IRANSansX).
  Never set a display font for a caption longer than 4 words.

## Quick recipes

- **Hook, loud:** `title` `slam`, kicker pill, 3-word line, one `*word*`, `jitter: true`, camera punch on the
  last word, `impact` + `whoosh`.
- **Hook, premium:** `title` `mask` or `track`, no kicker, one short line, `jitter: false`, `fade` transition,
  no SFX until the first claim.
- **Proof moment:** `counter` (not a keyword) + `keyword` "دقیقاً" 0.2 s later + `success` card.
- **Section label:** `keyword` `plain` small, top-left inside the safe area, `wiggle: false`, 1.4 s, no SFX.
- **Explanation:** no title at all — `reveal`/`accent` captions + a `scene` drawing; the eye reads one thing.

Related: `references/transitions.md`, `references/caption-styles.md`, `references/creative-editing.md`,
`references/components.md` (full prop list).
