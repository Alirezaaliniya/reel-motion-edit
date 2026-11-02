// Renders the overlay described by plan.json with assets/engine.html.
//
//   node render.js <plan.json> check              resolve times + layout/clutter/sfx lint
//   node render.js <plan.json> preview t1 t2 ...  composite stills over the video → build/preview.jpg
//   node render.js <plan.json> full               ProRes 4444 alpha track → build/overlay.mov
//   node render.js <plan.json> styleboard T       the frame at T rendered in every style preset → build/styleboard.jpg
//   node render.js <plan.json> cover T            frame T + plan.cover title → build/cover.jpg (1080x1920)
//
// plan.mode "explainer" = the whole frame is graphics (voice-over driven; the source can be audio only).
// Then build/bg.png holds the style background, overlay.mov stays transparent, and compose.py stacks
// bg.png → footage windows (elements of type "footage") → overlay.mov.
//
// Time fields (t, end, items[].t, hide[][], sfx[].t) accept seconds or anchors:
//   "w:رایگان"        start of the first spoken word matching (normalized, prefix ok)
//   "w:رایگان#2+0.1"  2nd occurrence, plus 0.1 s;  "w:وی پی ان" matches a phrase
//   "m:m7-0.2"        motion event m7 from analysis/motion.json, minus 0.2 s
// Writes build/plan.resolved.json and build/sfx.json (consumed by compose.py).
const path = require('path'), fs = require('fs'), os = require('os'), url = require('url');
const { spawnSync, spawn } = require('child_process');

const SKILL = path.resolve(__dirname, '..');
const CACHE = path.join(os.homedir(), '.cache', 'reel-motion-edit');
const NM = path.join(CACHE, 'node', 'node_modules');
const puppeteer = require(path.join(NM, 'puppeteer-core'));
const BROWSERS = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium'];
const DEF_D = { scene: 4, readout: 2.5, ui: 3, choice: 3, panel: 4, footage: 4, title: 3.5, keyword: 1.6, note: 3, callout: 2.5, highlight: 2.5, arrow: 2, counter: 2.6, icon: 1.6, compare: 2.6, success: 3.2, lowerthird: 3 };

const [planPath, mode = 'check', ...rest] = process.argv.slice(2);
const planDir = path.dirname(path.resolve(planPath));
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
const rel = p => p && (path.isAbsolute(p) ? p : path.join(planDir, p));
const build = path.join(planDir, 'build'); fs.mkdirSync(build, { recursive: true });

