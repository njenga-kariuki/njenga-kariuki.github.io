/* Amazon Bio Discovery's stage (v3.0; since v4.3 it carries the product). Five states, one for each step:
     0 Before: the ruler, 6 to 12 months against weeks.
     1 Ask, 2 Design, 4 Test: the product screen for that step, with its caption.
     3 Judge: the drawn chart of two of the five scores, with a control that picks out Front 1, Front 2 or all that were kept.
   The stylesheet shows the panel for the state; this script sets the state and runs the Judge control. */
export function wire(st, ctx) {
  const { $$, live } = ctx;
  const SAY = { '1': 'Front 1, kept first.', '2': 'Front 2, kept next.', 'all': 'All 100,000 kept.' };
  const pfBtns = $$('.bd-pf-ctrl button[data-pf]', st);
  function pickFront(mode, announce) {
    st.dataset.pf = mode;
    pfBtns.forEach(b => b.setAttribute('aria-checked', b.dataset.pf === mode ? 'true' : 'false'));
    if (announce && live && SAY[mode]) live(SAY[mode]);
  }
  pfBtns.forEach(b => b.addEventListener('click', () => pickFront(b.dataset.pf, true)));
  pickFront('all', false);
  return {
    to(s) {
      const k = Math.max(0, Math.min(4, parseInt(s, 10) || 0));
      st.dataset.s = String(k);
    },
  };
}
