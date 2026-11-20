// Holder concentration per coin for the weekly data snapshot (see fetch-data.mjs).
// Free public sources only: Blockscout (EVM chains) and the public Solana RPC.
// For each coin we use one chain where its token contract lives, in the order below.
// Native coins without a token contract (BTC, ETH, SOL, ...) get no holder data.

const EVM = {
  ethereum: { chain: 'Ethereum', host: 'https://eth.blockscout.com' },
  base: { chain: 'Base', host: 'https://base.blockscout.com' },
  'arbitrum-one': { chain: 'Arbitrum', host: 'https://arbitrum.blockscout.com' },
  'optimistic-ethereum': { chain: 'Optimism', host: 'https://explorer.optimism.io' },
  'polygon-pos': { chain: 'Polygon', host: 'https://polygon.blockscout.com' },
}
const ORDER = ['ethereum', 'solana', 'base', 'arbitrum-one', 'optimistic-ethereum', 'polygon-pos']
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com'

const headers = { accept: 'application/json', 'user-agent': 'winvestcapital.nl data snapshot' }
async function getJson(url, init, tries = 4) {
  for (let i = 1; ; i++) {
    const r = await fetch(url, { ...init, headers: { ...headers, ...(init?.headers || {}) }, signal: AbortSignal.timeout(30000) })
    if (r.ok) return r.json()
    // The public Solana RPC answers 429 when busy: wait and try again
    if (r.status !== 429 || i >= tries) throw new Error(`${r.status} ${url}`)
    await new Promise((res) => setTimeout(res, 15000 * i))
  }
}

// Big integer string with `dec` decimals -> number (precision is fine for percentages)
const units = (v, dec) => Number(BigInt(v)) / 10 ** Number(dec || 0)
const short = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`

async function evmHolders(platform, address) {
  const { chain, host } = EVM[platform]
  const tok = await getJson(`${host}/api/v2/tokens/${address}`)
  const list = await getJson(`${host}/api/v2/tokens/${address}/holders`)
  const supply = units(tok.total_supply, tok.decimals)
  const items = (list.items || []).map((i) => ({
    share: supply > 0 ? units(i.value, tok.decimals) / supply : 0,
    label: i.address?.name || (i.address?.public_tags || [])[0]?.display_name || short(i.address?.hash || ''),
    contract: !!i.address?.is_contract,
    url: `${host}/address/${i.address?.hash}`,
  }))
  return { chain, explorer: `${host}/token/${address}`, holders: Number(tok.holders_count ?? tok.holders) || null, items }
}

async function solanaHolders(mint) {
  const rpc = (method, params) =>
    getJson(SOLANA_RPC, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) }).then((j) => {
      if (j.error) throw new Error(j.error.message)
      return j.result
    })
  const supply = (await rpc('getTokenSupply', [mint])).value.uiAmount
  const largest = (await rpc('getTokenLargestAccounts', [mint])).value
  const items = largest.map((a) => ({
    share: supply > 0 ? a.uiAmount / supply : 0,
    label: short(a.address),
    contract: false, // token accounts; we cannot tell owners apart without extra calls
    url: `https://solscan.io/account/${a.address}`,
  }))
  return { chain: 'Solana', explorer: `https://solscan.io/token/${mint}`, holders: null, items, accounts: true }
}

/** Holder summary for one coin, or null. `contracts` is [[platform, address], ...] from CoinGecko. */
export async function holdersFor(contracts) {
  const byPlatform = Object.fromEntries(contracts)
  for (const p of ORDER) {
    const addr = byPlatform[p]
    if (!addr) continue
    try {
      const r = p === 'solana' ? await solanaHolders(addr) : await evmHolders(p, addr)
      const items = r.items.filter((i) => i.share > 0).sort((a, b) => b.share - a.share)
      if (!items.length) continue
      const sum = (n) => items.slice(0, n).reduce((s, i) => s + i.share, 0)
      return {
        chain: r.chain,
        explorer: r.explorer,
        holders: r.holders,
        accounts: !!r.accounts,
        top10: +sum(10).toFixed(4),
        top10Contracts: +items.slice(0, 10).filter((i) => i.contract).reduce((s, i) => s + i.share, 0).toFixed(4),
        top50: items.length >= 50 ? +sum(50).toFixed(4) : null,
        top: items.slice(0, 5).map((i) => ({ label: String(i.label).slice(0, 40), share: +i.share.toFixed(4), contract: i.contract, url: i.url })),
      }
    } catch (e) {
      console.log(`  holders ${p} ${addr}: ${e.message}`)
    }
  }
  return null
}
