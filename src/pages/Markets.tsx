import { useEffect, useMemo, useState } from 'react'
import TradingViewWidget from '../components/TradingViewWidget'
import { DISCORD_URL } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'

export const marketsCopy = {
  en: {
    metaTitle: 'Markets: top 50 crypto and popular stocks, live | Winvest Capital',
    description: 'Live overview of the top 50 cryptocurrencies by market cap and the most popular stocks and indices. Prices, 1h, 24h and 7d change, market cap, volume and a stock heatmap.',
    h1: 'Markets',
    intro: 'Live prices of the top 50 cryptocurrencies and the most popular stocks and indices. Crypto data refreshes every minute.',
    crypto: 'Top 50 crypto',
    stocks: 'Stocks',
    filter: 'Filter by name or ticker',
    cols: { name: 'Name', price: 'Price', h1: '1h', h24: '24h', d7: '7d', mcap: 'Market cap', vol: 'Volume 24h', chart: 'Last 7 days' },
    loading: 'Loading live prices…',
    error: 'Prices could not be loaded right now. Please try again in a minute.',
    updated: (t: string) => `Updated ${t} · data: CoinGecko`,
    scan: 'Scan',
    stocksH: 'Popular stocks and indices',
    heatH: 'S&P 500 heatmap',
    heatP: 'Size = market cap, colour = change today. Hover or tap a block for details.',
    cHeatH: 'Crypto heatmap',
    cHeatP: 'Size = market cap, colour = change over the last 24 hours. Hover or tap a block for details, scroll to zoom.',
    note: 'Prices are indicative and can be delayed. Nothing on this page is financial advice.',
    ctaH: 'Want to know what we are watching?',
    ctaP: 'Market Whisper AI posts news and FX calendar events in the free Discord. One Percent Club members also get market and fundamental analysis.',
    ctaBtn: 'Join the free Discord',
  },
  nl: {
    metaTitle: 'Markten: top 50 crypto en populaire aandelen, live | Winvest Capital',
    description: 'Live overzicht van de top 50 cryptocurrencies op market cap en de populairste aandelen en indices. Prijzen, verandering over 1u, 24u en 7d, market cap, volume en een aandelen-heatmap.',
    h1: 'Markten',
    intro: 'Live prijzen van de top 50 cryptocurrencies en de populairste aandelen en indices. De cryptodata wordt elke minuut ververst.',
    crypto: 'Top 50 crypto',
    stocks: 'Aandelen',
    filter: 'Filter op naam of ticker',
    cols: { name: 'Naam', price: 'Prijs', h1: '1u', h24: '24u', d7: '7d', mcap: 'Market cap', vol: 'Volume 24u', chart: 'Laatste 7 dagen' },
    loading: 'Live prijzen laden…',
    error: 'De prijzen konden nu niet worden geladen. Probeer het over een minuut opnieuw.',
    updated: (t: string) => `Bijgewerkt ${t} · data: CoinGecko`,
    scan: 'Scan',
    stocksH: 'Populaire aandelen en indices',
    heatH: 'S&P 500-heatmap',
    heatP: 'Grootte = market cap, kleur = verandering vandaag. Beweeg of tik op een blok voor details.',
    cHeatH: 'Crypto-heatmap',
    cHeatP: 'Grootte = market cap, kleur = verandering over de laatste 24 uur. Beweeg of tik op een blok voor details, scroll om in te zoomen.',
    note: 'Prijzen zijn indicatief en kunnen vertraagd zijn. Niets op deze pagina is financieel advies.',
    ctaH: 'Benieuwd waar wij naar kijken?',
    ctaP: 'Market Whisper AI deelt nieuws en FX-kalenderevents in de gratis Discord. Leden van de One Percent Club krijgen ook markt- en fundamentele analyse.',
    ctaBtn: 'Word gratis lid van de Discord',
  },
}

type Coin = {
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
  sparkline_in_7d?: { price: number[] }
}

const API = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d'

