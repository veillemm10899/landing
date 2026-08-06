/* VEILLEMM — shared utilities (plain scripts, no build step) */
(function (global) {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // Observe an element's size and call fn({width, height})
  function onResize(el, fn) {
    if (typeof ResizeObserver === 'undefined') { fn({ width: el.clientWidth, height: el.clientHeight }); return; }
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      fn({ width: r.width, height: r.height });
    });
    ro.observe(el);
    return ro;
  }

  global.VM = {
    $, $$, reducedMotion, finePointer, lerp, clamp, onResize
  };
})(window);
