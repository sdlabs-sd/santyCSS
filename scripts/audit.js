#!/usr/bin/env node
/**
 * Regenerates the class inventory in AUDIT.md from dist/santy.css.
 *
 *   node build.js && node scripts/audit.js
 *
 * Lists every base class (no variant prefix) the source generates, grouped by
 * category, with numeric and color values folded into one line per family.
 * Grammar names that exist only as v2.10 twins are left out, so the inventory
 * describes the source names; families that were renamed show their new name.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { walk, splitSelectors, unescape } = require('../lib/aliases');

const ROOT = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(ROOT, 'dist', 'santy.css'), 'utf8')
  + '\n' + fs.readFileSync(path.join(ROOT, 'dist', 'santy-themes.css'), 'utf8');
const renames = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist', 'santy-renames.json'), 'utf8')).renames;
const byNew = {};
for (const [o, n] of Object.entries(renames)) (byNew[n] = byNew[n] || []).push(o);

// ── collect base classes, skipping new names that only exist as twins ──────
const TOKEN = /\.((?:[A-Za-z0-9_-]|\\.)+)/g;
const seen = new Set();
const native = new Set();
walk(css, prelude => {
  for (const part of splitSelectors(prelude)) {
    const toks = [...part.matchAll(TOKEN)].map(m => unescape(m[1]));
    for (const t of toks) {
      if (t.includes(':') || /^\d/.test(t)) continue;
      seen.add(t);
    }
  }
  // a grammar name is native when a selector list uses it without its old twin
  const list = splitSelectors(prelude).map(p => [...p.matchAll(TOKEN)].map(m => unescape(m[1])));
  const flat = new Set(list.flat());
  for (const t of flat) {
    if (!byNew[t]) continue;
    if (!byNew[t].some(o => flat.has(o))) native.add(t);
  }
  return null;
});
const classes = [...seen].filter(c => !byNew[c] || native.has(c)).sort();

// ── fold values into families ──────────────────────────────────────────────
const COLORS = 'red|orange|amber|yellow|lime|green|teal|cyan|sky|blue|indigo|violet|purple|pink|rose|slate|gray|zinc|stone|neutral|white|black|transparent|current';
const COLOR_RE = new RegExp(`^(.*?-)?((?:${COLORS})(?:-(?:tint|shade))?)(?:-(\\d+))?$`);
function family(c) {
  let m;
  if ((m = /^(.+)\/(\d+)$/.exec(c))) { const f = family(m[1]); return [f[0] + '/{alpha}', (f[1] ? f[1] + '/' : '') + m[2]]; }
  if ((m = /^(.*?)-(minus-)?(\d+(?:-\d+)?(?:dvh|svh|lvh|dvw|svw|lvw)?)$/.exec(c)) && !/-of$/.test(m[1])) {
    if ((m = /^(.*-)(\d+)-of-(\d+)$/.exec(c))) return [m[1] + '{n}-of-{m}', m[2] + '/' + m[3]];
    const mm = /^(.*?)-(minus-)?(\d+(?:-\d+)?(?:dvh|svh|lvh|dvw|svw|lvw)?)$/.exec(c);
    return [mm[1] + '-' + (mm[2] || '') + '{n}', mm[3]];
  }
  if ((m = /^(.*-)(\d+)-of-(\d+)$/.exec(c))) return [m[1] + '{n}-of-{m}', m[2] + '/' + m[3]];
  if ((m = COLOR_RE.exec(c)) && m[1] && !/^(make|style|text-gradient|border-gradient|gradient)-$/.test(m[1])) {
    return [m[1] + '{color}', m[2] + (m[3] ? '-' + m[3] : '')];
  }
  return [c, null];
}

// ── categories (first match wins) ──────────────────────────────────────────
const CATS = [
  ['Bootstrap-compatible grid', /^(row|row-cols-.*|row-nogutter|col|col-(auto|sm|md|lg|xl|xxl|\d).*|g-\d.*|gx-.*|gy-.*|offset-.*|order-(sm|md|lg|xl|xxl)-.*|container(-(sm|md|lg|xl|xxl|fluid))?)$/],
  ['Display & visibility', /^(make-(flex|grid|block|inline|inline-block|inline-flex|inline-grid|contents|hidden|invisible|visible)$|make-table$|display-|visibility-|sr-only|not-sr-only|hidden|invisible|visible$)/],
  ['Position & layering', /^(position-|pin-|inset|top-|bottom-(\d|auto|full|safe)|left-|right-|start-|end-|z-|layer-|isolat|float|clear)/],
  ['Flexbox & grid', /^(flex|grid|span-|justify|align|self-|content-(around|between|center|end|evenly|start|stretch)$|place-|gap|space-|order-|masonry|columns)/],
  ['Spacing', /^(add-padding|add-margin|subtract-margin|padding|margin|ps-|pe-|ms-|me-|center-margin)/],
  ['Sizing', /^(set-(width|height|size|min|max)|min-|max-|h-|w-|width|height|size-\d|aspect|ratio|object-|fit-|box-)/],
  ['Typography', /^(set-text|set-font|text-|font-|line-height|letter-space|add-letter|subtract-letter|word-|truncate|make-text|prose|list-|hyphen|whitespace|indent|caret|break-|underline|decoration)/],
  ['Color & background', /^(color-|background-|bg-|gradient|from-|via-|to-|fill-|stroke-|accent-|divide-)/],
  ['Borders, radius & rings', /^(add-border|border|round-|make-pill|make-circle|outline|ring)/],
  ['Effects & filters', /^(add-shadow|no-shadow|shadow|opacity|blur|backdrop|brightness|contrast|grayscale|hue|invert|saturate|sepia|drop-|blend|mix-|elevation|glass|clip|mask|text-shadow)/],
  ['Transforms & transitions', /^(rotate|scale|skew|translate|transform|transition|will-|perspective|backface)/],
  ['Animation', /^(animate|animation|stagger|enter-|exit-|when-visible|scroll-reveal|santy-)/],
  ['Interaction & scrolling', /^(cursor|pointer|select-|touch|resize|scroll|snap|appearance|user-|overscroll|overflow)/],
  ['Container queries', /^(make-container|cq-|container-)/],
  ['Theme hooks', /^(use-custom|theme-|dark$)/],
  ['Classic component starters (make-* + style/size/shape)', /^(make-|style-|size-|shape-)/],
];
const COMPONENT = 'Components';
const STATE = 'State hooks used by santy.js';
const STATE_RE = /^(active|show|open|selected|disabled|is-.*|done|complete|copied|dragging|dragover|drag-over|error|filled|loading|pulling|refreshing|today|typing|visible|other|target|outside)$/;

const groups = {};
for (const c of classes) {
  let cat = COMPONENT;
  if (STATE_RE.test(c)) cat = STATE;
  else for (const [name, re] of CATS) if (re.test(c)) { cat = name; break; }
  const [fam, val] = family(c);
  groups[cat] = groups[cat] || {};
  (groups[cat][fam] = groups[cat][fam] || []).push(val);
}

const order = CATS.map(c => c[0]).concat([COMPONENT, STATE]);
const numSort = (a, b) => (parseFloat(a) - parseFloat(b)) || String(a).localeCompare(String(b));
let md = '';
let total = 0;
const summary = [];
for (const cat of order) {
  const fams = groups[cat];
  if (!fams) continue;
  const n = Object.values(fams).reduce((s, v) => s + v.length, 0);
  total += n;
  summary.push(`| ${cat} | ${Object.keys(fams).length} | ${n} |`);
  md += `\n<details>\n<summary><b>${cat}</b> — ${n} classes in ${Object.keys(fams).length} families</summary>\n\n`;
  for (const fam of Object.keys(fams).sort()) {
    const vals = fams[fam].filter(v => v !== null).sort(numSort);
    const nameOf = v => fam.replace('{n}-of-{m}', String(v).replace('/', '-of-')).replace('{n}', v).replace('{color}', v).replace('{alpha}', '');
    let arrow = '';
    const mapped = (vals.length ? vals : [null]).map(v => [v, renames[v === null ? fam : nameOf(v)]]);
    if (mapped.some(([, n]) => n)) {
      const slot = fam.includes('{n}-of-{m}') ? '{n}-of-{m}' : fam.includes('{n}') ? '{n}' : fam.includes('{color}') ? '{color}' : null;
      const tmpl = slot && vals.length ? mapped[0][1] && mapped[0][1].replace(slot === '{n}-of-{m}' ? String(vals[0]).replace('/', '-of-') : vals[0], slot) : mapped[0][1];
      const fits = mapped.every(([v, n]) => !n || !slot || n === tmpl.replace(slot, slot === '{n}-of-{m}' ? String(v).replace('/', '-of-') : v));
      arrow = fits ? `  → \`${tmpl}\`` : `  → ${mapped.filter(([, n]) => n).slice(0, 4).map(([, n]) => '`' + n + '`').join(', ')}${mapped.length > 4 ? ', …' : ''}`;
    }
    md += vals.length ? `- \`${fam}\`${arrow} — ${vals.join(', ')}\n` : `- \`${fam}\`${arrow}\n`;
  }
  md += '\n</details>\n';
}
const head = `Generated by \`node scripts/audit.js\` from \`dist/santy.css\` + \`dist/santy-themes.css\`.
**${total.toLocaleString()} base classes** (no variant prefix) in ${summary.length} categories. A \`→\` marks a family renamed in v2.10.

| Category | Families | Classes |
|---|---:|---:|
${summary.join('\n')}
`;

const auditPath = path.join(ROOT, 'AUDIT.md');
const START = '<!-- inventory:start -->', END = '<!-- inventory:end -->';
let doc = fs.existsSync(auditPath) ? fs.readFileSync(auditPath, 'utf8') : `${START}\n${END}\n`;
const a = doc.indexOf(START), z = doc.indexOf(END);
doc = doc.slice(0, a + START.length) + '\n' + head + md + '\n' + doc.slice(z);
fs.writeFileSync(auditPath, doc);
console.log(`AUDIT.md inventory: ${total} classes, ${summary.length} categories`);
if (require.main === module && process.argv.includes('--summary')) console.log(summary.join('\n'));
