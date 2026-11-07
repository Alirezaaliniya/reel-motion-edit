# Style interview: ask before designing

The user wants every edit to start with **questions**, so the look follows their taste for *this* video instead of a guess. The interview has four short rounds of AskUserQuestion (max 4 questions × 4 options per call; "Other" is always there for free text). Do it in Persian. Write the answers to `<workdir>/brief.json` and design only from that brief.

**When a round can be skipped**: the user already answered it in their message, the brand kit answers it (`~/.config/reel-motion-edit/brand.json`) and they didn't ask for something different, or the answer is forced (an audio-only source is always explainer / Remotion; no footage → no face questions). If the user says «خودت انتخاب کن» / "just do it", fill the whole brief yourself, show it as one short list, and ask **one** confirm question (Recommended: "همین خوبه" / alternative: "می‌خوام تغییر بدم"). Never skip the interview silently.

Put your pick first in each question with "(پیشنهادی)" and give the reason in its description, based on this video's content (topic, audience, voice tone).

## Round 1: edit type + style (before setup and analysis; setup can run in the background meanwhile)

First ask (or read from the source: audio only = no face) **whether the user appears on camera**, because the gallery has a sheet for each case. Then send the matching sheet (SendUserFile, display render): `gallery/_gallery-face.jpg` (A = graphics over the talking-head video, B = explainer with the face in a window) when they are on camera, `gallery/_gallery-graphics.jpg` (C = full-frame graphics, D = Remotion 3D/2D) when not, `_gallery.jpg` when unsure. For a cutaway edit show both A and C of the candidate styles. Then ask:

0. **تصویر خودت** (face usage; skip for audio-only sources): کل ویدیو صورتم دیده بشه و المان‌ها روش بیاد (A) · صورتم + کات‌اوی انیمیشنی وسطش (A + C) · صورتم توی یه قاب، بقیه‌ی صفحه انیمیشن (B) · صورتم نباشه، کامل انیمیشن (C / D).
1. **نوع ادیت** (edit type): ویدیوی خودم + کات‌اوی انیمیشنی · المان روی ویدیوی خودم · انیمیشن توضیحی کامل · مطمئن نیستم، پیشنهاد بده (SKILL.md Step 1 has the details).
2. **سبک** (style): give the 3 best gallery styles for this video by code and name, using the letter that matches the face answer (e.g. «A04 مینیمال تمیز روی تصویرت», «D13 پریمیوم تیره سه‌بعدی»), plus "پیشنهاد بعد از تحلیل". Say in the description that any number from the gallery can be typed in "Other".
3. **دوبعدی یا سه‌بعدی** (only when the chosen family allows both or the user is unsure): ۲D سریع (engine, plan.json) · ۳D واقعی (Remotion + Three.js, `references/remotion-3d.md`, slower to build).

After the answer send the 1–3 single gallery images of the chosen style(s) so the user sees them large.

## Round 2: look details (after the transcript is read, so the options fit the content)

1. **حس و لحن** (mood): جدی و پریمیوم · دوستانه و گرم · پرانرژی و جسور · آرام و سینمایی. If the user picked a playful style but the product is serious, warn in the description ("ممکنه کارتنی و بچه‌گانه دیده بشه"). The pop 3D look was judged childish; that's what the premium look fixes.
2. **رنگ** (colour): رنگ‌های برند خودم (ask for hex or a logo next) · پیش‌فرض همین سبک · تیره با یک رنگ تأکید · روشن و تمیز.
3. **شدت حرکت** (motion): نرم و آرام (easeOutCubic, no overshoot) · متوسط · پرتحرک و فنری (overshoot, shakes, zoom punches).
4. **فونت** (font): from the user's own families in `assets/fonts/user/`: Peyda تمیز و مدرن · Hasti ضخیم و نمایشی · Morabba · Pinar. Recommend Peyda for serious, Hasti display + Peyda body for energetic.

## Round 3: sound and text

1. **افکت صوتی** (SFX): کم و نرم · معمولی (فقط لحظه‌های مهم) · پرافکت. The user found too many SFX annoying; never recommend the third unless the style is bold/pop.
2. **موزیک** (music): موزیک بی‌کلام ساخته‌شده (آرام) · موزیک ساخته‌شده (پرانرژی) · ترک خودم رو می‌دم · بدون موزیک. The synthesized ones are original and CC0 (`templates/remotion/tools/`); their drop lands on the turning-point word.
3. **زیرنویس** (captions): کلمه‌به‌کلمه (karaoke) · جمله‌ی کامل با خط زیر کلمه‌ی فعال · فقط کلمه‌های کلیدی · بدون زیرنویس. See `references/caption-styles.md`.
4. **شروع ویدیو** (hook / intro): one of the hook formats from `references/styles.md` that fits this content, plus the style default and a "problem shown first" option.

## Round 4: content and brand (multiSelect; only the items that apply)

- **صفحه‌ی واقعی از سایت لوکال**: when the voice mentions a plugin, setting, checkout or panel. Ask for the local URL (hard rule 4).
- **کات** (cut parts), **حذف مکث‌ها** (trim pauses), **تمیزکردن صدا** (voice cleanup): the Step 3 prep options.
- **واترمارک @هندل**: ask for the handle if the brand kit lacks it.
- **CTA**: confirm the words of the CTA from the voice («کلمه‌ی لاگین رو کامنت کن») and whether to show them as a comment-bubble or a button.

## brief.json

```json
{
  "face": "none", "type": "explainer", "engine": "remotion-3d", "style": "3d-premium",
  "mood": "serious", "colors": {"accent": "#7c5cff"}, "motion": "smooth", "font": {"head": "Peyda", "body": "Peyda"},
  "sfx": "few-soft", "music": "synth-calm", "captions": "sentence-underline", "hook": "problem-first",
  "realScreens": "http://localhost/shop/", "cut": false, "pauses": false, "voice": false,
  "handle": null, "cta": "کلمه‌ی لاگین رو کامنت کن"
}
```

Map it onto the engine: plan.json `style` / `theme` / `sfxMix` / `music` / `captions` / `intro` for the engine; `LookProvider` look, `PREMIUM_MAP` accent, easing, SFX list and music file for Remotion.

## During and after

- If the user's choice clashes with the content, say so once and let them decide; don't re-ask settled choices.
- Before the full render, send 3–6 preview stills of the key beats and ask one question: «همین مسیر خوبه؟» (approve / change something).
- At the end (Step 9) offer to save the brief's lasting parts (style, colours, font, handle, SFX level) to the brand kit, so the next interview starts from them with fewer questions.
