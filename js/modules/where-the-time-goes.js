/* M-PESA Africa, "Where the time goes in one workflow" (3_content/modules/m15-where-the-time-goes.json).
   A worked example (the build tags it Illustration): a feature that reaches customers in 4 months, 1 month of work and
   3 of reviews and waiting. One bar in two tones, work in ink and waiting light, with the original length as a faint
   outline; one three-way choice; one readout line. Under reduced motion the bar changes length without moving. */
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, text) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const sv = (tag, attrs = {}, text) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const phone = matchMedia('(max-width: 599px)');

// what each choice keeps of the work and of the waiting
const CHOICES = [
  { label: 'Halve the work', keepWork: 0.5, keepWait: 1 },
  { label: 'Halve the waiting', keepWork: 1, keepWait: 0.5 },
  { label: 'Both', keepWork: 0.5, keepWait: 0.5 },
];
// a duration as it is said: "half a month", "1 month", "1.5 months", "3 months"
const said = (m) => (m === 0.5 ? 'half a month' : `${Number.isInteger(m) ? m : m.toFixed(1)} ${m === 1 ? 'month' : 'months'}`);

export async function mount(section, dataUrl) {
  const stage = section.querySelector('[data-stage]');
  if (!stage) throw new Error('where-the-time-goes: no stage');
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error('where-the-time-goes: no data');
  const data = await res.json();
  const ex = ((data.files || {})['where-the-time-goes.json'] || {}).example;
  if (!ex || !(ex.work_months > 0) || !(ex.waiting_months > 0)) throw new Error('where-the-time-goes: no example');
  const WORK = ex.work_months, WAIT = ex.waiting_months, ALL = WORK + WAIT;
  let k = 0;
  const parts = (i) => { const c = CHOICES[i]; const w = WORK * c.keepWork, q = WAIT * c.keepWait; return { w, q, t: w + q }; };

  stage.textContent = '';
  const svg = sv('svg', { role: 'img' });
  // the one control
  const seg = el('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'What to halve' });
  const radios = CHOICES.map((c, i) => {
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
  let g = null; // the marks that change: { work, wait, waitLabel, workText }
  function draw() {
    const W = stage.getBoundingClientRect().width;
    const ph = phone.matches;
    const barH = ph ? 40 : 48, top = 26, H = top + barH + 28;
    const x = (m) => (m / ALL) * (W - 1);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.height = `${H}px`;
    svg.textContent = '';
    // the original length: a faint outline, labeled at its end
    svg.appendChild(sv('rect', { x: 0.5, y: top + 0.5, width: W - 1, height: barH - 1, class: 'd-ref no-fill', 'stroke-dasharray': '3 3' }));
    svg.appendChild(sv('text', { x: W, y: 15, 'text-anchor': 'end' }, said(ALL)));
    // the bar: each segment is drawn full length and scaled, so a change of length is one transform
    const wait = sv('rect', { x: 0, y: top, width: W - 1, height: barH, class: 'd-light anim' });
    const work = sv('rect', { x: 0, y: top, width: W - 1, height: barH, class: 'd-claim no-stroke anim' });
    svg.append(wait, work);
    const workText = sv('text', { x: 0, y: 15, class: 't-ink' });
    const waitLabel = sv('text', { x: 0, y: top + barH + 20, class: 't-ink anim' });
    svg.append(workText, waitLabel);
    g = { work, wait, workText, waitLabel, x, W };
    read.style.minHeight = ph ? '3em' : '';
    show(false);
  }
  const label = (node, name, m) => { node.textContent = ''; node.append(sv('tspan', { class: 't-strong' }, name), `, ${said(m)}`); };
  function show(announce) {
    const { w, q, t } = parts(k);
    const { x, W } = g;
    const s = (m) => (x(m) / (W - 1)).toFixed(5);
    g.work.style.transform = `scale(${s(w)}, 1)`;
    g.wait.style.transform = `translate(${x(w).toFixed(2)}px, 0px) scale(${s(q)}, 1)`;
    g.waitLabel.style.transform = `translate(${x(w).toFixed(2)}px, 0px)`;
    label(g.workText, 'Work', w);
    label(g.waitLabel, 'Waiting', q);
    svg.setAttribute('aria-label', `A bar of ${said(ALL)}, now ${said(w)} of work and ${said(q)} of reviews and waiting: ${said(t)} in all.`);
    const line = `The feature reaches customers in ${said(t)} instead of ${ALL}.`;
    if (announce || read.textContent !== line) read.textContent = line;
  }
  function pick(i) {
    if (i === k) return;
    k = i;
    radios.forEach((b, j) => { b.setAttribute('aria-checked', j === k ? 'true' : 'false'); b.tabIndex = j === k ? 0 : -1; });
    show(true);
  }

  draw();
  let lastW = stage.getBoundingClientRect().width;
  new ResizeObserver(() => { const w = stage.getBoundingClientRect().width; if (Math.abs(w - lastW) > 0.5) { lastW = w; draw(); } }).observe(stage);
  phone.addEventListener('change', draw);
}
