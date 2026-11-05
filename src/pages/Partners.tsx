import { DISCORD_URL } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'

type Partner = { name: string; url: string; domain: string }

const exchanges: Partner[] = [
  { name: 'Bybit EU', url: 'https://www.bybit.eu/invite?ref=8VJBRRN&medium=referral&utm_campaign=evergreen&share_to=link', domain: 'bybit.eu' },
  { name: 'Bitvavo', url: 'https://bitvavo.com/invite?a=C5C427D595', domain: 'bitvavo.com' },
  { name: 'OKX', url: 'https://my.okx.com/en-eu/join/C27Z5NYV', domain: 'okx.com' },
  { name: 'Kraken', url: 'https://invite.kraken.com/JDNW/twj8fbxb', domain: 'kraken.com' },
  { name: 'Crypto.com', url: 'https://crypto.com/app/kkxgufje9a', domain: 'crypto.com' },
]

const charting: Partner[] = [
  { name: 'TradingView', url: 'https://www.tradingview.com/pricing/?share_your_love=WinvestCapital&mobileapp=true', domain: 'tradingview.com' },
]

const wallets: Partner[] = [
  { name: 'Tangem', url: 'https://tangem.com/invite/JMDNBH', domain: 'tangem.com' },
  { name: 'Ledger', url: 'https://shop.ledger.com/?r=09f3a6390b64', domain: 'shop.ledger.com' },
]

export const partnersCopy = {
  en: {
    metaTitle: 'Partners: crypto exchanges, TradingView and hardware wallets | Winvest Capital',
    description: 'The crypto exchanges, charting platform and hardware wallets Winvest Capital works with. What an exchange and a hardware wallet do, and our partner links.',
    h1: 'Partners',
    intro: 'The platforms and tools we work with. Below you can read what each category is for, so you can choose what fits you. This page contains affiliate links (see the disclosure at the bottom).',
    disclosureH: 'Affiliate disclosure',
    disclosure:
      'These are affiliate links. If you sign up or buy through them, Winvest Capital may receive a commission. This costs you nothing extra and does not influence our content. A partner link is not a recommendation to buy, sell or trade anything.',
    exH: 'Crypto exchanges',
    exP: 'An exchange is a platform where you buy, sell and trade crypto, for example with euros. You open an account, verify your identity and can then trade directly on the platform. Your crypto stays with the exchange until you withdraw it to your own wallet. Fees, available coins and products differ per platform, so compare before you choose.',
    chartH: 'Charting platform',
    chartP: 'TradingView is the charting platform we use for all our analysis and the charts in the Discord. You can use it for free; the paid plans add more indicators per chart, more charts per layout, more alerts and faster data. Through our link you can compare the plans.',
    walletH: 'Hardware wallets',
    walletP: 'A hardware wallet is a physical device that stores the private keys of your crypto offline (cold storage). You hold your crypto yourself instead of leaving it on an exchange, which protects it against hacks and platform problems. Use it for crypto you want to keep for longer. Always buy a hardware wallet from the official shop and never share your recovery phrase with anyone.',
    visit: 'Open',
    riskH: 'Before you start',
    risk: [
      'Crypto is volatile: you can lose (part of) your investment. Only invest what you can afford to lose.',
      'Check that a platform is allowed to offer its services in your country.',
      'Turn on two-factor authentication and never share your password or recovery phrase.',
      'Nothing on this page is financial advice. Do your own research.',
    ],
    ctaH: 'Questions about a platform?',
    ctaP: 'Ask the community in the free Winvest Capital Discord.',
    ctaBtn: 'Join the free Discord',
  },
  nl: {
    metaTitle: 'Partners: crypto exchanges, TradingView en hardware wallets | Winvest Capital',
    description: 'De crypto exchanges, het chartplatform en de hardware wallets waar Winvest Capital mee samenwerkt. Wat een exchange en een hardware wallet doen, en onze partnerlinks.',
    h1: 'Partners',
    intro: 'De platformen en tools waarmee we samenwerken. Hieronder lees je per categorie waar het voor is, zodat je kunt kiezen wat bij jou past. Deze pagina bevat affiliate links (zie de melding onderaan).',
    disclosureH: 'Affiliate-melding',
    disclosure:
      'Dit zijn affiliate links. Meld je je via deze links aan of koop je iets, dan kan Winvest Capital een vergoeding ontvangen. Dat kost jou niets extra en heeft geen invloed op onze content. Een partnerlink is geen advies om iets te kopen, verkopen of traden.',
    exH: 'Crypto exchanges',
    exP: 'Een exchange is een platform waar je crypto koopt, verkoopt en tradet, bijvoorbeeld met euro’s. Je opent een account, verifieert je identiteit en kunt daarna direct op het platform handelen. Je crypto staat bij de exchange totdat je die opneemt naar je eigen wallet. Kosten, beschikbare coins en producten verschillen per platform, dus vergelijk voordat je kiest.',
    chartH: 'Chartplatform',
    chartP: 'TradingView is het chartplatform dat we gebruiken voor al onze analyses en de charts in de Discord. Je kunt het gratis gebruiken; de betaalde abonnementen geven meer indicatoren per chart, meer charts per layout, meer alerts en snellere data. Via onze link kun je de abonnementen vergelijken.',
    walletH: 'Hardware wallets',
    walletP: 'Een hardware wallet is een fysiek apparaat dat de private keys van je crypto offline bewaart (cold storage). Je beheert je crypto dan zelf in plaats van het op een exchange te laten staan, wat het beschermt tegen hacks en problemen bij een platform. Gebruik het voor crypto die je langer wilt aanhouden. Koop een hardware wallet altijd via de officiële shop en deel je recovery phrase nooit met iemand.',
    visit: 'Openen',
    riskH: 'Voordat je begint',
    risk: [
      'Crypto is volatiel: je kunt (een deel van) je inleg verliezen. Investeer alleen wat je kunt missen.',
      'Controleer of een platform zijn diensten in jouw land mag aanbieden.',
      'Zet tweestapsverificatie aan en deel nooit je wachtwoord of recovery phrase.',
      'Niets op deze pagina is financieel advies. Doe je eigen onderzoek.',
    ],
    ctaH: 'Vragen over een platform?',
    ctaP: 'Stel ze aan de community in de gratis Winvest Capital Discord.',
    ctaBtn: 'Word gratis lid van de Discord',
  },
}

