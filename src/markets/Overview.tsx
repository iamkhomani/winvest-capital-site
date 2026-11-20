// Crypto market overview: market cap, dominance, sentiment, altcoin season, trending coins,
// top gainers and losers, and volume leaders. Everything is loaded in the browser (see pulse.ts).
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Lang } from '../i18n'
import { coinHref } from './coins'
import { altSeason, fearGreed, globalData, realAlts, topCoins, trending, useLive, usdBig } from './pulse'
import type { Coin } from './pulse'
import { cardBase, tabCls } from '../components/kit'
import DataStamp, { LoadState } from './DataStamp'

export { coinHref }

const FNG_NL: Record<string, string> = { 'Extreme Fear': 'Extreme angst', Fear: 'Angst', Neutral: 'Neutraal', Greed: 'Hebzucht', 'Extreme Greed': 'Extreme hebzucht' }

const copy = {
  en: {
    h2: 'Crypto market today',
    mcap: 'Total market cap',
    vol: '24h volume',
    btcDom: 'Bitcoin dominance',
    ethDom: 'Ethereum dominance',
    fng: 'Fear & Greed Index',
    fngSrc: 'Source: alternative.me',
    yesterday: (v: number) => `yesterday ${v}`,
    alt: 'Altcoin season',
    altNote: (b: number, t: number) => `${b} of the ${t} largest altcoins beat Bitcoin over 30 days. Our own reading, not the official Altcoin Season Index.`,
    altLabel: (s: number) => (s >= 75 ? 'Altcoin season' : s <= 25 ? 'Bitcoin season' : 'No clear season'),
    trending: 'Trending',
    movers: 'Movers',
    trendingNote: 'Most searched on CoinGecko in the last 24 hours',
    gainers: 'Top gainers (24h)',
    losers: 'Top losers (24h)',
    volume: 'Highest volume (24h)',
    top100: 'Within the top 100 by market cap',
    summary: (g: { mcap: string; ch: number; dom: string; fng?: string }) =>
      `The total crypto market is ${g.ch >= 0 ? 'up' : 'down'} ${Math.abs(g.ch).toFixed(1)}% in 24 hours, at ${g.mcap}. Bitcoin makes up ${g.dom} of it.${g.fng ? ` Sentiment: ${g.fng}.` : ''}`,
    error: 'Market data could not be loaded right now. Please try again in a minute.',
    loading: 'Loading market data…',
    data: 'Data: CoinGecko and alternative.me. Educational only, not financial advice.',
  },
  nl: {
    h2: 'De cryptomarkt vandaag',
    mcap: 'Totale market cap',
    vol: 'Volume 24u',
    btcDom: 'Bitcoin-dominantie',
    ethDom: 'Ethereum-dominantie',
    fng: 'Fear & Greed Index',
    fngSrc: 'Bron: alternative.me',
    yesterday: (v: number) => `gisteren ${v}`,
    alt: 'Altcoin-seizoen',
    altNote: (b: number, t: number) => `${b} van de ${t} grootste altcoins deden het in 30 dagen beter dan Bitcoin. Eigen berekening, niet de officiële Altcoin Season Index.`,
    altLabel: (s: number) => (s >= 75 ? 'Altcoin-seizoen' : s <= 25 ? 'Bitcoin-seizoen' : 'Geen duidelijk seizoen'),
    trending: 'Trending',
    movers: 'Bewegers',
    trendingNote: 'Meest gezocht op CoinGecko in de laatste 24 uur',
    gainers: 'Grootste stijgers (24u)',
    losers: 'Grootste dalers (24u)',
    volume: 'Hoogste volume (24u)',
    top100: 'Binnen de top 100 op market cap',
    summary: (g: { mcap: string; ch: number; dom: string; fng?: string }) =>
      `De totale cryptomarkt is in 24 uur ${Math.abs(g.ch).toFixed(1).replace('.', ',')}% ${g.ch >= 0 ? 'gestegen' : 'gedaald'}, naar ${g.mcap}. Bitcoin is daarvan ${g.dom}.${g.fng ? ` Sentiment: ${g.fng.toLowerCase()}.` : ''}`,
    error: 'De marktdata kon nu niet worden geladen. Probeer het over een minuut opnieuw.',
    loading: 'Marktdata laden…',
    data: 'Data: CoinGecko en alternative.me. Uitsluitend educatief, geen financieel advies.',
  },
}

const pct = (v?: number, lang: Lang = 'en') => (v === undefined || v === null ? '–' : (v >= 0 ? '+' : '') + v.toFixed(2).replace('.', lang === 'nl' ? ',' : '.') + '%')
const tone = (v?: number) => (v === undefined || v === null ? 'text-white/40' : v >= 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]')
const share = (v: number, lang: Lang) => v.toFixed(1).replace('.', lang === 'nl' ? ',' : '.') + '%'
const fngLabel = (l: string, lang: Lang) => (lang === 'nl' ? FNG_NL[l] ?? l : l)

