# MAISON DOUX — Atelier de Pâtisserie

A cinematic, dark-chocolate-and-cream digital experience for a premium pâtisserie
concept — designed, engineered, and baked digitally by **Cyrus Vergara** under the
**VEILLEMM** practice.

## Concept

**"Where butter becomes architecture."** The site treats pastry as an engineering
discipline and software as a craft — two machines of layered precision. It answers
*who is behind the maison* (VEILLEMM) while selling the experience itself.

- **Layout logic** — a single continuous cinematic scroll over a fixed WebGL atelier.
- **3D scene** — procedurally built pastry environment (layered cake, chocolate donut,
  floating macarons, gold dust) rendered with Three.js r128, reacting to scroll and pointer.
- **Chapters** — 01 L'Atelier (philosophy), 02 La Carte (interactive tasting index),
  03 Le Métier (the maker), 04 La Visite (conversion).
- **Design system** — Cinematic Experience × Minimal Luxury. Espresso background,
  cream type, caramel/gold accents; Fraunces + Space Grotesk.
- **Interactions** — custom cursor, magnetic buttons, scroll reveals, parallax imagery,
  keyboard-navigable tasting index, marquee, film grain.

## Tech

Vanilla HTML / CSS / JavaScript. No build step. Three.js r128 vendored locally.

## Structure

```
maison-doux/
├── index.html
├── css/styles.css
├── js/
│   ├── three.min.js      (vendored)
│   ├── scene.js          (WebGL atelier)
│   └── main.js           (interaction system)
└── assets/
    ├── brand/mark.svg    (VEILLEMM monogram / favicon)
    ├── icons/            (reserved)
    └── images/           (17 curated Unsplash photographs, royalty-free)
```

## Run locally

**No server needed.** `index.html` is fully self-contained — CSS, Three.js, and all
photos are inlined (base64). Double-click `index.html` and it just works.

> Fonts still load from Google's CDN (graceful fallback to Georgia/system serif if
> offline). Everything else is local.

## Deploy

Static site — drop `index.html` anywhere (Netlify, Vercel, GitHub Pages). WebGL
gracefully falls back to a hero photograph when unavailable.

> `css/`, `js/`, `assets/` are kept as the editable source. `index.html` is the
> compiled, portable build — copy just that one file to clone this landing page.

## Contact

- Cyrus Vergara — @veillemm
- veillemm1089@gmail.com
- 0993 558 4785
- https://veillemm.netlify.app/
