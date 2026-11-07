import { Check } from '../components/ui'
import { DISCORD_URL, PRICE, TERMINAL_CHECKOUT_URL, TERMINAL_PRICE } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'

export const productsCopy = {
  en: {
    metaTitle: 'Products: One Percent Club, Market Whisper AI and Winvest Terminal | Winvest Capital',
    description: 'Everything Winvest Capital offers in one place: the One Percent Club with Market Whisper AI, and Winvest Terminal charts.',
    h1: 'Our products',
    intro: 'Tools and guidance for learning Smart Money Concepts. Compare what each one does and pick what fits you.',
    more: 'View details',
    perMonth: 'per month',
    soon: 'Coming soon',
    oneTime: 'one-time payment',
    club: {
      tag: 'Membership',
      text: 'Guidance and research, on top of the free community.',
      items: ['Everything in the free community', 'Projects I am looking at, released regularly', 'My research and analysis of assets and FX charts'],
    },
    whisper: {
      tag: 'Included',
      text: 'Your AI market assistant in the Discord. As a member you can chat with it and get market and fundamental analysis.',
      free: 'News, FX calendar events and the lot size calculator are free for everyone in the Discord.',
      link: 'Discover Market Whisper AI',
    },
    terminal: {
      tag: 'Charts',
      text: 'Smart Money Concepts mapped on the chart, in your browser.',
      items: ['Market structure, BOS and CHOCH', 'Inducement and liquidity sweeps', 'Support and Resistance from confirmed swings', 'SCOB rectangles, inside bars and optional EMAs', '51 markets, nothing to install'],
    },
    separate: 'Winvest Terminal and the One Percent Club are separate products, so joining one does not include the other.',
    startH: 'Not sure yet?',
    startP: 'Start with the free Discord community and see how we work.',
    start: 'Join the Discord, free',
    noticeH: 'Educational only',
    notice: 'All products are for educational purposes only and are not financial advice. Trading carries a high risk of loss.',
  },
  nl: {
    metaTitle: 'Producten: One Percent Club, Market Whisper AI en Winvest Terminal | Winvest Capital',
    description: 'Alles van Winvest Capital op één plek: de One Percent Club met Market Whisper AI, en Winvest Terminal charts.',
    h1: 'Onze producten',
    intro: 'Tools en begeleiding om Smart Money Concepts te leren. Vergelijk wat elk product doet en kies wat bij je past.',
    more: 'Bekijk details',
    perMonth: 'per maand',
    soon: 'Binnenkort',
    oneTime: 'eenmalige betaling',
    club: {
      tag: 'Lidmaatschap',
      text: 'Begeleiding en research, bovenop de gratis community.',
      items: ['Alles uit de gratis community', 'Projecten waar ik naar kijk, regelmatig gedeeld', 'Mijn research en analyse van assets en FX-charts'],
    },
    whisper: {
      tag: 'Inbegrepen',
      text: 'Je AI-marktassistent in de Discord. Als lid kun je ermee chatten en krijg je markt- en fundamentele analyses.',
      free: 'Nieuws, FX-kalenderevents en de lotgrootte-calculator zijn gratis voor iedereen in de Discord.',
      link: 'Ontdek Market Whisper AI',
    },
    terminal: {
      tag: 'Charts',
      text: 'Smart Money Concepts op de chart, in je browser.',
      items: ['Marktstructuur, BOS en CHOCH', 'Inducement en liquidity sweeps', 'Support en Resistance vanaf bevestigde swings', 'SCOB-rechthoeken, inside bars en optionele EMA’s', '51 markten, niets te installeren'],
    },
    separate: 'Winvest Terminal en de One Percent Club zijn losse producten: het een zit niet bij het ander inbegrepen.',
    startH: 'Twijfel je nog?',
    startP: 'Begin met de gratis Discord-community en kijk hoe wij werken.',
    start: 'Word gratis lid van de Discord',
    noticeH: 'Alleen educatief',
    notice: 'Alle producten zijn uitsluitend educatief en geen financieel advies. Handelen brengt een hoog risico op verlies met zich mee.',
  },
}

