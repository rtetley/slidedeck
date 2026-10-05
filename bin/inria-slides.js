#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { buildDeck } = require('../src/render');
const { buildSite } = require('../src/site');
const { serve } = require('../src/server');
const { printPdf } = require('../src/chrome');

const USAGE = `
inria-slides — Markdown → Inria-styled HTML slides

Usage:
  inria-slides site  [slides/] [-o dist] [--pdf]   build every deck + gallery page
  inria-slides serve [slides/ | talk.md] [-p 8000] live-reloading preview
  inria-slides build <talk.md> [-o out.html] [--watch] [--no-embed]
  inria-slides pdf   <talk.md> [-o out.pdf]        export via headless Chrome
  inria-slides new   <talk.md>                     scaffold a new talk

Options:
  --strict   exit with an error if any warning is emitted (missing images…)
`;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-o' || a === '--out') args.out = argv[++i];
    else if (a === '-p' || a === '--port') args.port = parseInt(argv[++i], 10);
    else if (a === '-w' || a === '--watch') args.watch = true;
    else if (a === '--no-embed') args.embed = false;
    else if (a === '--pdf') args.pdf = true;
    else if (a === '--strict') args.strict = true;
    else if (a === '-h' || a === '--help') args.help = true;
    else if (a.startsWith('-')) fail(`unknown option ${a}`);
    else args._.push(a);
  }
  return args;
}

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

let warningCount = 0;
function warn(file, msg) {
  warningCount++;
  if (process.env.GITHUB_ACTIONS) console.log(`::warning file=${path.relative(process.cwd(), file)}::${msg}`);
  else console.warn(`  ⚠ ${path.relative(process.cwd(), file)}: ${msg}`);
}

function requireFile(input) {
  if (!input || !fs.existsSync(input) || !fs.statSync(input).isFile()) fail(`input file not found: ${input || '(none)'}`);
}

const outPath = (input, ext) => input.replace(/\.(md|markdown)$/i, '') + ext;

/* ------------------------------------------------------------------------ */

function cmdBuild(input, args) {
  requireFile(input);
  const out = args.out || outPath(input, '.html');
  const build = () => {
    const result = buildDeck(input, { embed: args.embed });
    for (const w of new Set(result.warnings)) warn(input, w);
    fs.writeFileSync(out, result.html);
    console.log(`✔ ${result.slideCount} slides → ${out}`);
    return result;
  };
  let result = build();
  if (!args.watch) return;

  console.log('… watching for changes (Ctrl-C to stop)');
  let timer = null;
  let watchers = [];
  const watch = () => {
    watchers.forEach((w) => w.close());
    watchers = [...result.watchFiles].filter(fs.existsSync).map((f) => fs.watch(f, () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try { result = build(); } catch (e) { console.error('✖', e.message); }
        watch();
      }, 80);
    }));
  };
  watch();
}

async function cmdSite(dir, args) {
  dir = dir || 'slides';
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) fail(`slides folder not found: ${dir}`);
  const outDir = args.out || 'dist';
  const entries = await buildSite({ slidesDir: dir, outDir, pdf: args.pdf, log: console.log, warn });
  console.log(`✔ ${entries.length} deck(s) → ${outDir}/`);
}

function cmdServe(target, args) {
  target = target || 'slides';
  if (!fs.existsSync(target)) fail(`not found: ${target}`);
  serve(target, { port: args.port || 8000 });
}

async function cmdPdf(input, args) {
  requireFile(input);
  const out = path.resolve(args.out || outPath(input, '.pdf'));
  const html = out.replace(/\.pdf$/i, '') + '.print.html';
  const result = buildDeck(input);
  for (const w of new Set(result.warnings)) warn(input, w);
  fs.writeFileSync(html, result.html);
  try {
    await printPdf(html, out);
  } finally {
    fs.rmSync(html, { force: true });
  }
  console.log(`✔ PDF → ${out}`);
}

function cmdNew(file) {
  if (!file) fail('usage: inria-slides new <talk.md>');
  if (fs.existsSync(file)) fail(`${file} already exists`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(file, `---
title: My talk title
subtitle: A one-line subtitle
author: Firstname Lastname
affiliation: Inria — Team name
date: ${today}
event: Seminar
lang: en
---

<!-- layout: toc -->

---

# First section

---

## A content slide

- A point with **emphasis**
- Another point
  - a detail

Note:
Speaker notes go here.

---

<!-- layout: end -->
`);
  console.log(`✔ created ${file}`);
}

/* ------------------------------------------------------------------------ */

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [cmd, target] = args._;
  if (args.help || !cmd) {
    console.log(USAGE);
    process.exit(cmd || args.help ? 0 : 1);
  }
  switch (cmd) {
    case 'build': cmdBuild(target, args); break;
    case 'site': await cmdSite(target, args); break;
    case 'serve': cmdServe(target, args); break;
    case 'pdf': await cmdPdf(target, args); break;
    case 'new': cmdNew(target); break;
    default: console.log(USAGE); fail(`unknown command: ${cmd}`);
  }
  if (args.strict && warningCount) fail(`${warningCount} warning(s) with --strict`);
}

main().catch((e) => fail(e.message));
