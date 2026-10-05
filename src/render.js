'use strict';

/** Render a parsed deck to a single self-contained HTML page. */

const fs = require('fs');
const path = require('path');
const { parseDeck, splitOutsideFences, splitTopLevel } = require('./parse');
const { createContext, createMarked, resolveAsset, escapeHtml } = require('./markdown');
const { ROOT, logoSvg, svgDataUri, fontFaces, katexCss } = require('./assets');

const LABELS = {
  en: { toc: 'Outline', thanks: 'Thank you', questions: 'Questions?' },
  fr: { toc: 'Sommaire', thanks: 'Merci', questions: 'Des questions ?' },
};

function renderBody(md, ctx, src) {
  // <!-- pause --> splits content into successive fragments
  const chunks = splitOutsideFences(src, /^\s*<!--\s*pause\s*-->\s*$/);
  return chunks.map((c, i) => {
    const html = md.parse(c);
    return i === 0 ? html : `<div class="fragment fragment-block">${html}</div>`;
  }).join('\n');
}

function renderColumns(md, ctx, src) {
  const cols = splitTopLevel(src, /^\s*\|\|\|\s*$/);
  if (cols.length === 1) return renderBody(md, ctx, src);
  return `<div class="cols slide-cols">${cols.map((c) => `<div class="col">${renderBody(md, ctx, c)}</div>`).join('')}</div>`;
}

function colsTemplate(spec) {
  if (!spec || spec === true) return null;
  const parts = String(spec).split(/[/,:\s]+/).filter(Boolean);
  if (parts.length < 2) return null;
  return parts.map((p) => `${parseFloat(p)}fr`).join(' ');
}

function backgroundHtml(bgs) {
  const out = { html: '', classes: [], style: [] };
  for (const b of bgs) {
    const contain = b.contain ? ' contain' : '';
    if (b.side === 'full') {
      out.html += `<div class="bg-image full${contain}" style="background-image:url('${b.src}')"></div>`;
      out.classes.push('has-bg-full');
    } else {
      out.html += `<div class="bg-image ${b.side}${contain}" style="width:${b.split};background-image:url('${b.src}')"></div>`;
      out.classes.push(`has-bg-${b.side}`);
      if (b.side === 'right') out.style.push(`--content-right:calc(${b.split} + var(--pad-x))`);
      else out.style.push(`--bg-split:${b.split}`);
    }
  }
  return out;
}

function bgClass(bg) {
  if (!bg) return { cls: [], style: [] };
  if (bg === 'red') return { cls: ['red'], style: [] };
  if (bg === 'dark' || bg === 'black') return { cls: ['dark'], style: [] };
  if (bg === 'white' || bg === 'light') return { cls: [], style: [] };
  return { cls: [], style: [`background:${bg}`] };
}

