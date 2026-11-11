import { dateRange } from '@shared/format.js';
import { A, contacts, has } from './parts.jsx';

/** Quota — Sales Executive. Results first: attainment and deal stats up top. */
export default function Quota({ data, accent: a }) {
  const { basics, experience, education, skills, projects, certifications, languages, links, stats } = data;
  const H = ({ children }) => (
    <h2 className="set-text-13 text-extrabold text-uppercase letter-space-widest color-gray-900 add-margin-bottom-16 make-flex align-center gap-12">
      {children}<span className="flex-1 set-height-1 background-gray-200" />
    </h2>
  );

  return (
    <main className="font-sans min-height-screen background-gray-50 add-padding-y-40 add-padding-x-16 on-mobile:add-padding-0">
      <article className="max-width-960 center-margin background-white add-shadow-lg round-corners-12 overflow-hidden print:no-shadow">
        <div className={'set-height-8 ' + a.solid} />
        <header className="add-padding-40 on-mobile:add-padding-24 make-flex flex-wrap justify-between align-end gap-24">
          <div>
            <h1 className="set-text-44 on-mobile:set-text-32 text-extrabold color-gray-900 line-height-tight letter-space-tight">{basics.name}</h1>
            <p className={'set-text-18 text-bold add-margin-top-6 ' + a.text}>{basics.title}</p>
          </div>
          <ul className="list-none add-padding-0 add-margin-0 set-text-14 text-right on-mobile:text-left">
            {contacts(basics).map(c => (
              <li key={c.key} className="add-margin-bottom-2"><A href={c.href} className="color-gray-600 text-no-decoration on-hover:color-gray-900">{c.label}</A></li>
            ))}
            {links.map(l => <li key={l.url}><A href={l.url} className={'text-semibold text-no-decoration ' + a.text}>{l.label}</A></li>)}
          </ul>
        </header>

        {has(stats) && (
          <div className={'make-grid grid-cols-2 md:grid-cols-4 color-white ' + a.deep}>
            {stats.map((s, i) => (
              <div key={s.label} className={'add-padding-24 ' + (i % 2 ? '' : a.strong)}>
                <p className="set-text-36 text-extrabold line-height-tight">{s.value}</p>
                <p className={'set-text-13 text-semibold add-margin-top-4 ' + a.textLight}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="add-padding-40 on-mobile:add-padding-24">
          {basics.summary && <p className="set-text-16 color-gray-700 line-height-relaxed add-margin-bottom-32 add-border-left-4 add-padding-left-16 border-color-gray-200 text-italic">{basics.summary}</p>}

          {has(experience) && (
            <section className="add-margin-bottom-32">
              <H>Track record</H>
              {experience.map((x, i) => (
                <div key={i} className="make-grid grid-cols-1 md:grid-cols-4 gap-x-16 gap-y-4 add-margin-bottom-20 break-inside-avoid">
                  <div>
                    <p className="set-text-13 text-bold color-gray-500">{dateRange(x.start, x.end)}</p>
                    <p className="set-text-13 color-gray-400">{x.location}</p>
                  </div>
                  <div className="md:span-col-3">
                    <h3 className="set-text-17 text-bold color-gray-900">{x.role} · <span className={a.text}>{x.company}</span></h3>
                    <ul className="list-none add-padding-0 add-margin-0 add-margin-top-8">
                      {x.highlights.map((h, j) => (
                        <li key={j} className="make-flex gap-10 set-text-14 color-gray-700 line-height-relaxed add-margin-bottom-6">
                          <span className={'text-bold flex-shrink-0 ' + a.text}>▲</span><span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </section>
          )}

          <div className="make-grid grid-cols-1 md:grid-cols-2 gap-x-32">
            {has(skills) && (
              <section className="add-margin-bottom-24">
                <H>Selling skills</H>
                <div className="make-flex flex-wrap gap-8">
                  {skills.map(s => (
                    <span key={s.name} className={'set-text-13 text-semibold add-padding-x-12 add-padding-y-6 round-corners-6 add-border-1 ' + a.borderSoft + ' ' + a.textStrong}>{s.name}</span>
                  ))}
                </div>
              </section>
            )}
            <section className="add-margin-bottom-24">
              <H>Education &amp; more</H>
              {education.map((e, i) => <p key={i} className="set-text-14 color-gray-700 add-margin-bottom-6"><span className="text-bold">{e.degree}</span>, {e.school} ({e.end})</p>)}
              {certifications.map((c, i) => <p key={i} className="set-text-14 color-gray-700 add-margin-bottom-6">{c.name} · {c.year}</p>)}
              {has(languages) && <p className="set-text-14 color-gray-700">{languages.map(l => l.name + ' (' + l.level + ')').join(' · ')}</p>}
              {projects.map((p, i) => <p key={i} className="set-text-14 color-gray-700 add-margin-top-6"><span className="text-bold">{p.name}</span> — {p.description}</p>)}
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
