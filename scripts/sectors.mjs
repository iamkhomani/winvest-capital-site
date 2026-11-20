// Crypto sector per coin, from CoinGecko categories. Used by the weekly data job (fetch-data.mjs)
// to write public/data/sectors.json for the portfolio tracker. Run directly to rebuild the file
// from the current snapshot in data/coins.json:  node scripts/sectors.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// First match wins, so the more specific groups come first.
const RULES = [
  ['stable', /stablecoin/i],
  ['rwa', /tokenized (gold|commodities|treasuries|assets|stock)|real world assets/i],
  ['meme', /meme|dog-themed|cat-themed|frog-themed|4chan/i],
  ['exchange', /\bcentralized exchange/i],
  ['infra', /oracle/i],
  ['ai', /artificial intelligence|\bai\b/i],
  ['privacy', /privacy/i],
  ['defi', /decentralized finance|decentralized exchange|lending|derivatives|perpetuals|yield|automated market maker|liquid staking/i],
  ['l2', /layer 2|zero knowledge|rollup/i],
  ['l1', /layer 1|smart contract platform|layer 0|proof of work/i],
  ['infra', /infrastructure|oracle|depin|storage|interoperability|wallets|bridge/i],
]

export function sectorOf(categories = []) {
  for (const [code, re] of RULES) if (categories.some((c) => re.test(c))) return code
  return 'other'
}

export function buildSectors(coins) {
  const byId = {}
  const bySymbol = {}
  for (const c of Object.values(coins)) {
    const code = sectorOf(c.categories)
    byId[c.id] = code
    if (!bySymbol[c.symbol]) bySymbol[c.symbol] = code // ranked order: the larger coin keeps the symbol
  }
  return { byId, bySymbol }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const { coins } = JSON.parse(fs.readFileSync(path.join(root, 'data/coins.json'), 'utf8'))
  const out = buildSectors(coins)
  fs.writeFileSync(path.join(root, 'public/data/sectors.json'), JSON.stringify(out) + '\n')
  const count = {}
  for (const v of Object.values(out.byId)) count[v] = (count[v] || 0) + 1
  console.log('wrote public/data/sectors.json', count)
}
