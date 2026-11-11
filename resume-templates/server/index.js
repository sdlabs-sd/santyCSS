/**
 * SantyCSS Resume Templates — marketplace + subdomain hosting server.
 *
 *   https://<ROOT_DOMAIN>/            marketplace (browse, preview, download, buy)
 *   https://<ROOT_DOMAIN>/account     Google sign-in, my sites, my templates
 *   https://<name>.<ROOT_DOMAIN>/     a hosted resume (owner edits it with ?admin)
 *
 * Zero dependencies: node:http + fetch. See README.md for configuration.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { config, paymentMode, RESERVED_SUBDOMAINS, TEMPLATES_DIR, REPO_DIR } from './lib/config.js';
import * as db from './lib/db.js';
import { readSession, sessionCookie, clearCookie } from './lib/session.js';
import { verifyGoogleCredential, httpError } from './lib/google.js';
import { createGatewayOrder, verifyCheckoutSignature, verifyWebhookSignature } from './lib/payments.js';
import { catalog, templateById, sampleFor, sanitizeResume, FRAMEWORKS } from './lib/catalog.js';
import { buildPackage } from './lib/packager.js';
import { renderSite, statusPage, siteUrl } from './lib/render.js';

const require = createRequire(import.meta.url);
const { purge } = require(path.join(REPO_DIR, 'lib', 'purge-core.js'));

const DAY = 86400000;
const WEB_DIR = path.join(TEMPLATES_DIR, 'web');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

/* ── helpers ──────────────────────────────────────────────────────────────── */
function send(res, status, body, headers = {}) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
  res.writeHead(status, {
    'Content-Type': typeof body === 'string' ? 'text/html; charset=utf-8' : 'application/json',
    'Content-Length': buf.length,
    ...headers,
  });
  res.end(buf);
}
const json = (res, status, obj, headers) => send(res, status, Buffer.from(JSON.stringify(obj)), { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers });

function readBody(req, limit = 512 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(httpError(413, 'Request too large.')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
async function readJson(req) {
  const raw = await readBody(req);
  try { return raw ? JSON.parse(raw) : {}; } catch { throw httpError(400, 'Invalid JSON.'); }
}

function serveFile(res, base, rel, extraHeaders = {}) {
  const file = path.resolve(base, '.' + path.posix.normalize('/' + rel));
  if (!file.startsWith(base + path.sep) && file !== base) return false;
  let stat;
  try { stat = fs.statSync(file); } catch { return false; }
  if (!stat.isFile()) return false;
  const hashed = /[.-][A-Za-z0-9_-]{8,}\.(js|css)$/.test(file);
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
    ...extraHeaders,
  });
  fs.createReadStream(file).pipe(res);
  return true;
}

/** State-changing requests must be JSON and come from our own origins (CSRF). */
function assertSameSite(req) {
  if (!/^application\/json/.test(req.headers['content-type'] || '')) throw httpError(415, 'Expected application/json.');
  const origin = req.headers.origin;
  if (!origin) return;
  let host;
  try { host = new URL(origin).host.toLowerCase(); } catch { throw httpError(403, 'Bad origin.'); }
  if (host !== config.rootDomain && !host.endsWith('.' + config.rootDomain)) throw httpError(403, 'Cross-site request blocked.');
}

/* Simple fixed-window rate limit per IP + bucket. */
const hits = new Map();
function rateLimit(req, bucket, max, windowMs = 60000) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const key = bucket + ':' + ip;
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) { hits.set(key, { n: 1, reset: now + windowMs }); return; }
  if (++h.n > max) throw httpError(429, 'Too many requests, slow down.');
}
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (v.reset < now) hits.delete(k); }, 60000).unref();

function requireUser(req) {
  const s = readSession(req);
  if (!s) throw httpError(401, 'Please sign in with Google first.');
  return s;
}

/* ── domain logic ─────────────────────────────────────────────────────────── */
const SUBDOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;

