// Derivatives card on coin pages: funding rate, open interest (with 30 days of history) and the
// long/short account ratio of the coin's USDT perpetual. Source: Binance Futures public API; when
// Binance has no such market or blocks the visitor's region, OKX is used (funding and open interest only).
// Only the symbol is sent. The card hides itself for coins without a perpetual market.
import { useEffect, useState } from 'react'
import { cardBase } from '../components/kit'
import type { Lang } from '../i18n'
import DataStamp from './DataStamp'
import { usdBig } from './pulse'
import { big, hhmm, p, usePart } from '../shared/whisperContext'

type Deriv = {
  source: 'Binance' | 'OKX'
  funding: number // last or current rate per period, as a fraction (0.0001 = 0.01%)
  hours: number // funding period in hours
  nextFunding?: number
  oiUsd: number
  oiHist?: number[] // daily open interest in USD, oldest first
  longShare?: number // share of accounts that are net long (0..1), Binance only
  at: number
}

const json = async (url: string) => {
  const r = await fetch(url, { signal: AbortSignal.timeout(12000) })
  if (!r.ok) throw new Error(String(r.status))
  return r.json()
}

// Funding period per Binance symbol when it is not the usual 8 hours (one 140 KB list, kept for the session).
let intervals: Promise<Record<string, number>> | null = null
const binanceIntervals = () =>
  (intervals ??= (async () => {
    try {
      const cached = sessionStorage.getItem('wc-funding-intervals')
      if (cached) return JSON.parse(cached) as Record<string, number>
    } catch { /* no session storage */ }
    const list = (await json('https://fapi.binance.com/fapi/v1/fundingInfo').catch(() => [])) as { symbol: string; fundingIntervalHours?: number }[]
    const map: Record<string, number> = {}
    for (const x of list) if (x.fundingIntervalHours && x.fundingIntervalHours !== 8) map[x.symbol] = x.fundingIntervalHours
    try { sessionStorage.setItem('wc-funding-intervals', JSON.stringify(map)) } catch { /* ignore */ }
    return map
  })())

async function fromBinance(sym: string): Promise<Deriv> {
  const s = `${sym}USDT`
  const base = 'https://fapi.binance.com'
  const [pi, oi, hist, ls, iv] = await Promise.all([
    json(`${base}/fapi/v1/premiumIndex?symbol=${s}`),
    json(`${base}/fapi/v1/openInterest?symbol=${s}`),
    json(`${base}/futures/data/openInterestHist?symbol=${s}&period=1d&limit=30`).catch(() => []),
    json(`${base}/futures/data/globalLongShortAccountRatio?symbol=${s}&period=1h&limit=1`).catch(() => []),
    binanceIntervals(),
  ])
  const mark = Number(pi.markPrice)
  const funding = Number(pi.lastFundingRate)
  if (!(mark > 0) || !Number.isFinite(funding)) throw new Error('no market')
  return {
    source: 'Binance',
    funding,
    hours: iv[s] ?? 8,
    nextFunding: Number(pi.nextFundingTime) || undefined,
    oiUsd: Number(oi.openInterest) * mark,
    oiHist: Array.isArray(hist) ? hist.map((h: { sumOpenInterestValue: string }) => Number(h.sumOpenInterestValue)).filter((v: number) => v > 0) : undefined,
    longShare: Array.isArray(ls) && ls[0] ? Number(ls[0].longAccount) : undefined,
    at: Date.now(),
  }
}

async function fromOkx(sym: string): Promise<Deriv> {
  const id = `${sym}-USDT-SWAP`
  const [f, oi] = await Promise.all([
    json(`https://www.okx.com/api/v5/public/funding-rate?instId=${id}`),
    json(`https://www.okx.com/api/v5/public/open-interest?instType=SWAP&instId=${id}`),
  ])
  const fr = f?.data?.[0]
  const o = oi?.data?.[0]
  if (!fr || !o) throw new Error('no market')
  const t = Number(fr.fundingTime), n = Number(fr.nextFundingTime)
  return { source: 'OKX', funding: Number(fr.fundingRate), hours: t && n && n > t ? Math.round((n - t) / 36e5) : 8, nextFunding: t || undefined, oiUsd: Number(o.oiUsd), at: Date.now() }
}

// null = this coin has no USDT perpetual (the card hides); 'error' = the exchanges could not be reached.
// Errors are not cached, so a retry asks again.
const cache = new Map<string, Promise<Deriv | null | 'error'>>()
const load = (sym: string) => {
  if (!cache.has(sym)) {
    const run = fromBinance(sym)
      .catch(() => fromOkx(sym))
      .catch((e: unknown) => (e instanceof Error && e.message === 'no market' ? null : ('error' as const)))
    run.then((v) => { if (v === 'error') cache.delete(sym) })
    cache.set(sym, run)
  }
  return cache.get(sym)!
}

