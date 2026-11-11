import { dateRange } from '@shared/format.js';
import { A, contacts, has } from './parts.jsx';

/** Counsel (premium) — Corporate Lawyer. Refined serif, admissions and matters. */
export default function Counsel({ data, accent: a }) {
  const { basics, experience, education, skills, projects, certifications, languages, links, stats } = data;
  const H = ({ children }) => (
    <h2 className="text-center add-margin-bottom-24">
      <span className="font-serif set-text-14 text-uppercase letter-space-widest color-stone-900 add-padding-x-16 background-white position-relative">{children}</span>
    </h2>
  );
  const Rule = () => <div className="set-height-1 background-stone-300 add-margin-bottom-24" />;

  return (
    <main className="font-sans min-height-screen background-stone-200 add-padding-y-48 add-padding-x-16 on-mobile:add-padding-0">
      <article className="max-width-840 center-margin background-white add-shadow-lg add-padding-64 on-mobile:add-padding-24 add-border-1 border-color-stone-300 print:no-shadow">
        <header className="text-center add-margin-bottom-40">
          <p className={'font-serif set-text-14 text-italic ' + a.text}>Curriculum Vitae</p>
          <h1 className="font-serif set-text-48 on-mobile:set-text-32 text-regular color-stone-900 letter-space-wide add-margin-top-8">{basics.name}</h1>
          <p className="set-text-13 text-uppercase letter-space-widest color-stone-600 add-margin-top-8">{basics.title}</p>
          <div className="make-flex justify-center align-center gap-12 add-margin-y-20" aria-hidden="true">
            <span className="set-width-64 set-height-1 background-stone-300" />
            <span className={'set-width-8 set-height-8 rotate-45 ' + a.solid} />
            <span className="set-width-64 set-height-1 background-stone-300" />
          </div>
          <p className="font-serif set-text-14 color-stone-600">
            {contacts(basics).map((c, i) => (
              <span key={c.key}>{i > 0 && '  ·  '}<A href={c.href} className="color-stone-600 text-no-decoration">{c.label}</A></span>
            ))}
            {links.map(l => <span key={l.url}>  ·  <A href={l.url} className={'text-no-decoration ' + a.text}>{l.label}</A></span>)}
          </p>
        </header>

        {basics.summary && (
          <p className="font-serif set-text-17 color-stone-700 line-height-relaxed text-center text-italic add-margin-bottom-40 max-width-640 center-margin">“{basics.summary}”</p>
        )}

        {has(certifications) && (
          <section className="add-margin-bottom-32">
            <Rule /><H>Admissions</H>
            <div className="make-flex flex-wrap justify-center gap-16">
              {certifications.map((c, i) => (
                <div key={i} className={'text-center add-padding-x-20 add-padding-y-12 add-border-1 ' + a.borderSoft}>
                  <p className="font-serif set-text-15 color-stone-900">{c.name}</p>
                  <p className="set-text-12 color-stone-500 add-margin-top-2">{c.issuer}, {c.year}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {has(experience) && (
          <section className="add-margin-bottom-32">
            <Rule /><H>Professional experience</H>
            {experience.map((x, i) => (
              <div key={i} className="add-margin-bottom-24 break-inside-avoid">
                <div className="make-flex flex-wrap justify-between gap-8 align-baseline">
                  <h3 className="font-serif set-text-19 color-stone-900">{x.company}</h3>
                  <span className="font-serif set-text-14 text-italic color-stone-500">{dateRange(x.start, x.end)}</span>
                </div>
                <p className={'set-text-13 text-uppercase letter-space-wider add-margin-bottom-8 ' + a.textStrong}>{x.role}{x.location && ' — ' + x.location}</p>
                <ul className="add-padding-left-20 font-serif set-text-15 color-stone-700 line-height-relaxed">
                  {x.highlights.map((h, j) => <li key={j} className="add-margin-bottom-4">{h}</li>)}
                </ul>
              </div>
            ))}
          </section>
        )}

        {has(projects) && (
          <section className="add-margin-bottom-32">
            <Rule /><H>Notable matters</H>
            {projects.map((p, i) => (
              <p key={i} className="font-serif set-text-15 color-stone-700 add-margin-bottom-8"><span className="color-stone-900 text-bold">{p.name}.</span> {p.description}</p>
            ))}
          </section>
        )}

        {has(education) && (
          <section className="add-margin-bottom-32">
            <Rule /><H>Education</H>
            {education.map((e, i) => (
              <div key={i} className="make-flex flex-wrap justify-between gap-8 add-margin-bottom-10">
                <p className="font-serif set-text-15 color-stone-800"><span className="text-bold">{e.school}</span> — {e.degree}{e.details && ', ' + e.details}</p>
                <span className="font-serif set-text-14 text-italic color-stone-500">{dateRange(e.start, e.end)}</span>
              </div>
            ))}
          </section>
        )}

        {(has(skills) || has(languages) || has(stats)) && (
          <section>
            <Rule /><H>Practice &amp; languages</H>
            <p className="font-serif set-text-15 color-stone-700 text-center line-height-relaxed">{skills.map(s => s.name).join(' · ')}</p>
            {has(languages) && <p className="font-serif set-text-14 color-stone-500 text-center text-italic add-margin-top-8">{languages.map(l => l.name + ' (' + l.level + ')').join(', ')}</p>}
            {has(stats) && (
              <div className="make-flex flex-wrap justify-center gap-40 add-margin-top-24">
                {stats.map(s => (
                  <div key={s.label} className="text-center">
                    <p className={'font-serif set-text-30 ' + a.textStrong}>{s.value}</p>
                    <p className="set-text-12 text-uppercase letter-space-widest color-stone-500">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </article>
    </main>
  );
}
