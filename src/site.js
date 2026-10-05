'use strict';

/**
 * Build a static site from a folder of Markdown decks:
 *
 *   slides/talk.md          → dist/talk/index.html   (+ dist/talk/talk.pdf with --pdf)
 *   slides/2026/x/index.md  → dist/2026/x/index.html
 *   dist/index.html         → gallery of all decks
 *
 * Optional `slides/site.yml`: { title, description, url }.
 * Decks with `draft: true` in their front matter are skipped.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { buildDeck } = require('./render');
const { parseFrontMatter } = require('./parse');
const { printPdf } = require('./chrome');
const { ROOT, logoSvg, svgDataUri, fontFaces } = require('./assets');
const { escapeHtml } = require('./markdown');

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist']);
const IGNORED_FILES = new Set(['readme.md', 'license.md', 'changelog.md']);

/** All deck files under `dir`, as { file, slug } sorted by slug. */
function findDecks(dir) {
  const out = [];
  (function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) walk(full);
      } else if (/\.(md|markdown)$/i.test(entry.name) && !IGNORED_FILES.has(entry.name.toLowerCase())) {
        out.push({ file: full, slug: slugFor(path.relative(dir, full)) });
      }
    }
  })(dir);
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}

/** "Talks/My Talk.md" → "talks/my-talk";  "x/index.md" → "x" */
function slugFor(relPath) {
  const noExt = relPath.replace(/\.(md|markdown)$/i, '').split(path.sep).join('/');
  return noExt
    .replace(/(^|\/)index$/i, '')
    .split('/')
    .map((part) => part.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .join('/') || 'index';
}

function readSiteConfig(dir) {
  const file = ['site.yml', 'site.yaml'].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
  return file ? yaml.load(fs.readFileSync(file, 'utf8')) || {} : {};
}

function readMeta(file) {
  return parseFrontMatter(fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n')).meta;
}

function dateValue(d) {
  if (d instanceof Date) return d.getTime();
  const t = Date.parse(d);
  return Number.isNaN(t) ? -Infinity : t;
}
function formatDate(d) {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return d == null ? '' : String(d);
}

/**
 * @param {object} opts
 * @param {string} opts.slidesDir
 * @param {string} opts.outDir
 * @param {boolean} [opts.pdf]       also print each deck to PDF (needs Chrome)
 * @param {boolean} [opts.liveReload]
 * @param {(msg: string) => void} [opts.log]
 * @param {(file: string, msg: string) => void} [opts.warn]
 */
async function buildSite({ slidesDir, outDir, pdf = false, log = () => {}, warn = () => {} }) {
  slidesDir = path.resolve(slidesDir);
  outDir = path.resolve(outDir);
  if (slidesDir === outDir || slidesDir.startsWith(outDir + path.sep) || outDir === ROOT) {
    throw new Error(`Refusing to use ${outDir} as output directory: it contains the sources.`);
  }
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const entries = [];
  for (const { file, slug } of findDecks(slidesDir)) {
    const meta = readMeta(file);
    if (meta.draft === true) {
      log(`- skipped draft ${path.relative(slidesDir, file)}`);
      continue;
    }
    const result = buildDeck(file);
    for (const w of new Set(result.warnings)) warn(file, w);
    const dir = path.join(outDir, slug);
    fs.mkdirSync(dir, { recursive: true });
    const htmlFile = path.join(dir, 'index.html');
    fs.writeFileSync(htmlFile, result.html);

    let pdfName = null;
    if (pdf) {
      pdfName = `${path.basename(slug)}.pdf`;
      await printPdf(htmlFile, path.join(dir, pdfName));
    }
    entries.push({ slug, meta: result.meta, slides: result.slideCount, pdf: pdfName, source: path.relative(slidesDir, file) });
    log(`✔ ${slug}/ (${result.slideCount} slides${pdfName ? ', pdf' : ''})`);
  }

  fs.writeFileSync(path.join(outDir, 'index.html'), renderIndex(entries, readSiteConfig(slidesDir)));
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
  return entries;
}

/** Metadata for every deck, drafts included, without rendering them (used by the dev server). */
function listDecks(slidesDir) {
  return findDecks(slidesDir)
    .map(({ file, slug }) => ({ file, slug, meta: readMeta(file), source: path.relative(slidesDir, file) }));
}

function renderIndex(entries, config = {}, { reloadScript = '' } = {}) {
  const title = config.title || 'Presentations';
  const sorted = [...entries].sort((a, b) =>
    dateValue(b.meta.date) - dateValue(a.meta.date) || String(a.meta.title || a.slug).localeCompare(String(b.meta.title || b.slug)));
  const authorOf = (m) => (Array.isArray(m.author) ? m.author.join(', ') : m.author || '');

  const cards = sorted.map((e) => {
    const m = e.meta;
    const href = `${e.slug.split('/').map(encodeURIComponent).join('/')}/`;
    const byline = [authorOf(m), formatDate(m.date)].filter(Boolean).map(escapeHtml).join(' · ');
    return `
    <article class="card">
      <a class="cover" href="${href}">
        <img class="cover-logo" src="${logoWhite()}" alt="">
        ${m.event ? `<span class="event">${escapeHtml(m.event)}</span>` : ''}
        <h2 class="cover-title">${escapeHtml(m.title || e.slug)}</h2>
        ${m.draft === true ? '<span class="badge">Draft</span>' : ''}
      </a>
      <div class="card-body">
        ${m.subtitle ? `<p class="subtitle">${escapeHtml(m.subtitle)}</p>` : ''}
        ${byline ? `<p class="byline">${byline}</p>` : ''}
        <p class="actions">
          <a class="btn primary" href="${href}">Present</a>
          ${e.pdf ? `<a class="btn" href="${href}${encodeURIComponent(e.pdf)}" download>PDF</a>` : ''}
          ${e.slides ? `<span class="count">${e.slides} slides</span>` : ''}
        </p>
      </div>
    </article>`;
  }).join('\n');

  const css = fontFaces(['inria-sans/latin-300.css', 'inria-sans/latin-400.css', 'inria-sans/latin-700.css']) +
    fs.readFileSync(path.join(ROOT, 'theme', 'site.css'), 'utf8');

  return `<!DOCTYPE html>
<html lang="${config.lang || 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="icon" href="${svgDataUri(logoSvg('#E63312'))}">
<style>${css}</style>
</head>
<body>
<header class="site-header">
  <div class="wrap">
    <img class="logo" src="${logoWhite()}" alt="Inria">
    <h1>${escapeHtml(title)}</h1>
    ${config.description ? `<p class="lead">${escapeHtml(config.description)}</p>` : ''}
  </div>
</header>
<main class="wrap">
  ${entries.length ? `<div class="grid">${cards}</div>` : '<p class="empty">No presentations yet: add a Markdown file to <code>slides/</code>.</p>'}
</main>
<footer class="wrap site-footer">Built with inria-slides · ${new Date().toISOString().slice(0, 10)}</footer>
${reloadScript}
</body>
</html>
`;
}

let logoWhiteCache = null;
function logoWhite() {
  if (!logoWhiteCache) logoWhiteCache = svgDataUri(logoSvg('#FFFFFF'));
  return logoWhiteCache;
}

module.exports = { buildSite, findDecks, listDecks, slugFor, renderIndex, readSiteConfig };