function Meter({ value, from = 'var(--wc-red-soft)', to = '#34D399' }: { value: number; from?: string; to?: string }) {
  return (
    <div className="relative mt-3 h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${from}, #FBBF24, ${to})` }} aria-hidden="true">
      <span className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--wc-black)] bg-white" style={{ left: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

const card = `${cardBase} p-4`

function Stat({ label, value, sub }: { label: string; value: string; sub?: ReactNode }) {
  return (
    <div className={card}>
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
      {sub ? <p className="mt-0.5 text-xs tabular-nums">{sub}</p> : null}
    </div>
  )
}

type Row = { id: string; name: string; symbol: string; img: string; right: ReactNode }

function CoinRows({ lang, rows }: { lang: Lang; rows: Row[] }) {
  return (
      <ol className="mt-3 grid gap-x-6 gap-y-1 md:grid-cols-2">
        {rows.map((r) => (
          <li key={r.id}>
            <a href={coinHref(lang, r.id)} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition hover:bg-white/[0.05]">
              <img src={r.img} alt="" width={20} height={20} loading="lazy" className="size-5 shrink-0 rounded-full" />
              <span className="min-w-0 flex-1 truncate font-medium">{r.name}</span>
              <span className="shrink-0 text-xs uppercase text-white/40">{r.symbol}</span>
              <span className="w-20 shrink-0 text-right tabular-nums">{r.right}</span>
            </a>
          </li>
        ))}
      </ol>
  )
}

type MoverTab = 'trending' | 'gainers' | 'losers' | 'volume'

