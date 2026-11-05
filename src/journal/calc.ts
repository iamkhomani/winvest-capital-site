// Trading journal analytics. Balance = start + deposits/withdrawals/transfers + realised P/L.
// Equity = balance + floating P/L of open positions. Deposits never count as trading profit.
import { instrument, pips as pipCalc } from './fx'
import type { Account, CashMove, JournalState, Settings, Trade } from './types'

export type TradeInfo = {
  t: Trade
  status: 'open' | 'partial' | 'closed'
  closedLots: number
  openLots: number
  pnl: number // realised, account currency
  pnlDisp: number // realised, display currency
  closeTime?: string
  pips?: number // lot-weighted average over exits
  riskAmount?: number // initial risk in account currency
  riskPct?: number
  r?: number // realised R multiple
  plannedRR?: number
  result: 'win' | 'loss' | 'be' | 'open'
  effLeverage?: number
  floating?: number // account currency, open part
  autoRevenge: boolean
  overtrade: boolean
  afterLosses: boolean
  session: string
  weekday: number // 0 = Monday
}

export type Ctx = {
  state: JournalState
  accounts: Account[] // selected accounts
  toDisplay: Record<string, number> // account currency -> display currency
  live: Record<string, number> // pair -> live price
}

const ms = (iso: string) => Date.parse(iso)

export function dayKey(iso: string, tz: string) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
  } catch {
    return iso.slice(0, 10)
  }
}
export function weekKey(day: string) {
  const d = new Date(day + 'T00:00:00Z')
  const wd = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - wd)
  return d.toISOString().slice(0, 10) // Monday of the week
}

export function session(iso: string) {
  const h = new Date(iso).getUTCHours()
  if (h < 7) return 'asia'
  if (h < 12) return 'london'
  if (h < 16) return 'overlap'
  if (h < 21) return 'newyork'
  return 'late'
}

/** Balance of one account just before `iso` (exclusive), in account currency. */
export function balanceAt(s: JournalState, accountId: string, iso: string) {
  const a = s.accounts.find((x) => x.id === accountId)
  if (!a) return 0
  const t = ms(iso)
  let b = a.startBalance
  for (const c of s.cash) if (c.accountId === accountId && ms(c.time) < t) b += cashSign(c) * c.amount
  for (const tr of s.trades) if (tr.accountId === accountId) for (const e of tr.exits) if (ms(e.time) < t) b += e.pnl
  return b
}

export const cashSign = (c: CashMove) => (c.type === 'deposit' || c.type === 'transfer_in' || c.type === 'adjustment' ? 1 : -1)

