// Live and historical prices for the portfolio tracker.
// Crypto: CoinGecko (public API, CORS). Stocks/ETFs/FX: Yahoo Finance via the Winvest Cloudflare Worker.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEFI_PROXY_URL } from '../config'
import type { Asset, Currency } from './store'

export const STOCK_API = (DEFI_PROXY_URL || 'https://winvest-defi-proxy.helijl.workers.dev') + '/stock'
const CG = 'https://api.coingecko.com/api/v3'

export type Quote = { price: number; change24h?: number; image?: string; currency?: string; stale?: boolean }
export type History = [number, number][] // [unix ms (UTC midnight), price in base currency]

async function getJson(url: string): Promise<any> {
  const r = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!r.ok) throw new Error(String(r.status))
  return r.json()
}

const day = (ms: number) => Math.floor(ms / 864e5) * 864e5

// ---- small localStorage cache for history (prices only, no portfolio data) ----
function cacheGet<T>(k: string, maxAgeMs: number): T | null {
  try {
    const raw = localStorage.getItem('wc-pc-' + k)
    if (!raw) return null
    const { t, v } = JSON.parse(raw)
    return Date.now() - t < maxAgeMs ? (v as T) : null
  } catch {
    return null
  }
}
function cacheSet(k: string, v: unknown) {
  try {
    localStorage.setItem('wc-pc-' + k, JSON.stringify({ t: Date.now(), v }))
  } catch {
    /* full or blocked: ignore */
  }
}

// ---- FX: convert a stock's trading currency to the base currency ----
function normCurrency(c?: string): { cur: string; div: number } {
  if (!c) return { cur: 'USD', div: 1 }
  if (c === 'GBp' || c === 'GBX') return { cur: 'GBP', div: 100 }
  if (c === 'ZAc') return { cur: 'ZAR', div: 100 }
  if (c === 'ILA') return { cur: 'ILS', div: 100 }
  return { cur: c.toUpperCase(), div: 1 }
}

async function yahooChart(symbol: string, range: '5d' | '1y'): Promise<any> {
  const j = await getJson(`${STOCK_API}/chart/${encodeURIComponent(symbol)}?range=${range}`)
  const res = j?.chart?.result?.[0]
  if (!res) throw new Error('no data')
  return res
}

async function fxNow(from: string, base: Currency): Promise<number> {
  if (from === base) return 1
  const k = `fx-${from}${base}`
  const c = cacheGet<number>(k, 30 * 60e3)
  if (c) return c
  const res = await yahooChart(`${from}${base}=X`, '5d')
  const v = res.meta.regularMarketPrice as number
  cacheSet(k, v)
  return v
}

async function fxHistory(from: string, base: Currency): Promise<History> {
  if (from === base) return []
  const k = `fxh-${from}${base}`
  const c = cacheGet<History>(k, 6 * 3600e3)
  if (c) return c
  const h = toHistory(await yahooChart(`${from}${base}=X`, '1y'), 1)
  cacheSet(k, h)
  return h
}

function toHistory(res: any, mult: number): History {
  const ts: number[] = res.timestamp || []
  const cl: (number | null)[] = res.indicators?.quote?.[0]?.close || []
  const out: History = []
  ts.forEach((t, i) => {
    const v = cl[i]
    if (v !== null && v !== undefined && isFinite(v)) out.push([day(t * 1000), v * mult])
  })
  return out
}

export function priceAt(h: History, t: number): number | undefined {
  if (!h.length) return undefined
  if (t <= h[0][0]) return h[0][1]
  let lo = 0, hi = h.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (h[mid][0] <= t) lo = mid
    else hi = mid - 1
  }
  return h[lo][1]
}

