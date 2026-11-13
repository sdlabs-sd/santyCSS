/*! @santycss/merge — conflict-aware class merging | MIT
 *
 * The problem this solves: in any component library you end up composing class
 * strings, and the loser is decided by CSS source order, not by argument order.
 *
 *   <Card class="add-padding-24" />  +  user passes "add-padding-8"
 *   → "add-padding-24 add-padding-8" → whichever the stylesheet defines last wins
 *
 * cn() drops the earlier class whenever a later one targets the same property,
 * so the last argument always wins — which is what callers expect.
 *
 *   cn('add-padding-24', 'add-padding-8')            → 'add-padding-8'
 *   cn('background-blue-500', 'background-red-500')  → 'background-red-500'
 *   cn('add-padding-24', 'add-padding-x-8')          → 'add-padding-24 add-padding-x-8'
 *   cn('md:add-padding-24', 'add-padding-8')         → 'md:add-padding-24 add-padding-8'
 *
 * Variants are scoped: `md:add-padding-4` never conflicts with `add-padding-8`,
 * because they apply at different breakpoints.
 *
 *   const { cn } = require('@santycss/merge');
 *   import { cn } from 'santycss/merge';
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.santyMerge = factory();
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
    ['layer-', 'z-index-', '(?:' + N + '|auto)'],
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
   * Conflict groups, most specific pattern first — the first match wins, so
   * `add-padding-top-8` must be tested before `add-padding-8`.
   *
   * Two classes conflict when they resolve to the same group key AND carry the
   * same variant prefix. Sub-axis classes (padding-x vs padding-top) get their
   * own keys, because they genuinely set different properties.
   */
  var GROUPS = [
    /* ── spacing: side-specific before axis before all-sides ── */
    [/^add-padding-(top|bottom|left|right|start|end|block|inline)-/, 'p-$1'],
    [/^add-padding-(x|y)-/, 'p-$1'],
    [/^add-padding-\d/, 'p'],
    [/^add-margin-(top|bottom|left|right|start|end|block|inline)-/, 'm-$1'],
    [/^add-margin-(x|y)-/, 'm-$1'],
    [/^add-margin-(\d|auto)/, 'm'],

    /* ── sizing ── */
    [/^set-min-width-/, 'min-w'],
    [/^set-max-width-/, 'max-w'],
    [/^set-min-height-/, 'min-h'],
    [/^set-max-height-/, 'max-h'],
    [/^set-width-/, 'w'],
    [/^set-height-/, 'h'],
    [/^set-size-/, 'size'],
    [/^set-text-/, 'text-size'],
    [/^set-font-weight-/, 'font-weight'],

    /* ── color ── */
    [/^background-/, 'bg'],
    [/^border-color-/, 'border-color'],
    [/^color-/, 'color'],
    [/^caret-/, 'caret'],

    /* ── border ── */
    [/^add-border-(top|bottom|left|right|start|end|block|inline)-/, 'border-$1'],
    [/^add-border-\d/, 'border-w'],
    [/^round-corners-/, 'radius'],
    [/^(make-circle|make-pill)$/, 'radius'],

    /* ── effects ── */
    [/^add-shadow-/, 'shadow'],
    [/^opacity-/, 'opacity'],

    /* ── layout ── */
    [/^(make-flex|make-grid|make-block|make-inline-block|make-inline-flex|make-inline|make-hidden|make-contents|make-table)$/, 'display'],
    [/^(flex-row|flex-row-reverse|flex-column|flex-column-reverse)$/, 'flex-dir'],
    [/^(flex-wrap|flex-nowrap|flex-wrap-reverse)$/, 'flex-wrap'],
    [/^align-/, 'align-items'],
    [/^justify-/, 'justify'],
    [/^grid-cols-/, 'grid-cols'],
    [/^grid-rows-/, 'grid-rows'],
    [/^gap-(x|y)-/, 'gap-$1'],
    [/^gap-\d/, 'gap'],
    [/^position-/, 'position'],
    [/^pin-(top|bottom|left|right)-/, 'pin-$1'],
    [/^z-/, 'z'],
    [/^overflow-(x|y)-/, 'overflow-$1'],
    [/^overflow-/, 'overflow'],

    /* ── typography ── */
    [/^(text-left|text-center|text-right|text-justify|text-start|text-end)$/, 'text-align'],
    [/^(text-bold|text-semibold|text-medium|text-light|text-thin|text-normal|text-extrabold|text-black)$/, 'font-weight'],
    [/^(text-uppercase|text-lowercase|text-capitalize|text-normal-case)$/, 'text-transform'],
    [/^line-height-/, 'leading'],
    [/^letter-space-/, 'tracking'],
    [/^text-clamp-/, 'line-clamp'],

    /* ── misc ── */
    [/^cursor-/, 'cursor'],
    [/^object-fit-/, 'object-fit'],
    [/^object-position-/, 'object-position'],
    [/^aspect-/, 'aspect'],
    [/^(scale-|rotate-|translate-x-|translate-y-)/, null], // transforms compose — never drop
    [/^pointer-events-/, 'pointer-events'],
    [/^user-select-/, 'user-select'],
  ];

  var groupCache = Object.create(null);

  /**
   * Resolve a bare class (no variant prefix) to its conflict group key,
   * or null when the class composes rather than conflicts.
   */
  function groupOf(name) {
    if (name in groupCache) return groupCache[name];
    var base = SantyNaming.toOld(name) || name;
    var key = null;
    for (var i = 0; i < GROUPS.length; i++) {
      var m = GROUPS[i][0].exec(base);
      if (m) {
        var target = GROUPS[i][1];
        // A null target marks a composing family (transforms), never dropped.
        key = target === null ? null
            : target.replace(/\$(\d)/g, function (_, n) { return m[Number(n)]; });
        break;
      }
    }
    groupCache[name] = key;
    return key;
  }

  /**
   * Split `md:on-hover:add-padding-8` into its variant prefix and base class.
   * Arbitrary values can contain colons inside brackets, so bracket depth is
   * tracked rather than splitting on every colon.
   */
  function splitVariants(cls) {
    var depth = 0, lastColon = -1;
    for (var i = 0; i < cls.length; i++) {
      var c = cls.charAt(i);
      if (c === '[') depth++;
      else if (c === ']') depth--;
      else if (c === ':' && depth === 0) lastColon = i;
    }
    return lastColon === -1
      ? { variants: '', base: cls }
      : { variants: cls.slice(0, lastColon), base: cls.slice(lastColon + 1) };
  }

  /** Flatten the clsx-style argument forms into a flat class string. */
  function toClassString(args) {
    var out = [];
    for (var i = 0; i < args.length; i++) {
      var a = args[i];
      if (!a) continue;
      var t = typeof a;
      if (t === 'string' || t === 'number') {
        out.push(String(a));
      } else if (Array.isArray(a)) {
        var inner = toClassString(a);
        if (inner) out.push(inner);
      } else if (t === 'object') {
        for (var k in a) {
          if (Object.prototype.hasOwnProperty.call(a, k) && a[k]) out.push(k);
        }
      }
    }
    return out.join(' ');
  }

  /**
   * Merge class names, dropping earlier classes that a later class overrides.
   * Accepts the same argument shapes as clsx: strings, arrays, and
   * `{ 'class-name': condition }` objects.
   */
  function cn() {
    var classes = toClassString(Array.prototype.slice.call(arguments))
      .split(/\s+/)
      .filter(Boolean);
    if (classes.length < 2) return classes.join(' ');

    var seen = Object.create(null);
    var keep = new Array(classes.length);

    // Walk backwards so the last occurrence of a group is the one retained.
    for (var i = classes.length - 1; i >= 0; i--) {
      var cls = classes[i];
      var parts = splitVariants(cls);
      var group = groupOf(parts.base);

      if (group === null) {
        // Not a known conflict group — dedupe exact repeats only.
        var exact = 'x:' + cls;
        if (seen[exact]) { keep[i] = false; continue; }
        seen[exact] = true;
        keep[i] = true;
        continue;
      }

      var id = parts.variants + '|' + group;
      if (seen[id]) { keep[i] = false; continue; }
      seen[id] = true;
      keep[i] = true;
    }

    var out = [];
    for (var j = 0; j < classes.length; j++) if (keep[j]) out.push(classes[j]);
    return out.join(' ');
  }

  /**
   * Build a cn() that also understands your own conflict groups.
   *
   *   const cn = extend([[/^brand-tone-/, 'brand-tone']]);
   */
  function extend(extraGroups) {
    var merged = (extraGroups || []).concat(GROUPS);
    return function () {
      var saved = GROUPS;
      var savedCache = groupCache;
      GROUPS = merged;
      groupCache = Object.create(null);
      try {
        return cn.apply(null, arguments);
      } finally {
        GROUPS = saved;
        groupCache = savedCache;
      }
    };
  }

  cn.cn = cn;
  cn.clsx = function () { return toClassString(Array.prototype.slice.call(arguments)); };
  cn.groupOf = groupOf;
  cn.splitVariants = splitVariants;
  cn.extend = extend;
  cn.default = cn;

  return cn;
}));
