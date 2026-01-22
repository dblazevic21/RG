// Animator.js
export function makeAnimator(tick) {
  let last = performance.now();
  function frame(now) {
    const dt = (now - last) / 1000;
    last = now;
    tick(dt, now);
    requestAnimationFrame(frame);
  }
  return { start: () => requestAnimationFrame(frame) };
}
