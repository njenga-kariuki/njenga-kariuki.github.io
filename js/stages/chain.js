/* M-PESA's stage: one chain of work, its time drawn as work and waiting (v2.7, D-058: the stage's own script; site.js drives its state from the step in view). */
// M-PESA: one chain of work. Its time is drawn as work and waiting; the chain redesigned shortens the waiting.
const CHAIN = {
  work: [[16, 16, 16, 16, 16, 16], [16, 5, 16, 16, 16, 16], [16, 5, 8, 16, 6, 16]],
  wait: [[91.2, 91.2, 91.2, 91.2, 91.2], [91.2, 91.2, 91.2, 91.2, 91.2], [10, 10, 10, 10, 10]],
  ai: [[], [1], [1, 2, 4]],
};
function wireOne(st, sv, $, $$) {
  const tw = $$('.tw[data-i]', sv).sort((a, b) => a.dataset.i - b.dataset.i), tq = $$('.tq[data-i]', sv).sort((a, b) => a.dataset.i - b.dataset.i);
  const BW = +((sv && sv.dataset.bar) || 560), W = BW / 552;
  const end = $('.end', sv), boxes = $$('.cb', sv), links = $$('.cl', sv);
  function layout(s) {
    const k = Math.min(2, +s);
    let x = 0;
    for (let i = 0; i < 6; i++) {
      const w = CHAIN.work[k][i];
      tw[i].style.transform = `translate(${x * W}px, 0px) scale(${w * W}, 1)`; x += w;
      if (i < 5) { const q = CHAIN.wait[k][i]; tq[i].style.transform = `translate(${x * W}px, 0px) scale(${q * W}, 1)`; x += q; }
    }
    end.style.transform = `translate(${x * W}px, 0px)`;
    const et = $('text', end);
    // the result's label: under the end mark at full length; once the chain is shorter, just past its end, inside the
    // outline of the old length, whose own end reads "Before" (v2.2)
    if (et) { const short = x * W < BW * 0.46; et.setAttribute('text-anchor', short ? 'start' : 'end'); et.setAttribute('x', short ? '8' : '0'); et.setAttribute('y', short ? '11.5' : '38'); }
    boxes.forEach((b, i) => b.classList.toggle('on-ai', CHAIN.ai[k].includes(i)));
    links.forEach(l => l.classList.toggle('joined', k >= 2));
  }
  layout('0');
  return layout;
}
export function wire(st, ctx) {
  const { $, $$ } = ctx;
  const ls = $$('svg', st).map(sv => wireOne(st, sv, $, $$));
  return { to(s) { st.dataset.s = s; ls.forEach(l => l(s)); } };
}

