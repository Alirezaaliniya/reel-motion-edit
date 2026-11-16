# GSAP در موتور ریل-موشن — پلاگین‌ها و الگوهای استفاده

موتور (`assets/engine.html`) همه‌ی انیمیشن‌ها را با **GSAP 3** روی یک تایم‌لاین paused (`tl`) می‌سازد که
`render.js` بعداً فریم‌به‌فریم اسکرین‌شات می‌کند — هر تویین باید با پوزیشن زمانی روی `tl` سینک صدا باشد.

## چه چیزی لود و ثبت می‌شود

`scripts/render.js` هنگام اجرا این‌ها را داخل صفحه تزریق می‌کند:

| فایل | چه می‌دهد | ثبت |
|---|---|---|
| `gsap.min.js` | core: tween/timeline، همه‌ی ease های پایه (`power1-4`, `back`, `circ`, `sine`, `expo.out`…) | خودکار |
| `EasePack.min.js` | ease های `elastic`, `bounce`, `stepped` | خودکار با core |
| `CustomEase.min.js` | ایزینگ اختصاصی با `CustomEase.create("name", "M0,0 C…")` | خودکار |
| `MotionPathPlugin.min.js` | حرکت/کشیدن روی مسیر: `motionPath: {path: "M…", align: …}` | `gsap.registerPlugin(MotionPathPlugin)` |

پلاگین‌های دیگر (Draggable، Observer، Flip، ScrollTrigger، TextPlugin، Easel، CSSRule، Pixi) در
`~/.cache/reel-motion-edit/node/node_modules/gsap/dist/` موجودند ولی برای رندر flat به‌کار نمی‌آیند؛
برای استفاده، فایلشان را به آرایه‌ی پلاگین‌ها در `scripts/render.js` اضافه کن.

> DrawSVGPlugin، SplitText، MorphSVG پلاگین‌های Club هستند و در نسخه‌ی npm نیستند — معادل‌شان را با
> `strokeDasharray/strokeDashoffset` دستی بساز (الگوی زیرنویس `.ul` در `C.keyword`).

## قراردادهای تایم‌لاین داخل engine.html

- هر کامپوننت یک تابع `C.<type> = (s) => {…}` است؛ `s` عناصر پلن، `s.t` شروع مطلق، `s.d` مدت.
- ورود: `tl.fromTo(d, {…}, {…, duration: .5, ease: 'back.out(1.6)', ...IR}, s.t)` — `IR` بسته‌ی
  اور/ایزینگ پیش‌فرض موتور است، از آن استفاده کن.
- خروج: `hide(d, s.t + s.d, .3, {y: -30})` — همیشه hide بگذار وگرنه عنصر تا آخر ویدیو می‌ماند.
- صدا: `fx.push([offset, 'name', db])` و آخر تابع `sfx(s, fx)` — پیش‌فرض‌های صوتی هر کامپوننت.
- انتظار (delay درون صحنه): `data-at="1.2"` روی گروه‌های svg؛ اسکریپت‌های `svg.querySelectorAll('[data-at]')`.
- شناورسازی: `data-float="1"` (bob آرام) و `data-pulse="1"` (تپش) روی گروه svg؛ محو: `data-out="4"`.

## الگوهای آماده برای کامپوننت/صحنه‌ی اختصاصی

1. **کشیده‌شدن خط (self-draw):** مسیر را در svg بگذار و تویین کن:
   `gsap.set(p, {strokeDasharray: len, strokeDashoffset: len})` → `tl.to(p, {strokeDashoffset: 0, duration: draw, ease: 'none'}, T)`.
   طول مسیر: `p.getTotalLength()`.
2. **حرکت روی مسیر (MotionPath):** توکن/آیکون که مسیر منحنی را طی می‌کند:
   `tl.to(dot, {motionPath: {path: '#rail', align: '#rail', alignOrigin: [.5,.5]}, duration: 2, ease: 'power1.inOut'}, T)`.
3. **ایزینگ امضا:** برای هر سبک یک CustomEase بساز و ذخیره کن (مثلاً ورود کارت‌های محصول):
   `CustomEase.create('popSoft', 'M0,0 C0.2,0 0.1,1 1,1')` — هر سبک می‌تواند در `STY.css` هم‌زمان کلاسش را بگذارد.
4. **شمارش/تایپ:** به‌جای TextPlugin، الگوی `tl.to({n:0},{n:end, onUpdate(){el.textContent=…}})` که موتور برای
   `counter` و ترمینال استفاده می‌کند — با فرمت فارسی `FA()`.
5. **مسیر رنگی (ribbon):** مسیر + `strokeDashoffset` + گرادیان stroke؛ برای کشیده‌شدن از لبه‌ی فریم به سوژه.

## قواعد

- هیچ تویینی خارج از `tl` نساز (`gsap.to` مستقیم ممنوع — با اسکرین‌شات فریم‌به‌فریم سینک نمی‌ماند).
- همه‌ی زمان‌ها مطلق‌اند: از `T = s.t + offset` شروع کن، نه delay.
- ease های سنگین (`elastic`) را فقط روی استیکر/آیکون کوچک استفاده کن؛ روی کارت‌های بزرگ `back.out(1.6)`/`power3.out`.
- بعد از هر تغییر engine: `node scripts/render.js plan.json check` و پیش‌نمایشِ چند فریم کلیدی.
