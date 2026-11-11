import { dateRange } from '@shared/format.js';
import { A, Avatar, contacts, has } from './parts.jsx';

/** Spotlight — Marketing Manager. Bold colour band with campaign numbers. */
export default function Spotlight({ data, accent: a }) {
  const { basics, experience, education, skills, projects, certifications, languages, links, stats } = data;
  const H = ({ children }) => (
    <h2 className="make-flex align-center gap-12 set-text-20 text-extrabold color-gray-900 add-margin-bottom-20">
      <span className={'set-width-24 set-height-4 make-pill ' + a.bar} />
      {children}
    </h2>
  );

  return (
    <main className="font-sans min-height-screen background-white">
      <header className={'add-padding-y-56 add-padding-x-24 on-mobile:add-padding-y-40 ' + a.solid}>
        <div className="max-width-1024 center-margin make-flex flex-wrap align-center gap-32">
          <Avatar basics={basics} className="set-width-140 set-height-140 make-circle add-border-8 border-color-white add-shadow-lg flex-shrink-0" fallbackClass={'set-text-48 text-extrabold background-white ' + a.text} />
          <div className="flex-1 min-width-280 color-white">
            <p className="set-text-14 text-bold text-uppercase letter-space-widest opacity-80">{basics.title}</p>
            <h1 className="set-text-56 on-mobile:set-text-36 text-extrabold line-height-tight letter-space-tight add-margin-top-8">{basics.name}</h1>
            <ul className="list-none add-padding-0 add-margin-0 make-flex flex-wrap gap-x-20 gap-y-6 add-margin-top-16 set-text-14">
              {contacts(basics).map(c => (
                <li key={c.key}><A href={c.href} className="color-white text-no-decoration opacity-90 on-hover:opacity-100">{c.icon} {c.label}</A></li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {has(stats) && (
        <div className="max-width-1024 center-margin add-padding-x-24 subtract-margin-top-32 position-relative">
          <div className="make-grid grid-cols-2 md:grid-cols-4 background-white round-corners-20 add-shadow-xl overflow-hidden add-border-1 border-color-gray-100">
            {stats.map(s => (
              <div key={s.label} className="add-padding-24 text-center add-border-right-1 border-color-gray-100">
                <p className={'set-text-36 text-extrabold line-height-tight ' + a.text}>{s.value}</p>
                <p className="set-text-13 text-semibold color-gray-500 add-margin-top-4">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-width-1024 center-margin add-padding-x-24 add-padding-y-56 on-mobile:add-padding-y-40">
        {basics.summary && (
          <p className="set-text-20 on-mobile:set-text-18 color-gray-700 line-height-relaxed max-width-840 add-margin-bottom-48">{basics.summary}</p>
        )}
        <div className="make-grid grid-cols-1 md:grid-cols-3 gap-48">
          <div className="md:span-col-2">
            {has(experience) && (
              <section className="add-margin-bottom-40">
                <H>Experience</H>
                {experience.map((x, i) => (
                  <div key={i} className={'round-corners-16 add-padding-24 add-margin-bottom-16 break-inside-avoid ' + a.soft}>
                    <div className="make-flex flex-wrap justify-between gap-8 align-start">
                      <div>
                        <h3 className="set-text-18 text-extrabold color-gray-900">{x.role}</h3>
                        <p className={'set-text-15 text-bold ' + a.textStrong}>{x.company}</p>
                      </div>
                      <span className="set-text-13 text-semibold color-gray-600 background-white add-padding-x-12 add-padding-y-4 make-pill">{dateRange(x.start, x.end)}</span>
                    </div>
                    <ul className="list-none add-padding-0 add-margin-0 add-margin-top-12">
                      {x.highlights.map((h, j) => (
                        <li key={j} className="make-flex gap-10 set-text-14 color-gray-700 line-height-relaxed add-margin-bottom-6">
                          <span className={'text-extrabold flex-shrink-0 ' + a.text}>★</span><span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}
            {has(projects) && (
              <section>
                <H>Campaigns</H>
                {projects.map((p, i) => (
                  <div key={i} className="add-border-left-4 add-padding-left-16 add-margin-bottom-16 border-color-gray-200">
                    <A href={p.url} className="set-text-16 text-bold color-gray-900 text-no-decoration">{p.name}</A>
                    <p className="set-text-14 color-gray-600">{p.description}</p>
                  </div>
                ))}
              </section>
            )}
          </div>
          <aside >
            {has(skills) && (
              <section className="add-margin-bottom-40">
                <H>Expertise</H>
                <div className="make-flex flex-wrap gap-8">
                  {skills.map(s => (
                    <span key={s.name} className={'set-text-13 text-bold add-padding-x-14 add-padding-y-8 make-pill ' + a.softer + ' ' + a.textDeep}>{s.name}</span>
                  ))}
                </div>
              </section>
            )}
            {has(education) && (
              <section className="add-margin-bottom-40">
                <H>Education</H>
                {education.map((e, i) => (
                  <div key={i} className="add-margin-bottom-12">
                    <p className="set-text-15 text-bold color-gray-900">{e.degree}</p>
                    <p className="set-text-14 color-gray-600">{e.school} · {dateRange(e.start, e.end)}</p>
                  </div>
                ))}
              </section>
            )}
            {has(certifications) && (
              <section className="add-margin-bottom-40">
                <H>Certified</H>
                {certifications.map((c, i) => (
                  <p key={i} className="set-text-14 color-gray-700 add-margin-bottom-8">✓ {c.name} <span className="color-gray-400">({c.year})</span></p>
                ))}
              </section>
            )}
            {(has(languages) || has(links)) && (
              <section>
                <H>Elsewhere</H>
                {languages.map(l => <p key={l.name} className="set-text-14 color-gray-700 add-margin-bottom-4">{l.name} — {l.level}</p>)}
                <div className="make-flex flex-wrap gap-8 add-margin-top-12">
                  {links.map(l => (
                    <A key={l.url} href={l.url} className={'set-text-13 text-bold color-white add-padding-x-14 add-padding-y-6 make-pill text-no-decoration ' + a.solid + ' ' + a.solidHover}>{l.label} →</A>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
