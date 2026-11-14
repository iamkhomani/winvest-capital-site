// Wallet tracking for the portfolio: reads balances of public crypto addresses straight from
// public blockchain APIs in the visitor's browser. Addresses and balances are only stored on the
// visitor's own device. No API keys, no Winvest servers.
// Sources: Blockscout (Ethereum, Base, Arbitrum, Optimism, Polygon), public RPC nodes (BNB Chain, XDC),
// Jupiter (Solana), Blockstream (Bitcoin), XRPL cluster (XRP), CoinGecko and DexScreener (prices).
/* eslint-disable @typescript-eslint/no-explicit-any */

export type WalletType = 'evm' | 'solana' | 'bitcoin' | 'xrpl'
export type Wallet = { id: string; type: WalletType; address: string; label?: string }

export type WalletToken = {
  key: string // `${chain}:${contract|native}`
  wallet: string // Wallet.id
  chain: string // display name, e.g. 'Ethereum'
  symbol: string
  name: string
  qty: number
  priceUsd?: number
  change24h?: number
  image?: string
  native?: boolean
}

export type WalletSync = { at: number; tokens: WalletToken[]; errors: Record<string, string[]>; ids?: string[] }

const CACHE_KEY = 'wc-portfolio-wallets-cache'
export const MIN_USD = 0.5 // hide dust and spam below this value

async function getJson(url: string, init?: RequestInit, timeout = 20000): Promise<any> {
  const r = await fetch(url, { ...init, signal: AbortSignal.timeout(timeout) })
  if (r.status === 404) return null
  if (!r.ok) throw new Error(String(r.status))
  return r.json()
}
async function rpc(url: string, method: string, params: unknown[]): Promise<any> {
  const j = await getJson(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) })
  if (j?.error) throw new Error(j.error.message || 'rpc error')
  return j?.result
}
const units = (raw: string | number | bigint, decimals: number) => {
  const s = BigInt(raw).toString().padStart(decimals + 1, '0')
  return Number(s.slice(0, s.length - decimals) + '.' + s.slice(s.length - decimals))
}

// ---------------- address detection ----------------
export function detectWallet(input: string): { type: WalletType; address: string } | null {
  const s = input.trim()
  if (/^0x[0-9a-fA-F]{40}$/.test(s)) return { type: 'evm', address: s }
  if (/^xdc[0-9a-fA-F]{40}$/i.test(s)) return { type: 'evm', address: '0x' + s.slice(3) }
  if (/^(bc1[ac-hj-np-z02-9]{11,71}|[13][1-9A-HJ-NP-Za-km-z]{25,34})$/.test(s)) return { type: 'bitcoin', address: s }
  if (/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(s)) return { type: 'xrpl', address: s }
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)) return { type: 'solana', address: s }
  return null
}

