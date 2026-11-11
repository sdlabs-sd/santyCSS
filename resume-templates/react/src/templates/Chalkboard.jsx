import { dateRange, dots } from '@shared/format.js';
import { A, Avatar, contacts, has } from './parts.jsx';

/** Chalkboard — Teacher. Friendly coloured sidebar, subjects and achievements. */
export default function Chalkboard({ data, accent: a }) {
  const { basics, experience, education, skills, projects, certifications, languages, links, stats } = data;
  const SideH = ({ children }) => (
    <h2 className={'set-text-12 text-bold text-uppercase letter-space-widest add-margin-bottom-12 ' + a.textLight}>{children}</h2>
  );
  const H = ({ icon, children }) => (
    <h2 className="make-flex align-center gap-10 set-text-20 text-bold color-gray-900 add-margin-bottom-16">
      <span className={'make-inline-flex align-center justify-center set-width-32 set-height-32 round-corners-10 set-text-16 ' + a.softer}>{icon}</span>
      {children}
    </h2>
  );

  return (
    <main className="font-sans min-height-screen background-amber-50 add-padding-y-40 add-padding-x-16 on-mobile:add-padding-0">
      <article className="max-width-1024 center-margin background-white round-corners-24 add-shadow-lg overflow-hidden make-grid grid-cols-1 md:grid-cols-3 print:no-shadow">
        <aside className={'add-padding-32 color-white ' + a.strong}>
          <Avatar basics={basics} className="set-width-120 set-height-120 make-circle add-border-4 border-color-white add-margin-bottom-20" fallbackClass={'set-text-40 text-bold ' + a.deep} />
          <h1 className="set-text-30 text-extrabold line-height-tight">{basics.name}</h1>
          <p className={'set-text-16 add-margin-top-6 add-margin-bottom-28 ' + a.textLight}>{basics.title}</p>

          <SideH>Contact</SideH>
          <ul className="list-none add-padding-0 add-margin-0 add-margin-bottom-28 set-text-14">
            {contacts(basics).map(c => (
              <li key={c.key} className="add-margin-bottom-8"><A href={c.href} className="color-white text-no-decoration">{c.icon} {c.label}</A></li>
            ))}
            {links.map(l => <li key={l.url} className="add-margin-bottom-8"><A href={l.url} className="color-white text-underline">{l.label}</A></li>)}
          </ul>

          {has(skills) && (
            <>
              <SideH>Teaching strengths</SideH>
              <ul className="list-none add-padding-0 add-margin-0 add-margin-bottom-28">
                {skills.map(s => (
                  <li key={s.name} className="add-margin-bottom-10">
                    <p className="set-text-14 add-margin-bottom-4">{s.name}</p>
                    <div className="make-flex gap-4" aria-label={s.level + ' out of 100'}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <span key={n} className={'set-width-10 set-height-10 make-circle ' + (n <= dots(s.level) ? 'background-white' : a.deep)} />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          {has(languages) && (
            <>
              <SideH>Languages</SideH>
              {languages.map(l => <p key={l.name} className="set-text-14 add-margin-bottom-4">{l.name} <span className={a.textLight}>· {l.level}</span></p>)}
            </>
          )}
        </aside>

        <div className="md:span-col-2 add-padding-40 on-mobile:add-padding-24">
          {basics.summary && (
            <section className="add-margin-bottom-32">
              <H icon="✏️">About me</H>
              <p className="set-text-15 color-gray-700 line-height-relaxed">{basics.summary}</p>
            </section>
          )}
          {has(stats) && (
            <div className="make-flex flex-wrap gap-12 add-margin-bottom-32">
              {stats.map(s => (
                <div key={s.label} className="flex-1 min-width-140 round-corners-16 add-padding-16 background-amber-50 add-border-2 border-color-amber-200 text-center">
                  <p className="set-text-26 text-extrabold color-amber-700">{s.value}</p>
                  <p className="set-text-12 text-semibold color-gray-600">{s.label}</p>
                </div>
              ))}
            </div>
          )}
          {has(experience) && (
            <section className="add-margin-bottom-32">
              <H icon="🏫">Teaching experience</H>
              {experience.map((x, i) => (
                <div key={i} className="add-margin-bottom-24 break-inside-avoid">
                  <div className="make-flex flex-wrap justify-between gap-8">
                    <h3 className="set-text-17 text-bold color-gray-900">{x.role}</h3>
                    <span className={'set-text-13 text-semibold ' + a.text}>{dateRange(x.start, x.end)}</span>
                  </div>
                  <p className="set-text-14 color-gray-500 add-margin-bottom-8">{x.company}{x.location && ', ' + x.location}</p>
                  <ul className="add-padding-left-20 set-text-14 color-gray-700 line-height-relaxed">
                    {x.highlights.map((h, j) => <li key={j} className="add-margin-bottom-4">{h}</li>)}
                  </ul>
                </div>
              ))}
            </section>
          )}
          {has(education) && (
            <section className="add-margin-bottom-32">
              <H icon="🎓">Education</H>
              <div className="make-grid grid-cols-1 md:grid-cols-2 gap-12">
                {education.map((e, i) => (
                  <div key={i} className="round-corners-12 add-padding-16 background-gray-50">
                    <p className="set-text-15 text-bold color-gray-900">{e.degree}</p>
                    <p className="set-text-13 color-gray-600">{e.school}</p>
                    <p className={'set-text-12 text-semibold add-margin-top-4 ' + a.text}>{dateRange(e.start, e.end)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {(has(certifications) || has(projects)) && (
            <section>
              <H icon="🏅">Certifications &amp; initiatives</H>
              {certifications.map((c, i) => <p key={i} className="set-text-14 color-gray-700 add-margin-bottom-6">✔ <span className="text-semibold">{c.name}</span> — {c.issuer}, {c.year}</p>)}
              {projects.map((p, i) => <p key={i} className="set-text-14 color-gray-700 add-margin-bottom-6">✔ <span className="text-semibold">{p.name}</span> — {p.description}</p>)}
            </section>
          )}
        </div>
      </article>
    </main>
  );
}
