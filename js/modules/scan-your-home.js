/* Map View, "From a phone scan to a floor plan" (3_content/modules/m11-scan-your-home.json).
   One idea: a phone scan becomes a floor plan with each device in its place. One three-step choice, following Amazon's
   steps (scan-to-floor-plan-flow.json, steps 2, 3 and 5): the rooms as the phone measured them, one at a time; the
   rooms joined at their doorways into one plan; the devices placed in their rooms. The home, its rooms and its devices
   are an illustration (the build tags it); the room names follow Amazon's sample plan. Desktop and phone have their own
   arrangement of the same six rooms. Reduced motion: every change is instant. */
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, text) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const sv = (tag, attrs = {}, text) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const phone = matchMedia('(max-width: 599px)');

const STEPS = [
  { label: 'Scan rooms', step: 2, line: 'The phone measures each room’s walls and furniture, one room at a time.' },
  { label: 'Join rooms', step: 3, line: 'The rooms join at their doorways into one floor plan of the home.' },
  { label: 'Place devices', step: 5, line: 'Each device is dragged onto its room, so each one has its place.' },
];
const NAMES = { living: 'Living Room', kitchen: 'Kitchen', hall: 'Hallway', bed: 'Primary Bedroom', office: 'Office', bath: 'Bathroom' };

/* The illustrated home, in plan units, once for a wide stage and once for a phone. Each room: its place [x, y, w, h],
   where its scan sits apart before the rooms are joined [dx, dy], and furniture the phone also measured. Doors are
   openings in a shared wall. Devices sit in rooms. */
const HOMES = {
  wide: {
    size: [16, 7.5],
    rooms: {
      living: { r: [0, 0, 6.5, 7.5], apart: [-0.5, 0], kit: [[0.8, 5.6, 2.8, 1.1]] },
      kitchen: { r: [6.5, 0, 4.5, 3.5], apart: [0, -0.45], kit: [[7.6, 1.2, 2.2, 1.0]] },
      hall: { r: [6.5, 3.5, 9.5, 1.5], apart: [0.15, 0], kit: [] },
      bed: { r: [11, 0, 5, 3.5], apart: [0.5, -0.45], kit: [[13.4, 0.9, 2.3, 2.3]] },
      office: { r: [6.5, 5, 4.5, 2.5], apart: [0, 0.45], kit: [[7.1, 6.5, 2.0, 0.75]] },
      bath: { r: [11, 5, 5, 2.5], apart: [0.5, 0.45], kit: [[14.2, 5.3, 1.5, 1.9]] },
    },
    doors: [[6.5, 1.0, 6.5, 2.4], [6.5, 3.75, 6.5, 4.75], [8.0, 3.5, 9.1, 3.5], [12.6, 3.5, 13.7, 3.5], [8.0, 5, 9.1, 5], [11.6, 5, 12.6, 5]],
    devices: [['living', 'Lamp', 1.1, 2.2], ['living', 'Echo', 4.3, 4.3], ['kitchen', 'Light', 7.4, 2.95], ['hall', '72°', 10.4, 4.25],
      ['bed', 'Lamp', 12.0, 2.45], ['office', 'Plug', 9.6, 5.95]],
    phoneAt: [12.6, 6.4, 0],
  },
  tall: {
    size: [10, 9],
    rooms: {
      living: { r: [0, 0, 5.5, 5.5], apart: [-0.4, -0.4], kit: [[0.6, 3.9, 2.8, 1.0]] },
      kitchen: { r: [5.5, 0, 4.5, 3], apart: [0.4, -0.4], kit: [[6.4, 1.6, 2.2, 0.9]] },
      hall: { r: [5.5, 3, 4.5, 2.5], apart: [0.4, 0], kit: [] },
      bed: { r: [0, 5.5, 4, 3.5], apart: [-0.4, 0.4], kit: [[1.9, 6.75, 1.8, 2.1]] },
      office: { r: [4, 5.5, 3.5, 3.5], apart: [0, 0.4], kit: [[4.3, 8.1, 2.0, 0.65]] },
      bath: { r: [7.5, 5.5, 2.5, 3.5], apart: [0.4, 0.4], kit: [[8.2, 7.2, 1.5, 1.6]] },
    },
    doors: [[5.5, 0.9, 5.5, 2.1], [5.5, 3.9, 5.5, 4.9], [7.0, 3, 8.0, 3], [5.8, 5.5, 6.8, 5.5], [8.3, 5.5, 9.3, 5.5], [1.4, 5.5, 2.5, 5.5]],
    devices: [['living', 'Lamp', 0.9, 2.1], ['living', 'Echo', 3.9, 2.9], ['kitchen', 'Light', 6.2, 1.05], ['hall', '72°', 7.6, 4.35],
      ['bed', 'Lamp', 0.75, 8.35], ['office', 'Plug', 4.55, 7.3]],
    phoneAt: [8.45, 6.55, 90],
  },
};

