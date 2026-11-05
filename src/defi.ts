// DeFi scanner data layer: detects what the visitor typed and fetches public blockchain data.
// Sources (no API keys): DexScreener, GoPlus Security, public RPC nodes, XRPL cluster,
// Blockstream (Bitcoin) and the official XinFin RPC for XDC (DEFI_PROXY_URL is an optional fallback proxy).
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEFI_PROXY_URL } from './config'

export type ChainId = 'ethereum' | 'bsc' | 'base' | 'arbitrum' | 'polygon' | 'xdc' | 'solana' | 'xrpl' | 'bitcoin'

export const CHAINS: Record<ChainId, { name: string; symbol: string; explorer: string; goplus?: string; rpc?: string; decimals: number }> = {
  ethereum: { name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io', goplus: '1', rpc: 'https://ethereum-rpc.publicnode.com', decimals: 18 },
  bsc: { name: 'BNB Chain', symbol: 'BNB', explorer: 'https://bscscan.com', goplus: '56', rpc: 'https://bsc-rpc.publicnode.com', decimals: 18 },
  base: { name: 'Base', symbol: 'ETH', explorer: 'https://basescan.org', goplus: '8453', rpc: 'https://base-rpc.publicnode.com', decimals: 18 },
  arbitrum: { name: 'Arbitrum', symbol: 'ETH', explorer: 'https://arbiscan.io', goplus: '42161', rpc: 'https://arbitrum-one-rpc.publicnode.com', decimals: 18 },
  polygon: { name: 'Polygon', symbol: 'POL', explorer: 'https://polygonscan.com', goplus: '137', rpc: 'https://polygon-bor-rpc.publicnode.com', decimals: 18 },
  xdc: { name: 'XDC Network', symbol: 'XDC', explorer: 'https://xdcscan.com', rpc: DEFI_PROXY_URL ? DEFI_PROXY_URL + '/rpc/xdc' : 'https://rpc.xinfin.network', decimals: 18 },
  solana: { name: 'Solana', symbol: 'SOL', explorer: 'https://solscan.io', goplus: 'solana', rpc: 'https://solana-rpc.publicnode.com', decimals: 9 },
  xrpl: { name: 'XRP Ledger', symbol: 'XRP', explorer: 'https://xrpscan.com', rpc: 'https://xrplcluster.com', decimals: 6 },
  bitcoin: { name: 'Bitcoin', symbol: 'BTC', explorer: 'https://mempool.space', decimals: 8 },
}

export const EVM_CHAINS: ChainId[] = ['ethereum', 'bsc', 'base', 'arbitrum', 'polygon', 'xdc']

export type Query =
  | { kind: 'search'; q: string }
  | { kind: 'evm-address'; address: string; xdcPrefix: boolean }
  | { kind: 'evm-tx'; hash: string }
  | { kind: 'solana-address'; address: string }
  | { kind: 'solana-tx'; sig: string }
  | { kind: 'xrpl-address'; address: string }
  | { kind: 'hash64'; hash: string } // XRPL or Bitcoin transaction
  | { kind: 'btc-address'; address: string }

const B58 = '[1-9A-HJ-NP-Za-km-z]'

export function detect(input: string): Query | null {
  const s = input.trim()
  if (!s) return null
  if (/^0x[0-9a-fA-F]{40}$/.test(s)) return { kind: 'evm-address', address: s, xdcPrefix: false }
  if (/^xdc[0-9a-fA-F]{40}$/i.test(s)) return { kind: 'evm-address', address: '0x' + s.slice(3), xdcPrefix: true }
  if (/^0x[0-9a-fA-F]{64}$/.test(s)) return { kind: 'evm-tx', hash: s }
  if (/^[0-9a-fA-F]{64}$/.test(s)) return { kind: 'hash64', hash: s }
  if (/^(bc1[02-9ac-hj-np-z]{11,71}|[13][1-9A-HJ-NP-Za-km-z]{25,34})$/.test(s)) return { kind: 'btc-address', address: s }
  if (new RegExp(`^r${B58}{24,34}$`).test(s)) return { kind: 'xrpl-address', address: s }
  if (new RegExp(`^${B58}{80,90}$`).test(s)) return { kind: 'solana-tx', sig: s }
  if (new RegExp(`^${B58}{32,44}$`).test(s)) return { kind: 'solana-address', address: s }
  return { kind: 'search', q: s }
}

async function getJson(url: string, init?: RequestInit): Promise<any> {
  const r = await fetch(url, { ...init, signal: AbortSignal.timeout(15000) })
  if (!r.ok) throw new Error(`${r.status}`)
  return r.json()
}

async function rpc(url: string, method: string, params: unknown[]): Promise<any> {
  if (!url) throw new Error('proxy not configured')
  const j = await getJson(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) })
  if (j.error) throw new Error(j.error.message || 'rpc error')
  return j.result
}

