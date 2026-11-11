import { dateRange } from '@shared/format.js';
import { A, contacts, has } from './parts.jsx';

/** Ledger — Accountant. Conservative, ATS-friendly single column with ruled sections. */
export default function Ledger({ data, accent: a }) {
  const { basics, experience, education, skills, projects, certifications, languages, links, stats } = data;
  const Section = ({ title, children }) => (
    <section className="make-grid grid-cols-1 md:grid-cols-4 gap-x-16 add-padding-y-20 add-border-top-1 border-color-gray-300 break-inside-avoid">
      <h2 className={'font-serif set-text-14 text-bold text-uppercase letter-space-wider add-margin-bottom-8 ' + a.textStrong}>{title}</h2>
      <div className="md:span-col-3">{children}</div>
    </section>
  );

  return (
    <main className="font-sans min-height-screen background-gray-200 add-padding-y-40 on-mobile:add-padding-y-0">
      <article className="max-width-896 center-margin background-white add-shadow-md add-padding-56 on-mobile:add-padding-24 print:no-shadow">
        <header className={'text-center add-padding-bottom-24 add-border-bottom-4 ' + a.border}>
          <h1 className="font-serif set-text-40 on-mobile:set-text-28 text-bold color-gray-900 letter-space-wide">{basics.name}</h1>
          <p className="set-text-15 text-semibold text-uppercase letter-space-widest color-gray-600 add-margin-top-6">{basics.title}</p>
          <p className="set-text-13 color-gray-600 add-margin-top-12">
            {contacts(basics).map((c, i) => (
              <span key={c.key}>{i > 0 && <span className="color-gray-300"> | </span>}<A href={c.href} className="color-gray-600 text-no-decoration">{c.label}</A></span>
            ))}
            {links.map(l => (
              <span key={l.url}><span className="color-gray-300"> | </span><A href={l.url} className="color-gray-600 text-no-decoration">{l.label}</A></span>
            ))}
          </p>
        </header>

        {basics.summary && (
          <Section title="Profile">
            <p className="set-text-14 color-gray-800 line-height-relaxed">{basics.summary}</p>
          </Section>
        )}
        {has(stats) && (
          <Section title="Key figures">
            <div className="make-flex flex-wrap gap-24">
              {stats.map(s => (
                <p key={s.label} className="set-text-14 color-gray-700"><span className={'font-serif set-text-22 text-bold ' + a.textStrong}>{s.value}</span> {s.label}</p>
              ))}
            </div>
          </Section>
        )}
        {has(experience) && (
          <Section title="Experience">
            {experience.map((x, i) => (
              <div key={i} className="add-margin-bottom-16">
                <div className="make-flex flex-wrap justify-between gap-8">
                  <h3 className="set-text-15 text-bold color-gray-900">{x.role}, {x.company}</h3>
                  <span className="set-text-13 color-gray-600 text-italic">{dateRange(x.start, x.end)}</span>
                </div>
                {x.location && <p className="set-text-13 color-gray-500">{x.location}</p>}
                <ul className="add-padding-left-20 add-margin-top-6 set-text-14 color-gray-800 line-height-relaxed">
                  {x.highlights.map((h, j) => <li key={j} className="add-margin-bottom-2">{h}</li>)}
                </ul>
              </div>
            ))}
          </Section>
        )}
        {has(education) && (
          <Section title="Education">
            {education.map((e, i) => (
              <div key={i} className="make-flex flex-wrap justify-between gap-8 add-margin-bottom-8">
                <p className="set-text-14 color-gray-800"><span className="text-bold">{e.degree}</span>, {e.school}{e.details && ' — ' + e.details}</p>
                <span className="set-text-13 color-gray-600 text-italic">{dateRange(e.start, e.end)}</span>
              </div>
            ))}
          </Section>
        )}
        {has(certifications) && (
          <Section title="Qualifications">
            {certifications.map((c, i) => <p key={i} className="set-text-14 color-gray-800 add-margin-bottom-4"><span className="text-bold">{c.name}</span>, {c.issuer} ({c.year})</p>)}
          </Section>
        )}
        {has(skills) && (
          <Section title="Skills">
            <p className="set-text-14 color-gray-800 line-height-relaxed">{skills.map(s => s.name).join(' • ')}</p>
          </Section>
        )}
        {has(projects) && (
          <Section title="Projects">
            {projects.map((p, i) => <p key={i} className="set-text-14 color-gray-800 add-margin-bottom-4"><span className="text-bold">{p.name}</span> — {p.description}</p>)}
          </Section>
        )}
        {has(languages) && (
          <Section title="Languages">
            <p className="set-text-14 color-gray-800">{languages.map(l => l.name + ' (' + l.level + ')').join(', ')}</p>
          </Section>
        )}
      </article>
    </main>
  );
}
