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

**Light mode is the default.** A theme toggle is present in the UI — the only concession to modern UI conventions. The selected theme is persisted in `localStorage`. To prevent flash of incorrect theme on load, a blocking inline `<script>` in `<head>` must read `localStorage` and apply the theme class *before* the CSS renders. This is not optional — without it, returning visitors see a flash of the wrong theme on every navigation.

**Monochrome palette with a single accent.** Black, white, and neutral grays. One accent color, used sparingly — links, hover states, active indicators. No gradients, no shadows except where functionally necessary. The accent is cyan-range (cold). All color values live in CSS custom properties in `:root` — `--color-accent` is the single source of truth, never hardcoded elsewhere. This makes theme changes a one-line edit.

**Links.** No underline by default. Underline appears on hover only. The accent color applies to the underline, not necessarily the text color — decide in context.

**Post list.** Each entry shows title, date, and a short excerpt (pulled from frontmatter `description`). No thumbnails, no tags displayed, no read-time estimates. The home page shows the latest posts (up to 10, no pagination for now).

**Borders and separators.** Use as few as possible. Add one only when the visual hierarchy genuinely breaks without it. Default assumption is that spacing alone is enough.

**No layout frameworks.** No Bootstrap, no Flowbite, no component library. Plain CSS with custom properties defined in `:root`.

**Micro-animations only.** Allowed: underline grow on hover, fade-in on page load (opacity, no transform unless subtle), cursor custom style if added. Not allowed: anything that draws attention to itself, scroll-triggered animations, parallax, transitions over 300ms.

**Aesthetic references:** macwright.com, brandur.org. Brutalist in structure, considered in execution.

---

## Navigation

Three items: **projects** → `/projects`, **now** → `/now`, plus the theme toggle. The site logo/name links back to home — no redundant "writing" link in the nav.

---

## Pages

- `/` — list of latest posts (up to 10), title + date + excerpt
- `/[slug]` — individual post
- `/projects` — static page, curated list of projects (Origami, Clutter, relevant others) with a short description each. Not a GitHub mirror — only what's worth pointing at.
- `/now` — what's happening now: current work, what's being learned, where Origami is. Updated occasionally, not a post.
- `/about` — who, brief

No placeholder pages — if a page isn't written yet, it doesn't exist yet.

---

## Project structure

```
src/
  content/
    posts/        ← .md files, one per article
  layouts/
    Base.astro    ← html shell, fonts, meta
    Post.astro    ← article layout
    EntryList.astro ← shared layout for simple entry-list pages (projects, now)
  pages/
    index.astro   ← post list
    about.astro   ← about page
    projects.astro
    now.astro
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

---

## What not to do

- No client-side JS unless strictly necessary (theme detection and the theme toggle are fine; a React island is not)
- No external CSS frameworks
- No analytics scripts embedded in the HTML (add via Netlify if needed, not in the codebase)
- No `!important` in CSS
- No placeholder "coming soon" pages — if a page isn't ready, it doesn't exist yet
- Do not add features that aren't in this document without asking first

---

## Deploy

CI (GitHub Actions) builds, tests, and deploys to Netlify via CLI. Netlify does not build independently (`command = "exit 0"` in `netlify.toml`). Required repo secrets: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`.

---

## Astro 6 — gotchas

- Content config goes in `src/content.config.ts` (not `src/content/config.ts`)
- Loader required: `loader: glob({ pattern: "**/*.md", base: "./src/content/posts" })`
- Entry ID instead of slug: `post.id` not `post.slug`
- Render as function: `await render(post)` not `await post.render()`

---

## Testing

- `npm test` → `node scripts/run-tests.mjs` (wrapper that writes the fixture before build)
- Playwright manages the server via `webServer` in `playwright.config.ts`
- The fixture post must be written BEFORE the build — do not use `globalSetup` (Playwright starts `webServer` before `globalSetup`)
- The deploy step in CI rebuilds without fixture: `npm run build` after `npm test`
- To simulate CI locally: `CI=true npm test`
- Ambiguous `h1` selectors on Firefox (DevTools injects its own h1) — use `.post-header h1`, `.about h1`

---

## Font

- Self-hosted in `public/fonts/` — copied from `@fontsource` via `postinstall`
- Script: `scripts/copy-fonts.js`