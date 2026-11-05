// Import trades from CSV files and MT4 / MT5 / cTrader history exports (CSV or HTML report).
// Everything is parsed in the browser. Rows are validated and checked for duplicates before import.
import { normPair } from './fx'
import type { CashMove, Trade } from './types'
import { uid } from './types'

export type Field =
  | 'ticket' | 'symbol' | 'type' | 'lots' | 'openTime' | 'openPrice' | 'sl' | 'tp'
  | 'closeTime' | 'closePrice' | 'commission' | 'swap' | 'profit'
export const FIELDS: Field[] = ['ticket', 'symbol', 'type', 'lots', 'openTime', 'openPrice', 'sl', 'tp', 'closeTime', 'closePrice', 'commission', 'swap', 'profit']
export const REQUIRED: Field[] = ['symbol', 'type', 'lots', 'openTime', 'openPrice']

export type Table = { headers: string[]; rows: string[][] }
export type Mapping = Partial<Record<Field, number>>
export type ImportOptions = { offsetHours: number; dateOrder: 'ymd' | 'dmy' | 'mdy'; volume: 'lots' | 'units' }

/** Read a file as text, handling the UTF-16 encoding MT5 uses for its HTML reports. */
export async function readText(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer())
  if (buf[0] === 0xff && buf[1] === 0xfe) return new TextDecoder('utf-16le').decode(buf)
  if (buf[0] === 0xfe && buf[1] === 0xff) return new TextDecoder('utf-16be').decode(buf)
  return new TextDecoder('utf-8').decode(buf)
}

export function parseCsv(text: string): Table {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim()) || ''
  const delim = [';', '\t', ','].map((d) => [d, firstLine.split(d).length] as const).sort((a, b) => b[1] - a[1])[0][0]
  const rows: string[][] = []
  let row: string[] = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (ch === '"') q = false
      else cell += ch
    } else if (ch === '"') q = true
    else if (ch === delim) { row.push(cell.trim()); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell.trim()); cell = ''
      if (row.some((c) => c)) rows.push(row)
      row = []
    } else cell += ch
  }
  row.push(cell.trim())
  if (row.some((c) => c)) rows.push(row)
  const headers = rows.shift() || []
  return { headers, rows }
}

const norm = (h: string) => h.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z/]/g, '')

/** Find the trade table in an MT4 / MT5 HTML report (header row with symbol/item, type and profit). */
export function parseHtml(html: string): Table {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const trs = [...doc.querySelectorAll('tr')]
  const cells = (tr: Element) => [...tr.querySelectorAll('th,td')].flatMap((c) => Array(Number((c as HTMLTableCellElement).colSpan) || 1).fill((c.textContent || '').trim()))
  for (let i = 0; i < trs.length; i++) {
    const h = cells(trs[i]).map(norm)
    if ((h.includes('item') || h.includes('symbol')) && h.includes('type') && h.includes('profit')) {
      const headers = cells(trs[i])
      const rows: string[][] = []
      for (let j = i + 1; j < trs.length; j++) {
        const c = cells(trs[j])
        if (c.length < headers.length - 2) {
          if (rows.length) break
          continue
        }
        if (c.map(norm).includes('profit') && c.map(norm).includes('type')) break
        rows.push(c)
      }
      return { headers, rows }
    }
  }
  return { headers: [], rows: [] }
}

