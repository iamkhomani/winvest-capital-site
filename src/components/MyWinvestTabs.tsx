// The switcher at the top of the personal tools: Portfolio · Watchlist · Journal.
import { useEffect } from 'react'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import { LinkTabs } from './kit'

export default function MyWinvestTabs({ lang, on }: { lang: Lang; on: 'portfolio' | 'watchlist' | 'journal' }) {
  const p = paths[lang]
  // Remember the last tool so the "My Winvest" tab reopens it.
  useEffect(() => { try { localStorage.setItem('wc-mine-last', on) } catch { /* private mode */ } }, [on])
  return (
    <LinkTabs
      className="mb-5"
      label={lang === 'nl' ? 'Mijn Winvest' : 'My Winvest'}
      items={[
        { href: p.portfolio, label: 'Portfolio', on: on === 'portfolio' },
        { href: p.watchlist, label: 'Watchlist', on: on === 'watchlist' },
        { href: p.journal, label: 'Journal', on: on === 'journal' },
      ]}
    />
  )
}
