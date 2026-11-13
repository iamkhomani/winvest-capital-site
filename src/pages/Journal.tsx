import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { DISCORD_URL } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import { cashSign, dayKey, groupBy, infos, periodPnl, psychology, riskStats, summary } from '../journal/calc'
import type { Ctx, Group, TradeInfo } from '../journal/calc'
import { journalCopy } from '../journal/copy'
import type { JC } from '../journal/copy'
import { allImages, blobToDataUrl, clearAll, dataUrlToBlob, deleteImage, loadState, putImage, saveState } from '../journal/db'
import { livePrice, pairLabel, rate } from '../journal/fx'
import ImportPanel from '../journal/ImportPanel'
import { checkTrade } from '../journal/autoclose'
import { fmtDateTime, nowWall, TIMEZONES, wallToIso } from '../journal/time'
import TradeForm, { Field, inputCls } from '../journal/TradeForm'
import { ACCOUNT_CURRENCIES, defaultSettings, emptyState, uid } from '../journal/types'
import type { Account, AccountCurrency, CashMove, JournalState, Settings, Trade } from '../journal/types'

// EvilCharts (Recharts) only downloads when a chart is shown.
const EquityChart = lazy(() => import('../journal/Charts').then((m) => ({ default: m.EquityChart })))
const MonthlyPnlChart = lazy(() => import('../journal/Charts').then((m) => ({ default: m.MonthlyPnlChart })))
const GroupBarChart = lazy(() => import('../journal/Charts').then((m) => ({ default: m.GroupBarChart })))
const OutcomeChart = lazy(() => import('../journal/Charts').then((m) => ({ default: m.OutcomeChart })))
const ChartFallback = ({ h = 'h-60' }: { h?: string }) => <div className={`${h} w-full animate-pulse rounded-xl bg-white/[0.03]`} />

type Tab = keyof JC['tabs']