// ---------- Tokens (DexScreener) ----------
export type Pair = {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: { address: string; name: string; symbol: string }
  quoteToken: { symbol: string }
  priceUsd?: string
  priceChange?: { h1?: number; h24?: number }
  liquidity?: { usd?: number }
  volume?: { h24?: number }
  txns?: { h24?: { buys: number; sells: number } }
  fdv?: number
  marketCap?: number
  pairCreatedAt?: number
  info?: { imageUrl?: string; websites?: { url: string }[]; socials?: { type: string; url: string }[] }
}

const byLiquidity = (a: Pair, b: Pair) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)

export async function searchPairs(q: string): Promise<Pair[]> {
  const j = await getJson('https://api.dexscreener.com/latest/dex/search?q=' + encodeURIComponent(q))
  return ((j.pairs as Pair[]) || []).sort(byLiquidity)
}

export async function tokenPairs(address: string): Promise<Pair[]> {
  const j = await getJson('https://api.dexscreener.com/latest/dex/tokens/' + encodeURIComponent(address))
  return ((j.pairs as Pair[]) || []).filter((p) => p.baseToken.address.toLowerCase() === address.toLowerCase()).sort(byLiquidity)
}

// ---------- Security (GoPlus) ----------
export type Flag = { key: string; label: { en: string; nl: string }; level: 'ok' | 'warn' | 'bad' | 'info'; value: string }

const yes = (v: unknown) => v === '1' || v === 1 || v === true

export function goplusChain(dexChain: string): string | undefined {
  const map: Record<string, string> = { ethereum: '1', bsc: '56', base: '8453', arbitrum: '42161', polygon: '137', solana: 'solana', optimism: '10', avalanche: '43114' }
  return map[dexChain]
}

