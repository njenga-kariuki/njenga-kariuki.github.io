/* Njenga Kariuki: the site's one script (v2, D-042). One motion language: one easing curve; 140 ms for state, 240 for
   movement, 420 for travel, 640 for lines that draw. Lines draw once as they arrive; the plate travels into its chapter;
   nothing moves on arrival. Everything here enhances pages that work without it. Reduced motion is a designed path. */
(() => {
  'use strict';
  const D = document, H = D.documentElement;
  H.classList.add('js');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = D) => r.querySelector(s);
  const $$ = (s, r = D) => Array.from(r.querySelectorAll(s));
  const head = () => parseFloat(getComputedStyle(H).getPropertyValue('--head')) || 56;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const live = t => { const l = $('#live'); if (!l) return; l.textContent = ''; setTimeout(() => { l.textContent = t; }, 60); };
  function glide(y, ms, done) {
    if (RM) { scrollTo(0, y); done && done(); return; }
    const y0 = scrollY, dy = y - y0, t0 = performance.now();
    (function step(now) { const p = Math.min(1, (now - t0) / ms); scrollTo(0, y0 + dy * ease(p)); if (p < 1) requestAnimationFrame(step); else done && done(); })(t0);
  }
  // pressed states on iPhone: Safari applies :active only once the page listens for touches (v2.7, D-058)
  D.addEventListener('touchstart', () => {}, { passive: true });
  const body = D.body;
  const isHome = body.classList.contains('p-home');
  const isChapter = body.classList.contains('p-chapter');

  /* ------------------------------------------------------------ lines and bars draw as they arrive */
  // v2.7 (D-058): every drawing with parts that arrive (.a) draws once, in the order of its mechanism
  const armed = $$('.sec, #tl, .setup, .funnel, .pr-fig, .d-fig, .r-body').concat($$('svg.dw').filter(s => s.querySelector('.a') && !s.closest('.stage, .d-fig, .r-body, .pr-fig')));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.remove('armed');
      if (el.id === 'tl') el.classList.add('drawn');
      io.unobserve(el);
    }), { threshold: 0.2 });
    armed.forEach(s => { if (!RM && s.getBoundingClientRect().top > innerHeight) s.classList.add('armed'); io.observe(s); });
  }
  // printed, every drawing is finished, whether or not it has reached the screen
  addEventListener('beforeprint', () => $$('.armed').forEach(el => { el.classList.remove('armed'); if (el.id === 'tl') el.classList.add('drawn'); }));

  /* ------------------------------------------------------------ copy the address: the site's own selection sweeps across it,
     the control turns to ink with a check, and both return. Where the clipboard is refused, the address is copied through a
     selection, or left selected for the reader. */
  $$('.cpi[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const box = b.closest('.ft-mail'), a = box && $('.mailto', box);
    let ok = false;
    try { await navigator.clipboard.writeText(b.dataset.copy); ok = true; }
    catch (e) {
      if (a) {
        const r = D.createRange(); r.selectNodeContents($('.mt', a) || a); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        try { ok = D.execCommand('copy'); } catch (x) { ok = false; }
        if (ok) sel.removeAllRanges();
      }
    }
    if (!ok) { live('Address selected'); return; }
    live('Address copied');
    clearTimeout(b._t1); clearTimeout(b._t2); clearTimeout(b._t3);
    b.classList.add('done');
    b._t3 = setTimeout(() => b.classList.remove('done'), 1900);
    if (!box) return;
    box.classList.remove('sw', 'out'); void box.offsetWidth;
    box.classList.add('sw');
    b._t1 = setTimeout(() => box.classList.add('out'), RM ? 700 : 1050);
    b._t2 = setTimeout(() => box.classList.remove('sw', 'out'), RM ? 701 : 1400);
  }));
  $$('.cp[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copied'; live('Address copied'); }
    catch (e) { const r = D.createRange(); r.selectNodeContents(b.previousElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Selected'; }
    setTimeout(() => { b.textContent = 'Copy'; }, 1600);
  }));

  /* ------------------------------------------------------------ the work: skim a plate to flip through the product (a cut) */
  function loadViews(plate) {
    $$('img[data-src]', plate).forEach(im => { if (im.dataset.srcset) { im.srcset = im.dataset.srcset; im.removeAttribute('data-srcset'); } im.src = im.dataset.src; im.removeAttribute('data-src'); });
  }
  function show(plate, k) {
    const vs = $$('.v', plate), ts = $$('.skim i', plate);
    if (!vs[k] || vs[k].classList.contains('on')) return;
    vs.forEach((v, j) => v.classList.toggle('on', j === k));
    ts.forEach((t, j) => t.classList.toggle('on', j === k));
    // v2.7: while the skim runs, the plate's third line names the picture; at rest it is the proof again
    const a = plate.closest('.pl-a'), pp = a && $('.pl-p', a);
    if (!pp || !a.dataset.caps) return;
    if (pp._rest == null) pp._rest = pp.innerHTML;
    let caps = []; try { caps = JSON.parse(a.dataset.caps); } catch (e) { caps = []; }
    if (k === 0 || !caps[k]) { pp.innerHTML = pp._rest; pp.classList.remove('cap'); }
    else { pp.textContent = caps[k]; pp.classList.add('cap'); }
  }
  $$('.pl-a').forEach(a => {
    const plate = $('.plate', a);
    const n = $$('.v', plate).length;
    if (n < 2) return;
    a.addEventListener('pointerenter', () => loadViews(plate));
    a.addEventListener('focus', () => loadViews(plate));
    if (FINE) {
      plate.addEventListener('pointermove', e => {
        const r = plate.getBoundingClientRect();
        show(plate, Math.min(n - 1, Math.max(0, Math.floor((e.clientX - r.left) / r.width * n))));
      });
      a.addEventListener('pointerleave', () => show(plate, 0));
    }
    a.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const cur = $$('.v', plate).findIndex(v => v.classList.contains('on'));
      show(plate, (cur + (e.key === 'ArrowRight' ? 1 : n - 1)) % n);
    });
  });

  // the first screen's heads are doors (v2.6, D-055): under the hand, or on keyboard focus, a head lights the plate below it
  $$('.lead.beats .bt').forEach(b => {
    const a = $(`.pl[data-w="${b.dataset.w}"] .pl-a`);
    if (!a) return;
    const on = () => a.classList.add('lit'), off = () => a.classList.remove('lit');
    if (FINE) { b.addEventListener('mouseenter', on); b.addEventListener('mouseleave', off); }
    b.addEventListener('focusin', on); b.addEventListener('focusout', off);
  });

  // (v2.7: the phone's work row and its count are gone; the work is a grid)
  const platesEl = null, wc = null;
  if (platesEl && wc) {
    const count = () => {
      const cards = $$('.pl', platesEl), x0 = platesEl.getBoundingClientRect().left;
      let k = 0, best = Infinity;
      cards.forEach((c, j) => { const d = Math.abs(c.getBoundingClientRect().left - x0 - parseFloat(getComputedStyle(platesEl).scrollPaddingLeft || 0)); if (d < best) { best = d; k = j; } });
      wc.textContent = String(k + 1);
    };
    platesEl.addEventListener('scroll', () => { cancelAnimationFrame(count.f); count.f = requestAnimationFrame(count); }, { passive: true });
  }

  /* ------------------------------------------------------------ the career: one instrument */
  const tl = $('#tl'), dataEl = $('#career-data');
  let R = [], rows = [], lightSet = () => {}, railTick = () => {};
  if (tl && dataEl) {
    R = JSON.parse(dataEl.textContent);
    const T0 = 2012, T1 = 2027, NOW = 2026.85;
    const tlb = $('#tlb'), scrub = $('#scrub'), scrubT = $('#scrubT'), rdRow = $('#rdRow');
    rows = $$('.tl-row[data-id^="m"]', tlb);
    const ARR = '<svg class="arr" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const escH = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    function placeNotes() {
      $$('.tl-note', tlb).forEach(n => {
        const tw = n.parentElement.offsetWidth; if (!tw) return;
        const s = +n.dataset.s, e = +n.dataset.e, w = n.offsetWidth;
        if (s / 100 * tw + w <= tw) { n.style.left = `${s}%`; n.style.right = 'auto'; }
        else { n.style.right = `${100 - e}%`; n.style.left = 'auto'; }
      });
    }
    placeNotes();
    addEventListener('resize', placeNotes);
    let active = null, lockT = 0, backT = 0;
    function readRow(r) {
      rdRow.style.setProperty('--c2', r.c);
      const nm = r.href ? `<a class="nm" href="${r.href}"><span>${escH(r.role)}</span>${ARR}</a>` : `<span class="nm">${escH(r.role)}</span>`;
      const res = r.rs ? `<div class="res"><span class="lbl">${r.now ? 'Now' : 'Result'}</span><p>${escH(r.rs)}</p></div>` : '';
      rdRow.innerHTML = `<div class="rd-l"><span class="y">${escH(r.y)}</span>${nm}<span class="ti">${escH(r.t)}${r.place ? ' · ' + escH(r.place) : ''}</span></div>
        <div class="rd-r"><div><span class="lbl">${r.now ? 'Runs' : 'Ran'}</span><p>${escH(r.ran)}</p></div>${res}</div>`;
    }
    const readSum = () => readRow(R[0]);
    function activate(id) {
      clearTimeout(backT);
      if (active === id) return;
      active = id;
      const r = R.find(x => x.id === id);
      tl.classList.toggle('active', !!r);
      rows.forEach(row => row.classList.toggle('on', row.dataset.id === id));
      $$('.tl-tick', tlb).forEach(t => t.classList.remove('on'));
      tl.classList.remove('recon');
      if (r) readRow(r); else backT = setTimeout(readSum, 260);
    }
    lightSet = (ids, holdMs = 2800) => {
      const list = ids.split(' ');
      active = null; clearTimeout(backT);
      tl.classList.add('active');
      const first = R.find(r => list.includes(r.id)); readRow(first || R[0]);
      rows.forEach(row => row.classList.toggle('on', list.includes(row.dataset.id)));
      const tlp = $('#tlp'); if (tlp) tlp.classList.add('active');
      $$('#tlpl li').forEach(li => li.classList.toggle('lit', list.includes(li.dataset.id)));
      lockT = Date.now() + holdMs;
      clearTimeout(lightSet.t);
      lightSet.t = setTimeout(clearLight, holdMs);
    };
    function clearLight() {
      if (Date.now() < lockT - 20) return;
      tl.classList.remove('active'); rows.forEach(r => r.classList.remove('on'));
      $$('.tl-tick', tlb).forEach(t => t.classList.remove('on'));
      readSum();
      const tlp = $('#tlp'); if (tlp) tlp.classList.remove('active');
      $$('#tlpl li').forEach(li => li.classList.remove('lit'));
    }
    if (FINE) {
      tlb.addEventListener('pointermove', e => {
        const any = $('.tl-track', rows[0]).getBoundingClientRect();
        const x = e.clientX;
        if (x < any.left || x > any.right) { tl.classList.remove('scrubbing'); return; }
        const t = T0 + (x - any.left) / any.width * (T1 - T0);
        tl.classList.add('scrubbing');
        scrub.style.left = (x - tlb.getBoundingClientRect().left) + 'px';
        scrubT.textContent = t > NOW ? 'Today' : Math.floor(t);
        if (Date.now() < lockT) return;
        // the row under the pointer comes first: over a role, its own years read it out, and elsewhere on that row the
        // reading stays put; on the axis or between rows, the role the year falls in
        const y = e.clientY, over = rows.find(rw => { const b = rw.getBoundingClientRect(); return y >= b.top && y < b.bottom; });
        if (over) {
          const ro = R.find(rr => rr.id === over.dataset.id);
          if (ro && t >= ro.s && (t < ro.e || ro.now)) activate(ro.id);
          return;
        }
        const r = R.find(rr => t >= rr.s && t < rr.e) || (t >= NOW ? R[0] : null);
        activate(r ? r.id : null);
      });
      $$('.tl-lab[data-row]', tlb).forEach(l => l.addEventListener('pointerenter', () => { if (Date.now() >= lockT) activate(l.dataset.row); }));
      tlb.addEventListener('pointerleave', () => { tl.classList.remove('scrubbing'); if (Date.now() >= lockT) activate(null); });
      const recLab = $('.tl-rec .tl-lab', tlb);
      if (recLab) {
        recLab.addEventListener('pointerenter', () => {
          if (Date.now() < lockT) return;
          clearTimeout(backT); active = null; tl.classList.add('active', 'recon');
          rows.forEach(r => r.classList.toggle('on', r.dataset.id === 'm06' || r.dataset.id === 'm10' || r.dataset.id === 'm13'));
          $$('.tl-tick', tlb).forEach(t => t.classList.add('on'));
          readRow(R.find(r => r.id === 'm06') || R[0]);
        });
        recLab.addEventListener('pointerleave', () => { if (Date.now() >= lockT) { tl.classList.remove('active', 'recon'); rows.forEach(r => r.classList.remove('on')); $$('.tl-tick', tlb).forEach(t => t.classList.remove('on')); readSum(); } });
      }
    }
    if (!FINE) {
      // touch on a laptop-width chart (a tablet): the first tap on a role reads it out, a second tap opens its chapter
      $$('.tl-lab[data-row]', tlb).forEach(l => {
        let was = false;  // read before the tap's own focus can activate the row
        l.addEventListener('pointerdown', () => { was = active === l.dataset.row; });
        l.addEventListener('click', e => { if (!was) { e.preventDefault(); lockT = 0; activate(l.dataset.row); } was = true; });
      });
      rows.forEach(row => row.addEventListener('click', e => { if (!e.target.closest('a')) { lockT = 0; activate(row.dataset.id); } }));
    }
    $$('.tl-lab[data-row]', tlb).forEach(l => {
      l.addEventListener('focus', () => activate(l.dataset.row));
      l.addEventListener('blur', () => setTimeout(() => { if (!tl.contains(D.activeElement)) activate(null); }, 0));
    });
    tlb.addEventListener('keydown', e => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) return;
      if (e.target !== tlb && e.key === 'Enter') return;
      if (e.key === 'Escape') { activate(null); return; }
      if (e.key === 'Enter') { if (active) { const a = $('a.nm', rdRow); if (a) a.click(); } return; }
      e.preventDefault();
      const ids = R.map(r => r.id);
      let k = ids.indexOf(active);
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') k = k < 0 ? 0 : Math.min(ids.length - 1, k + 1);
      else k = k < 0 ? 0 : Math.max(0, k - 1);
      activate(ids[k]);
    });
    railTick = () => {
      const tlp = $('#tlp');
      if (!tlp || getComputedStyle(tlp).display === 'none') return;
      const lis = $$('#tlpl li'), mid = innerHeight * 0.5;
      let cur = null;
      lis.forEach(li => { const b = li.getBoundingClientRect(); if (b.top < mid && b.bottom > mid) cur = li; });
      lis.forEach(li => li.classList.toggle('on', li === cur));
    };
  }
  /* ------------------------------------------------------------ the career on a phone (v2.7, D-058, change 02): a staircase
     whose rows are tabs; the readout under it shows one role at a time, the current role at rest */
  const cs = $('#cs');
  let csShow = () => {};
  if (cs) {
    const rowsC = $$('.cs-row', cs), panes = $$('.cs-read .r-in', cs);
    csShow = (k, focus) => {
      rowsC.forEach((b, i) => { const on = i === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
      panes.forEach((p, i) => p.classList.toggle('on', i === k));
      if (focus) rowsC[k].focus();
    };
    // a tap reads the role out; when its readout sits below the screen, it rises into view under the thumb
    rowsC.forEach((b, i) => b.addEventListener('click', () => {
      csShow(i);
      const rd = $('.cs-read', cs).getBoundingClientRect();
      const want = Math.min(rd.height, 230);
      if (rd.top + want > innerHeight - 12) glide(scrollY + rd.top + want - innerHeight + 24, 320);
    }));
    $('.cs-rows', cs).addEventListener('keydown', e => {
      const i = rowsC.findIndex(b => b.classList.contains('on'));
      let j = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = Math.min(rowsC.length - 1, i + 1);
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = Math.max(0, i - 1);
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = rowsC.length - 1;
      if (j == null) return;
      e.preventDefault(); csShow(j, true);
    });
    csShow.id = id => { const k = rowsC.findIndex(b => b.dataset.id === id); if (k >= 0) csShow(k); };
  }
  // a figure in the opening lines is a door: it scrolls to the career and lights the roles it comes from
  D.addEventListener('click', e => {
    const f = e.target.closest('[data-light]');
    if (!f || !tl) return;
    e.preventDefault();
    const ids = f.dataset.light;
    const phone = innerWidth < 900;
    const target = phone && cs ? cs : $('#career');
    const y = target.getBoundingClientRect().top + scrollY - head() - (phone ? 24 : 12);
    const lit = () => { if (phone && cs) csShow.id(ids.split(' ')[0]); else lightSet(ids); };
    if (Math.abs(y - scrollY) > 40) glide(y, 450, () => setTimeout(lit, RM ? 0 : 200)); else lit();
  });

  /* ------------------------------------------------------------ the header: one running line holds the reader's place (v2.5, D-053);
     a page's title joins the bar once its heading has scrolled under it: a chapter's name beside "Work", on About the name */
  const hd = $('#hd'), prog = $('#prog'), byline = $('#byline');
  const navs = $$('.hd-nav a[data-nav]');
  const hdNav = $('.hd-nav'), hdLine = $('.hd-line');
  const art = $('article.ch');
  const chH = $('#ch-h'), abH = $('.ab-h1');
  let lineOn = false, lineAt = null;
  function placeLine(jump) {
    if (!hdNav || !hdLine) return;
    const t = navs.find(a => (a.classList.contains('on') || a.getAttribute('aria-current') === 'page') && a.offsetParent);
    if (!t) { if (lineOn) { hdLine.classList.remove('on'); lineOn = false; } lineAt = null; return; }
    if (t === lineAt && !jump) return;
    const first = !lineOn, nr = hdNav.getBoundingClientRect(), r = t.getBoundingClientRect();
    const set = () => { hdLine.style.setProperty('--x', `${r.left - nr.left}px`); hdLine.style.setProperty('--w', `${r.width}px`); };
    // reduced motion: the line does not travel; it fades out and back in at its new place (160 ms in all)
    if (RM && !first && !jump) { hdLine.classList.add('out'); clearTimeout(placeLine.t); placeLine.t = setTimeout(() => { set(); hdLine.classList.remove('out'); }, 80); lineAt = t; return; }
    if (first || jump) hdLine.classList.add('jump');
    set();
    if (first || jump) { void hdLine.offsetWidth; hdLine.classList.remove('jump'); }
    if (first) { lineOn = true; requestAnimationFrame(() => requestAnimationFrame(() => { if (lineOn) hdLine.classList.add('on'); })); }
    lineAt = t;
  }
  function onScroll() {
    if (hd) hd.classList.toggle('edge', scrollY > 8);
    if (isHome) {
      if (byline) hd.classList.toggle('named', byline.getBoundingClientRect().bottom < head());
      let cur = null;
      ['work', 'career', 'lead'].forEach(id => { const s = D.getElementById(id); if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = id; });
      // at the top of the page the reader is on the first screen, not yet in a section: the running line waits (v2.6)
      if (scrollY < 40) cur = null;
      navs.forEach(a => a.classList.toggle('on', a.dataset.nav === cur));
      placeLine(false);
      railTick();
    } else if (isChapter && art && prog) {
      prog.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollY / Math.max(1, art.offsetHeight - innerHeight)))})`;
    }
    // the title rises into the bar with the heading's last 28 px under it, so it reads as the heading carrying on upward
    const rhEl = chH || abH;
    if (hd && rhEl) {
      const p = Math.min(1, Math.max(0, (head() + 20 - rhEl.getBoundingClientRect().bottom) / 28));
      hd.style.setProperty('--rh', p.toFixed(3));
      hd.classList.toggle(chH ? 'rh' : 'named', p >= 1);
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { onScroll(); placeLine(true); });
  placeLine(true);
  if (D.fonts && D.fonts.ready) D.fonts.ready.then(() => placeLine(true));
  // links to the home page's sections from another page arrive at the section, below the bar
  if (isHome && location.hash && location.hash.length > 1) {
    const t = D.getElementById(location.hash.slice(1));
    const h = t && ($('.sec-head', t) || t);
    if (h) requestAnimationFrame(() => scrollTo(0, h.getBoundingClientRect().top + scrollY - head() - 24));
  }

  /* ------------------------------------------------------------ the chapter's opening picture: the film, or the views */
  const PAUSE = '<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="3" y="2.5" width="2.6" height="9" rx="1" fill="currentColor"/><rect x="8.4" y="2.5" width="2.6" height="9" rx="1" fill="currentColor"/></svg>';
  const PLAY = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2.5v9l7.5-4.5z" fill="currentColor"/></svg>';
  $$('.film-plate').forEach(fp => {
    const vid = $('video.film', fp), pp = $('[data-pp]', fp);
    if (!vid) return;
    const setPP = playing => { pp.setAttribute('aria-label', playing ? 'Pause the film' : 'Play the film'); pp.innerHTML = playing ? PAUSE : PLAY; };
    let loaded = false;
    const ensure = () => { if (loaded) return; loaded = true; const s = D.createElement('source'); s.src = vid.dataset.src; s.type = 'video/mp4'; vid.appendChild(s); vid.load(); };
    vid.addEventListener('playing', () => vid.classList.add('on'));
    const play = () => { ensure(); vid.play().then(() => setPP(true)).catch(() => setPP(false)); };
    pp.addEventListener('click', () => { if (vid.paused) play(); else { vid.pause(); setPP(false); } });
    const lean = navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || ''));
    if (!RM && !lean) setTimeout(play, 700); else setPP(false);
    // the film plays only while it is on screen
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting && !vid.paused) { vid.pause(); setPP(false); fp._out = true; } else if (en.isIntersecting && fp._out && !RM) { fp._out = false; play(); } }), { threshold: 0.25 }).observe(fp);
  });
  $$('.ch-fig[data-views]').forEach(fig => {
    const plate = $('.ch-plate', fig), vs = $$('.v', plate), n = vs.length;
    if (n < 2) return;
    let caps = [];
    try { caps = JSON.parse(fig.dataset.caps); } catch (e) { caps = []; }
    const cap = $('[data-cap]', fig), count = $('[data-count]', fig);
    let k = 0;
    const go = j => {
      k = (j + n) % n;
      loadViews(plate);
      vs.forEach((v, i) => v.classList.toggle('on', i === k));
      if (cap) cap.textContent = caps[k] || '';
      if (count) count.textContent = `${k + 1} / ${n}`;
    };
    const prev = $('[data-prev]', fig), next = $('[data-next]', fig);
    if (prev) prev.addEventListener('click', () => go(k - 1));
    if (next) next.addEventListener('click', () => go(k + 1));
    plate.setAttribute('tabindex', '0');
    plate.setAttribute('role', 'group');
    plate.setAttribute('aria-label', 'Pictures. Use the arrow keys to change the picture.');
    plate.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(k + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(k - 1); } });
    // on touch, a swipe across the picture changes it
    let x0 = null;
    plate.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
    plate.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(k + (dx < 0 ? 1 : -1)); });
    plate.addEventListener('pointercancel', () => { x0 = null; });
  });

  /* ------------------------------------------------------------ the stages: the step in view drives the stage (v2.7, D-058).
     One stage per story. A laptop sets it beside the steps; a phone pins the same stage under the header and plays each step
     in place, so no step carries a copy. A drawn stage's own script lives in js/stages/<kind>.js and returns { to(state) }. */
  const PHONE = () => innerWidth < 900;
  function driveSteps(stageEl, to) {
    const steps = $$('.story .step');
    if (!steps.length) return;
    let cur = null, raf = 0;
    const pick = () => {
      raf = 0;
      // the reading line: the middle of the screen on a laptop; on a phone, a little below the pinned stage
      const sb = stageEl.getBoundingClientRect();
      const line = PHONE() ? Math.min(innerHeight * 0.82, Math.max(sb.bottom, head() + 40) + (innerHeight - Math.max(sb.bottom, head())) * 0.28) : innerHeight * 0.5;
      let k = 0;
      steps.forEach((x, i) => { if (x.getBoundingClientRect().top < line) k = i; });
      if (k === cur) return;
      cur = k;
      steps.forEach((x, i) => x.classList.toggle('on', i === k));
      to(steps[k].dataset.s);
    };
    const q = () => { if (!raf) raf = requestAnimationFrame(pick); };
    addEventListener('scroll', q, { passive: true });
    addEventListener('resize', q);
    pick();
    // the stage's rail is a door to each step
    const rail = $('.fs-rail', stageEl);
    if (rail) {
      rail.classList.add('go');
      rail.addEventListener('click', e => {
        const r = rail.getBoundingClientRect();
        const i = Math.min(steps.length - 1, Math.max(0, Math.floor((e.clientX - r.left) / r.width * steps.length)));
        const off = PHONE() ? stageEl.getBoundingClientRect().height + head() + 12 : innerHeight * 0.3;
        glide(steps[i].getBoundingClientRect().top + scrollY - off, 420);
      });
    }
  }
  /* ------------------------------------------------------------ the film stage: Amazon's own film of the flow, beside the story.
     Each step plays its own segment and loops it; the last step can hold the end with its reading. The film is fetched
     once and shared by every copy; it plays only while it is on screen. Reduced motion: each step shows a still, and
     steps cut. A lean connection: the poster, and no film. */
  const LEAN = !!(navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || '')));
  const blobs = {};
  const filmURL = u => blobs[u] || (blobs[u] = fetch(u).then(r => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); })
    .then(b => URL.createObjectURL(b)).catch(() => u));
  function wireFilm(st) {
    const v = $('.fs-v', st), ticks = $$('.fs-rail i', st);
    const segs = JSON.parse(st.dataset.segs || '[]'), endAt = st.dataset.end ? +st.dataset.end : -1;
    let s = -1, vis = false, ready = null, raf = 0;
    const seg = () => segs[s] || [0, 0];
    const load = () => ready || (ready = filmURL(v.dataset.src).then(u => new Promise(res => {
      v.addEventListener('loadeddata', res, { once: true }); v.addEventListener('error', res, { once: true });
      v.src = u; v.load();
    })));
    const seek = t => { try { v.currentTime = t; } catch (e) { /* not seekable yet */ } };
    function paint(p) {
      ticks.forEach((t, i) => {
        t.classList.toggle('done', i < s); t.classList.toggle('on', i === s);
        const b = t.firstElementChild;
        if (b) b.style.width = (i < s ? 100 : i === s ? Math.max(0, Math.min(100, Math.round(p * 1000) / 10)) : 0) + '%';
      });
    }
    function hold() { const [a, b] = seg(); v.pause(); seek(Math.max(a, b - 0.05)); paint(1); if (s === endAt) st.classList.add('at-end'); }
    function frame() {
      cancelAnimationFrame(raf);
      const [a, b] = seg(), t = v.currentTime;
      if (t >= b - 0.03 || t < a - 0.25) {
        // the end, and any segment too short to loop, play once and hold
        if (s === endAt || b - a < 1.2) { hold(); return; }
        seek(a);
      }
      paint((t - a) / (b - a));
      if (!v.paused) raf = requestAnimationFrame(frame);
    }
    function run() {
      if (s < 0) return;
      const k = s, [a, b] = seg();
      st.classList.remove('at-end');
      cancelAnimationFrame(raf);
      // a step drawn instead of filmed (v2.7): the film rests, the drawing shows (the stylesheet keys it to data-s)
      const drawn = segs[k] == null;
      st.classList.toggle('on-draw', drawn);
      if (drawn) { if (!v.paused) v.pause(); paint(1); return; }
      if (LEAN) { paint(1); if (k === endAt) st.classList.add('at-end'); return; }
      if (RM) {
        load().then(() => { if (k !== s) return; seek(k === endAt ? b - 0.05 : (a + b) / 2); v.classList.add('on'); paint(1); if (k === endAt) st.classList.add('at-end'); });
        return;
      }
      if (!vis) { paint(0); return; }
      load().then(() => {
        if (k !== s || !vis) return;
        seek(a);
        const p = v.play();
        const go = () => { v.classList.add('on'); frame(); };
        if (p && p.then) p.then(go).catch(() => { seek(b - 0.05); v.classList.add('on'); paint(1); }); else go();
      });
    }
    return {
      to(k) { if (String(s) === String(k)) return; s = +k; st.dataset.s = String(k); run(); },
      seen(on) { if (vis === on) return; vis = on; if (on) run(); else { cancelAnimationFrame(raf); if (!RM) v.pause(); } },
    };
  }
  function filmStage(stageEl) {
    const main = wireFilm(stageEl);
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(en => main.seen(en.isIntersecting)), { threshold: 0.35 }).observe(stageEl);
    else main.seen(true);
    driveSteps(stageEl, s => main.to(s));
  }
  const stageEl = $('#stage');
  if (stageEl && stageEl.dataset.stage === 'film') filmStage(stageEl);
  else if (stageEl && stageEl.dataset.src) {
    let w = null, want = '0';
    driveSteps(stageEl, s => { want = s; if (w) w.to(s); else stageEl.dataset.s = s; });
    import(stageEl.dataset.src).then(m => {
      stageEl.dataset.s = '0';
      w = m.wire(stageEl, { RM, FINE, live, $, $$, phone: PHONE });
      w.to(want);
      stageEl.classList.add('ready');
    }).catch(() => stageEl.classList.add('ready'));
  }

  /* ------------------------------------------------------------ the products' interactives, loaded as they near the screen */
  const mods = $$('.module[data-script]');
  const load = m => {
    if (m.dataset.loaded) return;
    m.dataset.loaded = '1';
    const stage = $('[data-stage]', m);
    const rest = $('.m-rest', stage);
    import(m.dataset.script).then(mod => mod.mount(m, m.dataset.data)).then(() => {
      stage.classList.add('ready');
      if (rest) setTimeout(() => rest.remove(), 400);
    }).catch(() => {
      const t = $('.m-title', m) ? $('.m-title', m).textContent : 'This interactive';
      stage.innerHTML = '';
      stage.style.minHeight = '0';
      const p = D.createElement('p'); p.className = 'm-fail'; p.textContent = `${t} did not load. Its data is in the table below.`;
      stage.appendChild(p);
      const d = $('[data-table]', m); if (d) d.open = true;
    });
  };
  if ('IntersectionObserver' in window) {
    const ob = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { ob.unobserve(e.target); load(e.target); } }), { rootMargin: '600px 0px' });
    mods.forEach(m => ob.observe(m));
  } else mods.forEach(load);

  /* ------------------------------------------------------------ drawings the reader can handle (v2.7, D-058): a figure whose
     drawing has a script (js/figs/<name>.js) mounts it as it nears the screen; the drawing works without it */
  const figEls = $$('[data-fig]');
  const loadFig = el => { if (el.dataset.ready) return; el.dataset.ready = '1'; import(el.dataset.fig).then(m => m.mount(el, { RM, FINE, live, glide })).catch(() => {}); };
  if ('IntersectionObserver' in window) {
    const fo = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fo.unobserve(e.target); loadFig(e.target); } }), { rootMargin: '400px 0px' });
    figEls.forEach(f => fo.observe(f));
  } else figEls.forEach(loadFig);

  /* ------------------------------------------------------------ About: How I work as a list, or where each principle shows up */
  const seg = $('#how-i-work .seg');
  if (seg) {
    const list = $('#how-i-work .hw-list'), mx = $('#how-i-work .hw-mx');
    $$('button', seg).forEach(b => b.addEventListener('click', () => {
      $$('button', seg).forEach(x => x.setAttribute('aria-checked', x === b ? 'true' : 'false'));
      const m = b.dataset.view === 'matrix';
      list.hidden = m; mx.hidden = !m;
    }));
    seg.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const bs = $$('button', seg), k = bs.findIndex(b => b.getAttribute('aria-checked') === 'true');
      const n = bs[(k + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length];
      n.click(); n.focus();
    });
  }
  // the matrix (v2.7): a column or row under the hand takes its works' colors; a dot reads out how the principle shows up
  const mxT = $('#how-i-work .mx'), mxR = $('#how-i-work .mx-read'), mxP = $('#mx-proofs');
  if (mxT && mxR && mxP) {
    const dots = $$('.mx-d', mxT), ths = $$('thead th[data-w]', mxT);
    const hl = (w, p) => {
      mxT.classList.toggle('hl-on', !!(w || p));
      dots.forEach(d => d.classList.toggle('hl', (w && d.dataset.w === w) || (p && d.closest('tr').dataset.p === p)));
      ths.forEach(t => t.classList.toggle('hl', !!w && t.dataset.w === w));
      $$('tbody tr', mxT).forEach(r => r.classList.toggle('hl', !!p && r.dataset.p === p));
    };
    if (FINE) {
      ths.forEach(t => { t.addEventListener('mouseenter', () => hl(t.dataset.w)); t.addEventListener('mouseleave', () => hl()); });
      dots.forEach(d => { d.addEventListener('mouseenter', () => hl(d.dataset.w)); d.addEventListener('mouseleave', () => hl()); });
      $$('tbody tr', mxT).forEach(r => { $('th', r).addEventListener('mouseenter', () => hl(null, r.dataset.p)); $('th', r).addEventListener('mouseleave', () => hl()); });
    }
    const read = d => {
      dots.forEach(x => x.classList.toggle('on', x === d));
      const pr = $(`[data-k="${d.dataset.k}"]`, mxP.content);
      const row = d.closest('tr'), title = $('th', row).textContent.replace(/^\s*\d+\s*/, '');
      const num = $('th .mono', row) ? $('th .mono', row).textContent : '';
      mxR.style.setProperty('--c2', d.style.getPropertyValue('--c2'));
      mxR.innerHTML = `<p class="mx-k">${num} · ${pr ? pr.dataset.n : ''}</p><p class="mx-pt"></p><p class="mx-pp"></p>` +
        (pr ? `<a class="mx-go" href="${pr.dataset.href}">${pr.dataset.n}<svg class="arr" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>` : '');
      $('.mx-pt', mxR).textContent = title;
      if (pr) $('.mx-pp', mxR).innerHTML = pr.innerHTML;
    };
    dots.forEach(d => d.addEventListener('click', () => read(d)));
  }
  // a build's walkthrough plays in place (v2.7): the player loads only on a tap, and starts with the tap
  $$('.bd-play[data-loom]').forEach(b => b.addEventListener('click', () => {
    const f = D.createElement('iframe');
    f.src = `https://www.loom.com/embed/${b.dataset.loom}?autoplay=1&hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true`;
    f.title = b.getAttribute('aria-label').replace(/^Play /, '').replace(/, here$/, '');
    f.allow = 'autoplay; fullscreen'; f.allowFullscreen = true;
    const m = b.closest('.bd-m');
    m.classList.add('playing');
    b.replaceWith(f);
    f.focus();
  }));
  // a link to one principle opens it
  const openHash = () => { const t = location.hash && D.getElementById(location.hash.slice(1)); if (t && t.classList.contains('hw-i')) { const d = $('details', t); if (d) d.open = true; } };
  openHash(); addEventListener('hashchange', openHash);

  /* ------------------------------------------------------------ a sheet (v2.7, D-058): a panel that rises from the foot of the
     screen over a dimmed page; it closes on its control, on the page behind it, on Escape, or drawn down by its top */
  const X_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  function sheet(title, body, opener) {
    const el = D.createElement('div');
    el.className = 'sheet';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', title);
    el.innerHTML = `<div class="sh-back" data-close></div><div class="sh-panel" tabindex="-1"><div class="sh-top"><span class="sh-grab" aria-hidden="true"></span>
      <h2 class="sh-h"></h2><button class="sh-x" type="button" data-close aria-label="Close">${X_ICON}</button></div><div class="sh-body"></div></div>`;
    $('.sh-h', el).textContent = title;
    const bd = $('.sh-body', el);
    if (typeof body === 'string') bd.innerHTML = body; else bd.appendChild(body);
    D.body.appendChild(el);
    const panel = $('.sh-panel', el);
    const y0 = scrollY;
    H.classList.add('sheet-open');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
    panel.focus({ preventScroll: true });
    let closed = false;
    const close = (then) => {
      if (closed) return; closed = true;
      el.classList.remove('on');
      H.classList.remove('sheet-open');
      D.removeEventListener('keydown', key, true);
      setTimeout(() => { el.remove(); if (opener) opener.focus({ preventScroll: true }); if (then) then(); }, RM ? 0 : 240);
    };
    const key = e => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'Tab') {  // focus stays in the sheet
        const f = $$('a[href], button', el).filter(x => x.offsetParent);
        if (!f.length) return;
        if (e.shiftKey && D.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && D.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    D.addEventListener('keydown', key, true);
    el.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) { close(); return; }
      const a = e.target.closest('a[href^="#"]');
      if (a) {
        e.preventDefault();
        const t = D.getElementById(a.getAttribute('href').slice(1));
        close(() => { if (t) { const y = t.getBoundingClientRect().top + scrollY - head() - 16; glide(y, 420); } });
      }
    });
    // drawn down from its top, it closes
    const top = $('.sh-top', el);
    let sy = null, dy = 0;
    top.addEventListener('pointerdown', e => { sy = e.clientY; dy = 0; top.setPointerCapture(e.pointerId); panel.style.transition = 'none'; });
    top.addEventListener('pointermove', e => { if (sy == null) return; dy = Math.max(0, e.clientY - sy); panel.style.transform = `translateY(${dy}px)`; });
    const up = () => { if (sy == null) return; sy = null; panel.style.transition = ''; panel.style.transform = ''; if (dy > 70) close(); };
    top.addEventListener('pointerup', up); top.addEventListener('pointercancel', up);
    if (Math.abs(scrollY - y0) > 2) scrollTo(0, y0);
    return { el, close };
  }
  const art2 = $('article.ch');
  // the chapter's name opens an index of its parts, and the other works
  const crumbB = $('.crumb-b');
  if (crumbB && art2) crumbB.addEventListener('click', () => {
    const wrap = D.createElement('div');
    const parts = [];
    $$('.blk-h h2[id]', art2).forEach(h => {
      parts.push(`<li><a href="#${h.id}">${h.textContent}</a></li>`);
      if (h.id === 'how-h') $$('.story .step', art2).forEach(st => {
        const k = $('.k', st), t = $('h3', st);
        if (t && st.id) parts.push(`<li class="sub"><a href="#${st.id}"><span class="mono">${k ? k.textContent : ''}</span>${t.textContent}</a></li>`);
      });
    });
    const src = $('.src a', art2);
    wrap.innerHTML = `<p class="lbl">In this chapter</p><ol class="sh-parts">${parts.join('')}</ol>` +
      (src ? `<p class="sh-src"><a class="xl" href="${src.getAttribute('href')}" data-sources>Sources</a></p>` : '') + '<p class="lbl">The work</p>';
    const tpl = $('#ix-works');
    if (tpl) wrap.appendChild(tpl.content.cloneNode(true));
    const sh = sheet($('#ch-h') ? $('#ch-h').textContent : 'This chapter', wrap, crumbB);
    const sl = $('[data-sources]', sh.el);
    if (sl) sl.addEventListener('click', e => { e.preventDefault(); sh.close(() => openSources(src)); });
  });
  // Sources opens as a sheet on a phone: the chapter's own sources and picture credits, from the Sources page
  function openSources(a) {
    const href = a.getAttribute('href'), id = href.split('#')[1];
    const box = D.createElement('div');
    box.innerHTML = '<p class="sh-wait">Loading the sources</p>';
    sheet('Sources', box, a);
    fetch(href.split('#')[0]).then(r => r.text()).then(t => {
      const sec = new DOMParser().parseFromString(t, 'text/html').getElementById(id);
      const cols = sec && sec.querySelector('.cr-cols');
      if (!cols) throw new Error('none');
      $$('img', cols).forEach(im => { const u = new URL(im.getAttribute('src'), new URL(href, location.href)); im.src = u.href; im.removeAttribute('srcset'); });
      $$('source', cols).forEach(so => so.remove());
      box.innerHTML = '';
      box.appendChild(cols);
      const all = D.createElement('p'); all.className = 'sh-all';
      all.innerHTML = `<a class="xl" href="${href}">All sources and credits</a>`;
      box.appendChild(all);
    }).catch(() => { location.href = href; });
  }
  const srcLink = art2 && $('.src a', art2);
  if (srcLink) srcLink.addEventListener('click', e => { if (innerWidth < 900 && 'fetch' in window) { e.preventDefault(); openSources(srcLink); } });

  /* ------------------------------------------------------------ evidence at full size (v2.7, D-058, change 04): a tap on a
     picture opens it full screen, at its largest file, with pinch, double-tap and drag to zoom; it closes on its control,
     on Escape, or drawn down at rest */
  const PICS = 'figure.ev img, .lfig img, .after figure img, .ch-plate.views .v img, .ev-card img, .bd-m.scr img';
  function biggest(im) {
    let best = im.currentSrc || im.src, bw = 0;
    const pic = im.closest('picture');
    const sets = [im.getAttribute('srcset') || im.dataset.srcset || ''].concat(pic ? $$('source', pic).filter(s => /webp/.test(s.type || '')).map(s => s.getAttribute('srcset') || '') : []);
    sets.join(',').split(',').forEach(c => { const m = c.trim().match(/^(\S+)\s+(\d+)w$/); if (m && +m[2] > bw) { bw = +m[2]; best = m[1]; } });
    return best;
  }
  function lightbox(im) {
    const fig = im.closest('figure');
    const cap = fig && $('figcaption', fig) ? $('figcaption', fig).textContent.trim() : '';
    const el = D.createElement('div');
    el.className = 'lbx';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', im.alt || 'Picture');
    el.innerHTML = `<div class="lbx-stage"><img class="lbx-img" alt=""></div>${cap ? '<p class="lbx-cap"></p>' : ''}<button class="lbx-x" type="button" aria-label="Close">${X_ICON}</button>`;
    const img = $('.lbx-img', el), stage = $('.lbx-stage', el);
    img.alt = im.alt || '';
    img.src = im.currentSrc || im.src;
    const big = biggest(im);
    if (big && big !== img.src) { const pre = new Image(); pre.onload = () => { img.src = big; }; pre.src = big; }
    if (cap) $('.lbx-cap', el).textContent = cap;
    D.body.appendChild(el);
    H.classList.add('sheet-open');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
    const x = $('.lbx-x', el);
    x.focus({ preventScroll: true });
    let s = 1, tx = 0, ty = 0;
    const apply = (anim) => { img.style.transition = anim && !RM ? 'transform 240ms cubic-bezier(.16,1,.3,1)' : 'none'; img.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`; el.classList.toggle('zoomed', s > 1.01); };
    const clamp = () => {
      if (s <= 1) { s = 1; tx = 0; ty = 0; return; }
      const r = stage.getBoundingClientRect(), w = img.offsetWidth * s, h = img.offsetHeight * s;
      const mx = Math.max(0, (w - r.width) / 2), my = Math.max(0, (h - r.height) / 2);
      tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty));
    };
    const zoomAt = (cx, cy, ns) => {
      const r = stage.getBoundingClientRect(), ox = cx - (r.left + r.width / 2), oy = cy - (r.top + r.height / 2);
      const k = ns / s; tx = ox - (ox - tx) * k; ty = oy - (oy - ty) * k; s = ns; clamp();
    };
    const pts = new Map();
    let pinch = null, drag = null, lastTap = 0, dragDown = 0;
    stage.addEventListener('pointerdown', e => {
      stage.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; drag = null; }
      else if (pts.size === 1) { drag = { x: e.clientX, y: e.clientY, tx, ty, moved: false }; }
    });
    stage.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pts.size === 2) {
        const [a, b] = [...pts.values()];
        const ns = Math.max(1, Math.min(5, pinch.s * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d));
        zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, ns); apply(false);
      } else if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
        if (s > 1) { tx = drag.tx + dx; ty = drag.ty + dy; clamp(); apply(false); }
        else { dragDown = Math.max(0, dy); img.style.transition = 'none'; img.style.transform = `translateY(${dragDown}px)`; el.style.backgroundColor = `rgb(11 11 10 / ${Math.max(.3, 1 - dragDown / 400)})`; }
      }
    });
    const end = e => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (drag && pts.size === 0) {
        if (s <= 1 && dragDown > 90) { close(); return; }
        if (s <= 1) { dragDown = 0; el.style.backgroundColor = ''; apply(true); }
        if (!drag.moved) {
          const now = Date.now();
          if (now - lastTap < 300) { zoomAt(e.clientX, e.clientY, s > 1.01 ? 1 : 2.5); apply(true); lastTap = 0; }
          else lastTap = now;
        }
        drag = null;
      }
    };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    stage.addEventListener('wheel', e => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.max(1, Math.min(5, s * (e.deltaY < 0 ? 1.15 : 0.87)))); apply(false); }, { passive: false });
    stage.addEventListener('dblclick', e => { if (e.pointerType === 'touch') return; zoomAt(e.clientX, e.clientY, s > 1.01 ? 1 : 2.5); apply(true); });
    let closed = false;
    function close() {
      if (closed) return; closed = true;
      el.classList.remove('on'); H.classList.remove('sheet-open');
      D.removeEventListener('keydown', key, true);
      setTimeout(() => { el.remove(); im.focus && im.closest('[tabindex]') ? im.closest('[tabindex]').focus({ preventScroll: true }) : null; }, RM ? 0 : 240);
    }
    const key = e => { if (e.key === 'Escape') { e.preventDefault(); close(); } if (e.key === 'Tab') { e.preventDefault(); x.focus(); } };
    D.addEventListener('keydown', key, true);
    x.addEventListener('click', close);
  }
  D.addEventListener('click', e => {
    const im = e.target.closest(PICS);
    if (!im || e.defaultPrevented || im.closest('a')) return;
    if (im.closest('.ch-plate') && im.closest('.ch-plate').dataset.dragged) return;
    lightbox(im);
  });
  $$(PICS).forEach(im => { if (!im.closest('a')) im.classList.add('zoomable'); });

  /* ------------------------------------------------------------ a drawing is never read under 12 px (v2.8): where a laptop's
     or a tablet's column draws a wide drawing smaller than that, its phone twin, drawn for 358 px with every label at 12 px
     or more, shows in its place, held to 480 px. Measured on the drawing as laid out, at load and after a resize. */
  function fitTwins() {
    const boxes = new Map();
    $$('svg.dw.dw-narrow, .stage.two > svg[data-v="n"]').forEach(n => {
      const box = n.parentElement;
      const w = n.matches('[data-v]') ? $(':scope > svg[data-v="w"]', box) : $(':scope > svg.dw.dw-wide', box);
      if (w) boxes.set(box, w);
    });
    boxes.forEach((w, box) => box.classList.remove('tw-n'));
    if (innerWidth < 900) return;
    boxes.forEach((w, box) => {
      let min = 99;
      for (const t of w.querySelectorAll('text')) {
        const m = t.getScreenCTM(); if (!m) continue;
        const px = parseFloat(getComputedStyle(t).fontSize) * Math.hypot(m.a, m.b);
        if (px > 0 && px < min) min = px;
      }
      if (min < 11.95) box.classList.add('tw-n');
    });
  }
  let twT = 0;
  fitTwins();
  if (D.fonts && D.fonts.ready) D.fonts.ready.then(fitTwins);
  addEventListener('resize', () => { clearTimeout(twT); twT = setTimeout(fitTwins, 150); });

  onScroll();
})();
