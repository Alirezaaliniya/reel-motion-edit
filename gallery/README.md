# Style gallery — one moment, every style, every way the face is used

The images are one moment rendered in every style. Two numbers matter:
- **Style number 01–16**: the look. It stays the same across sections, so style 04 is always «مینیمال تمیز».
- **Letter**: how the speaker's face is used.

| letter | how the face is used | moment | engine |
|---|---|---|---|
| **A** | graphics **over the user's talking-head video** (title, keyword sticker, captions; face kept clear) | «روش‌های ارسالی» reel, 8.6 s «خیلی **به‌صرفه‌تر**» | plan engine, overlay styles 01–07 |
| **B** | full explainer with the **face in a window** (`footage` element) | same reel, 8.6 s | plan engine, explainer styles 08–11 |
| **C** | **full-frame graphic, no face** (a cutaway, or an explainer on a voice-over) | NiasLogin voice-over, 24.6 s «…بعد از **تأیید** شماره…»: checkout locked by a verification modal | plan engine, styles 01–11 |
| **D** | **Remotion 3D / 2D**, no face (voice-over) | NiasLogin voice-over, 24.6 s | `templates/remotion/` |

Sheets: `_gallery.jpg` (everything), `_gallery-face.jpg` (A + B: the user is on camera), `_gallery-graphics.jpg` (C + D: no face). In the interview send the sheet that fits the answer to "do you appear on camera?", then the 2–4 single images being compared.

A **cutaway edit** (the user's favourite recipe) mixes A and C: A while the speaker talks, C during the explanation parts. Show A0x + C0x of the same style side by side for it.

| style | Persian name | A | B | C | D | feel | best for |
|---|---|---|---|---|---|---|---|
| 01 `gradient` | گرادیانی مدرن | A01 | – | C01 | – | colourful gradients, glossy chips | tech tutorials, safe default |
| 02 `bold` | پاپ جسور | A02 | – | C02 | – | huge yellow/black type, hard shadows, loud | max-energy hooks, sales |
| 03 `neon` | نئون تکنولوژی | A03 | – | C03 | – | dark glass, cyan/magenta glow, glitch | hacking, VPN, dev topics |
| 04 `minimal` | مینیمال تمیز | A04 | – | C04 | – | white cards, one accent, calm | premium brands, adult audience |
| 05 `doodle` | دست‌نویس | A05 | – | C05 | – | marker strokes, notebook paper | teacher-like tips |
| 06 `retro` | رترو VHS | A06 | – | C06 | – | VHS grain, sunset, REC timecode | nostalgic, playful |
| 07 `news` | خبری / رسمی | A07 | – | C07 | – | navy + red bars, ticker | announcements, serious news |
| 08 `lineglow` | لاین‌آرت سینمایی | – | B08 | C08 | – | black, thin white glowing lines | stories, reflective voice-overs |
| 09 `hud` | دیتا / HUD | – | B09 | C09 | – | charcoal, teal vs red, mono readouts | analytical, data, AI |
| 10 `warmguide` | آموزشی کرم-نارنجی | – | B10 | C10 | – | cream paper, orange accent | friendly step-by-step tutorials |
| 11 `pictogram` | اینفوگرافیک پیکتوگرامی | – | B11 | C11 | – | black, flat white pictograms | social / numbers stories |
| 12 `3d-pop` | پاپ سه‌بعدی براق | – | – | – | D12 | bright colour wipes, glossy 3D, bouncy | young audience — can look childish |
| 13 `3d-premium` | پریمیوم تیره سه‌بعدی | – | – | – | D13 | graphite + one accent glow, satin/titanium 3D, smooth | serious products, "not cartoony" |
| 14 `remotion-minimal` | مینیمال سیاه‌وسفید | – | – | – | D14 | black, tiny white line icons | very sober explainers |
| 15 `remotion-blueprint` | اینفوگرافیک نقشه‌کشی | – | – | – | D15 | navy blueprint grid, drafting labels | technical / process flows |
| 16 `remotion-neon` | لاین‌آرت نئونی | – | – | – | D16 | dark HUD frame, cyan line icons | tech pipelines |

The empty cells are possible but not rendered yet: overlay styles can also be used as a full explainer (C), and Remotion compositions can include the user's video with `<OffthreadVideo>` in a window (like B). Say so when the user asks for such a combination.

## Regenerating

- **A**: plan with the talking-head video, `title` (y 260) + `keyword` (y 1400) + captions (y 1200), face `avoid` rect; `STYLEBOARD_W=540 node scripts/render.js plan.json styleboard 8.6 plan gradient bold neon minimal doodle retro news`.
- **B**: the same plan with `"mode": "explainer"` and a `footage` element (`rect` [290,580,500,580]); the styleboard leaves footage windows empty (compose fills them in a real render), so the face crop is pasted into the window afterwards with PIL.
- **C**: `cutaway` + `title` + `ui` kind `page` with a `modal` at 24.6 s; overlay styles from the overlay plan, explainer styles from an explainer copy of it.
- **D**: `npx remotion still <bundle> <Composition> --frame=738 --gl=angle --scale=0.5`.

Each style is also saved as `build/styleboard/<id>.jpg`. When a style is added, render the same moments and add a row.
