import { Candles, Check } from '../components/ui'
import { DISCORD_URL, TERMINAL_CHECKOUT_URL, TERMINAL_LOGIN_URL, TERMINAL_PORTAL_URL, TERMINAL_PRICE } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'

export const terminalCopy = {
  en: {
    metaTitle: 'Winvest Terminal: Smart Money Concepts charts | Winvest Capital',
    description: 'Winvest Terminal is the charting website from Winvest Capital. Market structure, BOS, CHOCH and inducement on the chart, plus the Winvest trade playbook with a setup grade for 51 markets.',
    h1: 'Winvest Terminal',
    intro: 'Smart Money Concepts on the chart, in your browser. Winvest Terminal maps market structure for you and shows where each market stands in the Winvest trade playbook, so you can study setups without drawing them by hand.',
    soon: 'Coming soon',
    soonNote: 'Subscriptions are not open yet. Join the free Discord to hear when they are.',
    discord: 'Join the free Discord',
    subscribe: 'Subscribe',
    perMonth: 'per month',
    cancelNote: 'Monthly subscription. Cancel any time; access runs until the end of your paid period.',
    login: 'Member login',
    manage: 'Manage subscription',
    shotsH: 'How it looks',
    shotsP: 'Real screenshots from Winvest Terminal, in the dark and the light theme.',
    shotDark: 'Winvest Terminal in the dark theme: ETH / USDT on the daily chart, with the Markets panel sorted by grade, the playbook panel at step A1 · 03 with a grade of 85, and the extreme POI marked on the chart',
    shotLight: 'Winvest Terminal in the light theme: USD / JPY on the 4 hour chart, with the Markets panel, the playbook panel at step A1 · 01 with a grade of 85, Support and the decisional POI',
    featuresH: 'What it shows',
    features: [
      'Swing labels: HH, HL, LH and LL',
      'Break of structure (BOS) and change of character (CHOCH)',
      'Inducement (IDM), live IDM and liquidity sweeps',
      'Support and Resistance that move with the new leg after a BOS or CHOCH',
      'SCOB rectangles and inside bars',
      'Optional 50 and 200 EMAs',
    ],
    playbookH: 'The Winvest trade playbook, on every chart',
    playbookP: 'Winvest Terminal follows the same playbook we teach in the community, with the inducement at its centre.',
    playbook: [
      ['Playbook panel', 'Shows which scenario, path and step of the playbook the chart is in, and what that step looks for. Until the inducement is taken out, it tells you to wait and shows the IDM level.'],
      ['Setup grade', 'A score out of 100 with the checklist behind it: trend, higher timeframe, BOS with candle closure, IDM taken out, SCOB confirmation and the 0.764 entry level.'],
      ['Decisional and extreme POI', 'The unmitigated order blocks in the range that the playbook works with, marked on the chart.'],
      ['Markets panel', 'All 51 markets sorted by grade on the timeframe you have open. One click opens the chart.'],
    ],
    accessH: 'How it works',
    access: [
      ['Crypto, forex, gold, silver and stocks', '51 markets on timeframes from 5 minutes to 1 month. The chart refreshes every minute.'],
      ['Nothing to install', 'It runs in your browser on desktop and phone.'],
      ['Log in with your email', 'No password. You get a one-time code by email.'],
    ],
    noticeH: 'Educational only',
    notice: 'Winvest Terminal is an educational tool. It shows market structure and how a chart lines up with the Winvest trade playbook, based on past price data. Playbook steps and grades are generated automatically as examples of the strategy, not personal recommendations to buy or sell. Nothing in Winvest Terminal is financial advice, and past price behaviour says nothing about future results. Trading carries a high risk of loss.',
  },
  nl: {
    metaTitle: 'Winvest Terminal: Smart Money Concepts charts | Winvest Capital',
    description: 'Winvest Terminal is de chartwebsite van Winvest Capital. Marktstructuur, BOS, CHOCH en inducement op de chart, plus het Winvest trade playbook met een setup-score voor 51 markten.',
    h1: 'Winvest Terminal',
    intro: 'Smart Money Concepts op de chart, in je browser. Winvest Terminal brengt de marktstructuur voor je in kaart en laat zien waar elke markt staat in het Winvest trade playbook, zodat je setups kunt bestuderen zonder alles zelf te tekenen.',
    soon: 'Binnenkort',
    soonNote: 'Abonnementen zijn nog niet geopend. Word lid van de gratis Discord om te horen wanneer het zover is.',
    discord: 'Word gratis lid van de Discord',
    subscribe: 'Abonneren',
    perMonth: 'per maand',
    cancelNote: 'Maandabonnement. Altijd opzegbaar; je toegang loopt door tot het einde van je betaalde periode.',
    login: 'Inloggen voor leden',
    manage: 'Abonnement beheren',
    shotsH: 'Zo ziet het eruit',
    shotsP: 'Echte screenshots van Winvest Terminal, in het donkere en het lichte thema.',
    shotDark: 'Winvest Terminal in het donkere thema: ETH / USDT op de dagchart, met het Markets-paneel gesorteerd op score, het playbook-paneel op stap A1 · 03 met een score van 85, en de extreme POI op de chart',
    shotLight: 'Winvest Terminal in het lichte thema: USD / JPY op de 4-uurschart, met het Markets-paneel, het playbook-paneel op stap A1 · 01 met een score van 85, Support en de decisional POI',
    featuresH: 'Wat je ziet',
    features: [
      'Swing labels: HH, HL, LH en LL',
      'Break of structure (BOS) en change of character (CHOCH)',
      'Inducement (IDM), live IDM en liquidity sweeps',
      'Support en Resistance die na een BOS of CHOCH meebewegen met de nieuwe leg',
      'SCOB-rechthoeken en inside bars',
      'Optionele 50 en 200 EMA',
    ],
    playbookH: 'Het Winvest trade playbook, op elke chart',
    playbookP: 'Winvest Terminal volgt hetzelfde playbook dat we in de community leren, met de inducement als middelpunt.',
    playbook: [
      ['Playbook-paneel', 'Laat zien in welk scenario, pad en welke stap van het playbook de chart staat, en waar die stap op let. Zolang de inducement niet is genomen, zegt het paneel dat je moet wachten en toont het de IDM.'],
      ['Setup-score', 'Een score van 0 tot 100 met de checklist erachter: trend, hogere timeframe, BOS met candle closure, IDM genomen, SCOB-bevestiging en het 0.764-entryniveau.'],
      ['Decisional en extreme POI', 'De onaangetaste orderblocks in de range waar het playbook mee werkt, gemarkeerd op de chart.'],
      ['Markets-paneel', 'Alle 51 markten gesorteerd op score voor de timeframe die je open hebt. Met één klik open je de chart.'],
    ],
    accessH: 'Hoe het werkt',
    access: [
      ['Crypto, forex, goud, zilver en aandelen', '51 markten op timeframes van 5 minuten tot 1 maand. De chart ververst elke minuut.'],
      ['Niets te installeren', 'Het werkt in je browser, op desktop en telefoon.'],
      ['Inloggen met je e-mail', 'Geen wachtwoord. Je krijgt een eenmalige code per e-mail.'],
    ],
    noticeH: 'Alleen educatief',
    notice: 'Winvest Terminal is een educatieve tool. Het toont marktstructuur en hoe een chart past in het Winvest trade playbook, op basis van prijsdata uit het verleden. Playbook-stappen en scores worden automatisch gemaakt als voorbeelden van de strategie, niet als persoonlijke aanbevelingen om te kopen of te verkopen. Niets in Winvest Terminal is financieel advies, en eerdere koersbewegingen zeggen niets over toekomstige resultaten. Handelen brengt een hoog risico op verlies met zich mee.',
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
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{c.shotsH}</h2>
          <p className="mt-2 text-white/60">{c.shotsP}</p>
          <div className="mt-5 grid gap-5">
            <img src="/terminal/terminal-dark.png" alt={c.shotDark} width={1907} height={914} loading="lazy" className="h-auto w-full rounded-2xl border border-white/10" />
            <img src="/terminal/terminal-light.png" alt={c.shotLight} width={1912} height={914} loading="lazy" className="h-auto w-full rounded-2xl border border-white/10" />
          </div>
        </section>

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
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{c.playbookH}</h2>
          <p className="mt-2 text-white/60">{c.playbookP}</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {c.playbook.map(([title, text]) => (
              <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <span className="block font-semibold">{title}</span>
                <span className="mt-1 block text-sm text-white/60">{text}</span>
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
