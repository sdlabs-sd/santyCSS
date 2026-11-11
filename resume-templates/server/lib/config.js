import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const SERVER_DIR = path.resolve(here, '..');
export const TEMPLATES_DIR = path.resolve(SERVER_DIR, '..');   // resume-templates/
export const REPO_DIR = path.resolve(TEMPLATES_DIR, '..');     // santyCSS/

const env = process.env;
const production = env.NODE_ENV === 'production';

// ROOT_DOMAIN is where the marketplace lives; hosted resumes live one label
// below it: aarav.<ROOT_DOMAIN>. May include a port in development.
const rootDomain = (env.ROOT_DOMAIN || 'localhost:8787').toLowerCase();
const publicUrl = (env.PUBLIC_URL || (production ? 'https://' : 'http://') + rootDomain).replace(/\/$/, '');
const rootHostname = rootDomain.replace(/:\d+$/, '');

if (production) {
  for (const k of ['SESSION_SECRET', 'GOOGLE_CLIENT_ID', 'ROOT_DOMAIN']) {
    if (!env[k]) throw new Error(`${k} must be set in production`);
  }
  if (env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters');
}

export const config = {
  production,
  port: Number(env.PORT || 8787),
  rootDomain,
  rootHostname,
  publicUrl,
  protocol: publicUrl.startsWith('https') ? 'https' : 'http',
  // Cookie shared by the marketplace and every <name>.<root> site so the owner
  // signs in once. Browsers refuse Domain=localhost, so it is host-only there
  // (use ROOT_DOMAIN=lvh.me:8787 to test subdomains locally).
  cookieDomain: env.COOKIE_DOMAIN || (rootHostname === 'localhost' ? '' : '.' + rootHostname),
  sessionSecret: env.SESSION_SECRET || 'dev-only-secret-change-me-dev-only-secret',
  sessionDays: Number(env.SESSION_DAYS || 30),
  googleClientId: env.GOOGLE_CLIENT_ID || '',
  // Restrict sign-in to Gmail addresses only (default: any verified Google account).
  gmailOnly: env.GMAIL_ONLY === '1',
  allowDevLogin: !production && env.ALLOW_DEV_LOGIN === '1',
  razorpay: {
    keyId: env.RAZORPAY_KEY_ID || '',
    keySecret: env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  dataDir: path.resolve(env.DATA_DIR || path.join(SERVER_DIR, 'data')),
  hostingDays: Number(env.HOSTING_DAYS || 365),
};

/** razorpay (live keys) | mock (local testing, never in production) | disabled */
export const paymentMode = config.razorpay.keyId && config.razorpay.keySecret
  ? 'razorpay'
  : (production ? 'disabled' : 'mock');

export const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'app', 'admin', 'root', 'mail', 'email', 'smtp', 'ftp', 'cdn', 'static', 'assets',
  'preview', 'account', 'login', 'auth', 'help', 'support', 'status', 'blog', 'docs', 'dev', 'test',
  'staging', 'santy', 'santycss', 'billing', 'pay', 'payments', 'dashboard', 'resume', 'resumes',
]);
