/* ============================================================
   VEILLEMM — rain, calm, dark
   ============================================================ */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= PRELOADER ================= */
  const preloader = document.getElementById("preloader");
  const hidePreloader = () => preloader && preloader.classList.add("is-hidden");
  if (prefersReduced) {
    hidePreloader();
  } else {
    window.addEventListener("load", () => setTimeout(hidePreloader, 600));
    // Safety: never trap the user behind the preloader
    setTimeout(hidePreloader, 3500);
  }

  /* ================= NAV ================= */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 30);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const closeMenu = () => {
    burger && burger.classList.remove("is-open");
    mobileMenu && mobileMenu.classList.remove("is-open");
    burger && burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ================= RAIN CANVAS ================= */
  const canvas = document.getElementById("rainCanvas");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let drops = [];
    let raf = null;
    let w, h;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      initDrops();
    };

    const initDrops = () => {
      const count = Math.round((w * h) / 9000);
      drops = Array.from({ length: Math.max(count, 40) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        len: 14 + Math.random() * 22,
        speed: 6 + Math.random() * 9,
        wind: 1.4 + Math.random() * 1.6,
        alpha: 0.12 + Math.random() * 0.3,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "#a9c6e4";
      ctx.lineWidth = 1;
      ctx.lineCap = "round";

      for (const d of drops) {
        ctx.globalAlpha = d.alpha;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.wind, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;
        d.x -= d.wind;
        if (d.y - d.len > h) {
          d.y = -d.len;
          d.x = Math.random() * w;
        }
        if (d.x < -20) d.x = w + 20;
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    };

    resize();
    start();

    let resizeTimer;
    let heroVisible = true;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        if (heroVisible) start();
      }, 200);
    });

    // Pause rain when hero is off-screen
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry.isIntersecting;
        heroVisible ? start() : stop();
      },
      { threshold: 0.02 }
    );
    heroObserver.observe(canvas);
  }

  /* ================= REVEAL ON SCROLL ================= */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // If reduced motion, show everything immediately
  if (prefersReduced) reveals.forEach((el) => el.classList.add("is-visible"));

  /* ================= MAGNETIC BUTTONS ================= */
  const magneticBtns = document.querySelectorAll(".btn--magnetic");
  if (magneticBtns.length && window.matchMedia("(pointer: fine)").matches && !prefersReduced) {
    magneticBtns.forEach((btn) => {
      const strength = 18;
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        btn.style.transform = `translate(${x * strength * 0.5}px, ${y * strength * 0.5}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ================= GALLERY LIGHTBOX ================= */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCap = document.getElementById("lightboxCap");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const galleryItems = Array.from(document.querySelectorAll(".gallery__item"));

  if (lightbox && galleryItems.length) {
    let currentIndex = 0;

    const showLightbox = (index) => {
      const item = galleryItems[index];
      if (!item) return;
      const img = item.querySelector("img");
      const cap = item.querySelector(".gallery__cap");
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCap.textContent = cap ? cap.textContent.replace(/\s+/g, " ").trim() : img.alt;
      currentIndex = index;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      lightboxImg.src = "";
    };

    const step = (dir) => {
      showLightbox((currentIndex + dir + galleryItems.length) % galleryItems.length);
    };

    galleryItems.forEach((item, i) =>
      item.addEventListener("click", () => showLightbox(i))
    );
    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", () => step(-1));
    lightboxNext.addEventListener("click", () => step(1));
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ================= CONTACT FORM (mailto) ================= */
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").trim();
      const email = (data.get("email") || "").trim();
      const message = (data.get("message") || "").trim();

      if (!name || !email || !message) {
        form.querySelector(".contact__form-note").textContent = "Please fill in all fields first.";
        form.querySelector(".contact__form-note").classList.add("is-visible");
        return;
      }

      const subject = encodeURIComponent(`Project inquiry from ${name} — via VEILLEMM site`);
      const body = encodeURIComponent(
        `Hi Cyrus,\n\n${message}\n\n— ${name}\n${email}`
      );
      const note = form.querySelector(".contact__form-note");
      note.classList.add("is-visible");
      const mailtoUrl = `mailto:veillemm1089@gmail.com?subject=${subject}&body=${body}`;
      // Attempt to open mail client; if the page stays put, show a fallback.
      let moved = false;
      const onHide = () => { moved = true; };
      window.addEventListener("blur", onHide, { once: true });
      window.location.href = mailtoUrl;
      setTimeout(() => {
        window.removeEventListener("blur", onHide);
        if (!moved) {
          note.textContent = "No mail app found — email veillemm1089@gmail.com directly.";
          note.classList.remove("is-visible");
          note.classList.add("is-visible");
        } else {
          note.textContent = "Opening your mail app…";
        }
        setTimeout(() => {
          note.textContent = "Opens your mail app, addressed to veillemm1089@gmail.com";
        }, 6000);
      }, 1200);
    });
  }

  /* ================= FOOTER YEAR ================= */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
