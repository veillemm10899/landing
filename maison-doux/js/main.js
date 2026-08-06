/* ============================================================
   MAISON DOUX — Interaction system
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Preloader ---------- */
  var preloader = document.getElementById("preloader");
  var bar = document.getElementById("preloader-bar");
  var count = document.getElementById("preloader-count");
  var loaded = 0;
  var preTarget = 100;

  document.body.classList.add("is-loading");
  document.documentElement.style.overflow = "hidden";

  function finishLoad() {
    if (preloader.classList.contains("is-done")) return;
    preloader.classList.add("is-done");
    document.body.classList.remove("is-loading");
    document.documentElement.style.overflow = "";

  }

  var tick = reduced ? 60 : 18;
  var step = Math.max(1, Math.round(100 / (tick / 1)));
  var timer = setInterval(function () {
    loaded = Math.min(preTarget, loaded + (preTarget / tick) * 3);
    var v = Math.round(loaded);
    if (count) count.textContent = String(v).padStart(3, "0");
    if (bar) bar.style.width = v + "%";
    if (v >= 100) {
      clearInterval(timer);
      setTimeout(finishLoad, reduced ? 0 : 420);
    }
  }, 16);

  window.addEventListener("load", function () {
    setTimeout(finishLoad, 1200);
  });
  setTimeout(finishLoad, 5000); // fail-safe

  /* ---------- Header scrolled state ---------- */
  var header = document.getElementById("site-header");
  function onHeader() { header.classList.toggle("scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onHeader, { passive: true });
  onHeader();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("mobile-menu");
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    menu.classList.toggle("open", !open);
    menu.setAttribute("aria-hidden", String(open));
    toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
    }
  });

  /* ---------- Smooth anchor scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------- Scroll progress → 3D scene ---------- */
  var sceneAPI = window.__veillemmScene;
  var body = document.body;
  function onScroll() {
    var max = body.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (sceneAPI) sceneAPI.setScroll(p);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Pointer → 3D scene ---------- */
  window.addEventListener("pointermove", function (e) {
    if (!sceneAPI) return;
    var nx = (e.clientX / window.innerWidth) * 2 - 1;
    var ny = -((e.clientY / window.innerHeight) * 2 - 1);
    sceneAPI.setPointer(nx, ny);
  }, { passive: true });

  /* ---------- Custom cursor ---------- */
  var cursor = document.querySelector(".cursor");
  var dot = cursor.querySelector(".cursor__dot");
  var ring = cursor.querySelector(".cursor__ring");
  var cur = { x: -100, y: -100, tx: -100, ty: -100 };

  if (finePointer && !reduced) {
    window.addEventListener("pointermove", function (e) {
      cur.tx = e.clientX;
      cur.ty = e.clientY;
      var t = e.target.closest("a, button, [data-magnetic]");
      ring.classList.toggle("is-hover", !!t);
    }, { passive: true });

    window.addEventListener("pointerdown", function () { ring.classList.add("is-down"); });
    window.addEventListener("pointerup", function () { ring.classList.remove("is-down"); });

    (function cursorLoop() {
      cur.x += (cur.tx - cur.x) * 0.2;
      cur.y += (cur.ty - cur.y) * 0.2;
      dot.style.transform = "translate3d(" + cur.x + "px," + cur.y + "px,0)";
      ring.style.transform = "translate3d(" + cur.x + "px," + cur.y + "px,0)";
      requestAnimationFrame(cursorLoop);
    })();
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.32;
        var y = (e.clientY - (r.top + r.height / 2)) * 0.32;
        el.style.transform = "translate(" + x + "px," + y + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  reveals.forEach(function (el) {
    var d = el.getAttribute("data-d");
    if (d) el.style.setProperty("--d", d);
  });

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Parallax imagery ---------- */
  var parallaxEls = [];
  document.querySelectorAll(".parallax-img").forEach(function (wrap) {
    var img = wrap.querySelector("img");
    if (!img || reduced) return;
    parallaxEls.push({ wrap: wrap, img: img, y: 0, ty: 0 });
  });

  function parallaxLoop() {
    var vh = window.innerHeight;
    parallaxEls.forEach(function (p) {
      var r = p.wrap.getBoundingClientRect();
      var center = r.top + r.height / 2 - vh / 2;
      p.ty = -(center * 0.12);
      p.y += (p.ty - p.y) * 0.08;
      p.img.style.transform = "translate3d(0," + p.y + "px,0) scale(1.16)";
    });
    requestAnimationFrame(parallaxLoop);
  }
  if (parallaxEls.length) parallaxLoop();

  /* ---------- Tasting index ---------- */
  var items = [
    {
      img: "assets/images/atelier-croissant-butter.jpg",
      note: "81 layers of laminated dough and cultured butter. A crust that shatters, a crumb that sings, a hollow that hums.",
      tags: ["Laminated", "81 layers", "Cultured butter"]
    },
    {
      img: "assets/images/carte-macaron-plate.jpg",
      note: "Almond shell under tensile tension, cracking over ganache the colour of espresso stone.",
      tags: ["Almond", "Ganache", "Pressed"]
    },
    {
      img: "assets/images/carte-chocolate-pastry.jpg",
      note: "Seven strata of almond, coffee and dark chocolate — stacked like a building and eaten like a secret.",
      tags: ["Almond", "Coffee", "7 strata"]
    },
    {
      img: "assets/images/carte-millefeuille.jpg",
      note: "One hundred and forty-four layers standing to attention — waiting for the first knife.",
      tags: ["Puff", "Crème", "Vanilla"]
    },
    {
      img: "assets/images/carte-truffle.jpg",
      note: "A truffle's worth of dark chocolate pressed into a cocoa shell. Edible obsidian, glazed and patient.",
      tags: ["Dark cocoa", "Glaze", "Crunch"]
    },
    {
      img: "assets/images/carte-chocolate-blue.jpg",
      note: "A quiet parade of small desserts beside a strong coffee. The end of a long meal, done properly.",
      tags: ["Assortment", "Coffee", "To finish"]
    }
  ];

  items.forEach(function (it) {
    var pre = new Image();
    pre.src = it.img;
  });

  var rows = Array.prototype.slice.call(document.querySelectorAll(".index__row"));
  var previewImg = document.querySelector(".preview__img");
  var previewNote = document.querySelector(".preview__note");
  var previewTags = document.querySelector(".preview__tags");
  var previewNum = document.querySelector(".preview__number");
  var previewPanel = document.getElementById("carte-panel");
  var activeIdx = 0;
  var swapTimer = null;

  function setActive(idx, focus) {
    if (idx === activeIdx && focus !== true) return;
    activeIdx = idx;

    rows.forEach(function (r, i) {
      var on = i === idx;
      r.classList.toggle("is-active", on);
      r.setAttribute("aria-selected", String(on));
    });

    if (previewPanel) previewPanel.setAttribute("aria-labelledby", "tab-" + (idx + 1));

    var item = items[idx];

    if (swapTimer) clearTimeout(swapTimer);
    previewImg.classList.add("swapping");
    previewNote.classList.add("swapping");
    swapTimer = setTimeout(function () {
      previewImg.src = item.img;
      previewImg.alt = "Signature " + String(idx + 1).padStart(2, "0") + " — pastry of Maison Doux";
      previewImg.classList.remove("swapping");
      previewNote.textContent = item.note;
      previewNote.classList.remove("swapping");
      previewNum.textContent = String(idx + 1).padStart(2, "0");
    }, 200);

    previewTags.innerHTML = "";
    item.tags.forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      previewTags.appendChild(li);
    });
  }

  rows.forEach(function (row, i) {
    row.addEventListener("click", function () { setActive(i, true); });
    if (finePointer && !reduced) {
      row.addEventListener("pointerenter", function () { setActive(i, false); });
    }
  });

  var list = document.querySelector(".index__list");
  list.addEventListener("keydown", function (e) {
    var idx = activeIdx;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") idx = (idx + 1) % rows.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") idx = (idx - 1 + rows.length) % rows.length;
    else return;
    e.preventDefault();
    setActive(idx, true);
    rows[idx].focus();
  });

  /* Kick off the tasting index on the first paint */
  setActive(0, false);
})();
