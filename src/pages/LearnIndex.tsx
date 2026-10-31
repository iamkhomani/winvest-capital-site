import { articles } from '../content/articles'
import type { Lang } from '../i18n'

export const learnCopy = {
  en: {
    title: 'Learn Smart Money Concepts (SMC): free trading guides',
    metaTitle: 'Learn Smart Money Concepts (SMC): Free Trading Guides | Winvest Capital',
    description: 'Free guides to Smart Money Concepts: market structure, BOS and CHoCH, liquidity, order blocks, fair value gaps, premium and discount, and risk management.',
    intro: 'Clear, practical guides to the concepts we use in the Winvest Capital community. Start at the top and work your way down: each guide builds on the previous one.',
  },
  nl: {
    title: 'Leer Smart Money Concepts (SMC): gratis tradinguitleg',
    metaTitle: 'Smart Money Concepts (SMC) leren: gratis uitleg | Winvest Capital',
    description: 'Gratis uitleg over Smart Money Concepts: marktstructuur, BOS en CHoCH, liquiditeit, order blocks, fair value gaps, premium en discount en risicobeheer.',
    intro: 'Heldere, praktische uitleg over de concepten die we in de Winvest Capital community gebruiken. Begin bovenaan en werk naar beneden: elke uitleg bouwt voort op de vorige.',
  },
}

export default function LearnIndex({ lang }: { lang: Lang }) {
  const c = learnCopy[lang]
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">{c.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-white/70">{c.intro}</p>
      <ol className="mt-10 space-y-4">
        {articles.map((a, i) => (
          <li key={a.id}>
            <a href={a[lang].path} className="group flex gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[var(--wc-red)]/60">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--wc-red)]/15 font-bold text-[var(--wc-red-soft)]">{i + 1}</span>
              <span>
                <span className="block text-lg font-semibold group-hover:text-[var(--wc-red-soft)]">{a[lang].title}</span>
                <span className="mt-1 block text-white/60">{a[lang].description}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </main>
  )
}
