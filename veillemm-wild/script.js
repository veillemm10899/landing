/* ============================================================
   VEILLEMM WILD — Rewilding Studio · Interactions
   Vanilla JS, no dependencies.
   ============================================================ */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Header: scrolled state ---------- */
  const header = document.getElementById("siteHeader");
  const onScrollHeader = () => {
    header.classList.toggle("scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Scroll progress hairline ---------- */
  const scrollBar = document.getElementById("scrollBar");
  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    scrollBar.style.transform = `scaleX(${p})`;
    ticking = false;
  };
  const requestProgress = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  };
  window.addEventListener("scroll", requestProgress, { passive: true });
  requestProgress();

  /* ---------- Mobile menu ---------- */
  const nav = document.getElementById("siteNav");
  const navToggle = document.getElementById("navToggle");

  const closeMenu = () => {
    nav.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.querySelectorAll(".header-inner .brand").forEach((brand) => {
    brand.addEventListener("click", closeMenu);
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in-view"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            entry.target.style.setProperty("--reveal-delay", delay);
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Counters ---------- */
  const formatCount = (value, decimals) =>
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US");

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = formatCount(target * eased, decimals);
      el.textContent = value + (progress === 1 ? suffix : "");
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counters = document.querySelectorAll(".counter, .hero-data-num");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    counters.forEach((el) => {
      el.textContent =
        formatCount(parseFloat(el.dataset.count), parseInt(el.dataset.decimals || "0", 10)) +
        (el.dataset.suffix || "");
    });
  } else {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------- Hero growth fill + numbers (scroll-driven) ---------- */
  const growFill = document.getElementById("growFill");
  const heroPlot = document.getElementById("heroPlot");
  const heroRegion = document.getElementById("heroRegion");

  const updateGrowth = () => {
    const hero = document.querySelector(".hero");
    const rect = hero.getBoundingClientRect();
    const total = rect.height;
    const passed = Math.min(Math.max(-rect.top, 0), total);
    const p = passed / total;
    if (growFill) growFill.style.transform = `scaleX(${p})`;
    if (heroPlot) heroPlot.textContent = String(Math.max(1, Math.round(p * 12))).padStart(2, "0");
    if (heroRegion) heroRegion.textContent = String(Math.max(1, Math.round(p * 6))).padStart(2, "0");
  };
  if (growFill) {
    window.addEventListener("scroll", updateGrowth, { passive: true });
    updateGrowth();
  }

  /* ---------- Parallax contours (desktop only) ---------- */
  if (!prefersReducedMotion && window.matchMedia("(min-width: 761px)").matches) {
    const parallaxEls = document.querySelectorAll(".parallax");
    let pTicking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (pTicking) return;
        pTicking = true;
        requestAnimationFrame(() => {
          parallaxEls.forEach((el) => {
            const speed = parseFloat(el.dataset.speed || "-0.05");
            el.style.transform = `translateY(${window.scrollY * speed}px)`;
          });
          pTicking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------- Magnetic buttons (fine pointers only) ---------- */
  const magneticButtons = document.querySelectorAll(".btn-magnetic");
  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    magneticButtons.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Contact form -> mailto ---------- */
  const form = document.getElementById("joinForm");
  const formHint = document.getElementById("formHint");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("jName").value.trim();
      const email = document.getElementById("jEmail").value.trim();
      const type = document.getElementById("jType").value;
      const message = document.getElementById("jMessage").value.trim();

      if (!name || !email || !message) {
        formHint.textContent = "Please fill in name, email, and message — they matter here.";
        formHint.classList.add("error");
        return;
      }

      const subject = encodeURIComponent(`[${type}] Message from ${name}`);
      const body = encodeURIComponent(`Hi Cyrus,\n\n${message}\n\n— ${name}\nReply to: ${email}`);
      window.location.href = `mailto:veillemm1089@gmail.com?subject=${subject}&body=${body}`;

      formHint.textContent = "Opening your email app… talk soon. 🌱";
      formHint.classList.remove("error");
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
