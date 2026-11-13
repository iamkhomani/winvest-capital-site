// Closes open trades automatically when price reaches the stop loss or the take profit.
// Candles come from Biquote (free, CORS open): only the pair name is sent. The check walks the
// candles from the trade's open time and takes whichever level was reached first. When one
// candle reaches both levels, or the level could have been reached before the entry inside the
// first candle, the trade stays open and the user is asked to close it by hand.
import { instrument, quotePnl, rate } from './fx'
import { uid } from './types'
import type { Exit, ExitKind, Trade } from './types'

type Bar = { t: number; h: number; l: number }

// Finest candles first; Biquote keeps about a day of 5m, 9 days of 1h, 6 weeks of 4h, 500 days of 1d.
const FRAMES: [string, number][] = [['5m', 300], ['1h', 3600], ['4h', 14400], ['1d', 86400]]
const unsupported = new Set<string>()
const cache = new Map<string, { at: number; bars: Bar[] }>()
const CACHE_MS = 50_000

async function candles(symbol: string, interval: string): Promise<Bar[]> {
  const key = `${symbol}:${interval}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.bars
  const r = await fetch(`https://biquote.io/api/${encodeURIComponent(symbol)}/ohlc?interval=${interval}&limit=1000`, { signal: AbortSignal.timeout(12000) })
  if (r.status === 404 || r.status === 400) {
    unsupported.add(symbol)
    throw new Error('unsupported')
  }
  if (!r.ok) throw new Error(String(r.status))
  const j = await r.json()
  const bars: Bar[] = (Array.isArray(j?.bars) ? j.bars : [])
    .map((b: { openTime: string; high: number; low: number }) => ({ t: Date.parse(b.openTime) / 1000, h: Number(b.high), l: Number(b.low) }))
    .filter((b: Bar) => isFinite(b.t) && isFinite(b.h) && isFinite(b.l))
    .sort((a: Bar, b: Bar) => a.t - b.t)
  cache.set(key, { at: Date.now(), bars })
  return bars
}

export type AutoOutcome =
  | { kind: 'closed'; trade: Trade; exit: Exit }
  | { kind: 'check'; trade: Trade }
  | { kind: 'none' }

const openLots = (t: Trade) => t.lots - t.exits.reduce((s, e) => s + e.lots, 0)

/** The take profit that closes the whole position: the furthest one in the trade's direction. */
export function finalTp(t: Trade): number | undefined {
  const tps = t.tps.filter((x) => x > 0)
  if (!tps.length) return undefined
  return t.direction === 'buy' ? Math.max(...tps) : Math.min(...tps)
}

/** Stop loss in force at a moment, after any recorded moves. */
function stopAt(t: Trade, sec: number): number | undefined {
  let sl = t.sl
  for (const m of [...t.slMoves].sort((a, b) => a.time.localeCompare(b.time))) {
    if (Date.parse(m.time) / 1000 <= sec) sl = m.price
  }
  return sl
}

export async function checkTrade(t: Trade, accountCurrency: string): Promise<AutoOutcome> {
  const remaining = openLots(t)
  const tp = finalTp(t)
  const inst = instrument(t.pair)
  if (remaining <= 1e-9 || (!(t.sl && t.sl > 0) && tp === undefined) || unsupported.has(inst.pair)) return { kind: 'none' }
  const lastExit = t.exits.reduce((m, e) => (e.time > m ? e.time : m), t.openTime)
  const since = Date.parse(lastExit) / 1000
  if (!isFinite(since) || since > Date.now() / 1000) return { kind: 'none' }

  let bars: Bar[] = []
  let seconds = 0
  for (const [interval, sec] of FRAMES) {
    bars = await candles(inst.pair, interval)
    seconds = sec
    if (bars.length && bars[0].t <= since) break
  }
  const buy = t.direction === 'buy'
  for (const b of bars) {
    if (b.t + seconds <= since) continue
    const sl = stopAt(t, Math.max(b.t, since))
    const slHit = sl !== undefined && sl > 0 && (buy ? b.l <= sl : b.h >= sl)
    const tpHit = tp !== undefined && (buy ? b.h >= tp : b.l <= tp)
    if (!slHit && !tpHit) continue
    // Inside the candle that holds the entry, a coarse candle may include prices from before it.
    const firstCandle = b.t <= since
    if ((slHit && tpHit) || (firstCandle && seconds > 300)) return { kind: 'check', trade: t }
    const price = slHit ? sl! : tp!
    const time = new Date(Math.max(b.t, since) * 1000).toISOString()
    let kindOf: ExitKind = slHit ? 'sl' : 'tp'
    if (slHit && Math.abs(price - t.entry) <= inst.pip / 2) kindOf = 'be'
    const conv = await rate(inst.quote, accountCurrency, time.slice(0, 10)).catch(() => NaN)
    if (!isFinite(conv)) return { kind: 'none' }
    const exit: Exit = { id: uid(), time, price, lots: remaining, kind: kindOf, pnl: +(quotePnl(inst, t.direction, t.entry, price, remaining) * conv).toFixed(2), pnlSource: 'calc', auto: true }
    return { kind: 'closed', trade: t, exit }
  }
  return { kind: 'none' }
}
