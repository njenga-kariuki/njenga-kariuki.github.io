/* Health AI portfolio, "Three products, three clinical references" (3_content/modules/m10-measured-against-what.json).
   Each product was held to a clinical reference and the study was published. One three-way choice of product; for each,
   a chain of three steps: what the phone saw, what it was checked against (and on how many people), and the result; the
   readout says where and when the study was published. The Body error, its limit and its sample come from
   body-accuracy-vs-dxa-2022.json (m10-s031; m10-n013, m10-n036); the other samples and the dates are records:
   Movement 150 adults (m10-n014), waist-to-hip 1,200 people (m10-n015), published 29 June 2022 (m10-e017),
   6 September 2022 (m10-e021) and 11 September 2023 (m10-e039). Words match lib/tables_m10_measured_against_what.py. */
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, text) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const sv = (tag, attrs = {}, text) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const phone = matchMedia('(max-width: 599px)');
const num = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/* the three products: the words, the people each study measured, and when its paper was published */
const PRODUCTS = [
  { label: 'Body', when: 'June 2022', people: 'adults',
    saw: 'Front and back photos', against: 'DXA, a clinical X-ray scan' },
  { label: 'Movement', when: 'September 2022', people: 'adults', count: 150,
    saw: 'Video of five exercises', against: 'A motion-capture suit and 13 clinical tests',
    big: 'Moderate to strong', small: 'agreement with the suit and the 13 tests' },
  { label: 'Waist-to-hip', when: 'September 2023', people: 'people', count: 1200,
    saw: 'Front, side and back photos', against: 'Tape measures by trained staff',
    big: 'About half', small: 'the error of people measuring themselves' },
];
const STEPS = ['The phone saw', 'Checked against', 'The result'];

