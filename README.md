# altira-website

Marketing site for **Altira AI** — custom AI systems for small and medium businesses.
Static HTML / CSS / JS. No build step. Deployed to Vercel.

Live domain: `altira.ai` *(pending)*

---

## Local preview

```bash
open index.html
# or, for live-reload:
python3 -m http.server 8000
# → http://localhost:8000
```

---

## File map

```
/
├── index.html                  # single-page home
├── styles/
│   ├── tokens.css              # brand vars (color, type, spacing, motion, radii)
│   ├── base.css                # reset, typography, scroll-reveal base
│   └── components.css          # every section + animations
├── scripts/
│   └── main.js                 # IntersectionObserver reveals, counter
│                               # animations, nav scroll state, hero
│                               # mouse parallax, smooth anchor scroll,
│                               # hero particle network canvas
├── case-studies/
│   ├── kairos.html             # /case-studies/kairos
│   ├── monarch.html            # /case-studies/monarch
│   └── npsa.html               # /case-studies/npsa
├── assets/
│   ├── logo-lockup.png         # nav + footer logo
│   ├── pfp.png                 # founder headshot (About section)
│   └── case-covers/
│       ├── kairos-cover.png    # 1920×1080 brand covers
│       ├── monarch-cover.png
│       └── npsa-cover.png
├── vercel.json                 # clean URLs (/case-studies/kairos instead of .html)
└── README.md
```

---

## Brand primitives (locked)

- **Palette** — pure black base, white text, `#78B4F0` as the single accent
- **Fonts** — Space Grotesk (primary) + JetBrains Mono (micro labels)
- **Dot grid** — subtle texture across the whole page
- **Hero** — centered composition, animated particle network, word-stagger title,
  inline stats row, dual pill CTAs
- **Radii** — soft system: `pill 999px` · `xl 32px` · `lg 24px` · `md 18px`
- **Motion** — every reveal respects `prefers-reduced-motion`

## Sections

1. Nav (sticky, backdrop-blurs on scroll)
2. Hero (full viewport)
3. Process — Identify → Architect → Deploy → Maintain
4. Services — 4 icon cards (Lead Gen / Voice / Intel / Custom)
5. Case studies — 3 cards linking to dedicated pages
6. About (founder photo + first-person prose)
7. Final CTA
8. Footer (single line, minimal)

## Case study pages

Each page follows the 6-block template:
**Client → Problem → Build → New Workflow → Impact → (Quote) → CTA**

Canonical content lives here; anything that appears on LinkedIn Featured
is synchronized from the source markdown in the AIOS workspace at
`aios/Projects/Branding/case-studies/`.

---

## Deployment (Vercel)

Root directory: `/` (repo root)
Framework preset: Other
Build command: *(none)*
Output directory: *(none — static)*

`vercel.json` gives us clean URLs, so `/case-studies/kairos` works
without the `.html`.

---

## Iterating

1. Edit HTML / CSS / JS
2. `open index.html` to preview
3. `git commit` + `git push` — Vercel auto-deploys