const price = (v: number) => (v >= 1 ? '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '$' + v.toPrecision(4))
const big = (v: number) => (v >= 1e12 ? '$' + (v / 1e12).toFixed(2) + 'T' : v >= 1e9 ? '$' + (v / 1e9).toFixed(2) + 'B' : '$' + (v / 1e6).toFixed(1) + 'M')
function Pct({ v }: { v?: number }) {
  if (v === undefined || v === null) return <span className="text-white/35">–</span>
  return <span className={v >= 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]'}>{v >= 0 ? '+' : ''}{v.toFixed(2)}%</span>
}

function Spark({ data }: { data?: number[] }) {
  if (!data || data.length < 2) return null
  const pts = data.filter((_, i) => i % 3 === 0)
  const min = Math.min(...pts), max = Math.max(...pts), w = 110, h = 32
  const d = pts.map((p, i) => `${((i / (pts.length - 1)) * w).toFixed(1)},${(h - ((p - min) / (max - min || 1)) * h).toFixed(1)}`).join(' ')
  const up = pts[pts.length - 1] >= pts[0]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true" className="inline-block">
      <polyline points={d} fill="none" stroke={up ? '#34d399' : '#ff4d4d'} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function CryptoTable({ lang }: { lang: Lang }) {
  const c = marketsCopy[lang]
  const [coins, setCoins] = useState<Coin[] | null>(null)
  const [error, setError] = useState(false)
  const [updated, setUpdated] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const r = await fetch(API, { signal: AbortSignal.timeout(15000) })
        if (!r.ok) throw new Error(String(r.status))
        const data = (await r.json()) as Coin[]
        if (!alive) return
        setCoins(data)
        setError(false)
        setUpdated(new Date().toLocaleTimeString(lang === 'nl' ? 'nl-NL' : 'en-GB', { hour: '2-digit', minute: '2-digit' }))
      } catch {
        if (alive) setError(true)
      }
    }
    void load()
    const t = setInterval(() => { if (!document.hidden) void load() }, 60000)
    return () => { alive = false; clearInterval(t) }
  }, [lang])

  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase()
    return (coins || []).filter((x) => !f || x.name.toLowerCase().includes(f) || x.symbol.toLowerCase().includes(f))
  }, [coins, filter])

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={c.filter}
          aria-label={c.filter}
          className="w-full max-w-xs rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm outline-none placeholder:text-white/35 focus:border-[var(--wc-red)]"
        />
        {updated ? <span className="text-xs text-white/45">{c.updated(updated)}</span> : null}
      </div>
      {error && !coins ? <p className="mt-6 text-[var(--wc-red-soft)]">{c.error}</p> : null}
      {!coins && !error ? <p className="mt-6 text-white/60">{c.loading}</p> : null}
      {coins ? (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-white/[0.04] text-left text-xs text-white/50">
              <tr>
                <th className="hidden px-3 py-2.5 font-medium sm:table-cell">#</th>
                <th className="px-3 py-2.5 font-medium">{c.cols.name}</th>
                <th className="px-3 py-2.5 text-right font-medium">{c.cols.price}</th>
                <th className="hidden px-3 py-2.5 text-right font-medium sm:table-cell">{c.cols.h1}</th>
                <th className="px-3 py-2.5 text-right font-medium">{c.cols.h24}</th>
                <th className="px-3 py-2.5 text-right font-medium">{c.cols.d7}</th>
                <th className="hidden px-3 py-2.5 text-right font-medium md:table-cell">{c.cols.mcap}</th>
                <th className="hidden px-3 py-2.5 text-right font-medium lg:table-cell">{c.cols.vol}</th>
                <th className="hidden px-3 py-2.5 text-right font-medium md:table-cell">{c.cols.chart}</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {shown.map((x) => (
                <tr key={x.id} className="hover:bg-white/[0.03]">
                  <td className="hidden px-3 py-2.5 text-white/45 sm:table-cell">{x.market_cap_rank}</td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2.5">
                      <img src={x.image} alt="" width={22} height={22} loading="lazy" className="size-[22px] rounded-full" />
                      <span className="font-semibold">{x.name}</span>
                      <span className="hidden text-xs uppercase text-white/45 sm:inline">{x.symbol}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{price(x.current_price)}</td>
                  <td className="hidden px-3 py-2.5 text-right tabular-nums sm:table-cell"><Pct v={x.price_change_percentage_1h_in_currency} /></td>
                  <td className="px-3 py-2.5 text-right tabular-nums"><Pct v={x.price_change_percentage_24h_in_currency} /></td>
                  <td className="px-3 py-2.5 text-right tabular-nums"><Pct v={x.price_change_percentage_7d_in_currency} /></td>
                  <td className="hidden px-3 py-2.5 text-right tabular-nums text-white/70 md:table-cell">{big(x.market_cap)}</td>
                  <td className="hidden px-3 py-2.5 text-right tabular-nums text-white/70 lg:table-cell">{big(x.total_volume)}</td>
                  <td className="hidden px-3 py-1 text-right md:table-cell"><Spark data={x.sparkline_in_7d?.price} /></td>
                  <td className="px-3 py-2.5 text-right">
                    <a href={`${paths[lang].scanner}?q=${encodeURIComponent(x.symbol.toUpperCase())}`} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/70 hover:border-[var(--wc-red)] hover:text-white">{c.scan}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}

const STOCK_GROUPS = [
  {
    name: 'Indices',
    symbols: [
      { name: 'FOREXCOM:SPXUSD', displayName: 'S&P 500' },
      { name: 'FOREXCOM:NSXUSD', displayName: 'Nasdaq 100' },
      { name: 'FOREXCOM:DJI', displayName: 'Dow Jones' },
      { name: 'INDEX:DEU40', displayName: 'DAX' },
      { name: 'EURONEXT:AEX', displayName: 'AEX' },
    ],
  },
  {
    name: 'US',
    symbols: [
      { name: 'NASDAQ:NVDA', displayName: 'Nvidia' },
      { name: 'NASDAQ:AAPL', displayName: 'Apple' },
      { name: 'NASDAQ:MSFT', displayName: 'Microsoft' },
      { name: 'NASDAQ:GOOGL', displayName: 'Alphabet' },
      { name: 'NASDAQ:AMZN', displayName: 'Amazon' },
      { name: 'NASDAQ:META', displayName: 'Meta' },
      { name: 'NASDAQ:AVGO', displayName: 'Broadcom' },
      { name: 'NASDAQ:TSLA', displayName: 'Tesla' },
      { name: 'NYSE:BRK.B', displayName: 'Berkshire Hathaway' },
      { name: 'NYSE:JPM', displayName: 'JPMorgan' },
      { name: 'NASDAQ:NFLX', displayName: 'Netflix' },
      { name: 'NASDAQ:PLTR', displayName: 'Palantir' },
      { name: 'NASDAQ:MSTR', displayName: 'Strategy (MicroStrategy)' },
      { name: 'NASDAQ:COIN', displayName: 'Coinbase' },
    ],
  },
  {
    name: 'Europe',
    symbols: [
      { name: 'EURONEXT:ASML', displayName: 'ASML' },
      { name: 'XETR:SAP', displayName: 'SAP' },
      { name: 'EURONEXT:MC', displayName: 'LVMH' },
      { name: 'LSE:SHEL', displayName: 'Shell' },
      { name: 'EURONEXT:ADYEN', displayName: 'Adyen' },
    ],
  },
]

export default function Markets({ lang }: { lang: Lang }) {
  const c = marketsCopy[lang]
  const [tab, setTab] = useState<'crypto' | 'stocks'>('crypto')
  useEffect(() => {
    if (location.hash === '#stocks') setTab('stocks')
  }, [])
  const tv = lang === 'nl' ? 'nl_NL' : 'en'
  const tabCls = (on: boolean) => `rounded-full px-5 py-2 text-sm font-semibold transition ${on ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/15 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-white/45">
          <a href={paths[lang].home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span> {c.h1}
        </nav>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/70">{c.intro}</p>

        <div role="tablist" className="mt-8 inline-flex rounded-full border border-white/15 p-1">
          <button role="tab" aria-selected={tab === 'crypto'} type="button" onClick={() => { setTab('crypto'); history.replaceState(null, '', '#crypto') }} className={tabCls(tab === 'crypto')}>{c.crypto}</button>
          <button role="tab" aria-selected={tab === 'stocks'} type="button" onClick={() => { setTab('stocks'); history.replaceState(null, '', '#stocks') }} className={tabCls(tab === 'stocks')}>{c.stocks}</button>
        </div>

        <div className="mt-6">
          {tab === 'crypto' ? (
            <>
              <h2 className="text-2xl font-bold tracking-tight">{c.cHeatH}</h2>
              <p className="mt-2 text-sm text-white/55">{c.cHeatP}</p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                <TradingViewWidget
                  className="h-[520px]"
                  script="embed-widget-crypto-coins-heatmap.js"
                  config={{ dataSource: 'Crypto', blockSize: 'market_cap_calc', blockColor: 'change', locale: tv, colorTheme: 'dark', hasTopBar: false, isDataSetEnabled: false, isZoomEnabled: true, hasSymbolTooltip: true, isMonoSize: false, width: '100%', height: 520 }}
                />
              </div>
              <h2 className="mt-10 mb-4 text-2xl font-bold tracking-tight">{c.crypto}</h2>
              <CryptoTable lang={lang} />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold tracking-tight">{c.stocksH}</h2>
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                <TradingViewWidget
                  className="h-[560px]"
                  script="embed-widget-market-quotes.js"
                  config={{ width: '100%', height: 560, symbolsGroups: STOCK_GROUPS.map((g) => ({ ...g, name: lang === 'nl' ? ({ US: 'VS', Europe: 'Europa' } as Record<string, string>)[g.name] ?? g.name : g.name })), showSymbolLogo: true, isTransparent: true, colorTheme: 'dark', locale: tv }}
                />
              </div>
              <h2 className="mt-10 text-2xl font-bold tracking-tight">{c.heatH}</h2>
              <p className="mt-2 text-sm text-white/55">{c.heatP}</p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                <TradingViewWidget
                  className="h-[520px]"
                  script="embed-widget-stock-heatmap.js"
                  config={{ dataSource: 'SPX500', grouping: 'sector', blockSize: 'market_cap_basic', blockColor: 'change', locale: tv, colorTheme: 'dark', hasTopBar: false, isDataSetEnabled: false, isZoomEnabled: true, hasSymbolTooltip: true, isMonoSize: false, width: '100%', height: 520 }}
                />
              </div>
            </>
          )}
        </div>

        <p className="mt-8 text-sm text-white/45">{c.note}</p>

        <aside className="mt-10 max-w-3xl rounded-2xl border border-[var(--wc-red)]/50 bg-gradient-to-b from-[var(--wc-red)]/15 to-white/[0.02] p-6 sm:p-8">
          <h2 className="text-xl font-bold">{c.ctaH}</h2>
          <p className="mt-2 text-white/70">{c.ctaP}</p>
          <a href={DISCORD_URL} className="mt-5 inline-block rounded-full bg-[var(--wc-red)] px-5 py-2.5 font-semibold text-white transition hover:brightness-110">{c.ctaBtn}</a>
        </aside>
      </div>
    </main>
  )
}
