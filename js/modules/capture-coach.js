/* Halo Body, "The capture coach, step by step" (3_content/modules/m07-capture-coach.json), v2.7 (D-058).
   The room from the side: the phone upright on a surface about knee to waist high, the member 4 to 6 feet back along a
   dimension line, and, drawn large beside the room, the phone's screen: the body locked into the pose's outline, and the
   four photos. At rest the drawing shows the finished sequence (rule 5); the four controls open one step each, which plays
   while the others rest. The figures are the site's cast (lib/cast.py and lib/draw_m10.py: the person front on and from
   the side). The distance and the photos come from capture-and-guardrails.json; the words match the table. */
const NS = 'http://www.w3.org/2000/svg';
const PHONE = '(max-width: 599px)';
const STEPS = ['Level', 'Distance', 'Pose', 'Photos'];
const DIM = 0.22;
// the cast, in the 209-unit frame of lib/cast.py (front on) and lib/draw_m10.py (from the side, facing right)
const FRONT = 'M5.4 22 C7.3 23.5 4.2 28.6 5.9 31 C7.6 33.4 12.5 34.7 15.5 36.5 C18.5 38.3 21.8 39.2 24 41.8 C26.2 44.4 27.1 45.6 29 52 C30.9 58.4 33.4 71.3 35.2 80 C37 88.7 38.9 97.7 40 104 C41.1 110.3 41.1 114.2 41.8 118 C42.5 121.8 44.2 123.9 44.4 127 C44.6 130.1 43.9 135 43.2 136.5 C42.5 138 41.1 138.9 40 136.2 C38.9 133.4 38.1 125.7 36.8 120 C35.5 114.3 33.7 108.3 32.2 102 C30.7 95.7 29.1 88.7 27.8 82 C26.5 75.3 25.5 66.8 24.4 62 C23.3 57.2 21.6 52.7 21.2 53.5 C20.8 54.3 21.7 60.9 21.8 67 C21.9 73.1 21.2 83.2 21.6 90 C22 96.8 23.6 102.7 24.2 108 C24.8 113.3 25.4 116.3 25 122 C24.6 127.7 23.4 135.3 21.8 142 C20.2 148.7 16.7 156.3 15.6 162 C14.5 167.7 16 170.3 15 176 C14 181.7 10 191.2 9.6 196 C9.2 200.8 12.2 202.4 12.4 204.5 C12.6 206.6 12.2 207.8 10.8 208.5 C9.4 209.2 5 210.4 4 208.5 C3 206.6 4.7 202.1 4.8 197 C4.9 191.9 4.6 183.8 4.4 178 C4.2 172.2 4.1 168.3 3.6 162 C3.1 155.7 2.2 146.3 1.6 140 C1 133.7 0.5 124 0 124 C-0.5 124 -1 133.7 -1.6 140 C-2.2 146.3 -3.1 155.7 -3.6 162 C-4.1 168.3 -4.2 172.2 -4.4 178 C-4.6 183.8 -4.9 191.9 -4.8 197 C-4.7 202.1 -3 206.6 -4 208.5 C-5 210.4 -9.4 209.2 -10.8 208.5 C-12.2 207.8 -12.6 206.6 -12.4 204.5 C-12.2 202.4 -9.2 200.8 -9.6 196 C-10 191.2 -14 181.7 -15 176 C-16 170.3 -14.5 167.7 -15.6 162 C-16.7 156.3 -20.2 148.7 -21.8 142 C-23.4 135.3 -24.6 127.7 -25 122 C-25.4 116.3 -24.8 113.3 -24.2 108 C-23.6 102.7 -22 96.8 -21.6 90 C-21.2 83.2 -21.9 73.1 -21.8 67 C-21.7 60.9 -20.8 54.3 -21.2 53.5 C-21.6 52.7 -23.3 57.2 -24.4 62 C-25.5 66.8 -26.5 75.3 -27.8 82 C-29.1 88.7 -30.7 95.7 -32.2 102 C-33.7 108.3 -35.5 114.3 -36.8 120 C-38.1 125.7 -38.9 133.4 -40 136.2 C-41.1 138.9 -42.5 138 -43.2 136.5 C-43.9 135 -44.6 130.1 -44.4 127 C-44.2 123.9 -42.5 121.8 -41.8 118 C-41.1 114.2 -41.1 110.3 -40 104 C-38.9 97.7 -37 88.7 -35.2 80 C-33.4 71.3 -30.9 58.4 -29 52 C-27.1 45.6 -26.2 44.4 -24 41.8 C-21.8 39.2 -18.5 38.3 -15.5 36.5 C-12.5 34.7 -7.6 33.4 -5.9 31 C-4.2 28.6 -7.3 23.5 -5.4 22 C-3.5 20.5 3.5 20.5 5.4 22Z';
const SIDE = 'M-4 23.5 C-6.2 24.8 -7.2 27.9 -8.5 31 C-9.8 34.1 -10.8 37.5 -11.5 42 C-12.2 46.5 -12.8 52.3 -12.5 58 C-12.2 63.7 -10.6 71 -10 76 C-9.4 81 -8.6 84 -9 88 C-9.4 92 -11.6 95.8 -12.5 100 C-13.4 104.2 -14.4 108.7 -14.5 113 C-14.6 117.3 -13.7 121.2 -13 126 C-12.3 130.8 -11.4 137.5 -10.5 142 C-9.6 146.5 -7.7 148.7 -7.5 153 C-7.3 157.3 -9.4 162.8 -9.5 168 C-9.6 173.2 -8.7 179.2 -8 184 C-7.3 188.8 -5.7 193.7 -5.5 197 C-5.3 200.3 -6.9 202.1 -7 204 C-7.1 205.9 -10 207.8 -6 208.5 C-2 209.2 13.1 209.1 17 208.5 C20.9 207.9 18.7 206.2 17.5 205 C16.3 203.8 12 202.5 10 201 C8 199.5 6.2 199.8 5.5 196 C4.8 192.2 5.3 184 5.5 178 C5.7 172 6.4 164.7 6.5 160 C6.6 155.3 5.6 154 6 150 C6.4 146 8.2 141 9 136 C9.8 131 10.8 124.7 11 120 C11.2 115.3 10.4 112 10.5 108 C10.6 104 11.4 100.3 11.5 96 C11.6 91.7 11.2 86.7 11 82 C10.8 77.3 9.7 72.7 10 68 C10.3 63.3 12.6 58.3 13 54 C13.4 49.7 13.2 45.5 12.5 42 C11.8 38.5 9.8 35.2 8.5 33 C7.2 30.8 5.7 30.1 5 28.5 C4.3 26.9 6 24.3 4.5 23.5 C3 22.7 -1.8 22.2 -4 23.5Z';
const ARM = 'M-6 36 C-7 39.2 -6.9 46 -7 52 C-7.1 58 -6.8 65.3 -6.5 72 C-6.2 78.7 -5.3 86 -5 92 C-4.7 98 -4.8 103.7 -4.5 108 C-4.2 112.3 -3.9 115.8 -3 118 C-2.1 120.2 -0.2 121.1 1 121 C2.2 120.9 3.9 119.8 4.5 117.5 C5.1 115.2 4.4 111.2 4.5 107 C4.6 102.8 4.8 97.8 5 92 C5.2 86.2 5.4 78.7 5.5 72 C5.6 65.3 5.8 57.7 5.5 52 C5.2 46.3 5.1 41.2 4 38 C2.9 34.8 0.7 33.3 -1 33 C-2.7 32.7 -5 32.8 -6 36Z';

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

