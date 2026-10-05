'use strict';

const fs = require('fs');
const path = require('path');
const { Marked } = require('marked');
const hljs = require('highlight.js');
const katex = require('katex');

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.bmp': 'image/bmp',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
};

const BOX_TITLES = {
  en: { theorem: 'Theorem', lemma: 'Lemma', proposition: 'Proposition', corollary: 'Corollary',
        definition: 'Definition', proof: 'Proof', example: 'Example', alert: 'Warning' },
  fr: { theorem: 'Théorème', lemma: 'Lemme', proposition: 'Proposition', corollary: 'Corollaire',
        definition: 'Définition', proof: 'Preuve', example: 'Exemple', alert: 'Attention' },
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Per-render context. The renderer writes slide-level side effects here
 * (background images, whether math was used, warnings).
 */
function createContext(opts) {
  return {
    baseDir: opts.baseDir,
    embed: opts.embed !== false,
    lang: opts.lang || 'en',
    usedMath: false,
    backgrounds: [],
    warnings: opts.warnings || [],
    watchFiles: opts.watchFiles || new Set(),
  };
}

/** Resolve a local asset; returns a data: URI when embedding, else the original href. */
function resolveAsset(ctx, href) {
  if (!href || /^(https?:|data:|#|mailto:)/i.test(href)) return href;
  const decoded = decodeURI(href);
  const file = path.resolve(ctx.baseDir, decoded);
  if (!fs.existsSync(file)) {
    ctx.warnings.push(`Missing file: ${href}`);
    return href;
  }
  ctx.watchFiles.add(file);
  if (!ctx.embed) return href;
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime) return href;
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

/**
 * Parse Marp-like image keywords in the alt text:
 *   ![bg](a.jpg)  ![bg right:40%](a.jpg)  ![bg left contain](a.jpg)
 *   ![w:400](a.png)  ![h:300 A caption-less alt](a.png)
 */
function parseImageAlt(alt) {
  const out = { bg: false, side: 'full', split: '50%', contain: false, width: null, height: null, alt: [] };
  for (const word of alt.split(/\s+/).filter(Boolean)) {
    let m;
    if (word === 'bg') out.bg = true;
    else if ((m = /^(left|right)(?::(\d+%))?$/.exec(word))) { out.side = m[1]; if (m[2]) out.split = m[2]; }
    else if (word === 'contain' || word === 'fit') out.contain = true;
    else if ((m = /^(?:w|width):(\d+(?:px|%|em)?)$/.exec(word))) out.width = /\d$/.test(m[1]) ? m[1] + 'px' : m[1];
    else if ((m = /^(?:h|height):(\d+(?:px|%|em)?)$/.exec(word))) out.height = /\d$/.test(m[1]) ? m[1] + 'px' : m[1];
    else out.alt.push(word);
  }
  out.alt = out.alt.join(' ');
  return out;
}

function highlight(code, lang) {
  if (lang && hljs.getLanguage(lang)) {
    return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
  }
  return escapeHtml(code);
}

/** `::: cols 1/2 stretch chain` → a grid of columns that can sit among other content. */
function renderCols(t) {
  const words = t.title.split(/\s+/).filter(Boolean);
  const ratio = words.find((w) => /^\d+(\.\d+)?(\/\d+(\.\d+)?)+$/.test(w));
  const flags = words.filter((w) => w !== ratio && /^[\w-]+$/.test(w)); // stretch, center, chain, or custom classes
  const style = ratio ? ` style="--cols:${ratio.split('/').map((n) => `${parseFloat(n)}fr`).join(' ')}"` :
    ` style="--cols:repeat(${t.columns.length}, 1fr)"`;
  const cols = t.columns.map((tokens) => `<div class="col">${this.parser.parse(tokens)}</div>`).join('');
  return `<div class="${['cols', ...flags].join(' ')}"${style}>${cols}</div>\n`;
}

function createMarked(ctx) {
  const marked = new Marked({ gfm: true, breaks: false });

  const renderMath = (tex, displayMode) => {
    ctx.usedMath = true;
    return katex.renderToString(tex, { displayMode, throwOnError: false, output: 'html' });
  };

  marked.use({
    extensions: [
      // $$ ... $$ display math (may span lines)
      {
        name: 'blockMath',
        level: 'block',
        start(src) { const i = src.indexOf('$$'); return i < 0 ? undefined : i; },
        tokenizer(src) {
          const m = /^ {0,3}\$\$([\s\S]+?)\$\$[ \t]*(?:\n+|$)/.exec(src);
          if (m) return { type: 'blockMath', raw: m[0], text: m[1].trim() };
        },
        renderer(t) { return renderMath(t.text, true) + '\n'; },
      },
      // $ ... $ inline math (no space just inside the dollars, as in pandoc)
      {
        name: 'inlineMath',
        level: 'inline',
        start(src) { const i = src.indexOf('$'); return i < 0 ? undefined : i; },
        tokenizer(src) {
          let m = /^\$\$((?:\\.|[^$])+?)\$\$/.exec(src);
          if (m) return { type: 'inlineMath', raw: m[0], text: m[1].trim(), display: true };
          m = /^\$(?!\s)((?:\\.|[^\\\n$])+?)(?<!\s)\$(?!\d)/.exec(src);
          if (m) return { type: 'inlineMath', raw: m[0], text: m[1], display: false };
        },
        renderer(t) { return renderMath(t.text, t.display); },
      },
      // ::: kind [Title]   ...   :::     (fenced containers; use more colons to nest)
      {
        name: 'container',
        level: 'block',
        start(src) { const m = /^ {0,3}:{3,}/m.exec(src); return m ? m.index : undefined; },
        tokenizer(src) {
          const m = /^ {0,3}(:{3,})[ \t]*([\w-]+)?[ \t]*([^\n]*)\n([\s\S]*?)\n {0,3}\1[ \t]*(?:\n+|$)/.exec(src);
          if (!m) return;
          const token = {
            type: 'container', raw: m[0], kind: (m[2] || 'block').toLowerCase(),
            title: m[3].trim(), tokens: [],
          };
          if (token.kind === 'cols' || token.kind === 'columns') {
            // :::: cols [ratio] [stretch] [center] [chain]   …  |||  …   ::::
            token.columns = m[4].split(/^[ \t]*\|\|\|[ \t]*$/m).map((part) => this.lexer.blockTokens(part, []));
            return token;
          }
          this.lexer.blockTokens(m[4], token.tokens);
          return token;
        },
        renderer(t) {
          if (t.columns) return renderCols.call(this, t);
          const body = this.parser.parse(t.tokens);
          const kind = t.kind;
          if (['center', 'small', 'muted', 'big', 'red', 'fragment'].includes(kind)) {
            return `<div class="${kind}">${body}</div>\n`;
          }
          const titles = BOX_TITLES[ctx.lang] || BOX_TITLES.en;
          let title = t.title || titles[kind] || '';
          // "::: theorem (Fermat)" → "Theorem (Fermat)"
          if (t.title && /^\(.*\)$/.test(t.title) && titles[kind]) title = `${titles[kind]} ${t.title}`;
          const titleHtml = title ? `<div class="box-title">${marked.parseInline(title)}</div>` : '';
          return `<div class="box ${kind}">${titleHtml}<div class="box-body">${body}</div></div>\n`;
        },
      },
    ],
    renderer: {
      code({ text, lang }) {
        const language = (lang || '').trim().split(/\s+/)[0];
        if (language === 'mermaid') {
          ctx.usedMermaid = true;
          return `<div class="mermaid">${escapeHtml(text)}</div>\n`;
        }
        const label = language ? ` data-lang="${escapeHtml(language)}"` : '';
        const cls = language ? ` class="hljs language-${escapeHtml(language)}"` : ' class="hljs"';
        return `<pre${label}><code${cls}>${highlight(text, language)}</code></pre>\n`;
      },
      image({ href, title, text }) {
        const opts = parseImageAlt(text || '');
        const src = resolveAsset(ctx, href);
        if (opts.bg) {
          ctx.backgrounds.push({ src, side: opts.side, split: opts.split, contain: opts.contain });
          return '';
        }
        const style = [];
        if (opts.width) style.push(`width:${opts.width}`);
        if (opts.height) style.push(`height:${opts.height}`);
        if (opts.width || opts.height) style.push('max-width:none', 'max-height:none');
        const styleAttr = style.length ? ` style="${style.join(';')}"` : '';
        if (/\.(mp4|webm)$/i.test(href)) {
          return `<video src="${src}"${styleAttr} controls preload="metadata"></video>`;
        }
        const img = `<img src="${src}" alt="${escapeHtml(opts.alt)}"${styleAttr}>`;
        if (title) {
          return `<figure>${img}<figcaption>${marked.parseInline(title)}</figcaption></figure>`;
        }
        return img;
      },
      listitem(item) {
        let body = this.parser.parse(item.tokens, !!item.loose);
        if (item.task) {
          body = body.replace(/^<input[^>]*>\s*/, '');
          return `<li class="task"><input type="checkbox" disabled${item.checked ? ' checked' : ''}> ${body}</li>\n`;
        }
        return `<li>${body}</li>\n`;
      },
    },
  });

  // ==highlight== → <mark>
  marked.use({
    extensions: [{
      name: 'mark',
      level: 'inline',
      start(src) { const i = src.indexOf('=='); return i < 0 ? undefined : i; },
      tokenizer(src) {
        const m = /^==(?=\S)([\s\S]*?\S)==/.exec(src);
        if (m) return { type: 'mark', raw: m[0], tokens: this.lexer.inlineTokens(m[1]) };
      },
      renderer(t) { return `<mark>${this.parser.parseInline(t.tokens)}</mark>`; },
    }],
  });

  return marked;
}

module.exports = { createContext, createMarked, resolveAsset, escapeHtml };
