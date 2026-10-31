import { DISCORD_URL, NEWSLETTER_EMAIL_FIELD, NEWSLETTER_FORM_ACTION, PRICE, STRIPE_PAYMENT_LINK, WHOP_REVIEWS_URL } from '../config'
import { reviews } from '../content/reviews'
import { articles } from '../content/articles'
import TradingViewWidget from '../components/TradingViewWidget'
import { Candles, Check, Stars } from '../components/ui'
import type { Lang } from '../i18n'
import { paths } from '../paths'

const FREE_URL = DISCORD_URL
const PAID_URL = STRIPE_PAYMENT_LINK

export const homeCopy = {
  en: {
    title: 'Winvest Capital | Free SMC Trading Community & Market Whisper AI',
    description:
      'Join Winvest Capital: a free community of traders learning Smart Money Concepts (SMC) for stocks, crypto and FX. Includes Market Whisper AI. Upgrade to the One Percent Club for €150 one-time.',
    badge: 'Advanced SMC Trading',
    h1a: 'Trade smarter,',
    h1b: 'together.',
    intro: 'Winvest Capital is a free community of likeminded traders learning Smart Money Concepts across stocks, crypto and FX. Includes access to',
    introBot: 'our analysis bot.',
    ctaFree: 'Join the Discord, free',
    ctaSee: 'See the One Percent Club',
    note: 'Educational only. Not financial advice.',
    chartTag: 'Market structure',
    memH2: 'Free to join. One upgrade if you want more.',
    memP: 'The community is free for everyone. The One Percent Club adds my personal research, analysis and projects.',
    freeName: 'Community',
    freeSub: 'For every likeminded trader',
    free: 'Free',
    joinFree: 'Join free',
    paidName: 'One Percent Club',
    paidSub: 'Guidance and research from me',
    oneTime: 'One-time',
    oneTimePayment: 'one-time payment',
    joinPaid: 'Join the One Percent Club',
    freeItems: [
      'Access to the Winvest Capital community of likeminded traders',
      'Official Winvest Capital member card with your trading stats and trading style',
      'Frequent news updates on crypto, stocks and FX',
      'FX calendar events for FX trading',
    ],
    paidItems: [
      'Everything in the free community',
      'Projects I am looking at, released regularly',
      'My time: research and analysis of assets and FX charts to help guide you',
      'Market Whisper AI: lot size calculator',
      'Market Whisper AI: market analysis on crypto and stocks',
      'Market Whisper AI: fundamental analysis on crypto projects and assets',
    ],
    revH2: 'What members say',
    revP: 'Real reviews from members, originally posted on Whop.',
    revLink: 'View the reviews on Whop',
    wBadge: 'Built by Winvest Capital',
    wP: 'The AI bot I built for members. It helps you analyse stocks and crypto so you can make more calculated investment decisions. Every member gets the free tools; the One Percent Club unlocks the full toolkit.',
    wFree: 'Free for every member',
    wPaid: 'Unlocked with the One Percent Club',
    wUnlock: 'Unlock with the One Percent Club',
    whisperFree: [
      ['Member card', 'Create your official Winvest Capital member card with your trading stats and trading style.'],
      ['News updates', 'Frequent news on crypto, stocks and FX.'],
      ['FX calendar events', 'Stay on top of the events that move FX pairs.'],
    ],
    whisperPaid: [
      ['Lot size calculator', 'Size positions to your risk before you enter.'],
      ['Market analysis', 'Analysis on crypto and stocks.'],
      ['Fundamental analysis', 'Fundamentals on crypto projects and assets.'],
    ],
    calH2: 'Economic calendar',
    calP: 'The high and medium impact events of the week. Interest rate decisions, inflation and jobs data can move FX, stocks and crypto sharply, so check the calendar before you trade.',
    learnH2: 'Learn Smart Money Concepts',
    learnP: 'Free guides on the core ideas we use in the community.',
    learnAll: 'All guides',
    newsH2: 'Get the weekly market recap',
    newsP: 'Key levels, upcoming events and new guides in your inbox. No spam, unsubscribe anytime.',
    newsPlaceholder: 'Your email address',
    newsBtn: 'Subscribe',
    newsSoon: 'Coming soon',
    newsSoonP: 'The newsletter launches soon. Join the free Discord in the meantime.',
    faqH2: 'Questions',
    faqs: [
      ['Is the community really free?', 'Yes. Joining the Winvest Capital community costs nothing. The One Percent Club is an optional one-time upgrade.'],
      ['What is the difference with the One Percent Club?', 'One Percent Club members get the projects I am watching, my time to research and analyse assets or FX charts with them, and the full Market Whisper AI toolkit. It is a one-time payment, no subscription.'],
      ['What is Market Whisper AI?', 'An AI bot I built that helps members analyse stocks and crypto. Every member can create a member card and get news and FX calendar events. One Percent Club members also unlock the lot size calculator, market analysis and fundamental analysis.'],
      ['Is this financial advice?', 'No. Everything shared in Winvest Capital, including Market Whisper AI output, is for educational purposes only. Always do your own research.'],
      ['How do I join?', 'The free community is on Discord: click a Join free button. For the One Percent Club, pay securely through Stripe and your One Percent Club role is added to your Discord account automatically.'],
    ],
    endH2: 'Join Winvest Capital today',
    endP: 'Free community access, Market Whisper AI included.',
  },
  nl: {
    title: 'Winvest Capital | Gratis SMC Trading Community & Market Whisper AI',
    description:
      'Word lid van Winvest Capital: een gratis community van traders die Smart Money Concepts (SMC) leren voor aandelen, crypto en FX. Inclusief Market Whisper AI. Upgrade naar de One Percent Club voor €150 eenmalig.',
    badge: 'Advanced SMC Trading',
    h1a: 'Slimmer traden,',
    h1b: 'samen.',
    intro: 'Winvest Capital is een gratis community van gelijkgestemde traders die Smart Money Concepts leren voor aandelen, crypto en FX. Inclusief toegang tot',
    introBot: 'onze analysebot.',
    ctaFree: 'Gratis lid worden op Discord',
    ctaSee: 'Bekijk de One Percent Club',
    note: 'Uitsluitend educatief. Geen financieel advies.',
    chartTag: 'Marktstructuur',
    memH2: 'Gratis lid worden. Eén upgrade als je meer wilt.',
    memP: 'De community is gratis voor iedereen. De One Percent Club voegt mijn persoonlijke research, analyses en projecten toe.',
    freeName: 'Community',
    freeSub: 'Voor iedere gelijkgestemde trader',
    free: 'Gratis',
    joinFree: 'Gratis lid worden',
    paidName: 'One Percent Club',
    paidSub: 'Begeleiding en research van mij',
    oneTime: 'Eenmalig',
    oneTimePayment: 'eenmalige betaling',
    joinPaid: 'Word lid van de One Percent Club',
    freeItems: [
      'Toegang tot de Winvest Capital community van gelijkgestemde traders',
      'Officiële Winvest Capital ledenkaart met je tradingstatistieken en tradingstijl',
      'Regelmatig nieuwsupdates over crypto, aandelen en FX',
      'FX-kalenderevents voor FX-trading',
    ],
    paidItems: [
      'Alles uit de gratis community',
      'Projecten waar ik naar kijk, regelmatig gedeeld',
      'Mijn tijd: research en analyse van assets en FX-charts om je te helpen en te begeleiden',
      'Market Whisper AI: lotgrootte-calculator',
      'Market Whisper AI: marktanalyse van crypto en aandelen',
      'Market Whisper AI: fundamentele analyse van cryptoprojecten en assets',
    ],
    revH2: 'Wat leden zeggen',
    revP: 'Echte reviews van leden, oorspronkelijk geplaatst op Whop (in het Engels).',
    revLink: 'Bekijk de reviews op Whop',
    wBadge: 'Gebouwd door Winvest Capital',
    wP: 'De AI-bot die ik voor leden heb gebouwd. Hij helpt je aandelen en crypto te analyseren, zodat je beter onderbouwde beleggingsbeslissingen neemt. Ieder lid krijgt de gratis tools; de One Percent Club ontgrendelt de volledige toolkit.',
    wFree: 'Gratis voor ieder lid',
    wPaid: 'Ontgrendeld met de One Percent Club',
    wUnlock: 'Ontgrendel met de One Percent Club',
    whisperFree: [
      ['Ledenkaart', 'Maak je officiële Winvest Capital ledenkaart met je tradingstatistieken en tradingstijl.'],
      ['Nieuwsupdates', 'Regelmatig nieuws over crypto, aandelen en FX.'],
      ['FX-kalenderevents', 'Blijf op de hoogte van de events die FX-paren bewegen.'],
    ],
    whisperPaid: [
      ['Lotgrootte-calculator', 'Bepaal je positiegrootte op basis van je risico, vóór je instapt.'],
      ['Marktanalyse', 'Analyses van crypto en aandelen.'],
      ['Fundamentele analyse', 'Fundamentals van cryptoprojecten en assets.'],
    ],
    calH2: 'Economische kalender',
    calP: 'De events met hoge en gemiddelde impact van deze week. Rentebesluiten, inflatie- en banencijfers kunnen FX, aandelen en crypto flink laten bewegen, dus check de kalender voordat je tradet.',
    learnH2: 'Leer Smart Money Concepts',
    learnP: 'Gratis uitleg over de kernideeën die we in de community gebruiken.',
    learnAll: 'Alle uitleg',
    newsH2: 'Ontvang de wekelijkse marktupdate',
    newsP: 'Belangrijke levels, komende events en nieuwe uitleg in je inbox. Geen spam, altijd af te melden.',
    newsPlaceholder: 'Je e-mailadres',
    newsBtn: 'Aanmelden',
    newsSoon: 'Binnenkort',
    newsSoonP: 'De nieuwsbrief start binnenkort. Word in de tussentijd gratis lid van de Discord.',
    faqH2: 'Veelgestelde vragen',
    faqs: [
      ['Is de community echt gratis?', 'Ja. Lid worden van de Winvest Capital community kost niets. De One Percent Club is een optionele eenmalige upgrade.'],
      ['Wat is het verschil met de One Percent Club?', 'Leden van de One Percent Club krijgen de projecten waar ik naar kijk, mijn tijd om samen assets of FX-charts te onderzoeken en te analyseren, en de volledige Market Whisper AI-toolkit. Het is een eenmalige betaling, geen abonnement.'],
      ['Wat is Market Whisper AI?', 'Een AI-bot die ik heb gebouwd om leden te helpen aandelen en crypto te analyseren. Ieder lid kan een ledenkaart maken en krijgt nieuws en FX-kalenderevents. Leden van de One Percent Club ontgrendelen ook de lotgrootte-calculator, marktanalyse en fundamentele analyse.'],
      ['Is dit financieel advies?', 'Nee. Alles wat binnen Winvest Capital wordt gedeeld, inclusief de output van Market Whisper AI, is uitsluitend educatief. Doe altijd je eigen onderzoek.'],
      ['Hoe word ik lid?', 'De gratis community zit op Discord: klik op een knop "Gratis lid worden". Voor de One Percent Club betaal je veilig via Stripe en krijg je automatisch de One Percent Club-rol in Discord.'],
    ],
    endH2: 'Word vandaag lid van Winvest Capital',
    endP: 'Gratis toegang tot de community, inclusief Market Whisper AI.',
  },
}

