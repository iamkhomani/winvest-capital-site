import { Check } from '../components/ui'
import { DISCORD_URL, PRICE, STRIPE_PAYMENT_LINK } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import { homeCopy } from './Home'

type Shot = { src: string; w: number; h: number; alt: { en: string; nl: string } }
type Showcase = { id: string; tier: 'free' | 'paid' | null; shots: Shot[] }

// Real screenshots from the Winvest Capital Discord (public/market-whisper/). Text per item lives in whisperCopy.show.
const SHOWCASE: Showcase[] = [
  { id: 'ai', tier: 'paid', shots: [{ src: '/market-whisper/ai-analysis.webp', w: 1337, h: 794, alt: { en: 'Market Whisper AI answering a member’s question on whether Bitcoin is preparing for a breakout or a correction, with timeframe bias, key levels and scenarios', nl: 'Market Whisper AI beantwoordt de vraag van een lid of Bitcoin een uitbraak of correctie voorbereidt, met timeframe-bias, belangrijke niveaus en scenario’s' } }] },
  {
    id: 'recap',
    tier: null,
    shots: [
      { src: '/market-whisper/crypto-radar.webp', w: 1080, h: 1768, alt: { en: 'Crypto Radar weekly recap card with the weekly performance of Bitcoin, Ethereum, Solana, XRP and BNB and the key events of the week', nl: 'Crypto Radar weekoverzicht met de weekprestaties van Bitcoin, Ethereum, Solana, XRP en BNB en de belangrijkste gebeurtenissen' } },
      { src: '/market-whisper/stock-watch.webp', w: 1080, h: 2024, alt: { en: 'Stock Watch weekly recap card with the weekly performance of major US indices and large tech stocks, key events and what to watch next week', nl: 'Stock Watch weekoverzicht met de weekprestaties van de belangrijkste Amerikaanse indices en grote techaandelen, belangrijke gebeurtenissen en wat je volgende week in de gaten houdt' } },
    ],
  },
  {
    id: 'news',
    tier: 'free',
    shots: [
      { src: '/market-whisper/news-crypto.webp', w: 800, h: 1359, alt: { en: 'Crypto news posted by Market Whisper in Discord, with headline, summary and source', nl: 'Cryptonieuws dat Market Whisper in Discord plaatst, met kop, samenvatting en bron' } },
      { src: '/market-whisper/news-stocks.webp', w: 800, h: 711, alt: { en: 'Stock market news posted by Market Whisper in Discord, with headline, summary and source', nl: 'Beursnieuws dat Market Whisper in Discord plaatst, met kop, samenvatting en bron' } },
    ],
  },
  { id: 'fx', tier: 'free', shots: [{ src: '/market-whisper/fx-calendar.webp', w: 900, h: 508, alt: { en: 'FX News Alert from Market Whisper: an economic calendar event with time, currency, forecast and previous value', nl: 'FX News Alert van Market Whisper: een event uit de economische kalender met tijd, valuta, verwachting en vorige waarde' } }] },
  { id: 'card', tier: 'free', shots: [{ src: '/market-whisper/member-card.webp', w: 1000, h: 629, alt: { en: 'Winvest Capital member card created with the trading-profile command, showing trading style, market, direction, leverage, minimum risk-to-reward and timeframes', nl: 'Winvest Capital member card gemaakt met het trading-profile-commando, met tradingstijl, markt, richting, leverage, minimale risk-to-reward en timeframes' } }] },
]

