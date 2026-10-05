'use strict';

/** Logo and font helpers. Fonts are inlined as data URIs so decks work offline. */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const pkgDir = (name) => path.dirname(require.resolve(`${name}/package.json`));

function logoSvg(color) {
  const svg = fs.readFileSync(path.join(ROOT, 'assets', 'inria-logo.svg'), 'utf8');
  return svg.replace(/#e53516/gi, color).replace(/<title>[^<]*<\/title>/, '');
}
function svgDataUri(svg) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

function inlineFontCss(cssFile) {
  const dir = path.dirname(cssFile);
  return fs.readFileSync(cssFile, 'utf8').replace(
    /src:\s*url\(([^)]+?\.woff2)\)\s*format\(["']woff2["']\)[^;}]*/g,
    (_, rel) => {
      const data = fs.readFileSync(path.join(dir, rel.replace(/^["']|["']$/g, ''))).toString('base64');
      return `src:url(data:font/woff2;base64,${data}) format("woff2")`;
    },
  );
}

const DECK_FONTS = [
  ...['300', '300-italic', '400', '400-italic', '700', '700-italic'].map((w) => `inria-sans/${w}.css`),
  ...['400', '400-italic', '700'].map((w) => `inria-serif/${w}.css`),
  'fira-code/latin-400.css', 'fira-code/latin-600.css',
];

const fontCache = new Map();
/** @font-face rules for the given fontsource CSS files (`family/file.css`), with fonts inlined. */
function fontFaces(files = DECK_FONTS) {
  const key = files.join('|');
  if (!fontCache.has(key)) {
    fontCache.set(key, files.map((f) => {
      const [family, file] = f.split('/');
      return inlineFontCss(path.join(pkgDir(`@fontsource/${family}`), file));
    }).join('\n'));
  }
  return fontCache.get(key);
}

let katexCache = null;
function katexCss() {
  if (!katexCache) katexCache = inlineFontCss(path.join(pkgDir('katex'), 'dist', 'katex.min.css'));
  return katexCache;
}

module.exports = { ROOT, logoSvg, svgDataUri, fontFaces, katexCss, inlineFontCss };