// ---------------- native coin prices (CoinGecko, USD) ----------------
const NATIVE_CG: Record<string, string> = {
  ETH: 'ethereum', BNB: 'binancecoin', POL: 'polygon-ecosystem-token', XDC: 'xdce-crowd-sale', SOL: 'solana', BTC: 'bitcoin', XRP: 'ripple',
}
async function nativePrices(): Promise<Record<string, { usd: number; change?: number }>> {
  const ids = [...new Set(Object.values(NATIVE_CG))].join(',')
  const j = await getJson(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`).catch(() => null)
  const out: Record<string, { usd: number; change?: number }> = {}
  for (const [sym, id] of Object.entries(NATIVE_CG)) if (j?.[id]?.usd) out[sym] = { usd: j[id].usd, change: j[id].usd_24h_change }
  return out
}

// ---------------- EVM ----------------
const BLOCKSCOUT: { chain: string; host: string; symbol: string; name: string }[] = [
  { chain: 'Ethereum', host: 'https://eth.blockscout.com', symbol: 'ETH', name: 'Ether' },
  { chain: 'Base', host: 'https://base.blockscout.com', symbol: 'ETH', name: 'Ether' },
  { chain: 'Arbitrum', host: 'https://arbitrum.blockscout.com', symbol: 'ETH', name: 'Ether' },
  { chain: 'Optimism', host: 'https://explorer.optimism.io', symbol: 'ETH', name: 'Ether' },
  { chain: 'Polygon', host: 'https://polygon.blockscout.com', symbol: 'POL', name: 'Polygon' },
]
const SPAM = /(https?:|www\.|\.com|\.io|\.xyz|\.org|claim|visit|reward|airdrop|voucher|\$\s?\d)/i

async function blockscoutChain(w: Wallet, b: (typeof BLOCKSCOUT)[number]): Promise<WalletToken[]> {
  const [addr, toks] = await Promise.all([
    getJson(`${b.host}/api/v2/addresses/${w.address}`),
    getJson(`${b.host}/api/v2/addresses/${w.address}/token-balances`),
  ])
  const out: WalletToken[] = []
  if (addr?.coin_balance && addr.coin_balance !== '0') {
    out.push({ key: `${b.chain}:native`, wallet: w.id, chain: b.chain, symbol: b.symbol, name: b.name, qty: units(addr.coin_balance, 18), priceUsd: addr.exchange_rate ? Number(addr.exchange_rate) : undefined, native: true })
  }
  for (const t of (toks as any[]) || []) {
    const tk = t.token || {}
    if (tk.type !== 'ERC-20' || !t.value || t.value === '0') continue
    if (tk.reputation && tk.reputation !== 'ok') continue
    if (SPAM.test(`${tk.name} ${tk.symbol}`)) continue
    const price = tk.exchange_rate ? Number(tk.exchange_rate) : undefined
    if (!price) continue // unpriced tokens are almost always spam or illiquid
    if (Number(tk.volume_24h ?? 0) < 100) continue // no real market: airdropped dust and spam
    const qty = units(t.value, Number(tk.decimals || 18))
    out.push({ key: `${b.chain}:${String(tk.address_hash || tk.address).toLowerCase()}`, wallet: w.id, chain: b.chain, symbol: String(tk.symbol || '?').slice(0, 16), name: String(tk.name || tk.symbol || '').slice(0, 60), qty, priceUsd: price, image: typeof tk.icon_url === 'string' && tk.icon_url.startsWith('https://') ? tk.icon_url : undefined })
  }
  return out
}

// BNB Chain has no free token indexer with CORS, so we check BNB plus the most used BEP-20 tokens.
const BSC_RPC = 'https://bsc-rpc.publicnode.com'
const BSC_TOKENS = [
  '0x55d398326f99059fF775485246999027B3197955', // USDT
  '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
  '0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409', // FDUSD
  '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
  '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // ETH
  '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // BTCB
  '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
  '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE', // XRP
  '0xbA2aE424d960c26247Dd6c32edC70B295c744C43', // DOGE
  '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47', // ADA
  '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD', // LINK
]
const pad = (a: string) => a.toLowerCase().replace(/^0x/, '').padStart(64, '0')

async function bscChain(w: Wallet, natives: Record<string, { usd: number; change?: number }>): Promise<WalletToken[]> {
  const out: WalletToken[] = []
  const bal = await rpc(BSC_RPC, 'eth_getBalance', [w.address, 'latest'])
  if (bal && BigInt(bal) > 0n) out.push({ key: 'BNB Chain:native', wallet: w.id, chain: 'BNB Chain', symbol: 'BNB', name: 'BNB', qty: units(BigInt(bal), 18), priceUsd: natives.BNB?.usd, change24h: natives.BNB?.change, native: true })
  const held: { addr: string; raw: bigint }[] = []
  await Promise.all(
    BSC_TOKENS.map(async (t) => {
      const r = await rpc(BSC_RPC, 'eth_call', [{ to: t, data: '0x70a08231' + pad(w.address) }, 'latest']).catch(() => null)
      if (r && r !== '0x' && BigInt(r) > 0n) held.push({ addr: t, raw: BigInt(r) })
    }),
  )
  if (!held.length) return out
  const pairs: any[] = (await getJson(`https://api.dexscreener.com/tokens/v1/bsc/${held.map((h) => h.addr).join(',')}`).catch(() => null)) || []
  for (const h of held) {
    const dec = await rpc(BSC_RPC, 'eth_call', [{ to: h.addr, data: '0x313ce567' }, 'latest']).then((r) => Number(BigInt(r))).catch(() => 18)
    const best = pairs.filter((p) => p.baseToken?.address?.toLowerCase() === h.addr.toLowerCase()).sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0]
    out.push({ key: `BNB Chain:${h.addr.toLowerCase()}`, wallet: w.id, chain: 'BNB Chain', symbol: best?.baseToken?.symbol ?? '?', name: best?.baseToken?.name ?? h.addr, qty: units(h.raw, dec), priceUsd: best?.priceUsd ? Number(best.priceUsd) : undefined, change24h: best?.priceChange?.h24, image: best?.info?.imageUrl })
  }
  return out
}

