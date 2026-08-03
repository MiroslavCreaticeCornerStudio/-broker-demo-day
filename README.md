# Claude Starter — Figma to Live Website + SEO & AEO

Turn a Figma design into a real, production-ready website using Claude Code — then rank higher in Google and get cited in ChatGPT, Perplexity, and AI Overviews. Claude does the work. You make the decisions.

---

## Who this is for

Anyone with a Figma design who wants a real website with strong search visibility. You don't need to know how to code. You do need to be comfortable copying a few terminal commands once during setup.

---

## Prerequisites (one-time setup)

1. **Node.js** (v20 or newer) — [nodejs.org](https://nodejs.org)
2. **Claude Code** — [claude.ai/code](https://claude.ai/code)
3. **Figma MCP** — after installing Claude Code, run `/mcp` and add the Figma MCP server. Authorize it with your Figma account.
4. **A Figma file** — your design, shared with at least "view" access.
5. **Google Search Console** — free at [search.google.com/search-console](https://search.google.com/search-console)
6. **Google Analytics 4** — free at [analytics.google.com](https://analytics.google.com)

---

## Part 1 — Build the site from Figma

### Quickstart (3 steps)

1. **Open this folder in Claude Code.** Clone or download the repo and point Claude Code at the folder.

2. **Run the build command** with your Figma URL:
   ```
   /build https://www.figma.com/file/YOUR_FILE_ID/...
   ```

3. **Pick your framework when asked.** Claude detects if no framework is set up and asks which one you want. Then it builds everything: scaffold, components, QA, responsive, SEO audit.

When done, Claude starts a dev server so you can preview the site in your browser.

---

### Which framework should I pick?

| Building... | Use | Why |
|---|---|---|
| Marketing site, landing page, blog, portfolio | **Astro** | Static-first, fast loads, great SEO, minimal JS |
| Web app, dashboard, SaaS, login/accounts | **Next.js** | Full React + Server Components, API routes, edge runtime |
| Something else | Vite/React, SvelteKit, Vue/Nuxt | Tell Claude which and it'll scaffold it |

---

### The build commands

| Command | What it does |
|---|---|
| `/build <figma-url>` | Full pipeline: brief → analyze → build → QA → responsive → SEO → preview |
| `/brief <figma-url>` | Reads first Figma page, extracts tokens, saves `PROJECT_BRIEF.md` |
| `/qa [section-name]` | Re-runs QA pass on the current build. Use after manual edits. |

---

### How the pipeline works

`/build` runs these phases in order:

1. **Setup** — detects framework (or asks), scaffolds it, integrates `global.css`
2. **Phase 0 — Brief** — extracts colors, typography, spacing, frame width → `PROJECT_BRIEF.md`
3. **Phase 1 — Analyze** — maps every section and component, downloads all images → `SITE_MAP.md`
4. **Phase 2 — Build** — builds every component from live Figma data with responsive media queries
5. **Phase 3 — QA** — compares each section against Figma screenshot, auto-fixes discrepancies
6. **Phase 4 — Responsive** — adapts for tablet (≤991px) and mobile (≤767px, ≤479px)
7. **Phase 5 — SEO & accessibility** — meta tags, heading hierarchy, alt text, color contrast
8. **Preview** — starts dev server

---

### Deploying your site

**Vercel** (recommended):
```
npm i -g vercel
vercel
```
Follow the prompts. Use `vercel --prod` for production.

**Alternatives** (all free for typical marketing sites):
- Netlify — `npm i -g netlify-cli && netlify deploy`
- Cloudflare Pages — connect your Git repo via the dashboard

---

### Troubleshooting

**"Figma MCP not connected" / `get_metadata` fails.**
Run `/mcp` in Claude Code. Confirm Figma MCP shows as connected. Re-add and reauthorize if not.

**Image downloads come back tiny or wrong file type.**
Figma sometimes returns SVG placeholders for raster images. Claude flags these in `IMAGE_MANIFEST.md`. Re-export the layer in Figma and re-run `/build`.

**Build doesn't compile after Claude finishes.**
Run `/qa` to auto-correct. If errors persist, paste the error back to Claude.

**Wrong framework chosen.**
Delete the scaffolded files (or start in a fresh folder) and re-run `/build`.

**A section looks wrong.**
Run `/qa <section-name>` to re-QA just that section against Figma.

---

## Part 2 — SEO & AEO

Once the site is built (or if you already have a live site), run the SEO and AEO process:

```
/seo-aeo
```

Claude asks for your URL, then guides you through every phase — doing the audits, writing the content, generating schema, building your keyword strategy, and tracking progress. Come back anytime and run `/seo-aeo` again. It picks up exactly where you left off.

---

### New site or rebuild?

Claude will ask this first. It matters:

**New site** — Claude starts with a competitive audit and technical setup before any content goes live.

**Rebuilding an existing site** — Claude runs a pre-migration snapshot first: crawls the live site, captures current rankings from Search Console, documents the full URL structure, and builds a 301 redirect map. This protects your existing rankings during the rebuild. Skipping this is the most common reason sites lose traffic after a relaunch.

---

### What happens at each phase

| Phase | What Claude does |
|-------|-----------------|
| 00 — Foundation Audit | Audits the site, snapshots rankings, tests AI engine visibility |
| 01 — Technical SEO | Fixes crawl issues, on-page elements, schema, Core Web Vitals |
| 02 — Keyword Strategy | Keyword research, topic clustering, 12-month content calendar |
| 03 — AEO Content | Answer-first rewrites, FAQ sections, content structured for AI citation |
| 04 — Link Building | Quick wins, unlinked mentions, outreach templates, linkable asset planning |
| 05 — Content Production | Pillar pages, cluster articles, glossary, FAQ hubs |
| 06 — Brand & Entity | Entity footprint, Wikidata, press page, AI citation building |
| 07 — Schema & AI Access | HowTo/ItemList schema, llms.txt, AI crawler access |
| 08 — Link Building at Scale | Monthly outreach system, guest posts, partnerships |
| 09 — UX & Conversion | CTR optimization, page experience, content performance |
| 10 — Measurement | Full-year review, AEO progress, Year 2 planning |

---

### Other SEO commands

| Command | What it does |
|---------|-------------|
| `/index-pages <url>` | Submit a URL to Google's Indexing API for fast indexing |
| `/seo-check` | Quick SEO check on any page |
| `/generate-schema` | Generate schema markup for any content type |
| `/keyword-cluster` | Cluster a list of keywords into topic groups |
| `/create-content` | Write an SEO + AEO optimized article |
| `/create-topic` | Research and build a complete topic cluster |

Or just ask Claude in plain English — most tasks trigger automatically.

---

## What's in this folder

```
.claude/
├── agents/        # Specialized AI workers (Figma analyzer, builder, QA, SEO auditor, ...)
├── commands/      # Slash commands (/brief, /build, /qa, /seo-aeo, /index-pages, ...)
├── rules/         # Pipeline playbook — phase-by-phase build and SEO rules
├── skills/        # SEO toolkit — skills that auto-trigger from natural language
└── settings.json  # Permissions & MCP config
CLAUDE.md          # Claude Code config reference
DESIGN-SYSTEM.md   # Fluid scaling system & design conventions
README.md          # This file
global.css         # Design tokens + reset (moved into your framework during setup)
best-practice/     # Reference docs about Claude Code
```