function subdomainStatus(name, email) {
  const sub = String(name || '').toLowerCase();
  if (!SUBDOMAIN_RE.test(sub) || sub.includes('--')) return { available: false, reason: '3–30 characters: letters, numbers and single hyphens.' };
  if (RESERVED_SUBDOMAINS.has(sub)) return { available: false, reason: 'That name is reserved.' };
  const state = db.read();
  if (state.sites[sub]) return { available: false, reason: 'Already taken.' };
  const r = state.reservations[sub];
  if (r && r.expires > Date.now() && r.email !== email) return { available: false, reason: 'Someone is checking out with this name right now.' };
  return { available: true, subdomain: sub };
}

const owns = (state, email, templateId) => (state.purchases[email] || []).includes(templateId);

function siteSummary(site) {
  return {
    subdomain: site.subdomain, url: siteUrl(site.subdomain), templateId: site.templateId, framework: site.framework,
    expiresAt: site.expiresAt, active: site.expiresAt > Date.now(), createdAt: site.createdAt,
  };
}

/** Idempotent: safe to call from both the browser callback and the webhook. */
function fulfil(state, order, paymentId) {
  if (order.status === 'paid') return order.result;
  const now = Date.now();
  let result;
  if (order.kind === 'premium') {
    const list = state.purchases[order.email] || (state.purchases[order.email] = []);
    if (!list.includes(order.templateId)) list.push(order.templateId);
    result = { kind: 'premium', templateId: order.templateId };
  } else if (order.kind === 'hosting') {
    const existing = state.sites[order.subdomain];
    if (existing && existing.ownerEmail !== order.email) {
      // Lost a race despite the reservation — keep the money traceable for a refund.
      order.status = 'conflict';
      throw httpError(409, 'That sub-domain was taken while you paid. Contact support for a refund or a different name.');
    }
    const t = templateById(order.templateId);
    state.sites[order.subdomain] = existing || {
      subdomain: order.subdomain, ownerEmail: order.email, templateId: t.id, framework: order.framework,
      accent: t.accent, data: sanitizeResume(sampleFor(t)), createdAt: now, updatedAt: now,
      expiresAt: now + config.hostingDays * DAY, orders: [],
    };
    state.sites[order.subdomain].orders.push(order.id);
    delete state.reservations[order.subdomain];
    result = { kind: 'hosting', ...siteSummary(state.sites[order.subdomain]), editUrl: siteUrl(order.subdomain) + '/?admin' };
  } else if (order.kind === 'renewal') {
    const site = state.sites[order.subdomain];
    site.expiresAt = Math.max(now, site.expiresAt) + config.hostingDays * DAY;
    site.orders.push(order.id);
    result = { kind: 'renewal', ...siteSummary(site) };
  }
  Object.assign(order, { status: 'paid', paymentId, paidAt: now, result });
  return result;
}

