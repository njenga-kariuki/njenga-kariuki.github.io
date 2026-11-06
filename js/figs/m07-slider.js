/* Halo Body, step 03 (v2.7, D-058): the slider in the reader's hand. The drawing (lib/draw_m07.py, m07-slider) is complete
   without this script: today's body, the same body at the floor as a dashed contour, and the slider's travel. Here the
   reader moves the slider: the body narrows toward the floor and stops hard there, where Body's slider stopped from launch
   day (the bottom of a healthy range for the member's sex and age), and widens past today. No numbers: the chapter gives
   none. The outline is the drawing's own (draw_m07.HALF), recomputed at each fullness. */
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mount(el) {
  const svg = el.querySelector('svg.m07s');
  if (!svg || !svg.dataset.m07) return;
  const D = JSON.parse(svg.dataset.m07);
  const outline = svg.querySelector('.m07s-o');
  const knob = svg.querySelector('.m07s-knob');
  const fill = svg.querySelector('.m07s-fill');
  const stop = svg.querySelector('.m07s-stop');
  const sl = svg.querySelector('.m07s-sl');
  if (!outline || !knob || !fill || !stop || !sl) return;
  const span = D.today - D.floor;
  const FMAX = (D.end - D.floor) / span;
  const STEP = 0.05;

  // the closed outline at fullness f (0 = the floor, 1 = today), as draw_m07._outline draws it
  function path(f) {
    const right = D.half.map(([a, b, y]) => [a + (b - a) * f, y]);
    const left = right.slice(0, -1).reverse().map(([x, y]) => [-x, y]);
    const p = right.concat(left);
    const n = p.length;
    let d = `M${p[0][0].toFixed(2)} ${p[0][1].toFixed(2)}`;
    for (let i = 0; i < n; i++) {
      const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
    }
    return d + 'Z';
  }

  // the knob is the control: a slider in the accessibility tree, 44 px to the touch, arrows and Home/End on the keyboard
  knob.setAttribute('role', 'slider');
  knob.setAttribute('tabindex', '0');
  knob.setAttribute('aria-label', 'Body fat, from the floor to more than today');
  knob.setAttribute('aria-valuemin', '0');
  knob.setAttribute('aria-valuemax', String(Math.round(FMAX * 100)));
  svg.classList.add('live');

  let f = 1, thudT = 0;
  const say = (v) => (v <= 0.001 ? 'At the floor: the bottom of a healthy range for the member’s sex and age'
    : Math.abs(v - 1) < 0.025 ? 'Today' : v < 1 ? 'Less body fat than today' : 'More body fat than today');
  function set(nf, user) {
    const v = Math.max(0, Math.min(FMAX, nf));
    if (user && nf < -0.004 && f <= 0.001) thud();
    f = v;
    outline.setAttribute('d', path(v));
    const x = D.floor + v * span;
    knob.setAttribute('transform', `translate(${x.toFixed(2)} ${D.y})`);
    fill.setAttribute('d', `M${D.floor} ${D.y}H${Math.max(D.floor, x).toFixed(2)}`);
    knob.setAttribute('aria-valuenow', String(Math.round(v * 100)));
    knob.setAttribute('aria-valuetext', say(v));
    svg.classList.toggle('at-floor', v <= 0.001);
  }
  // the hard stop: the floor's bar answers a push past it
  function thud() {
    if (reduced()) return;
    clearTimeout(thudT);
    stop.classList.remove('thud');
    void stop.getBoundingClientRect();
    stop.classList.add('thud');
    thudT = setTimeout(() => stop.classList.remove('thud'), 260);
  }

  // the pointer: the knob and the whole track take it; a drag past the floor stays at the floor
  const toF = (e) => {
    const m = svg.getScreenCTM();
    if (!m) return f;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return (pt.x - D.floor) / span;
  };
  const NS = 'http://www.w3.org/2000/svg';
  const track = document.createElementNS(NS, 'rect');
  track.setAttribute('x', String(D.floor - 22));
  track.setAttribute('y', String(D.y - 22));
  track.setAttribute('width', String(D.end - D.floor + 44));
  track.setAttribute('height', '44');
  track.setAttribute('fill', 'transparent');
  track.setAttribute('class', 'm07s-track');
  sl.insertBefore(track, sl.firstChild);
  let drag = null;
  const down = (e) => {
    if (e.button > 0) return;
    drag = e.pointerId;
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('dragging');
    stopDemo();
    set(toF(e), true);
    e.preventDefault();
  };
  track.addEventListener('pointerdown', down);
  knob.addEventListener('pointerdown', down);
  svg.addEventListener('pointermove', (e) => { if (drag === e.pointerId) set(toF(e), true); });
  const up = (e) => { if (drag !== e.pointerId) return; drag = null; svg.classList.remove('dragging'); };
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', up);
  knob.addEventListener('keydown', (e) => {
    const k = e.key;
    let nf = null;
    if (k === 'ArrowLeft' || k === 'ArrowDown') nf = f - STEP;
    else if (k === 'ArrowRight' || k === 'ArrowUp') nf = f + STEP;
    else if (k === 'Home') nf = 0;
    else if (k === 'End') nf = FMAX;
    if (nf == null) return;
    e.preventDefault();
    stopDemo();
    set(nf, true);
  });

  // once, as the drawing arrives: the slider runs down to the floor, stops, and returns to today
  let demo = 0, demoOn = false;
  function stopDemo() { demoOn = false; cancelAnimationFrame(demo); }
  function play() {
    if (reduced()) return;
    demoOn = true;
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const leg = (from, to, ms, next) => {
      const s = performance.now();
      const tick = (now) => {
        if (!demoOn) return;
        const p = Math.min(1, (now - s) / ms);
        set(from + (to - from) * ease(p), false);
        if (p < 1) demo = requestAnimationFrame(tick);
        else if (next) next();
      };
      demo = requestAnimationFrame(tick);
    };
    leg(1, 0, 900, () => { thud(); setTimeout(() => demoOn && leg(0, 1, 640, () => { demoOn = false; }), 520); });
    return t0;
  }
  set(1, false);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { io.disconnect(); setTimeout(play, 300); } }), { threshold: 0.6 });
    io.observe(svg);
  }
}
