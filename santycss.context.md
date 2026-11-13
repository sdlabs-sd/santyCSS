# SantyCSS — LLM System Prompt Reference
> Paste this into Claude, ChatGPT or Cursor so your AI tool writes SantyCSS with the current class names.

---

## What is SantyCSS?
SantyCSS is a utility-first CSS framework whose classes are whole words with literal pixel values, plus its own theme ("Persimmon") and components. No build step is needed: link the CSS and use the classes.

Install: `npm install santycss`
CDN (new projects): `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/santycss@2/dist/santy-next.css">`
CDN (classic build, old + new names): `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/santycss@2/dist/santy-start.css">`

---

## Naming rules (v2.10). Always generate these names

Every class is `property-[modifier]-value`.

1. **Property first, then modifier, then value. No verbs.** `padding-top-24`, `border-left-2`, `md:display-flex`, `on-hover:shadow-lg`.
2. **Properties are whole words**: the CSS name or `display`, `text`, `font`, `radius`, `shadow`, `background`, `color`, `align`, `justify`, `inset`, `aspect`, `animation`. Never `p-`, `w-`, `bg-`, `z-`.
3. **Numbers are literal and whole.** Lengths are px: `gap-16` is exactly 16px, and there's no spacing scale to multiply. Unitless ratios are %: `opacity-50`, `scale-105`, `line-height-150` (= 1.5). Negatives are `minus-N` (`margin-top-minus-8`), fractions `N-of-M` (`width-1-of-3`), ratios `N-by-M` (`aspect-16-by-9`).
4. **A word means one thing.** Sizes are `xs sm md lg xl 2xl`. Keywords drop the modifier (`text-bold`, `text-center`, `text-uppercase`); numbers keep it (`text-size-18`, `text-weight-600`).
5. **Components are nouns, and their options are suffixes:** `button button-primary button-lg`.

| You want | Write |
|---|---|
| flex / grid / hide | `display-flex` / `display-grid` / `display-none` |
| padding 24, side padding 16, nudge up 8 | `padding-24` / `padding-x-16` / `margin-top-minus-8` |
| width 320px / a third | `width-320` / `width-1-of-3` |
| 18px semibold text | `text-size-18 text-weight-600` (or `text-semibold`) |
| 12px corners / pill | `radius-12` / `radius-pill` |
| medium shadow / stack on top | `shadow-md` / `z-index-10` |
| centre vertically, space apart | `align-center justify-between` |
| 3 columns, item spans 2 | `grid-columns-3 grid-column-span-2` |
| blue background, dark text | `background-blue-500 color-gray-900` |
| on hover / at 768px+ | `on-hover:…` / `md:…` |

**Legacy names.** Code written before v2.10 uses `make-flex`, `add-padding-24`, `set-width-320`, `round-corners-12` and `pin-top-0`. Those still work in `santy-start.css` and `santy.css`, but never generate them in new code. `npx santycss migrate` rewrites them.

---

## Components (santy-next.css / santy-ui.css)

Pattern: `component component-{primary|secondary|outline|ghost} component-{sm|md|lg}`. Plain HTML, no JavaScript.

```html
<button class="button button-primary button-lg">Save</button>      <!-- also button-danger, button-success, button-pill, button-block, button-icon -->
<article class="card"> <h3 class="card-title">…</h3> <p class="card-text">…</p> <div class="card-footer">…</div> </article>
<nav class="navbar navbar-sticky"> <a class="navbar-brand">…</a> <input class="navbar-toggle" type="checkbox" aria-label="Menu">
  <ul class="navbar-links"><li><a class="navbar-link" aria-current="page">…</a></li></ul> <div class="navbar-actions">…</div> </nav>
<label class="input-label" for="e">Email</label> <input class="input" id="e"> <span class="input-hint">…</span>
<span class="badge badge-success badge-dot">Live</span>                 <!-- also badge-warning, badge-danger, badge-info, badge-mono -->
<div class="alert alert-warning"><div><strong class="alert-title">…</strong><p>…</p></div></div>
<button popovertarget="m">Open</button>
<div class="modal" id="m" popover><div class="modal-panel"><div class="modal-header"><h3 class="modal-title">…</h3></div><div class="modal-body">…</div><div class="modal-footer">…</div></div></div>
<div class="tabs"><input class="tabs-input" type="radio" name="t" id="t1" checked><label class="tabs-item" for="t1">One</label><div class="tabs-panel">…</div></div>
<div class="pricing"><div class="pricing-plan pricing-featured"><h3 class="pricing-name">Pro</h3><p class="pricing-price">$24<span class="pricing-period">/mo</span></p><ul class="pricing-features"><li>…</li></ul><a class="button button-primary button-block">Buy</a></div></div>
<main class="shell">…</main>   <span class="eyebrow">Label</span>
```

