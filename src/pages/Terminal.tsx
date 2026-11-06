import { Candles, Check } from '../components/ui'
import { DISCORD_URL, TERMINAL_CHECKOUT_URL, TERMINAL_LOGIN_URL, TERMINAL_PORTAL_URL, TERMINAL_PRICE } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'

export const terminalCopy = {
  en: {
    metaTitle: 'Winvest Terminal: Smart Money Concepts charts | Winvest Capital',
    description: 'Winvest Terminal is the charting website from Winvest Capital. Market structure, BOS, CHOCH, inducement and liquidity sweeps mapped on the chart in your browser.',
    h1: 'Winvest Terminal',
    intro: 'Smart Money Concepts on the chart, in your browser. Winvest Terminal maps market structure for you, so you can study it without drawing it by hand.',
    soon: 'Coming soon',
    soonNote: 'Subscriptions are not open yet. Join the free Discord to hear when they are.',
    discord: 'Join the free Discord',
    subscribe: 'Subscribe',
    perMonth: 'per month',
    cancelNote: 'Monthly subscription. Cancel any time; access runs until the end of your paid period.',
    login: 'Member login',
    manage: 'Manage subscription',
    featuresH: 'What it shows',
    features: [
      'Swing labels: HH, HL, LH and LL',
      'Break of structure (BOS) and change of character (CHOCH)',
      'Inducement (IDM) and liquidity sweeps',
      'Support and Resistance from the latest confirmed swing high and low',
      'SCOB rectangles and inside bars',
      'Optional 50 and 200 EMAs',
    ],
    accessH: 'How it works',
    access: [
      ['Crypto, forex, gold, silver and stocks', '51 markets on timeframes from 5 minutes to 1 month.'],
      ['Nothing to install', 'It runs in your browser on desktop and phone.'],
      ['Log in with your email', 'No password. You get a one-time code by email.'],
    ],
    noticeH: 'Educational only',
    notice: 'Winvest Terminal is an educational tool. It shows market structure based on past price data. It does not tell you what to buy or sell, it is not financial advice, and past price behaviour says nothing about future results. Trading carries a high risk of loss.',
  },
  nl: {
    metaTitle: 'Winvest Terminal: Smart Money Concepts charts | Winvest Capital',
    description: 'Winvest Terminal is de chartwebsite van Winvest Capital. Marktstructuur, BOS, CHOCH, inducement en liquidity sweeps op de chart in je browser.',
    h1: 'Winvest Terminal',
    intro: 'Smart Money Concepts op de chart, in je browser. Winvest Terminal brengt de marktstructuur voor je in kaart, zodat je die kunt bestuderen zonder alles zelf te tekenen.',
    soon: 'Binnenkort',
    soonNote: 'Abonnementen zijn nog niet geopend. Word lid van de gratis Discord om te horen wanneer het zover is.',
    discord: 'Word gratis lid van de Discord',
    subscribe: 'Abonneren',
    perMonth: 'per maand',
    cancelNote: 'Maandabonnement. Altijd opzegbaar; je toegang loopt door tot het einde van je betaalde periode.',
    login: 'Inloggen voor leden',
    manage: 'Abonnement beheren',
    featuresH: 'Wat je ziet',
    features: [
      'Swing labels: HH, HL, LH en LL',
      'Break of structure (BOS) en change of character (CHOCH)',
      'Inducement (IDM) en liquidity sweeps',
      'Support en Resistance vanaf de laatst bevestigde swing high en low',
      'SCOB-rechthoeken en inside bars',
      'Optionele 50 en 200 EMA',
    ],
    accessH: 'Hoe het werkt',
    access: [
      ['Crypto, forex, goud, zilver en aandelen', '51 markten op timeframes van 5 minuten tot 1 maand.'],
      ['Niets te installeren', 'Het werkt in je browser, op desktop en telefoon.'],
      ['Inloggen met je e-mail', 'Geen wachtwoord. Je krijgt een eenmalige code per e-mail.'],
    ],
    noticeH: 'Alleen educatief',
    notice: 'Winvest Terminal is een educatieve tool. Het toont marktstructuur op basis van prijsdata uit het verleden. Het vertelt je niet wat je moet kopen of verkopen, het is geen financieel advies en eerdere koersbewegingen zeggen niets over toekomstige resultaten. Handelen brengt een hoog risico op verlies met zich mee.',
  },
}

const secondary = 'rounded-full border border-white/15 px-6 py-3 text-center font-semibold text-white/90 transition hover:border-white/40'
const primary = 'rounded-full bg-[var(--wc-red)] px-6 py-3 text-center font-semibold text-white transition hover:brightness-110'

export default function Terminal({ lang }: { lang: Lang }) {
  const c = terminalCopy[lang]
  const open = Boolean(TERMINAL_CHECKOUT_URL)
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/15 blur-[120px]" />
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-white/45">
          <a href={paths[lang].home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span> {c.h1}
        </nav>

        <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <img src="/brand/winvest-terminal-icon.svg" alt="" width={72} height={72} className="size-[72px]" />
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Winvest <span className="text-[var(--wc-red)]">Terminal</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/70">{c.intro}</p>

            {open ? (
              <>
                {TERMINAL_PRICE && (
                  <p className="mt-6 text-2xl font-bold">
                    {TERMINAL_PRICE} <span className="text-base font-normal text-white/55">{c.perMonth}</span>
                  </p>
                )}
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a href={TERMINAL_CHECKOUT_URL} className={primary}>{c.subscribe}</a>
                  <a href={TERMINAL_LOGIN_URL} className={secondary}>{c.login}</a>
                </div>
                <p className="mt-3 text-sm text-white/50">{c.cancelNote}</p>
                {TERMINAL_PORTAL_URL && (
                  <p className="mt-2 text-sm">
                    <a href={TERMINAL_PORTAL_URL} className="text-white/60 underline hover:text-white">{c.manage}</a>
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="mt-6 inline-block rounded-full border border-[var(--wc-red)]/60 px-4 py-1.5 text-sm font-semibold text-[var(--wc-red-soft)]">{c.soon}</p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a href={DISCORD_URL} className={primary}>{c.discord}</a>
                  <a href={TERMINAL_LOGIN_URL} className={secondary}>{c.login}</a>
                </div>
                <p className="mt-3 max-w-md text-sm text-white/50">{c.soonNote}</p>
              </>
            )}
          </div>
          <div className="aspect-[2/1] rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Candles />
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{c.featuresH}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {c.features.map((f) => (
              <li key={f} className="flex gap-3 text-white/75">
                <Check />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{c.accessH}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {c.access.map(([title, text]) => (
              <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <span className="block font-semibold">{title}</span>
                <span className="mt-1 block text-sm text-white/60">{text}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/60">
          <p className="font-semibold text-white/80">{c.noticeH}</p>
          <p className="mt-1">{c.notice}</p>
        </div>
      </div>
    </main>
  )
}
