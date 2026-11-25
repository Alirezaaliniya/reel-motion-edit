---
name: reel-motion-edit
description: Edit or create vertical reels and shorts from video, audio, or screenshots using the style-free `/ns-pro-edit` workflow with Persian RTL motion graphics, GSAP 3.15.1 (all 24 plugins), depth matting, Instagram Reels safe zones, and a mandatory 5-second preview gate.
---

# تدوین حرفه‌ای ریلز و ویدیو — مبتنی بر `/ns-pro-edit`

نرم‌افزار وب استودیو و سبک‌های محدود ازپیش‌ساخته حذف شده‌اند تا کارگردانی هر پروژه کاملاً آزاد، هوشمند و منطبق بر محتوای واقعی همان ویدیو باشد. تمام دارایی‌ها، فونت‌ها، افکت‌های صوتی، موزیک، Lottie، فوتیج‌ها و کتابخانه‌های موشن (GSAP 3.15.1 با ۲۴ پلاگین + Three.js + Rough.js + D3 + Shiki + Muuri + PixiJS + `pphumanseg.onnx`) حفظ شده‌اند.

برای شروع هر پروژه از دستور و پروتکل **`/ns-pro-edit`** (در `.agents/skills/ns-pro-edit/SKILL.md` و `~/.gemini/config/skills/ns-pro-edit/SKILL.md`) پیروی کن:
1. بررسی کامل ویدیو، صدا و عکس‌ها (رونویسی کلمه‌به‌کلمه، تشخیص تپق/مکث، بازرسی بصری فریم‌ها).
2. ارائه پیشنهاد کارگردانی اختصاصی با رعایت اصول دیزاین (Safe-Zone ریلز، جایگاه درست متن، ترنزیشن و SFX بجا، میکس گفتارمحور) و پرسیدن جزئیات تکمیلی از کاربر.
3. **رندر و ارسال ۵ ثانیه اول (`preview_5s.mp4`) برای تأیید کاربر قبل از شروع ادیت کامل.**
4. رندر کامل پروژه پس از تأیید کاربر و بررسی بصری QA پیش از تحویل.
