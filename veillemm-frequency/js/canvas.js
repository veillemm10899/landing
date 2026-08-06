/* VEILLEMM — generative canvas systems
   The site's entire visual asset layer is generated at runtime:
   hero signal field + four live project visualizations.
   Engines pause when off-screen, respect DPR, and render one
   static frame under prefers-reduced-motion. */
(function () {
  'use strict';
  const VM = window.VM;

  const PANEL = '#101014';
  const INK = '#0a0a0c';
  const BONE = '#efeae1';
  const SIGNAL = '#ffb000';
  const RELAY = '#9fb4ad';

  /* ---------- engine core ---------- */
  function createEngine(canvas, draw) {
    const ctx = canvas.getContext('2d', { alpha: false });
    let w = 0, h = 0, t = 0;
    let raf = 0, running = false, last = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      const d = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * d);
      canvas.height = Math.round(h * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      if (VM.reducedMotion) draw(ctx, w, h, 0.35, 0);
    }

    function loop(now) {
      if (!running) return;
      const dt = last ? VM.clamp((now - last) / 1000, 0, 0.05) : 0.016;
      last = now;
      t += dt;
      draw(ctx, w, h, t, dt);
      raf = requestAnimationFrame(loop);
    }

    function setRunning(v) {
      running = v;
      if (v && !VM.reducedMotion) { raf = requestAnimationFrame(loop); }
      else if (!v) { cancelAnimationFrame(raf); }
    }

    resize();
    VM.onResize(canvas, resize);
    if (VM.reducedMotion) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => setRunning(e.isIntersecting));
      }, { threshold: 0.05 });
      io.observe(canvas);
    } else {
      setRunning(true);
    }
    document.addEventListener('visibilitychange', () => setRunning(!document.hidden));
  }

  /* ---------- 1. hero signal field ---------- */
  function heroField(canvas) {
    let mx = -9999, my = -9999;
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    }, { passive: true });

    createEngine(canvas, (ctx, w, h, t) => {
      ctx.fillStyle = INK;
      ctx.fillRect(0, 0, w, h);

      // mouse glow
      if (mx > 0 && my > 0) {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, 240);
        g.addColorStop(0, 'rgba(255,176,0,0.07)');
        g.addColorStop(1, 'rgba(255,176,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      const rows = 6;
      const spacing = h / (rows + 1);
      const step = 16;

      for (let r = 0; r < rows; r++) {
        const baseY = spacing * (r + 1) - spacing / 2;
        const phase = r * 0.9 + t * (0.35 + r * 0.07);
        const amp = (9 + r * 3.5) * (1 + Math.max(0, 1 - Math.abs(my - baseY) / 140) * 0.55);

        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          const y = baseY
            + Math.sin(x * 0.0075 + phase) * amp
            + Math.sin(x * 0.023 - t * 0.35 + r * 2) * amp * 0.3;
          if (x === -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(239,234,225,' + (0.05 + (1 - r / rows) * 0.12).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();

        // amber sample nodes on the two loudest rows
        if (r === 1 || r === 4) {
          ctx.fillStyle = 'rgba(255,176,0,0.5)';
          for (let x = 20; x < w; x += 90) {
            const y = baseY
              + Math.sin(x * 0.0075 + phase) * amp
              + Math.sin(x * 0.023 - t * 0.35 + r * 2) * amp * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, 1.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    });
  }

  /* ---------- 2. spectrum (Signal / Vector) ---------- */
  function spectrum(canvas) {
    const seeds = new Array(80).fill(0).map((_, i) => Math.sin(i * 127.1 + 311.7) * 0.5 + 0.5);
    createEngine(canvas, (ctx, w, h, t) => {
      ctx.fillStyle = PANEL;
      ctx.fillRect(0, 0, w, h);
      const n = Math.max(24, Math.min(64, Math.floor(w / 13)));
      const bw = w / n;
      const mid = h * 0.72;
      for (let i = 0; i < n; i++) {
        const s = Math.sin(i * 0.55 + t * 2.4) * 0.5 + 0.5;
        const s2 = Math.sin(i * 0.21 - t * 1.7 + 2) * 0.5 + 0.5;
        const amp = 0.22 + 0.78 * s;
        const bh = (h - mid) * amp * (0.5 + 0.5 * s2);
        const grad = ctx.createLinearGradient(0, mid, 0, mid - bh);
        grad.addColorStop(0, 'rgba(255,176,0,0.9)');
        grad.addColorStop(1, 'rgba(255,176,0,0.12)');
        ctx.fillStyle = grad;
        ctx.fillRect(i * bw + bw * 0.22, mid - bh, bw * 0.56, bh);
      }
      ctx.fillStyle = 'rgba(239,234,225,0.16)';
      ctx.fillRect(0, mid, w, 1);
    });
  }

  /* ---------- 3. orbit (Aurora Console) ---------- */
  function orbit(canvas) {
    createEngine(canvas, (ctx, w, h, t) => {
      ctx.fillStyle = 'rgba(16,16,20,0.2)';   // trail persistence
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.36;

      for (let o = 0; o < 3; o++) {
        const r = R * (0.45 + o * 0.3);
        const speed = 0.5 + o * 0.35;
        ctx.strokeStyle = 'rgba(159,180,173,' + (0.18 - o * 0.03).toFixed(2) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.55, 0.5, 0, Math.PI * 2);
        ctx.stroke();
        const dots = 3 + o;
        for (let d = 0; d < dots; d++) {
          const a = t * speed + (d / dots) * Math.PI * 2;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r * 0.55;
          ctx.fillStyle = o === 0 ? SIGNAL : BONE;
          ctx.globalAlpha = 0.85 - o * 0.18;
          ctx.beginPath();
          ctx.arc(x, y, o === 0 ? 3 : 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      // core
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
      glow.addColorStop(0, 'rgba(255,176,0,0.85)');
      glow.addColorStop(1, 'rgba(255,176,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ---------- 4. pulse (Orbit interface) ---------- */
  function pulse(canvas) {
    createEngine(canvas, (ctx, w, h, t) => {
      ctx.fillStyle = PANEL;
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const maxR = Math.max(w, h) * 0.62;
      for (let i = 0; i < 5; i++) {
        const prog = ((t * 0.9 + i / 5) % 1);
        const r = prog * maxR;
        const alpha = (1 - prog) * 0.55;
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,176,0,' + alpha.toFixed(3) + ')' : 'rgba(239,234,225,' + (alpha * 0.5).toFixed(3) + ')';
        ctx.lineWidth = i % 2 === 0 ? 1.5 : 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = SIGNAL;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ---------- 5. grid drift (Pulse Grid identity) ---------- */
  function gridDrift(canvas) {
    createEngine(canvas, (ctx, w, h, t) => {
      ctx.fillStyle = PANEL;
      ctx.fillRect(0, 0, w, h);
      const horizon = h * 0.34;
      const cols = 13;
      const spread = Math.min(w, h) * 0.28;
      const rows = 11;
      const speed = 0.5;
      for (let c = 0; c < cols; c++) {
        const f = (c - (cols - 1) / 2) / ((cols - 1) / 2);
        for (let rIdx = 0; rIdx < rows; rIdx++) {
          const z = ((rIdx + t * speed) % rows) / rows;   // 0 far -> 1 near
          const x = w / 2 + f * z * spread;
          const y = horizon + (1 - z) * (h - horizon) + z * 10;
          const size = 0.6 + z * 2.6;
          const alpha = 0.12 + z * 0.5;
          ctx.fillStyle = rIdx % 2 === 0 ? 'rgba(255,176,0,' + alpha.toFixed(3) + ')' : 'rgba(239,234,225,' + (alpha * 0.7).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // horizon line
      ctx.fillStyle = 'rgba(239,234,225,0.14)';
      ctx.fillRect(0, horizon, w, 1);
    });
  }

  /* ---------- boot ---------- */
  document.querySelectorAll('canvas[data-canvas]').forEach((c) => {
    const system = c.getAttribute('data-canvas');
    if (system === 'waves') spectrum(c);
    else if (system === 'orbit') orbit(c);
    else if (system === 'pulse') pulse(c);
    else if (system === 'grid') gridDrift(c);
  });
  const hero = document.getElementById('hero-field');
  if (hero) heroField(hero);
})();