/* ── API ──────────────────────────────────────────────────────────────────── */
async function api(req, res, url) {
  const p = url.pathname;
  const m = req.method;

  if (p === '/api/config' && m === 'GET') {
    return json(res, 200, {
      googleClientId: config.googleClientId, devLogin: config.allowDevLogin,
      payments: paymentMode, razorpayKeyId: config.razorpay.keyId,
      rootDomain: config.rootDomain, publicUrl: config.publicUrl, pricing: catalog.pricing,
    });
  }

  if (p === '/api/catalog' && m === 'GET') return json(res, 200, catalog, { 'Cache-Control': 'public, max-age=300' });

  if (p === '/api/me' && m === 'GET') {
    const s = readSession(req);
    if (!s) return json(res, 200, { user: null, purchases: [], sites: [] });
    const state = db.read();
    return json(res, 200, {
      user: { email: s.email, name: s.name, picture: s.picture },
      purchases: state.purchases[s.email] || [],
      sites: Object.values(state.sites).filter(x => x.ownerEmail === s.email).map(siteSummary),
    });
  }

  if (p === '/api/auth/google' && m === 'POST') {
    assertSameSite(req);
    rateLimit(req, 'auth', 20);
    const { credential } = await readJson(req);
    const user = await verifyGoogleCredential(credential);
    await db.tx(state => {
      state.users[user.email] = { ...(state.users[user.email] || { createdAt: Date.now() }), ...user, lastLoginAt: Date.now() };
    });
    return json(res, 200, { user: { email: user.email, name: user.name, picture: user.picture } }, { 'Set-Cookie': sessionCookie(user) });
  }

  if (p === '/api/auth/dev' && m === 'POST') {
    if (!config.allowDevLogin) throw httpError(404, 'Not found.');
    assertSameSite(req);
    const { email } = await readJson(req);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || '')) throw httpError(400, 'Enter an email.');
    const user = { email: email.toLowerCase(), name: email.split('@')[0], picture: '' };
    return json(res, 200, { user }, { 'Set-Cookie': sessionCookie(user) });
  }

  if (p === '/api/auth/logout' && m === 'POST') {
    assertSameSite(req);
    return json(res, 200, { ok: true }, { 'Set-Cookie': clearCookie() });
  }

  let mm;
  if ((mm = p.match(/^\/api\/subdomains\/([^/]+)$/)) && m === 'GET') {
    rateLimit(req, 'sub', 60);
    const s = readSession(req);
    return json(res, 200, subdomainStatus(decodeURIComponent(mm[1]), s && s.email));
  }

  if (p === '/api/checkout' && m === 'POST') {
    assertSameSite(req);
    rateLimit(req, 'checkout', 20);
    const user = requireUser(req);
    const body = await readJson(req);
    const state = db.read();
    const kind = body.kind;
    let amount, currency, order;

    if (kind === 'premium') {
      const t = templateById(body.templateId);
      if (!t || t.tier !== 'premium') throw httpError(400, 'Not a premium template.');
      if (owns(state, user.email, t.id)) throw httpError(409, 'You already own this template.');
      ({ amount, currency } = catalog.pricing.premium);
      order = { kind, templateId: t.id };
    } else if (kind === 'hosting') {
      const t = templateById(body.templateId);
      if (!t) throw httpError(400, 'Unknown template.');
      if (!FRAMEWORKS.includes(body.framework)) throw httpError(400, 'Choose React or Vue.');
      if (t.tier === 'premium' && !owns(state, user.email, t.id)) throw httpError(402, 'Buy this premium template first, then add hosting.');
      const st = subdomainStatus(body.subdomain, user.email);
      if (!st.available) throw httpError(409, st.reason);
      ({ amount, currency } = catalog.pricing.hosting);
      order = { kind, templateId: t.id, framework: body.framework, subdomain: st.subdomain };
    } else if (kind === 'renewal') {
      const site = state.sites[String(body.subdomain || '').toLowerCase()];
      if (!site || site.ownerEmail !== user.email) throw httpError(404, 'Site not found.');
      ({ amount, currency } = catalog.pricing.hosting);
      order = { kind, subdomain: site.subdomain };
    } else {
      throw httpError(400, 'Unknown checkout type.');
    }

    const receipt = 'rt_' + crypto.randomBytes(6).toString('hex');
    const gw = await createGatewayOrder({ amount, currency, receipt, notes: { kind, email: user.email, ...order } });
    await db.tx(s => {
      s.orders[gw.id] = { id: gw.id, ...order, email: user.email, amount, currency, receipt, status: 'created', createdAt: Date.now() };
      if (kind === 'hosting') s.reservations[order.subdomain] = { email: user.email, expires: Date.now() + 30 * 60000 };
    });
    return json(res, 200, {
      orderId: gw.id, amount, currency, mode: paymentMode, keyId: config.razorpay.keyId,
      description: kind === 'premium' ? `Premium template — ${order.templateId}` : `Hosting — ${order.subdomain}.${config.rootDomain} (1 year)`,
      prefill: { email: user.email, name: user.name },
    });
  }

  if (p === '/api/checkout/verify' && m === 'POST') {
    assertSameSite(req);
    const user = requireUser(req);
    const { orderId, paymentId, signature } = await readJson(req);
    const order = db.read().orders[orderId];
    if (!order || order.email !== user.email) throw httpError(404, 'Order not found.');
    if (!verifyCheckoutSignature({ orderId, paymentId: String(paymentId || ''), signature })) throw httpError(400, 'Payment signature mismatch.');
    const result = await db.tx(state => fulfil(state, state.orders[orderId], paymentId));
    return json(res, 200, { ok: true, result });
  }

  if (p === '/api/webhooks/razorpay' && m === 'POST') {
    const raw = await readBody(req, 1024 * 1024);
    if (!verifyWebhookSignature(raw, req.headers['x-razorpay-signature'])) throw httpError(400, 'Bad signature.');
    const evt = JSON.parse(raw);
    const pay = evt.payload && evt.payload.payment && evt.payload.payment.entity;
    if ((evt.event === 'payment.captured' || evt.event === 'order.paid') && pay && db.read().orders[pay.order_id]) {
      await db.tx(state => { try { fulfil(state, state.orders[pay.order_id], pay.id); } catch (e) { console.error('webhook fulfil', e.message); } });
    }
    return json(res, 200, { ok: true });
  }

  if ((mm = p.match(/^\/api\/download\/([\w-]+)$/)) && m === 'GET') {
    rateLimit(req, 'download', 30);
    const t = templateById(mm[1]);
    const framework = url.searchParams.get('framework') || 'react';
    if (!t || !FRAMEWORKS.includes(framework)) throw httpError(404, 'Unknown template.');
    if (t.tier === 'premium') {
      const s = readSession(req);
      if (!s) throw httpError(401, 'Sign in to download premium templates you own.');
      if (!owns(db.read(), s.email, t.id)) throw httpError(402, 'Purchase this template to download it.');
    }
    const { filename, buffer } = buildPackage(t.id, framework, config.publicUrl);
    return send(res, 200, buffer, {
      'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'private, no-store',
    });
  }

  if ((mm = p.match(/^\/api\/sites\/([\w-]+)$/)) && m === 'PUT') {
    assertSameSite(req);
    rateLimit(req, 'save', 60);
    const user = requireUser(req);
    const body = await readJson(req);
    const result = await db.tx(state => {
      const site = state.sites[mm[1].toLowerCase()];
      if (!site || site.ownerEmail !== user.email) throw httpError(404, 'Site not found.');
      if (site.expiresAt < Date.now()) throw httpError(402, 'Hosting has expired — renew to keep editing.');
      if (body.templateId && body.templateId !== site.templateId) {
        const t = templateById(body.templateId);
        if (!t) throw httpError(400, 'Unknown template.');
        if (t.tier === 'premium' && !owns(state, user.email, t.id)) throw httpError(402, 'Buy this premium template to use it.');
        site.templateId = t.id;
      }
      if (body.accent) {
        if (!catalog.accents.includes(body.accent)) throw httpError(400, 'Unknown accent.');
        site.accent = body.accent;
      }
      if (body.data) site.data = sanitizeResume(body.data);
      site.updatedAt = Date.now();
      return siteSummary(site);
    });
    return json(res, 200, { ok: true, site: result });
  }

  throw httpError(404, 'Not found.');
}

