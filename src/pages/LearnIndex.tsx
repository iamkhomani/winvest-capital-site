import { articles, MODULES } from '../content/articles'
import type { Lang } from '../i18n'

export const learnCopy = {
  en: {
    title: 'Learn to trade: free lessons from the basics to Smart Money Concepts',
    metaTitle: 'Learn to Trade: Free Lessons, Basics to SMC | Winvest Capital',
    description: 'Free trading course in 12 lessons: candlesticks, order types, lots and pips, leverage, margin and risk management, then Smart Money Concepts: market structure, liquidity, fair value gaps, order blocks and premium and discount.',
    intro: 'A free course in twelve short lessons. Each lesson builds on the previous one, so start at lesson 1 and work your way down. Module 1 covers the foundations every trader needs; module 2 teaches the Smart Money Concepts we use in the Winvest Capital community.',
    lesson: 'Lesson',
  },
  nl: {
    title: 'Leer traden: gratis lessen van de basis tot Smart Money Concepts',
    metaTitle: 'Leer traden: gratis lessen, van basis tot SMC | Winvest Capital',
    description: 'Gratis tradingcursus in 12 lessen: candlesticks, ordertypes, lots en pips, leverage, margin en risicobeheer, daarna Smart Money Concepts: marktstructuur, liquiditeit, fair value gaps, order blocks en premium en discount.',
    intro: 'Een gratis cursus in twaalf korte lessen. Elke les bouwt voort op de vorige, dus begin bij les 1 en werk naar beneden. Module 1 behandelt de basis die elke trader nodig heeft; module 2 leert je de Smart Money Concepts die we in de Winvest Capital community gebruiken.',
    lesson: 'Les',
  },
}

export default function LearnIndex({ lang }: { lang: Lang }) {
  const c = learnCopy[lang]
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">{c.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-white/70">{c.intro}</p>
      {MODULES.map((m, mi) => (
        <section key={m.id} className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">{m.title[lang]}</h2>
          <p className="mt-2 text-white/60">{m.text[lang]}</p>
          <ol className="mt-6 space-y-4">
            {articles.map((a, i) => (a.module !== mi ? null : (
              <li key={a.id}>
                <a href={a[lang].path} className="group flex gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[var(--wc-red)]/60">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--wc-red)]/15 font-bold text-[var(--wc-red-soft)]" aria-label={`${c.lesson} ${i + 1}`}>{i + 1}</span>
                  <span>
                    <span className="block text-lg font-semibold group-hover:text-[var(--wc-red-soft)]">{a[lang].title}</span>
                    <span className="mt-1 block text-white/60">{a[lang].description}</span>
                  </span>
                </a>
              </li>
            )))}
          </ol>
        </section>
      ))}
    </main>
  )
}