export async function security(dexChain: string, address: string): Promise<Flag[] | null> {
  const chain = goplusChain(dexChain)
  if (!chain) return null
  const url = chain === 'solana'
    ? 'https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=' + address
    : `https://api.gopluslabs.io/api/v1/token_security/${chain}?contract_addresses=${address}`
  const j = await getJson(url)
  const res = j.result || {}
  const d = res[address] || res[address.toLowerCase()] || Object.values(res)[0]
  if (!d) return null
  const flags: Flag[] = []
  const pct = (v: unknown) => (v === undefined || v === '' || v === null ? null : (parseFloat(String(v)) * 100))
  const add = (key: string, en: string, nl: string, level: Flag['level'], value: string) => flags.push({ key, label: { en, nl }, level, value })
  if (chain === 'solana') {
    const mint = d.mintable?.status === '1'
    const freeze = d.freezable?.status === '1'
    add('mint', 'Mint authority', 'Mint-bevoegdheid', mint ? 'warn' : 'ok', mint ? 'active' : 'renounced')
    add('freeze', 'Freeze authority', 'Freeze-bevoegdheid', freeze ? 'bad' : 'ok', freeze ? 'active' : 'none')
    if (d.holder_count) add('holders', 'Holders', 'Holders', 'info', Number(d.holder_count).toLocaleString('en-US'))
    return flags
  }
  if (d.is_honeypot !== undefined) add('honeypot', 'Honeypot', 'Honeypot', yes(d.is_honeypot) ? 'bad' : 'ok', yes(d.is_honeypot) ? 'yes' : 'no')
  const buy = pct(d.buy_tax), sell = pct(d.sell_tax)
  if (buy !== null) add('buy', 'Buy tax', 'Buy tax', buy > 10 ? 'bad' : buy > 0 ? 'warn' : 'ok', buy.toFixed(1) + '%')
  if (sell !== null) add('sell', 'Sell tax', 'Sell tax', sell > 10 ? 'bad' : sell > 0 ? 'warn' : 'ok', sell.toFixed(1) + '%')
  if (d.cannot_sell_all !== undefined) add('sellall', 'Can sell all tokens', 'Alles verkopen mogelijk', yes(d.cannot_sell_all) ? 'bad' : 'ok', yes(d.cannot_sell_all) ? 'no' : 'yes')
  if (d.is_open_source !== undefined) add('source', 'Source code verified', 'Broncode geverifieerd', yes(d.is_open_source) ? 'ok' : 'warn', yes(d.is_open_source) ? 'yes' : 'no')
  if (d.is_mintable !== undefined) add('mint', 'Mintable', 'Mintable', yes(d.is_mintable) ? 'warn' : 'ok', yes(d.is_mintable) ? 'yes' : 'no')
  if (d.is_proxy !== undefined) add('proxy', 'Upgradeable (proxy)', 'Aanpasbaar (proxy)', yes(d.is_proxy) ? 'warn' : 'ok', yes(d.is_proxy) ? 'yes' : 'no')
  if (d.owner_change_balance !== undefined) add('ownerbal', 'Owner can change balances', 'Owner kan saldi wijzigen', yes(d.owner_change_balance) ? 'bad' : 'ok', yes(d.owner_change_balance) ? 'yes' : 'no')
  if (d.hidden_owner !== undefined) add('hidden', 'Hidden owner', 'Verborgen owner', yes(d.hidden_owner) ? 'bad' : 'ok', yes(d.hidden_owner) ? 'yes' : 'no')
  if (d.is_blacklisted !== undefined) add('blacklist', 'Blacklist function', 'Blacklist-functie', yes(d.is_blacklisted) ? 'warn' : 'ok', yes(d.is_blacklisted) ? 'yes' : 'no')
  if (d.owner_address !== undefined) {
    const renounced = !d.owner_address || /^0x0{40}$/i.test(d.owner_address) || /^0x0+dead$/i.test(d.owner_address)
    add('owner', 'Ownership', 'Ownership', renounced ? 'ok' : 'info', renounced ? 'renounced' : 'owned')
  }
  if (d.holder_count) add('holders', 'Holders', 'Holders', 'info', Number(d.holder_count).toLocaleString('en-US'))
  if (Array.isArray(d.holders) && d.holders.length) {
    const top10 = d.holders.slice(0, 10).reduce((s: number, h: any) => s + parseFloat(h.percent || '0'), 0) * 100
    add('top10', 'Top 10 holders own', 'Top 10 holders bezitten', top10 > 50 ? 'warn' : 'info', top10.toFixed(1) + '%')
  }
  return flags
}

// ---------- Wallets and transactions ----------
export type Row = [string, string, string?] // label, value, optional link
export type Result = { title: string; chain: ChainId; rows: Row[]; explorer: string; txs?: { id: string; url: string; when?: string; note?: string }[] }

const fmt = (n: number, d = 6) => n.toLocaleString('en-US', { maximumFractionDigits: d })
const hexToNum = (h: string) => Number(BigInt(h))
const weiTo = (h: string, decimals: number) => Number(BigInt(h)) / 10 ** decimals
const short = (s: string) => (s.length > 18 ? s.slice(0, 8) + '…' + s.slice(-6) : s)
const ago = (ms: number) => new Date(ms).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'

