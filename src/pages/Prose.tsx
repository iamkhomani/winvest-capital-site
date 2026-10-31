import type { Section } from '../content/articles'

export default function Prose({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((s) => (
        <section key={s.h} className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight">{s.h}</h2>
          {s.p?.map((x) => (
            <p key={x.slice(0, 40)} className="mt-4 leading-relaxed text-white/75">{x}</p>
          ))}
          {s.ul && (
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-white/75 marker:text-[var(--wc-red)]">
              {s.ul.map((x) => (
                <li key={x.slice(0, 40)}>{x}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  )
}
