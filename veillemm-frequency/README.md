# VEILLEMM — The Frequency Atelier

> **Most software is noise. I build signal.**

A premium digital experience website for the personal brand of **Cyrus Vergara**
(software engineer · creative developer · digital product builder), built as a
fully original, single-page experience — no framework, no template, no stock.

## Creative universe

**Concept — The Frequency Atelier.** VEILLEMM is presented as a living atelier
where digital products are *tuned*: every project passes through the same
operating phases — **Listen → Shape → Transmit**. The visitor's journey is a
sequence of transmissions:

| Transmission | Section | Emotional beat |
|---|---|---|
| 00 | Hero — *Signal over noise.* | Curiosity |
| 01 | Manifesto — *Most software is noise. I build signal.* | Belief |
| 02 | Channels — four capabilities as expandable index rows | Credibility |
| 03 | Transmissions — scroll-pinned horizontal case showcase | Proof |
| 04 | Process — a live-typed terminal + operating principles | Trust |
| 05 | Contact — *Have a signal worth transmitting?* | Action |

**Design language:** Cinematic + Typography First. Deep ink `#0a0a0c`, warm bone
`#efeae1`, and exactly one accent — signal amber `#ffb000`. Fraunces italic
(editorial serif) × Space Grotesk (technical sans) × JetBrains Mono
(instrumentation).

**Interaction system:** transmission preloader → custom cursor → magnetic CTAs →
generative hero signal field → word-masked reveals → scroll-pinned horizontal
showcase with four live generative canvases → typed terminal → live Manila clock
and drifting signal meter. Every interaction respects `prefers-reduced-motion`
and every layer degrades gracefully without JavaScript.

## Stack

- Semantic HTML5 · BEM-flavored CSS with token architecture · vanilla ES5-compatible
  JavaScript (classic scripts — works from `file://` too)
- Zero build step, zero runtime dependencies, zero image payload
- SEO: meta/OG/Twitter, JSON-LD `Person`, canonical, robots.txt
- A11y: skip link, ARIA states, focus-visible rings, keyboard-friendly accordions

## Project structure

```
├── index.html               # full document, all copy, structured data
├── assets/
│   ├── README.md            # asset intelligence & sourcing guide
│   ├── logo.svg             # VEILLEMM signal mark
│   ├── favicon.svg
│   └── images/og-cover.svg  # 1200×630 social cover
├── css/
│   ├── tokens.css           # colors, type, spacing, motion tokens
│   ├── base.css             # reset, primitives, buttons, reveal system
│   ├── components.css       # header, menu, cursor, preloader, terminal…
│   ├── sections.css         # hero, manifesto, channels, showcase, contact…
│   └── responsive.css       # tablet / mobile / landscape / touch
└── js/
    ├── util.js              # helpers, reduced-motion + pointer detection
    ├── cursor.js            # custom cursor
    ├── preloader.js         # transmission count + curtain lift
    ├── navigation.js        # header state, mobile menu, spy, magnetic, accordions
    ├── reveal.js            # IntersectionObserver reveals
    ├── canvas.js            # hero field + 4 live project engines
    ├── terminal.js          # process terminal typer
    ├── clock.js             # live Manila clock
    └── main.js              # pinned scroller, signal meter, boot
```

## Run locally

Any static server works — no install needed:

```bash
# option A — Python
python3 -m http.server 8000

# option B — Node
npx serve .

# option C — just open index.html (classic scripts support file://)
```

## Customize

1. **Content** — all copy lives in `index.html`; replace the four fictional
   transmissions (T-001…T-004) with real projects, and update any claim you
   don't stand behind (e.g. availability date).
2. **Identity** — colors, type and spacing tokens live in `css/tokens.css`.
   Fonts are loaded in `<head>` of `index.html`.
3. **Project visuals** — the four live canvases are small engines in
   `js/canvas.js` (`spectrum`, `orbit`, `pulse`, `gridDrift`). Swap `data-canvas`
   values on the slides to remix, or add your own.
4. **Assets** — for a photography-driven variant, see `assets/README.md` for the
   sourcing rules and recommended royalty-free sources.

## Deploy

**Netlify** — drag & drop the project folder at app.netlify.com, or:

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=.
```

Static, so any host works (Vercel, GitHub Pages, Cloudflare Pages, S3…).
`robots.txt` and SEO tags are already in place.

## Quality gate

- ✅ Semantic landmarks + skip link + ARIA-expanded/hidden states
- ✅ Reduced-motion fallbacks; canvases render a static frame
- ✅ No-JS fallback: all content visible, preloader/cursor/reveals disabled
- ✅ Performance: no external images, single font request, canvas DPR-capped
- ✅ Intentional responsive layouts (portrait/landscape/touch/tablet)

---

© 2026 VEILLEMM — designed & engineered by Cyrus Vergara. Signal over noise.
