/* Halo Tone, "Two scores, one word" (3_content/modules/m08-activation-valence-plane.json).
   A voice reading is a dot on two axes, energy across and positivity up. Each quarter of the plane carries the words
   a reviewer reported Tone using there (descriptor-colour-families.json). One segmented control moves the dot to a
   quarter; the readout names that quarter's two scores. The dot's places are schematic: the axes carry no numbers. */
const NS = 'http://www.w3.org/2000/svg';
const PHONE = '(max-width: 599px)';
const PICK = ['excited', 'content', 'worried', 'irritated']; // one word per quarter, in the control's order
const START = 0;

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

// a radiogroup of buttons: roving tabindex, arrow keys, Home and End
function segmented(name, labels, start, pick) {
  const group = el('div', { class: 'seg', role: 'radiogroup', 'aria-label': name });
  const buttons = labels.map((t, i) => el('button', { type: 'button', role: 'radio', 'aria-checked': String(i === start), tabindex: i === start ? '0' : '-1', text: t }));
  buttons.forEach((b) => group.appendChild(b));
  let cur = start;
  const set = (i, focus) => {
    buttons.forEach((b, j) => { b.setAttribute('aria-checked', String(j === i)); b.tabIndex = j === i ? 0 : -1; });
    if (focus) buttons[i].focus();
    if (i !== cur) { cur = i; pick(i); }
  };
  group._quiet = (i) => { buttons.forEach((b, j) => { b.setAttribute('aria-checked', String(j === i)); b.tabIndex = j === i ? 0 : -1; }); cur = i; };
  group.addEventListener('click', (e) => { const i = buttons.indexOf(e.target.closest('button')); if (i >= 0) set(i, false); });
  group.addEventListener('keydown', (e) => {
    const n = buttons.length;
    const to = { ArrowRight: (cur + 1) % n, ArrowDown: (cur + 1) % n, ArrowLeft: (cur - 1 + n) % n, ArrowUp: (cur - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
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
  const pickQ = PICK.map((w) => Q.find((q) => q.words.includes(w)));
  if (pickQ.some((q) => !q) || Q.some((q) => !Array.isArray(q.words) || !q.words.length)) throw new Error('data');
  const scores = (q) => `${q.right ? 'higher' : 'lower'} energy, ${q.top ? 'higher' : 'lower'} positivity`;
  const sentence = (i) => `${cap(PICK[i])}: ${scores(pickQ[i])}.`;

  const st = { i: START };
  stage.innerHTML = '';
  const svg = sv('svg', { role: 'img', 'aria-labelledby': 'tone2-desc' });
  const desc = sv('desc', { id: 'tone2-desc' });
  const shade = sv('rect', { class: 'd-light anim' });
  const base = sv('g');
  // the dot and its words travel together: the word in large type, the quarter's other words beneath it
  const dot = sv('g', { class: 'anim' });
  const word = sv('text', { class: 't-big' });
  const more = [sv('text', { class: 't-ink' }), sv('text', { class: 't-ink' })];
  dot.append(sv('circle', { class: 'd-claim', r: '9', cx: '0', cy: '0' }), word, ...more);
  const ghosts = PICK.map(() => sv('text', { class: 't-ghost', 'text-anchor': 'middle', 'aria-hidden': 'true' }));
  const ghostG = sv('g', { 'aria-hidden': 'true' });
  ghosts.forEach((g) => ghostG.appendChild(g));
  svg.append(desc, shade, base, ghostG, dot);
  const read = el('div', { class: 'm-read', 'aria-live': 'polite' });
  const controls = el('div', { class: 'm-controls' });
  const seg = segmented('A voice Tone called', PICK.map(cap), START, (i) => { stopTour(); st.i = i; place(true); });
  controls.appendChild(seg);
  stage.append(svg, controls, read);

  let geo = null;
  function draw() {
    const W = Math.max(280, Math.round(stage.clientWidth));
    const phone = matchMedia(PHONE).matches;
    // the readout keeps room for a second line on a phone, so a wider face never moves what follows
    read.style.minHeight = phone ? '3em' : '1.5em';
    const H = 300;
    const cx = W / 2;
    const cy = H / 2;
    geo = { W, H, cx, cy };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    base.innerHTML = '';
    // the plane's edge, and the two axes through its middle, each with an arrow at its high end
    base.appendChild(sv('rect', { class: 'd-grid', x: '0.5', y: '0.5', width: String(W - 1), height: String(H - 1) }));
    base.appendChild(sv('line', { class: 'd-axis', x1: '0', x2: String(W - 2), y1: String(cy), y2: String(cy) }));
    base.appendChild(sv('line', { class: 'd-axis', x1: String(cx), x2: String(cx), y1: String(H), y2: '2' }));
    base.appendChild(sv('path', { class: 'd-ref no-stroke', d: `M${W - 1} ${cy} l-9 -4.5 v9 z` }));
    base.appendChild(sv('path', { class: 'd-ref no-stroke', d: `M${cx} 1 l-4.5 9 h9 z` }));
    base.appendChild(sv('text', { class: 't-ink', x: String(W - 14), y: String(cy - 10), 'text-anchor': 'end' }, 'Energy'));
    base.appendChild(sv('text', { class: 't-ink', x: String(cx + 12), y: '16' }, 'Positivity'));
    // the resting frame appears complete: no motion on the first draw or a resize
    [shade, dot].forEach((n) => { n.style.transition = 'none'; });
    place(false);
    svg.getBoundingClientRect();
    [shade, dot].forEach((n) => { n.style.transition = ''; });
  }
  function place(say) {
    const q = pickQ[st.i];
    const { W, H, cx, cy } = geo;
    shade.setAttribute('x', String(q.right ? cx : 0));
    shade.setAttribute('y', String(q.top ? 0 : cy));
    shade.setAttribute('width', String(W / 2));
    shade.setAttribute('height', String(H / 2));
    // the dot at the middle of its quarter's width, a third of the way down; its words centered beneath it
    dot.style.transform = `translate(${q.right ? cx + W / 4 : cx - W / 4}px, ${(q.top ? 0 : cy) + Math.round(cy * 0.3)}px)`;
    word.textContent = PICK[st.i];
    word.setAttribute('x', '0');
    word.setAttribute('y', '35');
    word.setAttribute('text-anchor', 'middle');
    q.words.filter((w) => w !== PICK[st.i]).forEach((w, j) => {
      more[j].textContent = w;
      more[j].setAttribute('x', '0');
      more[j].setAttribute('y', String(56 + j * 19));
      more[j].setAttribute('text-anchor', 'middle');
    });
    PICK.forEach((w, j) => {
      const qq = pickQ[j];
      ghosts[j].textContent = w;
      ghosts[j].setAttribute('x', String(qq.right ? cx + W / 4 : cx - W / 4));
      ghosts[j].setAttribute('y', String((qq.top ? 0 : cy) + Math.round(cy * 0.3) + 35));
      ghosts[j].classList.toggle('on', j !== st.i);
    });
    const s = sentence(st.i);
    desc.textContent = `A plane with energy across and positivity up. ${Q.map((x) => `${scores(x)}: ${x.words.join(', ')}`).join('. ')}. The dot: ${s}`;
    if (say || !read.textContent) read.textContent = s;
  }

  // live mode, once: when the plane first comes into view, the dot moves through the four quarters as a voice would,
  // then rests where it started; any touch, click or key stops it, and reduced motion skips it (v2.2)
  let tour = null;
  function stopTour() { if (tour) { clearTimeout(tour); tour = null; } read.setAttribute('aria-live', 'polite'); }
  function runTour() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const seq = [1, 2, 3, 0];
    let k = 0;
    read.setAttribute('aria-live', 'off');
    const next = () => {
      st.i = seq[k]; seg._quiet(st.i); place(false); read.textContent = sentence(st.i);
      k += 1;
      if (k < seq.length) tour = setTimeout(next, 900); else { tour = null; read.setAttribute('aria-live', 'polite'); }
    };
    tour = setTimeout(next, 500);
  }
  ['pointerdown', 'keydown'].forEach((ev) => stage.addEventListener(ev, stopTour, { passive: true }));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { io.disconnect(); runTour(); } }), { threshold: 0.6 });
    io.observe(stage);
  }

  draw();
  let lastW = stage.clientWidth;
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { const w = stage.clientWidth; if (w !== lastW) { lastW = w; draw(); } }).observe(stage);
  }
}
