# Style playbook

Every preset in `assets/styles.json` sets the theme (colors, fonts), component visuals, default motion,
transition pool, sound palette (`sfxMap`), default caption style and full-frame look layers (`fx`).
The plan just says `"style": "<name>"`. This page is about **how to direct** in each style: which
components carry the ideas, how hard to hit, how fast to cut.

| style | pick it for | carry ideas with | motion & pace | avoid |
|---|---|---|---|---|
| `gradient` modern gradient | general tech tutorials, product how-tos | step chip, stickers, highlight + callout, confetti payoff | medium, back-out pops | nothing special; it's the safe default |
| `bold` pop | hooks, hot takes, money/number claims, fast talkers | big keyword stickers on almost every key phrase, counters, compare | fast: a punch-in every 3–5 s, flash cuts, shakes on hits | small text, subtle UI; it must be loud and big |
| `neon` tech | hacks, security, VPN, coding, "secret trick" content | glitchy title, neon keywords, steps, notes | sharp, glitch transitions at layout changes, 1–2 shakes | too many colors; keep cyan, magenta and green |
| `minimal` clean | premium/product, calm explainers, design, finance | few elements: one keyword per idea, steps, a clean success card | slow: rise and fade, no shakes, zoom (not punch) camera | confetti, glitch, more than 2 elements at once |
| `doodle` hand-drawn | teaching, kids/beginners, friendly tips, lists | scribble highlights on targets, underlined keywords, notes, arrows | playful: paper transitions, slight rotations | perfect geometry; let it feel handmade |
| `retro` VHS | nostalgia, "old vs new", fun/meme content, gaming | stickers with offset shadows, compare, glitchy title | static/glitch transitions, tape-stop on exits | clean modern UI cards next to VHS grain |
| `news` broadcast | announcements, updates, "X just changed", serious claims | headline title, squared keywords as captions-of-record, ticker text | steady: bars/wipe transitions, sting on the payoff | confetti, emoji overload |

For `news`, set the ticker with `"fxProps": {"newsbar": {"tag": "خبر فوری", "text": "…"}}`.
For `retro`, the REC/timecode layer runs automatically.

## Hook formats: rotate them, don't reuse the last one

The first 1–3 s decide retention. Pick the format that fits what the speaker actually says first:

1. **Promise title**: "`VPN` *رایگان*" plus a sub-line (default).
2. **Question**: the speaker asks ("ویندسکرایب داری؟"). Show the question as the title, then pop the answer as a keyword when it comes.
3. **Problem first**: open on the error or pain on screen. Glitch transition, red neon keyword, then «راه حل 💡».
4. **Number hook**: `counter` on the spoken number (۵۰ گیگ, ۳ ثانیه, ۱۰ برابر) as the first element.
5. **Before → after**: `compare` (پولی ❌ → رایگان ✅) in the first 2 s.
6. **Result first**: show the payoff frame/success card first, then "بذار نشونت بدم چطوری" and the steps.
7. **POV / you**: kicker "اگه تو هم…" plus a title addressed to the viewer.

## Variety inside one video

- Don't use the same component twice in a row for consecutive ideas (sticker, sticker, sticker). Alternate keyword / note / compare / counter / icon.
- Vary sticker positions (left-high, right-low, center-bottom) within the safe zones, not always center-bottom.
- Let transitions cycle (omit `kind`); use a special one (circles, glitch) only for the biggest section change.
- One "signature moment" per video: the payoff with riser → success, or a big camera shake on the problem reveal.
