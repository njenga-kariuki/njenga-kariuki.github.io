/* Halo Movement, "What a score of 81 meant" (3_content/modules/m09-what-does-81-mean.json).
   One slider sets a score from 50 to 100. A line marks it beside the average score of each of the 2022 study's three
   groups (score-scale.json, study_groups), and the readout says in one sentence where the score sits among them.
   v2.7 (D-058): the slider is the chart's own axis, its thumb on the axis under the line it moves; the member's line is in
   the work's color, the groups in ink; a band above 90 marks the scores even the most athletic members rarely reached
   (the chapter's Score step, m09-c009). */
const NS = 'http://www.w3.org/2000/svg';
const PHONE = '(max-width: 599px)';
const LO = 50;
const HI = 100;
const START = 81;
const TICKS = [50, 60, 70, 80, 90, 100];
const THUMB = 20; // the kit's slider thumb, in px
const RARE = 90; // above this, rarely reached (m09-c009)

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

export function mount(section, dataUrl) {
  return fetch(dataUrl)
    .then((r) => { if (!r.ok) throw new Error('data'); return r.json(); })
    .then((data) => build(section, data));
}

function build(section, data) {
  const stage = section.querySelector('[data-stage]');
  const groups = ((data.files || {})['score-scale.json'] || {}).study_groups;
  if (!stage || !groups || !groups.athlete || !groups.healthy || !groups.movement_impaired) throw new Error('data');
  // highest average first; averages rounded to whole points, as a reader compares them
  const G = [
    { name: 'Athletes', of: 'the athletes’ average', avg: Math.round(groups.athlete.mean) },
    { name: 'Healthy adults', of: 'the healthy adults’ average', avg: Math.round(groups.healthy.mean) },
    { name: 'Adults with impaired movement', of: 'the average for adults with impaired movement', avg: Math.round(groups.movement_impaired.mean) },
  ];
  if (G.some((g) => !Number.isFinite(g.avg))) throw new Error('data');

  // the score against the nearest group average, in whole points
  const sentence = (v) => {
    const g = G.reduce((a, b) => (Math.abs(b.avg - v) < Math.abs(a.avg - v) ? b : a));
    const d = v - g.avg;
    if (d === 0) return `${v} is about ${g.of}.`;
    return `${v} is ${Math.abs(d)} ${d > 0 ? 'above' : 'below'} ${g.of}.`;
  };

  const st = { v: START };
  stage.innerHTML = '';
  const svg = sv('svg', { role: 'img', 'aria-labelledby': 'mv81-desc' });
  const desc = sv('desc', { id: 'mv81-desc' });
  const band = sv('g');
  const grid = sv('g');
  const mark = sv('g', { class: 'm81-mark' });
  const rows = sv('g');
  const line = sv('line', { class: 'd1' });
  const num = sv('text', { class: 't-big m81-num', 'text-anchor': 'middle' });
  mark.append(line, num);
  // the grid behind the marked line; the groups' dots and words in front of it, each word on a paper halo
  svg.append(desc, band, grid, mark, rows);
  const HALO = 'paint-order: stroke; stroke: var(--paper); stroke-width: 5px; stroke-linejoin: round';

  const range = el('input', { type: 'range', class: 'range m81-range', min: String(LO), max: String(HI), step: '1', value: String(START), 'aria-label': 'A member’s score' });
  // the slider lies on the chart's axis: the plot and the control are one instrument
  const plot = el('div', { class: 'm81-plot' });
  plot.append(svg, range);
  const read = el('div', { class: 'm-read', 'aria-live': 'polite' });
  stage.append(plot, read);

  let geo = null;
  function draw() {
    const W = Math.max(280, Math.round(stage.clientWidth));
    // the names stand above their rows whenever the stage is narrow (a phone, or a laptop's step column), so the plot
    // keeps the stage's whole width
    const phone = matchMedia(PHONE).matches || W < 560;
    // the readout keeps the height of its longest sentence: two lines on a phone, one above it
    read.style.minHeight = phone ? '3em' : '1.5em';
    const px0 = phone ? 12 : 196;
    const px1 = W - 16;
    const X = (v) => px0 + ((v - LO) / (HI - LO)) * (px1 - px0);
    const top = phone ? 54 : 62;
    const rowH = phone ? 50 : 48;
    const axisY = top + 3 * rowH + 4;
    const H = axisY + (phone ? 28 : 31);
    geo = { X, W, axisY };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    band.innerHTML = '';
    grid.innerHTML = '';
    rows.innerHTML = '';
    // above 90: rarely reached, even by the most athletic members
    band.appendChild(sv('rect', { class: 'm81-band', x: X(RARE), y: top - 6, width: X(HI) - X(RARE), height: axisY - top + 6 }));
    band.appendChild(sv('text', { class: 'm81-bt', x: X(HI), y: 13, 'text-anchor': 'end' }, `Rarely above ${RARE}`));
    band.appendChild(sv('line', { class: 'm81-bl', x1: X(RARE), x2: X(RARE), y1: 19, y2: axisY }));
    // grid at every ten points, the axis and its numbers
    TICKS.forEach((t) => {
      if (t > LO && t !== RARE) grid.appendChild(sv('line', { class: 'd-grid', x1: X(t), x2: X(t), y1: top, y2: axisY }));
      grid.appendChild(sv('text', { x: X(t), y: axisY + 25, 'text-anchor': 'middle' }, String(t)));
    });
    grid.appendChild(sv('line', { class: 'm81-axis', x1: px0, x2: px1, y1: axisY, y2: axisY }));
    // one row per group: its name, and a dot at its average labeled with the number
    G.forEach((g, i) => {
      const y0 = top + i * rowH;
      const cy = phone ? y0 + 33 : y0 + rowH / 2;
      rows.appendChild(sv('text', { class: 't-ink', x: 0, y: phone ? y0 + 14 : cy + 4.5, style: HALO }, g.name));
      rows.appendChild(sv('circle', { class: 'd-claim', cx: X(g.avg), cy, r: 5.5 }));
      rows.appendChild(sv('text', { class: 't-ink', x: X(g.avg) + 11, y: cy + 4.5, style: HALO }, String(g.avg)));
    });
    line.setAttribute('x1', 0); line.setAttribute('x2', 0);
    line.setAttribute('y1', String(top - 10)); line.setAttribute('y2', String(axisY));
    line.setAttribute('stroke-width', '2');
    num.setAttribute('y', String(top - 16));
    // the slider over the axis: its thumb's center runs from px0 to px1, on the axis line
    range.style.width = `${px1 - px0 + THUMB}px`;
    range.style.left = `${px0 - THUMB / 2}px`;
    range.style.top = `${axisY - 22}px`;
    place(false);
  }
  function place(say) {
    const v = st.v;
    const x = geo.X(v);
    // the line follows the thumb at once; its number stays inside the stage at either end
    mark.style.transform = `translateX(${x}px)`;
    num.setAttribute('x', String(Math.max(16, Math.min(geo.W - 16, x)) - x));
    mark.classList.toggle('rare', v > RARE);
    num.textContent = String(v);
    const s = sentence(v);
    desc.textContent = `Average scores in the 2022 study: ${G.map((g) => `${g.name.toLowerCase()} ${g.avg}`).join(', ')}. Marked: ${s}`;
    if (say || !read.textContent) read.textContent = s;
  }
  range.addEventListener('input', () => {
    st.v = Math.round(Number(range.value));
    place(true);
  });

  draw();
  let lastW = stage.clientWidth;
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { const w = stage.clientWidth; if (w !== lastW) { lastW = w; draw(); } }).observe(stage);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
}
