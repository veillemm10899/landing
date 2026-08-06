/* VEILLEMM — navigation, magnetic buttons, channel accordion */
(function () {
  'use strict';
  const VM = window.VM;

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (hamburger && menu) {
    const open = (isOpen) => {
      hamburger.classList.toggle('is-open', isOpen);
      menu.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('is-menu-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };
    hamburger.addEventListener('click', () => open(!menu.classList.contains('is-open')));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => open(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { open(false); hamburger.focus(); }
    });
  }

  /* ---------- Active link spy ---------- */
  const navLinks = VM.$$('.nav-links a, .menu-nav a');
  const spyTargets = ['manifesto', 'channels', 'transmissions', 'process', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && navLinks.length && spyTargets.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spyTargets.forEach((t) => spy.observe(t));
  }

  /* ---------- Magnetic buttons ---------- */
  if (VM.finePointer && !VM.reducedMotion) {
    VM.$$('[data-magnetic]').forEach((el) => {
      const strength = 0.28;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Channel accordion ---------- */
  const channels = VM.$$('.channel');
  if (channels.length) {
    const setOpen = (ch, isOpen) => {
      ch.classList.toggle('is-open', isOpen);
      ch.querySelector('.channel-head').setAttribute('aria-expanded', String(isOpen));
    };
    // Open the first channel by default so the pattern is discoverable
    setOpen(channels[0], true);
    channels.forEach((ch) => {
      ch.querySelector('.channel-head').addEventListener('click', () => {
        const isOpen = ch.classList.contains('is-open');
        channels.forEach((c) => setOpen(c, false));
        setOpen(ch, !isOpen);
      });
    });
  }
})();
