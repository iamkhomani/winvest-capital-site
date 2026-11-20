// Market analysis on the Markets page, closed by default (progressive disclosure). Opens to:
// sector performance and market breadth (both computed from the top-100 data the overview already loads,
// plus the weekly sector snapshot), stablecoin supply (DefiLlama, loaded only when opened) and the
// history of total market cap and dominance (TradingView). No new paid sources, no extra CoinGecko calls.
import { useEffect, useMemo, useState } from 'react'
import TradingViewWidget from '../components/TradingViewWidget'
import { cardBase, tabCls } from '../components/kit'
import type { Lang } from '../i18n'
import DataStamp, { LoadState } from './DataStamp'
import { realAlts, topCoins, useLive, usdBig } from './pulse'
import type { Coin } from './pulse'

const SECTOR: Record<Lang, Record<string, string>> = {
  en: { l1: 'Layer 1', l2: 'Layer 2', defi: 'DeFi', meme: 'Meme coins', exchange: 'Exchange tokens', ai: 'AI', privacy: 'Privacy', infra: 'Infrastructure', rwa: 'Real-world assets', other: 'Other' },
  nl: { l1: 'Layer 1', l2: 'Layer 2', defi: 'DeFi', meme: 'Meme coins', exchange: 'Exchange-tokens', ai: 'AI', privacy: 'Privacy', infra: 'Infrastructuur', rwa: 'Real-world assets', other: 'Overig' },
}

const copy = {
  en: {
    summary: 'Market analysis',
    summaryP: 'Sectors, breadth, stablecoin supply and history',
    sectors: 'Sector performance',
    sectorsP: 'Market-cap-weighted change of the coins per sector in the top 100. Stablecoins left out.',
    coins: (n: number) => `${n} coin${n === 1 ? '' : 's'}`,
    breadth: 'Market breadth',
    breadthP: 'How many of the largest coins take part in the move. A rise carried by only a few large coins is weaker than a broad one.',
    up24: 'Up in 24 hours',
    up7: 'Up in 7 days',
    aboveAvg: 'Above their 7-day average',
    of: (a: number, b: number) => `${a} of ${b}`,
    stable: 'Stablecoin supply',
    stableP: 'Total value of all dollar stablecoins. Rising supply usually means more money waiting on the sidelines of crypto; falling supply means money leaving.',
    history: 'History',
    historyP: 'Total crypto market cap, the market without Bitcoin, and Bitcoin dominance over time.',
    total: 'Total market cap',
    total2: 'Without Bitcoin',
    dom: 'Bitcoin dominance',
    calc: 'our calculation on CoinGecko data',
    sectorSrc: 'sectors: CoinGecko categories',
    note: 'Educational only, not financial advice.',
  },
  nl: {
    summary: 'Marktanalyse',
    summaryP: 'Sectoren, breedte, stablecoin-voorraad en historie',
    sectors: 'Prestaties per sector',
    sectorsP: 'Naar market cap gewogen verandering van de munten per sector in de top 100. Stablecoins tellen niet mee.',
    coins: (n: number) => `${n} munt${n === 1 ? '' : 'en'}`,
    breadth: 'Marktbreedte',
    breadthP: 'Hoeveel van de grootste munten doen mee met de beweging. Een stijging die door een paar grote munten wordt gedragen, is zwakker dan een brede.',
    up24: 'Gestegen in 24 uur',
    up7: 'Gestegen in 7 dagen',
    aboveAvg: 'Boven hun gemiddelde van 7 dagen',
    of: (a: number, b: number) => `${a} van ${b}`,
    stable: 'Stablecoin-voorraad',
    stableP: 'Totale waarde van alle dollar-stablecoins. Een groeiende voorraad betekent meestal meer geld dat klaarstaat in crypto; een krimpende voorraad betekent geld dat vertrekt.',
    history: 'Historie',
    historyP: 'Totale crypto-market cap, de markt zonder Bitcoin, en de Bitcoin-dominantie door de tijd.',
    total: 'Totale market cap',
    total2: 'Zonder Bitcoin',
    dom: 'Bitcoin-dominantie',
    calc: 'eigen berekening op CoinGecko-data',
    sectorSrc: 'sectoren: CoinGecko-categorieën',
    note: 'Uitsluitend educatief, geen financieel advies.',
  },
}

