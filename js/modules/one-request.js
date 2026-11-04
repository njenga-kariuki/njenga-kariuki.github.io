/* Alexa Shopping, "One request, judged by its offer" (3_content/modules/m05-judge-the-turn.json).
   One of Amazon's published requests, "Alexa, order Bose Soundlink three" (its Prime Day 2017 release), and three
   example replies. One segmented control picks Alexa's reply; under the request, a mark shows whether the offer kept
   each word the customer said (brand, product, model); the readout gives the turn's verdict and why. The replies and
   verdicts are examples (judged-turn-example-illustrative.json; request-paths-illustrative.json). */
const NS = 'http://www.w3.org/2000/svg';
const PHONE = '(max-width: 599px)';
const START = 1; // the close miss: the right brand and product, another model
// the control's names for the three replies, and which of the request's words each offer kept, by its relevance level
const NAME = { 'Full match': 'The model asked for', 'Product-type match': 'Another model', 'No match': 'Nothing found' };
const KEPT = { 'Full match': () => true, 'Product-type match': (slot) => slot !== 'model', 'No match': () => false };
const SLOTS = ['brand', 'product', 'model']; // the request's words that name the product, in the order spoken
const LC = 112; // the label column, above the phone breakpoint

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
    const why = (lines.outcomes.find((p) => p.worked_turn_index === i) || {}).line;
    if (!NAME[o.shopping_relevance] || !why) throw new Error('data');
    return { name: NAME[o.shopping_relevance], reply: o.alexa_offer, ok: /^success/i.test(o.shopping_verdict), why,
      kept: slots.map((x) => KEPT[o.shopping_relevance](x.slot)) };
  });

  const st = { i: START };
  stage.innerHTML = '';
  const svg = sv('svg', { role: 'img', 'aria-labelledby': 'turn-desc' });
  const desc = sv('desc', { id: 'turn-desc' });
  const ruler = sv('text', { class: 't-big', visibility: 'hidden', 'aria-hidden': 'true' });
  const fixed = sv('g');
  const marks = sv('g');
  const reply = sv('g');
  svg.append(desc, ruler, fixed, marks, reply);
  const read = el('div', { class: 'm-read', 'aria-live': 'polite' });
  const controls = el('div', { class: 'm-controls' });
  controls.appendChild(segmented('Alexa’s reply', R.map((r) => r.name), START, (i) => { st.i = i; place(true); }));
  stage.append(svg, controls, read);

  const width = (text, cls, size) => {
    ruler.setAttribute('class', cls);
    ruler.style.fontSize = size ? `${size}px` : '';
    ruler.textContent = text;
    return ruler.getComputedTextLength();
  };
  const wrap = (text, max, size) => {
    const out = [];
    let cur = '';
    text.split(' ').forEach((w) => {
      const next = cur ? `${cur} ${w}` : w;
      if (cur && width(next, 't-ink', size) > max) { out.push(cur); cur = w; } else cur = next;
    });
    if (cur) out.push(cur);
    return out;
  };

  let geo = null;
  function draw() {
    const W = Math.max(280, Math.round(stage.clientWidth));
    const phone = matchMedia(PHONE).matches;
    const x0 = phone ? 0 : LC;
    // the readout keeps the height of its longest sentence: two lines on a phone, one above it
    read.style.minHeight = phone ? '3em' : '1.5em';
    // the request in large type: one line beside the labels; on a phone, two lines broken before the first word that
    // names the product, so the marks sit under one line and the height never changes with the width
    const words = `“${said}.”`.split(' ');
    const first = words.findIndex((w) => slots.some((x) => bare(w) === x.word));
    const space = width('a b', 't-big') - width('ab', 't-big');
    const quote = phone && first > 0 ? [words.slice(0, first), words.slice(first)] : [words];
    const qy = phone ? [44, 72] : [28];
    const markY = qy[quote.length - 1] + 18;
    const replyY = phone ? markY + 64 : markY + 46;
    const H = replyY + 22 + 8; // two lines of reply: the longest wraps to two at 328 px
    geo = { W, x0, replyY };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    fixed.innerHTML = '';
    marks.innerHTML = '';
    fixed.appendChild(sv('text', { x: '0', y: String(phone ? 14 : qy[0]) }, 'Customer'));
    fixed.appendChild(sv('text', { x: '0', y: String(phone ? replyY - 26 : replyY) }, 'Alexa'));
    // each word set on its own, so a mark can sit under the words that name the product
    geo.slotX = [];
    quote.forEach((ws, li) => {
      let x = x0;
      ws.forEach((w) => {
        fixed.appendChild(sv('text', { class: 't-big', x: String(x), y: String(qy[li]) }, w));
        const k = slots.findIndex((s) => bare(w) === s.word);
        if (k >= 0) {
          const core = w.replace(/^[“"]+/, '').replace(/[.,!?”"]+$/, '');
          const lead = w.length - w.replace(/^[“"]+/, '').length;
          geo.slotX[k] = x + width(w.slice(0, lead), 't-big') + width(core, 't-big') / 2;
        }
        x += width(w, 't-big') + space;
      });
    });
    geo.markY = markY;
    place(false);
  }
  const check = (x, y) => sv('path', { class: 'd-claim no-fill', d: `M${x - 6} ${y} l4 4.5 l8 -9`, 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const cross = (x, y) => sv('path', { class: 'd2 no-fill', d: `M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10`, 'stroke-width': '2', 'stroke-linecap': 'round' });
  function place(say) {
    const r = R[st.i];
    const { W, x0, replyY, markY, slotX } = geo;
    marks.innerHTML = '';
    r.kept.forEach((k, j) => marks.appendChild((k ? check : cross)(slotX[j], markY)));
    reply.innerHTML = '';
    wrap(r.reply, W - x0, 16).forEach((t, j) => reply.appendChild(sv('text', { class: 't-ink', x: String(x0), y: String(replyY + j * 22), style: 'font-size: 16px' }, t)));
    const verdict = r.ok ? 'Success.' : 'Failure.';
    const kept = slots.filter((x, j) => r.kept[j]).map((x) => x.word);
    desc.textContent = `The customer said: ${said}. Alexa’s reply: ${r.reply}. Words the offer kept: ${kept.length ? kept.join(', ') : 'none'}.`;
    if (say || !read.textContent) {
      read.innerHTML = '';
      read.append(el('b', { text: verdict }), document.createTextNode(` ${r.why}`));
    }
  }

  draw();
  let lastW = stage.clientWidth;
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { const w = stage.clientWidth; if (w !== lastW) { lastW = w; draw(); } }).observe(stage);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
}
