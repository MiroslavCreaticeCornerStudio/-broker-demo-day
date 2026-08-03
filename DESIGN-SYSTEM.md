# Figma-to-Code Orchestration Flow

A framework-agnostic pipeline that turns Figma designs into production websites. Works with any modern frontend stack — Next.js, Astro, Vite/React, SvelteKit, Vue, etc. Pick your framework, then run the pipeline.

## Commands

The pipeline is invoked via three slash commands defined in `.claude/commands/`:

```
/brief [figma-url]   # Phase 0 — auto-generate the project brief from the first Figma page
/build [figma-url]   # Full pipeline: brief → analysis → desktop → QA → responsive → SEO
/qa  [section]       # Re-run desktop QA on the current build (optionally one section)
```

Your framework's own commands (e.g., `npm run dev`, `npm run build`, `pnpm dev`) are unchanged — the pipeline calls them as needed.

## Architecture

- TypeScript strict mode
- CSS custom properties for design tokens (no CSS framework by default — bring your own if desired)
- Use your framework's idiomatic styling (scoped styles, CSS Modules, Tailwind, etc.) — pick one and stay consistent
- Desktop-first responsive (media queries use `max-width`)
- **GSAP 3.12 + ScrollTrigger** loaded via CDN in your root layout file for animations (optional — skip if not using GSAP)

## Project Structure (example)

The pipeline doesn't enforce a directory structure — it adapts to your framework. Common conventions:

```
# Astro / Vite
src/
├── layouts/       # Root layout (head, meta, fonts, global styles)
├── components/    # PascalCase components
├── pages/         # File-based routing
├── styles/        # global.css (design tokens + reset)
└── assets/        # Images processed by the bundler
public/assets/     # Static images served as-is

# Next.js (App Router)
app/
├── layout.tsx     # Root layout
├── page.tsx       # Home page
└── components/    # PascalCase components
public/assets/     # Static images

# SvelteKit
src/
├── routes/        # File-based routing + +layout.svelte
├── lib/components/
└── app.css        # Global styles
static/assets/     # Static images
```

The `global.css` shipped at the root of this starter is meant to be **moved to your framework's standard location** when you scaffold a real project.

## Orchestration Workflow

This starter uses a phased agent pipeline to convert Figma designs into production sites. The phases are defined in `.claude/rules/` and triggered via the custom commands above:

1. `/brief [figma-url]` — Parse the first Figma page to auto-generate the project brief
2. `/build [figma-url]` — Full pipeline: brief → Figma analysis → desktop build → QA → responsive → SEO
3. `/qa` — Re-run desktop QA and auto-correction on current build

## Prerequisites

- **Figma MCP must be installed and connected** — the pipeline depends on it
- Only **desktop designs** are provided in Figma — responsive is derived

## Layout Model (CRITICAL)

Every section follows this pattern:
- **Outer wrapper**: full viewport width. Background colors/images stretch edge to edge.
- **Inner content**: constrained to `var(--size-container)` (fluid, derived from the scaling system) and centered with `margin-inline: auto`.
- **Decorative elements** (grid lines, vertical rules, etc.): also constrained to `var(--size-container)` and centered — they do NOT span the full viewport.
- The `--size-container-ideal` is set to the Figma frame width during Phase 0 (e.g., 1440 for a 1440px design).

## Image Handling

- **Download images from Figma** using the asset URLs returned by `get_design_context`
- Store downloaded images in your framework's static folder (`public/assets/images/` for Next.js/Astro/Vite, `static/assets/images/` for SvelteKit) with descriptive filenames
- Connect images to components with correct `src`, `alt`, `width`, `height`
- If an image cannot be downloaded (expired URL, network error, etc.), immediately notify the user with the reason and which component is affected
- Track all images in `IMAGE_MANIFEST.md` with: filename, dimensions, description, download status

## Scaling System (CRITICAL) — Fluid Viewport Scaling

This starter uses a fluid scaling system for viewport-based sizing. The `<body>` font-size is set to `var(--size-font)`, which scales proportionally with the viewport. All sizing uses **`em`** so everything scales automatically.

### How it works
- `--size-container-ideal` = the Figma design width (no px). Set during Phase 0.
- `--size-font` = `container / (ideal / unit)` — fluid body font-size
- `--size-container` = `clamp(min, 100vw, max)` — fluid container width
- `--size-container-max` = **1440px** on desktop — caps the maximum container width so font-size doesn't grow excessively on large screens
- Each breakpoint redefines `--size-container-ideal`, `--size-container-min`, `--size-container-max`

