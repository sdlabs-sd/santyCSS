# SantyCSS Resume Templates

A resume template marketplace built entirely with SantyCSS classes:

* **12 templates, one per job title.** Each comes in **React 19** and **Vue 3**.
  * 8 are free.
  * 4 are premium at **$10** each: Boardroom, Roadmap, Counsel and Physician.
* **Every template has an admin editor.** It can:
  * edit every section of the resume
  * reorder entries
  * switch template and accent colour
  * import and export JSON
  * print to PDF
* **There are two ways to use a template.** Both are offered on the marketplace page:
  1. **Download and self-host.** You get a zip with a ready-to-run Vite project. The editor saves drafts in the browser.
  2. **Hosted.** For **₹999 a year** the site goes live at `yourname.<ROOT_DOMAIN>`. The owner **signs in with Google (Gmail)** and edits it live.

```
resume-templates/
  catalog.json        templates, job titles, tiers, prices, accents
  samples/*.json      sample resume per job title
  shared/             framework-agnostic: schema (drives both editors), accents, persistence
  react/              Vite + React app: src/templates/*.jsx, src/admin/AdminPanel.jsx
  vue/                Vite + Vue 3 app: src/templates/*.vue, src/admin/AdminPanel.vue (same DOM + classes)
  web/                marketplace + account pages (vanilla JS, SantyCSS classes)
  server/             zero-dependency Node server: marketplace, API, payments, hosting
```

## Run locally

```bash
cd resume-templates
npm run setup          # installs react/ and vue/
npm run build          # builds SantyCSS, then both apps
npm run dev:server     # http://localhost:8787 — mock payments + email "dev sign-in"
```

* **Payments in local runs:** with no Razorpay keys and `NODE_ENV` not set to production, checkout runs in **mock mode**. A confirm dialog stands in for the payment. Mock mode is impossible in production.
* **Testing sub-domains:** use `ROOT_DOMAIN=lvh.me:8787` (it resolves to 127.0.0.1). Browsers will not share cookies across `*.localhost`.
* **Template development:** `npm --prefix react run dev` or `npm --prefix vue run dev`. Open `?template=<id>&admin`.

## Production setup

1. **DNS.** Add an A/AAAA record for `ROOT_DOMAIN` and a **wildcard** `*.ROOT_DOMAIN` that both point at the server.
2. **TLS.** Get a wildcard certificate, for example Let's Encrypt with a DNS-01 challenge, or put Cloudflare in front. Terminate TLS at your proxy and forward the `Host` header unchanged.
3. **Google sign-in.**
   * In Google Cloud Console, open APIs & Services → Credentials, then create an OAuth client ID of type *Web*.
   * Add `https://ROOT_DOMAIN` as an authorised JavaScript origin.
   * Sub-domains don't need to be added: sign-in always happens on the root domain. The session cookie is scoped to `.ROOT_DOMAIN`, so the owner is also signed in on their site.
4. **Razorpay.**
   * Create API keys and enable **international payments** so the $10 USD premium checkout works.
   * Add a webhook to `https://ROOT_DOMAIN/api/webhooks/razorpay` for `payment.captured` and `order.paid`. It fulfils orders even if the buyer closes the tab.
5. **Environment variables:**

| Variable | Example | Notes |
|---|---|---|
| `NODE_ENV` | `production` | turns on the required-config checks |
| `ROOT_DOMAIN` | `resumes.santy.in` | marketplace host; sites are `<name>.ROOT_DOMAIN` |
| `PUBLIC_URL` | `https://resumes.santy.in` | defaults to `https://ROOT_DOMAIN` |
| `SESSION_SECRET` | 32+ random chars | signs the session cookie |
| `GOOGLE_CLIENT_ID` | `…apps.googleusercontent.com` | |
| `GMAIL_ONLY` | `1` | optional: accept only @gmail.com, not Workspace accounts |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | | |
| `RAZORPAY_WEBHOOK_SECRET` | | |
| `DATA_DIR` | `/var/lib/resumes` | where `db.json` lives; back it up |
| `PORT` | `8787` | |

Then run `npm run build && npm start`.

Prices live in `catalog.json` → `pricing`, in paise and cents.

## How the server works

| Request | Served |
|---|---|
| `ROOT_DOMAIN/` | marketplace (`web/index.html`) |
| `ROOT_DOMAIN/account` | Google sign-in, my sites (edit / renew), my premium templates |
| `ROOT_DOMAIN/preview/{react,vue}/?template=id` | built apps, used for live previews and thumbnails |
| `name.ROOT_DOMAIN/` | the hosted resume: the built app with the site's data injected |
| `GET /api/download/:id?framework=react\|vue` | a zip of one template. Its `santy.css` is purged, and premium templates require a purchase |

### Hosted-site security

* **CSRF.** State-changing requests must send JSON and come from the root domain or one of its sub-domains.
* **Site edits.** Only the owner's Google account can change a site.
* **Stored data.** Resume data is sanitised on the server: bounded strings only, never HTML.
* **Rendering.**
  * The inlined boot JSON escapes `<`.
  * Templates render text through React/Vue escaping.
  * Links pass through `safeUrl()`, so `javascript:` URLs never render.

### Storage

`server/lib/db.js` is a JSON file with atomic writes, which suits a single instance. If you need more, replace it with Postgres or SQLite behind the same `tx()` / `read()` functions.

## Adding a template

1. Add an entry to `catalog.json` and a sample to `samples/`.
2. Create `react/src/templates/Name.jsx` and `vue/src/templates/Name.vue`, using SantyCSS classes only. Write accent classes through the `accent` prop (`accent.solid`, `accent.text`, …).
3. Register the template in both `templates/index.js` files.
4. Run `npm test`. The class audit fails on any class SantyCSS doesn't define.
