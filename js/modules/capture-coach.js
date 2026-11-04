/* Halo Body, "The capture coach, step by step" (3_content/modules/m07-capture-coach.json).
   The four steps of a scan, each drawn as the phone's screen: the phone level on a surface, the member stepped back
   until the whole body fits, arms and legs in the outline, then four photos. One segmented control picks the step;
   on a wide stage all four screens stand in a row and the picked one is lit, on a phone the picked screen stands
   alone. The drawings are this site's, after Amazon's patent drawings of the capture screens; the distance and the
   photos come from capture-and-guardrails.json. */
const NS = 'http://www.w3.org/2000/svg';
const PHONE = '(max-width: 599px)';
const STEPS = ['Level', 'Distance', 'Pose', 'Photos'];
const START = 0;
const DIM = 0.28; // the screens not picked, on a wide stage
// a figure in units of its height, from the feet up: limbs hang from joints and turn outward by these angles
const POSE = { rest: { arm: 5, leg: 0 }, a: { arm: 27, leg: 8 } };
const BODY = { torso: 0.15, shoulder: 0.115, arm: 0.045, hip: 0.045, leg: 0.062 }; // widths and joints, in heights

const el = (tag, attrs = {}) => {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => { if (k === 'text') n.textContent = v; else n.setAttribute(k, v); });
  return n;
};
const sv = (tag, attrs = {}, text) => {
  const n = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, String(v)));
  if (text != null) n.textContent = text;
  return n;
};
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const r1 = (v) => Math.round(v * 10) / 10;

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