async function xdcChain(w: Wallet, natives: Record<string, { usd: number; change?: number }>): Promise<WalletToken[]> {
  const bal = await rpc('https://rpc.xinfin.network', 'eth_getBalance', [w.address, 'latest'])
  if (!bal || BigInt(bal) === 0n) return []
  return [{ key: 'XDC Network:native', wallet: w.id, chain: 'XDC Network', symbol: 'XDC', name: 'XDC', qty: units(BigInt(bal), 18), priceUsd: natives.XDC?.usd, change24h: natives.XDC?.change, native: true }]
}

// ---------------- Solana (Jupiter) ----------------
const SOL_MINT = 'So11111111111111111111111111111111111111112'
async function solanaWallet(w: Wallet): Promise<WalletToken[]> {
  const bal = await getJson('https://lite-api.jup.ag/ultra/v1/balances/' + w.address, undefined, 30000)
  if (!bal) return []
  const entries = Object.entries(bal as Record<string, { uiAmount: number }>).filter(([, v]) => Number(v?.uiAmount) > 0)
  const mints = entries.map(([m]) => (m === 'SOL' ? SOL_MINT : m))
  const price: Record<string, any> = {}
  const info: Record<string, any> = {}
  for (let i = 0; i < mints.length; i += 50) {
    const ids = [...new Set(mints.slice(i, i + 50))].join(',')
    const [p, t] = await Promise.all([
      getJson('https://lite-api.jup.ag/price/v3?ids=' + ids).catch(() => null),
      getJson('https://lite-api.jup.ag/tokens/v2/search?query=' + ids).catch(() => null),
    ])
    Object.assign(price, p || {})
    for (const x of (t as any[]) || []) info[x.id] = x
  }
  const out: WalletToken[] = []
  for (const [m, v] of entries) {
    const mint = m === 'SOL' ? SOL_MINT : m
    const p = price[mint]
    if (!p?.usdPrice || (p.liquidity ?? 0) < 5000) continue // no liquid market: skip spam and NFTs
    const meta = info[mint]
    const isSol = mint === SOL_MINT // native SOL and wrapped SOL count as one
    const key = `Solana:${isSol ? 'native' : mint}`
    const prev = out.find((x) => x.key === key)
    if (prev) { prev.qty += Number(v.uiAmount); continue } // wrapped SOL is counted with SOL
    out.push({ key, wallet: w.id, chain: 'Solana', symbol: isSol ? 'SOL' : String(meta?.symbol || mint.slice(0, 4)).slice(0, 16), name: isSol ? 'Solana' : String(meta?.name || '').slice(0, 60), qty: Number(v.uiAmount), priceUsd: Number(p.usdPrice), change24h: p.priceChange24h, image: typeof meta?.icon === 'string' && meta.icon.startsWith('https://') ? meta.icon : undefined, native: isSol })
  }
  return out
}

