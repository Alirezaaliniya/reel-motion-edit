#!/usr/bin/env node
/**
 * Pro Multi-Library HTML5 + GSAP 3.12 + Three.js + Lottie + RoughJS + D3 + SplitType + PixiJS + Shiki + Muuri Renderer
 * for Reel Motion Studio.
 *
 * Usage:
 *   node studio/gsap_renderer.js <project_dir> [check|preview|full]
 *
 * Deterministic 1080x1920 @ 30fps frame-by-frame renderer:
 * - GSAP 3.12.5 + MotionPathPlugin, CustomEase, Flip, TextPlugin, EasePack
 * - Three.js (WebGL 3D floating device/screen showcase with studio lighting)
 * - Lottie-Web (frame-locked `goToAndStop` vector animations)
 * - Rough.js + RoughNotation (hand-drawn marker circles, boxes, arrows & strike-throughs)
 * - SplitType (RTL-safe line & word splitting for Persian typography)
 * - D3-Shape + D3-Interpolate (smooth Catmull-Rom animated data/growth charts)
 * - PixiJS + Pixi-Filters (deterministic ambient GPU glow/bokeh layer)
 * - Shiki (VSCode-grade syntax-highlighted code spotlight cards)
 * - Muuri + Barba (animated Bento Grid layouts & scene transitions)
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const url = require('url');
const { spawn, spawnSync } = require('child_process');

const STUDIO_DIR = __dirname;
const ROOT = path.resolve(STUDIO_DIR, '..');
const ASSETS_DIR = path.join(ROOT, 'assets');
const CACHE_NM = path.join(os.homedir(), '.cache', 'reel-motion-edit', 'node', 'node_modules');
const puppeteer = require(path.join(CACHE_NM, 'puppeteer-core'));

const BROWSERS = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const W = 1080, H = 1920, FPS = 30;

function buildFontCss() {
  const rules = [];
  const face = (fam, p, wt = '100 900') => {
    if (!fs.existsSync(p)) return;
    const ext = path.extname(p).toLowerCase();
    const fmt = ext === '.woff2' ? 'woff2' : (ext === '.woff' ? 'woff' : 'truetype');
    rules.push(`@font-face { font-family: '${fam}'; src: url('${url.pathToFileURL(p).href}') format('${fmt}'); font-weight: ${wt}; font-display: block; }`);
  };

  face('Hasti', path.join(ASSETS_DIR, 'fonts/user/Hasti/Hasti-Heavy.ttf'), '800');
  face('Pinar', path.join(ASSETS_DIR, 'fonts/user/Pinar/Pinar-VF.ttf'), '100 900');
  face('Peyda', path.join(ASSETS_DIR, 'fonts/user/Peyda/PeydaFaNumWeb-Regular.woff2'), '400');
  face('Peyda', path.join(ASSETS_DIR, 'fonts/user/Peyda/PeydaFaNumWeb-Bold.woff2'), '700');
  face('Peyda', path.join(ASSETS_DIR, 'fonts/user/Peyda/PeydaFaNumWeb-ExtraBold.woff2'), '800');
  face('YekanBakh', path.join(ASSETS_DIR, 'fonts/user/YekanBakh/YekanBakhFaNum-VF.woff2'), '100 900');
  face('Morabba', path.join(ASSETS_DIR, 'fonts/user/Morabba/Morabba-VF.ttf'), '100 900');
  face('IRANSansX', path.join(ASSETS_DIR, 'fonts/user/IRANSansX/IRANSansXVF.ttf'), '100 900');
  face('Estedad', path.join(ASSETS_DIR, 'fonts/Estedad.woff2'), '100 900');
  face('Vazirmatn', path.join(ASSETS_DIR, 'fonts/Vazirmatn.ttf'), '100 900');
  face('Lalezar', path.join(ASSETS_DIR, 'fonts/Lalezar.ttf'), '400 800');
  face('JetBrainsMono', path.join(ASSETS_DIR, 'fonts/JetBrainsMono.woff2'), '400 800');
  return rules.join('\n');
}

function loadBundledLotties() {
  const lottieDir = path.join(ASSETS_DIR, 'lottie');
  const map = {};
  if (fs.existsSync(lottieDir)) {
    for (const f of fs.readdirSync(lottieDir)) {
      if (f.endsWith('.json')) {
        try {
          map[path.parse(f).name] = JSON.parse(fs.readFileSync(path.join(lottieDir, f), 'utf8'));
        } catch (_) {}
      }
    }
  }
  return map;
}

async function renderShikiSnippet(codeText, lang = 'javascript') {
  try {
    const shikiMod = await import(url.pathToFileURL(path.join(CACHE_NM, 'shiki/dist/index.mjs')).href);
    return await shikiMod.codeToHtml(codeText, { lang, theme: 'github-dark' });
  } catch (_) {
    return `<pre style="color:#E2E8F0;font-family:JetBrainsMono,monospace;font-size:26px;">${codeText}</pre>`;
  }
}

function resolveLocalPath(rawUrlOrPath, projectDir) {
  if (!rawUrlOrPath) return null;
  if (fs.existsSync(rawUrlOrPath)) return rawUrlOrPath;
  if (rawUrlOrPath.startsWith('/projects-files/')) {
    const rel = rawUrlOrPath.replace(/^\/projects-files\//, '');
    const p = path.join(STUDIO_DIR, 'projects', rel);
    if (fs.existsSync(p)) return p;
  }
  if (rawUrlOrPath.startsWith('/assets/')) {
    const p = path.join(ROOT, rawUrlOrPath.slice(1));
    if (fs.existsSync(p)) return p;
  }
  if (rawUrlOrPath.startsWith('/gallery/')) {
    const p = path.join(ROOT, rawUrlOrPath.slice(1));
    if (fs.existsSync(p)) return p;
  }
  const cand = path.join(projectDir, rawUrlOrPath);
  return fs.existsSync(cand) ? cand : null;
}

function resolveVisualType(beat, idx, state) {
  const vt = beat.visualType || 'auto';
  const values = beat.chartValues;
  const hasChart = Array.isArray(values) && values.length >= 2 && values.every(Number.isFinite) && beat.chartUnit?.trim();
  if (vt === 'd3-chart' && !hasChart) return 'clean-spotlight';
  if (vt !== 'auto') return vt;
  if (hasChart) return 'd3-chart';
  if (beat.assetUrl) return 'ui-showcase';
  const text = `${beat.headline || ''} ${beat.subtext || ''} ${beat.badge || ''}`;
  if (/\b\d+[\.,]?\d*\s*[%+xX]|تومان|دلار|درصد|میلیون|هزار/.test(text)) return 'counter';
  if (/(کد|اسکریپت|پایتون|جاوا|api|npm|css|html|code)/i.test(text)) return 'code-snippet';
  if (/(تبدیل|مورف|تغییر شکل|ارتقا|تحول)/.test(text)) return 'morph-svg';
  if (/(انفجار|رشد سریع|جشن|موفقیت|تبریک|پرتاب)/.test(text)) return 'physics-burst';
  if (/(مقایسه|مزایا|لیست|مرحله|گام|نکته)/.test(text)) return 'bento-grid';
  if (/(مهم|دقت|تاکید|هشدار|یادت|نباید)/.test(text)) return 'rough-callout';
  const cycle = ['clean-spotlight', 'rough-callout', 'morph-svg', 'bento-grid', 'physics-burst'];
  return cycle[idx % cycle.length];
}

async function buildScenes(state, projectDir) {
  const opts = state.options || {};
  const scenes = [];
  let offset = 0;

  const logoPath = resolveLocalPath(state.media?.logo?.path || state.media?.logo?.url || '', projectDir);
  const logoUri = logoPath ? url.pathToFileURL(logoPath).href : '';

  const introStyle = opts.introStyle || 'none';
  // Never block the speaker with a slow waiting intro; only add a separate intro scene if explicitly chosen (not iris-reveal)
  const introDur = Math.min(2.2, Math.max(0.9, Number(opts.introDur) || 1.4));
  if (introStyle !== 'none' && introStyle !== 'iris-reveal') {
    scenes.push({ kind: 'intro', introStyle, t: 0, end: introDur, logoUri, transition: 'zoom' });
    offset = introDur;
  }

  const beats = state.beats || [];
  if (!beats.length && !state.media?.source) throw new Error('ابتدا سناریو یا فایل اصلی را اضافه کنید.');
  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    const t0 = +(Number(b.t || 0) + offset).toFixed(2);
    const t1 = +((Number(b.end ?? (Number(b.t || 0) + 3.5)) + offset)).toFixed(2);
    const assetP = resolveLocalPath(b.assetUrl || '', projectDir) || (b.visualType === 'icon-focus' ? logoPath : null);
    const resolvedVT = resolveVisualType(b, i, state);

    let shikiHtml = '';
    if (resolvedVT === 'code-magic') {
      const sampleCode = b.codeSnippet || `// Reel Motion Studio — Smart Pipeline\nconst reel = await Studio.create({\n  style: "${state.style || 'editorial'}",\n  voiceClean: true,\n  engine: "GSAP + Three.js"\n});\nawait reel.render("1080x1920", 30);`;
      shikiHtml = await renderShikiSnippet(sampleCode, 'javascript');
    }

    // For Three.js WebGL texture loading without CORS taint, pass data URI if screenshot exists
    let assetDataUri = '';
    if (resolvedVT === 'three-3d-showcase' && assetP && fs.existsSync(assetP)) {
      const ext = path.extname(assetP).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
      assetDataUri = `data:${mime};base64,${fs.readFileSync(assetP).toString('base64')}`;
    }

    scenes.push({
      ...b,
      kind: 'beat',
      beatIdx: i,
      t: t0,
      end: t1,
      logoUri,
      assetFileUri: assetP ? url.pathToFileURL(assetP).href : '',
      assetDataUri,
      resolvedVisualType: resolvedVT,
      shikiHtml,
    });
  }

  const outroStyle = opts.outroStyle || 'none';
  const outroDur = Math.max(1.5, Number(opts.outroDur) || 2.8);
  if (outroStyle !== 'none') {
    const lastEnd = Math.max(offset + Number(state.sourceInfo?.duration || 0), ...scenes.map(s => s.end));
    scenes.push({ kind: 'outro', outroStyle, t: lastEnd, end: +(lastEnd + outroDur).toFixed(2), logoUri, transition: 'push' });
  }

  return scenes;
}

function findMediaFile(dirList, name, exts) {
  if (!name || name === 'none') return null;
  for (const d of dirList) {
    if (!fs.existsSync(d)) continue;
    for (const ext of ['', ...exts]) {
      const p = path.join(d, `${name}${ext}`);
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    }
  }
  return null;
}

function hasVideoStream(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return false;
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'V', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', filePath]);
  return r.stdout && r.stdout.toString().includes('video');
}

(async () => {
  const [projectDirArg, mode = 'preview'] = process.argv.slice(2);
  if (!projectDirArg) {
    console.error('Usage: node studio/gsap_renderer.js <project_dir> [check|preview|full]');
    process.exit(1);
  }
  const projectDir = path.resolve(projectDirArg);
  const statePath = path.join(projectDir, 'studio_state.json');
  if (!fs.existsSync(statePath)) throw new Error(`studio_state.json not found in ${projectDir}`);

  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const buildDir = path.join(projectDir, 'build');
  fs.mkdirSync(buildDir, { recursive: true });

  const srcPath = state.media?.source?.path && fs.existsSync(state.media.source.path) ? state.media.source.path : null;
  const srcHasVideo = hasVideoStream(srcPath);
  const smart = state.style === 'speech-director';
  if (smart) state.layout = srcHasVideo ? 'A' : 'C';
  const layout = state.layout || 'C';
  const transparentBg = (layout === 'A' && srcHasVideo);

  const scenes = await buildScenes(state, projectDir);
  const lotties = loadBundledLotties();
  const presets = JSON.parse(fs.readFileSync(path.join(ASSETS_DIR, 'motion-presets.json'), 'utf8'));
  const motionPreset = presets[state.options?.motionPreset || 'smooth-quart'];
  const introSeconds = scenes.find(s => s.kind === 'intro')?.end || 0;
  const execution = process.argv.includes('--use-execution')
    ? JSON.parse(fs.readFileSync(path.join(projectDir, 'execution.json'), 'utf8')) : null;
  if (execution) {
    if (execution.timeline.length !== scenes.length) throw new Error('برنامهٔ زمانی نیازمند ذخیرهٔ دوباره است.');
    execution.timeline.forEach((slot, i) => {
      Object.assign(scenes[i], { t: slot.t, end: slot.end });
      if (slot.visual) scenes[i].resolvedVisualType = slot.visual;
    });
  }
  let matte = null;
  if (smart) {
    const pyArg = process.argv.indexOf('--python');
    const python = pyArg >= 0 ? process.argv[pyArg+1] : (process.env.PYTHON || 'python');
    let directions = execution?.timeline.filter(s=>s.kind==='beat').map(s=>s.speechCues);
    if (!directions || directions.some(c => !Array.isArray(c))) {
      const r = spawnSync(python,[path.join(STUDIO_DIR,'speech_direction.py'),statePath],{encoding:'utf8'});
      if (r.status !== 0) throw new Error(r.stderr || 'Speech planning failed');
      directions = JSON.parse(r.stdout);
    }
    for (const sc of scenes.filter(s=>s.kind==='beat')) {
      sc.speechCues = directions[sc.beatIdx] || [];
      for (const cue of sc.speechCues) {
        let file = resolveLocalPath(cue.asset,projectDir);
        if (!file && cue.asset) file=resolveLocalPath(decodeURI(cue.asset),projectDir);
        if (file && /\.(mp4|webm|mov|mkv)$/i.test(file)) {
          const still = path.join(buildDir,'speech-asset-'+sc.beatIdx+'-'+cue.t+'.jpg');
          const shot = spawnSync('ffmpeg',['-loglevel','error','-y','-i',file,'-frames:v','1','-vf','scale=800:-2',still]);
          file = shot.status===0 ? still : null;
        }
        if(file) cue.assetFile=url.pathToFileURL(file).href;
        cue.isIcon = /icons|3d.icon/i.test(file || '');
      }
    }
    if (srcHasVideo && directions.flat().some(c=>c.layer==='behind')) {
      const r=spawnSync(python,[path.join(STUDIO_DIR,'speaker_matte.py'),srcPath,buildDir],{encoding:'utf8'});
      if (r.status===0) matte=JSON.parse(r.stdout);
      else console.warn('ماسک سوژه آماده نشد؛ تصویرسازی در جلوی قاب اجرا شد.', (r.stderr || '').slice(-300));
    }
  }
  const totalDuration = execution?.duration ?? Math.max(introSeconds + Number(state.sourceInfo?.duration || 0), ...scenes.map(s => s.end));
  if (!(totalDuration > 0)) throw new Error('ابتدا گفتار را تحلیل کنید یا یک سکانس بسازید.');
  const hasAudio = srcPath && spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=index', '-of', 'csv=p=0', srcPath]).stdout?.toString().trim();
  const speaker = srcHasVideo && ['A', 'B', 'E'].includes(layout);
  function composeSpeaker(base, video, delay, visible) {
    const dims = layout === 'B' ? '280:280' : layout === 'E' ? '1080:940' : '1080:1920';
    const pos = layout === 'B' ? '70:1180' : '0:980';
    const source = `[${video}]scale=${dims}:force_original_aspect_ratio=increase,crop=${dims},setsar=1,setpts=PTS-STARTPTS+${delay}/TB[person]`;
    if (layout === 'A') return `${source};[${base}]split[graphic][blank];[blank]drawbox=color=black:t=fill:replace=1[bg];[bg][person]overlay=eof_action=pass:enable='${visible}'[camera];[camera][graphic]overlay=format=auto[vcomp]`;
    return `${source};[${base}][person]overlay=${pos}:eof_action=pass:enable='${visible}'[vcomp]`;
  }

  const opts = state.options || {};
  const footPath = findMediaFile([path.join(ASSETS_DIR, 'footage'), path.join(ASSETS_DIR, 'footage/user')], opts.footageFx, ['.mp4', '.mov']);
  function blendFootage(base, index) {
    const opacity = Math.max(0, Math.min(1, Number(opts.footageOpacity ?? 0.25)));
    const mode = ({lighten:'lighten',overlay:'overlay','plus-lighter':'addition'})[opts.footageBlend] || 'screen';
    return `[${index}:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1[fxv];[${base}][fxv]blend=all_mode=${mode}:all_opacity=${opacity}:shortest=1[vfx]`;
  }

  const browserExe = BROWSERS.find((p) => fs.existsSync(p));
  if (!browserExe) throw new Error('Chrome or Edge executable not found for GSAP rendering.');

  console.log(`PROGRESS: 5`);
  const browser = await puppeteer.launch({
    executablePath: browserExe,
    headless: true,
    protocolTimeout: 90000,
    args: [
      '--allow-file-access-from-files',
      '--hide-scrollbars',
      '--force-color-profile=srgb',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
    const stageErrors = [];
    page.on('pageerror', err => stageErrors.push(err.message));

    await page.goto(url.pathToFileURL(path.join(STUDIO_DIR, 'gsap_stage.html')).href);

    // 1. Inject GSAP 3.15.1 Core + ALL 23 Official Plugins + Full Motion/UI JS Toolkit
    const umdBundles = [
      'gsap/dist/gsap.min.js',
      'gsap/dist/ScrollTrigger.min.js',
      'gsap/dist/ScrollSmoother.min.js',
      'gsap/dist/ScrollToPlugin.min.js',
      'gsap/dist/SplitText.min.js',
      'gsap/dist/ScrambleTextPlugin.min.js',
      'gsap/dist/TextPlugin.min.js',
      'gsap/dist/DrawSVGPlugin.min.js',
      'gsap/dist/MorphSVGPlugin.min.js',
      'gsap/dist/MotionPathPlugin.min.js',
      'gsap/dist/MotionPathHelper.min.js',
      'gsap/dist/Flip.min.js',
      'gsap/dist/Draggable.min.js',
      'gsap/dist/InertiaPlugin.min.js',
      'gsap/dist/Observer.min.js',
      'gsap/dist/Physics2DPlugin.min.js',
      'gsap/dist/PhysicsPropsPlugin.min.js',
      'gsap/dist/GSDevTools.min.js',
      'gsap/dist/EaselPlugin.min.js',
      'gsap/dist/PixiPlugin.min.js',
      'gsap/dist/CustomEase.min.js',
      'gsap/dist/EasePack.min.js',
      'gsap/dist/CustomWiggle.min.js',
      'gsap/dist/CustomBounce.min.js',
      'gsap/dist/CSSRulePlugin.min.js',
      'lottie-web/build/player/lottie.min.js',
      'roughjs/bundled/rough.js',
      'rough-notation/lib/rough-notation.iife.js',
      'split-type/umd/index.min.js',
      'd3-path/dist/d3-path.min.js',
      'd3-interpolate/dist/d3-interpolate.min.js',
      'd3-shape/dist/d3-shape.min.js',
      'pixi.js/dist/pixi.min.js',
      'pixi-filters/dist/pixi-filters.js',
      'muuri/dist/muuri.js',
      '@barba/core/dist/barba.umd.js',
    ];
    for (const relBundle of umdBundles) {
      const fp = path.join(CACHE_NM, relBundle);
      if (fs.existsSync(fp)) await page.addScriptTag({ path: fp });
    }

    // 2. Inject Three.js ESM module onto window.THREE
    const threeModPath = path.join(CACHE_NM, 'three/build/three.module.js');
    if (fs.existsSync(threeModPath)) {
      const threeUri = url.pathToFileURL(threeModPath).href;
      await page.addScriptTag({
        type: 'module',
        content: `import * as THREE from '${threeUri}'; window.THREE = THREE; window.__threeReady = true;`,
      });
      await page.waitForFunction(() => window.__threeReady === true, { timeout: 5000 }).catch(() => {});
    }

    await page.evaluate((css) => {
      document.getElementById('injected-fonts').textContent = css;
    }, buildFontCss());
    await page.evaluate(() => document.fonts.ready);

    if (smart) {
      await page.addStyleTag({path:path.join(STUDIO_DIR,'speech_art.css')});
      await page.addScriptTag({path:path.join(STUDIO_DIR,'speech_stage.js')});
    }
    const info = await page.evaluate((payload) => window.buildStudioTimeline(payload), {
      state,
      scenes,
      lotties,
      transparentBg, motionPreset, matte, introSeconds,
    });
    await page.evaluate(async () => {
      await Promise.all([...document.images].map(im => im.decode().catch(()=>{})));
      await Promise.all([...document.fonts].map((f) => f.load().catch(() => 0)));
    });

    if (stageErrors.length) throw new Error(stageErrors.join(' | '));
    if (mode === 'check') {
      console.log(`PRO TOOLKIT CHECK OK — scenes: ${info.scenesCount}, libsLoaded: ${JSON.stringify(info.libsLoaded)}, duration: ${totalDuration}s`);
      console.log('PROGRESS: 100');
      return;
    }

    if (mode === 'preview') {
      const sampleScenes = scenes.slice(0, 6);
      let times = sampleScenes.map((sc) => +(sc.t + Math.min(1.15, (sc.end - sc.t) * 0.62)).toFixed(2));
      if (times.length < 3) times = [0.18, 0.52, 0.84].map(f => totalDuration*f);
      const tmpDir = path.join(buildDir, '_gsap_prev');
      fs.rmSync(tmpDir, { recursive: true, force: true });
      fs.mkdirSync(tmpDir, { recursive: true });

      for (let i = 0; i < times.length; i++) {
        const t = times[i];
        await page.evaluate((ts) => window.seekStudio(ts), t);
        const fgPng = path.join(tmpDir, `fg_${String(i).padStart(2, '0')}.png`);
        fs.writeFileSync(fgPng, await page.screenshot({ type: 'png', omitBackground: transparentBg }));

        const tileJpg = path.join(tmpDir, `tile_${String(i).padStart(2, '0')}.jpg`);
        const bodyEnd = scenes.find(s => s.kind === 'outro')?.t ?? totalDuration;
        const args = ['-i', fgPng];
        const filters = [];
        let base = '0:v';
        let index = 1;
        if (speaker && t >= introSeconds && t < bodyEnd) {
          args.push('-ss', String(t-introSeconds), '-i', srcPath);
          filters.push(composeSpeaker(base, index++ + ':v', 0, '1'));
          base = 'vcomp';
        }
        if (footPath) {
          args.push('-stream_loop', '-1', '-ss', String(t), '-i', footPath);
          filters.push(blendFootage(base, index));
          base = 'vfx';
        }
        filters.push(`[${base}]scale=360:-1[tile]`);
        args.push('-filter_complex', filters.join(';'), '-map', '[tile]');
        const result = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args, '-frames:v', '1', '-pix_fmt', 'yuvj420p', '-q:v', '2', tileJpg]);
        if (result.status !== 0 || !fs.existsSync(tileJpg)) throw new Error('Preview: ' + result.stderr);
        console.log(`PROGRESS: ${Math.round(((i + 1) / times.length) * 90)}`);
      }

      const cols = Math.min(3, times.length);
      const rows = Math.ceil(times.length / cols);
      const outPreview = path.join(buildDir, 'preview.jpg');
      const sheet = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(tmpDir, 'tile_%02d.jpg'),
        '-vf', `tile=${cols}x${rows}:padding=8:color=0xE2E8F0`, '-frames:v', '1', '-q:v', '2', outPreview]);
      if (sheet.status !== 0) throw new Error('Preview sheet: ' + sheet.stderr);
      console.log(`Preview saved: ${outPreview}`);
      console.log('PROGRESS: 100');
      return;
    }

    // ---------------- FULL 1080x1920 @ 30fps MP4 RENDER ----------------
    const totalFrames = Math.max(1, Math.ceil(totalDuration * FPS));
    const rawOverlay = path.join(buildDir, transparentBg ? '_gsap_overlay.mov' : '_gsap_raw.mp4');
    const ffArgs = transparentBg
      ? ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', rawOverlay]
      : ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', '-pix_fmt', 'yuv420p', rawOverlay];

    const ff = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
    const stepReport = Math.max(1, Math.floor(totalFrames / 20));

    for (let f = 0; f < totalFrames; f++) {
      await page.evaluate((ts) => window.seekStudio(ts), f / FPS);
      const buf = await page.screenshot({ type: 'png', omitBackground: transparentBg });
      if (!ff.stdin.write(buf)) await new Promise((res) => ff.stdin.once('drain', res));
      if (f % stepReport === 0) {
        console.log(`PROGRESS: ${Math.min(84, Math.round((f / totalFrames) * 84))}`);
      }
    }
    ff.stdin.end();
    const code1 = await new Promise((res) => ff.on('close', res));
    if (code1 !== 0) throw new Error(`FFmpeg video pipe exited with ${code1}`);

    // Final Audio + Layout + Optional Footage FX Mix
    const outMp4 = path.join(projectDir, 'final.mp4');
    const inputs = ['-i', rawOverlay];
    let nextIdx = 1;
    const filters = [];
    let vLabel = '0:v';

    if (srcPath) {
      inputs.push('-i', srcPath);
      const sIdx = nextIdx++;
      if (speaker) {
        const end = scenes.find(s => s.kind === 'outro')?.t ?? totalDuration;
        filters.push(composeSpeaker('0:v', sIdx + ':v', introSeconds, `gte(t,${introSeconds})*lt(t,${end})`));
        vLabel = '[vcomp]';
      }
    }

    if (footPath) {
      inputs.push('-stream_loop', '-1', '-i', footPath);
      filters.push(blendFootage(vLabel.replace(/[\[\]]/g, ''), nextIdx++));
      vLabel = '[vfx]';
    }

    const aStreams = [];
    if (hasAudio) {
      const introMs = Math.round(introSeconds * 1000);
      const delayPart = introMs > 0 ? `adelay=${introMs}|${introMs},` : '';
      const vFilter = opts.voiceEnhance !== false
        ? 'highpass=f=80,acompressor=threshold=-18dB:ratio=2.5,loudnorm=I=-15:TP=-1.5:LRA=9,'
        : 'loudnorm=I=-15:TP=-1.5:LRA=9,';
      filters.push(`[1:a]${delayPart}${vFilter}aformat=sample_rates=44100:channel_layouts=stereo[voice]`);
      aStreams.push('[voice]');
    }

    const musicPath = findMediaFile([path.join(ASSETS_DIR, 'music')], opts.music, ['.mp3', '.wav', '.m4a', '.ogg']);
    if (musicPath) {
      inputs.push('-stream_loop', '-1', '-i', musicPath);
      const mIdx = nextIdx++;
      const mgain = Math.min(-16, Number(opts.musicGain ?? -22));
      filters.push(`[${mIdx}:a]volume=${mgain}dB,atrim=0:${totalDuration.toFixed(2)},aformat=sample_rates=44100:channel_layouts=stereo[bgm]`);
      if (hasAudio && opts.musicDucking !== false) {
        filters.push('[voice]asplit[voiceMix][key]', '[key]apad[keyPad]', '[bgm][keyPad]sidechaincompress=threshold=0.02:ratio=9:attack=15:release=260[ducked]');
        aStreams[0] = '[voiceMix]';
        aStreams.push('[ducked]');
      } else aStreams.push('[bgm]');
    }

    // SFX must always sit gently below human speech (-15 dB default, strictly capped <= -12 dB)
    // and lock strictly to real visual moments (clickAt for mouse clicks, scene start for transitions, minGap 2.2s)
    const sfxGain = Math.min(-12, Number(opts.sfxGain ?? -15));
    const sfxEvents = scenes.filter((s) => s.kind === 'beat' && s.sfx && s.sfx !== 'none');
    let lastSfxTime = -10;
    sfxEvents.forEach((sc, si) => {
      const sp = findMediaFile([path.join(ASSETS_DIR, 'sfx/user'), path.join(ASSETS_DIR, 'sfx')], sc.sfx, ['.wav', '.mp3', '.ogg']);
      if (!sp) return;
      const isClick = /click|tap|pop/i.test(sc.sfx) && sc.cursorClick && Number.isFinite(Number(sc.clickAt));
      const fireTime = isClick
        ? sc.t + Math.max(0.15, Number(sc.clickAt))
        : sc.t;
      if (fireTime - lastSfxTime < 2.2) return;
      lastSfxTime = fireTime;
      inputs.push('-i', sp);
      const xIdx = nextIdx++;
      const dms = Math.max(0, Math.round(fireTime * 1000));
      const extraTrim = isClick ? -2 : 0;
      filters.push(`[${xIdx}:a]volume=${sfxGain + extraTrim}dB,adelay=${dms}|${dms},aformat=sample_rates=44100:channel_layouts=stereo[sfx${si}]`);
      aStreams.push(`[sfx${si}]`);
    });

    let aLabel = '';
    if (!aStreams.length) {
      inputs.push('-f', 'lavfi', '-t', totalDuration.toFixed(2), '-i', 'anullsrc=r=44100:cl=stereo');
      aLabel = `${nextIdx}:a`;
    } else if (aStreams.length === 1) {
      aLabel = aStreams[0];
    } else {
      filters.push(`${aStreams.join('')}amix=inputs=${aStreams.length}:duration=longest:normalize=0:dropout_transition=2,alimiter=limit=0.95[aout]`);
      aLabel = '[aout]';
    }

    const mixArgs = ['-v', 'error', '-y', ...inputs];
    if (filters.length) mixArgs.push('-filter_complex', filters.join(';'));
    mixArgs.push(
      '-map', vLabel, '-map', aLabel,
      '-t', totalDuration.toFixed(2),
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart',
      outMp4
    );
    const mixRes = spawnSync('ffmpeg', mixArgs, { encoding: 'utf8' });
    if (mixRes.status !== 0) throw new Error(`FFmpeg final mix failed: ${mixRes.stderr}`);
    try { fs.unlinkSync(rawOverlay); } catch (_) {}
    console.log(`Final MP4 rendered: ${outMp4}`);
    console.log('PROGRESS: 100');
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error('GSAP RENDERER FAILED:', err.stack || err.message);
  process.exit(1);
});
