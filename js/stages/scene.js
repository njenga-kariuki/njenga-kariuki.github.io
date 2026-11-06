/* Prime Now's stage (v2.7, D-058): one scene, shelf to app. The stylesheet draws each state from the stage's data-s:
   the part of the system the step builds arrives, the parts not yet built wait as dashed outlines, and what fed the app
   runs under the app. On a phone the scene travels under the pinned stage, one part at a time. */
export function wire(st) {
  return { to(s) { st.dataset.s = String(s); } };
}