const REPUTATION_FLAGS: Record<string, string> = {
  phishing_activities: 'phishing', stealing_attack: 'stealing attack', honeypot_related_address: 'honeypot creator', fake_token: 'fake tokens',
  cybercrime: 'cybercrime', money_laundering: 'money laundering', financial_crime: 'financial crime', blackmail_activities: 'blackmail',
  sanctioned: 'sanctioned', mixer: 'mixer', darkweb_transactions: 'darkweb', malicious_mining_activities: 'malicious mining', blacklist_doubt: 'blacklist suspicion',
  number_of_malicious_contracts_created: 'malicious contracts created',
}

/** GoPlus address reputation: returns a short verdict for the results table. */
export async function addressReputation(address: string): Promise<string | null> {
  try {
    const j = await getJson(`https://api.gopluslabs.io/api/v1/address_security/${address}?chain_id=1`)
    const r = j.result
    if (!r) return null
    const hits = Object.entries(REPUTATION_FLAGS).filter(([k]) => r[k] !== undefined && r[k] !== '0' && r[k] !== 0 && r[k] !== '').map(([, v]) => v)
    return hits.length ? 'WARNING – reported for: ' + hits.join(', ') : 'No scam reports (GoPlus)'
  } catch {
    return null
  }
}

export async function evmAddress(address: string, chains: ChainId[]): Promise<Result[]> {
  const out: Result[] = []
  const reputation = chains.includes('ethereum') ? addressReputation(address) : Promise.resolve(null)
  await Promise.all(chains.map(async (c) => {
    const ch = CHAINS[c]
    if (!ch.rpc) return
    try {
      const [bal, nonce, code] = await Promise.all([
        rpc(ch.rpc, 'eth_getBalance', [address, 'latest']),
        rpc(ch.rpc, 'eth_getTransactionCount', [address, 'latest']),
        rpc(ch.rpc, 'eth_getCode', [address, 'latest']),
      ])
      const delegated = typeof code === 'string' && code.toLowerCase().startsWith('0xef0100') // EIP-7702 smart account
      const isContract = code && code !== '0x' && !delegated
      const balance = weiTo(bal, ch.decimals)
      const sent = hexToNum(nonce)
      if (!isContract && balance === 0 && sent === 0) return // nothing on this chain
      const shown = c === 'xdc' ? 'xdc' + address.slice(2) : address
      out.push({
        title: isContract ? 'Smart contract' : 'Wallet',
        chain: c,
        explorer: `${ch.explorer}/address/${shown}`,
        rows: [
          ['Address', short(shown)],
          ['Type', isContract ? 'Smart contract' : delegated ? 'Wallet (EIP-7702 smart account)' : 'Wallet (EOA)'],
          [`Balance (${ch.symbol})`, fmt(balance)],
          ['Transactions sent', fmt(sent, 0)],
        ],
      })
    } catch {
      /* chain unreachable: skip */
    }
  }))
  const rep = await reputation
  if (rep) for (const r of out) r.rows.push(['Scam reputation', rep])
  return out.sort((a, b) => EVM_CHAINS.indexOf(a.chain) - EVM_CHAINS.indexOf(b.chain))
}

export async function evmTx(hash: string): Promise<Result | null> {
  for (const c of EVM_CHAINS) {
    const ch = CHAINS[c]
    if (!ch.rpc) continue
    try {
      const tx = await rpc(ch.rpc, 'eth_getTransactionByHash', [hash])
      if (!tx) continue
      const rc = await rpc(ch.rpc, 'eth_getTransactionReceipt', [hash]).catch(() => null)
      const status = rc ? (rc.status === '0x1' ? 'Success' : 'Failed') : 'Pending'
      return {
        title: 'Transaction',
        chain: c,
        explorer: `${ch.explorer}/tx/${hash}`,
        rows: [
          ['Hash', short(hash)],
          ['Status', status],
          ['Block', tx.blockNumber ? fmt(hexToNum(tx.blockNumber), 0) : 'pending'],
          ['From', short(tx.from), `${ch.explorer}/address/${tx.from}`],
          ['To', tx.to ? short(tx.to) : 'contract creation', tx.to ? `${ch.explorer}/address/${tx.to}` : undefined],
          [`Value (${ch.symbol})`, fmt(weiTo(tx.value, ch.decimals))],
          ...(rc ? ([['Gas used', fmt(hexToNum(rc.gasUsed), 0)]] as Row[]) : []),
        ],
      }
    } catch {
      /* try next chain */
    }
  }
  return null
}

