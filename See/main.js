/* ============================================================
   SEE — The Art of the Golden Hour · interactions
   A VEILLEMM experience
   ============================================================ */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ------------------------------------------------------------
     1. Preloader
  ------------------------------------------------------------ */
  const preloader = document.querySelector('.preloader');
  const barFill = document.querySelector('.preloader__bar-fill');

  function finishPreloader() {
    if (document.body.classList.contains('loaded')) return;
    document.body.classList.add('loaded');
    preloader.classList.add('preloader--done');
    window.setTimeout(() => { preloader.remove(); }, 900);
  }

  if (!reduced) {
    let progress = 0;
    const tick = () => {
      progress += Math.random() * 16 + 7;
      if (progress >= 100) {
        progress = 100;
        barFill.style.width = '100%';
        window.setTimeout(finishPreloader, 320);
        return;
      }
      barFill.style.width = progress + '%';
      window.setTimeout(tick, 95);
    };
    window.setTimeout(tick, 280);
    window.setTimeout(finishPreloader, 3600); // failsafe
  } else {
    finishPreloader();
  }

  /* ------------------------------------------------------------
     2. Nav state on scroll
  ------------------------------------------------------------ */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------
     3. Reveal on scroll (IntersectionObserver)
  ------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('[data-reveal]');
  revealEls.forEach((el) => {
    if (el.dataset.delay) el.style.setProperty('--d', el.dataset.delay);
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('revealed'));
  }

  /* ------------------------------------------------------------
     4. Parallax layers
  ------------------------------------------------------------ */
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  let parallaxBusy = false;

  function updateParallax() {
    if (reduced || !parallaxEls.length) return;
    const vh = window.innerHeight;
    parallaxEls.forEach((layer) => {
      const parent = layer.parentElement;
      const rect = parent.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - vh / 2;
      const speed = parseFloat(layer.dataset.parallax || '0.15');
      layer.style.transform = 'translateY(' + center * -speed + 'px)';
    });
    parallaxBusy = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!parallaxBusy) {
        parallaxBusy = true;
        window.requestAnimationFrame(updateParallax);
      }
    },
    { passive: true }
  );
  window.addEventListener('resize', updateParallax, { passive: true });
  updateParallax();

  /* ------------------------------------------------------------
     5. Smooth anchors
  ------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ------------------------------------------------------------
     6. Beach strip — arrows + drag
  ------------------------------------------------------------ */
  const strip = document.getElementById('strip');
  const prevBtn = document.getElementById('strip-prev');
  const nextBtn = document.getElementById('strip-next');

  if (strip && prevBtn && nextBtn) {
    const scrollByCard = (dir) => {
      const card = strip.querySelector('.strip-card');
      const amount = card ? card.getBoundingClientRect().width + 20 : 360;
      strip.scrollBy({ left: amount * dir, behavior: reduced ? 'auto' : 'smooth' });
    };
    prevBtn.addEventListener('click', () => scrollByCard(-1));
    nextBtn.addEventListener('click', () => scrollByCard(1));

    // Drag to scroll
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let lastDragEnd = 0;
    strip.addEventListener('pointerdown', (e) => {
      isDown = true;
      startX = e.clientX;
      startScroll = strip.scrollLeft;
      strip.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      strip.scrollLeft = startScroll - (e.clientX - startX);
    });
    window.addEventListener('pointerup', (e) => {
      if (!isDown) return;
      isDown = false;
      strip.classList.remove('is-dragging');
      if (Math.abs(e.clientX - startX) > 6) lastDragEnd = Date.now();
    });
    // clicks fired right after a drag shouldn't open the lightbox
    strip.addEventListener('click', (e) => {
      if (Date.now() - lastDragEnd < 400) e.stopPropagation();
    }, true);
  }

  /* ------------------------------------------------------------
     7. Lightbox
  ------------------------------------------------------------ */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbItems = Array.from(document.querySelectorAll('[data-lightbox]')).map((el) => ({
    src: (el.querySelector('img') || {}).currentSrc || (el.querySelector('img') || {}).src || '',
    caption: el.dataset.caption || 'See.',
  }));
  let lbIndex = 0;

  function openLightbox(index) {
    if (!lbItems.length) return;
    lbIndex = (index + lbItems.length) % lbItems.length;
    const item = lbItems[lbIndex];
    lbImg.src = item.src;
    lbImg.alt = item.caption;
    lbCaption.textContent = item.caption;
    lightbox.hidden = false;
    requestAnimationFrame(() => {
      lightbox.classList.add('open');
      lbClose.focus();
    });
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
    window.setTimeout(() => { lightbox.hidden = true; }, 350);
  }

  function stepLightbox(dir) {
    lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
    const item = lbItems[lbIndex];
    lbImg.style.opacity = '0';
    lbImg.style.transition = 'opacity .25s';
    window.setTimeout(() => {
      lbImg.src = item.src;
      lbImg.alt = item.caption;
      lbCaption.textContent = item.caption;
      lbImg.style.opacity = '1';
    }, 200);
  }

  // swipe support on the lightbox image (touch + mouse drag)
  let lbTouchX = null;
  lbImg.addEventListener('pointerdown', (e) => { lbTouchX = e.clientX; });
  lbImg.addEventListener('pointerup', (e) => {
    if (lbTouchX === null) return;
    const dx = e.clientX - lbTouchX;
    lbTouchX = null;
    if (Math.abs(dx) > 40) stepLightbox(dx < 0 ? 1 : -1);
  });

  let lastTrigger = null;
  document.querySelectorAll('[data-lightbox]').forEach((el, i) => {
    // make each gallery frame keyboard-focusable and a real button
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Open image: ' + (el.dataset.caption || ''));
    const open = () => { lastTrigger = el; openLightbox(i); };
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', () => stepLightbox(-1));
  if (lbNext) lbNext.addEventListener('click', () => stepLightbox(1));

  window.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('open')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    }
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  /* ------------------------------------------------------------
     8. Count-up stats
  ------------------------------------------------------------ */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          cio.unobserve(el);
          const target = parseInt(el.dataset.count, 10);
          if (reduced) { el.textContent = target; return; }
          const dur = 1400;
          const start = performance.now();
          const step = (now) => {
            const t = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased);
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* ------------------------------------------------------------
     9. Custom cursor (fine pointers only)
  ------------------------------------------------------------ */
  if (finePointer && !reduced) {
    document.documentElement.classList.add('cursor-on');
    const cursor = document.querySelector('.cursor');
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    let mx = -100, my = -100, rx = -100, ry = -100;

    window.addEventListener('pointermove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      cursor.classList.remove('is-hidden');
    });

    (function loopRing() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loopRing);
    })();

    document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
    document.addEventListener('pointerenter', () => cursor.classList.remove('is-hidden'));

    const hoverTargets = 'a, button, [data-lightbox], .strip-card, .dest-item';
    document.addEventListener('pointerover', (e) => {
      if (e.target.closest(hoverTargets)) cursor.classList.add('is-active');
    });
    document.addEventListener('pointerout', (e) => {
      if (e.target.closest(hoverTargets)) cursor.classList.remove('is-active');
    });
  }

  /* ------------------------------------------------------------
     10. Magnetic buttons
  ------------------------------------------------------------ */
  if (finePointer && !reduced) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      const strength = 0.28;
      btn.addEventListener('pointermove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * strength;
        const y = (e.clientY - rect.top - rect.height / 2) * strength;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
        btn.style.transform = 'translate(0,0)';
        window.setTimeout(() => { btn.style.transition = ''; }, 500);
      });
    });
  }

  /* ------------------------------------------------------------
     11. Mobile menu overlay
  ------------------------------------------------------------ */
  const navToggle = document.getElementById('nav-toggle');
  const navOverlay = document.getElementById('nav-overlay');
  if (navToggle && navOverlay) {
    const setMenu = (open) => {
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      navOverlay.classList.toggle('open', open);
      navOverlay.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    navToggle.addEventListener('click', () => {
      setMenu(navOverlay.classList.contains('open') ? false : true);
    });
    navOverlay.querySelectorAll('a').forEach((link, i) => {
      link.style.setProperty('--i', i);
      link.addEventListener('click', () => {
        const id = link.getAttribute('href');
        setMenu(false);
        // wait for the overlay to release the scroll lock, then glide
        if (id && id.length > 1) {
          const target = document.querySelector(id);
          if (target) window.setTimeout(() => {
            target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
          }, 60);
        }
      });
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navOverlay.classList.contains('open')) setMenu(false);
    });
  }
})();
