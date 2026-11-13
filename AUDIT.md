# SantyCSS naming audit (v2.9.6)

This audit asks one question: **can someone who knows a few SantyCSS classes predict the rest?** The Reddit feedback said no, and it was right. The audit covers the source as of v2.9.6, before the v2.10 renames. The full inventory is at the end.

## Summary

- **5,130 base classes** (around 22,600 with variants). About **1,415 of them (28%) start with a verb**: `add-` (654), `set-` (205), `animate-` (179), `pin-` (154), `round-` (107), `subtract-` (62), `make-` (47), `use-` (5). The other 72% start with a property noun (`gap-16`, `color-gray-900`, `justify-between`). That is the "`make-flex` but `gap-16`" complaint, and it holds in every category.
- **The same CSS property often has two or three names.** `fit-cover` = `object-fit-cover`. `ratio-video` = `aspect-video` = `aspect-ratio-16-9`. `h-dvh` = `set-height-dvh`. `ps-16` = `add-padding-start-16`. `truncate` = `text-truncate`. `no-shadow` = `add-shadow-none`. `center-margin` = `add-margin-x-auto`. z-index has two full sets, `z-*` and `layer-*`, and the JIT only knew `layer-*`.
- **Numbers come in five formats.** Pixels (`add-padding-24`), hyphenated decimals (`line-height-1-5`), hyphenated ratios (`aspect-ratio-16-9`), fractions (`set-width-1-of-3`, but also `set-width-half`), and three ways to write a negative (`subtract-margin-16`, `rotate-minus-45`, `z-minus-1`). `line-height-1-5` and `aspect-4-3` look the same but mean different things.
- **Named sizes use two scales.** Utilities use `sm / md / lg / xl`. Classic components use `size-tiny / size-small / size-large`. Speeds have their own words again (`transition-fast` and `animation-speed-glacial`).
- **There are three button systems, and two of most other components.** `btn btn-primary btn-lg` (Bootstrap style), `make-button style-primary size-large` (classic starter), and the `field-*` family for inputs, which sits next to `input` and `make-input`. `.card` and `make-card` both exist and look different. `make-table` is both a display utility (`display: table`) and the table component.
- **Word order varies.** Usually the property comes first (`border-color-red-500`), but not always: the tint and shade colors drop the property word (`border-red-tint-20`), `span-col-2` puts the value first, `self-center` and `content-between` leave out "align", and `content-none` (the `content` property) shares a prefix with `content-between` (`align-content`).
- **Tooling bugs found along the way.** `santy-classmap.json` scanned raw CSS text, so it listed `forEach`, `getElementById`, `querySelectorAll`, `w3`, `org` and nine other non-classes that came from comments and URLs. The JIT had no `z-*` support at all.

None of this is broken CSS. It is the cost of growing one family at a time. Each family made sense on its own, but nothing held them to a common shape.

## Naming patterns in use

| # | Pattern | Example | Approx. classes | Notes |
|---|---|---|---:|---|
| 1 | `verb-property-value` | `add-padding-24`, `set-width-320`, `round-corners-12` | 1,050 | spacing, sizing, borders, radius |
| 2 | `verb-value` (display) | `make-flex`, `make-hidden`, `make-pill` | 47 | `make-` also starts components |
| 3 | `verb-side-value` (position) | `pin-top-0`, `pin-all-16`, `pin-center` | 154 | `pin-input` is a component |
| 4 | `verb-property-…` (negative) | `subtract-margin-top-16` | 62 | the only way to write a negative margin |
| 5 | `verb-name` (animation) | `animate-fade-in` | 179 | next to `animation-delay-100` |
| 6 | `property-value` | `gap-16`, `opacity-50`, `cursor-pointer` | 1,800 | the majority shape |
| 7 | `property-modifier-value` | `border-color-red-500`, `gap-x-8`, `overflow-x-auto` | 900 | |
| 8 | Abbreviation | `z-10`, `h-dvh`, `ps-16`, `bg-cover`, `g-3` | 120 | Tailwind or Bootstrap leftovers |
| 9 | Abbreviated property | `self-center`, `content-between`, `fit-cover` | 25 | the property word is missing |
| 10 | `component` / `component-part` / `component-variant` | `toast-success`, `card-header`, `btn-lg` | 640 | already noun-first |
| 11 | Component + generic modifiers | `make-button style-primary size-large shape-pill` | 50 | modifiers only work as compound selectors |
| 12 | Bootstrap grid | `row`, `col-md-6`, `offset-2`, `g-3` | 315 | kept on purpose for drop-in compatibility |
| 13 | JS state hooks | `active`, `show`, `open`, `is-visible` | 19 | set by `santy.js` |

## Inconsistencies, by type

### 1. Verbs on some families, not others
| Verb-led | Noun-led neighbour doing the same kind of job |
|---|---|
| `make-flex` | `flex-column`, `grid-cols-3`, `gap-16` |
| `add-padding-24` | `space-x-16`, `gap-16` |
| `set-width-320` | `max-width-640`, `min-height-full` |
| `round-corners-12` | `border-color-gray-200`, `ring-2` |
| `add-shadow-md` | `elevation-2`, `text-shadow-sm`, `blur-md` |
| `pin-top-0` | `position-absolute`, `start-0`, `inset-block-8` |
| `animate-fade-in` | `animation-delay-100`, `animation-ease-in` |
| `use-custom-color` | `color-primary` |

### 2. Duplicates (same CSS, different names)
| CSS | Names |
|---|---|
| `object-fit: cover` | `fit-cover`, `object-fit-cover` |
| `object-position: center` | `object-center`, `object-position-center` |
| `aspect-ratio: 16/9` | `aspect-video`, `ratio-video`, `aspect-ratio-16-9` |
| `aspect-ratio: 4/3` | `aspect-4-3`, `ratio-4-3`, `aspect-ratio-4-3` |
| `height: 100dvh` | `h-dvh`, `set-height-dvh` |
| `height: 48px` | `h-sm`, `set-height-48` |
| `padding-inline-start: 16px` | `ps-16`, `add-padding-start-16` |
| `margin-inline: auto` | `center-margin`, `add-margin-x-auto` |
| `box-shadow: none` | `no-shadow`, `add-shadow-none` |
| text truncation | `truncate`, `text-truncate` |
| `width: 50%` | `set-width-1-of-2`, `set-width-2-of-4`, `set-width-3-of-6`, `set-width-6-of-12` |
| `z-index: 10` | `z-10`, `layer-10` (the JIT only knew `layer-*`) |
| `word-break: break-all` | `text-break-all`, `word-break-all` |

### 3. Number formats
| Format | Example | Problem |
|---|---|---|
| px integer | `add-padding-24`, `set-text-16` | fine, and the strongest difference from Tailwind (`p-24` there is 96px) |
| hyphen decimal | `line-height-1-5` (= 1.5) | reads like a range or a ratio |
| hyphen ratio | `aspect-ratio-16-9`, `aspect-4-3` | looks the same as a hyphen decimal |
| fraction | `set-width-1-of-3` | fine, but `set-width-half` / `third` / `quarter` also exist, and `half` is `calc(50% - 8px)`, not 50% |
| percent | `opacity-50`, `scale-105` | fine |
| negative | `subtract-margin-16`, `rotate-minus-45`, `z-minus-1`, `subtract-letter-space-1` | three spellings |
| named | `line-height-snug` = `line-height-1-375` | two names per value |

### 4. Named-size scales
- Utilities: `xs sm md lg xl 2xl` (`add-shadow-*`, `blur-*`, `h-*`, `text-fluid-*`).
- Classic components: `size-tiny size-small size-large size-xl size-full`.
- Bootstrap-style components: `btn-sm btn-lg btn-xl`, `modal-sm modal-lg modal-xl`.
- Speeds: `transition-fast/normal/slow` and `animation-speed-ultra-fast … glacial` (seven words).

### 5. Component systems that overlap
| Job | Systems in the source |
|---|---|
| Button | `btn btn-primary`, `make-button style-primary size-large shape-pill` |
| Card | `card card-raised`, `make-card style-elevated` |
| Input | `input input-lg`, `make-input`, `field field-input field-outlined` |
| Alert | `alert alert-success`, `make-alert style-success` |
| Badge | `badge badge-blue`, `make-badge style-success` |
| Modal | `modal-box modal-overlay` (no bare `.modal`), `make-modal` |
| Table | `table table-striped`, `make-table` (also a display utility), `data-table` |

The `style-*`, `size-*` and `shape-*` modifiers only exist as compound selectors (`.make-button.style-primary`), so `style-primary` on its own does nothing. That is a trap for people and for AI tools.

### 6. Word order and missing words
- `span-col-2` (value before property), next to `grid-cols-2`.
- `border-blue-tint-20` (no `color`), next to `border-color-blue-500`.
- `self-center` and `content-between` (no `align`), next to `align-center`. Meanwhile `content-none` is the `content` property.
- `text-black-weight` (weight word at the end) next to `text-bold` and `set-font-weight-900`.
- `text-primary` is the theme's *text* color, while `color-primary` is the *brand* color.

### 7. Look and feel
The default palette, radii and shadows match Tailwind's defaults value for value (`#3b82f6`, `0 10px 15px -3px rgba(0,0,0,.1)`, …). The second piece of Reddit feedback was "it has no look of its own", and that is correct too. Part 4 of the v2.10 work (THEME.md) covers it.

## What v2.10 does about it

- One grammar for every utility: `property-[modifier]-value`, no verbs (see [NAMING.md](NAMING.md)).
- 1,615 legacy names get a grammar name. The old names stay as deprecated aliases with byte-identical CSS (`dist/santy-renames.json`, `santy-classmap.json → deprecated`).
- Duplicates collapse onto one grammar name each. The other spellings keep working.
- `scripts/migrate.js` rewrites the old names in HTML, JSX, TSX and Vue.
- A new component layer (`santy-ui.css`) uses `component component-variant component-size` throughout, on its own theme.
- The classmap scans selectors only (the junk entries are gone). The JIT gained `z-index-*`.

**Kept on purpose:**
- The Bootstrap grid (`row`, `col-md-6`, `g-3`), because drop-in Bootstrap compatibility is the point of that module.
- Component part names (`card-header`, `toast-success`), because they already follow `component-part`.
- The classic `make-*` component starters with `style-*` / `size-*` / `shape-*`. They are deprecated in favour of the component layer, and `scripts/migrate.js --components` moves them over. That is opt-in, because the new components look different.
- `make-table`, because its name means two things. Renaming the display half would change the component's CSS, so it waits for v3.

## Inventory

<!-- inventory:start -->
Generated by `node scripts/audit.js` from `dist/santy.css` + `dist/santy-themes.css`.
**5,143 base classes** (no variant prefix) in 18 categories. A `→` marks a family renamed in v2.10.

