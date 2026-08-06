/* ============================================================
   VEILLEMM — interactions
   ============================================================ */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Hero load animation ---------- */
  const onReady = () => requestAnimationFrame(() => document.documentElement.classList.add('is-loaded'));
  if (document.readyState === 'complete') onReady();
  else {
    window.addEventListener('load', onReady, { once: true });
    // Never leave the hero hidden on a slow network
    setTimeout(onReady, 2500);
  }

  /* ---------- Sticky header state ---------- */
  const header = document.getElementById('site-header');
  const progressBar = document.getElementById('progress-bar');

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.count');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const dur = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window && !prefersReduced) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count));
  }

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuLinks = mobileMenu.querySelectorAll('a');

  const setMenu = (open) => {
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      const firstLink = mobileMenu.querySelector('a');
      if (firstLink) firstLink.focus();
    } else if (mobileMenu.contains(document.activeElement)) {
      burger.focus();
    }
  };

  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));

  menuLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        setMenu(false);
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      } else {
        setMenu(false);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) setMenu(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860 && mobileMenu.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- Magnetic buttons (fine pointers only) ---------- */
  if (isFinePointer && !prefersReduced) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.translate = `${x * 0.12}px ${y * 0.2}px`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.translate = '0px 0px';
      });
    });
  }

  /* ---------- Copy email ---------- */
  const copyBtn = document.querySelector('.copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const value = copyBtn.dataset.copy || '';
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      copyBtn.textContent = 'Copied ✓';
      copyBtn.classList.add('is-copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('is-copied');
      }, 2000);
    });
  }

  /* ---------- Contact form → mailto ---------- */
  const form = document.getElementById('contact-form');
  if (form) {
    const error = document.getElementById('form-error');
    const fields = {
      name: document.getElementById('f-name'),
      email: document.getElementById('f-email'),
      message: document.getElementById('f-message'),
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstInvalid = null;

      ['name', 'email', 'message'].forEach((key) => {
        const el = fields[key];
        const bad =
          !el.value.trim() ||
          (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
        el.classList.toggle('is-invalid', bad);
        if (bad && !firstInvalid) firstInvalid = el;
      });

      if (firstInvalid) {
        error.textContent = 'Please fill in every field — and make sure the email is valid.';
        error.hidden = false;
        firstInvalid.focus();
        return;
      }

      error.hidden = true;
      const typeSelect = document.getElementById('f-type');
      const chosenType = typeSelect ? typeSelect.value : 'Web product';
      const subject = `Project inquiry — ${chosenType}`;
      const body = [
        `Name: ${fields.name.value.trim()}`,
        `Email: ${fields.email.value.trim()}`,
        `Project type: ${chosenType}`,
        '',
        fields.message.value.trim(),
      ].join('\n');

      window.location.href = `mailto:veillemm1089@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
