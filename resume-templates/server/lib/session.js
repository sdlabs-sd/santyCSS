/** Stateless signed-cookie sessions (HMAC-SHA256). */
import crypto from 'node:crypto';
import { config } from './config.js';

const COOKIE = 'sr_session';

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const sign = (payload) => crypto.createHmac('sha256', config.sessionSecret).update(payload).digest('base64url');

export function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function readSession(req) {
  const raw = parseCookies(req.headers.cookie)[COOKIE];
  if (!raw) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch { return null; }
}

function cookie(value, maxAgeSec) {
  return [
    `${COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSec}`,
    config.cookieDomain && `Domain=${config.cookieDomain}`,
    config.protocol === 'https' && 'Secure',
  ].filter(Boolean).join('; ');
}

export function sessionCookie(user) {
  const maxAge = config.sessionDays * 86400;
  const payload = b64(JSON.stringify({ email: user.email, name: user.name, picture: user.picture, exp: Date.now() + maxAge * 1000 }));
  return cookie(payload + '.' + sign(payload), maxAge);
}

export const clearCookie = () => cookie('', 0);
