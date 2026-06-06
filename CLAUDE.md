# lucabro.dev — Personal Blog

Personal blog and professional hub for Luca Bro. Built with Astro. Deploys to Netlify on push to `main`. Canonical home for articles cross-posted to dev.to.

---

## Stack

- **Framework:** Astro (static output, no SSR)
- **Styling:** CSS custom properties, no Tailwind, no CSS-in-JS
- **Fonts:** IBM Plex Serif (body, headings), IBM Plex Mono (code, inline code, UI accents)
- **Hosting:** Netlify
- **Content:** Markdown (`.md`) files in `src/content/posts/`

## Commands

```bash
npm run dev       # local dev server
npm run build     # static build → dist/
npm run preview   # preview the build
```

---

## Design constraints

These are hard rules, not suggestions.

**Typography first.** The type system carries the design. Spacing and rhythm come from the type scale, not from decoration.

**Dark mode is the default.** Light mode is an override via `prefers-color-scheme`. No toggle in the UI.

**Monochrome palette with a single accent.** Black, white, and neutral grays. One accent color, used sparingly — links, hover states, active indicators. No gradients, no shadows except where functionally necessary. The accent is cyan-range (cold). All color values live in CSS custom properties in `:root` — `--color-accent` is the single source of truth, never hardcoded elsewhere. This makes theme changes a one-line edit.

**Links.** No underline by default. Underline appears on hover only. The accent color applies to the underline, not necessarily the text color — decide in context.

**Post list.** Each entry shows title, date, and a short excerpt (pulled from frontmatter `description`). No thumbnails, no tags displayed, no read-time estimates.

**Borders and separators.** Use as few as possible. Add one only when the visual hierarchy genuinely breaks without it. Default assumption is that spacing alone is enough.

**No layout frameworks.** No Bootstrap, no Flowbite, no component library. Plain CSS with custom properties defined in `:root`.

**Micro-animations only.** Allowed: underline grow on hover, fade-in on page load (opacity, no transform unless subtle), cursor custom style if added. Not allowed: anything that draws attention to itself, scroll-triggered animations, parallax, transitions over 300ms.

**Aesthetic references:** macwright.com, brandur.org. Brutalist in structure, considered in execution.

---

## Project structure

```
src/
  content/
    posts/        ← .md files, one per article
  layouts/
    Base.astro    ← html shell, fonts, meta
    Post.astro    ← article layout
  pages/
    index.astro   ← post list
    about.astro   ← about page
    [...slug].astro ← dynamic post route
  styles/
    global.css    ← custom properties, reset, base typography
public/
  fonts/          ← self-hosted IBM Plex (woff2)
```

---

## Content

Posts live in `src/content/posts/` as `.md` files with frontmatter:

```yaml
---
title: ""
date: YYYY-MM-DD
description: ""        # used in <meta> and post list
tags: []               # optional
devto_url: ""          # optional, cross-post link
---
```

The post list on the index shows: title, date, description. No thumbnails, no category badges, no view counts.

---

## What not to do

- No client-side JS unless strictly necessary (a navigation script or theme detection is fine; a React island is not)
- No external CSS frameworks
- No analytics scripts embedded in the HTML (add via Netlify if needed, not in the codebase)
- No `!important` in CSS
- No placeholder "coming soon" pages — if a page isn't ready, it doesn't exist yet
- Do not add features that aren't in this document without asking first

---

## Deploy

CI (GitHub Actions) builda, testa e deploya su Netlify via CLI. Netlify non builda da solo (`command = "exit 0"` in `netlify.toml`). Secrets richiesti nel repo: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`.

**Constraint:** the blog must be live and publicly accessible within one week of starting development. Scope accordingly — a working minimal version beats a half-finished polished one.

---

## Astro 6 — gotcha

- Content config va in `src/content.config.ts` (non `src/content/config.ts`)
- Loader richiesto: `loader: glob({ pattern: "**/*.md", base: "./src/content/posts" })`
- Entry ID al posto di slug: `post.id` non `post.slug`
- Render come funzione: `await render(post)` non `await post.render()`

---

## Testing

- `npm test` → `node scripts/run-tests.mjs` (wrapper che scrive il fixture prima del build)
- Playwright gestisce il server via `webServer` in `playwright.config.ts`
- Il fixture post va scritto PRIMA del build — non usare `globalSetup` (Playwright avvia `webServer` prima di `globalSetup`)
- Il deploy step in CI rebuilda senza fixture: `npm run build` dopo `npm test`
- Per simulare CI in locale: `CI=true npm test`
- Selettori `h1` ambigui su Firefox (DevTools inietta h1 propri) — usare `.post-header h1`, `.about h1`

---

## Font

- Self-hosted in `public/fonts/` — copiati da `@fontsource` via `postinstall`
- Script: `scripts/copy-fonts.js`