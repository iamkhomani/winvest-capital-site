// Star button to follow an asset in the shared watchlist (Markets rows, coin pages).
import type { Lang } from '../i18n'
import { useWatchlists } from './watchlist'
import type { WatchItem } from './watchlist'

export default function WatchStar({ item, lang, size = 'sm' }: { item: WatchItem; lang: Lang; size?: 'sm' | 'md' }) {
  const { lists, has, toggle } = useWatchlists()
  const on = has(item.key)
  const nl = lang === 'nl'
  const label = on ? (nl ? `${item.name} niet meer volgen` : `Stop watching ${item.name}`) : nl ? `${item.name} volgen in je watchlist` : `Watch ${item.name}`
  const md = size === 'md'
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      title={label}
      disabled={!lists}
      onClick={() => toggle(item)}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full transition ${md ? 'border px-4 py-2 text-sm font-semibold' : 'size-7 text-base'} ${on ? 'border-amber-300/50 text-amber-300' : 'border-white/20 text-white/40 hover:text-white'}`}
    >
      <span aria-hidden="true">{on ? '★' : '☆'}</span>
      {md ? <span>{on ? (nl ? 'Gevolgd' : 'Watching') : nl ? 'Volgen' : 'Watch'}</span> : null}
    </button>
  )
}