| Category | Families | Classes |
|---|---:|---:|
| Bootstrap-compatible grid | 63 | 315 |
| Display & visibility | 15 | 15 |
| Position & layering | 62 | 212 |
| Flexbox & grid | 94 | 274 |
| Spacing | 47 | 599 |
| Sizing | 97 | 342 |
| Typography | 150 | 380 |
| Color & background | 258 | 1241 |
| Borders, radius & rings | 97 | 511 |
| Effects & filters | 70 | 116 |
| Transforms & transitions | 28 | 45 |
| Animation | 216 | 252 |
| Interaction & scrolling | 103 | 110 |
| Container queries | 20 | 20 |
| Theme hooks | 6 | 6 |
| Classic component starters (make-* + style/size/shape) | 50 | 50 |
| Components | 617 | 636 |
| State hooks used by santy.js | 19 | 19 |

<details>
<summary><b>Bootstrap-compatible grid</b> — 315 classes in 63 families</summary>

- `col`
- `col-auto`
- `col-lg`
- `col-lg-auto`
- `col-lg-{n}` — 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `col-md`
- `col-md-auto`
- `col-md-{n}` — 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `col-sm`
- `col-sm-auto`
- `col-sm-{n}` — 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `col-xl`
- `col-xl-auto`
- `col-xl-{n}` — 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `col-xxl`
- `col-xxl-auto`
- `col-xxl-{n}` — 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `col-{n}` — 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `container`
- `container-fluid`
- `container-lg`
- `container-md`
- `container-sm`
- `container-xl`
- `container-xxl`
- `g-{n}` — 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- `gx-{n}` — 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- `gy-{n}` — 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- `offset-lg-{n}` — 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
- `offset-md-{n}` — 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
- `offset-sm-{n}` — 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
- `offset-xl-{n}` — 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
- `offset-xxl-{n}` — 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
- `offset-{n}` — 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
- `order-lg-first`
- `order-lg-last`
- `order-lg-{n}` — 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `order-md-first`
- `order-md-last`
- `order-md-{n}` — 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `order-sm-first`
- `order-sm-last`
- `order-sm-{n}` — 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `order-xl-first`
- `order-xl-last`
- `order-xl-{n}` — 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `order-xxl-first`
- `order-xxl-last`
- `order-xxl-{n}` — 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `row`
- `row-cols-auto`
- `row-cols-lg-auto`
- `row-cols-lg-{n}` — 1, 2, 3, 4, 5, 6
- `row-cols-md-auto`
- `row-cols-md-{n}` — 1, 2, 3, 4, 5, 6
- `row-cols-sm-auto`
- `row-cols-sm-{n}` — 1, 2, 3, 4, 5, 6
- `row-cols-xl-auto`
- `row-cols-xl-{n}` — 1, 2, 3, 4, 5, 6
- `row-cols-xxl-auto`
- `row-cols-xxl-{n}` — 1, 2, 3, 4, 5, 6
- `row-cols-{n}` — 1, 2, 3, 4, 5, 6
- `row-nogutter`

</details>

<details>
<summary><b>Display & visibility</b> — 15 classes in 15 families</summary>

- `make-block`  → `display-block`
- `make-contents`  → `display-contents`
- `make-flex`  → `display-flex`
- `make-grid`  → `display-grid`
- `make-hidden`  → `display-none`
- `make-inline`  → `display-inline`
- `make-inline-block`  → `display-inline-block`
- `make-inline-flex`  → `display-inline-flex`
- `make-inline-grid`  → `display-inline-grid`
- `make-invisible`  → `visibility-hidden`
- `make-table`
- `make-visible`  → `visibility-visible`
- `not-sr-only`
- `sr-only`
- `sr-only-focusable`

</details>

<details>
<summary><b>Position & layering</b> — 212 classes in 62 families</summary>

- `end-auto`
- `end-{n}` — 0
- `inset-block-{n}` — 0
- `inset-inline-{n}` — 0
- `isolate`
- `isolation-auto`
- `layer-auto`  → `z-index-auto`
- `layer-base`
- `layer-components`
- `layer-overrides`
- `layer-utilities`
- `layer-{n}`  → `z-index-{n}` — 0, 1, 2, 3, 5, 10, 20, 30, 40, 50, 100, 200, 500, 999, 1000, 9999
- `pin-all-{n}`  → `inset-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192
- `pin-block-end-{n}`  → `inset-block-end-{n}` — 0
- `pin-block-start-{n}`  → `inset-block-start-{n}` — 0
- `pin-bottom`
- `pin-bottom-auto`  → `bottom-auto`
- `pin-bottom-full`  → `bottom-full`
- `pin-bottom-safe`  → `bottom-safe`
- `pin-bottom-{n}`  → `bottom-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192
- `pin-center`  → `inset-center`
- `pin-center-x`  → `inset-center-x`
- `pin-center-y`  → `inset-center-y`
- `pin-digit`
- `pin-inline-end-{n}`  → `inset-inline-end-{n}` — 0
- `pin-inline-start-{n}`  → `inset-inline-start-{n}` — 0
- `pin-input`
- `pin-input-error`
- `pin-input-lg`
- `pin-input-sm`
- `pin-left`
- `pin-left-auto`  → `left-auto`
- `pin-left-full`  → `left-full`
- `pin-left-{n}`  → `left-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192
- `pin-right-auto`  → `right-auto`
- `pin-right-full`  → `right-full`
- `pin-right-{n}`  → `right-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192
- `pin-separator`
- `pin-top-auto`  → `top-auto`
- `pin-top-full`  → `top-full`
- `pin-top-{n}`  → `top-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192
- `position-absolute`
- `position-fixed`
- `position-relative`
- `position-static`
- `position-sticky`
- `start-auto`
- `start-{n}` — 0
- `z-auto`  → `z-index-auto`
- `z-base`  → `z-index-base`
- `z-dropdown`  → `z-index-dropdown`
- `z-minus-{n}`  → `z-index-minus-{n}` — 1, 2, 3, 5, 10
- `z-modal`  → `z-index-modal`
- `z-negative`  → `z-index-negative`
- `z-overlay`  → `z-index-overlay`
- `z-popover`  → `z-index-popover`
- `z-raised`  → `z-index-raised`
- `z-sticky`  → `z-index-sticky`
- `z-toast`  → `z-index-toast`
- `z-tooltip`  → `z-index-tooltip`
- `z-top`  → `z-index-top`
- `z-{n}`  → `z-index-{n}` — 0, 10, 20, 30, 40, 50, 100

</details>

<details>
<summary><b>Flexbox & grid</b> — 274 classes in 94 families</summary>

- `align-baseline`
- `align-center`
- `align-end`
- `align-start`
- `align-stretch`
- `columns-auto`
- `columns-{n}` — 1, 2, 3, 4, 5, 6
- `content-around`  → `align-content-around`
- `content-between`  → `align-content-between`
- `content-center`  → `align-content-center`
- `content-end`  → `align-content-end`
- `content-evenly`  → `align-content-evenly`
- `content-start`  → `align-content-start`
- `content-stretch`  → `align-content-stretch`
- `flex-auto`
- `flex-column`
- `flex-column-reverse`
- `flex-equal`
- `flex-grow`
- `flex-grow-none`
- `flex-initial`
- `flex-none`
- `flex-nowrap`
- `flex-row`
- `flex-row-reverse`
- `flex-shrink`
- `flex-shrink-none`
- `flex-wrap`
- `flex-wrap-reverse`
- `gap-x-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `gap-y-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `gap-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `grid-area-aside`
- `grid-area-footer`
- `grid-area-header`
- `grid-area-main`
- `grid-area-nav`
- `grid-area-sidebar`
- `grid-auto-cols-fr`  → `grid-auto-columns-fr`
- `grid-auto-cols-max`  → `grid-auto-columns-max`
- `grid-auto-cols-min`  → `grid-auto-columns-min`
- `grid-auto-fill-min-{n}` — 120, 150, 200, 240, 280, 320
- `grid-auto-fit-min-{n}` — 120, 150, 200, 240, 280, 320
- `grid-col-dense`
- `grid-cols-none`  → `grid-columns-none`
- `grid-cols-subgrid`  → `grid-columns-subgrid`
- `grid-cols-{n}`  → `grid-columns-{n}` — 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `grid-dense`
- `grid-flow-col`
- `grid-flow-dense`
- `grid-flow-row`
- `grid-row-dense`
- `grid-rows-subgrid`
- `grid-rows-{n}` — 1, 2, 3, 4, 5, 6
- `grid-template-layout-holy-grail`
- `grid-template-layout-sidebar-left`
- `grid-template-layout-sidebar-right`
- `justify-around`
- `justify-between`
- `justify-center`
- `justify-end`
- `justify-evenly`
- `justify-items-center`
- `justify-items-end`
- `justify-items-start`
- `justify-items-stretch`
- `justify-self-auto`
- `justify-self-center`
- `justify-self-end`
- `justify-self-start`
- `justify-self-stretch`
- `justify-start`
- `masonry-cols-{n}` — 2, 3, 4
- `masonry-item`
- `order-first`
- `order-last`
- `order-none`
- `order-{n}` — 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `place-center`
- `place-stretch`
- `self-auto`  → `align-self-auto`
- `self-baseline`  → `align-self-baseline`
- `self-center`  → `align-self-center`
- `self-end`  → `align-self-end`
- `self-start`  → `align-self-start`
- `self-stretch`  → `align-self-stretch`
- `space-x-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16
- `space-y-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16
- `span-col-full`  → `grid-column-span-full`
- `span-col-subgrid-{n}`  → `grid-column-span-subgrid-{n}` — 2, 3, 4
- `span-col-{n}`  → `grid-column-span-{n}` — 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
- `span-row-full`  → `grid-row-span-full`
- `span-row-subgrid-{n}`  → `grid-row-span-subgrid-{n}` — 2, 3
- `span-row-{n}`  → `grid-row-span-{n}` — 1, 2, 3, 4, 5, 6

</details>

<details>
<summary><b>Spacing</b> — 599 classes in 47 families</summary>

