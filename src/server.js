'use strict';

/**
 * Live-reloading preview server.
 *   serve(folder) → gallery at /, each deck at /<slug>/ (rebuilt on every request)
 *   serve(file)   → that deck at /
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { buildDeck } = require('./render');
const { listDecks, renderIndex, readSiteConfig } = require('./site');
const { ROOT } = require('./assets');

const BOOT_ID = String(Date.now());

/** Reloads the page on a change notice, or when the server restarted with a new boot id. */
const RELOAD_CLIENT = `<script>(function () {
  var es = new EventSource('/__reload'), boot = null;
  es.onmessage = function () { location.reload(); };
  es.addEventListener('boot', function (e) { if (boot && boot !== e.data) location.reload(); boot = e.data; });
})();</script>`;

function serve(target, { port = 8000, log = console.log, warn = console.warn } = {}) {
  target = path.resolve(target);
  const isDir = fs.statSync(target).isDirectory();
  const clients = new Set();

  const renderDeck = (file) => {
    const result = buildDeck(file, { liveReload: true });
    for (const w of new Set(result.warnings)) warn(`  ⚠ ${path.basename(file)}: ${w}`);
    return result.html;
  };

  // Rebuilds happen per request, so watching only needs to tell browsers to reload.
  let timer = null;
  const notify = (_event, file) => {
    if (file && /(^|[\\/])\./.test(file)) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      log(`↻ ${file || 'change'}`);
      for (const res of clients) res.write('data: reload\n\n');
    }, 100);
  };
  const watchers = [
    fs.watch(isDir ? target : path.dirname(target), { recursive: true }, notify),
    fs.watch(path.join(ROOT, 'theme'), notify),
  ];

  const send = (res, status, type, body) => {
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(body);
  };

  const server = http.createServer((req, res) => {
    let url;
    try {
      url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    } catch {
      return send(res, 400, 'text/plain', 'Bad request');
    }

    if (url === '/__reload') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      // The boot id lets pages notice a server restart (npm run dev restarts on code changes).
      res.write(`retry: 1000\nevent: boot\ndata: ${BOOT_ID}\n\n`);
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }

    try {
      if (!isDir) {
        if (url === '/' || url === '/index.html') return send(res, 200, 'text/html; charset=utf-8', renderDeck(target));
        return send(res, 404, 'text/plain', 'Not found');
      }
      const decks = listDecks(target);
      if (url === '/' || url === '/index.html') {
        const html = renderIndex(decks, readSiteConfig(target), { reloadScript: RELOAD_CLIENT });
        return send(res, 200, 'text/html; charset=utf-8', html);
      }
      const slug = url.replace(/^\/+|\/+$/g, '').replace(/\/index\.html$/, '');
      const deck = decks.find((d) => d.slug === slug);
      if (deck) {
        if (!url.endsWith('/') && !url.endsWith('.html')) {
          res.writeHead(302, { Location: url + '/' });
          return res.end();
        }
        return send(res, 200, 'text/html; charset=utf-8', renderDeck(deck.file));
      }
      return send(res, 404, 'text/plain', 'Not found');
    } catch (e) {
      warn(`✖ ${e.message}`);
      return send(res, 500, 'text/html; charset=utf-8',
        `<pre style="font:16px monospace;padding:24px;color:#C9191E">${String(e.stack || e).replace(/</g, '&lt;')}</pre>` +
        RELOAD_CLIENT);
    }
  });

  server.on('close', () => watchers.forEach((w) => w.close()));
  server.listen(port, () => log(`▶ http://localhost:${server.address().port}/   (S = presenter view, ? = help)`));
  return server;
}

module.exports = { serve, RELOAD_CLIENT };
