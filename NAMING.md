# SantyCSS naming grammar

**Decision (v2.10):** every utility reads **`property-[modifier]-value`**. There are no verbs, properties are whole words, numbers are literal, and a value always comes last.

```html
<!-- before -->
<div class="make-flex align-center gap-16 add-padding-24 round-corners-12 add-shadow-md">
<!-- after -->
<div class="display-flex align-center gap-16 padding-24 radius-12 shadow-md">
```

The old names still work. They are deprecated aliases with byte-identical CSS, and they stay until v3. To move a project over, run `npx santycss migrate` (see [Migrating](#migrating)).

---

## The candidates

The four grammars were scored on the same 17 everyday utilities (display, padding, side padding, auto margin, gap, width, font size, font weight, radius, shadow, align, justify, background, z-index, negative margin, line height, grid columns).

| | A. Verb-first everywhere | B. Strict CSS property | **C. Plain property-value** | D. Short property-value |
|---|---|---|---|---|
| Shape | `verb-property-value` | `css-property-value` | `property-[modifier]-value` | `abbr-value` |
| Display | `set-display-flex` | `display-flex` | `display-flex` | `flex` |
| Padding | `add-padding-24` | `padding-24` | `padding-24` | `p-24` |
| Font size | `set-text-size-18` | `font-size-18` | `text-size-18` | `text-18` |
| Radius | `set-radius-12` | `border-radius-12` | `radius-12` | `rounded-12` |
| Shadow | `add-shadow-md` | `box-shadow-md` | `shadow-md` | `shadow-md` |
| Justify | `set-justify-between` | `justify-content-space-between` | `justify-between` | `justify-between` |
| Background | `set-background-blue-500` | `background-color-blue-500` | `background-blue-500` | `bg-blue-500` |
| Negative margin | `subtract-margin-top-8` | `margin-top-minus-8` | `margin-top-minus-8` | `-mt-8` |
| Avg. length (17 classes) | 16.4 chars | 15.5 chars | **12.5 chars** | 7.9 chars |

For reference, the v2.9 names average 13.7 characters on the same set.

### Scores (1 = poor, 5 = best)

| Criterion | A. Verb-first | B. Strict CSS | **C. Plain property-value** | D. Short |
|---|:-:|:-:|:-:|:-:|
| **Consistency.** One shape, no judgement calls | 3. One shape, but every class needs a verb and the choice is arbitrary (is it `set-gap` or `add-gap`?) | 5. Mechanical: it's the CSS property name | 4. Mechanical, with one small vocabulary table of short words (`text`, `radius`, `shadow`) | 2. Each abbreviation has to be learned on its own (`p`, `pt`, `mx`, `leading`) |
| **Beginner readability** | 4. Reads like an instruction, but the verb adds no information | 3. Clear if you know CSS, and long (`justify-content-space-between`) | 5. Plain words, short, no CSS jargon needed | 2. Needs a cheat sheet |
| **Typing length** | 2 (16.4) | 2 (15.5) | 4 (12.5, shorter than today) | 5 (7.9) |
| **AI tools generate it correctly** | 2. Models guess the verb and get it wrong (`set-padding`, `add-gap`) | 5. Models already know every CSS property | 4. Close to CSS. The few short words are listed in the vocabulary below and in `santycss.context.md` | 2. Two-letter codes are guesswork: is `p-24` 24px, or a step on some scale? |
| **Distinct identity.** Reads as SantyCSS, not as another framework's dialect | 5 | 4 | 4. Whole words and literal pixels: `padding-24` is exactly 24px | 1. Short codes look like every other utility framework |
| **Migration effort from v2.9** | 2. About 3,000 renames, because every noun-led class gains a verb | 2. About 2,300 renames (all of C's, plus every `background-{color}`, `justify-*` and `align-*`) | 4. **1,632 renames** (32% of base classes). The other 68% already fit | 1. About 4,100 renames, nearly everything |
| **Total** | **18** | **21** | **25** | **13** |

**C wins.** It is the only option that scores at least 4 everywhere. It keeps the strongest thing about SantyCSS, readable class names with literal pixel values, and removes the inconsistency people objected to. Over two thirds of today's classes (`gap-16`, `color-gray-900`, `justify-between`, `opacity-50`, `cursor-pointer`) already follow it, so the change is the smallest of the four. B came second. It is more mechanical, but the long property names (`justify-content-space-between`, `background-color-blue-500`) cost more in reading and typing than they gain.

---

## The rules

1. **Property first, then modifier, then value. No verbs.**
   `padding-top-24`, `border-left-2`, `background-blue-500`, `grid-column-span-2`. Variants (state and screen size) go in front with a colon: `on-hover:shadow-lg`, `md:display-flex`.
2. **Properties are whole words.** Use the CSS property name, or the short word from the vocabulary table below. No single letters or abbreviations (`p-`, `w-`, `bg-`, `z-`).
3. **Numbers are literal and whole.** Lengths are pixels: `gap-16` is 16px. Unitless ratios are percentages: `opacity-50` = 0.5, `scale-105` = 1.05, `line-height-150` = 1.5. A negative is written `minus-N`, a fraction `N-of-M` and an aspect ratio `N-by-M`.
4. **A word means one thing.** Named sizes use one scale: `xs sm md lg xl 2xl`. Leave out the modifier only when the value can mean just one thing (`text-bold`, `text-center`, `text-uppercase`). Keep it for numbers and anything ambiguous (`text-size-18`, `text-weight-600`, `text-weight-black`).
5. **Components are nouns, and their options are suffixes.** Write `button button-primary button-lg` or `card card-outline`: the component, then its variant, then its size. A component's parts use the same pattern: `card-header`, `modal-footer`.

### Vocabulary

When a property's CSS name is long, the grammar uses one fixed short word for it. This is the whole list. Everything else uses the CSS name.

| Word | CSS property | Example |
|---|---|---|
| `display` | display | `display-flex`, `display-none` |
| `text` | font-size / font-weight / text-align / text-transform / text-decoration | `text-size-18`, `text-weight-600`, `text-center` |
| `font` | font-family and font features | `font-mono`, `font-tabular-nums` |
| `radius` | border-radius | `radius-12`, `radius-top-8`, `radius-pill` |
| `shadow` | box-shadow | `shadow-md`, `shadow-none` |
| `background` | background-color / -size / -position | `background-blue-500`, `background-cover` |
| `color` | color | `color-gray-900` |
| `border` | border width (`border-color-*` for color) | `border-2`, `border-color-gray-200` |
| `align` / `justify` | align-items / justify-content | `align-center`, `justify-between` |
| `align-self` / `align-content` | align-self / align-content | `align-self-end`, `align-content-between` |
| `flex` | flex-direction / flex-wrap / flex | `flex-column`, `flex-wrap`, `flex-equal` |
| `grid-columns` / `grid-rows` | grid-template-* | `grid-columns-3` |
| `grid-column-span` / `grid-row-span` | grid-column / grid-row | `grid-column-span-2` |
| `top` `bottom` `left` `right` `inset` | offsets | `top-0`, `inset-16`, `inset-center` |
| `aspect` | aspect-ratio | `aspect-16-by-9`, `aspect-square` |
| `animation` | animation | `animation-fade-in`, `animation-delay-100` |

Modifiers are sides and axes (`top`, `bottom`, `left`, `right`, `x`, `y`, `start`, `end`, `block`, `inline`) or a sub-property (`size`, `weight`, `span`, `color`).

---

## 15 before/after examples

| # | Before (v2.9) | After (v2.10) | Rule |
|---|---|---|---|
| 1 | `make-flex` | `display-flex` | 1. No verb, property first |
| 2 | `make-hidden` | `display-none` | 1 (and the CSS value is the clearer word) |
| 3 | `add-padding-24` | `padding-24` | 1 |
| 4 | `md:add-padding-x-32` | `md:padding-x-32` | 1. The variant prefix is untouched |
| 5 | `subtract-margin-top-16` | `margin-top-minus-16` | 3. Negative is `minus-N` in the value slot |
| 6 | `set-width-1-of-3` | `width-1-of-3` | 1 and 3 |
| 7 | `set-text-18` | `text-size-18` | 4. A number keeps its modifier |
| 8 | `set-font-weight-600` | `text-weight-600` | 2 and 4. Font size and weight both live under `text` |
| 9 | `round-corners-12` | `radius-12` | 1 and 2 |
| 10 | `make-pill` | `radius-pill` | 1 |
| 11 | `add-shadow-lg` | `shadow-lg` | 1 |
| 12 | `pin-top-0` | `top-0` | 1 |
| 13 | `z-10` / `layer-10` | `z-index-10` | 2. No abbreviation; two duplicates become one name |
| 14 | `line-height-1-5` | `line-height-150` | 3. Whole numbers, so ratios are percentages |
| 15 | `aspect-ratio-16-9` / `ratio-21-9` | `aspect-16-by-9` / `aspect-21-by-9` | 3. Three spellings become one |

More examples: `span-col-2` → `grid-column-span-2`, `self-center` → `align-self-center`, `fit-cover` → `object-fit-cover`, `h-dvh` → `height-dvh`, `animate-fade-in` → `animation-fade-in`, `border-blue-tint-20` → `border-color-blue-tint-20`, `make-button style-primary size-large` → `button button-primary button-lg`.

The full list of 1,632 renames is in [`dist/santy-renames.json`](dist/santy-renames.json), and also in `santy-classmap.json` under `deprecated`.

---

## Scope

**Renamed:** every utility family that broke a rule. That covers the `add-` / `set-` / `make-` / `pin-` / `round-` / `subtract-` / `use-` / `animate-` prefixes, the abbreviations (`z-`, `h-`, `bg-`, `ps-`, `pe-`), the duplicates (`fit-`, `ratio-`, `layer-`, `truncate`, `center-margin`) and the number formats.

**Unchanged, because they already fit:** `gap-*`, `color-*`, `background-{color}`, `border-color-*`, `justify-*`, `align-*`, `opacity-*`, `cursor-*`, `overflow-*`, `position-*`, `flex-*`, `rotate-*`, `scale-*`, `transition-*`, `text-bold` / `text-center` / …, and component part names (`card-header`, `toast-success`).

**Deliberate exceptions:**
- **Bootstrap grid** (`row`, `col-md-6`, `g-3`, `offset-2`). This module exists so Bootstrap markup works unchanged, so renaming it would defeat its purpose.
- **Classic component starters** (`make-button style-primary size-large`). They are deprecated in favour of the new component layer. `migrate --components` moves them over. That is opt-in because the new components look different.
- **`make-table`**. It is both a display utility and the table component, and the two can't be separated without changing CSS output. This waits for v3.
- **`set-size-full`** becomes `size-fill`, because `size-full` is still used as a classic component modifier until v3.

## Migrating

```bash
npx santycss migrate src/ --dry-run --diff   # preview every rename
npx santycss migrate src/                    # rewrite in place
npx santycss migrate src/ --check            # CI: fail if old names remain
npx santycss migrate src/ --components       # also move classic components
```

The migrator reads HTML, JSX, TSX and Vue (add more with `--ext=.svelte,.astro`). It rewrites `class` and `className` attributes, string literals inside `className={…}` and `:class="…"`, `cn()` / `clsx()` / `classList.*()` calls, and `el.className = …`. Class names built at runtime (`add-padding-${n}`) are listed for you to fix by hand.

Smaller CSS: set `"legacyNames": false` in `santy.config.json` and run `npx santycss build`. The build then emits only the grammar names, with no aliases.

## How it's built

There is one table, [`lib/naming.js`](lib/naming.js), and four consumers:
- `build.js` adds a grammar-name twin to every selector that uses an old name (`.padding-24, .add-padding-24 { … }`). Declarations are never touched. A new name that already exists with different CSS is a collision: the build skips it and reports it.
- `santy-jit.js` resolves grammar names through the same table.
- `santy-merge` and `santy-sort` treat `padding-8` and `add-padding-8` as the same group.
- `scripts/migrate.js` rewrites source files.
