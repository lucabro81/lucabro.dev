[![Netlify Status](https://api.netlify.com/api/v1/badges/ff84b4d8-7b91-4b54-adf9-3600b8d3aac3/deploy-status)](https://app.netlify.com/projects/lucabro-dev/deploys)

# lucabro.dev

Personal blog. Built with [Astro](https://astro.build), deployed on Netlify.

## Commands

```bash
npm run dev       # dev server → http://localhost:4321
npm run build     # production build → dist/
npm run preview   # preview the build locally
npm test          # build + run Playwright tests (all browsers)
```

## Deploy

Push to `main` → GitHub Actions runs tests → deploys to Netlify if green.

Required GitHub secrets: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`.

## Content

Add a post by creating a `.md` file in `src/content/posts/`:

```yaml
---
title: ""
date: YYYY-MM-DD
description: ""
---

content
```
