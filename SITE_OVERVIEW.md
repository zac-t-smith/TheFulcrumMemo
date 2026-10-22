# The Fulcrum Memo — Site Overview

A personal credit analysis / distressed investing portfolio site for **Zachary T. Smith**, deployed as a static single-page app on **GitHub Pages** at the repo path `/FulcrumMemo/`.

Branding tagline: *"Credit Analysis & Restructuring Insights"*
Positioning line: *"From managing financial distress firsthand to analyzing it from the capital provider side."*

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Build tool | **Vite 5** (`@vitejs/plugin-react-swc`) |
| Language | **TypeScript 5.8** |
| Framework | **React 18.3** |
| Routing | **react-router-dom v6** (with `basename="/FulcrumMemo"`) |
| Styling | **Tailwind CSS 3.4** + `tailwindcss-animate` + `@tailwindcss/typography` |
| UI primitives | **shadcn/ui** on top of **Radix UI** (full suite: accordion, dialog, dropdown, tabs, toast, tooltip, etc.) |
| Icons | **lucide-react** |
| Animation | **framer-motion 12** (used on the case study page) |
| Charts | **recharts** (installed, used in case study) |
| Forms | react-hook-form + zod + @hookform/resolvers |
| Data | @tanstack/react-query (provider wired, not actively fetching) |
| Theming | next-themes (light/dark CSS variables defined) |
| Toasts | sonner + Radix toast |
| Scheduling widget | **Calendly** inline widget (embedded via script tag in `index.html`) |
| Package manager | npm + bun lockfile present |
| Deployment | GitHub Pages (SPA fallback via `cp dist/index.html dist/404.html` in build script, `.nojekyll` committed) |

Dev commands: `npm run dev` (port 8080), `npm run build`, `npm run lint`, `npm run preview`.

---

## 2. Routes & Page Structure

Router is wrapped in `BrowserRouter basename="/FulcrumMemo"`.

| Path | Component | Purpose |
|---|---|---|
| `/` | `pages/Index.tsx` | Single-page landing with 5 stacked sections |
| `/my-business` | `pages/RestructuringCaseStudy.tsx` | Interactive case study of Zachary's own restoration-company restructuring (~1,000 LOC, framer-motion animations, tabs, dialogs, animated counters, cap-table stage walkthrough) |
| `*` | `pages/NotFound.tsx` | 404 fallback |

### Landing page (`/`) section order
1. `Navigation` — fixed, transparent → white-blur on scroll, "ZTS" brand mark, hamburger on mobile
2. `Hero` — profile photo, title block, two CTAs (View Credit Memos, About Me), bouncing scroll arrow
3. `About` — bio narrative + 4-stat KPI row ($300K raised / 5 months to $100K MRR / 18 months distressed ops / 3.5 years Army)
4. `CreditMemos` — 3 memo cards opened in a modal `<iframe>` loading static HTML from `/public`
5. `Resume` — company-logo row, experience list, education sidebar, resume PDF download
6. `Contact` — email / phone / LinkedIn buttons + inline Calendly widget + copyright footer

### Nav items
About · Memos · My Business (route) · Experience · Contact

---

## 3. Content Inventory

### Credit memos (public HTML files loaded in modal iframe)
- `kirkland-memo.html` — *When Your White Knight Is Actually a Vulture* — Kirkland's Inc / Beyond Inc rescue financing. Tags: Distressed Debt, Retail, Creditor Control.
- `lycra-memo.html` — *The Second Restructuring* — LYCRA Company repeat restructuring. Tags: Restructuring, Chemicals, Repeat Distress.
- `partycity-memo.html` — *Party City: Post-Mortem Analysis* — liquidation anatomy. Tags: Retail, Liquidation, Post-Mortem.
- All dated Oct 2025.

### Resume / experience shown
Managing Director & Partner — Best Option Restoration (2024–2025) · Strategic Sales (Splunk, FullStory, Revenue Grid, Better.com, 2020–2024) · IB Winter Analyst — BlockCrowd Financial Group (2019–2020) · Goldman Sachs Summer Insight — S&T (2019) · PE Spring Analyst — Pivoton Capital (2019, Voxco LBO) · Citi IB Early ID (2019) · Morgan Stanley WM Winter Analyst (2018–2019) · Morgan Stanley IB Military Early Insight (2018) · US Army 4th Infantry Division Specialist (2013–2017).

**Education:** University of Mobile, B.S. Business Administration – Finance, GPA 3.71, Expected Dec 2026.

**Technical skills tags:** LBO Modeling, DCF, 13-week Cash Flow, Valuation (Comps / Precedents), Credit & Restructuring, Excel.

**Resume PDF:** `src/components/Zachary_Smith_Resume.pdf` (imported directly, served via Vite).

### Company logos
Army, BlockCrowd Financial Group (BFG), Best Option Restoration (BOR), Citi, Goldman Sachs, Morgan Stanley, Pivoton Capital — rendered in circular hover-scale cards.

### `/my-business` case study
Interactive deep-dive into Best Option Restoration's distress: multi-stage cap-table walkthrough (Steady State → stress stages), framer-motion animated counters, timeline / compare tabs, creditor detail dialogs, lessons-learned cards. Keyboard arrow navigation between stages. Includes AR aging, DSO, cash burn, assets breakdown.

### Contact
- Email: zac.t.smith@outlook.com (button label shows `zac.smith@financier.com`)
- Phone: (251) 482-9410
- LinkedIn: linkedin.com/in/zac-t-smith
- Calendly: calendly.com/zac-t-smith-f4ue/30min (inline)

---

## 4. Layout & Visual System

