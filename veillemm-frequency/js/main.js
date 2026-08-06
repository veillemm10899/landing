/* VEILLEMM — main boot: pinned scroller, signal meter */
(function () {
  'use strict';
  const VM = window.VM;

  /* ---------- Pinned horizontal transmissions showcase ---------- */
  const scrollEl = document.getElementById('trans-scroll');
  const track = document.getElementById('trans-track');
  const progressFill = document.getElementById('trans-progress-fill');

  if (scrollEl && track) {
    const viewport = scrollEl.querySelector('.trans-viewport');
    const mq = window.matchMedia('(min-width: 1025px)');
    let maxX = 0;

    const compute = () => {
      scrollEl.classList.toggle('is-pinned', mq.matches);
      maxX = Math.max(0, track.scrollWidth - viewport.clientWidth);
    };

    const onScroll = () => {
      if (!mq.matches) return;
      const total = scrollEl.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const progress = VM.clamp(-scrollEl.getBoundingClientRect().top / total, 0, 1);
      track.style.transform = 'translate3d(' + (-progress * maxX).toFixed(2) + 'px, 0, 0)';
      if (progressFill) progressFill.style.width = (progress * 100).toFixed(1) + '%';
    };

    // ensure a clean state when unpinned (tablet / mobile)
    const resetTransform = () => { if (!mq.matches) track.style.transform = ''; };

    compute();
    window.addEventListener('resize', () => { compute(); resetTransform(); });
    window.addEventListener('scroll', () => { onScroll(); resetTransform(); }, { passive: true });
    onScroll();
  }

  /* ---------- Live hero signal meter ---------- */
  const meterFill = document.getElementById('hero-meter');
  const meterVal = document.getElementById('hero-meter-val');
  if (meterFill && meterVal) {
    let level = 74;
    const tick = () => {
      level = VM.clamp(level + (Math.random() - 0.5) * 15, 58, 96);
      meterFill.style.width = level.toFixed(0) + '%';
      meterVal.textContent = level.toFixed(0);
    };
    setInterval(tick, 1500);
  }

  /* ---------- Console stamp ---------- */
  console.log('%c VEILLEMM %c frequency atelier — signal over noise ',
    'background:#ffb000;color:#1a1200;font-weight:bold;padding:2px 6px;',
    'color:#a7a19a;');
})();