function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const min = Math.min(...values), max = Math.max(...values)
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${30 - ((v - min) / (max - min || 1)) * 28 - 1}`).join(' ')
  const up = values[values.length - 1] >= values[0]
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-2 h-8 w-full" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={up ? '#34D399' : 'var(--wc-red-soft)'} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export default function Derivatives({ lang, symbol, name }: { lang: Lang; symbol: string; name: string }) {
  const nl = lang === 'nl'
  const [res, setD] = useState<Deriv | null | 'error' | undefined>(undefined)
  const [tries, setTries] = useState(0)
  useEffect(() => {
    let alive = true
    const sym = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!sym || /^(USDT|USDC|DAI|USDE|FDUSD|USDS|PYUSD)$/.test(sym)) return setD(null)
    setD(undefined)
    void load(sym).then((v) => alive && setD(v))
    return () => { alive = false }
  }, [symbol, tries])
  const d = res === 'error' ? null : res
  usePart(
    'derivatives',
    d
      ? [`Derivatives (${d.source} ${symbol.toUpperCase()}/USDT perpetual, ${hhmm(d.at)}): funding ${p(d.funding * 100, 4)} per ${d.hours}h | open interest ${big(d.oiUsd)} USD${d.oiHist && d.oiHist.length > 7 ? ` (${p((d.oiUsd / d.oiHist[d.oiHist.length - 8] - 1) * 100)} 7d)` : ''}${d.longShare !== undefined ? ` | ${Math.round(d.longShare * 100)}% of accounts net long` : ''}`]
      : null,
  )
  if (res === 'error')
    return (
      <section id="derivatives" className={`${cardBase} scroll-mt-24 p-4 sm:p-5`}>
        <h2 className="font-semibold">{nl ? 'Derivaten' : 'Derivatives'}</h2>
        <p className="mt-2 text-sm text-white/55">
          {nl ? 'Funding en open interest konden nu niet worden geladen. Binance en OKX waren niet bereikbaar vanaf je verbinding.' : 'Funding and open interest could not be loaded right now. Binance and OKX could not be reached from your connection.'}{' '}
          <button type="button" onClick={() => setTries((t) => t + 1)} className="font-semibold underline">{nl ? 'Opnieuw' : 'Retry'}</button>
        </p>
      </section>
    )
  if (!d) return null // loading, or no perpetual market for this coin

  const ratePct = d.funding * 100
  const yearPct = ratePct * (24 / d.hours) * 365
  const f2 = (v: number, dec: number) => v.toFixed(dec).replace('.', nl ? ',' : '.')
  const fundTone = ratePct > 0.03 ? 'text-amber-300' : ratePct < -0.005 ? 'text-sky-300' : 'text-white'
  const oiCh = d.oiHist && d.oiHist.length > 7 ? (d.oiUsd / d.oiHist[d.oiHist.length - 8] - 1) * 100 : undefined
  const fundRead =
    ratePct > 0.03
      ? nl ? 'Hoog: longs betalen veel om hun positie open te houden. De markt leunt sterk naar long.' : 'High: longs pay a lot to keep their positions. The market leans heavily long.'
      : ratePct > 0.005
        ? nl ? 'Positief: longs betalen shorts. Normaal in een rustige of stijgende markt.' : 'Positive: longs pay shorts. Normal in a calm or rising market.'
        : ratePct >= -0.005
          ? nl ? 'Rond nul: geen duidelijke voorkeur voor long of short.' : 'Around zero: no clear lean to long or short.'
          : nl ? 'Negatief: shorts betalen longs. Er wordt meer op een daling gespeculeerd.' : 'Negative: shorts pay longs. More traders are betting on a fall.'
  return (
    <section id="derivatives" className={`${cardBase} scroll-mt-24 p-4 sm:p-5`}>
      <h2 className="font-semibold">{nl ? `Derivaten: ${name}-perpetual` : `Derivatives: ${name} perpetual`}</h2>
      <p className="mt-1 text-xs text-white/45">{nl ? `De ${symbol}/USDT perpetual future op ${d.source}. Dit is één beurs, niet de hele markt.` : `The ${symbol}/USDT perpetual future on ${d.source}. One exchange, not the whole market.`}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs text-white/50">Funding rate</p>
          <p className={`text-lg font-bold tabular-nums ${fundTone}`}>{ratePct >= 0 ? '+' : ''}{f2(ratePct, 4)}%</p>
          <p className="text-xs text-white/45">{nl ? `per ${d.hours} uur · ≈ ${f2(yearPct, 1)}% per jaar` : `per ${d.hours} hours · ≈ ${f2(yearPct, 1)}% a year`}</p>
        </div>
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs text-white/50">Open interest</p>
          <p className="text-lg font-bold tabular-nums">{usdBig(d.oiUsd)}</p>
          {oiCh !== undefined ? <p className={`text-xs ${oiCh >= 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]'}`}>{oiCh >= 0 ? '+' : ''}{f2(oiCh, 1)}% {nl ? '7 dagen' : '7 days'}</p> : null}
          {d.oiHist ? <Spark values={[...d.oiHist, d.oiUsd]} /> : null}
        </div>
        {d.longShare !== undefined ? (
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-xs text-white/50">{nl ? 'Long/short (accounts)' : 'Long/short (accounts)'}</p>
            <p className="text-lg font-bold tabular-nums">{Math.round(d.longShare * 100)}% / {Math.round((1 - d.longShare) * 100)}%</p>
            <div className="mt-2 h-2 rounded-full bg-[var(--wc-red-soft)]/50" aria-hidden="true"><div className="h-2 rounded-full bg-emerald-400/80" style={{ width: `${d.longShare * 100}%` }} /></div>
            <p className="mt-1 text-[11px] text-white/45">{nl ? 'Aandeel accounts dat netto long staat, niet het geld. Vooral kleine traders; zegt weinig over grote partijen.' : 'Share of accounts that are net long, not of money. Mostly small traders; says little about large players.'}</p>
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-white/65">{fundRead} {nl ? 'Open interest is de waarde van alle openstaande contracten: stijgt die samen met de koers, dan komt er nieuw geld bij; daalt die, dan worden posities gesloten.' : 'Open interest is the value of all open contracts: rising with price means new money coming in; falling means positions are being closed.'}</p>
      <p className="mt-1 text-xs text-white/40">{nl ? 'Uitsluitend educatief, geen financieel advies.' : 'Educational only, not financial advice.'}</p>
      <DataStamp className="mt-2" lang={lang} source={d.source === 'Binance' ? 'Binance Futures' : 'OKX'} kind="onload" at={d.at} />
    </section>
  )
}