- `add-margin-auto`  → `margin-auto`
- `add-margin-block-auto`  → `margin-block-auto`
- `add-margin-block-{n}`  → `margin-block-{n}` — 4, 8, 16, 24
- `add-margin-bottom-auto`  → `margin-bottom-auto`
- `add-margin-bottom-{n}`  → `margin-bottom-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `add-margin-end-auto`  → `margin-end-auto`
- `add-margin-inline-auto`  → `margin-inline-auto`
- `add-margin-inline-{n}`  → `margin-inline-{n}` — 0, 4, 8, 16, 24
- `add-margin-left-auto`  → `margin-left-auto`
- `add-margin-left-{n}`  → `margin-left-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `add-margin-right-auto`  → `margin-right-auto`
- `add-margin-right-{n}`  → `margin-right-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `add-margin-start-auto`  → `margin-start-auto`
- `add-margin-top-auto`  → `margin-top-auto`
- `add-margin-top-{n}`  → `margin-top-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `add-margin-x-auto`  → `margin-x-auto`
- `add-margin-x-{n}`  → `margin-x-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `add-margin-y-auto`  → `margin-y-auto`
- `add-margin-y-{n}`  → `margin-y-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `add-margin-{n}`  → `margin-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `add-padding-block-{n}`  → `padding-block-{n}` — 4, 8, 12, 16, 20, 24, 32, 48
- `add-padding-bottom-{n}`  → `padding-bottom-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `add-padding-end-{n}`  → `padding-end-{n}` — 0, 4, 8, 12, 16, 20, 24, 32
- `add-padding-inline-{n}`  → `padding-inline-{n}` — 4, 8, 12, 16, 20, 24, 32, 48
- `add-padding-left-{n}`  → `padding-left-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `add-padding-right-{n}`  → `padding-right-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `add-padding-start-{n}`  → `padding-start-{n}` — 0, 4, 8, 12, 16, 20, 24, 32
- `add-padding-top-{n}`  → `padding-top-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `add-padding-x-{n}`  → `padding-x-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `add-padding-y-{n}`  → `padding-y-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `add-padding-{n}`  → `padding-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `center-margin`  → `margin-x-auto`
- `margin-safe-bottom`
- `me-auto`  → `margin-end-auto`
- `ms-auto`  → `margin-start-auto`
- `padding-safe-all`
- `padding-safe-bottom`
- `padding-safe-left`
- `padding-safe-right`
- `padding-safe-top`
- `pe-{n}`  → `padding-end-{n}` — 0, 4, 8, 12, 16, 20, 24, 32
- `ps-{n}`  → `padding-start-{n}` — 0, 4, 8, 12, 16, 20, 24, 32
- `subtract-margin-bottom-{n}`  → `margin-bottom-minus-{n}` — 1, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- `subtract-margin-left-{n}`  → `margin-left-minus-{n}` — 1, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- `subtract-margin-right-{n}`  → `margin-right-minus-{n}` — 1, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- `subtract-margin-top-{n}`  → `margin-top-minus-{n}` — 1, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- `subtract-margin-{n}`  → `margin-minus-{n}` — 1, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

</details>

<details>
<summary><b>Sizing</b> — 342 classes in 97 families</summary>

- `aspect-auto`
- `aspect-cinema`
- `aspect-golden`
- `aspect-portrait`
- `aspect-ratio-{n}`  → `aspect-1-by-1`, `aspect-3-by-2`, `aspect-4-by-3`, `aspect-9-by-16`, … — 1-1, 3-2, 4-3, 9-16, 16-9
- `aspect-square`
- `aspect-video`
- `aspect-{n}`  → `aspect-1-by-2`, `aspect-2-by-1`, `aspect-3-by-2`, `aspect-4-by-3` — 1-2, 2-1, 3-2, 4-3
- `fit-contain`  → `object-fit-contain`
- `fit-cover`  → `object-fit-cover`
- `fit-fill`  → `object-fit-fill`
- `fit-none`  → `object-fit-none`
- `fit-scale`  → `object-fit-scale`
- `h-dvh`  → `height-dvh`
- `h-lg`  → `height-lg`
- `h-md`  → `height-md`
- `h-sm`  → `height-sm`
- `h-svh`  → `height-svh`
- `h-xs`  → `height-xs`
- `h-{n}`  → `height-{n}` — 50dvh, 75dvh
- `max-height-full`
- `max-height-screen`
- `max-height-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512
- `max-width-full`
- `max-width-none`
- `max-width-screen`
- `max-width-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512
- `min-height-full`
- `min-height-screen`
- `min-height-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512
- `min-width-full`
- `min-width-none`
- `min-width-screen`
- `min-width-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512
- `object-bottom`  → `object-position-bottom`
- `object-center`  → `object-position-center`
- `object-fit-contain`
- `object-fit-cover`
- `object-fit-fill`
- `object-fit-none`
- `object-fit-scale`
- `object-left`  → `object-position-left`
- `object-position-bottom`
- `object-position-center`
- `object-position-left`
- `object-position-right`
- `object-position-top`
- `object-right`  → `object-position-right`
- `object-top`  → `object-position-top`
- `ratio-auto`  → `aspect-auto`
- `ratio-portrait`  → `aspect-9-by-16`
- `ratio-square`  → `aspect-square`
- `ratio-video`  → `aspect-video`
- `ratio-{n}`  → `aspect-3-by-2`, `aspect-4-by-3`, `aspect-21-by-9` — 3-2, 4-3, 21-9
- `set-height-auto`  → `height-auto`
- `set-height-calc-dvh-minus-{n}`  → `height-calc-dvh-minus-{n}` — 64, 80
- `set-height-calc-screen-minus-{n}`  → `height-calc-screen-minus-{n}` — 48, 64, 80, 96
- `set-height-dvh`  → `height-dvh`
- `set-height-fit`  → `height-fit`
- `set-height-full`  → `height-full`
- `set-height-logical`  → `height-logical`
- `set-height-lvh`  → `height-lvh`
- `set-height-max`  → `height-max`
- `set-height-min`  → `height-min`
- `set-height-screen`  → `height-screen`
- `set-height-svh`  → `height-svh`
- `set-height-{n}`  → `height-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `set-max-height-dvh`  → `max-height-dvh`
- `set-max-width-narrow`  → `max-width-narrow`
- `set-max-width-prose`  → `max-width-prose`
- `set-max-width-readable`  → `max-width-readable`
- `set-min-height-calc-screen-minus-{n}`  → `min-height-calc-screen-minus-{n}` — 80
- `set-min-height-dvh`  → `min-height-dvh`
- `set-min-height-lvh`  → `min-height-lvh`
- `set-min-height-svh`  → `min-height-svh`
- `set-size-fit`  → `size-fit`
- `set-size-full`  → `size-fill`
- `set-size-max`  → `size-max`
- `set-size-min`  → `size-min`
- `set-size-screen`  → `size-screen`
- `set-size-{n}`  → `size-{n}` — 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96, 120, 160, 200
- `set-width-auto`  → `width-auto`
- `set-width-calc-100-minus-{n}`  → `width-calc-100-minus-{n}` — 16, 24, 32, 48, 64, 80, 256, 320
- `set-width-dvw`  → `width-dvw`
- `set-width-fit`  → `width-fit`
- `set-width-full`  → `width-full`
- `set-width-half`  → `width-half`
- `set-width-logical`  → `width-logical`
- `set-width-lvw`  → `width-lvw`
- `set-width-max`  → `width-max`
- `set-width-min`  → `width-min`
- `set-width-quarter`  → `width-quarter`
- `set-width-screen`  → `width-screen`
- `set-width-svw`  → `width-svw`
- `set-width-third`  → `width-third`
- `set-width-{n}`  → `width-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 768, 1024
- `set-width-{n}-of-{m}`  → `width-{n}-of-{m}` — 1/12, 1/2, 1/3, 1/4, 1/5, 1/6, 2/12, 2/3, 2/4, 2/5, 2/6, 3/12, 3/4, 3/5, 3/6, 4/12, 4/5, 4/6, 5/12, 5/6, 6/12, 7/12, 8/12, 9/12, 10/12, 11/12

</details>

<details>
<summary><b>Typography</b> — 380 classes in 150 families</summary>

