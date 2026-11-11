import { dateRange } from '@shared/format.js';
import { A, Avatar, contacts, has } from './parts.jsx';

/** Physician (premium) — Doctor. Clinical two-column with publications and licences. */
export default function Physician({ data, accent: a }) {
  const { basics, experience, education, skills, projects, certifications, languages, links, stats } = data;
  const H = ({ children }) => (
    <h2 className="make-flex align-center gap-10 set-text-15 text-bold text-uppercase letter-space-wider color-gray-900 add-margin-bottom-16">
      <span className={'make-inline-flex align-center justify-center set-width-24 set-height-24 round-corners-6 set-text-14 color-white ' + a.solid}>+</span>
      {children}
    </h2>
  );

  return (
    <main className="font-sans min-height-screen background-gray-100 add-padding-y-40 add-padding-x-16 on-mobile:add-padding-0">
      <article className="max-width-1024 center-margin background-white round-corners-20 add-shadow-lg overflow-hidden print:no-shadow">
        <header className={'add-padding-40 on-mobile:add-padding-24 ' + a.soft}>
          <div className="make-flex flex-wrap align-center gap-28">
            <Avatar basics={basics} className="set-width-120 set-height-120 round-corners-20 add-shadow-md flex-shrink-0" fallbackClass={'set-text-40 text-bold color-white ' + a.solid} />
            <div className="flex-1 min-width-280">
              <p className={'set-text-12 text-bold text-uppercase letter-space-widest ' + a.text}>{basics.title}</p>
              <h1 className="set-text-40 on-mobile:set-text-28 text-extrabold color-gray-900 line-height-tight add-margin-top-4">{basics.name}</h1>
              {basics.summary && <p className="set-text-15 color-gray-700 line-height-relaxed add-margin-top-12 max-width-720">{basics.summary}</p>}
            </div>
          </div>
          {has(stats) && (
            <div className="make-flex flex-wrap gap-12 add-margin-top-28">
              {stats.map(s => (
                <div key={s.label} className="background-white round-corners-12 add-padding-x-20 add-padding-y-12 add-shadow-sm">
                  <span className={'set-text-22 text-extrabold ' + a.textStrong}>{s.value}</span>
                  <span className="set-text-13 color-gray-600 add-margin-left-8">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </header>

        <div className="make-grid grid-cols-1 md:grid-cols-3">
          <aside className="add-padding-32 on-mobile:add-padding-24 add-border-right-1 border-color-gray-100">
            <section className="add-margin-bottom-32">
              <H>Contact</H>
              <ul className="list-none add-padding-0 add-margin-0 set-text-14">
                {contacts(basics).map(c => (
                  <li key={c.key} className="make-flex gap-10 add-margin-bottom-10"><span className={a.text}>{c.icon}</span><A href={c.href} className="color-gray-700 text-no-decoration">{c.label}</A></li>
                ))}
                {links.map(l => (
                  <li key={l.url} className="make-flex gap-10 add-margin-bottom-10"><span className={a.text}>↗</span><A href={l.url} className={'text-semibold text-no-decoration ' + a.textStrong}>{l.label}</A></li>
                ))}
              </ul>
            </section>
            {has(certifications) && (
              <section className="add-margin-bottom-32">
                <H>Licences</H>
                {certifications.map((c, i) => (
                  <div key={i} className={'add-padding-left-12 add-border-left-2 add-margin-bottom-12 ' + a.border}>
                    <p className="set-text-14 text-bold color-gray-900">{c.name}</p>
                    <p className="set-text-12 color-gray-500">{c.issuer} · {c.year}</p>
                  </div>
                ))}
              </section>
            )}
            {has(skills) && (
              <section className="add-margin-bottom-32">
                <H>Specialties</H>
                <div className="make-flex flex-wrap gap-6">
                  {skills.map(s => <span key={s.name} className={'set-text-12 text-semibold add-padding-x-10 add-padding-y-4 round-corners-6 ' + a.softer + ' ' + a.textDeep}>{s.name}</span>)}
                </div>
              </section>
            )}
            {has(languages) && (
              <section>
                <H>Languages</H>
                {languages.map(l => <p key={l.name} className="make-flex justify-between set-text-14 color-gray-700 add-margin-bottom-6"><span>{l.name}</span><span className="color-gray-400">{l.level}</span></p>)}
              </section>
            )}
          </aside>

          <div className="md:span-col-2 add-padding-32 on-mobile:add-padding-24">
            {has(experience) && (
              <section className="add-margin-bottom-32">
                <H>Appointments</H>
                {experience.map((x, i) => (
                  <div key={i} className="add-margin-bottom-20 add-padding-bottom-20 add-border-bottom-1 border-color-gray-100 break-inside-avoid">
                    <div className="make-flex flex-wrap justify-between gap-8">
                      <h3 className="set-text-17 text-bold color-gray-900">{x.role}</h3>
                      <span className="set-text-13 text-semibold color-gray-500">{dateRange(x.start, x.end)}</span>
                    </div>
                    <p className={'set-text-14 text-semibold add-margin-bottom-8 ' + a.text}>{x.company}{x.location && <span className="color-gray-400 text-regular"> · {x.location}</span>}</p>
                    <ul className="add-padding-left-20 set-text-14 color-gray-700 line-height-relaxed">
                      {x.highlights.map((h, j) => <li key={j} className="add-margin-bottom-4">{h}</li>)}
                    </ul>
                  </div>
                ))}
              </section>
            )}
            {has(education) && (
              <section className="add-margin-bottom-32">
                <H>Training &amp; education</H>
                {education.map((e, i) => (
                  <div key={i} className="make-flex flex-wrap justify-between gap-8 add-margin-bottom-10">
                    <div>
                      <p className="set-text-15 text-bold color-gray-900">{e.degree}</p>
                      <p className="set-text-13 color-gray-600">{e.school}{e.details && ' · ' + e.details}</p>
                    </div>
                    <span className="set-text-13 color-gray-500">{dateRange(e.start, e.end)}</span>
                  </div>
                ))}
              </section>
            )}
            {has(projects) && (
              <section>
                <H>Selected publications</H>
                <ol className="add-padding-left-20 set-text-14 color-gray-700 line-height-relaxed">
                  {projects.map((p, i) => (
                    <li key={i} className="add-margin-bottom-8"><A href={p.url} className="text-bold color-gray-900 text-no-decoration">{p.name}</A>. <span className="text-italic">{p.description}</span></li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}
