// Portfolio tracker storage. Everything lives in the visitor's own browser (localStorage).
// Nothing is sent to Winvest Capital. Only asset identifiers are sent to the price sources.

export type Kind = 'crypto' | 'stock'
export type Currency = 'EUR' | 'USD'

export type Asset = {
  key: string // 'crypto:bitcoin' | 'stock:AAPL'
  kind: Kind
  symbol: string
  name: string
  id: string // CoinGecko id or Yahoo symbol
  image?: string
  currency?: string // native trading currency (stocks), e.g. USD, EUR
}

export type Tx = {
  id: string
  asset: string // Asset.key
  type: 'buy' | 'sell'
  date: string // YYYY-MM-DD
  qty: number
  price: number // per unit, in the portfolio base currency
  fee: number // in the portfolio base currency
  note?: string
}

export type Watchlist = { id: string; name: string; assets: string[] }

export type PortfolioData = {
  app: 'winvest-portfolio'
  version: 1
  base: Currency
  assets: Record<string, Asset>
  txs: Tx[]
  watchlists: Watchlist[]
  manualPrices: Record<string, number> // fallback when no live price is available
}

const KEY = 'wc-portfolio-v1'

export const empty = (): PortfolioData => ({
  app: 'winvest-portfolio',
  version: 1,
  base: 'EUR',
  assets: {},
  txs: [],
  watchlists: [{ id: 'default', name: 'Watchlist', assets: ['crypto:bitcoin', 'crypto:ethereum'] }],
  manualPrices: {},
})

export const DEFAULT_ASSETS: Record<string, Asset> = {
  'crypto:bitcoin': { key: 'crypto:bitcoin', kind: 'crypto', symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin' },
  'crypto:ethereum': { key: 'crypto:ethereum', kind: 'crypto', symbol: 'ETH', name: 'Ethereum', id: 'ethereum' },
}

export function load(): PortfolioData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const d = validate(JSON.parse(raw))
      if (d) return d
    }
  } catch {
    /* storage blocked or corrupt: start empty */
  }
  const d = empty()
  d.assets = { ...DEFAULT_ASSETS }
  return d
}

export function save(d: PortfolioData): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(d))
    return true
  } catch {
    return false
  }
}

const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : NaN)

export function validate(x: unknown): PortfolioData | null {
  if (!x || typeof x !== 'object') return null
  const o = x as Record<string, unknown>
  if (o.app !== 'winvest-portfolio' || o.version !== 1) return null
  const d = empty()
  d.base = o.base === 'USD' ? 'USD' : 'EUR'
  const assets = (o.assets && typeof o.assets === 'object' ? o.assets : {}) as Record<string, Asset>
  for (const [k, a] of Object.entries(assets)) {
    if (!a || (a.kind !== 'crypto' && a.kind !== 'stock') || typeof a.id !== 'string' || typeof a.symbol !== 'string') continue
    d.assets[k] = { key: k, kind: a.kind, symbol: String(a.symbol).slice(0, 20), name: String(a.name || a.symbol).slice(0, 80), id: a.id.slice(0, 60), image: typeof a.image === 'string' && a.image.startsWith('https://') ? a.image : undefined, currency: typeof a.currency === 'string' ? a.currency.slice(0, 5) : undefined }
  }
  const txs = Array.isArray(o.txs) ? o.txs : []
  for (const t of txs as Tx[]) {
    if (!t || !d.assets[t.asset] || (t.type !== 'buy' && t.type !== 'sell') || !/^\d{4}-\d{2}-\d{2}$/.test(String(t.date))) continue
    const qty = num(t.qty), price = num(t.price), fee = num(t.fee ?? 0)
    if (!(qty > 0) || !(price >= 0) || !(fee >= 0)) continue
    d.txs.push({ id: String(t.id || uid()), asset: t.asset, type: t.type, date: t.date, qty, price, fee, note: t.note ? String(t.note).slice(0, 200) : undefined })
  }
  if (Array.isArray(o.watchlists)) {
    d.watchlists = (o.watchlists as Watchlist[])
      .filter((w) => w && typeof w.name === 'string' && Array.isArray(w.assets))
      .map((w) => ({ id: String(w.id || uid()), name: w.name.slice(0, 40), assets: w.assets.filter((k) => typeof k === 'string' && d.assets[k]) }))
    if (!d.watchlists.length) d.watchlists = empty().watchlists
  }
  const mp = (o.manualPrices && typeof o.manualPrices === 'object' ? o.manualPrices : {}) as Record<string, number>
  for (const [k, v] of Object.entries(mp)) if (d.assets[k] && num(v) > 0) d.manualPrices[k] = v
  d.txs.sort((a, b) => a.date.localeCompare(b.date))
  return d
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function exportJson(d: PortfolioData) {
  const blob = new Blob([JSON.stringify({ ...d, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `winvest-portfolio-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

export function exportCsv(d: PortfolioData) {
  const rows = [['date', 'type', 'symbol', 'name', 'kind', 'quantity', `price_${d.base}`, `fee_${d.base}`, 'note']]
  for (const t of d.txs) {
    const a = d.assets[t.asset]
    rows.push([t.date, t.type, a.symbol, a.name, a.kind, String(t.qty), String(t.price), String(t.fee), t.note || ''])
  }
  const csv = rows.map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `winvest-transactions-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
}
