import { useEffect, useState, type FormEvent } from 'react'
import { DISCORD_URL, NEWSLETTER_EMAIL_FIELD, NEWSLETTER_FORM_ACTION, NEWSLETTER_LIST_UUID, PRICE, STRIPE_PAYMENT_LINK, TRUSTPILOT_URL } from '../config'
import { reviews } from '../content/reviews'
import { articles } from '../content/articles'
import TradingViewWidget from '../components/TradingViewWidget'
import { Candles, Check, Stars, ThemedImage } from '../components/ui'
import { Icon, navGroups, terminalHref } from '../components/nav'
import { PulseStrip } from '../markets/Overview'
import type { Lang } from '../i18n'
import { paths } from '../paths'

const FREE_URL = DISCORD_URL
const PAID_URL = STRIPE_PAYMENT_LINK

export const homeCopy = {
  en: {
    title: 'Winvest Capital | Free SMC Trading Community & Market Whisper AI',
    description:
      `Free trading community for Smart Money Concepts (SMC) in stocks, crypto and FX, with Market Whisper AI and free tools. One Percent Club: ${PRICE} one-time.`,
    badge: 'Advanced SMC Trading',
    h1a: 'Trade smarter,',
    h1b: 'together.',
    intro: 'Winvest Capital is a free community for traders learning to apply Smart Money Concepts to stocks, crypto and FX. Includes access to',
    introBot: 'our own analysis bot.',
    ctaFree: 'Join the Discord for free',
    ctaSee: 'See the One Percent Club',
    note: 'Educational only. Not financial advice.',
    chartTag: 'Market structure',
    memH2: 'Free to join. One upgrade if you want more.',
    memP: 'The community is free for everyone. The One Percent Club adds my personal research, analysis and projects.',
    freeName: 'Community',
    freeSub: 'For every trader',
    free: 'Free',
    joinFree: 'Join free',
    paidName: 'One Percent Club',
    paidSub: 'Personal guidance and research',
    oneTime: 'One-time',
    oneTimePayment: 'one-time payment',
    joinPaid: 'Join the One Percent Club',
    freeItems: [
      'Access to the Winvest Capital community',
      'Official Winvest Capital member card with your trading stats and style',
      'Regular news on crypto, stocks and FX',
      'Economic calendar for FX traders',
      'Market Whisper AI: lot size calculator',
    ],
    paidItems: [
      'Everything in the free community',
      'The projects I’m watching, shared regularly',
      'One-on-one time: we research and analyse assets and FX charts together',
      'Market Whisper AI: ask it anything about the markets',
      'Market Whisper AI: market analysis of crypto and stocks',
      'Market Whisper AI: fundamental analysis of crypto projects and other assets',
    ],
    revH2: 'What members say',
    revP: 'Real reviews from members of the Winvest Capital community, as posted on Trustpilot.',
    revKicker: 'Reviews',
    revVerified: 'Review on Trustpilot',
    tpTitle: 'See our reviews on Trustpilot',
    tpSub: 'Read or write a review',
    wBadge: 'Built by Winvest Capital',
    wP: 'The AI bot I built for members. It helps you analyse stocks and crypto so you can make better-informed decisions. Every member gets the free features; the One Percent Club gives you everything.',
    wFree: 'Free for every member',
    wPaid: 'Included with the One Percent Club',
    wUnlock: 'Upgrade to the One Percent Club',
    whisperFree: [
      ['Member card', 'Create your official Winvest Capital member card with your trading stats and style.'],
      ['News updates', 'Regular news on crypto, stocks and FX.'],
      ['FX calendar events', 'See in time which data and decisions move currency pairs.'],
      ['Lot size calculator', 'Size positions to your risk before you enter.'],
    ],
    whisperPaid: [
      ['Interactive conversations', 'Chat with Market Whisper AI about the markets. Ask follow-up questions and get context and insight whenever you need it.'],
      ['Market analysis', 'Analysis of crypto and stocks.'],
      ['Fundamental analysis', 'The fundamentals of crypto projects and other assets.'],
    ],
    calH2: 'Economic calendar',
    calP: 'This week’s key economic events. Rate decisions, inflation and jobs data can move FX, stocks and crypto sharply, so check the calendar before you open a trade.',
    learnH2: 'Learn to trade, step by step',
    learnP: 'Free lessons in a logical order: from reading a candlestick to Smart Money Concepts.',
    learnAll: 'All lessons',
    newsH2: 'Stay in the loop',
    newsP: 'Get news, updates and offers from Winvest Capital. No spam, unsubscribe at any time.',
    newsPlaceholder: 'Your email address',
    newsBtn: 'Subscribe',
    newsSoon: 'Coming soon',
    newsSoonP: 'The newsletter launches soon. Join the free Discord in the meantime.',
    newsDone: 'Almost done. Check your inbox and click the link in our email to confirm your subscription.',
    newsError: 'Something went wrong. Please try again later.',
    newsPrivacy: 'We only use your email address for the newsletter. See our privacy policy.',
    faqH2: 'Questions',
    faqs: [
      ['Is the community really free?', 'Yes. Joining the Winvest Capital community costs nothing. The One Percent Club is an optional one-time upgrade.'],
      ['How is the One Percent Club different?', 'As a One Percent Club member you see the projects I’m watching, get one-on-one time to analyse assets and FX charts together, and can use every Market Whisper AI feature. It is a one-time payment, not a subscription.'],
      ['What is Market Whisper AI?', 'An AI bot I built that helps members analyse stocks and crypto. Every member can create a member card, get news and FX calendar events, and use the lot size calculator. One Percent Club members can also have interactive conversations with Market Whisper AI about the markets, and unlock market analysis and fundamental analysis.'],
      ['Is this financial advice?', 'No. Everything shared in Winvest Capital, including Market Whisper AI output, is for educational purposes only. Always do your own research.'],
      ['How do I join?', 'The free community is on Discord: click “Join free”. For the One Percent Club, pay securely through Stripe and your One Percent Club role is added to your Discord account automatically.'],
    ],
    endH2: 'Join Winvest Capital today',
    endP: 'Free community access, Market Whisper AI included.',
    dMarkets: 'Markets right now',
    dMarketsAll: 'All markets',
    dTools: 'Free trading tools',
    dToolsP: 'No account needed. Your data stays on your own device.',
    dMine: 'Your space',
    dMineP: 'Saved on this device only.',
    dTrades: (n: number) => (n === 1 ? '1 trade in your journal' : `${n} trades in your journal`),
    dTx: (n: number) => (n === 1 ? '1 portfolio transaction' : `${n} portfolio transactions`),
    dWallets: (n: number) => (n === 1 ? '1 wallet tracked' : `${n} wallets tracked`),
    dEmpty: 'Log your first trade or add your holdings to see them here.',
    dOpenJournal: 'Open journal',
    dOpenPortfolio: 'Open portfolio',
    dTerminal: 'Open Winvest Terminal',
    dClubP: 'Every Market Whisper AI feature, my research and the projects I’m watching.',
    dClubBtn: 'See what you get',
    dLessons: 'Free lessons',
  },
  nl: {
    title: 'Winvest Capital | Gratis SMC Trading Community & Market Whisper AI',
    description:
      `Gratis tradingcommunity voor Smart Money Concepts (SMC) in aandelen, crypto en FX, met Market Whisper AI en gratis tools. One Percent Club: ${PRICE} eenmalig.`,
    badge: 'Advanced SMC Trading',
    h1a: 'Slimmer traden,',
    h1b: 'samen.',
    intro: 'Winvest Capital is een gratis community voor traders die Smart Money Concepts leren toepassen op aandelen, crypto en FX. Inclusief toegang tot',
    introBot: 'onze eigen analysebot.',
    ctaFree: 'Word gratis lid op Discord',
    ctaSee: 'Bekijk de One Percent Club',
    note: 'Uitsluitend educatief. Geen financieel advies.',
    chartTag: 'Marktstructuur',
    memH2: 'Gratis lid, met één upgrade als je meer wilt',
    memP: 'De community is gratis voor iedereen. Met de One Percent Club krijg je daarbovenop mijn persoonlijke research, analyses en projecten.',
    freeName: 'Community',
    freeSub: 'Voor iedere trader',
    free: 'Gratis',
    joinFree: 'Word gratis lid',
    paidName: 'One Percent Club',
    paidSub: 'Persoonlijke begeleiding en research',
    oneTime: 'Eenmalig',
    oneTimePayment: 'eenmalige betaling',
    joinPaid: 'Word lid van de One Percent Club',
    freeItems: [
      'Toegang tot de Winvest Capital-community',
      'Officiële Winvest Capital-ledenkaart met je tradingstatistieken en -stijl',
      'Regelmatig nieuws over crypto, aandelen en FX',
      'Economische kalender voor FX-traders',
      'Market Whisper AI: lotgrootte-calculator',
    ],
    paidItems: [
      'Alles uit de gratis community',
      'Regelmatig de projecten die ik volg',
      'Persoonlijke tijd: samen assets en FX-charts onderzoeken en analyseren',
      'Market Whisper AI: stel al je vragen over de markten',
      'Market Whisper AI: marktanalyse van crypto en aandelen',
      'Market Whisper AI: fundamentele analyse van cryptoprojecten en assets',
    ],
    revH2: 'Wat leden zeggen',
    revP: 'Echte reviews van leden, zoals ze op Trustpilot staan (in het Engels).',
    revKicker: 'Reviews',
    revVerified: 'Review op Trustpilot',
    tpTitle: 'Bekijk ons op Trustpilot',
    tpSub: 'Lees of schrijf een review',
    wBadge: 'Gebouwd door Winvest Capital',
    wP: 'De AI-bot die ik voor leden heb gebouwd. Hij helpt je aandelen en crypto te analyseren, zodat je beter onderbouwde keuzes maakt. Elk lid gebruikt de gratis functies; met de One Percent Club krijg je alles.',
    wFree: 'Gratis voor ieder lid',
    wPaid: 'Inbegrepen bij de One Percent Club',
    wUnlock: 'Upgrade naar de One Percent Club',
    whisperFree: [
      ['Ledenkaart', 'Maak je officiële Winvest Capital-ledenkaart met je tradingstatistieken en -stijl.'],
      ['Nieuwsupdates', 'Regelmatig nieuws over crypto, aandelen en FX.'],
      ['FX-kalenderevents', 'Zie op tijd welke cijfers en besluiten de valutaparen bewegen.'],
      ['Lotgrootte-calculator', 'Bepaal je positiegrootte op basis van je risico, vóór je instapt.'],
    ],
    whisperPaid: [
      ['Interactieve gesprekken', 'Praat met Market Whisper AI over de markten. Stel vervolgvragen en krijg direct context en inzicht, wanneer jij dat nodig hebt.'],
      ['Marktanalyse', 'Analyses van crypto en aandelen.'],
      ['Fundamentele analyse', 'De fundamentals van cryptoprojecten en andere assets.'],
    ],
    calH2: 'Economische kalender',
    calP: 'De belangrijkste economische events van deze week. Rentebesluiten en cijfers over inflatie en werkgelegenheid kunnen FX, aandelen en crypto flink laten bewegen. Check de kalender dus voordat je een trade opent.',
    learnH2: 'Leer traden, stap voor stap',
    learnP: 'Gratis lessen in een logische volgorde: van een candlestick lezen tot Smart Money Concepts.',
    learnAll: 'Alle lessen',
    newsH2: 'Blijf op de hoogte',
    newsP: 'Ontvang nieuws, updates en aanbiedingen van Winvest Capital. Geen spam en je kunt je altijd afmelden.',
    newsPlaceholder: 'Je e-mailadres',
    newsBtn: 'Aanmelden',
    newsSoon: 'Binnenkort',
    newsSoonP: 'De nieuwsbrief start binnenkort. Word tot die tijd gratis lid van de Discord.',
    newsDone: 'Bijna klaar. Check je inbox en klik op de link in onze e-mail om je inschrijving te bevestigen.',
    newsError: 'Er ging iets mis. Probeer het later opnieuw.',
    newsPrivacy: 'We gebruiken je e-mailadres alleen voor de nieuwsbrief. Zie onze privacyverklaring.',
    faqH2: 'Veelgestelde vragen',
    faqs: [
      ['Is de community echt gratis?', 'Ja. Lid worden van de Winvest Capital community kost niets. De One Percent Club is een optionele eenmalige upgrade.'],
      ['Wat is het verschil met de One Percent Club?', 'Als lid van de One Percent Club zie je welke projecten ik volg, krijg je persoonlijke tijd om samen assets en FX-charts te analyseren en gebruik je alle functies van Market Whisper AI. Je betaalt één keer, het is geen abonnement.'],
      ['Wat is Market Whisper AI?', 'Een AI-bot die ik heb gebouwd om leden te helpen aandelen en crypto te analyseren. Ieder lid kan een ledenkaart maken, krijgt nieuws en FX-kalenderevents en kan de lotgrootte-calculator gebruiken. Leden van de One Percent Club kunnen ook interactieve gesprekken voeren met Market Whisper AI over de markten, en ontgrendelen marktanalyse en fundamentele analyse.'],
      ['Is dit financieel advies?', 'Nee. Alles wat binnen Winvest Capital wordt gedeeld, inclusief de output van Market Whisper AI, is uitsluitend educatief. Doe altijd je eigen onderzoek.'],
      ['Hoe word ik lid?', 'De gratis community zit op Discord: klik op "Word gratis lid". Voor de One Percent Club betaal je veilig via Stripe en krijg je automatisch de One Percent Club-rol in Discord.'],
    ],
    endH2: 'Word vandaag lid van Winvest Capital',
    endP: 'Gratis toegang tot de community, inclusief Market Whisper AI.',
    dMarkets: 'De markten nu',
    dMarketsAll: 'Alle markten',
    dTools: 'Gratis tradingtools',
    dToolsP: 'Geen account nodig. Je gegevens blijven op je eigen apparaat.',
    dMine: 'Jouw overzicht',
    dMineP: 'Alleen opgeslagen op dit apparaat.',
    dTrades: (n: number) => (n === 1 ? '1 trade in je journal' : `${n} trades in je journal`),
    dTx: (n: number) => (n === 1 ? '1 portfoliotransactie' : `${n} portfoliotransacties`),
    dWallets: (n: number) => (n === 1 ? '1 wallet gevolgd' : `${n} wallets gevolgd`),
    dEmpty: 'Leg je eerste trade vast of voeg je beleggingen toe om ze hier te zien.',
    dOpenJournal: 'Journal openen',
    dOpenPortfolio: 'Portfolio openen',
    dTerminal: 'Winvest Terminal openen',
    dClubP: 'Alle functies van Market Whisper AI, mijn research en de projecten die ik volg.',
    dClubBtn: 'Bekijk wat je krijgt',
    dLessons: 'Gratis lessen',
  },
}

