/* ============================================================
   VEILLEMM COFFEE ROASTERS — Interactions
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

  /* ---------- Mobile menu ---------- */
  const nav = document.getElementById("siteNav");
  const navToggle = document.getElementById("navToggle");

  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  // Close menu when a nav link or the brand logo is clicked
  const closeMenu = () => {
    nav.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

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

  /* ---------- Stat counters ---------- */
  const counters = document.querySelectorAll(".counter");
  const formatCount = (value, decimals) =>
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = formatCount(target * eased, decimals) + (progress === 1 ? suffix : "");
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

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
      { threshold: 0.5 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------- Parallax blobs (hero) ---------- */
  if (!prefersReducedMotion && window.matchMedia("(min-width: 761px)").matches) {
    const parallaxEls = document.querySelectorAll(".parallax");
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          parallaxEls.forEach((el) => {
            const speed = parseFloat(el.dataset.speed || "-0.06");
            el.style.transform = `translateY(${y * speed}px)`;
          });
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------- Magnetic buttons (desktop pointers only) ---------- */
  const magneticButtons = document.querySelectorAll(".btn-magnetic");

  if (
    !prefersReducedMotion &&
    window.matchMedia("(pointer: fine)").matches
  ) {
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
  const form = document.getElementById("reserveForm");
  const formHint = document.getElementById("formHint");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("fName").value.trim();
      const email = document.getElementById("fEmail").value.trim();
      const type = document.getElementById("fType").value;
      const message = document.getElementById("fMessage").value.trim();

      if (!name || !email || !message) {
        formHint.textContent = "Please fill in name, email, and message — we need them to reply.";
        formHint.classList.add("error");
        return;
      }

      const subject = encodeURIComponent(`[${type}] Reservation / inquiry from ${name}`);
      const body = encodeURIComponent(
        `Hi Cyrus,\n\n${message}\n\n— ${name}\nReply to: ${email}`
      );
      window.location.href = `mailto:veillemm1089@gmail.com?subject=${subject}&body=${body}`;

      formHint.textContent = "Opening your email app… see you on the other side ☕";
      formHint.classList.remove("error");
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Roast log batch number (fun, current) ---------- */
  const batchNo = document.getElementById("batchNo");
  if (batchNo) batchNo.textContent = String(40 + (new Date().getMonth() + 1)).padStart(3, "0");
})();
