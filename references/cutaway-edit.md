# Cutaway edit — talking head + designed animated graphics (the user's favourite recipe)

«تاکینگ‌هد + کات‌اوی انیمیشنی». The speaker stays on camera for the hook, opinions and the CTA; whenever he
*explains* something (how it works, a comparison, a process), the footage is replaced for 4–10 s by a designed,
animated graphic while his voice and the subtitle keep running. Built and approved on «روش های ارسالی»
(`examples/plan.cutaway.json` is that final plan). Offer it in Step 1 as the edit type
*"My video + animated cutaways"*; it works in any overlay style (made in `bold`).

## The layer of the whole edit (what the approved version had)

| what | how |
|---|---|
| style | `bold` (+ the user's fonts: `"theme": {"display": "Hasti", "body": "Peyda"}`) |
| intro | automatic (style intro + punch-out) |
| colour | `"grade": "punchy"` (visible correction; the subtle grades looked like no filter) |
| sound | default `sfxMix` (fewer sounds, normal level); scene drawings inside a cutaway `"sfx": false` |
| subtitles | `captions.py --style pop --default-y 1250` + a long `--fix` list for Whisper spellings |
| watermark | `"handle": {"text": "@nias_ir", "corner": "tl"}` |
| no emoji | icons (`icon`, `kickerIcon`) and real logos as images |
| logos | the user's PNG/SVG/WebP files, put on white rounded cards (below), shown as `icon` with `img:` on the word that names the company |

## Layout bands (1080×1920, face ≈ x 230–790, y 500–1220)

- **top band y 90–460**: hook title, stickers that name things, logo cards, step/price labels
- **subtitle y ≈ 1250** (just under the chin)
- **chest band y ≈ 1530**: stickers for consequences («ضرر»، «به‌صرفه‌تر»), notes, CTA buttons
- inside a cutaway the whole frame is free, but keep the graphic in y 250–1150 so the subtitle stays readable

## Workflow (on top of the normal SKILL steps)

1. **Beat sheet**: mark every *explanation* stretch. Pick 2–4 of them (4–10 s each, not the first 3 s, not the
   CTA). For each, decide one picture: a flow diagram, a bar/price chart, a device mockup that fills in, a map,
   a before/after. **Never a text list** — the user rejected a checklist card: "make an element that has a look".
2. **Write each cutaway as a group**: one `cutaway` element (its `t`/`end` anchored a little before the first word
   and just after the last), then the elements that build the graphic, *listed after it* so they draw on top.
   Every part appears on the word that names it (`t` anchors or `data-at` offsets inside one `scene`).
3. **Remove** overlay stickers/notes that would duplicate the cutaway in that time range.
4. `check` (COVERS/CLUTTER are skipped inside cutaways), then `preview` at 3–4 times *inside* each cutaway:
   every part must be on screen by the time its word is said, nothing empty for more than ~1.5 s.
5. Full render → compose → contact sheet. Deliver as a new version (`- edit vN`).

## Reusable cutaway blocks

Coordinates are frame pixels. `class`: `bold` thick stroke, `acc` primary colour, `alt` secondary (red in bold),
`dim`, `fill` (solid). Raw `<text>` always gets `text-anchor='middle'`; Latin/number runs get `direction='ltr'`.

**Flow diagram** (A → middle → B and C):
```json
{"type": "cutaway", "t": "w:<first>-0.1", "end": "w:<next sentence>-0.1"},
{"type": "icon", "t": "w:<first>", "end": "…", "x": 540, "y": 390, "icon": "cart", "size": 150, "anim": "pulse", "sfx": false},
{"type": "keyword", "t": "…", "end": "…", "x": 540, "y": 520, "text": "فروشگاه تو", "style": "plain", "size": 56, "rotate": 0, "wiggle": false, "sfx": false},
{"type": "scene", "t": "…", "end": "…", "sfx": false, "svg": "<path class='bold' d='M540 580 L540 650'/><path class='bold' d='M520 632 L540 655 L560 632'/>"},
{"type": "keyword", "t": "w:<middle>", "end": "…", "x": 540, "y": 730, "text": "سرویس واسط", "icon": "deal", "size": 80, "rotate": 0, "wiggle": false},
{"type": "scene", "t": "w:<B>-0.2", "end": "…", "sfx": false, "svg": "<path class='bold' d='M540 800 L540 840 L300 840 L300 900'/><path class='bold' d='M280 882 L300 905 L320 882'/><path class='bold' data-at='0.6' d='M540 840 L780 840 L780 900'/><path class='bold' data-at='0.6' d='M760 882 L780 905 L800 882'/>"},
{"type": "keyword", "t": "w:<B>", "x": 300, "y": 980, "text": "پست", "rotate": -3, "size": 76, "wiggle": false},
{"type": "keyword", "t": "w:<C>", "x": 780, "y": 980, "text": "تیپاکس", "rotate": 3, "size": 76, "wiggle": false}
```

**Price / bar chart** (expensive vs cheap): a baseline, a tall `fill alt` bar revealed on the "expensive" word,
a short `fill acc` bar on the "cheap" word, labels under each, and a «گرون‌تر» / «ارزون‌تر» sticker above each bar
(icons `up` / `down`). Reveal the first bar within ~1 s of the cutaway start so the frame isn't empty.

**Phone / panel mockup that fills in** (a process inside an app): phone outline
(`<rect class='bold' x='210' y='340' width='440' height='840' rx='60'/>` + notch), a title inside, then white
cards revealed on their words: an order card (yellow box icon + «سفارش ۱۲۴۸» + route), a green «ثبت شد» pill,
a tracking card (barcode = 27 thin black rects + the code in mono, `direction='ltr'`), then an arrow out of the
phone to a `user` icon («مشتری») and a yellow message bubble with the code. Full markup: the third `scene` in
`examples/plan.cutaway.json`.

**Logo cards** (company names): `python <skill>/scripts/logocard.py <workdir>/logos <logo files…>` turns each logo
(PNG/WebP/JPG/SVG) into a white rounded card with a soft shadow → `logos/card_<name>.png`, then
`{"type": "icon", "icon": "img:logos/card_<name>.png", "size": 360–420, "anim": "pulse", "t": "w:<name>"}` in the
top band, side by side, staying until the sentence ends. `size` is the card's width.

## Gotchas learned on this edit

- Free `gsap` tweens don't advance while render.js seeks frame by frame: anything animated must live on the main
  timeline (fixed for captions — keep it that way in new components).
- An element whose `d` is shorter than its entrance (0.5 s) can stay visible after its end; give stickers ≥ 0.8 s.
- Raw SVG text in RTL pages anchors on the wrong side unless `text-anchor='middle'` is set.
- Files over ~30 MB can't be committed back in one piece: split into 9 MB parts, commit them, `cat` them together
  on the user's computer and check the result decodes. The outputs folder adds a C2PA manifest to MP4s (harmless).
