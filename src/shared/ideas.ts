// Trade ideas and saved analyses, on this device only (localStorage, wc-ideas-v1).
// An idea with levels can be recorded in the trading journal in one step (crypto/stock "units" mode);
// an idea without levels is a saved analysis: a note about an asset to come back to.
import { useEffect, useState } from 'react'

export type Idea = {
  id: string
  kind: 'crypto' | 'stock'
  assetId: string // CoinGecko id or Yahoo symbol
  symbol: string // ticker shown, e.g. BTC, AAPL
  name: string
  quote: string // price currency of the levels, e.g. USD
  direction?: 'buy' | 'sell'
  entry?: number
  sl?: number
  tp?: number
  qty?: number // coins or shares from the position-size calculator
  note?: string
  created: number
  status: 'open' | 'taken' | 'dropped'
  tradeId?: string
}

const KEY = 'wc-ideas-v1'
const EVENT = 'wc-ideas'
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined)

function clean(raw: unknown): Idea[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((x) => x && typeof x === 'object' && typeof x.id === 'string' && typeof x.symbol === 'string')
    .slice(0, 300)
    .map((x) => ({
      id: String(x.id).slice(0, 20),
      kind: x.kind === 'stock' ? 'stock' : 'crypto',
      assetId: String(x.assetId ?? '').slice(0, 80),
      symbol: String(x.symbol).slice(0, 20),
      name: String(x.name ?? x.symbol).slice(0, 80),
      quote: /^[A-Z]{3}$/.test(x.quote) ? x.quote : 'USD',
      direction: x.direction === 'sell' ? 'sell' : x.direction === 'buy' ? 'buy' : undefined,
      entry: num(x.entry),
      sl: num(x.sl),
      tp: num(x.tp),
      qty: num(x.qty),
      note: typeof x.note === 'string' ? x.note.slice(0, 2000) : undefined,
      created: Number(x.created) || Date.now(),
      status: x.status === 'taken' || x.status === 'dropped' ? x.status : 'open',
      tradeId: typeof x.tradeId === 'string' ? x.tradeId.slice(0, 40) : undefined,
    }))
}

export function loadIdeas(): Idea[] {
  try {
    return clean(JSON.parse(localStorage.getItem(KEY) || '[]'))
  } catch {
    return []
  }
}

export function saveIdeas(list: Idea[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch { /* storage full or blocked */ }
  window.dispatchEvent(new Event(EVENT))
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[] | null>(null)
  useEffect(() => {
    const read = () => setIdeas(loadIdeas())
    read()
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) read() }
    window.addEventListener(EVENT, read)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVENT, read)
      window.removeEventListener('storage', onStorage)
    }
  }, [])
  const set = (fn: (l: Idea[]) => Idea[]) => saveIdeas(fn(loadIdeas()))
  return { ideas, set }
}

export const newIdeaId = () => Math.random().toString(36).slice(2, 10)
/** Has levels, so it can become a journal trade. */
export const isTradeIdea = (i: Idea) => !!(i.entry && i.direction)
