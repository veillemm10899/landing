(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var desktop = window.matchMedia('(min-width: 861px)');

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var hero = document.querySelector('.hero');
    if (hero) {
      requestAnimationFrame(function () {
        setTimeout(function () {
          hero.classList.add('in');
        }, 120);
      });
    }

    initHeader();
    initBurger();
    initReveals();
    initCounters();
    initForm();
    initYear();

    if (finePointer && !reducedMotion) {
      document.documentElement.classList.add('has-cursor');
      initCursor();
      initMagnetic();
      initWorkPreview();
    } else {
      initWorkPreviewStatic();
    }
  });

  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initBurger() {
    var burger = document.getElementById('burger');
    var menu = document.getElementById('mobile-menu');
    if (!burger || !menu) return;

    var setOpen = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));
      menu.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setOpen(false);
      });
    });

    window.addEventListener('resize', function () {
      if (desktop.matches) setOpen(false);
    });
  }

  function initReveals() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) || reducedMotion) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  function initCounters() {
    var counters = document.querySelectorAll('.count');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window) || reducedMotion) {
      counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);
        var target = parseInt(el.getAttribute('data-count'), 10);
        var start = null;
        var duration = 1500;

        function frame(ts) {
          if (start === null) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  function initCursor() {
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    var ringX = 0, ringY = 0, dotX = 0, dotY = 0;
    var visible = false;

    document.addEventListener('mousemove', function (e) {
      if (!visible) {
        visible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
      dotX = e.clientX;
      dotY = e.clientY;
      dot.style.left = dotX + 'px';
      dot.style.top = dotY + 'px';
    });

    (function loop() {
      ringX += (dotX - ringX) * 0.16;
      ringY += (dotY - ringY) * 0.16;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(loop);
    })();

    var interactive = 'a, button, select, input, textarea, .work-item, label';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(interactive)) ring.classList.add('is-active');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(interactive)) ring.classList.remove('is-active');
    });
  }

  function initMagnetic() {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      var strength = 0.28;
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width / 2) * strength;
        var y = (e.clientY - rect.top - rect.height / 2) * strength;
        el.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  function initWorkPreview() {
    var panel = document.getElementById('work-preview');
    var items = document.querySelectorAll('.work-item');
    if (!panel || !items.length) return;

    var arts = panel.querySelectorAll('.work-preview-art');
    var active = null;
    var raf = null;

    items.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        active = item;
        var index = item.getAttribute('data-art');
        arts.forEach(function (art) {
          art.classList.toggle('is-active', art.getAttribute('data-art') === index);
        });
        panel.classList.add('is-visible');
      });

      item.addEventListener('mousemove', function (e) {
        if (!active) return;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          positionPanel(e.clientX, e.clientY);
        });
      });

      item.addEventListener('mouseleave', function () {
        active = null;
        panel.classList.remove('is-visible');
      });
    });

    function positionPanel(x, y) {
      var w = panel.offsetWidth;
      var h = panel.offsetHeight;
      var margin = 20;
      var offset = 26;
      var left = x + offset;
      if (left + w > window.innerWidth - margin) {
        left = x - offset - w;
      }
      var top = y - h * 0.35;
      if (top + h > window.innerHeight - margin) {
        top = y - h - offset;
      }
      if (top < margin) top = margin;
      panel.style.left = Math.round(left) + 'px';
      panel.style.top = Math.round(top) + 'px';
    }
  }

  function initWorkPreviewStatic() {
    var panel = document.getElementById('work-preview');
    if (panel) panel.remove();
  }

  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var status = form.querySelector('.form-note');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#f-name').value.trim();
      var email = form.querySelector('#f-email').value.trim();
      var project = form.querySelector('#f-project').value;
      var message = form.querySelector('#f-message').value.trim();

      var subject = encodeURIComponent('New project inquiry — ' + (project || 'General'));
      var body = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Project: ' + project + '\n\n' +
        message
      );

      window.location.href = 'mailto:veillemm1089@gmail.com?subject=' + subject + '&body=' + body;

      if (status) {
        status.textContent = 'Signal sent — I\u2019ll reply within 48 hours.';
      }
      form.reset();
    });
  }

  function initYear() {
    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  }
})();
