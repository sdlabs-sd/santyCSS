/**
 * Google Sign-In ("Sign in with Google" / Gmail) — verifies the ID token the
 * Google Identity Services button returns. Uses Google's tokeninfo endpoint so
 * there's no JWT/JWKS dependency; it validates signature + expiry server-side.
 */
import { config } from './config.js';

export async function verifyGoogleCredential(credential) {
  if (!config.googleClientId) throw httpError(503, 'Google sign-in is not configured (GOOGLE_CLIENT_ID).');
  if (typeof credential !== 'string' || credential.length > 4096) throw httpError(400, 'Missing credential.');

  const res = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential));
  if (!res.ok) throw httpError(401, 'Google could not verify this sign-in.');
  const t = await res.json();

  if (t.aud !== config.googleClientId) throw httpError(401, 'Token was issued for a different app.');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(t.iss)) throw httpError(401, 'Unexpected token issuer.');
  if (Number(t.exp) * 1000 < Date.now()) throw httpError(401, 'Sign-in expired, please try again.');
  if (t.email_verified !== 'true' && t.email_verified !== true) throw httpError(401, 'Google account email is not verified.');

  const email = String(t.email).toLowerCase();
  if (config.gmailOnly && !/@(gmail|googlemail)\.com$/.test(email)) throw httpError(403, 'Please sign in with a Gmail address.');
  return { email, name: t.name || email.split('@')[0], picture: t.picture || '', googleId: t.sub };
}

export function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}