export function infos(ctx: Ctx): TradeInfo[] {
  const { state } = ctx
  const s = state.settings
  const ids = new Set(ctx.accounts.map((a) => a.id))
  const acc = new Map(state.accounts.map((a) => [a.id, a]))
  const trades = state.trades.filter((t) => ids.has(t.accountId)).sort((a, b) => a.openTime.localeCompare(b.openTime))

  // losing exits (any selected account) for revenge detection
  const lossExits = trades.flatMap((t) => t.exits.filter((e) => e.pnl < 0).map((e) => ms(e.time))).sort((a, b) => a - b)
  // trades opened per day
  const perDay = new Map<string, number>()
  for (const t of trades) {
    const k = dayKey(t.openTime, s.tz)
    perDay.set(k, (perDay.get(k) || 0) + 1)
  }

  const out: TradeInfo[] = []
  for (const t of trades) {
    const a = acc.get(t.accountId)!
    const inst = instrument(t.pair, t.contract, t.pipSize)
    const closedLots = t.exits.reduce((x, e) => x + e.lots, 0)
    const openLots = Math.max(0, t.lots - closedLots)
    const pnl = t.exits.reduce((x, e) => x + e.pnl, 0)
    const status: TradeInfo['status'] = openLots <= 1e-9 && t.exits.length ? 'closed' : t.exits.length ? 'partial' : 'open'
    const closeTime = t.exits.length ? t.exits.map((e) => e.time).sort().slice(-1)[0] : undefined
    const conv = t.convEntry ?? (inst.quote === a.currency ? 1 : undefined)
    const riskAmount = t.sl !== undefined && conv !== undefined ? Math.abs(t.entry - t.sl) * t.lots * inst.contract * conv : undefined
    const bal = balanceAt(state, t.accountId, t.openTime)
    const riskPct = t.riskPct ?? (riskAmount !== undefined && bal > 0 ? (riskAmount / bal) * 100 : undefined)
    const r = riskAmount && riskAmount > 0 && status !== 'open' ? pnl / riskAmount : undefined
    const plannedRR = t.sl !== undefined && t.tps.length ? Math.abs(t.tps[t.tps.length - 1] - t.entry) / Math.abs(t.entry - t.sl || NaN) : undefined
    const pw = closedLots > 0 ? t.exits.reduce((x, e) => x + pipCalc(inst, t.direction, t.entry, e.price) * e.lots, 0) / closedLots : undefined
    let result: TradeInfo['result'] = 'open'
    if (status === 'closed') {
      const lastKind = t.exits[t.exits.length - 1]?.kind
      const beByR = r !== undefined ? Math.abs(r) < s.beThresholdR : Math.abs(pnl) < Math.max(1, bal * 0.0005)
      result = lastKind === 'be' && Math.abs(pnl) < Math.abs(riskAmount ?? Infinity) * 0.25 ? 'be' : beByR ? 'be' : pnl > 0 ? 'win' : 'loss'
    }
    const effLeverage = conv !== undefined && bal > 0 ? (t.lots * inst.contract * t.entry * conv) / bal : undefined
    const mark = ctx.live[inst.pair] ?? t.mark
    const floating = openLots > 0 && mark !== undefined && conv !== undefined ? (mark - t.entry) * (t.direction === 'buy' ? 1 : -1) * openLots * inst.contract * conv : undefined
    const open = ms(t.openTime)
    const autoRevenge = lossExits.some((x) => x <= open && open - x <= s.revengeMinutes * 60e3)
    out.push({
      t, status, closedLots, openLots, pnl, pnlDisp: pnl * (ctx.toDisplay[a.currency] ?? 1), closeTime, pips: pw, riskAmount, riskPct, r, plannedRR, result, effLeverage, floating,
      autoRevenge, overtrade: (perDay.get(dayKey(t.openTime, s.tz)) || 0) > s.maxTradesPerDay, afterLosses: false,
      session: session(t.openTime), weekday: (new Date(t.openTime).getUTCDay() + 6) % 7,
    })
  }
  // trades opened after 2+ consecutive losses (by close time)
  const closedByTime = out.filter((x) => x.status === 'closed').sort((a, b) => (a.closeTime! < b.closeTime! ? -1 : 1))
  for (const x of out) {
    const before = closedByTime.filter((c) => c.closeTime! <= x.t.openTime && c !== x)
    let streak = 0
    for (let i = before.length - 1; i >= 0 && before[i].result === 'loss'; i--) streak++
    x.afterLosses = streak >= 2
  }
  return out
}

export type Summary = {
  balance: number
  equity: number
  floating: number
  floatingKnown: boolean
  startCapital: number
  netDeposits: number
  realised: number
  total: number
  closed: number
  open: number
  wins: number
  losses: number
  bes: number
  winRate?: number
  profitFactor?: number
  avgWin?: number
  avgLoss?: number
  avgR?: number
  avgPlannedRR?: number
  expectancy?: number
  maxDdPct: number
  maxDdAbs: number
  curve: { time: number; balance: number; pnl: number; kind: 'start' | 'cash' | 'trade' }[]
  byDay: Map<string, { pnl: number; trades: number }>
}