// a radiogroup of buttons that can also rest with none picked: arrows move, Home and End, a second press returns to rest
function segmented(name, labels, pick) {
  const group = el('div', { class: 'seg', role: 'radiogroup', 'aria-label': name });
  const buttons = labels.map((t, i) => el('button', { type: 'button', role: 'radio', 'aria-checked': 'false', tabindex: i === 0 ? '0' : '-1', text: t }));
  buttons.forEach((b) => group.appendChild(b));
  let cur = -1;
  const set = (i, focus) => {
    cur = i;
    buttons.forEach((b, j) => { b.setAttribute('aria-checked', String(j === i)); b.tabIndex = j === Math.max(0, i) ? 0 : -1; });
    if (focus && i >= 0) buttons[i].focus();
    pick(i);
  };
  group.addEventListener('click', (e) => {
    const i = buttons.indexOf(e.target.closest('button'));
    if (i < 0) return;
    set(i === cur ? -1 : i, false);
  });
  group.addEventListener('keydown', (e) => {
    const n = buttons.length;
    const c = Math.max(0, cur);
    const to = { ArrowRight: (c + 1) % n, ArrowDown: (c + 1) % n, ArrowLeft: (c - 1 + n) % n, ArrowUp: (c - 1 + n) % n, Home: 0, End: n - 1, Escape: -1 }[e.key];
    if (to == null) return;
    e.preventDefault();
    set(to, to >= 0);
  });
  return group;
}