const toneCls = (v?: number) => (v === undefined || !isFinite(v) || Math.abs(v) < 1e-9 ? 'text-white' : v > 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]')

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 ${className}`}>{children}</div>
}
function Kpi({ label, value, sub, cls = '' }: { label: string; value: ReactNode; sub?: ReactNode; cls?: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4">
      <div className="text-[11px] font-medium tracking-wide text-white/50 uppercase sm:text-xs">{label}</div>
      <div className={`mt-1 truncate text-xl font-bold tabular-nums sm:text-2xl ${cls}`}>{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-white/50">{sub}</div> : null}
    </div>
  )
}

function GroupTable({ c, groups, label, money, limit }: { c: JC; groups: Group[]; label: (k: string) => string; money: (v: number) => string; limit?: number }) {
  if (!groups.length) return <p className="text-sm text-white/45">{c.analytics.none}</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="text-left text-xs text-white/50">
          <tr><th className="py-2 pr-2 font-medium" /><th className="px-2 py-2 text-right font-medium">{c.cols.n}</th><th className="px-2 py-2 text-right font-medium">{c.cols.wr}</th><th className="px-2 py-2 text-right font-medium">{c.cols.pf}</th><th className="px-2 py-2 text-right font-medium">{c.cols.avgRR}</th><th className="px-2 py-2 text-right font-medium">{c.cols.avgR}</th><th className="py-2 pl-2 text-right font-medium">{c.cols.net}</th></tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {groups.slice(0, limit ?? groups.length).map((g) => (
            <tr key={g.key}>
              <td className="py-2 pr-2 font-semibold">{label(g.key)}</td>
              <td className="px-2 py-2 text-right tabular-nums">{g.n}</td>
              <td className="px-2 py-2 text-right tabular-nums">{g.winRate === undefined ? '–' : g.winRate.toFixed(0) + '%'}</td>
              <td className="px-2 py-2 text-right tabular-nums">{g.pf === undefined ? '–' : isFinite(g.pf) ? g.pf.toFixed(2) : '∞'}</td>
              <td className="px-2 py-2 text-right tabular-nums">{g.avgRR === undefined ? '–' : '1:' + g.avgRR.toFixed(2)}</td>
              <td className={`px-2 py-2 text-right tabular-nums ${toneCls(g.avgR)}`}>{g.avgR === undefined ? '–' : g.avgR.toFixed(2) + 'R'}</td>
              <td className={`py-2 pl-2 text-right font-semibold tabular-nums ${toneCls(g.net)}`}>{money(g.net)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Calendar({ c, byDay, tz, money, locale }: { c: JC; byDay: Map<string, { pnl: number; trades: number }>; tz: string; money: (v: number) => string; locale: string }) {
  const today = dayKey(new Date().toISOString(), tz)
  const [ym, setYm] = useState(today.slice(0, 7))
  const [y, m] = ym.split('-').map(Number)
  const first = new Date(Date.UTC(y, m - 1, 1))
  const start = new Date(first)
  start.setUTCDate(1 - ((first.getUTCDay() + 6) % 7))
  const weeks: string[][] = []
  const cur = new Date(start)
  while (weeks.length < 6) {
    const w: string[] = []
    for (let i = 0; i < 7; i++) {
      w.push(cur.toISOString().slice(0, 10))
      cur.setUTCDate(cur.getUTCDate() + 1)
    }
    if (weeks.length >= 4 && !w.some((d) => d.startsWith(ym))) break
    weeks.push(w)
  }
  const monthTotal = [...byDay.entries()].filter(([d]) => d.startsWith(ym)).reduce((s, [, v]) => s + v.pnl, 0)
  const shift = (k: number) => {
    const d = new Date(Date.UTC(y, m - 1 + k, 1))
    setYm(d.toISOString().slice(0, 7))
  }
  const maxAbs = Math.max(1, ...[...byDay.entries()].filter(([d]) => d.startsWith(ym)).map(([, v]) => Math.abs(v.pnl)))
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => shift(-1)} className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:border-white/40">‹</button>
        <div className="text-center">
          <div className="text-lg font-bold capitalize">{first.toLocaleDateString(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' })}</div>
          <div className={`text-sm tabular-nums ${toneCls(monthTotal)}`}>{c.calendar.monthTotal}: {money(monthTotal)}</div>
        </div>
        <button type="button" onClick={() => shift(1)} className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:border-white/40">›</button>
      </div>
      <div className="mt-4 grid grid-cols-8 gap-1 text-center text-[11px] text-white/45">
        {c.calendar.days.map((d) => <div key={d}>{d}</div>)}
        <div>{c.calendar.weekTotal}</div>
      </div>
      <div className="mt-1 grid gap-1">
        {weeks.map((w) => {
          const wt = w.reduce((s, d) => s + (byDay.get(d)?.pnl ?? 0), 0)
          return (
            <div key={w[0]} className="grid grid-cols-8 gap-1">
              {w.map((d) => {
                const v = byDay.get(d)
                const inMonth = d.startsWith(ym)
                const a = v ? Math.min(0.85, 0.15 + (Math.abs(v.pnl) / maxAbs) * 0.7) : 0
                const bg = v && v.pnl > 0 ? `rgba(52,211,153,${a})` : v && v.pnl < 0 ? `rgba(254,0,0,${a})` : 'var(--wc-heat)'
                return (
                  <div key={d} style={{ background: inMonth ? bg : 'transparent' }} className={`min-h-[3.6rem] rounded-lg p-1 text-left sm:min-h-[4.5rem] sm:p-1.5 ${inMonth ? '' : 'opacity-30'} ${d === today ? 'ring-1 ring-white/60' : ''}`}>
                    <div className="text-[10px] text-white/60">{+d.slice(8)}</div>
                    {v && inMonth ? (
                      <>
                        <div className="truncate text-[10px] font-bold tabular-nums sm:text-xs">{money(v.pnl)}</div>
                        {v.trades ? <div className="hidden text-[10px] text-white/70 sm:block">{v.trades} {c.calendar.trades}</div> : null}
                      </>
                    ) : null}
                  </div>
                )
              })}
              <div className={`flex items-center justify-center rounded-lg bg-white/[0.04] text-[10px] font-semibold tabular-nums sm:text-xs ${toneCls(wt)}`}>{wt ? money(wt) : '–'}</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function AccountsPanel({ c, state, update }: { c: JC; state: JournalState; update: (fn: (s: JournalState) => void) => void }) {
  const a = c.accounts
  const blank = (): Account => ({ id: uid(), name: '', broker: '', type: 'live', currency: 'USD', startBalance: 0, startDate: new Date().toISOString().slice(0, 10), leverage: 30 })
  const [edit, setEdit] = useState<Account | null>(state.accounts.length ? null : blank())
  const [del, setDel] = useState<string | null>(null)
  const [cash, setCash] = useState({ accountId: state.accounts[0]?.id ?? '', type: 'deposit' as 'deposit' | 'withdrawal' | 'transfer' | 'adjustment', amount: '', to: '', received: '', time: nowWall(state.settings.tz), note: '' })
  const n = (s: string) => parseFloat(s.replace(',', '.'))
  const accName = (id: string) => state.accounts.find((x) => x.id === id)?.name ?? '?'
  const addCash = () => {
    const amt = n(cash.amount)
    const time = wallToIso(cash.time, state.settings.tz)
    if (!cash.accountId || !(amt !== 0 && isFinite(amt)) || !time) return
    update((s) => {
      if (cash.type === 'transfer') {
        if (!cash.to || cash.to === cash.accountId) return
        const link = uid()
        const recv = n(cash.received) > 0 ? n(cash.received) : amt
        s.cash.push({ id: uid(), accountId: cash.accountId, type: 'transfer_out', amount: Math.abs(amt), time, note: cash.note || undefined, linkId: link })
        s.cash.push({ id: uid(), accountId: cash.to, type: 'transfer_in', amount: Math.abs(recv), time, note: cash.note || undefined, linkId: link })
      } else {
        s.cash.push({ id: uid(), accountId: cash.accountId, type: cash.type, amount: cash.type === 'adjustment' ? amt : Math.abs(amt), time, note: cash.note || undefined })
      }
    })
    setCash((x) => ({ ...x, amount: '', received: '', note: '' }))
  }
  const typeLabel = (m: CashMove) => (m.type === 'deposit' ? a.deposit : m.type === 'withdrawal' ? a.withdrawal : m.type === 'adjustment' ? a.adjustment : a.transfer)
  return (
    <div className="grid gap-4">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{a.title}</h2>
          <button type="button" onClick={() => setEdit(blank())} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40">{a.add}</button>
        </div>
        <ul className="mt-3 divide-y divide-white/5">
          {state.accounts.map((x) => (
            <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span>
                <span className="font-semibold">{x.name}</span> <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${x.type === 'live' ? 'bg-[var(--wc-red)]/30 text-white' : 'bg-white/10 text-white/70'}`}>{x.type === 'live' ? a.live : a.demo}</span>
                <span className="block text-xs text-white/50">{x.broker ? x.broker + ' · ' : ''}{x.currency} · {a.start} {x.startBalance.toLocaleString()} · {x.startDate}{x.leverage ? ` · 1:${x.leverage}` : ''}</span>
              </span>
              <span className="flex gap-2 text-sm">
                <button type="button" onClick={() => setEdit({ ...x })} className="text-white/60 hover:text-white">{a.edit}</button>
                {del === x.id
                  ? <button type="button" onClick={() => { update((s) => { const tr = s.trades.filter((t) => t.accountId === x.id); tr.forEach((t) => t.shots.forEach((sh) => void deleteImage(sh.id).catch(() => undefined))); s.trades = s.trades.filter((t) => t.accountId !== x.id); s.cash = s.cash.filter((m) => m.accountId !== x.id); s.accounts = s.accounts.filter((y) => y.id !== x.id) }); setDel(null) }} className="text-[var(--wc-red-soft)]">{a.delConfirm}</button>
                  : <button type="button" onClick={() => setDel(x.id)} className="text-white/40 hover:text-[var(--wc-red-soft)]">{a.del}</button>}
              </span>
            </li>
          ))}
        </ul>
        {edit ? (
          <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 p-4 sm:grid-cols-3">
            <Field label={a.name}><input value={edit.name} maxLength={40} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={inputCls} /></Field>
            <Field label={a.broker}><input value={edit.broker ?? ''} maxLength={40} onChange={(e) => setEdit({ ...edit, broker: e.target.value })} className={inputCls} /></Field>
            <Field label={a.type}>
              <select value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value as Account['type'] })} className={inputCls}><option value="live" className="bg-[var(--wc-panel)]">{a.live}</option><option value="demo" className="bg-[var(--wc-panel)]">{a.demo}</option></select>
            </Field>
            <Field label={a.currency}>
              <select value={edit.currency} disabled={state.trades.some((t) => t.accountId === edit.id)} onChange={(e) => setEdit({ ...edit, currency: e.target.value as AccountCurrency })} className={inputCls}>{ACCOUNT_CURRENCIES.map((x) => <option key={x} value={x} className="bg-[var(--wc-panel)]">{x}</option>)}</select>
            </Field>
            <Field label={a.start}><input inputMode="decimal" value={String(edit.startBalance)} onChange={(e) => setEdit({ ...edit, startBalance: n(e.target.value) || 0 })} className={inputCls} /></Field>
            <Field label={a.startDate}><input type="date" value={edit.startDate} onChange={(e) => setEdit({ ...edit, startDate: e.target.value })} className={inputCls} /></Field>
            <Field label={a.leverage}><input inputMode="numeric" value={edit.leverage ?? ''} onChange={(e) => setEdit({ ...edit, leverage: n(e.target.value) || undefined })} className={inputCls} /></Field>
            <div className="flex items-end gap-2 sm:col-span-2">
              <button type="button" onClick={() => { if (!edit.name.trim()) return; update((s) => { const i = s.accounts.findIndex((x) => x.id === edit.id); const v = { ...edit, name: edit.name.trim() }; if (i >= 0) s.accounts[i] = v; else s.accounts.push(v) }); setCash((x) => ({ ...x, accountId: x.accountId || edit.id })); setEdit(null) }} className="rounded-full bg-[var(--wc-red)] px-5 py-2 font-semibold text-white">{a.save}</button>
              {state.accounts.length ? <button type="button" onClick={() => setEdit(null)} className="rounded-full border border-white/15 px-5 py-2 text-white/80">{a.cancel}</button> : null}
            </div>
          </div>
        ) : null}
      </Card>

      {state.accounts.length ? (
        <Card>
          <h2 className="text-lg font-bold">{a.cash}</h2>
          <p className="mt-1 text-sm text-white/55">{a.cashNote}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-6">
            <Field label={c.cols.account} className="sm:col-span-2"><select value={cash.accountId} onChange={(e) => setCash({ ...cash, accountId: e.target.value })} className={inputCls}>{state.accounts.map((x) => <option key={x.id} value={x.id} className="bg-[var(--wc-panel)]">{x.name} ({x.currency})</option>)}</select></Field>
            <Field label={a.type} className="sm:col-span-2"><select value={cash.type} onChange={(e) => setCash({ ...cash, type: e.target.value as typeof cash.type })} className={inputCls}><option value="deposit" className="bg-[var(--wc-panel)]">{a.deposit}</option><option value="withdrawal" className="bg-[var(--wc-panel)]">{a.withdrawal}</option><option value="transfer" className="bg-[var(--wc-panel)]">{a.transfer}</option><option value="adjustment" className="bg-[var(--wc-panel)]">{a.adjustment}</option></select></Field>
            <Field label={a.amount}><input inputMode="decimal" value={cash.amount} onChange={(e) => setCash({ ...cash, amount: e.target.value })} className={inputCls} /></Field>
            <Field label={c.cols.date}><input type="datetime-local" value={cash.time} onChange={(e) => setCash({ ...cash, time: e.target.value })} className={inputCls} /></Field>
            {cash.type === 'transfer' ? (
              <>
                <Field label={a.to} className="sm:col-span-2"><select value={cash.to} onChange={(e) => setCash({ ...cash, to: e.target.value })} className={inputCls}><option value="" className="bg-[var(--wc-panel)]">–</option>{state.accounts.filter((x) => x.id !== cash.accountId).map((x) => <option key={x.id} value={x.id} className="bg-[var(--wc-panel)]">{x.name} ({x.currency})</option>)}</select></Field>
                <Field label={a.received}><input inputMode="decimal" value={cash.received} placeholder={cash.amount} onChange={(e) => setCash({ ...cash, received: e.target.value })} className={inputCls} /></Field>
              </>
            ) : null}
            <Field label={a.note} className="sm:col-span-2"><input value={cash.note} maxLength={100} onChange={(e) => setCash({ ...cash, note: e.target.value })} className={inputCls} /></Field>
            <div className="flex items-end"><button type="button" onClick={addCash} className="w-full rounded-full bg-[var(--wc-red)] px-4 py-2 font-semibold text-white">{a.addCash}</button></div>
          </div>
          <ul className="mt-4 divide-y divide-white/5 text-sm">
            {[...state.cash].sort((x, y) => y.time.localeCompare(x.time)).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                <span><span className="font-semibold">{typeLabel(m)}</span> <span className="text-white/50">· {accName(m.accountId)} · {fmtDateTime(m.time, state.settings.tz, 'nl-NL')}{m.note ? ` · ${m.note}` : ''}</span></span>
                <span className="flex items-center gap-3">
                  <span className={`tabular-nums ${cashSign(m) > 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]'}`}>{cashSign(m) > 0 ? '+' : '−'}{Math.abs(m.amount).toLocaleString()}</span>
                  <button type="button" onClick={() => update((s) => { s.cash = s.cash.filter((x) => x.id !== m.id && (!m.linkId || x.linkId !== m.linkId)) })} className="text-white/40 hover:text-[var(--wc-red-soft)]">✕</button>
                </span>
              </li>
            ))}
            {!state.cash.length ? <li className="py-3 text-white/45">{a.none}</li> : null}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}

