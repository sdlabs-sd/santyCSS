/** Server-side HTML for hosted resume sites (boot data injection + status pages). */
import fs from 'node:fs';
import path from 'node:path';
import { TEMPLATES_DIR, config } from './config.js';

const shellCache = {};
function shell(framework) {
  if (!shellCache[framework] || !config.production) {
    const file = path.join(TEMPLATES_DIR, framework, 'dist', 'index.html');
    if (!fs.existsSync(file)) return null;
    shellCache[framework] = fs.readFileSync(file, 'utf8');
  }
  return shellCache[framework];
}

export const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** JSON safe to inline in <script>: no "</script>", no U+2028/9 surprises. */
const inlineJson = (v) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export const siteUrl = (sub) => `${config.protocol}://${sub}.${config.rootDomain}`;

export function renderSite(site) {
  const html = shell(site.framework);
  if (!html) return null;
  const b = site.data.basics || {};
  const title = b.name ? `${b.name}${b.title ? ' — ' + b.title : ''}` : 'Resume';
  const desc = (b.summary || '').slice(0, 160);
  const boot = {
    subdomain: site.subdomain,
    templateId: site.templateId,
    accent: site.accent,
    data: site.data,
    ownerEmail: site.ownerEmail,
    apiBase: '',
    loginUrl: `${config.publicUrl}/account?return=${encodeURIComponent(siteUrl(site.subdomain) + '/?admin')}`,
  };
  const head = [
    `<meta name="description" content="${esc(desc)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:type" content="profile" />`,
    `<script>window.__RESUME_SITE__ = ${inlineJson(boot)};</script>`,
  ].join('\n    ');
  return html.replace('<title>Resume</title>', `<title>${esc(title)}</title>`).replace('<!--resume-head-->', head);
}

export function statusPage(title, message, action) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><link rel="stylesheet" href="${config.publicUrl}/santy.css"></head>
<body class="reset-margins font-sans background-slate-50 min-height-screen make-flex align-center justify-center add-padding-24">
<main class="max-width-480 background-white round-corners-20 add-shadow-lg add-padding-40 text-center">
<h1 class="set-text-28 text-extrabold color-slate-900">${esc(title)}</h1>
<p class="set-text-15 color-slate-600 add-margin-top-12 line-height-relaxed">${esc(message)}</p>
${action ? `<a href="${esc(action.href)}" class="make-inline-block add-margin-top-24 add-padding-x-20 add-padding-y-10 make-pill background-blue-600 on-hover:background-blue-700 color-white text-bold text-no-decoration">${esc(action.label)}</a>` : ''}
</main></body></html>`;
}
