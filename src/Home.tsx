import { DISCORD_URL, PRICE, STRIPE_PAYMENT_LINK } from './config'

const FREE_URL = DISCORD_URL
const PAID_URL = STRIPE_PAYMENT_LINK

function Check({ muted = false }: { muted?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`mt-0.5 size-5 shrink-0 ${muted ? 'text-white/30' : 'text-[var(--wc-red)]'}`} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Candles() {
  // Decorative chart, generic shapes only
  const c = [
    [8, 60, 92, 70, 85, 1], [26, 50, 84, 58, 78, 1], [44, 40, 80, 48, 66, 0], [62, 52, 88, 60, 80, 1],
    [80, 34, 70, 40, 62, 1], [98, 28, 60, 36, 52, 0], [116, 38, 64, 44, 58, 1], [134, 22, 50, 28, 44, 1],
    [152, 14, 42, 20, 36, 1], [170, 18, 46, 24, 40, 0], [188, 6, 30, 10, 26, 1],
  ]
  return (
    <svg viewBox="0 0 200 100" className="h-full w-full" aria-hidden="true">
      <polyline points="0,96 40,78 70,82 110,56 140,46 170,40 200,12" fill="none" stroke="var(--wc-red)" strokeOpacity=".35" strokeWidth="1" strokeDasharray="3 3" />
      {c.map(([x, hi, lo, top, bot, up], i) => (
        <g key={i}>
          <line x1={x + 4} x2={x + 4} y1={hi} y2={lo} stroke={up ? 'var(--wc-red)' : '#ffffff55'} strokeWidth="1" />
          <rect x={x} y={top} width="8" height={bot - top} rx="1" fill={up ? 'var(--wc-red)' : '#ffffff22'} stroke={up ? 'var(--wc-red)' : '#ffffff55'} strokeWidth=".8" />
        </g>
      ))}
    </svg>
  )
}

const freeItems = [
  'Access to the Winvest Capital community of likeminded traders',
  'Official Winvest Capital member card with your trading stats and trading style',
  'Frequent news updates on crypto, stocks and FX',
  'FX calendar events for FX trading',
]
const paidItems = [
  'Everything in the free community',
  'Projects I am looking at, released regularly',
  'My time: research and analysis of assets and FX charts to help guide you',
  'Market Whisper AI: lot size calculator',
  'Market Whisper AI: market analysis on crypto and stocks',
  'Market Whisper AI: fundamental analysis on crypto projects and assets',
]

const whisperFree = [
  ['Member card', 'Create your official Winvest Capital member card with your trading stats and trading style.'],
  ['News updates', 'Frequent news on crypto, stocks and FX.'],
  ['FX calendar events', 'Stay on top of the events that move FX pairs.'],
]
const whisperPaid = [
  ['Lot size calculator', 'Size positions to your risk before you enter.'],
  ['Market analysis', 'Analysis on crypto and stocks.'],
  ['Fundamental analysis', 'Fundamentals on crypto projects and assets.'],
]

const faqs = [
  ['Is the community really free?', 'Yes. Joining the Winvest Capital community costs nothing. The One Percent Club is an optional one-time upgrade.'],
  ['What is the difference with the One Percent Club?', 'One Percent Club members get the projects I am watching, my time to research and analyse assets or FX charts with them, and the full Market Whisper AI toolkit. It is a one-time payment, no subscription.'],
  ['What is Market Whisper AI?', 'An AI bot I built that helps members analyse stocks and crypto. Every member can create a member card and get news and FX calendar events. One Percent Club members also unlock the lot size calculator, market analysis and fundamental analysis.'],
  ['Is this financial advice?', 'No. Everything shared in Winvest Capital, including Market Whisper AI output, is for educational purposes only. Always do your own research.'],
  ['How do I join?', 'The free community is on Discord: click a Join free button. For the One Percent Club, pay securely through Stripe and your One Percent Club role is added to your Discord account automatically.'],
]

export default function Home() {
  return (
    <main
      className="min-h-screen bg-[var(--wc-black)] text-white antialiased"
    >

      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--wc-black)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Winvest Capital logo" className="size-9 rounded-full object-cover ring-1 ring-white/10" />
            <span className="text-lg font-bold tracking-tight">
              Winvest <span className="text-[var(--wc-red)]">Capital</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
            <a href="#membership" className="hover:text-white">Membership</a>
            <a href="#market-whisper" className="hover:text-white">Market Whisper AI</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <a href={FREE_URL} className="rounded-full bg-[var(--wc-red)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
            Join free
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/20 blur-[120px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--wc-red)]/40 bg-[var(--wc-red)]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[var(--wc-red-soft)] uppercase">
              <span className="size-1.5 rounded-full bg-[var(--wc-red)]" /> Advanced SMC Trading
            </span>
            <h1 className="mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl">
              Trade smarter, <span className="text-[var(--wc-red)]">together.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-pretty text-white/65">
              Winvest Capital is a free community of likeminded traders learning Smart Money Concepts across stocks, crypto and FX.
              Includes access to <span className="font-semibold text-white">Market Whisper AI</span>, our analysis bot.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={FREE_URL} className="rounded-full bg-[var(--wc-red)] px-6 py-3 text-center font-semibold text-white shadow-[0_8px_30px_-8px_var(--wc-red)] transition hover:brightness-110">
                Join the Discord, free
              </a>
              <a href="#membership" className="rounded-full border border-white/15 px-6 py-3 text-center font-semibold text-white/90 transition hover:border-white/40">
                See the One Percent Club
              </a>
            </div>
            <p className="mt-4 text-xs text-white/40">Educational only. Not financial advice.</p>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl">
              <div className="mb-3 flex items-center justify-between text-xs text-white/50">
                <span className="flex items-center gap-2">
                  <img src="/logo.jpeg" alt="" className="size-5 rounded-full object-cover" /> Winvest Capital
                </span>
                <span className="rounded bg-[var(--wc-red)]/15 px-2 py-0.5 text-[var(--wc-red-soft)]">Market structure</span>
              </div>
              <div className="aspect-[2/1]">
                <Candles />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership */}
      <section id="membership" className="border-t border-white/10 bg-[var(--wc-ink)]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Free to join. One upgrade if you want more.</h2>
          <p className="mt-3 max-w-2xl text-white/60">
            The community is free for everyone. The One Percent Club adds my personal research, analysis and projects.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-7">
              <h3 className="text-xl font-semibold">Community</h3>
              <p className="mt-1 text-white/55">For every likeminded trader</p>
              <p className="mt-6 text-4xl font-bold">Free</p>
              <ul className="mt-6 flex-1 space-y-3 text-white/80">
                {freeItems.map((t) => (
                  <li key={t} className="flex gap-3"><Check muted />{t}</li>
                ))}
              </ul>
              <a href={FREE_URL} className="mt-8 rounded-full border border-white/20 px-6 py-3 text-center font-semibold transition hover:border-white/50">
                Join free
              </a>
            </div>
            <div className="relative flex flex-col rounded-2xl border border-[var(--wc-red)]/60 bg-gradient-to-b from-[var(--wc-red)]/15 to-white/[0.02] p-7 shadow-[0_20px_60px_-30px_var(--wc-red)]">
              <span className="absolute -top-3 right-6 rounded-full bg-[var(--wc-red)] px-3 py-1 text-xs font-semibold">One-time</span>
              <h3 className="text-xl font-semibold">One Percent Club</h3>
              <p className="mt-1 text-white/55">Guidance and research from me</p>
              <p className="mt-6 text-4xl font-bold">
                {PRICE} <span className="text-base font-medium text-white/50">one-time payment</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-white/85">
                {paidItems.map((t) => (
                  <li key={t} className="flex gap-3"><Check />{t}</li>
                ))}
              </ul>
              <a href={PAID_URL} className="mt-8 rounded-full bg-[var(--wc-red)] px-6 py-3 text-center font-semibold transition hover:brightness-110">
                Join the One Percent Club
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Market Whisper */}
      <section id="market-whisper" className="border-t border-white/10">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <span className="text-sm font-semibold tracking-wide text-[var(--wc-red-soft)] uppercase">Built by Winvest Capital</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Market Whisper AI</h2>
            <p className="mt-4 text-white/65">
              The AI bot I built for members. It helps you analyse stocks and crypto so you can make more calculated investment decisions. Every member gets the free tools; the One Percent Club unlocks the full toolkit.
            </p>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-semibold">Free for every member</h3>
              <ul className="mt-4 space-y-4">
                {whisperFree.map(([t, d]) => (
                  <li key={t} className="flex gap-3"><Check muted /><span><span className="font-semibold text-white">{t}</span><span className="block text-white/60">{d}</span></span></li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[var(--wc-red)]/60 bg-gradient-to-b from-[var(--wc-red)]/15 to-white/[0.02] p-6">
              <h3 className="flex items-center justify-between font-semibold">
                Unlocked with the One Percent Club
                <span className="rounded-full bg-[var(--wc-red)] px-2.5 py-0.5 text-xs">{PRICE} one-time</span>
              </h3>
              <ul className="mt-4 space-y-4">
                {whisperPaid.map(([t, d]) => (
                  <li key={t} className="flex gap-3"><Check /><span><span className="font-semibold text-white">{t}</span><span className="block text-white/60">{d}</span></span></li>
                ))}
              </ul>
              <a href={PAID_URL} className="mt-6 block rounded-full bg-[var(--wc-red)] px-6 py-3 text-center font-semibold transition hover:brightness-110">
                Unlock with the One Percent Club
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-white/10 bg-[var(--wc-ink)]">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Questions</h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {faqs.map(([q, a]) => (
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

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <img src="/logo.jpeg" alt="" className="mx-auto size-16 rounded-full object-cover ring-2 ring-[var(--wc-red)]/50" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Join Winvest Capital today</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/60">Free community access, Market Whisper AI included.</p>
          <a href={FREE_URL} className="mt-8 inline-block rounded-full bg-[var(--wc-red)] px-8 py-3 font-semibold transition hover:brightness-110">
            Join free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-white/45 sm:px-6">
          <div className="flex items-center gap-3 text-white/80">
            <img src="/logo.jpeg" alt="" className="size-7 rounded-full object-cover" />
            <span className="font-semibold">Winvest <span className="text-[var(--wc-red)]">Capital</span></span>
          </div>
          <p className="mt-4 max-w-3xl">
            Disclaimer: All content, analysis and Market Whisper AI output from Winvest Capital is for educational purposes only and is not financial advice.
            Trading stocks, crypto and FX carries a high risk of loss. Do your own research and only risk what you can afford to lose.
          </p>
          <p className="mt-4">&copy; {new Date().getFullYear()} Winvest Capital</p>
        </div>
      </footer>
    </main>
  )
}
