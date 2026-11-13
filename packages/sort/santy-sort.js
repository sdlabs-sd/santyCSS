/*! @santycss/sort — canonical class ordering | MIT
 *
 * Tailwind's real moat is tooling, not CSS, and automatic class sorting is the
 * piece developers notice daily: without it, class attributes drift into
 * whatever order each person typed, and diffs churn on reordering alone.
 *
 *   sortClasses('add-padding-8 make-flex md:grid-cols-3 btn on-hover:scale-105')
 *   → 'btn make-flex add-padding-8 on-hover:scale-105 md:grid-cols-3'
 *
 * Ordering rules, in priority order:
 *   1. Unrecognised classes first (component and app classes: `btn`, `card`,
 *      `my-widget`) in their original relative order — they are usually the
 *      element's identity, and moving them around hurts readability.
 *   2. Base utilities, grouped by what they affect: layout → box → spacing →
 *      sizing → typography → colour → border → effects → motion → interaction.
 *   3. Variants last, so the unconditional styles read first — responsive
 *      ascending (sm → xl), then state, then dark, then print.
 *
 * Pure and dependency-free: usable from the Prettier plugin, an ESLint rule,
 * an editor command, or a codemod.
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.santySort = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Naming grammar (synced from lib/naming.js by build.js — do not edit).
  // Classes are matched by their legacy spelling, so `padding-24` and
  // `add-padding-24` fall in the same group.
  /* @naming:start */
