import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { DISCORD_URL, SOCIALS } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import AppTabBar from './AppTabBar'
import Ticker from './Ticker'

type Props = { lang: Lang; alternate?: string; children: ReactNode }

const nav = {
  en: [
    ['Home', '/'],
    ['Markets', '/markets/'],
    ['Portfolio tracker', '/portfolio/'],
    ['Trading journal', '/trading-journal/'],
    ['DeFi scanner', '/defi-scanner/'],
    ['Lot size calculator', '/lot-size-calculator/'],
    ['Learn', '/learn/'],
    ['Membership', '/#membership'],
    ['Market Whisper AI', '/market-whisper/'],
    ['Winvest Terminal', '/terminal/'],
    ['Economic calendar', '/#calendar'],
    ['Partners', '/partners/'],
  ],
  nl: [
    ['Home', '/nl/'],
    ['Markten', '/nl/markten/'],
    ['Portfolio tracker', '/nl/portfolio/'],
    ['Trading journal', '/nl/trading-journal/'],
    ['DeFi-scanner', '/nl/defi-scanner/'],
    ['Lotgrootte-calculator', '/nl/lotgrootte-calculator/'],
    ['Leren', '/nl/leren/'],
    ['Lidmaatschap', '/nl/#membership'],
    ['Market Whisper AI', '/nl/market-whisper/'],
    ['Winvest Terminal', '/nl/terminal/'],
    ['Economische kalender', '/nl/#calendar'],
    ['Partners', '/nl/partners/'],
  ],
}

function LangSwitch({ lang, alternate }: { lang: Lang; alternate?: string }) {
  const other = alternate ?? (lang === 'en' ? '/nl/' : '/')
  const base = 'rounded-full px-2.5 py-1 text-xs font-semibold transition'
  return (
    <div className="flex items-center rounded-full border border-white/15 p-0.5" aria-label="Language">
      {(['nl', 'en'] as const).map((l) =>
        l === lang ? (
          <span key={l} className={`${base} bg-white text-black`} aria-current="true">
            {l.toUpperCase()}
          </span>
        ) : (
          <a key={l} href={other} hrefLang={l} className={`${base} text-white/60 hover:text-white`}>
            {l.toUpperCase()}
          </a>
        ),
      )}
    </div>
  )
}

export function Brand({ size = 'size-9' }: { size?: string }) {
  return (
    <>
      <img src="/logo.jpeg" alt="Winvest Capital logo" width={36} height={36} className={`${size} rounded-full object-cover ring-1 ring-white/10`} />
      <span className="text-lg font-bold tracking-tight">
        Winvest <span className="text-[var(--wc-red)]">Capital</span>
      </span>
    </>
  )
}

