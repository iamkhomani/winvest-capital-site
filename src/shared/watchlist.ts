// One watchlist for the whole site: Markets, coin pages, the dashboard and the portfolio tracker.
// Stored on this device only (localStorage). Each item carries what is needed to show and price it,
// so pages do not depend on the portfolio data.
//
// First use: the watchlists of every portfolio on this device are COPIED in (merged by list name).
// The portfolio's own watchlists stay untouched as a backup.
import { useEffect, useState } from 'react'

export type WatchItem = { key: string; kind: 'crypto' | 'stock'; symbol: string; name: string; id: string; image?: string; currency?: string }
export type WatchList = { id: string; name: string; items: WatchItem[] }

const KEY = 'wc-watchlist-v1'
const EVENT = 'wc-watchlist'

const DEFAULT: WatchList[] = [
  {
    id: 'default',
    name: 'Watchlist',
    items: [
      { key: 'crypto:bitcoin', kind: 'crypto', symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin' },
      { key: 'crypto:ethereum', kind: 'crypto', symbol: 'ETH', name: 'Ethereum', id: 'ethereum' },
    ],
  },
]

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
function cleanItem(o: Partial<WatchItem> | undefined): WatchItem | null {
  if (!o || typeof o.key !== 'string' || !/^(crypto|stock):/.test(o.key)) return null
  const kind = o.key.startsWith('stock:') ? 'stock' : 'crypto'
  return { key: o.key.slice(0, 80), kind, symbol: str(o.symbol, 20), name: str(o.name, 80), id: str(o.id, 80) || o.key.split(':')[1], image: str(o.image, 300) || undefined, currency: str(o.currency, 5) || undefined }
}
function clean(raw: unknown): WatchList[] | null {
  if (!Array.isArray(raw)) return null
  const lists = raw
    .filter((l) => l && typeof l === 'object')
    .map((l: { id?: unknown; name?: unknown; items?: unknown }) => {
      const seen = new Set<string>()
      const items = (Array.isArray(l.items) ? l.items : []).map((i) => cleanItem(i as Partial<WatchItem>)).filter((i): i is WatchItem => !!i && !seen.has(i.key) && !!seen.add(i.key))
      return { id: str(l.id, 40) || Math.random().toString(36).slice(2, 10), name: str(l.name, 40) || 'Watchlist', items }
    })
  return lists.length ? lists : null
}

/** Copy watchlists from every portfolio on this device (read only; nothing in the portfolio changes). */
function migrate(): WatchList[] {
  const keys = ['wc-portfolio-v1']
  try {
    const ix = JSON.parse(localStorage.getItem('wc-portfolios') || 'null') as { list?: { id: string }[] } | null
    for (const p of ix?.list ?? []) if (p.id !== 'main') keys.push(`wc-portfolio-v1:${p.id}`)
  } catch { /* no index */ }
  const byName = new Map<string, WatchList>()
  for (const k of keys) {
    try {
      const d = JSON.parse(localStorage.getItem(k) || 'null') as { assets?: Record<string, Partial<WatchItem>>; watchlists?: { id: string; name: string; assets: string[] }[] } | null
      for (const w of d?.watchlists ?? []) {
        const name = str(w.name, 40) || 'Watchlist'
        const list = byName.get(name) ?? { id: str(w.id, 40) || name, name, items: [] }
        for (const key of w.assets ?? []) {
          const it = cleanItem({ ...(d?.assets?.[key] ?? {}), key })
          if (it && !list.items.some((x) => x.key === it.key)) list.items.push(it)
        }
        byName.set(name, list)
      }
    } catch { /* skip unreadable portfolio */ }
  }
  return byName.size ? [...byName.values()] : DEFAULT
}

export function loadWatchlists(): WatchList[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return clean(JSON.parse(raw)) ?? DEFAULT
    const lists = migrate()
    localStorage.setItem(KEY, JSON.stringify(lists))
    return lists
  } catch {
    return DEFAULT
  }
}

export function saveWatchlists(lists: WatchList[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lists))
  } catch { /* storage full or blocked */ }
  window.dispatchEvent(new Event(EVENT))
}

/** Live view of the shared watchlists; updates when another page or tab changes them. */
export function useWatchlists() {
  const [lists, setLists] = useState<WatchList[] | null>(null)
  useEffect(() => {
    const read = () => setLists(loadWatchlists())
    read()
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) read() }
    window.addEventListener(EVENT, read)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVENT, read)
      window.removeEventListener('storage', onStorage)
    }
  }, [])
  const set = (fn: (l: WatchList[]) => WatchList[]) => saveWatchlists(fn(structuredClone(lists ?? loadWatchlists())))
  const has = (key: string) => !!lists?.some((l) => l.items.some((i) => i.key === key))
  /** Star: add to the first list, or remove from every list. */
  const toggle = (item: WatchItem) =>
    set((ls) => {
      if (ls.some((l) => l.items.some((i) => i.key === item.key))) return ls.map((l) => ({ ...l, items: l.items.filter((i) => i.key !== item.key) }))
      const c = cleanItem(item)
      if (c) ls[0].items.push(c)
      return ls
    })
  return { lists, set, has, toggle }
}
