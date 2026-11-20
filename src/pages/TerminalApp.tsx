// Winvest Terminal inside the website and the installed app, so members never leave Winvest Capital.
// The terminal (terminal.winvestcapital.nl) allows only this site to frame it and tells us when it has
// loaded. If it does not, the visitor is not logged in yet: Cloudflare Access cannot show its login
// inside a frame, so the login runs in this window and the terminal (?return=en|nl) sends them back here.
import { useEffect, useRef, useState } from 'react'
import { TERMINAL_LOGIN_URL } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'

const ORIGIN = new URL(TERMINAL_LOGIN_URL).origin
const WAIT_MS = 9000

const copy = {
  en: {
    title: 'Winvest Terminal',
    loading: 'Opening Winvest Terminal…',
    intro: 'Smart Money Concepts on the chart: market structure, BOS, CHoCH and inducement drawn for you, with the Winvest trade playbook and a setup grade for 71 markets.',
    shot: 'Winvest Terminal in the dark theme, with the markets list, the playbook panel and the chart',
    points: ['Crypto, forex, gold, silver and stocks, from 5 minutes to 1 month', 'Every market graded from 0 to 100 against the playbook', 'Nothing to install: works on your phone and computer'],
    p: 'Members log in with a code sent by email and come straight back here.',
    login: 'Log in (members)',
    about: 'Plans and details',
  },
  nl: {
    title: 'Winvest Terminal',
    loading: 'Winvest Terminal wordt geopend…',
    intro: 'Smart Money Concepts op de chart: marktstructuur, BOS, CHoCH en inducement worden voor je getekend, met het Winvest trade playbook en een setup-score voor 71 markten.',
    shot: 'Winvest Terminal in het donkere thema, met de lijst met markten, het playbook-paneel en de chart',
    points: ['Crypto, forex, goud, zilver en aandelen, van 5 minuten tot 1 maand', 'Elke markt krijgt een score van 0 tot 100 volgens het playbook', 'Niets te installeren: werkt op je telefoon en computer'],
    p: 'Leden loggen in met een code per e-mail en komen daarna direct hier terug.',
    login: 'Inloggen voor leden',
    about: 'Abonnement en details',
  },
}

export default function TerminalApp({ lang }: { lang: Lang }) {
  const c = copy[lang]
  const frame = useRef<HTMLIFrameElement>(null)
  // The frame is only added after hydration, so its "ready" message can never arrive before we listen.
  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'login'>('loading')

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const sendTheme = () =>
      frame.current?.contentWindow?.postMessage({ type: 'wc-theme', theme: document.documentElement.dataset.theme === 'light' ? 'light' : 'dark' }, ORIGIN)
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== ORIGIN || (e.data as { type?: string } | null)?.type !== 'wc-terminal') return
      setPhase('ready')
      sendTheme()
    }
    window.addEventListener('message', onMessage)
    window.addEventListener('wc-theme', sendTheme)
    return () => {
      window.removeEventListener('message', onMessage)
      window.removeEventListener('wc-theme', sendTheme)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'loading') return
    const t = setTimeout(() => setPhase((p) => (p === 'loading' ? 'login' : p)), WAIT_MS)
    return () => clearTimeout(t)
  }, [phase])

  return (
    <main className="wc-app-frame relative">
      <h1 className="sr-only">{c.title}</h1>
      {mounted && (
        <iframe
          ref={frame}
          src={TERMINAL_LOGIN_URL + '/'}
          title={c.title}
          allow="clipboard-write; fullscreen"
          referrerPolicy="no-referrer"
          // A blocked frame (not logged in) still fires load, without the terminal's ready message.
          onLoad={() => setTimeout(() => setPhase((p) => (p === 'loading' ? 'login' : p)), 2000)}
          className={`absolute inset-0 h-full w-full border-0 bg-[var(--wc-black)] transition-opacity ${phase === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {phase === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center" role="status">
          <p className="flex items-center gap-3 text-sm text-white/60">
            <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-[var(--wc-red)]" aria-hidden="true" />
            {c.loading}
          </p>
        </div>
      )}
      {phase === 'login' && (
        <div className="absolute inset-0 overflow-y-auto bg-[var(--wc-black)] p-4 sm:p-8" data-lenis-prevent>
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3">
              <img src="/brand/winvest-terminal-icon.svg" alt="" width={44} height={44} className="size-11" />
              <h2 className="text-2xl font-bold tracking-tight">Winvest Terminal</h2>
            </div>
            <p className="mt-3 text-white/70">{c.intro}</p>
            <img src="/terminal/terminal-dark.png" alt={c.shot} width={1907} height={914} className="mt-5 h-auto w-full rounded-2xl border border-white/10" />
            <ul className="mt-5 space-y-2 text-sm text-white/75">
              {c.points.map((x) => (
                <li key={x} className="flex gap-2"><span className="text-[var(--wc-red)]" aria-hidden="true">●</span>{x}</li>
              ))}
            </ul>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <a href={`${TERMINAL_LOGIN_URL}/?return=${lang}`} className="rounded-full bg-[var(--wc-red)] px-5 py-3 text-center font-semibold text-white transition hover:brightness-110">
                {c.login}
              </a>
              <a href={paths[lang].terminal} className="rounded-full border border-white/20 px-5 py-3 text-center font-semibold text-white/90 transition hover:border-white/50">
                {c.about}
              </a>
            </div>
            <p className="mt-3 text-xs text-white/45">{c.p}</p>
          </div>
        </div>
      )}
    </main>
  )
}
