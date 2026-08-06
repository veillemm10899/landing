/* ============================================================
   VEILLEMM & CO. — main.js
   Interactions: watch hands, tilt, reveal, counters, menu,
   scrollspy, magnetic buttons, copy, mailto form
   ============================================================ */
(() => {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Live watch: real time hands ---------- */
  const handHour = $(".hand-hour");
  const handMin = $(".hand-min");
  const handSec = $(".hand-sec");

  function setHands() {
    const now = new Date();
    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();
    if (handHour) handHour.style.transform = `rotate(${(h + m / 60) * 30}deg)`;
    if (handMin) handMin.style.transform = `rotate(${(m + s / 60) * 6}deg)`;
    if (handSec) handSec.style.transform = `rotate(${(s + ms / 1000) * 6}deg)`;
  }
  setHands();
  setInterval(setHands, 250);

  /* ---------- 3D tilt on the watch ---------- */
  const stage = $("#watch-stage");
  const watch = $("#watch");
  if (stage && watch && !reduced && window.matchMedia("(pointer: fine)").matches) {
    stage.addEventListener("mousemove", (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      watch.style.transform =
        `rotateX(${(8 - py * 18).toFixed(2)}deg) rotateY(${(-14 + px * 24).toFixed(2)}deg)`;
    });
    stage.addEventListener("mouseleave", () => {
      watch.style.transform = "rotateX(8deg) rotateY(-14deg)";
    });
  }

  /* ---------- Header scroll state + progress bar ---------- */
  const header = $("#site-header");
  const bar = $("#progress-bar");

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 24);
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = max > 0 ? `${(y / max) * 100}%` : "0%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const menu = $("#mobile-menu");

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.classList.toggle("open", open);
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (burger && menu) {
    burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    $$("a", menu).forEach((a) =>
      a.addEventListener("click", () => setMenu(false))
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* ---------- Scrollspy ---------- */
  const navLinks = $$(".site-nav a, .mobile-nav a");
  const spyIds = navLinks
    .map((a) => a.getAttribute("href"))
    .filter((h) => h && h.startsWith("#") && h.length > 1);

  if ("IntersectionObserver" in window && spyIds.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const id = `#${en.target.id}`;
          navLinks.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === id)
          );
        });
      },
      { rootMargin: "-38% 0px -55% 0px" }
    );
    spyIds.forEach((id) => {
      const el = document.querySelector(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.setProperty("--d", `${(i % 4) * 0.08}s`);
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Hero title lines ---------- */
  const heroTitle = $(".hero-title");
  if (heroTitle && !reduced) {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => heroTitle.classList.add("in"))
    );
  }

  /* ---------- Counters ---------- */
  const counters = $$(".count");
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target;
          cio.unobserve(el);
          const target = parseInt(el.dataset.count || "0", 10);
          if (reduced) { el.textContent = target; return; }
          const dur = 1600;
          const start = performance.now();
          const tick = (t) => {
            const p = Math.min((t - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduced && window.matchMedia("(pointer: fine)").matches) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Copy buttons ---------- */
  $$(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      const original = btn.textContent;
      btn.textContent = "Copied ✓";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1800);
    });
  });

  /* ---------- Contact form → mailto ---------- */
  const form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#f-name");
      const email = $("#f-email");
      const topic = $("#f-topic");
      const message = $("#f-message");
      const err = $("#form-error");

      const clean = (v) => (v ? v.trim() : "");
      const invalid = [];
      if (!clean(name.value)) invalid.push("name");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(email.value))) invalid.push("email");
      if (!clean(message.value)) invalid.push("message");

      if (invalid.length) {
        if (err) {
          err.textContent =
            "Please fill in: " + invalid.map((i) => i[0].toUpperCase() + i.slice(1)).join(", ");
          err.hidden = false;
        }
        return;
      }

      const subject = `[VEILLEMM] ${clean(topic.value)} — from ${clean(name.value)}`;
      const body =
        `Name: ${clean(name.value)}\n` +
        `Email: ${clean(email.value)}\n` +
        `Regarding: ${clean(topic.value)}\n\n` +
        `${clean(message.value)}`;
      window.location.href =
        `mailto:veillemm1089@gmail.com?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      if (err) err.hidden = true;
      form.reset();
    });
  }

  /* ---------- Year ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
