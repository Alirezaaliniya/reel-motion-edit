// Reel Motion Studio — Interactive Frontend Controller

const state = {
  catalog: null,
  project: null,
  projectsList: [],
  activeBeatIndex: 0,
  styleFilter: 'all',
  isPlaying: false,
  playTime: 0,
  rafId: null,
  lastTick: 0,
};

const $ = (id) => document.getElementById(id);

function showToast(msg, ms = 2800) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), ms);
}

async function api(url, opts = {}) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
  return data;
}

// ---------------- Initialization ----------------

async function init() {
  bindTabs();
  bindStyleControls();
  bindUploads();
  bindAssetPanels();
  bindExportButtons();

  state.catalog = await api('/api/catalog');
  populateFontSelects();
  populateDesignSystems67();
  populateMusicSelect();
  populateFootageSelect();
  populateMotionPresets();
  await loadSkillsPanel();
  renderStyleGrid();
  renderLocalAssets();

  // Load latest project or create a fresh one
  await refreshProjectsList();
  if (state.projectsList.length > 0) {
    state.project = await api(`/api/projects/${state.projectsList[0].id}`);
  } else {
    state.project = await api('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'پروژه اول استودیو', style: 'pinterest-faceless' }),
    });
    await refreshProjectsList();
  }
  bindTimelineControls();
  syncProjectToUI();
}

async function refreshProjectsList() {
  const { projects } = await api('/api/projects');
  state.projectsList = projects || [];
  const sel = $('projectSwitcher');
  sel.innerHTML = state.projectsList.map((p) => `<option value="${p.id}">${p.title}</option>`).join('');
  if (state.project) sel.value = state.project.id;
}

function bindTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.panel-section').forEach((s) => s.classList.remove('active'));
      btn.classList.add('active');
      $(btn.dataset.tab).classList.add('active');
      if (btn.dataset.tab === 'tab-export') saveAndRefreshBrief();
    });
  });

  document.querySelectorAll('#tab1Subtabs .pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#tab1Subtabs .pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      document.querySelectorAll('.sub-panel').forEach((sp) => { sp.style.display = 'none'; });
      $(pill.dataset.sub).style.display = 'block';
    });
  });

  document.querySelectorAll('#styleFilters .pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#styleFilters .pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      state.styleFilter = pill.dataset.filter;
      renderStyleGrid();
    });
  });

  $('projectSwitcher').addEventListener('change', async (e) => {
    const pid = e.target.value;
    if (!pid) return;
    stopPlayback();
    state.project = await api(`/api/projects/${pid}`);
    state.activeBeatIndex = 0;
    syncProjectToUI();
    showToast(`پروژه «${state.project.title}» بارگذاری شد`);
  });

  $('btnDeleteProject').addEventListener('click', async () => {
    if (!state.project) return;
    if (!confirm(`پروژه «${state.project.title}» برای همیشه حذف شود؟`)) return;
    stopPlayback();
    await api(`/api/projects/${state.project.id}`, { method: 'DELETE' });
    await refreshProjectsList();
    if (state.projectsList.length > 0) {
      state.project = await api(`/api/projects/${state.projectsList[0].id}`);
    } else {
      state.project = await api('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'پروژه جدید ریلز', style: 'pinterest-faceless' }),
      });
      await refreshProjectsList();
    }
    state.activeBeatIndex = 0;
    syncProjectToUI();
    showToast('پروژه حذف شد');
  });

  $('btnNewProject').addEventListener('click', async () => {
    const title = prompt('نام پروژه جدید را بنویسید:', 'ریلز جدید نیاس');
    if (!title) return;
    stopPlayback();
    state.project = await api('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, style: 'pinterest-faceless' }),
    });
    await refreshProjectsList();
    state.activeBeatIndex = 0;
    syncProjectToUI();
    showToast('پروژه جدید ساخته شد');
  });

  $('btnExtractLogoColors').addEventListener('click', async () => {
    if (!state.project) return;
    try {
      const res = await api(`/api/projects/${state.project.id}/extract-brand-colors`, { method: 'POST' });
      state.project.brand.primary = res.primary;
      state.project.brand.accent = res.accent;
      syncProjectToUI();
      showToast(`رنگ‌های برند استخراج شد: ${res.primary} و ${res.accent}`);
    } catch (err) {
      showToast(err.message);
    }
  });

  let bridgePollTimer = null;

  $('btnAutoDirect').addEventListener('click', async () => {
    if (!state.project) return;
    $('aiModal').style.display = 'grid';
    try {
      const cfg = await api('/api/ai/config');
      $('aiCfgProvider').value = cfg.provider || 'agent-bridge';
      $('aiCfgModel').value = cfg.model || 'gemini-2.5-flash';
      $('aiCfgBaseUrl').value = cfg.baseUrl || 'https://api.openai.com/v1';
    } catch (_) {}
  });

  $('btnCloseAiModal').addEventListener('click', () => { $('aiModal').style.display = 'none'; });
  $('btnCloseReport').addEventListener('click', () => { $('aiReportCard').style.display = 'none'; });

  $('btnStartAgentBridge').addEventListener('click', async () => {
    if (!state.project) return;
    await saveAndRefreshBrief(false);
    const res = await api(`/api/projects/${state.project.id}/auto-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'agent-bridge' }),
    });
    $('bridgeStatusBox').style.display = 'block';
    $('bridgeCommandText').value = res.agentCommand || '';
    showToast('پل زنده فعال شد! دستور را کپی کن و به هوش مصنوعی بده.');

    // Live Auto-Sync polling: detects instantly when local AI Agent / MCP applies the plan
    clearInterval(bridgePollTimer);
    bridgePollTimer = setInterval(async () => {
      if (!state.project) return clearInterval(bridgePollTimer);
      try {
        const latest = await api(`/api/projects/${state.project.id}`);
        if (latest && latest.aiPendingBridge === false && latest.aiAnalysisReport) {
          clearInterval(bridgePollTimer);
          state.project = latest;
          syncProjectToUI();
          $('aiModal').style.display = 'none';
          showToast('طرح کارگردانی هوش مصنوعی به‌صورت زنده دریافت و اعمال شد!', 5000);
        }
      } catch (_) {}
    }, 2000);
  });

  $('btnCopyBridgeCmd').addEventListener('click', async () => {
    await navigator.clipboard.writeText($('bridgeCommandText').value);
    showToast('دستور کپی شد! در چت هوش مصنوعی پیست کن تا همه‌چیز خودکار پر شود.');
  });

  $('btnRunLocalFast').addEventListener('click', async () => {
    if (!state.project) return;
    await saveAndRefreshBrief(false);
    const res = await api(`/api/projects/${state.project.id}/auto-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'local' }),
    });
    state.project = res.state;
    syncProjectToUI();
    $('briefOutput').value = res.brief || '';
    $('aiModal').style.display = 'none';
    showToast('تکمیل سریع آفلاین انجام شد!');
  });

  $('btnSaveAiCfg').addEventListener('click', async () => {
    await api('/api/ai/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: $('aiCfgProvider').value,
        model: $('aiCfgModel').value,
        apiKey: $('aiCfgKey').value,
        baseUrl: $('aiCfgBaseUrl').value,
      }),
    });
    showToast('تنظیمات هوش مصنوعی ذخیره شد');
  });

  $('btnRunLlmDirect').addEventListener('click', async () => {
    if (!state.project) return;
    await $('btnSaveAiCfg').click();
    showToast('در حال ارسال فایل‌ها به مدل هوش مصنوعی...');
    await saveAndRefreshBrief(false);
    try {
      const res = await api(`/api/projects/${state.project.id}/auto-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'llm' }),
      });
      state.project = res.state;
      syncProjectToUI();
      $('briefOutput').value = res.brief || '';
      $('aiModal').style.display = 'none';
      showToast(`کارگردانی کامل با ${res.engine} انجام شد!`, 4500);
    } catch (err) {
      showToast('خطا در اتصال به مدل: ' + err.message, 5000);
    }
  });

  $('btnSaveAll').addEventListener('click', () => saveAndRefreshBrief(true));
  $('btnShutdown').addEventListener('click', async () => {
    if (!confirm('سرور لوکال استودیو خاموش شود؟')) return;
    try { await api('/api/shutdown', { method: 'POST' }); } catch (_) {}
    showToast('سرور استودیو خاموش شد. می‌توانید این پنجره را ببندید.', 6000);
    setTimeout(() => window.close(), 700);
  });
}

// ---------------- Catalog & Styles ----------------

function populateFontSelects() {
  const fonts = state.catalog.assets.fonts || [];
  ['optDisplayFont', 'optBodyFont'].forEach((id) => {
    const sel = $(id);
    sel.innerHTML = fonts.map((f) => `<option value="${f.id}">${f.label}</option>`).join('');
  });
}

function populateDesignSystems67() {
  const list = state.catalog.designSystems67 || [];
  const sel = $('optDesignSystem67');
  sel.innerHTML = `<option value="">— انتخاب نکن —</option>` +
    list.map((d) => `<option value="${d.id}">${d.name} (${d.id})</option>`).join('');
}

function populateMusicSelect() {
  const list = state.catalog.assets.music || [];
  const sel = $('optMusic');
  sel.innerHTML = `<option value="none">بدون موسیقی</option>` +
    list.map((m) => `<option value="${m.name}">${m.name}</option>`).join('');
}

function populateFootageSelect() {
  const list = state.catalog.assets.footage || [];
  const sel = $('optFootageFx');
  if (!sel) return;
  sel.innerHTML = `<option value="none">بدون فوتیج افکت روی تصویر</option>` +
    list.map((f) => `<option value="${f.name}">${f.name}</option>`).join('');
}

let cachedMcpConfig = '';

async function loadSkillsPanel() {
  try {
    const res = await api('/api/skills/status');
    cachedMcpConfig = res.mcpConfig || '';
    const box = $('skillsChecklist');
    if (!box) return;
    box.innerHTML = (res.skills || []).map((sk) => `
      <label class="toggle" title="${escapeAttr(sk.path)}">
        <input type="checkbox" class="skill-chk" value="${sk.id}" ${sk.installed ? 'checked' : ''} />
        <span>${sk.label}</span>
        <span class="badge" style="margin:0; ${sk.installed ? 'background:#dcfce7; color:#166534; border-color:#86efac;' : 'background:#fee2e2; color:#991b1b;'}">${sk.installed ? 'نصب‌شده' : 'نصب نیست'}</span>
      </label>
    `).join('');

    box.querySelectorAll('.skill-chk').forEach((chk) => {
      chk.addEventListener('change', () => {
        if (!state.project) return;
        const selected = Array.from(box.querySelectorAll('.skill-chk:checked')).map((c) => c.value);
        state.project.options.selectedSkills = selected;
        saveAndRefreshBrief(false);
      });
    });

    $('optExecMode').addEventListener('change', (e) => {
      if (!state.project) return;
      state.project.options.executionMode = e.target.value;
      saveAndRefreshBrief(false);
    });

    $('btnCopyMcpConfig').addEventListener('click', async () => {
      if (!cachedMcpConfig) return;
      await navigator.clipboard.writeText(cachedMcpConfig);
      showToast('کانفیگ JSON نصب سرور MCP استودیو کپی شد! در تنظیمات MCP پیست کن.');
    });
  } catch (e) {
    console.warn('Skills status check skipped:', e);
  }
}

function populateMotionPresets() {
  const list = state.catalog.motionPresets || [];
  const sel = $('optMotionPreset');
  if (!sel) return;
  sel.innerHTML = list.map((p) => `<option value="${p.id}">${p.label}</option>`).join('');
}

function renderStyleGrid() {
  const grid = $('styleGrid');

  // Special visual gallery mode for all 67 GitHub Design Systems
  if (state.styleFilter === 'github67') {
    const dsList = state.catalog.designSystems67 || [];
    const curRef = state.project?.designSystemRef || '';
    grid.innerHTML = dsList.map((d) => `
      <div class="style-item ${d.id === curRef ? 'selected' : ''}" data-ds67-id="${d.id}">
        <img class="style-thumb" src="${d.thumb}" alt="${d.name}" loading="lazy" />
        <div class="style-meta">
          <div class="style-name">${d.name}</div>
          <div class="style-en">${d.id}</div>
          <span class="badge">GitHub DESIGN.md</span>
        </div>
      </div>`).join('');

    grid.querySelectorAll('[data-ds67-id]').forEach((card) => {
      card.addEventListener('click', () => {
        const d = dsList.find((x) => x.id === card.dataset.ds67Id);
        if (!d || !state.project) return;
        state.project.designSystemRef = d.id;
        if (d.palette) {
          state.project.brand.bg = d.palette.bg;
          state.project.brand.text = d.palette.text;
          state.project.brand.primary = d.palette.primary;
          state.project.brand.accent = d.palette.accent;
        }
        syncProjectToUI();
        showToast(`سیستم طراحی «${d.name}» از گیت‌هاب روی پروژه اعمال شد!`);
      });
    });
    return;
  }

  const styles = state.catalog.styles || [];
  const filtered = styles.filter((s) => {
    if (state.styleFilter === 'all') return true;
    if (state.styleFilter === 'custom') return s.isCustom;
    if (state.styleFilter === 'faceless') return !!(s.thumbs.C || s.thumbs.D || s.id === 'pinterest-faceless');
    if (state.styleFilter === 'face') return !!(s.thumbs.A || s.thumbs.B || s.thumbs.E);
    return true;
  });

  const currentId = state.project ? state.project.style : 'pinterest-faceless';
  grid.innerHTML = filtered.map((s) => {
    const th = s.theme || {};
    const imgHtml = s.thumb
      ? `<img class="style-thumb" src="${s.thumb}" alt="${s.label}" loading="lazy" />`
      : `<div class="style-swatch" style="background:${th.dark || '#141824'}; color:${th.text || '#fff'};">
           <span style="color:${th.primary || '#3b82f6'}; font-size:18px;">${s.label}</span>
           <small style="opacity:.7; margin-top:6px;">${s.en}</small>
         </div>`;
    return `
      <div class="style-item ${s.id === currentId ? 'selected' : ''}" data-style-id="${s.id}">
        ${imgHtml}
        <div class="style-meta">
          <div class="style-name">${s.label}</div>
          <div class="style-en">${s.id}</div>
          ${s.isCustom ? '<span class="badge custom">سبک شخصی</span>' : ''}
        </div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.style-item').forEach((card) => {
    card.addEventListener('click', () => selectStyle(card.dataset.styleId));
  });
}

function normalizeTransitionOption(tr) {
  const valid = ['push', 'circles', 'zoom', 'dissolve', 'paper', 'glitch'];
  if (valid.includes(tr)) return tr;
  if (tr === 'fade' || tr === 'ink') return 'dissolve';
  if (tr === 'flash' || tr === 'scan' || tr === 'whip') return 'glitch';
  return 'push';
}

function normalizeCaptionOption(cap) {
  const valid = ['none', 'highlight', 'karaoke', 'minimal', 'boxed'];
  if (valid.includes(cap)) return cap;
  if (cap === 'pop' || cap === 'kinetic') return 'karaoke';
  if (cap === 'mask' || cap === 'reveal') return 'minimal';
  return 'minimal';
}

function selectStyle(styleId) {
  const s = state.catalog.styles.find((x) => x.id === styleId);
  if (!s || !state.project) return;
  state.project.style = styleId;
  const th = s.theme || {};
  const bg = th.dark || '#F4F5F2';
  const h = bg.replace('#', '');
  const darkBg = h.length === 6 && (0.299 * parseInt(h.slice(0,2),16) + 0.587 * parseInt(h.slice(2,4),16) + 0.114 * parseInt(h.slice(4,6),16)) < 130;
  state.project.brand.primary = th.primary || '#007AFF';
  state.project.brand.accent = th.accent || th.highlight || '#F8D146';
  state.project.brand.bg = bg;
  state.project.brand.text = th.text || (darkBg ? '#F8FAFC' : '#262B2E');
  if (th.display) state.project.brand.displayFont = th.display;
  if (th.body) state.project.brand.bodyFont = th.body;
  if (s.captions) state.project.options.captions = normalizeCaptionOption(s.captions);
  if (s.transitions && s.transitions.length) state.project.options.transition = normalizeTransitionOption(s.transitions[0]);

  syncProjectToUI();
  showToast(`سبک «${s.label}» انتخاب شد`);
}

function bindStyleControls() {
  const syncColor = (inputId, labelId, key) => {
    $(inputId).addEventListener('input', (e) => {
      $(labelId).textContent = e.target.value.toUpperCase();
      if (state.project) {
        state.project.brand[key] = e.target.value;
        updateLivePreview();
      }
    });
  };
  syncColor('colPrimary', 'valPrimary', 'primary');
  syncColor('colAccent', 'valAccent', 'accent');
  syncColor('colBg', 'valBg', 'bg');
  syncColor('colText', 'valText', 'text');

  $('projectTitle').addEventListener('input', (e) => { if (state.project) state.project.title = e.target.value; });
  $('optLayout').addEventListener('change', (e) => { if (state.project) { state.project.layout = e.target.value; updateLivePreview(); } });
  $('optAspectRatio').addEventListener('change', (e) => { if (state.project) { state.project.options.aspectRatio = e.target.value; updateLivePreview(); } });
  $('optFootageBlend').addEventListener('change', (e) => { if (state.project) { state.project.options.footageBlend = e.target.value; updateFootageOverlayPreview(); } });
  $('optDisplayFont').addEventListener('change', (e) => { if (state.project) { state.project.brand.displayFont = e.target.value; updateLivePreview(); } });
  $('optBodyFont').addEventListener('change', (e) => { if (state.project) { state.project.brand.bodyFont = e.target.value; updateLivePreview(); } });
  $('optTransition').addEventListener('change', (e) => {
    if (state.project) {
      state.project.options.transition = e.target.value;
      triggerTransitionPreview(e.target.value);
    }
  });
  $('optMotionPreset').addEventListener('change', (e) => {
    if (state.project) {
      state.project.options.motionPreset = e.target.value;
      updateLivePreview(true);
    }
  });
  $('optTextAnimStyle').addEventListener('change', (e) => {
    if (state.project) {
      state.project.options.textAnimStyle = e.target.value;
      updateLivePreview(true);
    }
  });

  $('btnImportFfx').addEventListener('click', async () => {
    const inp = $('ffxPresetFile');
    if (!inp.files || !inp.files.length) return showToast('ابتدا یک فایل .ffx انتخاب کن');
    const fd = new FormData();
    fd.append('file', inp.files[0]);
    fd.append('label', $('ffxPresetLabel').value.trim());
    try {
      const res = await api('/api/presets/import-ffx', { method: 'POST', body: fd });
      state.catalog.motionPresets = res.motionPresets;
      populateMotionPresets();
      if (state.project) {
        state.project.options.motionPreset = res.preset.id;
        $('optMotionPreset').value = res.preset.id;
      }
      const box = $('ffxImportResult');
      box.style.display = 'block';
      box.textContent = `Imported: ${res.preset.label} (${res.preset.kind})\nSliders: ${(res.preset.sliders || []).join(', ')}\n${res.preset.expressionSnippet || ''}`;
      showToast(`پریست «${res.preset.label}» با موفقیت استخراج و فعال شد!`, 4500);
    } catch (err) {
      showToast('خطا در خواندن فایل FFX: ' + err.message, 5000);
    }
  });
  $('optCaptions').addEventListener('change', (e) => { if (state.project) { state.project.options.captions = e.target.value; updateLivePreview(); } });
  $('optTextMode').addEventListener('change', (e) => { if (state.project) { state.project.options.textMode = e.target.value; updateLivePreview(); } });
  $('optHeadlinePos').addEventListener('change', (e) => { if (state.project) { state.project.options.headlinePos = e.target.value; updateLivePreview(); } });
  $('optCaptionPos').addEventListener('change', (e) => { if (state.project) { state.project.options.captionPos = e.target.value; updateLivePreview(); } });
  $('optFontScale').addEventListener('change', (e) => { if (state.project) { state.project.options.fontScale = e.target.value; updateLivePreview(); } });
  $('inpHandle').addEventListener('input', (e) => { if (state.project) { state.project.brand.handle = e.target.value; updateLivePreview(); } });
  $('optHandlePos').addEventListener('change', (e) => { if (state.project) { state.project.brand.handlePos = e.target.value; updateLivePreview(); } });
  $('optFootageFx').addEventListener('change', (e) => { if (state.project) { state.project.options.footageFx = e.target.value; updateFootageOverlayPreview(); } });
  $('optFootageOpacity').addEventListener('input', (e) => {
    $('valFootOp').textContent = Math.round(Number(e.target.value) * 100) + '%';
    if (state.project) { state.project.options.footageOpacity = Number(e.target.value); updateFootageOverlayPreview(); }
  });
  $('optSfxGain').addEventListener('input', (e) => { if (state.project) state.project.options.sfxGain = Number(e.target.value); });
  $('chkVoiceEnhance').addEventListener('change', (e) => { if (state.project) state.project.options.voiceEnhance = e.target.checked; });
  $('chkMusicDucking').addEventListener('change', (e) => { if (state.project) state.project.options.musicDucking = e.target.checked; });
  $('chkSafeZone').addEventListener('change', (e) => { $('phoneSafeZone').style.display = e.target.checked ? 'block' : 'none'; });
  $('optMusic').addEventListener('change', (e) => { if (state.project) state.project.options.music = e.target.value; });
  $('btnTestMusic').addEventListener('click', () => {
    const mName = $('optMusic').value;
    const player = $('sfxPlayer');
    if (!mName || mName === 'none') return showToast('ابتدا یک موسیقی پس‌زمینه انتخاب کن');
    const item = (state.catalog?.assets?.music || []).find((m) => m.name === mName);
    if (!item) return;
    if (!player.paused && player.src.endsWith(item.url)) {
      player.pause();
      $('btnTestMusic').innerHTML = '<i class="iconsax sm" icon-name="volume-high"></i> تست';
    } else {
      player.src = item.url;
      player.play().catch(() => {});
      $('btnTestMusic').innerHTML = '<i class="iconsax sm" icon-name="pause"></i> توقف';
    }
  });
  $('optIntroStyle').addEventListener('change', (e) => { if (state.project) { state.project.options.introStyle = e.target.value; previewSpecialScene('intro'); } });
  $('optIntroDur').addEventListener('input', (e) => { if (state.project) state.project.options.introDur = Number(e.target.value); });
  $('optOutroStyle').addEventListener('change', (e) => { if (state.project) { state.project.options.outroStyle = e.target.value; previewSpecialScene('outro'); } });
  $('optOutroDur').addEventListener('input', (e) => { if (state.project) state.project.options.outroDur = Number(e.target.value); });
  $('inpOutroCtaWord').addEventListener('input', (e) => { if (state.project) { state.project.options.outroCtaWord = e.target.value; previewSpecialScene('outro'); } });
  $('inpOutroSubtitle').addEventListener('input', (e) => { if (state.project) { state.project.options.outroSubtitle = e.target.value; previewSpecialScene('outro'); } });
  $('btnPreviewIntro').addEventListener('click', () => previewSpecialScene('intro'));
  $('btnPreviewOutro').addEventListener('click', () => previewSpecialScene('outro'));
  $('optMusicGain').addEventListener('input', (e) => { if (state.project) state.project.options.musicGain = Number(e.target.value); });

  $('chkFlowline').addEventListener('change', (e) => { if (state.project) { state.project.options.flowlineRibbon = e.target.checked; updateLivePreview(); } });
  $('chkCornerBlur').addEventListener('change', (e) => { if (state.project) { state.project.options.cornerBlurAccents = e.target.checked; updateLivePreview(); } });
  $('chkSpatialScroll').addEventListener('change', (e) => { if (state.project) { state.project.options.spatialScroll = e.target.checked; } });

  // Per-section Smart Hybrid toggles
  const hybridMap = [
    ['hybLayout', 'layout', 'چیدمان سکانس‌ها'],
    ['hybTransitions', 'transitions', 'ترنزیشن‌ها'],
    ['hybMotion', 'motion', 'پریست انیمیشن متن'],
    ['hybTextMode', 'textMode', 'نمایش متن و زیرنویس'],
    ['hybFx', 'fx', 'افکت‌ها و فوتیج نوری'],
  ];
  const refreshHybridPills = () => {
    const h = state.project?.options?.hybrid || {};
    hybridMap.forEach(([elId, key]) => {
      const inp = $(elId);
      if (!inp) return;
      inp.checked = !!h[key];
      inp.closest('.hybrid-pill')?.classList.toggle('on', !!h[key]);
    });
  };
  hybridMap.forEach(([elId, key, faName]) => {
    const inp = $(elId);
    if (!inp) return;
    inp.addEventListener('change', () => {
      if (!state.project) return;
      state.project.options.hybrid = state.project.options.hybrid || {};
      state.project.options.hybrid[key] = inp.checked;
      refreshHybridPills();
      showToast(inp.checked ? `حالت ترکیبی هوشمند برای «${faName}» فعال شد` : `حالت دستی برای «${faName}» فعال شد`);
    });
  });
  $('btnToggleAllHybrid').addEventListener('click', () => {
    if (!state.project) return;
    const h = state.project.options.hybrid || {};
    const allOn = hybridMap.every(([, k]) => !!h[k]);
    const nextVal = !allOn;
    state.project.options.hybrid = {};
    hybridMap.forEach(([, k]) => { state.project.options.hybrid[k] = nextVal; });
    refreshHybridPills();
    showToast(nextVal ? 'حالت ترکیبی هوشمند برای هر ۵ بخش فعال شد!' : 'همه بخش‌ها به حالت انتخاب دستی برگشتند');
  });
  window._refreshHybridPills = refreshHybridPills;

  $('optDesignSystem67').addEventListener('change', (e) => {
    if (state.project) state.project.designSystemRef = e.target.value;
  });
  $('freeformDirection').addEventListener('input', (e) => {
    if (state.project) state.project.freeformDirection = e.target.value;
  });

  $('btnInspect67').addEventListener('click', async () => {
    const id = $('optDesignSystem67').value;
    if (!id) return showToast('ابتدا یکی از ۶۷ سیستم طراحی را انتخاب کن');
    const detail = await api(`/api/design-system/${id}`);
    const box = $('designSystemPreview');
    box.style.display = 'block';
    box.textContent = (detail.designMd || detail.skillMd || '').slice(0, 1800);
  });

  let lastCloneData = null;

  $('btnAnalyzeRef').addEventListener('click', async () => {
    const fileInp = $('refCloneFile');
    if (!fileInp.files || !fileInp.files.length) return showToast('ابتدا یک فایل ویدیو یا عکس رفرنس انتخاب کن');
    const fd = new FormData();
    fd.append('file', fileInp.files[0]);
    fd.append('label', $('refCloneLabel').value.trim());
    showToast('در حال تحلیل فریم‌به‌فریم کات‌ها، حرکت‌ها و پالت رنگ رفرنس...', 5000);
    try {
      const res = await api('/api/reference/analyze', { method: 'POST', body: fd });
      lastCloneData = res;
      $('refCloneResult').style.display = 'block';
      $('refCloneThumb').src = res.thumbUrl;
      $('refCloneSheet').src = res.sheetUrl;
      $('refCloneReport').textContent = res.report;
      if (!$('refCloneLabel').value.trim()) $('refCloneLabel').value = res.suggestedLabel;
      $('refCloneNotes').value = res.report;

      // Immediately preview extracted palette on the live 9:16 phone
      if (state.project && res.palette) {
        state.project.brand.bg = res.palette.bg;
        state.project.brand.text = res.palette.text;
        state.project.brand.primary = res.palette.primary;
        state.project.brand.accent = res.palette.accent;
        state.project.options.spatialScroll = !!res.motion?.hasSpatialScroll;
        syncProjectToUI();
      }
      showToast('تحلیل رفرنس کامل شد! پیش‌نمایش و شیت فریم‌ها آماده است.');
    } catch (err) {
      showToast('خطا در تحلیل رفرنس: ' + err.message, 5000);
    }
  });

  $('btnCopyDeepRefCmd').addEventListener('click', async () => {
    if (!lastCloneData?.deepAiCommand) return;
    await navigator.clipboard.writeText(lastCloneData.deepAiCommand);
    showToast('دستور تحلیل فوق‌دقیق فریم‌به‌فریم کپی شد! در چت هوش مصنوعی پیست کن.');
  });

  $('btnSaveClonedStyle').addEventListener('click', async () => {
    if (!lastCloneData) return showToast('ابتدا یک رفرنس را تحلیل کن');
    const label = $('refCloneLabel').value.trim() || lastCloneData.suggestedLabel;
    const rec = lastCloneData.recommendedStyle || {};
    try {
      const res = await api('/api/reference/save-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloneId: lastCloneData.cloneId,
          label,
          primary: $('colPrimary').value || rec.primary,
          accent: $('colAccent').value || rec.accent,
          dark: $('colBg').value || rec.dark,
          text: $('colText').value || rec.text,
          displayFont: $('optDisplayFont').value || 'Hasti',
          bodyFont: $('optBodyFont').value || 'Pinar',
          transitions: rec.transitions || ['push', 'circles'],
          captions: rec.captions || 'none',
          flowlineRibbon: $('chkFlowline').checked,
          cornerBlurAccents: $('chkCornerBlur').checked,
          spatialScroll: $('chkSpatialScroll').checked,
          notes: $('refCloneNotes').value.trim(),
        }),
      });
      state.catalog = await api('/api/catalog');
      state.project.style = res.id;
      renderStyleGrid();
      updateLivePreview();
      showToast(`سبک «${label}» با تصویر واقعی در گالری ثبت شد!`, 4500);
    } catch (err) {
      showToast('خطا در ذخیره سبک: ' + err.message, 4500);
    }
  });

  $('btnSaveCustomStyle').addEventListener('click', async () => {
    const label = $('customStyleLabel').value.trim();
    if (!label) return showToast('نام فارسی سبک جدید را بنویس');
    const body = {
      id: $('customStyleId').value.trim() || null,
      label,
      en: $('customStyleId').value.trim() || label,
      primary: $('colPrimary').value,
      secondary: $('colPrimary').value,
      accent: $('colAccent').value,
      dark: $('colBg').value,
      text: $('colText').value,
      displayFont: $('optDisplayFont').value,
      bodyFont: $('optBodyFont').value,
      transitions: [$('optTransition').value],
      captions: $('optCaptions').value,
      flowlineRibbon: $('chkFlowline').checked,
      cornerBlurAccents: $('chkCornerBlur').checked,
      spatialScroll: $('chkSpatialScroll').checked,
      freeformPrompt: $('freeformDirection').value,
    };
    const res = await api('/api/styles/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    state.catalog = await api('/api/catalog');
    state.project.style = res.id;
    renderStyleGrid();
    updateLivePreview();
    showToast(`سبک جدید «${label}» با کد ${res.id} به گالری اضافه شد!`);
  });
}

