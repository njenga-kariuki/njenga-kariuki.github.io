/* AI Index chapter, "Five data sources, one for each layer" (3_content/modules/m13-one-claim-five-measures.json).
   The chapter measured AI in the economy with five data sources, one for each layer. Five rows, each in its own units
   and on its own scale, from the chapter's published CSV files, values as printed. One control, the year (a native
   slider set under the sparklines, so each step moves the marked year on every row); the readout says which measures
   rose and which fell that year. Direction words only; nothing is computed beyond them. */
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, text) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const sv = (tag, attrs = {}, text) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const phone = matchMedia('(max-width: 599px)');
const Y0 = 2018, Y1 = 2024;
const YEARS = Array.from({ length: Y1 - Y0 + 1 }, (_, i) => Y0 + i);
const MINUS = '−';
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five'];

/* the five layers: what each row is called, its data source, its unit line, and how a value is printed */
const LAYERS = [
  { id: 'inv', name: 'Investment', source: 'Quid', said: 'investment', unit: 'private AI investment, world', show: (t) => `$${t} billion` },
  { id: 'post', name: 'Job postings', source: 'Lightcast', said: 'job postings', unit: 'of US job postings', show: (t) => t },
  { id: 'hire', name: 'Hiring', source: 'LinkedIn', said: 'hiring', unit: 'US AI hiring rate, yearly change', show: (t) => t, sign: true },
  { id: 'use', name: 'Company use', source: 'McKinsey', said: 'company use', unit: 'say their organization uses AI', show: (t) => t },
  { id: 'bots', name: 'Robots installed', source: 'IFR', said: 'robot installations', unit: 'robots installed, world', show: (t) => `${t} thousand` },
];

/* the published files, read as printed: { year: { v: number, t: printed text } } for each layer */
function series(files) {
  const csv = (name) => { const r = files[name]; if (!Array.isArray(r) || !r.length) throw new Error(`five-measures: ${name} missing`); return r; };
  const col = (rows, pat) => { const c = Object.keys(rows[0]).find((x) => pat.test(x)); if (!c) throw new Error('five-measures: column missing'); return c; };
  const value = (raw) => { const s = String(raw == null ? '' : raw).trim(); return s === '' ? null : { v: parseFloat(s.replace('%', '')), t: s.replace(/^-/, MINUS) }; };
  const S = {};
  const inv = csv('fig_4.3.2.csv'), ki = col(inv, /investment/i);
  S.inv = {};
  inv.forEach((r) => { const x = value(r[ki]); if (x) S.inv[parseInt(r.Year, 10)] = { v: x.v, t: x.v.toFixed(2) }; });
  const post = csv('fig_4.2.1.csv'), kp = col(post, /postings/i), ap = col(post, /geographic/i);
  S.post = {};
  post.forEach((r) => { const x = value(r[kp]); if (x && String(r[ap]).trim() === 'United States') S.post[parseInt(r.Year, 10)] = x; });
  // hiring is monthly; the year is its December value
  const hire = csv('fig_4.2.14.csv'), kh = col(hire, /ratio/i), ah = col(hire, /geographic/i);
  S.hire = {};
  hire.forEach((r) => { const m = /^12\/1\/(\d\d)$/.exec(String(r.Date).trim()); const x = value(r[kh]); if (m && x && String(r[ah]).trim() === 'United States') S.hire[2000 + parseInt(m[1], 10)] = x; });
  const use = csv('fig_4.4.1.csv'), ku = col(use, /respondents/i);
  S.use = {};
  use.forEach((r) => { const x = value(r[ku]); if (x && String(r.Label).trim() === 'AI') S.use[parseInt(r.Year, 10)] = x; });
  const bots = csv('fig_4.5.1.csv'), kb = col(bots, /robots/i);
  S.bots = {};
  bots.forEach((r) => { const x = value(r[kb]); if (x) S.bots[parseInt(r.Year, 10)] = x; });
  LAYERS.forEach((L) => { if (!S[L.id][Y1 - 1]) throw new Error(`five-measures: no ${L.id} series`); });
  return S;
}

