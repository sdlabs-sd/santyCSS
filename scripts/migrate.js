#!/usr/bin/env node
/**
 * SantyCSS legacy-name migrator (v2.10)
 *
 * Rewrites pre-2.10 class names to the property-[modifier]-value grammar in
 * HTML, JSX, TSX and Vue files. Old names keep working as deprecated aliases,
 * so running this is optional — but it gets your markup onto the names the
 * docs, IntelliSense and AI tools now use.
 *
 *   add-padding-24 make-flex round-corners-12  →  padding-24 display-flex radius-12
 *   md:set-width-1-of-2                         →  md:width-1-of-2
 *
 * Usage:
 *   node scripts/migrate.js [paths…]          files or folders (default: .)
 *   npx santycss migrate --from=legacy [paths…]
 *
 * Flags:
 *   --dry-run        show what would change, write nothing
 *   --diff           print each rename (file:line  old → new)
 *   --check          exit 1 if any legacy names remain (for CI)
 *   --components     also move classic components to the v2.10 component
 *                    layer (make-button style-primary → button button-primary).
 *                    This changes how they look, so it is opt-in.
 *   --ext=.svelte,.astro   extra file extensions to scan
 *   --exclude=z-10,truncate   leave these classes alone (e.g. shared with
 *                    another framework on the same page)
 *
 * Where it looks:
 *   class="…" / className="…"                  every token
 *   className={…}  :class="…"  v-bind:class="…"  string literals inside
 *   cn( clsx( classNames( cx( cva( tv( twMerge(  string literals inside
 *   classList.add/remove/toggle/replace/contains(  string literals inside
 * Class names built at runtime (`add-padding-${n}`) cannot be rewritten
 * safely; they are listed for manual review.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const naming = require('../lib/naming');

// ─── Classic component → v2.10 component layer (opt-in) ─────────────────────
// make-button style-primary size-large shape-pill
//   → button button-primary button-lg button-pill
const CLASSIC = {
  'make-button': 'button', 'make-card': 'card', 'make-badge': 'badge',
  'make-alert': 'alert', 'make-input': 'input', 'make-navbar': 'navbar',
  'make-modal': 'modal',
};
const CLASSIC_STYLE = { primary: 'primary', secondary: 'secondary', outline: 'outline', ghost: 'ghost',
  success: 'success', danger: 'danger', warning: 'warning', info: 'info', error: 'danger' };
const CLASSIC_SIZE = { tiny: 'sm', small: 'sm', large: 'lg', xl: 'lg' };

const DEFAULT_EXTS = ['.html', '.htm', '.jsx', '.tsx', '.vue'];
const HELPERS = /\b(?:cn|clsx|classnames|classNames|cx|cva|tv|twMerge|classList\.(?:add|remove|toggle|replace|contains))\(/g;

/**
 * Rewrite one class token. Returns the new token or null.
 * `ctx.component` is the classic component found in the same class list.
 */
function mapToken(tok, opts, ctx) {
  if (!tok || opts.exclude.has(tok)) return null;
  if (opts.components) {
    if (CLASSIC[tok]) return CLASSIC[tok];
    const comp = ctx && ctx.component;
    if (comp) {
      let m;
      if ((m = /^style-([a-z]+)$/.exec(tok)) && CLASSIC_STYLE[m[1]]) return comp + '-' + CLASSIC_STYLE[m[1]];
      if ((m = /^size-([a-z]+)$/.exec(tok)) && CLASSIC_SIZE[m[1]]) return comp + '-' + CLASSIC_SIZE[m[1]];
      if (tok === 'shape-pill') return comp + '-pill';
      if (tok === 'size-full') return comp + '-block';
    }
  }
  return naming.toNew(tok);
}

/** Rewrite a whitespace-separated class list. */
function mapList(text, opts, record) {
  const toks = text.split(/(\s+)/);
  const ctx = {};
  if (opts.components) {
    for (const t of toks) if (CLASSIC[t]) ctx.component = CLASSIC[t];
  }
  return toks.map(t => {
    if (/^\s*$/.test(t)) return t;
    const n = mapToken(t, opts, ctx);
    if (n && n !== t) { record(t, n); return n; }
    return t;
  }).join('');
}

/** Index of the bracket that closes the one at `start` (string-aware). */
function matchClose(src, start, open, close) {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === '`') { i = skipString(src, i); continue; }
    if (c === open) depth++;
    else if (c === close && --depth === 0) return i;
  }
  return -1;
}

