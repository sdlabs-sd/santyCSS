/**
 * Resume data schema + admin-form definition.
 *
 * Both admin panels (React and Vue) render their forms from SECTIONS, so a new
 * field only has to be added here. Field types:
 *   text | textarea | number | url | email | lines (string[] one per line) | tags (string[] comma separated)
 */

export const SECTIONS = [
  {
    key: 'basics', label: 'Profile', type: 'object',
    fields: [
      { k: 'name', label: 'Full name' },
      { k: 'title', label: 'Job title' },
      { k: 'email', label: 'Email', type: 'email' },
      { k: 'phone', label: 'Phone' },
      { k: 'location', label: 'Location' },
      { k: 'website', label: 'Website', type: 'url' },
      { k: 'photo', label: 'Photo URL (optional)', type: 'url' },
      { k: 'summary', label: 'Summary', type: 'textarea' },
    ],
  },
  {
    key: 'experience', label: 'Experience', type: 'list', title: i => i.role || 'New role', sub: i => i.company,
    blank: { role: '', company: '', location: '', start: '', end: '', highlights: [] },
    fields: [
      { k: 'role', label: 'Role' }, { k: 'company', label: 'Company' }, { k: 'location', label: 'Location' },
      { k: 'start', label: 'Start', half: true }, { k: 'end', label: 'End', half: true },
      { k: 'highlights', label: 'Highlights (one per line)', type: 'lines' },
    ],
  },
  {
    key: 'education', label: 'Education', type: 'list', title: i => i.degree || 'New entry', sub: i => i.school,
    blank: { degree: '', school: '', start: '', end: '', details: '' },
    fields: [
      { k: 'degree', label: 'Degree' }, { k: 'school', label: 'School' },
      { k: 'start', label: 'Start', half: true }, { k: 'end', label: 'End', half: true },
      { k: 'details', label: 'Details' },
    ],
  },
  {
    key: 'skills', label: 'Skills', type: 'list', title: i => i.name || 'New skill', sub: i => (i.level ? i.level + '%' : ''),
    blank: { name: '', level: 80 },
    fields: [{ k: 'name', label: 'Skill' }, { k: 'level', label: 'Level (0–100)', type: 'number' }],
  },
  {
    key: 'projects', label: 'Projects', type: 'list', title: i => i.name || 'New project', sub: i => (i.tags || []).join(', '),
    blank: { name: '', description: '', url: '', tags: [] },
    fields: [
      { k: 'name', label: 'Name' }, { k: 'description', label: 'Description', type: 'textarea' },
      { k: 'url', label: 'Link', type: 'url' }, { k: 'tags', label: 'Tags (comma separated)', type: 'tags' },
    ],
  },
  {
    key: 'certifications', label: 'Certifications', type: 'list', title: i => i.name || 'New certification', sub: i => i.issuer,
    blank: { name: '', issuer: '', year: '' },
    fields: [{ k: 'name', label: 'Name' }, { k: 'issuer', label: 'Issuer' }, { k: 'year', label: 'Year' }],
  },
  {
    key: 'stats', label: 'Highlights', type: 'list', title: i => i.value || 'New stat', sub: i => i.label,
    blank: { value: '', label: '' },
    fields: [{ k: 'value', label: 'Value (e.g. 3.4×)', half: true }, { k: 'label', label: 'Label', half: true }],
  },
  {
    key: 'languages', label: 'Languages', type: 'list', title: i => i.name || 'New language', sub: i => i.level,
    blank: { name: '', level: '' },
    fields: [{ k: 'name', label: 'Language', half: true }, { k: 'level', label: 'Level', half: true }],
  },
  {
    key: 'links', label: 'Links', type: 'list', title: i => i.label || 'New link', sub: i => i.url,
    blank: { label: '', url: '' },
    fields: [{ k: 'label', label: 'Label', half: true }, { k: 'url', label: 'URL', type: 'url', half: true }],
  },
];

const LIST_KEYS = SECTIONS.filter(s => s.type === 'list').map(s => s.key);

export function emptyResume() {
  const r = { basics: {} };
  SECTIONS[0].fields.forEach(f => { r.basics[f.k] = ''; });
  LIST_KEYS.forEach(k => { r[k] = []; });
  return r;
}

/** Fill in anything missing so templates never have to null-check. */
export function normalize(data) {
  const base = emptyResume();
  if (!data || typeof data !== 'object') return base;
  const out = { ...base, ...data, basics: { ...base.basics, ...(data.basics || {}) } };
  LIST_KEYS.forEach(k => { out[k] = Array.isArray(data[k]) ? data[k] : []; });
  out.experience = out.experience.map(e => ({ ...e, highlights: Array.isArray(e.highlights) ? e.highlights : [] }));
  out.projects = out.projects.map(p => ({ ...p, tags: Array.isArray(p.tags) ? p.tags : [] }));
  return out;
}

/** Field value → string for an <input>/<textarea>. */
export function toInput(field, value) {
  if (field.type === 'lines') return (value || []).join('\n');
  if (field.type === 'tags') return (value || []).join(', ');
  return value == null ? '' : String(value);
}

/** <input> string → stored value. */
export function fromInput(field, str) {
  if (field.type === 'lines') return str.split('\n');
  if (field.type === 'tags') return str.split(',').map(s => s.trim()).filter(Boolean);
  if (field.type === 'number') return Math.max(0, Math.min(100, Number(str) || 0));
  return str;
}

/** Drop blank lines from highlight lists before saving. */
export function clean(data) {
  const d = normalize(data);
  d.experience = d.experience.map(e => ({ ...e, highlights: e.highlights.map(h => h.trim()).filter(Boolean) }));
  return d;
}
