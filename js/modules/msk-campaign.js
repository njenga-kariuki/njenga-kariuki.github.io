/* Amazon Bio Discovery, "From 288,000 designs to 46 confirmed binders" (3_content/modules/m14-msk-campaign.json).
   The campaign as a funnel: four counts from the campaign's paper, each a bar on one scale. One control sets the scale:
   all 288,000 designs, where the 116 measured and the 46 confirmed are hairlines, or the 116 measured, where they can be
   read. Counts come from msk-campaign-funnel.json (stages 3, 5, 6 and 7). Reduced motion: every change is instant. */
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, text) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const sv = (tag, attrs = {}, text) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const phone = matchMedia('(max-width: 599px)');
const num = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/* the four rows: the funnel stage each one reads, and the words beside its count */
const ROWS = [
  { step: 3, words: 'designed by three AI models', mark: 'd-ref' },
  { step: 5, words: 'made and screened in yeast', mark: 'd-ref' },
  { step: 6, words: 'measured one by one', mark: 'd-ref' },
  { step: 7, words: 'confirmed binders', mark: 'd-claim' },
];

export async function mount(section, dataUrl) {
  const stage = section.querySelector('[data-stage]');
  if (!stage) throw new Error('msk-campaign: no stage');
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error('msk-campaign: no data');
  const data = await res.json();
  const f = (data.files || {})['msk-campaign-funnel.json'];
  const stages = (f && f.stages) || [];
  const rows = ROWS.map((r) => { const s = stages.find((x) => x.step === r.step); return s && s.count > 0 ? { ...r, n: s.count } : null; });
  if (rows.some((r) => !r)) throw new Error('msk-campaign: a funnel stage is missing');
  const [all, made, measured, confirmed] = rows;
  // the two scales: every design, or the candidates measured one by one
  const SCALES = [
    { label: `All ${num(all.n)} designs`, max: all.n, focus: [0, 1],
      line: `Of ${num(all.n)} AI designs, ${num(made.n)} were made and screened in yeast.` },
    { label: `The ${num(measured.n)} measured`, max: measured.n, focus: [2, 3],
      line: `Of ${num(measured.n)} candidates measured one by one, ${num(confirmed.n)} were confirmed binders.` },
  ];
  let k = 0;

  stage.textContent = '';
  const svg = sv('svg', { role: 'img' });
  const seg = el('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Scale' });
  const radios = SCALES.map((c, i) => {
    const b = el('button', { type: 'button', role: 'radio', 'aria-checked': i === k ? 'true' : 'false', tabindex: i === k ? '0' : '-1', style: 'text-align: center' }, c.label);
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
  let marks = [];
  let W = 0;
  function draw() {
    W = stage.getBoundingClientRect().width;
    const ph = phone.matches;
    const rowH = ph ? 60 : 58, barH = ph ? 12 : 14, H = rows.length * rowH - (rowH - 46) + 4;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.height = `${H}px`;
    svg.textContent = '';
    marks = rows.map((r, i) => {
      const y = i * rowH + 2;
      const g = sv('g', { class: 'anim' });
      const count = sv('text', { x: 0, y: y + 20, class: 't-big' }, num(r.n));
      const words = sv('text', { x: 0, y: y + 19, class: 't-ink' }, r.words);
      g.append(count, words);
      // each bar is drawn full width and scaled, so a change of scale is one transform
      const bar = sv('rect', { x: 0, y: y + 30, width: W, height: barH, class: `${r.mark} no-stroke anim` });
      svg.append(g, bar);
      return { g, bar, count, words };
    });
    // the words start one gap after the widest count, as the face sets it
    const widest = Math.max(...marks.map((m) => m.count.getComputedTextLength()));
    marks.forEach((m) => m.words.setAttribute('x', (Math.ceil(widest) + (ph ? 10 : 14)).toString()));
    read.style.minHeight = ph ? '3em' : '';
    show();
  }
  function show() {
    const sc = SCALES[k];
    rows.forEach((r, i) => {
      const on = sc.focus.includes(i);
      const s = Math.max(2 / W, Math.min(1, r.n / sc.max));
      marks[i].bar.style.transform = `scale(${s.toFixed(6)}, 1)`;
      // beyond the scale a bar leaves; its count stays, dimmed
      marks[i].bar.style.opacity = r.n > sc.max ? '0' : '1';
      marks[i].g.style.opacity = on || r.n <= sc.max ? '1' : '0.4';
    });
    svg.setAttribute('aria-label', k === 0
      ? `Bars on one scale: ${rows.map((r) => `${num(r.n)} ${r.words}`).join('; ')}. On this scale the last two are hairlines.`
      : `Bars on a scale of ${num(measured.n)}: ${num(measured.n)} ${measured.words}; ${num(confirmed.n)} ${confirmed.words}.`);
    read.textContent = sc.line;
  }
  function pick(i) {
    if (i === k) return;
    k = i;
    radios.forEach((b, j) => { b.setAttribute('aria-checked', j === k ? 'true' : 'false'); b.tabIndex = j === k ? 0 : -1; });
    show();
  }

  draw();
  if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(draw);
  let lastW = W;
  new ResizeObserver(() => { const w = stage.getBoundingClientRect().width; if (Math.abs(w - lastW) > 0.5) { lastW = w; draw(); } }).observe(stage);
  phone.addEventListener('change', draw);
}