- `add-letter-space-{n}`  → `letter-spacing-{n}` — 0, 1, 2, 4, 6, 8, 10, 12, 16
- `break-after-always`
- `break-after-auto`
- `break-after-avoid`
- `break-before-always`
- `break-before-auto`
- `break-before-avoid`
- `break-inside-auto`
- `break-inside-avoid`
- `caret-amber-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-auto`
- `caret-blue-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-cyan-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-gray-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-green-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-indigo-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-lime-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-orange-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-pink-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-purple-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-red-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-rose-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-slate-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-stone-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-teal-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-violet-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-yellow-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-zinc-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `caret-{color}` — blue, green, red, transparent
- `font-condensed`
- `font-expanded`
- `font-feature-liga`
- `font-italic-variable`
- `font-mono`
- `font-ordinal`
- `font-sans`
- `font-serif`
- `font-slashed-zero`
- `font-smoothing`
- `font-tabular-nums`
- `font-variable`
- `letter-space-normal`  → `letter-spacing-normal`
- `letter-space-snug`  → `letter-spacing-snug`
- `letter-space-tight`  → `letter-spacing-tight`
- `letter-space-wide`  → `letter-spacing-wide`
- `letter-space-wider`  → `letter-spacing-wider`
- `letter-space-widest`  → `letter-spacing-widest`
- `line-height-loose`
- `line-height-none`
- `line-height-normal`
- `line-height-relaxed`
- `line-height-snug`
- `line-height-tight`
- `line-height-{n}`  → `line-height-100`, `line-height-125`, `line-height-snug`, `line-height-150`, … — 1, 1-25, 1-375, 1-5, 1-625, 1-75, 2, 2-5, 3
- `list-decimal`
- `list-disc`
- `list-group`
- `list-group-flush`
- `list-group-item`
- `list-group-numbered`
- `list-inside`
- `list-none`
- `list-outside`
- `make-text-horizontal`  → `text-horizontal`
- `make-text-vertical`  → `text-vertical`
- `make-text-vertical-up`  → `text-vertical-up`
- `prose`
- `prose-full`
- `prose-lg`
- `prose-sm`
- `prose-xl`
- `set-font-weight-{n}`  → `text-weight-{n}` — 100, 200, 300, 400, 450, 500, 550, 600, 700, 800, 900
- `set-text-{n}`  → `text-size-{n}` — 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96, 120, 144
- `subtract-letter-space-{n}`  → `letter-spacing-minus-{n}` — 1, 2
- `text-accent`
- `text-balance`
- `text-black-weight`  → `text-weight-black`
- `text-bold`
- `text-break-all`
- `text-break-word`
- `text-capitalize`
- `text-center`
- `text-clamp-{n}` — 1, 2, 3, 4, 5
- `text-clip`
- `text-direction-ltr`
- `text-direction-rtl`
- `text-ellipsis`
- `text-end`
- `text-extra-bold`
- `text-extra-light`
- `text-fluid-2xl`
- `text-fluid-display`
- `text-fluid-hero`
- `text-fluid-lg`
- `text-fluid-md`
- `text-fluid-sm`
- `text-fluid-xl`
- `text-fluid-xs`
- `text-gradient`
- `text-gradient-blue-to-{color}` — green, purple
- `text-gradient-blue-{color}` — purple
- `text-gradient-green-to-{color}` — cyan
- `text-gradient-green-{color}` — teal
- `text-gradient-orange-to-{color}` — red
- `text-gradient-orange-{color}` — red
- `text-gradient-pink-{color}` — rose
- `text-gradient-purple-to-{color}` — pink
- `text-gradient-sky-{color}` — blue
- `text-gradient-yellow-to-{color}` — orange
- `text-hyphen`
- `text-indent-{n}` — 8, 16, 32
- `text-italic`
- `text-justify`
- `text-left`
- `text-light`
- `text-lowercase`
- `text-medium`
- `text-muted`
- `text-no-decoration`
- `text-no-transform`
- `text-normal`
- `text-not-italic`
- `text-nowrap`
- `text-orientation-mixed`
- `text-orientation-sideways`
- `text-orientation-upright`
- `text-overline`
- `text-pre`
- `text-pre-line`
- `text-pre-wrap`
- `text-pretty`
- `text-primary`
- `text-right`
- `text-semibold`
- `text-shadow`
- `text-shadow-lg`
- `text-shadow-none`
- `text-shadow-sm`
- `text-start`
- `text-strikethrough`
- `text-thin`
- `text-truncate`
- `text-underline`
- `text-uppercase`
- `text-wrap`
- `truncate`  → `text-truncate`
- `word-break-all`
- `word-break-keep`
- `word-break-normal`
- `word-break-words`

</details>

<details>
<summary><b>Color & background</b> — 1241 classes in 258 families</summary>

- `background-accent`
- `background-amber-shade-{n}` — 100, 200, 300
- `background-amber-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-amber-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-blue-shade-{n}` — 100, 200, 300
- `background-blue-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-blue-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-blue-{n}/{alpha}` — 500/10, 500/20, 500/30, 500/50, 500/75
- `background-cyan-shade-{n}` — 100, 200, 300
- `background-cyan-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-cyan-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-gray-shade-{n}` — 100, 200, 300
- `background-gray-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-gray-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-green-shade-{n}` — 100, 200, 300
- `background-green-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-green-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-green-{n}/{alpha}` — 500/10, 500/20, 500/30, 500/50
- `background-indigo-shade-{n}` — 100, 200, 300
- `background-indigo-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-indigo-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-lime-shade-{n}` — 100, 200, 300
- `background-lime-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-lime-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-mix-blue-green-{n}` — 50
- `background-mix-blue-red-{n}` — 50
- `background-mix-purple-pink-{n}` — 50
- `background-orange-shade-{n}` — 100, 200, 300
- `background-orange-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-orange-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-pink-shade-{n}` — 100, 200, 300
- `background-pink-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-pink-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-primary`
- `background-purple-shade-{n}` — 100, 200, 300
- `background-purple-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-purple-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-purple-{n}/{alpha}` — 500/10, 500/20, 500/30, 500/50
- `background-red-shade-{n}` — 100, 200, 300
- `background-red-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-red-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-red-{n}/{alpha}` — 500/10, 500/20, 500/30, 500/50
- `background-rose-shade-{n}` — 100, 200, 300
- `background-rose-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-rose-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-secondary`
- `background-slate-shade-{n}` — 100, 200, 300
- `background-slate-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-slate-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-stone-shade-{n}` — 100, 200, 300
- `background-stone-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-stone-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-surface`
- `background-surface-alt`
- `background-surface-raised`
- `background-teal-shade-{n}` — 100, 200, 300
- `background-teal-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-teal-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-violet-shade-{n}` — 100, 200, 300
- `background-violet-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-violet-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-yellow-shade-{n}` — 100, 200, 300
- `background-yellow-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-yellow-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-yellow-{n}/{alpha}` — 500/10, 500/20, 500/50
- `background-zinc-shade-{n}` — 100, 200, 300
- `background-zinc-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `background-zinc-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `background-{color}` — black, current, transparent, white
- `background-{color}/{alpha}` — black/10, black/20, black/30, black/50, black/75, white/10, white/20, white/30, white/50, white/75
- `bg-accent-light`
- `bg-auto`  → `background-auto`
- `bg-bottom`  → `background-bottom`
- `bg-bottom-left`  → `background-bottom-left`
- `bg-bottom-right`  → `background-bottom-right`
- `bg-center`  → `background-center`
- `bg-clip-border`  → `background-clip-border`
- `bg-clip-content`  → `background-clip-content`
- `bg-clip-padding`  → `background-clip-padding`
- `bg-clip-text`  → `background-clip-text`
- `bg-contain`  → `background-contain`
- `bg-cover`  → `background-cover`
- `bg-fixed`  → `background-fixed`
- `bg-left`  → `background-left`
- `bg-local`  → `background-local`
- `bg-no-repeat`  → `background-repeat-none`
- `bg-repeat`  → `background-repeat`
- `bg-repeat-round`  → `background-repeat-round`
- `bg-repeat-space`  → `background-repeat-space`
- `bg-repeat-x`  → `background-repeat-x`
- `bg-repeat-y`  → `background-repeat-y`
- `bg-right`  → `background-right`
- `bg-scroll-bg`  → `background-scroll`
- `bg-surface`
- `bg-top`  → `background-top`
- `bg-top-left`  → `background-top-left`
- `bg-top-right`  → `background-top-right`
- `color-amber-shade-{n}` — 100, 200, 300
- `color-amber-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-amber-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-blue-shade-{n}` — 100, 200, 300
- `color-blue-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-blue-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-blue-{n}/{alpha}` — 500/75
- `color-cyan-shade-{n}` — 100, 200, 300
- `color-cyan-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-cyan-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-gray-shade-{n}` — 100, 200, 300
- `color-gray-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-gray-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-gray-{n}/{alpha}` — 900/75
- `color-green-shade-{n}` — 100, 200, 300
- `color-green-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-green-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-indigo-shade-{n}` — 100, 200, 300
- `color-indigo-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-indigo-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-input`
- `color-lime-shade-{n}` — 100, 200, 300
- `color-lime-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-lime-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-orange-shade-{n}` — 100, 200, 300
- `color-orange-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-orange-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-picker`
- `color-picker-chip`
- `color-picker-preview`
- `color-pink-shade-{n}` — 100, 200, 300
- `color-pink-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-pink-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-primary`
- `color-purple-shade-{n}` — 100, 200, 300
- `color-purple-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-purple-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-red-shade-{n}` — 100, 200, 300
- `color-red-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-red-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-red-{n}/{alpha}` — 600/75
- `color-rose-shade-{n}` — 100, 200, 300
- `color-rose-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-rose-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-secondary`
- `color-slate-shade-{n}` — 100, 200, 300
- `color-slate-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-slate-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-stone-shade-{n}` — 100, 200, 300
- `color-stone-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-stone-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-swatch`
- `color-swatch-grid`
- `color-teal-shade-{n}` — 100, 200, 300
- `color-teal-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-teal-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-text`
- `color-text-muted`
- `color-violet-shade-{n}` — 100, 200, 300
- `color-violet-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-violet-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-yellow-shade-{n}` — 100, 200, 300
- `color-yellow-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-yellow-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-zinc-shade-{n}` — 100, 200, 300
- `color-zinc-tint-{n}` — 10, 20, 30, 40, 50, 60, 70
- `color-zinc-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `color-{color}` — black, current, transparent, white
- `divide-gray-dark`
- `divide-x`
- `divide-x-{n}` — 2
- `divide-y`
- `divide-y-{n}` — 2
- `divide-{color}` — gray, white
- `fill-amber-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-blue-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-cyan-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-gray-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-green-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-indigo-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-lime-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-orange-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-pink-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-purple-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-red-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-rose-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-slate-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-stone-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-teal-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-violet-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-yellow-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `fill-zinc-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `from-amber-{n}` — 400
- `from-blue-{n}` — 400, 500, 600
- `from-cyan-{n}` — 400
- `from-gray-{n}` — 100, 900
- `from-green-{n}` — 400, 500
- `from-indigo-{n}` — 500
- `from-orange-{n}` — 500
- `from-pink-{n}` — 500
- `from-purple-{n}` — 500, 600
- `from-red-{n}` — 500
- `from-rose-{n}` — 500
- `from-sky-{n}` — 400, 500
- `from-teal-{n}` — 500
- `from-yellow-{n}` — 400
- `from-{color}` — black, transparent, white
- `gradient-conic`
- `gradient-conic-from-top`
- `gradient-radial`
- `gradient-radial-bl`
- `gradient-radial-bottom`
- `gradient-radial-br`
- `gradient-radial-from-center`
- `gradient-radial-from-top`
- `gradient-radial-tl`
- `gradient-radial-top`
- `gradient-radial-tr`
- `gradient-to-bottom`
- `gradient-to-bottom-right`
- `gradient-to-left`
- `gradient-to-right`
- `gradient-to-top`
- `gradient-to-top-right`
- `gradient-via-cyan-{n}` — 400
- `gradient-via-pink-{n}` — 400
- `gradient-via-purple-{n}` — 400
- `gradient-via-yellow-{n}` — 400
- `stroke-amber-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-blue-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-cyan-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-gray-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-green-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-indigo-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-lime-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-orange-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-pink-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-purple-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-red-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-rose-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-slate-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-stone-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-teal-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-violet-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-yellow-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `stroke-zinc-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `to-amber-{n}` — 400
- `to-blue-{n}` — 400, 500, 600
- `to-cyan-{n}` — 400
- `to-gray-{n}` — 100, 900
- `to-green-{n}` — 400, 500
- `to-indigo-{n}` — 500
- `to-orange-{n}` — 500
- `to-pink-{n}` — 500
- `to-purple-{n}` — 500, 600
- `to-red-{n}` — 500
- `to-rose-{n}` — 500
- `to-sky-{n}` — 400, 500
- `to-teal-{n}` — 500
- `to-yellow-{n}` — 400
- `to-{color}` — black, transparent, white

</details>

<details>
<summary><b>Borders, radius & rings</b> — 511 classes in 97 families</summary>

