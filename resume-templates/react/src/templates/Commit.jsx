import { dateRange } from '@shared/format.js';
import { A, contacts, has } from './parts.jsx';

/** Commit — Software Engineer. Terminal header, monospace labels, stack chips. */
export default function Commit({ data, accent: a }) {
  const { basics, experience, education, skills, projects, certifications, languages, links, stats } = data;
  const H = ({ children }) => (
    <h2 className={'font-mono set-text-13 text-bold text-uppercase letter-space-widest add-margin-bottom-16 ' + a.text}>
      {'// '}{children}
    </h2>
  );

  return (
    <main className="font-sans min-height-screen background-slate-200 add-padding-y-40 on-mobile:add-padding-y-0">
      <article className="max-width-960 center-margin background-white add-shadow-xl round-corners-16 overflow-hidden print:no-shadow">
        <header className="background-slate-900 color-white add-padding-40 on-mobile:add-padding-24">
          <div className="make-flex gap-8 add-margin-bottom-24" aria-hidden="true">
            <span className="set-width-12 set-height-12 make-circle background-red-400" />
            <span className="set-width-12 set-height-12 make-circle background-amber-400" />
            <span className="set-width-12 set-height-12 make-circle background-green-400" />
          </div>
          <p className={'font-mono set-text-14 add-margin-bottom-8 ' + a.textBright}>~/resume $ whoami</p>
          <h1 className="set-text-44 on-mobile:set-text-28 text-extrabold line-height-tight letter-space-tight">{basics.name}</h1>
          <p className={'set-text-20 on-mobile:set-text-16 add-margin-top-8 ' + a.textMuted}>{basics.title}</p>
          <ul className="list-none add-padding-0 add-margin-0 add-margin-top-20 make-flex flex-wrap gap-x-24 gap-y-8 font-mono set-text-13 color-slate-300">
            {contacts(basics).map(c => (
              <li key={c.key}>
                <A href={c.href} className="color-slate-300 text-no-decoration on-hover:color-white">
                  <span className={a.textBright}>{c.icon}</span> {c.label}
                </A>
              </li>
            ))}
            {links.map(l => (
              <li key={l.url}>
                <A href={l.url} className="color-slate-300 text-no-decoration on-hover:color-white">
                  <span className={a.textBright}>@</span>{l.label}
                </A>
              </li>
            ))}
          </ul>
        </header>

        {has(stats) && (
          <div className="make-flex flex-wrap add-border-bottom-1 border-color-slate-200">
            {stats.map(s => (
              <div key={s.label} className="flex-1 min-width-140 add-padding-x-24 add-padding-y-20 add-border-right-1 border-color-slate-200">
                <p className={'set-text-28 text-extrabold font-mono ' + a.text}>{s.value}</p>
                <p className="set-text-12 color-slate-500 text-uppercase letter-space-wide add-margin-top-4">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="make-grid grid-cols-1 md:grid-cols-3">
          <div className="md:span-col-2 add-padding-40 on-mobile:add-padding-24">
            {basics.summary && (
              <section className="add-margin-bottom-36">
                <H>readme</H>
                <p className="set-text-15 color-slate-700 line-height-relaxed">{basics.summary}</p>
              </section>
            )}

            {has(experience) && (
              <section className="add-margin-bottom-36">
                <H>experience</H>
                {experience.map((x, i) => (
                  <div key={i} className={'add-padding-left-20 add-border-left-2 add-padding-bottom-24 break-inside-avoid ' + a.borderSoft}>
                    <div className="make-flex flex-wrap justify-between align-start gap-8">
                      <div>
                        <h3 className="set-text-17 text-bold color-slate-900">{x.role}</h3>
                        <p className={'set-text-15 text-semibold ' + a.text}>
                          {x.company}
                          {x.location && <span className="color-slate-400 text-regular"> · {x.location}</span>}
                        </p>
                      </div>
                      <span className="font-mono set-text-12 color-slate-600 background-slate-100 add-padding-x-10 add-padding-y-4 round-corners-6">
                        {dateRange(x.start, x.end)}
                      </span>
                    </div>
                    <ul className="list-none add-padding-0 add-margin-0 add-margin-top-10">
                      {x.highlights.map((h, j) => (
                        <li key={j} className="make-flex gap-10 set-text-14 color-slate-600 line-height-relaxed add-margin-bottom-6">
                          <span className={'font-mono flex-shrink-0 ' + a.text}>›</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {has(projects) && (
              <section>
                <H>projects</H>
                <div className="make-grid grid-cols-1 md:grid-cols-2 gap-16">
                  {projects.map((p, i) => (
                    <div key={i} className="add-border-1 border-color-slate-200 round-corners-12 add-padding-20 break-inside-avoid">
                      <A href={p.url} className="set-text-15 text-bold color-slate-900 text-no-decoration font-mono">{p.name}</A>
                      <p className="set-text-13 color-slate-600 line-height-relaxed add-margin-top-6">{p.description}</p>
                      <div className="make-flex flex-wrap gap-6 add-margin-top-12">
                        {p.tags.map(t => (
                          <span key={t} className={'font-mono set-text-11 add-padding-x-8 add-padding-y-2 round-corners-4 ' + a.soft + ' ' + a.textStrong}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="background-slate-50 add-padding-32 on-mobile:add-padding-24 add-border-left-1 border-color-slate-200">
            {has(skills) && (
              <section className="add-margin-bottom-32">
                <H>stack</H>
                <div className="make-flex flex-wrap gap-8">
                  {skills.map(s => (
                    <span key={s.name} className="font-mono set-text-13 color-slate-800 background-white add-border-1 border-color-slate-300 add-padding-x-10 add-padding-y-4 round-corners-6">
                      {s.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
            {has(education) && (
              <section className="add-margin-bottom-32">
                <H>education</H>
                {education.map((e, i) => (
                  <div key={i} className="add-margin-bottom-16">
                    <p className="set-text-14 text-bold color-slate-900">{e.degree}</p>
                    <p className="set-text-13 color-slate-600">{e.school}</p>
                    <p className="font-mono set-text-12 color-slate-500 add-margin-top-2">{dateRange(e.start, e.end)}{e.details && ' · ' + e.details}</p>
                  </div>
                ))}
              </section>
            )}
            {has(certifications) && (
              <section className="add-margin-bottom-32">
                <H>certs</H>
                {certifications.map((c, i) => (
                  <div key={i} className="add-margin-bottom-12">
                    <p className="set-text-13 text-semibold color-slate-900">{c.name}</p>
                    <p className="set-text-12 color-slate-500">{c.issuer} · {c.year}</p>
                  </div>
                ))}
              </section>
            )}
            {has(languages) && (
              <section>
                <H>languages</H>
                {languages.map(l => (
                  <div key={l.name} className="make-flex justify-between set-text-13 add-margin-bottom-6">
                    <span className="color-slate-800">{l.name}</span>
                    <span className="font-mono color-slate-500">{l.level}</span>
                  </div>
                ))}
              </section>
            )}
          </aside>
        </div>
      </article>
    </main>
  );
}
