// One page per cryptocurrency. The top 100 have their own prerendered page (/markets/bitcoin/) with
// the project facts from the weekly snapshot in the HTML (good for search engines); any other coin
// opens /markets/coin/?id=… Live numbers are always loaded in the browser.
// Sources, all free: CoinGecko (market data, exchanges), DefiLlama (TVL, fees), GitHub (development).
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import TradingViewWidget from '../components/TradingViewWidget'
import { DISCORD_URL } from '../config'
import type { Lang } from '../i18n'
import { usePageData } from '../pageData'
import { paths } from '../paths'
import { usd, usdBig } from '../markets/pulse'

/** Static facts, from the snapshot (prerendered pages) or from the live CoinGecko answer. */
export type CoinFacts = {
  id: string
  name: string
  symbol: string
  image?: string
  about: string[]
  categories: string[]
  genesis: string | null
  algorithm: string | null
  links: { website?: string; whitepaper?: string; explorers: string[]; github?: string }
  contracts: [string, string][]
}

type Live = {
  rank: number | null
  price: number
  ch24?: number
  ch7?: number
  ch30?: number
  ch1y?: number
  mcap: number
  fdv?: number
  vol: number
  low?: number
  high?: number
  ath: number
  athCh: number
  athDate: string
  atl: number
  atlDate: string
  circ: number | null
  total: number | null
  max: number | null
  maxInfinite?: boolean
}

const copy = {
  en: {
    crumb: 'Markets',
    rank: (n: number) => `Rank #${n} by market cap`,
    loading: 'Loading coin data…',
    notFound: 'This coin could not be found. Check the link or pick a coin from the markets page.',
    error: 'Live data could not be loaded right now (the free data source limits how often we may ask). Please try again in a minute.',
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
    defi: 'On-chain and DeFi',
    tvl: 'Total value locked',
    chainTvl: 'Value locked on this chain',
    fees24: 'Fees 24h',
    fees30: 'Fees 30 days',
    category: 'Category',
    defiSrc: 'Source: DefiLlama',
    dev: 'Development',
    repo: 'Repository',
    stars: 'GitHub stars',
    commits: 'Commits, last 4 weeks',
    lastPush: 'Last code change',
    devNote: 'Activity in the main public repository on GitHub. Work in private or other repositories is not counted.',
    exchanges: 'Where it trades',
    showEx: 'Show exchanges',
    exNote: 'Largest markets by 24h volume on exchanges with a high CoinGecko trust score. Not a recommendation. Our own partners are on the',
    partners: 'partners page',
    pair: 'Pair',
    exVol: 'Volume 24h',
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
    error: 'De live gegevens konden nu niet worden geladen (de gratis databron beperkt hoe vaak we iets mogen opvragen). Probeer het over een minuut opnieuw.',
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
    defi: 'On-chain en DeFi',
    tvl: 'Total value locked',
    chainTvl: 'Vastgezette waarde op deze chain',
    fees24: 'Fees 24u',
    fees30: 'Fees 30 dagen',
    category: 'Categorie',
    defiSrc: 'Bron: DefiLlama',
    dev: 'Ontwikkeling',
    repo: 'Repository',
    stars: 'GitHub-sterren',
    commits: 'Commits, laatste 4 weken',
    lastPush: 'Laatste codewijziging',
    devNote: 'Activiteit in de belangrijkste openbare repository op GitHub. Werk in privé- of andere repositories telt niet mee.',
    exchanges: 'Waar het verhandeld wordt',
    showEx: 'Toon exchanges',
    exNote: 'Grootste markten op volume over 24 uur, bij exchanges met een hoge CoinGecko-trustscore. Geen aanbeveling. Onze eigen partners staan op de',
    partners: 'partnerpagina',
    pair: 'Paar',
    exVol: 'Volume 24u',
    askH: 'Dieper in dit project duiken?',
    askP: 'Leden van de One Percent Club vragen Market Whisper AI in Discord om een fundamentele analyse van elk project.',
    askBtn: 'Bekijk de One Percent Club',
    join: 'Word gratis lid van de Discord',
    source: 'Data: CoinGecko. Prijzen in Amerikaanse dollars. Uitsluitend educatief, geen financieel advies.',
  },
}

const NOISE = /portfolio|holdings|index|launchpad|made in|alleged|ftx|fan token/i
const CG = 'https://api.coingecko.com/api/v3'

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
const https = (u?: string) => (u && /^https:\/\//.test(u) ? u : undefined)
const paragraphs = (html = '') =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 6)

