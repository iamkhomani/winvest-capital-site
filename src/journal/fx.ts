// Instruments, pip values and currency conversion for the trading journal.
// Conversion rates: ECB reference rates via Frankfurter (daily, CORS). Live quotes for open
// trades: Yahoo Finance via the Winvest Cloudflare Worker. Results are cached in memory.
import { STOCK_API } from '../portfolio/data'

export type Instrument = { pair: string; base: string; quote: string; contract: number; pip: number }

const METALS: Record<string, { contract: number; pip: number }> = {
  XAU: { contract: 100, pip: 0.1 },
  XAG: { contract: 5000, pip: 0.01 },
  XPT: { contract: 100, pip: 0.1 },
}

export const LOT_UNITS = { standard: 1, mini: 0.1, micro: 0.01 } as const
export type LotUnit = keyof typeof LOT_UNITS

export const COMMON_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'USDCAD', 'AUDUSD', 'NZDUSD',
  'EURGBP', 'EURJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'EURNZD', 'GBPJPY', 'GBPCHF', 'GBPAUD', 'GBPCAD', 'GBPNZD',
  'AUDJPY', 'AUDCAD', 'AUDCHF', 'AUDNZD', 'CADJPY', 'CHFJPY', 'NZDJPY', 'NZDCAD', 'NZDCHF', 'CADCHF', 'XAUUSD', 'XAGUSD',
]

export function normPair(s: string): string {
  // "EUR/USD", "eurusd.pro", "EURUSDm" -> "EURUSD"
  return s.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)
}

export function instrument(pairRaw: string, contract?: number, pip?: number): Instrument {
  const pair = normPair(pairRaw)
  const base = pair.slice(0, 3)
  const quote = pair.slice(3, 6) || 'USD'
  const metal = METALS[base]
  return {
    pair,
    base,
    quote,
    contract: contract || metal?.contract || 100000,
    pip: pip || metal?.pip || (quote === 'JPY' ? 0.01 : 0.0001),
  }
}

export const pairLabel = (p: string) => (p.length === 6 ? `${p.slice(0, 3)}/${p.slice(3)}` : p)

/** Profit in the quote currency for a price move on `lots` standard lots. */
export function quotePnl(inst: Instrument, direction: 'buy' | 'sell', entry: number, exit: number, lots: number) {
  return (exit - entry) * (direction === 'buy' ? 1 : -1) * lots * inst.contract
}

export const pips = (inst: Instrument, direction: 'buy' | 'sell', entry: number, exit: number) => ((exit - entry) * (direction === 'buy' ? 1 : -1)) / inst.pip

// ---------------- rates ----------------
const mem = new Map<string, number>()
const ECB = new Set(['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'TRY', 'ZAR', 'MXN', 'SGD', 'HKD', 'CNY'])

/**
 * Rate to convert 1 unit of `from` into `to` on a date (YYYY-MM-DD, ECB reference rate) or latest.
 * Metals (XAU etc.) are not ECB currencies; P/L of XAUUSD is in USD, so they are never needed as `from`.
 */
export async function rate(from: string, to: string, date?: string): Promise<number> {
  if (from === to) return 1
  const k = `${from}${to}${date || 'latest'}`
  if (mem.has(k)) return mem.get(k)!
  if (!ECB.has(from) || !ECB.has(to)) throw new Error('unsupported currency')
  const today = new Date().toISOString().slice(0, 10)
  const d = !date || date >= today ? 'latest' : date
  const r = await fetch(`https://api.frankfurter.dev/v1/${d}?base=${from}&symbols=${to}`, { signal: AbortSignal.timeout(12000) })
  if (!r.ok) throw new Error(String(r.status))
  const j = await r.json()
  const v = j.rates?.[to]
  if (!(v > 0)) throw new Error('no rate')
  mem.set(k, v)
  return v
}

/** Live price of a pair (Yahoo Finance via the worker). */
export async function livePrice(pair: string): Promise<number> {
  const inst = instrument(pair)
  const sym = inst.base === 'XAU' ? 'GC=F' : inst.base === 'XAG' ? 'SI=F' : `${inst.pair}=X`
  const k = `live-${sym}`
  const r = await fetch(`${STOCK_API}/chart/${encodeURIComponent(sym)}?range=5d`, { signal: AbortSignal.timeout(12000) })
  if (!r.ok) throw new Error(String(r.status))
  const j = await r.json()
  const v = j?.chart?.result?.[0]?.meta?.regularMarketPrice
  if (!(v > 0)) throw new Error('no price')
  mem.set(k, v)
  return v
}