const SYN: Record<Field, string[]> = {
  ticket: ['ticket', 'order', 'position', 'positionid', 'deal', 'id', 'orderid'],
  symbol: ['symbol', 'item', 'pair', 'instrument', 'market'],
  type: ['type', 'direction', 'side', 'openingdirection', 'action', 'buy/sell'],
  lots: ['size', 'volume', 'lots', 'lot', 'quantity', 'closingquantity', 'qty', 'amount'],
  openTime: ['opentime', 'openingtime', 'entrytime', 'opendate', 'timeopen', 'time'],
  openPrice: ['openprice', 'entryprice', 'openingprice', 'priceopen', 'price'],
  sl: ['s/l', 'sl', 'stoploss'],
  tp: ['t/p', 'tp', 'takeprofit'],
  closeTime: ['closetime', 'closingtime', 'exittime', 'closedate', 'timeclose'],
  closePrice: ['closeprice', 'closingprice', 'exitprice', 'priceclose'],
  commission: ['commission', 'commissions', 'comm', 'fee', 'fees'],
  swap: ['swap', 'swaps', 'rollover'],
  profit: ['profit', 'netprofit', 'net', 'p/l', 'pnl', 'pl', 'netusd', 'neteur', 'result', 'grossprofit'],
}

export function autoMap(headers: string[]): Mapping {
  const h = headers.map(norm)
  const m: Mapping = {}
  const used = new Set<number>()
  for (const f of FIELDS) {
    for (const s of SYN[f]) {
      const i = h.findIndex((x, k) => !used.has(k) && x === s)
      if (i >= 0) { m[f] = i; used.add(i); break }
    }
  }
  // MT4/MT5 reports repeat "Time" and "Price": the second occurrence is the close
  const times = h.map((x, i) => (x === 'time' ? i : -1)).filter((i) => i >= 0)
  const prices = h.map((x, i) => (x === 'price' ? i : -1)).filter((i) => i >= 0)
  if (times.length >= 2) { m.openTime = times[0]; m.closeTime = m.closeTime ?? times[1] }
  if (prices.length >= 2) { m.openPrice = prices[0]; m.closePrice = m.closePrice ?? prices[1] }
  return m
}

const num = (s?: string) => {
  if (s === undefined) return NaN
  const t = s.replace(/[\s ]/g, '').replace(/[^0-9,.\-kK]/g, '')
  if (!t) return NaN
  const k = /k$/i.test(t)
  let v = t.replace(/k$/i, '')
  if (v.includes(',') && v.includes('.')) v = v.lastIndexOf(',') > v.lastIndexOf('.') ? v.replace(/\./g, '').replace(',', '.') : v.replace(/,/g, '')
  else if (v.includes(',')) v = /,\d{3}$/.test(v) && v.split(',').length > 2 ? v.replace(/,/g, '') : v.replace(',', '.')
  const n = parseFloat(v)
  return k ? n * 1000 : n
}

export function parseTime(s: string | undefined, o: ImportOptions): string | null {
  if (!s) return null
  const m = s.trim().match(/^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4})[ T,]+(\d{1,2}):(\d{2})(?::(\d{2}))?/)
  if (!m) return null
  let y: number, mo: number, d: number
  const a = +m[1], b = +m[2], c = +m[3]
  if (m[1].length === 4) { y = a; mo = b; d = c }
  else if (o.dateOrder === 'mdy') { mo = a; d = b; y = c }
  else { d = a; mo = b; y = c }
  if (y < 100) y += 2000
  const t = Date.UTC(y, mo - 1, d, +m[4], +m[5], +(m[6] || 0)) - o.offsetHours * 3600e3
  return isFinite(t) && mo >= 1 && mo <= 12 && d >= 1 && d <= 31 ? new Date(t).toISOString() : null
}

export type Candidate = {
  row: number
  kind: 'trade' | 'cash'
  trade?: Trade
  cash?: CashMove
  errors: string[]
  duplicate: boolean
  needsRate: boolean // profit missing: P/L has to be calculated
  include: boolean
}

