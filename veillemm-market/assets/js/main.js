/* VEILLEMM Market — interactions & motion */
(function () {
  "use strict";

  /* ---------- Header scroll shadow ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");
  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open);
    siteNav.style.zIndex = open ? "10" : "-1";
  });
  siteNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      siteNav.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal, .reveal-item");
  const ro = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          ro.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );
  revealEls.forEach((el) => ro.observe(el));

  /* stagger children within a section head / hero copy */
  document.querySelectorAll(".hero-copy, .section-head").forEach((head) => {
    const kids = head.querySelectorAll(".reveal-item");
    kids.forEach((k, i) => (k.style.transitionDelay = i * 0.1 + "s"));
  });

  /* stagger department / review / freshness grid cards */
  [".dept-grid", ".review-grid", ".fresh-grid", ".stats-grid"].forEach((sel) => {
    const grid = document.querySelector(sel);
    if (!grid) return;
    const cards = grid.children;
    for (let i = 0; i < cards.length; i++) cards[i].style.transitionDelay = (i % 3) * 0.08 + "s";
  });

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const countObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const dur = 1400;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countObs.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => countObs.observe(c));

  /* ---------- Contact form (mailto fallback) ---------- */
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const msg = document.getElementById("msg").value.trim();

    if (!name || !email || !msg) {
      note.textContent = "Please fill in every field.";
      note.className = "form-note err";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      note.textContent = "That email doesn't look right.";
      note.className = "form-note err";
      return;
    }

    const subject = encodeURIComponent("VEILLEMM Market inquiry from " + name);
    const body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + msg);
    window.location.href = "mailto:veillemm1089@gmail.com?subject=" + subject + "&body=" + body;

    note.textContent = "Opening your mail app… thanks, " + name + "!";
    note.className = "form-note ok";
    form.reset();
  });

  /* ---------- Magnetic buttons (desktop only, subtle) ---------- */
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("mousemove", (ev) => {
        const r = btn.getBoundingClientRect();
        const x = ev.clientX - r.left - r.width / 2;
        const y = ev.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + x * 0.15 + "px," + y * 0.25 + "px)";
      });
      btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
    });
  }
})();