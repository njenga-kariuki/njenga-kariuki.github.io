/* Halo Tone, "Two scores, one word" (3_content/modules/m08-activation-valence-plane.json), v2.7 (D-058).
   A voice reading is a point on two axes: energy across, from tired to excited, and positivity up, from sad to happy (the
   copy's words). The reader moves the voice anywhere on the plane; the quarter it is in lights, and the words a reviewer
   reported Tone using there (descriptor-colour-families.json) travel with it. Live mode is played once as an illustrative
   path, marked as such; the four buttons stay as the tap alternative, and the arrow keys move the voice. The quarter, its
   words, the checked button and the readout always agree, while the voice moves and after. The axes carry no numbers:
   positions are schematic. Reduced motion: the finished path, and the voice moves at once. */
const NS = 'http://www.w3.org/2000/svg';
const PICK = ['excited', 'content', 'worried', 'irritated']; // one word per quarter, in the control's order
// an illustrative stretch of speech, as live mode drew it: from content, warming through to excited (schematic)
const PATH = [[0.30, 0.62], [0.35, 0.69], [0.43, 0.74], [0.51, 0.71], [0.60, 0.66], [0.69, 0.72], [0.77, 0.80], [0.73, 0.86], [0.66, 0.81]];
const PLAY_MS = 4200;