async function json<T>(url: string): Promise<T> {
  const r = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!r.ok) throw new Error(String(r.status))
  return (await r.json()) as T
}

const card = 'rounded-2xl border border-white/10 bg-white/[0.03] p-5'

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="text-sm text-white/55">{k}</dt>
      <dd className="text-right text-sm font-semibold tabular-nums">{v}</dd>
    </div>
  )
}

/* ---------- On-chain and DeFi (DefiLlama) ---------- */

function DefiCard({ id, lang }: { id: string; lang: Lang }) {
  const c = copy[lang]
  const [d, setD] = useState<{ tvl?: number; chainTvl?: number; f24?: number; f30?: number; category?: string } | null>(null)
  useEffect(() => {
    let alive = true
    ;(async () => {
      const map = await json<Record<string, { slug: string; category: string }>>('/data/llama.json').catch(() => ({}) as Record<string, { slug: string; category: string }>)
      // Foundations and treasuries are listed by DefiLlama too, but their 'TVL' is a treasury, not usage.
      const p = map[id] && !/foundation|treasury/i.test(map[id].category) ? map[id] : undefined
      const out: { tvl?: number; chainTvl?: number; f24?: number; f30?: number; category?: string } = {}
      if (p) {
        out.category = p.category
        const [tvl, fees] = await Promise.all([
          json<number>(`https://api.llama.fi/tvl/${p.slug}`).catch(() => undefined),
          json<{ total24h?: number; total30d?: number }>(`https://api.llama.fi/summary/fees/${p.slug}?dataType=dailyFees&excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`).catch(() => undefined),
        ])
        if (typeof tvl === 'number') out.tvl = tvl
        out.f24 = fees?.total24h
        out.f30 = fees?.total30d
      }
      const chains = await json<{ gecko_id: string | null; tvl: number }[]>('https://api.llama.fi/v2/chains').catch(() => [])
      const chain = chains.find((x) => x.gecko_id === id)
      if (chain && chain.tvl > 0) out.chainTvl = chain.tvl
      if (alive && (out.tvl || out.chainTvl || out.f24 || out.f30)) setD(out)
    })()
    return () => {
      alive = false
    }
  }, [id])
  if (!d) return null
  return (
    <section className={card}>
      <h2 className="font-semibold">{c.defi}</h2>
      <dl className="mt-2 divide-y divide-white/5">
        {d.chainTvl ? <Row k={c.chainTvl} v={usdBig(d.chainTvl)} /> : null}
        {d.tvl ? <Row k={c.tvl} v={usdBig(d.tvl)} /> : null}
        {d.f24 ? <Row k={c.fees24} v={usdBig(d.f24)} /> : null}
        {d.f30 ? <Row k={c.fees30} v={usdBig(d.f30)} /> : null}
        {d.category ? <Row k={c.category} v={d.category} /> : null}
      </dl>
      <p className="mt-2 text-xs text-white/40">{c.defiSrc}</p>
    </section>
  )
}

/* ---------- Development (GitHub) ---------- */

function DevCard({ github, lang }: { github?: string; lang: Lang }) {
  const c = copy[lang]
  const [d, setD] = useState<{ repo: string; url: string; stars: number; pushed: string; commits?: number } | null>(null)
  useEffect(() => {
    if (!github) return
    let alive = true
    ;(async () => {
      const m = github.match(/^https:\/\/github\.com\/([\w.-]+)(?:\/([\w.-]+))?/i)
      if (!m) return
      let full = m[2] ? `${m[1]}/${m[2].replace(/\.git$/, '')}` : ''
      if (!full) {
        // An organisation link: take its most recently changed public repository.
        const repos = await json<{ full_name: string }[]>(`https://api.github.com/orgs/${m[1]}/repos?sort=pushed&per_page=1`).catch(() => [])
        full = repos[0]?.full_name ?? ''
      }
      if (!full) return
      const repo = await json<{ full_name: string; html_url: string; stargazers_count: number; pushed_at: string }>(`https://api.github.com/repos/${full}`).catch(() => null)
      if (!repo) return
      const part = await json<{ all?: number[] }>(`https://api.github.com/repos/${full}/stats/participation`).catch(() => null)
      const commits = part?.all?.length ? part.all.slice(-4).reduce((a, b) => a + b, 0) : undefined
      if (alive) setD({ repo: repo.full_name, url: repo.html_url, stars: repo.stargazers_count, pushed: repo.pushed_at, commits })
    })()
    return () => {
      alive = false
    }
  }, [github])
  if (!d) return null
  return (
    <section className={card}>
      <h2 className="font-semibold">{c.dev}</h2>
      <dl className="mt-2 divide-y divide-white/5">
        <Row k={c.repo} v={<a href={d.url} target="_blank" rel="noopener nofollow" className="text-[var(--wc-red-soft)] hover:underline">{d.repo}</a>} />
        <Row k={c.stars} v={num(d.stars, lang)} />
        {d.commits !== undefined ? <Row k={c.commits} v={num(d.commits, lang)} /> : null}
        <Row k={c.lastPush} v={date(d.pushed, lang)} />
      </dl>
      <p className="mt-2 text-xs text-white/40">{c.devNote}</p>
    </section>
  )
}

