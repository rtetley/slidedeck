'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { buildDeck } = require('../src/render');

const BASIC = path.join(__dirname, 'fixtures', 'basic.md');

test('builds a self-contained deck', () => {
  const { html, slideCount, warnings, meta } = buildDeck(BASIC);
  assert.equal(slideCount, 6); // generated title + 5
  assert.deepEqual(warnings, []);
  assert.equal(meta.title, 'Basic deck');
  assert.match(html, /^<!DOCTYPE html>/);
  assert.match(html, /<title>Basic deck<\/title>/);
  assert.match(html, /@font-face/);
  assert.doesNotMatch(html, /<link rel="stylesheet"/);
  assert.doesNotMatch(html, /mermaid\.min\.js/);
});

test('renders each layout', () => {
  const { html } = buildDeck(BASIC);
  for (const layout of ['title', 'toc', 'section', 'default', 'quote', 'end']) {
    assert.match(html, new RegExp(`class="slide layout-${layout}`), layout);
  }
});

test('toc lists sections; section slides are numbered', () => {
  const { html } = buildDeck(BASIC);
  assert.match(html, /<ol class="toc-list"><li class=""><span class="num">01<\/span><span>Introduction<\/span>/);
  assert.match(html, /<div class="section-num">01<\/div>/);
});

test('footer shows title, authors and page numbers', () => {
  const { html } = buildDeck(BASIC);
  assert.match(html, /Basic deck  ·  Alice, Bob  ·  Test/);
  assert.match(html, /<span class="page">4 \/ 6<\/span>/);
});

test('speaker notes are kept in hidden asides', () => {
  assert.match(buildDeck(BASIC).html, /<aside class="notes"><p>Speaker note here.<\/p>/);
});

test('live reload hook is only enabled on request', () => {
  assert.match(buildDeck(BASIC).html, /"liveReload":false/);
  assert.match(buildDeck(BASIC, { liveReload: true }).html, /"liveReload":true/);
});
