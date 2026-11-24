# دستورالعمل جامع و خودکفای تدوین هوشمند: تست رندر پینترستی فاز ۲

## ۰. نحوهٔ اجرا و اسکیل‌های الزامی برای هوش مصنوعی (Execution Contract)
- **حالت اجرا:** `auto` (`auto` = بهترین موتور متناسب با سبک | `skills` = استفاده از اسکیل‌های مشخص‌شده | `custom-code` = کدنویسی مستقیم بدون محدودیت قالب)
- **پروژهٔ استودیو:** `proj-20261124-091956-af32` | پوشهٔ پروژه: `E:\camtasia\reel-motion-edit\studio\projects\proj-20261124-091956-af32`
- **فایل‌ها و اسکیل‌هایی که قبل از تدوین باید مطالعه/استفاده شوند:**
  - `pinterest-studio` → `E:\camtasia\reel-motion-edit\studio\pinterest_renderer.py`
  - `motion-doctrine` → `C:\Users\alireza\.gemini\config\skills\motion-doctrine\SKILL.md`
  - `cut-the-curve` → `C:\Users\alireza\.gemini\config\skills\cut-the-curve\SKILL.md`
  - `oversized-cursor` → `C:\Users\alireza\.gemini\config\skills\oversized-cursor\SKILL.md`

## ۱. مشخصات سبک، کادر، اینترو/اوترو و هویت بصری
- **سبک انتخابی:** `liquid-glass` | **چیدمان قاب:** `E` | **نسبت تصویر:** `9:16`
- **سیستم طراحی مرجع (گیت‌هاب ۶۷ سبک):** `futuristic`
- **پالت رنگ:** اصلی `#5286B2` | تأکید `#0A1014` | پس‌زمینه `#0B0E17` | متن `#EAF0FF`
- **فونت‌ها:** تیتر `Lalezar` | متن `Pinar` | مقیاس فونت: `lg`
- **نام/آیدی پیج:** `@test.bug` (جایگاه روی کادر: `tc`)
- **حالت متن و جایگاه‌ها:** نوع نمایش `captions` | افکت نمایش/تأکید کلمات `word-unblur` | جایگاه تیتر `bottom` | جایگاه زیرنویس `top` | سبک زیرنویس `boxed`
- **تنظیمات حرکتی و فوتیج:** خط منحنی پشت کارت: `بله` | المان‌های بلر گوشه: `بله` | اسکرول فضایی: `بله` | فوتیج افکت: `lightleak_cool` (حالت `screen`، شفافیت `0.15`)
- **اینترو و اوترو:** سبک اینترو `iris-reveal` (2.5s) | سبک اوترو `comment-cta` (3s) | واژه CTA: `تست_CTA` (متن تست اوترو)
- **پریست حرکتی (FFX) و حالت‌های ترکیبی هوشمند (Smart Hybrid):** پریست پایه `karo-bounce` (فایل پارامترها: `E:\camtasia\reel-motion-edit\assets\motion-presets.json`) | ترکیبی چیدمان: `خیر` | ترکیبی ترنزیشن‌ها: `فعال` | ترکیبی انیمیشن متن: `فعال` | ترکیبی نمایش متن/زیرنویس: `فعال` | ترکیبی افکت/فوتیج: `فعال`
- **موسیقی و میکس صدا:** موزیک `calm` (گین `-18 dB`، داکینگ: `فعال`) | گین افکت صوتی `-4 dB` | بهبود صدای گوینده: `فعال`
- **کاور اینستاگرام (۱۰۸۰×۱۹۲۰):** خط اول `تست رندر پینترستی فاز ۲` | خط دوم `نسخه دو` | برچسب `پیشنهاد هوشمند`

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
- **لوگو:** `E:\camtasia\reel-motion-edit\studio\projects\proj-20261124-091956-af32\uploads\logo_da513e_nias-logo.png`

## ۵. استوری‌بورد و بیت‌شیت سکانس‌به‌سکانس

## ۶. استاندارد تحویل و چک‌لیست بازبینی کیفیت (الزامی قبل از تحویل نهایی)
1. خروجی نهایی را در `E:\camtasia\reel-motion-edit\studio\projects\proj-20261124-091956-af32\final.mp4` (30fps، H.264، yuv420p، صدای AAC 192k) و کاور را در `E:\camtasia\reel-motion-edit\studio\projects\proj-20261124-091956-af32\build\cover.jpg` ذخیره کن.
2. حتماً از فریم‌های کلیدی (اینترو، میانهٔ سکانس‌ها، لحظهٔ کلیک موس/ترنزیشن و اوترو) شیت تصویری بساز و با چشم بررسی کن که هیچ متن فارسی برعکس، بریده‌شده یا خارج از ناحیه امن ریلز (Safe-Zone) نباشد.
3. اگر اسکرین‌شات روی حالت تمام‌صفحه یا سه‌بعدی است، ۱۰۰٪ کادر را بدون حاشیه پر کند و دوربین همگام با موس حرکت کند.
4. در پایان، مسیر فایل‌های نهایی و گزارش کوتاه بازبینی را تحویل بده.