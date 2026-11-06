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

**Screen mockup of the feature** (a plugin, a setting, a checkout / purchase flow, a user panel). This is what the
user asks for whenever the speaker *describes software*: show the actual screen and make the described thing happen
on it. One `ui` element with `kind: "page"` inside the cutaway (`frame`: `browser` · `admin` = browser + dark WP
sidebar via `side` · `phone`), rows revealed on their words (`at` = seconds after `t`), a cursor that moves to the row
and clicks, a ring on the row being talked about, and a modal for blocking states:

```json
{"type": "cutaway", "t": "w:تنظیمات#2-0.2", "end": "w:یعنی-0.1"},
{"type": "ui", "kind": "page", "t": "w:تنظیمات#2-0.1", "end": "w:یعنی-0.15", "y": 760, "w": 940, "url": "shop.ir/wp-admin",
 "side": ["پیشخوان", "سفارش‌ها", "نیاس لاگین"], "header": "تنظیمات ورود و ثبت‌نام",
 "rows": [{"row": "h", "text": "قفل کردن صفحات", "at": 1.6},
          {"row": "field", "label": "آدرس صفحه", "value": "/checkout", "ltr": true, "at": 3.2},
          {"row": "toggle", "label": "ورود اجباری قبل از پرداخت", "on": 5.0, "at": 4.4},
          {"row": "button", "text": "ذخیره تغییرات", "at": 5.6, "press": 6.2}],
 "cursor": [{"at": 3.4, "row": 2}, {"at": 5.0, "row": 3, "fx": 0.1}, {"at": 6.2, "row": 4}],
 "hi": [{"at": 1.7, "row": 1, "d": 1.4}]}
```

Row types: `h` (section title) · `field` (`label`, `value` typed in, `ltr` for URLs/codes, `typeAt`) · `toggle`
(`on`: offset when it switches on, or `true`) · `button` (`press` offset, `dim`) · `item` (`icon`, `title`, `sub`,
`badge`, `bad`) — order lines · `empty` (`icon`, `text`) — «هیچ سفارشی یافت نشد» · `alert` (`cls` err/ok/info) · `chip`
(`items`). `modal: {at, icon, title, text, button}` covers the page (e.g. «برای ادامه وارد شوید» on the checkout).
Ideas that land: the same «سفارش‌های من» page empty at the problem and filled at the payoff; the checkout page where the
pay button is blocked by a login modal; a phone screen with an OTP field for mobile verification. Keep the page in
y 300–1200 so the subtitle stays readable, and don't add stickers on top of it.

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

## Capturing real screens (the user's local site)

The user wants **real pages of their own local site** in the cutaways (plugin settings, orders, the login form), not
mockups and not a public website. They open the local site (logged in) in the built-in browser pane for you.

- **Logged-in views** (wp-admin, the plugin's settings, «حساب کاربری → سفارش‌ها»): capture in the pane with
  `computer {action: "zoom", region: [0,0,800,689]}` — it saves a lossless 800×689 PNG under the session's
  `tool-results/` folder (path printed in the result); copy it to `<workdir>/shots/local/`. Never use `scale` < 1 for a capture.
- **Make it readable on a phone**: before capturing, hide the WP chrome with an injected style
  (`#adminmenumain,#wpadminbar,.notice,.update-nag{display:none}` + `#wpcontent{margin:0}`) and set
  `document.documentElement.style.zoom = '1.5'` (1.5–1.7), then frame the part being talked about. With zoom on,
  `scrollIntoView` is unreliable — hide what's above instead. Desktop pages captured at 100 % are unreadable in a Reel.
- **Guest views** (the login popup a visitor sees, a guest checkout): headless Chrome with no cookies
  (`puppeteer-core` from `~/.cache/reel-motion-edit/node`), `deviceScaleFactor: 2`. Crop out third-party brand logos
  that a login template may carry.
- **Before/after of a setting**: change the field's value in the DOM only (e.g. add `/checkout/` to «صفحات قفل‌شده»),
  capture, then restore the original value — never click save, never change settings for real, never log the user out.
  A demo state that doesn't exist (an empty orders list) may be staged in the DOM the same way; reload the page after.
- Use them with `shot` (`frame: "browser"`, `url` = the real local path, `imgW: 800`, `w: 940`, `vh` ≈ 675, `y` ≈ 750 so
  the frame ends above the right action rail), consecutive shots of the same screen with `enter: "none"`, rings
  (`hi`) and cursor clicks in image pixels.
