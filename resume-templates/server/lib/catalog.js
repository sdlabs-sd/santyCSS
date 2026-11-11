import fs from 'node:fs';
import path from 'node:path';
import { TEMPLATES_DIR } from './config.js';

export const catalog = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'catalog.json'), 'utf8'));
export const FRAMEWORKS = ['react', 'vue'];

export const templateById = (id) => catalog.templates.find(t => t.id === id) || null;

export function sampleFor(template) {
  return JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'samples', template.sample + '.json'), 'utf8'));
}

/* ── Resume data sanitiser ──────────────────────────────────────────────────
   Mirrors shared/schema.js. Everything becomes a bounded string / string[] so a
   hosted page can never carry markup, huge payloads or unexpected shapes. The
   templates render text with React/Vue escaping and links go through safeUrl. */
const S = (v, max = 300) => (typeof v === 'string' || typeof v === 'number' ? String(v).slice(0, max) : '');
const LIST = {
  experience: { role: 120, company: 120, location: 120, start: 30, end: 30, highlights: ['lines', 400] },
  education: { degree: 160, school: 160, start: 30, end: 30, details: 200 },
  skills: { name: 80, level: 'level' },
  projects: { name: 120, description: 600, url: 500, tags: ['lines', 40] },
  certifications: { name: 160, issuer: 160, year: 20 },
  stats: { value: 30, label: 80 },
  languages: { name: 60, level: 60 },
  links: { label: 60, url: 500 },
};
const BASICS = { name: 120, title: 160, email: 200, phone: 60, location: 120, website: 500, photo: 1000, summary: 2000 };

export function sanitizeResume(input) {
  const src = input && typeof input === 'object' ? input : {};
  const basics = {};
  for (const [k, max] of Object.entries(BASICS)) basics[k] = S(src.basics && src.basics[k], max);
  const out = { basics };
  for (const [key, shape] of Object.entries(LIST)) {
    const arr = Array.isArray(src[key]) ? src[key].slice(0, 40) : [];
    out[key] = arr.filter(x => x && typeof x === 'object').map(item => {
      const o = {};
      for (const [k, spec] of Object.entries(shape)) {
        if (spec === 'level') o[k] = Math.max(0, Math.min(100, Number(item[k]) || 0));
        else if (Array.isArray(spec)) o[k] = (Array.isArray(item[k]) ? item[k] : []).slice(0, 20).map(v => S(v, spec[1])).filter(Boolean);
        else o[k] = S(item[k], spec);
      }
      return o;
    });
  }
  return out;
}
