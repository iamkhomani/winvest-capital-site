import type { ReactNode } from 'react'
import { DISCORD_URL } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import Ticker from './Ticker'

type Props = { lang: Lang; alternate?: string; children: ReactNode }

const nav = {
  en: [
    ['Membership', '/#membership'],
    ['Market Whisper AI', '/#market-whisper'],
    ['Economic calendar', '/#calendar'],
    ['Learn', '/learn/'],
    ['Lot size calculator', '/lot-size-calculator/'],
  ],
  nl: [
    ['Lidmaatschap', '/nl/#membership'],
    ['Market Whisper AI', '/nl/#market-whisper'],
    ['Economische kalender', '/nl/#calendar'],
    ['Leren', '/nl/leren/'],
    ['Lotgrootte-calculator', '/nl/lotgrootte-calculator/'],
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

export default function Layout({ lang, alternate, children }: Props) {
  const p = paths[lang]
  return (
    <div className="min-h-screen bg-[var(--wc-black)] text-white antialiased">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--wc-black)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href={p.home} className="flex items-center gap-3">
            <Brand />
          </a>
          <nav className="hidden items-center gap-5 text-sm text-white/70 xl:flex">
            {nav[lang].map(([label, href]) => (
              <a key={href} href={href} className="hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <LangSwitch lang={lang} alternate={alternate} />
            <a href={DISCORD_URL} className="rounded-full bg-[var(--wc-red)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
              {lang === 'nl' ? 'Gratis lid' : 'Join free'}
            </a>
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
            <a href={DISCORD_URL} className="hover:text-white">Discord</a>
          </nav>
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
          </div>
        </div>
      </footer>
    </div>
  )
}