/* ── marketplace stylesheet: SantyCSS purged to what web/ uses ───────────── */
let webCss = null;
function marketplaceCss() {
  if (webCss && config.production) return webCss;
  const content = fs.readdirSync(WEB_DIR).filter(f => /\.(html|js)$/.test(f)).map(f => path.join(WEB_DIR, f));
  const full = fs.readFileSync(path.join(REPO_DIR, 'dist', 'santy.css'), 'utf8');
  // render.js holds the markup of the status pages served on hosted domains.
  webCss = purge({ css: full, content: [...content, path.join(TEMPLATES_DIR, 'server', 'lib', 'render.js')], minifyOutput: true }).css;
  return webCss;
}

/* ── request handler ──────────────────────────────────────────────────────── */
async function handle(req, res) {
  const host = String(req.headers.host || '').toLowerCase();
  const url = new URL(req.url, 'http://x');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);

    // Hosted resume: <name>.<root>
    if (host !== config.rootDomain && host.endsWith('.' + config.rootDomain)) {
      const sub = host.slice(0, -(config.rootDomain.length + 1));
      const site = db.read().sites[sub];
      if (!site) return send(res, 404, statusPage('Nothing here yet', `${sub}.${config.rootDomain} is available — claim it for your resume.`, { href: config.publicUrl, label: 'Browse templates' }));
      if (url.pathname.startsWith('/assets/')) {
        if (serveFile(res, path.join(TEMPLATES_DIR, site.framework, 'dist'), url.pathname)) return;
        return send(res, 404, 'Not found');
      }
      if (site.expiresAt < Date.now()) {
        return send(res, 410, statusPage('This resume is offline', 'The hosting plan for this site has expired. If it is yours, renew it from your account.', { href: config.publicUrl + '/account', label: 'Renew hosting' }));
      }
      const html = renderSite(site);
      if (!html) return send(res, 503, statusPage('Building…', 'The site bundle is missing. Run "npm run build" in resume-templates.'));
      return send(res, 200, html, { 'Cache-Control': 'no-store', 'X-Frame-Options': 'SAMEORIGIN' });
    }

    // Marketplace (root domain)
    const page = { '/': 'index.html', '/index.html': 'index.html', '/account': 'account.html' }[url.pathname];
    if (page && serveFile(res, WEB_DIR, page, { 'Cache-Control': 'no-cache', 'X-Frame-Options': 'DENY' })) return;
    if (url.pathname === '/santy.css') return send(res, 200, Buffer.from(marketplaceCss()), { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'public, max-age=300' });
    if (url.pathname.startsWith('/web/') && serveFile(res, WEB_DIR, url.pathname.slice(4))) return;
    let pm;
    if ((pm = url.pathname.match(/^\/preview\/(react|vue)(\/.*)?$/))) {
      const rel = !pm[2] || pm[2] === '/' ? 'index.html' : pm[2];
      if (!pm[2]) return send(res, 301, '', { Location: url.pathname + '/' + url.search });
      if (serveFile(res, path.join(TEMPLATES_DIR, pm[1], 'dist'), rel, { 'X-Frame-Options': 'SAMEORIGIN' })) return;
      return send(res, 404, statusPage('Preview not built', `Run "npm run build" in resume-templates/${pm[1]}.`));
    }
    if (url.pathname === '/favicon.ico' && serveFile(res, path.join(REPO_DIR, 'assest'), 'santy_css.png')) return;
    return send(res, 404, statusPage('Page not found', 'That page does not exist.', { href: '/', label: 'Back to templates' }));
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(e);
    if (url.pathname.startsWith('/api/')) return json(res, status, { error: status === 500 ? 'Something went wrong.' : e.message });
    return send(res, status, statusPage('Error', status === 500 ? 'Something went wrong.' : e.message));
  }
}

export const server = http.createServer((req, res) => { handle(req, res); });

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  server.listen(config.port, () => {
    console.log(`Resume marketplace on ${config.publicUrl}  (port ${config.port}, payments: ${paymentMode}${config.allowDevLogin ? ', dev login ON' : ''})`);
    console.log(`Hosted sites at ${config.protocol}://<name>.${config.rootDomain}`);
  });
}
