/* ============================================================
   VEILLEMM — BEAUTY OF THE OCEAN
   Cinematic interactions: particles, scroll reveals, lightbox,
   stat counters, and magnetic buttons.
   ============================================================ */

"use strict";

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   HELPERS
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   PRELOADER
   ============================================================ */
(function initPreloader() {
  const preloader = $("#preloader");
  if (!preloader) return;
  const dismiss = () => preloader.classList.add("is-done");
  window.addEventListener("load", () => setTimeout(dismiss, REDUCED_MOTION ? 100 : 800));
  // Safety: dismiss after 3s regardless
  setTimeout(dismiss, 3000);
})();

/* ============================================================
   PARTICLE CANVAS — floating ocean particles
   ============================================================ */
(function initParticles() {
  const canvas = $("#particlesCanvas");
  if (!canvas || REDUCED_MOTION) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.3 - 0.15,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.7
          ? `rgba(240, 192, 64, ` // gold
          : Math.random() > 0.4
            ? `rgba(26, 188, 156, `  // teal
            : `rgba(45, 212, 168, `  // emerald
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.opacity + ")";
      ctx.fill();

      // Move
      p.x += p.dx;
      p.y += p.dy;

      // Wrap
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;
    }
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener("resize", () => { resize(); createParticles(); });
})();

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
(function initReveal() {
  const els = $$(".reveal");
  if (REDUCED_MOTION) { els.forEach(el => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  els.forEach(el => io.observe(el));
})();

/* ============================================================
   NAV — scrolled state + mobile menu
   ============================================================ */
const nav = $("#nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 40);
}, { passive: true });

// Anchor smooth scroll
$$('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: y, behavior: REDUCED_MOTION ? "auto" : "smooth" });
  });
});

/* Mobile menu */
(function initMenu() {
  const burger = $("#burger");
  const menu = $("#mobileMenu");
  if (!burger || !menu) return;
  const toggle = (open) => {
    burger.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
  };
  // Use both click and touchstart for better Android support
  const handleToggle = (e) => {
    e.preventDefault();
    toggle(!menu.classList.contains("is-open"));
  };
  burger.addEventListener("click", handleToggle);
  burger.addEventListener("touchend", (e) => {
    e.preventDefault();
    toggle(!menu.classList.contains("is-open"));
  });
  $$(".nav__mobile-link", menu).forEach(a => a.addEventListener("click", () => toggle(false)));
  $$(".nav__mobile-link", menu).forEach(a => a.addEventListener("touchend", () => toggle(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) toggle(false);
  });
})();

/* ============================================================
   GALLERY LIGHTBOX
   ============================================================ */
(function initLightbox() {
  const lightbox = $("#lightbox");
  if (!lightbox) return;
  const img = $("#lightboxImg");
  const cap = $("#lightboxCap");
  const closeBtn = $("#lightboxClose");
  const prevBtn = $("#lightboxPrev");
  const nextBtn = $("#lightboxNext");

  const items = $$(".gallery__item");
  let currentIdx = 0;

  function open(idx) {
    currentIdx = idx;
    const item = items[idx];
    const imgEl = $("img", item);
    const capEl = $(".gallery__cap", item);
    img.src = imgEl.src;
    img.alt = imgEl.alt;
    cap.textContent = capEl ? capEl.textContent : "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function prev() {
    currentIdx = (currentIdx - 1 + items.length) % items.length;
    open(currentIdx);
  }

  function next() {
    currentIdx = (currentIdx + 1) % items.length;
    open(currentIdx);
  }

  items.forEach((item, i) => {
    item.addEventListener("click", () => open(i));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
    });
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `View image ${i + 1}`);
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });

  // Close on background click
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
})();

/* ============================================================
   STAT COUNTERS
   ============================================================ */
(function initCounters() {
  const counters = $$("[data-count]");
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      io.unobserve(el);

      if (REDUCED_MOTION) {
        el.textContent = target;
        return;
      }

      const duration = 1800;
      const start = performance.now();
      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.3 });

  counters.forEach(c => io.observe(c));
})();

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
(function initMagnetic() {
  if (REDUCED_MOTION) return;
  $$(".btn--magnetic").forEach(btn => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.02)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
})();

/* ============================================================
   CONTACT FORM → mailto
   ============================================================ */
(function initContactForm() {
  const form = $("#contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      const note = $(".contact__form-note");
      if (note) note.textContent = "Please fill in all fields first.";
      return;
    }

    const body = encodeURIComponent(`Hi Cyrus,\n\n${message}\n\n— ${name} (${email})`);
    const subject = encodeURIComponent("Project inquiry — VEILLEMM Ocean");
    window.location.href = `mailto:veillemm1089@gmail.com?subject=${subject}&body=${body}`;

    const note = $(".contact__form-note");
    if (note) note.textContent = "Opening your mail app…";
  });
})();

/* ============================================================
   BOOT
   ============================================================ */
(function boot() {
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