function Menu({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLDetailsElement>(null)
  const close = () => ref.current?.removeAttribute('open')
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('click', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])
  const nl = lang === 'nl'
  return (
    <details ref={ref} className="group relative">
      <summary
        aria-label={nl ? 'Menu' : 'Menu'}
        className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white [&::-webkit-details-marker]:hidden"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path className="group-open:hidden" d="M4 7h16M4 12h16M4 17h16" />
          <path className="hidden group-open:block" d="M6 6l12 12M18 6 6 18" />
        </svg>
      </summary>
      <nav
        aria-label={nl ? 'Hoofdmenu' : 'Main menu'}
        className="absolute right-0 top-12 z-30 max-h-[calc(100dvh-10rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/10 bg-[#111113] p-2 shadow-2xl shadow-black/60"
      >
        <ul>
          {nav[lang].map(([label, href]) => (
            <li key={href}>
              <a href={href} onClick={close} className="block rounded-xl px-4 py-2.5 text-[15px] text-white/80 transition hover:bg-white/[0.06] hover:text-white">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a href={DISCORD_URL} onClick={close} className="mt-2 block rounded-xl bg-[var(--wc-red)] px-4 py-2.5 text-center text-[15px] font-semibold text-white transition hover:brightness-110">
          {nl ? 'Word gratis lid van de Discord' : 'Join the Discord, free'}
        </a>
      </nav>
    </details>
  )
}

export default function Layout({ lang, alternate, children }: Props) {
  const p = paths[lang]
  return (
    <div className="min-h-screen bg-[var(--wc-black)] text-white antialiased">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--wc-black)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href={p.home} className="flex items-center gap-3">
            <Brand />
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <LangSwitch lang={lang} alternate={alternate} />
            <a href={DISCORD_URL} className="hidden rounded-full bg-[var(--wc-red)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:inline-block">
              {lang === 'nl' ? 'Gratis lid' : 'Join free'}
            </a>
            <Menu lang={lang} />
          </div>
        </div>
      </header>
      <Ticker lang={lang} />
      {children}
      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-white/45 sm:px-6">
          <div className="flex items-center gap-3 text-white/80">
            <img src="/logo.jpeg" alt="" width={28} height={28} className="size-7 rounded-full object-cover" />
            <span className="font-semibold">
              Winvest <span className="text-[var(--wc-red)]">Capital</span>
            </span>
          </div>
          <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-white/60">
            <a href={p.home} className="hover:text-white">{lang === 'nl' ? 'Home' : 'Home'}</a>
            <a href={p.learn} className="hover:text-white">{lang === 'nl' ? 'Leren' : 'Learn'}</a>
            <a href={p.calculator} className="hover:text-white">{lang === 'nl' ? 'Lotgrootte-calculator' : 'Lot size calculator'}</a>
            <a href={p.markets} className="hover:text-white">{lang === 'nl' ? 'Markten' : 'Markets'}</a>
            <a href={p.scanner} className="hover:text-white">{lang === 'nl' ? 'DeFi-scanner' : 'DeFi scanner'}</a>
            <a href={p.terminal} className="hover:text-white">Winvest Terminal</a>
            <a href={p.partners} className="hover:text-white">Partners</a>
            <button type="button" data-install-app hidden className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-[var(--wc-red-soft)]">
              <img src="/icon-192.png" alt="" width={16} height={16} className="size-4" />
              {lang === 'nl' ? 'Installeer de app' : 'Install the app'}
            </button>
          </nav>
          <div className="mt-6">
            <p className="text-xs font-semibold tracking-wide text-white/40 uppercase">{lang === 'nl' ? 'Volg ons' : 'Follow us'}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SOCIALS.map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noopener me" className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-white/75 transition hover:border-[var(--wc-red)] hover:text-white">
                    {s.icon && <img src={s.icon} alt="" width={20} height={20} loading="lazy" className="size-5 object-contain" />}
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-xs text-white/40 group-hover:text-white/70">{s.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 max-w-3xl">
            {lang === 'nl'
              ? 'Disclaimer: alle content, analyses en output van Market Whisper AI van Winvest Capital zijn uitsluitend educatief en geen financieel advies. Handelen in aandelen, crypto en FX brengt een hoog risico op verlies met zich mee. Doe je eigen onderzoek en riskeer alleen wat je kunt missen.'
              : 'Disclaimer: All content, analysis and Market Whisper AI output from Winvest Capital is for educational purposes only and is not financial advice. Trading stocks, crypto and FX carries a high risk of loss. Do your own research and only risk what you can afford to lose.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/30">
            <span>&copy; 2026 Winvest Capital</span>
            <a href={p.terms} className="hover:text-white/60">{lang === 'nl' ? 'Voorwaarden' : 'Terms'}</a>
            <a href={p.privacy} className="hover:text-white/60">Privacy</a>
            <a href={p.refunds} className="hover:text-white/60">{lang === 'nl' ? 'Terugbetaling' : 'Refunds'}</a>
            <a href="#cookie-settings" data-cookie-settings className="hover:text-white/60">{lang === 'nl' ? 'Cookie-instellingen' : 'Cookie settings'}</a>
            <a href="https://icons8.com" target="_blank" rel="noopener" className="hover:text-white/60">{lang === 'nl' ? 'Iconen door Icons8' : 'Icons by Icons8'}</a>
          </div>
        </div>
      </footer>
      <AppTabBar lang={lang} />
    </div>
  )
}
