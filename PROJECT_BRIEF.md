# Project Brief — Брокер за 1 ден (Home2U)

Career-campaign landing page: prospective brokers spend a "Demo Day" with the
Home2U team. Built from Figma "Home2U | Web Design" — desktop frame `3253:8629`
(1440px), mobile frame `3253:8885` (360px).

## Stack

- Astro 6 (static) + Vercel adapter — one serverless route `/api/lead`
- Scoped component styles, CSS custom properties, no CSS framework
- GSAP 3.12 + ScrollTrigger via CDN (`is:inline`) — soft fade-up reveals,
  disabled for `prefers-reduced-motion` (append `?noanim` to the URL for a
  no-animation QA render)
- Fluid `em` scaling system (see DESIGN-SYSTEM.md): `--size-container-ideal`
  1440 desktop / 834 tablet / 550 mobile-landscape / **360 mobile-portrait**

## Design tokens (`src/styles/global.css`)

| Token | Value |
|---|---|
| Primary / accent | `#a90831` (dark `#880425`) |
| Headlines | `#1c1c1c` |
| Body | `#4f4f4f` |
| Inactive / placeholder | `#909090` |
| Card bg | `#f3f3f4`, border `#c4d3df` |
| Glass cards | `linear-gradient(-15deg, rgba(231,241,248,.7), rgba(248,234,237,.7))` + blur 4px + 1px white border |
| CTA gradient | `linear-gradient(270deg, #880425, #a90931)`, pill radius 33px |
| Fonts | Sharp Grotesk Cyr — Book 400 / Medium 500, self-hosted woff2/woff |

## Page structure (`src/pages/index.astro`)

1. `Hero` — navbar (burger ≤991px), H1 "Стани брокер за 1 ден", layered photo
   bg, decorative team-photo cluster (`#top`)
2. `WhatYouGet` — 6 frosted info cards (`#prezhivyavane`)
3. `WhoIsItFor` — bullet list + graph-card visual (`#za-kogo`)
4. `WhyHome2U` — office photo + 4 stats (`#za-nas`)
5. `MoreAboutUs` — 3 benefits with vertical dividers
6. `FinalCta` — glass message card + lead form (`#zapazi`)
7. `Footer` — links, contacts, red legal bar

Other pages: `/thank-you`, `/privacy`, `/zzlpspoin` (legal texts shared with
the Webinar project).

## Lead form

POSTs JSON to `/api/lead` → forwards to SkyGuru CRM
(`https://skyguru.ai/api/v1/public/leads`, form name **"Брокер за 1 ден"**;
override with `CRM_ENDPOINT` / `CRM_FORM_NAME` env vars). Client attaches UTM /
fbclid attribution captured in `localStorage` (`h2u_attribution`). Success →
redirect `/thank-you`.

## Before launch

- Set the real production domain in `astro.config.mjs` (`site`) and
  `public/robots.txt` (sitemap URL)
- Add GTM / Meta Pixel snippet in `BaseLayout.astro` if this campaign gets its
  own container (the Webinar project's pattern is already prepared for it)
- Confirm the phone number `+359 887 88333222` and email `info@home2u.com`
  (taken verbatim from the Figma frame)