var SantyNaming = (function () {
  'use strict';

  // Exact one-to-one renames (checked before the prefix rules).
  var EXACT = {
    // display — "make-" was the only verb-led display family
    'make-flex': 'display-flex',
    'make-grid': 'display-grid',
    'make-block': 'display-block',
    'make-inline': 'display-inline',
    'make-inline-block': 'display-inline-block',
    'make-inline-flex': 'display-inline-flex',
    'make-inline-grid': 'display-inline-grid',
    'make-contents': 'display-contents',
    'make-hidden': 'display-none',
    'make-invisible': 'visibility-hidden',
    'make-visible': 'visibility-visible',
    // shape
    'make-pill': 'radius-pill',
    'make-circle': 'radius-circle',
    // writing mode
    'make-text-vertical': 'text-vertical',
    'make-text-vertical-up': 'text-vertical-up',
    'make-text-horizontal': 'text-horizontal',
    // container queries (container-type)
    'make-container': 'container-type-inline',
    'make-container-size': 'container-type-size',
    'make-container-block': 'container-type-block',
    // shadows
    'add-shadow': 'shadow',
    'no-shadow': 'shadow-none',
    // duplicates of grammar names
    'center-margin': 'margin-x-auto',
    'truncate': 'text-truncate',
    'ms-auto': 'margin-start-auto',
    'me-auto': 'margin-end-auto',
    'text-black-weight': 'text-weight-black',
    // custom-property hooks ("use-" was a verb)
    'use-custom-color': 'color-custom',
    'use-custom-font': 'font-custom',
    'use-custom-radius': 'radius-custom',
    'use-custom-size': 'size-custom',
    'use-custom-spacing': 'spacing-custom',
    // absolute centering ("pin-" was a verb)
    'pin-center': 'inset-center',
    'pin-center-x': 'inset-center-x',
    'pin-center-y': 'inset-center-y',
    // background keywords whose new form is not a plain prefix swap
    'bg-no-repeat': 'background-repeat-none',
    'bg-scroll-bg': 'background-scroll',
    // aspect ratio keywords (three spellings collapsed into "aspect-")
    'ratio-video': 'aspect-video',
    'ratio-square': 'aspect-square',
    'ratio-portrait': 'aspect-9-by-16',
    'set-size-full': 'size-fill',
    'line-height-1-375': 'line-height-snug',
    'line-height-1-625': 'line-height-relaxed',
    'ratio-auto': 'aspect-auto'
  };

  // Prefix swaps, longest first. [legacy prefix, grammar prefix, rest pattern]
  // The rest pattern keeps a rule from catching component classes that merely
  // share a prefix (pin-input, h-scroll, …).
  var N = '\\d+';
  var SIDE = '(?:(?:top|bottom|left|right|x|y|start|end|block|inline)-)?';
  var PREFIX = [
    ['make-container-named-', 'container-named-', '[a-z]+'],
    ['add-padding-', 'padding-', SIDE + '(?:' + N + ')'],
    ['add-margin-', 'margin-', SIDE + '(?:' + N + '|auto)'],
    ['add-border-', 'border-', SIDE + N],
    ['add-shadow-', 'shadow-', '[a-z]+'],
    ['add-letter-space-', 'letter-spacing-', N],
    ['subtract-letter-space-', 'letter-spacing-minus-', N],
    ['letter-space-', 'letter-spacing-', '[a-z]+'],
    ['round-corners-', 'radius-', N],
    ['round-top-', 'radius-top-', N],
    ['round-bottom-', 'radius-bottom-', N],
    ['round-left-', 'radius-left-', N],
    ['round-right-', 'radius-right-', N],
    ['set-min-height-', 'min-height-', '.+'],
    ['set-min-width-', 'min-width-', '.+'],
    ['set-max-height-', 'max-height-', '.+'],
    ['set-max-width-', 'max-width-', '.+'],
    ['set-width-', 'width-', '.+'],
    ['set-height-', 'height-', '.+'],
    ['set-size-', 'size-', '.+'],
    ['set-text-', 'text-size-', N],
    ['set-font-weight-', 'text-weight-', N],
    ['h-', 'height-', '(?:xs|sm|md|lg|xl|dvh|svh|lvh|\\d+dvh|\\d+svh)'],
    ['pin-block-start-', 'inset-block-start-', N],
    ['pin-block-end-', 'inset-block-end-', N],
    ['pin-inline-start-', 'inset-inline-start-', N],
    ['pin-inline-end-', 'inset-inline-end-', N],
    ['pin-all-', 'inset-', N],
    ['pin-top-', 'top-', '(?:' + N + '|auto|full|safe)'],
    ['pin-bottom-', 'bottom-', '(?:' + N + '|auto|full|safe)'],
    ['pin-left-', 'left-', '(?:' + N + '|auto|full|safe)'],
    ['pin-right-', 'right-', '(?:' + N + '|auto|full|safe)'],
    ['z-minus-', 'z-index-minus-', N],
    ['z-', 'z-index-', '(?:' + N + '|auto|base|raised|dropdown|sticky|overlay|modal|popover|toast|tooltip|top|negative)'],
    ['self-', 'align-self-', '(?:auto|start|end|center|baseline|stretch)'],
    ['content-', 'align-content-', '(?:around|between|center|end|evenly|start|stretch)'],
    ['span-col-', 'grid-column-span-', '.+'],
    ['span-row-', 'grid-row-span-', '.+'],
    ['grid-auto-cols-', 'grid-auto-columns-', '.+'],
    ['grid-cols-', 'grid-columns-', '.+'],
    ['fit-', 'object-fit-', '(?:contain|cover|fill|none|scale)'],
    ['object-', 'object-position-', '(?:top|bottom|left|right|center)'],
    ['ps-', 'padding-start-', N],
    ['pe-', 'padding-end-', N],
    ['animate-', 'animation-', '[a-z].*'],
    ['bg-', 'background-', '(?:auto|bottom|bottom-left|bottom-right|center|contain|cover|fixed|left|local|right|top|top-left|top-right|repeat|repeat-round|repeat-space|repeat-x|repeat-y|clip-border|clip-content|clip-padding|clip-text)']
  ];
  PREFIX.sort(function (a, b) { return b[0].length - a[0].length; });

  var COLORS = 'red|orange|amber|yellow|lime|green|teal|cyan|blue|indigo|violet|purple|pink|rose|slate|gray|zinc|stone';

  // Value-format rules (rule 3: whole numbers, minus-N, N-of-M, N-by-M).
  var PATTERN = [
    // subtract-margin-top-16 → margin-top-minus-16
    {
      old: /^subtract-margin-(?:(top|bottom|left|right|x|y)-)?(\d+)$/,
      toNew: function (m) { return 'margin-' + (m[1] ? m[1] + '-' : '') + 'minus-' + m[2]; },
      neu: /^margin-(?:(top|bottom|left|right|x|y)-)?minus-(\d+)$/,
      toOld: function (m) { return 'subtract-margin-' + (m[1] ? m[1] + '-' : '') + m[2]; }
    },
    // line-height-1-5 → line-height-150 ; line-height-2 → line-height-200
    {
      old: /^line-height-(\d)(?:-(\d+))?$/,
      toNew: function (m) { return 'line-height-' + Math.round(parseFloat(m[1] + '.' + (m[2] || '0')) * 100); },
      neu: /^line-height-(\d{3})$/,
      toOld: function (m) {
        var v = String(parseInt(m[1], 10) / 100).split('.');
        return 'line-height-' + v[0] + (v[1] ? '-' + v[1] : '');
      }
    },
    // aspect-ratio-16-9 / ratio-21-9 / aspect-4-3 → aspect-16-by-9
    {
      old: /^(?:aspect-ratio|ratio|aspect)-(\d+)-(\d+)$/,
      toNew: function (m) { return 'aspect-' + m[1] + '-by-' + m[2]; },
      neu: /^aspect-(\d+)-by-(\d+)$/,
      toOld: function (m) { return 'aspect-ratio-' + m[1] + '-' + m[2]; }
    },
    // border-blue-tint-20 → border-color-blue-tint-20 (property word was missing)
    {
      old: new RegExp('^border-(' + COLORS + ')-(tint|shade)-(\\d+)$'),
      toNew: function (m) { return 'border-color-' + m[1] + '-' + m[2] + '-' + m[3]; },
      neu: new RegExp('^border-color-(' + COLORS + ')-(tint|shade)-(\\d+)$'),
      toOld: function (m) { return 'border-' + m[1] + '-' + m[2] + '-' + m[3]; }
    }
  ];

  var EXACT_REV = {};
  for (var k in EXACT) if (Object.prototype.hasOwnProperty.call(EXACT, k)) EXACT_REV[EXACT[k]] = k;

  var compiled = PREFIX.map(function (r) {
    return {
      oldP: r[0], newP: r[1],
      old: new RegExp('^' + r[0].replace(/-/g, '\\-') + '(' + r[2] + ')$'),
      neu: new RegExp('^' + r[1].replace(/-/g, '\\-') + '(' + r[2] + ')$')
    };
  });
  // Reverse lookups must try the longest *grammar* prefix first.
  var compiledRev = compiled.slice().sort(function (a, b) { return b.newP.length - a.newP.length; });

  // Map one utility name (no variant prefix). Returns null when unchanged.
  function utilToNew(u) {
    if (Object.prototype.hasOwnProperty.call(EXACT, u)) return EXACT[u];
    for (var i = 0; i < PATTERN.length; i++) {
      var m = PATTERN[i].old.exec(u);
      if (m) return PATTERN[i].toNew(m);
    }
    for (var j = 0; j < compiled.length; j++) {
      var mm = compiled[j].old.exec(u);
      if (mm) return compiled[j].newP + mm[1];
    }
    return null;
  }

  function utilToOld(u) {
    if (Object.prototype.hasOwnProperty.call(EXACT_REV, u)) return EXACT_REV[u];
    for (var i = 0; i < PATTERN.length; i++) {
      var m = PATTERN[i].neu.exec(u);
      if (m) return PATTERN[i].toOld(m);
    }
    for (var j = 0; j < compiledRev.length; j++) {
      var mm = compiledRev[j].neu.exec(u);
      if (mm) return compiledRev[j].oldP + mm[1];
    }
    return null;
  }

  // Every legacy spelling a grammar name may correspond to (EXACT aliases,
  // value rules and prefix rules). The JIT tries each until one resolves.
  function utilToOldAll(u) {
    var out = [];
    for (var k in EXACT) if (EXACT[k] === u) out.push(k);
    for (var i = 0; i < PATTERN.length; i++) {
      var m = PATTERN[i].neu.exec(u);
      if (m) out.push(PATTERN[i].toOld(m));
    }
    for (var j = 0; j < compiledRev.length; j++) {
      var mm = compiledRev[j].neu.exec(u);
      if (mm) out.push(compiledRev[j].oldP + mm[1]);
    }
    return out;
  }

  function split(cls) {
    var i = cls.lastIndexOf(':');
    return i === -1 ? ['', cls] : [cls.slice(0, i + 1), cls.slice(i + 1)];
  }

  /** Legacy class (variants allowed) → grammar class, or null if unchanged. */
  function toNew(cls) {
    var p = split(cls);
    var n = utilToNew(p[1]);
    return n === null ? null : p[0] + n;
  }

  /** Grammar class (variants allowed) → its legacy spelling, or null. */
  function toOld(cls) {
    var p = split(cls);
    var o = utilToOld(p[1]);
    return o === null ? null : p[0] + o;
  }

  function toOldAll(cls) {
    var p = split(cls);
    return utilToOldAll(p[1]).map(function (o) { return p[0] + o; });
  }

  return { toNew: toNew, toOld: toOld, toOldAll: toOldAll, EXACT: EXACT, PREFIX: PREFIX };
})();
/* @naming:end */

  /**
   * Property groups in cascade-ish reading order. First match wins, so more
   * specific patterns must come before broader ones.
   */
  const GROUPS = [
    /* ── layout / display ── */
    [/^(make-hidden|make-block|make-inline-block|make-inline-flex|make-inline|make-flex|make-grid|make-contents|make-table)$/, 10],
    [/^(container|screen-reader-only|sr-only|not-sr-only)$/, 11],
    [/^(float-|clear-|isolate|isolation-)/, 12],

    /* ── position ── */
    [/^position-/, 20],
    [/^pin-/, 21],
    [/^(inset-|top-|right-|bottom-|left-)/, 22],
    [/^z-/, 23],

    /* ── flex & grid containers ── */
    [/^(flex-row|flex-column|flex-wrap|flex-nowrap)/, 30],
    [/^(grid-cols-|grid-rows-|grid-flow-|auto-cols-|auto-rows-)/, 31],
    [/^(align-|justify-|place-|content-)/, 32],
    [/^gap-/, 33],

    /* ── flex & grid children ── */
    [/^(order-|col-span-|col-start-|col-end-|row-span-|row-start-|row-end-|flex-grow|flex-shrink|flex-1|flex-auto|flex-initial|flex-none|self-)/, 40],

    /* ── spacing ── */
    [/^add-margin-/, 50],
    [/^(space-x-|space-y-|me-|ms-|mx-auto)/, 51],
    [/^add-padding-/, 52],
    [/^(pe-|ps-)/, 53],

    /* ── sizing ── */
    [/^set-(min-|max-)?width-/, 60],
    [/^set-(min-|max-)?height-/, 61],
    [/^(set-size-|w-|h-|aspect-)/, 62],

    /* ── typography ── */
    [/^set-text-/, 70],
    [/^(set-font-weight-|text-bold|text-semibold|text-medium|text-light|text-thin|text-normal|text-extrabold|text-black)/, 71],
    [/^(font-|text-fluid-)/, 72],
    [/^(text-left|text-center|text-right|text-justify|text-start|text-end)$/, 73],
    [/^(line-height-|letter-space-|text-clamp-|text-truncate|text-nowrap|text-wrap|text-balance|text-pretty)/, 74],
    [/^(text-uppercase|text-lowercase|text-capitalize|text-italic|text-underline|text-strikethrough|text-no-decoration)/, 75],

    /* ── colour ── */
    [/^(color-|text-gradient)/, 80],
    [/^(background-|gradient-|from-|via-|to-)/, 81],

    /* ── border ── */
    [/^add-border-/, 90],
    [/^border-(color-|[a-z]+-(tint|shade))/, 91],
    [/^(border-|divide-)/, 92],
    [/^(round-corners-|make-circle|make-pill)/, 93],

    /* ── effects ── */
    [/^add-shadow-/, 100],
    [/^(opacity-|mix-blend-|blur-|brightness-|contrast-|grayscale|saturate-|backdrop-|glass)/, 101],
    [/^(ring-|focus-ring)/, 102],

    /* ── motion ── */
    [/^transition-/, 110],
    [/^(duration-|delay-|ease-)/, 111],
    [/^(scale-|rotate-|translate-|skew-|transform)/, 112],
    [/^animate-/, 113],

    /* ── interaction ── */
    [/^cursor-/, 120],
    [/^(pointer-events-|user-select-|touch-|overscroll-|resize-|appearance-)/, 121],
    [/^(overflow-|scroll-|snap-)/, 122],
    [/^(object-fit-|object-position-)/, 123],
  ];

  /** Variant priority — lower sorts earlier. Unknown variants sort last. */
  const VARIANT_ORDER = {
    'on-mobile': 10, 'on-tablet': 11, 'on-desktop': 12,
    'max-sm': 20, 'max-md': 21, 'max-lg': 22, 'max-xl': 23, 'max-xxl': 24,
    sm: 30, md: 31, lg: 32, xl: 33, xxl: 34, 'on-wide': 35,
    'on-hover': 40, 'on-focus': 41, 'on-focus-visible': 42, 'on-focus-within': 43,
    'on-active': 44, 'on-visited': 45, 'on-disabled': 46, 'on-checked': 47,
    'group-hover': 50, 'group-focus': 51, 'peer-hover': 52, 'peer-checked': 53,
    'has-checked': 60, 'has-focus': 61, 'has-hover': 62, 'has-invalid': 63,
    rtl: 70, ltr: 71,
    'motion-safe': 80, 'motion-reduce': 81,
    dark: 90,
    print: 100,
  };

  const groupCache = Object.create(null);

  function groupOf(name) {
    if (name in groupCache) return groupCache[name];
    var base = SantyNaming.toOld(name) || name;
    let rank = null;
    for (const [pattern, weight] of GROUPS) {
      if (pattern.test(base)) { rank = weight; break; }
    }
    groupCache[name] = rank;
    return rank;
  }

  /** Split `md:on-hover:scale-110`, tracking bracket depth for arbitrary values. */
  function splitVariants(cls) {
    let depth = 0;
    const parts = [];
    let start = 0;
    for (let i = 0; i < cls.length; i++) {
      const c = cls[i];
      if (c === '[') depth++;
      else if (c === ']') depth--;
      else if (c === ':' && depth === 0) { parts.push(cls.slice(start, i)); start = i + 1; }
    }
    return { variants: parts, base: cls.slice(start) };
  }

  function variantRank(variants) {
    if (!variants.length) return -1;
    // Rank by the least-specific variant, so `md:on-hover:x` sits with `md:`.
    let best = Infinity;
    for (const v of variants) {
      const r = VARIANT_ORDER[v];
      best = Math.min(best, r === undefined ? 999 : r);
    }
    return best;
  }

  /**
   * Sort a class string into canonical order.
   * Whitespace is normalised to single spaces; template placeholders such as
   * `${…}` and `{{…}}` are left in place, in their original relative position.
   */
  function sortClasses(input) {
    if (typeof input !== 'string' || !input.trim()) return input;

    const classes = input.split(/\s+/).filter(Boolean);
    const decorated = classes.map((cls, i) => {
      // Never reorder around a dynamic expression — it may concatenate.
      const dynamic = /[${}(]/.test(cls);
      const { variants, base } = splitVariants(cls);
      const group = dynamic ? null : groupOf(base);
      return {
        cls, i, dynamic,
        vRank: variants.length ? variantRank(variants) : -1,
        vCount: variants.length,
        group,
      };
    });

    if (decorated.some(d => d.dynamic)) return classes.join(' ');

    decorated.sort((a, b) => {
      // 1. Unrecognised classes first, original order preserved.
      const aUnknown = a.group === null, bUnknown = b.group === null;
      if (aUnknown !== bUnknown) return aUnknown ? -1 : 1;
      if (aUnknown && bUnknown) return a.i - b.i;

      // 2. Base utilities before any variant.
      if (a.vRank !== b.vRank) return a.vRank - b.vRank;

      // 3. Fewer variants first (md: before md:on-hover:).
      if (a.vCount !== b.vCount) return a.vCount - b.vCount;

      // 4. Property group.
      if (a.group !== b.group) return a.group - b.group;

      // 5. Stable: keep the author's order within a group.
      return a.i - b.i;
    });

    return decorated.map(d => d.cls).join(' ');
  }

  /** True when sorting would change the string — useful for lint rules. */
  function isSorted(input) {
    return sortClasses(input) === String(input).trim().replace(/\s+/g, ' ');
  }

  return { sortClasses, isSorted, splitVariants, groupOf, GROUPS, VARIANT_ORDER };
}));
