/**
 * Selector aliasing for the v2.10 naming grammar.
 *
 * Given generated CSS and an old→new class map, every selector that mentions an
 * old class gains a twin that uses the new class, placed first:
 *
 *   .add-padding-24 { padding: 24px; }
 *   →  .padding-24, .add-padding-24 { padding: 24px; }
 *
 * Declarations are copied byte-for-byte, so the output values never change —
 * only the names that reach them. Old names keep working as deprecated aliases.
 */
'use strict';

const CLASS_TOKEN = /\.((?:[A-Za-z0-9_-]|\\.)+)/g;

const unescape = s => s.replace(/\\(.)/g, '$1');
const escape = s => s.replace(/[^A-Za-z0-9_-]/g, c => '\\' + c);

const RAW_AT = /^@(?:-[a-z]+-)?(?:keyframes|font-face|property|page|counter-style|font-feature-values)\b/i;

/**
 * Walk a stylesheet and call onRule(prelude, body, context) for each style
 * rule. onRule may return a replacement prelude. Returns the rewritten CSS.
 */
function walk(css, onRule) {
  let out = '';
  let i = 0;
  const n = css.length;
  const ctx = [];

  function skipComment() {
    const end = css.indexOf('*/', i + 2);
    const stop = end === -1 ? n : end + 2;
    out += css.slice(i, stop);
    i = stop;
  }

  // Copy a block body (after '{') through its matching '}', honouring strings,
  // comments and nested braces. Returns the body text.
  function copyRaw() {
    let depth = 1;
    const start = i;
    while (i < n && depth > 0) {
      const c = css[i];
      if (c === '/' && css[i + 1] === '*') { const e = css.indexOf('*/', i + 2); i = e === -1 ? n : e + 2; continue; }
      if (c === '"' || c === "'") { i++; while (i < n && css[i] !== c) { if (css[i] === '\\') i++; i++; } i++; continue; }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      i++;
    }
    const body = css.slice(start, i);
    out += body;
    return body;
  }

  function rules(nested) {
    let prelude = '';
    while (i < n) {
      const c = css[i];
      if (c === '/' && css[i + 1] === '*') {
        if (prelude.trim() === '') { out += prelude; prelude = ''; skipComment(); }
        else { const e = css.indexOf('*/', i + 2); const stop = e === -1 ? n : e + 2; prelude += css.slice(i, stop); i = stop; }
        continue;
      }
      if (c === '}') {
        out += prelude; prelude = '';
        if (nested) { out += '}'; i++; return; }
        out += c; i++; continue;
      }
      if (c === ';' && prelude.trim().startsWith('@')) { // @import / @charset
        out += prelude + ';'; prelude = ''; i++; continue;
      }
      if (c === '{') {
        const lead = prelude.match(/^\s*/)[0];
        const p = prelude.slice(lead.length);
        out += lead;
        i++;
        if (p.startsWith('@')) {
          out += p + '{';
          if (RAW_AT.test(p)) copyRaw();
          else { ctx.push(p.trim()); rules(true); ctx.pop(); }
        } else {
          const bodyStart = i;
          let depth = 1, j = i;
          while (j < n && depth > 0) {
            const ch = css[j];
            if (ch === '"' || ch === "'") { j++; while (j < n && css[j] !== ch) { if (css[j] === '\\') j++; j++; } j++; continue; }
            if (ch === '/' && css[j + 1] === '*') { const e = css.indexOf('*/', j + 2); j = e === -1 ? n : e + 2; continue; }
            if (ch === '{') depth++; else if (ch === '}') depth--;
            j++;
          }
          const body = css.slice(bodyStart, j - 1);
          const rep = onRule(p, body, ctx);
          out += (rep == null ? p : rep) + '{';
          i = bodyStart;
          copyRaw();
        }
        prelude = '';
        continue;
      }
      prelude += c;
      i++;
    }
    out += prelude;
  }

  rules(false);
  return out;
}

/** Split a selector list on top-level commas (ignores commas inside ()). */
function splitSelectors(sel) {
  const parts = [];
  let depth = 0, cur = '';
  for (let k = 0; k < sel.length; k++) {
    const c = sel[k];
    if (c === '\\') { cur += c + (sel[k + 1] || ''); k++; continue; }
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    if (c === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  parts.push(cur);
  return parts;
}

/** Map a selector's class tokens through `rename` (old→new or null). */
function renameSelector(sel, rename) {
  let changed = false;
  const res = sel.replace(CLASS_TOKEN, (m, raw) => {
    const n = rename(unescape(raw));
    if (n == null) return m;
    changed = true;
    return '.' + escape(n);
  });
  return changed ? res : null;
}

/**
 * Add new-name twins to every selector that uses an old name.
 * `map` is a Map(oldClass → newClass) over base names (no variants);
 * variant-prefixed tokens (md:, on-hover:, …) are handled by splitting on
 * the last ':'.
 */
function aliasCSS(css, map, mode) {
  const replace = mode === 'replace';
  const rename = cls => {
    const i = cls.lastIndexOf(':');
    const pre = i === -1 ? '' : cls.slice(0, i + 1);
    const base = i === -1 ? cls : cls.slice(i + 1);
    const n = map.get(base);
    return n === undefined ? null : pre + n;
  };
  return walk(css, prelude => {
    if (!prelude.includes('.')) return null;
    const trail = prelude.match(/\s*$/)[0];
    const parts = splitSelectors(prelude.slice(0, prelude.length - trail.length));
    const twins = [];
    const kept = [];
    for (const part of parts) {
      const r = renameSelector(part, rename);
      if (r != null) twins.push(r);
      else kept.push(part);
    }
    if (!twins.length) return null;
    if (replace) {
      const lead0 = parts[0].match(/^\s*/)[0];
      const uniq = [...new Set(twins.concat(kept).map(t => t.trim()))];
      return lead0 + uniq.join(', ') + trail;
    }
    const existing = new Set(parts.map(p => p.trim()));
    const fresh = twins.filter(t => !existing.has(t.trim()));
    if (!fresh.length) return null;
    const lead = parts[0].match(/^\s*/)[0];
    return lead + fresh.map(t => t.trim()).join(', ') + ', ' + parts.map(p => p.trim()).join(', ') + trail;
  });
}

/**
 * Index every class that appears as the *subject* of a simple rule, keyed by
 * base name, with a signature of (at-rule context, selector shape, body).
 * Used to detect when a new name already exists with different CSS.
 */
function indexClasses(css) {
  const idx = new Map();
  walk(css, (prelude, body, ctx) => {
    if (!prelude.includes('.')) return null;
    const norm = body.replace(/\s+/g, ' ').trim();
    for (const part of splitSelectors(prelude)) {
      const p = part.trim();
      CLASS_TOKEN.lastIndex = 0;
      let m;
      while ((m = CLASS_TOKEN.exec(p))) {
        const cls = unescape(m[1]);
        const shape = p.replace(m[0], '.§');
        const sig = ctx.join(' ') + ' | ' + shape + ' | ' + norm;
        if (!idx.has(cls)) idx.set(cls, new Set());
        idx.get(cls).add(sig);
      }
    }
    return null;
  });
  return idx;
}

/** Every class name used in a selector (comments and values ignored). */
function selectorClasses(css) {
  const set = new Set();
  walk(css, prelude => {
    CLASS_TOKEN.lastIndex = 0;
    let m;
    while ((m = CLASS_TOKEN.exec(prelude))) set.add(unescape(m[1]));
    return null;
  });
  return set;
}

module.exports = { walk, aliasCSS, indexClasses, selectorClasses, splitSelectors, escape, unescape };
