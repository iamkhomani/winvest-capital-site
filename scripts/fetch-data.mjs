// Refreshes the market data snapshot the site is built with. Runs in GitHub Actions on a weekly
// schedule (and on demand), never on a normal push, so builds stay fast and predictable.
//
// Writes:
//   src/data/coin-index.json  small list of the top 100 coins (id, name, symbol, rank) -> routes
//   data/coins.json           facts per coin (description, links, categories, holder concentration) -> prerendered coin pages only
//   public/data/llama.json    CoinGecko id -> DefiLlama protocol slug, so coin pages can show TVL and fees
//   public/data/sectors.json  crypto sector per coin (from CoinGecko categories) for the portfolio tracker
//
// Free public APIs only (CoinGecko, DefiLlama). CoinGecko allows roughly 30 requests a minute,
// so detail requests are spaced out and retried after a pause when it says 429.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSectors } from './sectors.mjs'
import { holdersFor } from './holders.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CG = 'https://api.coingecko.com/api/v3'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(url, tries = 4) {
  for (let i = 1; ; i++) {
    const r = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'winvestcapital.nl data snapshot' } })
    if (r.ok) return r.json()
    if (i >= tries || (r.status !== 429 && r.status < 500)) throw new Error(`${r.status} ${url}`)
    console.log(`  ${r.status}, waiting before retry ${i}`)
    await sleep(65_000)
  }
}

const write = (rel, value) => {
  const file = path.join(root, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(value, null, rel.startsWith('public') ? 0 : 1) + '\n')
  console.log('wrote', rel)
}

const clean = (html = '') =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 6)
const https = (u) => (typeof u === 'string' && /^https:\/\//.test(u) ? u : undefined)
const NOISE = /portfolio|holdings|index|launchpad|made in|alleged|ftx|fan token/i

// 1. Top 100 by market cap
const markets = await get(`${CG}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`)
const index = markets.map((c) => ({ id: c.id, name: c.name, symbol: c.symbol.toUpperCase(), rank: c.market_cap_rank, image: c.image }))
if (index.length < 50) throw new Error('Too few coins returned, keeping the old snapshot')

// 2. Facts per coin (description, links, categories). Spaced out for the rate limit.
const coins = {}
for (const [i, c] of index.entries()) {
  try {
    const d = await get(`${CG}/coins/${c.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`)
    coins[c.id] = {
      id: c.id,
      name: d.name,
      symbol: d.symbol.toUpperCase(),
      image: d.image?.large,
      about: clean(d.description?.en),
      categories: (d.categories ?? []).filter((x) => x && !NOISE.test(x)).slice(0, 8),
      genesis: d.genesis_date ?? null,
      algorithm: d.hashing_algorithm ?? null,
      links: {
        website: https(d.links?.homepage?.[0]),
        whitepaper: https(d.links?.whitepaper),
        explorers: (d.links?.blockchain_site ?? []).filter(https).slice(0, 2),
        github: https(d.links?.repos_url?.github?.[0]),
      },
      contracts: Object.entries(d.platforms ?? {}).filter(([k, v]) => k && v).slice(0, 5),
    }
    console.log(`${i + 1}/${index.length} ${c.id}`)
  } catch (e) {
    console.log(`skip ${c.id}: ${e.message}`)
  }
  await sleep(2600)
}

// 3. Holder concentration (Blockscout for EVM chains, public Solana RPC) for coins with a token contract
for (const c of Object.values(coins)) {
  if (!c.contracts?.length) continue
  const h = await holdersFor(c.contracts)
  if (h) c.holders = h
  await sleep(400)
}
console.log('holders:', Object.values(coins).filter((c) => c.holders).length)

// 4. DefiLlama protocols that have a CoinGecko id
const protocols = await get('https://api.llama.fi/protocols')
const llama = {}
for (const p of protocols) {
  if (!p.gecko_id || llama[p.gecko_id] || p.category === 'CEX') continue
  llama[p.gecko_id] = { slug: p.slug, category: p.category }
}

write('src/data/coin-index.json', index.filter((c) => coins[c.id]).map(({ id, name, symbol, rank }) => ({ id, name, symbol, rank })))
write('data/coins.json', { updated: new Date().toISOString().slice(0, 10), coins })
write('public/data/llama.json', llama)
write('public/data/sectors.json', buildSectors(coins))