export async function solanaAddress(address: string): Promise<Result | null> {
  const url = CHAINS.solana.rpc!
  const info = await rpc(url, 'getAccountInfo', [address, { encoding: 'jsonParsed' }])
  const sigs: any[] = await rpc(url, 'getSignaturesForAddress', [address, { limit: 10 }]).catch(() => [])
  const v = info?.value
  if (!v && !sigs.length) return null
  const lamports = v?.lamports ?? 0
  const program = v?.owner as string | undefined
  const type = v?.executable ? 'Program (smart contract)' : program === 'TokenkegQfeZyiNwAJbNbGKPFXCWQBNe4AHn7uBoE' || program === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' ? 'Token mint / token account' : 'Wallet'
  return {
    title: type,
    chain: 'solana',
    explorer: `${CHAINS.solana.explorer}/account/${address}`,
    rows: [
      ['Address', short(address)],
      ['Type', type],
      ['Balance (SOL)', fmt(lamports / 1e9)],
    ],
    txs: sigs.map((s) => ({ id: short(s.signature), url: `${CHAINS.solana.explorer}/tx/${s.signature}`, when: s.blockTime ? ago(s.blockTime * 1000) : undefined, note: s.err ? 'failed' : undefined })),
  }
}

export async function solanaTx(sig: string): Promise<Result | null> {
  const tx = await rpc(CHAINS.solana.rpc!, 'getTransaction', [sig, { encoding: 'json', maxSupportedTransactionVersion: 0 }])
  if (!tx) return null
  return {
    title: 'Transaction',
    chain: 'solana',
    explorer: `${CHAINS.solana.explorer}/tx/${sig}`,
    rows: [
      ['Signature', short(sig)],
      ['Status', tx.meta?.err ? 'Failed' : 'Success'],
      ['Slot', fmt(tx.slot, 0)],
      ['Time', tx.blockTime ? ago(tx.blockTime * 1000) : '–'],
      ['Fee (SOL)', fmt((tx.meta?.fee ?? 0) / 1e9, 9)],
    ],
  }
}

async function xrpl(method: string, params: Record<string, unknown>): Promise<any> {
  const j = await getJson(CHAINS.xrpl.rpc!, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method, params: [params] }) })
  return j.result
}

export async function xrplAddress(address: string): Promise<Result | null> {
  const info = await xrpl('account_info', { account: address, ledger_index: 'validated' })
  if (info.error) return null
  const [lines, txs] = await Promise.all([
    xrpl('account_lines', { account: address, ledger_index: 'validated' }).catch(() => ({})),
    xrpl('account_tx', { account: address, limit: 10 }).catch(() => ({})),
  ])
  const d = info.account_data
  const rows: Row[] = [
    ['Address', short(address)],
    ['Balance (XRP)', fmt(Number(d.Balance) / 1e6)],
    ['Sequence', fmt(d.Sequence, 0)],
    ['Trust lines (tokens)', fmt((lines.lines || []).length, 0)],
  ]
  for (const l of (lines.lines || []).filter((x: any) => Number(x.balance) > 0).slice(0, 8)) rows.push([`Token ${l.currency.length > 3 ? hexCurrency(l.currency) : l.currency}`, fmt(Number(l.balance))])
  return {
    title: 'XRP Ledger account',
    chain: 'xrpl',
    explorer: `${CHAINS.xrpl.explorer}/account/${address}`,
    rows,
    txs: (txs.transactions || []).map((t: any) => {
      const tx = t.tx || t.tx_json || {}
      const hash = tx.hash || t.hash
      return { id: (tx.TransactionType || 'Tx') + ' · ' + short(hash || ''), url: `${CHAINS.xrpl.explorer}/tx/${hash}`, note: t.meta?.TransactionResult !== 'tesSUCCESS' ? t.meta?.TransactionResult : undefined }
    }),
  }
}

