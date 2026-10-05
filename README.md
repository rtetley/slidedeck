# inria-slides

Write presentations in Markdown and publish them on GitHub Pages in the Inria visual identity.

To publish a talk, drop a `.md` file into [`slides/`](slides/) and push, or upload it from the GitHub website. GitHub Actions then runs the tests, builds every deck as HTML and PDF, and updates the site. You get:

```
https://<user>.github.io/<repo>/              gallery of all talks
https://<user>.github.io/<repo>/my-talk/      the deck (S = presenter view)
https://<user>.github.io/<repo>/my-talk/my-talk.pdf
```

Each deck is a single HTML file with fonts, images and math embedded, so it also works offline.

---

## Publishing a presentation

### From the GitHub website (no install needed)

1. Open the `slides/` folder in the repository.
2. Click **Add file → Upload files**. Drop in your `.md` file and any images it uses. Keep image paths relative to the Markdown file, for example `![](img/plot.png)` with the image in `slides/img/`.
3. Click **Commit changes** on `main`.
4. After about a minute the **Actions** tab shows a green check, and the talk is online.

To update a talk, edit or re-upload the file. To remove it, delete the file. To publish the file without showing it on the site yet, add `draft: true` to its front matter.

### From your computer

```sh
npm run new -- slides/my-talk.md   # start from a template
npm run dev                         # preview at http://localhost:8000 (reloads when you save)
git add slides && git commit -m "Add my talk" && git push
```

The URL comes from the file path. `slides/my-talk.md` becomes `/my-talk/`, `slides/2026/Séminaire.md` becomes `/2026/seminaire/`, and `slides/x/index.md` becomes `/x/`.

## Writing slides

```md
---
title: My talk
author: Jane Doe
affiliation: Inria — Team NAME
date: 2026-10-05
event: Team seminar
---

# A section

---

## A slide

- Points with **red emphasis**, $\LaTeX$ math, code, tables…

Note:
Speaker notes (press S while presenting).
```

The full syntax covers layouts, columns, boxes, images, incremental reveals and keyboard shortcuts. It is documented in **[docs/syntax.md](docs/syntax.md)**, and [`slides/guide.md`](slides/guide.md) is a working example.

---

## Commands

Requires Node.js 22 or later (see `.nvmrc`). Run `npm install` once.

| Command | What it does |
|---|---|
| `npm run dev` | live preview of every deck in `slides/`, drafts included. It reloads on Markdown or theme changes and restarts itself when the framework code in `src/` changes |
| `npm run new -- slides/x.md` | create a new deck from the template |
| `npm test` | run the test suite (`node:test`, no extra dependencies) |
| `npm run build` | build the site into `dist/` |
| `npm run build:pdf` | same as `build`, plus a PDF per deck (needs Chrome, Chromium, Edge or Brave; set `CHROME_PATH` if none is found) |
| `npm run check` | tests, then a build that fails on warnings such as a missing image |
| `npm run deploy` | re-run the deployment manually (needs the [`gh`](https://cli.github.com) CLI) |

You can also call the CLI on a single file:

```sh
node bin/inria-slides.js build talk.md [-o out.html] [--watch]
node bin/inria-slides.js pdf   talk.md [-o out.pdf]
node bin/inria-slides.js serve talk.md
```

## Deployment

The workflow is [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

| Event | Test | Build HTML + PDF | Publish to Pages |
|---|:-:|:-:|:-:|
| push to `main` | ✔ | ✔ | ✔ |
| pull request | ✔ | ✔ | — |
| manual (`npm run deploy` or the *Run workflow* button) | ✔ | ✔ | ✔ |

If a test or build fails, nothing is published and the live site keeps its previous version. A missing image does not fail the build. It shows up as a warning annotation on the run instead.

### One-time setup

1. Create the GitHub repository and push:
   ```sh
   gh repo create <name> --public --source=. --push
   ```
2. In the repository, open **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Push any commit, or run `npm run deploy`, to trigger the first deployment.

Pages sites are **public**, even for private repositories (Pages on private repositories needs a paid GitHub plan). Don't commit unpublished results you want to keep confidential. Marking a deck `draft: true` keeps it off the site, but the Markdown is still visible in a public repository.

## Project layout

```
slides/            ← your presentations (*.md + images); site.yml sets the gallery title
docs/syntax.md     Markdown syntax reference
bin/inria-slides.js  CLI (site | serve | build | pdf | new)
src/
  parse.js         front matter, slide splitting, directives, layout detection (pure)
  markdown.js      marked + KaTeX, ::: boxes, image options, highlighting
  render.js        deck → self-contained HTML
  site.js          slides/ → dist/ (one folder per deck + gallery page)
  server.js        live-reload dev server
  chrome.js        headless-Chrome PDF export
  assets.js        logo and embedded fonts
theme/
  inria.css        slide theme (colours, layouts, print rules)
  runtime.js       in-browser navigation, presenter view, auto-fit
  site.css         gallery page
assets/inria-logo.svg
test/              unit + integration tests, with fixtures
```

## Design notes

The theme follows the public elements of the Inria identity. The official charter isn't publicly accessible, so these come from public sources:

- **Colours:** Inria red `#E63312` (the colour of the official logo file). Small red text on white uses `#C9191E` for contrast. The secondary dark red is `#85322E` and Inria black is `#1D1D1B`.
- **Type:** *Inria Sans* for text, *Inria Serif* for quotes and theorems (both by Black[Foundry] for Inria), and Fira Code for code.
- **Logo:** the official Inria wordmark, recoloured white on red or dark backgrounds.

All design tokens are at the top of `theme/inria.css`.

## Licences

The fonts are under the SIL Open Font License and are installed from npm (`@fontsource/*`). The Inria logo is a trademark of Inria, so use it according to Inria's rules for its visual identity. No licence has been chosen for the code in this repository yet.