- `add-border-block-{n}`  → `border-block-{n}` — 1, 2
- `add-border-bottom-{n}`  → `border-bottom-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48
- `add-border-inline-{n}`  → `border-inline-{n}` — 1, 2
- `add-border-left-{n}`  → `border-left-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48
- `add-border-right-{n}`  → `border-right-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48
- `add-border-top-{n}`  → `border-top-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48
- `add-border-x-{n}`  → `border-x-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48
- `add-border-y-{n}`  → `border-y-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48
- `add-border-{n}`  → `border-{n}` — 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48
- `border-amber-shade-{n}`  → `border-color-amber-shade-{n}` — 10
- `border-amber-tint-{n}`  → `border-color-amber-tint-{n}` — 20, 40
- `border-block-end`
- `border-block-start`
- `border-blue-shade-{n}`  → `border-color-blue-shade-{n}` — 10
- `border-blue-tint-{n}`  → `border-color-blue-tint-{n}` — 20, 40
- `border-collapse`
- `border-color-amber-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-blue-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-cyan-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-default`
- `border-color-gray-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-green-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-indigo-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-lime-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-orange-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-pink-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-primary`
- `border-color-purple-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-red-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-rose-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-slate-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-stone-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-teal-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-violet-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-yellow-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-zinc-{n}` — 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- `border-color-{color}` — black, current, transparent, white
- `border-cyan-shade-{n}`  → `border-color-cyan-shade-{n}` — 10
- `border-cyan-tint-{n}`  → `border-color-cyan-tint-{n}` — 20, 40
- `border-dashed`
- `border-dotted`
- `border-double`
- `border-end-{n}` — 1, 2, 4
- `border-gradient-blue-to-{color}` — purple
- `border-gradient-orange-to-{color}` — pink
- `border-gray-shade-{n}`  → `border-color-gray-shade-{n}` — 10
- `border-gray-tint-{n}`  → `border-color-gray-tint-{n}` — 20, 40
- `border-green-shade-{n}`  → `border-color-green-shade-{n}` — 10
- `border-green-tint-{n}`  → `border-color-green-tint-{n}` — 20, 40
- `border-hidden`
- `border-indigo-shade-{n}`  → `border-color-indigo-shade-{n}` — 10
- `border-indigo-tint-{n}`  → `border-color-indigo-tint-{n}` — 20, 40
- `border-inline-end`
- `border-inline-start`
- `border-lime-shade-{n}`  → `border-color-lime-shade-{n}` — 10
- `border-lime-tint-{n}`  → `border-color-lime-tint-{n}` — 20, 40
- `border-none`
- `border-orange-shade-{n}`  → `border-color-orange-shade-{n}` — 10
- `border-orange-tint-{n}`  → `border-color-orange-tint-{n}` — 20, 40
- `border-pink-shade-{n}`  → `border-color-pink-shade-{n}` — 10
- `border-pink-tint-{n}`  → `border-color-pink-tint-{n}` — 20, 40
- `border-purple-shade-{n}`  → `border-color-purple-shade-{n}` — 10
- `border-purple-tint-{n}`  → `border-color-purple-tint-{n}` — 20, 40
- `border-red-shade-{n}`  → `border-color-red-shade-{n}` — 10
- `border-red-tint-{n}`  → `border-color-red-tint-{n}` — 20, 40
- `border-rose-shade-{n}`  → `border-color-rose-shade-{n}` — 10
- `border-rose-tint-{n}`  → `border-color-rose-tint-{n}` — 20, 40
- `border-separate`
- `border-slate-shade-{n}`  → `border-color-slate-shade-{n}` — 10
- `border-slate-tint-{n}`  → `border-color-slate-tint-{n}` — 20, 40
- `border-solid`
- `border-start-{n}` — 1, 2, 4
- `border-stone-shade-{n}`  → `border-color-stone-shade-{n}` — 10
- `border-stone-tint-{n}`  → `border-color-stone-tint-{n}` — 20, 40
- `border-teal-shade-{n}`  → `border-color-teal-shade-{n}` — 10
- `border-teal-tint-{n}`  → `border-color-teal-tint-{n}` — 20, 40
- `border-violet-shade-{n}`  → `border-color-violet-shade-{n}` — 10
- `border-violet-tint-{n}`  → `border-color-violet-tint-{n}` — 20, 40
- `border-yellow-shade-{n}`  → `border-color-yellow-shade-{n}` — 10
- `border-yellow-tint-{n}`  → `border-color-yellow-tint-{n}` — 20, 40
- `border-zinc-shade-{n}`  → `border-color-zinc-shade-{n}` — 10
- `border-zinc-tint-{n}`  → `border-color-zinc-tint-{n}` — 20, 40
- `make-circle`  → `radius-circle`
- `make-pill`  → `radius-pill`
- `outline`
- `outline-dashed`
- `outline-none`
- `outline-offset-{n}` — 2, 4
- `ring-inset`
- `ring-offset-{n}` — 1, 2, 4
- `ring-{color}` — blue, green, purple, red, yellow
- `ring-{n}` — 0, 1, 2, 4, 8
- `round-bottom-{n}`  → `radius-bottom-{n}` — 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 128
- `round-corners-{n}`  → `radius-{n}` — 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 128
- `round-left-{n}`  → `radius-left-{n}` — 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 128
- `round-right-{n}`  → `radius-right-{n}` — 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 128
- `round-top-{n}`  → `radius-top-{n}` — 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 128

</details>

<details>
<summary><b>Effects & filters</b> — 116 classes in 70 families</summary>

- `add-shadow`  → `shadow`
- `add-shadow-inner`  → `shadow-inner`
- `add-shadow-lg`  → `shadow-lg`
- `add-shadow-md`  → `shadow-md`
- `add-shadow-none`  → `shadow-none`
- `add-shadow-sm`  → `shadow-sm`
- `add-shadow-xl`  → `shadow-xl`
- `backdrop`
- `backdrop-blur`
- `backdrop-blur-2xl`
- `backdrop-blur-3xl`
- `backdrop-blur-lg`
- `backdrop-blur-md`
- `backdrop-blur-none`
- `backdrop-blur-sm`
- `backdrop-blur-xl`
- `backdrop-brightness-{n}` — 50, 75, 110
- `backdrop-light`
- `blend-color`
- `blend-darken`
- `blend-difference`
- `blend-exclusion`
- `blend-hue`
- `blend-lighten`
- `blend-luminosity`
- `blend-multiply`
- `blend-normal`
- `blend-overlay`
- `blend-saturation`
- `blend-screen`
- `blur`
- `blur-lg`
- `blur-md`
- `blur-none`
- `blur-sm`
- `blur-xl`
- `brightness-{n}` — 50, 75, 90, 100, 110, 125, 150, 200
- `clip-arrow-right`
- `clip-chevron-right`
- `clip-circle`
- `clip-diamond`
- `clip-ellipse`
- `clip-hexagon`
- `clip-none`
- `clip-pentagon`
- `clip-star`
- `clip-triangle-down`
- `clip-triangle-up`
- `contrast-{n}` — 50, 75, 100, 125, 150, 200
- `drop-cap`
- `drop-shadow`
- `drop-shadow-lg`
- `drop-shadow-md`
- `drop-shadow-none`
- `drop-shadow-sm`
- `drop-shadow-xl`
- `elevation-{n}` — 0, 1, 2, 3, 4, 5
- `glass`
- `glass-dark`
- `glass-light`
- `grayscale`
- `grayscale-{n}` — 0
- `hue-rotate-{n}` — 30, 60, 90, 180
- `invert`
- `invert-{n}` — 0
- `no-shadow`  → `shadow-none`
- `opacity-{n}` — 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100
- `saturate-{n}` — 0, 50, 100, 150, 200
- `sepia`
- `sepia-{n}` — 0

</details>

<details>
<summary><b>Transforms & transitions</b> — 45 classes in 28 families</summary>

- `rotate-minus-{n}` — 45, 90
- `rotate-{n}` — 45, 90, 135, 180, 270
- `scale-{n}` — 75, 90, 95, 100, 102, 105, 110, 125, 150
- `skew-x-{n}` — 3, 6, 12
- `skew-y-{n}` — 3, 6, 12
- `transform-origin-bottom`
- `transform-origin-bottom-left`
- `transform-origin-bottom-right`
- `transform-origin-center`
- `transform-origin-left`
- `transform-origin-right`
- `transform-origin-top`
- `transform-origin-top-left`
- `transform-origin-top-right`
- `transition-all`
- `transition-colors`
- `transition-fast`
- `transition-none`
- `transition-normal`
- `transition-opacity`
- `transition-shadow`
- `transition-slow`
- `transition-transform`
- `will-change-auto`
- `will-change-contents`
- `will-change-opacity`
- `will-change-scroll`
- `will-change-transform`

</details>

<details>
<summary><b>Animation</b> — 252 classes in 216 families</summary>