// ---- Quotes ----
export async function quotes(assets: Asset[], base: Currency): Promise<Record<string, Quote>> {
  const out: Record<string, Quote> = {}
  const crypto = assets.filter((a) => a.kind === 'crypto')
  const stocks = assets.filter((a) => a.kind === 'stock')
  const jobs: Promise<void>[] = []
  if (crypto.length) {
    jobs.push(
      getJson(`${CG}/coins/markets?vs_currency=${base.toLowerCase()}&ids=${crypto.map((a) => encodeURIComponent(a.id)).join(',')}&price_change_percentage=24h&per_page=250`)
        .then((rows: any[]) => {
          for (const r of rows) {
            const a = crypto.find((x) => x.id === r.id)
            if (a && r.current_price !== null) out[a.key] = { price: r.current_price, change24h: r.price_change_percentage_24h_in_currency ?? r.price_change_percentage_24h, image: r.image }
          }
        })
        .catch(() => undefined),
    )
  }
  for (const a of stocks) {
    jobs.push(
      (async () => {
        try {
          const res = await yahooChart(a.id, '5d')
          const { cur, div } = normCurrency(res.meta.currency)
          const fx = await fxNow(cur, base)
          const p = (res.meta.regularMarketPrice / div) * fx
          const prev = res.meta.chartPreviousClose ?? res.meta.previousClose
          const closes = toHistory(res, 1)
          const prevClose = closes.length >= 2 ? closes[closes.length - 2][1] : prev
          out[a.key] = { price: p, change24h: prevClose ? (res.meta.regularMarketPrice / prevClose - 1) * 100 : undefined, currency: res.meta.currency }
        } catch {
          /* no live price: the UI falls back to the manual price */
        }
      })(),
    )
  }
  await Promise.all(jobs)
  // keep the last known prices, so a rate-limited or unreachable source does not blank the portfolio
  const last = cacheGet<Record<string, Quote>>(`q-${base}`, 7 * 864e5) || {}
  for (const a of assets) {
    if (out[a.key]) last[a.key] = out[a.key]
    else if (last[a.key]) out[a.key] = { ...last[a.key], stale: true }
  }
  cacheSet(`q-${base}`, last)
  return out
}

// ---- History (1 year, daily, in base currency) ----
export async function history(a: Asset, base: Currency): Promise<History> {
  const k = `h-${base}-${a.key}`
  const c = cacheGet<History>(k, 6 * 3600e3)
  if (c) return c
  let h: History = []
  if (a.kind === 'crypto') {
    const j = await getJson(`${CG}/coins/${encodeURIComponent(a.id)}/market_chart?vs_currency=${base.toLowerCase()}&days=365&interval=daily`)
    const seen = new Map<number, number>()
    for (const [t, p] of j.prices as [number, number][]) seen.set(day(t), p)
    h = [...seen.entries()].sort((x, y) => x[0] - y[0])
  } else {
    const res = await yahooChart(a.id, '1y')
    const { cur, div } = normCurrency(res.meta.currency)
    const raw = toHistory(res, 1 / div)
    if (cur === base) h = raw
    else {
      const fxh = await fxHistory(cur, base).catch(() => [] as History)
      const fxn = fxh.length ? 0 : await fxNow(cur, base)
      h = raw.map(([t, p]) => [t, p * (priceAt(fxh, t) ?? fxn)])
    }
  }
  cacheSet(k, h)
  return h
}

// ---- Search ----
export type Found = Asset & { rank?: number; exchange?: string; type?: string }

export async function searchCrypto(q: string): Promise<Found[]> {
  const j = await getJson(`${CG}/search?query=${encodeURIComponent(q)}`)
  return ((j.coins || []) as any[]).slice(0, 10).map((c) => ({
    key: `crypto:${c.id}`, kind: 'crypto' as const, symbol: String(c.symbol).toUpperCase(), name: c.name, id: c.id, image: c.thumb, rank: c.market_cap_rank,
  }))
}

export async function searchStock(q: string): Promise<Found[]> {
  const j = await getJson(`${STOCK_API}/search?q=${encodeURIComponent(q)}`)
  return ((j.quotes || []) as any[])
    .filter((x) => ['EQUITY', 'ETF', 'INDEX', 'MUTUALFUND'].includes(x.quoteType))
    .slice(0, 10)
    .map((x) => ({
      key: `stock:${x.symbol}`, kind: 'stock' as const, symbol: x.symbol, name: x.shortname || x.longname || x.symbol, id: x.symbol, exchange: x.exchDisp, type: x.quoteType,
    }))
}
