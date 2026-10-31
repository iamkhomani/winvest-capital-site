import { DISCORD_URL } from '../config'
import { articles } from '../content/articles'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import Prose from './Prose'

export default function Article({ id, lang }: { id: string; lang: Lang }) {
  const idx = articles.findIndex((a) => a.id === id)
  const a = articles[idx][lang]
  const related = articles.filter((x) => x.id !== id).slice(0, 3)
  const next = articles[(idx + 1) % articles.length][lang]
  const L = lang === 'nl'
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-white/45">
        <a href={paths[lang].home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span>{' '}
        <a href={paths[lang].learn} className="hover:text-white">{L ? 'Leren' : 'Learn'}</a>
      </nav>
      <article>
        <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">{a.title}</h1>
        <p className="mt-6 text-lg leading-relaxed text-white/70">{a.intro}</p>
        <Prose sections={a.sections} />
        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">{L ? 'Veelgestelde vragen' : 'Frequently asked questions'}</h2>
          <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
            {a.faq.map(([q, ans]) => (
              <div key={q} className="py-5">
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-2 leading-relaxed text-white/70">{ans}</p>
              </div>
            ))}
          </div>
        </section>
        <p className="mt-8 text-sm text-white/40">
          {L
            ? 'Deze uitleg is uitsluitend educatief en geen financieel advies. Handelen brengt een hoog risico op verlies met zich mee.'
            : 'This guide is for educational purposes only and is not financial advice. Trading carries a high risk of loss.'}
        </p>
      </article>
      <aside className="mt-12 rounded-2xl border border-[var(--wc-red)]/50 bg-gradient-to-b from-[var(--wc-red)]/15 to-white/[0.02] p-6 sm:p-8">
        <h2 className="text-xl font-bold">{L ? 'Leer het in de praktijk' : 'Learn it in practice'}</h2>
        <p className="mt-2 text-white/70">
          {L
            ? 'In de gratis Winvest Capital Discord bespreken we dagelijks setups op aandelen, crypto en FX.'
            : 'In the free Winvest Capital Discord we discuss setups on stocks, crypto and FX every day.'}
        </p>
        <a href={DISCORD_URL} className="mt-5 inline-block rounded-full bg-[var(--wc-red)] px-6 py-3 font-semibold transition hover:brightness-110">
          {L ? 'Gratis lid worden' : 'Join free'}
        </a>
      </aside>
      <section className="mt-12">
        <h2 className="text-xl font-bold">{L ? 'Volgende' : 'Next'}: <a href={next.path} className="text-[var(--wc-red-soft)] hover:underline">{next.title}</a></h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {related.map((r) => (
            <li key={r.id}>
              <a href={r[lang].path} className="block h-full rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold transition hover:border-[var(--wc-red)]/60">
                {r[lang].title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
