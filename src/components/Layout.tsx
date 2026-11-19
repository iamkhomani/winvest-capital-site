import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { DISCORD_URL, PRICE, SOCIALS } from '../config'
import { articles } from '../content/articles'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import { Icon, isActive, navGroups, tabItems, useCurrentPath } from './nav'
import type { NavItem } from './nav'
import SmoothScroll from './SmoothScroll'
import Ticker from './Ticker'

type Props = { lang: Lang; alternate?: string; children: ReactNode }

function toggleTheme() {
  const root = document.documentElement
  const light = root.dataset.theme !== 'light'
  if (light) root.dataset.theme = 'light'
  else delete root.dataset.theme
  try {
    localStorage.setItem('wc-theme', light ? 'light' : 'dark')
  } catch {
    // The choice simply will not be remembered.
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f6f6f7' : '#0a0a0b')
  window.dispatchEvent(new Event('wc-theme'))
}

function toggleSidebar() {
  const mini = document.documentElement.classList.toggle('wc-side-mini')
  try {
    localStorage.setItem('wc-side', mini ? 'mini' : 'full')
  } catch {
    // Not remembered.
  }
}

function ThemeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g className="theme-to-light">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </g>
      <path className="theme-to-dark" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

function LangSwitch({ lang, alternate }: { lang: Lang; alternate?: string }) {
  const other = alternate ?? (lang === 'en' ? '/nl/' : '/')
  const base = 'rounded-full px-2.5 py-1 text-xs font-semibold transition'
  return (
    <div className="flex shrink-0 items-center rounded-full border border-white/15 p-0.5" aria-label="Language">
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
      <img src="/logo.jpeg" alt="Winvest Capital logo" width={36} height={36} className={`${size} shrink-0 rounded-full object-cover ring-1 ring-white/10`} />
      <span className="wc-side-label truncate text-lg font-bold tracking-tight">
        Winvest <span className="text-[var(--wc-red)]">Capital</span>
      </span>
    </>
  )
}

const ext = (i: NavItem) => (i.external ? { target: '_blank', rel: 'noopener' } : {})

/** Opens a native <dialog> as a modal and keeps the page behind it from scrolling. */
function useDialog() {
  const ref = useRef<HTMLDialogElement>(null)
  const open = () => {
    const d = ref.current
    if (!d || d.open) return
    d.showModal()
    document.documentElement.classList.add('wc-modal')
  }
  const close = () => ref.current?.close()
  useEffect(() => {
    const d = ref.current
    if (!d) return
    const onClose = () => document.documentElement.classList.remove('wc-modal')
    const onClick = (e: MouseEvent) => e.target === d && d.close() // tap on the backdrop
    d.addEventListener('close', onClose)
    d.addEventListener('click', onClick)
    return () => {
      d.removeEventListener('close', onClose)
      d.removeEventListener('click', onClick)
    }
  }, [])
  return { ref, open, close }
}

/* ---------- Desktop sidebar ---------- */

function Sidebar({ lang }: { lang: Lang }) {
  const current = useCurrentPath()
  const nl = lang === 'nl'
  return (
    <aside className="wc-sidebar fixed inset-y-0 left-0 z-30 hidden w-[var(--wc-side)] flex-col border-r border-white/10 bg-[var(--wc-black)] lg:flex" aria-label={nl ? 'Zijbalk' : 'Sidebar'}>
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
        <a href={paths[lang].home} className="flex min-w-0 flex-1 items-center gap-3">
          <Brand />
        </a>
        <button type="button" onClick={toggleSidebar} className="wc-side-toggle flex size-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/[0.06] hover:text-white" aria-label={nl ? 'Zijbalk in- of uitklappen' : 'Collapse or expand the sidebar'}>
          <Icon name="collapse" size={18} />
        </button>
      </div>
      <nav aria-label={nl ? 'Hoofdmenu' : 'Main menu'} data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        {navGroups(lang).map((g, gi) => (
          <div key={gi} className={gi ? 'mt-5' : ''}>
            {g.label && <p className="wc-side-label mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-white/40 uppercase">{g.label}</p>}
            <ul className="space-y-0.5">
              {g.items.map((i) => {
                const on = isActive(current, i.href, lang)
                return (
                  <li key={i.href}>
                    <a
                      href={i.href}
                      {...ext(i)}
                      title={i.label}
                      aria-current={on ? 'page' : undefined}
                      className="group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] text-white/70 transition hover:bg-white/[0.06] hover:text-white aria-[current=page]:bg-white/[0.07] aria-[current=page]:font-semibold aria-[current=page]:text-white"
                    >
                      {on && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[var(--wc-red)]" aria-hidden="true" />}
                      <Icon name={i.icon} size={19} className={on ? 'shrink-0 text-[var(--wc-red)]' : 'shrink-0 text-white/50 group-hover:text-white'} />
                      <span className="wc-side-label truncate">{i.label}</span>
                      {i.external && <span className="wc-side-label ml-auto text-white/30" aria-hidden="true">↗</span>}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="wc-side-label shrink-0 border-t border-white/10 p-3">
        <a href={paths[lang].products} className="block rounded-2xl border border-[var(--wc-red)]/40 bg-[var(--wc-red)]/[0.08] p-4 transition hover:border-[var(--wc-red)]/70">
          <p className="text-sm font-bold">One Percent Club</p>
          <p className="mt-1 text-xs text-white/60">{nl ? `Volledige toegang tot Market Whisper AI. ${PRICE} eenmalig.` : `Full access to Market Whisper AI. ${PRICE} one-time.`}</p>
          <span className="mt-3 inline-block rounded-full bg-[var(--wc-red)] px-3 py-1.5 text-xs font-semibold text-white">{nl ? 'Bekijk de upgrade' : 'See the upgrade'}</span>
        </a>
        <button type="button" data-install-app hidden className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white">
          <Icon name="download" size={18} />
          {nl ? 'Installeer de app' : 'Install the app'}
        </button>
      </div>
    </aside>
  )
}

/* ---------- Search (Ctrl+K) ---------- */

function SearchDialog({ lang, dialog }: { lang: Lang; dialog: ReturnType<typeof useDialog> }) {
  const nl = lang === 'nl'
  const [q, setQ] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const all = useMemo(() => {
    const pages = navGroups(lang).flatMap((g) => g.items.map((i) => ({ ...i, group: g.label ?? (nl ? 'Pagina' : 'Page') })))
    const lessons = articles.map((a) => ({ label: a[lang].title, href: a[lang].path, icon: 'learn' as const, hint: a[lang].description, group: nl ? 'Les' : 'Lesson', external: false }))
    return [...pages, ...lessons]
  }, [lang, nl])
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const hits = q.trim() ? all.filter((i) => norm(`${i.label} ${i.hint ?? ''} ${i.group}`).includes(norm(q.trim()))) : all.slice(0, 12)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        dialog.open()
        setTimeout(() => input.current?.focus(), 0)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [dialog])

  return (
    <dialog ref={dialog.ref} aria-label={nl ? 'Zoeken' : 'Search'} className="wc-dialog wc-search m-auto mt-[10vh] w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-[var(--wc-panel)] p-0 text-white shadow-2xl shadow-black/60">
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault()
          if (hits[0]) location.href = hits[0].href
        }}
        className="flex items-center gap-3 border-b border-white/10 px-4"
      >
        <Icon name="search" size={18} className="shrink-0 text-white/40" />
        <input
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="text"
          inputMode="search"
          autoComplete="off"
          enterKeyHint="go"
          placeholder={nl ? 'Zoek een tool, pagina of les' : 'Search a tool, page or lesson'}
          aria-label={nl ? 'Zoekterm' : 'Search term'}
          className="h-14 min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/40"
        />
        <button type="button" onClick={dialog.close} className="rounded-md border border-white/15 px-1.5 py-0.5 text-[11px] text-white/50">
          Esc
        </button>
      </form>
      <ul data-lenis-prevent className="max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain p-2">
        {hits.length === 0 && <li className="px-3 py-6 text-center text-sm text-white/50">{nl ? 'Niets gevonden.' : 'Nothing found.'}</li>}
        {hits.map((i) => (
          <li key={i.href}>
            <a href={i.href} {...ext(i)} onClick={dialog.close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/70">
                <Icon name={i.icon} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">{i.label}</span>
                {i.hint && <span className="block truncate text-xs text-white/50">{i.hint}</span>}
              </span>
              <span className="hidden shrink-0 text-[11px] text-white/35 sm:inline">{i.group}</span>
            </a>
          </li>
        ))}
      </ul>
    </dialog>
  )
}

/* ---------- Mobile "More" sheet ---------- */

function MoreSheet({ lang, alternate, dialog }: { lang: Lang; alternate?: string; dialog: ReturnType<typeof useDialog> }) {
  const current = useCurrentPath()
  const nl = lang === 'nl'
  const p = paths[lang]
  return (
    <dialog ref={dialog.ref} aria-label={nl ? 'Alle pagina’s' : 'All pages'} className="wc-dialog wc-sheet m-0 mt-auto w-full max-w-none rounded-t-3xl border border-b-0 border-white/10 bg-[var(--wc-panel)] p-0 text-white sm:mx-auto sm:max-w-lg">
      <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <p className="text-lg font-bold">{nl ? 'Alles van Winvest' : 'Everything Winvest'}</p>
        <button type="button" onClick={dialog.close} className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/70" aria-label={nl ? 'Sluiten' : 'Close'}>
          <Icon name="close" size={18} />
        </button>
      </div>
      <div data-lenis-prevent className="max-h-[calc(85dvh-4.5rem)] overflow-y-auto overscroll-contain px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        {navGroups(lang).map((g, gi) => (
          <section key={gi} className="mt-3">
            {g.label && <h2 className="mb-2 px-1 text-[11px] font-semibold tracking-wider text-white/40 uppercase">{g.label}</h2>}
            <ul className="grid grid-cols-2 gap-2">
              {g.items.map((i) => (
                <li key={i.href} className={g.items.length === 1 ? 'col-span-2' : ''}>
                  <a
                    href={i.href}
                    {...ext(i)}
                    onClick={dialog.close}
                    aria-current={isActive(current, i.href, lang) ? 'page' : undefined}
                    className="flex h-full min-h-[4.25rem] items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.02] p-3 transition active:scale-[0.98] aria-[current=page]:border-[var(--wc-red)]/60"
                  >
                    <Icon name={i.icon} size={20} className="mt-0.5 shrink-0 text-[var(--wc-red)]" />
                    <span className="min-w-0">
                      <span className="block text-[14px] leading-tight font-semibold text-white">{i.label}</span>
                      {i.hint && <span className="mt-0.5 block text-[12px] leading-snug text-white/50">{i.hint}</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section className="mt-5 flex flex-wrap items-center gap-2">
          <LangSwitch lang={lang} alternate={alternate} />
          <button type="button" onClick={toggleTheme} className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/80">
            <ThemeIcon />
            <span className="theme-to-light">{nl ? 'Lichte modus' : 'Light mode'}</span>
            <span className="theme-to-dark">{nl ? 'Donkere modus' : 'Dark mode'}</span>
          </button>
          <button type="button" data-install-app hidden className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/80">
            <Icon name="download" size={18} />
            {nl ? 'Installeer de app' : 'Install the app'}
          </button>
        </section>
        <a href={DISCORD_URL} onClick={dialog.close} className="mt-4 block rounded-2xl bg-[var(--wc-red)] px-4 py-3 text-center text-[15px] font-semibold text-white">
          {nl ? 'Word gratis lid van de Discord' : 'Join the Discord, free'}
        </a>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-white/40">
          <a href={p.terms}>{nl ? 'Voorwaarden' : 'Terms'}</a>
          <a href={p.privacy}>Privacy</a>
          <a href={p.refunds}>{nl ? 'Terugbetaling' : 'Refunds'}</a>
          <a href="#cookie-settings" data-cookie-settings onClick={dialog.close}>{nl ? 'Cookie-instellingen' : 'Cookie settings'}</a>
        </p>
      </div>
    </dialog>
  )
}

/* ---------- Mobile bottom tab bar ---------- */

function TabBar({ lang, onMore }: { lang: Lang; onMore: () => void }) {
  const current = useCurrentPath()
  const nl = lang === 'nl'
  const tabs = tabItems(lang)
  const onTab = tabs.some((t) => isActive(current, t.href, lang))
  const cls = 'flex flex-col items-center gap-1 pt-2 pb-1.5 text-[11px] font-medium text-white/55 transition active:scale-95 aria-[current=page]:text-white'
  return (
    <nav aria-label={nl ? 'Snelmenu' : 'Quick menu'} className="wc-tabbar fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[var(--wc-black)]/95 backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {tabs.map((t) => (
          <li key={t.href}>
            <a href={t.href} aria-current={isActive(current, t.href, lang) ? 'page' : undefined} className={cls}>
              <Icon name={t.icon} size={22} />
              {t.label}
            </a>
          </li>
        ))}
        <li>
          <button type="button" onClick={onMore} aria-current={onTab ? undefined : 'page'} aria-haspopup="dialog" className={`${cls} w-full`}>
            <Icon name="more" size={22} />
            {nl ? 'Meer' : 'More'}
          </button>
        </li>
      </ul>
    </nav>
  )
}

/* ---------- Page shell ---------- */

export default function Layout({ lang, alternate, children }: Props) {
  const p = paths[lang]
  const nl = lang === 'nl'
  const search = useDialog()
  const more = useDialog()
  const openSearch = () => {
    search.open()
    setTimeout(() => search.ref.current?.querySelector('input')?.focus(), 0)
  }
  return (
    <div className="min-h-screen bg-[var(--wc-black)] text-white antialiased">
      <a href="#main" className="sr-only z-50 rounded-full bg-[var(--wc-red)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        {nl ? 'Naar de inhoud' : 'Skip to content'}
      </a>
      <Sidebar lang={lang} />
      <div className="wc-main min-w-0">
        <header className="wc-topbar sticky top-0 z-20 border-b border-white/10 bg-[var(--wc-black)]/85 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <a href={p.home} className="flex min-w-0 items-center gap-3 lg:hidden">
              <Brand />
            </a>
            <button
              type="button"
              onClick={openSearch}
              className="hidden h-10 w-full max-w-sm items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm text-white/45 transition hover:border-white/25 hover:text-white/70 lg:flex"
            >
              <Icon name="search" size={17} />
              <span className="flex-1 text-left">{nl ? 'Zoek een tool, pagina of les' : 'Search a tool, page or lesson'}</span>
              <kbd className="rounded-md border border-white/15 px-1.5 py-0.5 font-sans text-[11px] text-white/40">Ctrl K</kbd>
            </button>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button type="button" onClick={openSearch} className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white lg:hidden" aria-label={nl ? 'Zoeken' : 'Search'}>
                <Icon name="search" size={18} />
              </button>
              <div className="hidden sm:block">
                <LangSwitch lang={lang} alternate={alternate} />
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={nl ? 'Wissel tussen licht en donker' : 'Switch between light and dark'}
                className="hidden size-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white sm:flex"
              >
                <ThemeIcon />
              </button>
              <a href={DISCORD_URL} className="hidden rounded-full bg-[var(--wc-red)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:inline-block">
                {nl ? 'Gratis lid' : 'Join free'}
              </a>
              <button type="button" onClick={more.open} aria-haspopup="dialog" className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white lg:hidden" aria-label={nl ? 'Menu' : 'Menu'}>
                <Icon name="menu" size={20} />
              </button>
            </div>
          </div>
        </header>
        <Ticker lang={lang} />
        <div id="main">{children}</div>
        <footer className="border-t border-white/10 bg-black">
          <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-white/45 sm:px-6">
            <div className="flex items-center gap-3 text-white/80">
              <img src="/logo.jpeg" alt="" width={28} height={28} className="size-7 rounded-full object-cover" />
              <span className="font-semibold">
                Winvest <span className="text-[var(--wc-red)]">Capital</span>
              </span>
            </div>
            <nav aria-label={nl ? 'Footer' : 'Footer'} className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-white/60">
              {navGroups(lang)
                .flatMap((g) => g.items)
                .filter((i) => !i.external && !i.href.includes('#'))
                .map((i) => (
                  <a key={i.href} href={i.href} className="hover:text-white">
                    {i.href === p.home ? 'Home' : i.label}
                  </a>
                ))}
              <button type="button" data-install-app hidden className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-[var(--wc-red-soft)]">
                <img src="/icon-192.png" alt="" width={16} height={16} className="size-4" />
                {nl ? 'Installeer de app' : 'Install the app'}
              </button>
            </nav>
            <div className="mt-6">
              <p className="text-xs font-semibold tracking-wide text-white/40 uppercase">{nl ? 'Volg ons' : 'Follow us'}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {SOCIALS.map((s) => (
                  <li key={s.name}>
                    <a href={s.url} target="_blank" rel="noopener me" aria-label={`${s.name} ${s.handle}`} className="block rounded-[7px] ring-[var(--wc-red)] ring-offset-2 ring-offset-[var(--wc-black)] transition hover:ring-2 focus-visible:ring-2 focus-visible:outline-none">
                      <img src={`/social/${s.badge}-dark.svg`} alt="" width={s.w} height={32} loading="lazy" className="theme-dark block h-8 w-auto" />
                      <img src={`/social/${s.badge}-light.svg`} alt="" width={s.w} height={32} loading="lazy" className="theme-light block h-8 w-auto" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 max-w-3xl">
              {nl
                ? 'Disclaimer: alle content, analyses en output van Market Whisper AI van Winvest Capital zijn uitsluitend educatief en geen financieel advies. Handelen in aandelen, crypto en FX brengt een hoog risico op verlies met zich mee. Doe je eigen onderzoek en riskeer alleen wat je kunt missen.'
                : 'Disclaimer: All content, analysis and Market Whisper AI output from Winvest Capital is for educational purposes only and is not financial advice. Trading stocks, crypto and FX carries a high risk of loss. Do your own research and only risk what you can afford to lose.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/30">
              <span>&copy; 2026 Winvest Capital</span>
              <a href={p.terms} className="hover:text-white/60">{nl ? 'Voorwaarden' : 'Terms'}</a>
              <a href={p.privacy} className="hover:text-white/60">Privacy</a>
              <a href={p.refunds} className="hover:text-white/60">{nl ? 'Terugbetaling' : 'Refunds'}</a>
              <a href="#cookie-settings" data-cookie-settings className="hover:text-white/60">{nl ? 'Cookie-instellingen' : 'Cookie settings'}</a>
            </div>
          </div>
        </footer>
      </div>
      <TabBar lang={lang} onMore={more.open} />
      <MoreSheet lang={lang} alternate={alternate} dialog={more} />
      <SearchDialog lang={lang} dialog={search} />
      <SmoothScroll />
    </div>
  )
}
