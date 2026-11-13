# Theme: Persimmon

SantyCSS v2.10 ships its own look. It's called **Persimmon**, and it lives in `santy-ui.css` and `santy-next.css`. Every value in it is a CSS variable.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/santycss@2.10/dist/santy-next.css">
```

## Design direction

**Warm paper, ink type, one persimmon accent. It's tactile, editorial and calm.**

Tailwind's defaults are cool and neutral: slate grays, a blue-500 primary, an 8px radius and soft gray shadows, with sans-serif everywhere. daisyUI's defaults are playful: saturated purple, pink and teal, big round pills and bouncy states. Persimmon takes neither route. It is modelled on a well-made notebook or a printed annual report, which is a good fit for products people use to do serious work.

| Decision | Persimmon | Tailwind default | daisyUI default |
|---|---|---|---|
| Page background | Warm paper `#faf7f2` | White | White / base-100 |
| Text | Warm ink `#1d1a16` | Gray-900, cool | base-content |
| Primary | Persimmon `#cc4520` | Blue-500 `#3b82f6` | Purple / indigo |
| Secondary | Ink, so the second action is black, not gray | Gray | Pink |
| Headings | Serif display (Iowan, Palatino, Georgia) | Sans | Sans |
| Labels | Tracked uppercase mono "eyebrows" | None | None |
| Buttons | 10px radius, a 2px bottom bevel, pressing moves it down 1px | No component; usually `rounded-md`, flat | Rounded, scale on press |
| Badges | Squared 6px "tags" | No component; usually `rounded-full` | Full pill |
| Cards | 16px radius, hairline warm border, long low shadow | No component; usually `rounded-lg shadow` | 16px radius, no border |
| Shadows | Warm-tinted brown with a 1px key line on top | Neutral black | Minimal |
| Dark mode | Warm charcoal `#15120f` with a brighter persimmon and ink text on it | Slate-900, blue-black | Dark gray |

### The five signatures
1. **Serif headlines on a sans UI.** `h1`–`h3`, card titles, modal titles and prices use `--santy-font-display`. Body text and controls use the system sans, so the UI stays legible and the headlines carry the voice. There are no web fonts to load: the stack picks up Iowan Old Style on Apple devices, Palatino Linotype on Windows and Georgia everywhere else.
2. **Persimmon is used sparingly.** It marks one action per view, the active nav link, focus rings and the featured plan. Everything else is ink on paper. The other colours are status colours only.
3. **Buttons you can press.** `--santy-bevel` is an inset 2px shade at the bottom edge. On `:active` the button moves down 1px and the bevel goes flat.
4. **Eyebrows.** `.eyebrow` is a short rule plus a mono, uppercase, 0.14em-tracked label above headings. Pricing plan names use the same style.
5. **Squared tags, round panels.** Small things (badges) are crisp at 6px. Controls sit in the middle at 10px. Containers are soft at 16–22px. The radius grows with the size of the element.

### Accessibility
Every text and background pair used by the components meets WCAG AA (4.5:1). For example, white on persimmon is 4.7:1, muted text on paper 5.3:1, every status pair 5.1:1 or better, and ink on dark-mode persimmon 6.6:1. Focus is a visible 2px persimmon outline or a 4px halo. `prefers-reduced-motion` turns off lifts and entrance animation.

## Tokens

All tokens use the existing `--santy-*` namespace, so the `data-theme` presets in `santy-themes.css` (ocean, sunset, forest, midnight, mono) restyle the components too.

| Group | Tokens |
|---|---|
| Brand | `--santy-primary` `-dark` `-light` `-contrast`, `--santy-secondary` `-dark` `-light` `-contrast`, `--santy-accent` |
| Status | `--santy-success` / `-light`, `--santy-warning` / `-light`, `--santy-danger` / `-light`, `--santy-info` / `-light` |
| Surfaces | `--santy-surface` (page), `--santy-surface-alt` (sunken), `--santy-surface-raised` (cards), `--santy-border-color`, `--santy-border-strong`, `--santy-backdrop`, `--santy-focus` |
| Text | `--santy-text`, `--santy-text-muted` |
| Radius | `--santy-radius-sm` 6 · `--santy-radius` 10 · `--santy-radius-md` 16 · `--santy-radius-lg` 22 · `--santy-radius-xl` 28 · `--santy-radius-full` |
| Depth | `--santy-shadow-sm` · `--santy-shadow` · `-md` · `-lg` · `-xl` · `--santy-shadow-inner` · `--santy-bevel` |
| Type | `--santy-font-sans` · `--santy-font-display` · `--santy-font-mono`; scale `--santy-text-xs` 12 · `sm` 14 · `base` 16 · `lg` 20 · `xl` 25 · `2xl` 31 · `3xl` 39 · `4xl` 49 · `5xl` 61 (major third, ×1.25); `--santy-leading` 1.6 · `--santy-leading-tight` 1.12; `--santy-tracking-display` · `--santy-tracking-label` |
| Space | `--santy-space` 4px grid · `--santy-control-sm/md/lg` 32/40/48 · `--santy-section` 96 |
| Motion | `--santy-ease` · `--santy-duration` 160ms |

**The spacing feel is roomy.** Controls are 40px tall by default, with 18px of horizontal padding on buttons and 24px of padding inside cards. Sections are 96px apart. Dense dashboards can use the `-sm` sizes or set `--santy-control-md: 36px`.

## Customising

Change the brand in two lines:

```css
:root {
  --santy-primary: #2f6f4f;  --santy-primary-dark: #245a40;  --santy-primary-light: #dcefe3;
  --santy-font-display: var(--santy-font-sans);   /* all-sans headings */
}
```

Re-theme one section only (tokens cascade):

```html
<section style="--santy-primary:#245683; --santy-primary-dark:#1b4266">…</section>
```

Each component also exposes local variables for one-off tweaks, such as `--button-bg`, `--card-pad`, `--badge-bg`, `--modal-w`, `--navbar-h` and `--pricing-pad`.

## Dark mode

```html
<html data-theme="dark">   <!-- always dark -->
<html data-theme="auto">   <!-- follow the OS -->
<html class="dark">        <!-- same as data-theme="dark" -->
```

Light is the default when no attribute is set, so a page never flips to dark unexpectedly.

## Files

| File | Contents | Use with |
|---|---|---|
| `santy-next.css` | components → grammar-only utilities (with sm/md/lg/xl) → theme | nothing else; this is the one file for new projects |
| `santy-ui.css` | theme + components only | `santy-core.css`, or on its own |
| `santy-start.css`, `santy.css` | unchanged v2.9 look, with legacy and grammar names | existing sites |

`santy-ui.css` should not be combined with `santy-start.css` or `santy.css`. Those bundles still carry the classic `.card`, `.badge`, `.alert`, `.navbar`, `.input` and `.tabs`, whose rules would mix with the new ones. v3 will make Persimmon the default and drop the classic components.
