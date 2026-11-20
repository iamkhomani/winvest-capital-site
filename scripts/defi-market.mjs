// Daily DeFi market snapshot for the DeFi Scanner page: largest protocols, DEX volume, lending markets
// and stablecoin yields. DefiLlama's free endpoints are 2.5 to 10 MB each, too big for every visitor's
// browser, so this job reduces them to one small file: public/data/defi-market.json.
// Free public APIs only (DefiLlama). Runs in GitHub Actions once a day (deploy.yml).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const UA = { accept: 'application/json', 'user-agent': 'winvestcapital.nl data snapshot' }

async function get(url) {
  for (let i = 1; ; i++) {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(60_000) })
    if (r.ok) return r.json()
    if (i >= 3 || (r.status !== 429 && r.status < 500)) throw new Error(`${r.status} ${url}`)
    await new Promise((res) => setTimeout(res, 30_000))
  }
}

const round = (v, d = 2) => (typeof v === 'number' && Number.isFinite(v) ? +v.toFixed(d) : null)
const big = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : null)

// Categories that are not DeFi protocols in the usual sense (exchanges, bridges of chains themselves).
const NOT_DEFI = new Set(['CEX', 'Chain', 'Canonical Bridge'])

const [protocols, dexs, pools] = await Promise.all([
  get('https://api.llama.fi/protocols'),
  get('https://api.llama.fi/overview/dexs?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true'),
  get('https://yields.llama.fi/pools'),
])

const proto = (p) => ({ name: p.name, slug: p.slug, category: p.category, chains: Array.isArray(p.chains) ? p.chains.length : 0, tvl: big(p.tvl), ch1d: round(p.change_1d), ch7d: round(p.change_7d), logo: p.logo })
const defi = protocols.filter((p) => !NOT_DEFI.has(p.category) && typeof p.tvl === 'number' && p.tvl > 0).sort((a, b) => b.tvl - a.tvl)

const out = {
  generated: new Date().toISOString(),
  totalTvl: big(defi.reduce((s, p) => s + p.tvl, 0)),
  protocols: defi.slice(0, 12).map(proto),
  lending: defi.filter((p) => p.category === 'Lending').slice(0, 8).map(proto),
  dex: {
    total24h: big(dexs.total24h),
    ch1d: round(dexs.change_1d),
    ch7d: round(dexs.change_7dover7d),
    top: (dexs.protocols ?? [])
      .filter((p) => typeof p.total24h === 'number' && p.total24h > 0)
      .sort((a, b) => b.total24h - a.total24h)
      .slice(0, 10)
      .map((p) => ({ name: p.displayName || p.name, slug: p.slug, vol24h: big(p.total24h), ch1d: round(p.change_1d), chains: Array.isArray(p.chains) ? p.chains.length : 0, logo: p.logo })),
  },
  // Stablecoin pools only (no price risk on the deposit itself), at least $25M deposited, not flagged as outliers.
  // Sorted by the 30-day average APY so a one-day spike does not top the list.
  yields: (pools.data ?? [])
    .filter((p) => p.stablecoin && p.ilRisk === 'no' && p.exposure === 'single' && !p.outlier && p.tvlUsd >= 25e6 && p.apy > 0 && p.apy < 40 && typeof p.apyMean30d === 'number')
    .sort((a, b) => b.apyMean30d - a.apyMean30d)
    .slice(0, 10)
    .map((p) => ({ pool: p.pool, project: p.project, chain: p.chain, symbol: p.symbol, tvl: big(p.tvlUsd), apy: round(p.apy), apyBase: round(p.apyBase), apyReward: round(p.apyReward), apy30d: round(p.apyMean30d), meta: p.poolMeta ?? null })),
}

if (out.protocols.length < 5 || !out.dex.top.length) throw new Error('DefiLlama returned too little data; keeping the previous snapshot')
fs.writeFileSync(path.join(root, 'public/data/defi-market.json'), JSON.stringify(out) + '\n')
console.log('wrote public/data/defi-market.json', out.protocols.length, out.dex.top.length, out.yields.length)
