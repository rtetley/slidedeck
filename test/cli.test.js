'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawnSync } = require('child_process');
const { serve } = require('../src/server');

const CLI = path.join(__dirname, '..', 'bin', 'inria-slides.js');
const run = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', env: { ...process.env, GITHUB_ACTIONS: '' } });

test('new + build produce an HTML deck', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'inria-slides-cli-'));
  try {
    const md = path.join(dir, 'talk.md');
    assert.equal(run('new', md).status, 0);
    const r = run('build', md);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /slides → /);
    assert.ok(fs.existsSync(path.join(dir, 'talk.html')));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('--strict fails on warnings', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'inria-slides-cli-'));
  try {
    const md = path.join(dir, 'talk.md');
    fs.writeFileSync(md, '## Slide\n\n![](missing.png)\n');
    assert.equal(run('build', md).status, 0);
    const strict = run('build', md, '--strict');
    assert.equal(strict.status, 1);
    assert.match(strict.stderr, /missing\.png/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('unknown commands and missing files fail', () => {
  assert.equal(run('frobnicate').status, 1);
  assert.equal(run('build', 'does-not-exist.md').status, 1);
});

function get(port, url) {
  return new Promise((resolve, reject) => {
    http.get({ port, path: url }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

test('dev server serves the gallery and decks', async () => {
  const server = serve(path.join(__dirname, 'fixtures', 'site'), { port: 0, log: () => {}, warn: () => {} });
  await new Promise((r) => server.once('listening', r));
  const { port } = server.address();
  try {
    const index = await get(port, '/');
    assert.equal(index.status, 200);
    assert.match(index.body, /Alpha talk/);
    assert.match(index.body, /Work in progress/); // drafts are visible locally
    const deck = await get(port, '/alpha/');
    assert.equal(deck.status, 200);
    assert.match(deck.body, /"liveReload":true/);
    assert.equal((await get(port, '/alpha')).status, 302);
    assert.equal((await get(port, '/nope/')).status, 404);
    // reload channel announces a boot id so open pages reload after a restart
    const boot = await new Promise((resolve, reject) => {
      http.get({ port, path: '/__reload' }, (res) => {
        res.once('data', (chunk) => { resolve(String(chunk)); res.destroy(); });
      }).on('error', reject);
    });
    assert.match(boot, /event: boot\ndata: \d+/);
    assert.match(index.body, /addEventListener\('boot'/);
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});
