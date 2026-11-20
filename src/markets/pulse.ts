// Crypto market data for the markets overview, the homepage and the coin pages.
// Free public APIs that allow browser requests: CoinGecko (prices, global data, trending) and
// alternative.me (Fear & Greed Index). CoinGecko's free tier has a low rate limit, so every request
// is shared: components that ask for the same data at the same time get the same promise, and a
// result is reused for a minute.
import { useEffect, useState } from 'react'

const CG = 'https://api.coingecko.com/api/v3'
const TTL = 60_000

export type Coin = {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_1h_in_currency?: number
  price_change_percentage_24h_in_currency?: number
  price_change_percentage_7d_in_currency?: number
  price_change_percentage_30d_in_currency?: number
  sparkline_in_7d?: { price: number[] }
}

export type Global = {
  totalMcap: number
  totalVolume: number
  mcapChange24h: number
  btcDominance: number
  ethDominance: number
}

export type FearGreed = { value: number; label: string; yesterday?: number }
export type Trending = { id: string; name: string; symbol: string; thumb: string; rank: number | null; change24h?: number }

const cache = new Map<string, { at: number; p: Promise<unknown> }>()

function shared<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL) return hit.p as Promise<T>
  const p = load().catch((e) => {
    cache.delete(key)
    throw e
  })
  cache.set(key, { at: Date.now(), p })
  return p
}

async function json<T>(url: string): Promise<T> {
  const r = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!r.ok) throw new Error(String(r.status))
  return (await r.json()) as T
}

/** Top 100 coins by market cap, with 1h, 24h, 7d and 30d change and a 7-day sparkline. */
export const topCoins = () =>
  shared('coins', () =>
    json<Coin[]>(`${CG}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d%2C30d`),
  )

export const globalData = () =>
  shared('global', async () => {
    const { data } = await json<{ data: { total_market_cap: { usd: number }; total_volume: { usd: number }; market_cap_change_percentage_24h_usd: number; market_cap_percentage: { btc: number; eth: number } } }>(`${CG}/global`)
    return {
      totalMcap: data.total_market_cap.usd,
      totalVolume: data.total_volume.usd,
      mcapChange24h: data.market_cap_change_percentage_24h_usd,
      btcDominance: data.market_cap_percentage.btc,
      ethDominance: data.market_cap_percentage.eth,
    } satisfies Global
  })

export const fearGreed = () =>
  shared('fng', async () => {
    const { data } = await json<{ data: { value: string; value_classification: string }[] }>('https://api.alternative.me/fng/?limit=2')
    return { value: Number(data[0].value), label: data[0].value_classification, yesterday: data[1] ? Number(data[1].value) : undefined } satisfies FearGreed
  })

export const trending = () =>
  shared('trending', async () => {
    const { coins } = await json<{ coins: { item: { id: string; name: string; symbol: string; thumb: string; market_cap_rank: number | null; data?: { price_change_percentage_24h?: { usd?: number } } } }[] }>(`${CG}/search/trending`)
    return coins.slice(0, 7).map(({ item }) => ({ id: item.id, name: item.name, symbol: item.symbol, thumb: item.thumb, rank: item.market_cap_rank, change24h: item.data?.price_change_percentage_24h?.usd })) satisfies Trending[]
  })

/** Loads data on the client, refreshes every minute while the tab is visible. */
export function useLive<T>(load: () => Promise<T>, everyMs = 60_000) {
  const [value, setValue] = useState<T | null>(null)
  const [error, setError] = useState(false)
  const [at, setAt] = useState<number | null>(null)
  useEffect(() => {
    let alive = true
    const run = () =>
      load().then(
        (v) => alive && (setValue(v), setError(false), setAt(Date.now())),
        () => alive && setError(true),
      )
    void run()
    const t = setInterval(() => !document.hidden && void run(), everyMs)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [load, everyMs])
  return { value, error, at }
}

// Stablecoins and wrapped or staked versions of other coins say nothing about altcoins versus Bitcoin.
const NOT_ALT = /usd|eur|dai$|^wbtc$|^cbbtc$|^weth$|^steth$|^wsteth$|^weeth$|^wbeth$|^reth$|^jitosol$|^msol$|^bnsol$|^lbtc$|^solvbtc$|^tbtc$|^xaut$|^paxg$|^buidl$/i
const NOT_ALT_NAME = /wrapped|staked|bridged|restaked|tokenized|liquid staking|money market|t-bills|treasur/i

/** Altcoins in the top 100 that are not stablecoins, wrapped or staked tokens, or gold tokens. */
export const realAlts = (coins: Coin[]) => coins.filter((c) => c.id !== 'bitcoin' && !NOT_ALT.test(c.symbol) && !NOT_ALT_NAME.test(c.name))

/**
 * Our own altcoin season reading: the share of the 50 largest real altcoins that did better than
 * Bitcoin over the last 30 days. Not the "Altcoin Season Index" from blockchaincenter.net (that one uses 90 days).
 */
export function altSeason(coins: Coin[]) {
  const btc = coins.find((c) => c.id === 'bitcoin')?.price_change_percentage_30d_in_currency
  if (btc === undefined) return null
  const alts = realAlts(coins)
    .filter((c) => c.price_change_percentage_30d_in_currency !== undefined && c.price_change_percentage_30d_in_currency !== null)
    .slice(0, 50)
  if (alts.length < 20) return null
  const beat = alts.filter((c) => (c.price_change_percentage_30d_in_currency as number) > btc).length
  return { score: Math.round((beat / alts.length) * 100), beat, total: alts.length }
}

export const usd = (v: number) => (v >= 1 ? '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '$' + v.toPrecision(4))
export const usdBig = (v: number) =>
  v >= 1e12 ? '$' + (v / 1e12).toFixed(2) + 'T' : v >= 1e9 ? '$' + (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? '$' + (v / 1e6).toFixed(1) + 'M' : '$' + Math.round(v).toLocaleString('en-US')