// ---------------- Uploads & Whisper Analyze ----------------

function bindUploads() {
  const uploadFiles = async (files, role) => {
    if (!state.project || !files || !files.length) return;
    showToast(`در حال آپلود ${files.length} فایل...`, 4000);
    try {
      let lastUploaded = null;
      for (const file of files) {
        const fd = new FormData();
        fd.append('role', role);
        fd.append('file', file);
        const res = await api(`/api/projects/${state.project.id}/upload`, { method: 'POST', body: fd });
        state.project.media = res.media;
        lastUploaded = res.file;
      }
      // If user uploaded screenshots and active beat has no image yet, auto-attach for immediate visual preview!
      if (role === 'screenshot' && lastUploaded && state.project.beats?.[state.activeBeatIndex] && !state.project.beats[state.activeBeatIndex].assetUrl) {
        state.project.beats[state.activeBeatIndex].assetUrl = lastUploaded.url;
      }
      if (role === 'footage') {
        state.catalog = await api('/api/catalog');
        populateFootageSelect();
      }
      renderMediaLists();
      renderBeats();
      updateLivePreview();
      showToast('فایل با موفقیت آپلود و نمایش داده شد!');
    } catch (err) {
      console.error('Upload error:', err);
      showToast('خطا در آپلود فایل: ' + err.message, 5000);
    }
  };

  const handleUpload = (inputId, role) => {
    const inp = $(inputId);
    if (!inp) return;
    inp.addEventListener('change', async (e) => {
      await uploadFiles(e.target.files, role);
      e.target.value = '';
    });
    const dz = inp.closest('.dropzone');
    if (dz) {
      dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.style.borderColor = 'var(--primary)'; });
      dz.addEventListener('dragleave', () => { dz.style.borderColor = ''; });
      dz.addEventListener('drop', async (e) => {
        e.preventDefault();
        dz.style.borderColor = '';
        if (e.dataTransfer?.files?.length) await uploadFiles(e.dataTransfer.files, role);
      });
    }
  };
  handleUpload('upSource', 'source');
  handleUpload('upLogo', 'logo');
  handleUpload('upShots', 'screenshot');
  handleUpload('upRefs', 'reference');
  handleUpload('upFootage', 'footage');

  $('btnBuildFromScript').addEventListener('click', async () => {
    if (!state.project) return;
    const script = $('inpScriptText').value.trim();
    if (!script) return showToast('ابتدا موضوع یا متن سناریو را در کادر بنویس');
    try {
      const res = await api(`/api/projects/${state.project.id}/from-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
      });
      state.project = res.state;
      state.activeBeatIndex = 0;
      syncProjectToUI();
      $('briefOutput').value = res.brief || '';
      showToast(`${res.beatsCount} سکانس واقعی دقیقاً از روی سناریوی تو ساخته شد!`, 4000);
    } catch (err) {
      showToast('خطا: ' + err.message);
    }
  });

  $('btnTighten').addEventListener('click', async () => {
    if (!state.project) return;
    const logBox = $('analyzeLog');
    logBox.style.display = 'block';
    logBox.textContent = 'در حال حذف خودکار سکوت‌ها و مکث‌های اضافه (tighten.py)...\n';
    try {
      const { jobId } = await api(`/api/projects/${state.project.id}/tighten`, { method: 'POST' });
      pollJob(jobId, logBox, async () => {
        state.project = await api(`/api/projects/${state.project.id}`);
        renderMediaLists();
        showToast('مکث‌های اضافه با موفقیت حذف شدند!');
      });
    } catch (err) {
      logBox.textContent += `خطا: ${err.message}`;
      showToast(err.message);
    }
  });

  $('btnAnalyze').addEventListener('click', async () => {
    if (!state.project) return;
    const model = $('optWhisperModel').value;
    const logBox = $('analyzeLog');
    logBox.style.display = 'block';
    logBox.textContent = 'در حال اجرای Whisper و استخراج زمان‌بندی گفتار...\n';
    try {
      const { jobId } = await api(`/api/projects/${state.project.id}/analyze?lang=fa&model=${model}`, { method: 'POST' });
      pollJob(jobId, logBox, async (job) => {
        state.project = await api(`/api/projects/${state.project.id}`);
        syncProjectToUI();
        showToast(`تحلیل گفتار کامل شد! ${state.project.beats.length} سکانس ساخته شد.`);
      });
    } catch (err) {
      logBox.textContent += `خطا: ${err.message}`;
      showToast(err.message);
    }
  });
}

function renderMediaLists() {
  const m = state.project?.media || {};
  if (m.source) {
    const isVid = /\.(mp4|mov|webm|mkv)$/i.test(m.source.name || '');
    $('listSource').innerHTML = `
      <div style="width:100%; text-align:center;" onclick="event.preventDefault(); event.stopPropagation();">
        <span class="file-chip"><i class="iconsax sm" icon-name="music"></i> ${escapeAttr(m.source.name)}</span>
        ${isVid
          ? `<video src="${m.source.url}" controls muted style="width:100%; max-height:130px; border-radius:8px; margin-top:6px; background:#000;"></video>`
          : `<audio src="${m.source.url}" controls style="width:100%; height:32px; margin-top:6px;"></audio>`}
      </div>`;
  } else {
    $('listSource').innerHTML = '';
  }

  $('listLogo').innerHTML = m.logo
    ? `<span class="file-chip"><img src="${m.logo.url}" style="width:24px; height:24px; object-fit:contain; border-radius:4px;" /> ${escapeAttr(m.logo.name)}</span>`
    : '';

  $('listShots').innerHTML = (m.screenshots || []).map((s) => `
    <span class="file-chip" title="${escapeAttr(s.name)}">
      <img src="${s.url}" style="width:30px; height:30px; object-fit:cover; border-radius:5px; border:1px solid var(--border);" />
      ${escapeAttr(s.name.slice(0, 18))}
    </span>`).join('');

  $('listRefs').innerHTML = (m.references || []).map((r) => `<span class="file-chip"><i class="iconsax sm" icon-name="star"></i> ${escapeAttr(r.name)}</span>`).join('');
  if ($('listFootages')) $('listFootages').innerHTML = (m.footages || []).map((f) => `<span class="file-chip"><i class="iconsax sm" icon-name="video"></i> ${escapeAttr(f.name)}</span>`).join('');
}

// ---------------- Storyboard Beats ----------------

function renderBeats() {
  const list = $('beatList');
  const beats = state.project?.beats || [];
  const shots = state.project?.media?.screenshots || [];
  const sfxList = state.catalog?.assets?.sfx || [];

  list.innerHTML = beats.map((b, idx) => `
    <div class="beat-card ${idx === state.activeBeatIndex ? 'active' : ''}" data-beat-idx="${idx}">
      <div class="beat-head">
        <span class="beat-num">سکانس ${idx + 1} (${b.t}s تا ${b.end}s)</span>
        <div style="display:flex; gap:5px; flex-wrap:wrap;">
          <button class="btn sm ghost" data-action="up" title="انتقال به بالا"><i class="iconsax sm" icon-name="arrow-up"></i></button>
          <button class="btn sm ghost" data-action="down" title="انتقال به پایین"><i class="iconsax sm" icon-name="arrow-down"></i></button>
          <button class="btn sm ghost" data-action="dup" title="کپی سکانس"><i class="iconsax sm" icon-name="copy"></i></button>
          <button class="btn sm ghost" data-action="focus">پیش‌نمایش</button>
          <button class="btn sm ghost" data-action="delete" style="color:#dc2626;">حذف</button>
        </div>
      </div>
      <div class="form-grid">
        <div class="field"><label>شروع (ثانیه)</label><input type="number" step="0.1" data-k="t" value="${b.t}" /></div>
        <div class="field"><label>پایان (ثانیه)</label><input type="number" step="0.1" data-k="end" value="${b.end}" /></div>
        <div class="field"><label>تیتر روی صفحه</label><input type="text" data-k="headline" value="${escapeAttr(b.headline || '')}" /></div>
        <div class="field"><label>واژهٔ کلیدی کادردار</label><input type="text" data-k="keyword" value="${escapeAttr(b.keyword || '')}" /></div>
        <div class="field">
          <label>نوع چیدمان / انیمیشن</label>
          <select data-k="visualType">
            <option value="auto" ${!b.visualType || b.visualType === 'auto' ? 'selected' : ''}>خودکار (پیشنهاد هوش مصنوعی)</option>
            <option value="card-ribbon" ${b.visualType === 'card-ribbon' ? 'selected' : ''}>کارت شناور + خط منحنی پشت</option>
            <option value="ui-showcase" ${b.visualType === 'ui-showcase' ? 'selected' : ''}>نمایش تعاملی اسکرین‌شات محصول</option>
            <option value="compare" ${b.visualType === 'compare' ? 'selected' : ''}>مقایسه دو کارت (قبل و بعد)</option>
            <option value="counter" ${b.visualType === 'counter' ? 'selected' : ''}>شمارنده عدد بزرگ</option>
            <option value="icon-focus" ${b.visualType === 'icon-focus' ? 'selected' : ''}>تمرکز روی آیکون ۳ بعدی / لوگو</option>
            <option value="kinetic-text" ${b.visualType === 'kinetic-text' ? 'selected' : ''}>تایپوگرافی جنبشی تمام‌صفحه</option>
          </select>
        </div>
        <div class="field">
          <label>تصویر / اسکرین‌شات سکانس</label>
          <select data-k="assetUrl">
            <option value="">خودکار (پیشنهاد هوش مصنوعی)</option>
            ${shots.map((s) => `<option value="${s.url}" ${b.assetUrl === s.url ? 'selected' : ''}>${s.name}</option>`).join('')}
            ${b.assetUrl && !shots.some((s) => s.url === b.assetUrl) ? `<option value="${b.assetUrl}" selected>المان انتخاب‌شده (${b.assetUrl.split('/').pop()})</option>` : ''}
          </select>
        </div>
        <div class="field">
          <label>افکت صوتی ورود</label>
          <select data-k="sfx">
            <option value="">خودکار (پیشنهاد هوش مصنوعی)</option>
            <option value="none" ${b.sfx === 'none' ? 'selected' : ''}>بدون صدا (ساکت)</option>
            ${sfxList.map((sf) => `<option value="${sf.name}" ${b.sfx === sf.name ? 'selected' : ''}>${sf.name}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>ترنزیشن به این سکانس</label>
          <select data-k="transition">
            <option value="auto" ${!b.transition || b.transition === 'auto' ? 'selected' : ''}>خودکار (پیشنهاد هوش مصنوعی)</option>
            <option value="push" ${b.transition === 'push' ? 'selected' : ''}>اسکرول فضایی</option>
            <option value="circles" ${b.transition === 'circles' ? 'selected' : ''}>دایره‌ای (Iris)</option>
            <option value="zoom" ${b.transition === 'zoom' ? 'selected' : ''}>زوم</option>
            <option value="dissolve" ${b.transition === 'dissolve' ? 'selected' : ''}>دیزالو</option>
          </select>
        </div>
      </div>
      <div class="form-grid" style="margin-top:8px;">
        <div class="field">
          <label>کارگردانی اسکرین‌شات (زوم، حرکت و سه‌بعدی)</label>
          <select data-k="screenMotion">
            <option value="auto" ${!b.screenMotion || b.screenMotion === 'auto' ? 'selected' : ''}>خودکار (پیشنهاد هوش مصنوعی)</option>
            <option value="zoom-in-click" ${b.screenMotion === 'zoom-in-click' ? 'selected' : ''}>تمام‌صفحه + زوم روی هدف + موس و کلیک</option>
            <option value="tilt-3d-click" ${b.screenMotion === 'tilt-3d-click' ? 'selected' : ''}>زاویه سه‌بعدی پرسپکتیو (Z/Y) + موس و کلیک</option>
            <option value="zoom-out-reveal" ${b.screenMotion === 'zoom-out-reveal' ? 'selected' : ''}>زوم‌اوت سینمایی از جزئیات به کل صفحه</option>
            <option value="pan-glide" ${b.screenMotion === 'pan-glide' ? 'selected' : ''}>حرکت نرم دوربین (Pan) روی صفحه</option>
            <option value="card" ${b.screenMotion === 'card' ? 'selected' : ''}>کارت شناور کلاسیک</option>
          </select>
        </div>
        <div class="field"><label>نقطه زوم X (%)</label><input type="number" min="0" max="100" data-k="focusX" value="${b.focusX ?? 50}" /></div>
        <div class="field"><label>نقطه زوم Y (%)</label><input type="number" min="0" max="100" data-k="focusY" value="${b.focusY ?? 42}" /></div>
        <div class="field" style="display:flex; align-items:end; gap:8px; flex-wrap:wrap;">
          <label class="hybrid-pill ${b.tilt3d ? 'on' : ''}"><input type="checkbox" data-k="tilt3d" ${b.tilt3d ? 'checked' : ''} /> زاویه سه‌بعدی</label>
          <label class="hybrid-pill ${b.cursorClick ? 'on' : ''}"><input type="checkbox" data-k="cursorClick" ${b.cursorClick ? 'checked' : ''} /> موس و کلیک</label>
        </div>
      </div>
      <div class="form-grid" style="margin-top:8px;">
        <div class="field"><label>متن گفتار در این بازه</label><input type="text" data-k="spoken" value="${escapeAttr(b.spoken || '')}" /></div>
        <div class="field"><label>دستور اختصاصی به هوش مصنوعی برای این سکانس</label><input type="text" data-k="aiNote" value="${escapeAttr(b.aiNote || '')}" placeholder="مثلاً: روی دکمه ثبت‌نام زوم کن و کلیک موس بزن..." /></div>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.beat-card').forEach((card) => {
    const idx = Number(card.dataset.beatIdx);
    card.addEventListener('click', (e) => {
      const act = e.target.dataset.action;
      if (act === 'delete') {
        state.project.beats.splice(idx, 1);
        state.activeBeatIndex = Math.max(0, state.activeBeatIndex - 1);
        renderBeats();
        updateLivePreview();
        return;
      }
      if (act === 'up' && idx > 0) {
        const arr = state.project.beats;
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
        state.activeBeatIndex = idx - 1;
        renderBeats();
        updateLivePreview();
        return;
      }
      if (act === 'down' && idx < state.project.beats.length - 1) {
        const arr = state.project.beats;
        [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
        state.activeBeatIndex = idx + 1;
        renderBeats();
        updateLivePreview();
        return;
      }
      if (act === 'dup') {
        const copy = JSON.parse(JSON.stringify(state.project.beats[idx]));
        copy.id = `b${Date.now().toString().slice(-4)}`;
        copy.t = Number(copy.end || 0);
        copy.end = +(copy.t + 3.5).toFixed(1);
        state.project.beats.splice(idx + 1, 0, copy);
        state.activeBeatIndex = idx + 1;
        renderBeats();
        updateLivePreview();
        return;
      }
      if (state.activeBeatIndex !== idx) {
        state.activeBeatIndex = idx;
        list.querySelectorAll('.beat-card').forEach((c, i) => c.classList.toggle('active', i === idx));
        updateLivePreview(true);
      }
    });
    card.querySelectorAll('[data-k]').forEach((inp) => {
      const evName = inp.type === 'checkbox' ? 'change' : 'input';
      inp.addEventListener(evName, () => {
        const k = inp.dataset.k;
        state.project.beats[idx][k] = inp.type === 'checkbox' ? inp.checked : (inp.type === 'number' ? Number(inp.value) : inp.value);
        if (inp.type === 'checkbox') inp.closest('.hybrid-pill')?.classList.toggle('on', inp.checked);
        if (idx === state.activeBeatIndex) updateLivePreview();
      });
    });
  });
}

$('btnAddBeat').addEventListener('click', () => {
  if (!state.project) return;
  const beats = state.project.beats;
  const lastEnd = beats.length ? Number(beats[beats.length - 1].end || 0) : 0;
  beats.push({
    id: `b${beats.length + 1}`,
    t: lastEnd,
    end: +(lastEnd + 4.0).toFixed(1),
    spoken: '',
    headline: `عنوان سکانس ${beats.length + 1}`,
    keyword: 'نکته کلیدی',
    visualType: 'auto',
    assetUrl: '',
    transition: 'auto',
    sfx: '',
    aiNote: '',
  });
  state.activeBeatIndex = beats.length - 1;
  renderBeats();
  updateLivePreview();
});

// ---------------- Local & Online Asset Picker ----------------

function bindAssetPanels() {
  document.querySelectorAll('#assetTabs .pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#assetTabs .pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const t = pill.dataset.atab;
      $('assetPanel3d').style.display = t === '3d' ? 'grid' : 'none';
      $('assetPanelSvg').style.display = t === 'svg' ? 'grid' : 'none';
      $('assetPanelOnline').style.display = t === 'online' ? 'block' : 'none';
      $('assetPanelSfx').style.display = t === 'sfx' ? 'block' : 'none';
    });
  });

  $('btnSearchIcons').addEventListener('click', searchOnlineIcons);
  $('onlineIconQuery').addEventListener('keydown', (e) => { if (e.key === 'Enter') searchOnlineIcons(); });
}

function renderLocalAssets() {
  const a = state.catalog.assets;
  $('assetPanel3d').innerHTML = (a.icons3d || []).map((ic) => `
    <div class="icon-tile" data-url="${ic.url}" title="${ic.name}">
      <img src="${ic.url}" alt="${ic.name}" loading="lazy" />
      <span>${ic.name}</span>
    </div>`).join('');

  $('assetPanelSvg').innerHTML = (a.iconsSvg || []).map((ic) => `
    <div class="icon-tile" data-url="${ic.url}" title="${ic.name}">
      <img src="${ic.url}" alt="${ic.name}" loading="lazy" />
      <span>${ic.name.replace(/^(solar|logos)_/, '')}</span>
    </div>`).join('');

  [$('assetPanel3d'), $('assetPanelSvg')].forEach((container) => {
    container.querySelectorAll('.icon-tile').forEach((tile) => {
      tile.addEventListener('click', () => assignAssetToActiveBeat(tile.dataset.url));
    });
  });

  $('sfxList').innerHTML = (a.sfx || []).map((sf) => `
    <button class="file-chip" style="cursor:pointer;" data-sfx-name="${sf.name}" data-sfx-url="${sf.url}">
      <i class="iconsax sm" icon-name="volume-high"></i> ${sf.name}
    </button>`).join('');

  $('sfxList').querySelectorAll('[data-sfx-url]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const player = $('sfxPlayer');
      player.src = btn.dataset.sfxUrl;
      player.play().catch(() => {});
      if (state.project && state.project.beats[state.activeBeatIndex]) {
        state.project.beats[state.activeBeatIndex].sfx = btn.dataset.sfxName;
        renderBeats();
        showToast(`صدای «${btn.dataset.sfxName}» روی سکانس ${state.activeBeatIndex + 1} تنظیم شد`);
      }
    });
  });
}

async function searchOnlineIcons() {
  const q = $('onlineIconQuery').value.trim();
  if (q.length < 2) return;
  const grid = $('onlineIconGrid');
  grid.innerHTML = '<div style="padding:12px; color:var(--muted);">در حال جستجو در ۲۰۰,۰۰۰ آیکون...</div>';
  try {
    const { icons } = await api(`/api/icons/search?q=${encodeURIComponent(q)}`);
    if (!icons.length) {
      grid.innerHTML = '<div style="padding:12px; color:var(--muted);">آیکونی پیدا نشد</div>';
      return;
    }
    grid.innerHTML = icons.map((ic) => `
      <div class="icon-tile" data-icon-id="${ic.id}" title="کلیک برای دانلود و انتخاب">
        <img src="${ic.previewUrl}" alt="${ic.name}" loading="lazy" style="" />
        <span>${ic.name}</span>
      </div>`).join('');

    grid.querySelectorAll('.icon-tile').forEach((tile) => {
      tile.addEventListener('click', async () => {
        showToast('در حال دانلود آیکون داخل پروژه...');
        const res = await api('/api/icons/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ iconId: tile.dataset.iconId }),
        });
        assignAssetToActiveBeat(res.url);
      });
    });
  } catch (err) {
    grid.innerHTML = `<div style="padding:12px; color:#dc2626;">${err.message}</div>`;
  }
}

function assignAssetToActiveBeat(url) {
  if (!state.project || !state.project.beats[state.activeBeatIndex]) return;
  state.project.beats[state.activeBeatIndex].assetUrl = url;
  renderBeats();
  updateLivePreview();
  showToast(`المان روی سکانس ${state.activeBeatIndex + 1} قرار گرفت`);
}

// ---------------- Live 9:16 Phone Preview ----------------

function triggerTransitionPreview(kind, customBadgeText = null) {
  const phone = $('phoneFrame');
  const cls = `tr-${normalizeTransitionOption(kind)}`;
  phone.classList.remove('tr-push', 'tr-circles', 'tr-zoom', 'tr-glitch', 'tr-dissolve', 'tr-paper', 'anim-beat', 'anim-karo', 'anim-wiggle');
  void phone.offsetWidth;
  phone.classList.add(cls);
  const mb = $('phoneModeBadge');
  mb.textContent = customBadgeText || `تست ترنزیشن: ${kind}`;
  mb.style.display = 'block';
  clearTimeout(mb._t);
  mb._t = setTimeout(() => {
    phone.classList.remove(cls);
    if (!customBadgeText) mb.style.display = 'none';
  }, 1300);
}

function updateFootageOverlayPreview() {
  const vid = $('phoneFootageVideo');
  if (!vid || !state.project) return;
  const fx = state.project.options?.footageFx || 'none';
  const op = state.project.options?.footageOpacity ?? 0.45;
  if (!fx || fx === 'none') {
    vid.pause();
    vid.style.display = 'none';
    return;
  }
  const item = (state.catalog?.assets?.footage || []).find((f) => f.name === fx);
  if (!item) {
    vid.style.display = 'none';
    return;
  }
  if (!vid.src.endsWith(item.url)) vid.src = item.url;
  vid.style.opacity = String(op);
  vid.style.mixBlendMode = state.project.options?.footageBlend || 'screen';
  vid.style.display = 'block';
  vid.play().catch(() => {});
}

function previewSpecialScene(kind) {
  if (!state.project) return;
  const opts = state.project.options || {};
  const br = state.project.brand || {};
  const phone = $('phoneFrame');
  const mb = $('phoneModeBadge');
  const hl = $('previewHeadline');
  const kw = $('previewKeyword');
  const img = $('previewImg');
  const ph = $('previewPlaceholder');
  const centerCard = $('previewCenter');

  updateLivePreview(false);

  if (kind === 'intro') {
    const st = opts.introStyle || 'none';
    if (st === 'none') return showToast('اینترو روی حالت «بدون اینترو» است');
    $('previewBeatLabel').textContent = `پیش‌نمایش اینترو (${opts.introDur ?? 2.0}s)`;
    $('previewCaption').textContent = '';
    hl.textContent = st === 'question-hook' ? 'می‌دونستی؟' : (state.project.title || 'شروع ویژه');
    const kwVal = st === 'kinetic-hook' ? (state.project.cover?.badge || 'آماده‌ای؟') : (br.handle || 'معرفی سریع');
    kw.textContent = kwVal;
    kw.style.direction = kwVal.startsWith('@') ? 'ltr' : 'rtl';
    kw.style.display = 'inline-block';
    if (st === 'kinetic-hook') {
      centerCard.style.display = 'none';
    } else {
      centerCard.style.display = 'flex';
      if (state.project.media?.logo?.url) { img.src = state.project.media.logo.url; img.style.display = 'block'; ph.style.display = 'none'; }
    }
    triggerTransitionPreview(st === 'iris-reveal' ? 'circles' : 'zoom', `پیش‌نمایش اینترو: ${st}`);
  } else {
    const st = opts.outroStyle || 'none';
    if (st === 'none') return showToast('اوترو روی حالت «بدون اوترو» است');
    $('previewBeatLabel').textContent = `پیش‌نمایش اوترو (${opts.outroDur ?? 2.8}s)`;
    $('previewCaption').textContent = '';
    centerCard.style.display = 'flex';
    const ctaW = opts.outroCtaWord || 'نیاس';
    const ctaSub = opts.outroSubtitle || 'رو کامنت کن تا لینک برات بیاد';
    if (st === 'comment-cta') {
      hl.textContent = ctaW;
      kw.textContent = ctaSub;
      kw.style.direction = 'rtl';
      kw.style.display = 'inline-block';
      centerCard.style.transform = 'translateX(-34%) scale(1.04)';
    } else if (st === 'follow-save-cta') {
      hl.textContent = 'ذخیره کن و فالو یادت نره';
      const v = br.handle || ctaW;
      kw.textContent = v;
      kw.style.direction = v.startsWith('@') ? 'ltr' : 'rtl';
      kw.style.display = 'inline-block';
      centerCard.style.transform = 'none';
    } else {
      hl.textContent = state.project.title || ctaW;
      const v = br.handle || '';
      kw.textContent = v;
      kw.style.direction = v.startsWith('@') ? 'ltr' : 'rtl';
      kw.style.display = v ? 'inline-block' : 'none';
      centerCard.style.transform = 'none';
    }
    triggerTransitionPreview('push', `پیش‌نمایش اوترو: ${st}`);
  }
  clearTimeout(phone._resetSpecial);
  phone._resetSpecial = setTimeout(() => {
    mb.style.display = 'none';
    updateLivePreview(false);
  }, 2800);
}

function updateLivePreview(animate = false) {
  if (!state.project) return;
  const b = state.project.beats[state.activeBeatIndex] || {};
  const br = state.project.brand || {};
  const opts = state.project.options || {};

  $('previewBeatLabel').textContent = `سکانس ${state.activeBeatIndex + 1} (${b.t ?? 0}s تا ${b.end ?? 4}s)`;
  $('previewStyleBadge').textContent = state.project.style;

  const phone = $('phoneFrame');
  $('previewCenter').style.display = 'flex';
  $('previewCenter').style.transform = 'none';
  if (animate) {
    const mpId = opts.motionPreset || 'smooth-quart';
    const mpObj = (state.catalog?.motionPresets || []).find((x) => x.id === mpId);
    const animCls = mpObj?.kind === 'elastic-bounce' ? 'anim-karo' : (mpObj?.kind === 'wiggle-shake' ? 'anim-wiggle' : 'anim-beat');
    phone.classList.remove('anim-beat', 'anim-karo', 'anim-wiggle', 'tr-push', 'tr-circles', 'tr-zoom', 'tr-glitch', 'tr-dissolve', 'tr-paper');
    void phone.offsetWidth;
    phone.classList.add(animCls);
    clearTimeout(phone._animClear);
    phone._animClear = setTimeout(() => phone.classList.remove(animCls), 750);
  }
  updateFootageOverlayPreview();
  const bgHex = br.bg || '#F4F5F2';
  phone.style.background = bgHex;

  // Adapt center card surface and text readability to light vs dark themes
  const isDarkBg = (() => {
    const h = bgHex.replace('#', '');
    if (h.length !== 6) return false;
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), bl = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * bl) < 130;
  })();
  const txtHex = br.text || (isDarkBg ? '#F8FAFC' : '#262B2E');
  const isDarkTxt = (() => {
    const h = txtHex.replace('#', '');
    if (h.length !== 6) return false;
    return (0.299 * parseInt(h.slice(0,2),16) + 0.587 * parseInt(h.slice(2,4),16) + 0.114 * parseInt(h.slice(4,6),16)) < 110;
  })();
  phone.style.color = (isDarkBg && isDarkTxt) ? '#F8FAFC' : txtHex;
  const centerCard = $('previewCenter');
  centerCard.style.background = isDarkBg ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.94)';
  centerCard.style.border = isDarkBg ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(0,0,0,0.06)';
  centerCard.style.backdropFilter = isDarkBg ? 'blur(12px)' : 'none';

  $('phoneRibbon').style.display = opts.flowlineRibbon ? 'block' : 'none';
  $('phoneRibbonPath').setAttribute('stroke', br.primary || '#007AFF');

  const showCorners = opts.cornerBlurAccents;
  $('phoneCornerTR').style.display = showCorners ? 'block' : 'none';
  $('phoneCornerBL').style.display = showCorners ? 'block' : 'none';
  $('phoneCornerTR').style.background = br.text || '#262B2E';
  $('phoneCornerBL').style.background = br.text || '#262B2E';

  const scaleMul = { sm: 0.85, md: 1.0, lg: 1.18, xl: 1.34 }[opts.fontScale || 'md'] || 1.0;
  // Apply live Aspect Ratio on preview frame
  const arMap = { '9:16': ['9 / 16', 'min(530px, calc(100vh - 170px))', 'auto'], '4:5': ['4 / 5', 'auto', '290px'], '1:1': ['1 / 1', 'auto', '290px'], '16:9': ['16 / 9', 'auto', '305px'] };
  const [arVal, arH, arW] = arMap[opts.aspectRatio || '9:16'] || arMap['9:16'];
  phone.style.aspectRatio = arVal;
  phone.style.height = arH;
  phone.style.width = arW;

  const topBlock = phone.querySelector('.phone-top');
  const bottomBlock = phone.querySelector('.phone-bottom');

  // Apply real Headline Position (top / top-right / center / bottom / none)
  const hlPos = opts.headlinePos || 'top';
  topBlock.style.display = hlPos === 'none' ? 'none' : 'block';
  topBlock.style.textAlign = hlPos === 'top-right' ? 'right' : 'center';
  if (hlPos === 'top' || hlPos === 'top-right') {
    topBlock.style.order = '1'; centerCard.style.order = '2'; bottomBlock.style.order = '3';
  } else if (hlPos === 'center') {
    centerCard.style.order = '1'; topBlock.style.order = '2'; bottomBlock.style.order = '3';
  } else {
    centerCard.style.order = '1'; bottomBlock.style.order = '2'; topBlock.style.order = '3';
  }

  const hl = $('previewHeadline');
  const hlText = b.headline || 'عنوان سکانس';
  const tAnim = opts.textAnimStyle || 'classic-rise';
  hl.style.fontFamily = `'${br.displayFont || 'Hasti'}', 'Peyda', sans-serif`;
  hl.style.fontSize = `${Math.round(20 * scaleMul)}px`;
  if (tAnim === 'word-unblur' || tAnim === 'emphasis-word' || tAnim === 'word-pop' || tAnim === 'typewriter') {
    const words = hlText.split(/\s+/).filter(Boolean);
    const longest = words.reduce((a, c) => (c.length >= a.length ? c : a), '');
    hl.innerHTML = words.map((w, wi) => {
      const delay = (wi * 0.14).toFixed(2);
      if (tAnim === 'word-unblur') {
        return `<span class="hl-word unblur-anim" style="animation-delay:${delay}s;">${escapeAttr(w)}</span>`;
      }
      if (tAnim === 'emphasis-word') {
        const isEmph = w === longest;
        return isEmph
          ? `<span class="hl-word emph-big" style="color:${br.primary || '#007AFF'}; background:rgba(37,99,235,0.14);">${escapeAttr(w)}</span>`
          : `<span class="hl-word">${escapeAttr(w)}</span>`;
      }
      return `<span class="hl-word pop-anim" style="animation-delay:${delay}s;">${escapeAttr(w)}</span>`;
    }).join(' ');
  } else {
    hl.textContent = hlText;
  }

  const kw = $('previewKeyword');
  const tMode = opts.textMode || 'keywords';
  kw.textContent = b.keyword || '';
  kw.style.direction = (b.keyword || '').startsWith('@') ? 'ltr' : 'rtl';
  kw.style.display = (b.keyword && (tMode === 'keywords' || tMode === 'both')) ? 'inline-block' : 'none';
  kw.style.background = br.accent || '#F8D146';
  const acHex = (br.accent || '#F8D146').replace('#', '');
  const acDark = acHex.length === 6 && (0.299 * parseInt(acHex.slice(0,2),16) + 0.587 * parseInt(acHex.slice(2,4),16) + 0.114 * parseInt(acHex.slice(4,6),16)) < 145;
  kw.style.color = acDark ? '#FFFFFF' : '#111827';
  kw.style.fontFamily = `'${br.displayFont || 'Hasti'}', 'Peyda', sans-serif`;
  kw.style.fontSize = `${Math.round(16 * scaleMul)}px`;

  const handleEl = $('previewHandle');
  if (br.handle && br.handle.trim()) {
    handleEl.textContent = br.handle.trim();
    handleEl.style.fontFamily = `'${br.bodyFont || 'Pinar'}', 'Peyda', sans-serif`;
    handleEl.className = `phone-handle pos-${br.handlePos || 'tr'}`;
    handleEl.style.display = 'block';
  } else {
    handleEl.style.display = 'none';
  }

  const img = $('previewImg');
  const ph = $('previewPlaceholder');
  ph.style.fontFamily = `'${br.bodyFont || 'Pinar'}', 'Peyda', sans-serif`;
  const chosenUrl = b.assetUrl || state.project.media?.logo?.url || '';
  const smode = b.screenMotion || 'auto';
  const isFullScreenMode = smode === 'zoom-in-click' || smode === 'zoom-out-reveal' || smode === 'pan-glide' || smode === 'tilt-3d-click';
  const is3dTilt = b.tilt3d !== undefined ? !!b.tilt3d : (smode === 'tilt-3d-click');
  const showCursor = b.cursorClick !== undefined ? !!b.cursorClick : (smode === 'zoom-in-click' || smode === 'tilt-3d-click');

  centerCard.classList.toggle('screen-fullbleed', isFullScreenMode && !!chosenUrl);
  centerCard.classList.toggle('screen-tilt3d', is3dTilt && !!chosenUrl);

  if (chosenUrl) {
    img.src = chosenUrl;
    img.style.display = 'block';
    ph.style.display = 'none';
    if (isFullScreenMode) {
      const fx = b.focusX ?? 50;
      const fy = b.focusY ?? 42;
      img.style.transformOrigin = `${fx}% ${fy}%`;
      img.style.transform = smode === 'zoom-in-click' || smode === 'tilt-3d-click' ? 'scale(1.38)' : (smode === 'pan-glide' ? 'scale(1.28) translateX(-6%)' : 'scale(1.05)');
    } else {
      img.style.transform = 'none';
    }
  } else {
    img.style.display = 'none';
    ph.style.display = 'block';
  }

  const curEl = $('previewCursorSim');
  if (curEl) {
    if (showCursor && chosenUrl) {
      curEl.style.display = 'block';
      curEl.style.left = `${b.focusX ?? 50}%`;
      curEl.style.top = `${b.focusY ?? 42}%`;
    } else {
      curEl.style.display = 'none';
    }
  }

  // Apply Caption Text, Body Font, Caption Visual Style, Text Reveal Effects & Caption Position
  const capEl = $('previewCaption');
  const capStyle = normalizeCaptionOption(opts.captions || 'none');
  const showCap = (tMode === 'captions' || tMode === 'description' || tMode === 'both' || capStyle !== 'none');
  const capText = showCap ? (b.spoken || 'نمونه زیرنویس گفتار') : '';
  capEl.style.fontFamily = `'${br.bodyFont || 'Pinar'}', 'Peyda', sans-serif`;
  capEl.className = `phone-caption-bar ${capStyle !== 'none' ? 'cap-' + capStyle : ''}`;
  if (capText && (tAnim === 'word-unblur' || tAnim === 'emphasis-word' || tAnim === 'word-pop' || tAnim === 'typewriter')) {
    const cWords = capText.split(/\s+/).filter(Boolean);
    const cLongest = cWords.reduce((a, c) => (c.length >= a.length ? c : a), '');
    capEl.innerHTML = cWords.map((w, wi) => {
      const delay = (wi * 0.12).toFixed(2);
      if (tAnim === 'word-unblur') {
        return `<span class="hl-word unblur-anim" style="animation-delay:${delay}s;">${escapeAttr(w)}</span>`;
      }
      if (tAnim === 'emphasis-word') {
        const isEmph = w === cLongest;
        return isEmph
          ? `<span class="hl-word emph-big" style="color:${br.accent || '#F8D146'}; font-size:1.25em;">${escapeAttr(w)}</span>`
          : `<span class="hl-word">${escapeAttr(w)}</span>`;
      }
      return `<span class="hl-word pop-anim" style="animation-delay:${delay}s;">${escapeAttr(w)}</span>`;
    }).join(' ');
  } else {
    capEl.textContent = capText;
  }
  const capPos = opts.captionPos || 'bottom-safe';
  if (capPos === 'top') {
    topBlock.appendChild(capEl);
  } else if (capPos === 'below-card') {
    centerCard.appendChild(capEl);
  } else {
    bottomBlock.appendChild(capEl);
  }

  // Apply Frame Layout visual indicator (A / B / E / D / C)
  const faceMock = $('previewFaceMock');
  const lay = state.project.layout || 'C';
  if (lay === 'E') {
    faceMock.textContent = 'نیمه پایین: ویدیوی چهره سخنران (Split E)';
    faceMock.style.display = 'block'; faceMock.style.order = '4';
    centerCard.style.minHeight = '105px';
  } else if (lay === 'B') {
    faceMock.textContent = 'پنجره کوچک چهره سخنران (Window B)';
    faceMock.style.display = 'block'; faceMock.style.order = '4';
    centerCard.style.minHeight = '120px';
  } else if (lay === 'A') {
    faceMock.textContent = 'پس‌زمینه: ویدیوی تمام‌صفحه چهره (Overlay A)';
    faceMock.style.display = 'block'; faceMock.style.order = '4';
    centerCard.style.minHeight = '125px';
  } else if (lay === 'D') {
    faceMock.textContent = 'موتور سه‌بعدی و موشن Remotion (3D D)';
    faceMock.style.display = 'block'; faceMock.style.order = '4';
    centerCard.style.minHeight = '135px';
  } else {
    faceMock.style.display = 'none';
    centerCard.style.minHeight = '155px';
  }
}

// ---------------- Save, Brief & Render ----------------

async function saveAndRefreshBrief(toast = false) {
  if (!state.project) return;
  const res = await api(`/api/projects/${state.project.id}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state.project),
  });
  $('briefOutput').value = res.brief;
  if (toast) showToast('پروژه، plan.json و بریف هوش مصنوعی ذخیره شد!');
  return res;
}

function bindExportButtons() {
  $('btnRefreshBrief').addEventListener('click', () => saveAndRefreshBrief(true));
  $('btnCopyBrief').addEventListener('click', async () => {
    await saveAndRefreshBrief(false);
    await navigator.clipboard.writeText($('briefOutput').value);
    showToast('بریف کامل کپی شد! حالا مستقیم توی چت هوش مصنوعی پیست کن.');
  });

  const runRender = async (mode) => {
    await saveAndRefreshBrief(false);
    const engine = $('optRenderEngine')?.value || 'auto';
    const logBox = $('renderLog');
    logBox.style.display = 'block';
    logBox.textContent = `شروع عملیات ${mode} (موتور: ${engine})...\n`;
    try {
      const { jobId } = await api(`/api/projects/${state.project.id}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, engine, previewTimes: [0.8, 3.0] }),
      });
      pollJob(jobId, logBox, (job) => {
        const outs = job.result?.outputs || {};
        let html = '';
        if (outs.preview) html += `<img src="${outs.preview}" style="max-width:100%; border-radius:12px; border:1px solid var(--border);" />`;
        if (outs.video) html += `<video src="${outs.video}" controls style="width:100%; max-height:480px; border-radius:12px; margin-top:10px;"></video>`;
        $('renderResult').innerHTML = html || '<div style="color:#16a34a;">بررسی با موفقیت انجام شد (بدون خطا).</div>';
        showToast(`عملیات ${mode} با موفقیت تمام شد!`);
      });
    } catch (err) {
      logBox.textContent += `خطا: ${err.message}`;
    }
  };

  $('btnRenderCheck').addEventListener('click', () => runRender('check'));
  $('btnRenderPreview').addEventListener('click', () => runRender('preview'));
  $('btnRenderFull').addEventListener('click', () => runRender('full'));

  $('btnMakeCover').addEventListener('click', async () => {
    if (!state.project) return;
    await saveAndRefreshBrief(false);
    try {
      const res = await api(`/api/projects/${state.project.id}/cover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line1: $('coverLine1').value.trim(),
          line2: $('coverLine2').value.trim(),
          badge: $('coverBadge').value.trim(),
        }),
      });
      $('coverResult').innerHTML = `
        <div style="display:flex; gap:14px; align-items:flex-start; flex-wrap:wrap;">
          <img src="${res.coverUrl}" style="width:200px; border-radius:14px; border:1px solid var(--border-strong);" />
          <div>
            <div style="color:#16a34a; font-weight:700; margin-bottom:8px;">کاور ۱۰۸۰×۱۹۲۰ با موفقیت ساخته شد!</div>
            <a href="${res.coverUrl}" download="cover.jpg" class="btn primary sm">دانلود cover.jpg</a>
          </div>
        </div>`;
      showToast('کاور اینستاگرام آماده شد!');
    } catch (err) {
      showToast('خطا در ساخت کاور: ' + err.message);
    }
  });
}

