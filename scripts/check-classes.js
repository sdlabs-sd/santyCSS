#!/usr/bin/env node
/**
 * Class audit — finds class names used in the site / templates that no
 * SantyCSS stylesheet actually defines.
 *
 *   node scripts/check-classes.js                  audit default targets
 *   node scripts/check-classes.js path/to/dir ...  audit specific files/dirs
 *   node scripts/check-classes.js --strict ...     exit 1 when anything is missing
 *   node scripts/check-classes.js --json           machine-readable output
 *
 * A class counts as "defined" when it appears as a class selector in any CSS
 * under dist/ (santy.css, santy-icons.css, …) or in a <style> block / .css file
 * that ships alongside the page being audited (page-local helpers are fine —
 * they're just not SantyCSS). Only *-prefixed SantyCSS-looking names that are
 * undefined everywhere are reported, so the list stays actionable.
 *
 * Supports: class="…" (HTML/Vue), className="…" / className={'…'} (JSX),
 * :class="'…'" string literals and cn('…') / clsx('…') helpers.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const asJson = args.includes('--json');
const targets = args.filter(a => !a.startsWith('--'));

const DEFAULT_TARGETS = [
  '.', 'ecommerce', 'school', 'real-estate', 'saloon', 'eye-vision', 'brewery',
  'resume-templates/react/src', 'resume-templates/vue/src', 'resume-templates/web',
];
// jit-demo.html uses arbitrary off-scale values on purpose — the JIT generates them.
const SKIP_FILES = new Set(['jit-demo.html']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'vscode-santycss', 'figma-plugin-santycss', 'santycss-builder', 'icons', 'scripts', 'test', 'packages', 'postcss', 'lib']);
const EXT = new Set(['.html', '.jsx', '.tsx', '.vue', '.js']);

/* ── Defined classes ───────────────────────────────────────────────────── */
function unescapeCss(s) {
  return s.replace(/\\([0-9a-fA-F]{1,6}\s?|.)/g, (m, g) =>
    /^[0-9a-fA-F]/.test(g) && g.trim().length > 1 ? String.fromCodePoint(parseInt(g, 16)) : g[0]);
}
function classesInCss(css, into) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Only look at selector text (before each "{"), not declaration values.
  const re = /([^{}]+)\{/g;
  let m;
  while ((m = re.exec(css))) {
    const sel = m[1];
    if (sel.trim().startsWith('@')) continue;
    const cre = /\.((?:\\.|[A-Za-z0-9_-])+)/g;
    let c;
    while ((c = cre.exec(sel))) into.add(unescapeCss(c[1]));
  }
  return into;
}
const defined = new Set();
for (const f of fs.readdirSync(DIST)) {
  if (f.endsWith('.css')) classesInCss(fs.readFileSync(path.join(DIST, f), 'utf8'), defined);
}
// Classes santy.js / santy-elements.js toggle at runtime and style themselves.
['open', 'show', 'active', 'dark', 'is-open', 'is-active'].forEach(c => defined.add(c));

/* ── Used classes ──────────────────────────────────────────────────────── */
function walk(p, out) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    const base = path.basename(p);
    if (SKIP_DIRS.has(base) && p !== ROOT) return out;
    for (const f of fs.readdirSync(p)) {
      const child = path.join(p, f);
      // The repo root: only top-level files, sub-sites are listed explicitly.
      if (p === ROOT && fs.statSync(child).isDirectory()) continue;
      walk(child, out);
    }
  } else if (EXT.has(path.extname(p)) && !SKIP_FILES.has(path.basename(p))) {
    if (path.extname(p) === '.js' && !/resume-templates/.test(p)) return out; // root .js are framework code
    out.push(p);
  }
  return out;
}

function localCss(file, src) {
  const set = new Set();
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = styleRe.exec(src))) classesInCss(m[1], set);
  const linkRe = /<link[^>]+href=["']([^"':]+\.css)["']/gi;
  while ((m = linkRe.exec(src))) {
    const p = path.resolve(path.dirname(file), m[1]);
    if (fs.existsSync(p) && !p.startsWith(DIST)) classesInCss(fs.readFileSync(p, 'utf8'), set);
  }
  return set;
}

