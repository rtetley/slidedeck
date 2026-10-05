'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseDeck, parseFrontMatter, splitOutsideFences, extractDirectives, extractTitle,
} = require('../src/parse');

test('front matter is parsed as YAML', () => {
  const { meta, body } = parseFrontMatter('---\ntitle: Hello\nauthor: [A, B]\n---\n\n## Slide');
  assert.equal(meta.title, 'Hello');
  assert.deepEqual(meta.author, ['A', 'B']);
  assert.equal(body.trim(), '## Slide');
});

test('missing front matter yields empty meta', () => {
  assert.deepEqual(parseFrontMatter('## Slide').meta, {});
});

test('slides split on --- but not inside code fences', () => {
  const parts = splitOutsideFences('a\n---\nb\n```\n---\n```\n---\nc', /^---\s*$/);
  assert.equal(parts.length, 3);
  assert.match(parts[1], /```\n---\n```/);
});

test('CRLF line endings are normalised', () => {
  const { slides } = parseDeck('---\r\ntitle: X\r\n---\r\n\r\n## One\r\n\r\n---\r\n\r\n## Two\r\n');
  assert.deepEqual(slides.map((s) => s.title), ['One', 'Two']);
});

test('directives: key/value, .slide, bare, notes', () => {
  const { src, attrs, notes } = extractDirectives([
    '<!-- layout: toc progress -->',
    '<!-- cols: 60/40 -->',
    '<!-- bg: dark -->',
    '<!-- .slide: class="a b" fit=false -->',
    '<!-- incremental -->',
    '<!-- notes: hidden note -->',
    '## Title',
    'Body',
  ].join('\n'));
  assert.equal(attrs.layout, 'toc');
  assert.equal(attrs.progress, true);
  assert.equal(attrs.cols, '60/40');
  assert.equal(attrs.bg, 'dark');
  assert.equal(attrs.class, 'a b');
  assert.equal(attrs.fit, false);
  assert.equal(attrs.incremental, true);
  assert.equal(notes, 'hidden note');
  assert.equal(src.trim(), '## Title\nBody');
});

test('directives inside inline code or code fences are ignored', () => {
  const { src, attrs } = extractDirectives('Use `<!-- cols: 1/1 -->` here\n\n```\n<!-- layout: section -->\n```');
  assert.deepEqual(attrs, {});
  assert.match(src, /`<!-- cols: 1\/1 -->`/);
  assert.match(src, /```\n<!-- layout: section -->\n```/);
});

test('unknown comment keys are left alone', () => {
  const { src, attrs } = extractDirectives('<!-- todo: fix this -->\ntext');
  assert.deepEqual(attrs, {});
  assert.match(src, /todo: fix this/);
});

test('"Note:" line moves the rest of the slide to speaker notes', () => {
  const { src, notes } = extractDirectives('## T\n\ntext\n\nNote:\nsay this\n\nand that');
  assert.equal(src.trim(), '## T\n\ntext');
  assert.equal(notes, 'say this\n\nand that');
});

test('title is extracted even after background images', () => {
  const r = extractTitle('\n![bg right](x.jpg)\n## Title here\nbody');
  assert.equal(r.title, 'Title here');
  assert.equal(r.level, 2);
  assert.match(r.body, /!\[bg right\]\(x\.jpg\)/);
  assert.doesNotMatch(r.body, /Title here/);
});

test('automatic layouts: section, quote, default; sections numbered', () => {
  const { slides, sections } = parseDeck([
    '# Part one', '---',
    '# Part two\n\nShort intro.', '---',
    '# Not a section\n\n- because\n- it has a list', '---',
    '> Quote\n\n— Author', '---',
    '## Normal',
  ].join('\n'));
  assert.deepEqual(slides.map((s) => s.attrs.layout), ['section', 'section', 'default', 'quote', 'default']);
  assert.deepEqual(sections.map((s) => s.title), ['Part one', 'Part two']);
  assert.equal(slides[1].sectionIndex, 1);
});

test('explicit layout wins over detection', () => {
  const { slides } = parseDeck('<!-- layout: default -->\n# Lonely title');
  assert.equal(slides[0].attrs.layout, 'default');
});

test('empty slides are dropped', () => {
  const { slides } = parseDeck('## A\n\n---\n\n---\n\n## B');
  assert.equal(slides.length, 2);
});

test('splitTopLevel ignores separators inside ::: containers and code', () => {
  const { splitTopLevel } = require('../src/parse');
  const src = 'a\n|||\n:::: cols\nx\n|||\ny\n::::\n```\n|||\n```\n|||\nb';
  const parts = splitTopLevel(src, /^\s*\|\|\|\s*$/);
  assert.equal(parts.length, 3);
  assert.match(parts[1], /:::: cols\nx\n\|\|\|\ny\n::::/);
});
