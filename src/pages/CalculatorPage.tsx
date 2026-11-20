import { DISCORD_URL } from '../config'
import LotSizeCalculator from '../components/LotSizeCalculator'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import Prose from './Prose'
import { btn, PageHeader, pageWrap } from '../components/kit'

export const calcCopy = {
  en: {
    metaTitle: 'Lot Size Calculator (Forex, Gold, Crypto) | Winvest Capital',
    description: 'Free lot size calculator. Enter your balance, risk % and stop loss to get the right lot size for forex, gold (XAU/USD), crypto and stocks.',
    h1: 'Lot size calculator',
    intro: 'Calculate the right position size for every trade in seconds. Enter your account balance, how much you want to risk and your stop loss, and the calculator works out your lot size. Free for everyone.',
    faqTitle: 'Frequently asked questions',
    sections: [
      { h: 'How the calculation works', p: ['Lot size = amount at risk ÷ (stop loss in pips × pip value per standard lot). The amount at risk is your balance multiplied by your risk percentage. The pip value depends on the pair and is converted into your account currency using the latest ECB exchange rate.', 'For crypto and stocks the calculator uses: position size = amount at risk ÷ (entry price − stop loss price).'] },
      { h: 'Example', p: ['With a €10,000 account, 1% risk (€100) and a 20-pip stop on EUR/USD, the pip value of one standard lot is $10, which is about €9 at an exchange rate of 0.90. Lot size = 100 ÷ (20 × 9) ≈ 0.55 lots.'] },
      { h: 'Gold and crypto examples', p: ['Gold (XAU/USD): most brokers use 100 ounces per standard lot, so a $1 move in the gold price is worth $100 per lot. With a $5,000 account, 1% risk ($50) and a $5 stop, the lot size is 50 ÷ (5 × 100) = 0.10 lots. Check your broker’s contract size, because some use other sizes.', 'Bitcoin: with a $5,000 account, 1% risk ($50), entry at $60,000 and a stop at $58,800, the distance is $1,200. Position size = 50 ÷ 1,200 ≈ 0.042 BTC, worth about $2,500. A position can be larger than your risk amount; what matters is what you lose if the stop is hit.'] },
      { h: 'Common mistakes', p: ['Choosing the lot size first and the stop second. Set your stop where the trade idea is wrong, then let the calculator size the position.', 'Forgetting costs. Spread and commission make the real loss at your stop a little larger than the number shown here, especially on small stops.', 'Raising risk after a loss. A fixed percentage per trade keeps one bad day from turning into a big drawdown.'] },
    ],
    faq: [
      ['What is a standard lot?', 'In forex, one standard lot is 100,000 units of the base currency. A mini lot is 10,000 units (0.1 lot) and a micro lot is 1,000 units (0.01 lot).'],
      ['How much should I risk per trade?', 'Many traders risk 0.5% to 2% of their account per trade. Smaller risk means a losing streak does less damage.'],
      ['Why does my broker show a slightly different result?', 'Brokers use live exchange rates and can have different contract sizes, especially for gold and indices. Spread, commission and swap are also not included here.'],
    ] as [string, string][],
    learnMore: 'Learn more about risk management',
    ctaH: 'Want this inside Discord?',
    ctaP: 'Every member of the free Discord can use the lot size calculator in Market Whisper AI. The One Percent Club adds market and fundamental analysis.',
    ctaBtn: 'Join the free Discord',
  },
  nl: {
    metaTitle: 'Lotgrootte-calculator: forex, goud en crypto | Winvest Capital',
    description: 'Gratis lotgrootte-calculator. Vul je saldo, risico % en stop-loss in en zie direct de juiste lotgrootte voor forex, goud (XAU/USD), crypto en aandelen.',
    h1: 'Lotgrootte-calculator',
    intro: 'Bereken in een paar seconden de juiste positiegrootte voor elke trade. Vul je accountsaldo in, hoeveel je wilt riskeren en je stop-loss, en de calculator rekent je lotgrootte uit. Gratis voor iedereen.',
    faqTitle: 'Veelgestelde vragen',
    sections: [
      { h: 'Zo werkt de berekening', p: ['Lotgrootte = risicobedrag ÷ (stop-loss in pips × pipwaarde per standaard lot). Het risicobedrag is je saldo maal je risicopercentage. De pipwaarde hangt af van het valutapaar en wordt omgerekend naar de valuta van je account met de meest recente ECB-wisselkoers.', 'Voor crypto en aandelen rekent de calculator met: positiegrootte = risicobedrag ÷ (instapprijs − stop-lossprijs).'] },
      { h: 'Voorbeeld', p: ['Met een account van €10.000, 1% risico (€100) en een stop van 20 pips op EUR/USD is de pipwaarde van één standaard lot $10, ongeveer €9 bij een wisselkoers van 0,90. Lotgrootte = 100 ÷ (20 × 9) ≈ 0,55 lot.'] },
      { h: 'Voorbeelden met goud en crypto', p: ['Goud (XAU/USD): de meeste brokers rekenen met 100 ounce per standaard lot, dus een beweging van $1 in de goudprijs is $100 per lot waard. Met een account van $5.000, 1% risico ($50) en een stop van $5 is de lotgrootte 50 ÷ (5 × 100) = 0,10 lot. Controleer de contractgrootte bij je broker, want sommige gebruiken een andere maat.', 'Bitcoin: met een account van $5.000, 1% risico ($50), instap op $60.000 en een stop op $58.800 is de afstand $1.200. Positiegrootte = 50 ÷ 1.200 ≈ 0,042 BTC, ongeveer $2.500 waard. Je positie mag groter zijn dan je risicobedrag; het gaat om wat je verliest als de stop geraakt wordt.'] },
      { h: 'Veelgemaakte fouten', p: ['Eerst de lotgrootte kiezen en daarna pas de stop. Zet je stop waar het trade-idee niet meer klopt en laat de calculator dan de positie bepalen.', 'Kosten vergeten. Spread en commissie maken het echte verlies bij je stop iets groter dan het getal hier, vooral bij kleine stops.', 'Na een verlies meer riskeren. Een vast percentage per trade voorkomt dat één slechte dag een grote drawdown wordt.'] },
    ],
    faq: [
      ['Wat is een standaard lot?', 'Bij forex is één standaard lot 100.000 eenheden van de basisvaluta. Een mini lot is 10.000 eenheden (0,1 lot) en een micro lot 1.000 eenheden (0,01 lot).'],
      ['Hoeveel moet ik per trade riskeren?', 'Veel traders riskeren 0,5% tot 2% van hun account per trade. Hoe kleiner het risico, hoe minder schade een verliesreeks doet.'],
      ['Waarom geeft mijn broker een iets andere uitkomst?', 'Brokers gebruiken live wisselkoersen en kunnen andere contractgroottes hebben, vooral bij goud en indices. Spread, commissie en swap zijn hier ook niet meegerekend.'],
    ] as [string, string][],
    learnMore: 'Meer over risicobeheer',
    ctaH: 'Liever in Discord?',
    ctaP: 'Ieder lid van de gratis Discord kan de lotgrootte-calculator in Market Whisper AI gebruiken. De One Percent Club voegt markt- en fundamentele analyse toe.',
    ctaBtn: 'Word gratis lid van de Discord',
  },
}

export default function CalculatorPage({ lang }: { lang: Lang }) {
  const c = calcCopy[lang]
  const riskPath = lang === 'nl' ? '/nl/leren/risicobeheer-lotgrootte/' : '/learn/risk-management-lot-size/'
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/15 blur-[120px]" />
      <div className={pageWrap(false)}>
        <PageHeader home={paths[lang].home} title={c.h1} intro={c.intro} />
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
            <a href={DISCORD_URL} className={`mt-5 ${btn()}`}>{c.ctaBtn}</a>
          </aside>
        </div>
      </div>
    </main>
  )
}
