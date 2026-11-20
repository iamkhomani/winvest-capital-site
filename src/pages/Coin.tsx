// One page per cryptocurrency (/markets/coin/?id=bitcoin): price chart, market data, supply,
// all-time high, description, links and contracts. Data from CoinGecko, loaded in the browser.
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import TradingViewWidget from '../components/TradingViewWidget'
import { DISCORD_URL } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import { usd, usdBig } from '../markets/pulse'

type Detail = {
  id: string
  symbol: string
  name: string
  categories: (string | null)[]
  description: { en?: string; nl?: string }
  links: { homepage: string[]; whitepaper?: string; blockchain_site: string[]; repos_url?: { github?: string[] }; subreddit_url?: string; twitter_screen_name?: string }
  image: { large: string }
  genesis_date: string | null
  hashing_algorithm: string | null
  platforms: Record<string, string>
  market_cap_rank: number | null
  market_data: {
    current_price: { usd: number }
    market_cap: { usd: number }
    fully_diluted_valuation: { usd?: number }
    total_volume: { usd: number }
    high_24h: { usd?: number }
    low_24h: { usd?: number }
    ath: { usd: number }
    ath_change_percentage: { usd: number }
    ath_date: { usd: string }
    atl: { usd: number }
    atl_date: { usd: string }
    price_change_percentage_24h?: number
    price_change_percentage_7d?: number
    price_change_percentage_30d?: number
    price_change_percentage_1y?: number
    circulating_supply: number | null
    total_supply: number | null
    max_supply: number | null
    max_supply_infinite?: boolean
  }
}

const copy = {
  en: {
    crumb: 'Markets',
    rank: (n: number) => `Rank #${n} by market cap`,
    loading: 'Loading coin data…',
    notFound: 'This coin could not be found. Check the link or pick a coin from the markets page.',
    error: 'The data could not be loaded right now (the free data source limits how often we may ask). Please try again in a minute.',
    retry: 'Try again',
    market: 'Market',
    mcap: 'Market cap',
    fdv: 'Fully diluted value',
    vol: 'Volume 24h',
    range: '24h range',
    perf: 'Performance',
    d7: '7 days',
    d30: '30 days',
    y1: '1 year',
    supply: 'Supply',
    circ: 'Circulating',
    total: 'Total',
    max: 'Maximum',
    infinite: 'No maximum',
    ofMax: (p: string) => `${p} of the maximum is in circulation`,
    history: 'All-time high and low',
    ath: 'All-time high',
    fromAth: 'from the high',
    atl: 'All-time low',
    about: 'About',
    aboutLang: '',
    noAbout: 'No description available.',
    facts: 'Details',
    since: 'Started',
    algo: 'Algorithm',
    cats: 'Categories',
    links: 'Links',
    website: 'Website',
    whitepaper: 'Whitepaper',
    explorer: 'Explorer',
    code: 'Source code',
    contracts: 'Contracts',
    scan: 'Check for risks',
    chart: 'Chart',
    chartNote: 'Chart from TradingView. Not every coin has a chart there.',
    askH: 'Want a deeper look at this project?',
    askP: 'One Percent Club members can ask Market Whisper AI for a fundamental analysis of any project, right in Discord.',
    askBtn: 'See the One Percent Club',
    join: 'Join the Discord for free',
    source: 'Data: CoinGecko. Prices in US dollars. Educational only, not financial advice.',
  },
  nl: {
    crumb: 'Markten',
    rank: (n: number) => `Nummer ${n} op market cap`,
    loading: 'Gegevens laden…',
    notFound: 'Deze munt is niet gevonden. Controleer de link of kies een munt op de marktenpagina.',
    error: 'De gegevens konden nu niet worden geladen (de gratis databron beperkt hoe vaak we iets mogen opvragen). Probeer het over een minuut opnieuw.',
    retry: 'Opnieuw proberen',
    market: 'Markt',
    mcap: 'Market cap',
    fdv: 'Volledig verwaterde waarde',
    vol: 'Volume 24u',
    range: 'Bereik 24u',
    perf: 'Rendement',
    d7: '7 dagen',
    d30: '30 dagen',
    y1: '1 jaar',
    supply: 'Aanbod',
    circ: 'In omloop',
    total: 'Totaal',
    max: 'Maximum',
    infinite: 'Geen maximum',
    ofMax: (p: string) => `${p} van het maximum is in omloop`,
    history: 'Hoogste en laagste koers ooit',
    ath: 'All-time high',
    fromAth: 'vanaf de top',
    atl: 'All-time low',
    about: 'Over',
    aboutLang: 'De beschrijving is in het Engels (bron: CoinGecko).',
    noAbout: 'Geen beschrijving beschikbaar.',
    facts: 'Gegevens',
    since: 'Gestart',
    algo: 'Algoritme',
    cats: 'Categorieën',
    links: 'Links',
    website: 'Website',
    whitepaper: 'Whitepaper',
    explorer: 'Explorer',
    code: 'Broncode',
    contracts: 'Contracten',
    scan: 'Check op risico’s',
    chart: 'Grafiek',
    chartNote: 'Grafiek van TradingView. Niet elke munt heeft daar een grafiek.',
    askH: 'Dieper in dit project duiken?',
    askP: 'Leden van de One Percent Club vragen Market Whisper AI in Discord om een fundamentele analyse van elk project.',
    askBtn: 'Bekijk de One Percent Club',
    join: 'Word gratis lid van de Discord',
    source: 'Data: CoinGecko. Prijzen in Amerikaanse dollars. Uitsluitend educatief, geen financieel advies.',
  },
}

