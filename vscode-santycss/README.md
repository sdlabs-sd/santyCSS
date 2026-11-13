# SantyCSS IntelliSense

Autocomplete, hover docs, and CSS preview for [SantyCSS](https://santycss.santy.in) — the plain-English utility CSS framework.

## Features

### Autocomplete
Start typing any SantyCSS class inside `class=""` or `className=""` and get instant completions with CSS previews.

![Autocomplete demo](https://santycss.santy.in/assets/vscode-autocomplete.gif)

Works in: HTML, JSX, TSX, Vue, Svelte, PHP, ERB.

### Hover docs
Hover over any SantyCSS class to see the CSS it generates.

```html
<div class="display-flex align-center gap-16 padding-24">
  <!-- Hover any class to see its CSS -->
</div>
```

### SantyCSS 2.10 names
Completions follow the 2.10 grammar (`property-modifier-value`): `padding-24`, `display-flex`, `radius-12`, plus the new components (`button button-primary button-lg`). Pre-2.10 names such as `add-padding-24` still get hover docs, but they are marked deprecated and point to the new name. Run `npx santycss migrate` to update a project.

### Plain-English class names
SantyCSS classes read like English — no memorizing cryptic abbreviations:

| SantyCSS | What it does |
|---|---|
| `display-flex` | `display: flex` |
| `padding-16` | `padding: 16px` |
| `text-size-24` | `font-size: 24px` |
| `background-blue-500` | `background-color: #3b82f6` |
| `on-hover:scale-110` | Scale up on hover |
| `md:grid-columns-3` | 3 columns on medium+ screens |

## Installation

Search **"SantyCSS IntelliSense"** in the VS Code Extensions panel, or install from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=SantyCSS.santycss-intellisense).

## Settings

| Setting | Default | Description |
|---|---|---|
| `santycss.enabled` | `true` | Enable/disable IntelliSense |
| `santycss.showCSSOnHover` | `true` | Show CSS output on hover |
| `santycss.completionTrigger` | `"both"` | `"classAttr"` (inside class only), `"anywhere"`, or `"both"` |

## Commands

- **SantyCSS: Toggle IntelliSense** — quickly enable/disable via Command Palette (`Ctrl+Shift+P`)

## About SantyCSS

SantyCSS is a utility-first CSS framework with 5,100+ classes and no build step required.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/santycss@2/dist/santy.css">
```

→ [santycss.santy.in](https://santycss.santy.in)