export const whisperCopy = {
  en: {
    metaTitle: 'Market Whisper AI: your AI market assistant in Discord | Winvest Capital',
    description: 'Market Whisper AI is the AI bot of the Winvest Capital Discord: news, FX calendar events, a lot size calculator and your member card for free. One Percent Club members also get interactive conversations, market analysis and fundamental analysis.',
    badge: 'Built by Winvest Capital',
    h1: 'Your AI market assistant, right inside Discord',
    intro: 'Market Whisper AI lives in the Winvest Capital Discord. It brings the news, the events that move the markets and your risk tools to the place where the community already talks markets. One Percent Club members can also ask it anything about the markets and get analysis on crypto and stocks.',
    ctaFree: 'Join the Discord, free',
    ctaPaid: 'Unlock the full toolkit',
    howH: 'How it works',
    steps: [
      ['Join the free Discord', 'Market Whisper AI is already there. No app to install, no extra account.'],
      ['Use the free tools', 'Create your member card, follow the news and FX calendar events, and size your trades with the lot size calculator.'],
      ['Unlock the full toolkit', `Join the One Percent Club (${PRICE} one-time) and your role is added automatically. Then chat with Market Whisper AI and get market and fundamental analysis.`],
    ] as [string, string][],
    featH: 'What Market Whisper AI does',
    examplesH: 'See it in action',
    examplesP: 'Real screenshots from the Winvest Capital Discord.',
    free: 'Free',
    paid: 'One Percent Club',
    show: {
      ai: ['Ask it anything about the markets', 'Mention @Market Whisper with your question and get a structured answer: the current market structure, the bias per timeframe, the key levels to watch and what would confirm or invalidate each scenario. Ask follow-up questions in the same conversation. Use it as a second opinion and a starting point for your own analysis, not as a signal.'],
      recap: ['Weekly recaps for crypto and stocks', 'Every week Market Whisper sums up the markets in two cards. Crypto Radar covers the major coins, Stock Watch the main US indices and large tech stocks. Each card shows the weekly performance, the key events with their sources and what to watch in the week ahead, so you are up to speed in a minute.'],
      news: ['News as it happens', 'Headlines from established financial and crypto news sources are posted in dedicated channels with a short summary and the source, so you can follow the news without leaving Discord and open the full article when something matters to you.'],
      fx: ['FX calendar alerts', 'Market Whisper posts the medium and high impact events from the economic calendar for the day, shown in your local time, with the forecast and previous value. Know when volatility can hit before you open or hold a trade.'],
      card: ['Your member card', 'Set up your trading profile once and use /trading-profile view to show your official Winvest Capital member card: your trading style, markets, direction, leverage, minimum risk-to-reward and timeframes. A quick way to see how other members trade.'],
    } as Record<string, [string, string]>,
    faqH: 'Questions',
    faqs: [
      ['Is Market Whisper AI financial advice?', 'No. Everything it shares is for educational purposes. Use it as a starting point for your own research, not as a buy or sell signal.'],
      ['Can the AI make mistakes?', 'Yes. Like any AI it can be wrong or miss context. Always check important information and make your own decisions.'],
      ['Which markets does it cover?', 'Crypto, stocks and FX. The FX calendar events focus on the data that moves currency pairs.'],
      ['Where does the news come from?', 'From established financial and crypto news outlets. Every post shows its source, so you can always open and check the original article.'],
      ['How do I get the One Percent Club features?', `Pay ${PRICE} once through Stripe. Your One Percent Club role is added to your Discord account automatically and the extra features unlock right away. No subscription.`],
    ] as [string, string][],
    endH: 'Start with the free tools today',
    endP: 'Join the Winvest Capital Discord and meet Market Whisper AI. Upgrade whenever you want more.',
    note: 'Market Whisper AI output is for educational purposes only and is not financial advice.',
  },
  nl: {
    metaTitle: 'Market Whisper AI: je AI-marktassistent in Discord | Winvest Capital',
    description: 'Market Whisper AI is de AI-bot van de Winvest Capital Discord: gratis nieuws, FX-kalenderevents, een lotgrootte-calculator en je member card. Leden van de One Percent Club krijgen ook interactieve gesprekken, marktanalyse en fundamentele analyse.',
    badge: 'Gebouwd door Winvest Capital',
    h1: 'Je AI-marktassistent, gewoon in Discord',
    intro: 'Market Whisper AI zit in de Winvest Capital Discord. Hij brengt het nieuws, de events die de markten bewegen en je risicotools naar de plek waar de community al over de markten praat. Leden van de One Percent Club kunnen hem ook alles vragen over de markten en krijgen analyses van crypto en aandelen.',
    ctaFree: 'Word gratis lid van de Discord',
    ctaPaid: 'Ontgrendel de volledige toolkit',
    howH: 'Zo werkt het',
    steps: [
      ['Word gratis lid van de Discord', 'Market Whisper AI is er al. Geen app installeren, geen extra account.'],
      ['Gebruik de gratis tools', 'Maak je member card, volg het nieuws en de FX-kalenderevents, en bepaal je positiegrootte met de lotgrootte-calculator.'],
      ['Ontgrendel de volledige toolkit', `Word lid van de One Percent Club (${PRICE} eenmalig) en je rol wordt automatisch toegevoegd. Daarna kun je met Market Whisper AI chatten en krijg je markt- en fundamentele analyse.`],
    ] as [string, string][],
    featH: 'Wat Market Whisper AI doet',
    examplesH: 'Zo ziet het eruit',
    examplesP: 'Echte screenshots uit de Winvest Capital Discord.',
    free: 'Gratis',
    paid: 'One Percent Club',
    show: {
      ai: ['Vraag hem alles over de markten', 'Noem @Market Whisper met je vraag en krijg een gestructureerd antwoord: de huidige marktstructuur, de bias per timeframe, de niveaus om in de gaten te houden en wat elk scenario bevestigt of ongeldig maakt. Stel vervolgvragen in hetzelfde gesprek. Gebruik het als second opinion en startpunt voor je eigen analyse, niet als signaal.'],
      recap: ['Weekoverzichten voor crypto en aandelen', 'Elke week vat Market Whisper de markten samen in twee kaarten. Crypto Radar behandelt de grote coins, Stock Watch de belangrijkste Amerikaanse indices en grote techaandelen. Elke kaart toont de weekprestaties, de belangrijkste gebeurtenissen met bronnen en waar je de komende week op let, zodat je in een minuut bij bent.'],
      news: ['Nieuws zodra het gebeurt', 'Koppen van gevestigde financiële en cryptonieuwsbronnen verschijnen in eigen kanalen, met een korte samenvatting en de bron. Zo volg je het nieuws zonder Discord te verlaten en open je het volledige artikel als iets voor jou belangrijk is.'],
      fx: ['FX-kalenderalerts', 'Market Whisper plaatst de events met gemiddelde en hoge impact uit de economische kalender van die dag, in jouw lokale tijd, met de verwachting en de vorige waarde. Zo weet je wanneer er volatiliteit kan komen voordat je een trade opent of aanhoudt.'],
      card: ['Je member card', 'Stel je tradingprofiel één keer in en laat met /trading-profile view je officiële Winvest Capital member card zien: je tradingstijl, markten, richting, leverage, minimale risk-to-reward en timeframes. Zo zie je snel hoe andere leden traden.'],
    } as Record<string, [string, string]>,
    faqH: 'Vragen',
    faqs: [
      ['Is Market Whisper AI financieel advies?', 'Nee. Alles wat hij deelt is educatief. Gebruik het als startpunt voor je eigen onderzoek, niet als koop- of verkoopsignaal.'],
      ['Kan de AI fouten maken?', 'Ja. Zoals elke AI kan hij het mis hebben of context missen. Controleer belangrijke informatie altijd en neem je eigen beslissingen.'],
      ['Welke markten behandelt hij?', 'Crypto, aandelen en FX. De FX-kalenderevents richten zich op de cijfers die valutaparen bewegen.'],
      ['Waar komt het nieuws vandaan?', 'Van gevestigde financiële en cryptonieuwsmedia. Bij elk bericht staat de bron, zodat je het originele artikel altijd kunt openen en controleren.'],
      ['Hoe krijg ik de functies van de One Percent Club?', `Betaal eenmalig ${PRICE} via Stripe. Je One Percent Club-rol wordt automatisch aan je Discord-account toegevoegd en de extra functies zijn direct beschikbaar. Geen abonnement.`],
    ] as [string, string][],
    endH: 'Begin vandaag met de gratis tools',
    endP: 'Word lid van de Winvest Capital Discord en maak kennis met Market Whisper AI. Upgrade wanneer je meer wilt.',
    note: 'Output van Market Whisper AI is uitsluitend educatief en geen financieel advies.',
  },
}

