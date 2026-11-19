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
    h2: 'Log in to Winvest Terminal',
    p: 'Log in with the code we send to your email. After logging in you come straight back here and the terminal opens.',
    login: 'Log in',
    member: 'No access yet?',
    about: 'See what Winvest Terminal offers',
  },
  nl: {
    title: 'Winvest Terminal',
    loading: 'Winvest Terminal wordt geopend…',
    h2: 'Log in op Winvest Terminal',
    p: 'Log in met de code die je per e-mail krijgt. Daarna kom je direct hier terug en opent de terminal.',
    login: 'Inloggen',
    member: 'Nog geen toegang?',
    about: 'Bekijk wat Winvest Terminal biedt',
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


  return () => {
      window.removeEventListener('focus', onBack)
      document.removeEventListener('visibilitychange', onBack)
    }
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
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--wc-black)] p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <img src="/logo.jpeg" alt="" width={48} height={48} className="mx-auto size-12 rounded-full object-cover" />
            <h2 className="mt-4 text-xl font-bold">{c.h2}</h2>
            <p className="mt-2 text-sm text-white/65">{c.p}</p>
            <a href={`${TERMINAL_LOGIN_URL}/?return=${lang}`} className="mt-5 block rounded-full bg-[var(--wc-red)] px-5 py-3 font-semibold text-white transition hover:brightness-110">
              {c.login}
            </a>
            <p className="mt-5 text-xs text-white/45">
              {c.member}{' '}
              <a href={paths[lang].terminal} className="font-semibold text-[var(--wc-red-soft)] hover:underline">
                {c.about}
              </a>
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
