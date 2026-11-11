/** Small, framework-agnostic helpers shared by the React and Vue templates. */

/** Only allow link schemes that can't execute script. Anything else → "#". */
export function safeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const u = url.trim();
  if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return 'https://' + u; // "example.com/x"
  return '';
}

export const mailto = (email) => (email ? 'mailto:' + email.trim() : '');
export const telto = (phone) => (phone ? 'tel:' + phone.replace(/[^\d+]/g, '') : '');

/** "2019 – Present" (en dash, collapses when one side is missing). */
export function dateRange(start, end) {
  return [start, end].filter(Boolean).join(' – ');
}

export function initials(name = '') {
  return name.replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, '').split(/\s+/).filter(Boolean)
    .slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

/** Pretty host for a URL: https://www.aarav.dev/ → aarav.dev */
export function prettyUrl(url = '') {
  return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
}

/** Clamp a 0–100 skill level and snap to a width class step (5 % steps). */
export function levelStep(level) {
  const n = Math.max(0, Math.min(100, Number(level) || 0));
  return Math.round(n / 5) * 5;
}

/** Literal width classes for skill bars, keyed by levelStep(). */
export const LEVEL_WIDTH = {
  0: 'set-width-0', 5: 'set-width-1-of-12', 10: 'set-width-1-of-12', 15: 'set-width-1-of-6',
  20: 'set-width-1-of-5', 25: 'set-width-1-of-4', 30: 'set-width-1-of-3', 35: 'set-width-1-of-3',
  40: 'set-width-2-of-5', 45: 'set-width-5-of-12', 50: 'set-width-1-of-2', 55: 'set-width-7-of-12',
  60: 'set-width-3-of-5', 65: 'set-width-2-of-3', 70: 'set-width-2-of-3', 75: 'set-width-3-of-4',
  80: 'set-width-4-of-5', 85: 'set-width-5-of-6', 90: 'set-width-11-of-12', 95: 'set-width-11-of-12',
  100: 'set-width-full',
};
export const levelWidth = (level) => LEVEL_WIDTH[levelStep(level)];

/** Five-dot rating for a 0–100 level. */
export const dots = (level) => Math.max(1, Math.round((Number(level) || 0) / 20));
