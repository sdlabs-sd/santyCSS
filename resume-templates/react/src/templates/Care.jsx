import { dateRange } from '@shared/format.js';
import { A, Avatar, contacts, has } from './parts.jsx';

/** Care — Registered Nurse. Calm, scannable, licences and certifications first. */
export default function Care({ data, accent: a }) {
  const { basics, experience, education, skills, projects, certifications, languages, links, stats } = data;
  const H = ({ children }) => (
    <h2 className={'set-text-16 text-bold add-padding-bottom-8 add-margin-bottom-16 add-border-bottom-2 ' + a.textStrong + ' ' + a.borderSoft}>{children}</h2>
  );

  return (
    <main className={'font-sans min-height-screen add-padding-y-40 add-padding-x-16 on-mobile:add-padding-0 ' + a.soft}>
      <article className="max-width-896 center-margin background-white round-corners-24 add-shadow-md overflow-hidden print:no-shadow">
        <header className="add-padding-40 on-mobile:add-padding-24 make-flex flex-wrap align-center gap-24">
          <Avatar basics={basics} className={'set-width-96 set-height-96 make-circle add-border-4 flex-shrink-0 ' + a.borderSoft} fallbackClass={'set-text-32 text-bold ' + a.softer + ' ' + a.textStrong} />
          <div className="flex-1 min-width-240">
            <h1 className="set-text-36 on-mobile:set-text-28 text-bold color-gray-900 line-height-tight">{basics.name}</h1>
            <p className={'set-text-18 text-medium add-margin-top-4 ' + a.text}>{basics.title}</p>
          </div>
        </header>
        <div className={'add-padding-x-40 add-padding-y-16 on-mobile:add-padding-x-24 make-flex flex-wrap gap-x-28 gap-y-8 set-text-14 ' + a.softer}>
          {contacts(basics).map(c => (
            <A key={c.key} href={c.href} className="color-gray-700 text-no-decoration on-hover:color-gray-900">
              <span className={a.text}>{c.icon}</span> {c.label}
            </A>
          ))}
          {links.map(l => <A key={l.url} href={l.url} className={'text-semibold text-no-decoration ' + a.textStrong}>{l.label}</A>)}
        </div>

        <div className="add-padding-40 on-mobile:add-padding-24">
          {basics.summary && <p className="set-text-15 color-gray-700 line-height-relaxed add-margin-bottom-32">{basics.summary}</p>}

          {has(certifications) && (
            <section className="add-margin-bottom-32">
              <H>Licences &amp; certifications</H>
              <div className="make-grid grid-cols-1 md:grid-cols-3 gap-12">
                {certifications.map((c, i) => (
                  <div key={i} className={'round-corners-12 add-padding-16 add-border-1 ' + a.borderSoft}>
                    <p className={'set-text-12 text-bold text-uppercase letter-space-wide ' + a.text}>{c.year}</p>
                    <p className="set-text-14 text-bold color-gray-900 add-margin-top-4">{c.name}</p>
                    <p className="set-text-12 color-gray-500 add-margin-top-2">{c.issuer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="make-grid grid-cols-1 md:grid-cols-3 gap-32">
            <div className="md:span-col-2">
              {has(experience) && (
                <section className="add-margin-bottom-32">
                  <H>Clinical experience</H>
                  {experience.map((x, i) => (
                    <div key={i} className="add-margin-bottom-24 break-inside-avoid">
                      <h3 className="set-text-16 text-bold color-gray-900">{x.role}</h3>
                      <p className="set-text-14 color-gray-600">{x.company}{x.location && ', ' + x.location} · <span className="text-semibold">{dateRange(x.start, x.end)}</span></p>
                      <ul className="add-padding-left-20 add-margin-top-8 set-text-14 color-gray-700 line-height-relaxed">
                        {x.highlights.map((h, j) => <li key={j} className="add-margin-bottom-4">{h}</li>)}
                      </ul>
                    </div>
                  ))}
                </section>
              )}
              {has(education) && (
                <section>
                  <H>Education</H>
                  {education.map((e, i) => (
                    <div key={i} className="add-margin-bottom-12">
                      <p className="set-text-15 text-bold color-gray-900">{e.degree}</p>
                      <p className="set-text-14 color-gray-600">{e.school} · {dateRange(e.start, e.end)}</p>
                    </div>
                  ))}
                </section>
              )}
            </div>
            <aside >
              {has(stats) && (
                <section className="add-margin-bottom-32">
                  {stats.map(s => (
                    <div key={s.label} className={'round-corners-12 add-padding-16 add-margin-bottom-12 ' + a.soft}>
                      <p className={'set-text-28 text-extrabold ' + a.textStrong}>{s.value}</p>
                      <p className="set-text-13 color-gray-600">{s.label}</p>
                    </div>
                  ))}
                </section>
              )}
              {has(skills) && (
                <section className="add-margin-bottom-32">
                  <H>Core skills</H>
                  <ul className="list-none add-padding-0 add-margin-0">
                    {skills.map(s => (
                      <li key={s.name} className="make-flex align-center gap-8 set-text-14 color-gray-800 add-margin-bottom-8">
                        <span className={'set-width-6 set-height-6 make-circle flex-shrink-0 ' + a.bar} />{s.name}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {has(languages) && (
                <section>
                  <H>Languages</H>
                  {languages.map(l => <p key={l.name} className="set-text-14 color-gray-700 add-margin-bottom-4">{l.name} <span className="color-gray-400">· {l.level}</span></p>)}
                </section>
              )}
              {has(projects) && (
                <section className="add-margin-top-32">
                  <H>Projects</H>
                  {projects.map((p, i) => <p key={i} className="set-text-14 color-gray-700 add-margin-bottom-8"><span className="text-bold">{p.name}</span> — {p.description}</p>)}
                </section>
              )}
            </aside>
          </div>
        </div>
      </article>
    </main>
  );
}