function skipString(src, i) {
  const q = src[i];
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === '\\') { j++; continue; }
    if (q === '`' && src[j] === '$' && src[j + 1] === '{') { j = matchClose(src, j + 1, '{', '}'); if (j === -1) return src.length; continue; }
    if (src[j] === q) return j;
  }
  return src.length;
}

/**
 * Rewrite class tokens inside the string literals of a JS expression.
 * `quotes` limits which delimiters count (Vue attributes use "…" around
 * the expression, so only ' and ` are literals there).
 */
function mapExpression(expr, opts, record, dynamic, quotes) {
  let out = '';
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (quotes.includes(c)) {
      const end = skipString(expr, i);
      const body = expr.slice(i + 1, end);
      if (c === '`') {
        // Only static stretches of a template literal; ${…} is left alone.
        let res = '', k = 0;
        while (k < body.length) {
          const s = body.indexOf('${', k);
          const stop = s === -1 ? body.length : s;
          let seg = body.slice(k, stop);
          if (s !== -1) {
            const m = /(\S+)$/.exec(seg);
            if (m && /-$/.test(m[1])) dynamic.add(m[1] + '${…}');
          }
          res += mapList(seg, opts, record);
          if (s === -1) break;
          const e = matchClose(body, s + 1, '{', '}');
          if (e === -1) { res += body.slice(s); break; }
          // Literals inside ${…} (`${on ? 'make-flex' : ''}`) are expressions too.
          res += '${' + mapExpression(body.slice(s + 2, e), opts, record, dynamic, ['"', "'", '`']) + '}';
          k = e + 1;
        }
        out += c + res + (end < expr.length ? c : '');
      } else {
        out += c + mapList(body, opts, record) + (end < expr.length ? c : '');
      }
      i = end + 1;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/**
 * Migrate one source file's text. Returns { text, changes, dynamic }.
 * `changes` is a list of { line, from, to }.
 */
function migrateSource(src, options = {}) {
  const opts = {
    components: !!options.components,
    exclude: new Set(options.exclude || []),
  };
  const changes = [];
  const dynamic = new Set();
  const edits = []; // [start, end, replacement]

  const lineAt = idx => src.slice(0, idx).split('\n').length;
  const rec = base => (from, to) => changes.push({ line: lineAt(base), from, to });
  const taken = []; // ranges already handled, so helpers inside attributes are not processed twice
  const overlaps = (a, b) => taken.some(([s, e]) => a < e && b > s);

  // 1. Vue bindings  :class="expr"  v-bind:class="expr"  (expression in "…")
  for (const m of src.matchAll(/(?:\bv-bind:|:)class\s*=\s*(["'])/g)) {
    const q = m[1];
    const start = m.index + m[0].length;
    const end = src.indexOf(q, start);
    if (end === -1) continue;
    const inner = q === '"' ? ["'", '`'] : ['"', '`'];
    const rep = mapExpression(src.slice(start, end), opts, rec(start), dynamic, inner);
    edits.push([start, end, rep]); taken.push([m.index, end + 1]);
  }

  // 2. JSX expressions  className={…}  class={…}
  for (const m of src.matchAll(/\bclass(?:Name)?\s*=\s*\{/g)) {
    const open = m.index + m[0].length - 1;
    if (overlaps(m.index, open + 1)) continue;
    const close = matchClose(src, open, '{', '}');
    if (close === -1) continue;
    const rep = mapExpression(src.slice(open + 1, close), opts, rec(open), dynamic, ['"', "'", '`']);
    edits.push([open + 1, close, rep]); taken.push([m.index, close + 1]);
  }

  // 3. Static attributes  class="…"  className='…'  (not :class / .class)
  for (const m of src.matchAll(/(?<![:.\w-])class(?:Name)?\s*=\s*(["'])/g)) {
    if (overlaps(m.index, m.index + m[0].length)) continue;
    const q = m[1];
    const start = m.index + m[0].length;
    const end = src.indexOf(q, start);
    if (end === -1) continue;
    const body = src.slice(start, end);
    // Server templates inside the attribute ({{ }}, <?php ?>, <%= %>) — only
    // touch the plain stretches between them.
    const parts = body.split(/(\{\{[\s\S]*?\}\}|<\?[\s\S]*?\?>|<%[\s\S]*?%>|\$\{[^}]*\})/);
    const rep = parts.map((p, k) => (k % 2 ? p : mapList(p, opts, rec(start)))).join('');
    edits.push([start, end, rep]); taken.push([m.index, end + 1]);
  }

  // 4. Helper calls anywhere  cn('…')  classList.add('…')
  for (const m of src.matchAll(HELPERS)) {
    const open = m.index + m[0].length - 1;
    if (overlaps(m.index, open + 1)) continue;
    const close = matchClose(src, open, '(', ')');
    if (close === -1) continue;
    const rep = mapExpression(src.slice(open + 1, close), opts, rec(open), dynamic, ['"', "'", '`']);
    edits.push([open + 1, close, rep]); taken.push([m.index, close + 1]);
  }

  // 5. DOM writes  el.className = '…'   el.setAttribute('class', '…')
  for (const m of src.matchAll(/\.className\s*=\s*(?=["'`])|\.setAttribute\(\s*["']class["']\s*,\s*(?=["'`])/g)) {
    const start = m.index + m[0].length;
    if (overlaps(m.index, start)) continue;
    const end = skipString(src, start);
    const rep = mapExpression(src.slice(start, end + 1), opts, rec(start), dynamic, ['"', "'", '`']);
    edits.push([start, end + 1, rep]); taken.push([m.index, end + 1]);
  }

  edits.sort((a, b) => b[0] - a[0]);
  let text = src;
  for (const [s, e, r] of edits) text = text.slice(0, s) + r + text.slice(e);
  changes.sort((a, b) => a.line - b.line);
  // Report runtime-built names only when they start like a legacy family.
  const legacyDyn = [...dynamic].filter(d => naming.toNew(d.replace('${…}', '0')) || /^(make|add|set|round|pin|subtract|use)-/.test(d));
  return { text, changes, dynamic: legacyDyn };
}

// ─── CLI ─────────────────────────────────────────────────────────────────────
function walk(target, exts, out) {
  const st = fs.statSync(target);
  if (st.isFile()) { out.push(target); return out; }
  for (const e of fs.readdirSync(target, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dist' || e.name === 'build') continue;
    const full = path.join(target, e.name);
    if (e.isDirectory()) walk(full, exts, out);
    else if (exts.includes(path.extname(e.name).toLowerCase())) out.push(full);
  }
  return out;
}

function main(argv) {
  const flags = new Set(argv.filter(a => a.startsWith('--') && !a.includes('=')));
  const val = k => { const a = argv.find(x => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : null; };
  // --input= / --file= keep parity with the Tailwind/Bootstrap migrator.
  const paths = argv.filter(a => !a.startsWith('--'));
  if (val('input')) paths.push(val('input'));
  if (val('file')) paths.push(val('file'));
  if (!paths.length) paths.push('.');
  const exts = DEFAULT_EXTS.concat((val('ext') || '').split(',').filter(Boolean).map(e => (e.startsWith('.') ? e : '.' + e)));
  const exclude = (val('exclude') || '').split(',').filter(Boolean);
  const dry = flags.has('--dry-run') || flags.has('--check');
  const opts = { components: flags.has('--components'), exclude };

  const files = [];
  for (const p of paths) {
    if (!fs.existsSync(p)) { console.error(`  ✖ not found: ${p}`); return 2; }
    walk(path.resolve(p), exts, files);
  }

  let total = 0, changed = 0;
  const dyn = [];
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const { text, changes, dynamic } = migrateSource(src, opts);
    dynamic.forEach(d => dyn.push(`${path.relative(process.cwd(), file)}: ${d}`));
    if (!changes.length) continue;
    changed++; total += changes.length;
    const rel = path.relative(process.cwd(), file) || file;
    console.log(`  ${dry ? '[dry-run]' : '✔'} ${rel}  (${changes.length} rename${changes.length === 1 ? '' : 's'})`);
    if (flags.has('--diff')) for (const c of changes) console.log(`      ${rel}:${c.line}  ${c.from} → ${c.to}`);
    if (!dry) fs.writeFileSync(file, text);
  }

  console.log(`\n  SantyCSS legacy-name migration${dry ? ' (dry run)' : ''}`);
  console.log(`  Files scanned : ${files.length}`);
  console.log(`  Files changed : ${changed}`);
  console.log(`  Classes renamed: ${total}`);
  if (dyn.length) {
    console.log(`\n  Built at runtime — review by hand (${dyn.length}):`);
    dyn.forEach(d => console.log(`    - ${d}`));
  }
  if (flags.has('--check') && total) {
    console.log('\n  Legacy class names found. Run without --check to rewrite them.');
    return 1;
  }
  return 0;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { migrateSource, mapToken, main };
