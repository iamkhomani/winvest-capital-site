// Portfolio tracker storage. Everything lives in the visitor's own browser (localStorage).
// Nothing is sent to Winvest Capital. Only asset identifiers are sent to the price sources.

import { detectWallet } from './wallets'
import type { Wallet } from './wallets'

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
  sector?: string // stocks: Yahoo sector (English), 'fund' for ETFs and funds, '' when unknown
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
  wallets: Wallet[] // public crypto addresses tracked automatically (read-only)
  snapshots: Record<string, number> // YYYY-MM-DD (local day) -> total value incl. wallets, in the base currency
}

const KEY = 'wc-portfolio-v1'
const INDEX_KEY = 'wc-portfolios'

// Several portfolios: the first one ('main') keeps the original storage key, so existing data stays
// where it was. Extra portfolios are stored under their own key, listed in a small index.
export type PortfolioMeta = { id: string; name: string }
export type PortfolioIndex = { active: string; list: PortfolioMeta[] }

export const storageKey = (id = 'main') => (id === 'main' ? KEY : `${KEY}:${id}`)

export function loadIndex(): PortfolioIndex {
  const fallback: PortfolioIndex = { active: 'main', list: [{ id: 'main', name: '' }] }
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    if (!raw) return fallback
    const o = JSON.parse(raw) as PortfolioIndex
    const list = (Array.isArray(o.list) ? o.list : [])
      .filter((p) => p && typeof p.id === 'string' && /^[a-z0-9]{1,20}$/.test(p.id))
      .map((p) => ({ id: p.id, name: typeof p.name === 'string' ? p.name.slice(0, 40) : '' }))
    if (!list.some((p) => p.id === 'main')) list.unshift({ id: 'main', name: '' })
    const active = list.some((p) => p.id === o.active) ? o.active : 'main'
    return { active, list }
  } catch {
    return fallback
  }
}

export function saveIndex(ix: PortfolioIndex): boolean {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(ix))
    return true
  } catch {
    return false
  }
}

export function removeStored(id: string) {
  try {
    localStorage.removeItem(storageKey(id))
  } catch {
    /* ignore */
  }
}

export const empty = (): PortfolioData => ({
  app: 'winvest-portfolio',
  version: 1,
  base: 'EUR',
  assets: {},
  txs: [],
  watchlists: [{ id: 'default', name: 'Watchlist', assets: ['crypto:bitcoin', 'crypto:ethereum'] }],
  manualPrices: {},
  wallets: [],
  snapshots: {},
})

export const DEFAULT_ASSETS: Record<string, Asset> = {
  'crypto:bitcoin': { key: 'crypto:bitcoin', kind: 'crypto', symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin' },
  'crypto:ethereum': { key: 'crypto:ethereum', kind: 'crypto', symbol: 'ETH', name: 'Ethereum', id: 'ethereum' },
}

export function load(id = 'main'): PortfolioData {
  try {
    const raw = localStorage.getItem(storageKey(id))
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

export function save(d: PortfolioData, id = 'main'): boolean {
  try {
    localStorage.setItem(storageKey(id), JSON.stringify(d))
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
    d.assets[k] = { key: k, kind: a.kind, symbol: String(a.symbol).slice(0, 20), name: String(a.name || a.symbol).slice(0, 80), id: a.id.slice(0, 60), image: typeof a.image === 'string' && a.image.startsWith('https://') ? a.image : undefined, currency: typeof a.currency === 'string' ? a.currency.slice(0, 5) : undefined, sector: typeof a.sector === 'string' ? a.sector.slice(0, 40) : undefined }
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
  if (Array.isArray(o.wallets)) {
    for (const w of o.wallets as Wallet[]) {
      const det = w && typeof w.address === 'string' ? detectWallet(w.address) : null
      if (!det || d.wallets.some((x) => x.address.toLowerCase() === det.address.toLowerCase())) continue
      d.wallets.push({ id: String(w.id || uid()).slice(0, 30), type: det.type, address: det.address, label: w.label ? String(w.label).slice(0, 40) : undefined })
    }
  }
  const snaps = (o.snapshots && typeof o.snapshots === 'object' ? o.snapshots : {}) as Record<string, number>
  for (const [k, v] of Object.entries(snaps).sort((a, b) => a[0].localeCompare(b[0])).slice(-1100)) if (/^\d{4}-\d{2}-\d{2}$/.test(k) && num(v) >= 0) d.snapshots[k] = v
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

// ---- CSV import ----
// Reads the CSV this tracker exports (date,type,symbol,name,kind,quantity,price_EUR,fee_EUR,note)
// and simple files with at least date, type, symbol, quantity and price columns.
export type CsvRow = { date: string; type: 'buy' | 'sell'; symbol: string; name: string; kind: Kind; qty: number; price: number; fee: number; note?: string }

function splitCsvLine(line: string, sep: string): string[] {
  const out: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (q) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') q = false
      else cur += ch
    } else if (ch === '"') q = true
    else if (ch === sep) {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

export function parseCsv(text: string, base: Currency): { rows: CsvRow[]; skipped: number; currencyMismatch: boolean } {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return { rows: [], skipped: 0, currencyMismatch: false }
  const sep = (lines[0].match(/;/g)?.length ?? 0) > (lines[0].match(/,/g)?.length ?? 0) ? ';' : ','
  const head = splitCsvLine(lines[0], sep).map((h) => h.toLowerCase())
  const col = (...names: string[]) => head.findIndex((h) => names.some((n) => h === n || h.startsWith(n + '_')))
  const iDate = col('date', 'datum')
  const iType = col('type', 'side')
  const iSym = col('symbol', 'ticker', 'asset')
  const iName = col('name', 'naam')
  const iKind = col('kind', 'soort')
  const iQty = col('quantity', 'qty', 'amount', 'aantal')
  const iPrice = col('price', 'prijs')
  const iFee = col('fee', 'kosten')
  const iNote = col('note', 'notitie')
  const priceCur = iPrice >= 0 ? head[iPrice].split('_')[1]?.toUpperCase() : undefined
  const currencyMismatch = !!priceCur && priceCur !== base
  if ([iDate, iType, iSym, iQty, iPrice].some((i) => i < 0) || currencyMismatch) return { rows: [], skipped: lines.length - 1, currencyMismatch }
  const n = (s?: string) => {
    const v = String(s ?? '').replace(/\s/g, '')
    return Number(sep === ';' ? v.replace(',', '.') : v)
  }
  const rows: CsvRow[] = []
  let skipped = 0
  for (const line of lines.slice(1)) {
    const c = splitCsvLine(line, sep)
    const type = c[iType]?.toLowerCase()
    const t = type === 'buy' || type === 'koop' ? 'buy' : type === 'sell' || type === 'verkoop' ? 'sell' : null
    const date = c[iDate]?.slice(0, 10)
    const qty = n(c[iQty])
    const price = n(c[iPrice])
    const fee = iFee >= 0 ? n(c[iFee]) || 0 : 0
    const symbol = (c[iSym] ?? '').toUpperCase().slice(0, 20)
    if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') || !(qty > 0) || !(price >= 0) || !symbol) {
      skipped++
      continue
    }
    const kind: Kind = iKind >= 0 && c[iKind]?.toLowerCase() === 'stock' ? 'stock' : 'crypto'
    rows.push({ date, type: t, symbol, name: (iName >= 0 ? c[iName] : '') || symbol, kind, qty, price, fee: fee >= 0 ? fee : 0, note: iNote >= 0 && c[iNote] ? c[iNote].slice(0, 200) : undefined })
  }
  return { rows, skipped, currencyMismatch: false }
}
