# بانک جامع سبک‌های طراحی، موشن‌گرافیک و دارایی‌های پروژه (`design-knowledge`)

این پوشه شامل کامل‌ترین مخزن‌های بازمتن (Open-Source) گیت‌هاب برای شناخت دقیق سبک‌های طراحی، پالت‌های رنگی، تایپوگرافی، قوانین انیمیشن و بیش از ۲۰۰ صحنهٔ آمادهٔ موشن‌گرافیک است که مستقیم به پروژه اضافه شده‌اند:

## ۱. مخزن‌های اضافه‌شده به پروژه

1. **`ui-ux-pro-max/` (مخزن `nextlevelbuilder/ui-ux-pro-max-skill` — بیش از ۱۵۳,۰۰۰ ستاره در گیت‌هاب)**
   - دیتابیس کامل سبک‌های طراحی در [styles.csv](ui-ux-pro-max/ui-ux-pro-max/data/styles.csv) (شامل ۶۷+ سبک با نام تخصصی، پالت رنگ، ویژگی‌های CSS/UI، انیمیشن و کاربرد).
   - دیتابیس قوانین موشن و انیمیشن در [motion.csv](ui-ux-pro-max/ui-ux-pro-max/data/motion.csv).
   - دیتابیس ترکیب رنگ‌ها در [colors.csv](ui-ux-pro-max/ui-ux-pro-max/data/colors.csv) و تایپوگرافی در [typography.csv](ui-ux-pro-max/ui-ux-pro-max/data/typography.csv).
   - دیتابیس اسلایدها، چارت‌ها، بنرها، لوگو و سیستم‌های طراحی در `design/`, `design-system/`, `banner-design/`, `slides/`.

2. **`design-styles-67/` (مخزن `bergside/awesome-design-skills` — ۶۷ سیستم طراحی کامل)**
   - شامل ۶۷ پوشهٔ مجزا (از `agentic`, `bento`, `brutalism`, `claymorphism`, `editorial`, `glassmorphism`, `minimal`, `neobrutalism`, `neon`, `neumorphism`, `paper`, `retro`, `riso`, `skeumorphism`, `storytelling`, `vibrant` تا `vintage`).
   - داخل هر پوشه دو فایل استاندارد `DESIGN.md` و `SKILL.md` قرار دارد که تمام جزئیات آن سبک (پالت رنگ دقیق، فونت، سایه‌ها، فاصله‌گذاری و حس‌وحال حرکت) را توضیح داده است.

3. **`lottie-motion-design/` (مخزن رسمی `LottieFiles/motion-design-skill`)**
   - راهنمای کارگردانی موشن (`director/choreography.md`, `disney-principles.md`, `emotion-mapping.md`, `motion-personality.md`) و جداول زمان‌بندی و منحنی‌های سرعت (`reference/timing-easing-tables.md`).

4. **`jakubkrehel/` (مخزن `jakubkrehel/skills`)**
   - اسکیل‌های مهندسی رابط کاربری و حرکت شامل `better-motion`, `better-colors`, `better-layout`, `better-typography`, `better-ui`.

5. **`remotion-scenes-200/` (مخزن `lifeprompt-team/remotion-scenes`)**
   - سورس کامل بیش از ۲۰۰ صحنهٔ آمادهٔ موشن‌گرافیک برای Remotion (انیمیشن‌های پس‌زمینه، تایپوگرافی، ترنزیشن‌های مایع و هندسی، کارت‌های UI، نمودارها و لوگو).

---

## ۲. بانک آیکون‌های ۳ بعدی و وکتور پروژه

- **آیکون‌های ۳ بعدی شفاف (`256×256 PNG`):** در پوشهٔ `../icons-3d/` (از مجموعهٔ `Microsoft Fluent Emoji 3D`).
- **آیکون‌های وکتور دو رنگ و لوگوی برندها (`SVG`):** در پوشهٔ `../icons-svg/` (از مجموعهٔ `Solar Bold Duotone` و `Simple Icons / Logos`).

---

## ۳. اسکریپت دانلود خودکار دارایی‌ها (`scripts/fetch_assets.py`)

هر زمان برای ویدیویی به آیکون جدید، لوگوی برند، آیکون ۳ بعدی یا جستجو در دیتابیس سبک‌ها نیاز بود، با این دستور بدون هیچ محدودیتی دانلود می‌شود:

```powershell
# ۱. جستجو در بین ۲۰۰,۰۰۰ آیکون وکتور دنیا
python scripts/fetch_assets.py --search-icon "certificate"

# ۲. دانلود مستقیم آیکون وکتور یا لوگوی برند در assets/icons-svg/
python scripts/fetch_assets.py --download-icon "solar:diploma-verified-bold-duotone" "logos:wordpress-icon"

# ۳. دانلود آیکون سه‌بعدی در assets/icons-3d/
python scripts/fetch_assets.py --download-3d "Rocket" "Trophy" "Crown"

# ۴. مشاهده فهرست تمام ۶۷+ سبک طراحی و موشن
python scripts/fetch_assets.py --list-styles

# ۵. جستجوی مشخصات یک سبک خاص (مثلاً bento یا glassmorphism یا editorial)
python scripts/fetch_assets.py --search-style "bento"
```
