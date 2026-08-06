/* ============================================================
   VEILLEMM — WORK LIBRARY
   Renders the sample websites as cards. Data-driven, easy to grow.
   ============================================================ */

"use strict";

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   ➕ HOW TO ADD A NEW SAMPLE (so easy!)
   1. Put your site folder inside this project (e.g. "my-new-site/")
   2. Copy one block below, paste it, and change:
        title      → the name shown on the card
        folder     → your site's folder name
        tag        → a short category label
        tagline    → one short sentence
        c1 / c2    → two colors for the preview gradient (any hex)
        concept    → set true if it's just a concept, else false
   3. Done — the card appears automatically. Nothing else to touch.
   ============================================================ */

const PROJECTS = [
  {
    title: "VEILLEMM — Modern Residences",
    folder: "veillemm-residences",
    tag: "Real Estate",
    tagline: "Engineered with intent, designed around how you live.",
    c1: "#E9E4DA", c2: "#C9A227", concept: false
  },
  {
    title: "VEILLEMM Market",
    folder: "veillemm-market",
    tag: "E-Commerce",
    tagline: "Everyday fresh, delivered right.",
    c1: "#1E4637", c2: "#FFB45C", concept: false
  },
  {
    title: "The Danger of AI — Human Firewall",
    folder: "ai-human-firewall",
    tag: "Editorial",
    tagline: "A threat dossier on the last invention.",
    c1: "#100F14", c2: "#FF3B30", concept: false
  },
  {
    title: "VEILLEMM — Digital Product Studio",
    folder: "veillemm-studio",
    tag: "Portfolio",
    tagline: "Studio-grade. Independently built.",
    c1: "#F3EFE6", c2: "#FF4D00", concept: false
  },
  {
    title: "Cinematic Web for Music & Culture",
    folder: "veillemm-music",
    tag: "Portfolio",
    tagline: "Sites with a pulse — for artists, labels & festivals.",
    c1: "#0A0A0C", c2: "#D9FF3F", concept: false
  },
  {
    title: "VEILLEMM Coffee Roasters",
    folder: "veillemm-coffee",
    tag: "E-Commerce",
    tagline: "Slow brews for fast minds — a specialty roastery.",
    c1: "#241A12", c2: "#C68642", concept: false
  },
  {
    title: "VEILLEMM — Games Built Like Machines",
    folder: "veillemm-games",
    tag: "Games",
    tagline: "Arcade-grade games. One click. No installs.",
    c1: "#101018", c2: "#41E0FF", concept: false
  },
  {
    title: "VEILLEMM WILD — Rewilding Studio",
    folder: "veillemm-wild",
    tag: "Brand",
    tagline: "Restore the wild, verify every tree.",
    c1: "#0E2318", c2: "#7FD986", concept: false
  },
  {
    title: "Clarity in the Rain",
    folder: "veillemm-rain",
    tag: "Personal",
    tagline: "A developer who thinks clearest when it rains.",
    c1: "#0B1220", c2: "#8FB8DE", concept: false
  },
  {
    title: "The 2026 Cyber Field Manual",
    folder: "cyber-field-manual",
    tag: "Editorial",
    tagline: "Become a cybersecurity professional in 2026.",
    c1: "#0B0F14", c2: "#2BD98B", concept: false
  },
  {
    title: "VEILLEMM & CO. — Fine Timepieces",
    folder: "veillemm-timepieces",
    tag: "Brand",
    tagline: "Hand-assembled. Individually numbered.",
    c1: "#12100E", c2: "#D4AF6A", concept: false
  },
  {
    title: "VEILLEMM — Frequency Atelier",
    folder: "veillemm-frequency",
    tag: "Personal",
    tagline: "Most software is noise. I build signal.",
    c1: "#0D0D10", c2: "#8A7CFF", concept: false
  },
  {
    title: "MAISON DOUX — Atelier de Pâtisserie",
    folder: "maison-doux",
    tag: "Brand",
    tagline: "Where butter becomes architecture — a 3D WebGL experience.",
    c1: "#2A1A12", c2: "#E3B368", concept: true
  }
];

/* ============================================================
   HELPERS
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   RENDER CARDS
   ============================================================ */