- `animate-back-in-from-bottom`  → `animation-back-in-from-bottom`
- `animate-back-in-from-left`  → `animation-back-in-from-left`
- `animate-back-in-from-right`  → `animation-back-in-from-right`
- `animate-back-in-from-top`  → `animation-back-in-from-top`
- `animate-back-out-to-bottom`  → `animation-back-out-to-bottom`
- `animate-back-out-to-left`  → `animation-back-out-to-left`
- `animate-back-out-to-right`  → `animation-back-out-to-right`
- `animate-back-out-to-top`  → `animation-back-out-to-top`
- `animate-badge-pop`  → `animation-badge-pop`
- `animate-bat-fly`  → `animation-bat-fly`
- `animate-bat-wings`  → `animation-bat-wings`
- `animate-bee-buzz`  → `animation-bee-buzz`
- `animate-bee-hover`  → `animation-bee-hover`
- `animate-bird-flock`  → `animation-bird-flock`
- `animate-bird-flock-{n}`  → `animation-bird-flock-{n}` — 2, 3
- `animate-border-spin`  → `animation-border-spin`
- `animate-bounce`  → `animation-bounce`
- `animate-bounce-in`  → `animation-bounce-in`
- `animate-bounce-in-from-bottom`  → `animation-bounce-in-from-bottom`
- `animate-bounce-in-from-left`  → `animation-bounce-in-from-left`
- `animate-bounce-in-from-right`  → `animation-bounce-in-from-right`
- `animate-bounce-in-from-top`  → `animation-bounce-in-from-top`
- `animate-bounce-out`  → `animation-bounce-out`
- `animate-bounce-out-to-bottom`  → `animation-bounce-out-to-bottom`
- `animate-bounce-out-to-left`  → `animation-bounce-out-to-left`
- `animate-bounce-out-to-right`  → `animation-bounce-out-to-right`
- `animate-bounce-out-to-top`  → `animation-bounce-out-to-top`
- `animate-butterfly`  → `animation-butterfly`
- `animate-butterfly-drift`  → `animation-butterfly-drift`
- `animate-depth-in`  → `animation-depth-in`
- `animate-depth-out`  → `animation-depth-out`
- `animate-dragon-fire`  → `animation-dragon-fire`
- `animate-drawer-in-bottom`  → `animation-drawer-in-bottom`
- `animate-drawer-in-right`  → `animation-drawer-in-right`
- `animate-drawer-out-right`  → `animation-drawer-out-right`
- `animate-dropdown-in`  → `animation-dropdown-in`
- `animate-dropdown-out`  → `animation-dropdown-out`
- `animate-error-shake`  → `animation-error-shake`
- `animate-exit-fade-out`  → `animation-exit-fade-out`
- `animate-exit-flip-out`  → `animation-exit-flip-out`
- `animate-exit-scale-down`  → `animation-exit-scale-down`
- `animate-exit-slide-left`  → `animation-exit-slide-left`
- `animate-exit-slide-right`  → `animation-exit-slide-right`
- `animate-fade-in`  → `animation-fade-in`
- `animate-fade-in-bottom-left`  → `animation-fade-in-bottom-left`
- `animate-fade-in-bottom-right`  → `animation-fade-in-bottom-right`
- `animate-fade-in-from-bottom`  → `animation-fade-in-from-bottom`
- `animate-fade-in-from-left`  → `animation-fade-in-from-left`
- `animate-fade-in-from-right`  → `animation-fade-in-from-right`
- `animate-fade-in-from-top`  → `animation-fade-in-from-top`
- `animate-fade-in-top-left`  → `animation-fade-in-top-left`
- `animate-fade-in-top-right`  → `animation-fade-in-top-right`
- `animate-fade-out`  → `animation-fade-out`
- `animate-fade-out-bottom-left`  → `animation-fade-out-bottom-left`
- `animate-fade-out-bottom-right`  → `animation-fade-out-bottom-right`
- `animate-fade-out-to-bottom`  → `animation-fade-out-to-bottom`
- `animate-fade-out-to-left`  → `animation-fade-out-to-left`
- `animate-fade-out-to-right`  → `animation-fade-out-to-right`
- `animate-fade-out-to-top`  → `animation-fade-out-to-top`
- `animate-fade-out-top-left`  → `animation-fade-out-top-left`
- `animate-fade-out-top-right`  → `animation-fade-out-top-right`
- `animate-fire-flicker`  → `animation-fire-flicker`
- `animate-firefly`  → `animation-firefly`
- `animate-firefly-glow`  → `animation-firefly-glow`
- `animate-fish-swim`  → `animation-fish-swim`
- `animate-flash`  → `animation-flash`
- `animate-flip`  → `animation-flip`
- `animate-flip-3d-x`  → `animation-flip-3d-x`
- `animate-flip-3d-y`  → `animation-flip-3d-y`
- `animate-flip-in-x`  → `animation-flip-in-x`
- `animate-flip-in-y`  → `animation-flip-in-y`
- `animate-flip-out-x`  → `animation-flip-out-x`
- `animate-flip-out-y`  → `animation-flip-out-y`
- `animate-gradient-shift`  → `animation-gradient-shift`
- `animate-heartbeat`  → `animation-heartbeat`
- `animate-hinge`  → `animation-hinge`
- `animate-jack-in-box`  → `animation-jack-in-box`
- `animate-jelly`  → `animation-jelly`
- `animate-jellyfish`  → `animation-jellyfish`
- `animate-jellyfish-tendrils`  → `animation-jellyfish-tendrils`
- `animate-liquid`  → `animation-liquid`
- `animate-modal-in`  → `animation-modal-in`
- `animate-modal-out`  → `animation-modal-out`
- `animate-morph-blob`  → `animation-morph-blob`
- `animate-morph-circle-to-square`  → `animation-morph-circle-to-square`
- `animate-on-scroll-fade-in`  → `animation-on-scroll-fade-in`
- `animate-on-scroll-flip-up`  → `animation-on-scroll-flip-up`
- `animate-on-scroll-from-left`  → `animation-on-scroll-from-left`
- `animate-on-scroll-from-right`  → `animation-on-scroll-from-right`
- `animate-on-scroll-slide-down`  → `animation-on-scroll-slide-down`
- `animate-on-scroll-slide-up`  → `animation-on-scroll-slide-up`
- `animate-on-scroll-zoom-in`  → `animation-on-scroll-zoom-in`
- `animate-page-in-from-left`  → `animation-page-in-from-left`
- `animate-page-in-from-right`  → `animation-page-in-from-right`
- `animate-page-out-to-left`  → `animation-page-out-to-left`
- `animate-page-out-to-right`  → `animation-page-out-to-right`
- `animate-ping`  → `animation-ping`
- `animate-pulse`  → `animation-pulse`
- `animate-pulse-dot`  → `animation-pulse-dot`
- `animate-roll-in`  → `animation-roll-in`
- `animate-roll-out`  → `animation-roll-out`
- `animate-rotate-3d`  → `animation-rotate-3d`
- `animate-rotate-in`  → `animation-rotate-in`
- `animate-rotate-in-from-bottom-left`  → `animation-rotate-in-from-bottom-left`
- `animate-rotate-in-from-bottom-right`  → `animation-rotate-in-from-bottom-right`
- `animate-rotate-in-from-top-left`  → `animation-rotate-in-from-top-left`
- `animate-rotate-in-from-top-right`  → `animation-rotate-in-from-top-right`
- `animate-rotate-out`  → `animation-rotate-out`
- `animate-rotate-out-to-bottom-left`  → `animation-rotate-out-to-bottom-left`
- `animate-rotate-out-to-bottom-right`  → `animation-rotate-out-to-bottom-right`
- `animate-rotate-out-to-top-left`  → `animation-rotate-out-to-top-left`
- `animate-rotate-out-to-top-right`  → `animation-rotate-out-to-top-right`
- `animate-rubber-band`  → `animation-rubber-band`
- `animate-shake-head`  → `animation-shake-head`
- `animate-shake-x`  → `animation-shake-x`
- `animate-shake-y`  → `animation-shake-y`
- `animate-shimmer`  → `animation-shimmer`
- `animate-slide-down`  → `animation-slide-down`
- `animate-slide-in-from-bottom`  → `animation-slide-in-from-bottom`
- `animate-slide-in-from-left`  → `animation-slide-in-from-left`
- `animate-slide-in-from-right`  → `animation-slide-in-from-right`
- `animate-slide-in-from-top`  → `animation-slide-in-from-top`
- `animate-slide-out-to-bottom`  → `animation-slide-out-to-bottom`
- `animate-slide-out-to-left`  → `animation-slide-out-to-left`
- `animate-slide-out-to-right`  → `animation-slide-out-to-right`
- `animate-slide-out-to-top`  → `animation-slide-out-to-top`
- `animate-slide-up`  → `animation-slide-up`
- `animate-snake-slither`  → `animation-snake-slither`
- `animate-speed-in-from-left`  → `animation-speed-in-from-left`
- `animate-speed-in-from-right`  → `animation-speed-in-from-right`
- `animate-speed-out-to-left`  → `animation-speed-out-to-left`
- `animate-speed-out-to-right`  → `animation-speed-out-to-right`
- `animate-spider-drop`  → `animation-spider-drop`
- `animate-spider-swing`  → `animation-spider-swing`
- `animate-spin`  → `animation-spin`
- `animate-spin-ccw`  → `animation-spin-ccw`
- `animate-spin-cw`  → `animation-spin-cw`
- `animate-spin-fast`  → `animation-spin-fast`
- `animate-spin-slow`  → `animation-spin-slow`
- `animate-spin-slow-ccw`  → `animation-spin-slow-ccw`
- `animate-spin-slow-cw`  → `animation-spin-slow-cw`
- `animate-spin-xslow-ccw`  → `animation-spin-xslow-ccw`
- `animate-spin-xslow-cw`  → `animation-spin-xslow-cw`
- `animate-stagger-children-{n}`  → `animation-stagger-children-{n}` — 100, 200, 300
- `animate-stagger-fade-in`  → `animation-stagger-fade-in`
- `animate-stagger-from-left`  → `animation-stagger-from-left`
- `animate-stagger-from-right`  → `animation-stagger-from-right`
- `animate-stagger-slide-up`  → `animation-stagger-slide-up`
- `animate-stagger-zoom-in`  → `animation-stagger-zoom-in`
- `animate-success-checkmark`  → `animation-success-checkmark`
- `animate-swing`  → `animation-swing`
- `animate-swing-3d`  → `animation-swing-3d`
- `animate-tada`  → `animation-tada`
- `animate-text-blur-in`  → `animation-text-blur-in`
- `animate-text-glitch`  → `animation-text-glitch`
- `animate-text-gradient-flow`  → `animation-text-gradient-flow`
- `animate-text-neon-pulse`  → `animation-text-neon-pulse`
- `animate-text-slide-up`  → `animation-text-slide-up`
- `animate-text-wave`  → `animation-text-wave`
- `animate-tilt-left`  → `animation-tilt-left`
- `animate-tilt-right`  → `animation-tilt-right`
- `animate-toast-in`  → `animation-toast-in`
- `animate-toast-out`  → `animation-toast-out`
- `animate-tooltip-in`  → `animation-tooltip-in`
- `animate-typewriter`  → `animation-typewriter`
- `animate-wobble`  → `animation-wobble`
- `animate-zoom-in`  → `animation-zoom-in`
- `animate-zoom-in-from-bottom`  → `animation-zoom-in-from-bottom`
- `animate-zoom-in-from-left`  → `animation-zoom-in-from-left`
- `animate-zoom-in-from-right`  → `animation-zoom-in-from-right`
- `animate-zoom-in-from-top`  → `animation-zoom-in-from-top`
- `animate-zoom-out`  → `animation-zoom-out`
- `animate-zoom-out-to-bottom`  → `animation-zoom-out-to-bottom`
- `animate-zoom-out-to-left`  → `animation-zoom-out-to-left`
- `animate-zoom-out-to-right`  → `animation-zoom-out-to-right`
- `animate-zoom-out-to-top`  → `animation-zoom-out-to-top`
- `animation-delay-{n}` — 100, 200, 300, 400, 500, 600, 700, 750, 800, 900, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000
- `animation-direction-alternate`
- `animation-direction-alternate-reverse`
- `animation-direction-normal`
- `animation-direction-reverse`
- `animation-ease`
- `animation-ease-bounce`
- `animation-ease-elastic`
- `animation-ease-in`
- `animation-ease-in-out`
- `animation-ease-out`
- `animation-ease-spring`
- `animation-fill-backwards`
- `animation-fill-both`
- `animation-fill-forwards`
- `animation-fill-none`
- `animation-iteration-{n}` — 2, 4, 5
- `animation-linear`
- `animation-loop-forever`
- `animation-loop-{n}` — 1, 2, 3, 4, 5
- `animation-none`
- `animation-pause-on-hover`
- `animation-paused`
- `animation-running`
- `animation-speed-fast`
- `animation-speed-fastest`
- `animation-speed-glacial`
- `animation-speed-normal`
- `animation-speed-slow`
- `animation-speed-slowest`
- `animation-speed-ultra-fast`
- `enter-at-{n}` — 15, 25, 50, 75
- `enter-repeat`
- `santy-ripple`
- `santy-tip`
- `scroll-reveal-delay-{n}` — 100, 200, 300, 400, 500
- `scroll-reveal-once`
- `scroll-reveal-repeat`
- `stagger-children`
- `stagger-{n}` — 50, 150, 200, 300

