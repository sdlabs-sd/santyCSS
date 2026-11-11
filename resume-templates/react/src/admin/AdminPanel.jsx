import { useId, useRef, useState } from 'react';
import { SECTIONS, toInput, fromInput, normalize } from '@shared/schema.js';
import { accentFor } from '@shared/accents.js';
import { downloadJson, readJsonFile } from '@shared/store.js';

const input = 'font-sans set-width-full add-padding-x-12 add-padding-y-8 round-corners-8 add-border-1 border-color-gray-300 set-text-14 color-gray-900 background-white on-focus:border-color-blue-500 on-focus:outline-none';
const btn = 'make-inline-flex align-center justify-center gap-6 add-padding-x-12 add-padding-y-8 round-corners-8 set-text-13 text-semibold cursor-pointer add-border-1 transition-all';
const btnGhost = btn + ' background-white border-color-gray-300 color-gray-700 on-hover:background-gray-100';
const btnPrimary = btn + ' background-blue-600 border-color-blue-600 color-white on-hover:background-blue-700';
const iconBtn = 'make-inline-flex align-center justify-center set-width-28 set-height-28 round-corners-6 set-text-13 cursor-pointer background-white add-border-1 border-color-gray-200 color-gray-600 on-hover:background-gray-100';

function Field({ field, value, onChange }) {
  const id = useId();
  const common = { id, className: input, value: toInput(field, value), onChange: e => onChange(fromInput(field, e.target.value)) };
  return (
    <div className={field.half ? '' : 'span-col-2'}>
      <label htmlFor={id} className="make-block set-text-12 text-semibold color-gray-600 add-margin-bottom-4">{field.label}</label>
      {field.type === 'textarea' || field.type === 'lines'
        ? <textarea rows={field.type === 'lines' ? 5 : 4} {...common} />
        : <input type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'} min="0" max="100" {...common} />}
    </div>
  );
}

function ListSection({ section, items, onItems }) {
  const [openIdx, setOpenIdx] = useState(items.length ? 0 : -1);
  const set = (i, k, v) => onItems(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onItems(next);
    setOpenIdx(j);
  };
  const remove = (i) => {
    if (!window.confirm('Remove this ' + section.label.toLowerCase().replace(/s$/, '') + '?')) return;
    onItems(items.filter((_, j) => j !== i));
    setOpenIdx(-1);
  };
  const add = () => { onItems([...items, JSON.parse(JSON.stringify(section.blank))]); setOpenIdx(items.length); };

  return (
    <div>
      {items.length === 0 && <p className="set-text-13 color-gray-500 add-margin-bottom-12">Nothing here yet — this section is hidden on your resume until you add something.</p>}
      {items.map((item, i) => (
        <div key={i} className="add-border-1 border-color-gray-200 round-corners-10 add-margin-bottom-10 background-white">
          <div className="make-flex align-center gap-8 add-padding-x-12 add-padding-y-10">
            <button type="button" onClick={() => setOpenIdx(openIdx === i ? -1 : i)} className="flex-1 text-left background-transparent add-border-0 cursor-pointer add-padding-0">
              <span className="make-block set-text-14 text-semibold color-gray-900 text-clamp-1">{section.title(item)}</span>
              {section.sub(item) && <span className="make-block set-text-12 color-gray-500 text-clamp-1">{section.sub(item)}</span>}
            </button>
            <button type="button" className={iconBtn} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
            <button type="button" className={iconBtn} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
            <button type="button" className={iconBtn} onClick={() => remove(i)} aria-label="Remove">✕</button>
          </div>
          {openIdx === i && (
            <div className="make-grid grid-cols-2 gap-12 add-padding-12 add-border-top-1 border-color-gray-100 background-gray-50 round-bottom-10">
              {section.fields.map(f => <Field key={f.k} field={f} value={item[f.k]} onChange={v => set(i, f.k, v)} />)}
            </div>
          )}
        </div>
      ))}
      <button type="button" className={btnGhost + ' set-width-full'} onClick={add}>+ Add {section.label.toLowerCase().replace(/s$/, '')}</button>
    </div>
  );
}

export default function AdminPanel({
  data, onData, templateId, onTemplate, accent, onAccent, templates, accents,
  hosted, siteLabel, dirty, status, onSave, onReset, onClose,
}) {
  const [tab, setTab] = useState('basics');
  const fileRef = useRef(null);
  const section = SECTIONS.find(s => s.key === tab);

  async function importJson(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try { onData(normalize(await readJsonFile(file))); } catch (err) { window.alert(err.message); }
  }

  return (
    <aside className="font-sans position-fixed pin-top-0 pin-right-0 pin-bottom-0 set-width-full max-width-420 background-gray-50 add-shadow-xl layer-50 make-flex flex-column add-border-left-1 border-color-gray-200 print:hidden" aria-label="Resume editor">
      <header className="background-white add-padding-x-20 add-padding-y-16 add-border-bottom-1 border-color-gray-200 make-flex align-center justify-between gap-12">
        <div>
          <p className="set-text-16 text-bold color-gray-900">Edit resume</p>
          <p className="set-text-12 color-gray-500">{hosted ? 'Live site · ' + siteLabel : 'Local draft · saved in this browser'}</p>
        </div>
        <button type="button" className={iconBtn} onClick={onClose} aria-label="Close editor">✕</button>
      </header>

      <nav className="background-white add-padding-x-12 add-padding-y-8 add-border-bottom-1 border-color-gray-200 make-flex gap-4 overflow-x-auto">
        {[...SECTIONS.map(s => [s.key, s.label]), ['design', 'Design']].map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={'flex-shrink-0 add-padding-x-12 add-padding-y-6 make-pill set-text-13 text-semibold cursor-pointer add-border-0 ' + (tab === k ? 'background-gray-900 color-white' : 'background-transparent color-gray-600 on-hover:background-gray-100')}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto add-padding-20">
        {section && section.type === 'object' && (
          <div className="make-grid grid-cols-2 gap-12">
            {section.fields.map(f => (
              <Field key={f.k} field={f} value={data.basics[f.k]} onChange={v => onData({ ...data, basics: { ...data.basics, [f.k]: v } })} />
            ))}
          </div>
        )}
        {section && section.type === 'list' && (
          <ListSection key={section.key} section={section} items={data[section.key]} onItems={items => onData({ ...data, [section.key]: items })} />
        )}
        {tab === 'design' && (
          <div>
            <p className="set-text-12 text-semibold color-gray-600 add-margin-bottom-8">Template</p>
            <div className="make-grid grid-cols-2 gap-8 add-margin-bottom-24">
              {templates.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTemplate(t.id)}
                  className={'text-left add-padding-12 round-corners-10 cursor-pointer add-border-2 background-white ' + (t.id === templateId ? 'border-color-blue-600' : 'border-color-gray-200 on-hover:border-color-gray-400')}
                >
                  <span className="make-block set-text-14 text-bold color-gray-900">{t.name}{t.tier === 'premium' && <span className="color-amber-600"> ★</span>}</span>
                  <span className="make-block set-text-12 color-gray-500">{t.job}</span>
                </button>
              ))}
            </div>
            <p className="set-text-12 text-semibold color-gray-600 add-margin-bottom-8">Accent colour</p>
            <div className="make-flex flex-wrap gap-8 add-margin-bottom-24">
              {accents.map(name => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  aria-label={'Accent ' + name}
                  onClick={() => onAccent(name)}
                  className={'set-width-36 set-height-36 make-circle cursor-pointer add-border-4 ' + accentFor(name).solid + ' ' + (name === accent ? 'border-color-gray-900' : 'border-color-white')}
                />
              ))}
            </div>
            <p className="set-text-12 text-semibold color-gray-600 add-margin-bottom-8">Content</p>
            <div className="make-flex flex-wrap gap-8">
              <button type="button" className={btnGhost} onClick={() => downloadJson('resume.json', data)}>Export JSON</button>
              <button type="button" className={btnGhost} onClick={() => fileRef.current && fileRef.current.click()}>Import JSON</button>
              <button type="button" className={btnGhost} onClick={onReset}>Reset to sample</button>
              <input ref={fileRef} type="file" accept="application/json,.json" className="make-hidden" onChange={importJson} />
            </div>
          </div>
        )}
      </div>

      <footer className="background-white add-padding-16 add-border-top-1 border-color-gray-200">
        {status && <p className="set-text-12 color-gray-600 add-margin-bottom-10">{status}</p>}
        <div className="make-flex gap-8">
          <button type="button" className={btnPrimary + ' flex-1'} onClick={onSave} disabled={hosted && !dirty}>
            {hosted ? (dirty ? 'Publish changes' : 'Published') : 'Save'}
          </button>
          <button type="button" className={btnGhost} onClick={() => window.print()}>Print / PDF</button>
        </div>
      </footer>
    </aside>
  );
}