const grid = $("#grid");
const status = $("#grid-status");
const heroCount = $("#hero-count");

function luminanceOf(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function cardMarkup(p, i) {
  const href = `${p.folder}/index.html`;
  const ink = luminanceOf(p.c1) > 0.6 ? "#181826" : "#FFFFFF";
  return `
    <li class="card">
      <a class="card-link" href="${href}" target="_blank" rel="noopener" aria-label="Visit ${p.title}">
        <div class="mockup">
          <div class="mockup__frame">
            <div class="mockup__bar">
              <span class="mockup__dots" aria-hidden="true"><i></i><i></i><i></i></span>
              <span class="mockup__url">veillemm.netlify.app/${p.folder}</span>
            </div>
            <div class="mockup__art" style="--c1:${p.c1};--c2:${p.c2};">
              <span class="mockup__initial" style="color:${ink}" aria-hidden="true">${p.title.charAt(0)}</span>
              <img class="mockup__shot" src="assets/thumbs/${p.folder}.jpg" alt="Screenshot preview of ${p.title}" loading="lazy" width="720" height="506" onload="this.classList.add('is-loaded')" onerror="this.remove()" />
            </div>
          </div>
        </div>
        <div class="card__body">
          <h3 class="card__title">${p.title}</h3>
          <p class="card__tagline">${p.tagline}</p>
          <div class="card__meta">
            <span class="pill pill--cat">${p.tag}</span>
            ${p.concept ? '<span class="pill pill--concept">Concept</span>' : ""}
          </div>
          <div class="card__foot">
            <span class="card__index mono">№ ${String(i + 1).padStart(2, "0")}</span>
            <span class="card__visit">Visit <span class="arrow" aria-hidden="true">↗</span></span>
          </div>
        </div>
      </a>
    </li>`;
}

function render(list) {
  grid.innerHTML = list.map((p, i) => cardMarkup(p, i)).join("");
  status.textContent = list.length === 0
    ? "No samples match — try another word."
    : list.length === PROJECTS.length
      ? `${list.length} samples in the library`
      : `${list.length} of ${PROJECTS.length} samples`;
}

/* ============================================================
   SEARCH
   ============================================================ */
$("#search-input").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  const list = !q
    ? PROJECTS
    : PROJECTS.filter((p) =>
        `${p.title} ${p.tagline} ${p.tag}`.toLowerCase().includes(q)
      );
  render(list);
});

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */
(function initReveal() {
  const els = $$(".reveal");
  if (REDUCED_MOTION) { els.forEach((el) => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach((el) => io.observe(el));
})();

/* ============================================================
   HEADER STATE + ANCHOR SCROLL
   ============================================================ */
const header = $("#site-header");
window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 30);
}, { passive: true });

$$('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: y, behavior: REDUCED_MOTION ? "auto" : "smooth" });
  });
});

/* ============================================================
   MOBILE MENU
   ============================================================ */
(function initMenu() {
  const burger = $("#burger");
  const menu = $("#mobile-menu");
  const toggle = (open) => {
    burger.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
  };
  burger.addEventListener("click", () => toggle(!menu.classList.contains("is-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => toggle(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) toggle(false);
  });
})();

/* ============================================================
   CONTACT FORM → mailto (no backend needed)
   ============================================================ */
$("#contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#c-name").value.trim();
  const email = $("#c-email").value.trim();
  const message = $("#c-message").value.trim();
  const note = $("#form-note");

  if (!name || !email || !message) {
    note.textContent = "Please fill in all fields first.";
    return;
  }
  const body = encodeURIComponent(`Hi Cyrus,\n\n${message}\n\n— ${name} (${email})`);
  const subject = encodeURIComponent("Project inquiry — VEILLEMM");
  window.location.href = `mailto:veillemm1089@gmail.com?subject=${subject}&body=${body}`;
  note.textContent = "Opening your mail app…";
});

/* ============================================================
   BOOT
   ============================================================ */
(function boot() {
  $("#year").textContent = new Date().getFullYear();
  heroCount.textContent = PROJECTS.length;
  render(PROJECTS);
})();