export function summary(ctx: Ctx, list: TradeInfo[]): Summary {
  const { state } = ctx
  const tz = state.settings.tz
  const conv = (cur: string) => ctx.toDisplay[cur] ?? 1
  type Ev = { time: number; amount: number; kind: 'start' | 'cash' | 'trade'; trade?: boolean }
  const evs: Ev[] = []
  let startCapital = 0, netDeposits = 0
  for (const a of ctx.accounts) {
    const v = a.startBalance * conv(a.currency)
    startCapital += v
    evs.push({ time: Date.parse(a.startDate + 'T00:00:00Z'), amount: v, kind: 'start' })
  }
  const ids = new Set(ctx.accounts.map((a) => a.id))
  const curOf = new Map(state.accounts.map((a) => [a.id, a.currency]))
  for (const c of state.cash) {
    if (!ids.has(c.accountId)) continue
    const v = cashSign(c) * c.amount * conv(curOf.get(c.accountId) || 'USD')
    netDeposits += v
    evs.push({ time: ms(c.time), amount: v, kind: 'cash' })
  }
  const byDay = new Map<string, { pnl: number; trades: number }>()
  for (const x of list) {
    const k = conv(curOf.get(x.t.accountId) || 'USD')
    for (const e of x.t.exits) {
      evs.push({ time: ms(e.time), amount: e.pnl * k, kind: 'trade' })
      const d = dayKey(e.time, tz)
      const cur = byDay.get(d) || { pnl: 0, trades: 0 }
      cur.pnl += e.pnl * k
      byDay.set(d, cur)
    }
    if (x.status === 'closed' && x.closeTime) {
      const d = dayKey(x.closeTime, tz)
      const cur = byDay.get(d) || { pnl: 0, trades: 0 }
      cur.trades += 1
      byDay.set(d, cur)
    }
  }
  evs.sort((a, b) => a.time - b.time || (a.kind === 'trade' ? 1 : -1))
  let bal = 0, pnl = 0, idx = 1, peak = 1, maxDd = 0, pnlPeak = 0, maxDdAbs = 0
  const curve: Summary['curve'] = []
  for (const e of evs) {
    if (e.kind === 'trade') {
      if (bal > 0) idx *= 1 + e.amount / bal
      pnl += e.amount
      peak = Math.max(peak, idx)
      maxDd = Math.min(maxDd, idx / peak - 1)
      pnlPeak = Math.max(pnlPeak, pnl)
      maxDdAbs = Math.max(maxDdAbs, pnlPeak - pnl)
    }
    bal += e.amount
    curve.push({ time: e.time, balance: bal, pnl, kind: e.kind })
  }
  const closed = list.filter((x) => x.status === 'closed')
  const wins = closed.filter((x) => x.result === 'win')
  const losses = closed.filter((x) => x.result === 'loss')
  const bes = closed.filter((x) => x.result === 'be')
  const gp = wins.reduce((s, x) => s + x.pnlDisp, 0)
  const gl = Math.abs(losses.reduce((s, x) => s + x.pnlDisp, 0))
  const rs = closed.filter((x) => x.r !== undefined).map((x) => x.r!)
  const prr = list.filter((x) => x.plannedRR !== undefined && isFinite(x.plannedRR)).map((x) => x.plannedRR!)
  const floatingParts = list.filter((x) => x.openLots > 0)
  const floating = floatingParts.reduce((s, x) => s + (x.floating ?? 0) * conv(curOf.get(x.t.accountId) || 'USD'), 0)
  const realised = list.reduce((s, x) => s + x.pnlDisp, 0)
  const decided = wins.length + losses.length
  return {
    balance: bal,
    equity: bal + floating,
    floating,
    floatingKnown: floatingParts.every((x) => x.floating !== undefined),
    startCapital,
    netDeposits,
    realised,
    total: list.length,
    closed: closed.length,
    open: list.filter((x) => x.status !== 'closed').length,
    wins: wins.length,
    losses: losses.length,
    bes: bes.length,
    winRate: decided ? (wins.length / decided) * 100 : undefined,
    profitFactor: gl > 0 ? gp / gl : gp > 0 ? Infinity : undefined,
    avgWin: wins.length ? gp / wins.length : undefined,
    avgLoss: losses.length ? -gl / losses.length : undefined,
    avgR: rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : undefined,
    avgPlannedRR: prr.length ? prr.reduce((a, b) => a + b, 0) / prr.length : undefined,
    expectancy: closed.length ? closed.reduce((s, x) => s + x.pnlDisp, 0) / closed.length : undefined,
    maxDdPct: maxDd * 100,
    maxDdAbs,
    curve,
    byDay,
  }
}

export function periodPnl(byDay: Summary['byDay'], tz: string) {
  const today = dayKey(new Date().toISOString(), tz)
  const week = weekKey(today), month = today.slice(0, 7), year = today.slice(0, 4)
  const r = { day: 0, week: 0, month: 0, year: 0 }
  for (const [d, v] of byDay) {
    if (d === today) r.day += v.pnl
    if (weekKey(d) === week) r.week += v.pnl
    if (d.startsWith(month)) r.month += v.pnl
    if (d.startsWith(year)) r.year += v.pnl
  }
  return r
}

export type Group = { key: string; n: number; wins: number; losses: number; winRate?: number; net: number; pf?: number; avgR?: number; avgRR?: number }

export function groupBy(list: TradeInfo[], key: (x: TradeInfo) => string | undefined): Group[] {
  const m = new Map<string, TradeInfo[]>()
  for (const x of list) {
    if (x.status !== 'closed') continue
    const k = key(x)
    if (!k) continue
    m.set(k, [...(m.get(k) || []), x])
  }
  return [...m.entries()].map(([k, xs]) => {
    const w = xs.filter((x) => x.result === 'win'), l = xs.filter((x) => x.result === 'loss')
    const gp = w.reduce((s, x) => s + x.pnlDisp, 0), gl = Math.abs(l.reduce((s, x) => s + x.pnlDisp, 0))
    const rs = xs.filter((x) => x.r !== undefined).map((x) => x.r!)
    const rr = xs.filter((x) => x.plannedRR !== undefined && isFinite(x.plannedRR)).map((x) => x.plannedRR!)
    return {
      key: k, n: xs.length, wins: w.length, losses: l.length,
      winRate: w.length + l.length ? (w.length / (w.length + l.length)) * 100 : undefined,
      net: xs.reduce((s, x) => s + x.pnlDisp, 0),
      pf: gl > 0 ? gp / gl : gp > 0 ? Infinity : undefined,
      avgR: rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : undefined,
      avgRR: rr.length ? rr.reduce((a, b) => a + b, 0) / rr.length : undefined,
    }
  }).sort((a, b) => b.net - a.net)
}

