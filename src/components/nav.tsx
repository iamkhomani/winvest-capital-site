// One navigation model for the whole site: sidebar (desktop), "More" sheet and tab bar (mobile),
// search and footer all read from here, so every page stays findable from everywhere.
import { createContext, useContext } from 'react'
import { DISCORD_URL, PRICE, TERMINAL_EMBED, TERMINAL_LOGIN_URL } from '../config'
import { ARTICLE_IDS } from '../content/articles'
import type { Lang } from '../i18n'
import { paths } from '../paths'

/** Where "open Winvest Terminal" goes: inside the site, or straight to the terminal (see TERMINAL_EMBED). */
export const terminalHref = (lang: Lang) => (TERMINAL_EMBED ? paths[lang].terminalApp : TERMINAL_LOGIN_URL)

/** Path of the page being rendered (set in entry-server/entry-client), used to mark the active link. */
export const PathContext = createContext('/')
export const useCurrentPath = () => useContext(PathContext)

const ICONS = {
  home: <path d="M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9" />,
  markets: <path d="M3 3v18h18M7 15l4-4 3 3 6-7" />,
  portfolio: <path d="M12 3a9 9 0 1 0 9 9h-9zM14 2.3V10h7.7A8 8 0 0 0 14 2.3z" />,
  journal: <path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6zM6 3v18M10 8h6M10 12h6M10 16h4" />,
  scan: <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4" />,
  calc: <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 7h8v3H8zM8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01M16 17.5h.01" />,
  calendar: <path d="M4 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 10h16M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" />,
  whisper: <path d="M4 5h16v11H9l-5 4zM8 9h8M8 12h5" />,
  terminal: <path d="M7 3v4M7 15v6M5 7h4v8H5zM17 3v2M17 13v8M15 5h4v8h-4z" />,
  products: <path d="M12 3 4 7v10l8 4 8-4V7zM4 7l8 4 8-4M12 11v10" />,
  learn: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M8 7h8M8 11h6" />,
  partners: <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20a6 6 0 0 1 12 0M12 20a6 6 0 0 1 10 0" />,
  discord: <path d="M8 6.5A14 14 0 0 1 12 6c1.4 0 2.8.2 4 .5M5 17c2 1.4 4.4 2 7 2s5-.6 7-2c.6-3.6.2-7.2-1.6-10.4C16.6 5.6 14.3 5 14 5l-.6 1.3M10.6 6.3 10 5c-.3 0-2.6.6-4.4 1.6C3.8 9.8 3.4 13.4 4 17M9 13h.01M15 13h.01" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
  news: <path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5M8 16h3" />,
  search: <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  collapse: <path d="M4 4h16v16H4zM9 4v16M15 10l-2 2 2 2" />,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  legal: <path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" />,
} as const
export type IconName = keyof typeof ICONS

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {ICONS[name]}
    </svg>
  )
}

export type NavItem = { label: string; href: string; icon: IconName; hint?: string; external?: boolean; free?: boolean; also?: string[] }
export type NavGroup = { id?: string; label: string | null; items: NavItem[] }

export function navGroups(lang: Lang): NavGroup[] {
  const p = paths[lang]
  const nl = lang === 'nl'
  return [
    { label: null, items: [{ label: nl ? 'Overzicht' : 'Overview', href: p.home, icon: 'home' }] },
    {
      label: 'Premium',
      items: [
        { label: 'One Percent Club', href: p.products, icon: 'products', hint: nl ? `Volledige toegang, ${PRICE} eenmalig` : `Full access, ${PRICE} one-time` },
        { label: 'Market Whisper AI', href: p.whisper, icon: 'whisper', hint: nl ? 'AI-assistent in onze Discord' : 'AI assistant in our Discord' },
        { label: 'Winvest Terminal', href: p.terminal, icon: 'terminal', hint: nl ? 'Smart Money Concepts-charts' : 'Smart Money Concepts charts' },
      ],
    },
    {
      id: 'markets',
      label: nl ? 'Markten' : 'Markets',
      items: [
        { label: nl ? 'Markten' : 'Markets', href: p.markets, icon: 'markets', hint: nl ? 'Koersen, sentiment, trends en heatmaps' : 'Prices, sentiment, trends and heatmaps', free: true },
        { label: nl ? 'Marktnieuws' : 'Market news', href: p.news, icon: 'news', hint: nl ? 'Crypto, forex en aandelen, elke 10 min' : 'Crypto, forex and stocks, every 10 min', free: true },
        { label: nl ? 'Economische kalender' : 'Economic calendar', href: p.markets + '#calendar', icon: 'calendar', hint: nl ? 'Cijfers en besluiten die de markt bewegen' : 'Data and decisions that move markets', free: true },
      ],
    },
    {
      id: 'mine',
      label: nl ? 'Mijn Winvest' : 'My Winvest',
      items: [
        { label: 'Portfolio tracker', href: p.portfolio, icon: 'portfolio', hint: nl ? 'Je beleggingen en watchlist op één plek' : 'Your holdings and watchlist in one place', free: true },
        { label: 'Trading journal', href: p.journal, icon: 'journal', hint: nl ? 'Leg je trades vast en leer ervan' : 'Log your trades and learn from them', free: true },
      ],
    },
    {
      label: nl ? 'Leren en community' : 'Learn and community',
      items: [
        { label: nl ? 'Gratis lessen' : 'Free lessons', href: p.learn, icon: 'learn', hint: nl ? `${ARTICLE_IDS.length} lessen, van de basis tot SMC` : `${ARTICLE_IDS.length} lessons, from the basics to SMC`, free: true },
        { label: nl ? 'Discord (gratis)' : 'Discord (free)', href: DISCORD_URL, icon: 'discord', external: true, hint: nl ? 'Word gratis lid' : 'Join for free' },
        { label: 'Partners', href: p.partners, icon: 'partners', hint: nl ? 'Exchanges en tools die we gebruiken' : 'Exchanges and tools we use' },
      ],
    },
  ]
}

