/* VEILLEMM — Cyber Field Manual 2026
   Interactions: progress, header, mobile menu, terminal typing,
   scroll reveal, counters, magnetic buttons, cursor glow, contact mailto. */
(function () {
  "use strict";

  var doc = document;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  /* ---------- Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll progress + header + scrollspy ---------- */
  var header = $("#site-header");
  var bar = $("#progress-bar");
  var navLinks = $$(".site-nav a");
  var sections = navLinks
    .map(function (a) { return $(a.getAttribute("href")); })
    .filter(Boolean);

  function onScroll() {
    var y = window.scrollY || doc.documentElement.scrollTop;
    var h = doc.documentElement.scrollHeight - window.innerHeight;

    if (header) header.classList.toggle("scrolled", y > 20);
    if (bar && h > 0) bar.style.width = (y / h) * 100 + "%";

    var current = sections[0];
    sections.forEach(function (sec) {
      if (sec && sec.offsetTop - 140 <= y) current = sec;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("active", current && a.getAttribute("href") === "#" + current.id);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = $("#burger");
  var menu = $("#mobile-menu");
  if (burger && menu) {
    function closeMenu() {
      burger.setAttribute("aria-expanded", "false");
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
      doc.body.style.overflow = "";
    }
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      doc.body.style.overflow = open ? "hidden" : "";
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", closeMenu); });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Counters ---------- */
  var counters = $$(".count");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = String(target).indexOf(".") > -1 ? 1 : 0;
    var dur = 1600;
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute("data-count");
    });
  }

  /* ---------- Terminal typing ---------- */
  var termOut = $("#terminal-out");
  var termCmd = $(".terminal .cmd");
  if (termOut && termCmd) {
    var commands = [
      { cmd: "whoami", out: "> aspiring.defender — ready to train" },
      { cmd: "ls ./2026", out: "> gap/   4.8M open roles   → YOU\n  paths/ 6 career lanes\n  roadmap/ 6 steps\n  certs/  budget-friendly ladder" },
      { cmd: "cat ./first-job.plan", out: "> 1. Security+ → 2. hands-on labs → 3. apply. 6–12 mo." },
      { cmd: "ping society.hiring", out: "> 64 bytes from recruiter: time=1.2 weeks · reply: HIRED" },
      { cmd: "./start-now.sh", out: "> Initializing… scan complete. Your first move: #roadmap ↓" }
    ];
    var ci = 0;
    var typing = false;

    function typeLine(text, node, speed, done) {
      var i = 0;
      typing = true;
      (function tick() {
        if (i <= text.length) {
          node.textContent = text.slice(0, i);
          i++;
          setTimeout(tick, speed);
        } else {
          typing = false;
          done();
        }
      })();
    }

    function run() {
      var c = commands[ci % commands.length];
      termCmd.textContent = "";
      termOut.textContent = "";
      typeLine(c.cmd, termCmd, 70, function () {
        setTimeout(function () {
          termOut.textContent = c.out;
          setTimeout(function () {
            ci++;
            run();
          }, 2400);
        }, 350);
      });
    }
    setTimeout(run, 600);
  }

  /* ---------- Magnetic buttons ---------- */
  if (window.matchMedia("(pointer: fine)").matches) {
    $$(".magnetic").forEach(function (btn) {
      var strength = 0.25;
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * strength;
        var y = (e.clientY - r.top - r.height / 2) * strength;
        btn.style.transform = "translate(" + x + "px," + y + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Cursor glow ---------- */
  var glow = doc.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  doc.body.appendChild(glow);
  var gx = window.innerWidth / 2;
  var gy = window.innerHeight / 2;
  var tx = gx, ty = gy;
  window.addEventListener("mousemove", function (e) {
    tx = e.clientX; ty = e.clientY;
  });
  (function loop() {
    gx += (tx - gx) * 0.08;
    gy += (ty - gy) * 0.08;
    glow.style.left = gx + "px";
    glow.style.top = gy + "px";
    requestAnimationFrame(loop);
  })();

  /* ---------- Copy email ---------- */
  $$(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      function legacyCopy() {
        var ta = doc.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        doc.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = doc.execCommand("copy"); } catch (e) {}
        doc.body.removeChild(ta);
        if (ok) flash(btn);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { flash(btn); }, legacyCopy);
      } else {
        legacyCopy();
      }
    });
  });
  function flash(btn) {
    var old = btn.textContent;
    btn.textContent = "Copied ✓";
    btn.classList.add("copied");
    setTimeout(function () {
      btn.textContent = old;
      btn.classList.remove("copied");
    }, 1600);
  }

  /* ---------- Contact form → mailto ---------- */
  var form = $("#contact-form");
  if (form) {
    var errorEl = $("#form-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#f-name").value.trim();
      var email = $("#f-email").value.trim();
      var topic = $("#f-topic").value;
      var msg = $("#f-message").value.trim();

      if (!name || !email || !msg) {
        errorEl.textContent = "// ERROR: name, email and message are required.";
        errorEl.hidden = false;
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorEl.textContent = "// ERROR: that email doesn't look valid.";
        errorEl.hidden = false;
        return;
      }
      errorEl.hidden = true;

      var subject = encodeURIComponent("[VEILLEMM] " + topic + " — from " + name);
      var body = encodeURIComponent("Hi Cyrus,\n\n" + msg + "\n\n— " + name + "\n" + email);
      window.location.href = "mailto:veillemm1089@gmail.com?subject=" + subject + "&body=" + body;
    });
  }
})();