function hexCurrency(h: string) {
  const s = h.replace(/(00)+$/, '').match(/.{2}/g)?.map((b) => String.fromCharCode(parseInt(b, 16))).join('') || h
  return /^[\x20-\x7e]+$/.test(s) ? s : short(h)
}

export async function hash64(hash: string): Promise<Result | null> {
  // XRPL first, then Bitcoin
  try {
    const t = await xrpl('tx', { transaction: hash.toUpperCase() })
    if (t && !t.error) {
      const tx = t.tx_json || t
      return {
        title: 'Transaction',
        chain: 'xrpl',
        explorer: `${CHAINS.xrpl.explorer}/tx/${hash}`,
        rows: [
          ['Hash', short(hash)],
          ['Type', tx.TransactionType || '–'],
          ['Result', t.meta?.TransactionResult || '–'],
          ['Account', short(tx.Account || ''), `${CHAINS.xrpl.explorer}/account/${tx.Account}`],
          ...(tx.Destination ? ([['Destination', short(tx.Destination), `${CHAINS.xrpl.explorer}/account/${tx.Destination}`]] as Row[]) : []),
          ['Ledger', fmt(t.ledger_index || 0, 0)],
        ],
      }
    }
  } catch {
    /* not XRPL */
  }
  return btcTx(hash)
}

function btcBase() {
  return 'https://blockstream.info/api/' // same API as mempool.space, with CORS
}

export async function btcAddress(address: string): Promise<Result | null> {
  const [a, txs] = await Promise.all([getJson(btcBase() + 'address/' + address), getJson(btcBase() + 'address/' + address + '/txs').catch(() => [])])
  const c = a.chain_stats, m = a.mempool_stats
  const bal = (c.funded_txo_sum - c.spent_txo_sum + m.funded_txo_sum - m.spent_txo_sum) / 1e8
  return {
    title: 'Bitcoin address',
    chain: 'bitcoin',
    explorer: `${CHAINS.bitcoin.explorer}/address/${address}`,
    rows: [
      ['Address', short(address)],
      ['Balance (BTC)', fmt(bal, 8)],
      ['Total received (BTC)', fmt(c.funded_txo_sum / 1e8, 8)],
      ['Transactions', fmt(c.tx_count + m.tx_count, 0)],
    ],
    txs: (txs as any[]).slice(0, 10).map((t) => ({ id: short(t.txid), url: `${CHAINS.bitcoin.explorer}/tx/${t.txid}`, when: t.status?.block_time ? ago(t.status.block_time * 1000) : undefined, note: t.status?.confirmed ? undefined : 'unconfirmed' })),
  }
}

export async function btcTx(hash: string): Promise<Result | null> {
  try {
    const t = await getJson(btcBase() + 'tx/' + hash.toLowerCase())
    const out = (t.vout as any[]).reduce((s, o) => s + (o.value || 0), 0) / 1e8
    return {
      title: 'Transaction',
      chain: 'bitcoin',
      explorer: `${CHAINS.bitcoin.explorer}/tx/${t.txid}`,
      rows: [
        ['Hash', short(t.txid)],
        ['Status', t.status?.confirmed ? 'Confirmed' : 'Unconfirmed'],
        ['Block', t.status?.block_height ? fmt(t.status.block_height, 0) : '–'],
        ['Time', t.status?.block_time ? ago(t.status.block_time * 1000) : '–'],
        ['Total output (BTC)', fmt(out, 8)],
        ['Fee (BTC)', fmt((t.fee || 0) / 1e8, 8)],
      ],
    }
  } catch {
    return null
  }
}
