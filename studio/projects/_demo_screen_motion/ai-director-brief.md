# دستورالعمل جامع و خودکفای تدوین هوشمند: دمو کارگردانی اسکرین تمام‌صفحه

## ۰. نحوهٔ اجرا و اسکیل‌های الزامی برای هوش مصنوعی (Execution Contract)
- **حالت اجرا:** `auto` (`auto` = بهترین موتور متناسب با سبک | `skills` = استفاده از اسکیل‌های مشخص‌شده | `custom-code` = کدنویسی مستقیم بدون محدودیت قالب)
- **پروژهٔ استودیو:** `_demo_screen_motion` | پوشهٔ پروژه: `E:\camtasia\reel-motion-edit\studio\projects\_demo_screen_motion`
- **فایل‌ها و اسکیل‌هایی که قبل از تدوین باید مطالعه/استفاده شوند:**
  - `reel-motion-edit` → `E:\camtasia\reel-motion-edit\SKILL.md`
  - `pinterest-studio` → `E:\camtasia\reel-motion-edit\studio\pinterest_renderer.py`
  - `motion-doctrine` → `C:\Users\alireza\.gemini\config\skills\motion-doctrine\SKILL.md`
  - `cut-the-curve` → `C:\Users\alireza\.gemini\config\skills\cut-the-curve\SKILL.md`
  - `oversized-cursor` → `C:\Users\alireza\.gemini\config\skills\oversized-cursor\SKILL.md`
  - `hyperframes` → `C:\Users\alireza\.gemini\config\skills\hyperframes\SKILL.md`
  - `remotion-best-practices` → `C:\Users\alireza\.gemini\config\skills\remotion-best-practices\SKILL.md`
  - `ffmpeg-skill` → `C:\Users\alireza\.gemini\config\skills\ffmpeg-skill\SKILL.md`
  - `ui-ux-pro-max` → `C:\Users\alireza\.gemini\config\skills\ui-ux-pro-max\SKILL.md`

## ۱. مشخصات سبک، کادر، اینترو/اوترو و هویت بصری
- **سبک انتخابی:** `bold` | **چیدمان قاب:** `C` | **نسبت تصویر:** `9:16`
- **سیستم طراحی مرجع (گیت‌هاب ۶۷ سبک):** `بدون ارجاع اضافه`
- **پالت رنگ:** اصلی `#FFD400` | تأکید `#FFD400` | پس‌زمینه `#0A0A0A` | متن `#FFFFFF`
- **فونت‌ها:** تیتر `Lalezar` | متن `Vazirmatn` | مقیاس فونت: `md`
- **نام/آیدی پیج:** `@nias.ir` (جایگاه روی کادر: `tc`)
- **حالت متن و جایگاه‌ها:** نوع نمایش `keywords` | افکت نمایش/تأکید کلمات `word-unblur` | جایگاه تیتر `top` | جایگاه زیرنویس `bottom-safe` | سبک زیرنویس `karaoke`
- **تنظیمات حرکتی و فوتیج:** خط منحنی پشت کارت: `خیر` | المان‌های بلر گوشه: `خیر` | اسکرول فضایی: `خیر` | فوتیج افکت: `none` (حالت `screen`، شفافیت `0.45`)
- **اینترو و اوترو:** سبک اینترو `none` (2.0s) | سبک اوترو `none` (2.8s) | واژه CTA: `` ()
- **پریست حرکتی (FFX) و حالت‌های ترکیبی هوشمند (Smart Hybrid):** پریست پایه `karo-bounce` (فایل پارامترها: `E:\camtasia\reel-motion-edit\assets\motion-presets.json`) | ترکیبی چیدمان: `خیر` | ترکیبی ترنزیشن‌ها: `خیر` | ترکیبی انیمیشن متن: `خیر` | ترکیبی نمایش متن/زیرنویس: `خیر` | ترکیبی افکت/فوتیج: `خیر`
- **موسیقی و میکس صدا:** موزیک `corporate` (گین `-18 dB`، داکینگ: `فعال`) | گین افکت صوتی `-4 dB` | بهبود صدای گوینده: `فعال`
- **کاور اینستاگرام (۱۰۸۰×۱۹۲۰):** خط اول `` | خط دوم `` | برچسب ``

