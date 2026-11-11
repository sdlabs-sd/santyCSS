import { dateRange } from '@shared/format.js';
import { A, Avatar, contacts, has } from './parts.jsx';

/** Canvas — Product Designer. Editorial oversized name, case-study cards. */
export default function Canvas({ data, accent: a }) {
  const { basics, experience, education, skills, projects, certifications, languages, links, stats } = data;
  const Label = ({ children }) => (
    <h2 className="set-text-12 text-bold text-uppercase letter-space-widest color-stone-400 add-margin-bottom-20">{children}</h2>
  );

  return (
    <main className="font-sans min-height-screen background-stone-100 add-padding-y-40 on-mobile:add-padding-y-0">
      <article className="max-width-960 center-margin background-white add-shadow-lg add-padding-56 on-mobile:add-padding-24 print:no-shadow">
        <header className="make-flex flex-wrap align-end justify-between gap-24 add-padding-bottom-40 add-border-bottom-1 border-color-stone-200">
          <div className="flex-1 min-width-280">
            <span className={'make-inline-block set-text-12 text-bold text-uppercase letter-space-widest add-padding-x-12 add-padding-y-6 make-pill add-margin-bottom-20 ' + a.softer + ' ' + a.textStrong}>
              {basics.title}
            </span>
            <h1 className="set-text-64 on-mobile:set-text-40 text-extrabold color-stone-900 line-height-tight letter-space-tight text-balance">
              {basics.name}
            </h1>
          </div>
          <Avatar basics={basics} className="set-width-120 set-height-120 round-corners-24 flex-shrink-0" fallbackClass={'set-text-40 text-extrabold color-white ' + a.solid} />
        </header>

        <div className="make-grid grid-cols-1 md:grid-cols-3 add-padding-top-40">
          <div className="add-padding-right-32 on-mobile:add-padding-0 add-margin-bottom-32">
            <section className="add-margin-bottom-32">
              <Label>Contact</Label>
              <ul className="list-none add-padding-0 add-margin-0">
                {contacts(basics).map(c => (
                  <li key={c.key} className="set-text-14 add-margin-bottom-8">
                    <A href={c.href} className="color-stone-700 text-no-decoration on-hover:color-stone-900">{c.label}</A>
                  </li>
                ))}
                {links.map(l => (
                  <li key={l.url} className="set-text-14 add-margin-bottom-8">
                    <A href={l.url} className={'text-semibold text-no-decoration ' + a.text}>{l.label} ↗</A>
                  </li>
                ))}
              </ul>
            </section>
            {has(skills) && (
              <section className="add-margin-bottom-32">
                <Label>Toolkit</Label>
                <div className="make-flex flex-wrap gap-8">
                  {skills.map(s => (
                    <span key={s.name} className="set-text-13 text-medium color-stone-800 add-border-1 border-color-stone-300 add-padding-x-12 add-padding-y-6 make-pill">{s.name}</span>
                  ))}
                </div>
              </section>
            )}
            {has(stats) && (
              <section className="add-margin-bottom-32">
                <Label>Impact</Label>
                {stats.map(s => (
                  <div key={s.label} className="add-margin-bottom-16">
                    <p className={'set-text-32 text-extrabold line-height-tight ' + a.text}>{s.value}</p>
                    <p className="set-text-13 color-stone-500">{s.label}</p>
                  </div>
                ))}
              </section>
            )}
            {has(education) && (
              <section className="add-margin-bottom-32">
                <Label>Education</Label>
                {education.map((e, i) => (
                  <div key={i} className="add-margin-bottom-12">
                    <p className="set-text-14 text-bold color-stone-900">{e.degree}</p>
                    <p className="set-text-13 color-stone-500">{e.school}, {dateRange(e.start, e.end)}</p>
                  </div>
                ))}
              </section>
            )}
            {(has(languages) || has(certifications)) && (
              <section>
                <Label>Also</Label>
                {certifications.map((c, i) => <p key={i} className="set-text-13 color-stone-700 add-margin-bottom-6">{c.name} — {c.year}</p>)}
                {languages.map(l => <p key={l.name} className="set-text-13 color-stone-700 add-margin-bottom-6">{l.name} · {l.level}</p>)}
              </section>
            )}
          </div>

          <div className="md:span-col-2">
            {basics.summary && (
              <p className="set-text-22 on-mobile:set-text-18 color-stone-800 line-height-snug add-margin-bottom-40 text-medium">{basics.summary}</p>
            )}
            {has(projects) && (
              <section className="add-margin-bottom-40">
                <Label>Selected work</Label>
                <div className="make-grid grid-cols-1 md:grid-cols-2 gap-16">
                  {projects.map((p, i) => (
                    <A key={i} href={p.url} className={'make-block text-no-decoration round-corners-16 add-padding-24 break-inside-avoid transition-all on-hover:translate-y-minus-4 ' + (i === 0 ? a.solid + ' color-white' : 'background-stone-100 color-stone-900')}>
                      <p className="set-text-12 text-bold text-uppercase letter-space-wider opacity-75">{p.tags.join(' · ')}</p>
                      <p className="set-text-20 text-extrabold add-margin-top-24 line-height-tight">{p.name}</p>
                      <p className="set-text-14 add-margin-top-8 opacity-90 line-height-relaxed">{p.description}</p>
                    </A>
                  ))}
                </div>
              </section>
            )}
            {has(experience) && (
              <section>
                <Label>Experience</Label>
                {experience.map((x, i) => (
                  <div key={i} className="add-padding-y-20 add-border-top-1 border-color-stone-200 break-inside-avoid">
                    <div className="make-flex flex-wrap justify-between gap-8">
                      <h3 className="set-text-18 text-bold color-stone-900">{x.role} <span className={a.text}>@ {x.company}</span></h3>
                      <span className="set-text-13 color-stone-500">{dateRange(x.start, x.end)}</span>
                    </div>
                    <ul className="add-margin-top-8 add-padding-left-20 color-stone-600 set-text-14 line-height-relaxed">
                      {x.highlights.map((h, j) => <li key={j} className="add-margin-bottom-4">{h}</li>)}
                    </ul>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}
