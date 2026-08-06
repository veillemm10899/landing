/* VEILLEMM — custom cursor */
(function () {
  'use strict';
  const VM = window.VM;
  if (VM.reducedMotion || !VM.finePointer) return;

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  const dot = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');

  let mx = -100, my = -100;      // target
  let rx = -100, ry = -100;      // ring position (lerped)
  let shown = false;

  function onMove(e) {
    mx = e.clientX;
    my = e.clientY;
    if (!shown) {
      shown = true;
      rx = mx; ry = my;
      cursor.style.opacity = '1';
    }
  }

  function onOver(e) {
    if (e.target.closest('a, button, [data-cursor]')) cursor.classList.add('is-hover');
  }
  function onOut(e) {
    if (e.target.closest('a, button, [data-cursor]')) cursor.classList.remove('is-hover');
  }
  function onDown() { cursor.classList.add('is-down'); }
  function onUp() { cursor.classList.remove('is-down'); }

  function loop() {
    rx = VM.lerp(rx, mx, 0.16);
    ry = VM.lerp(ry, my, 0.16);
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }

  document.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseover', onOver, { passive: true });
  document.addEventListener('mouseout', onOut, { passive: true });
  document.addEventListener('mousedown', onDown);
  document.addEventListener('mouseup', onUp);
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; shown = false; });
  requestAnimationFrame(loop);
})();
