/* Njenga Kariuki: the site's one script (v1, 4 November 2026). The header, pictures that fade in at their final size,
   the home page's walk through the work (one tile at a time, A3), a chapter's product seen working (B1), the part
   list, the Sources list and the modules (loaded as they near the screen, F3). Everything works without it. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const mq = (q) => window.matchMedia(q);
  const reduce = mq('(prefers-reduced-motion: reduce)');
  const conn = navigator.connection || {};
  const lean = () => conn.saveData || /(^|-)2g|3g/.test(conn.effectiveType || '');
  const still = () => reduce.matches || lean();
  const live = (t) => { const l = $('#live'); if (!l) return; l.textContent = ''; setTimeout(() => { l.textContent = t; }, 60); };

  /* ---------------------------------------------------------------- pictures: wake, fade in, fail plainly (F3) */
  function wake(view) {
    if (!view || view.dataset.awake) return;
    view.dataset.awake = '1';
    $$('[data-srcset]', view).forEach((el) => { el.setAttribute('srcset', el.dataset.srcset); el.removeAttribute('data-srcset'); });
    $$('img[data-src]', view).forEach((el) => { el.src = el.dataset.src; el.removeAttribute('data-src'); });
  }
  function settle(img) {
    if (img.dataset.settled) return;
    img.dataset.settled = '1';
    const done = () => img.classList.add('in');
    if (img.complete && img.naturalWidth) done();
    else {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', () => {
        const v = img.closest('.view, .plate');
        if (v && !$('.m-fail', v)) { const p = document.createElement('p'); p.className = 'm-fail'; p.textContent = 'This picture did not load.'; v.appendChild(p); }
      }, { once: true });
    }
  }
  $$('img.pic').forEach(settle);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n.querySelectorAll && $$('img.pic', n).forEach(settle)))).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('load', (e) => { if (e.target.matches && e.target.matches('img.pic')) e.target.classList.add('in'); }, true);

  function film(view) {
    const v = $('video', view);
    if (!v) return null;
    if (!v.src && v.dataset.src) { v.src = v.dataset.src; }
    return v;
  }

  /* ---------------------------------------------------------------- the interim site's addresses (1 to 4 November 2026) still land */
  if (location.hash.length > 1 && $('[data-walk]')) {
    const h = location.hash.slice(1);
    const W = { m05: 'alexa-shopping', m06: 'halo', m07: 'halo-body', m08: 'halo-tone', m09: 'halo-movement', m10: 'health-ai-portfolio', m11: 'map-view', m13: 'ai-index-2025', m14: 'bio-discovery', m15: 'm-pesa' };
    const m = h.match(/^(?:cr-|vp-|vt-)?(m\d\d)/);
    let to = null;
    if (h === 'credits') to = 'credits/';
    else if (/^cr-m\d\d$/.test(h) && W[m[1]]) to = 'credits/#' + W[m[1]];
    else if (m && W[m[1]]) to = W[m[1]] + '/';
    else if (h === 'about' || h === 'bio' || h === 'contact') to = 'about/';
    if (to) location.replace(to);
  }

  /* ---------------------------------------------------------------- the header (A9) */
  const hd = $('[data-hd]');
  if (hd) {
    const onScroll = () => hd.classList.toggle('scrolled', window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const name = $('[data-ch-name]');
    const here = $('[data-top]', hd);
    if (name && here && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        const away = !e.isIntersecting && e.boundingClientRect.top < 0;
        hd.classList.toggle('away', away);
        here.tabIndex = away ? 0 : -1;
        here.setAttribute('aria-hidden', away ? 'false' : 'true');
      }, { rootMargin: '-60px 0px 0px 0px' }).observe(name);
      here.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: still() ? 'auto' : 'smooth' });
        name.focus({ preventScroll: true });
      });
    }
  }

  /* ---------------------------------------------------------------- a set of views with a marker (tile or hero) */
  function Views(root, opts = {}) {
    const plate = $('.plate', root);
    const views = $$('.view', plate);
    const btns = $$('.marks button', root);
    const cap = $('.cap[data-cap]', root);
    const HOLD = opts.hold || 2500, FILM_MAX = 12000;
    let cur = 0, raf = 0, playing = false, onDone = null, elapsed = 0, last = 0;
    const setP = (k, p) => { if (btns[k]) btns[k].style.setProperty('--p', String(p)); };
    const vid = (k) => $('video', views[k]);
    function show(k, how) {
      k = (k + views.length) % views.length;
      if (k === cur && how !== 'force') return;
      wake(views[k]);
      const pv = vid(cur);
      if (pv && k !== cur) pv.pause();
      views.forEach((v, i) => v.classList.toggle('on', i === k));
      btns.forEach((b, i) => { b.setAttribute('aria-pressed', i === k ? 'true' : 'false'); b.style.setProperty('--p', i < k ? '1' : '0'); });
      cur = k;
      if (cap && views[k].dataset.cap !== undefined) cap.textContent = views[k].dataset.cap;
      if (k + 1 < views.length) wake(views[k + 1]);
    }
    function length() {
      const f = vid(cur);
      if (!f) return HOLD;
      const d = (f.duration && isFinite(f.duration)) ? f.duration * 1000 : 10000;
      return opts.filmPasses ? d * opts.filmPasses : Math.min(FILM_MAX, d);
    }
    function run() {
      cancelAnimationFrame(raf);
      const f = vid(cur);
      if (f) { film(views[cur]); f.loop = true; const p = f.play(); if (p && p.catch) p.catch(() => {}); }
      last = performance.now();
      const tick = (now) => {
        if (!playing) return;
        elapsed += now - last; last = now;
        const L = length();
        setP(cur, Math.min(1, elapsed / L));
        if (elapsed >= L) { advance(); return; }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    function advance() {
      cancelAnimationFrame(raf);
      setP(cur, 1);
      elapsed = 0;
      if (cur + 1 < views.length) { show(cur + 1); run(); return; }
      playing = false;
      const f = vid(cur); if (f) f.pause();
      // back to the lead view: nothing stays off its lead (A3)
      setTimeout(() => { show(0, 'force'); btns.forEach((b) => b.style.setProperty('--p', '0')); const cb = onDone; onDone = null; if (cb) cb(); }, 300);
    }
    return {
      root, views, btns,
      get n() { return views.length; },
      get cur() { return cur; },
      get playing() { return playing; },
      moving: views.length > 1 || views.some((v) => v.hasAttribute('data-film')),
      play(done) { if (!this.moving) { if (done) done(); return; } onDone = done || null; playing = true; elapsed = 0; show(0, 'force'); run(); },
      pause() { if (!playing) return; playing = false; cancelAnimationFrame(raf); const f = vid(cur); if (f) f.pause(); },
      resume() { if (playing || !onDone && elapsed === 0) { if (!playing && elapsed === 0) return; } playing = true; run(); },
      stop() { playing = false; cancelAnimationFrame(raf); onDone = null; elapsed = 0; const f = vid(cur); if (f) f.pause(); },
      show(k, how) { show(k, how); },
      rest() { this.stop(); show(0, 'force'); btns.forEach((b) => b.style.setProperty('--p', '0')); },
    };
  }

  /* ---------------------------------------------------------------- the home page: one tile at a time (A3) */
  const grid = $('[data-walk]');
  if (grid) {
    const tiles = $$('[data-tile]', grid).map((t) => Views(t));
    const toggle = $('[data-walk-toggle]');
    let active = null, k = -1, inView = false, paused = still(), held = null, resumeT = 0, finished = false;
    const setToggle = () => {
      if (!toggle) return;
      const stopped = paused || finished;
      toggle.setAttribute('aria-pressed', stopped ? 'true' : 'false');
      toggle.setAttribute('aria-label', stopped ? 'Play the moving pictures' : 'Pause the moving pictures');
    };
    const visible = (el) => { const r = el.getBoundingClientRect(); const vh = window.innerHeight; return r.top < vh - r.height * 0.4 && r.bottom > r.height * 0.4; };
    function handOver() {
      active = null;
      if (paused || !inView || held || document.hidden) return;
      for (let i = k + 1; i < tiles.length; i += 1) {
        const t = tiles[i];
        if (!t.moving) continue;
        if (!visible(t.root)) continue;
        k = i; active = t;
        t.play(() => { setTimeout(handOver, 600); });
        return;
      }
      // the walk has visited every tile in view once; it rests until the reader asks again
      if (k >= 0 || !tiles.some((t) => t.moving && visible(t.root))) {
        const any = tiles.some((t, i) => i > k && t.moving);
        if (!any) { finished = true; setToggle(); }
      }
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        if (!inView && active) { active.pause(); }
        if (inView && !paused && !held) { if (active) active.resume(); else setTimeout(handOver, 400); }
      }, { threshold: 0.15 }).observe(grid);
      window.addEventListener('scroll', () => { if (!active && inView && !paused && !finished && !held) handOver(); }, { passive: true });
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden && active) active.pause(); else if (!document.hidden && active && !paused && !held) active.resume(); });
    tiles.forEach((t, i) => {
      const hold = () => {
        clearTimeout(resumeT);
        held = t;
        if (active && active !== t) active.pause();
        if (active === t) t.pause();
      };
      const release = () => {
        if (held !== t) return;
        held = null;
        if (active !== t || !t.playing) setTimeout(() => { if (held !== t) t.rest(); }, 300);
        clearTimeout(resumeT);
        resumeT = setTimeout(() => {
          if (held || paused) return;
          if (active && active !== t) active.resume();
          else if (active === t) { active = null; handOver(); }
          else handOver();
        }, 2000);
      };
      t.root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hold(); });
      t.root.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') release(); });
      t.root.addEventListener('focusin', hold);
      t.root.addEventListener('focusout', (e) => { if (!t.root.contains(e.relatedTarget)) release(); });
      t.btns.forEach((b, j) => {
        b.addEventListener('click', (e) => { e.preventDefault(); hold(); if (active === t) { t.stop(); active = null; } t.show(j); const f = $('video', t.views[j]); if (f) { film(t.views[j]); f.loop = true; const p = f.play(); if (p && p.catch) p.catch(() => {}); } live(`Picture ${j + 1} of ${t.n}`); });
        b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { if (active === t) { t.stop(); active = null; } t.show(j); } });
        b.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (j + (e.key === 'ArrowRight' ? 1 : -1) + t.n) % t.n; t.btns[n].focus(); t.btns[n].click(); }
        });
      });
      // the views wake as the tile nears the screen, so the walk never waits on a download
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((es, ob) => es.forEach((e) => { if (e.isIntersecting) { t.views.forEach((v, n) => { if (n < 2) wake(v); }); ob.disconnect(); } }), { rootMargin: '400px' }).observe(t.root);
      }
    });
    if (toggle) {
      toggle.addEventListener('click', () => {
        if (paused || finished) {
          paused = false; finished = false; k = -1;
          if (active) active.stop();
          active = null; setToggle(); live('Pictures playing'); handOver();
        } else {
          paused = true; if (active) active.pause(); setToggle(); live('Pictures paused');
        }
      });
    }
    setToggle();
    reduce.addEventListener && reduce.addEventListener('change', () => { if (reduce.matches) { paused = true; if (active) active.rest(); setToggle(); } });
  }

  /* ---------------------------------------------------------------- a chapter: the product seen working (B1) */
  const heroEl = $('[data-hero]');
  if (heroEl) {
    const h = Views(heroEl, { filmPasses: 3 });
    const tg = $('[data-play-toggle]', heroEl);
    let on = false, pending = 0;
    const setTg = () => { if (tg) { tg.setAttribute('aria-pressed', on ? 'false' : 'true'); } };
    const cancel = () => { if (pending) { clearTimeout(pending); pending = 0; } };
    const start = () => { cancel(); on = true; setTg(); h.play(() => { on = false; setTg(); }); };
    h.btns.forEach((b, j) => b.addEventListener('click', () => {
      cancel(); h.stop(); on = false; setTg(); h.show(j);
      const f = $('video', h.views[j]);
      if (f && !still()) { film(h.views[j]); f.loop = true; const p = f.play(); if (p && p.catch) p.catch(() => {}); on = true; setTg(); }
      live(`Picture ${j + 1} of ${h.n}`);
    }));
    h.btns.forEach((b, j) => b.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (j + (e.key === 'ArrowRight' ? 1 : -1) + h.n) % h.n; h.btns[n].focus(); h.btns[n].click(); }
    }));
    if (tg) tg.addEventListener('click', () => {
      if (on) { cancel(); h.pause(); const f = $('video', h.views[h.cur]); if (f) f.pause(); on = false; }
      else {
        on = true;
        if (h.playing) h.resume();
        else { const f = $('video', h.views[h.cur]); if (f && h.n === 1) { film(h.views[h.cur]); const p = f.play(); if (p && p.catch) p.catch(() => {}); f.loop = true; } else start(); }
      }
      setTg();
    });
    h.views.forEach((v, i) => { if (i < 2) wake(v); });
    if (!still() && h.moving) {
      // the pictures are about to move, so the control offers Pause from the first frame; a press before they start keeps them still
      on = true; setTg();
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([e], ob) => { if (e.isIntersecting) { ob.disconnect(); if (on) pending = setTimeout(() => { pending = 0; if (on) start(); }, 700); } }, { threshold: 0.5 }).observe(heroEl);
      } else start();
      document.addEventListener('visibilitychange', () => { if (document.hidden && on) h.pause(); else if (!document.hidden && on && h.playing === false && !pending) h.resume(); });
    } else setTg();
  }

  /* ---------------------------------------------------------------- the part list follows the reader (B3) */
  const nav = $('[data-parts]');
  if (nav && 'IntersectionObserver' in window) {
    const links = $$('a', nav);
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const seen = new Map();
    const ob = new IntersectionObserver((es) => {
      es.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.boundingClientRect.top : null));
      let best = null, top = Infinity;
      seen.forEach((t, id) => { if (t !== null && t < top) { top = t; best = id; } });
      if (best) links.forEach((a) => a.setAttribute('aria-current', map.get(best) === a ? 'true' : 'false'));
    }, { rootMargin: '-80px 0px -55% 0px' });
    $$('.part').forEach((p) => ob.observe(p));
    links.forEach((a) => a.addEventListener('click', (e) => {
      const t = document.getElementById(a.getAttribute('href').slice(1));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + t.id);
      const hh = $('h2', t); if (hh) { hh.tabIndex = -1; hh.focus({ preventScroll: true }); }
    }));
  }
  $$('.dec a').forEach((a) => a.addEventListener('click', (e) => {
    const t = document.getElementById(a.getAttribute('href').slice(1));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', '#' + t.id);
    const hh = $('h2', t); if (hh) { hh.tabIndex = -1; hh.focus({ preventScroll: true }); }
  }));

  /* ---------------------------------------------------------------- Sources: open on wide screens, collapsed on the phone (B4) */
  if (mq('(min-width: 1000px)').matches) $$('[data-sources]').forEach((d) => { d.open = true; });

  /* ---------------------------------------------------------------- modules, loaded as they near the screen (F3) */
  const mods = $$('.module[data-script]');
  const load = (m) => {
    if (m.dataset.loaded) return;
    m.dataset.loaded = '1';
    const stage = $('[data-stage]', m);
    const rest = $('.m-rest', stage);
    const slow = setTimeout(() => { if (rest) rest.classList.add('slow'); }, 1500);
    import(m.dataset.script).then((mod) => mod.mount(m, m.dataset.data)).then(() => {
      clearTimeout(slow);
      stage.classList.add('ready');
      if (rest) setTimeout(() => rest.remove(), 400);
    }).catch(() => {
      clearTimeout(slow);
      const t = $('.m-title', m) ? $('.m-title', m).textContent : 'This interactive';
      stage.innerHTML = '';
      stage.style.minHeight = '0';
      const p = document.createElement('p'); p.className = 'm-fail'; p.textContent = `${t} did not load. Its data is in the table below.`;
      stage.appendChild(p);
      const d = $('[data-table]', m); if (d) d.open = true;
    });
  };
  if ('IntersectionObserver' in window) {
    const ob = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { ob.unobserve(e.target); load(e.target); } }), { rootMargin: '600px 0px' });
    mods.forEach((m) => ob.observe(m));
  } else mods.forEach(load);
})();