/* ---------- Exchanges (CoinGecko tickers, on request to spare the rate limit) ---------- */

type Ticker = { base: string; target: string; market: { name: string }; converted_volume: { usd: number }; trade_url: string | null; is_stale: boolean; is_anomaly: boolean; trust_score: string | null }

function Exchanges({ id, lang }: { id: string; lang: Lang }) {
  const c = copy[lang]
  const [rows, setRows] = useState<Ticker[] | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const load = () => {
    setState('loading')
    json<{ tickers: Ticker[] }>(`${CG}/coins/${id}/tickers?include_exchange_logo=false&order=volume_desc&depth=false`)
      .then((r) => {
        const seen = new Set<string>()
        const list = r.tickers.filter((t) => t.trust_score === 'green' && !t.is_stale && !t.is_anomaly && !seen.has(t.market.name) && seen.add(t.market.name)).slice(0, 10)
        setRows(list)
        setState('idle')
      })
      .catch(() => setState('error'))
  }
  return (
    <section className={card}>
      <h2 className="font-semibold">{c.exchanges}</h2>
      {!rows ? (
        <>
          <button type="button" onClick={load} disabled={state === 'loading'} className="mt-3 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition hover:border-white/50 disabled:opacity-50">
            {state === 'loading' ? '…' : c.showEx}
          </button>
          {state === 'error' ? <p className="mt-2 text-xs text-[var(--wc-red-soft)]">{c.error}</p> : null}
        </>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-white/45">
              <tr>
                <th className="py-1.5 font-medium">Exchange</th>
                <th className="py-1.5 font-medium">{c.pair}</th>
                <th className="py-1.5 text-right font-medium">{c.exVol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((t) => (
                <tr key={t.market.name}>
                  <td className="py-1.5 font-medium">{t.market.name}</td>
                  <td className="py-1.5 text-white/65">{t.base.length > 10 ? '…' : t.base}/{t.target.length > 10 ? '…' : t.target}</td>
                  <td className="py-1.5 text-right tabular-nums text-white/75">{usdBig(t.converted_volume.usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-xs text-white/40">
        {c.exNote}{' '}
        <a href={paths[lang].partners} className="text-[var(--wc-red-soft)] hover:underline">{c.partners}</a>.
      </p>
    </section>
  )
}

/* ---------- Page ---------- */

type CgDetail = {
  id: string
  symbol: string
  name: string
  categories: (string | null)[]
  description: { en?: string; nl?: string }
  links: { homepage: string[]; whitepaper?: string; blockchain_site: string[]; repos_url?: { github?: string[] } }
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

const factsFrom = (d: CgDetail): CoinFacts => ({
  id: d.id,
  name: d.name,
  symbol: d.symbol.toUpperCase(),
  image: d.image.large,
  about: paragraphs(d.description.en),
  categories: d.categories.filter((x): x is string => !!x && !NOISE.test(x)).slice(0, 8),
  genesis: d.genesis_date,
  algorithm: d.hashing_algorithm,
  links: { website: https(d.links.homepage[0]), whitepaper: https(d.links.whitepaper), explorers: d.links.blockchain_site.filter((u) => !!https(u)).slice(0, 2), github: https(d.links.repos_url?.github?.[0]) },
  contracts: Object.entries(d.platforms).filter(([k, v]) => k && v).slice(0, 5) as [string, string][],
})

const liveFrom = (d: CgDetail): Live => {
  const m = d.market_data
  return {
    rank: d.market_cap_rank,
    price: m.current_price.usd,
    ch24: m.price_change_percentage_24h,
    ch7: m.price_change_percentage_7d,
    ch30: m.price_change_percentage_30d,
    ch1y: m.price_change_percentage_1y,
    mcap: m.market_cap.usd,
    fdv: m.fully_diluted_valuation.usd,
    vol: m.total_volume.usd,
    low: m.low_24h.usd,
    high: m.high_24h.usd,
    ath: m.ath.usd,
    athCh: m.ath_change_percentage.usd,
    athDate: m.ath_date.usd,
    atl: m.atl.usd,
    atlDate: m.atl_date.usd,
    circ: m.circulating_supply,
    total: m.total_supply,
    max: m.max_supply,
    maxInfinite: m.max_supply_infinite,
  }
}

export default function Coin({ lang, id: fixedId }: { lang: Lang; id?: string }) {
  const c = copy[lang]
  const snapshot = usePageData<CoinFacts>()
  const [id, setId] = useState<string | null>(fixedId ?? null)
  const [facts, setFacts] = useState<CoinFacts | null>(snapshot)
  const [live, setLive] = useState<Live | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'notfound' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (fixedId) return
    const q = new URLSearchParams(location.search).get('id')
    setId(q && /^[a-z0-9-]{1,80}$/.test(q) ? q : '')
  }, [fixedId])

  useEffect(() => {
    if (id === null) return
    if (!id) {
      setState('notfound')
      return
    }
    let alive = true
    setState('loading')
    json<CgDetail>(`${CG}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
      .then((d) => {
        if (!alive) return
        setLive(liveFrom(d))
        if (!snapshot) {
          setFacts(factsFrom(d))
          document.title = `${d.name} (${d.symbol.toUpperCase()}) | Winvest Capital`
        }
        setState('ok')
      })
      .catch((e: Error) => alive && setState(e.message === '404' ? 'notfound' : 'error'))
    return () => {
      alive = false
    }
  }, [id, attempt, snapshot])

  const p = paths[lang]
  const f = facts
  const m = live
  const supplyPct = m && m.max && m.circ ? (m.circ / m.max) * 100 : null
  const dash = '–'

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/12 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-white/45">
          <a href={p.home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span>{' '}
          <a href={p.markets} className="hover:text-white">{c.crumb}</a>
          {f ? <> <span aria-hidden="true">/</span> {f.name}</> : null}
        </nav>

        {!f && state === 'loading' && <p className="mt-10 text-white/60">{c.loading}</p>}
        {!f && state === 'notfound' && <p className="mt-10 text-white/70">{c.notFound}</p>}
        {state === 'error' && (
          <div className="mt-6 rounded-xl border border-white/10 p-4">
            <p className="text-sm text-white/70">{c.error}</p>
            <button type="button" onClick={() => setAttempt((n) => n + 1)} className="mt-3 rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold hover:border-white/50">{c.retry}</button>
          </div>
        )}

        {f && (
          <>
            <header className="mt-6 flex flex-wrap items-center gap-4">
              {f.image ? <img src={f.image} alt="" width={56} height={56} className="size-14 rounded-full" /> : null}
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {f.name} <span className="text-white/45">{f.symbol}</span>
                </h1>
                {m?.rank ? <p className="text-sm text-white/50">{c.rank(m.rank)}</p> : null}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold tabular-nums">{m ? usd(m.price) : dash}</p>
                <p className={`text-sm tabular-nums ${tone(m?.ch24)}`}>{m ? `${pct(m.ch24, lang)} 24${lang === 'nl' ? 'u' : 'h'}` : ' '}</p>
              </div>
            </header>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className={`${card} lg:col-span-2`}>
                <h2 className="sr-only">{c.chart}</h2>
                <TradingViewWidget
                  className="min-h-[360px]"
                  script="embed-widget-symbol-overview.js"
                  config={{
                    symbols: [[f.name, `CRYPTO:${f.symbol}USD|1D`]],
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
                    <Row k={c.mcap} v={m ? usdBig(m.mcap) : dash} />
                    {m?.fdv ? <Row k={c.fdv} v={usdBig(m.fdv)} /> : null}
                    <Row k={c.vol} v={m ? usdBig(m.vol) : dash} />
                    {m?.low && m.high ? <Row k={c.range} v={`${usd(m.low)} – ${usd(m.high)}`} /> : null}
                  </dl>
                </section>
                <section className={card}>
                  <h2 className="font-semibold">{c.perf}</h2>
                  <dl className="mt-2 divide-y divide-white/5">
                    <Row k={c.d7} v={<span className={tone(m?.ch7)}>{pct(m?.ch7, lang)}</span>} />
                    <Row k={c.d30} v={<span className={tone(m?.ch30)}>{pct(m?.ch30, lang)}</span>} />
                    <Row k={c.y1} v={<span className={tone(m?.ch1y)}>{pct(m?.ch1y, lang)}</span>} />
                  </dl>
                </section>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <section className={card}>
                <h2 className="font-semibold">{c.supply}</h2>
                <dl className="mt-2 divide-y divide-white/5">
                  <Row k={c.circ} v={m?.circ ? num(m.circ, lang) : dash} />
                  <Row k={c.total} v={m?.total ? num(m.total, lang) : dash} />
                  <Row k={c.max} v={m?.max ? num(m.max, lang) : m?.maxInfinite ? c.infinite : dash} />
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
                  <Row k={m ? `${c.ath} (${date(m.athDate, lang)})` : c.ath} v={m ? usd(m.ath) : dash} />
                  <Row k={c.fromAth} v={<span className={tone(m?.athCh)}>{pct(m?.athCh, lang)}</span>} />
                  <Row k={m ? `${c.atl} (${date(m.atlDate, lang)})` : c.atl} v={m ? usd(m.atl) : dash} />
                </dl>
              </section>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="grid content-start gap-4 lg:col-span-2">
                <section className={card}>
                  <h2 className="font-semibold">
                    {c.about} {f.name}
                  </h2>
                  {lang === 'nl' && f.about.length ? <p className="mt-1 text-xs text-white/40">{c.aboutLang}</p> : null}
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/70">
                    {f.about.length ? f.about.map((x, i) => <p key={i}>{x}</p>) : <p>{c.noAbout}</p>}
                  </div>
                </section>
                <div className="grid gap-4 md:grid-cols-2">
                  <DefiCard id={f.id} lang={lang} />
                  <DevCard github={f.links.github} lang={lang} />
                </div>
                <Exchanges id={f.id} lang={lang} />
              </div>
              <div className="grid content-start gap-4">
                {f.genesis || f.algorithm || f.categories.length ? (
                  <section className={card}>
                    <h2 className="font-semibold">{c.facts}</h2>
                    <dl className="mt-2 divide-y divide-white/5">
                      {f.genesis ? <Row k={c.since} v={date(f.genesis, lang)} /> : null}
                      {f.algorithm ? <Row k={c.algo} v={f.algorithm} /> : null}
                    </dl>
                    {f.categories.length ? (
                      <>
                        <p className="mt-3 text-xs text-white/50">{c.cats}</p>
                        <ul className="mt-1.5 flex flex-wrap gap-1.5">
                          {f.categories.map((x) => (
                            <li key={x} className="rounded-full border border-white/15 px-2.5 py-0.5 text-xs text-white/70">{x}</li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                  </section>
                ) : null}
                <section className={card}>
                  <h2 className="font-semibold">{c.links}</h2>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {f.links.website ? <li><a href={f.links.website} target="_blank" rel="noopener nofollow" className="text-[var(--wc-red-soft)] hover:underline">{c.website}: {host(f.links.website)} ↗</a></li> : null}
                    {f.links.whitepaper ? <li><a href={f.links.whitepaper} target="_blank" rel="noopener nofollow" className="text-[var(--wc-red-soft)] hover:underline">{c.whitepaper} ↗</a></li> : null}
                    {f.links.explorers.map((u) => (
                      <li key={u}><a href={u} target="_blank" rel="noopener nofollow" className="text-[var(--wc-red-soft)] hover:underline">{c.explorer}: {host(u)} ↗</a></li>
                    ))}
                    {f.links.github ? <li><a href={f.links.github} target="_blank" rel="noopener nofollow" className="text-[var(--wc-red-soft)] hover:underline">{c.code} (GitHub) ↗</a></li> : null}
                  </ul>
                </section>
                {f.contracts.length ? (
                  <section className={card}>
                    <h2 className="font-semibold">{c.contracts}</h2>
                    <ul className="mt-2 space-y-2 text-sm">
                      {f.contracts.map(([chain, addr]) => (
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