function pollJob(jobId, logBox, onDone) {
  const wrap = $('renderProgressWrap');
  const fill = $('renderProgressFill');
  const pctEl = $('renderProgressPct');
  if (wrap && logBox === $('renderLog')) {
    wrap.style.display = 'block';
    fill.style.width = '4%';
    pctEl.textContent = '4%';
  }
  const timer = setInterval(async () => {
    try {
      const job = await api(`/api/jobs/${jobId}`);
      logBox.textContent = job.log || 'در حال اجرا...';
      if (wrap && logBox === $('renderLog') && typeof job.progress === 'number') {
        fill.style.width = `${job.progress}%`;
        pctEl.textContent = `${job.progress}%`;
      }
      if (job.status === 'done') {
        clearInterval(timer);
        if (wrap && logBox === $('renderLog')) { fill.style.width = '100%'; pctEl.textContent = '100%'; }
        onDone(job);
      } else if (job.status === 'error') {
        clearInterval(timer);
        logBox.textContent += `\nERROR: ${job.error}`;
        showToast('خطا در اجرا — لاگ را ببین');
      }
    } catch (e) {
      clearInterval(timer);
    }
  }, 900);
}

function getTotalDuration() {
  const beats = state.project?.beats || [];
  const dInfo = Number(state.project?.sourceInfo?.duration || 0);
  const dBeats = beats.reduce((mx, b) => Math.max(mx, Number(b.end || 0)), 0);
  return Math.max(4, dInfo, dBeats);
}

