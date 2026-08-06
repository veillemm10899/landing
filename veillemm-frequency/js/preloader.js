/* VEILLEMM — preloader transmission log */
(function () {
  'use strict';
  const VM = window.VM;
  const pre = document.getElementById('preloader');
  if (!pre) return;

  // If the util module failed to load, never trap the page behind the curtain.
  if (!VM) { document.body.classList.add('is-loaded'); return; }

  const pct = document.getElementById('preloader-pct');
  const fill = document.getElementById('preloader-fill');
  const pad3 = (n) => String(n).padStart(3, '0');

  const duration = VM.reducedMotion ? 250 : 1150;
  const start = performance.now();

  function frame(now) {
    const t = VM.clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    const value = Math.round(eased * 100);
    if (pct) pct.textContent = pad3(value);
    if (fill) fill.style.width = value + '%';
    if (t < 1) { requestAnimationFrame(frame); return; }
    finish();
  }

  function finish() {
    if (document.body.classList.contains('is-loaded')) return;
    document.body.classList.add('is-loaded');
    // hero mask-lines lift as the curtain rises
    VM.$$('.hero .mask-line').forEach((line) => line.classList.add('is-in'));
    pre.classList.add('is-done');
    setTimeout(() => pre.setAttribute('aria-hidden', 'true'), 900);
  }

  // Safety net: force the curtain up even if the animation stalls.
  setTimeout(finish, 4000);
  requestAnimationFrame(frame);
})();
