/**
 * A small, conservative CSS minifier for the generated bundles.
 *
 * Safe by construction rather than clever:
 *   - strings, url(...) bodies, custom-property values and any value that
 *     uses var() are copied verbatim (browsers keep those as written)
 *   - comments are removed, except /*! … *\/ licence banners
 *   - whitespace collapses to one space, and is removed only next to
 *     { } ; , > and after ':' inside declaration blocks
 *   - the last ';' before '}' is dropped
 * It never touches '+', '-', '*', '/' (calc() needs their spaces) and never
 * removes the space *before* ':' in selectors (".a :hover" ≠ ".a:hover").
 *
 * Verified in tests by parsing source and output in a real browser and
 * comparing every rule's serialized cssText.
 */
'use strict';

function minify(css) {
  // Output goes into an array of chunks. `prev` is the last character
  // written and `seg` the text since the last { } or ; — tracked here so the
  // output string is never re-read (re-reading a growing string is quadratic).
  const buf = [];
  let prev = '';
  let seg = '';
  let i = 0;
  const n = css.length;
  let inDecl = false;     // inside a declaration block (vs selector/prelude)
  const stack = [];       // per-depth: true when that block holds declarations
  let pendingSpace = false;
  let pendingSemi = false;
  const NO_SPACE_AROUND = '{};,>';

  function put(str) {
    if (!str) return;
    buf.push(str);
    seg += str;
    prev = str[str.length - 1];
  }
  function putStructural(ch) {   // { } ;
    buf.push(ch);
    prev = ch;
    seg = '';
  }
  function flushSemi() {
    if (pendingSemi) { putStructural(';'); pendingSemi = false; pendingSpace = false; }
  }
  function emit(ch) {
    flushSemi();
    if (pendingSpace) {
      const dropForPrev = prev === '' || prev === '\n' || NO_SPACE_AROUND.includes(prev) || (inDecl && prev === ':') || prev === '(';
      const dropForNext = ch !== '' && (NO_SPACE_AROUND.includes(ch) || ch === ')');
      if (!dropForPrev && !dropForNext) put(' ');
      pendingSpace = false;
    }
    put(ch);
  }

  while (i < n) {
    const c = css[i];

    // comments (/*! licence */ banners are kept)
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      if (css[i + 2] === '!') { emit(''); put(css.slice(i, stop) + '\n'); seg = ''; }
      i = stop;
      continue;
    }
    // strings
    if (c === '"' || c === "'") {
      const j = skipString(css, i);
      emit('');
      put(css.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    // url(...) without quotes: copy verbatim
    if ((c === 'u' || c === 'U') && /^url\(/i.test(css.slice(i, i + 4)) && css[i + 4] !== '"' && css[i + 4] !== "'") {
      const end = css.indexOf(')', i);
      emit('');
      put(css.slice(i, end + 1));
      i = end + 1;
      continue;
    }
    // Browsers keep custom-property values, and any value that uses var() or
    // env(), exactly as written, so those values are copied verbatim.
    if (inDecl && c === ':') {
      const end = valueEnd(css, i + 1);
      if (seg.trim().startsWith('--') || /\b(?:var|env)\(/.test(css.slice(i + 1, end))) {
        flushSemi();
        pendingSpace = false;
        put(':' + css.slice(i + 1, end).trim());
        i = end;
        continue;
      }
    }
    // whitespace
    if (c === ' ' || c === '\n' || c === '\t' || c === '\r' || c === '\f') {
      pendingSpace = true;
      i++;
      continue;
    }
    if (c === '{') {
      flushSemi();
      // A block holds declarations unless its prelude is a nesting at-rule.
      const prelude = seg.trim();
      const nesting = /^@(media|supports|container|layer|document|scope|starting-style)\b/i.test(prelude) ||
        /^@(-[a-z]+-)?keyframes\b/i.test(prelude);
      pendingSpace = false;
      putStructural('{');
      stack.push(!nesting);
      inDecl = !nesting;
      i++;
      continue;
    }
    if (c === '}') {
      pendingSpace = false;
      pendingSemi = false;          // the last ';' before '}' is dropped
      putStructural('}');
      stack.pop();
      inDecl = stack.length ? stack[stack.length - 1] : false;
      i++;
      continue;
    }
    if (c === ';') {
      pendingSpace = false;
      if (prev !== '{') pendingSemi = true;   // written only if more follows
      else seg = '';
      i++;
      continue;
    }
    emit(c);
    i++;
  }
  return buf.join('').trim() + '\n';
}

// Index of the ';' or '}' that ends a declaration value (strings and
// brackets respected).
function valueEnd(css, i) {
  let depth = 0;
  for (; i < css.length; i++) {
    const c = css[i];
    if (c === '"' || c === "'") { i = skipString(css, i); continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === '}') { if (depth === 0) return i; depth--; }
    else if (c === ';' && depth === 0) return i;
  }
  return css.length;
}

// Index of the ')' matching the '(' at index i.
function parenEnd(css, i) {
  let depth = 0;
  for (; i < css.length; i++) {
    const c = css[i];
    if (c === '"' || c === "'") { i = skipString(css, i); continue; }
    if (c === '(') depth++;
    else if (c === ')' && --depth === 0) return i;
  }
  return css.length - 1;
}

function skipString(css, i) {
  const q = css[i];
  let j = i + 1;
  while (j < css.length && css[j] !== q) { if (css[j] === '\\') j++; j++; }
  return j;
}

module.exports = { minify };
