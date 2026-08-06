/* VEILLEMM — process terminal typing */
(function () {
  'use strict';
  const VM = window.VM;
  const el = document.getElementById('terminal');
  if (!el) return;

  const LINES = [
    { html: '<span class="t-cmd">veillemm@atelier</span><span class="t-path">:~$</span> veillemm init <span class="t-accent">--client=you</span>', delay: 400 },
    { html: '<span class="t-ok">✓</span> listening on your signal', delay: 500 },
    { html: '&nbsp;', delay: 120 },
    { html: '<span class="t-accent">→</span> <span class="t-dim">01 LISTEN</span>   requirements · context · truth ...... <span class="t-accent">24–72h</span>', delay: 90 },
    { html: '<span class="t-accent">→</span> <span class="t-dim">02 SHAPE</span>    architecture · experience · identity . <span class="t-accent">1–2 wk</span>', delay: 90 },
    { html: '<span class="t-accent">→</span> <span class="t-dim">03 BUILD</span>    engineering · iteration · polish .... <span class="t-accent">2–6 wk</span>', delay: 90 },
    { html: '<span class="t-accent">→</span> <span class="t-dim">04 TRANSMIT</span> launch · measure · refine ........... <span class="t-accent">ongoing</span>', delay: 90 },
    { html: '&nbsp;', delay: 140 },
    { html: '<span class="t-cmd">veillemm@atelier</span><span class="t-path">:~$</span> status', delay: 420 },
    { html: '<span class="t-ok">✓</span> now accepting new transmissions', delay: 100 }
  ];

  let started = false;
  let lineIdx = 0;
  let charIdx = 0;
  let buffer = '';

  function flushLine() {
    const line = LINES[lineIdx];
    const node = document.createElement('span');
    node.className = 't-line';
    node.innerHTML = buffer;
    el.appendChild(node);
    buffer = '';
    charIdx = 0;
    lineIdx++;
    schedule();
  }

  function schedule() {
    if (lineIdx >= LINES.length) {
      // terminal settles with a blinking caret on its own line
      const caret = document.createElement('span');
      caret.className = 't-line';
      caret.innerHTML = '<span class="t-cmd">veillemm@atelier</span><span class="t-path">:~$</span> <span class="caret"></span>';
      el.appendChild(caret);
      return;
    }
    const line = LINES[lineIdx];
    const text = line.html.replace(/<[^>]*>/g, '');   // plain text for typing
    if (charIdx < text.length) {
      charIdx++;
      const typed = text.slice(0, charIdx);
      // re-wrap the typed slice with the line's markup by tracking opening tags
      buffer = wrapTyped(line.html, text, typed);
      el.innerHTML = buffer + '<span class="caret"></span>';
      setTimeout(schedule, VM.reducedMotion ? 0 : line.delay / Math.max(3, text.length / 6));
    } else {
      flushLine();
    }
  }

  // Re-emits markup so the typed plain text inherits the span styling
  function wrapTyped(html, plain, typed) {
    if (plain === typed) return html;
    const tokens = [];
    const re = /<span class="([^"]+)">([^<]*)<\/span>|([^<]+)/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      if (m[1] !== undefined) tokens.push({ cls: m[1], text: m[2] });
      else tokens.push({ cls: null, text: m[3] });
    }
    let out = '';
    let remaining = typed;
    for (const tok of tokens) {
      if (remaining.length <= 0) break;
      const take = tok.text.slice(0, remaining.length);
      if (tok.cls) out += `<span class="${tok.cls}">${take}</span>`;
      else out += take;
      remaining = remaining.slice(take.length);
    }
    return out;
  }

  function start() {
    if (started) return;
    started = true;
    schedule();
  }

  if ('IntersectionObserver' in window && !VM.reducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { start(); io.disconnect(); } });
    }, { threshold: 0.35 });
    io.observe(el);
  } else {
    // instant paste for reduced motion / no IO
    LINES.forEach((l) => {
      const span = document.createElement('span');
      span.className = 't-line';
      span.innerHTML = l.html;
      el.appendChild(span);
    });
    const caret = document.createElement('span');
    caret.className = 't-line';
    caret.innerHTML = '<span class="t-cmd">veillemm@atelier</span><span class="t-path">:~$</span> <span class="caret"></span>';
    el.appendChild(caret);
  }
})();