Theme tokens are `--santy-*` variables (`--santy-primary`, `--santy-radius`, `--santy-font-display`, …). For dark mode use `<html data-theme="dark">` or `data-theme="auto"`. Theme-aware colour utilities: `background-surface`, `background-surface-alt`, `background-primary`, `background-secondary`, `color-text`, `color-text-muted`, `color-primary`, `color-secondary-contrast`, `border-color-default`.

---

## Layout

```
display-flex          flex-row          flex-column        flex-wrap
display-grid          display-block        display-inline         display-none
align-center       align-start       align-end           align-stretch
justify-center     justify-between   justify-around      justify-end
grid-columns-1 … grid-columns-12
gap-{n}            gap-x-{n}         gap-y-{n}           (n = 0–200)
```

## Spacing (n = 0–200px)

```
padding-{n}           padding-x-{n}      padding-y-{n}
padding-top-{n}       padding-bottom-{n}
padding-left-{n}      padding-right-{n}
margin-{n}            margin-x-{n}       margin-y-{n}
margin-top-{n}        margin-bottom-{n}
margin-left-{n}       margin-right-{n}
```

## Sizing

```
width-{n}     height-{n}     min-width-{n}   max-width-{n}
width-full    width-screen   height-screen    height-full
text-size-{n}      (8–144px)
```

## Colors — 20 families × 10 shades (50–950)

Families: `blue red green yellow purple pink orange gray indigo cyan teal rose violet emerald amber lime sky slate zinc neutral stone`

```
color-{name}-{shade}            /* text color   */
background-{name}-{shade}       /* bg color     */
border-color-{name}-{shade}     /* border color */
color-white   color-black   background-white   background-transparent
```

## Borders

```
border-{n}               /* all sides, n = 1–8 */
border-top-{n}           border-bottom-{n}
border-left-{n}          border-right-{n}
border-color-{name}-{shade}
radius-{n}            /* border-radius, n = 0–48 */
radius-circle                  radius-pill
```

## Shadows

```
shadow-sm    shadow-md    shadow-lg    shadow-xl    shadow-none
ring-offset-1    ring-offset-2    ring-offset-4
```

## Typography

```
text-bold   text-semibold   text-medium   text-light   text-thin   text-normal
text-italic   text-underline   text-strikethrough   text-no-decoration
text-center   text-left   text-right   text-justify
text-uppercase   text-lowercase   text-capitalize
line-height-tight   line-height-normal   line-height-relaxed   line-height-loose
letter-spacing-tight   letter-spacing-normal   letter-spacing-wide
```

## Positioning

```
position-relative   position-absolute   position-fixed   position-sticky
top-{n}   bottom-{n}   left-{n}   right-{n}   inset-center
z-index-0   z-index-10   z-index-20   z-index-30   z-index-40   z-index-50   z-index-100   z-index-auto
```

## Object / Aspect Ratio

```
object-fit-cover     object-fit-contain    object-fit-fill     object-fit-none
object-position-center   object-position-top   object-position-bottom
aspect-16-by-9    aspect-1-by-1    aspect-4-by-3
aspect-square        aspect-video
```

## Overflow / Display

```
overflow-hidden    overflow-auto    overflow-x-auto    overflow-y-auto    overflow-scroll
cursor-pointer    cursor-default    cursor-not-allowed    cursor-wait    cursor-grab
pointer-events-none    pointer-events-auto
user-select-none    user-select-text
```

## Transitions & Transforms

```
transition-all    transition-colors    transition-opacity    transition-transform
scale-90   scale-95   scale-100   scale-105   scale-110   scale-125   scale-150
rotate-45   rotate-90   rotate-180   rotate-270
translate-x-{n}   translate-y-{n}
opacity-0   opacity-25   opacity-50   opacity-75   opacity-100
```