export function build(table: Table, m: Mapping, o: ImportOptions, accountId: string, existing: Trade[], existingCash: CashMove[]): Candidate[] {
  const keyOf = (t: Pick<Trade, 'ticket' | 'pair' | 'openTime' | 'lots' | 'entry'>) => (t.ticket ? `t|${t.ticket}` : `${t.pair}|${t.openTime.slice(0, 16)}|${t.lots.toFixed(2)}|${t.entry}`)
  const seen = new Set(existing.filter((t) => t.accountId === accountId).map(keyOf))
  const seenCash = new Set(existingCash.filter((c) => c.accountId === accountId).map((c) => `${c.time.slice(0, 16)}|${c.amount}`))
  const get = (r: string[], f: Field) => (m[f] !== undefined ? r[m[f]!] : undefined)
  const now = new Date().toISOString()
  return table.rows.map((r, i) => {
    const errors: string[] = []
    const typeRaw = (get(r, 'type') || '').toLowerCase()
    // balance / deposit rows in MT4/MT5 statements become cash movements
    if (/balance|deposit|withdraw|credit/.test(typeRaw)) {
      const amount = num(get(r, 'profit'))
      const time = parseTime(get(r, 'openTime'), o)
      if (!isFinite(amount) || !time) errors.push('cash')
      const cash: CashMove = { id: uid(), accountId, type: amount >= 0 ? 'deposit' : 'withdrawal', amount: Math.abs(amount || 0), time: time || now, note: 'Import' }
      const dup = seenCash.has(`${cash.time.slice(0, 16)}|${cash.amount}`)
      return { row: i + 1, kind: 'cash', cash, errors, duplicate: dup, needsRate: false, include: !errors.length && !dup }
    }
    const direction = /buy|long|^b$/.test(typeRaw) ? 'buy' : /sell|short|^s$/.test(typeRaw) ? 'sell' : null
    if (!direction) errors.push('type')
    const pair = normPair(get(r, 'symbol') || '')
    if (pair.length < 6) errors.push('symbol')
    let lots = num(get(r, 'lots'))
    if (o.volume === 'units') lots = lots / 100000
    if (!(lots > 0)) errors.push('lots')
    const entry = num(get(r, 'openPrice'))
    if (!(entry > 0)) errors.push('openPrice')
    const openTime = parseTime(get(r, 'openTime'), o)
    if (!openTime) errors.push('openTime')
    const closeTime = parseTime(get(r, 'closeTime'), o)
    const exitPrice = num(get(r, 'closePrice'))
    const closed = !!closeTime && exitPrice > 0
    if (closeTime && openTime && closeTime < openTime) errors.push('closeTime')
    const commission = num(get(r, 'commission'))
    const swap = num(get(r, 'swap'))
    const profit = num(get(r, 'profit'))
    const sl = num(get(r, 'sl')), tp = num(get(r, 'tp'))
    const ticket = (get(r, 'ticket') || '').replace(/\s/g, '') || undefined
    const net = (isFinite(profit) ? profit : 0) + (isFinite(commission) ? commission : 0) + (isFinite(swap) ? swap : 0)
    const trade: Trade = {
      id: uid(), accountId, pair, direction: direction || 'buy', entry: entry || 0, sl: sl > 0 ? sl : undefined, tps: tp > 0 ? [tp] : [], lots: lots || 0,
      openTime: openTime || now, links: [], shots: [], slMoves: [], ticket, source: 'import', createdAt: now, updatedAt: now,
      exits: closed ? [{ id: uid(), time: closeTime!, price: exitPrice, lots: lots || 0, kind: 'manual', pnl: net, commission: isFinite(commission) ? commission : undefined, swap: isFinite(swap) ? swap : undefined, pnlSource: isFinite(profit) ? 'broker' : 'calc' }] : [],
    }
    if (closed && trade.exits[0]) {
      const e = trade.exits[0]
      if (sl > 0 && Math.abs(exitPrice - sl) <= Math.abs(entry - sl) * 0.02) e.kind = 'sl'
      else if (tp > 0 && Math.abs(exitPrice - tp) <= Math.abs(tp - entry) * 0.02) e.kind = 'tp'
    }
    const k = keyOf(trade)
    const duplicate = !errors.length && seen.has(k)
    if (!errors.length) seen.add(k)
    return { row: i + 1, kind: 'trade', trade, errors, duplicate, needsRate: closed && !isFinite(profit), include: !errors.length && !duplicate }
  })
}