function Group({ title, text, items, visit }: { title: string; text: string; items: Partner[]; visit: string }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-3xl leading-relaxed text-white/70">{text}</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <li key={p.name}>
            <a
              href={p.url}
              target="_blank"
              rel="sponsored noopener"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[var(--wc-red)] hover:bg-white/[0.05]"
            >
              <span>
                <span className="block text-lg font-semibold">{p.name}</span>
                <span className="block text-sm text-white/45">{p.domain}</span>
              </span>
              <span className="shrink-0 rounded-full bg-[var(--wc-red)] px-4 py-2 text-sm font-semibold text-white transition group-hover:brightness-110">
                {visit} ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Partners({ lang }: { lang: Lang }) {
  const c = partnersCopy[lang]
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/15 blur-[120px]" />
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-white/45">
          <a href={paths[lang].home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span> {c.h1}
        </nav>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/70">{c.intro}</p>
        <Group title={c.exH} text={c.exP} items={exchanges} visit={c.visit} />
        <Group title={c.chartH} text={c.chartP} items={charting} visit={c.visit} />
        <Group title={c.walletH} text={c.walletP} items={wallets} visit={c.visit} />
        <section className="mt-12 max-w-3xl">
          <h2 className="text-xl font-bold">{c.riskH}</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-white/70">
            {c.risk.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
        <div id="disclosure" className="mt-12 max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/60">
          <span className="font-semibold text-white/85">{c.disclosureH}: </span>
          {c.disclosure}
        </div>
        <aside className="mt-12 max-w-3xl rounded-2xl border border-[var(--wc-red)]/50 bg-gradient-to-b from-[var(--wc-red)]/15 to-white/[0.02] p-6 sm:p-8">
          <h2 className="text-xl font-bold">{c.ctaH}</h2>
          <p className="mt-2 text-white/70">{c.ctaP}</p>
          <a href={DISCORD_URL} className="mt-5 inline-block rounded-full bg-[var(--wc-red)] px-5 py-2.5 font-semibold text-white transition hover:brightness-110">
            {c.ctaBtn}
          </a>
        </aside>
      </div>
    </main>
  )
}