function Newsletter({ lang }: { lang: Lang }) {
  const c = homeCopy[lang]
  const live = NEWSLETTER_FORM_ACTION !== ''
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!live) return
    setState('sending')
    const data = new FormData(e.currentTarget)
    data.append('l', NEWSLETTER_LIST_UUID)
    data.append('nonce', '') // Listmonk honeypot field, must stay empty
    try {
      // Listmonk does not send CORS headers for this form; the request still goes through.
      await fetch(NEWSLETTER_FORM_ACTION, { method: 'POST', body: data, mode: 'no-cors' })
      setState('done')
    } catch {
      setState('error')
    }
  }
  return (
    <section id="newsletter" className="border-t border-white/10">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{c.newsH2}</h2>
        <p className="mt-3 text-white/60">{live ? c.newsP : c.newsSoonP}</p>
        {state === 'done' ? (
          <p role="status" className="mx-auto mt-6 max-w-md rounded-2xl border border-[var(--wc-red)]/50 bg-[var(--wc-red)]/10 px-5 py-4 font-semibold">{c.newsDone}</p>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="nl-email">{c.newsPlaceholder}</label>
            <input
              id="nl-email"
              type="email"
              name={NEWSLETTER_EMAIL_FIELD}
              required
              disabled={!live || state === 'sending'}
              placeholder={c.newsPlaceholder}
              className="flex-1 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-white placeholder:text-white/40 focus:border-[var(--wc-red)] focus:outline-none disabled:opacity-50"
            />
            <button type="submit" disabled={!live || state === 'sending'} className="rounded-full bg-[var(--wc-red)] px-6 py-3 font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
              {live ? c.newsBtn : c.newsSoon}
            </button>
          </form>
        )}
        {state === 'error' && <p role="alert" className="mt-3 text-sm text-[var(--wc-red-soft)]">{c.newsError}</p>}
        {live && state !== 'done' && <p className="mt-3 text-xs text-white/40">{c.newsPrivacy}</p>}
      </div>
    </section>
  )
}

