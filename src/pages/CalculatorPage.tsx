import { DISCORD_URL } from '../config'
import LotSizeCalculator from '../components/LotSizeCalculator'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import Prose from './Prose'

export const calcCopy = {
  en: {
    metaTitle: 'Free Lot Size Calculator for Forex, Gold & Crypto | Winvest Capital',
    description: 'Free lot size and position size calculator. Enter your balance, risk % and stop loss to get the right lot size for forex pairs, gold (XAU/USD), crypto and stocks.',
    h1: 'Lot size calculator',
    intro: 'Calculate the right position size for every trade in seconds. Enter your account balance, how much you want to risk and your stop loss, and the calculator works out your lot size. Free for everyone.',
    faqTitle: 'Frequently asked questions',
    sections: [
      { h: 'How the calculation works', p: ['Lot size = amount at risk ÷ (stop loss in pips × pip value per standard lot). The amount at risk is your balance multiplied by your risk percentage. The pip value depends on the pair and is converted into your account currency using the latest ECB exchange rate.', 'For crypto and stocks the calculator uses: position size = amount at risk ÷ (entry price − stop loss price).'] },
      { h: 'Example', p: ['With a €10,000 account, 1% risk (€100) and a 20-pip stop on EUR/USD, the pip value of one standard lot is $10, which is about €9 at an exchange rate of 0.90. Lot size = 100 ÷ (20 × 9) ≈ 0.55 lots.'] },
    ],
    faq: [
      ['What is a standard lot?', 'In forex, one standard lot is 100,000 units of the base currency. A mini lot is 10,000 units (0.1 lot) and a micro lot is 1,000 units (0.01 lot).'],
      ['How much should I risk per trade?', 'Many traders risk 0.5% to 2% of their account per trade. Smaller risk means a losing streak does less damage.'],
      ['Why does my broker show a slightly different result?', 'Brokers use live exchange rates and can have different contract sizes, especially for gold and indices. Spread, commission and swap are also not included here.'],
    ] as [string, string][],
    learnMore: 'Learn more about risk management',
    ctaH: 'Want this inside Discord?',
    ctaP: 'One Percent Club members get the lot size calculator built into Market Whisper AI, plus market and fundamental analysis.',
    ctaBtn: 'Join the free Discord',
  },
  nl: {
    metaTitle: 'Gratis lotgrootte-calculator voor forex, goud en crypto | Winvest Capital',
    description: 'Gratis calculator voor lotgrootte en positiegrootte. Vul je saldo, risico % en stop-loss in en zie direct de juiste lotgrootte voor forex, goud (XAU/USD), crypto en aandelen.',
    h1: 'Lotgrootte-calculator',
    intro: 'Bereken in een paar seconden de juiste positiegrootte voor elke trade. Vul je accountsaldo in, hoeveel je wilt riskeren en je stop-loss, en de calculator rekent je lotgrootte uit. Gratis voor iedereen.',
    faqTitle: 'Veelgestelde vragen',
    sections: [
      { h: 'Zo werkt de berekening', p: ['Lotgrootte = risicobedrag ÷ (stop-loss in pips × pipwaarde per standaard lot). Het risicobedrag is je saldo maal je risicopercentage. De pipwaarde hangt af van het valutapaar en wordt omgerekend naar de valuta van je account met de meest recente ECB-wisselkoers.', 'Voor crypto en aandelen rekent de calculator met: positiegrootte = risicobedrag ÷ (instapprijs − stop-lossprijs).'] },
      { h: 'Voorbeeld', p: ['Met een account van €10.000, 1% risico (€100) en een stop van 20 pips op EUR/USD is de pipwaarde van één standaard lot $10, ongeveer €9 bij een wisselkoers van 0,90. Lotgrootte = 100 ÷ (20 × 9) ≈ 0,55 lot.'] },
    ],
    faq: [
      ['Wat is een standaard lot?', 'Bij forex is één standaard lot 100.000 eenheden van de basisvaluta. Een mini lot is 10.000 eenheden (0,1 lot) en een micro lot 1.000 eenheden (0,01 lot).'],
      ['Hoeveel moet ik per trade riskeren?', 'Veel traders riskeren 0,5% tot 2% van hun account per trade. Hoe kleiner het risico, hoe minder schade een verliesreeks doet.'],
      ['Waarom geeft mijn broker een iets andere uitkomst?', 'Brokers gebruiken live wisselkoersen en kunnen andere contractgroottes hebben, vooral bij goud en indices. Spread, commissie en swap zijn hier ook niet meegerekend.'],
    ] as [string, string][],
    learnMore: 'Meer over risicobeheer',
    ctaH: 'Wil je dit in Discord?',
    ctaP: 'Leden van de One Percent Club krijgen de lotgrootte-calculator ingebouwd in Market Whisper AI, plus markt- en fundamentele analyse.',
    ctaBtn: 'Word gratis lid van de Discord',
  },
}

export default function CalculatorPage({ lang }: { lang: Lang }) {
  const c = calcCopy[lang]
  const riskPath = lang === 'nl' ? '/nl/leren/risicobeheer-lotgrootte/' : '/learn/risk-management-lot-size/'
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/15 blur-[120px]" />
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-white/45">
          <a href={paths[lang].home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span> {c.h1}
        </nav>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/70">{c.intro}</p>
        <div className="mt-10">
          <LotSizeCalculator lang={lang} />
        </div>
        <div className="mx-auto max-w-3xl">
          <Prose sections={c.sections} />
          <p className="mt-6"><a href={riskPath} className="text-[var(--wc-red-soft)] hover:underline">{c.learnMore} →</a></p>
          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight">{c.faqTitle}</h2>
            <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
              {c.faq.map(([q, a]) => (
                <div key={q} className="py-5">
                  <h3 className="font-semibold">{q}</h3>
                  <p className="mt-2 leading-relaxed text-white/70">{a}</p>
                </div>
              ))}
            </div>
          </section>
          <aside className="mt-12 rounded-2xl border border-[var(--wc-red)]/50 bg-gradient-to-b from-[var(--wc-red)]/15 to-white/[0.02] p-6 sm:p-8">
            <h2 className="text-xl font-bold">{c.ctaH}</h2>
            <p className="mt-2 text-white/70">{c.ctaP}</p>
            <a href={DISCORD_URL} className="mt-5 inline-block rounded-full bg-[var(--wc-red)] px-6 py-3 font-semibold transition hover:brightness-110">{c.ctaBtn}</a>
          </aside>
        </div>
      </div>
    </main>
  )
}