/** Trending, gainers, losers and volume in one card with tabs, so the overview stays calm. */
function Movers({ lang, lists, at, trAt, error }: { lang: Lang; lists: Record<MoverTab, Row[]>; at: number | null; trAt: number | null; error: boolean }) {
  const t = copy[lang]
  const [tab, setTab] = useState<MoverTab>('gainers')
  const names: Record<MoverTab, string> = { trending: t.trending, gainers: t.gainers, losers: t.losers, volume: t.volume }
  const rows = lists[tab]
  return (
    <div className={`${card} mt-3`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{t.movers}</h3>
        <div role="tablist" aria-label={t.movers} className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/15 p-1">
          {(['gainers', 'losers', 'trending', 'volume'] as MoverTab[]).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={tabCls(tab === k)}>{names[k].replace(/ \(24[hu]\)/, '')}</button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-white/45">{tab === 'trending' ? t.trendingNote : `${names[tab]} · ${t.top100}`}</p>
      {rows.length ? <CoinRows lang={lang} rows={rows} /> : <LoadState lang={lang} error={error} />}
      <DataStamp className="mt-3" lang={lang} source="CoinGecko" kind={tab === 'trending' ? 'delayed' : 'live'} at={tab === 'trending' ? trAt : at} />
    </div>
  )
}

const toRow = (c: Coin, right: ReactNode) => ({ id: c.id, name: c.name, symbol: c.symbol, img: c.image, right })

/** Full overview for the markets page. */
export function MarketOverview({ lang }: { lang: Lang }) {
  const t = copy[lang]
  const g = useLive(globalData)
  const f = useLive(fearGreed, 600_000)
  const tr = useLive(trending, 600_000)
  const cs = useLive(topCoins)
  const coins = cs.value
  const alt = coins ? altSeason(coins) : null
  const ranked = coins ? realAlts(coins).concat(coins.filter((c) => c.id === 'bitcoin')).filter((c) => c.price_change_percentage_24h_in_currency !== undefined && c.price_change_percentage_24h_in_currency !== null) : []
  const by24 = [...ranked].sort((a, b) => (b.price_change_percentage_24h_in_currency as number) - (a.price_change_percentage_24h_in_currency as number))
  const byVol = coins ? [...coins].sort((a, b) => b.total_volume - a.total_volume).slice(0, 10) : []

  if (g.error && !g.value && cs.error && !coins) return <p className="mt-6 text-[var(--wc-red-soft)]">{t.error}</p>
  return (
    <section aria-labelledby="pulse-h" className="mt-8">
      <h2 id="pulse-h" className="text-2xl font-bold tracking-tight">{t.h2}</h2>
      {g.value ? (
        <p className="mt-2 max-w-3xl text-white/70">
          {t.summary({ mcap: usdBig(g.value.totalMcap), ch: g.value.mcapChange24h, dom: share(g.value.btcDominance, lang), fng: f.value ? `${fngLabel(f.value.label, lang)} (${f.value.value})` : undefined })}
        </p>
      ) : (
        <p className="mt-2 text-white/50">{t.loading}</p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t.mcap} value={g.value ? usdBig(g.value.totalMcap) : '–'} sub={g.value ? <span className={tone(g.value.mcapChange24h)}>{pct(g.value.mcapChange24h, lang)} {lang === 'nl' ? '24u' : '24h'}</span> : null} />
        <Stat label={t.vol} value={g.value ? usdBig(g.value.totalVolume) : '–'} />
        <Stat label={t.btcDom} value={g.value ? share(g.value.btcDominance, lang) : '–'} />
        <Stat label={t.ethDom} value={g.value ? share(g.value.ethDominance, lang) : '–'} />
      </div>
      {g.error && !g.value ? <LoadState lang={lang} error /> : <DataStamp className="mt-2" lang={lang} source="CoinGecko" kind="live" at={g.at} />}

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className={card}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs text-white/50">{t.fng}</p>
            <p className="text-[11px] text-white/35">{lang === 'nl' ? 'dagelijks' : 'daily'}</p>
          </div>
          {f.value ? (
            <>
              <p className="mt-1 text-xl font-bold">
                {f.value.value} <span className="text-base font-semibold text-white/75">· {fngLabel(f.value.label, lang)}</span>
              </p>
              {f.value.yesterday !== undefined ? <p className="text-xs text-white/45">{t.yesterday(f.value.yesterday)}</p> : null}
              <Meter value={f.value.value} />
              <DataStamp className="mt-3" lang={lang} source="alternative.me" kind="daily" at={f.at} />
            </>
          ) : (
            <p className="mt-1 text-xl font-bold">–</p>
          )}
        </div>
        <div className={card}>
          <p className="text-xs text-white/50">{t.alt}</p>
          {alt ? (
            <>
              <p className="mt-1 text-xl font-bold">
                {alt.score} <span className="text-base font-semibold text-white/75">· {t.altLabel(alt.score)}</span>
              </p>
              <p className="text-xs text-white/45">{t.altNote(alt.beat, alt.total)}</p>
              <Meter value={alt.score} from="#F7931A" to="#8B5CF6" />
              <DataStamp className="mt-3" lang={lang} source={lang === 'nl' ? 'eigen berekening op CoinGecko-data' : 'our calculation on CoinGecko data'} kind="live" at={cs.at} />
            </>
          ) : (
            <p className="mt-1 text-xl font-bold">–</p>
          )}
        </div>
      </div>

      <Movers
        lang={lang}
        at={cs.at}
        trAt={tr.at}
        error={cs.error || tr.error}
        lists={{
          trending: (tr.value ?? []).map((x) => ({ id: x.id, name: x.name, symbol: x.symbol, img: x.thumb, right: <span className={tone(x.change24h)}>{pct(x.change24h, lang)}</span> })),
          gainers: by24.slice(0, 10).map((x) => toRow(x, <span className={tone(x.price_change_percentage_24h_in_currency)}>{pct(x.price_change_percentage_24h_in_currency, lang)}</span>)),
          losers: by24.slice(-10).reverse().map((x) => toRow(x, <span className={tone(x.price_change_percentage_24h_in_currency)}>{pct(x.price_change_percentage_24h_in_currency, lang)}</span>)),
          volume: byVol.map((x) => toRow(x, <span className="text-white/75">{usdBig(x.total_volume)}</span>)),
        }}
      />
      <p className="mt-3 text-xs text-white/40">{t.data}</p>
    </section>
  )
}

/** Compact strip for the homepage: market cap, Bitcoin dominance and sentiment. */
export function PulseStrip({ lang }: { lang: Lang }) {
  const t = copy[lang]
  const g = useLive(globalData)
  const f = useLive(fearGreed, 600_000)
  const item = 'flex min-w-0 flex-col'
  return (
    <div className="grid grid-cols-3 gap-2 px-5 pt-3 text-sm">
      <div className={item}>
        <span className="truncate text-[11px] text-white/45">{t.mcap}</span>
        <span className="font-semibold tabular-nums">{g.value ? usdBig(g.value.totalMcap) : '–'}</span>
        {g.value ? <span className={`text-[11px] tabular-nums ${tone(g.value.mcapChange24h)}`}>{pct(g.value.mcapChange24h, lang)}</span> : null}
      </div>
      <div className={item}>
        <span className="truncate text-[11px] text-white/45">{t.btcDom}</span>
        <span className="font-semibold tabular-nums">{g.value ? share(g.value.btcDominance, lang) : '–'}</span>
      </div>
      <div className={item}>
        <span className="truncate text-[11px] text-white/45">Fear &amp; Greed</span>
        <span className="font-semibold tabular-nums">{f.value ? f.value.value : '–'}</span>
        {f.value ? <span className="truncate text-[11px] text-white/55">{fngLabel(f.value.label, lang)}</span> : null}
      </div>
    </div>
  )
}

