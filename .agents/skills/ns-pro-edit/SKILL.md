---
name: ns-pro-edit
description: Style-free, design-first pro video & Reels editing workflow (`/ns-pro-edit`). Inspects all user photos, audio, and video first, proposes custom visual & motion direction adhering strictly to Instagram Reels safe zones, typography, transitions, and voice-first SFX, asks the user for missing project details, renders a mandatory 5-second hook preview for user approval, and only after explicit approval produces the full edited video using GSAP 3.15.1 (all 24 plugins), Three.js, Lottie, Rough.js, D3-Shape, Shiki, Muuri, PixiJS, and pphumanseg.onnx depth matting.
---

# `/ns-pro-edit` — کارگردانی و ادیت حرفه‌ای ویدیو (آزاد از سبک‌های محدود)

این مهارت نسخه مخزنِ اسکیل سراسری `ns-pro-edit` است. همیشه پروتکل ۵ مرحله‌ای زیر را اجرا کن:

1. **بررسی عمیق رسانه (Media Inspection):**
   - `ffprobe` + استخراج Contact Sheet ویدیو و مشاهده بصری همه عکس‌ها و اسکرین‌شات‌ها با `read_file`.
   - رونویسی کلمه‌به‌کلمه با `faster-whisper-large-v3-turbo` (ورودی آرایه `numpy.float32` از WAV 16kHz مونو) و تشخیص تپق‌ها، تکرارها و مکث‌های اضافه.
   - اندازه‌گیری دقیق مختصات `(focusX%, focusY%, focusW%, focusH%)` روی هر اسکرین‌شات قبل از هایلایت یا کلیک.
2. **پیشنهاد کارگردانی + اصول دیزاین + پرسش از کاربر:**
   - بدون محدودیت به سبک آماده، هویت بصری اختصاصی پروژه را با رعایت کامل **Safe-Zone اینستاگرام ریلز** (`top ≥ 220px`, `bottom ≤ 1495px`, `left ≥ 72px`, `right ≥ 155px`)، جایگاه درست متن‌ها (عدم پوشش صورت)، فونت‌های فارسی (`assets/fonts/`)، `SplitText` (`lines,words`)، ترنزیشن‌های بجا (`DrawSVGPlugin` برای خطوط، اسکرول افقی پیوسته بوم) و میکس گفتارمحور (`loudnorm=I=-15`, `amix normalize=0`, SFX بین `-14` تا `-17 dB`) پیشنهاد بده.
   - جزئیات تکمیلی لازم (CTA، اوترو، لوگو/آیدی، موزیک، تأیید کات‌ها) را از کاربر بپرس.
3. **گیت اجباری پیش‌نمایش ۵ ثانیه اول (`preview_5s.mp4`):**
   - قبل از ادیت کامل، فقط ۵ ثانیه اول را با کیفیت نهایی رندر و تحویل بده و منتظر تأیید کاربر بمان.
4. **ادیت و رندر کامل (پس از تأیید کاربر):**
   - اجرای کامل پروژه با GSAP 3.15.1 (۲۴ پلاگین)، `Three.js`، `Lottie`، `Rough.js`، `D3-Shape`، `Shiki`، `Muuri`، `PixiJS` و لایه عمق پشت/جلوی سوژه (`pphumanseg.onnx`).
5. **بازبینی نهایی (QA) و تحویل:**
   - بررسی بصری Contact Sheet خروجی و مشخصات `ffprobe` پیش از تحویل نهایی.