export function riskStats(list: TradeInfo[], s: Settings) {
  const closed = list.filter((x) => x.status === 'closed').sort((a, b) => (a.closeTime! < b.closeTime! ? -1 : 1))
  let cw = 0, cl = 0, maxW = 0, maxL = 0
  for (const x of closed) {
    if (x.result === 'win') { cw++; cl = 0 } else if (x.result === 'loss') { cl++; cw = 0 }
    maxW = Math.max(maxW, cw)
    maxL = Math.max(maxL, cl)
  }
  const risks = list.filter((x) => x.riskPct !== undefined && isFinite(x.riskPct)).map((x) => x.riskPct!)
  const avg = risks.length ? risks.reduce((a, b) => a + b, 0) / risks.length : undefined
  const sd = risks.length > 1 && avg ? Math.sqrt(risks.reduce((a, b) => a + (b - avg) ** 2, 0) / (risks.length - 1)) : undefined
  const cv = sd !== undefined && avg ? sd / avg : undefined
  const largestLoss = closed.reduce<TradeInfo | undefined>((m, x) => (x.pnlDisp < (m?.pnlDisp ?? 0) ? x : m), undefined)
  const largestWin = closed.reduce<TradeInfo | undefined>((m, x) => (x.pnlDisp > (m?.pnlDisp ?? 0) ? x : m), undefined)
  const warnings = list.filter((x) => (x.riskPct ?? 0) > s.maxRiskPct || (x.t.leverage ?? 0) > s.maxLeverage || (x.effLeverage ?? 0) > s.maxLeverage)
  const noSl = list.filter((x) => x.t.sl === undefined)
  const overDays = new Set(list.filter((x) => x.overtrade).map((x) => dayKey(x.t.openTime, s.tz)))
  return { avgRisk: avg, riskSd: sd, cv, maxConsecWins: maxW, maxConsecLosses: maxL, largestLoss, largestWin, warnings, noSl, overDays: [...overDays].sort() }
}

export type Insight = { id: string; label: string; n: number; wr: number; nOther: number; wrOther: number; avgR?: number; avgROther?: number; tone: 'bad' | 'good' }

export function psychology(list: TradeInfo[]): Insight[] {
  const closed = list.filter((x) => x.status === 'closed' && (x.result === 'win' || x.result === 'loss'))
  const wr = (xs: TradeInfo[]) => (xs.length ? (xs.filter((x) => x.result === 'win').length / xs.length) * 100 : 0)
  const ar = (xs: TradeInfo[]) => {
    const r = xs.filter((x) => x.r !== undefined).map((x) => x.r!)
    return r.length ? r.reduce((a, b) => a + b, 0) / r.length : undefined
  }
  const tests: [string, string, (x: TradeInfo) => boolean][] = [
    ['impulse', 'impulse', (x) => x.t.plan === 'impulse'],
    ['strategy', 'strategy', (x) => x.t.plan === 'strategy'],
    ['revenge', 'revenge', (x) => !!x.t.revenge || x.autoRevenge],
    ['overtrade', 'overtrade', (x) => x.overtrade],
    ['afterLosses', 'afterLosses', (x) => x.afterLosses],
    ...(['calm', 'confident', 'fearful', 'frustrated', 'greedy', 'fomo', 'bored', 'tired'] as const).map((e) => [`emotion:${e}`, e, (x: TradeInfo) => x.t.emotion === e] as [string, string, (x: TradeInfo) => boolean]),
  ]
  const out: Insight[] = []
  for (const [id, label, f] of tests) {
    const a = closed.filter(f), b = closed.filter((x) => !f(x))
    if (a.length < 5 || b.length < 5) continue
    const wa = wr(a), wb = wr(b)
    if (Math.abs(wa - wb) < 10) continue
    out.push({ id, label, n: a.length, wr: wa, nOther: b.length, wrOther: wb, avgR: ar(a), avgROther: ar(b), tone: wa < wb ? 'bad' : 'good' })
  }
  return out.sort((x, y) => Math.abs(y.wr - y.wrOther) - Math.abs(x.wr - x.wrOther))
}