function usedClasses(src) {
  const found = [];
  const push = s => s.split(/\s+/).forEach(c => {
    c = c.trim();
    // Skip template interpolation fragments and non-class tokens.
    if (!c || /[${}()<>"'`=+&|?]/.test(c) || /^\d/.test(c)) return;
    found.push(c);
  });
  const patterns = [
    /\bclass(?:Name)?\s*=\s*"([^"]*)"/g,
    /\bclass(?:Name)?\s*=\s*'([^']*)'/g,
    /\bclassName\s*=\s*\{\s*['"`]([^'"`]*)['"`]\s*\}/g,
    /\b(?:cn|clsx|cx)\(\s*['"`]([^'"`]*)['"`]/g,
    /\bcls\s*:\s*['"`]([^'"`]*)['"`]/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(src))) push(m[1]);
  }
  // Template literals / string literals inside className={`…`} or :class="`…`"
  const tl = /\b(?::class|className)\s*=\s*\{?\s*`([^`]*)`/g;
  let m;
  while ((m = tl.exec(src))) push(m[1].replace(/\$\{[^}]*\}/g, ' '));
  // Quoted strings in :class bindings / ternaries:  :class="x ? 'a b' : 'c'"
  const bind = /(?::class|className)\s*=\s*(?:"([^"]*)"|\{([^}]*)\})/g;
  while ((m = bind.exec(src))) {
    const body = m[1] || m[2] || '';
    const q = /'([^']*)'/g;
    let s;
    while ((s = q.exec(body))) push(s[1]);
  }
  return found;
}

// Only report names that look like SantyCSS utilities — page-specific helper
// classes (e.g. "tpl-card", "hero-wrap") are the page's own business.
const SANTY_SHAPE = /^(?:[a-z-]+:)*(?:add|set|make|color|background|border|round|text|align|justify|gap|grid|flex|pin|position|line|letter|opacity|scale|rotate|translate|transition|overflow|cursor|shadow|z|object|aspect|place|order|span|col|row|space|font|wrap|width|height|min|max|subtract|from|to|via|gradient|ring|outline|blur|backdrop|animate|animation|hide|show|print|sr|truncate|list|decoration|underline|whitespace|break|self|inset|top|bottom|left|right|display|visibility|fill|stroke|divide|leading|tracking|uppercase|lowercase|capitalize|italic|bold|center)(?:-|$)/;

const files = (targets.length ? targets : DEFAULT_TARGETS)
  .map(t => path.resolve(ROOT, t))
  .filter(p => fs.existsSync(p))
  .flatMap(p => walk(p, []));

const missing = new Map(); // class -> Set(files)
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const local = localCss(file, src);
  for (const c of usedClasses(src)) {
    if (defined.has(c) || local.has(c)) continue;
    if (!SANTY_SHAPE.test(c)) continue;
    if (!missing.has(c)) missing.set(c, new Set());
    missing.get(c).add(path.relative(ROOT, file));
  }
}

const rows = [...missing.entries()].sort((a, b) => a[0].localeCompare(b[0]));
if (asJson) {
  console.log(JSON.stringify(Object.fromEntries(rows.map(([c, f]) => [c, [...f]])), null, 2));
} else {
  console.log(`Scanned ${files.length} files against ${defined.size.toLocaleString()} defined classes.`);
  if (!rows.length) console.log('✓ No missing SantyCSS classes.');
  else {
    console.log(`✗ ${rows.length} class name(s) used but not defined:\n`);
    for (const [c, f] of rows) console.log(`  ${c.padEnd(42)} ${[...f].slice(0, 3).join(', ')}${f.size > 3 ? ` (+${f.size - 3})` : ''}`);
  }
}
if (strict && rows.length) process.exit(1);
