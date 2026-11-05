// Portfolio maths: holdings (average cost), P&L, daily value series, time-weighted returns,
// drawdown, volatility and diversification. All amounts are in the portfolio base currency.
import type { History } from './data'
import { priceAt } from './data'
import type { PortfolioData } from './store'

export type Holding = {
  key: string
  qty: number
  cost: number // remaining cost basis incl. fees
  avg: number
  realized: number
  price?: number
  value: number
  unrealized: number
  unrealizedPct: number
  weight: number
  change24h?: number
}

const DAY = 864e5
const today = () => Math.floor(Date.now() / DAY) * DAY
const dateMs = (d: string) => Date.parse(d + 'T00:00:00Z')

export function holdings(d: PortfolioData, prices: Record<string, number | undefined>, changes: Record<string, number | undefined> = {}): Holding[] {
  const m = new Map<string, Holding>()
  for (const t of d.txs) {
    let h = m.get(t.asset)
    if (!h) {
      h = { key: t.asset, qty: 0, cost: 0, avg: 0, realized: 0, value: 0, unrealized: 0, unrealizedPct: 0, weight: 0 }
      m.set(t.asset, h)
    }
    if (t.type === 'buy') {
      h.cost += t.qty * t.price + t.fee
      h.qty += t.qty
    } else {
      const q = Math.min(t.qty, h.qty)
      const avg = h.qty > 0 ? h.cost / h.qty : 0
      h.realized += q * t.price - t.fee - avg * q
      h.cost -= avg * q
      h.qty -= q
      if (h.qty < 1e-12) {
        h.qty = 0
        h.cost = 0
      }
    }
  }
  const list = [...m.values()]
  for (const h of list) {
    h.avg = h.qty > 0 ? h.cost / h.qty : 0
    h.price = prices[h.key]
    h.change24h = changes[h.key]
    h.value = h.price !== undefined ? h.qty * h.price : h.cost
    h.unrealized = h.price !== undefined ? h.value - h.cost : 0
    h.unrealizedPct = h.cost > 0 ? (h.unrealized / h.cost) * 100 : 0
  }
  const total = list.reduce((s, h) => s + h.value, 0)
  for (const h of list) h.weight = total > 0 ? h.value / total : 0
  return list.sort((a, b) => b.value - a.value)
}

export type Point = { t: number; value: number; flow: number; index: number }

/** Daily portfolio value for the last `days` days, with net cash flows and a time-weighted index. */
export function series(d: PortfolioData, hist: Record<string, History>, live: Record<string, number | undefined>, days = 365): Point[] {
  if (!d.txs.length) return []
  const end = today()
  const first = Math.max(dateMs(d.txs[0].date), end - days * DAY)
  const pts: Point[] = []
  const qty: Record<string, number> = {}
  let ti = 0
  // apply transactions before the window
  while (ti < d.txs.length && dateMs(d.txs[ti].date) < first) {
    const t = d.txs[ti++]
    qty[t.asset] = Math.max(0, (qty[t.asset] || 0) + (t.type === 'buy' ? t.qty : -t.qty))
  }
  let idx = 1
  let prevValue = 0
  for (let t = first; t <= end; t += DAY) {
    let flow = 0
    while (ti < d.txs.length && dateMs(d.txs[ti].date) <= t) {
      const x = d.txs[ti++]
      if (x.type === 'buy') {
        qty[x.asset] = (qty[x.asset] || 0) + x.qty
        flow += x.qty * x.price + x.fee
      } else {
        qty[x.asset] = Math.max(0, (qty[x.asset] || 0) - x.qty)
        flow -= x.qty * x.price - x.fee
      }
    }
    let value = 0
    for (const [k, q] of Object.entries(qty)) {
      if (!q) continue
      const p = t === end && live[k] !== undefined ? live[k] : priceAt(hist[k] || [], t) ?? live[k] ?? d.manualPrices[k]
      if (p !== undefined) value += q * p
    }
    if (prevValue > 0) {
      const r = (value - flow) / prevValue - 1
      if (isFinite(r)) idx *= 1 + r
    }
    pts.push({ t, value, flow, index: idx })
    prevValue = value
  }
  return pts
}

export type PeriodResult = { label: 'week' | 'month' | 'quarter' | 'year'; pct?: number; pnl?: number; sinceStart: boolean }

export function periods(pts: Point[]): PeriodResult[] {
  const spec: [PeriodResult['label'], number][] = [['week', 7], ['month', 30], ['quarter', 91], ['year', 365]]
  if (pts.length < 2) return spec.map(([label]) => ({ label, sinceStart: false }))
  const last = pts[pts.length - 1]
  const firstWithValue = pts.findIndex((p) => p.value > 0)
  return spec.map(([label, n]) => {
    let i = Math.max(0, pts.length - 1 - n)
    let sinceStart = false
    if (firstWithValue >= 0 && i < firstWithValue) {
      i = firstWithValue
      sinceStart = true
    }
    const start = pts[i]
    const flows = pts.slice(i + 1).reduce((s, p) => s + p.flow, 0)
    return { label, pct: start.index > 0 ? (last.index / start.index - 1) * 100 : undefined, pnl: last.value - start.value - flows, sinceStart }
  })
}

export function drawdown(pts: Point[]) {
  let peak = 0, maxDd = 0
  for (const p of pts) {
    if (p.value <= 0) continue
    peak = Math.max(peak, p.index)
    if (peak > 0) maxDd = Math.min(maxDd, p.index / peak - 1)
  }
  const last = pts[pts.length - 1]
  const current = last && peak > 0 ? last.index / peak - 1 : 0
  return { max: maxDd * 100, current: current * 100 }
}

export function volatility(pts: Point[], lookback = 90): number | undefined {
  const rs: number[] = []
  const s = pts.slice(-lookback - 1)
  for (let i = 1; i < s.length; i++) if (s[i - 1].value > 0 && s[i].value > 0) rs.push(s[i].index / s[i - 1].index - 1)
  if (rs.length < 10) return undefined
  const mean = rs.reduce((a, b) => a + b, 0) / rs.length
  const v = rs.reduce((a, b) => a + (b - mean) ** 2, 0) / (rs.length - 1)
  return Math.sqrt(v) * Math.sqrt(365) * 100
}

const STABLES = new Set(['USDT', 'USDC', 'DAI', 'FDUSD', 'TUSD', 'USDE', 'PYUSD', 'EURC', 'USDS', 'RLUSD'])

export function diversification(d: PortfolioData, hs: Holding[]) {
  const live = hs.filter((h) => h.value > 0)
  const total = live.reduce((s, h) => s + h.value, 0)
  const w = live.map((h) => h.value / (total || 1))
  const hhi = w.reduce((s, x) => s + x * x, 0)
  const byKind = { crypto: 0, stock: 0 }
  let stable = 0
  for (const h of live) {
    const a = d.assets[h.key]
    if (!a) continue
    byKind[a.kind] += h.value
    if (a.kind === 'crypto' && STABLES.has(a.symbol.toUpperCase())) stable += h.value
  }
  const sorted = [...w].sort((a, b) => b - a)
  return {
    positions: live.length,
    effective: hhi > 0 ? 1 / hhi : 0,
    largest: (sorted[0] || 0) * 100,
    top3: sorted.slice(0, 3).reduce((s, x) => s + x, 0) * 100,
    cryptoPct: total ? (byKind.crypto / total) * 100 : 0,
    stockPct: total ? (byKind.stock / total) * 100 : 0,
    stablePct: total ? (stable / total) * 100 : 0,
    total,
  }
}
