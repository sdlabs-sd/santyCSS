import { dateRange, levelWidth } from '@shared/format.js';
import { A, Avatar, contacts, has } from './parts.jsx';

/** Roadmap (premium) — Product Manager. Milestone timeline, outcome-first. */
export default function Roadmap({ data, accent: a }) {
  const { basics, experience, education, skills, projects, certifications, languages, links, stats } = data;
  const H = ({ children }) => (
    <h2 className="set-text-22 text-extrabold color-slate-900 letter-space-tight add-margin-bottom-20">{children}</h2>
  );

  return (
    <main className="font-sans min-height-screen background-slate-50">
      <header className={'position-relative overflow-hidden ' + a.deep}>
        <div className="max-width-1024 center-margin add-padding-x-24 add-padding-y-56 on-mobile:add-padding-y-40 make-flex flex-wrap align-center gap-32">
          <Avatar basics={basics} className={'set-width-120 set-height-120 round-corners-32 add-shadow-xl flex-shrink-0'} fallbackClass={'set-text-40 text-extrabold color-white ' + a.bar} />
          <div className="flex-1 min-width-280 color-white">
            <h1 className="set-text-48 on-mobile:set-text-32 text-extrabold line-height-tight letter-space-tight">{basics.name}</h1>
            <p className={'set-text-20 add-margin-top-6 ' + a.textLight}>{basics.title}</p>
            <div className="make-flex flex-wrap gap-8 add-margin-top-20">
              {contacts(basics).map(c => (
                <A key={c.key} href={c.href} className="set-text-13 color-white text-no-decoration add-padding-x-12 add-padding-y-6 make-pill add-border-1 border-color-white on-hover:background-white on-hover:color-black transition-all">{c.icon} {c.label}</A>
              ))}
              {links.map(l => (
                <A key={l.url} href={l.url} className={'set-text-13 text-bold text-no-decoration add-padding-x-12 add-padding-y-6 make-pill background-white ' + a.textStrong}>{l.label} ↗</A>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-width-1024 center-margin add-padding-x-24 add-padding-y-48 on-mobile:add-padding-y-32">
        {basics.summary && (
          <p className="set-text-18 color-slate-700 line-height-relaxed max-width-840 add-margin-bottom-40">{basics.summary}</p>
        )}
        {has(stats) && (
          <div className="make-flex flex-wrap gap-16 add-margin-bottom-48">
            {stats.map(s => (
              <div key={s.label} className={'flex-1 min-width-180 background-white round-corners-16 add-padding-20 add-shadow-sm add-border-top-4 ' + a.border}>
                <p className={'set-text-32 text-extrabold ' + a.text}>{s.value}</p>
                <p className="set-text-13 text-semibold color-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="make-grid grid-cols-1 md:grid-cols-3 gap-48">
          <div className="md:span-col-2">
            {has(experience) && (
              <section className="add-margin-bottom-40">
                <H>Roadmap</H>
                <ol className="list-none add-padding-0 add-margin-0">
                  {experience.map((x, i) => (
                    <li key={i} className="make-flex gap-20 break-inside-avoid">
                      <div className="make-flex flex-column align-center flex-shrink-0">
                        <span className={'make-flex align-center justify-center set-width-36 set-height-36 make-circle set-text-14 text-extrabold color-white ' + (i === 0 ? a.solid : 'background-slate-400')}>{experience.length - i}</span>
                        {i < experience.length - 1 && <span className="flex-1 set-width-2 background-slate-200 add-margin-y-4" />}
                      </div>
                      <div className="add-padding-bottom-32 flex-1">
                        <p className={'set-text-12 text-bold text-uppercase letter-space-widest ' + a.text}>{dateRange(x.start, x.end)}</p>
                        <h3 className="set-text-18 text-extrabold color-slate-900 add-margin-top-2">{x.role}</h3>
                        <p className="set-text-14 color-slate-500 add-margin-bottom-10">{x.company}{x.location && ' · ' + x.location}</p>
                        <div className="background-white round-corners-12 add-padding-16 add-border-1 border-color-slate-200">
                          {x.highlights.map((h, j) => (
                            <p key={j} className="make-flex gap-10 set-text-14 color-slate-700 line-height-relaxed add-margin-bottom-6">
                              <span className={'text-extrabold flex-shrink-0 ' + a.text}>✓</span><span>{h}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {has(projects) && (
              <section>
                <H>Launches</H>
                <div className="make-grid grid-cols-1 md:grid-cols-2 gap-16">
                  {projects.map((p, i) => (
                    <div key={i} className={'round-corners-16 add-padding-20 ' + a.soft}>
                      <div className="make-flex flex-wrap gap-6 add-margin-bottom-8">
                        {p.tags.map(t => <span key={t} className={'set-text-11 text-bold text-uppercase letter-space-wide add-padding-x-8 add-padding-y-2 make-pill background-white ' + a.textStrong}>{t}</span>)}
                      </div>
                      <A href={p.url} className="set-text-16 text-extrabold color-slate-900 text-no-decoration">{p.name}</A>
                      <p className="set-text-14 color-slate-600 add-margin-top-4">{p.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          <aside >
            {has(skills) && (
              <section className="background-white round-corners-16 add-padding-24 add-shadow-sm add-margin-bottom-24">
                <h2 className="set-text-16 text-extrabold color-slate-900 add-margin-bottom-16">Skills matrix</h2>
                {skills.map(s => (
                  <div key={s.name} className="add-margin-bottom-12">
                    <p className="set-text-13 text-semibold color-slate-700 add-margin-bottom-4">{s.name}</p>
                    <div className="set-height-6 background-slate-100 make-pill">
                      <div className={'set-height-6 make-pill ' + a.solid + ' ' + levelWidth(s.level)} />
                    </div>
                  </div>
                ))}
              </section>
            )}
            {has(education) && (
              <section className="background-white round-corners-16 add-padding-24 add-shadow-sm add-margin-bottom-24">
                <h2 className="set-text-16 text-extrabold color-slate-900 add-margin-bottom-12">Education</h2>
                {education.map((e, i) => (
                  <div key={i} className="add-margin-bottom-8">
                    <p className="set-text-14 text-bold color-slate-900">{e.degree}</p>
                    <p className="set-text-13 color-slate-500">{e.school} · {e.end}</p>
                  </div>
                ))}
              </section>
            )}
            {(has(certifications) || has(languages)) && (
              <section className="background-white round-corners-16 add-padding-24 add-shadow-sm">
                <h2 className="set-text-16 text-extrabold color-slate-900 add-margin-bottom-12">Credentials</h2>
                {certifications.map((c, i) => <p key={i} className="set-text-13 color-slate-700 add-margin-bottom-6">{c.name} ({c.year})</p>)}
                {languages.map(l => <p key={l.name} className="set-text-13 color-slate-700 add-margin-bottom-6">{l.name} · {l.level}</p>)}
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