// Category tags on CoinGecko include investor portfolios and index memberships; those say little about the project.
const NOISE = /portfolio|holdings|index|launchpad|made in|alleged|ftx|fan token/i

const num = (v: number, lang: Lang) => new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'en-US', { maximumFractionDigits: 0 }).format(v)
const pct = (v: number | undefined, lang: Lang) => (v === undefined || v === null ? '–' : (v >= 0 ? '+' : '') + v.toFixed(2).replace('.', lang === 'nl' ? ',' : '.') + '%')
const tone = (v?: number) => (v === undefined || v === null ? 'text-white/40' : v >= 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]')
const date = (iso: string, lang: Lang) => new Date(iso).toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return u
  }
}
const safe = (u?: string) => (u && /^https:\/\//.test(u) ? u : undefined)
/** CoinGecko descriptions contain HTML links; show them as plain text paragraphs. */
const paragraphs = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .split(/\r?\n\s*\r?\n|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean)

const card = 'rounded-2xl border border-white/10 bg-white/[0.03] p-5'

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="text-sm text-white/55">{k}</dt>
      <dd className="text-right text-sm font-semibold tabular-nums">{v}</dd>
    </div>
  )
}

export default function Coin({ lang }: { lang: Lang }) {
  const c = copy[lang]
  const [id, setId] = useState<string | null>(null)
  const [d, setD] = useState<Detail | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'notfound' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('id')
    setId(q && /^[a-z0-9-]{1,80}$/.test(q) ? q : '')
  }, [])

  useEffect(() => {
    if (id === null) return
    if (!id) return setState('notfound')
    let alive = true
    setState('loading')
    fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=true&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`, { signal: AbortSignal.timeout(15000) })
      .then(async (r) => {
        if (r.status === 404) throw new Error('404')
        if (!r.ok) throw new Error(String(r.status))
        return (await r.json()) as Detail
      })
      .then((x) => {
        if (!alive) return
        setD(x)
        setState('ok')
        document.title = `${x.name} (${x.symbol.toUpperCase()}) | Winvest Capital`
      })
      .catch((e: Error) => alive && setState(e.message === '404' ? 'notfound' : 'error'))
    return () => {
      alive = false
    }
  }, [id, attempt])

  const p = paths[lang]
  const m = d?.market_data
  const descNl = d?.description.nl?.trim()
  const desc = d ? paragraphs(lang === 'nl' && descNl ? descNl : d.description.en ?? '') : []
  const cats = (d?.categories ?? []).filter((x): x is string => !!x && !NOISE.test(x)).slice(0, 8)
  const contracts = d ? Object.entries(d.platforms).filter(([chain, addr]) => chain && addr) : []
  const supplyPct = m && m.max_supply && m.circulating_supply ? (m.circulating_supply / m.max_supply) * 100 : null

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/12 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-white/45">
          <a href={p.home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span>{' '}
          <a href={p.markets} className="hover:text-white">{c.crumb}</a>
          {d ? <> <span aria-hidden="true">/</span> {d.name}</> : null}
        </nav>

        {state === 'loading' && <p className="mt-10 text-white/60">{c.loading}</p>}
        {state === 'notfound' && <p className="mt-10 text-white/70">{c.notFound}</p>}
        {state === 'error' && (
          <div className="mt-10">
            <p className="text-white/70">{c.error}</p>
            <button type="button" onClick={() => setAttempt((n) => n + 1)} className="mt-4 rounded-full border border-white/20 px-5 py-2 text-sm font-semibold hover:border-white/50">{c.retry}</button>
          </div>
        )}

        {state === 'ok' && d && m && (
          <>
            <header className="mt-6 flex flex-wrap items-center gap-4">
              <img src={d.image.large} alt="" width={56} height={56} className="size-14 rounded-full" />
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {d.name} <span className="text-white/45">{d.symbol.toUpperCase()}</span>
                </h1>
                {d.market_cap_rank ? <p className="text-sm text-white/50">{c.rank(d.market_cap_rank)}</p> : null}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold tabular-nums">{usd(m.current_price.usd)}</p>
                <p className={`text-sm tabular-nums ${tone(m.price_change_percentage_24h)}`}>{pct(m.price_change_percentage_24h, lang)} 24{lang === 'nl' ? 'u' : 'h'}</p>
              </div>
            </header>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className={`${card} lg:col-span-2`}>
                <h2 className="sr-only">{c.chart}</h2>
                <TradingViewWidget
                  className="min-h-[360px]"
                  script="embed-widget-symbol-overview.js"
                  config={{
                    symbols: [[d.name, `CRYPTO:${d.symbol.toUpperCase()}USD|1D`]],
                    chartOnly: false,
                    width: '100%',
                    height: 360,
                    locale: lang === 'nl' ? 'nl_NL' : 'en',
                    colorTheme: 'dark',
                    isTransparent: true,
                    autosize: false,
                    showVolume: false,
                    scalePosition: 'right',
                    scaleMode: 'Normal',
                    chartType: 'area',
                    lineWidth: 2,
                    lineType: 0,
                    lineColor: 'rgba(218, 41, 28, 1)',
                    topColor: 'rgba(218, 41, 28, 0.25)',
                    bottomColor: 'rgba(218, 41, 28, 0)',
                    fontColor: 'rgb(106, 109, 120)',
                    gridLineColor: 'rgba(242, 242, 242, 0.06)',
                    dateRanges: ['12m|1D', '1m|30', '3m|60', '60m|1W', 'all|1M'],
                  }}
                />
                <p className="mt-2 text-xs text-white/40">{c.chartNote}</p>
              </div>
              <div className="grid gap-4">
                <section className={card}>
                  <h2 className="font-semibold">{c.market}</h2>
                  <dl className="mt-2 divide-y divide-white/5">
                    <Row k={c.mcap} v={usdBig(m.market_cap.usd)} />
                    {m.fully_diluted_valuation.usd ? <Row k={c.fdv} v={usdBig(m.fully_diluted_valuation.usd)} /> : null}
                    <Row k={c.vol} v={usdBig(m.total_volume.usd)} />
                    {m.low_24h.usd && m.high_24h.usd ? <Row k={c.range} v={`${usd(m.low_24h.usd)} – ${usd(m.high_24h.usd)}`} /> : null}
                  </dl>
                </section>
                <section className={card}>
                  <h2 className="font-semibold">{c.perf}</h2>
                  <dl className="mt-2 divide-y divide-white/5">
                    <Row k={c.d7} v={<span className={tone(m.price_change_percentage_7d)}>{pct(m.price_change_percentage_7d, lang)}</span>} />
                    <Row k={c.d30} v={<span className={tone(m.price_change_percentage_30d)}>{pct(m.price_change_percentage_30d, lang)}</span>} />
                    <Row k={c.y1} v={<span className={tone(m.price_change_percentage_1y)}>{pct(m.price_change_percentage_1y, lang)}</span>} />
                  </dl>
                </section>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <section className={card}>
                <h2 className="font-semibold">{c.supply}</h2>
                <dl className="mt-2 divide-y divide-white/5">
                  <Row k={c.circ} v={m.circulating_supply ? num(m.circulating_supply, lang) : '–'} />
                  <Row k={c.total} v={m.total_supply ? num(m.total_supply, lang) : '–'} />
                  <Row k={c.max} v={m.max_supply ? num(m.max_supply, lang) : m.max_supply_infinite ? c.infinite : '–'} />
                </dl>
                {supplyPct !== null ? (
                  <>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                      <div className="h-full rounded-full bg-[var(--wc-red)]" style={{ width: `${Math.min(100, supplyPct)}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-white/50">{c.ofMax(supplyPct.toFixed(1).replace('.', lang === 'nl' ? ',' : '.') + '%')}</p>
                  </>
                ) : null}
              </section>
              <section className={card}>
                <h2 className="font-semibold">{c.history}</h2>
                <dl className="mt-2 divide-y divide-white/5">
                  <Row k={`${c.ath} (${date(m.ath_date.usd, lang)})`} v={usd(m.ath.usd)} />
                  <Row k={c.fromAth} v={<span className={tone(m.ath_change_percentage.usd)}>{pct(m.ath_change_percentage.usd, lang)}</span>} />
                  <Row k={`${c.atl} (${date(m.atl_date.usd, lang)})`} v={usd(m.atl.usd)} />
                </dl>
              </section>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <section className={`${card} lg:col-span-2`}>
                <h2 className="font-semibold">
                  {c.about} {d.name}
                </h2>
                {lang === 'nl' && !descNl && desc.length ? <p className="mt-1 text-xs text-white/40">{c.aboutLang}</p> : null}
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/70">
                  {desc.length ? desc.slice(0, 6).map((x, i) => <p key={i}>{x}</p>) : <p>{c.noAbout}</p>}
                </div>
              </section>
              <div className="grid content-start gap-4">
                <section className={card}>
                  <h2 className="font-semibold">{c.facts}</h2>
                  <dl className="mt-2 divide-y divide-white/5">
                    {d.genesis_date ? <Row k={c.since} v={date(d.genesis_date, lang)} /> : null}
                    {d.hashing_algorithm ? <Row k={c.algo} v={d.hashing_algorithm} /> : null}
                  </dl>
                  {cats.length ? (
                    <>
                      <p className="mt-3 text-xs text-white/50">{c.cats}</p>
                      <ul className="mt-1.5 flex flex-wrap gap-1.5">
                        {cats.map((x) => (
                          <li key={x} className="rounded-full border border-white/15 px-2.5 py-0.5 text-xs text-white/70">{x}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </section>
                <section className={card}>
                  <h2 className="font-semibold">{c.links}</h2>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {safe(d.links.homepage[0]) ? <li><a href={safe(d.links.homepage[0])} target="_blank" rel="noopener nofollow" className="text-[var(--wc-red-soft)] hover:underline">{c.website}: {host(d.links.homepage[0])} ↗</a></li> : null}
                    {safe(d.links.whitepaper) ? <li><a href={safe(d.links.whitepaper)} target="_blank" rel="noopener nofollow" className="text-[var(--wc-red-soft)] hover:underline">{c.whitepaper} ↗</a></li> : null}
                    {d.links.blockchain_site.filter((u) => safe(u)).slice(0, 2).map((u) => (
                      <li key={u}><a href={u} target="_blank" rel="noopener nofollow" className="text-[var(--wc-red-soft)] hover:underline">{c.explorer}: {host(u)} ↗</a></li>
                    ))}
                    {safe(d.links.repos_url?.github?.[0]) ? <li><a href={safe(d.links.repos_url?.github?.[0])} target="_blank" rel="noopener nofollow" className="text-[var(--wc-red-soft)] hover:underline">{c.code} (GitHub) ↗</a></li> : null}
                  </ul>
                </section>
                {contracts.length ? (
                  <section className={card}>
                    <h2 className="font-semibold">{c.contracts}</h2>
                    <ul className="mt-2 space-y-2 text-sm">
                      {contracts.slice(0, 5).map(([chain, addr]) => (
                        <li key={chain} className="flex items-center justify-between gap-2">
                          <span className="min-w-0">
                            <span className="block text-xs text-white/50">{chain}</span>
                            <span className="block truncate font-mono text-xs">{addr}</span>
                          </span>
                          <a href={`${p.scanner}?q=${encodeURIComponent(addr)}`} className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 text-xs hover:border-[var(--wc-red)]">{c.scan}</a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            </div>

            <section className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[var(--wc-red)]/40 bg-[var(--wc-red)]/[0.06] p-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold">{c.askH}</h2>
                <p className="mt-1 max-w-2xl text-sm text-white/65">{c.askP}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <a href={p.products} className="rounded-full bg-[var(--wc-red)] px-5 py-2.5 text-center text-sm font-semibold text-white hover:brightness-110">{c.askBtn}</a>
                <a href={DISCORD_URL} className="rounded-full border border-white/20 px-5 py-2.5 text-center text-sm font-semibold hover:border-white/50">{c.join}</a>
              </div>
            </section>
            <p className="mt-4 text-xs text-white/40">{c.source}</p>
          </>
        )}
      </div>
    </main>
  )
}