// a small seeded generator, so the scan's points fall the same way on every visit
const seeded = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// the sides of a room, with the doorways taken out
function sides(r, doors) {
  const [x, y, w, h] = r;
  const out = [];
  [[x, y, x + w, y], [x + w, y, x + w, y + h], [x, y + h, x + w, y + h], [x, y, x, y + h]].forEach(([x1, y1, x2, y2]) => {
    const horiz = y1 === y2;
    let segs = [[horiz ? x1 : y1, horiz ? x2 : y2]];
    doors.forEach(([a1, b1, a2, b2]) => {
      if (horiz ? !(b1 === y1 && b2 === y1) : !(a1 === x1 && a2 === x1)) return;
      const lo = horiz ? Math.min(a1, a2) : Math.min(b1, b2), hi = horiz ? Math.max(a1, a2) : Math.max(b1, b2);
      segs = segs.flatMap(([s, e]) => (hi <= s || lo >= e ? [[s, e]] : [[s, lo], [hi, e]].filter(([p, q]) => q - p > 0.01)));
    });
    segs.forEach(([s, e]) => out.push(horiz ? [s, y1, e, y1] : [x1, s, x1, e]));
  });
  return out;
}

export async function mount(section, dataUrl) {
  const stage = section.querySelector('[data-stage]');
  if (!stage) throw new Error('scan-your-home: no stage');
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error('scan-your-home: no data');
  const data = await res.json();
  const steps = ((data.files || {})['scan-to-floor-plan-flow.json'] || {}).steps || [];
  if (!STEPS.every((s) => steps.some((x) => x.n === s.step && x.stage))) throw new Error('scan-your-home: the flow’s steps are missing');
  let k = 0;

  stage.textContent = '';
  const svg = sv('svg', { role: 'img' });
  const seg = el('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Step' });
  const radios = STEPS.map((c, i) => {
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
  let parts = null;
  function draw() {
    const W = stage.getBoundingClientRect().width;
    const ph = phone.matches;
    const home = ph ? HOMES.tall : HOMES.wide;
    const H = ph ? 322 : 320;
    const [uw, uh] = home.size;
    const pad = 0.55; // room for the rooms to sit apart before they are joined
    const s = Math.min(W / (uw + 2 * pad), H / (uh + 2 * pad));
    const ox = (W - uw * s) / 2, oy = (H - uh * s) / 2;
    const X = (u) => ox + u * s, Y = (v) => oy + v * s;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.height = `${H}px`;
    svg.textContent = '';
    const rand = seeded(11);
    const jit = (a) => (rand() - 0.5) * a;
    const rooms = Object.entries(home.rooms).map(([id, room]) => {
      const g = sv('g', { class: 'anim' });
      const [x, y, w, h] = room.r;
      const fill = sv('rect', { x: X(x), y: Y(y), width: w * s, height: h * s, class: 'd-light anim' });
      // the scan: points along the walls and around the furniture
      let d = '';
      const dots = (x1, y1, x2, y2, step, j) => {
        const len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(2, Math.round(len / step));
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          d += `M${(X(x1 + (x2 - x1) * t) + jit(j)).toFixed(1)} ${(Y(y1 + (y2 - y1) * t) + jit(j)).toFixed(1)}h0`;
        }
      };
      const walls = sides(room.r, home.doors);
      walls.forEach(([x1, y1, x2, y2]) => dots(x1, y1, x2, y2, 0.11, 3.2));
      room.kit.forEach(([fx, fy, fw, fh]) => [[fx, fy, fx + fw, fy], [fx + fw, fy, fx + fw, fy + fh], [fx, fy + fh, fx + fw, fy + fh], [fx, fy, fx, fy + fh]]
        .forEach(([x1, y1, x2, y2]) => dots(x1, y1, x2, y2, 0.16, 2.4)));
      const points = sv('path', { d, class: 'd-ref anim', 'stroke-width': ph ? 1.6 : 1.8, 'stroke-linecap': 'round' });
      // the plan: walls with the doorways open
      const wall = sv('path', { d: walls.map(([x1, y1, x2, y2]) => `M${X(x1).toFixed(1)} ${Y(y1).toFixed(1)}L${X(x2).toFixed(1)} ${Y(y2).toFixed(1)}`).join(''),
        class: 'd-claim no-fill anim', 'stroke-width': 2, 'stroke-linecap': 'square' });
      const name = sv('text', { x: X(x) + 8, y: Y(y) + 19 }, NAMES[id]);
      g.append(fill, points, wall, name);
      svg.appendChild(g);
      return { g, fill, points, wall, apart: room.apart.map((a) => a * s) };
    });
    // the phone, measuring the last room, with the reach of its sensor
    const [px, py, turn] = home.phoneAt;
    const gPhone = sv('g', { class: 'anim' });
    const tool = sv('g', { transform: `translate(${X(px).toFixed(1)} ${Y(py).toFixed(1)}) rotate(${turn})` });
    const fan = sv('path', { d: `M0 0L${(1.5 * s).toFixed(1)} ${(-0.7 * s).toFixed(1)}A${(1.66 * s).toFixed(1)} ${(1.66 * s).toFixed(1)} 0 0 1 ${(1.5 * s).toFixed(1)} ${(0.7 * s).toFixed(1)}Z`, class: 'd1 no-stroke', opacity: 0.16 });
    const body = sv('rect', { x: -6, y: -10, width: 12, height: 20, rx: 2.5, class: 'd-claim', 'stroke-width': 1.5 });
    body.style.fill = 'var(--paper)';
    tool.append(fan, body);
    gPhone.appendChild(tool);
    // apart rooms keep the phone with the room it is in
    const homeRoom = rooms[Object.keys(home.rooms).indexOf('bath')];
    svg.appendChild(gPhone);
    // the devices, each a pin in its room
    const gPins = sv('g', { class: 'anim' });
    home.devices.forEach(([, label, u, v]) => {
      const pin = sv('circle', { cx: X(u), cy: Y(v), r: 5.5, class: 'd-claim', 'stroke-width': 2 });
      pin.style.stroke = 'var(--paper)';
      gPins.append(pin, sv('text', { x: X(u) + 10, y: Y(v) + 4.5, class: 't-ink' }, label));
    });
    svg.appendChild(gPins);
    parts = { rooms, gPhone, homeRoom, gPins };
    read.style.minHeight = ph ? '3em' : '';
    show();
  }
  function show() {
    const { rooms, gPhone, homeRoom, gPins } = parts;
    const apart = k === 0;
    rooms.forEach((r) => {
      r.g.style.transform = apart ? `translate(${r.apart[0].toFixed(1)}px, ${r.apart[1].toFixed(1)}px)` : 'translate(0px, 0px)';
      r.points.style.opacity = apart ? '1' : '0';
      r.wall.style.opacity = apart ? '0' : '1';
      r.fill.style.opacity = apart ? '0' : '1';
    });
    gPhone.style.transform = `translate(${homeRoom.apart[0].toFixed(1)}px, ${homeRoom.apart[1].toFixed(1)}px)`;
    gPhone.style.opacity = apart ? '1' : '0';
    gPins.style.opacity = k === 2 ? '1' : '0';
    gPins.style.transform = k === 2 ? 'translate(0px, 0px)' : 'translate(0px, -8px)';
    const names = Object.values(NAMES).join(', ');
    svg.setAttribute('aria-label', [
      `Six rooms, each scanned on its own and shown as the points the phone measured along its walls and furniture: ${names}.`,
      `The six rooms joined at their doorways into one floor plan: ${names}.`,
      'The floor plan with six devices in their rooms: a lamp and an Echo in the Living Room, a light in the Kitchen, a thermostat at 72 degrees in the Hallway, a lamp in the Primary Bedroom and a plug in the Office.',
    ][k]);
    read.textContent = STEPS[k].line;
  }
  function pick(i) {
    if (i === k) return;
    k = i;
    radios.forEach((b, j) => { b.setAttribute('aria-checked', j === k ? 'true' : 'false'); b.tabIndex = j === k ? 0 : -1; });
    show();
  }

  draw();
  let lastW = stage.getBoundingClientRect().width;
  new ResizeObserver(() => { const w = stage.getBoundingClientRect().width; if (Math.abs(w - lastW) > 0.5) { lastW = w; draw(); } }).observe(stage);
  phone.addEventListener('change', draw);
}