const card = 'rounded-2xl border border-white/10 bg-white/[0.03]'

/** Personal numbers from the journal (IndexedDB) and portfolio (localStorage). Read on the client only. */
function MySpace({ lang }: { lang: Lang }) {
  const c = homeCopy[lang]
  const p = paths[lang]
  const [d, setD] = useState<{ trades: number; tx: number; wallets: number } | null>(null)
  useEffect(() => {
    let alive = true
    Promise.all([
      import('../journal/db').then((m) => m.loadState()).then((s) => s.trades.length).catch(() => 0),
      import('../portfolio/store').then((m) => m.load()).then((x) => [x.txs.length, x.wallets.length] as const).catch(() => [0, 0] as const),
    ]).then(([trades, [tx, wallets]]) => alive && setD({ trades, tx, wallets }))
    return () => {
      alive = false
    }
  }, [])
  const has = d && (d.trades || d.tx || d.wallets)
  return (
    <div className={`${card} flex flex-col p-5`}>
      <h2 className="text-base font-semibold">{c.dMine}</h2>
      <p className="text-xs text-white/45">{c.dMineP}</p>
      {has ? (
        <ul className="mt-4 space-y-2 text-sm text-white/80">
          {d.trades > 0 && <li className="flex items-center gap-2"><Icon name="journal" size={16} className="text-[var(--wc-red)]" />{c.dTrades(d.trades)}</li>}
          {d.tx > 0 && <li className="flex items-center gap-2"><Icon name="portfolio" size={16} className="text-[var(--wc-red)]" />{c.dTx(d.tx)}</li>}
          {d.wallets > 0 && <li className="flex items-center gap-2"><Icon name="portfolio" size={16} className="text-[var(--wc-red)]" />{c.dWallets(d.wallets)}</li>}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-white/60">{c.dEmpty}</p>
      )}
      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <a href={p.journal} className="rounded-full border border-white/15 px-3 py-2 text-center text-sm font-semibold transition hover:border-white/40">{c.dOpenJournal}</a>
        <a href={p.portfolio} className="rounded-full border border-white/15 px-3 py-2 text-center text-sm font-semibold transition hover:border-white/40">{c.dOpenPortfolio}</a>
        <a href={terminalHref(lang)} className="col-span-2 flex items-center justify-center gap-2 rounded-full border border-[var(--wc-red)]/60 px-3 py-2 text-center text-sm font-semibold transition hover:bg-[var(--wc-red)]/10">
          <Icon name="terminal" size={16} className="text-[var(--wc-red)]" />
          {c.dTerminal}
        </a>
      </div>
    </div>
  )
}