export default function Journal({ lang }: { lang: Lang }) {
  const c = journalCopy[lang]
  const locale = lang === 'nl' ? 'nl-NL' : 'en-GB'
  const [state, setState] = useState<JournalState | null>(null)
  const [saveOk, setSaveOk] = useState(true)
  const [tab, setTab] = useState<Tab>('dash')
  const [acct, setAcct] = useState<string>('all')
  const [form, setForm] = useState<{ trade?: Trade } | null>(null)
  const [rates, setRates] = useState<Record<string, number>>({})
  const [live, setLive] = useState<Record<string, number>>({})
  const [liveMsg, setLiveMsg] = useState('')
  const [curveMode, setCurveMode] = useState<'balance' | 'pnl'>('balance')
  const [q, setQ] = useState('')
  const [fRes, setFRes] = useState('')
  const [fPair, setFPair] = useState('')
  const [msg, setMsg] = useState('')
  const [withImages, setWithImages] = useState(true)
  const [confirmDel, setConfirmDel] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [autoMsgs, setAutoMsgs] = useState<string[]>([])
  const stateRef = useRef<JournalState | null>(null)
  stateRef.current = state
  const warned = useRef(new Set<string>())

  useEffect(() => {
    loadState().then(setState)
    const t = location.hash.slice(1) as Tab
    if (t && t in journalCopy.en.tabs) setTab(t)
  }, [])

  const update = (fn: (s: JournalState) => void) => {
    setState((prev) => {
      if (!prev) return prev
      const next = structuredClone(prev)
      fn(next)
      void saveState(next).then(setSaveOk)
      return next
    })
  }

  // Close open trades at their stop loss or take profit: on load and every minute while open.
  const loaded = state !== null
  const autoOn = state?.settings.autoClose !== false
  useEffect(() => {
    if (!loaded || !autoOn) return
    let alive = true
    let busy = false
    const run = async () => {
      const st = stateRef.current
      if (!st || busy || document.hidden) return
      busy = true
      const accs = new Map(st.accounts.map((a) => [a.id, a]))
      const open = st.trades.filter((t) => t.lots - t.exits.reduce((n, e) => n + e.lots, 0) > 1e-9 && ((t.sl ?? 0) > 0 || t.tps.some((x) => x > 0)))
      for (const t of open) {
        const acc = accs.get(t.accountId)
        if (!acc || !alive) continue
        try {
          const out = await checkTrade(t, acc.currency)
          if (!alive) break
          if (out.kind === 'closed') {
            update((draft) => {
              const live = draft.trades.find((x) => x.id === t.id)
              // Only when nothing changed in the meantime (for example a close entered by hand).
              if (live && live.exits.length === t.exits.length && live.updatedAt === t.updatedAt) {
                live.exits.push(out.exit)
                live.updatedAt = new Date().toISOString()
              }
            })
            setAutoMsgs((m) => [...m, c.autoClosed(pairLabel(t.pair), c.autoWhat[out.exit.kind as 'sl' | 'tp' | 'be'] ?? out.exit.kind)])
          } else if (out.kind === 'check' && !warned.current.has(t.id)) {
            warned.current.add(t.id)
            setAutoMsgs((m) => [...m, c.autoCheck(pairLabel(t.pair))])
          }
        } catch {
          // Pair not available or no connection: try again next minute.
        }
      }
      busy = false
    }
    void run()
    const timer = setInterval(() => void run(), 60_000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [loaded, autoOn]) // eslint-disable-line react-hooks/exhaustive-deps

  const selected = useMemo(() => (state ? (acct === 'all' ? state.accounts.filter((a) => !a.archived) : state.accounts.filter((a) => a.id === acct)) : []), [state, acct])
  const dispCur: AccountCurrency = acct === 'all' ? state?.settings.displayCurrency ?? 'EUR' : selected[0]?.currency ?? 'EUR'

  // conversion rates for the combined view
  useEffect(() => {
    if (!state) return
    const curs = [...new Set(selected.map((a) => a.currency))]
    let alive = true
    Promise.all(curs.map(async (cu) => [cu, await rate(cu, dispCur).catch(() => NaN)] as const)).then((rs) => {
      if (alive) setRates(Object.fromEntries(rs.filter(([, v]) => isFinite(v))))
    })
    return () => { alive = false }
  }, [state, selected, dispCur])

  const ctx: Ctx | null = state ? { state, accounts: selected, toDisplay: rates, live } : null
  const list = useMemo(() => (ctx ? infos(ctx) : []), [ctx?.state, ctx?.accounts, rates, live]) // eslint-disable-line react-hooks/exhaustive-deps
  const sum = useMemo(() => (ctx ? summary(ctx, list) : null), [list]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!state || !ctx || !sum) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/70">{c.intro}</p>
      </main>
    )
  }

  const s = state.settings
  const compact = (v: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: dispCur, notation: 'compact', maximumFractionDigits: 1 }).format(v)
  const money = (v?: number, cur: string = dispCur) => (v === undefined || !isFinite(v) ? '–' : new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: Math.abs(v) >= 10000 ? 0 : 2 }).format(v))
  const pct = (v?: number, d = 1) => (v === undefined || !isFinite(v) ? '–' : `${v.toFixed(d)}%`)
  const per = periodPnl(sum.byDay, s.tz)
  const rk = riskStats(list, s)
  const ins = psychology(list)
  const accById = new Map(state.accounts.map((a) => [a.id, a]))
  const conv = (x: TradeInfo) => rates[accById.get(x.t.accountId)?.currency ?? 'USD'] ?? 1
  const openList = list.filter((x) => x.openLots > 0)
  const ratesMissing = selected.some((a) => rates[a.currency] === undefined)

  const fetchLive = async () => {
    setLiveMsg('')
    const pairs = [...new Set(openList.map((x) => x.t.pair))]
    const out: Record<string, number> = {}
    let fail = false
    for (const p of pairs) {
      try { out[p] = await livePrice(p) } catch { fail = true }
    }
    setLive((l) => ({ ...l, ...out }))
    if (fail) setLiveMsg(c.livePriceFail)
  }

  const saveTrade = (t: Trade) => {
    update((st) => {
      const i = st.trades.findIndex((x) => x.id === t.id)
      if (i >= 0) st.trades[i] = t
      else st.trades.push(t)
    })
    setForm(null)
  }
  const deleteTrade = (t: Trade) => {
    t.shots.forEach((sh) => void deleteImage(sh.id).catch(() => undefined))
    update((st) => { st.trades = st.trades.filter((x) => x.id !== t.id) })
    setForm(null)
  }

  const exportJson = async () => {
    const images: Record<string, string> = {}
    if (withImages) {
      const all = await allImages().catch(() => ({} as Record<string, Blob>))
      for (const [k, b] of Object.entries(all)) images[k] = await blobToDataUrl(b)
    }
    const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString(), images }, null, 1)], { type: 'application/json' })
    download(blob, `winvest-journal-${new Date().toISOString().slice(0, 10)}.json`)
  }
  const exportCsv = () => {
    const head = ['account', 'ticket', 'pair', 'direction', 'open_time_utc', 'entry', 'sl', 'tps', 'lots', 'leverage', 'risk_pct', 'timeframe', 'setup', 'condition', 'plan', 'emotion', 'revenge', 'close_time_utc', 'avg_exit', 'pnl', 'r', 'result', 'notes']
    const rows = list.map((x) => {
      const t = x.t
      const avgExit = x.closedLots ? t.exits.reduce((s2, e) => s2 + e.price * e.lots, 0) / x.closedLots : ''
      return [accById.get(t.accountId)?.name ?? '', t.ticket ?? '', t.pair, t.direction, t.openTime, t.entry, t.sl ?? '', t.tps.join(' '), t.lots, t.leverage ?? '', x.riskPct?.toFixed(2) ?? '', t.timeframe ?? '', t.setup ?? '', t.condition ?? '', t.plan ?? '', t.emotion ?? '', t.revenge ? 'yes' : '', x.closeTime ?? '', avgExit, x.pnl.toFixed(2), x.r?.toFixed(2) ?? '', x.result, (t.notes ?? '').replace(/\n/g, ' ')]
    })
    const csv = [head, ...rows].map((r) => r.map((v) => { const sv = String(v); return /[",\n]/.test(sv) ? `"${sv.replace(/"/g, '""')}"` : sv }).join(',')).join('\n')
    download(new Blob([csv], { type: 'text/csv' }), `winvest-journal-trades-${new Date().toISOString().slice(0, 10)}.csv`)
  }
  const download = (blob: Blob, name: string) => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }
  const restore = async (file?: File) => {
    if (!file) return
    try {
      const j = JSON.parse(await file.text())
      if (j?.app !== 'winvest-journal' || !Array.isArray(j.accounts) || !Array.isArray(j.trades)) throw new Error('bad')
      const next: JournalState = { ...emptyState(), accounts: j.accounts, cash: Array.isArray(j.cash) ? j.cash : [], trades: j.trades.map((t: Trade) => ({ ...t, links: t.links ?? [], shots: t.shots ?? [], slMoves: t.slMoves ?? [], exits: t.exits ?? [], tps: t.tps ?? [] })), settings: { ...defaultSettings(), ...(j.settings || {}) } }
      await clearAll()
      for (const [k, v] of Object.entries((j.images || {}) as Record<string, string>)) if (typeof v === 'string' && v.startsWith('data:image/')) await putImage(k, await dataUrlToBlob(v))
      setSaveOk(await saveState(next))
      setState(next)
      setMsg(c.settings.importOk)
    } catch {
      setMsg(c.settings.importBad)
    }
  }

  const tabs = Object.keys(c.tabs) as Tab[]
  const label = {
    session: (k: string) => (c.sessions as Record<string, string>)[k] ?? k,
    weekday: (k: string) => c.weekdays[+k] ?? k,
    condition: (k: string) => (c.conditions as Record<string, string>)[k] ?? k,
  }
  const filtered = list
    .filter((x) => !fRes || x.result === fRes)
    .filter((x) => !fPair || x.t.pair === fPair)
    .filter((x) => !q || `${x.t.pair} ${x.t.setup ?? ''} ${x.t.notes ?? ''}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.t.openTime.localeCompare(a.t.openTime))
  const resultBadge = (x: TradeInfo) => {
    const cls = x.result === 'win' ? 'bg-emerald-500/20 text-emerald-300' : x.result === 'loss' ? 'bg-[var(--wc-red)]/25 text-[var(--wc-red-soft)]' : x.result === 'be' ? 'bg-white/10 text-white/80' : 'bg-sky-500/20 text-sky-300'
    return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{x.status === 'partial' ? c.status.partial : c.results[x.result]}</span>
  }
  const curvePts: { time: number; v: number; kind: string }[] = sum.curve.map((p) => ({ time: p.time, v: curveMode === 'pnl' ? p.pnl : p.balance, kind: p.kind }))
  if (curvePts.length) curvePts.push({ time: Date.now(), v: curveMode === 'pnl' ? sum.realised + sum.floating : sum.equity, kind: 'now' })

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/15 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-white/45"><a href={paths[lang].home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span> {c.h1}</nav>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1>
            <p className="mt-3 max-w-2xl text-white/65">{c.intro}</p>
          </div>
          {state.accounts.length ? <button type="button" onClick={() => setForm({})} className="rounded-full bg-[var(--wc-red)] px-5 py-3 font-semibold text-white transition hover:brightness-110">{c.addTrade}</button> : null}
        </div>
        {!saveOk ? <p className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">{c.settings.storageFail}</p> : null}
        {autoMsgs.length ? (
          <div role="status" className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.04] p-3 text-sm text-white/80">
            <ul className="space-y-1">{autoMsgs.map((m, i) => <li key={i}>{m}</li>)}</ul>
            <button type="button" onClick={() => setAutoMsgs([])} aria-label={c.form.cancel} className="text-white/50 hover:text-white">✕</button>
          </div>
        ) : null}

        {!state.accounts.length ? (
          <div className="mt-8"><p className="mb-4 max-w-2xl text-white/70">{c.noAccount}</p><AccountsPanel c={c} state={state} update={update} /></div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <select value={acct} onChange={(e) => setAcct(e.target.value)} className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold outline-none">
                <option value="all" className="bg-[var(--wc-panel)]">{c.allAccounts} · {s.displayCurrency}</option>
                {state.accounts.map((a) => <option key={a.id} value={a.id} className="bg-[var(--wc-panel)]">{a.name} · {a.currency}{a.type === 'demo' ? ' · demo' : ''}</option>)}
              </select>
              {ratesMissing ? <span className="text-xs text-amber-300">FX ⚠</span> : null}
            </div>
            <div role="tablist" className="mt-4 flex gap-1 overflow-x-auto rounded-full border border-white/15 p-1">
              {tabs.map((t) => (
                <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => { setTab(t); history.replaceState(null, '', '#' + t) }} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>{c.tabs[t]}</button>
              ))}
            </div>

            {tab === 'dash' && (
              <div className="mt-6 grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Kpi label={c.kpi.balance} value={money(sum.balance)} sub={`${c.kpi.netDeposits}: ${money(sum.netDeposits + sum.startCapital)}`} />
                  <Kpi label={c.kpi.equity} value={money(sum.equity)} sub={<span className={toneCls(sum.floating)}>{c.kpi.floating}: {money(sum.floating)}</span>} />
                  <Kpi label={c.kpi.realised} value={money(sum.realised)} cls={toneCls(sum.realised)} sub={sum.startCapital + sum.netDeposits > 0 ? pct((sum.realised / (sum.startCapital + sum.netDeposits)) * 100, 2) : undefined} />
                  <Kpi label={c.kpi.maxDd} value={pct(sum.maxDdPct)} cls={sum.maxDdPct < -20 ? 'text-[var(--wc-red-soft)]' : sum.maxDdPct < -10 ? 'text-amber-300' : ''} sub={money(-sum.maxDdAbs)} />
                </div>
                <p className="-mt-1 text-xs text-white/40">{c.kpi.balanceNote}{!sum.floatingKnown ? ` ${c.kpi.floatingUnknown}` : ''}</p>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {([['today', per.day], ['week', per.week], ['month', per.month], ['year', per.year]] as const).map(([k, v]) => <Kpi key={k} label={c.kpi[k]} value={money(v)} cls={toneCls(v)} />)}
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <Kpi label={c.kpi.winRate} value={pct(sum.winRate)} sub={`${c.kpi.wl}: ${sum.wins} / ${sum.losses} / ${sum.bes}`} />
                  <Kpi label={c.kpi.pf} value={sum.profitFactor === undefined ? '–' : isFinite(sum.profitFactor) ? sum.profitFactor.toFixed(2) : '∞'} cls={sum.profitFactor !== undefined && sum.profitFactor < 1 ? 'text-[var(--wc-red-soft)]' : ''} />
                  <Kpi label={c.kpi.avgRR} value={sum.avgPlannedRR === undefined ? '–' : '1:' + sum.avgPlannedRR.toFixed(2)} sub={`${c.kpi.avgR}: ${sum.avgR === undefined ? '–' : sum.avgR.toFixed(2) + 'R'}`} />
                  <Kpi label={c.kpi.total} value={sum.total} sub={`${sum.open} ${c.kpi.open}`} />
                  <Kpi label={c.kpi.avgWin} value={money(sum.avgWin)} cls="text-emerald-400" />
                  <Kpi label={c.kpi.avgLoss} value={money(sum.avgLoss)} cls="text-[var(--wc-red-soft)]" />
                  <Kpi label={c.kpi.expectancy} value={money(sum.expectancy)} cls={toneCls(sum.expectancy)} />
                  <Kpi label={c.risk.avgRisk} value={pct(rk.avgRisk, 2)} cls={(rk.avgRisk ?? 0) > s.maxRiskPct ? 'text-amber-300' : ''} />
                </div>
                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-bold">{c.equityCurve}</h2>
                    <div className="inline-flex rounded-full border border-white/15 p-1 text-sm">
                      <button type="button" onClick={() => setCurveMode('balance')} className={`rounded-full px-3 py-1 ${curveMode === 'balance' ? 'bg-white text-black' : 'text-white/70'}`}>{c.showBalance}</button>
                      <button type="button" onClick={() => setCurveMode('pnl')} className={`rounded-full px-3 py-1 ${curveMode === 'pnl' ? 'bg-white text-black' : 'text-white/70'}`}>{c.showPnl}</button>
                    </div>
                  </div>
                  <div className="mt-3"><Suspense fallback={<ChartFallback h="h-72" />}><EquityChart points={curvePts} money={(v) => money(v)} compact={compact} locale={locale} mode={curveMode === 'pnl' ? 'pnl' : 'balance'} t={c.charts} /></Suspense></div>
                </Card>
                <div className="grid gap-4 lg:grid-cols-3">
                  <Card className="lg:col-span-2"><h2 className="text-lg font-bold">{c.charts.monthlyH}</h2><div className="mt-3"><Suspense fallback={<ChartFallback />}><MonthlyPnlChart byDay={sum.byDay} money={(v) => money(v)} compact={compact} locale={locale} t={c.charts} /></Suspense></div></Card>
                  <Card><h2 className="text-lg font-bold">{c.charts.outcomeH}</h2><div className="mt-3"><Suspense fallback={<ChartFallback />}><OutcomeChart wins={sum.wins} losses={sum.losses} bes={sum.bes} t={c.charts} /></Suspense></div></Card>
                </div>
                {openList.length ? (
                  <Card>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-lg font-bold">{c.openPositions}</h2>
                      <button type="button" onClick={() => void fetchLive()} className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/80 hover:border-white/40">{c.fetchLive}</button>
                    </div>
                    {liveMsg ? <p className="mt-2 text-sm text-amber-300">{liveMsg}</p> : null}
                    <ul className="mt-3 divide-y divide-white/5 text-sm">
                      {openList.map((x) => (
                        <li key={x.t.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                          <button type="button" onClick={() => setForm({ trade: x.t })} className="text-left"><span className="font-semibold">{pairLabel(x.t.pair)}</span> <span className="text-white/50">{x.t.direction === 'buy' ? c.buy : c.sell} · {+x.openLots.toFixed(3)} lots @ {x.t.entry}</span></button>
                          <span className="text-white/60">{c.cols.price}: {live[x.t.pair] ?? x.t.mark ?? '–'}</span>
                          <span className={`font-semibold tabular-nums ${toneCls(x.floating)}`}>{x.floating === undefined ? '–' : money(x.floating * conv(x))}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ) : null}
              </div>
            )}

            {tab === 'trades' && (
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.filters.search} className="min-w-[12rem] flex-1 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm outline-none focus:border-[var(--wc-red)]" />
                  <select value={fPair} onChange={(e) => setFPair(e.target.value)} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-sm"><option value="" className="bg-[var(--wc-panel)]">{c.cols.pair}: {c.filters.all}</option>{[...new Set(list.map((x) => x.t.pair))].sort().map((p) => <option key={p} value={p} className="bg-[var(--wc-panel)]">{pairLabel(p)}</option>)}</select>
                  <select value={fRes} onChange={(e) => setFRes(e.target.value)} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-sm"><option value="" className="bg-[var(--wc-panel)]">{c.cols.result}: {c.filters.all}</option>{(['win', 'loss', 'be', 'open'] as const).map((r) => <option key={r} value={r} className="bg-[var(--wc-panel)]">{c.results[r]}</option>)}</select>
                </div>
                <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full min-w-[860px] text-sm">
                    <thead className="bg-white/[0.04] text-left text-xs text-white/50">
                      <tr>{[c.cols.date, c.cols.pair, c.cols.dir, c.cols.tf, c.cols.lots, c.cols.entry, c.cols.exit, c.cols.pips, c.cols.risk, c.cols.r, c.cols.pnl, c.cols.result].map((h, i) => <th key={h} className={`px-3 py-2.5 font-medium ${i >= 4 && i <= 10 ? 'text-right' : ''}`}>{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filtered.map((x) => {
                        const avgExit = x.closedLots ? x.t.exits.reduce((a, e) => a + e.price * e.lots, 0) / x.closedLots : undefined
                        const cur = accById.get(x.t.accountId)?.currency ?? 'USD'
                        return (
                          <tr key={x.t.id} onClick={() => setForm({ trade: x.t })} className="cursor-pointer hover:bg-white/[0.04]">
                            <td className="px-3 py-2.5 text-white/70">{fmtDateTime(x.t.openTime, s.tz, locale)}{acct === 'all' && state.accounts.length > 1 ? <span className="block text-[11px] text-white/40">{accById.get(x.t.accountId)?.name}</span> : null}</td>
                            <td className="px-3 py-2.5 font-semibold">{pairLabel(x.t.pair)}{x.t.shots.length ? ' 📷' : ''}</td>
                            <td className={`px-3 py-2.5 ${x.t.direction === 'buy' ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]'}`}>{x.t.direction === 'buy' ? c.buy : c.sell}</td>
                            <td className="px-3 py-2.5 text-white/60">{x.t.timeframe ?? ''}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{+x.t.lots.toFixed(3)}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{x.t.entry}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{avgExit !== undefined ? +avgExit.toFixed(5) : '–'}</td>
                            <td className={`px-3 py-2.5 text-right tabular-nums ${toneCls(x.pips)}`}>{x.pips === undefined ? '–' : x.pips.toFixed(1)}</td>
                            <td className={`px-3 py-2.5 text-right tabular-nums ${(x.riskPct ?? 0) > s.maxRiskPct ? 'text-amber-300' : 'text-white/70'}`}>{pct(x.riskPct, 2)}</td>
                            <td className={`px-3 py-2.5 text-right tabular-nums ${toneCls(x.r)}`}>{x.r === undefined ? '–' : x.r.toFixed(2)}</td>
                            <td className={`px-3 py-2.5 text-right font-semibold tabular-nums ${toneCls(x.pnl)}`}>{x.status === 'open' ? '–' : money(x.pnl, cur)}</td>
                            <td className="px-3 py-2.5">{resultBadge(x)}</td>
                          </tr>
                        )
                      })}
                      {!filtered.length ? <tr><td colSpan={12} className="px-3 py-8 text-center text-white/50">{c.noTrades}</td></tr> : null}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'calendar' && <div className="mt-6"><Calendar c={c} byDay={sum.byDay} tz={s.tz} money={(v) => money(v)} locale={locale} /></div>}

            {tab === 'analytics' && (() => {
              const pairs = groupBy(list, (x) => x.t.pair)
              return (
                <div className="mt-6 grid gap-4">
                  <Card><h2 className="text-lg font-bold">{c.analytics.pairs}</h2><div className="mt-3"><Suspense fallback={<ChartFallback />}><GroupBarChart groups={pairs} label={pairLabel} money={(v) => money(v)} compact={compact} t={c.charts} /></Suspense></div><div className="mt-3"><GroupTable c={c} groups={pairs} label={pairLabel} money={(v) => money(v)} /></div></Card>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card><h3 className="font-bold text-emerald-400">{c.analytics.best}</h3><div className="mt-2"><GroupTable c={c} groups={pairs.filter((g) => g.net > 0).slice(0, 5)} label={pairLabel} money={(v) => money(v)} /></div></Card>
                    <Card><h3 className="font-bold text-[var(--wc-red-soft)]">{c.analytics.worst}</h3><div className="mt-2"><GroupTable c={c} groups={[...pairs].reverse().filter((g) => g.net < 0).slice(0, 5)} label={pairLabel} money={(v) => money(v)} /></div></Card>
                  </div>
                  <Card><h2 className="text-lg font-bold">{c.analytics.condition}</h2><div className="mt-3"><GroupTable c={c} groups={groupBy(list, (x) => x.t.condition)} label={label.condition} money={(v) => money(v)} /></div></Card>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card><h3 className="font-bold">{c.analytics.session}</h3><div className="mt-2"><Suspense fallback={<ChartFallback h="h-40" />}><GroupBarChart groups={groupBy(list, (x) => x.session)} label={label.session} money={(v) => money(v)} compact={compact} t={c.charts} /></Suspense><div className="mt-2"><GroupTable c={c} groups={groupBy(list, (x) => x.session)} label={label.session} money={(v) => money(v)} /></div></div></Card>
                    <Card><h3 className="font-bold">{c.analytics.timeframe}</h3><div className="mt-2"><GroupTable c={c} groups={groupBy(list, (x) => x.t.timeframe)} label={(k) => k} money={(v) => money(v)} /></div></Card>
                    <Card><h3 className="font-bold">{c.analytics.weekday}</h3><div className="mt-2"><Suspense fallback={<ChartFallback h="h-40" />}><GroupBarChart groups={groupBy(list, (x) => String(x.weekday))} label={label.weekday} money={(v) => money(v)} compact={compact} t={c.charts} /></Suspense><div className="mt-2"><GroupTable c={c} groups={groupBy(list, (x) => String(x.weekday))} label={label.weekday} money={(v) => money(v)} /></div></div></Card>
                    <Card><h3 className="font-bold">{c.analytics.setup}</h3><div className="mt-2"><GroupTable c={c} groups={groupBy(list, (x) => x.t.setup)} label={(k) => k} money={(v) => money(v)} /></div></Card>
                  </div>
                </div>
              )
            })()}

            {tab === 'risk' && (
              <div className="mt-6 grid gap-4">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <Kpi label={c.risk.avgRisk} value={pct(rk.avgRisk, 2)} cls={(rk.avgRisk ?? 0) > s.maxRiskPct ? 'text-amber-300' : ''} />
                  <Kpi label={c.risk.largestLoss} value={money(rk.largestLoss?.pnlDisp)} cls="text-[var(--wc-red-soft)]" sub={rk.largestLoss ? `${pairLabel(rk.largestLoss.t.pair)} · ${fmtDateTime(rk.largestLoss.closeTime, s.tz, locale, false)}` : undefined} />
                  <Kpi label={c.risk.consecLosses} value={rk.maxConsecLosses} cls={rk.maxConsecLosses >= 5 ? 'text-[var(--wc-red-soft)]' : ''} />
                  <Kpi label={c.risk.consecWins} value={rk.maxConsecWins} />
                  <Kpi label={c.risk.consistency} value={rk.cv === undefined ? '–' : rk.cv < 0.25 ? c.risk.consistent : rk.cv < 0.5 ? c.risk.moderate : c.risk.inconsistent} cls={rk.cv !== undefined && rk.cv >= 0.5 ? 'text-amber-300' : ''} sub={c.risk.consistencyNote} />
                  <Kpi label={c.risk.largestWin} value={money(rk.largestWin?.pnlDisp)} cls="text-emerald-400" />
                  <Kpi label={c.kpi.maxDd} value={pct(sum.maxDdPct)} />
                  <Kpi label={c.risk.noSl} value={rk.noSl.length} cls={rk.noSl.length ? 'text-amber-300' : ''} />
                </div>
                <Card>
                  <h2 className="text-lg font-bold">{c.risk.warnings}</h2>
                  <p className="mt-1 text-xs text-white/45">{c.risk.limits(s.maxRiskPct, s.maxLeverage, s.maxTradesPerDay)}</p>
                  {rk.warnings.length ? (
                    <ul className="mt-3 divide-y divide-white/5 text-sm">
                      {rk.warnings.map((x) => (
                        <li key={x.t.id}>
                          <button type="button" onClick={() => setForm({ trade: x.t })} className="flex w-full flex-wrap justify-between gap-2 py-2 text-left hover:text-white">
                            <span className="font-semibold">{pairLabel(x.t.pair)} <span className="font-normal text-white/50">· {fmtDateTime(x.t.openTime, s.tz, locale)}</span></span>
                            <span className="text-amber-300">{(x.riskPct ?? 0) > s.maxRiskPct ? `${c.risk.riskOf} ${pct(x.riskPct, 2)} ` : ''}{Math.max(x.t.leverage ?? 0, x.effLeverage ?? 0) > s.maxLeverage ? `${c.risk.levOf} 1:${Math.round(Math.max(x.t.leverage ?? 0, x.effLeverage ?? 0))}` : ''}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-3 text-sm text-emerald-300">{c.risk.warningsNone}</p>}
                  {rk.overDays.length ? <p className="mt-4 text-sm text-amber-300">{c.risk.overDays}: {rk.overDays.slice(-10).join(', ')}</p> : null}
                </Card>
              </div>
            )}

            {tab === 'psych' && (
              <div className="mt-6 grid gap-4">
                <Card>
                  <h2 className="text-lg font-bold">{c.psych.title}</h2>
                  <p className="mt-1 text-sm text-white/55">{c.psych.intro}</p>
                  {ins.length ? (
                    <ul className="mt-4 grid gap-3">
                      {ins.map((i) => {
                        const isEmotion = i.id.startsWith('emotion:')
                        const g = isEmotion ? c.psych.emotionGroup(c.emotions[i.label] ?? i.label) : c.psych.groups[i.id] ?? i.id
                        const tip = i.tone === 'good' ? (i.id === 'strategy' ? c.psych.tips.strategy : c.psych.tips.good) : isEmotion ? c.psych.tips.emotion : c.psych.tips[i.id] ?? ''
                        return (
                          <li key={i.id} className={`rounded-xl border p-4 ${i.tone === 'bad' ? 'border-[var(--wc-red)]/40 bg-[var(--wc-red)]/10' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
                            <p className="font-semibold">{c.psych.sentence(g, i.wr, i.wrOther)}</p>
                            <p className="mt-1 text-sm text-white/70">{tip} <span className="text-white/40">(n = {i.n} / {i.nOther}{i.avgR !== undefined && i.avgROther !== undefined ? ` · ${i.avgR.toFixed(2)}R vs ${i.avgROther.toFixed(2)}R` : ''})</span></p>
                          </li>
                        )
                      })}
                    </ul>
                  ) : <p className="mt-4 text-sm text-white/60">{c.psych.needMore}</p>}
                  <p className="mt-3 text-xs text-white/40">{c.psych.note}</p>
                </Card>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card><h3 className="font-bold">{c.psych.plan}</h3><div className="mt-2"><GroupTable c={c} groups={groupBy(list, (x) => x.t.plan)} label={(k) => (c.plans as Record<string, string>)[k] ?? k} money={(v) => money(v)} /></div></Card>
                  <Card><h3 className="font-bold">{c.psych.emotion}</h3><div className="mt-2"><GroupTable c={c} groups={groupBy(list, (x) => x.t.emotion)} label={(k) => c.emotions[k] ?? k} money={(v) => money(v)} /></div></Card>
                  <Card className="lg:col-span-2"><h3 className="font-bold">{c.psych.flags}</h3><div className="mt-2"><GroupTable c={c} groups={[
                    ...groupBy(list, (x) => (x.t.revenge || x.autoRevenge ? 'revenge' : undefined)),
                    ...groupBy(list, (x) => (x.overtrade ? 'overtrade' : undefined)),
                    ...groupBy(list, (x) => (x.afterLosses ? 'afterLosses' : undefined)),
                  ]} label={(k) => c.psych.groups[k] ?? k} money={(v) => money(v)} /></div></Card>
                </div>
              </div>
            )}

            {tab === 'accounts' && <div className="mt-6"><AccountsPanel c={c} state={state} update={update} /></div>}

            {tab === 'import' && (
              <div className="mt-6">
                <ImportPanel c={c} state={state} accounts={state.accounts} locale={locale} onImport={(trades, cash) => update((st) => { st.trades.push(...trades); st.cash.push(...cash) })} />
              </div>
            )}

            {tab === 'settings' && (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <Card>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={c.settings.tz} hint={c.settings.tzNote}>
                      <select value={s.tz} onChange={(e) => update((st) => { st.settings.tz = e.target.value })} className={inputCls}>{[...new Set([s.tz, ...TIMEZONES])].map((z) => <option key={z} value={z} className="bg-[var(--wc-panel)]">{z}</option>)}</select>
                    </Field>
                    <Field label={c.settings.display}>
                      <select value={s.displayCurrency} onChange={(e) => update((st) => { st.settings.displayCurrency = e.target.value as AccountCurrency })} className={inputCls}>{ACCOUNT_CURRENCIES.map((x) => <option key={x} value={x} className="bg-[var(--wc-panel)]">{x}</option>)}</select>
                    </Field>
                  </div>
                  <h3 className="mt-5 font-semibold">{c.settings.autoH}</h3>
                  <label className="mt-2 flex items-center gap-2 text-sm text-white/80"><input type="checkbox" checked={s.autoClose !== false} onChange={(e) => update((st) => { st.settings.autoClose = e.target.checked })} className="size-4 accent-[var(--wc-red)]" />{c.settings.autoLabel}</label>
                  <p className="mt-1 text-xs text-white/45">{c.settings.autoP}</p>
                  <h3 className="mt-5 font-semibold">{c.settings.limits}</h3>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {([['maxRiskPct', c.settings.maxRisk], ['maxLeverage', c.settings.maxLev], ['maxTradesPerDay', c.settings.maxTrades], ['revengeMinutes', c.settings.revenge], ['beThresholdR', c.settings.be]] as [keyof Settings, string][]).map(([k, l]) => (
                      <Field key={k} label={l}><input inputMode="decimal" defaultValue={String(s[k])} onBlur={(e) => { const v = parseFloat(e.target.value.replace(',', '.')); if (v >= 0) update((st) => { (st.settings as unknown as Record<string, number>)[k] = v }) }} className={inputCls} /></Field>
                    ))}
                  </div>
                </Card>
                <Card>
                  <h2 className="text-lg font-bold">{c.settings.exportH}</h2>
                  <label className="mt-2 flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={withImages} onChange={(e) => setWithImages(e.target.checked)} className="accent-[var(--wc-red)]" />{c.settings.withImages}</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => void exportJson()} className="rounded-full bg-[var(--wc-red)] px-4 py-2 text-sm font-semibold text-white">{c.settings.exportJson}</button>
                    <button type="button" onClick={exportCsv} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40">{c.settings.exportCsv}</button>
                  </div>
                  <h2 className="mt-6 text-lg font-bold">{c.settings.importH}</h2>
                  <p className="mt-1 text-sm text-white/55">{c.settings.replace}</p>
                  <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { void restore(e.target.files?.[0]); e.target.value = '' }} />
                  <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40">{c.settings.importBtn}</button>
                  {msg ? <p className="mt-2 text-sm text-white/70">{msg}</p> : null}
                  <h2 className="mt-6 text-lg font-bold">{c.settings.delH}</h2>
                  <p className="mt-1 text-sm text-white/55">{c.settings.delP}</p>
                  {confirmDel ? (
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={async () => { await clearAll().catch(() => undefined); setState(emptyState()); setConfirmDel(false) }} className="rounded-full bg-[var(--wc-red)] px-4 py-2 text-sm font-semibold text-white">{c.settings.delConfirm}</button>
                      <button type="button" onClick={() => setConfirmDel(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80">{c.form.cancel}</button>
                    </div>
                  ) : <button type="button" onClick={() => setConfirmDel(true)} className="mt-3 rounded-full border border-[var(--wc-red)]/60 px-4 py-2 text-sm font-semibold text-[var(--wc-red-soft)]">{c.settings.del}</button>}
                </Card>
                <Card className="lg:col-span-2"><h2 className="text-lg font-bold">{c.settings.privacyH}</h2><p className="mt-1 text-sm text-white/60">{c.settings.privacyP}</p></Card>
              </div>
            )}
          </>
        )}

        <p className="mt-8 max-w-3xl text-sm text-white/45">{c.disclaimer}</p>
        <aside className="mt-8 max-w-3xl rounded-2xl border border-[var(--wc-red)]/50 bg-gradient-to-b from-[var(--wc-red)]/15 to-white/[0.02] p-6 sm:p-8">
          <h2 className="text-xl font-bold">{c.ctaH}</h2>
          <p className="mt-2 text-white/70">{c.ctaP}</p>
          <a href={DISCORD_URL} className="mt-5 inline-block rounded-full bg-[var(--wc-red)] px-5 py-2.5 font-semibold text-white transition hover:brightness-110">{c.ctaBtn}</a>
        </aside>
      </div>

      {form ? <TradeForm c={c} state={state} accounts={state.accounts} trade={form.trade} defaultAccount={acct !== 'all' ? acct : undefined} locale={locale} onSave={saveTrade} onDelete={deleteTrade} onClose={() => setForm(null)} /> : null}
    </main>
  )
}