## ۲. نقشهٔ مخازن و ابزارهای آماده روی سیستم (Assets & Tools Map)
- **فونت‌های فارسی:** `E:\camtasia\reel-motion-edit\assets\fonts\user` (شامل `Hasti`, `Pinar`, `Peyda`, `YekanBakh`, `Morabba`, `IRANSansX`)
- **آیکون‌های ۳ بعدی شفاف (PNG):** `E:\camtasia\reel-motion-edit\assets\icons-3d`
- **آیکون‌های وکتور و لوگوی برندها (SVG):** `E:\camtasia\reel-motion-edit\assets\icons-svg`
- **افکت‌های صوتی (SFX):** `E:\camtasia\reel-motion-edit\assets\sfx` و `E:\camtasia\reel-motion-edit\assets\sfx\user`
- **موزیک پس‌زمینه:** `E:\camtasia\reel-motion-edit\assets\music` | **فوتیج‌های افکت نوری:** `E:\camtasia\reel-motion-edit\assets\footage`
- **دیتابیس ۶۷ سیستم طراحی + ۲۰۰ صحنه Remotion:** `E:\camtasia\reel-motion-edit\assets\design-knowledge`
- **دانلود خودکار از ۲۰۰,۰۰۰ آیکون آنلاین Iconify:** `python E:\camtasia\reel-motion-edit\scripts\fetch_assets.py --search-icon <word>`

## ۳. ایده آزاد کاربر و سناریوی خام
— (مطابق سبک و جزئیات انتخابی اجرا شود)

## ۴. فایل‌های ورودی پروژه
- **فایل صدا/ویدیو اصلی:** `آپلود نشده`
- **لوگو:** `آپلود نشده`

## ۵. استوری‌بورد و بیت‌شیت سکانس‌به‌سکانس

### سکانس 1 (`0s` تا `3.5s`)
- **گفتار:** چیدمان سریع سرفصل‌های دوره با کشیدن
- **تیتر روی صفحه:** `چیدمان سریع سرفصل دوره` | **واژهٔ تأکید:** `دوربین همگام با موس`
- **نوع چیدمان/انیمیشن:** `ui-showcase` | **ترنزیشن:** `push` | **افکت صوتی:** `whoosh`
- **المان/تصویر سکانس:** `D:\nias-course-svn-updater\my-local-dir\assets\screenshot-2-fa_IR.png`
- **کارگردانی اسکرین‌شات (تمام‌صفحه بدون کادر):** حالت `tilt-3d-click` | نقطه زوم `X=50% , Y=45%` | زاویه سه‌بعدی پرسپکتیو: `فعال` | دوربین همگام با موس و افکت کلیک: `فعال`

### سکانس 2 (`3.5s` تا `7s`)
- **گفتار:** فعال‌سازی آنی ماژول‌های حرفه‌ای نیاس
- **تیتر روی صفحه:** `کنترل کامل ماژول‌های نیاس` | **واژهٔ تأکید:** `فقط با یک کلیک`
- **نوع چیدمان/انیمیشن:** `ui-showcase` | **ترنزیشن:** `push` | **افکت صوتی:** `pop`
- **المان/تصویر سکانس:** `D:\nias-course-svn-updater\my-local-dir\assets\screenshot-5-fa_IR.png`
- **کارگردانی اسکرین‌شات (تمام‌صفحه بدون کادر):** حالت `zoom-in-click` | نقطه زوم `X=45% , Y=48%` | زاویه سه‌بعدی پرسپکتیو: `فعال` | دوربین همگام با موس و افکت کلیک: `فعال`

## ۶. استاندارد تحویل و چک‌لیست بازبینی کیفیت (الزامی قبل از تحویل نهایی)
1. خروجی نهایی را در `E:\camtasia\reel-motion-edit\studio\projects\_demo_screen_motion\final.mp4` (30fps، H.264، yuv420p، صدای AAC 192k) و کاور را در `E:\camtasia\reel-motion-edit\studio\projects\_demo_screen_motion\build\cover.jpg` ذخیره کن.
2. حتماً از فریم‌های کلیدی (اینترو، میانهٔ سکانس‌ها، لحظهٔ کلیک موس/ترنزیشن و اوترو) شیت تصویری بساز و با چشم بررسی کن که هیچ متن فارسی برعکس، بریده‌شده یا خارج از ناحیه امن ریلز (Safe-Zone) نباشد.
3. اگر اسکرین‌شات روی حالت تمام‌صفحه یا سه‌بعدی است، ۱۰۰٪ کادر را بدون حاشیه پر کند و دوربین همگام با موس حرکت کند.
4. در پایان، مسیر فایل‌های نهایی و گزارش کوتاه بازبینی را تحویل بده.