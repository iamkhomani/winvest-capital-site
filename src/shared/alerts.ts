// Price alerts on the shared watchlist. Stored on this device only (localStorage, wc-alerts-v1).
// Checked by AlertWatcher (mounted in the layout) while a Winvest tab or the installed app is open;
// a closed browser cannot be woken without a server, and alerts stay off our servers (decision 40).
import { useEffect, useState } from 'react'
import type { Currency } from '../portfolio/store'

export type AlertKind = 'above' | 'below' | 'move'
export type PriceAlert = {
  id: string
  key: string // asset key, e.g. crypto:bitcoin, stock:ASML.AS
  kind: 'crypto' | 'stock'
  assetId: string
  symbol: string
  name: string
  type: AlertKind
  value: number // a price (above/below, in `currency`) or a percentage (move in 24h, both directions)
  currency: Currency
  created: number
  fired?: number // last time it went off
  seen?: boolean // the user has seen the fired alert
  active: boolean
}

const KEY = 'wc-alerts-v1'
const EVENT = 'wc-alerts'

function clean(raw: unknown): PriceAlert[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((a) => a && typeof a === 'object' && typeof a.id === 'string' && typeof a.key === 'string' && /^(crypto|stock):/.test(a.key) && ['above', 'below', 'move'].includes(a.type) && Number.isFinite(a.value) && a.value > 0)
    .slice(0, 200)
    .map((a) => ({
      id: String(a.id).slice(0, 20),
      key: String(a.key).slice(0, 80),
      kind: String(a.key).startsWith('stock:') ? 'stock' : 'crypto',
      assetId: String(a.assetId ?? a.key.split(':')[1]).slice(0, 80),
      symbol: String(a.symbol ?? '').slice(0, 20),
      name: String(a.name ?? '').slice(0, 80),
      type: a.type,
      value: Number(a.value),
      currency: a.currency === 'USD' ? 'USD' : 'EUR',
      created: Number(a.created) || Date.now(),
      fired: Number(a.fired) || undefined,
      seen: !!a.seen,
      active: a.active !== false,
    }))
}

export function loadAlerts(): PriceAlert[] {
  try {
    return clean(JSON.parse(localStorage.getItem(KEY) || '[]'))
  } catch {
    return []
  }
}

export function saveAlerts(list: PriceAlert[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch { /* storage full or blocked */ }
  window.dispatchEvent(new Event(EVENT))
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[] | null>(null)
  useEffect(() => {
    const read = () => setAlerts(loadAlerts())
    read()
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) read() }
    window.addEventListener(EVENT, read)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVENT, read)
      window.removeEventListener('storage', onStorage)
    }
  }, [])
  const set = (fn: (l: PriceAlert[]) => PriceAlert[]) => saveAlerts(fn(loadAlerts()))
  return { alerts, set }
}

/** Does this alert go off at this price / 24h change? One-shot for price levels; a move alert once per 24h. */
export function hits(a: PriceAlert, price: number, change24h: number | undefined, now = Date.now()): boolean {
  if (!a.active) return false
  if (a.type === 'above') return price >= a.value
  if (a.type === 'below') return price <= a.value
  return change24h !== undefined && Math.abs(change24h) >= a.value && (!a.fired || now - a.fired > 864e5)
}

export const newAlertId = () => Math.random().toString(36).slice(2, 10)
