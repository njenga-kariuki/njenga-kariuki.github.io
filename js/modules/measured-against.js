/* Health AI portfolio, "Three products, three clinical references" (3_content/modules/m10-measured-against-what.json).
   v2.7 (D-058, rule 5: the whole claim at rest): the three products side by side, each a chain down the same four rows:
   what the phone saw, what it was checked against (and on how many people), the result, and where and when the paper was
   published. The control picks one product to read on its own; at rest all three show. The Body error, its limit and its
   sample come from body-accuracy-vs-dxa-2022.json (m10-s031; m10-n013, m10-n036); the other samples and the dates are
   records: Movement 150 adults (m10-n014), waist-to-hip 1,200 people (m10-n015), published 29 June 2022 (m10-e017),
   6 September 2022 (m10-e021) and 11 September 2023 (m10-e039). Words match lib/tables_m10_measured_against_what.py. */
const el = (tag, attrs = {}, text) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const num = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// v2.15 (D-075): X-ray never breaks at its hyphen (D-063), in this table as in the page's text
const whole = (e, x) => { x.split(/(X-ray)/).forEach((v) => { if (v) e.append(v === 'X-ray' ? el('span', { class: 'nw' }, v) : v); }); return e; };

/* the three products: the words, the people each study measured, and when its paper was published */
const PRODUCTS = [
  { label: 'Body', when: 'June 2022', people: 'adults',
    saw: 'Front and back photos', against: 'DXA, a clinical X-ray scan',
    big: 'About half', small: 'the error of the best smart scale' },
  { label: 'Movement', when: 'September 2022', people: 'adults', count: 150,
    saw: 'Video of five exercises', against: 'A motion-capture suit and 13 clinical tests',
    big: 'Told apart', small: 'athletes, healthy adults and adults with impaired movement' },
  { label: 'Waist-to-hip', when: 'September 2023', people: 'people', count: 1200,
    saw: 'Front, side and back photos', against: 'Tape measures by trained staff',
    big: 'About half', small: 'the error of people measuring themselves' },
];
const ROWS = ['The phone saw', 'Checked against', 'The result', 'Published'];

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
  let k = -1;

  stage.textContent = '';
  // the instrument is a table: products across, the chain of each study down
  const table = el('table', { class: 'm10x' });
  table.appendChild(el('caption', { class: 'vh' }, 'Three products, each checked against its own clinical reference, and where each study was published'));
  const thead = el('thead');
  const hr = el('tr');
  hr.appendChild(el('td', { class: 'm10x-corner' }));
  P.forEach((p, i) => { const th = el('th', { scope: 'col', 'data-c': String(i) }, p.label); hr.appendChild(th); });
  thead.appendChild(hr);
  table.appendChild(thead);
  const tbody = el('tbody');
  ROWS.forEach((r, j) => {
    const tr = el('tr', { 'data-r': String(j) });
    tr.appendChild(el('th', { scope: 'row' }, r));
    P.forEach((p, i) => {
      const td = el('td', { 'data-c': String(i) });
      if (j === 0) td.appendChild(el('span', { class: 'm10x-v' }, p.saw));
      if (j === 1) td.appendChild(whole(el('span', { class: 'm10x-v' }), p.against));
      if (j === 2) { td.appendChild(el('span', { class: 'm10x-big' }, p.big)); td.appendChild(el('span', { class: 'm10x-s' }, p.small)); }
      if (j === 3) { td.appendChild(el('span', { class: 'm10x-v' }, 'npj Digital Medicine')); td.appendChild(el('span', { class: 'm10x-s' }, p.when)); }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  // one product at a time, or all three: a second press returns to all
  const seg = el('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Product' });
  // a phone's label for the third product, so the control never wraps: Waist-hip (v2.7)
  const SHORT = { 'Waist-to-hip': 'Waist-hip' };
  const radios = P.map((p, i) => {
    const b = el('button', { type: 'button', role: 'radio', 'aria-checked': 'false', tabindex: i === 0 ? '0' : '-1', style: 'text-align: center' });
    // the name a reader hears is the one on the screen: the stylesheet shows one of the two (display: none hides the other)
    if (SHORT[p.label]) b.append(el('span', { class: 'm10x-lw' }, p.label), el('span', { class: 'm10x-ln' }, SHORT[p.label]));
    else b.textContent = p.label;
    b.addEventListener('click', () => pick(i === k ? -1 : i));
    seg.appendChild(b);
    return b;
  });
  seg.addEventListener('keydown', (e) => {
    const n = radios.length;
    const c = Math.max(0, k);
    const to = { ArrowRight: c + 1, ArrowDown: c + 1, ArrowLeft: c - 1 + n, ArrowUp: c - 1 + n, Home: 0, End: n - 1, Escape: -1 }[e.key];
    if (to == null) return;
    e.preventDefault();
    pick(to < 0 ? -1 : to % n);
    if (k >= 0) radios[k].focus();
  });
  const controls = el('div', { class: 'm-controls' });
  controls.appendChild(seg);
  const read = el('p', { class: 'm-read', 'aria-live': 'polite' });
  stage.append(table, controls, read);

  const ALL = 'All three studies were published in npj Digital Medicine, in 2022 and 2023.';
  function pick(i) {
    k = i;
    radios.forEach((b, j) => { b.setAttribute('aria-checked', j === k ? 'true' : 'false'); b.tabIndex = j === Math.max(0, k) ? 0 : -1; });
    if (k < 0) table.removeAttribute('data-pick'); else table.setAttribute('data-pick', String(k));
    const p = P[k];
    read.textContent = k < 0 ? ALL : `${p.label}: published in npj Digital Medicine in ${p.when}.`;
  }
  pick(-1);
}