</details>

<details>
<summary><b>Interaction & scrolling</b> — 110 classes in 103 families</summary>

- `appearance-auto`
- `appearance-none`
- `cursor-alias`
- `cursor-auto`
- `cursor-cell`
- `cursor-col-resize`
- `cursor-context-menu`
- `cursor-copy`
- `cursor-crosshair`
- `cursor-default`
- `cursor-grab`
- `cursor-grabbing`
- `cursor-help`
- `cursor-move`
- `cursor-none`
- `cursor-not-allowed`
- `cursor-pointer`
- `cursor-progress`
- `cursor-resize-e`
- `cursor-resize-ew`
- `cursor-resize-n`
- `cursor-resize-ne`
- `cursor-resize-ns`
- `cursor-resize-nw`
- `cursor-resize-s`
- `cursor-resize-se`
- `cursor-resize-sw`
- `cursor-resize-w`
- `cursor-row-resize`
- `cursor-text`
- `cursor-wait`
- `cursor-zoom-in`
- `cursor-zoom-out`
- `overflow-auto`
- `overflow-clip`
- `overflow-hidden`
- `overflow-scroll`
- `overflow-visible`
- `overflow-x-auto`
- `overflow-x-hidden`
- `overflow-x-scroll`
- `overflow-x-visible`
- `overflow-y-auto`
- `overflow-y-hidden`
- `overflow-y-scroll`
- `overflow-y-visible`
- `overscroll-auto`
- `overscroll-contain`
- `overscroll-none`
- `overscroll-x-contain`
- `overscroll-y-contain`
- `pointer-all`
- `pointer-auto`
- `pointer-events-all`
- `pointer-events-auto`
- `pointer-events-none`
- `pointer-none`
- `resize`
- `resize-none`
- `resize-x`
- `resize-y`
- `scroll-auto`
- `scroll-margin-top-{n}` — 16, 64, 80
- `scroll-opacity-out`
- `scroll-padding-top-{n}` — 0, 16, 48, 64, 80, 96
- `scroll-parallax-fast`
- `scroll-parallax-slow`
- `scroll-scale-down`
- `scroll-smooth`
- `scroll-snap-center`
- `scroll-snap-end`
- `scroll-snap-none`
- `scroll-snap-start`
- `scroll-snap-stop`
- `scroll-snap-x`
- `scroll-snap-x-proximity`
- `scroll-snap-y`
- `scroll-snap-y-proximity`
- `scroll-width`
- `scrollbar-dark`
- `scrollbar-hidden`
- `scrollbar-thin`
- `select-all`
- `select-auto`
- `select-error`
- `select-lg`
- `select-none`
- `select-sm`
- `select-text`
- `touch-auto`
- `touch-manipulation`
- `touch-none`
- `touch-pan-down`
- `touch-pan-left`
- `touch-pan-right`
- `touch-pan-up`
- `touch-pan-x`
- `touch-pan-y`
- `touch-pinch-zoom`
- `user-select-all`
- `user-select-auto`
- `user-select-none`
- `user-select-text`

</details>

<details>
<summary><b>Container queries</b> — 20 classes in 20 families</summary>

- `container-name-card`
- `container-name-layout`
- `container-query`
- `container-query-size`
- `container-type-inline`
- `container-type-normal`
- `container-type-size`
- `make-container`  → `container-type-inline`
- `make-container-block`  → `container-type-block`
- `make-container-named-card`  → `container-named-card`
- `make-container-named-footer`  → `container-named-footer`
- `make-container-named-header`  → `container-named-header`
- `make-container-named-hero`  → `container-named-hero`
- `make-container-named-main`  → `container-named-main`
- `make-container-named-nav`  → `container-named-nav`
- `make-container-named-panel`  → `container-named-panel`
- `make-container-named-section`  → `container-named-section`
- `make-container-named-sidebar`  → `container-named-sidebar`
- `make-container-named-widget`  → `container-named-widget`
- `make-container-size`  → `container-type-size`

</details>

<details>
<summary><b>Theme hooks</b> — 6 classes in 6 families</summary>

- `dark`
- `use-custom-color`  → `color-custom`
- `use-custom-font`  → `font-custom`
- `use-custom-radius`  → `radius-custom`
- `use-custom-size`  → `size-custom`
- `use-custom-spacing`  → `spacing-custom`

</details>

<details>
<summary><b>Classic component starters (make-* + style/size/shape)</b> — 50 classes in 50 families</summary>

- `make-accordion`
- `make-alert`
- `make-avatar`
- `make-badge`
- `make-button`
- `make-card`
- `make-collapse`
- `make-drawer`
- `make-dropdown`
- `make-input`
- `make-modal`
- `make-navbar`
- `make-notification`
- `make-progress`
- `make-skeleton`
- `make-spinner`
- `make-tooltip`
- `shape-circle`
- `shape-pill`
- `shape-rounded`
- `shape-square`
- `shape-sticky`
- `size-full`
- `size-large`
- `size-small`
- `size-tiny`
- `size-xl`
- `style-bordered`
- `style-bottom`
- `style-danger`
- `style-dark`
- `style-elevated`
- `style-error`
- `style-flat`
- `style-flush`
- `style-ghost`
- `style-glass`
- `style-hover`
- `style-info`
- `style-left`
- `style-light`
- `style-outline`
- `style-primary`
- `style-right`
- `style-secondary`
- `style-striped`
- `style-success`
- `style-top`
- `style-transparent`
- `style-warning`

</details>

<details>
<summary><b>Components</b> — 636 classes in 617 families</summary>

