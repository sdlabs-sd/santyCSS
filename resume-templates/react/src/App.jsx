import { useEffect, useMemo, useState } from 'react';
import templates from './templates/index.js';
import { catalog, samples } from './registry.js';
import { accentFor } from '@shared/accents.js';
import { normalize, clean } from '@shared/schema.js';
import { getBoot, loadDraft, saveDraft, clearDraft, fetchMe, saveSite } from '@shared/store.js';
import AdminPanel from './admin/AdminPanel.jsx';

const ids = Object.keys(templates);
const metaOf = (id) => catalog.templates.find(t => t.id === id) || { id, name: id, accent: 'blue', tier: 'free' };
const sampleFor = (id) => normalize(samples[metaOf(id).sample] || Object.values(samples)[0]);

/**
 * Modes
 *  - Local (downloaded project / marketplace preview): edits autosave to localStorage.
 *    ?template=<id> picks a template, ?admin opens the editor, ?embed hides all chrome.
 *  - Hosted (<name>.<root-domain>): the server injects window.__RESUME_SITE__; only the
 *    owner (signed in with Google on the root domain) sees the editor, and Save publishes.
 */
export default function App() {
  const boot = getBoot();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const embed = params.has('embed');
  const requested = boot ? boot.templateId : params.get('template');
  const initialId = templates[requested] ? requested : ids[0];
  const draft = !boot && !embed ? loadDraft(initialId) : null;

  const [templateId, setTemplateId] = useState(initialId);
  const [data, setData] = useState(() => normalize((boot && boot.data) || (draft && draft.data) || sampleFor(initialId)));
  const [accent, setAccent] = useState((boot && boot.accent) || (draft && draft.accent) || params.get('accent') || metaOf(initialId).accent);
  const [open, setOpen] = useState(!boot && !embed && params.has('admin'));
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState('');
  const [dirty, setDirty] = useState(false);

  const isOwner = !!(boot && me && me.user && me.user.email === boot.ownerEmail);
  const canEdit = !embed && (!boot || isOwner);

  useEffect(() => { if (boot) fetchMe().then(setMe); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (isOwner && params.has('admin')) setOpen(true); }, [isOwner, params]);
  useEffect(() => {
    const b = data.basics;
    document.title = b.name ? b.name + (b.title ? ' — ' + b.title : '') : 'Resume';
  }, [data.basics]);

  // Local mode: autosave a draft shortly after each change.
  useEffect(() => {
    if (boot || embed || !dirty) return undefined;
    const t = setTimeout(() => {
      saveDraft(templateId, { data: clean(data), accent });
      setStatus('Draft saved in this browser');
    }, 600);
    return () => clearTimeout(t);
  }, [boot, embed, dirty, data, accent, templateId]);

  // Hosted mode: warn before leaving with unpublished edits.
  useEffect(() => {
    if (!boot || !dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [boot, dirty]);

  // Which templates can this person switch to?
  const allowed = useMemo(() => ids.filter(id => {
    if (!boot) return true;
    const m = metaOf(id);
    const owned = (me && me.purchases) || [];
    return m.tier === 'free' || owned.includes(id) || id === boot.templateId;
  }), [boot, me]);

  const change = (setter) => (value) => { setter(value); setDirty(true); setStatus(''); };

  async function save() {
    const payload = { templateId, accent, data: clean(data) };
    if (!boot) {
      saveDraft(templateId, payload);
      setDirty(false);
      setStatus('Saved in this browser');
      return;
    }
    setStatus('Publishing…');
    try {
      await saveSite(boot.subdomain, payload);
      setDirty(false);
      setStatus('Published — live at ' + window.location.host);
    } catch (e) {
      setStatus('Could not save: ' + e.message);
    }
  }

  function reset() {
    if (!window.confirm('Replace your content with the sample resume for this template?')) return;
    setData(sampleFor(templateId));
    setAccent(metaOf(templateId).accent);
    if (!boot) clearDraft(templateId);
    setDirty(true);
  }

  const Template = templates[templateId];

  return (
    <>
      <Template data={data} accent={accentFor(accent)} />

      {canEdit && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-sans position-fixed pin-bottom-24 pin-right-24 layer-50 make-flex align-center gap-8 add-padding-x-20 add-padding-y-12 make-pill background-gray-900 color-white set-text-14 text-bold add-shadow-xl add-border-0 cursor-pointer on-hover:background-black transition-all print:hidden"
        >
          ✎ Edit resume
        </button>
      )}

      {boot && !isOwner && params.has('admin') && me !== null && (
        <div className="font-sans position-fixed pin-bottom-24 pin-right-24 layer-50 background-white add-shadow-xl round-corners-16 add-padding-20 max-width-320 add-border-1 border-color-gray-200 print:hidden">
          <p className="set-text-15 text-bold color-gray-900">Owner sign-in</p>
          <p className="set-text-13 color-gray-600 add-margin-top-4 add-margin-bottom-12">
            {me && me.user ? 'You are signed in as ' + me.user.email + ', which does not own this site.' : 'Sign in with the Google account that owns this site to edit it.'}
          </p>
          <a href={boot.loginUrl} className="make-inline-block add-padding-x-16 add-padding-y-8 make-pill background-blue-600 on-hover:background-blue-700 color-white set-text-13 text-bold text-no-decoration">
            Sign in with Google
          </a>
        </div>
      )}

      {open && canEdit && (
        <AdminPanel
          data={data}
          onData={change(setData)}
          templateId={templateId}
          onTemplate={change(setTemplateId)}
          accent={accent}
          onAccent={change(setAccent)}
          templates={allowed.map(metaOf)}
          accents={catalog.accents}
          hosted={!!boot}
          siteLabel={boot ? window.location.host : ''}
          dirty={dirty}
          status={status}
          onSave={save}
          onReset={reset}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