// ---------------- Bitcoin and XRP ----------------
async function bitcoinWallet(w: Wallet, natives: Record<string, { usd: number; change?: number }>): Promise<WalletToken[]> {
  const j = await getJson('https://blockstream.info/api/address/' + w.address)
  if (!j) return []
  const sat = j.chain_stats.funded_txo_sum - j.chain_stats.spent_txo_sum + j.mempool_stats.funded_txo_sum - j.mempool_stats.spent_txo_sum
  if (sat <= 0) return []
  return [{ key: 'Bitcoin:native', wallet: w.id, chain: 'Bitcoin', symbol: 'BTC', name: 'Bitcoin', qty: sat / 1e8, priceUsd: natives.BTC?.usd, change24h: natives.BTC?.change, native: true }]
}
async function xrplWallet(w: Wallet, natives: Record<string, { usd: number; change?: number }>): Promise<WalletToken[]> {
  const j = await getJson('https://xrplcluster.com', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method: 'account_info', params: [{ account: w.address, ledger_index: 'validated' }] }) })
  const drops = Number(j?.result?.account_data?.Balance ?? 0)
  if (!drops) return []
  return [{ key: 'XRP Ledger:native', wallet: w.id, chain: 'XRP Ledger', symbol: 'XRP', name: 'XRP', qty: drops / 1e6, priceUsd: natives.XRP?.usd, change24h: natives.XRP?.change, native: true }]
}

/** Reads all balances of one wallet. Failing networks are reported in `errors`, the rest still counts. */
export async function syncWallet(w: Wallet, natives?: Record<string, { usd: number; change?: number }>): Promise<{ tokens: WalletToken[]; errors: string[] }> {
  const np = natives ?? (await nativePrices())
  const errors: string[] = []
  const jobs: [string, Promise<WalletToken[]>][] = []
  if (w.type === 'evm') {
    for (const b of BLOCKSCOUT) jobs.push([b.chain, blockscoutChain(w, b)])
    jobs.push(['BNB Chain', bscChain(w, np)])
    jobs.push(['XDC Network', xdcChain(w, np)])
  } else if (w.type === 'solana') jobs.push(['Solana', solanaWallet(w)])
  else if (w.type === 'bitcoin') jobs.push(['Bitcoin', bitcoinWallet(w, np)])
  else jobs.push(['XRP Ledger', xrplWallet(w, np)])
  const res = await Promise.allSettled(jobs.map(([, p]) => p))
  const tokens: WalletToken[] = []
  res.forEach((r, i) => {
    if (r.status === 'fulfilled') tokens.push(...r.value)
    else errors.push(jobs[i][0])
  })
  // natives: CoinGecko gives a 24h change; fill in missing prices
  for (const t of tokens) {
    if (!t.native) continue
    const n = np[t.symbol]
    if (n) {
      t.priceUsd = t.priceUsd ?? n.usd
      t.change24h = t.change24h ?? n.change
    }
  }
  return { tokens: tokens.filter((t) => (t.priceUsd ?? 0) * t.qty >= MIN_USD), errors }
}

export async function syncAll(wallets: Wallet[]): Promise<WalletSync> {
  const np = await nativePrices()
  const tokens: WalletToken[] = []
  const errors: Record<string, string[]> = {}
  for (const w of wallets) {
    const r = await syncWallet(w, np).catch(() => ({ tokens: [] as WalletToken[], errors: ['all'] }))
    tokens.push(...r.tokens)
    if (r.errors.length) errors[w.id] = r.errors
  }
  const s: WalletSync = { at: Date.now(), tokens, errors, ids: wallets.map((w) => w.id) }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(s))
  } catch {
    /* storage full or blocked */
  }
  return s
}

export function cachedSync(): WalletSync | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as WalletSync) : null
  } catch {
    return null
  }
}

export function clearSyncCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    /* ignore */
  }
}