function buildDeck(inputPath, options = {}) {
  const raw = fs.readFileSync(inputPath, 'utf8');
  const baseDir = path.dirname(path.resolve(inputPath));
  const { meta, slides, sections } = parseDeck(raw);
  const lang = meta.lang === 'fr' ? 'fr' : 'en';
  const L = { ...LABELS[lang], ...(meta.labels || {}) };
  const warnings = [];
  const watchFiles = new Set([path.resolve(inputPath)]);
  const embed = options.embed !== false;

  const assetCtx = { baseDir, embed, warnings, watchFiles };
  const logoRed = svgDataUri(logoSvg('#E63312'));
  const logoWhite = svgDataUri(logoSvg('#FFFFFF'));

  const titleSlide = meta.titleSlide !== false && meta.title;
  const total = slides.length + (titleSlide ? 1 : 0);

  // ---- render slides -------------------------------------------------------
  let usedMath = false;
  let usedMermaid = false;
  const footerText = meta.footer === false ? null
    : meta.footer || [meta.shortTitle || meta.title,
      meta.shortAuthor || (Array.isArray(meta.author) ? meta.author.join(', ') : meta.author), meta.event]
      .filter(Boolean).map(String).join('  ·  ');

  const html = [];

  if (titleSlide) {
    const ctx = createContext({ baseDir, embed, lang, warnings, watchFiles });
    const md = createMarked(ctx);
    const inl = (v) => (v == null ? '' : md.parseInline(String(v)));
    const authors = Array.isArray(meta.author) ? meta.author.join(', ') : meta.author;
    const partnerLogos = (meta.logos || []).map((l) => `<img src="${resolveAsset(assetCtx, l)}" alt="">`).join('');
    html.push(`
<section class="slide layout-title" data-index="0">
  <img class="title-logo" src="${logoWhite}" alt="Inria">
  <img class="watermark" src="${logoWhite}" alt="">
  <div class="title-block">
    ${meta.event ? `<div class="event">${inl(meta.event)}</div>` : ''}
    <h1>${inl(meta.title)}</h1>
    ${meta.subtitle ? `<p class="subtitle">${inl(meta.subtitle)}</p>` : ''}
  </div>
  <div class="meta">
    ${authors ? `<div class="author">${inl(authors)}</div>` : ''}
    ${meta.affiliation ? `<div class="affiliation">${inl(meta.affiliation)}</div>` : ''}
    ${meta.date ? `<div class="date">${inl(meta.date instanceof Date ? meta.date.toISOString().slice(0, 10) : meta.date)}</div>` : ''}
  </div>
  ${partnerLogos ? `<div class="partners">${partnerLogos}</div>` : ''}
  ${meta.notes ? `<aside class="notes">${md.parse(String(meta.notes))}</aside>` : ''}
</section>`);
    usedMath = usedMath || ctx.usedMath;
  }

  slides.forEach((s, i) => {
    const index = i + (titleSlide ? 1 : 0);
    const ctx = createContext({ baseDir, embed, lang, warnings, watchFiles });
    const md = createMarked(ctx);
    const a = s.attrs;
    const layout = a.layout;
    const bg = bgClass(a.bg || (layout === 'statement' ? 'red' : null));
    const classes = ['slide', `layout-${layout}`, ...bg.cls];
    const style = [...bg.style];
    if (a.class) classes.push(...String(a.class).split(/\s+/));
    if (a.align === 'center' || a.valign === 'center') classes.push('center-body');
    if (a.footer === false || meta.footer === false) classes.push('no-footer');

    const onColour = classes.includes('red') || classes.includes('dark');
    const footer = `<footer class="slide-footer"><img class="logo" src="${onColour ? logoWhite : logoRed}" alt="Inria">` +
        `<span class="footer-text">${footerText ? md.parseInline(footerText) : ''}</span>` +
        `<span class="page">${index + 1}${meta.pageTotal === false ? '' : ` / ${total}`}</span></footer>`;
    let inner = '';

    if (layout === 'section') {
      const num = s.sectionIndex != null ? String(s.sectionIndex + 1).padStart(2, '0') : '';
      inner = `
  <div class="section-panel"><img class="logo" src="${logoWhite}" alt="Inria"><div class="section-num">${num}</div></div>
  <div class="section-content">${s.title ? `<h1>${md.parseInline(s.title)}</h1>` : ''}${renderBody(md, ctx, s.rest)}</div>`;
    } else if (layout === 'statement') {
      inner = `<div class="statement">${renderBody(md, ctx, s.src)}</div>${footer}`;
    } else if (layout === 'quote') {
      const lines = s.src.trim().split('\n');
      const attrLine = lines.filter((l) => !/^>/.test(l) && l.trim()).join(' ').replace(/^\s*(—|--|-|~)\s*/, '');
      const quoteMd = lines.filter((l) => /^>/.test(l)).map((l) => l.replace(/^>\s?/, '')).join('\n');
      inner = `<div class="quote-wrap"><div class="quote-mark">“</div><blockquote>${md.parse(quoteMd)}</blockquote>` +
        `${attrLine ? `<div class="attribution">${md.parseInline(attrLine)}</div>` : ''}</div>${footer}`;
    } else if (layout === 'end') {
      const content = s.src.trim() ? renderBody(md, ctx, s.src) : `<h1>${L.thanks}</h1><p>${L.questions}</p>`;
      inner = `<div class="end-wrap"><img class="end-logo" src="${logoWhite}" alt="Inria">${content}</div>` +
        `<div class="footer-url">${escapeHtml(meta.url || 'inria.fr')}</div>`;
      if (!a.bg) classes.push('red');
    } else if (layout === 'title') {
      const content = renderBody(md, ctx, s.rest);
      inner = `<img class="title-logo" src="${logoWhite}" alt="Inria"><img class="watermark" src="${logoWhite}" alt="">
  <div class="title-block"><h1>${md.parseInline(s.title || '')}</h1><div class="subtitle">${content}</div></div>`;
    } else if (layout === 'toc') {
      const nextSection = sections.findIndex((sec) => sec.slide > i);
      const items = sections.map((sec, k) => {
        let cls = '';
        if (a.progress) cls = k < nextSection || nextSection === -1 ? 'done' : k === nextSection ? 'current' : '';
        return `<li class="${cls}"><span class="num">${String(k + 1).padStart(2, '0')}</span><span>${md.parseInline(sec.title)}</span></li>`;
      }).join('');
      if (sections.length > 6) style.push('--toc-cols:2');
      inner = `<div class="slide-inner"><header class="slide-header"><h2>${md.parseInline(s.title || L.toc)}</h2></header>` +
        `<div class="slide-body">${renderBody(md, ctx, s.rest)}<ol class="toc-list">${items}</ol></div></div>${footer}`;
    } else {
      // default content slide
      const tpl = colsTemplate(a.cols);
      if (tpl) style.push(`--cols:${tpl}`);
      const kicker = a.kicker ? `<span class="kicker">${md.parseInline(String(a.kicker))}</span>` : '';
      const header = s.title ? `<header class="slide-header">${kicker}<h2>${md.parseInline(s.title)}</h2></header>` : '';
      inner = `<div class="slide-inner">${header}<div class="slide-body">${renderColumns(md, ctx, s.rest)}</div></div>${footer}`;
    }

    const bgs = backgroundHtml(ctx.backgrounds);
    classes.push(...bgs.classes);
    style.push(...bgs.style);
    usedMath = usedMath || ctx.usedMath;
    usedMermaid = usedMermaid || ctx.usedMermaid;

    const notes = s.notes ? `<aside class="notes">${md.parse(s.notes)}</aside>` : '';
    const data = [`data-index="${index}"`];
    if (a.incremental) data.push('data-incremental');
    if (a.fit === false) data.push('data-nofit');
    html.push(`
<section class="${classes.join(' ')}" ${data.join(' ')}${style.length ? ` style="${style.join(';')}"` : ''}>
  ${bgs.html}${inner}
  ${notes}
</section>`);
  });

  // ---- assemble page -----------------------------------------------------
  const css = [
    fontFaces(),
    usedMath ? katexCss() : '',
    fs.readFileSync(path.join(ROOT, 'theme', 'inria.css'), 'utf8'),
    meta.css ? readUserCss(meta.css, baseDir, watchFiles) : '',
    meta.style || '',
  ].join('\n');
  const runtime = fs.readFileSync(path.join(ROOT, 'theme', 'runtime.js'), 'utf8');

  const page = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(meta.title || path.basename(inputPath, '.md'))}</title>
