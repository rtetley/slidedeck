'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { createContext, createMarked } = require('../src/markdown');

const FIXTURES = path.join(__dirname, 'fixtures', 'site');

function render(src, opts = {}) {
  const ctx = createContext({ baseDir: FIXTURES, ...opts });
  const md = createMarked(ctx);
  return { html: md.parse(src), ctx };
}

test('inline and display math are rendered with KaTeX', () => {
  const { html, ctx } = render('Euler $e^{i\\pi}=-1$.\n\n$$\n\\sum_i x_i\n$$');
  assert.equal(ctx.usedMath, true);
  assert.match(html, /class="katex"/);
  assert.match(html, /class="katex-display"/);
});

test('dollar amounts are not treated as math', () => {
  const { html, ctx } = render('It costs $5 and $10.');
  assert.equal(ctx.usedMath, false);
  assert.match(html, /\$5 and \$10/);
});

test('::: containers render boxes with localised default titles', () => {
  assert.match(render('::: block Result\nBody\n:::').html, /<div class="box block"><div class="box-title">Result<\/div>/);
  assert.match(render('::: theorem (Fermat)\nx\n:::', { lang: 'fr' }).html, /Théorème \(Fermat\)/);
  assert.match(render('::: alert\nx\n:::').html, /box-title">Warning</);
});

test('containers nest with longer fences', () => {
  const { html } = render(':::: block Outer\nA\n\n::: alert\nInner\n:::\n::::');
  assert.match(html, /box block[\s\S]*box alert[\s\S]*Inner/);
});

test('==mark== renders a highlight', () => {
  assert.match(render('a ==b== c').html, /<mark>b<\/mark>/);
});

test('code blocks are highlighted and labelled', () => {
  const { html } = render('```python\ndef f(): pass\n```');
  assert.match(html, /<pre data-lang="python">/);
  assert.match(html, /hljs-keyword/);
});

test('mermaid blocks become diagrams', () => {
  const { html, ctx } = render('```mermaid\ngraph LR\nA-->B\n```');
  assert.equal(ctx.usedMermaid, true);
  assert.match(html, /<div class="mermaid">/);
});

test('local images are embedded as data URIs; sizes and captions apply', () => {
  const { html } = render('![w:300](img/dot.svg "A *caption*")');
  assert.match(html, /<figure><img src="data:image\/svg\+xml;base64,/);
  assert.match(html, /width:300px/);
  assert.match(html, /<figcaption>A <em>caption<\/em><\/figcaption>/);
});

test('--no-embed keeps relative image paths', () => {
  assert.match(render('![](img/dot.svg)', { embed: false }).html, /src="img\/dot.svg"/);
});

test('background images are collected, not rendered inline', () => {
  const { html, ctx } = render('![bg right:40%](img/dot.svg)');
  assert.equal(html.trim(), '<p></p>');
  assert.equal(ctx.backgrounds.length, 1);
  assert.equal(ctx.backgrounds[0].side, 'right');
  assert.equal(ctx.backgrounds[0].split, '40%');
});

test('missing images produce a warning', () => {
  const { ctx } = render('![](nope.png)');
  assert.deepEqual(ctx.warnings, ['Missing file: nope.png']);
});

test('::: cols builds an inline grid with ratio and flags', () => {
  const { html } = render(':::: cols 1/2 stretch chain\n::: block A\nx\n:::\n|||\n::: grey B\ny\n:::\n::::\n\nAfter');
  assert.match(html, /<div class="cols stretch chain" style="--cols:1fr 2fr">/);
  assert.equal((html.match(/<div class="col">/g) || []).length, 2);
  assert.match(html, /box grey/);
  assert.match(html, /<p>After<\/p>/);
});

test('::: cols without a ratio uses equal columns', () => {
  assert.match(render('::: cols\na\n|||\nb\n|||\nc\n:::').html, /--cols:repeat\(3, 1fr\)/);
});