const cardClass = 'flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6'
const tagClass = 'rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70'
const buttonClass = 'mt-7 rounded-full bg-[var(--wc-red)] px-6 py-3 text-center font-semibold text-white transition hover:brightness-110'

function Items({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3 text-white/80">
      {items.map((item) => (
        <li key={item} className="flex gap-3"><Check /><span>{item}</span></li>
      ))}
    </ul>
  )
}

export default function Products({ lang }: { lang: Lang }) {
  const c = productsCopy[lang]
  const p = paths[lang]
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/15 blur-[120px]" />
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-white/45">
          <a href={p.home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span> {c.h1}
        </nav>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/70">{c.intro}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className={cardClass}>
            <div className="flex items-center justify-between gap-3">
              <img src="/logo.jpeg" alt="" width={48} height={48} className="size-12 rounded-full object-cover" />
              <span className={tagClass}>{c.club.tag}</span>
            </div>
            <h2 className="mt-5 text-xl font-semibold">One Percent Club</h2>
            <p className="mt-1 text-white/60">{c.club.text}</p>
            <p className="mt-5 text-3xl font-bold">
              {PRICE} <span className="text-sm font-medium text-white/50">{c.oneTime}</span>
            </p>
            <Items items={c.club.items} />

            <div className="mt-6 flex-1 rounded-xl border border-[var(--wc-red)]/50 bg-[var(--wc-red)]/[0.07] p-4">
              <div className="flex items-center gap-3">
                <img src="/brand/market-whisper-symbol-dark.svg" alt="" width={44} height={44} className="size-11 shrink-0" />
                <h3 className="flex-1 font-semibold">Market Whisper AI</h3>
                <span className="rounded-full bg-[var(--wc-red)] px-3 py-1 text-xs font-semibold text-white">{c.whisper.tag}</span>
              </div>
              <p className="mt-3 text-sm text-white/75">{c.whisper.text}</p>
              <p className="mt-2 text-sm text-white/50">{c.whisper.free}</p>
              <a href={p.whisper} className="mt-3 inline-block text-sm font-semibold text-white underline underline-offset-4 hover:text-[var(--wc-red-soft)]">{c.whisper.link} →</a>
            </div>

            <a href={p.home + '#membership'} className={buttonClass}>
              {c.more}<span className="sr-only">: One Percent Club</span>
            </a>
          </section>

          <section className={cardClass}>
            <div className="flex items-center justify-between gap-3">
              <img src="/brand/winvest-terminal-icon.svg" alt="" width={48} height={48} className="size-12 object-contain" />
              <span className={tagClass}>{c.terminal.tag}</span>
            </div>
            <h2 className="mt-5 text-xl font-semibold">Winvest Terminal</h2>
            <p className="mt-1 text-white/60">{c.terminal.text}</p>
            {TERMINAL_CHECKOUT_URL ? (
              <p className="mt-5 text-3xl font-bold">
                {TERMINAL_PRICE} <span className="text-sm font-medium text-white/50">{c.perMonth}</span>
              </p>
            ) : (
              <p className="mt-5 text-3xl font-bold">{c.soon}</p>
            )}
            <div className="flex-1"><Items items={c.terminal.items} /></div>
            <a href={p.terminal} className={buttonClass}>
              {c.more}<span className="sr-only">: Winvest Terminal</span>
            </a>
          </section>
        </div>
        <p className="mt-5 max-w-3xl text-sm text-white/50">{c.separate}</p>

        <section className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold">{c.startH}</h2>
            <p className="mt-1 text-white/60">{c.startP}</p>
          </div>
          <a href={DISCORD_URL} className="shrink-0 rounded-full border border-white/20 px-6 py-3 text-center font-semibold transition hover:border-white/50">{c.start}</a>
        </section>

        <div className="mt-8 max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/60">
          <p className="font-semibold text-white/80">{c.noticeH}</p>
          <p className="mt-1">{c.notice}</p>
        </div>
      </div>
    </main>
  )
}