function Newsletter({ lang }: { lang: Lang }) {
  const c = homeCopy[lang]
  const live = NEWSLETTER_FORM_ACTION !== ''
  return (
    <section id="newsletter" className="border-t border-white/10">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{c.newsH2}</h2>
        <p className="mt-3 text-white/60">{live ? c.newsP : c.newsSoonP}</p>
        <form action={live ? NEWSLETTER_FORM_ACTION : undefined} method="post" target="_blank" className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={live ? undefined : (e) => e.preventDefault()}>
          <label className="sr-only" htmlFor="nl-email">{c.newsPlaceholder}</label>
          <input
            id="nl-email"
            type="email"
            name={NEWSLETTER_EMAIL_FIELD}
            required
            disabled={!live}
            placeholder={c.newsPlaceholder}
            className="flex-1 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-white placeholder:text-white/40 focus:border-[var(--wc-red)] focus:outline-none disabled:opacity-50"
          />
          <button type="submit" disabled={!live} className="rounded-full bg-[var(--wc-red)] px-6 py-3 font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
            {live ? c.newsBtn : c.newsSoon}
          </button>
        </form>
      </div>
    </section>
  )
}

export default function Home({ lang }: { lang: Lang }) {
  const c = homeCopy[lang]
  const learn = articles.slice(0, 3)
  return (
    <main>
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/20 blur-[120px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--wc-red)]/40 bg-[var(--wc-red)]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[var(--wc-red-soft)] uppercase">
              <span className="size-1.5 rounded-full bg-[var(--wc-red)]" /> {c.badge}
            </span>
            <h1 className="mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl">
              {c.h1a} <span className="text-[var(--wc-red)]">{c.h1b}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-pretty text-white/65">
              {c.intro} <span className="font-semibold text-white">Market Whisper AI</span>, {c.introBot}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={FREE_URL} className="rounded-full bg-[var(--wc-red)] px-6 py-3 text-center font-semibold text-white shadow-[0_8px_30px_-8px_var(--wc-red)] transition hover:brightness-110">
                {c.ctaFree}
              </a>
              <a href="#membership" className="rounded-full border border-white/15 px-6 py-3 text-center font-semibold text-white/90 transition hover:border-white/40">
                {c.ctaSee}
              </a>
            </div>
            <p className="mt-4 text-xs text-white/40">{c.note}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between text-xs text-white/50">
              <span className="flex items-center gap-2">
                <img src="/logo.jpeg" alt="" width={20} height={20} className="size-5 rounded-full object-cover" /> Winvest Capital
              </span>
              <span className="rounded bg-[var(--wc-red)]/15 px-2 py-0.5 text-[var(--wc-red-soft)]">{c.chartTag}</span>
            </div>
            <div className="aspect-[2/1]">
              <Candles />
            </div>
          </div>
        </div>
      </section>

      <section id="membership" className="scroll-mt-24 border-t border-white/10 bg-[var(--wc-ink)]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.memH2}</h2>
          <p className="mt-3 max-w-2xl text-white/60">{c.memP}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <h3 className="text-xl font-semibold">{c.freeName}</h3>
              <p className="mt-1 text-white/55">{c.freeSub}</p>
              <p className="mt-6 text-4xl font-bold">{c.free}</p>
              <ul className="mt-6 flex-1 space-y-3 text-white/80">
                {c.freeItems.map((x) => (
                  <li key={x} className="flex gap-3"><Check muted />{x}</li>
                ))}
              </ul>
              <a href={FREE_URL} className="mt-8 rounded-full border border-white/20 px-6 py-3 text-center font-semibold transition hover:border-white/50">{c.joinFree}</a>
            </div>
            <div className="relative flex flex-col rounded-2xl border border-[var(--wc-red)]/60 bg-gradient-to-b from-[var(--wc-red)]/15 to-white/[0.02] p-7 shadow-[0_20px_60px_-30px_var(--wc-red)]">
              <span className="absolute -top-3 right-6 rounded-full bg-[var(--wc-red)] px-3 py-1 text-xs font-semibold">{c.oneTime}</span>
              <h3 className="text-xl font-semibold">{c.paidName}</h3>
              <p className="mt-1 text-white/55">{c.paidSub}</p>
              <p className="mt-6 text-4xl font-bold">
                {PRICE} <span className="text-base font-medium text-white/50">{c.oneTimePayment}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-white/85">
                {c.paidItems.map((x) => (
                  <li key={x} className="flex gap-3"><Check />{x}</li>
                ))}
              </ul>
              <a href={PAID_URL} className="mt-8 rounded-full bg-[var(--wc-red)] px-6 py-3 text-center font-semibold transition hover:brightness-110">{c.joinPaid}</a>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.revH2}</h2>
              <p className="mt-3 text-white/60">{c.revP}</p>
            </div>
            <a href={WHOP_REVIEWS_URL} className="text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">{c.revLink} →</a>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <Stars />
                <blockquote className="mt-4 flex-1 text-white/85">“{r.text}”</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-white/45"> · {r.date[lang]} · Whop</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="market-whisper" className="scroll-mt-24 border-t border-white/10 bg-[var(--wc-ink)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <span className="text-sm font-semibold tracking-wide text-[var(--wc-red-soft)] uppercase">{c.wBadge}</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Market Whisper AI</h2>
            <p className="mt-4 text-white/65">{c.wP}</p>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-semibold">{c.wFree}</h3>
              <ul className="mt-4 space-y-4">
                {c.whisperFree.map(([x, d]) => (
                  <li key={x} className="flex gap-3"><Check muted /><span><span className="font-semibold text-white">{x}</span><span className="block text-white/60">{d}</span></span></li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[var(--wc-red)]/60 bg-gradient-to-b from-[var(--wc-red)]/15 to-white/[0.02] p-6">
              <h3 className="flex items-center justify-between gap-3 font-semibold">
                {c.wPaid}
                <span className="shrink-0 rounded-full bg-[var(--wc-red)] px-2.5 py-0.5 text-xs">{PRICE} {c.oneTime.toLowerCase()}</span>
              </h3>
              <ul className="mt-4 space-y-4">
                {c.whisperPaid.map(([x, d]) => (
                  <li key={x} className="flex gap-3"><Check /><span><span className="font-semibold text-white">{x}</span><span className="block text-white/60">{d}</span></span></li>
                ))}
              </ul>
              <a href={PAID_URL} className="mt-6 block rounded-full bg-[var(--wc-red)] px-6 py-3 text-center font-semibold transition hover:brightness-110">{c.wUnlock}</a>
            </div>
          </div>
        </div>
      </section>

      <section id="calendar" className="scroll-mt-24 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.calH2}</h2>
          <p className="mt-3 max-w-2xl text-white/60">{c.calP}</p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-2">
            <TradingViewWidget
              className="h-[520px]"
              script="embed-widget-events.js"
              config={{
                colorTheme: 'dark',
                isTransparent: true,
                width: '100%',
                height: '100%',
                locale: lang === 'nl' ? 'nl_NL' : 'en',
                importanceFilter: '0,1',
                countryFilter: 'us,eu,gb,jp,ch,ca,au,nz,cn',
              }}
            />
          </div>
        </div>
      </section>

      <section id="learn" className="border-t border-white/10 bg-[var(--wc-ink)]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.learnH2}</h2>
              <p className="mt-3 text-white/60">{c.learnP}</p>
            </div>
            <a href={paths[lang].learn} className="text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">{c.learnAll} →</a>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {learn.map((a) => (
              <a key={a.id} href={a[lang].path} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[var(--wc-red)]/60">
                <h3 className="font-semibold group-hover:text-[var(--wc-red-soft)]">{a[lang].title}</h3>
                <p className="mt-2 text-sm text-white/60">{a[lang].description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.faqH2}</h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {c.faqs.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q}
                  <span className="text-[var(--wc-red)] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-white/65">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Newsletter lang={lang} />

      <section className="border-t border-white/10 bg-[var(--wc-ink)]">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <img src="/logo.jpeg" alt="" width={64} height={64} className="mx-auto size-16 rounded-full object-cover ring-2 ring-[var(--wc-red)]/50" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">{c.endH2}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/60">{c.endP}</p>
          <a href={FREE_URL} className="mt-8 inline-block rounded-full bg-[var(--wc-red)] px-8 py-3 font-semibold transition hover:brightness-110">{c.joinFree}</a>
        </div>
      </section>
    </main>
  )
}
