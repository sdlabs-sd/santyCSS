#!/usr/bin/env node
/**
 * Proves each dist/*.min.css is equivalent to its source: both are parsed by
 * a real browser (Chromium via Playwright) and every rule's serialized
 * cssText is compared. Run after `node build.js`:
 *
 *   node scripts/verify-minify.js            # all minified bundles
 *   node scripts/verify-minify.js santy-next # one bundle
 *
 * Needs `playwright` with Chromium; the regular test suite runs a Node-only
 * structural check instead, so CI does not depend on a browser.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const only = process.argv.slice(2);
const pairs = fs.readdirSync(DIST)
  .filter(f => f.endsWith('.min.css'))
  .map(f => [f.replace('.min.css', '.css'), f])
  .filter(([src]) => fs.existsSync(path.join(DIST, src)))
  .filter(([src]) => !only.length || only.some(o => src.startsWith(o)));

(async () => {
  let chromium;
  try { ({ chromium } = require('playwright')); } catch (e) {
    console.error('playwright is not installed; skipping browser verification.');
    process.exit(0);
  }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let failed = 0;
  for (const [src, min] of pairs) {
    const a = fs.readFileSync(path.join(DIST, src), 'utf8');
    const b = fs.readFileSync(path.join(DIST, min), 'utf8');
    const r = await page.evaluate(([x, y]) => {
      const dump = t => { const s = new CSSStyleSheet(); s.replaceSync(t); return [...s.cssRules].map(r => r.cssText); };
      const A = dump(x), B = dump(y);
      let diffs = 0, first = null;
      for (let i = 0; i < Math.max(A.length, B.length); i++) if (A[i] !== B[i]) { diffs++; first = first || [A[i], B[i]]; }
      return { n: A.length, m: B.length, diffs, first };
    }, [a, b]);
    const ok = r.diffs === 0 && r.n === r.m;
    if (!ok) failed++;
    console.log(`${ok ? '✓' : '✗'} ${min.padEnd(28)} ${r.n} rules  ${(a.length / 1024).toFixed(0)}KB → ${(b.length / 1024).toFixed(0)}KB` +
      (ok ? '' : `\n    ${r.diffs} differing rules, first:\n    ${String(r.first && r.first[0]).slice(0, 160)}\n    ${String(r.first && r.first[1]).slice(0, 160)}`));
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