export default function MarketWhisper({ lang }: { lang: Lang }) {
  const c = whisperCopy[lang]
  const h = homeCopy[lang]
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/20 blur-[120px]" />

      <section className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-white/45">
          <a href={paths[lang].home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span> Market Whisper AI
        </nav>
        <div className="mt-8 grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <img src="/brand/market-whisper-horizontal-dark.svg" alt="Market Whisper" width={706} height={256} className="h-16 w-auto sm:h-20" />
            <span className="mt-8 block text-sm font-semibold tracking-wide text-[var(--wc-red-soft)] uppercase">{c.badge}</span>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1>
            <p className="mt-5 max-w-xl text-lg text-white/70">{c.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={DISCORD_URL} className="rounded-full bg-[var(--wc-red)] px-6 py-3 font-semibold text-white transition hover:brightness-110">{c.ctaFree}</a>
              <a href={STRIPE_PAYMENT_LINK} className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-white/50">{c.ctaPaid} · {PRICE}</a>
            </div>
          </div>
          <div className="flex justify-center">
            <img src="/brand/market-whisper-symbol-dark.svg" alt="" width={256} height={256} className="size-56 drop-shadow-[0_0_60px_rgba(254,0,0,0.35)] sm:size-72" />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[var(--wc-ink)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">{c.howH}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {c.steps.map(([t, d], i) => (
              <li key={t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <span className="flex size-9 items-center justify-center rounded-full bg-[var(--wc-red)] font-bold">{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-white/65">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">{c.featH}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-semibold">{h.wFree}</h3>
              <ul className="mt-4 space-y-4">
                {h.whisperFree.map(([x, d]) => (
                  <li key={x} className="flex gap-3"><Check muted /><span><span className="font-semibold text-white">{x}</span><span className="block text-white/60">{d}</span></span></li>
                ))}
              </ul>
              <a href={DISCORD_URL} className="mt-6 block rounded-full border border-white/20 px-6 py-3 text-center font-semibold transition hover:border-white/50">{c.ctaFree}</a>
            </div>
            <div className="rounded-2xl border border-[var(--wc-red)]/60 bg-gradient-to-b from-[var(--wc-red)]/15 to-white/[0.02] p-6">
              <h3 className="flex items-center justify-between gap-3 font-semibold">
                {h.wPaid}
                <span className="shrink-0 rounded-full bg-[var(--wc-red)] px-2.5 py-0.5 text-xs">{PRICE} {h.oneTime.toLowerCase()}</span>
              </h3>
              <ul className="mt-4 space-y-4">
                {h.whisperPaid.map(([x, d]) => (
                  <li key={x} className="flex gap-3"><Check /><span><span className="font-semibold text-white">{x}</span><span className="block text-white/60">{d}</span></span></li>
                ))}
              </ul>
              <a href={STRIPE_PAYMENT_LINK} className="mt-6 block rounded-full bg-[var(--wc-red)] px-6 py-3 text-center font-semibold transition hover:brightness-110">{h.wUnlock}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[var(--wc-ink)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">{c.examplesH}</h2>
          <p className="mt-2 text-white/60">{c.examplesP}</p>
          <div className="mt-10 space-y-16">
            {SHOWCASE.map((item, i) => {
              const [t, d] = c.show[item.id]
              const wide = item.shots.length > 1 || item.id === 'ai'
              return (
                <article key={item.id} className={wide ? 'grid gap-8' : `grid items-center gap-8 md:grid-cols-2 ${i % 2 ? 'md:[&>div:first-child]:order-2' : ''}`}>
                  <div className={wide ? 'max-w-3xl' : ''}>
                    {item.tier ? (
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.tier === 'paid' ? 'bg-[var(--wc-red)] text-white' : 'border border-white/20 text-white/70'}`}>{item.tier === 'paid' ? c.paid : c.free}</span>
                    ) : null}
                    <h3 className="mt-3 text-2xl font-bold tracking-tight">{t}</h3>
                    <p className="mt-3 leading-relaxed text-white/70">{d}</p>
                  </div>
                  <div className={item.shots.length > 1 ? 'grid items-start gap-6 sm:grid-cols-2' : ''}>
                    {item.shots.map((sh) => (
                      <img key={sh.src} src={sh.src} alt={sh.alt[lang]} width={sh.w} height={sh.h} loading="lazy" decoding="async" className="h-auto w-full rounded-2xl border border-white/10 shadow-2xl" />
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
          <p className="mt-10 text-xs text-white/40">{c.note}</p>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">{c.faqH}</h2>
          <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
            {c.faqs.map(([q, a]) => (
              <div key={q} className="py-5">
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-2 leading-relaxed text-white/70">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[var(--wc-ink)]">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <img src="/brand/market-whisper-symbol-dark.svg" alt="" width={64} height={64} className="mx-auto size-16" />
          <h2 className="mt-5 text-3xl font-bold tracking-tight">{c.endH}</h2>
          <p className="mt-3 text-white/70">{c.endP}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href={DISCORD_URL} className="rounded-full bg-[var(--wc-red)] px-6 py-3 font-semibold text-white transition hover:brightness-110">{c.ctaFree}</a>
            <a href={STRIPE_PAYMENT_LINK} className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-white/50">{c.ctaPaid}</a>
          </div>
          <p className="mt-8 text-xs text-white/40">{c.note}</p>
        </div>
      </section>
    </main>
  )
}