const el = (tag, attrs = {}) => {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => { if (k === 'text') n.textContent = v; else n.setAttribute(k, v); });
  return n;
};
const sv = (tag, attrs = {}, text) => {
  const n = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  if (text != null) n.textContent = text;
  return n;
};
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// a radiogroup of buttons: roving tabindex, arrow keys, Home and End; -1 means none is checked
function segmented(name, labels, start, pick) {
  const group = el('div', { class: 'seg', role: 'radiogroup', 'aria-label': name });
  const buttons = labels.map((t, i) => el('button', { type: 'button', role: 'radio', 'aria-checked': String(i === start), tabindex: i === (start < 0 ? 0 : start) ? '0' : '-1', text: t }));
  buttons.forEach((b) => group.appendChild(b));
  let cur = start;
  const mark = (i) => { buttons.forEach((b, j) => { b.setAttribute('aria-checked', String(j === i)); b.tabIndex = j === (i < 0 ? 0 : i) ? 0 : -1; }); cur = i; };
  const set = (i, focus) => { mark(i); if (focus) buttons[i].focus(); pick(i); };
  group._quiet = mark;
  group.addEventListener('click', (e) => { const i = buttons.indexOf(e.target.closest('button')); if (i >= 0) set(i, false); });
  group.addEventListener('keydown', (e) => {
    const n = buttons.length, c = cur < 0 ? 0 : cur;
    const to = { ArrowRight: (c + 1) % n, ArrowDown: (c + 1) % n, ArrowLeft: (c - 1 + n) % n, ArrowUp: (c - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (to == null) return;
    e.preventDefault();
    set(to, true);
  });
  return group;
}

export function mount(section, dataUrl) {
  return fetch(dataUrl)
    .then((r) => { if (!r.ok) throw new Error('data'); return r.json(); })
    .then((data) => build(section, data));
}

function build(section, data) {
  const stage = section.querySelector('[data-stage]');
  const families = ((data.files || {})['descriptor-colour-families.json'] || {}).families;
  if (!stage || !Array.isArray(families) || families.length !== 4) throw new Error('data');
  // a quarter of the plane per family: right when its energy is not low, top when its positivity is not low
  const Q = families.map((f) => ({ words: f.descriptors, right: f.energy !== 'low', top: f.positivity !== 'low' }));
  if (Q.some((q) => !Array.isArray(q.words) || !q.words.length)) throw new Error('data');
  Q.forEach((q) => { q.pick = PICK.find((w) => q.words.includes(w)); });
  if (Q.some((q) => !q.pick)) throw new Error('data');
  const order = PICK.map((w) => Q.find((q) => q.pick === w));
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const quarterOf = (p) => Q.find((q) => q.right === (p.e >= 0.5) && q.top === (p.p >= 0.5));
  const scores = (q) => `${q.right ? 'higher' : 'lower'} energy, ${q.top ? 'higher' : 'lower'} positivity`;
  const words = (q) => [q.pick, ...q.words.filter((w) => w !== q.pick)];
  const sentence = (q) => `${cap(words(q).join(', '))}: ${scores(q)}.`;
  const home = (q) => ({ e: q.right ? 0.75 : 0.25, p: q.top ? 0.70 : 0.30 });

  stage.innerHTML = '';
  const svg = sv('svg', { class: 'vp', role: 'group', 'aria-labelledby': 'vp-desc' });
  const desc = sv('desc', { id: 'vp-desc' }, 'A plane: energy across, from tired to excited; positivity up, from sad to happy. '
    + Q.map((q) => `${cap(scores(q))}: ${q.words.join(', ')}`).join('. ') + '. The voice can be moved anywhere on the plane.');
  const paper = sv('rect', { class: 'vp-paper' });
  const quads = Q.map(() => sv('rect', { class: 'vp-q' }));
  const base = sv('g', { 'aria-hidden': 'true' });
  const ghosts = Q.map((q) => sv('text', { class: 't-ghost', 'text-anchor': 'middle', 'aria-hidden': 'true' }, q.pick));
  const ghostG = sv('g', { 'aria-hidden': 'true' });
  ghosts.forEach((g) => ghostG.appendChild(g));
  const trail = sv('path', { class: 'vp-trail', d: '', 'aria-hidden': 'true' });
  // the words travel with the voice: the quarter's word in large type, its other two words beneath
  const wordsG = sv('g', { class: 'vp-words', 'aria-hidden': 'true' });
  const w0 = sv('text', { class: 't-word', 'text-anchor': 'middle' });
  const w1 = sv('text', { class: 't-more', 'text-anchor': 'middle' });
  const w2 = sv('text', { class: 't-more', 'text-anchor': 'middle' });
  wordsG.append(w0, w1, w2);
  // the voice: a dot in the work's color, a ring for focus, and a 44 px hit around it
  const voice = sv('g', { class: 'vp-v', tabindex: '0', role: 'slider', 'aria-label': 'The voice on the plane. Move it with the arrow keys.',
    'aria-valuemin': '0', 'aria-valuemax': '100' });
  voice.append(sv('circle', { class: 'vp-hit', r: '22' }), sv('circle', { class: 'vp-ring', r: '15' }), sv('circle', { class: 'vp-dot', r: '9' }));
  svg.append(desc, paper, ...quads, base, ghostG, trail, wordsG, voice);

  const row = el('div', { class: 'vp-row' });
  const seg = segmented('Move the voice to a word Tone used', PICK.map(cap), 0, (i) => { stop(); clearTrail(); go(home(order[i]), true); });
  const PLAY_I = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2.5v9l7.5-4.5z" fill="currentColor"/></svg>';
  const STOP_I = '<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.2" fill="currentColor"/></svg>';
  const play = el('button', { type: 'button', class: 'btn vp-play', 'aria-pressed': 'false' });
  const setPlay = (on) => { play.innerHTML = `${on ? STOP_I : PLAY_I}<span>${on ? 'Stop' : 'Play live mode'}</span>`; play.setAttribute('aria-pressed', String(on)); };
  setPlay(false);
  const note = el('span', { class: 'vp-note', text: 'An illustrative path; the axes carry no numbers.' });
  row.append(seg, play, note);
  const read = el('div', { class: 'm-read', 'aria-live': 'polite' });
  stage.append(svg, row, read);

  let G = null;
  let pos = { e: PATH[0][0], p: PATH[0][1] };
  let lastQ = null;
  let keep = [];
  const pts = [];
  const xy = (p) => [G.l + p.e * G.w, G.t + (1 - p.p) * G.h];

  function draw() {
    const W = Math.max(280, Math.round(stage.clientWidth));
    // a phone's plane stands taller, so each quarter holds the voice and its words without crossing an axis
    const H = W < 460 ? Math.round(clamp(W * 1.12, 320, 352)) : Math.round(clamp(W * 0.6, 260, 320));
    const cx = W / 2, cy = H / 2;
    G = { W, H, cx, cy, l: 18, t: 18, w: W - 36, h: H - 36 };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    paper.setAttribute('width', String(W)); paper.setAttribute('height', String(H));
    Q.forEach((q, i) => {
      quads[i].setAttribute('x', String(q.right ? cx : 0));
      quads[i].setAttribute('y', String(q.top ? 0 : cy));
      quads[i].setAttribute('width', String(W / 2));
      quads[i].setAttribute('height', String(H / 2));
      const [gx, gy] = xy(home(q));
      ghosts[i].setAttribute('x', String(Math.round(gx)));
      // each quarter's word sits at the quarter's own place, clear of the axes and their words
      ghosts[i].setAttribute('y', String(Math.round(gy + 5)));
    });
    base.innerHTML = '';
    // the plane's edge, the two axes through its middle, and the words at the ends (no arrowheads: the words give the
    // direction, v2.7)
    base.append(
      sv('rect', { class: 'd-grid', x: '0.5', y: '0.5', width: String(W - 1), height: String(H - 1) }),
      sv('line', { class: 'd-axis', x1: '0', x2: String(W), y1: String(cy), y2: String(cy) }),
      sv('line', { class: 'd-axis', x1: String(cx), x2: String(cx), y1: String(H), y2: '0' }),
      sv('text', { class: 'vp-ax', x: String(W - 14), y: String(cy - 10), 'text-anchor': 'end' }, 'Energy'),
      sv('text', { class: 'vp-end', x: String(W - 10), y: String(cy + 21), 'text-anchor': 'end' }, 'Excited'),
      sv('text', { class: 'vp-end', x: '10', y: String(cy + 21) }, 'Tired'),
      sv('text', { class: 'vp-ax', x: String(cx + 12), y: '17' }, 'Positivity'),
      sv('text', { class: 'vp-end', x: String(cx - 12), y: '17', 'text-anchor': 'end' }, 'Happy'),
      sv('text', { class: 'vp-end', x: String(cx - 12), y: String(H - 10), 'text-anchor': 'end' }, 'Sad'),
    );
    // the labels the words must keep clear of
    keep = Array.from(base.querySelectorAll('text')).map((t) => { const b = t.getBBox(); return { x: b.x - 5, y: b.y - 4, w: b.width + 10, h: b.height + 8 }; });
    place();
    redrawTrail();
  }

  // the word block beside the voice: below it if it fits, else above, beside or at a corner, always inside the plane and
  // clear of the axes' words; the first place with no overlap wins, else the place with the least
  function placeWords(x, y) {
    const bw = Math.max(w0.getComputedTextLength(), w1.getComputedTextLength(), w2.getComputedTextLength()) + 6;
    const bh = 60;
    const cands = [[x - bw / 2, y + 15], [x - bw / 2, y - 15 - bh], [x + 16, y - bh / 2], [x - 16 - bw, y - bh / 2],
      [x + 16, y - 14], [x - 16 - bw, y - 14], [x + 16, y - bh + 14], [x - 16 - bw, y - bh + 14],
      [x + 10, y + 12], [x - 10 - bw, y + 12], [x + 10, y - 12 - bh], [x - 10 - bw, y - 12 - bh]];
    const over = (r) => keep.reduce((a, k) => a + Math.max(0, Math.min(r.x + r.w, k.x + k.w) - Math.max(r.x, k.x)) * Math.max(0, Math.min(r.y + r.h, k.y + k.h) - Math.max(r.y, k.y)), 0);
    let best = null;
    for (const [bx0, by0] of cands) {
      const r = { x: clamp(bx0, 4, G.W - 4 - bw), y: clamp(by0, 4, G.H - 4 - bh), w: bw, h: bh };
      // a clamped block may not cover the voice itself
      const hitsVoice = x > r.x - 12 && x < r.x + r.w + 12 && y > r.y - 12 && y < r.y + r.h + 12;
      // the axes are lines the words should not sit on: a crossing costs, though less than covering a label
      const axes = (r.y < G.cy + 3 && r.y + r.h > G.cy - 3 ? r.w * 4 : 0) + (r.x < G.cx + 3 && r.x + r.w > G.cx - 3 ? r.h * 4 : 0);
      const cost = over(r) * 10 + axes + (hitsVoice ? 1e6 : 0);
      if (!best || cost < best.cost) best = { r, cost };
      if (cost === 0) break;
    }
    const cx = best.r.x + bw / 2;
    [[w0, 20], [w1, 39], [w2, 56]].forEach(([t, dy]) => { t.setAttribute('x', cx.toFixed(1)); t.setAttribute('y', (best.r.y + dy).toFixed(1)); });
  }

  // one source of truth: the voice's place sets its quarter, the quarter's words, the checked button and the readout
  function place() {
    const q = quarterOf(pos);
    const [x, y] = xy(pos);
    voice.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    Q.forEach((qq, i) => { quads[i].classList.toggle('on', qq === q); ghosts[i].classList.toggle('here', qq === q); });
    const ws = words(q);
    w0.textContent = ws[0]; w1.textContent = ws[1] || ''; w2.textContent = ws[2] || '';
    placeWords(x, y);
    voice.setAttribute('aria-valuenow', String(Math.round(pos.e * 100)));
    voice.setAttribute('aria-valuetext', sentence(q));
    if (q !== lastQ) {
      lastQ = q;
      seg._quiet(PICK.indexOf(q.pick));
      read.textContent = sentence(q);
    }
  }

  // a move to a place: eased over 240 ms (the words travel with the voice), or at once under reduced motion
  let tw = 0;
  function go(p, eased) {
    const to = { e: clamp(p.e, 0.02, 0.98), p: clamp(p.p, 0.02, 0.98) };
    cancelAnimationFrame(tw);
    if (!eased || RM) { pos = to; place(); return; }
    const from = { ...pos }, t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 240), u = 1 - Math.pow(1 - k, 3);
      pos = { e: from.e + (to.e - from.e) * u, p: from.p + (to.p - from.p) * u };
      place();
      if (k < 1) tw = requestAnimationFrame(step);
    };
    tw = requestAnimationFrame(step);
  }

  // the trail: the reader's own path while dragging, or live mode's illustrative path
  function redrawTrail() {
    if (pts.length < 2) { trail.setAttribute('d', ''); return; }
    trail.setAttribute('d', pts.map((pt, i) => { const [x, y] = xy(pt); return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; }).join(' '));
  }
  function clearTrail() { pts.length = 0; redrawTrail(); }
  function addPt() { pts.push({ e: pos.e, p: pos.p }); if (pts.length > 400) pts.shift(); redrawTrail(); }

  const toPlane = (ev) => {
    const r = svg.getBoundingClientRect(), k = G.W / r.width;
    return { e: ((ev.clientX - r.left) * k - G.l) / G.w, p: 1 - ((ev.clientY - r.top) * k - G.t) / G.h };
  };
  let drag = false;
  const hit = voice.querySelector('.vp-hit');
  hit.addEventListener('pointerdown', (ev) => {
    stop(); drag = true; svg.classList.add('dragging');
    try { hit.setPointerCapture(ev.pointerId); } catch (e) { /* not capturable */ }
    clearTrail(); addPt(); ev.preventDefault();
  });
  hit.addEventListener('pointermove', (ev) => { if (!drag) return; const p = toPlane(ev); go(p, false); addPt(); });
  let dragEnd = 0;
  const up = () => { if (!drag) return; drag = false; dragEnd = performance.now(); svg.classList.remove('dragging'); };
  hit.addEventListener('pointerup', up);
  hit.addEventListener('pointercancel', up);
  // a tap elsewhere on the plane moves the voice there
  // (the click that ends a drag is not a tap: the reader's trail stays)
  svg.addEventListener('click', (ev) => { if (ev.target === hit || drag || performance.now() - dragEnd < 400) return; stop(); clearTrail(); go(toPlane(ev), true); });
  voice.addEventListener('keydown', (e) => {
    const k = e.shiftKey ? 0.25 : 1 / 12;
    const d = { ArrowRight: [k, 0], ArrowLeft: [-k, 0], ArrowUp: [0, k], ArrowDown: [0, -k] }[e.key];
    if (e.key === 'Home') { e.preventDefault(); stop(); go({ e: 0.5, p: 0.5 }, false); return; }
    if (!d) return;
    e.preventDefault(); stop();
    go({ e: pos.e + d[0], p: pos.p + d[1] }, false);
  });

  // live mode, once: the voice travels an illustrative path, leaving its trail; any touch, click or key stops it
  let raf = 0;
  function stop() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (svg.classList.contains('playing')) { svg.classList.remove('playing'); setPlay(false); read.setAttribute('aria-live', 'polite'); }
  }
  const at = (t) => {
    const f = t * (PATH.length - 1), i = Math.min(PATH.length - 2, Math.floor(f)), u = f - i;
    // a smooth path through the points (Catmull-Rom)
    const P = (j) => PATH[clamp(j, 0, PATH.length - 1)];
    const c = (a, b, c2, d2, s) => 0.5 * ((2 * b) + (-a + c2) * s + (2 * a - 5 * b + 4 * c2 - d2) * s * s + (-a + 3 * b - 3 * c2 + d2) * s * s * s);
    return { e: c(P(i - 1)[0], P(i)[0], P(i + 1)[0], P(i + 2)[0], u), p: c(P(i - 1)[1], P(i)[1], P(i + 1)[1], P(i + 2)[1], u) };
  };
  function run() {
    stop(); clearTrail(); cancelAnimationFrame(tw);
    if (RM) {
      for (let k = 0; k <= 80; k += 1) { pos = at(k / 80); pts.push({ e: pos.e, p: pos.p }); }
      redrawTrail(); place(); return;
    }
    svg.classList.add('playing'); setPlay(true); read.setAttribute('aria-live', 'off');
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / PLAY_MS);
      pos = at(t); place(); addPt();
      if (t < 1) raf = requestAnimationFrame(step);
      else { raf = 0; stop(); }
    };
    raf = requestAnimationFrame(step);
  }
  play.addEventListener('click', () => { if (svg.classList.contains('playing')) stop(); else run(); });
  ['keydown'].forEach((ev) => seg.addEventListener(ev, stop, { passive: true }));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { io.disconnect(); if (!RM) run(); } }), { threshold: 0.6 });
    io.observe(svg);
  }

  draw();
  if (RM) run();
  let lastW = stage.clientWidth;
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { const w = stage.clientWidth; if (w !== lastW) { lastW = w; draw(); } }).observe(stage);
  }
}
