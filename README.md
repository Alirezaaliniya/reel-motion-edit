# reel-motion-edit

**A [Claude Code](https://claude.com/claude-code) skill that turns a raw vertical video (talking head + screen recording) into a motion-graphics edit, with text synced to the speech, sound effects on real on-screen events, creative transitions, camera punch-ins, and optional karaoke/pop subtitles. Built Persian/RTL-first.**

[فارسی](#فارسی) · [English](#english)

---

## فارسی

یه اسکیل برای Claude Code که ویدیوی خام عمودی (ریلز، شورتز، آموزش با ضبط صفحه) رو به یه ادیت موشن‌گرافیک کامل تبدیل می‌کنه. فقط کافیه بگی:

> «این ویدیو رو ادیت موشن گرافیک کن، افکت صوتی هم بذار» `E:\videos\my-reel.mp4`

### چی کار می‌کنه
- **متن دقیقاً روی کلمه:** صدات رو با Whisper به متن تبدیل می‌کنه (با زمان هر کلمه). هر المانی که به حرفت مربوطه، دقیقاً همون لحظه‌ای ظاهر می‌شه که اون کلمه رو می‌گی.
- **افکت صوتی بجا:** کلیک‌ها، عوض شدن صفحه و زوم‌ها رو از روی تصویر تشخیص می‌ده و ۲۷ افکت صوتی بدون کپی‌رایت رو دقیقاً روی همون لحظه‌ها می‌ذاره.
- **صورتت رو نمی‌پوشونه:** محدوده‌ی صورت و پنجره‌ی کوچیک دوربین (PIP) مشخص می‌شه و یه چک خودکار جلوی المان‌هایی که روشون می‌افتن رو می‌گیره.
- **۱۵ المان آماده:** تیتر قلاب، نشانگر مرحله‌ها، استیکر کلمه، کارت نکته، فلش و برچسب، هایلایت دکمه، موج کلیک، شمارنده‌ی عدد، مقایسه‌ی قبل/بعد، کانفتی موفقیت، دکمه‌های سیو/فالو و…
- **ترنزیشن‌های خلاقانه:** wipe، دایره‌ها، گلیچ، نوارها، نور (light leak)، فلش. حرکت دوربین هم داره: پانچ‌این، زوم، لرزش.
- **فونت فارسی:** وزیرمتن، لاله‌زار، چنگا، لیموناده، نوتو کوفی (همه با مجوز آزاد OFL). فونت‌های نصب‌شده‌ی خودت (مثل مربع یا ایران‌سنس) هم قابل استفاده‌ست.
- **۱۱ سبک ادیت:** ۷ سبک روی ویدیو (گرادیانی مدرن، پاپ جسور، نئون تکنولوژی، مینیمال تمیز، دست‌نویس، رترو VHS، خبری) و ۴ سبک «انیمیشن توضیحی تمام‌صفحه» روی ویس: لاین‌آرت سینمایی، دیتا / HUD، آموزشی کرم-نارنجی و اینفوگرافیک پیکتوگرامی. اول کار می‌پرسه چه سبکی می‌خوای؛ اگه ندونی، خودش با توجه به محتوا پیشنهاد می‌ده و یه فریم از ویدیوت رو توی همه‌ی سبک‌ها نشونت می‌ده.
- **حالت Explainer:** کل فریم گرافیک می‌شه: نقاشی‌های خطی که خودشون کشیده می‌شن، آدمک‌ها و ستون‌های عددی، لیبل‌های HUD، کارت‌های UI، نوار مرحله، کاراکتر خودت (مسکات) و زیرنویسی که کلمه‌به‌کلمه روشن می‌شه. ورودی می‌تونه فقط فایل صوتی باشه، یا ویدیوی خودت توی پنجره‌هایی وسط انیمیشن.
- **امکانات اضافه:** حذف مکث‌ها (جامپ‌کات)، تمیز کردن صدا، کاور پست، واترمارک @هندل، متن کپشن اینستاگرام با هشتگ، و «کیت برند» که سبک و رنگ‌ها و هندلت رو برای ویدیوهای بعدی یادش می‌مونه.
- **زیرنویس خلاقانه:** آخر کار ازت می‌پرسه زیرنویس می‌خوای یا نه و پنج سبک پیشنهاد می‌ده: karaoke، pop، kinetic، boxed و minimal.
- **صدا با استاندارد اینستاگرام:** −14 LUFS.

### نصب
پیش‌نیازها: Python 3.10+، Node.js 18+، ffmpeg، Google Chrome یا Edge.

```bash
git clone https://github.com/Alirezaaliniya/reel-motion-edit ~/.claude/skills/reel-motion-edit
python ~/.claude/skills/reel-motion-edit/scripts/setup.py
```

`setup.py` بقیه‌ی چیزها رو خودش نصب می‌کنه: faster-whisper، puppeteer-core و gsap، کتابخونه‌ی افکت‌های صوتی، و مدل Whisper (حدود ۱.۶ گیگ، فقط بار اول). اگه huggingface.co در دسترس نباشه، خودش از mirror دانلود می‌کنه و دانلود نصفه رو ادامه می‌ده.

---

## English

A Claude Code skill that edits short vertical videos into a polished motion-graphics cut. Hand Claude a video and say "edit this with motion graphics and sound effects". The skill takes it from there:

```
ask first: overlay or explainer + which style (or "suggest one")
→ analyze (Whisper word timings + visual motion events + timestamped contact sheets)
→ style board / recommendation (+ pause trimming, voice cleanup, @handle)
→ beat sheet → plan.json (components anchored to words / events)
→ check (layout lint: face/PIP coverage, clutter, SFX pile-ups) → preview stills
→ render overlay (HTML + GSAP, transparent ProRes 4444)
→ compose (camera moves + overlay + SFX bed + optional ducked music, −14 LUFS)
→ offer subtitles (karaoke / pop / kinetic / boxed / minimal) + cover, post caption, brand kit
```

### Highlights
- **Word-anchored timing.** Write `"t": "w:free"` instead of seconds, and the element lands on that spoken word.
- **Event-anchored SFX.** Motion events (`"t": "m:m12"`) come from frame differencing, and Claude confirms each one against 0.5 s contact sheets.
- **Layout lint.** Declare `avoid` zones (face, PIP). `render.js check` flags any element that covers them.
- **11 style presets**, asked at the start (or recommended): 7 overlay styles (gradient, bold pop, neon tech, clean minimal, hand-drawn doodle, retro VHS, broadcast news) and 4 full-frame **explainer** styles (cinematic line-art, data HUD, warm cream tutorial, pictogram infographic). Each sets colors, fonts, component visuals, motion, transitions, the sound palette and look layers. A **style board** renders a frame of *your* video in every preset.
- **Explainer mode:** a voice-over (or the audio of your video) drives self-drawing line-art scenes, Isotype pictograms, HUD readouts, UI mock cards, a segmented step bar, your own mascot image and a word-by-word reveal subtitle; your footage can appear in windows.
- **Extras:** pause trimming (`tighten.py`), voice cleanup, post cover (`render.js cover`), @handle watermark, Instagram caption text, and a persistent **brand kit** (`~/.config/reel-motion-edit/brand.json`).
- **26 components (+16 built-in pictograms), 12 transitions, 4 camera moves, 42 synthesized royalty-free SFX, 6 bundled Arabic-script fonts + a monospace.**
- Pixel-perfect Persian shaping, because the overlay is rendered by Chrome, not by an ffmpeg text filter.

### Install
Requirements: Python 3.10+, Node.js 18+, ffmpeg, Chrome or Edge.

```bash
git clone https://github.com/Alirezaaliniya/reel-motion-edit ~/.claude/skills/reel-motion-edit
python ~/.claude/skills/reel-motion-edit/scripts/setup.py
```

### Layout
```
SKILL.md                      workflow Claude follows
references/components.md      plan.json component catalog + SFX list
references/creative-direction.md  placement, timing, sound & transition rules
references/caption-styles.md  subtitle styles and when to recommend each
references/explainer.md       explainer mode: scenes, pictogram shapes, per-style recipes
references/cutaway-edit.md    talking head + designed animated cutaways (diagram, chart, phone mockup, logos)
scripts/setup.py              dependencies, SFX synthesis, Whisper model download
scripts/analyze.py            probe, transcript, motion events, contact sheets
scripts/render.js             time anchors, layout check, previews, overlay render
scripts/compose.py            camera moves, overlay, SFX/music mix, loudness
scripts/captions.py           transcript → subtitle chunks (with spelling fixes)
scripts/sfx.py                procedural sound-effect library
scripts/tighten.py            jump-cut long pauses before analysis
assets/styles.json            the 11 style presets
references/styles.md          per-style directing playbook + hook formats
assets/engine.html            the GSAP component engine
assets/fonts/                 OFL fonts (+ their licenses)
examples/plan.example.json    a complete plan for a 60 s tutorial reel
examples/plan.explainer.json  an explainer (voice-over → hud diagrams) plan
examples/plan.cutaway.json    a talking-head edit with three animated cutaways, logos and pop subtitles
```

## License
Code: [MIT](LICENSE). Fonts in `assets/fonts/`: SIL Open Font License 1.1 (see the `OFL-*.txt` files).
