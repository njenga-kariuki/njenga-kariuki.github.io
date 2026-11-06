/* Prime Now's stage: the store platform builds station by station (v2.7, D-058: the stage's own script; site.js drives its state from the step in view). */
// Prime Now: the store platform builds station by station; the link into the app carries the cadence (v2.2)
export function wire(st, ctx) {
  const { $, $$ } = ctx;
  const stn = $$('.stn', st), lk = $$('.p-link', st);
  function layout(s) {
    const k = +s;
    stn.forEach(g => { const i = +g.dataset.i; g.classList.toggle('on', i <= k || i === 4); g.classList.toggle('cur', k > 0 && i === k); });
    lk.forEach(l => { const i = +l.dataset.i; l.classList.toggle('on', i < k); l.classList.toggle('live', k === 4 && i === 3); });
  }
  layout(st.dataset.s || '0');
  return { to(s) { st.dataset.s = s; layout(s); } };
}