/* ---------- time anchors ---------- */
const norm = s => s.normalize('NFC').replace(/[\u064B-\u065F\u0670\u200c\u200d\u200f]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک')
  .replace(/[.,!?؟،:;«»"'()\-]/g, '').toLowerCase().trim();
const words = [];
const tPath = rel(plan.transcript || 'analysis/transcript.json');
if (fs.existsSync(tPath)) for (const s of JSON.parse(fs.readFileSync(tPath, 'utf8'))) for (const w of s.words) words.push({ ...w, n: norm(w.w) });
const mPath = rel(plan.motion || 'analysis/motion.json');
const motion = fs.existsSync(mPath) ? Object.fromEntries(JSON.parse(fs.readFileSync(mPath, 'utf8')).events.map(e => [e.id, e.t])) : {};

function anchor(v) {
  if (typeof v === 'number' || v == null) return v;
  const m = String(v).match(/^([wm]):(.+?)(?:#(\d+))?([+-]\d*\.?\d+)?$/);
  if (!m) throw new Error(`bad time "${v}"`);
  const off = m[4] ? parseFloat(m[4]) : 0;
  if (m[1] === 'm') { if (!(m[2] in motion)) throw new Error(`unknown motion event ${m[2]}`); return +(motion[m[2]] + off).toFixed(3); }
  const target = norm(m[2]).split(/\s+/), nth = +(m[3] || 1);
  let hit = 0;
  for (let pass of ['exact', 'prefix']) {
    hit = 0;
    for (let i = 0; i + target.length <= words.length; i++) {
      const ok = target.every((tw, k) => pass === 'exact' ? words[i + k].n === tw : words[i + k].n.startsWith(tw) || tw.startsWith(words[i + k].n) && words[i + k].n.length > 2);
      if (ok && ++hit === nth) return +(words[i].s + off).toFixed(3);
    }
  }
  const near = words.filter(w => w.n.includes(target[0].slice(0, 3))).slice(0, 8).map(w => `${w.w}@${w.s}`).join(', ');
  throw new Error(`word "${m[2]}"#${nth} not found in transcript (found ${hit}). similar: ${near || 'none'}`);
}
function resolve(o) {
  if (Array.isArray(o)) return o.map(resolve);
  if (o && typeof o === 'object') {
    const r = {};
    for (const [k, v] of Object.entries(o)) {
      if (['t', 'end', 'at'].includes(k)) r[k] = anchor(v);
      else if (k === 'hide') r[k] = v.map(p => p.map(anchor));
      else r[k] = resolve(v);
    }
    return r;
  }
  return o;
}
const P = resolve(plan);
P.duration = P.duration || JSON.parse(fs.readFileSync(rel('analysis/info.json'), 'utf8')).duration;
const fileUrl = p => !p || /^(file|data|https?):/.test(p) ? p : url.pathToFileURL(rel(p)).href;
for (const e of P.elements || []) {
  if (e.end != null && e.d == null) e.d = +(e.end - e.t).toFixed(3);
  if (e.d == null && DEF_D[e.type]) e.d = DEF_D[e.type];
  if (e.type === 'cta' && e.d == null) e.d = P.duration - e.t;
  if ((e.type === 'steps' || e.type === 'segbar') && e.end == null && e.d == null) e.end = P.duration - .3;
  if (e.type === 'mascot') { if (e.d == null) e.d = P.duration - e.t; if (e.src) e.src = fileUrl(e.src); if (e.poses) for (const k in e.poses) e.poses[k] = fileUrl(e.poses[k]); }
}
if (P.captions?.file) P.captionChunks = JSON.parse(fs.readFileSync(rel(P.captions.file), 'utf8'));
// brand kit (~/.config/reel-motion-edit/brand.json): the user's saved style, colors, fonts and @handle;
// the plan wins over it, and "brand": false ignores it for one video
const BRAND_FILE = path.join(os.homedir(), '.config', 'reel-motion-edit', 'brand.json');
const BRAND = plan.brand !== false && fs.existsSync(BRAND_FILE) ? JSON.parse(fs.readFileSync(BRAND_FILE, 'utf8')) : {};
P.fonts = { ...(BRAND.fonts || {}), ...(P.fonts || {}) };
if (P.handle === undefined && BRAND.handle) P.handle = { text: BRAND.handle, corner: BRAND.handleCorner || 'tl', logo: BRAND.logo };
if (P.handle?.logo && !/^(file|data|https?):/.test(P.handle.logo)) P.handle.logo = url.pathToFileURL(P.handle.logo).href;
// mascot: the user's own character image(s), from the plan or the brand kit
if (P.mascot === undefined && BRAND.mascot) P.mascot = BRAND.mascot;
if (P.mascot) { P.mascot = { ...P.mascot }; if (P.mascot.src) P.mascot.src = fileUrl(P.mascot.src); if (P.mascot.poses) P.mascot.poses = Object.fromEntries(Object.entries(P.mascot.poses).map(([k, v]) => [k, fileUrl(v)])); }
if (P.bg?.image) P.bg = { ...P.bg, image: fileUrl(P.bg.image) };
// style preset: its theme is the base, then brand colors, then plan.theme
const STYLES = JSON.parse(fs.readFileSync(path.join(SKILL, 'assets', 'styles.json'), 'utf8'));
P.style = P.style || BRAND.style || 'gradient';
if (!STYLES[P.style]) throw new Error(`unknown style "${P.style}" — one of: ${Object.keys(STYLES).join(', ')}`);
P.styleDef = STYLES[P.style];
P.theme = { ...P.styleDef.theme, ...(BRAND.theme || {}), ...(plan.theme || {}) };
P.mode = P.mode || 'overlay';
const EXPLAINER = P.mode === 'explainer';
if (EXPLAINER && !P.styleDef.bg) console.warn(`note: style "${P.style}" has no explainer background; using black (set plan.bg)`);
// intro: every edit opens with one (style default kind); "intro": false in the plan turns it off
if (plan.intro !== false && !(P.elements || []).some(e => e.type === 'intro')) {
  P.elements = [{ type: 'intro', t: 0, ...(typeof plan.intro === 'object' ? plan.intro : {}) }, ...(P.elements || [])];
  // overlay mode: the footage also lands with a short punch-out (camera starts zoomed and eases back)
  if (!EXPLAINER && (P.camera || []).every(c => c.t > .8)) P.camera = [{ t: 0, d: .35, type: 'punch', scale: 1.14, cx: 540, cy: 820 }, ...(P.camera || [])];
}
// colour grade for the footage: plan.grade (name | raw ffmpeg filter | false) → style default → natural
const GRADES = JSON.parse(fs.readFileSync(path.join(SKILL, 'assets', 'grades.json'), 'utf8'));
const g = plan.grade ?? BRAND.grade ?? P.styleDef.grade ?? 'natural';
P.gradeFilter = g === false || g === 'none' ? '' : (GRADES[g] || String(g));
// images as icons: "img:<path>" (relative to the plan) → file url
const imgs = o => Array.isArray(o) ? o.map(imgs) : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, imgs(v)]))
  : typeof o === 'string' && o.startsWith('img:') && !/^img:(file|data|https?):/.test(o) ? 'img:' + url.pathToFileURL(rel(o.slice(4))).href : o;
P.elements = imgs(P.elements);
fs.writeFileSync(path.join(build, 'plan.resolved.json'), JSON.stringify(P, null, 1));

/* ---------- sound restraint ----------
   The user's rule: few, quiet sound effects so the voice is always clear. After the engine registers every
   component's default sounds, keep at most `perElement` per element (loudest first), drop any sound closer than
   `minGap` s to the previous kept one (manual plan.sfx always stays), and pull everything down by `gain` dB.
   plan.sfxMix = {gain: -8, minGap: 0.6, perElement: 1} by default. */
function thinSfx(list) {
  const m = { gain: -8, minGap: .6, perElement: 1, ...(BRAND.sfxMix || {}), ...(plan.sfxMix || {}) };
  const by = {};
  for (const e of list) (by[e.src] = by[e.src] || []).push(e);
  let keep = [];
  for (const [src, l] of Object.entries(by)) keep.push(...(src === 'manual' ? l : [...l].sort((a, b) => b.db - a.db).slice(0, m.perElement)));
  keep.sort((a, b) => a.t - b.t);
  const out = []; let last = -9;
  for (const e of keep) {
    if (e.src === 'manual') { out.push(e); continue; }
    if (e.t - last < m.minGap) continue;
    out.push(e); last = e.t;
  }
  return out.map(e => ({ ...e, db: +(e.db + m.gain).toFixed(1) }));
}

/* ---------- fonts ---------- */
function fontCss() {
  const fonts = {};
  const fd = path.join(SKILL, 'assets', 'fonts');
  const extra = [];  // "Family.latin.woff2" = a Latin subset of Family, declared after it with a unicode-range
  for (const f of fs.readdirSync(fd).sort()) if (/\.(ttf|otf|woff2?)$/i.test(f)) {
    const [fam, sub] = path.parse(f).name.split('.');
    if (sub) extra.push([fam, path.join(fd, f)]); else fonts[fam] = path.join(fd, f);
  }
  const face = (fam, p, range, wt = '100 1000') => `@font-face{font-family:"${fam}";src:url("${url.pathToFileURL(p).href}");font-weight:${wt};font-display:block${range ? ';unicode-range:' + range : ''}}`;
  // assets/fonts/user/<Family>/*: the user's own (often commercial) fonts, git-ignored. A file whose name ends in a
  // weight word (Thin…Black/Heavy) becomes that weight of <Family>; any other file (variable font) covers 100–1000.
  const WT = { thin: 100, hairline: 100, extralight: 200, ultralight: 200, light: 300, regular: 400, normal: 400, book: 400, medium: 500,
    semibold: 600, demibold: 600, bold: 700, extrabold: 800, ultrabold: 800, black: 900, heavy: 900 };
  const user = [], ud = path.join(fd, 'user');
  if (fs.existsSync(ud)) for (const fam of fs.readdirSync(ud)) {
    const dir = path.join(ud, fam); if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) if (/\.(ttf|otf|woff2?)$/i.test(f)) {
      const m = path.parse(f).name.toLowerCase().replace(/[^a-z]/g, ' ').trim().split(/\s+/).pop();
      user.push(face(fam, path.join(dir, f), null, WT[m] ?? '100 1000'));
    }
  }
  Object.assign(fonts, P.fonts || {});
  return [...user, ...Object.entries(fonts).map(([fam, p]) => face(fam, p)),
    ...extra.map(([fam, p]) => face(fam, p, 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215'))].join('\n');
}

/* ---------- lint ---------- */
function lint(samples) {
  const W = P.size?.[0] || 1080, H = P.size?.[1] || 1920, out = [];
  const seen = new Set(), skip = new Set(['progress', 'transition', 'intro', 'click', 'fx', 'handle', 'panel', 'footage', 'segbar', 'mascot'].concat(EXPLAINER ? ['scene'] : []));  // persistent layers aren't overlays
  for (const { t, boxes } of samples) {
    const live = boxes.filter(b => !skip.has(b.type) && b.type !== 'captions' && !b.parent);
    if (live.length > 3) { const k = 'clutter' + Math.round(t); if (!seen.has(k)) { seen.add(k); out.push(`CLUTTER  ${t.toFixed(1)}s  ${live.length} overlays at once: ${live.map(b => b.id).join(', ')}`); } }
    for (const b of boxes) {
      if (skip.has(b.type)) continue;
      if (b.x < -8 || b.y < -8 || b.x + b.w > W + 8 || b.y + b.h > H + 8) { const k = 'oob' + b.id; if (!seen.has(k)) { seen.add(k); out.push(`OFFFRAME ${t.toFixed(1)}s  ${b.id} box=[${[b.x, b.y, b.w, b.h].map(Math.round)}]`); } }
      for (const z of P.avoid || []) {
        if (t < z.from || t > z.to) continue;
        const [zx, zy, zw, zh] = z.rect;
        const ix = Math.max(0, Math.min(b.x + b.w, zx + zw) - Math.max(b.x, zx)), iy = Math.max(0, Math.min(b.y + b.h, zy + zh) - Math.max(b.y, zy));
        const frac = ix * iy / Math.max(1, Math.min(b.w * b.h, zw * zh));
        const k = 'avoid' + b.id + z.name;
        if (frac > .04 && !seen.has(k)) { seen.add(k); out.push(`COVERS   ${t.toFixed(1)}s  ${b.id} covers "${z.name}" (${Math.round(frac * 100)}%)`); }
      }
    }
  }
  return out;
}
function lintSfx(sfx) {
  const out = [], s = [...sfx].sort((a, b) => a.t - b.t);
  for (let i = 0; i < s.length; i++) {
    const win = s.filter(x => x.t >= s[i].t && x.t < s[i].t + .35);
    if (win.length > 3) { out.push(`SFXPILE  ${s[i].t.toFixed(2)}s  ${win.length} sounds within 0.35s: ${win.map(x => x.name).join(', ')}`); i += win.length - 1; }
  }
  return out;
}

/* ---------- run ---------- */
(async () => {
  const exe = BROWSERS.find(fs.existsSync);
  const browser = await puppeteer.launch({ executablePath: exe, headless: true, protocolTimeout: 60000, args: ['--allow-file-access-from-files', '--hide-scrollbars', '--force-color-profile=srgb', ...(process.getuid?.() === 0 ? ['--no-sandbox'] : [])] });
  const page = await browser.newPage();
  const [W, H] = P.size || [1080, 1920];
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exitCode = 1; });
  await page.goto(url.pathToFileURL(path.join(SKILL, 'assets', 'engine.html')).href);
  await page.addScriptTag({ path: path.join(NM, 'gsap', 'dist', 'gsap.min.js') });
  await page.evaluate(css => { document.getElementById('fontcss').textContent = css; }, fontCss());
  await page.evaluate(() => document.fonts.ready);
  console.log('fonts ready');
  const sfxAll = await page.evaluate(p => build(p), P);
  const sfx = thinSfx(sfxAll);
  console.log(`built: ${sfx.length} sfx events (${sfxAll.length - sfx.length} dropped by sfxMix)`);
  // preload every font face actually used so the first frames don't fall back
  await page.evaluate(async () => { await Promise.all([...document.fonts].map(f => f.load().catch(() => 0))); });
  console.log('fonts preloaded');
  fs.writeFileSync(path.join(build, 'sfx.json'), JSON.stringify(sfx, null, 1));
  const shot = () => page.screenshot({ type: 'png', omitBackground: true });
  const FPS = P.fps || 30;
  // explainer background (style bg / plan.bg), shot once with every layer hidden
  const bgShot = async (out) => {
    await page.evaluate(() => { document.getElementById('bg').style.display = 'block'; document.getElementById('stage').style.visibility = 'hidden'; });
    fs.writeFileSync(out, await page.screenshot({ type: 'png' }));
    await page.evaluate(() => { document.getElementById('bg').style.display = 'none'; document.getElementById('stage').style.visibility = ''; });
  };
  const BGPNG = path.join(build, 'bg.png');
  if (EXPLAINER) await bgShot(BGPNG);
  const video = P.video && rel(P.video);
  const hasPicture = v => v && fs.existsSync(v) && spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', v]).stdout.toString().includes('video');
  const PIC = hasPicture(video);
  const footAt = t => (P.elements || []).filter(e => e.type === 'footage' && t >= e.t && t <= e.t + e.d);
  // base frame at time t: the video frame (overlay mode) or bg.png + footage windows (explainer)
  const baseFrame = (t, out, look = '') => {
    const gr = P.gradeFilter ? ',' + P.gradeFilter : '';
    if (!EXPLAINER) return spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', video, '-vf', `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}${gr}${look}`, '-frames:v', '1', out]);
    const win = PIC ? footAt(t) : [], args = ['-v', 'error', '-y', '-i', BGPNG], fc = [];
    let last = '[0]';
    win.forEach((e, i) => {
      const [x, y, w, h] = e.rect, st = (e.src ?? e.t) + (t - e.t);
      args.push('-ss', String(st), '-i', video);
      fc.push(`[${i + 1}:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}${gr}[f${i}]`, `${last}[f${i}]overlay=${x}:${y}[b${i}]`);
      last = `[b${i}]`;
    });
    fc.push(`${last}null${look}[o]`);
    return spawnSync('ffmpeg', [...args, '-filter_complex', fc.join(';'), '-map', '[o]', '-frames:v', '1', out]);
  };

  if (mode === 'check') {
    const samples = [];
    for (let t = 0; t <= P.duration; t += 0.2) { await page.evaluate(t => seek(t), t); samples.push({ t, boxes: await page.evaluate(() => boxes()) }); }
    const order = [];
    for (const e of P.elements || []) if (e.type === 'steps' || e.type === 'segbar') e.items.forEach((it, i) => { if (i && it.t <= e.items[i - 1].t) order.push(`ORDER    ${e.type} item ${i + 1} "${it.label || ''}" at ${it.t}s is not after item ${i} (${e.items[i - 1].t}s) — word anchor hit an earlier occurrence? use w:word#n`); });
    if (EXPLAINER) {  // every moment of an explainer needs a picture: report gaps with no scene/graphic on screen
      const vis = new Set(['scene', 'ui', 'choice', 'counter', 'title', 'keyword', 'compare', 'icon', 'footage', 'note', 'success', 'cta', 'readout', 'callout']);
      let gap = null;
      for (const { t, boxes } of samples) {
        const any = boxes.some(b => vis.has(b.type));
        if (!any && gap == null) gap = t; if (any && gap != null) { if (t - gap >= 1) order.push(`EMPTY    ${gap.toFixed(1)}–${t.toFixed(1)}s  nothing but captions on screen`); gap = null; }
      }
      if (gap != null && P.duration - gap >= 1) order.push(`EMPTY    ${gap.toFixed(1)}–${P.duration.toFixed(1)}s  nothing but captions on screen`);
      if ((P.elements || []).some(e => e.type === 'footage') && !PIC) order.push('NOVIDEO  footage windows need a source with a picture (the source is audio only)');
    }
    // no emoji anywhere (the user's rule): use built-in icons (icon/kickerIcon/items[].icon) or img:<file>
    const EMO = /\p{Extended_Pictographic}/u, emo = [];
    const scan = (o, where) => { if (typeof o === 'string') { if (EMO.test(o)) emo.push(`EMOJI    ${where}: "${o}" — use an icon name or img:<file> instead`); }
      else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) scan(v, where); };
    (P.elements || []).forEach(e => scan(e, `${e.id || e.type} (${e.type})`)); scan(P.cover, 'cover');
    if (sfx.length > P.duration / 2.5) order.push(`SFXDENSE ${sfx.length} sounds in ${P.duration.toFixed(0)}s — keep it to about one every 3 s on talking heads`);
    const issues = [...order, ...emo, ...lint(samples), ...lintSfx(sfx)];
    console.log(`mode: ${P.mode}  style: ${P.style}  elements: ${(P.elements || []).length}  sfx: ${sfx.length}  duration: ${P.duration}s`);
    for (const e of P.elements || []) console.log(`  ${String(e.t ?? e.items?.[0]?.t).padStart(6)}s  ${e.type.padEnd(10)} ${e.id || ''} ${e.text || e.label || (e.lines || []).join(' / ') || e.title || ''}`);
    console.log(issues.length ? 'ISSUES:\n' + issues.join('\n') : 'no layout issues');
  } else if (mode === 'preview') {
    const times = rest.map(Number).sort((a, b) => a - b), dir = path.join(build, 'preview');
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });  // stale stills would leak into the tile
    const jpgs = [];
    for (const [i, t] of times.entries()) {
      await page.evaluate(t => seek(t), t);
      const png = path.join(dir, `o_${i}.png`); fs.writeFileSync(png, await shot());
      const base = path.join(dir, `b_${i}.png`); baseFrame(t, base);
      const jpg = path.join(dir, `c_${String(i).padStart(2, '0')}.jpg`);
      spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', base, '-i', png, '-filter_complex', `[0][1]overlay,scale=360:-1`, '-frames:v', '1', jpg]);
      jpgs.push(jpg);
    }
    const cols = Math.min(6, jpgs.length), rows = Math.ceil(jpgs.length / cols);
    spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(dir, 'c_%02d.jpg'), '-vf', `tile=${cols}x${rows}:padding=6:color=white`, '-frames:v', '1', path.join(build, 'preview.jpg')]);
    console.log('preview →', path.join(build, 'preview.jpg'), 'times:', times.join(' '));
  } else if (mode === 'styleboard' || mode === 'cover') {
    const t = Number(rest[0] ?? 2), dir = path.join(build, mode);
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const frame = path.join(dir, 'frame.png');
    // covers get a blurred, darker frame so the title owns the image (explainers keep their clean background)
    const look = mode === 'cover' && P.cover?.blur !== false && !EXPLAINER ? ',boxblur=14:2,eq=brightness=-0.12:saturation=1.15' : '';
    baseFrame(t, frame, look);
    const pick = type => (P.elements || []).find(e => e.type === type);
    const comp = async (plan, at, out, scale, base = frame) => {
      await page.evaluate(p => build(p), plan);
      await page.evaluate(t => seek(t), at);
      const png = out.replace(/\.jpg$/, '.png'); fs.writeFileSync(png, await shot());
      spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', base, '-i', png, '-filter_complex', `[0][1]overlay${scale ? `,scale=${scale}:-1` : ''}`, '-q:v', '2', '-frames:v', '1', out]);
    };
    if (mode === 'cover') {
      const c = P.cover || {}, ti = pick('title') || {};
      const el = [{ type: 'title', t: 0, d: 99, jitter: false, y: c.y ?? 620, scrim: EXPLAINER ? false : undefined, scrimH: c.scrimH ?? 900, kicker: c.kicker ?? ti.kicker, lines: c.lines || ti.lines || ['عنوان'], sub: c.sub ?? ti.sub, sfx: false }];
      // an explainer cover keeps the scene that is on screen at T behind the title
      if (EXPLAINER && c.scene !== false) for (const e of P.elements || []) if (e.type === 'scene' && t >= e.t && t <= e.t + e.d) el.unshift({ ...e, t: 0, d: 99, sfx: false });
      await comp({ ...P, elements: el, camera: [], captions: null, progress: false, handle: P.handle && { ...P.handle, t: 0 } }, 3, path.join(build, 'cover.jpg'));
      console.log('cover →', path.join(build, 'cover.jpg'));
    } else {
      // the same demo moment in each preset: title, step chip, keyword sticker, subtitle line, style name.
      // In explainer mode only explainer styles are shown, each on its own background with a demo drawing.
      const ti = pick('title') || { lines: ['عنوان *ویدیو*'], kicker: 'آموزش' }, st = pick('steps'), kw = pick('keyword');
      const sub = (P.captionChunks?.[0]?.words || [{ w: 'این' }, { w: 'یه' }, { w: 'زیرنویس' }, { w: 'نمونه‌ست' }, { w: 'که' }, { w: 'کلمه' }, { w: 'به' }, { w: 'کلمه' }, { w: 'روشن' }, { w: 'میشه' }]).slice(0, EXPLAINER ? 9 : 4);
      const names = Object.keys(STYLES).filter(k => !EXPLAINER || STYLES[k].explainer), jpgs = [];
      for (const [i, k] of names.entries()) {
        const D = STYLES[k];
        const demo = EXPLAINER || D.explainer;
        const el = [
          { type: 'title', t: 0, d: 99, y: 70, jitter: false, kicker: ti.kicker, kickerIcon: ti.kickerIcon, lines: ti.lines, sub: ti.sub, sfx: false, ...(D.defaults?.title || {}) },
          demo && { type: 'scene', t: 0, d: 99, sfx: false, glow: D.defaults?.scene?.glow, items: [
            { shape: 'bars', x: 540, y: 1180, values: [25, 50, 25], hi: 1, w: 110, hmax: 300 },
            { shape: 'label', from: [400, 820], to: [300, 720], text: 'همکار' }, { shape: 'ring', x: 540, y: 700, r: 70, cls: 'acc' }] },
          !demo && st && { type: 'steps', t: 0, y: 760, items: [{ t: 0, label: st.items[0].label, sub: st.items[0].sub }], total: st.total ?? st.items.length, end: 99, sfx: false },
          k === 'warmguide' && { type: 'segbar', t: 0, y: 40, items: [{ t: 0 }], total: 7, end: 99, sfx: false },
          k === 'hud' && { type: 'readout', t: 0, d: 99, x: 760, y: 560, lines: ['x² + y² = r²', 'ok:error 0.000', 'ok:clean ✓'], typewriter: false, sfx: false },
          !demo && { type: 'keyword', t: 0, d: 99, x: 540, y: 1560, text: kw?.text || 'نکته مهم', icon: kw?.icon || 'bulb', sfx: false, wiggle: false },
          { type: 'keyword', t: 0, d: 99, x: 540, y: 1840, text: D.label, style: 'plain', rotate: 0, sfx: false, wiggle: false, size: 58 },
        ].filter(Boolean);
        const chunks = [{ s: 0, e: 99, y: demo ? 1400 : 1290, words: sub.map((w, j) => ({ w: w.w, s: j < 5 ? 0 : 99, key: j === 1, acc: j === 2 })) }];
        const out = path.join(dir, `s_${String(i).padStart(2, '0')}.jpg`);
        let base = frame;
        if (demo) { await page.evaluate(p => build(p), { ...P, mode: 'explainer', style: k, styleDef: D, theme: D.theme, elements: [], camera: [], captions: null, mascot: null }); base = path.join(dir, `bg_${k}.png`); await bgShot(base);
          if (!EXPLAINER) { const mix = path.join(dir, `mix_${k}.png`); spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', frame, '-i', base, '-filter_complex', '[1]format=rgba,colorchannelmixer=aa=0.82[b];[0][b]overlay', '-frames:v', '1', mix]); base = mix; } }
        await comp({ ...P, mode: demo ? 'explainer' : P.mode, style: k, styleDef: D, theme: D.theme, elements: el, camera: [], captions: { style: D.captions }, captionChunks: chunks, handle: null, mascot: null, progress: true }, 2.4, out, 360, base);
        jpgs.push(out); console.log(`  ${k.padEnd(9)} ${D.en}`);
      }
      spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(dir, 's_%02d.jpg'), '-vf', `tile=${Math.min(4, jpgs.length)}x${Math.ceil(jpgs.length / 4)}:padding=8:color=white`, '-q:v', '2', '-frames:v', '1', path.join(build, 'styleboard.jpg')]);
      console.log('styleboard →', path.join(build, 'styleboard.jpg'));
    }
  } else if (mode === 'full') {
    const out = path.join(build, 'overlay.mov');
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const N = Math.round(P.duration * FPS), t0 = Date.now();
    for (let i = 0; i < N; i++) {
      await page.evaluate(t => seek(t), i / FPS);
      if (!ff.stdin.write(await shot())) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 300 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log('overlay →', out);
  }
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
