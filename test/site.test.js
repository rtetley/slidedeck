'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildSite, findDecks, slugFor } = require('../src/site');

const SITE = path.join(__dirname, 'fixtures', 'site');

test('slugs are URL-safe and index.md maps to its folder', () => {
  assert.equal(slugFor('alpha.md'), 'alpha');
  assert.equal(slugFor(path.join('talks', 'index.md')), 'talks');
  assert.equal(slugFor(path.join('talks', 'Été 2026.md')), 'talks/ete-2026');
});

test('finds decks, ignoring README and non-markdown files', () => {
  const slugs = findDecks(SITE).map((d) => d.slug);
  assert.deepEqual(slugs, ['alpha', 'talks', 'talks/ete-2026', 'wip']);
});

test('builds the site: one folder per deck, gallery, drafts skipped', async () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'inria-slides-test-'));
  const warnings = [];
  try {
    const entries = await buildSite({ slidesDir: SITE, outDir: out, warn: (f, w) => warnings.push(w) });
    assert.deepEqual(entries.map((e) => e.slug).sort(), ['alpha', 'talks', 'talks/ete-2026']);
    for (const slug of ['alpha', 'talks', 'talks/ete-2026']) {
      assert.ok(fs.existsSync(path.join(out, slug, 'index.html')), slug);
    }
    assert.ok(!fs.existsSync(path.join(out, 'wip')));
    assert.ok(fs.existsSync(path.join(out, '.nojekyll')));
    assert.deepEqual(warnings, ['Missing file: missing.png']);

    const index = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
    assert.match(index, /<title>Test site<\/title>/);
    assert.match(index, /href="talks\/ete-2026\/"/);
    assert.doesNotMatch(index, /Work in progress/);
    // newest first
    assert.ok(index.indexOf('Beta talk') < index.indexOf('Alpha talk'));
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
});

test('refuses to write the site over its sources', async () => {
  await assert.rejects(buildSite({ slidesDir: SITE, outDir: path.dirname(SITE) }), /Refusing/);
});
