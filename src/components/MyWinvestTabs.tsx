// The switcher at the top of the personal tools: Portfolio · Watchlist · Journal.
import type { Lang } from '../i18n'
import { paths } from '../paths'
import { LinkTabs } from './kit'

export default function MyWinvestTabs({ lang, on }: { lang: Lang; on: 'portfolio' | 'watchlist' | 'journal' }) {
  const p = paths[lang]
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