// the cast: a person front on (feet at 0, h tall) and from the side (facing right, or left with f = -1)
function front(h, cls = '') {
  const k = h / 209;
  const g = sv('g', { class: cls });
  const inner = sv('g', { transform: `translate(0 ${r1(-h)}) scale(${k})` });
  inner.appendChild(sv('path', { class: 'cc-b', d: FRONT, 'vector-effect': 'non-scaling-stroke' }));
  inner.appendChild(sv('ellipse', { class: 'cc-b', cx: 0, cy: 12, rx: 9.6, ry: 12.4, 'vector-effect': 'non-scaling-stroke' }));
  g.appendChild(inner);
  return g;
}
function side(h, f = 1, cls = '') {
  const k = h / 209;
  const g = sv('g', { class: cls });
  const inner = sv('g', { transform: `translate(0 ${r1(-h)}) scale(${f * k} ${k})` });
  inner.appendChild(sv('path', { class: 'cc-b', d: SIDE, 'vector-effect': 'non-scaling-stroke' }));
  inner.appendChild(sv('ellipse', { class: 'cc-b', cx: 2.5, cy: 12, rx: 10.4, ry: 12.2, 'vector-effect': 'non-scaling-stroke' }));
  inner.appendChild(sv('path', { class: 'cc-b', d: ARM, 'vector-effect': 'non-scaling-stroke' }));
  g.appendChild(inner);
  return g;
}
const check = (x, y, s, cls = 'cc-ok') => sv('path', { class: cls, d: `M${r1(x - s)} ${r1(y)} l${r1(s * 0.7)} ${r1(s * 0.75)} l${r1(s * 1.4)} ${r1(-s * 1.5)}` });

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
  const heightWords = high[1].toLowerCase().replace(/^about /, '');
  const SAY = [
    `The phone stands upright on a surface, ${high[1].toLowerCase()}.`,
    `The member steps back, ${feet} (${meters}).`,
    'Arms and legs move into the outline on the screen.',
    `Four photos: ${list}.`,
  ];
  const REST = 'The app checked level, distance and pose, then took four photos.';

  const st = { i: -1 };
  stage.innerHTML = '';
  const svg = sv('svg', { role: 'img', 'aria-labelledby': 'cc7-desc', class: 'cc7' });
  const desc = sv('desc', { id: 'cc7-desc' });
  const scene = sv('g');
  svg.append(desc, scene);
  const read = el('div', { class: 'm-read', 'aria-live': 'polite' });
  const controls = el('div', { class: 'm-controls' });
  controls.appendChild(segmented('Capture step', STEPS, (i) => { st.i = i; show(true); }));
  stage.append(svg, controls, read);

  let parts = null;
  function draw() {
    const W = Math.max(280, Math.round(stage.clientWidth));
    const ph = matchMedia(PHONE).matches || W < 380;
    scene.innerHTML = '';
    // the room's scale: the member's height sets a foot (a person of about 5.5 feet)
    const H = ph ? 176 : 246;
    const FY = ph ? 146 : 204;                  // the floor
    const mh = ph ? 104 : 150;                  // the member's height
    const FT = mh / 5.5;                        // one foot, in units
    const x0 = ph ? 26 : 38;                    // the phone, on its surface
    const surf = mh * (0.27 + 0.55) / 2;        // the surface's top: about knee to waist high
    const roomW = ph ? W * 0.55 : W * 0.6;
    const g = { level: sv('g', { class: 'cc-p' }), dist: sv('g', { class: 'cc-p' }), pose: sv('g', { class: 'cc-p' }), photos: sv('g', { class: 'cc-p' }) };
    // the floor, and the room's far wall as a faint line
    scene.appendChild(sv('path', { class: 'cc-floor', d: `M0 ${FY}H${r1(roomW)}` }));
    // ---- Level: the surface, the phone upright on it, its check
    const tw = ph ? 30 : 40;
    g.level.appendChild(sv('path', { class: 'cc-s', d: `M${r1(x0 - tw / 2)} ${r1(FY - surf)}h${tw}M${r1(x0 - tw / 2 + 4)} ${r1(FY - surf)}V${FY}M${r1(x0 + tw / 2 - 4)} ${r1(FY - surf)}V${FY}` }));
    const phH = ph ? 20 : 26;
    const phone = sv('g', { class: 'cc-anim cc-tilt', style: `transform-origin: ${x0}px ${r1(FY - surf)}px` });
    phone.appendChild(sv('rect', { class: 'cc-b', x: r1(x0 - 2), y: r1(FY - surf - phH), width: 4, height: phH, rx: 2 }));
    g.level.appendChild(phone);
    const lvOk = sv('g', { class: 'cc-anim cc-lv' });
    lvOk.appendChild(check(x0 + 10, FY - surf - phH - 6, ph ? 3.6 : 4.4));
    g.level.appendChild(lvOk);
    if (!ph) {
      // the surface's height, in the patent screen's words, set in two lines beside it
      const hw = `${heightWords.charAt(0).toUpperCase()}${heightWords.slice(1)}`.split(' to ');
      const lab = sv('text', { class: 'cc-t', x: r1(x0 + tw / 2 + 8), y: r1(FY - surf + 4) });
      lab.appendChild(sv('tspan', { x: r1(x0 + tw / 2 + 8), dy: 0 }, `${hw[0]} to`));
      lab.appendChild(sv('tspan', { x: r1(x0 + tw / 2 + 8), dy: 16 }, hw[1] || ''));
      g.level.appendChild(lab);
    }
    // ---- Distance: the member, 4 to 6 feet back along a dimension line on the floor
    const xm = x0 + 5 * FT;
    const near = x0 + 2 * FT;
    const member = sv('g', { class: 'cc-anim cc-walk', 'data-dx': r1(near - xm) });
    const who = side(mh, -1);
    who.setAttribute('transform', `translate(${r1(xm)} ${FY})`);
    member.appendChild(who);
    g.dist.appendChild(member);
    const dy = FY + (ph ? 12 : 16);
    const a = x0 + Number(ft[1]) * FT, b = x0 + Number(ft[2]) * FT;
    g.dist.appendChild(sv('path', { class: 'cc-dim', d: `M${x0} ${dy}H${r1(b)}M${x0} ${dy - 4}v8` }));
    g.dist.appendChild(sv('path', { class: 'cc-zone cc-anim', d: `M${r1(a)} ${dy}H${r1(b)}M${r1(a)} ${dy - 5}v10M${r1(b)} ${dy - 5}v10` }));
    g.dist.appendChild(sv('text', { class: 'cc-t cc-n', x: r1((a + b) / 2), y: dy + (ph ? 17 : 20), 'text-anchor': 'middle' }, feet.replace(/^about /, '')));
    // ---- the phone's screen, drawn large beside the room, joined to the phone by a faint line
    const sw = ph ? 44 : 62;
    const sh = sw * 2.05;
    const sx = ph ? W - 2 * 34 - 8 - sw - 10 : W - 2 * 40 - 10 - sw - 14;
    const sy = ph ? 14 : 16;
    scene.appendChild(sv('path', { class: 'cc-lead', d: `M${x0 + 3} ${r1(FY - surf - phH / 2)}L${r1(sx - 3)} ${r1(sy + sh * 0.45)}` }));
    const pose = g.pose;
    pose.appendChild(sv('rect', { class: 'cc-b', x: r1(sx), y: sy, width: sw, height: r1(sh), rx: r1(sw * 0.17) }));
    pose.appendChild(sv('rect', { class: 'cc-ink', x: r1(sx + sw / 2 - sw * 0.135), y: r1(sy + sw * 0.09), width: r1(sw * 0.27), height: r1(Math.max(2.6, sw * 0.06)), rx: 1.4 }));
    const fh = sh * 0.66;                       // the figure on the screen
    const fx = sx + sw / 2, fyy = sy + sh * 0.88;
    const outline = front(fh * 1.06, 'cc-outline');
    outline.setAttribute('transform', `translate(${r1(fx)} ${r1(fyy + fh * 0.03)})`);
    pose.appendChild(outline);
    const body = sv('g', { class: 'cc-anim cc-into' });
    const fb = front(fh);
    fb.setAttribute('transform', `translate(${r1(fx)} ${r1(fyy)})`);
    body.appendChild(fb);
    pose.appendChild(body);
    const lock = sv('g', { class: 'cc-anim cc-lock' });
    lock.appendChild(check(fx - 1, sy + sh * 0.95, ph ? 3.2 : 4));
    pose.appendChild(lock);
    // ---- Photos: four tiles beside the screen, each a view of the member
    const tW = ph ? 30 : 36, tH = ph ? 38 : 48, gap = ph ? 6 : 8;
    const tx0 = sx + sw + (ph ? 10 : 14);
    const tiles = NAMES.map((name, j) => {
      const tx = tx0 + (j % 2) * (tW + gap), ty = sy + Math.floor(j / 2) * (tH + gap + (ph ? 0 : 16));
      const c = sv('g', { class: 'cc-anim cc-tile' });
      c.style.transitionDelay = `${j * 90}ms`;
      c.appendChild(sv('rect', { class: 'cc-tb', x: r1(tx), y: r1(ty), width: tW, height: tH, rx: 4 }));
      const v = views[j];
      const fig = v === 'left' ? side(tH * 0.78, -1) : v === 'right' ? side(tH * 0.78, 1) : front(tH * 0.78);
      fig.setAttribute('transform', `translate(${r1(tx + tW / 2)} ${r1(ty + tH * 0.9)})`);
      c.appendChild(fig);
      if (!ph) c.appendChild(sv('text', { class: 'cc-t cc-tl', x: r1(tx + tW / 2), y: r1(ty + tH + 13), 'text-anchor': 'middle' }, name));
      g.photos.appendChild(c);
      return c;
    });
    Object.values(g).forEach((p) => scene.appendChild(p));
    parts = { g, phone, lvOk, member, body, lock, tiles, zone: g.dist.querySelector('.cc-zone') };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    read.style.minHeight = ph ? '3em' : '1.5em';
    // the resting frame is complete: no motion on the first draw or a resize
    const moving = [...scene.querySelectorAll('.cc-anim, .cc-p')];
    moving.forEach((n) => { n.style.transition = 'none'; });
    show(false);
    svg.getBoundingClientRect();
    moving.forEach((n) => { n.style.transition = ''; });
  }
  const KEYS = ['level', 'dist', 'pose', 'photos'];
  // each step's first state, from which it plays to rest
  const FROM = {
    level: (p) => { p.phone.style.transform = 'rotate(-24deg)'; p.lvOk.style.opacity = '0'; },
    dist: (p) => { p.member.style.transform = `translateX(${p.member.dataset.dx}px)`; p.zone.style.opacity = '0'; },
    pose: (p) => { p.body.style.transform = 'translate(7px, 3px) scale(1.08)'; p.lock.style.opacity = '0'; p.g.pose.classList.remove('locked'); },
    photos: (p) => { p.tiles.forEach((t) => { t.style.opacity = '0'; }); },
  };
  const REST_ = (p) => {
    p.phone.style.transform = ''; p.lvOk.style.opacity = '';
    p.member.style.transform = ''; p.zone.style.opacity = '';
    p.body.style.transform = ''; p.lock.style.opacity = ''; p.g.pose.classList.add('locked');
    p.tiles.forEach((t) => { t.style.opacity = ''; });
  };
  function show(move) {
    const p = parts;
    const i = st.i;
    KEYS.forEach((k, j) => { p.g[k].style.opacity = i < 0 || j === i ? '' : String(DIM); });
    if (i >= 0 && move && !reduced()) {
      const k = KEYS[i];
      const all = [...p.g[k].querySelectorAll('.cc-anim')];
      all.forEach((n) => { n.style.transition = 'none'; });
      FROM[k](p);
      svg.getBoundingClientRect();
      all.forEach((n) => { n.style.transition = ''; });
      requestAnimationFrame(() => requestAnimationFrame(() => REST_(p)));
    } else REST_(p);
    desc.textContent = i < 0 ? `The capture coach. ${SAY.join(' ')}` : `${STEPS[i]}. ${SAY[i]}`;
    if (move || !read.textContent) read.textContent = i < 0 ? REST : SAY[i];
  }

  draw();
  let lastW = stage.clientWidth;
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { const w = stage.clientWidth; if (w !== lastW) { lastW = w; draw(); } }).observe(stage);
  }
}