## State Variants

```
on-hover:{class}       on-focus:{class}       on-active:{class}
dark:{class}           group-hover:{class}    peer-hover:{class}
peer-checked:{class}   on-visited:{class}
has-checked:{class}    has-focus:{class}      has-invalid:{class}   (parent :has() — v2.7.0)
has-hover:{class}      has-disabled:{class}   group-has-checked:{class}
```

## Responsive Breakpoints

```
sm:{class}   (640px+)
md:{class}   (768px+)
lg:{class}   (1024px+)
xl:{class}   (1280px+)
on-mobile:{class}    (max 767px)
on-tablet:{class}    (768–1023px)
on-desktop:{class}   (1024px+)
```

## Animations

```
animation-fade-in          animation-fade-out
animation-slide-up         animation-slide-down     animation-slide-in-from-left    animation-slide-in-from-right
animation-zoom-in          animation-zoom-out
animation-bounce           animation-spin           animation-pulse
animation-flip-in-x        animation-flip-in-y
animation-bounce-in-from-top   animation-bounce-in-from-bottom
animation-rotate-in        animation-swing
animation-heartbeat        animation-shake-x        animation-wobble         animation-jelly
```

## Gradients & Color Stops

```
gradient-to-right   gradient-to-left   gradient-to-bottom   gradient-to-top
gradient-to-br      gradient-to-bl      gradient-to-tr       gradient-to-tl
from-{color}-{shade}    /* sets --grad-from */
to-{color}-{shade}      /* sets --grad-to   */
```

## CSS Design Tokens (override to brand the whole UI)

```css
:root {
  --santy-primary:    #3b82f6;
  --santy-secondary:  #8b5cf6;
  --santy-accent:     #10b981;
  --santy-radius:     0.5rem;
  --santy-font:       'Inter', system-ui, sans-serif;
}
```

## Components

```
.btn   .btn-primary   .btn-secondary   .btn-outline   .btn-ghost   .btn-danger
.btn-sm   .btn-lg
.card   .card-header   .card-body   .card-footer
.badge   .badge-primary   .badge-success   .badge-warning   .badge-danger
.alert   .alert-success   .alert-warning   .alert-danger   .alert-info
.input   .input-error
.avatar   .avatar-sm   .avatar-lg   .avatar-xl
.spinner   .spinner-sm   .spinner-lg
.skeleton
.progress   .progress-bar
.navbar   .navbar-brand   .navbar-link
.dropdown   .dropdown-menu   .dropdown-item
.modal   .modal-header   .modal-body   .modal-footer
.accordion   .accordion-item   .accordion-header   .accordion-body
.table   .table-striped   .table-bordered
.tooltip   .tooltip-top   .tooltip-bottom   .tooltip-left   .tooltip-right
.drawer   .drawer-panel
.steps   .step   .step-dot   .step-label
.pagination   .page-link   .page-item
.notification   .notification-success   .notification-warning   .notification-danger
.toast   .toast-container   .toast-success/error/warning/info   .toast-close
.switch  .switch-slider   .switch-sm   .switch-lg
.checkbox   .radio          (custom-styled inputs)
.range   .range-sm   .range-lg
.carousel   .carousel-item   .carousel-dots   .carousel-dot
.dialog   .dialog-header   .dialog-body   .dialog-footer     (native <dialog>)
.popover                                                      (native Popover API)
.file-drop
```

## Behavior Layer — santy.js (v2.9.0)

Components are styled by CSS but driven by `santy.js`. Load it once:

```html
<script src="https://cdn.jsdelivr.net/npm/santycss@2/dist/santy.js" defer></script>
```

Then use data attributes — never hand-write toggle JavaScript:

```
data-santy-toggle="modal|drawer|offcanvas|bottom-sheet|dropdown|collapse|accordion|tab|popover"
data-santy-target="#id"          /* what the toggle controls        */
data-santy-dismiss               /* closes nearest overlay (or ="#id") */
data-santy-theme-toggle          /* light/dark toggle, persisted     */
data-santy-tooltip="text"        /* collision-aware tooltip          */
data-santy-placement="top|bottom|left|right|bottom-start|bottom-end|…"
data-santy-ripple                /* Material press feedback          */
data-santy-scrollspy             /* on a <nav> of #anchor links      */
data-santy-carousel              /* + data-santy-interval="5000"     */
data-santy-carousel-prev="#sel"  data-santy-carousel-next="#sel"
data-santy-backdrop="static"     /* backdrop click will not close    */
data-santy-keyboard="false"      /* Esc will not close               */
data-santy-multi="true"          /* on .accordion: allow many open   */
data-santy-autofocus             /* element to focus when opened     */
```

Programmatic API:

```js
Santy.modal.open('#confirm');    Santy.modal.close('#confirm');
Santy.drawer.toggle('#nav');     Santy.dropdown.closeAll();
Santy.tabs.show('#tab-2');       Santy.collapse.toggle('#panel');
Santy.carousel.next('#slides');  Santy.scrollspy('#toc');
Santy.toast('Saved');
Santy.toast.success('Done', { title: 'Upload', duration: 6000,
                              action: { label: 'Undo', onClick: undo } });
Santy.theme.get() / .set('dark') / .toggle() / .system();
Santy.init(container);           // re-scan after injecting markup
```

Lifecycle events (cancelable — `preventDefault()` vetoes the transition):
`santy:show` → `santy:shown` → `santy:hide` → `santy:hidden`

### Example: modal wired with zero custom JS

```html
<button class="btn btn-danger" data-santy-toggle="modal" data-santy-target="#confirm">
  Delete
</button>

<div class="modal-overlay" id="confirm">
  <div class="modal-box padding-24">
    <h3 class="modal-title text-size-20 text-bold">Delete this project?</h3>
    <p class="text-size-14 color-text-muted line-height-relaxed">This cannot be undone.</p>
    <div class="modal-footer display-flex gap-12 justify-end">
      <button class="btn btn-ghost" data-santy-dismiss>Cancel</button>
      <button class="btn btn-danger" data-santy-autofocus>Delete</button>
    </div>
  </div>
</div>
```

Focus trap, focus restore, `inert` background, scroll lock, Esc and backdrop
click are all handled. Do not add your own `classList.toggle('open')` handlers.

## Extended Components (v2.9.0 — MUI / Quasar parity)

```
.data-table   .data-table-wrap   .data-table-toolbar   .data-table-footer
.data-table-compact/-relaxed/-striped/-bordered/-pin-first
.data-table-select   .data-table-detail   .data-table-row-toggle   .data-table-empty
   → sortable: <th data-sort-type="number|date|text">; cells may carry data-sort-value

.combobox   .combobox-control   .combobox-input   .combobox-toggle
.combobox-list   .combobox-option   .combobox-option-label   .combobox-option-desc
.combobox-chip   .combobox-chip-remove   .combobox-group-label   .combobox-empty
   → data-santy-multiple="true" for chips/multiselect

.field   .field-box   .field-input   .field-label   .field-help   .field-counter
.field-outlined   .field-filled   .field-standard   .field-sm/-lg
.field-prefix   .field-suffix   .field-has-prefix   .field-has-suffix   .field-error
   → floating label needs placeholder=" " on the input (rides :placeholder-shown)

.stepper   .stepper-item   .stepper-dot   .stepper-label   .stepper-desc
.stepper-vertical   .stepper-mobile-stack     states: .active .complete .error .disabled

.tree   .tree-item   .tree-node   .tree-caret   .tree-icon   .tree-label   .tree-leaf
   → wrap children in <details><summary class="tree-node">; no JS needed

.context-menu   .context-menu-item   .context-menu-icon   .context-menu-shortcut
.context-menu-divider   .context-menu-label   .context-menu-item-danger
.menu-sub   .menu-sub-list   .menu-sub-left

.segmented   .segmented-item   .segmented-label   .segmented-sm/-lg/-full
.toggle-group   .toggle-group-vertical        (radio inputs inside .segmented-item)

.pin-input   .pin-digit   .pin-separator   .pin-input-sm/-lg/-error
.number-input   .number-input-field   .number-input-btn   (data-santy-step="down")
.color-picker  .color-swatch-grid  .color-swatch  .color-input  .color-picker-chip
.time-picker   .time-column   .time-option   .time-picker-footer
.calendar  .calendar-header  .calendar-weekdays  .calendar-grid  .calendar-cell
.calendar-date  .calendar-event(-success/-danger/-warning)  .calendar-compact
.uploader  .uploader-icon  .upload-list  .upload-item  .upload-progress-bar  .upload-remove
.skeleton-text  .skeleton-title  .skeleton-circle  .skeleton-rect  .skeleton-wave
.snackbar  .snackbar-message  .snackbar-action  .snackbar-left/-right
.banner  .banner-icon  .banner-body  .banner-actions  .banner-info/-success/-warning/-danger
.speed-dial  .speed-dial-actions  .speed-dial-action  .speed-dial-action-label
.bottom-nav  .bottom-nav-item  .bottom-nav-icon  .nav-rail  .nav-rail-item  .nav-rail-wide
.virtual-scroll  .infinite-sentinel  .infinite-loader
.loading-overlay  .backdrop  .backdrop-blur
.prose  .prose-sm  .prose-lg  .prose-xl  .prose-full   /* long-form CMS/Markdown HTML */
```

