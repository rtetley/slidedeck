'use strict';

/** Locate a Chromium-based browser and use it headlessly to print HTML to PDF. */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];

function findChrome() {
  return [process.env.CHROME_PATH, ...CANDIDATES].filter(Boolean).find((c) => fs.existsSync(c)) || null;
}

/** Print `htmlFile` to `pdfFile`. Resolves when done; rejects if no browser is found or printing fails. */
function printPdf(htmlFile, pdfFile, { chrome = findChrome(), timeout = 120000 } = {}) {
  if (!chrome) {
    return Promise.reject(new Error('No Chrome/Chromium found. Set CHROME_PATH to a Chromium-based browser.'));
  }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'inria-slides-'));
  const args = [
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw',
    `--user-data-dir=${profile}`, '--virtual-time-budget=10000', `--print-to-pdf=${path.resolve(pdfFile)}`,
  ];
  if (process.platform === 'linux') args.push('--no-sandbox');
  args.push('file://' + path.resolve(htmlFile));
  return new Promise((resolve, reject) => {
    execFile(chrome, args, { timeout }, (err) => {
      fs.rmSync(profile, { recursive: true, force: true });
      if (err) reject(err);
      else if (!fs.existsSync(pdfFile)) reject(new Error(`Chrome did not produce ${pdfFile}`));
      else resolve(pdfFile);
    });
  });
}

module.exports = { findChrome, printPdf };
