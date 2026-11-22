/* Flagship Essay Audio Edition Player (v3.4):
   Ultra-slim Swiss hairline inline bar + synced 6-chapter markers + quiet sticky bottom dock while listening.
   Clean, restrained, zero self-conscious voice boilerplate. */

const D = document;
const $ = (s, r = D) => r.querySelector(s);

const DEFAULT_CHAPTERS = [
  { id: 'thesis', num: '00', title: 'The first bottleneck', start: 0, end: 76 },
  { id: 'causal-chain', num: '01', title: 'Demand comes first', start: 77, end: 159 },
  { id: 'private-evals', num: '02', title: 'Private evals as core IP', start: 160, end: 400 },
  { id: 'shared-benchmarks', num: '03', title: 'Shared benchmarks', start: 401, end: 563 },
  { id: 'sovereignty', num: '04', title: 'Sovereignty & “our frontier”', start: 564, end: 862 },
  { id: 'monday-morning', num: '05', title: 'Monday morning playbook', start: 863, end: 1132 },
];

const SPEEDS = [1, 1.25, 1.5, 2];

function fmtTime(sec) {
  const s = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function playIcon() {
  return `<svg class="au-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6L13 8z" fill="currentColor"/></svg>`;
}

function pauseIcon() {
  return `<svg class="au-ic" viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="3.2" width="2.8" height="9.6" rx="0.8" fill="currentColor"/><rect x="9.2" y="3.2" width="2.8" height="9.6" rx="0.8" fill="currentColor"/></svg>`;
}

async function probeAudio(audioSrc, manifestSrc) {
  let manifest = null;
  if (manifestSrc) {
    try {
      const mr = await fetch(manifestSrc, { cache: 'no-cache' });
      if (mr.ok) manifest = await mr.json();
    } catch {
      manifest = null;
    }
  }
  try {
    const ar = await fetch(audioSrc, { method: 'HEAD', cache: 'no-cache' });
    if (ar.ok) return { ready: true, manifest };
  } catch {
    // Fallback below
  }
  return { ready: false, manifest };
}

function extractChapterSpeechText(chapterId) {
  const sec = D.getElementById(chapterId);
  if (!sec) return '';
  const pieces = [];
  sec.querySelectorAll(':scope > p, :scope > .es-h2-wrap h2, :scope > h3, :scope > blockquote, :scope > ol.es-num-list li').forEach((el) => {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('button.cite, .sec-link').forEach((b) => b.remove());
    const t = clone.textContent.replace(/\s+/g, ' ').trim();
    if (t) pieces.push(t);
  });
  return pieces.join(' ');
}

export async function initEssayAudio({ live }) {
  const host = $('#essay-audio');
  if (!host) return;

  const audioSrc = host.dataset.audioSrc;
  const manifestSrc = host.dataset.audioManifest;
  const audioDeclaredReady = host.dataset.audioReady === 'true';
  const previewParam = new URLSearchParams(location.search).get('audio-preview') === '1';

  if (!audioDeclaredReady && !previewParam) {
    host.hidden = true;
    return;
  }

  const probe = audioDeclaredReady
    ? await probeAudio(audioSrc, manifestSrc)
    : { ready: false, manifest: null };
  const isStudio = probe.ready;
  const isPreview = !isStudio && previewParam;

  if (!isStudio && !isPreview) {
    host.hidden = true;
    return;
  }

  const chapters = (probe.manifest && Array.isArray(probe.manifest.chapters) && probe.manifest.chapters.length)
    ? probe.manifest.chapters
    : DEFAULT_CHAPTERS;

  let duration = (probe.manifest && Number(probe.manifest.duration)) || chapters[chapters.length - 1].end || 1132;
  let currentTime = 0;
  let pendingSeek = null;
  let speedIdx = 0;
  let playing = false;
  let hasStarted = false;
  let dockDismissed = false;
  let previewTimer = null;
  let speechActive = false;

  const audio = isStudio ? new Audio(audioSrc) : null;
  if (audio) {
    audio.preload = 'metadata';
  }

  host.hidden = false;
  host.classList.toggle('is-preview', isPreview);
  host.innerHTML = `
    <div class="au-bar">
      <button type="button" class="au-play" data-au-play aria-label="Listen to this essay" aria-pressed="false">
        ${playIcon()}
      </button>
      <span class="au-k">Listen</span>
      <div class="au-track-wrap">
        <div class="au-track">
          <div class="au-fill" data-au-fill style="width:0%"></div>
          <div class="au-ticks" data-au-ticks aria-hidden="true"></div>
        </div>
        <input type="range" class="au-range" data-au-range min="0" max="${Math.round(duration)}" step="1" value="0" aria-label="Audio playback position">
      </div>
      <span class="au-time mono" data-au-time>00:00 / ${fmtTime(duration)}</span>
      <div class="au-utils">
        <button type="button" class="au-speed mono" data-au-speed aria-label="Playback speed: 1x">1×</button>
        <button type="button" class="au-ch-btn" data-au-ch-toggle aria-expanded="false" aria-controls="au-chapters">
          <span>Chapters</span>
          <svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 6 8 10.5 12.5 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
    <div class="au-chapters" id="au-chapters" hidden>
      <ol class="au-ch-list" data-au-ch-list></ol>
    </div>
  `;

  // Quiet sticky bottom dock (visible only while listening after scrolling past the top strip)
  const dock = D.createElement('aside');
  dock.className = 'au-dock';
  dock.setAttribute('aria-label', 'Audio playback controls');
  dock.hidden = true;
  dock.innerHTML = `
    <div class="au-dock-in">
      <button type="button" class="au-play au-play-sm" data-dock-play aria-label="Play or pause audio" aria-pressed="false">
        ${playIcon()}
      </button>
      <div class="au-dock-info">
        <span class="au-dock-t" data-dock-ch>${chapters[0].num} · ${chapters[0].title}</span>
        <div class="au-dock-prog"><i data-dock-fill style="width:0%"></i></div>
      </div>
      <span class="au-dock-time mono" data-dock-time>00:00 / ${fmtTime(duration)}</span>
      <button type="button" class="au-speed au-speed-sm mono" data-dock-speed aria-label="Playback speed">1×</button>
      <button type="button" class="au-dock-close" data-dock-close aria-label="Hide floating audio bar">
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
    </div>
  `;
  D.body.appendChild(dock);

  const playBtn = $('[data-au-play]', host);
  const dockPlayBtn = $('[data-dock-play]', dock);
  const fillEl = $('[data-au-fill]', host);
  const dockFillEl = $('[data-dock-fill]', dock);
  const ticksEl = $('[data-au-ticks]', host);
  const rangeEl = $('[data-au-range]', host);
  const timeEl = $('[data-au-time]', host);
  const dockTimeEl = $('[data-dock-time]', dock);
  const dockChEl = $('[data-dock-ch]', dock);
  const speedBtn = $('[data-au-speed]', host);
  const dockSpeedBtn = $('[data-dock-speed]', dock);
  const chToggle = $('[data-au-ch-toggle]', host);
  const chDrawer = $('#au-chapters', host);
  const chList = $('[data-au-ch-list]', host);

  function renderTicksAndChapters() {
    ticksEl.innerHTML = chapters.slice(1).map((c) => {
      const pct = Math.max(0, Math.min(100, (c.start / Math.max(1, duration)) * 100));
      return `<i style="left:${pct.toFixed(2)}%"></i>`;
    }).join('');

    chList.innerHTML = chapters.map((c, idx) => `
      <li>
        <button type="button" class="au-ch-item" data-ch-idx="${idx}">
          <span class="au-ch-n mono">${c.num}</span>
          <span class="au-ch-t">${c.title}</span>
          <span class="au-ch-s mono">${fmtTime(c.start)}</span>
        </button>
      </li>
    `).join('');

    chList.querySelectorAll('.au-ch-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.chIdx);
        const ch = chapters[idx];
        if (!ch) return;
        seekTo(ch.start, true);
        chDrawer.hidden = true;
        chToggle.setAttribute('aria-expanded', 'false');
        const target = D.getElementById(ch.id);
        if (target) {
          target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        }
        live(`Jumped to ${ch.num} ${ch.title}`);
      });
    });
  }

  function activeChapterIndex(t) {
    let idx = 0;
    for (let i = 0; i < chapters.length; i++) {
      if (t >= chapters[i].start - 0.5) idx = i;
    }
    return idx;
  }

  function syncUI() {
    const pct = Math.max(0, Math.min(100, (currentTime / Math.max(1, duration)) * 100));
    fillEl.style.width = `${pct.toFixed(2)}%`;
    dockFillEl.style.width = `${pct.toFixed(2)}%`;
    rangeEl.max = String(Math.round(duration));
    rangeEl.value = String(Math.round(currentTime));

    const tStr = `${fmtTime(currentTime)} / ${fmtTime(duration)}`;
    timeEl.textContent = tStr;
    dockTimeEl.textContent = tStr;

    const idx = activeChapterIndex(currentTime);
    const ch = chapters[idx];
    dockChEl.textContent = `${ch.num} · ${ch.title}`;

    chList.querySelectorAll('.au-ch-item').forEach((btn, i) => {
      btn.classList.toggle('on', i === idx);
    });

    const icon = playing ? pauseIcon() : playIcon();
    playBtn.innerHTML = icon;
    dockPlayBtn.innerHTML = icon;
    playBtn.setAttribute('aria-pressed', String(playing));
    dockPlayBtn.setAttribute('aria-pressed', String(playing));
    playBtn.setAttribute('aria-label', playing ? 'Pause audio edition' : 'Listen to this essay');
    dockPlayBtn.setAttribute('aria-label', playing ? 'Pause audio edition' : 'Listen to this essay');

    const sp = `${SPEEDS[speedIdx]}×`;
    speedBtn.textContent = sp;
    dockSpeedBtn.textContent = sp;
    speedBtn.setAttribute('aria-label', `Playback speed: ${sp}`);
    dockSpeedBtn.setAttribute('aria-label', `Playback speed: ${sp}`);

    updateDockVisibility();
  }

  function stopPreviewSpeech() {
    if (previewTimer) {
      clearInterval(previewTimer);
      previewTimer = null;
    }
    if (speechActive && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch { /* noop */ }
      speechActive = false;
    }
  }

  function startPreviewPlayback() {
    stopPreviewSpeech();
    const ch = chapters[activeChapterIndex(currentTime)];
    if ('speechSynthesis' in window) {
      try {
        const text = extractChapterSpeechText(ch.id);
        if (text) {
          const u = new SpeechSynthesisUtterance(text.slice(0, 1200));
          u.rate = SPEEDS[speedIdx];
          u.onend = () => { speechActive = false; };
          speechActive = true;
          window.speechSynthesis.speak(u);
        }
      } catch {
        speechActive = false;
      }
    }
    previewTimer = setInterval(() => {
      if (!playing) return;
      currentTime = Math.min(duration, currentTime + SPEEDS[speedIdx]);
      if (currentTime >= duration) pause();
      syncUI();
    }, 1000);
  }

  function play() {
    hasStarted = true;
    dockDismissed = false;
    if (isStudio && audio) {
      audio.playbackRate = SPEEDS[speedIdx];
      audio.play().then(() => {
        playing = true;
        syncUI();
        updateMediaSession();
      }).catch(() => {
        playing = false;
        syncUI();
      });
    } else if (isPreview) {
      playing = true;
      startPreviewPlayback();
      syncUI();
    }
  }

  function pause() {
    playing = false;
    if (isStudio && audio) audio.pause();
    else stopPreviewSpeech();
    syncUI();
    updateMediaSession();
  }

  function togglePlay() {
    if (playing) pause();
    else play();
  }

  function seekTo(sec, autoPlay = false) {
    currentTime = Math.max(0, Math.min(duration, sec));
    if (isStudio && audio) {
      if (audio.readyState >= 1) {
        try { audio.currentTime = currentTime; } catch { pendingSeek = currentTime; }
      } else {
        pendingSeek = currentTime;
        audio.load();
      }
    } else if (isPreview && playing) {
      startPreviewPlayback();
    }
    if (autoPlay && !playing) play();
    else syncUI();
  }

  function cycleSpeed() {
    speedIdx = (speedIdx + 1) % SPEEDS.length;
    if (isStudio && audio) audio.playbackRate = SPEEDS[speedIdx];
    else if (isPreview && playing) startPreviewPlayback();
    syncUI();
    live(`Playback speed ${SPEEDS[speedIdx]}x`);
  }

  function updateMediaSession() {
    if (!('mediaSession' in navigator) || !isStudio) return;
    const ch = chapters[activeChapterIndex(currentTime)];
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Africa’s Biggest AI Bottleneck (${ch.num} · ${ch.title})`,
        artist: 'Njenga Kariuki',
        album: 'njenga.ai',
        artwork: [{ src: '../../og/africa-ai-bottleneck.png', sizes: '1200x630', type: 'image/png' }],
      });
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
      navigator.mediaSession.setActionHandler('play', () => play());
      navigator.mediaSession.setActionHandler('pause', () => pause());
      navigator.mediaSession.setActionHandler('seekbackward', () => seekTo(currentTime - 15));
      navigator.mediaSession.setActionHandler('seekforward', () => seekTo(currentTime + 15));
    } catch { /* ignore */ }
  }

  let topBarVisible = true;
  function updateDockVisibility() {
    const show = hasStarted && !dockDismissed && !topBarVisible;
    dock.hidden = !show;
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      topBarVisible = entries[0] ? entries[0].isIntersecting : true;
      updateDockVisibility();
    }, { threshold: 0.05 });
    io.observe(host);
  }

  playBtn.addEventListener('click', togglePlay);
  dockPlayBtn.addEventListener('click', togglePlay);
  speedBtn.addEventListener('click', cycleSpeed);
  dockSpeedBtn.addEventListener('click', cycleSpeed);
  $('[data-dock-close]', dock).addEventListener('click', () => {
    dockDismissed = true;
    updateDockVisibility();
  });

  rangeEl.addEventListener('input', () => seekTo(Number(rangeEl.value), false));

  chToggle.addEventListener('click', () => {
    const open = chDrawer.hidden;
    chDrawer.hidden = !open;
    chToggle.setAttribute('aria-expanded', String(open));
  });

  if (audio) {
    audio.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        duration = audio.duration;
        renderTicksAndChapters();
      }
      if (pendingSeek !== null) {
        const target = Math.max(0, Math.min(duration, pendingSeek));
        pendingSeek = null;
        try { audio.currentTime = target; currentTime = target; } catch { /* noop */ }
      }
      syncUI();
    });
    audio.addEventListener('timeupdate', () => {
      currentTime = audio.currentTime;
      syncUI();
    });
    audio.addEventListener('ended', () => {
      playing = false;
      currentTime = 0;
      syncUI();
    });
  }

  renderTicksAndChapters();
  syncUI();
}
