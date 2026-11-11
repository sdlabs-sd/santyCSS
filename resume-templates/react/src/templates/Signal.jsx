import { dateRange, levelWidth } from '@shared/format.js';
import { A, Avatar, contacts, has } from './parts.jsx';

/** Signal — Data Scientist. Metric tiles + proficiency bars, dashboard feel. */
export default function Signal({ data, accent: a }) {
  const { basics, experience, education, skills, projects, certifications, languages, links, stats } = data;
  const Card = ({ title, children, className = '' }) => (
    <section className={'background-white round-corners-16 add-border-1 border-color-gray-200 add-padding-24 break-inside-avoid ' + className}>
      <h2 className="make-flex align-center gap-8 set-text-13 text-bold text-uppercase letter-space-wider color-gray-500 add-margin-bottom-16">
        <span className={'set-width-8 set-height-8 round-corners-2 ' + a.bar} />
        {title}
      </h2>
      {children}
    </section>
  );

  return (
    <main className="font-sans min-height-screen background-gray-100 add-padding-y-40 add-padding-x-16 on-mobile:add-padding-y-16">
      <div className="max-width-1024 center-margin">
        <header className={'round-corners-20 add-padding-32 on-mobile:add-padding-24 color-white make-flex flex-wrap align-center gap-24 ' + a.deep}>
          <Avatar basics={basics} className="set-width-80 set-height-80 make-circle add-border-4 border-color-white flex-shrink-0" fallbackClass={'set-text-28 text-bold ' + a.bar} />
          <div className="flex-1 min-width-240">
            <h1 className="set-text-36 on-mobile:set-text-28 text-extrabold line-height-tight">{basics.name}</h1>
            <p className={'set-text-17 add-margin-top-4 ' + a.textLight}>{basics.title}</p>
          </div>
          <ul className="list-none add-padding-0 add-margin-0 set-text-14">
            {contacts(basics).map(c => (
              <li key={c.key} className="add-margin-bottom-4">
                <A href={c.href} className={'text-no-decoration on-hover:color-white ' + a.textLight}>{c.icon} {c.label}</A>
              </li>
            ))}
          </ul>
        </header>

        {has(stats) && (
          <div className="make-grid grid-cols-2 md:grid-cols-4 gap-16 add-margin-top-16">
            {stats.map(s => (
              <div key={s.label} className="background-white round-corners-16 add-border-1 border-color-gray-200 add-padding-20">
                <p className="set-text-12 text-semibold text-uppercase letter-space-wide color-gray-500">{s.label}</p>
                <p className={'set-text-32 text-extrabold add-margin-top-4 ' + a.text}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="make-grid grid-cols-1 md:grid-cols-3 gap-16 add-margin-top-16">
          <div className="make-flex flex-column gap-16">
            {has(skills) && (
              <Card title="Proficiency">
                {skills.map(s => (
                  <div key={s.name} className="add-margin-bottom-14">
                    <div className="make-flex justify-between set-text-13 add-margin-bottom-6">
                      <span className="text-semibold color-gray-800">{s.name}</span>
                      <span className="color-gray-500 font-mono">{s.level}</span>
                    </div>
                    <div className="set-height-8 background-gray-100 make-pill overflow-hidden">
                      <div className={'set-height-8 make-pill ' + a.bar + ' ' + levelWidth(s.level)} />
                    </div>
                  </div>
                ))}
              </Card>
            )}
            {has(education) && (
              <Card title="Education">
                {education.map((e, i) => (
                  <div key={i} className="add-margin-bottom-12">
                    <p className="set-text-14 text-bold color-gray-900">{e.degree}</p>
                    <p className="set-text-13 color-gray-600">{e.school}</p>
                    <p className="set-text-12 color-gray-500">{dateRange(e.start, e.end)}{e.details && ' · ' + e.details}</p>
                  </div>
                ))}
              </Card>
            )}
            {(has(certifications) || has(languages) || has(links)) && (
              <Card title="More">
                {certifications.map((c, i) => (
                  <p key={i} className="set-text-13 color-gray-700 add-margin-bottom-8"><span className="text-semibold">{c.name}</span> · {c.year}</p>
                ))}
                {has(languages) && <p className="set-text-13 color-gray-700 add-margin-top-8">{languages.map(l => l.name + ' (' + l.level + ')').join(', ')}</p>}
                <div className="make-flex flex-wrap gap-8 add-margin-top-12">
                  {links.map(l => (
                    <A key={l.url} href={l.url} className={'set-text-12 text-semibold add-padding-x-10 add-padding-y-4 make-pill text-no-decoration ' + a.soft + ' ' + a.textStrong}>{l.label}</A>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="md:span-col-2 make-flex flex-column gap-16">
            {basics.summary && (
              <Card title="Summary">
                <p className="set-text-15 color-gray-700 line-height-relaxed">{basics.summary}</p>
              </Card>
            )}
            {has(experience) && (
              <Card title="Experience">
                {experience.map((x, i) => (
                  <div key={i} className={'add-padding-bottom-20 add-margin-bottom-20 break-inside-avoid ' + (i < experience.length - 1 ? 'add-border-bottom-1 border-color-gray-100' : '')}>
                    <div className="make-flex flex-wrap justify-between gap-8">
                      <h3 className="set-text-17 text-bold color-gray-900">{x.role}</h3>
                      <span className={'set-text-12 text-semibold add-padding-x-10 add-padding-y-4 make-pill ' + a.soft + ' ' + a.textStrong}>{dateRange(x.start, x.end)}</span>
                    </div>
                    <p className="set-text-14 color-gray-500 add-margin-bottom-8">{x.company}{x.location && ' · ' + x.location}</p>
                    <ul className="add-padding-left-20 set-text-14 color-gray-700 line-height-relaxed">
                      {x.highlights.map((h, j) => <li key={j} className="add-margin-bottom-4">{h}</li>)}
                    </ul>
                  </div>
                ))}
              </Card>
            )}
            {has(projects) && (
              <Card title="Projects">
                {projects.map((p, i) => (
                  <div key={i} className="add-margin-bottom-12">
                    <A href={p.url} className={'set-text-15 text-bold text-no-decoration ' + a.text}>{p.name}</A>
                    <p className="set-text-14 color-gray-600">{p.description}</p>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