New JS modules: `Santy.table.sort(th)`, `Santy.table.selectAll(cb)`,
`Santy.combobox.open/close/filter/value`.
Events: `santy:sort`/`santy:sorted`, `santy:select`, `santy:change`,
`santy:complete` (pin), `santy:files` (uploader), `santy:loadmore` (infinite scroll).

## Semantic Theme Utilities (v2.7.0 — flip with data-theme / .dark)

```
background-surface   background-surface-alt   background-surface-raised
background-primary   background-secondary     background-accent
color-text           color-text-muted         color-primary   color-secondary
border-color-default border-color-primary
```
Prebuilt themes (santy-themes.css): <html data-theme="ocean|sunset|forest|midnight|mono">

## Email Module (santycss/css/email)

```
.email-wrapper       .email-container      .email-body-wrap
.email-header        .email-header-light   .email-footer
.email-hero          .email-hero-light     .email-hero-gradient
.email-h1/h2/h3      .email-p              .email-p-lead        .email-link
.email-btn           .email-btn-sm/lg/outline/dark/success/danger/warning
.email-card          .email-callout-success/warning/danger
.email-list          .email-check-list
.email-badge-blue/green/red/yellow/purple/gray/new
.email-stat-value    .email-stat-label
.email-spacer-4/8/16/24/32/48/64
.email-preheader     .email-unsubscribe    .email-legal
```

---

## Example: Card with blue left border and hover scale

```html
<div class="card padding-28 background-white radius-12 shadow-md border-left-4 border-color-blue-500 on-hover:scale-105 transition-all cursor-pointer">
  <h3 class="text-size-20 text-bold color-gray-900 margin-bottom-8">Card Title</h3>
  <p class="text-size-14 color-gray-500 line-height-relaxed">Card description goes here.</p>
</div>
```

## Example: Responsive flex hero

```html
<section class="display-flex flex-column align-center justify-center text-center padding-y-80 background-gray-50">
  <h1 class="text-size-56 text-bold color-gray-900 margin-bottom-16 md:text-size-40 on-mobile:text-size-32">
    Build faster
  </h1>
  <p class="text-size-20 color-gray-500 line-height-relaxed margin-bottom-32">
    Plain-English CSS that reads like you wrote it.
  </p>
  <a href="#" class="btn btn-primary btn-lg on-hover:scale-105 transition-all">Get started →</a>
</section>
```

## Example: Dark-mode card grid

```html
<div class="display-grid grid-columns-3 gap-24 on-mobile:grid-columns-1 md:grid-columns-2">
  <div class="card background-white dark:background-gray-800 shadow-sm on-hover:shadow-lg transition-all radius-16 padding-24">
    <span class="badge badge-primary margin-bottom-12">New</span>
    <h4 class="text-size-18 text-semibold color-gray-900 dark:color-white">Feature</h4>
    <p class="text-size-14 color-gray-500 dark:color-gray-400 line-height-relaxed">Description.</p>
  </div>
</div>
```

---

*Generated from SantyCSS v2.7.0 · https://santycss.santy.in · https://github.com/Santy-Labs/santyCSS*