function Overview({ lang }: { lang: Lang }) {
  const c = homeCopy[lang]
  const p = paths[lang]
  const nl = lang === 'nl'
  const tools = navGroups(lang).find((g) => g.id === 'tools')!.items
  const lessons = articles.slice(0, 5)
  const tv = nl ? 'nl_NL' : 'en'
  return (
    <section aria-label={nl ? 'Overzicht' : 'Overview'} className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${card} order-2 overflow-hidden lg:order-1 lg:col-span-2`}>
          <div className="flex items-center justify-between px-5 pt-4">
            <h2 className="text-base font-semibold">{c.dMarkets}</h2>
            <a href={p.markets} className="text-sm text-white/55 hover:text-white">{c.dMarketsAll} →</a>
          </div>
          <PulseStrip lang={lang} />
          <TradingViewWidget
            className="min-h-[420px]"
            script="embed-widget-market-overview.js"
            config={{
              colorTheme: 'dark',
              dateRange: '1D',
              showChart: true,
              locale: tv,
              isTransparent: true,
              showSymbolLogo: true,
              showFloatingTooltip: false,
              width: '100%',
              height: 420,
              tabs: [
                { title: 'Crypto', symbols: [{ s: 'BITSTAMP:BTCUSD', d: 'Bitcoin' }, { s: 'BITSTAMP:ETHUSD', d: 'Ethereum' }, { s: 'BINANCE:SOLUSDT', d: 'Solana' }, { s: 'BINANCE:XRPUSDT', d: 'XRP' }] },
                { title: nl ? 'Indices' : 'Indices', symbols: [{ s: 'FOREXCOM:SPXUSD', d: 'S&P 500' }, { s: 'FOREXCOM:NSXUSD', d: 'Nasdaq 100' }, { s: 'INDEX:DEU40', d: 'DAX' }, { s: 'TVC:DXY', d: 'Dollar Index' }] },
                { title: 'FX', symbols: [{ s: 'FX_IDC:EURUSD', d: 'EUR/USD' }, { s: 'FX_IDC:GBPUSD', d: 'GBP/USD' }, { s: 'FX_IDC:USDJPY', d: 'USD/JPY' }, { s: 'FX_IDC:AUDUSD', d: 'AUD/USD' }] },
                { title: nl ? 'Grondstoffen' : 'Commodities', symbols: [{ s: 'OANDA:XAUUSD', d: nl ? 'Goud' : 'Gold' }, { s: 'OANDA:XAGUSD', d: nl ? 'Zilver' : 'Silver' }, { s: 'TVC:USOIL', d: nl ? 'Olie (WTI)' : 'Crude oil (WTI)' }] },
              ],
            }}
          />
        </div>
        <div className="order-1 grid gap-4 lg:order-2">
          <MySpace lang={lang} />
          <div className="flex flex-col rounded-2xl border border-[var(--wc-red)]/50 bg-[var(--wc-red)]/[0.07] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">One Percent Club</h2>
              <span className="shrink-0 rounded-full bg-[var(--wc-red)] px-2.5 py-0.5 text-xs font-semibold text-white">{PRICE} {c.oneTime.toLowerCase()}</span>
            </div>
            <p className="mt-2 text-sm text-white/65">{c.dClubP}</p>
            <a href="#membership" className="mt-4 rounded-full bg-[var(--wc-red)] px-4 py-2 text-center text-sm font-semibold text-white transition hover:brightness-110">{c.dClubBtn}</a>
          </div>
        </div>

        <div className="order-3 lg:col-span-3">
          <div className="mt-4 mb-3 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-xl font-bold tracking-tight">{c.dTools}</h2>
            <p className="text-sm text-white/50">{c.dToolsP}</p>
          </div>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {tools.map((t) => (
              <li key={t.href}>
                <a href={t.href} className={`${card} group flex h-full flex-col items-start gap-3 p-4 transition sm:flex-row hover:border-[var(--wc-red)]/50 active:scale-[0.99]`}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--wc-red)]/10 text-[var(--wc-red)]">
                    <Icon name={t.icon} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-tight">{t.label}</span>
                    <span className="mt-1 block text-xs leading-snug text-white/55">{t.hint}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div id="calendar" className={`${card} order-3 scroll-mt-24 p-5 lg:col-span-2`}>
          <h2 className="text-xl font-bold tracking-tight">{c.calH2}</h2>
          <p className="mt-1 text-sm text-white/60">{c.calP}</p>
          <TradingViewWidget
            className="mt-3 min-h-[380px]"
            script="embed-widget-events.js"
            config={{
              colorTheme: 'dark',
              isTransparent: true,
              width: '100%',
              height: 380,
              locale: tv,
              importanceFilter: '0,1',
              countryFilter: 'us,eu,gb,jp,ch,ca,au,nz,cn',
            }}
          />
        </div>

        <div id="learn" className={`${card} order-3 flex scroll-mt-24 flex-col p-5`}>
          <h2 className="text-xl font-bold tracking-tight">{c.learnH2}</h2>
          <p className="mt-1 text-sm text-white/60">{c.learnP}</p>
          <ol className="mt-4 space-y-1">
            {lessons.map((a, i) => (
              <li key={a.id}>
                <a href={a[lang].path} className="group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.05]">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs font-semibold text-white/60 group-hover:border-[var(--wc-red)] group-hover:text-[var(--wc-red)]">{i + 1}</span>
                  <span className="text-sm font-medium">{a[lang].title}</span>
                </a>
              </li>
            ))}
          </ol>
          <a href={p.learn} className="mt-auto pt-4 text-sm font-semibold text-[var(--wc-red-soft)] hover:underline">{c.learnAll} ({articles.length}) →</a>
        </div>
      </div>
    </section>
  )
}

export default function Home({ lang }: { lang: Lang }) {
  const c = homeCopy[lang]
  return (
    <main>
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/15 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-6 pb-4 sm:px-6 sm:pt-8">
          <div className={`${card} grid items-center gap-6 p-5 sm:p-7 lg:grid-cols-[1.4fr_1fr]`}>
            <div>
              <span className="wc-intro-more inline-flex items-center gap-2 rounded-full border border-[var(--wc-red)]/40 bg-[var(--wc-red)]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[var(--wc-red-soft)] uppercase">
                <span className="size-1.5 rounded-full bg-[var(--wc-red)]" /> <span className="wc-term">{c.badge}</span>
              </span>
              <h1 className="wc-intro-h1 mt-4 text-3xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl">
                {c.h1a} <span className="wc-glitch text-[var(--wc-red)]" data-text={c.h1b}>{c.h1b}</span>
              </h1>
              <p className="wc-intro-more mt-3 max-w-xl text-pretty text-white/65 sm:text-lg">
                {c.intro} <span className="font-semibold text-white">Market Whisper AI</span>, {c.introBot}
              </p>
              <div className="wc-intro-ctas mt-5 flex flex-col gap-3 sm:flex-row">
                <a href={FREE_URL} className="rounded-full bg-[var(--wc-red)] px-6 py-3 text-center font-semibold text-white shadow-[0_8px_30px_-8px_var(--wc-red)] transition hover:brightness-110">
                  <span className="wc-label-full">{c.ctaFree}</span>
                  <span className="wc-label-short">{lang === 'nl' ? 'Gratis lidmaatschap' : 'Join free'}</span>
                </a>
                <a href="#membership" className="rounded-full border border-white/15 px-6 py-3 text-center font-semibold text-white/90 transition hover:border-white/40">
                  <span className="wc-label-full">{c.ctaSee}</span>
                  <span className="wc-label-short">One Percent Club</span>
                </a>
              </div>
              <p className="wc-intro-more mt-3 text-xs text-white/40">{c.note}</p>
            </div>
            <div className="wc-scan hidden rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:block">
              <span className="wc-scanline" aria-hidden="true" />
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
        </div>
      </section>

      <Overview lang={lang} />

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

      <section id="reviews" className="relative overflow-hidden border-t border-white/10">
        <div className="pointer-events-none absolute top-1/2 left-0 h-[420px] w-[620px] -translate-x-1/3 -translate-y-1/2 rounded-full bg-[var(--wc-red)]/10 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="text-sm font-semibold tracking-wide text-[var(--wc-red-soft)] uppercase">{c.revKicker}</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{c.revH2}</h2>
              <p className="mt-3 text-white/60">{c.revP}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={TRUSTPILOT_URL} target="_blank" rel="noopener" className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 transition hover:border-[var(--wc-red)]/60">
                <img src="/brand/trustpilot-star.png" alt="Trustpilot" width={40} height={38} className="h-9 w-auto" />
                <span>
                  <span className="block font-semibold">{c.tpTitle}</span>
                  <span className="mt-0.5 block text-xs text-white/50 group-hover:text-white/80">{c.tpSub} →</span>
                </span>
              </a>
            </div>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 md:grid-rows-4">
            {reviews.map((r, i) => (
              <figure
                key={r.id}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border p-7 transition ${
                  i === 0
                    ? 'border-[var(--wc-red)]/50 bg-gradient-to-br from-[var(--wc-red)]/20 via-white/[0.03] to-transparent md:row-span-4 md:p-9'
                    : 'border-white/10 bg-white/[0.03] hover:border-[var(--wc-red)]/40'
                }`}
              >
                <span aria-hidden="true" className={`pointer-events-none absolute -top-6 right-5 font-serif leading-none text-[var(--wc-red)] ${i === 0 ? 'text-[10rem] opacity-30' : 'text-8xl opacity-20'}`}>“</span>
                <Stars />
                <blockquote className={`relative mt-5 flex-1 text-white/90 ${i === 0 ? 'text-xl leading-relaxed sm:text-2xl' : 'leading-relaxed'}`}>{r.text}</blockquote>
                <figcaption className="relative mt-6 flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[var(--wc-red)] to-[#7a0000] text-lg font-bold text-[#fff] uppercase ring-2 ring-black">{r.name[0]}</span>
                  <span>
                    <span className="block font-semibold">{r.name}</span>
                    <span className="flex items-center gap-1.5 text-xs text-white/50">
                      <svg viewBox="0 0 20 20" className="size-3.5 text-[var(--wc-red)]" fill="currentColor" aria-hidden="true"><path d="M10 1l2.4 2.1 3.2-.2.7 3.1 2.7 1.8-1.2 3 1.2 3-2.7 1.8-.7 3.1-3.2-.2L10 19l-2.4-2.1-3.2.2-.7-3.1L1 12.2l1.2-3L1 6.2l2.7-1.8.7-3.1 3.2.2z" /><path d="M6.5 10.2l2.3 2.3 4.7-4.8" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {c.revVerified}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="market-whisper" className="scroll-mt-24 border-t border-white/10 bg-[var(--wc-ink)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:p-8">
            <ThemedImage src="/brand/market-whisper-symbol-dark.svg" alt="" width={256} height={256} className="size-16 shrink-0 sm:size-20" />
            <div className="flex-1">
              <span className="wc-term text-sm font-semibold tracking-wide text-[var(--wc-red-soft)] uppercase">{c.wBadge}</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Market Whisper AI</h2>
              <p className="mt-2 max-w-2xl text-white/65">{c.wP}</p>
            </div>
            <a href={paths[lang].whisper} className="shrink-0 rounded-full border border-white/20 px-6 py-3 text-center font-semibold transition hover:border-white/50">
              {lang === 'nl' ? 'Meer over Market Whisper AI' : 'More about Market Whisper AI'}
            </a>
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
