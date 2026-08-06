/* ═══════════════════════════════════════════════════════
   VEILLEMM — "THE DANGER OF AI" · interaction layer
   Hand-written. No autopilot.
   ═══════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ── Year ── */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Live clock ── */
  const clockEl = $("#liveClock");
  if (clockEl) {
    const tick = () => {
      const d = new Date();
      const p = (n) => String(n).padStart(2, "0");
      clockEl.textContent = `LOCAL TIME — ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ── PRELOADER: boot sequence ── */
  const preloader = $("#preloader");
  const bootLines = [
    "VEILLEMM_OS v6.0.6 // boot",
    "loading threat assessment…",
    "parsing incident database…",
    "scanning for synthetic signatures…",
    "system online."
  ];
  const boot = () => {
    if (prefersReducedMotion) return hidePreloader();
    const logEl = $("#preloader-log");
    const codeEl = $("#preloader-code");
    const fillEl = $("#preloader-fill");
    let line = 0;
    let char = 0;
    const typeLine = () => {
      if (line >= bootLines.length) {
        fillEl.style.width = "100%";
        codeEl.textContent = "[ OK ] system online.";
        setTimeout(hidePreloader, 500);
        return;
      }
      const target = bootLines[line];
      char++;
      if (line === 0) logEl.textContent = target.slice(0, char);
      else codeEl.textContent = `[ OK ] ${target.slice(0, char)}`;
      fillEl.style.width = `${Math.min(100, ((line + char / target.length) / bootLines.length) * 100)}%`;
      if (char < target.length) setTimeout(typeLine, 26);
      else { line++; char = 0; setTimeout(typeLine, 260); }
    };
    setTimeout(typeLine, 450);
  };
  const hidePreloader = () => {
    preloader.classList.add("done");
    document.body.style.overflow = "";
    setTimeout(() => preloader.remove(), 800);
  };
  if (preloader) {
    document.body.style.overflow = "hidden";
    boot();
  }

  /* ── SCROLL PROGRESS ── */
  const progress = $("#scrollProgress");
  const onScrollProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = `${max > 0 ? (h.scrollTop / max) * 100 : 0}%`;
  };
  window.addEventListener("scroll", onScrollProgress, { passive: true });
  onScrollProgress();

  /* ── NAV hide on scroll down ── */
  const nav = $("#nav");
  let lastY = window.scrollY;
  const onNavScroll = () => {
    const y = window.scrollY;
    if (y > lastY && y > 160 && !$("#mobileMenu").classList.contains("open")) nav.classList.add("hidden");
    else nav.classList.remove("hidden");
    lastY = y;
  };
  window.addEventListener("scroll", onNavScroll, { passive: true });

  /* ── Mobile menu ── */
  const burger = $("#navBurger");
  const mobileMenu = $("#mobileMenu");
  burger.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-hidden", String(!open));
  });
  $$("a", mobileMenu).forEach((a) =>
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      burger.classList.remove("open");
      mobileMenu.setAttribute("aria-hidden", "true");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ── REVEAL ON SCROLL ── */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.setProperty("--d", e.target.dataset.delay || 0);
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ── COUNT-UP STATS ── */
  const statNums = $$(".stat-num");
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const dur = 1800;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 4);
      const val = target * eased;
      el.textContent = prefix + val.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const statIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { animateCount(e.target); statIO.unobserve(e.target); }
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach((el) => statIO.observe(el));
  } else {
    statNums.forEach((el) => {
      el.textContent = (el.dataset.prefix || "") + parseFloat(el.dataset.count || "0").toLocaleString("en-US", { minimumFractionDigits: parseInt(el.dataset.decimals || "0", 10) });
    });
  }

  /* ── NEURAL CANVAS (hero) ── */
  const canvas = $("#neuralCanvas");
  if (canvas && !prefersReducedMotion && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let W, H, nodes = [];
    const NODE_COUNT = 64;
    const LINK_DIST = 140;
    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = r.width;
      H = canvas.height = r.height;
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 1.6 + 0.8,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.14;
            ctx.strokeStyle = `rgba(255, 26, 46, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = "rgba(255, 68, 87, 0.55)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ── PARALLAX eye on mouse (applied to wrapper, not the animated SVG) ── */
  const heroArt = $("#heroArt");
  if (heroArt && !prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    document.addEventListener("mousemove", (e) => {
      const r = heroArt.getBoundingClientRect();
      if (r.width === 0) return;
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      heroArt.style.translate = `${cx * -14}px ${cy * -14}px`;
    });
    document.addEventListener("mouseleave", () => { heroArt.style.translate = ""; });
  }

  /* ── CURSOR GLOW ── */
  const glow = $("#cursorGlow");
  if (glow && window.matchMedia("(hover: hover)").matches && !prefersReducedMotion) {
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    document.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
    const loop = () => {
      gx += (tx - gx) * 0.08;
      gy += (ty - gy) * 0.08;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
  } else if (glow) {
    glow.style.display = "none";
  }

  /* ── MAGNETIC BUTTONS ── */
  if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.translate = `${dx * 0.18}px ${dy * 0.18}px`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.translate = ""; });
    });
  }

  /* ── FAQ: keep only one open at a time ── */
  $$(".faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        $$(".faq-item").forEach((other) => { if (other !== item) other.open = false; });
      }
    });
  });

  /* ── CONTACT FORM → mailto ── */
  const form = $("#contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#fName").value.trim();
      const email = $("#fEmail").value.trim();
      const topic = $("#fTopic").value;
      const msg = $("#fMsg").value.trim();

      if (!name || !email || !msg) {
        form.querySelector(".form-note").textContent = "⚠ Incomplete transmission. All fields are required.";
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        form.querySelector(".form-note").textContent = "⚠ Invalid email signature. Check the address.";
        return;
      }

      const subject = encodeURIComponent(`[${topic}] — ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${msg}`
      );
      window.location.href = `mailto:veillemm1089@gmail.com?subject=${subject}&body=${body}`;
      form.querySelector(".form-note").textContent = "✓ Channel open — your email client should launch. If not, write directly to veillemm1089@gmail.com";
    });
  }
})();