/** All free tools, for the homepage grid and site search. DeFi scanner and calculator are not menu items
 *  (they open from coin pages: Check contract, Plan trade) but stay one tap away here. */
export function toolItems(lang: Lang): NavItem[] {
  const p = paths[lang]
  const nl = lang === 'nl'
  return [
        { label: nl ? 'Marktnieuws' : 'Market news', href: p.news, icon: 'news', hint: nl ? 'Crypto, forex en aandelen, elke 10 min' : 'Crypto, forex and stocks, every 10 min', free: true },
        { label: nl ? 'Markten' : 'Markets', href: p.markets, icon: 'markets', hint: nl ? 'Koersen, sentiment, trends en heatmaps' : 'Prices, sentiment, trends and heatmaps', free: true },
        { label: 'Portfolio tracker', href: p.portfolio, icon: 'portfolio', hint: nl ? 'Je beleggingen op één plek' : 'All your holdings in one place', free: true },
        { label: 'Trading journal', href: p.journal, icon: 'journal', hint: nl ? 'Leg je trades vast en leer ervan' : 'Log your trades and learn from them', free: true },
        { label: nl ? 'DeFi-scanner' : 'DeFi scanner', href: p.scanner, icon: 'scan', hint: nl ? 'Controleer tokens en wallets op risico’s' : 'Check tokens and wallets for risk', free: true },
        { label: nl ? 'Lotgrootte-calculator' : 'Lot size calculator', href: p.calculator, icon: 'calc', hint: nl ? 'Bereken je positie op basis van je risico' : 'Size positions to your risk', free: true },
        { label: nl ? 'Economische kalender' : 'Economic calendar', href: p.markets + '#calendar', icon: 'calendar', hint: nl ? 'Cijfers en besluiten die de markt bewegen' : 'Data and decisions that move markets', free: true },
  ]
}

/** Bottom tab bar on mobile (browser and installed app): four shortcuts, the fifth tab opens everything else.
 *  `only`: 'web' items show only in the browser, 'app' items only in the installed app (html.pwa, see styles.css). */
export function tabItems(lang: Lang): (NavItem & { only?: 'web' | 'app' })[] {
  const p = paths[lang]
  const nl = lang === 'nl'
  return [
    { label: nl ? 'Overzicht' : 'Overview', href: p.home, icon: 'home' },
    { label: nl ? 'Markten' : 'Markets', href: p.markets, icon: 'markets', also: [p.news] },
    { label: nl ? 'Mijn Winvest' : 'My Winvest', href: p.portfolio, icon: 'portfolio', also: [p.journal] },
    { label: 'Terminal', href: terminalHref(lang), icon: 'terminal', external: !TERMINAL_EMBED },
  ]
}

/** Is `href` the page being shown? Home only matches itself; other pages also match their sub pages. */
export function isActive(current: string, href: string, lang: Lang, also?: string[]) {
  if (also?.some((a) => current.startsWith(a))) return true
  if (href.includes('#') || /^https?:/.test(href)) return false
  if (href === paths[lang].home) return current === href
  return current.startsWith(href)
}