### Units
- **Use `em` for most sizing** — font-size, padding, margin, gap, width, height, border-radius
- Because body `font-size` is fluid, `em` values scale proportionally across all viewports
- **letter-spacing: use `px` for normal text** — keep the exact px value from Figma (e.g., `-1.92px`). Never convert letter-spacing to em because em is relative to the element's own font-size, causing compounding on headings (a 3em heading with `-0.12em` letter-spacing gets 3× the intended tightening, making text unreadable)
- **letter-spacing exception for giant decorative text (font-size > 10em)**: Use `em` so it scales proportionally. Convert: `px-value / font-size-px` (e.g., `-22px / 367px = -0.06em`). Fixed px on giant text breaks at smaller viewports.
- **line-height: always use unitless ratios** — divide Figma line-height by font-size (e.g., Figma says 56px line-height on 48px font → `56/48 = 1.167`). Unitless line-height is correctly relative to the element's font-size. Never use em for line-height.
- **Only exceptions for px**: `1px` borders, box-shadows, and `letter-spacing`
- Base: `1em = 16px` at the design's ideal viewport. Convert Figma px values to em (e.g., 48px → 3em, 24px → 1.5em, 12px → 0.75em)
- Design tokens in `global.css` must also use em (spacing, radius, container-padding)

### Container
- `.container` uses `max-width: var(--size-container)` — NOT a fixed px value
- The fluid scaling system replaces a fixed `--container-max`

### Container Padding (Responsive)
- Desktop: `--container-padding` from Figma (e.g., 3.25em for 52px)
- Tablet (≤991px): reduce to `1.5em`
- Mobile (≤767px): reduce to `1em`
- Phase 0 must add these media query overrides to `global.css`

### Phase 0 setup
During Phase 0, set `--size-container-ideal` to the Figma frame width (e.g., 1440 for a 1440px design) and `--size-container-max` to `1440px`. The scaling system handles the rest.

## Responsive (CRITICAL)
- **Build responsive from the start** — every component must include media queries for tablet and mobile during Phase 2, not deferred to Phase 4
- The fluid scaling system handles most sizing automatically across viewports — explicit font-size overrides in media queries are rarely needed
- Breakpoints: tablet ≤991px, mobile landscape ≤767px, mobile portrait ≤479px
- Key responsive patterns:
  - Multi-column grids → fewer columns → single column
  - Large headings scale down (e.g., 3rem desktop → 2rem mobile)
  - Horizontal layouts stack vertically
  - Padding/gaps reduce on smaller screens
  - Navigation collapses to hamburger menu at tablet (≤991px)
  - No horizontal overflow at any breakpoint
  - Min 44px (2.75rem) touch targets on mobile

## Conventions
- Components: `PascalCase` (file extension per framework: `.tsx`, `.astro`, `.vue`, `.svelte`)
- CSS vars: `--color-primary`, `--font-heading`, `--spacing-lg`
- CSS classes: `kebab-case`
- All colors via CSS custom properties — no hardcoded hex values in components
- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Every `<img>` gets `alt`, `width`, `height`
- One `<h1>` per page, logical heading hierarchy

## GSAP Animations (optional)
- GSAP and ScrollTrigger are loaded via CDN `<script>` tags in your root layout file
- Site-wide scroll-triggered animations (fade-ups, card staggers, image reveals, stat count-ups) can be defined in an inline script in the root layout
- Animation style: soft, slow, professional — `power2.out` ease, 0.8–1.2s durations, `once: true` triggers
- Respects `prefers-reduced-motion: reduce` — all animations are skipped if enabled

### Loading CDN globals (framework-specific gotchas)
- **Astro**: All `<script>` tags that reference CDN globals (like `gsap`) MUST use `is:inline`. Without it, Astro bundles scripts as ES modules and CDN globals are not accessible in module scope.
- **Next.js**: Use `<Script>` from `next/script` with `strategy="beforeInteractive"` for CDN libraries that other code depends on, or load them in `app/layout.tsx`.
- **SvelteKit**: Add CDN scripts in `app.html` or load via `onMount` for client-only execution.
- **Vue/Nuxt**: Add CDN scripts in `nuxt.config.ts` (`app.head.script`) or in the root layout.

In all cases: the CDN script must load and execute before any code that calls `gsap` runs.

## Watch Out For
- Build must pass (e.g., `npm run build`) before any phase is considered complete
- The `PROJECT_BRIEF.md` is auto-generated from the first Figma page — it must exist before building
- Desktop QA must fully pass before starting responsive migration
- Every section: full-width bg, max-width centered content — never let content stretch to viewport edges