- `accordion`
- `accordion-body`
- `accordion-flush`
- `accordion-header`
- `accordion-icon`
- `accordion-item`
- `alert`
- `alert-danger`
- `alert-info`
- `alert-success`
- `alert-warning`
- `app-bar`
- `app-bar-dark`
- `app-bar-primary`
- `app-bar-sticky`
- `app-bar-title`
- `aria-live-assertive`
- `aria-live-polite`
- `avatar`
- `avatar-lg`
- `avatar-md`
- `avatar-sm`
- `avatar-xl`
- `badge`
- `badge-{color}` — blue, green, red, yellow
- `banner`
- `banner-actions`
- `banner-body`
- `banner-danger`
- `banner-icon`
- `banner-info`
- `banner-sticky`
- `banner-success`
- `banner-title`
- `banner-warning`
- `bar`
- `bar-chart-wrapper`
- `bat-animation`
- `bat-body`
- `bat-creature`
- `bat-ear-l`
- `bat-ear-r`
- `bat-wing-l`
- `bat-wing-r`
- `bottom-nav`
- `bottom-nav-badge`
- `bottom-nav-icon`
- `bottom-nav-item`
- `bottom-sheet`
- `bottom-sheet-body`
- `bottom-sheet-footer`
- `bottom-sheet-handle`
- `bottom-sheet-header`
- `bottom-sheet-overlay`
- `bottom-sheet-title`
- `box`
- `breadcrumb`
- `breadcrumb-arrow`
- `breadcrumb-dot`
- `breadcrumb-item`
- `btn`
- `btn-close`
- `btn-close-{color}` — white
- `btn-danger`
- `btn-full`
- `btn-ghost`
- `btn-group`
- `btn-group-vertical`
- `btn-icon`
- `btn-lg`
- `btn-outline`
- `btn-primary`
- `btn-secondary`
- `btn-sm`
- `btn-success`
- `btn-warning`
- `btn-xl`
- `calendar`
- `calendar-cell`
- `calendar-compact`
- `calendar-date`
- `calendar-event`
- `calendar-event-danger`
- `calendar-event-success`
- `calendar-event-warning`
- `calendar-grid`
- `calendar-header`
- `calendar-nav`
- `calendar-title`
- `calendar-weekday`
- `calendar-weekdays`
- `calorie-ring`
- `card`
- `card-body`
- `card-flat`
- `card-footer`
- `card-header`
- `card-horizontal`
- `card-img`
- `card-img-bottom`
- `card-img-top`
- `card-outline`
- `card-raised`
- `carousel`
- `carousel-dot`
- `carousel-dots`
- `carousel-item`
- `carousel-item-half`
- `carousel-item-third`
- `carousel-peek`
- `chat-bubble-ai`
- `chat-bubble-user`
- `checkbox`
- `checkbox-lg`
- `chip`
- `chip-lg`
- `chip-outline`
- `chip-sm`
- `chip-{color}` — blue, green, orange, purple, red, yellow
- `cmd-palette`
- `cmd-palette-backdrop`
- `cmd-palette-empty`
- `cmd-palette-footer`
- `cmd-palette-group`
- `cmd-palette-icon`
- `cmd-palette-input`
- `cmd-palette-input-wrap`
- `cmd-palette-item`
- `cmd-palette-item-hint`
- `cmd-palette-item-icon`
- `cmd-palette-item-label`
- `cmd-palette-kbd`
- `cmd-palette-list`
- `code-block`
- `code-block-copy`
- `code-block-dot`
- `code-block-dot-{color}` — green, red, yellow
- `code-block-dots`
- `code-block-gutter`
- `code-block-header`
- `code-block-inner`
- `code-block-lang`
- `code-block-line-numbers`
- `combobox`
- `combobox-chip`
- `combobox-chip-label`
- `combobox-chip-remove`
- `combobox-control`
- `combobox-empty`
- `combobox-group-label`
- `combobox-input`
- `combobox-list`
- `combobox-option`
- `combobox-option-desc`
- `combobox-toggle`
- `command-palette`
- `command-palette-empty`
- `command-palette-footer`
- `command-palette-group-label`
- `command-palette-icon`
- `command-palette-input`
- `command-palette-input-row`
- `command-palette-item`
- `command-palette-item-icon`
- `command-palette-item-label`
- `command-palette-item-shortcut`
- `command-palette-kbd`
- `command-palette-list`
- `command-palette-wrap`
- `content-close`
- `content-empty`
- `content-none`
- `content-open`
- `context-menu`
- `context-menu-divider`
- `context-menu-icon`
- `context-menu-item`
- `context-menu-item-danger`
- `context-menu-label`
- `context-menu-shortcut`
- `danger`
- `dark-auto`
- `data-table`
- `data-table-bordered`
- `data-table-compact`
- `data-table-detail`
- `data-table-detail-inner`
- `data-table-empty`
- `data-table-footer`
- `data-table-loading`
- `data-table-numeric`
- `data-table-pin-first`
- `data-table-relaxed`
- `data-table-row-toggle`
- `data-table-select`
- `data-table-striped`
- `data-table-toolbar`
- `data-table-toolbar-title`
- `data-table-wrap`
- `data-table-wrap-lg`
- `data-table-wrap-md`
- `data-table-wrap-sm`
- `date-picker`
- `date-picker-day`
- `date-picker-footer`
- `date-picker-grid`
- `date-picker-header`
- `date-picker-month-year`
- `date-picker-nav`
- `date-picker-weekdays`
- `dialog`
- `dialog-body`
- `dialog-footer`
- `dialog-fullscreen`
- `dialog-header`
- `dialog-lg`
- `divider`
- `divider-vertical`
- `drawer-body`
- `drawer-header`
- `drawer-overlay`
- `drawer-panel`
- `drawer-panel-right`
- `dropdown`
- `dropdown-divider`
- `dropdown-header`
- `dropdown-item`
- `dropdown-menu`
- `dropdown-menu-right`
- `dropdown-menu-top`
- `dropdown-toggle`
- `dropzone`
- `dropzone-btn`
- `dropzone-desc`
- `dropzone-icon`
- `dropzone-sm`
- `dropzone-title`
- `dropzone-types`
- `empty-state`
- `empty-state-desc`
- `empty-state-icon`
- `empty-state-title`
- `fab`
- `fab-bottom-left`
- `fab-bottom-right`
- `fab-extended`
- `fab-lg`
- `fab-sm`
- `field`
- `field-box`
- `field-counter`
- `field-error`
- `field-error-text`
- `field-filled`
- `field-has-prefix`
- `field-has-suffix`
- `field-help`
- `field-input`
- `field-label`
- `field-lg`
- `field-outlined`
- `field-prefix`
- `field-sm`
- `field-standard`
- `field-suffix`
- `file-drop`
- `file-list`
- `file-list-item`
- `file-list-name`
- `file-list-remove`
- `file-list-size`
- `first-letter-color-{color}` — blue
- `first-letter-large`
- `flip-horizontal`
- `flip-vertical`
- `focus-none`
- `focus-ring`
- `focus-ring-inset`
- `focus-ring-none`
- `focus-ring-{color}` — red, white
- `focus-trap`
- `focus-trap-active`
- `focus-visible-ring`
- `form-error-text`
- `form-group`
- `form-hint`
- `form-label`
- `form-label-required`
- `form-row`
- `form-row-{n}` — 3
- `group`
- `hanging-punctuation`
- `hero-content`
- `hero-section`
- `hero-section-full`
- `hero-section-lg`
- `hero-section-sm`
- `high-contrast-bg`
- `high-contrast-border`
- `high-contrast-outline`
- `in-range`
- `infinite-loader`
- `infinite-sentinel`
- `input`
- `input-addon`
- `input-error`
- `input-group`
- `input-lg`
- `input-sm`
- `input-text`
- `kanban`
- `kanban-add-btn`
- `kanban-card`
- `kanban-card-label`
- `kanban-card-meta`
- `kanban-card-title`
- `kanban-col`
- `kanban-col-count`
- `kanban-col-header`
- `kanban-col-title`
- `kbd`
- `level`
- `level-item`
- `level-left`
- `level-right`
- `loading-overlay`
- `loading-overlay-fixed`
- `loading-overlay-text`
- `media`
- `media-body`
- `media-lg`
- `media-right`
- `media-sm`
- `mega-menu`
- `mega-menu-col-title`
- `mega-menu-footer`
- `mega-menu-grid`
- `mega-menu-item`
- `mega-menu-item-desc`
- `mega-menu-item-icon`
- `mega-menu-item-title`
- `mega-menu-wrap`
- `menu`
- `menu-sub`
- `menu-sub-left`
- `menu-sub-list`
- `message`
- `message-body`
- `message-danger`
- `message-header`
- `message-info`
- `message-success`
- `message-warning`
- `modal-body`
- `modal-box`
- `modal-close`
- `modal-footer`
- `modal-full`
- `modal-header`
- `modal-lg`
- `modal-overlay`
- `modal-sm`
- `modal-title`
- `modal-xl`
- `motion-safe-animate`
- `nav-rail`
- `nav-rail-icon`
- `nav-rail-item`
- `nav-rail-wide`
- `navbar`
- `navbar-brand`
- `navbar-dark`
- `navbar-glass`
- `navbar-item`
- `navbar-menu`
- `navbar-sticky`
- `notification`
- `notification-desc`
- `notification-error`
- `notification-icon`
- `notification-info`
- `notification-success`
- `notification-title`
- `notification-warning`
- `number-input`
- `number-input-btn`
- `number-input-field`
- `number-input-lg`
- `number-input-sm`
- `numeric`
- `on-hover`
- `other-month`
- `overlay`
- `page-item`
- `page-link`
- `pagination`
- `pagination-lg`
- `pagination-sm`
- `panel`
- `peer`
- `popover`
- `print-background-{color}` — white
- `print-black-{color}` — white
- `print-border-none`
- `print-break-after`
- `print-break-before`
- `print-break-inside-auto`
- `print-break-inside-avoid`
- `print-full-width`
- `print-hidden`
- `print-no-background`
- `print-no-border`
- `print-no-shadow`
- `print-only`
- `print-only-flex`
- `print-show-links`
- `print-text-{color}` — black
- `print-visible`
- `progress`
- `progress-bar`
- `progress-bar-{color}` — green, orange, purple, red, yellow
- `pull-to-refresh`
- `pull-to-refresh-spinner`
- `radio`
- `radio-label`
- `radio-lg`
- `range`
- `range-end`
- `range-lg`
- `range-sm`
- `range-start`
- `rating`
- `rating-count`
- `rating-lg`
- `rating-readonly`
- `rating-sm`
- `rating-star`
- `rating-value`
- `scan-line-animated`
- `scan-overlay`
- `screen-reader-only`
- `segmented`
- `segmented-full`
- `segmented-item`
- `segmented-label`
- `segmented-lg`
- `segmented-sm`
- `select`
- `skeleton`
- `skeleton-circle`
- `skeleton-circle-lg`
- `skeleton-circle-sm`
- `skeleton-rect`
- `skeleton-rect-lg`
- `skeleton-rect-sm`
- `skeleton-text`
- `skeleton-text-lg`
- `skeleton-text-sm`
- `skeleton-title`
- `skeleton-wave`
- `skill-bar-animated`
- `skip-to-content`
- `slider`
- `snackbar`
- `snackbar-action`
- `snackbar-left`
- `snackbar-message`
- `snackbar-right`
- `speed-dial`
- `speed-dial-action`
- `speed-dial-action-label`
- `speed-dial-actions`
- `speed-dial-left`
- `speed-dial-toggle-icon`
- `speed-dial-up`
- `spinner`
- `spinner-lg`
- `spinner-md`
- `spinner-sm`
- `spinner-xl`
- `split-pane`
- `split-pane-divider`
- `split-pane-panel`
- `split-pane-vertical`
- `stat-card`
- `stat-delta`
- `stat-delta-down`
- `stat-delta-up`
- `stat-label`
- `stat-value`
- `step`
- `step-dot`
- `step-label`
- `stepper`
- `stepper-body`
- `stepper-desc`
- `stepper-dot`
- `stepper-item`
- `stepper-label`
- `stepper-mobile-stack`
- `stepper-vertical`
- `steps`
- `swipe-carousel`
- `swipe-carousel-dot`
- `swipe-carousel-dots`
- `swipe-carousel-full`
- `swipe-carousel-item`
- `swipe-carousel-multi`
- `swipe-carousel-peek`
- `switch`
- `switch-danger`
- `switch-lg`
- `switch-slider`
- `switch-sm`
- `switch-success`
- `tab-panel`
- `table`
- `table-auto`
- `table-bordered`
- `table-compact`
- `table-fixed`
- `table-hover`
- `table-responsive`
- `table-striped`
- `tabs`
- `tabs-item`
- `tabs-pill`
- `tabs-underline`
- `textarea`
- `textarea-error`
- `textarea-no-resize`
- `time-column`
- `time-option`
- `time-picker`
- `time-picker-footer`
- `timeline`
- `timeline-body`
- `timeline-card`
- `timeline-compact`
- `timeline-desc`
- `timeline-dot`
- `timeline-dot-{color}` — blue, green, red, yellow
- `timeline-item`
- `timeline-time`
- `timeline-title`
- `tip`
- `toast`
- `toast-action`
- `toast-body`
- `toast-close`
- `toast-container`
- `toast-container-bottom-center`
- `toast-container-bottom-left`
- `toast-container-bottom-right`
- `toast-container-top-center`
- `toast-container-top-left`
- `toast-container-top-right`
- `toast-error`
- `toast-info`
- `toast-light`
- `toast-message`
- `toast-success`
- `toast-title`
- `toast-warning`
- `toggle`
- `toggle-group`
- `toggle-group-vertical`
- `toggle-slider`
- `toggle-sm`
- `toggle-{color}` — green, purple
- `token-attr`
- `token-comment`
- `token-fn`
- `token-keyword`
- `token-number`
- `token-string`
- `token-tag`
- `tooltip`
- `tooltip-bottom`
- `tooltip-content`
- `tooltip-left`
- `tooltip-right`
- `tooltip-top`
- `tree`
- `tree-badge`
- `tree-caret`
- `tree-icon`
- `tree-item`
- `tree-label`
- `tree-leaf`
- `tree-node`
- `typing-indicator`
- `upload-body`
- `upload-item`
- `upload-list`
- `upload-meta`
- `upload-name`
- `upload-progress`
- `upload-progress-bar`
- `upload-remove`
- `upload-thumb`
- `uploader`
- `uploader-hint`
- `uploader-icon`
- `uploader-title`
- `view-transition-card`
- `view-transition-fade`
- `view-transition-header`
- `view-transition-hero`
- `view-transition-image`
- `view-transition-none`
- `view-transition-scale`
- `view-transition-slide`
- `virtual-scroll`
- `virtual-scroll-item`
- `virtual-scroll-sizer`
- `virtual-scroll-viewport`

</details>

<details>
<summary><b>State hooks used by santy.js</b> — 19 classes in 19 families</summary>

- `active`
- `complete`
- `copied`
- `disabled`
- `done`
- `drag-over`
- `dragging`
- `dragover`
- `error`
- `filled`
- `is-visible`
- `open`
- `outside`
- `pulling`
- `refreshing`
- `selected`
- `show`
- `today`
- `visible`

</details>

<!-- inventory:end -->
