import type { Lang } from '../i18n'
import { paths } from '../paths'

// Bottom navigation, only visible when the site runs as an installed web app (see styles.css: .pwa).
const icons = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  learn: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M8 7h8M8 11h6" />,
  calc: <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 7h8v3H8zM8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01M16 17.5h.01" />,
  scan: <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4" />,
  markets: <path d="M3 3v18h18M7 15l4-4 3 3 6-7" />,
}

export default function AppTabBar({ lang }: { lang: Lang }) {
  const p = paths[lang]
  const nl = lang === 'nl'
  const items: [keyof typeof icons, string, string, boolean][] = [
    ['home', 'Home', p.home, false],
    ['markets', nl ? 'Markten' : 'Markets', p.markets, false],
    ['scan', 'Scanner', p.scanner, false],
    ['calc', 'Calculator', p.calculator, false],
    ['learn', nl ? 'Leren' : 'Learn', p.learn, false],
  ]
  return (
    <nav aria-label={nl ? 'App-menu' : 'App menu'} className="app-tabbar fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[var(--wc-black)]/95 backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map(([icon, label, href, external]) => (
          <li key={icon}>
            <a
              href={href}
              data-tab={external ? undefined : href}
              {...(external ? { target: '_blank', rel: 'noopener' } : {})}
              className="flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-white/55 transition aria-[current=page]:text-white"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {icons[icon]}
              </svg>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
