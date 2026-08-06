/* VEILLEMM — live Manila clock */
(function () {
  'use strict';
  const els = [document.getElementById('clock-nav'), document.getElementById('clock-footer')].filter(Boolean);
  if (!els.length) return;

  let fmt;
  try {
    fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Manila',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
  } catch (e) {
    fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  }

  const tick = () => {
    const t = fmt.format(new Date());
    els.forEach((el) => { if (el.textContent !== t) el.textContent = t; });
  };
  tick();
  setInterval(tick, 1000);
})();