<link rel="icon" href="${logoRed}">
<style>
${css}
</style>
</head>
<body>
<div id="viewport"><div id="deck">
${html.join('\n')}
</div></div>
<div id="progress"></div>
<div id="overview"></div>
<div id="help"><div class="panel"><h3>Keyboard shortcuts</h3><table>
<tr><td>→ ↓ Space PgDn</td><td>Next</td></tr>
<tr><td>← ↑ ⇧Space PgUp</td><td>Previous</td></tr>
<tr><td>Home / End</td><td>First / last slide</td></tr>
<tr><td>12 ⏎</td><td>Go to slide 12</td></tr>
<tr><td>F</td><td>Fullscreen</td></tr>
<tr><td>O / Esc</td><td>Overview</td></tr>
<tr><td>S</td><td>Presenter view (notes, next slide, timer)</td></tr>
<tr><td>B / .</td><td>Black screen</td></tr>
<tr><td>P</td><td>Print / export PDF</td></tr>
<tr><td>?</td><td>This help</td></tr>
</table></div></div>
<div id="presenter"></div>
${usedMermaid ? '<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>' : ''}
<script>
window.DECK_META = ${JSON.stringify({ title: meta.title || '', liveReload: !!options.liveReload })};
${runtime}
</script>
</body>
</html>
`;
  return { html: page, meta, warnings, watchFiles, slideCount: total };
}

function readUserCss(rel, baseDir, watchFiles) {
  const file = path.resolve(baseDir, rel);
  watchFiles.add(file);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

module.exports = { buildDeck };
