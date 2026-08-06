/* VEILLEMM — scroll reveal system */
(function () {
  'use strict';
  const VM = window.VM;
  if (VM.reducedMotion || !('IntersectionObserver' in window)) return;

  const targets = VM.$$('[data-reveal]');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      // reveal the masked lines inside once the wrapper is in view
      VM.$$('.mask-line', entry.target).forEach((line) => line.classList.add('is-in'));
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  targets.forEach((t) => io.observe(t));
})();
