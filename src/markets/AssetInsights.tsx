// Extra blocks for coin pages: technical indicators (TradingView's free technical analysis widget,
// which summarises moving averages and oscillators) and headlines that mention the coin (from our
// own Worker /news feed, the same one as the news page). No new data sources or subscriptions.
import { useEffect, useState } from 'react'
import TradingViewWidget from '../components/TradingViewWidget'
import { cardBase } from '../components/kit'
import { DEFI_PROXY_URL } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import DataStamp, { LoadState, timeOf } from './DataStamp'

const card = `${cardBase} p-4 sm:p-5`

export function Technicals({ lang, symbol, name }: { lang: Lang; symbol: string; name: string }) {
  const nl = lang === 'nl'
  return (
    <section id="technical" className={`${card} scroll-mt-24`}>
      <h2 className="font-semibold">{nl ? 'Technische indicatoren' : 'Technical indicators'}</h2>
      <p className="mt-1 text-xs text-white/45">
        {nl
          ? `Samenvatting van voortschrijdende gemiddelden en oscillatoren (RSI, MACD en andere) voor ${name}. Kies een tijdframe. Een signaal, geen advies: combineer het met je eigen analyse.`
          : `Summary of moving averages and oscillators (RSI, MACD and others) for ${name}. Pick a timeframe. A signal, not advice: combine it with your own analysis.`}
      </p>
      <div className="mt-3">
        <TradingViewWidget
          className="min-h-[420px]"
          script="embed-widget-technical-analysis.js"
          config={{ interval: '1D', width: '100%', height: 420, isTransparent: true, symbol: `CRYPTO:${symbol}USD`, showIntervalTabs: true, displayMode: 'single', locale: nl ? 'nl_NL' : 'en', colorTheme: 'dark' }}
        />
      </div>
      <DataStamp className="mt-2" lang={lang} source="TradingView" kind="live" />
    </section>
  )
}

type Item = { id: string; category: string; title: string; url: string; source: string; published: number }
let newsP: { at: number; p: Promise<{ items: Item[]; at: number }> } | null = null
const loadNews = () => {
  if (newsP && Date.now() - newsP.at < 300_000) return newsP.p
  const p = fetch((DEFI_PROXY_URL || 'https://winvest-defi-proxy.helijl.workers.dev') + '/news', { signal: AbortSignal.timeout(15000) })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((j: { items: Item[] }) => ({ items: j.items, at: Date.now() }))
    .catch((e) => {
      newsP = null
      throw e
    })
  newsP = { at: Date.now(), p }
  return p
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function CoinNews({ lang, name, symbol }: { lang: Lang; name: string; symbol: string }) {
  const nl = lang === 'nl'
  const [rows, setRows] = useState<Item[] | null>(null)
  const [at, setAt] = useState<number | null>(null)
  const [err, setErr] = useState(false)
  useEffect(() => {
    // Whole words only. The ticker counts only in capitals and from 3 letters, so "OP" or "S" do not match everything.
    const words = [`\\b${esc(name)}\\b`]
    const tests: RegExp[] = [new RegExp(words[0], 'i')]
    if (symbol.length >= 3) tests.push(new RegExp(`\\b${esc(symbol.toUpperCase())}\\b`))
    loadNews().then(
      ({ items, at }) => {
        setRows(items.filter((x) => tests.some((re) => re.test(x.title))).slice(0, 6))
        setAt(at)
      },
      () => setErr(true),
    )
  }, [name, symbol])
  return (
    <section id="news" className={`${card} scroll-mt-24`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">{nl ? `Nieuws over ${name}` : `${name} news`}</h2>
        <a href={paths[lang].news} className="shrink-0 text-sm font-semibold text-[var(--wc-red-soft)] hover:underline">{nl ? 'Al het nieuws' : 'All news'} →</a>
      </div>
      {rows ? (
        rows.length ? (
          <ul className="mt-3 divide-y divide-white/5">
            {rows.map((x) => (
              <li key={x.id} className="py-2">
                <a href={x.url} target="_blank" rel="noopener" className="text-sm font-medium hover:underline">{x.title}</a>
                <p className="mt-0.5 text-xs text-white/40">{x.source} · {timeOf(x.published, lang)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-white/55">{nl ? `Geen recente koppen over ${name} in onze bronnen.` : `No recent headlines about ${name} in our sources.`}</p>
        )
      ) : (
        <LoadState lang={lang} error={err} />
      )}
      <DataStamp className="mt-3" lang={lang} source="Cointelegraph, CoinDesk, Decrypt, The Block" kind="delayed" at={at} />
    </section>
  )
}
