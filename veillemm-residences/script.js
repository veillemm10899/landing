/* ==========================================================================
   VEILLEMM — interactions
   ========================================================================== */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header state ---------- */
  var header = document.getElementById("siteHeader");

  function onScrollHeader() {
    header.classList.toggle("scrolled", window.scrollY > 24);
  }

  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.querySelectorAll(".site-nav a");

  function toggleNav(open) {
    document.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  navToggle.addEventListener("click", function () {
    toggleNav(!document.body.classList.contains("nav-open"));
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      toggleNav(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") toggleNav(false);
  });

  /* ---------- Scroll reveal (with stagger) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  // Elements already inside the hero should appear with the load animation.
  var heroReveals = document.querySelectorAll(".hero .reveal");
  if (heroReveals.length) {
    heroReveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  if ("IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var siblings = Array.prototype.filter.call(
            el.parentElement.children,
            function (child) {
              return child.classList && child.classList.contains("reveal");
            }
          );
          var index = siblings.indexOf(el);
          var delay = Math.min(index, 5) * 110;
          el.style.transitionDelay = delay + "ms";
          el.classList.add("in");
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      if (!el.closest(".hero")) io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- Animated counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1600;
    var start = null;

    function frame(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      // easeOutExpo
      var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window && !reducedMotion) {
    var counterIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(function (el) {
      counterIO.observe(el);
    });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
    });
  }

  /* ---------- Hero parallax ---------- */
  var heroBg = document.getElementById("heroBg");
  var hero = document.querySelector(".hero");

  if (heroBg && hero && !reducedMotion) {
    window.addEventListener(
      "scroll",
      function () {
        var rect = hero.getBoundingClientRect();
        if (rect.bottom < 0) return;
        var offset = Math.min(Math.max(-rect.top, 0), window.innerHeight);
        heroBg.style.transform = "translate3d(0, " + offset * 0.18 + "px, 0)";
      },
      { passive: true }
    );
  }

  /* ---------- Magnetic buttons ---------- */
  var magneticBtns = Array.prototype.slice.call(document.querySelectorAll(".magnetic"));

  if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    magneticBtns.forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + x * 0.22 + "px, " + y * 0.34 + "px)";
      });

      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Contact form → email ---------- */
  var form = document.getElementById("contactForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.elements["name"].value.trim();
      var email = form.email.value.trim();
      var phone = form.phone.value.trim();
      var interest = form.interest.value;
      var message = form.message.value.trim();

      if (!name || !email || !interest || !message) {
        form.reportValidity();
        return;
      }

      var subject = encodeURIComponent("VEILLEMM inquiry — " + (interest || "General"));
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        (phone ? "Phone: " + phone + "\n" : "") +
        "Interest: " + interest + "\n\n" +
        "Message:\n" + message;

      var note = document.getElementById("formNote");
      if (note) {
        note.textContent = "Opening your email app… If nothing happens, write to veillemm1089@gmail.com directly.";
      }

      window.location.href =
        "mailto:veillemm1089@gmail.com?subject=" + subject + "&body=" + encodeURIComponent(body);
    });
  }
})();
