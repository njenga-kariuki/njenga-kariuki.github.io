/* Map View's stage: the device list becomes a floor plan whose pins switch (v2.7, D-058: the stage's own script; site.js drives its state from the step in view). */
const PIN = {
  lamp: { n: 'Living Room Lamp', off: 'Off', on: 'On', glow: 'lamp' },
  echo: { n: 'Echo Studio', off: 'Paused', on: 'Playing' },
  plug: { n: 'Coffee Maker', off: 'Off', on: 'On' },
  thermo: { n: 'Hallway Thermostat', off: '68°', on: 'Heating to 72°' },
  bed: { n: 'Bedroom Light', off: 'Off', on: 'On', glow: 'bed' },
};
const LABELS = [[40, 36, 104, 18], [330, 36, 66, 18], [330, 146, 66, 18], [330, 246, 56, 18], [480, 36, 66, 18], [480, 236, 76, 18]];
// the rooms of the plan (x, y, w, h): a card opens inside its device's room when it fits there
const ROOMS = [[30, 30, 290, 360], [320, 30, 150, 110], [320, 140, 150, 100], [320, 240, 150, 150], [470, 30, 120, 200], [470, 230, 120, 160]];
const SWITCH = { lamp: 1, plug: 1, bed: 1 };
export function wire(st, ctx) {
  const { $, $$, live, RM } = ctx;
  const pins = $$('.pin', st), ctl = $('.ctl', st), card = $('.card', st);
  let cardW = 188;
  function place(px, py) {
    const k = innerWidth < 900 ? 1.4 : 1, cw = cardW * k, chh = 54 * k;
    const room = ROOMS.find(([rx, ry, rw, rh]) => px >= rx && px <= rx + rw && py >= ry && py <= ry + rh);
    const inRoom = room && cw <= room[2] - 8 ? ([x]) => x >= room[0] + 4 && x + cw <= room[0] + room[2] - 4 : null;
    const cx = room ? Math.min(Math.max(px - cw / 2, room[0] + 4), room[0] + room[2] - cw - 4) : px - cw / 2;
    const tries = [[px + 26, py - chh - 10], [px - cw - 26, py - chh - 10], [cx, py - chh - 14], [cx, py + 24], [px - cw - 26, py - chh / 2], [px + 26, py - chh / 2], [px + 26, py + 22], [px - cw - 26, py + 22], [px - cw / 2, py + 26]];
    // the card keeps clear of the room labels and of every other pin, so no device hides under it
    const others = pins.map(q => (q.getAttribute('transform').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/) || []).slice(1).map(Number))
      .filter(([qx, qy]) => !(qx === px && qy === py));
    const clear = ([x, y]) => x >= 22 && y >= 22 && x + cw <= 598 && y + chh <= 398 &&
      LABELS.every(([lx, ly, lw, lh]) => x + cw < lx - 4 || x > lx + lw + 4 || y + chh < ly - 4 || y > ly + lh + 4) &&
      others.every(([qx, qy]) => x + cw < qx - 24 || x > qx + 24 || y + chh < qy - 24 || y > qy + 24);
    return (inRoom && tries.find(t => clear(t) && inRoom(t))) || tries.find(clear) || [Math.min(Math.max(22, px + 26), 598 - cw), Math.max(22, py - chh - 10)];
  }
  function setPin(p, on, quiet) {
    const d = PIN[p.dataset.k];
    p.classList.toggle('on', on);
    p.setAttribute('aria-pressed', on ? 'true' : 'false');
    p.setAttribute('aria-label', `${d.n}, ${on ? d.on : d.off}`);
    if (d.glow) { const g = $(`.glow[data-glow="${d.glow}"]`, st); if (g) g.classList.toggle('on', on); }
    if (quiet) return;
    st.classList.remove('hinting');
    showCard(p, on);
    live(`${d.n}, ${on ? d.on : d.off}`);
  }
  function showCard(p, on) {
    const d = PIN[p.dataset.k];
    const m = p.getAttribute('transform').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/);
    const ctn = $('.ctn', st), stt = $('.st', st), tg = $('.tg', st);
    ctn.textContent = d.n; stt.textContent = on ? d.on : d.off;
    stt.style.fill = on && d.glow ? '#ffd25a' : '#fff';
    // the card fits its words, and an on/off device gets its switch
    let tw = 112;
    try { tw = Math.max(ctn.getComputedTextLength(), stt.getComputedTextLength()); } catch (e) { /* not rendered yet */ }
    const sw = SWITCH[p.dataset.k];
    cardW = Math.ceil(14 + tw + (sw ? 18 + 30 : 0) + 14);
    $('.cbg', st).setAttribute('width', cardW);
    if (tg) { tg.style.display = sw ? '' : 'none'; tg.setAttribute('transform', `translate(${cardW - 44} 18)`); tg.classList.toggle('on', !!on); }
    const [x, y] = place(+m[1], +m[2]);
    card.style.transform = `translate(${x}px, ${y}px)`;
    ctl.classList.add('on');
  }
  function liveOn(on) {
    pins.forEach(p => { p.setAttribute('tabindex', on ? '0' : '-1'); p.setAttribute('aria-hidden', on ? 'false' : 'true'); if (!on) setPin(p, false, true); });
    if (!on) ctl.classList.remove('on');
  }
  pins.forEach(p => {
    const flip = () => { if (p.getAttribute('tabindex') === '0') setPin(p, !p.classList.contains('on')); };
    p.addEventListener('click', flip);
    p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  });
  let hinted = false;
  return {
    to(s) {
      if (st.dataset.s === s) return;
      st.dataset.s = s;
      liveOn((s === '3' || s === '4') && !st.classList.contains('static'));
      // 04 Control shows a device being controlled from the map: the living room lamp switched on, its room lit and
      // its card open; going back to 03 switches it off again, and every pin stays live to tap
      const lamp = pins.find(p => p.dataset.k === 'lamp');
      if (lamp && s === '4') { setPin(lamp, true, true); showCard(lamp, true); }
      else if (lamp && s === '3' && lamp.classList.contains('on')) { setPin(lamp, false, true); ctl.classList.remove('on'); }
      if (s === '4' && !hinted && !RM) { hinted = true; st.classList.add('hinting'); setTimeout(() => st.classList.remove('hinting'), 2400); }
    }
  };
}

