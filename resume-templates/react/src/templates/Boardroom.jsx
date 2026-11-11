import { dateRange } from '@shared/format.js';
import { A, Avatar, contacts, has } from './parts.jsx';

/** Boardroom (premium) — Chief Executive. Dark luxe cover panel, leadership metrics. */
export default function Boardroom({ data, accent: a }) {
  const { basics, experience, education, skills, projects, certifications, languages, links, stats } = data;
  const H = ({ children }) => (
    <h2 className={'font-serif set-text-13 text-bold text-uppercase letter-space-widest add-margin-bottom-20 ' + a.text}>{children}</h2>
  );

  return (
    <main className="font-sans min-height-screen background-neutral-900 add-padding-y-40 add-padding-x-16 on-mobile:add-padding-0">
      <article className="max-width-1024 center-margin background-white overflow-hidden add-shadow-xl make-grid grid-cols-1 md:grid-cols-3 print:no-shadow">
        <aside className="background-neutral-900 color-white add-padding-40 on-mobile:add-padding-24 position-relative">
          <div className={'position-absolute pin-top-0 pin-left-0 pin-right-0 set-height-4 ' + a.bar} />
          <Avatar basics={basics} className={'set-width-140 set-height-140 make-circle add-border-2 add-margin-bottom-24 ' + a.borderMid} fallbackClass={'font-serif set-text-48 background-neutral-800 ' + a.textBright} />
          <h1 className="font-serif set-text-36 text-bold line-height-tight">{basics.name}</h1>
          <p className={'set-text-13 text-bold text-uppercase letter-space-widest add-margin-top-12 ' + a.textBright}>{basics.title}</p>
          <div className={'set-width-48 set-height-1 add-margin-y-28 ' + a.bar} />

          <ul className="list-none add-padding-0 add-margin-0 set-text-14 add-margin-bottom-32">
            {contacts(basics).map(c => (
              <li key={c.key} className="add-margin-bottom-10"><A href={c.href} className="color-neutral-300 text-no-decoration on-hover:color-white">{c.label}</A></li>
            ))}
            {links.map(l => <li key={l.url} className="add-margin-bottom-10"><A href={l.url} className={'text-no-decoration ' + a.textBright}>{l.label} →</A></li>)}
          </ul>

          {has(skills) && (
            <section className="add-margin-bottom-32">
              <h2 className="set-text-12 text-bold text-uppercase letter-space-widest color-neutral-500 add-margin-bottom-12">Leadership</h2>
              {skills.map(s => <p key={s.name} className="set-text-14 color-neutral-200 add-padding-y-6 add-border-bottom-1 border-color-neutral-800">{s.name}</p>)}
            </section>
          )}
          {has(education) && (
            <section className="add-margin-bottom-32">
              <h2 className="set-text-12 text-bold text-uppercase letter-space-widest color-neutral-500 add-margin-bottom-12">Education</h2>
              {education.map((e, i) => (
                <div key={i} className="add-margin-bottom-12">
                  <p className="font-serif set-text-16 color-white">{e.degree}</p>
                  <p className="set-text-13 color-neutral-400">{e.school} · {e.end}</p>
                </div>
              ))}
            </section>
          )}
          {(has(certifications) || has(languages)) && (
            <section>
              <h2 className="set-text-12 text-bold text-uppercase letter-space-widest color-neutral-500 add-margin-bottom-12">Boards &amp; languages</h2>
              {certifications.map((c, i) => <p key={i} className="set-text-13 color-neutral-300 add-margin-bottom-6">{c.name}</p>)}
              {languages.map(l => <p key={l.name} className="set-text-13 color-neutral-300 add-margin-bottom-6">{l.name} — {l.level}</p>)}
            </section>
          )}
        </aside>

        <div className="md:span-col-2 add-padding-48 on-mobile:add-padding-24">
          {basics.summary && (
            <section className="add-margin-bottom-40">
              <H>Executive profile</H>
              <p className="font-serif set-text-20 on-mobile:set-text-18 color-neutral-800 line-height-relaxed">{basics.summary}</p>
            </section>
          )}
          {has(stats) && (
            <div className="make-grid grid-cols-2 gap-1 background-neutral-200 add-border-1 border-color-neutral-200 add-margin-bottom-40">
              {stats.map(s => (
                <div key={s.label} className="background-white add-padding-24">
                  <p className={'font-serif set-text-40 text-bold line-height-tight ' + a.textStrong}>{s.value}</p>
                  <p className="set-text-12 text-bold text-uppercase letter-space-wider color-neutral-500 add-margin-top-6">{s.label}</p>
                </div>
              ))}
            </div>
          )}
          {has(experience) && (
            <section className="add-margin-bottom-32">
              <H>Career</H>
              {experience.map((x, i) => (
                <div key={i} className="add-margin-bottom-28 break-inside-avoid">
                  <p className="set-text-12 text-bold text-uppercase letter-space-widest color-neutral-400">{dateRange(x.start, x.end)}</p>
                  <h3 className="font-serif set-text-22 text-bold color-neutral-900 add-margin-top-4">{x.role}</h3>
                  <p className={'set-text-15 text-semibold ' + a.textStrong}>{x.company}{x.location && <span className="color-neutral-400 text-regular"> — {x.location}</span>}</p>
                  <ul className="list-none add-padding-0 add-margin-0 add-margin-top-10">
                    {x.highlights.map((h, j) => (
                      <li key={j} className="make-flex gap-12 set-text-15 color-neutral-700 line-height-relaxed add-margin-bottom-6">
                        <span className={'set-width-12 set-height-1 add-margin-top-12 flex-shrink-0 ' + a.bar} /><span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}
          {has(projects) && (
            <section>
              <H>Selected initiatives</H>
              {projects.map((p, i) => <p key={i} className="set-text-15 color-neutral-700 add-margin-bottom-8"><span className="text-bold color-neutral-900">{p.name}.</span> {p.description}</p>)}
            </section>
          )}
        </div>
      </article>
    </main>
  );
}