// a person, drawn as a pictogram with its feet at the origin. Front and back: arms and legs turn at their joints, so
// a pose can move. Side: one arm, one leg, a foot pointing the way the person faces (-1 left, 1 right).
function person(h, pose) {
  const g = sv('g');
  const limbs = [];
  if (pose === 'left' || pose === 'right') {
    const f = pose === 'left' ? -1 : 1;
    g.appendChild(sv('circle', { class: 'no-stroke', cx: r1(f * 0.012 * h), cy: r1(-0.92 * h), r: r1(0.07 * h) }));
    g.appendChild(sv('line', { x1: 0, y1: r1(-0.74 * h), x2: 0, y2: r1(-0.5 * h), 'stroke-width': r1(0.11 * h), 'stroke-linecap': 'round' }));
    g.appendChild(sv('line', { x1: 0, y1: r1(-0.42 * h), x2: 0, y2: r1(-0.03 * h), 'stroke-width': r1(0.075 * h), 'stroke-linecap': 'round' }));
    g.appendChild(sv('line', { x1: 0, y1: r1(-0.012 * h), x2: r1(f * 0.07 * h), y2: r1(-0.012 * h), 'stroke-width': r1(0.045 * h), 'stroke-linecap': 'round' }));
    // the arm in front of the body, set off from it by a paper edge
    g.appendChild(sv('line', { x1: r1(f * 0.01 * h), y1: r1(-0.74 * h), x2: r1(f * 0.03 * h), y2: r1(-0.44 * h), 'stroke-width': r1(0.085 * h), 'stroke-linecap': 'round', style: 'stroke: var(--paper)' }));
    g.appendChild(sv('line', { x1: r1(f * 0.01 * h), y1: r1(-0.74 * h), x2: r1(f * 0.03 * h), y2: r1(-0.44 * h), 'stroke-width': r1(0.05 * h), 'stroke-linecap': 'round' }));
    return { g, limbs };
  }
  g.appendChild(sv('circle', { class: 'no-stroke', cx: 0, cy: r1(-0.92 * h), r: r1(0.07 * h) }));
  g.appendChild(sv('line', { x1: 0, y1: r1(-0.74 * h), x2: 0, y2: r1(-0.5 * h), 'stroke-width': r1(BODY.torso * h), 'stroke-linecap': 'round' }));
  [['arm', -1], ['arm', 1], ['leg', -1], ['leg', 1]].forEach(([kind, side]) => {
    const arm = kind === 'arm';
    const j = arm ? [side * BODY.shoulder * h, -0.765 * h] : [side * BODY.hip * h, -0.41 * h];
    const lg = sv('g', { class: 'anim' });
    lg.appendChild(sv('line', { x1: 0, y1: 0, x2: 0, y2: r1((arm ? 0.34 : 0.385) * h), 'stroke-width': r1((arm ? BODY.arm : BODY.leg) * h), 'stroke-linecap': 'round' }));
    g.appendChild(lg);
    limbs.push({ lg, kind, side, j });
  });
  setPose(limbs, pose);
  return { g, limbs };
}
function setPose(limbs, pose) {
  limbs.forEach((l) => { l.lg.style.transform = `translate(${r1(l.j[0])}px, ${r1(l.j[1])}px) rotate(${-l.side * POSE[pose][l.kind]}deg)`; });
}
// the outline of a figure in the A pose: a thin gray edge, drawn as a wide gray figure under a paper one
function outline(h) {
  const g = sv('g');
  const parts = (grow, style) => {
    const p = sv('g', { style });
    p.appendChild(sv('circle', { class: 'no-stroke', cx: 0, cy: r1(-0.92 * h), r: r1(0.07 * h + grow / 2) }));
    p.appendChild(sv('line', { x1: 0, y1: r1(-0.74 * h), x2: 0, y2: r1(-0.5 * h), 'stroke-width': r1(BODY.torso * h + grow), 'stroke-linecap': 'round' }));
    [['arm', -1], ['arm', 1], ['leg', -1], ['leg', 1]].forEach(([kind, side]) => {
      const arm = kind === 'arm';
      const a = (-side * POSE.a[kind] * Math.PI) / 180;
      const L = (arm ? 0.34 : 0.385) * h;
      const x = side * (arm ? BODY.shoulder : BODY.hip) * h;
      const y = (arm ? -0.765 : -0.41) * h;
      p.appendChild(sv('line', { x1: r1(x), y1: r1(y), x2: r1(x - L * Math.sin(a)), y2: r1(y + L * Math.cos(a)), 'stroke-width': r1((arm ? BODY.arm : BODY.leg) * h + grow), 'stroke-linecap': 'round' }));
    });
    return p;
  };
  const gap = Math.max(6, 0.045 * h);
  g.appendChild(parts(gap + 3, 'fill: var(--data-ref); stroke: var(--data-ref)'));
  g.appendChild(parts(gap, 'fill: var(--paper); stroke: var(--paper)'));
  return g;
}
const check = (x, y, s) => sv('path', { class: 'd-claim no-fill', d: `M${r1(x - s)} ${r1(y)} l${r1(s * 0.7)} ${r1(s * 0.75)} l${r1(s * 1.4)} ${r1(-s * 1.5)}`, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

export function mount(section, dataUrl) {
  return fetch(dataUrl)
    .then((r) => { if (!r.ok) throw new Error('data'); return r.json(); })
    .then((data) => build(section, data));
}

function build(section, data) {
  const stage = section.querySelector('[data-stage]');
  const items = ((data.files || {})['capture-and-guardrails.json'] || {}).items;
  if (!stage || !Array.isArray(items)) throw new Error('data');
  const value = (name) => String((items.find((x) => x.item === name) || {}).value || '');
  // the member's distance at launch ("about 4 to 6 feet"), with meters beside it
  const feet = value('Distance from phone').replace(/\s*\(.*\)\s*$/, '');
  const ft = feet.match(/(\d+(?:\.\d+)?) to (\d+(?:\.\d+)?) feet/);
  // the photos ("4 (front, back, left, right)") and the height the patent's first screen asks for
  const photos = value('Photos per scan').match(/^(\d+)\s*\((.*)\)$/);
  const high = value('Capture screens (patent drawings)').match(/SURFACE (ABOUT [A-Z ]+?)'/);
  if (!ft || !photos || !high) throw new Error('data');
  const meters = `${(ft[1] * 0.3048).toFixed(1)} to ${(ft[2] * 0.3048).toFixed(1)} m`;
  const views = photos[2].split(/,\s*/);
  if (views.length !== 4) throw new Error('data');
  const NAMES = views.map((v) => v.charAt(0).toUpperCase() + v.slice(1));
  const list = `${views.slice(0, -1).join(', ')} and ${views[views.length - 1]}`;
  const SAY = [
    `The phone stands upright on a surface, ${high[1].toLowerCase()}.`,
    `The member steps back, ${feet} (${meters}).`,
    'Arms and legs move into the outline on the screen.',
    `Four photos: ${list}.`,
  ];

  const st = { i: START };
  stage.innerHTML = '';
  const svg = sv('svg', { role: 'img', 'aria-labelledby': 'cc4-desc' });
  const desc = sv('desc', { id: 'cc4-desc' });
  const defs = sv('defs');
  const scene = sv('g');
  svg.append(desc, defs, scene);
  const read = el('div', { class: 'm-read', 'aria-live': 'polite' });
  const controls = el('div', { class: 'm-controls' });
  controls.appendChild(segmented('Capture step', STEPS, START, (i) => { st.i = i; show(true); }));
  stage.append(svg, controls, read);

  // one phone with the screen of step k; returns its group and the motion that brings its screen to rest
  function phone(k, x, y, w, id) {
    const h = 2 * w;
    const g = sv('g', { class: 'anim', transform: `translate(${r1(x)} ${r1(y)})` });
    const s = 0.055 * w;
    const sw = w - 2 * s;
    const sh = h - 2 * s;
    const clip = sv('clipPath', { id });
    clip.appendChild(sv('rect', { x: r1(s), y: r1(s), width: r1(sw), height: r1(sh), rx: r1(0.11 * w) }));
    defs.appendChild(clip);
    const screen = sv('g', { 'clip-path': `url(#${id})` });
    const inner = sv('g', { class: 'd-claim', transform: `translate(${r1(s)} ${r1(s)})` });
    screen.appendChild(inner);
    g.appendChild(screen);
    g.appendChild(sv('rect', { class: 'd-claim no-fill', x: 0.75, y: 0.75, width: r1(w - 1.5), height: r1(h - 1.5), rx: r1(0.16 * w), 'stroke-width': 1.5 }));
    g.appendChild(sv('rect', { class: 'd-claim no-stroke', x: r1(w / 2 - 0.14 * w), y: r1(s + 0.035 * w), width: r1(0.28 * w), height: r1(0.07 * w), rx: r1(0.035 * w) }));
    let from = () => {};
    let to = () => {};
    // a standing figure as tall as the screen allows with its arms out and its outline inside the edges
    const fit = Math.min(sh * 0.74, (sw / 2 - 6) / 0.33);
    const feet = sh * 0.9;
    if (k === 0) {
      // a level: a bubble between two ticks, and a check once the phone is upright
      const ly = sh * 0.58;
      const pw = sw * 0.66;
      const ph = Math.max(15, sw * 0.16);
      inner.appendChild(sv('rect', { class: 'd-claim no-fill', x: r1((sw - pw) / 2), y: r1(ly - ph / 2), width: r1(pw), height: r1(ph), rx: r1(ph / 2), 'stroke-width': 1.5 }));
      [-1, 1].forEach((d) => inner.appendChild(sv('line', { class: 'd-claim', x1: r1(sw / 2 + d * ph * 0.62), x2: r1(sw / 2 + d * ph * 0.62), y1: r1(ly - ph * 0.3), y2: r1(ly + ph * 0.3), 'stroke-width': 1.5 })));
      const bubble = sv('circle', { class: 'd-claim no-stroke anim', cx: r1(sw / 2), cy: r1(ly), r: r1(ph * 0.3) });
      const ok = sv('g', { class: 'anim' });
      ok.appendChild(sv('circle', { class: 'd-claim no-fill', cx: r1(sw / 2), cy: r1(sh * 0.38), r: r1(sw * 0.16), 'stroke-width': 1.5 }));
      ok.appendChild(check(sw / 2 - sw * 0.01, sh * 0.38 + sw * 0.01, sw * 0.065));
      inner.append(bubble, ok);
      from = () => { bubble.style.transform = `translateX(${r1(pw * 0.32)}px)`; ok.style.opacity = '0'; };
      to = () => { bubble.style.transform = 'translateX(0px)'; ok.style.opacity = '1'; };
    } else if (k === 1) {
      // too close: the body overflows the screen (light); stepped back: the whole body fits
      const h0 = fit;
      const h1 = fit * 1.6;
      const ghost = person(h1, 'a');
      ghost.g.setAttribute('transform', `translate(${r1(sw / 2)} ${r1(sh * 1.1)})`);
      ghost.g.setAttribute('style', 'fill: var(--data-grid); stroke: var(--data-grid)');
      const body = person(h0, 'a');
      body.g.setAttribute('class', 'anim');
      inner.append(ghost.g, body.g);
      const at = (foot, sc) => `translate(${r1(sw / 2)}px, ${r1(foot)}px) scale(${sc})`;
      from = () => { body.g.style.transform = at(sh * 1.1, h1 / h0); };
      to = () => { body.g.style.transform = at(feet, 1); };
      to();
    } else if (k === 2) {
      // the outline of the pose, and the body moving into it
      const line = outline(fit);
      line.setAttribute('transform', `translate(${r1(sw / 2)} ${r1(feet)})`);
      const body = person(fit, 'a');
      body.g.setAttribute('transform', `translate(${r1(sw / 2)} ${r1(feet)})`);
      inner.append(line, body.g);
      from = () => setPose(body.limbs, 'rest');
      to = () => setPose(body.limbs, 'a');
    } else {
      // the four photos: front, back, left and right
      const cw = sw / 2;
      const ch = sh / 2;
      inner.appendChild(sv('line', { class: 'd-grid', x1: r1(cw), x2: r1(cw), y1: 0, y2: r1(sh) }));
      inner.appendChild(sv('line', { class: 'd-grid', x1: 0, x2: r1(sw), y1: r1(ch), y2: r1(ch) }));
      const cells = NAMES.map((name, j) => {
        const cx = (j % 2) * cw + cw / 2;
        const top = Math.floor(j / 2) * ch;
        const c = sv('g', { class: 'anim' });
        c.style.transitionDelay = `${j * 60}ms`;
        const who = person(ch * 0.62, j < 2 ? 'a' : views[j] === 'left' ? 'left' : 'right');
        who.g.setAttribute('transform', `translate(${r1(cx)} ${r1(top + ch * 0.76)})`);
        c.appendChild(who.g);
        c.appendChild(sv('text', { class: 'no-stroke', x: r1(cx), y: r1(top + ch - 8), 'text-anchor': 'middle', style: 'fill: var(--ink-2)' }, name));
        inner.appendChild(c);
        return c;
      });
      from = () => cells.forEach((c) => { c.style.opacity = '0'; });
      to = () => cells.forEach((c) => { c.style.opacity = '1'; });
    }
    return { g, from, to };
  }

  let shown = [];
  let wide = true;
  function draw() {
    const W = Math.max(280, Math.round(stage.clientWidth));
    wide = !matchMedia(PHONE).matches;
    defs.innerHTML = '';
    scene.innerHTML = '';
    let H;
    if (wide) {
      // four screens in a row on one surface, spaced across the stage (the gap stops growing past a wide stage)
      const w = 120;
      const gap = Math.min(96, (W - 4 * w) / 3);
      const y = 6;
      H = y + 2 * w + 10;
      shown = STEPS.map((_, k) => phone(k, k * (w + gap), y, w, `cc4-clip-${k}`));
      scene.appendChild(sv('line', { class: 'd-axis', x1: 0, x2: r1(W), y1: y + 2 * w + 0.5, y2: y + 2 * w + 0.5 }));
    } else {
      const w = 132;
      H = 2 * w + 16;
      shown = [phone(st.i, (W - w) / 2, 6, w, 'cc4-clip-p')];
      scene.appendChild(sv('line', { class: 'd-axis', x1: 0, x2: r1(W), y1: 2 * w + 6.5, y2: 2 * w + 6.5 }));
    }
    shown.forEach((p) => scene.appendChild(p.g));
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    // the readout keeps the height of its longest sentence: two lines on a phone, one above it
    read.style.minHeight = wide ? '1.5em' : '3em';
    // the resting frame appears complete: no motion on the first draw or a resize
    const moving = [...scene.querySelectorAll('.anim')];
    moving.forEach((n) => { n.style.transition = 'none'; });
    show(false);
    svg.getBoundingClientRect();
    moving.forEach((n) => { n.style.transition = ''; });
  }
  // light the picked step; with motion, its screen plays from its first state to rest
  function show(move) {
    if (!wide && move) {
      const w = 132;
      const W = Math.round(stage.clientWidth);
      defs.innerHTML = '';
      shown.forEach((p) => p.g.remove());
      shown = [phone(st.i, (W - w) / 2, 6, w, 'cc4-clip-p')];
      scene.appendChild(shown[0].g);
    }
    const p = wide ? shown[st.i] : shown[0];
    if (wide) shown.forEach((q, k) => { q.g.style.opacity = k === st.i ? '1' : String(DIM); });
    if (move && !reduced()) {
      const all = [...p.g.querySelectorAll('.anim')];
      all.forEach((n) => { n.style.transition = 'none'; });
      p.from();
      svg.getBoundingClientRect();
      all.forEach((n) => { n.style.transition = ''; });
      requestAnimationFrame(() => p.to());
    } else {
      p.to();
    }
    desc.textContent = `${STEPS[st.i]}. ${SAY[st.i]}`;
    if (move || !read.textContent) read.textContent = SAY[st.i];
  }

  draw();
  let lastW = stage.clientWidth;
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { const w = stage.clientWidth; if (w !== lastW) { lastW = w; draw(); } }).observe(stage);
  }
}
