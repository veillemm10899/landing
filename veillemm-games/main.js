/* ============================================================
   VEILLEMM — INTERACTION LAYER
   Navigation, hero starfield, scroll reveals, stats, form.
   ============================================================ */

(function () {
  "use strict";

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav state + mobile menu ---------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");

  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger.addEventListener("click", function () {
    const open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!open));
    mobileMenu.classList.toggle("open", !open);
    mobileMenu.setAttribute("aria-hidden", String(open));
    document.body.style.overflow = open ? "" : "hidden";
  });

  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      burger.setAttribute("aria-expanded", "false");
      mobileMenu.classList.remove("open");
      mobileMenu.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    });
  });

  /* ---------- hero clock ---------- */
  const clock = document.getElementById("heroClock");
  function tick() {
    const d = new Date();
    const pad = function (n) { return String(n).padStart(2, "0"); };
    clock.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- hero starfield ---------- */
  const hero = document.getElementById("home");
  const starCanvas = document.getElementById("heroStars");
  let stars = [], heroVisible = true;

  if (starCanvas && hero) {
    const sctx = starCanvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let sw = 0, sh = 0;

    function sizeStars() {
      const r = hero.getBoundingClientRect();
      sw = r.width; sh = r.height;
      starCanvas.width = sw * dpr;
      starCanvas.height = sh * dpr;
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(160, Math.floor(sw / 9));
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * sw,
          y: Math.random() * sh,
          r: Math.random() * 1.4 + 0.4,
          depth: 0.2 + Math.random() * 0.8,
          tw: Math.random() * Math.PI * 2,
          ts: 0.5 + Math.random() * 1.4
        });
      }
    }

    function drawStars(scroll) {
      sctx.clearRect(0, 0, sw, sh);
      const t = performance.now() / 1000;
      const offset = reduceMotion ? 0 : scroll * 0.18;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const y = (s.y - offset) % sh;
        const yy = y < 0 ? y + sh : y;
        const alpha = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.ts + s.tw)) * s.depth;
        sctx.globalAlpha = alpha;
        sctx.fillStyle = s.depth > 0.6 ? "#45C8FF" : "#E9EDF5";
        sctx.beginPath();
        sctx.arc(s.x, yy, s.r, 0, Math.PI * 2);
        sctx.fill();
      }
      sctx.globalAlpha = 1;
    }

    let lastY = window.scrollY;
    function frame() {
      if (heroVisible) drawStars(window.scrollY);
      lastY = window.scrollY;
      requestAnimationFrame(frame);
    }

    window.addEventListener("resize", sizeStars);
    sizeStars();
    frame();

    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(hero);
  }

  /* ---------- parallax cabinet ---------- */
  if (!reduceMotion && finePointer) {
    const cabs = document.querySelectorAll("[data-parallax]");
    window.addEventListener("scroll", function () {
      const y = window.scrollY;
      cabs.forEach(function (c) {
        const p = parseFloat(c.getAttribute("data-parallax"));
        c.style.transform = "translateY(" + (y * p * 0.02) + "px)";
      });
    }, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  reveals.forEach(function (el) { io.observe(el); });

  /* ---------- stats count-up ---------- */
  const statNums = document.querySelectorAll("[data-count]");
  const statIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.getAttribute("data-count"), 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const dur = reduceMotion ? 0 : 1400;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      statIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  statNums.forEach(function (el) { statIO.observe(el); });

  /* ---------- cursor glow ---------- */
  if (finePointer && !reduceMotion) {
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    let tx = gx, ty = gy;
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      glow.style.opacity = "1";
    });
    (function loop() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = "translate(" + (gx - 190) + "px," + (gy - 190) + "px)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + dx * 0.16 + "px," + dy * 0.22 + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- FAQ ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    item.querySelector("summary").addEventListener("click", function () {
      document.querySelectorAll(".faq-item[open]").forEach(function (o) {
        if (o !== item) o.removeAttribute("open");
      });
    });
  });

  /* ---------- contact form ---------- */
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const f = form.elements;
      const name = f["name"].value.trim();
      const email = f["email"].value.trim();
      const type = f["type"].value;
      const message = f["message"].value.trim();

      if (!name || !email || !type || !message) {
        note.textContent = "// ERROR: ALL FIELDS REQUIRED — CHECK YOUR INPUT";
        note.className = "form-note err";
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.textContent = "// ERROR: EMAIL FORMAT NOT RECOGNIZED";
        note.className = "form-note err";
        return;
      }

      const subject = encodeURIComponent("VEILLEMM — New Mission Brief from " + name);
      const body = encodeURIComponent(
        "NAME: " + name + "\n" +
        "EMAIL: " + email + "\n" +
        "MISSION TYPE: " + type + "\n\n" +
        "BRIEF:\n" + message + "\n\n— sent from veillemm.netlify.app"
      );
      window.location.href = "mailto:veillemm1089@gmail.com?subject=" + subject + "&body=" + body;

      note.textContent = "// MISSION ACCEPTED — EMAIL APP OPENING WITH YOUR BRIEF";
      note.className = "form-note ok";
      form.reset();
    });
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll(".footer [data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
