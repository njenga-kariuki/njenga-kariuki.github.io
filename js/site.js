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
  const body = D.body;
  const isHome = body.classList.contains('p-home');
  const isChapter = body.classList.contains('p-chapter');

  /* ------------------------------------------------------------ lines and bars draw as they arrive */
  const armed = $$('.sec, #tl, .setup, .funnel, .pr-fig, .d-fig, .r-body');
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

  /* ------------------------------------------------------------ copy the address */
  $$('.cpi[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const done = () => { b.classList.add('done'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('done'), 1600); };
    try { await navigator.clipboard.writeText(b.dataset.copy); done(); live('Address copied'); }
    catch (e) {
      const a = b.parentElement && $('.mailto', b.parentElement);
      if (a) { const r = D.createRange(); r.selectNodeContents(a); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); live('Address selected'); }
    }
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

  // the phone's work row counts the card in view
  const platesEl = $('#plates'), wc = $('#wc');
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
        if (e / 100 * tw + 14 + w <= tw) { n.style.left = `calc(${e}% + 14px)`; n.style.right = 'auto'; }
        else { n.style.right = `calc(${100 - s}% + 14px)`; n.style.left = 'auto'; }
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
  // a figure in the opening lines is a door: it scrolls to the career and lights the roles it comes from
  D.addEventListener('click', e => {
    const f = e.target.closest('[data-light]');
    if (!f || !tl) return;
    e.preventDefault();
    const ids = f.dataset.light;
    const phone = innerWidth < 900;
    let target = $('#career');
    if (phone) { const li = $(`#tlpl li[data-id="${ids.split(' ')[0]}"]`); if (li) target = li; }
    const y = target.getBoundingClientRect().top + scrollY - head() - (phone ? 96 : 12);
    if (Math.abs(y - scrollY) > 40) glide(y, 450, () => setTimeout(() => lightSet(ids), RM ? 0 : 200)); else lightSet(ids);
  });

  /* ------------------------------------------------------------ the header: the name joins the bar; the section is underlined */
  const hd = $('#hd'), prog = $('#prog'), byline = $('#byline');
  const navs = $$('.hd-nav a[data-nav]');
  const art = $('article.ch');
  function onScroll() {
    if (hd) hd.classList.toggle('edge', scrollY > 8);
    if (isHome) {
      if (byline) hd.classList.toggle('named', byline.getBoundingClientRect().bottom < head());
      let cur = null;
      ['work', 'career', 'lead'].forEach(id => { const s = D.getElementById(id); if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = id; });
      navs.forEach(a => a.classList.toggle('on', a.dataset.nav === cur));
      railTick();
    } else if (isChapter && art && prog) {
      prog.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollY / Math.max(1, art.offsetHeight - innerHeight)))})`;
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
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

  /* ------------------------------------------------------------ the stages: the step in view drives the drawing */
  const PIN = {
    lamp: { n: 'Living Room Lamp', off: 'Off', on: 'On', glow: 'lamp' },
    echo: { n: 'Echo Studio', off: 'Paused', on: 'Playing' },
    plug: { n: 'Coffee Maker', off: 'Off', on: 'On' },
    thermo: { n: 'Hallway Thermostat', off: '68°', on: 'Heating to 72°' },
    bed: { n: 'Bedroom Light', off: 'Off', on: 'On', glow: 'bed' },
  };
  const LABELS = [[40, 36, 104, 18], [330, 36, 66, 18], [330, 146, 66, 18], [330, 246, 56, 18], [480, 36, 66, 18], [480, 236, 76, 18]];
  function wireMap(st) {
    const pins = $$('.pin', st), ctl = $('.ctl', st), card = $('.card', st);
    function place(px, py) {
      const k = innerWidth < 900 ? 1.4 : 1, cw = 188 * k, chh = 54 * k;
      const tries = [[px + 26, py - chh - 10], [px - cw - 26, py - chh - 10], [px - cw - 26, py - chh / 2], [px + 26, py - chh / 2], [px + 26, py + 22], [px - cw - 26, py + 22], [px - cw / 2, py + 26]];
      const clear = ([x, y]) => x >= 22 && y >= 22 && x + cw <= 598 && y + chh <= 398 &&
        LABELS.every(([lx, ly, lw, lh]) => x + cw < lx - 4 || x > lx + lw + 4 || y + chh < ly - 4 || y > ly + lh + 4);
      return tries.find(clear) || [Math.min(Math.max(22, px + 26), 598 - cw), Math.max(22, py - chh - 10)];
    }
    function setPin(p, on, quiet) {
      const d = PIN[p.dataset.k];
      p.classList.toggle('on', on);
      p.setAttribute('aria-pressed', on ? 'true' : 'false');
      p.setAttribute('aria-label', `${d.n}, ${on ? d.on : d.off}`);
      if (d.glow) { const g = $(`.glow[data-glow="${d.glow}"]`, st); if (g) g.classList.toggle('on', on); }
      if (quiet) return;
      st.classList.remove('hinting');
      const m = p.getAttribute('transform').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/);
      const [x, y] = place(+m[1], +m[2]);
      card.style.transform = `translate(${x}px, ${y}px)`;
      $('.ctn', st).textContent = d.n; $('.st', st).textContent = on ? d.on : d.off;
      $('.st', st).style.fill = on && d.glow ? '#ffd25a' : '#fff';
      ctl.classList.add('on');
      live(`${d.n}, ${on ? d.on : d.off}`);
    }
    function liveOn(on) {
      pins.forEach(p => { p.setAttribute('tabindex', on ? '0' : '-1'); p.setAttribute('aria-hidden', on ? 'false' : 'true'); if (!on) setPin(p, false, true); });
      if (!on) ctl.classList.remove('on');
    }
    pins.forEach(p => {
      const flip = () => { if (p.getAttribute('tabindex') === '0') setPin(p, !p.classList.contains('on')); };
      p.addEventListener('click', flip);
      p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    });
    let hinted = false;
    return {
      to(s) {
        if (st.dataset.s === s) return;
        st.dataset.s = s;
        liveOn((s === '3' || s === '4') && !st.classList.contains('static'));
        if (s === '4' && !hinted && !RM) { hinted = true; st.classList.add('hinting'); setTimeout(() => st.classList.remove('hinting'), 2400); }
      }
    };
  }
  // M-PESA: one chain of work. Its time is drawn as work and waiting; the chain redesigned shortens the waiting.
  const CHAIN = {
    work: [[16, 16, 16, 16, 16, 16], [16, 5, 16, 16, 16, 16], [16, 5, 8, 16, 6, 16]],
    wait: [[91.2, 91.2, 91.2, 91.2, 91.2], [91.2, 91.2, 91.2, 91.2, 91.2], [10, 10, 10, 10, 10]],
    ai: [[], [1], [1, 2, 4]],
  };
  function wireChain(st) {
    const tw = $$('.tw[data-i]', st).sort((a, b) => a.dataset.i - b.dataset.i), tq = $$('.tq[data-i]', st).sort((a, b) => a.dataset.i - b.dataset.i);
    const sv = $('svg', st), BW = +((sv && sv.dataset.bar) || 560), W = BW / 552;
    const end = $('.end', st), boxes = $$('.cb', st), links = $$('.cl', st);
    function layout(s) {
      const k = Math.min(2, +s);
      let x = 0;
      for (let i = 0; i < 6; i++) {
        const w = CHAIN.work[k][i];
        tw[i].style.transform = `translate(${x * W}px, 0px) scale(${w * W}, 1)`; x += w;
        if (i < 5) { const q = CHAIN.wait[k][i]; tq[i].style.transform = `translate(${x * W}px, 0px) scale(${q * W}, 1)`; x += q; }
      }
      end.style.transform = `translate(${x * W}px, 0px)`;
      const et = $('text', end);
      // the result's label: under the end mark at full length; once the chain is shorter, just past its end, inside the
      // outline of the old length, whose own end reads "Before" (v2.2)
      if (et) { const short = x * W < BW * 0.46; et.setAttribute('text-anchor', short ? 'start' : 'end'); et.setAttribute('x', short ? '8' : '0'); et.setAttribute('y', short ? '11.5' : '38'); }
      boxes.forEach((b, i) => b.classList.toggle('on-ai', CHAIN.ai[k].includes(i)));
      links.forEach(l => l.classList.toggle('joined', k >= 2));
    }
    layout('0');
    return { to(s) { if (st.dataset.s === s) return; st.dataset.s = s; layout(s); } };
  }
  // Prime Now: the store platform builds station by station; the link into the app carries the cadence (v2.2)
  function wirePipe(st) {
    const stn = $$('.stn', st), lk = $$('.p-link', st);
    function layout(s) {
      const k = +s;
      stn.forEach(g => { const i = +g.dataset.i; g.classList.toggle('on', i <= k || i === 4); g.classList.toggle('cur', k > 0 && i === k); });
      lk.forEach(l => { const i = +l.dataset.i; l.classList.toggle('on', i < k); l.classList.toggle('live', k === 4 && i === 3); });
    }
    layout(st.dataset.s || '0');
    return { to(s) { if (st.dataset.s === s) return; st.dataset.s = s; layout(s); } };
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
    const steps = $$('.story .step');
    // the phone: each step carries its own copy of the stage, playing that step's segment
    const minis = steps.map(step => {
      const k = +step.dataset.s;
      const box = stageEl.cloneNode(true);
      box.removeAttribute('id');
      box.classList.add('mini');
      $$('.cap', box).forEach(c => c.remove());
      step.insertBefore(box, step.children[1] || null);
      const w = wireFilm(box);
      w.to(k);
      return [box, w];
    });
    const main = wireFilm(stageEl);
    const rail = $('.fs-rail', stageEl);
    if (rail && steps.length) {
      rail.classList.add('go');
      rail.addEventListener('click', e => {
        const r = rail.getBoundingClientRect();
        const i = Math.min(steps.length - 1, Math.max(0, Math.floor((e.clientX - r.left) / r.width * steps.length)));
        glide(steps[i].getBoundingClientRect().top + scrollY - innerHeight * 0.3, 420);
      });
    }
    if (!('IntersectionObserver' in window)) { main.to(0); main.seen(true); minis.forEach(([, w]) => w.seen(true)); return; }
    const vio = new IntersectionObserver(es => es.forEach(en => { const w = en.target === stageEl ? main : (minis.find(m => m[0] === en.target) || [])[1]; if (w) w.seen(en.isIntersecting); }), { threshold: 0.35 });
    vio.observe(stageEl); minis.forEach(([b]) => vio.observe(b));
    const sio = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      steps.forEach(x => x.classList.toggle('on', x === en.target));
      main.to(en.target.dataset.s);
    }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(x => sio.observe(x));
    main.to(0);
    addEventListener('scroll', () => {
      const s0 = steps[0];
      if (s0 && s0.getBoundingClientRect().top > innerHeight * 0.55 && stageEl.dataset.s !== '0') { steps.forEach(x => x.classList.toggle('on', x === s0)); main.to(0); }
    }, { passive: true });
  }
  const stageEl = $('#stage');
  if (stageEl && stageEl.dataset.stage === 'film') filmStage(stageEl);
  else if (stageEl) {
    const kind = stageEl.dataset.stage;
    const wire = kind === 'map-view' ? wireMap : kind === 'pipeline' ? wirePipe : wireChain;
    const main = wire(stageEl);
    const steps = $$('.story .step');
    // the chain has a copy drawn for a phone's width; the floor plan scales as it is
    const tpl = $('template', stageEl);
    const svg = (tpl && tpl.content.querySelector('svg')) || $('svg', stageEl);
    const last = steps.length - 1;
    // the phone: each step carries its own copy of the drawing, in that step's state; nothing pins over the text
    steps.forEach(step => {
      const k = +step.dataset.s;
      const box = D.createElement('div');
      box.className = 'stage mini' + (kind === 'map-view' && k === 3 ? ' static' : '');
      box.dataset.stage = kind;
      box.dataset.s = String(Math.max(0, k - 1));
      box.dataset.to = String(k);
      const copy = D.importNode(svg, true);
      copy.removeAttribute('id');
      // each step's copy is cut to the height its state uses: the markets appear only at the last state
      if (copy.dataset.h) copy.setAttribute('viewBox', `0 0 ${copy.dataset.vw} ${k >= 4 ? copy.dataset.h4 : copy.dataset.h}`);
      const ids = {};
      $$('[id]', copy).forEach(el => { const n = el.id + '-' + k; ids[el.id] = n; el.id = n; });
      $$('*', copy).forEach(el => ['fill', 'mask', 'clip-path', 'stroke'].forEach(at => { const v = el.getAttribute(at); const m = v && v.match(/^url\(#(.+)\)$/); if (m && ids[m[1]]) el.setAttribute(at, `url(#${ids[m[1]]})`); }));
      if (kind === 'map-view' && k !== last) copy.setAttribute('aria-label', 'Drawing of a home in Map View.');
      box.appendChild(copy);
      step.insertBefore(box, step.children[1] || null);
      const w = wire(box);
      box._advance = () => w.to(box.dataset.to);
      if (kind === 'map-view' && k === 3) $$('.pin', box).forEach(p => { p.setAttribute('tabindex', '-1'); p.setAttribute('aria-hidden', 'true'); });
    });
    if ('IntersectionObserver' in window) {
      const mio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target._advance(); mio.unobserve(en.target); } }), { threshold: 0.55 });
      $$('.stage.mini').forEach(b => { if (RM) b._advance(); else mio.observe(b); });
      const sio = new IntersectionObserver(es => es.forEach(en => {
        if (!en.isIntersecting) return;
        steps.forEach(s => s.classList.toggle('on', s === en.target));
        main.to(en.target.dataset.s);
      }), { rootMargin: '-45% 0px -45% 0px' });
      steps.forEach(s => sio.observe(s));
      addEventListener('scroll', () => {
        const s0 = steps[0];
        if (s0 && s0.getBoundingClientRect().top > innerHeight * 0.55 && stageEl.dataset.s !== '0') { steps.forEach(x => x.classList.toggle('on', x === s0)); main.to('0'); }
      }, { passive: true });
    } else {
      $$('.stage.mini').forEach(b => b._advance());
    }
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
  // a link to one principle opens it
  const openHash = () => { const t = location.hash && D.getElementById(location.hash.slice(1)); if (t && t.classList.contains('hw-i')) { const d = $('details', t); if (d) d.open = true; } };
  openHash(); addEventListener('hashchange', openHash);

  onScroll();
})();
