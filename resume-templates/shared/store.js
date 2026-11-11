/**
 * Persistence for the editor.
 *  - Local mode (downloaded template / preview): drafts live in localStorage.
 *  - Hosted mode (<name>.<root-domain>): the server injects window.__RESUME_SITE__
 *    and edits are saved through the API by the signed-in owner.
 */

export function getBoot() {
  return (typeof window !== 'undefined' && window.__RESUME_SITE__) || null;
}

const KEY = (id) => 'santy-resume:' + id;

export function loadDraft(templateId) {
  try {
    const raw = localStorage.getItem(KEY(templateId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveDraft(templateId, draft) {
  try { localStorage.setItem(KEY(templateId), JSON.stringify(draft)); return true; } catch { return false; }
}

export function clearDraft(templateId) {
  try { localStorage.removeItem(KEY(templateId)); } catch { /* ignore */ }
}

async function api(path, opts = {}) {
  const boot = getBoot();
  const base = (boot && boot.apiBase) || '';
  const res = await fetch(base + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'Request failed (' + res.status + ')');
  return body;
}

export const fetchMe = () => api('/api/me').catch(() => null);

export function saveSite(subdomain, payload) {
  return api('/api/sites/' + encodeURIComponent(subdomain), { method: 'PUT', body: JSON.stringify(payload) });
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => { try { resolve(JSON.parse(r.result)); } catch (e) { reject(new Error('Not a valid JSON file')); } };
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });
}