function bindTimelineControls() {
  const scrubber = $('timelineScrubber');
  const btn = $('btnPlayPreview');

  scrubber.addEventListener('input', () => {
    state.playTime = Number(scrubber.value);
    const audio = $('sourceAudioPlayer');
    if (audio.src && !isNaN(audio.duration)) audio.currentTime = Math.min(state.playTime, audio.duration);
    syncPlayheadToBeat(state.playTime);
  });

  btn.addEventListener('click', () => {
    if (state.isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  });
}

function startPlayback() {
  const total = getTotalDuration();
  $('timelineScrubber').max = total.toFixed(2);
  if (state.playTime >= total - 0.05) state.playTime = 0;

  const audio = $('sourceAudioPlayer');
  const srcUrl = state.project?.media?.source?.url;
  if (srcUrl) {
    if (!audio.src.endsWith(srcUrl)) audio.src = srcUrl;
    audio.currentTime = state.playTime;
    audio.play().catch(() => {});
  }

  state.isPlaying = true;
  state.lastTick = performance.now();
  $('btnPlayPreview').innerHTML = '<i class="iconsax sm" icon-name="pause"></i> توقف';

  const loop = (now) => {
    if (!state.isPlaying) return;
    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;
    if (srcUrl && !audio.paused && !isNaN(audio.currentTime)) {
      state.playTime = audio.currentTime;
    } else {
      state.playTime += dt;
    }
    const maxDur = getTotalDuration();
    if (state.playTime >= maxDur) {
      state.playTime = maxDur;
      syncPlayheadToBeat(state.playTime);
      stopPlayback();
      return;
    }
    syncPlayheadToBeat(state.playTime);
    state.rafId = requestAnimationFrame(loop);
  };
  state.rafId = requestAnimationFrame(loop);
}

function stopPlayback() {
  state.isPlaying = false;
  if (state.rafId) cancelAnimationFrame(state.rafId);
  const audio = $('sourceAudioPlayer');
  if (audio) audio.pause();
  const btn = $('btnPlayPreview');
  if (btn) btn.innerHTML = '<i class="iconsax sm" icon-name="play"></i> پخش';
}

function syncPlayheadToBeat(t) {
  $('timelineScrubber').value = t.toFixed(2);
  $('timelineClock').textContent = `${t.toFixed(1)}s`;
  const beats = state.project?.beats || [];
  let idx = 0;
  for (let i = 0; i < beats.length; i++) {
    if (t >= Number(beats[i].t || 0)) idx = i;
  }
  if (idx !== state.activeBeatIndex) {
    state.activeBeatIndex = idx;
    document.querySelectorAll('.beat-card').forEach((c, i) => c.classList.toggle('active', i === idx));
    updateLivePreview(true);
  }
}

function syncProjectToUI() {
  const p = state.project;
  if (!p) return;
  if ($('projectSwitcher')) $('projectSwitcher').value = p.id;
  $('timelineScrubber').max = getTotalDuration().toFixed(2);
  $('projectTitle').value = p.title || '';
  $('optLayout').value = p.layout || 'C';
  $('colPrimary').value = p.brand.primary || '#007AFF';
  $('valPrimary').textContent = (p.brand.primary || '#007AFF').toUpperCase();
  $('colAccent').value = p.brand.accent || '#F8D146';
  $('valAccent').textContent = (p.brand.accent || '#F8D146').toUpperCase();
  $('colBg').value = p.brand.bg || '#F4F5F2';
  $('valBg').textContent = (p.brand.bg || '#F4F5F2').toUpperCase();
  $('colText').value = p.brand.text || '#262B2E';
  $('valText').textContent = (p.brand.text || '#262B2E').toUpperCase();
  $('optDisplayFont').value = p.brand.displayFont || 'Hasti';
  $('optBodyFont').value = p.brand.bodyFont || 'Pinar';
  $('optTransition').value = normalizeTransitionOption(p.options.transition || 'push');
  if ($('optMotionPreset')) $('optMotionPreset').value = p.options.motionPreset || 'smooth-quart';
  if ($('optTextAnimStyle')) $('optTextAnimStyle').value = p.options.textAnimStyle || 'classic-rise';
  if ($('optExecMode')) $('optExecMode').value = p.options.executionMode || 'auto';
  if (Array.isArray(p.options.selectedSkills)) {
    document.querySelectorAll('.skill-chk').forEach((c) => {
      c.checked = p.options.selectedSkills.includes(c.value);
    });
  }
  if (window._refreshHybridPills) window._refreshHybridPills();
  $('optCaptions').value = normalizeCaptionOption(p.options.captions || 'none');
  if ($('optTextMode')) $('optTextMode').value = p.options.textMode || 'keywords';
  if ($('optHeadlinePos')) $('optHeadlinePos').value = p.options.headlinePos || 'top';
  if ($('optCaptionPos')) $('optCaptionPos').value = p.options.captionPos || 'bottom-safe';
  if ($('optFontScale')) $('optFontScale').value = p.options.fontScale || 'md';
  if ($('inpHandle')) $('inpHandle').value = p.brand.handle || '';
  if ($('optHandlePos')) $('optHandlePos').value = p.brand.handlePos || 'tr';
  if ($('optFootageFx')) $('optFootageFx').value = p.options.footageFx || 'none';
  if ($('optFootageBlend')) $('optFootageBlend').value = p.options.footageBlend || 'screen';
  if ($('optAspectRatio')) $('optAspectRatio').value = p.options.aspectRatio || '9:16';
  if ($('optFootageOpacity')) {
    $('optFootageOpacity').value = p.options.footageOpacity ?? 0.45;
    $('valFootOp').textContent = Math.round((p.options.footageOpacity ?? 0.45) * 100) + '%';
  }
  if ($('optSfxGain')) $('optSfxGain').value = p.options.sfxGain ?? -4;
  if ($('optIntroStyle')) $('optIntroStyle').value = p.options.introStyle || 'none';
  if ($('optIntroDur')) $('optIntroDur').value = p.options.introDur ?? 2.0;
  if ($('optOutroStyle')) $('optOutroStyle').value = p.options.outroStyle || 'none';
  if ($('optOutroDur')) $('optOutroDur').value = p.options.outroDur ?? 2.8;
  if ($('inpOutroCtaWord')) $('inpOutroCtaWord').value = p.options.outroCtaWord || 'نیاس';
  if ($('inpOutroSubtitle')) $('inpOutroSubtitle').value = p.options.outroSubtitle || 'رو کامنت کن تا لینک برات بیاد';
  if ($('inpScriptText')) $('inpScriptText').value = p.scriptText || '';
  if ($('chkVoiceEnhance')) $('chkVoiceEnhance').checked = p.options.voiceEnhance !== false;
  if ($('chkMusicDucking')) $('chkMusicDucking').checked = p.options.musicDucking !== false;
  if ($('coverLine1')) $('coverLine1').value = p.cover?.line1 || p.title || '';
  if ($('coverLine2')) $('coverLine2').value = p.cover?.line2 || '';
  if ($('coverBadge')) $('coverBadge').value = p.cover?.badge || '';

  if (p.aiAnalysisReport) {
    $('aiReportCard').style.display = 'block';
    $('aiReportEngine').textContent = `موتور اجراکننده: ${p.aiEngineUsed || 'AI Director'}`;
    $('aiReportBody').textContent = p.aiAnalysisReport;
  } else {
    $('aiReportCard').style.display = 'none';
  }
  $('optMusic').value = p.options.music || 'corporate';
  $('optMusicGain').value = p.options.musicGain ?? -20;
  $('chkFlowline').checked = !!p.options.flowlineRibbon;
  $('chkCornerBlur').checked = !!p.options.cornerBlurAccents;
  $('chkSpatialScroll').checked = !!p.options.spatialScroll;
  $('optDesignSystem67').value = p.designSystemRef || '';
  $('freeformDirection').value = p.freeformDirection || '';

  renderStyleGrid();
  renderMediaLists();
  renderBeats();
  updateLivePreview();
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

init().catch((err) => {
  console.error(err);
  showToast('خطا در بارگذاری استودیو: ' + err.message, 5000);
});
