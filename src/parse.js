'use strict';

/**
 * Pure Markdown-source parsing: front matter, slide splitting, directives,
 * titles and automatic layout detection. No I/O, no HTML.
 */

const yaml = require('js-yaml');

/** Split `src` into chunks on lines matching `re`, ignoring lines inside ``` / ~~~ fences. */
function splitOutsideFences(src, re) {
  const chunks = [[]];
  let fence = null;
  for (const line of src.split('\n')) {
    const f = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (f) {
      if (!fence) fence = f[1];
      else if (line.trim().startsWith(fence[0].repeat(fence.length)) && line.trim().replace(/[`~]/g, '') === '') fence = null;
    }
    if (!fence && !f && re.test(line)) chunks.push([]);
    else chunks[chunks.length - 1].push(line);
  }
  return chunks.map((c) => c.join('\n'));
}

/** Like splitOutsideFences, but also ignores lines inside `:::` containers. */
function splitTopLevel(src, re) {
  const chunks = [[]];
  let fence = null;
  const containers = [];
  for (const line of src.split('\n')) {
    const f = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    const c = /^ {0,3}(:{3,})[ \t]*(\S*)/.exec(line);
    let split = false;
    if (fence) {
      if (f && f[1][0] === fence[0] && f[1].length >= fence.length && f[2].trim() === '') fence = null;
    } else if (f) {
      fence = f[1];
    } else if (c && c[2]) {
      containers.push(c[1].length);
    } else if (c && containers.length && containers[containers.length - 1] === c[1].length) {
      containers.pop();
    } else if (!containers.length && re.test(line)) {
      split = true;
    }
    if (split) chunks.push([]);
    else chunks[chunks.length - 1].push(line);
  }
  return chunks.map((ch) => ch.join('\n'));
}

function parseFrontMatter(src) {
  const m = /^﻿?---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(src);
  if (!m) return { meta: {}, body: src };
  return { meta: yaml.load(m[1]) || {}, body: src.slice(m[0].length) };
}

/**
 * Directives:
 *   <!-- .slide: layout=section bg=red class="a b" cols=60/40 incremental -->
 *   <!-- layout: section -->   <!-- bg: red -->   (one key per comment)
 *   <!-- notes: free text ... -->                 (speaker notes)
 */
const DIRECTIVE_KEYS = ['layout', 'bg', 'class', 'cols', 'footer', 'incremental', 'kicker',
  'align', 'progress', 'fit', 'number', 'valign'];

function parseAttrString(s) {
  const out = {};
  const re = /([\w-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s]+))?/g;
  let m;
  while ((m = re.exec(s))) {
    let v = m[2] === undefined ? true : m[2].replace(/^["']|["']$/g, '');
    if (v === 'false') v = false;
    out[m[1]] = v;
  }
  return out;
}

/** Split into alternating [text, code, text, code, …] segments so directives inside fences are left alone. */
function fenceSegments(src) {
  const segs = [[]];
  let fence = null;
  for (const line of src.split('\n')) {
    const f = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (!fence && f) {
      fence = f[1];
      segs.push([line]);
    } else if (fence && f && f[1][0] === fence[0] && f[1].length >= fence.length && f[2].trim() === '') {
      fence = null;
      segs[segs.length - 1].push(line);
      segs.push([]);
    } else {
      segs[segs.length - 1].push(line);
    }
  }
  return segs.map((lines) => lines.join('\n'));
}

function stripDirectives(src, attrs, notes) {
  src = src.replace(/^[ \t]*<!--\s*\.slide:?([\s\S]*?)-->[ \t]*\n?/gm, (_, body) => {
    Object.assign(attrs, parseAttrString(body));
    return '';
  });
  src = src.replace(/^[ \t]*<!--\s*notes?:([\s\S]*?)-->[ \t]*\n?/gim, (_, body) => {
    notes.push(body.trim());
    return '';
  });
  src = src.replace(/^[ \t]*<!--\s*([\w-]+)\s*:\s*([^\n]*?)\s*-->[ \t]*\n?/gm, (all, key, value) => {
    if (!DIRECTIVE_KEYS.includes(key)) return all;
    if (key === 'layout') {
      // "<!-- layout: toc progress -->" → layout=toc, progress=true
      const [name, ...flags] = value.split(/\s+/);
      attrs.layout = name;
      for (const f of flags) attrs[f] = true;
    } else {
      attrs[key] = value === 'false' ? false : value === 'true' ? true : value.replace(/^["']|["']$/g, '');
    }
    return '';
  });
  // bare boolean directives: <!-- incremental -->, <!-- center -->, <!-- nofooter -->
  return src.replace(/^[ \t]*<!--\s*(incremental|center|nofooter)\s*-->[ \t]*\n?/gm, (_, key) => {
    if (key === 'center') attrs.align = 'center';
    else if (key === 'nofooter') attrs.footer = false;
    else attrs[key] = true;
    return '';
  });
}

function extractDirectives(src) {
  const attrs = {};
  const notes = [];
  src = fenceSegments(src)
    .map((seg, i) => (i % 2 === 0 ? stripDirectives(seg, attrs, notes) : seg))
    .join('\n');

  // "Note:" / "Notes:" on its own line: everything after it is speaker notes.
  const parts = splitOutsideFences(src, /^\s*Notes?:\s*$/i);
  if (parts.length > 1) {
    src = parts[0];
    notes.push(parts.slice(1).join('\n').trim());
  }
  return { src, attrs, notes: notes.join('\n\n') };
}

/** Pull the leading `#`/`##` heading out of the slide body. */
function extractTitle(src) {
  const lines = src.split('\n');
  let i = 0;
  // skip blank lines and background-image lines that may precede the title
  while (i < lines.length && (lines[i].trim() === '' || /^\s*!\[bg\b[^\]]*\]\([^)]*\)\s*$/.test(lines[i]))) i++;
  const m = /^(#{1,2})\s+(.+?)\s*#*\s*$/.exec(lines[i] || '');
  if (!m) return { title: null, level: 0, body: src };
  return { title: m[2], level: m[1].length, body: [...lines.slice(0, i), ...lines.slice(i + 1)].join('\n') };
}

/** Section-like slide: a lone `# Title`, optionally with a short paragraph. */
function isSectionLike(slide) {
  const rest = slide.rest.trim();
  if (slide.level !== 1) return false;
  if (rest === '') return true;
  return !/^\s*([-*+]|\d+\.)\s|```|\|\|\||^\s*!\[|^:::/m.test(rest) && rest.length < 220;
}

/** A slide made only of `> quote` lines, optionally followed by `— Author`. */
function isQuoteLike(slide) {
  const src = slide.src.trim();
  return !slide.title && /^>/.test(src) &&
    src.split('\n').every((l) => /^>|^\s*$|^\s*(—|--|-|~)\s*\S/.test(l));
}

/**
 * Parse a whole deck.
 * @returns {{ meta: object, slides: object[], sections: {title: string, slide: number}[] }}
 */
function parseDeck(raw) {
  const { meta, body } = parseFrontMatter(raw.replace(/\r\n?/g, '\n'));

  const slides = splitOutsideFences(body, /^---\s*$/)
    .map((s) => s.replace(/^\n+|\s+$/g, ''))
    .filter((s) => s.trim() !== '')
    .map((s) => {
      const { src, attrs, notes } = extractDirectives(s);
      const { title, level, body: rest } = extractTitle(src);
      return { src, attrs, notes, title, level, rest };
    });

  for (const s of slides) {
    if (s.attrs.layout) continue;
    if (isSectionLike(s)) s.attrs.layout = 'section';
    else if (isQuoteLike(s)) s.attrs.layout = 'quote';
    else s.attrs.layout = 'default';
  }

  const sections = [];
  slides.forEach((s, i) => {
    if (s.attrs.layout === 'section' && s.attrs.number !== false) {
      s.sectionIndex = sections.length;
      sections.push({ title: s.title || '', slide: i });
    }
  });

  return { meta, slides, sections };
}

module.exports = {
  parseDeck,
  parseFrontMatter,
  splitOutsideFences,
  splitTopLevel,
  fenceSegments,
  extractDirectives,
  extractTitle,
  parseAttrString,
};
