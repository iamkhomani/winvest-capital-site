import { DISCORD_URL } from '../config'
import { articles, MODULES } from '../content/articles'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import Prose from './Prose'

export default function Article({ id, lang }: { id: string; lang: Lang }) {
  const idx = articles.findIndex((a) => a.id === id)
  const a = articles[idx][lang]
  const prev = idx > 0 ? articles[idx - 1][lang] : null
  const next = idx < articles.length - 1 ? articles[idx + 1][lang] : null
  const mod = MODULES[articles[idx].module]
  const L = lang === 'nl'
  const pct = Math.round(((idx + 1) / articles.length) * 100)
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-white/45">
        <a href={paths[lang].home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span>{' '}
        <a href={paths[lang].learn} className="hover:text-white">{L ? 'Leren' : 'Learn'}</a>
      </nav>
      <article>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-semibold text-[var(--wc-red-soft)]">{L ? 'Les' : 'Lesson'} {idx + 1} {L ? 'van' : 'of'} {articles.length}</span>
          <span className="text-white/45">{mod.title[lang]}</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div className="h-full rounded-full bg-[var(--wc-red)]" style={{ width: `${pct}%` }} />
        </div>
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
      <nav aria-label={L ? 'Lessen' : 'Lessons'} className="mt-12 grid gap-4 sm:grid-cols-2">
        {prev ? (
          <a href={prev.path} className="block rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[var(--wc-red)]/60">
            <span className="block text-xs text-white/45">← {L ? 'Vorige les' : 'Previous lesson'}</span>
            <span className="mt-1 block font-semibold">{prev.title}</span>
          </a>
        ) : <span className="hidden sm:block" />}
        {next ? (
          <a href={next.path} className="block rounded-xl border border-[var(--wc-red)]/50 bg-[var(--wc-red)]/10 p-4 text-right transition hover:border-[var(--wc-red)]">
            <span className="block text-xs text-white/55">{L ? 'Volgende les' : 'Next lesson'} →</span>
            <span className="mt-1 block font-semibold">{next.title}</span>
          </a>
        ) : (
          <a href={paths[lang].learn} className="block rounded-xl border border-[var(--wc-red)]/50 bg-[var(--wc-red)]/10 p-4 text-right transition hover:border-[var(--wc-red)]">
            <span className="block text-xs text-white/55">{L ? 'Je hebt alle lessen afgerond' : 'You have completed all lessons'}</span>
            <span className="mt-1 block font-semibold">{L ? 'Terug naar het overzicht' : 'Back to the overview'} →</span>
          </a>
        )}
      </nav>
      <p className="mt-4 text-center text-sm"><a href={paths[lang].learn} className="text-white/55 hover:text-white">{L ? 'Alle lessen' : 'All lessons'}</a></p>
    </main>
  )
}