- **Container:** centered, `2rem` padding, max-width 1400px at 2xl.
- **Grid patterns:**
  - Memos: `md:grid-cols-1 lg:grid-cols-3` card grid.
  - Resume: `lg:grid-cols-3` (2-col experience list + 1-col sticky education/skills sidebar).
  - About stats: `grid-cols-2 md:grid-cols-4`.
- **Section rhythm:** `py-24`, alternating `bg-background` / `bg-muted/30` for banding; dark `bg-secondary` on Contact for footer contrast.
- **Section headers:** 4xl/5xl bold title with a thin `border-b-2 border-primary` underline and a tiny uppercase tracking-widest kicker above/below ("Featured Memos", "Background & Journey", etc.).
- **Cards:** rounded-lg, soft shadow, 2px borders that gain `border-primary/50` on hover, often with a left accent bar (`border-l-4 border-primary`).
- **Hero divider motif:** `border-b-4 border-primary inline-block` under the "The Fulcrum Memo" wordmark — the editorial-paper look of the site.
- **Scroll UX:** fixed nav that fades from transparent to `bg-background/95 backdrop-blur-sm` after 50px scroll.
- **Motion:** subtle fade-in / stagger delays on Contact buttons; framer-motion sequences on the case-study page.

---

## 5. Color Theme (defined in `src/index.css`, HSL)

### Light mode (default)
| Token | HSL | Role |
|---|---|---|
| `--background` | `0 0% 100%` | White page |
| `--foreground` | `0 0% 10%` | Near-black text |
| `--card` | `0 0% 99%` | Card surface |
| `--primary` | `358 88% 47%` | **Editorial Red — signature color** (CTA buttons, section underlines, accent bars, hover states) |
| `--primary-foreground` | `0 0% 100%` | White on red |
| `--secondary` | `220 40% 20%` | **Deep Navy** (Contact section background, outline buttons) |
| `--secondary-foreground` | `0 0% 98%` | Near-white on navy |
| `--accent` | `210 70% 55%` | Subtle blue (About callout left-border) |
| `--muted` | `0 0% 96%` | Light gray section bands |
| `--muted-foreground` | `0 0% 40%` | Secondary gray text |
| `--destructive` | `0 84% 60%` | Red for destructive UI |
| `--border` / `--input` | `0 0% 90%` | Hairline borders |
| `--ring` | `358 88% 47%` | Focus ring (matches primary) |
| `--radius` | `0.5rem` | Base rounding |
| `--editorial-cream` | `40 20% 97%` | Reserved editorial tone |
| `--highlight-yellow` | `48 100% 88%` | Reserved highlight |
| `--highlight-blue` | `210 100% 95%` | Reserved highlight |

### Dark mode
Navy-based: `--background 220 40% 8%`, `--card 220 40% 10%`, primary brightened to `358 88% 55%`, accent `210 70% 60%`. Toggleable via `class="dark"` on `<html>` (next-themes installed, no visible toggle in nav yet).

### Typography
- **Body:** `Georgia, 'Times New Roman', serif` — editorial / financial-journal feel.
- **Headings (h1–h6):** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif` — clean sans-serif contrast.
- **Kickers & nav:** uppercase with wide tracking (`tracking-widest` / `tracking-[0.2em]`).

Overall aesthetic: an editorial / Wall-Street-Journal-style palette — crimson red + deep navy on cream/white, serif body copy, thin red underline rules on section heads.

---

## 6. Project Structure

```
.
├── index.html                 # Vite entry; Calendly script tag; OG + Twitter meta
├── vite.config.ts             # base: "/FulcrumMemo/", @ alias → ./src
├── tailwind.config.ts         # shadcn token mapping, container settings
├── components.json            # shadcn config
├── public/
│   ├── kirkland-memo.html
│   ├── lycra-memo.html
│   ├── partycity-memo.html
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── main.tsx
│   ├── App.tsx                # QueryClient + Tooltip + Toasters + Router
│   ├── index.css              # Design tokens (HSL vars) + base typography
│   ├── pages/
│   │   ├── Index.tsx          # Composes landing sections
│   │   ├── RestructuringCaseStudy.tsx  # /my-business (~1000 LOC)
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── CreditMemos.tsx
│   │   ├── Resume.tsx
│   │   ├── Contact.tsx
│   │   ├── Zachary_Smith_Resume.pdf
│   │   └── ui/                # Full shadcn primitive set
│   ├── assets/                # Profile + company logos (Army, BFG, BOR, Citi, GS, MS, PC)
│   ├── hooks/
│   └── lib/
└── dist/                      # Built output (404.html copy for SPA fallback)
```

---

## 7. Deployment Notes

- Hosted on **GitHub Pages** under repo `FulcrumMemo` (basename `/FulcrumMemo/` must stay in sync between `vite.config.ts` `base` and `BrowserRouter basename`).
- `.nojekyll` present to disable Jekyll processing.
- Build copies `dist/index.html` → `dist/404.html` so deep links (e.g. `/my-business`) resolve on refresh.
- Favicon currently points to `/src/assets/profile.jpg` (works in dev; may want to move to `/public` for cleaner prod paths).

---

## 8. Known / Observed Quirks

- Contact button label text shows `zac.smith@financier.com` but `onClick` opens `mailto:zac.t.smith@outlook.com` — likely wants reconciling.
- `CreditMemos` has a "View All Memos" ghost button with an empty handler (placeholder for a future `/memos` index page).
- Dark-mode tokens exist but no theme toggle is exposed in the UI.
- `REVAMP_PLAN.md` is gitignored (local-only planning doc).
- OG / Twitter images reference `/src/assets/profile.jpg` — those paths don't resolve in the production build; social-share images will 404 until moved to `public/`.

---

*Generated 2026-10-21.*
