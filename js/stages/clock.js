/* M-PESA's stage: the customer's clock (v2.7, D-058). One chain of work as one time bar from the first request to the
   result: the six functions are its work blocks, the waiting between them is hatched. The step in view sets the state
   (site.js); this script moves the blocks, the end and the leaders to their names, in the house's easing. The stylesheet
   keys everything else to data-s: the old way's outline and label, the sign-off, the markets, the sentences.
   States: 0 Before, 1 Units (AI shortens one block), 2 Systems (the waiting closes), 3 Standard (risk and compliance
   keep their sign-off), 4 People (eight markets, one standard). The same shares as lib/draw_m15.py. */
const W0 = [0.040, 0.085, 0.060, 0.060, 0.065, 0.035];
const G0 = (1 - W0.reduce((a, b) => a + b, 0)) / 5;
const W1 = [0.040, 0.030, 0.060, 0.060, 0.065, 0.035];
const W2 = [0.040, 0.030, 0.060, 0.060, 0.025, 0.035];
const G2 = 0.012;
const STATES = [
  { w: W0, g: G0, ai: [] },
  { w: W1, g: G0, ai: [1] },
  { w: W2, g: G2, ai: [1, 4] },
  { w: W2, g: G2, ai: [1, 4] },
  { w: W2, g: G2, ai: [1, 4] },
];

function frameOf(k) {
  const st = STATES[k], xs = [];
  let x = 0;
  st.w.forEach((w, i) => { xs.push([x, w]); x += w + (i < 5 ? st.g : 0); });
  return { xs, end: x, ai: st.ai };
}

// the site's one easing curve, cubic-bezier(.16, 1, .3, 1)
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t;
  const dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => {
    let t = x;
    for (let i = 0; i < 6; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-4 || !d) break; t -= e / d; }
    return sy(Math.min(1, Math.max(0, t)));
  };
}
const EASE = bezier(0.16, 1, 0.3, 1);

function setup(sv, $$) {
  let g;
  try { g = JSON.parse(sv.dataset.geo); } catch (e) { return null; }
  const blocks = $$('.clk-b', sv).sort((a, b) => a.dataset.i - b.dataset.i);
  const waits = $$('.clk-q', sv).sort((a, b) => a.dataset.i - b.dataset.i);
  const names = $$('.clk-nm', sv).sort((a, b) => a.dataset.i - b.dataset.i);
  const old = sv.querySelector('.clk-old'), end = sv.querySelector('.clk-end');
  const leaders = names.map(n => n.querySelector('.clk-ld'));
  const oks = names.map(n => n.querySelector('.clk-okw'));
  const f = v => v.toFixed(1);
  return {
    apply(F) {
      const X = x => g.x0 + x * g.L;
      F.xs.forEach(([x, w], i) => {
        blocks[i].setAttribute('x', f(X(x)));
        blocks[i].setAttribute('width', f(Math.max(1, w * g.L)));
        if (i < 5) {
          const a = X(x + w), b = X(F.xs[i + 1][0]);
          waits[i].setAttribute('x', f(a));
          waits[i].setAttribute('width', f(Math.max(0, b - a)));
        }
        // the leader: straight down when the name is under its block, otherwise down to its own level, across and
        // down; the levels step up from left to right, so the leaders never cross as the chain closes
        const bx = X(x + w / 2), n = names[i];
        const slot = +n.dataset.slot, top = +n.dataset.ny, lv = +n.dataset.lv, y0 = g.lead0;
        if (leaders[i]) leaders[i].setAttribute('d', Math.abs(slot - bx) < 1.5 ? `M${f(bx)} ${f(y0)}V${f(top)}` : `M${f(bx)} ${f(y0)}V${f(lv)}H${f(slot)}V${f(top)}`);
        if (oks[i]) oks[i].setAttribute('transform', `translate(${f(bx)} 0)`);
      });
      const ex = X(F.end);
      old.setAttribute('x', f(ex));
      old.setAttribute('width', f(Math.max(0, g.x0 + g.L - ex)));
      end.setAttribute('transform', `translate(${f(ex)} 0)`);
    },
    mark(ai) {
      blocks.forEach((b, i) => b.classList.toggle('ai', ai.includes(i)));
      names.forEach((n, i) => n.classList.toggle('ai', ai.includes(i)));
    },
  };
}

export function wire(st, ctx) {
  const { $$, RM, live } = ctx;
  const views = $$('svg.clk', st).map(sv => setup(sv, $$)).filter(Boolean);
  const modeBtns = $$('.clk-mode button[data-m]', st);
  const marketBtns = $$('.clk-af-node[data-mk]', st);
  const marketOuts = $$('.clk-af-read', st);
  let cur = 0, shown = frameOf(0), raf = 0;
  const paint = F => views.forEach(v => v.apply(F));
  const lerp = (a, b, t) => a + (b - a) * t;
  const syncMode = (k) => {
    const m = k <= 2 ? k : 2;
    modeBtns.forEach(b => {
      const on = parseInt(b.dataset.m, 10) === m && k <= 2;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  };
  function go(k) {
    const from = shown, to = frameOf(k);
    views.forEach(v => v.mark(to.ai));
    syncMode(k);
    cancelAnimationFrame(raf);
    if (RM) { shown = to; paint(to); return; }
    const ms = Math.abs(from.end - to.end) > 0.3 ? 520 : 360, t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / ms), e = EASE(p);
      shown = { xs: from.xs.map(([x, w], i) => [lerp(x, to.xs[i][0], e), lerp(w, to.xs[i][1], e)]), end: lerp(from.end, to.end, e), ai: to.ai };
      paint(shown);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  const SAY = [
    'Before: most of the customer’s wait sits in handoffs between functions.',
    '1 unit with AI: Operations runs faster, yet total time barely shifts because handoffs stay.',
    'Whole system redesigned: handoff queues close end to end.',
  ];
  modeBtns.forEach(b => {
    b.addEventListener('click', () => {
      const k = parseInt(b.dataset.m, 10);
      st.dataset.s = String(k);
      cur = k;
      go(k);
      if (live && SAY[k]) live(SAY[k]);
    });
  });
  marketBtns.forEach(n => {
    const showMk = () => {
      marketBtns.forEach(x => x.classList.toggle('on', x.dataset.mk === n.dataset.mk));
      marketOuts.forEach(out => { out.textContent = `${n.dataset.name} · ${n.dataset.reg}`; });
    };
    n.addEventListener('mouseenter', showMk);
    n.addEventListener('click', showMk);
    n.addEventListener('focus', showMk);
  });
  paint(shown);
  syncMode(0);
  return {
    to(s) {
      const k = Math.max(0, Math.min(4, parseInt(s, 10) || 0));
      st.dataset.s = String(k);
      if (k === cur) { syncMode(k); return; }
      cur = k;
      go(k);
    },
  };
}