export async function mount(section, dataUrl) {
  const stage = section.querySelector('[data-stage]');
  if (!stage) throw new Error('measured-against: no stage');
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error('measured-against: no data');
  const data = await res.json();
  const body = (data.files || {})['body-accuracy-vs-dxa-2022.json'] || {};
  const vbc = (body.rows || []).find((r) => String(r.method).startsWith('VBC'));
  const limit = body.acceptable_error_threshold_pct_points;
  if (!vbc || !(vbc.mae_pct_points > 0) || !(vbc.n > 0) || !(limit > 0)) throw new Error('measured-against: no Body result');
  const P = PRODUCTS.map((p) => ({ ...p }));
  Object.assign(P[0], { count: vbc.n, big: `About ${vbc.mae_pct_points.toFixed(1)} points`, small: `average error in body fat; the limit was ${limit}` });
  let k = 0;

  stage.textContent = '';
  const svg = sv('svg', { role: 'img' });
  const seg = el('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Product' });
  const radios = P.map((p, i) => {
    const b = el('button', { type: 'button', role: 'radio', 'aria-checked': i === k ? 'true' : 'false', tabindex: i === k ? '0' : '-1', style: 'text-align: center' }, p.label);
    b.addEventListener('click', () => pick(i));
    seg.appendChild(b);
    return b;
  });
  seg.addEventListener('keydown', (e) => {
    const n = radios.length;
    const to = { ArrowRight: k + 1, ArrowDown: k + 1, ArrowLeft: k - 1 + n, ArrowUp: k - 1 + n, Home: 0, End: n - 1 }[e.key];
    if (to == null) return;
    e.preventDefault();
    pick(to % n);
    radios[k].focus();
  });
  const controls = el('div', { class: 'm-controls' });
  controls.appendChild(seg);
  const read = el('p', { class: 'm-read', 'aria-live': 'polite' });
  stage.append(svg, controls, read);

  // ---------------------------------------------------------------- drawing
  // text set in lines no wider than w, as the face measures it
  function lines(parent, text, x, y, w, cls, lh) {
    const t = sv('text', { x, y, class: cls });
    parent.appendChild(t);
    let ts = sv('tspan', { x, dy: 0 });
    t.appendChild(ts);
    let line = [];
    String(text).split(' ').forEach((word) => {
      ts.textContent = line.concat(word).join(' ');
      if (line.length && ts.getComputedTextLength() > w) {
        ts.textContent = line.join(' ');
        ts = sv('tspan', { x, dy: lh }, word);
        t.appendChild(ts);
        line = [word];
      } else line.push(word);
    });
    return t;
  }
  let layout = null, words = null;
  function draw() {
    const W = stage.getBoundingClientRect().width;
    const ph = phone.matches;
    const H = ph ? 226 : 112;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.height = `${H}px`;
    svg.textContent = '';
    // where each step sits: three columns joined by a line (desktop), or three rows down a line (phone)
    if (ph) {
      const x = 22, top = [0, 60, 140];
      layout = STEPS.map((_, i) => ({ x, y: top[i], w: W - x, node: [4.5, top[i] + 8] }));
      svg.appendChild(sv('line', { x1: 4.5, y1: 8, x2: 4.5, y2: top[2] + 8, class: 'd-grid' }));
    } else {
      const gap = 24, share = [0.27, 0.3, 0.43], free = W - 2 * gap;
      let x = 0;
      layout = share.map((f) => { const c = { x, y: 20, w: free * f - 8, node: [x + 4.5, 6] }; x += free * f + gap; return c; });
      svg.appendChild(sv('line', { x1: 4.5, y1: 6, x2: layout[2].node[0], y2: 6, class: 'd-grid' }));
    }
    layout.forEach((c, i) => {
      // the first two steps hollow, the result filled
      const dot = sv('circle', { cx: c.node[0], cy: c.node[1], r: 4.5, class: 'd-claim', 'stroke-width': 1.5 });
      if (i < 2) dot.style.fill = 'var(--paper)';
      svg.appendChild(dot);
      svg.appendChild(sv('text', { x: c.x, y: c.y + (ph ? 12 : 14), 'letter-spacing': '0.06em' }, STEPS[i].toUpperCase()));
    });
    words = null;
    read.style.minHeight = ph ? '3em' : '';
    show(false);
  }
  function show(fade) {
    const p = P[k];
    const ph = phone.matches;
    const g = sv('g', { class: 'anim' });
    const old = words;
    words = g;
    // the words are set in place first (a line can only be measured on the page), then shown
    if (fade && old) g.style.opacity = '0';
    else if (old) old.remove();
    svg.appendChild(g);
    const [a, b, c] = layout;
    const v = ph ? 32 : 40;
    lines(g, p.saw, a.x, a.y + v, a.w, 't-strong', 18);
    const ref = lines(g, p.against, b.x, b.y + v, b.w, 't-strong', 18);
    lines(g, `${num(p.count)} ${p.people}`, b.x, b.y + v + 18 * ref.childNodes.length, b.w, '', 18);
    const big = lines(g, p.big, c.x, c.y + (ph ? 37 : 45), c.w, 't-big', 26);
    lines(g, p.small, c.x, c.y + (ph ? 57 : 65) + 26 * (big.childNodes.length - 1), c.w, '', 18);
    if (fade && old) {
      old.style.opacity = '0';
      g.getBoundingClientRect();
      g.style.opacity = '1';
      setTimeout(() => old.remove(), 160);
    }
    svg.setAttribute('aria-label', `${p.label}. The phone saw: ${p.saw}. Checked against: ${p.against}, in ${num(p.count)} ${p.people}. The result: ${p.big}, ${p.small}.`);
    read.textContent = `Published in npj Digital Medicine in ${p.when}.`;
  }
  function pick(i) {
    if (i === k) return;
    k = i;
    radios.forEach((b, j) => { b.setAttribute('aria-checked', j === k ? 'true' : 'false'); b.tabIndex = j === k ? 0 : -1; });
    show(true);
  }

  draw();
  if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(draw);
  let lastW = stage.getBoundingClientRect().width;
  new ResizeObserver(() => { const w = stage.getBoundingClientRect().width; if (Math.abs(w - lastW) > 0.5) { lastW = w; draw(); } }).observe(stage);
  phone.addEventListener('change', draw);
}
