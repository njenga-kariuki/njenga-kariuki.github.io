/* Map View's stage, the plan (v2.7, D-058): site.js sets the step in view as data-s on the stage, and the stylesheet draws
   each state (the list, the scan, the rooms joining, the devices placed). This script makes the pins live once they are
   placed: every device on the map works, a tap switches it and opens its card; 04 Control switches the living room lamp
   on, as Amazon's film does. Both drawings (a laptop's and a phone's) share one state. */
const PIN = {
  lamp: { n: 'Living Room Lamp', off: 'Off', on: 'On', glow: 'lamp', sw: 1 },
  echo: { n: 'Echo Studio', off: 'Paused', on: 'Playing' },
  plug: { n: 'Coffee Maker', off: 'Off', on: 'On', sw: 1 },
  thermo: { n: 'Hallway Thermostat', off: '68°', on: 'Heating to 72°' },
  bed: { n: 'Bedroom Light', off: 'Off', on: 'On', glow: 'bed', sw: 1 },
};
const at = p => (p.getAttribute('transform').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/) || []).slice(1).map(Number);

export function wire(st, ctx) {
  const { $, $$, live, RM } = ctx;
  const svgs = $$('svg.plan', st);
  const on = {};
  let open = null, hinted = false, liveNow = false;

  function placeCard(sv, pin, cw, ch) {
    const vb = sv.viewBox.baseVal, W = vb.width, H = vb.height;
    // a phone: the card opens under the plan, as the app's own card rises from the bottom of the screen
    if (W < 400) return [(W - cw) / 2, H - ch - 2];
    const [px, py] = at(pin);
    const [rx, ry, rw, rh] = pin.dataset.room.split(' ').map(Number);
    const g = W < 400 ? 16 : 24;
    const c = {
      r: [px + g, py - ch / 2], l: [px - g - cw, py - ch / 2],
      b: [px - cw / 2, py + g], t: [px - cw / 2, py - g - ch],
    };
    const order = [pin.dataset.side, 'r', 'l', 'b', 't'].filter((s, i, a) => a.indexOf(s) === i);
    const others = $$('.pl-pin', sv).filter(q => q !== pin).map(at);
    const clearOf = ([x, y]) => others.every(([qx, qy]) => x + cw < qx - 18 || x > qx + 18 || y + ch < qy - 18 || y > qy + 18);
    const inBox = ([x, y], bx, by, bw, bh) => x >= bx + 4 && y >= by + 4 && x + cw <= bx + bw - 4 && y + ch <= by + bh - 4;
    const tries = order.map(s => c[s]);
    const pick = tries.find(t => inBox(t, rx, ry, rw, rh) && clearOf(t)) || tries.find(t => inBox(t, 0, 0, W, H) && clearOf(t))
      || tries.find(t => inBox(t, 0, 0, W, H)) || tries[0];
    return [Math.min(Math.max(4, pick[0]), W - cw - 4), Math.min(Math.max(4, pick[1]), H - ch - 4)];
  }

  function showCard(k) {
    open = k;
    svgs.forEach(sv => {
      const pin = $(`.pl-pin[data-k="${k}"]`, sv), ctl = $('.pl-ctl', sv), card = $('.pl-card', sv);
      if (!pin || !ctl) return;
      const d = PIN[k], ctn = $('.pl-ctn', sv), stt = $('.pl-st', sv), tg = $('.pl-tg', sv), bg = $('.pl-cbg', sv);
      ctn.textContent = d.n; stt.textContent = on[k] ? d.on : d.off;
      stt.style.fill = on[k] && d.glow ? '#ffd25a' : '#fff';
      // the card fits its words, and an on/off device gets its switch
      const small = sv.viewBox.baseVal.width < 400;
      let tw = 0;
      try { tw = Math.max(ctn.getComputedTextLength(), stt.getComputedTextLength()); } catch (e) { tw = 0; }
      if (!tw) tw = d.n.length * (small ? 7 : 7.3);
      const cw = Math.ceil(12 + tw + (d.sw ? 14 + 30 : 0) + 12), ch = +bg.getAttribute('height');
      bg.setAttribute('width', cw);
      if (tg) { tg.style.display = d.sw ? '' : 'none'; tg.setAttribute('transform', `translate(${cw - 42} ${ch / 2 - 9})`); tg.classList.toggle('on', !!on[k]); }
      const [x, y] = placeCard(sv, pin, cw, ch);
      card.style.transform = `translate(${x}px, ${y}px)`;
      ctl.classList.add('on');
    });
  }
  function hideCard() { open = null; svgs.forEach(sv => { const c = $('.pl-ctl', sv); if (c) c.classList.remove('on'); }); }

  function setPin(k, val, quiet) {
    on[k] = val;
    const d = PIN[k];
    svgs.forEach(sv => {
      const p = $(`.pl-pin[data-k="${k}"]`, sv);
      if (!p) return;
      p.classList.toggle('on', val);
      p.setAttribute('aria-pressed', val ? 'true' : 'false');
      p.setAttribute('aria-label', `${d.n}, ${val ? d.on : d.off}`);
      const tag = $('.pl-tag', p); if (tag) tag.textContent = (val ? d.on : d.off).toUpperCase();
      if (d.glow) { const gl = $(`.pl-glow[data-glow="${d.glow}"]`, sv); if (gl) gl.classList.toggle('on', val); }
    });
    if (quiet) return;
    st.classList.remove('hinting');
    showCard(k);
    live(`${d.n}, ${val ? d.on : d.off}`);
  }

  function liveOn(v) {
    liveNow = v;
    svgs.forEach(sv => $$('.pl-pin', sv).forEach(p => {
      // only the drawing on screen takes focus
      const shown = sv.getClientRects().length > 0;
      p.setAttribute('tabindex', v && shown ? '0' : '-1');
      p.setAttribute('aria-hidden', v && shown ? 'false' : 'true');
    }));
    if (!v) { Object.keys(PIN).forEach(k => { if (on[k]) setPin(k, false, true); }); hideCard(); }
  }

  svgs.forEach(sv => $$('.pl-pin', sv).forEach(p => {
    const flip = () => { if (liveNow) setPin(p.dataset.k, !on[p.dataset.k]); };
    p.addEventListener('click', flip);
    p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  }));
  addEventListener('resize', () => { liveOn(liveNow); if (open) showCard(open); });

  return {
    to(s) {
      s = String(s);
      if (st.dataset.s === s && st.dataset.wired) return;
      st.dataset.s = s;
      st.dataset.wired = '1';
      liveOn(s === '3' || s === '4');
      // 04 Control: the living room lamp switched on from the map, its room lit and its card open; back at 03 it is off
      // again, and every pin stays live to tap
      if (s === '4') { setPin('lamp', true, true); showCard('lamp'); }
      else if (s === '3' && on.lamp) { setPin('lamp', false, true); hideCard(); }
      if (s === '4' && !hinted && !RM) { hinted = true; st.classList.add('hinting'); setTimeout(() => st.classList.remove('hinting'), 2400); }
    },
  };
}
