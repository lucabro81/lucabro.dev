# lucabro.dev — Instructions for AI Agents

Personal blog and professional hub for Luca Bro. Built with Astro. Deploys to Netlify on push to `main`. Canonical home for articles cross-posted to dev.to.

> This file (`AGENTS.md`) is the source of truth for any AI agent working on this project. Read it before touching code, content, or config.

---

## Agent ground rules

- **Read first, edit after.** Before any change, read the relevant files and this document.
- **No unrequested features.** If something isn't in this document, ask before implementing it.
- **Atomic, descriptive commits.** One commit = one logical change. Message style follows the repo convention (check `git log`). Never commit generated files (`dist/`, `node_modules/`, `test-results/`, `playwright-report/`).
- **Don't break the build.** After any change to code or config, verify `npm run build` passes. If you touch tests, run `npm test`.
- **Language.** Site content is in English. Commit messages and replies to the user follow the user's language.
- **CSS style:** no `!important`, no external frameworks, all variables in `:root` in `variables.css`.
- **Astro 6:** see the "Gotchas" section below — these are real traps, not theoretical details.

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
npm test          # Playwright tests (wrapper: scripts/run-tests.mjs)
CI=true npm test  # simulate CI locally
```

---

## Design constraints

These are hard rules, not suggestions.

**Typography first.** The type system carries the design. Spacing and rhythm come from the type scale, not from decoration.

**Light mode is the default.** A theme toggle is present in the UI — the only concession to modern UI conventions. The selected theme is persisted in `localStorage`. To prevent flash of incorrect theme on load, a blocking inline `<script>` in `<head>` must read `localStorage` and apply the theme class *before* the CSS renders. This is not optional — without it, returning visitors see a flash of the wrong theme on every navigation.

**Monochrome palette with a single accent.** Black, white, and neutral grays. One accent color, used sparingly — links, hover states, active indicators. No gradients, no shadows except where functionally necessary. The accent is cyan-range (cold). All color values live in CSS custom properties in `:root` — `--color-accent` is the single source of truth, never hardcoded elsewhere. This makes theme changes a one-line edit.

**Links.** No underline by default. Underline appears on hover only. The accent color applies to the underline, not necessarily the text color — decide in context.

**Post list.** Each entry shows title, date, and a short excerpt (pulled from frontmatter `description`). No thumbnails, no tags displayed, no read-time estimates. The home page shows the latest posts (up to 10, no pagination for now).

**Dates.** On the home list and the post page, dates are unix timestamps (seconds at UTC midnight, `toUnixTimestamp()` in `src/utils/date.ts`), in a fixed `10ch` mono column on the home list, linking to `/epoch`. Deliberate: don't "fix" them into readable dates. `/projects` and `/now` keep human dates (`formatDate()`).

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
- `/contact` — Netlify Forms contact form, linked from `/about`
- `/thanks` — post-submit confirmation page for the contact form (Netlify `action` redirect)
- `/epoch` — hidden (`noindex`, not in nav) sarcastic page reached by clicking a unix date; `?t=<timestamp>` enables a button that reveals the readable UTC date

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
    contact.astro ← Netlify Forms contact form
    thanks.astro  ← post-submit confirmation page
    epoch.astro   ← hidden page behind the unix dates
    [...slug].astro ← dynamic post route
  styles/
    global.css     ← imports variables, common, typography
    variables.css  ← custom properties (:root, html.dark)
    common.css     ← reset, body/img, focus-visible, border/radius utility classes
    typography.css ← @font-face, headings, links, code/pre/blockquote
  utils/
    date.ts       ← formatDate() for EntryList, toUnixTimestamp() for home and posts
    posts.ts      ← getPublishedPosts(): drafts filtered out of the build, sorted by date
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
tldr: ""               # optional, rendered as a TL;DR block under the post header
tags: []               # optional
devto_url: ""          # optional, cross-post link
draft: true            # optional, visible in `npm run dev` only, excluded from the build
---
```

Always read posts through `getPublishedPosts()` (`src/utils/posts.ts`), never `getCollection("posts")` directly: it filters drafts and sorts by date.

---

## What not to do

- No client-side JS unless strictly necessary (theme detection, the theme toggle and the `/epoch` reveal button are fine; a React island is not)
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
