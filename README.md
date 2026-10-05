# Lodd

Static single-page raffle app for Norwegian bazaars. Everything lives in the browser (`localStorage`). No server.

Live (after Pages is enabled): **https://ugur93.github.io/lodd/**

## Enable GitHub Pages (one time)

Open [Settings → Pages](https://github.com/ugur93/lodd/settings/pages) and pick **one**:

1. **GitHub Actions** (preferred) — Source: GitHub Actions, then re-run the **Deploy GitHub Pages** workflow.
2. **Branch** — Source: Deploy from a branch, Branch: `main`, Folder: `/docs`.

After that the site is at https://ugur93.github.io/lodd/

## Local

```sh
npm install
npm run build
```

Output is `dist-pages/`.
