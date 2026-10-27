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
analyze (Whisper word timings + visual motion events + timestamped contact sheets)
→ beat sheet → plan.json (components anchored to words / events)
→ check (layout lint: face/PIP coverage, clutter, SFX pile-ups) → preview stills
→ render overlay (HTML + GSAP, transparent ProRes 4444)
→ compose (camera moves + overlay + SFX bed + optional ducked music, −14 LUFS)
→ ask about subtitles (karaoke / pop / kinetic / boxed / minimal)
```

### Highlights
- **Word-anchored timing.** Write `"t": "w:free"` instead of seconds, and the element lands on that spoken word.
- **Event-anchored SFX.** Motion events (`"t": "m:m12"`) come from frame differencing, and Claude confirms each one against 0.5 s contact sheets.
- **Layout lint.** Declare `avoid` zones (face, PIP). `render.js check` flags any element that covers them.
- **15 components, 6 transitions, 3 camera moves, 27 synthesized royalty-free SFX, 5 bundled Arabic-script fonts.**
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
scripts/setup.py              dependencies, SFX synthesis, Whisper model download
scripts/analyze.py            probe, transcript, motion events, contact sheets
scripts/render.js             time anchors, layout check, previews, overlay render
scripts/compose.py            camera moves, overlay, SFX/music mix, loudness
scripts/captions.py           transcript → subtitle chunks (with spelling fixes)
scripts/sfx.py                procedural sound-effect library
assets/engine.html            the GSAP component engine
assets/fonts/                 OFL fonts (+ their licenses)
examples/plan.example.json    a complete plan for a 60 s tutorial reel
```

## License
Code: [MIT](LICENSE). Fonts in `assets/fonts/`: SIL Open Font License 1.1 (see the `OFL-*.txt` files).
