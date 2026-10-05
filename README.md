# Lodd

Static single-page app for Norwegian bazaar raffles. Everything lives in the browser (`localStorage`). No server.

## GitHub Pages

This repo deploys with GitHub Actions to **https://ugur93.github.io/lodd/**

1. Repo **Settings → Pages → Source: GitHub Actions**
2. Push to `main` (or run the **Deploy GitHub Pages** workflow)
3. Open the Pages URL after the workflow is green

The site is a relative-path SPA (`base: ./`), so it also works from a project subdirectory.

## Local

```sh
npm install
npm run build:pages
```

Output is `dist-pages/` (including `404.html` and `.nojekyll` for GitHub Pages).