const card = `${cardBase} p-4`
const pct = (v: number, lang: Lang) => (v >= 0 ? '+' : '') + v.toFixed(1).replace('.', lang === 'nl' ? ',' : '.') + '%'
const tone = (v: number) => (v >= 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]')

let sectorsP: Promise<Record<string, string>> | null = null
const loadSectors = () =>
  (sectorsP ??= fetch('/data/sectors.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((j: { byId: Record<string, string> }) => j.byId)
    .catch((e) => {
      sectorsP = null
      throw e
    }))

type Win = '24h' | '7d'
const chg = (c: Coin, w: Win) => (w === '24h' ? c.price_change_percentage_24h_in_currency : c.price_change_percentage_7d_in_currency)

function Sectors({ lang, coins, at }: { lang: Lang; coins: Coin[]; at: number | null }) {
  const t = copy[lang]
  const [map, setMap] = useState<Record<string, string> | null>(null)
  const [err, setErr] = useState(false)
  const [win, setWin] = useState<Win>('7d')
  useEffect(() => {
    loadSectors().then(setMap, () => setErr(true))
  }, [])
  const rows = useMemo(() => {
    if (!map) return []
    const acc = new Map<string, { cap: number; w: number; n: number }>()
    for (const c of coins) {
      const s = map[c.id] ?? 'other'
      const v = chg(c, win)
      if (s === 'stable' || v === undefined || v === null || !c.market_cap) continue
      const a = acc.get(s) ?? { cap: 0, w: 0, n: 0 }
      a.cap += c.market_cap
      a.w += c.market_cap * v
      a.n += 1
      acc.set(s, a)
    }
    return [...acc.entries()].filter(([, a]) => a.n >= 2).map(([s, a]) => ({ s, v: a.w / a.cap, n: a.n })).sort((a, b) => b.v - a.v)
  }, [map, coins, win])
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.v)))
  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{t.sectors}</h3>
        <div role="tablist" aria-label={t.sectors} className="flex gap-1 rounded-full border border-white/15 p-1">
          {(['24h', '7d'] as Win[]).map((w) => (
            <button key={w} type="button" role="tab" aria-selected={win === w} onClick={() => setWin(w)} className={tabCls(win === w)}>{lang === 'nl' ? w.replace('h', 'u').replace('d', ' dagen') : w}</button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-white/45">{t.sectorsP}</p>
      {rows.length ? (
        <ul className="mt-3 space-y-1.5">
          {rows.map((r) => (
            <li key={r.s} className="grid grid-cols-[minmax(0,9rem)_1fr_4rem] items-center gap-3 text-sm">
              <span className="truncate">{SECTOR[lang][r.s] ?? r.s} <span className="text-xs text-white/35">{r.n}</span></span>
              <span className="relative h-2 rounded-full bg-white/[0.06]" aria-hidden="true">
                <span className={`absolute top-0 h-2 rounded-full ${r.v >= 0 ? 'left-1/2 bg-emerald-400/70' : 'right-1/2 bg-[var(--wc-red-soft)]/70'}`} style={{ width: `${(Math.abs(r.v) / max) * 50}%` }} />
              </span>
              <span className={`text-right tabular-nums ${tone(r.v)}`}>{pct(r.v, lang)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <LoadState lang={lang} error={err} />
      )}
      <DataStamp className="mt-3" lang={lang} source={`${t.calc}; ${t.sectorSrc}`} kind="live" at={at} />
    </div>
  )
}

function Breadth({ lang, coins, at }: { lang: Lang; coins: Coin[]; at: number | null }) {
  const t = copy[lang]
  const set = realAlts(coins).concat(coins.filter((c) => c.id === 'bitcoin'))
  const count = (f: (c: Coin) => boolean | null) => {
    let yes = 0
    let n = 0
    for (const c of set) {
      const r = f(c)
      if (r === null) continue
      n += 1
      if (r) yes += 1
    }
    return { yes, n }
  }
  const items = [
    { label: t.up24, ...count((c) => (c.price_change_percentage_24h_in_currency == null ? null : c.price_change_percentage_24h_in_currency > 0)) },
    { label: t.up7, ...count((c) => (c.price_change_percentage_7d_in_currency == null ? null : c.price_change_percentage_7d_in_currency > 0)) },
    {
      label: t.aboveAvg,
      ...count((c) => {
        const p = c.sparkline_in_7d?.price
        if (!p || p.length < 24) return null
        return c.current_price > p.reduce((s, x) => s + x, 0) / p.length
      }),
    },
  ]
  return (
    <div className={card}>
      <h3 className="font-semibold">{t.breadth}</h3>
      <p className="mt-1 text-xs text-white/45">{t.breadthP}</p>
      <ul className="mt-3 space-y-3">
        {items.map((x) => {
          const share = x.n ? Math.round((x.yes / x.n) * 100) : 0
          return (
            <li key={x.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span>{x.label}</span>
                <span className="tabular-nums"><b>{share}%</b> <span className="text-xs text-white/40">{t.of(x.yes, x.n)}</span></span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-[var(--wc-red-soft)]/40" aria-hidden="true">
                <div className="h-2 rounded-full bg-emerald-400/80" style={{ width: `${share}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
      <DataStamp className="mt-3" lang={lang} source={t.calc} kind="live" at={at} />
    </div>
  )
}

type Stable = { now: number; d1: number; d7: number; d30: number }
let stableP: { at: number; p: Promise<Stable> } | null = null
const loadStable = () => {
  if (stableP && Date.now() - stableP.at < 3_600_000) return stableP.p
  const p = fetch('https://stablecoins.llama.fi/stablecoins?includePrices=false', { signal: AbortSignal.timeout(20000) })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((j: { peggedAssets: { pegType: string; circulating?: { peggedUSD?: number }; circulatingPrevDay?: { peggedUSD?: number }; circulatingPrevWeek?: { peggedUSD?: number }; circulatingPrevMonth?: { peggedUSD?: number } }[] }) => {
      const usdOnly = j.peggedAssets.filter((a) => a.pegType === 'peggedUSD')
      const sum = (k: 'circulating' | 'circulatingPrevDay' | 'circulatingPrevWeek' | 'circulatingPrevMonth') => usdOnly.reduce((s, a) => s + (a[k]?.peggedUSD ?? 0), 0)
      const now = sum('circulating')
      return { now, d1: now / sum('circulatingPrevDay') - 1, d7: now / sum('circulatingPrevWeek') - 1, d30: now / sum('circulatingPrevMonth') - 1 }
    })
    .catch((e) => {
      stableP = null
      throw e
    })
  stableP = { at: Date.now(), p }
  return p
}

function Stablecoins({ lang }: { lang: Lang }) {
  const t = copy[lang]
  const [d, setD] = useState<Stable | null>(null)
  const [err, setErr] = useState(false)
  const [at, setAt] = useState<number | null>(null)
  useEffect(() => {
    loadStable().then((v) => (setD(v), setAt(Date.now())), () => setErr(true))
  }, [])
  return (
    <div className={card}>
      <h3 className="font-semibold">{t.stable}</h3>
      <p className="mt-1 text-xs text-white/45">{t.stableP}</p>
      {d ? (
        <>
          <p className="mt-3 text-2xl font-bold tabular-nums">{usdBig(d.now)}</p>
          <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
            {([['24u', '24h', d.d1], ['7d', '7d', d.d7], ['30d', '30d', d.d30]] as const).map(([nl, en, v]) => (
              <div key={en} className="rounded-xl bg-white/[0.04] px-3 py-2">
                <dt className="text-xs text-white/45">{lang === 'nl' ? nl : en}</dt>
                <dd className={`tabular-nums ${tone(v)}`}>{pct(v * 100, lang)}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <LoadState lang={lang} error={err} />
      )}
      <DataStamp className="mt-3" lang={lang} source="DefiLlama" kind="daily" at={at} />
    </div>
  )
}

function History({ lang }: { lang: Lang }) {
  const t = copy[lang]
  const opts = [
    ['CRYPTOCAP:TOTAL', t.total],
    ['CRYPTOCAP:TOTAL2', t.total2],
    ['CRYPTOCAP:BTC.D', t.dom],
  ] as const
  const [sym, setSym] = useState<string>(opts[0][0])
  return (
    <div className={`${card} md:col-span-2`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{t.history}</h3>
        <div role="tablist" aria-label={t.history} className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/15 p-1">
          {opts.map(([v, label]) => (
            <button key={v} type="button" role="tab" aria-selected={sym === v} onClick={() => setSym(v)} className={tabCls(sym === v)}>{label}</button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-white/45">{t.historyP}</p>
      <div className="mt-3 overflow-hidden rounded-xl">
        <TradingViewWidget
          className="h-[400px]"
          script="embed-widget-advanced-chart.js"
          config={{
            symbol: sym,
            interval: 'D',
            range: '12M',
            width: '100%',
            height: 400,
            autosize: false,
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '3',
            locale: lang === 'nl' ? 'nl_NL' : 'en',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            gridColor: 'rgba(242, 242, 242, 0.06)',
            hide_side_toolbar: true,
            hide_legend: false,
            allow_symbol_change: false,
            save_image: false,
            calendar: false,
            support_host: 'https://www.tradingview.com',
          }}
        />
      </div>
      <DataStamp className="mt-3" lang={lang} source="TradingView (CRYPTOCAP)" kind="provider" />
    </div>
  )
}

export default function MarketAnalysis({ lang }: { lang: Lang }) {
  const t = copy[lang]
  const [open, setOpen] = useState(false)
  const cs = useLive(topCoins)
  return (
    <details className={`${cardBase} mt-3 group`} onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block font-semibold">{t.summary}</span>
          <span className="block text-xs text-white/50">{t.summaryP}</span>
        </span>
        <span aria-hidden="true" className="shrink-0 text-white/50 transition group-open:rotate-180">▾</span>
      </summary>
      {open ? (
        <div className="grid gap-3 border-t border-white/10 p-3 md:grid-cols-2">
          {cs.value ? (
            <>
              <Sectors lang={lang} coins={cs.value} at={cs.at} />
              <Breadth lang={lang} coins={cs.value} at={cs.at} />
            </>
          ) : (
            <div className="md:col-span-2 px-1"><LoadState lang={lang} error={cs.error} /></div>
          )}
          <Stablecoins lang={lang} />
          <div className={`${card} text-sm text-white/60`}>
            <h3 className="font-semibold text-white">{lang === 'nl' ? 'Hoe lees je dit?' : 'How to read this'}</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              {(lang === 'nl'
                ? ['Brede stijging (veel munten omhoog) is sterker dan een stijging die door een paar munten komt.', 'Sterke sectoren laten zien waar het geld nu naartoe gaat.', 'Een groeiende stablecoin-voorraad kan koopkracht zijn; krimp is geld dat crypto verlaat.', 'Dalende Bitcoin-dominantie bij een stijgende markt wijst vaak op meer risicobereidheid.']
                : ['A broad rise (many coins up) is stronger than one carried by a few coins.', 'Strong sectors show where money is flowing right now.', 'Growing stablecoin supply can be buying power; shrinking supply is money leaving crypto.', 'Falling Bitcoin dominance in a rising market often points to more risk appetite.']
              ).map((x) => <li key={x}>{x}</li>)}
            </ul>
            <p className="mt-3 text-xs text-white/40">{t.note}</p>
          </div>
          <History lang={lang} />
        </div>
      ) : null}
    </details>
  )
}