export async function mount(section, dataUrl) {
  const stage = section.querySelector('[data-stage]');
  if (!stage) throw new Error('five-measures: no stage');
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error('five-measures: no data');
  const data = await res.json();
  const S = series(data.files || {});
  let year = Y1;

  // which way each measure went in a year: against the year before, or, for hiring, the sign of its change
  const dir = (L, y) => {
    const p = S[L.id][y];
    if (!p) return null;
    if (L.sign) return p.v > 0 ? 1 : p.v < 0 ? -1 : 0;
    const q = S[L.id][y - 1];
    return q ? Math.sign(p.v - q.v) : null;
  };
  const list = (names) => (names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);
  function sentence(y) {
    const up = [], down = [], none = [];
    LAYERS.forEach((L) => { const d = dir(L, y); (d > 0 ? up : d < 0 ? down : none).push(L.said); });
    if (!down.length && none.length) return `In ${y}, every measure with ${y} data rose.`;
    if (!down.length) return `In ${y}, all five measures rose.`;
    if (!up.length) return `In ${y}, all five measures fell.`;
    if (down.length <= up.length) return `In ${y}, ${list(down)} fell while the other ${WORDS[up.length]} rose.`;
    return `In ${y}, ${list(up)} rose while the other ${WORDS[down.length]} fell.`;
  }

  stage.textContent = '';
  const svg = sv('svg', { role: 'img' });
  const range = el('input', { type: 'range', class: 'range', min: String(Y0), max: String(Y1), step: '1', value: String(year), 'aria-label': 'Year' });
  range.addEventListener('input', () => { const y = parseInt(range.value, 10); if (y !== year) { year = y; show(); } });
  const controls = el('div', { class: 'm-controls' });
  controls.appendChild(range);
  const read = el('p', { class: 'm-read', 'aria-live': 'polite' });
  stage.append(svg, controls, read);

  // ---------------------------------------------------------------- drawing
  let g = null;
  function draw() {
    const W = stage.getBoundingClientRect().width;
    const ph = phone.matches;
    const rowH = ph ? 72 : 64, axisH = 22, H = LAYERS.length * rowH + axisH;
    // the sparklines' years sit where the slider's thumb sits: its center runs 10 px in from each end
    const nameW = W < 700 ? 140 : 176, valW = W < 700 ? 200 : 210;
    const sx = ph ? 20 : nameW, sw = ph ? W - 40 : W - nameW - valW - 16;
    const xOf = (y) => sx + ((y - Y0) / (Y1 - Y0)) * sw;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.height = `${H}px`;
    svg.textContent = '';
    const hair = sv('line', { x1: 0, x2: 0, y1: 0, y2: LAYERS.length * rowH, class: 'd-grid anim' });
    svg.appendChild(hair);
    const rows = LAYERS.map((L, i) => {
      const top = i * rowH;
      const sTop = ph ? top + 44 : top + 10, sH = ph ? 20 : 40;
      if (i) svg.appendChild(sv('line', { x1: 0, x2: W, y1: top + 0.5, y2: top + 0.5, class: 'd-grid' }));
      const name = sv('text', { x: 0, y: ph ? top + 19 : top + 27, class: 't-strong' });
      name.append(L.name, ph ? sv('tspan', { class: '' }, ` · ${L.source}`) : '');
      svg.appendChild(name);
      if (!ph) svg.appendChild(sv('text', { x: 0, y: top + 45 }, L.source));
      // the series on its own scale
      const pts = YEARS.filter((y) => S[L.id][y]);
      const vs = pts.map((y) => S[L.id][y].v);
      let lo = Math.min(...vs), hi = Math.max(...vs);
      if (hi === lo) { hi += 1; lo -= 1; }
      const yOf = (v) => sTop + 3 + (1 - (v - lo) / (hi - lo)) * (sH - 6);
      svg.appendChild(sv('path', { d: pts.map((y, j) => `${j ? 'L' : 'M'}${xOf(y).toFixed(1)} ${yOf(S[L.id][y].v).toFixed(1)}`).join(' '), class: 'd-ref no-fill', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
      pts.forEach((y) => svg.appendChild(sv('circle', { cx: xOf(y), cy: yOf(S[L.id][y].v), r: 2, class: 'd-ref no-stroke' })));
      const dot = sv('circle', { cx: 0, cy: 0, r: 4.5, class: 'd-claim anim', 'stroke-width': 2 });
      dot.style.stroke = 'var(--paper)';
      svg.appendChild(dot);
      // the value as printed, and its unit
      const vx = ph ? W - 1 : W - valW;
      const val = sv('text', { x: vx, y: ph ? top + 21 : top + 31, class: 't-big', 'text-anchor': ph ? 'end' : 'start' });
      const unit = sv('text', { x: ph ? 0 : vx, y: ph ? top + 36 : top + 49 }, L.unit);
      svg.append(val, unit);
      const last = pts[pts.length - 1];
      return { L, dot, val, unit, at: (y) => (S[L.id][y] ? [xOf(y), yOf(S[L.id][y].v)] : null), rest: [xOf(last), yOf(S[L.id][last].v)] };
    });
    // the years, under the sparklines
    const yl = YEARS.map((y) => { const t = sv('text', { x: xOf(y), y: H - 5, 'text-anchor': 'middle' }, String(y)); svg.appendChild(t); return t; });
    // the slider sits under the sparklines, its thumb on the same years
    range.style.width = `${sw + 20}px`;
    range.style.marginLeft = `${sx - 10}px`;
    range.style.display = 'block';
    g = { hair, rows, yl, xOf, thin: sw / (Y1 - Y0) < 40 };
    read.style.minHeight = ph ? '3em' : '';
    show();
  }
  function show() {
    const { hair, rows, yl, xOf } = g;
    hair.style.transform = `translate(${xOf(year).toFixed(1)}px, 0px)`;
    rows.forEach((r) => {
      const p = S[r.L.id][year];
      const at = r.at(year);
      const xy = at || r.rest;
      r.dot.style.transform = `translate(${xy[0].toFixed(1)}px, ${xy[1].toFixed(1)}px)`;
      r.dot.style.opacity = at ? '1' : '0';
      if (p) {
        r.val.textContent = r.L.show(p.t);
        r.val.setAttribute('class', 't-big');
        r.unit.textContent = r.L.unit;
      } else {
        r.val.textContent = `No ${year} data`;
        r.val.setAttribute('class', 't-strong');
        r.unit.textContent = `the data end in ${Math.max(...Object.keys(S[r.L.id]).map(Number))}`;
      }
    });
    // every year is labeled where the labels fit; where they do not, every other year, and always the year chosen
    yl.forEach((t, i) => {
      const y = YEARS[i];
      t.setAttribute('class', y === year ? 't-strong' : '');
      t.style.opacity = !g.thin || y === year || ((y - Y0) % 2 === 0 && Math.abs(y - year) !== 1) ? '1' : '0';
    });
    svg.setAttribute('aria-label', `${year}: ${rows.map((r) => { const p = S[r.L.id][year]; return `${r.L.name}, ${r.L.source}: ${p ? `${r.L.show(p.t)}, ${r.L.unit}` : `no ${year} data`}`; }).join('; ')}.`);
    range.setAttribute('aria-valuetext', String(year));
    read.textContent = sentence(year);
  }

  draw();
  if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(draw);
  let lastW = stage.getBoundingClientRect().width;
  new ResizeObserver(() => { const w = stage.getBoundingClientRect().width; if (Math.abs(w - lastW) > 0.5) { lastW = w; draw(); } }).observe(stage);
  phone.addEventListener('change', draw);
}
