/* Alexa Shopping, "One request, judged by its offer" (3_content/modules/m05-judge-the-turn.json). v2.7 (D-058): the whole
   claim at rest. One of Amazon's published requests, "Alexa, order Bose Soundlink three" (its Prime Day 2017 release), and
   its three example replies, each drawn as its path along the chapter's three steps, Hear, Understand and Offer: where it
   broke, and the verdict. The close miss is open at rest: the right brand and product, another model, judged a failure.
   One segmented control opens a reply: its row, the request's words its offer kept, and the reason. The replies, the
   step where each broke and the verdicts are examples (judged-turn-example-illustrative.json; request-paths-illustrative.json). */
const NS = 'http://www.w3.org/2000/svg';
const PHONE = '(max-width: 599px)';
const START = 1; // the close miss, open at rest; the other two replies are drawn beside it
// the control's names for the three replies (a phone's shorter names fit one line), and which of the request's words each
// offer kept, by its relevance level
const NAME = { 'Full match': 'The model asked for', 'Product-type match': 'Another model', 'No match': 'Nothing found' };
const SHORT = { 'Full match': 'Asked for', 'Product-type match': 'Another', 'No match': 'None' };
const KEPT = { 'Full match': () => true, 'Product-type match': (slot) => slot !== 'model', 'No match': () => false };
const SLOTS = ['brand', 'product', 'model']; // the request's words that name the product, in the order spoken
// the chapter's three steps, and where each of the published steps of a request falls among them
const STEPS = ['Hear', 'Understand', 'Offer'];
const AT = { wake: 0, asr: 0, domain: 1, nlu: 1, rerank: 1, query: 2, offer: 2, confirm: 2 };

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
const bare = (w) => w.replace(/[“”"'.,!?]/g, '').toLowerCase();

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
  group.addEventListener('click', (e) => { const i = buttons.indexOf(e.target.closest('button')); if (i >= 0) set(i, false); });
  group.addEventListener('keydown', (e) => {
    const n = buttons.length;
    const to = { ArrowRight: (cur + 1) % n, ArrowDown: (cur + 1) % n, ArrowLeft: (cur - 1 + n) % n, ArrowUp: (cur - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (to == null) return;
    e.preventDefault();
    set(to, true);
  });
  group.setNames = (names) => buttons.forEach((b, i) => { b.textContent = names[i]; });
  group.select = (i) => set(i, false);
  return group;
}

export function mount(section, dataUrl) {
  return fetch(dataUrl)
    .then((r) => { if (!r.ok) throw new Error('data'); return r.json(); })
    .then((data) => build(section, data));
}

function build(section, data) {
  const stage = section.querySelector('[data-stage]');
  const files = data.files || {};
  const worked = files['judged-turn-example-illustrative.json'];
  const paths = files['request-paths-illustrative.json'];
  const rows = (files['voice-shopping-requests.json'] || {}).requests;
  if (!stage || !worked || !worked.request || !Array.isArray(worked.outcomes) || !paths || !Array.isArray(rows)) throw new Error('data');
  const said = worked.request.utterance;
  const row = rows.find((r) => r.utterance === said);
  const lines = (paths.requests || []).find((r) => r.utterance === said);
  if (!row || !row.slots || !lines || !Array.isArray(lines.outcomes)) throw new Error('data');
  const slots = SLOTS.filter((k) => row.slots[k] != null).map((k) => ({ slot: k, word: String(row.slots[k]).toLowerCase() }));
  if (!slots.length) throw new Error('data');
  const R = worked.outcomes.map((o, i) => {
    const p = lines.outcomes.find((q) => q.worked_turn_index === i) || {};
    if (!NAME[o.shopping_relevance] || !p.line) throw new Error('data');
    const at = p.broke == null ? -1 : AT[p.broke];
    if (at === undefined) throw new Error('data');
    return { name: NAME[o.shopping_relevance], short: SHORT[o.shopping_relevance], reply: o.alexa_offer,
      ok: /^success/i.test(o.shopping_verdict), why: p.line, at, kept: slots.map((x) => KEPT[o.shopping_relevance](x.slot)) };
  });

  const st = { i: START };
  stage.innerHTML = '';
  const svg = sv('svg', { role: 'img', 'aria-labelledby': 'turn-desc', class: 'jt' });
  const desc = sv('desc', { id: 'turn-desc' });
  const ruler = sv('text', { class: 't-big', visibility: 'hidden', 'aria-hidden': 'true' });
  const fixed = sv('g');
  const open = sv('g');
  const marks = sv('g');
  svg.append(desc, ruler, open, fixed, marks);
  const read = el('div', { class: 'm-read', 'aria-live': 'polite' });
  const controls = el('div', { class: 'm-controls' });
  const seg = segmented('Alexa’s reply', R.map((r) => r.name), START, (i) => { st.i = i; place(true); });
  controls.appendChild(seg);
  stage.append(svg, controls, read);

  const width = (text, cls) => {
    ruler.setAttribute('class', cls);
    ruler.textContent = text;
    return ruler.getComputedTextLength();
  };

  let geo = null;
  function draw() {
    const W = Math.max(280, Math.round(stage.clientWidth));
    const phone = matchMedia(PHONE).matches;
    seg.setNames(R.map((r) => (phone ? r.short : r.name)));
    fixed.innerHTML = '';
    // the request in large type, each word set on its own so a mark can sit under the words that name the product; on a
    // phone it breaks before the first of those words, so the marks sit under one line
    const LC = phone ? 0 : 150;
    const words = `“${said}.”`.split(' ');
    const first = words.findIndex((w) => slots.some((x) => bare(w) === x.word));
    const space = width('a b', 't-big') - width('ab', 't-big');
    const quote = phone && first > 0 ? [words.slice(0, first), words.slice(first)] : [words];
    const qy = phone ? [44, 74] : [30];
    const markY = qy[quote.length - 1] + 20;
    fixed.appendChild(sv('text', { class: 'jt-k', x: '0', y: String(phone ? 14 : qy[0]) }, 'Customer'));
    const slotX = [];
    quote.forEach((ws, li) => {
      let x = LC;
      ws.forEach((w) => {
        fixed.appendChild(sv('text', { class: 't-big', x: String(x), y: String(qy[li]) }, w));
        const k = slots.findIndex((s) => bare(w) === s.word);
        if (k >= 0) {
          const core = w.replace(/^[“"]+/, '').replace(/[.,!?”"]+$/, '');
          const lead = w.length - w.replace(/^[“"]+/, '').length;
          slotX[k] = x + width(w.slice(0, lead), 't-big') + width(core, 't-big') / 2;
        }
        x += width(w, 't-big') + space;
      });
    });
    // the three steps, named on the line every reply travels
    const headY = markY + (phone ? 46 : 44);
    const x0 = phone ? 22 : LC + 24;
    const x1 = phone ? W - 26 : Math.min(W - 92, LC + 360);
    const sx = [x0, (x0 + x1) / 2, x1];
    STEPS.forEach((s, i) => fixed.appendChild(sv('text', { class: 'jt-k jt-step', x: String(sx[i]), y: String(headY), 'text-anchor': i === 0 && phone ? 'start' : i === 2 && phone ? 'end' : 'middle' }, s)));
    const pitch = phone ? 58 : 42;
    const rowY = (i) => headY + (phone ? 50 : 34) + i * pitch;
    R.forEach((r, i) => {
      const y = rowY(i);
      const g = sv('g', { class: `jt-row${r.ok ? ' ok' : ''}`, 'data-i': String(i) });
      // the reply's name and verdict: beside the line on a laptop, above it on a phone
      if (phone) {
        g.appendChild(sv('text', { class: 'jt-n', x: '0', y: String(y - 20) }, r.name));
        g.appendChild(sv('text', { class: `jt-v${r.ok ? ' ok' : ''}`, x: String(W), y: String(y - 20), 'text-anchor': 'end' }, r.ok ? 'Success' : 'Failure'));
      } else {
        g.appendChild(sv('text', { class: 'jt-n', x: '0', y: String(y + 5) }, r.name));
        g.appendChild(sv('text', { class: `jt-v${r.ok ? ' ok' : ''}`, x: String(x1 + 26), y: String(y + 5) }, r.ok ? 'Success' : 'Failure'));
      }
      // the path: solid up to the step where it broke, then the steps it never reached
      const stop = r.at < 0 ? 2 : r.at;
      if (stop > 0) g.appendChild(sv('path', { class: 'jt-ln', d: `M${sx[0]} ${y}H${sx[stop]}` }));
      if (r.at >= 0 && r.at < 2) g.appendChild(sv('path', { class: 'jt-ln jt-never', d: `M${sx[r.at]} ${y}H${sx[2]}` }));
      sx.forEach((x, j) => {
        if (r.at >= 0 && j === r.at) g.appendChild(cross(x, y, 'jt-x'));
        else if (r.at >= 0 && j > r.at) g.appendChild(sv('circle', { class: 'jt-off', cx: String(x), cy: String(y), r: '4.5' }));
        else g.appendChild(sv('circle', { class: 'jt-on', cx: String(x), cy: String(y), r: '5' }));
      });
      fixed.appendChild(g);
    });
    const H = rowY(R.length - 1) + (phone ? 18 : 22);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    geo = { W, phone, slotX, markY, rowY, x0, x1, pitch };
    // the readout keeps the height of its longest reply, so the page never jumps
    read.style.minHeight = '';
    let mh = 0;
    R.forEach((r) => { say(r); mh = Math.max(mh, read.offsetHeight); });
    read.style.minHeight = `${mh}px`;
    place(false, true);
  }
  function cross(x, y, cls) {
    return sv('path', { class: cls, d: `M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10` });
  }
  function check(x, y, cls) {
    return sv('path', { class: cls, d: `M${x - 6} ${y} l4 4.5 l8 -9` });
  }
  function say(r) {
    read.innerHTML = '';
    read.append(document.createTextNode(`Alexa’s reply: ${r.reply}. `), el('b', { text: r.ok ? 'Success.' : 'Failure.' }), document.createTextNode(` ${r.why}`));
  }
  function place(announce, quiet) {
    const r = R[st.i];
    const { W, phone, slotX, markY, rowY, pitch } = geo;
    // the open reply: its row stands on the plate's ground, and the marks under the request say which words its offer kept
    open.innerHTML = '';
    const y = rowY(st.i);
    open.appendChild(sv('rect', { class: 'jt-open', x: '-10', y: String(phone ? y - 40 : y - pitch / 2 + 2), width: String(W + 20), height: String(phone ? pitch - 2 : pitch - 4), rx: '8' }));
    svg.querySelectorAll('.jt-row').forEach((g) => g.classList.toggle('on', +g.dataset.i === st.i));
    marks.innerHTML = '';
    r.kept.forEach((k, j) => marks.appendChild(k ? check(slotX[j], markY, 'jt-mk') : cross(slotX[j], markY, 'jt-mx')));
    const kept = slots.filter((x, j) => r.kept[j]).map((x) => x.word);
    desc.textContent = `The customer said: ${said}. Three example replies: ` + R.map((x) => `${x.name}, ${x.ok ? 'success' : `failure at ${STEPS[x.at].toLowerCase()}`}`).join('; ')
      + `. Open: ${r.reply}; words the offer kept: ${kept.length ? kept.join(', ') : 'none'}.`;
    if (announce || quiet || !read.textContent) say(r);
  }

  draw();
  let lastW = stage.clientWidth;
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { const w = stage.clientWidth; if (w !== lastW) { lastW = w; draw(); } }).observe(stage);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
}
