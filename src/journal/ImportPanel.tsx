import { useMemo, useState } from 'react'
import type { JC } from './copy'
import { instrument, pairLabel, quotePnl, rate } from './fx'
import type { Candidate, ImportOptions, Mapping, Table } from './importer'
import { FIELDS, REQUIRED, autoMap, build, parseCsv, parseHtml, readText } from './importer'
import { Field, inputCls } from './TradeForm'
import { fmtDateTime } from './time'
import type { Account, CashMove, JournalState, Trade } from './types'

export default function ImportPanel({ c, state, accounts, locale, onImport }: { c: JC; state: JournalState; accounts: Account[]; locale: string; onImport: (trades: Trade[], cash: CashMove[]) => void }) {
  const t = c.imp
  const [table, setTable] = useState<Table | null>(null)
  const [fileName, setFileName] = useState('')
  const [mapping, setMapping] = useState<Mapping>({})
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [opt, setOpt] = useState<ImportOptions>({ offsetHours: 0, dateOrder: 'ymd', volume: 'lots' })
  const [exclude, setExclude] = useState<Set<number>>(new Set())
  const [include, setInclude] = useState<Set<number>>(new Set())
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const onFile = async (file?: File) => {
    if (!file) return
    setMsg('')
    const text = await readText(file)
    const isHtml = /<table/i.test(text.slice(0, 200000)) || /\.html?$/i.test(file.name)
    const tb = isHtml ? parseHtml(text) : parseCsv(text)
    if (!tb.headers.length || !tb.rows.length) {
      setTable(null)
      setMsg(t.empty)
      return
    }
    setFileName(file.name)
    setTable(tb)
    setMapping(autoMap(tb.headers))
    setExclude(new Set())
    setInclude(new Set())
    if (isHtml) setOpt((o) => ({ ...o, offsetHours: 2 }))
  }

  const candidates: Candidate[] = useMemo(() => (table && accountId ? build(table, mapping, opt, accountId, state.trades, state.cash) : []), [table, mapping, opt, accountId, state.trades, state.cash])
  const chosen = (cd: Candidate) => (cd.errors.length ? false : include.has(cd.row) ? true : exclude.has(cd.row) ? false : cd.include)
  const ready = candidates.filter(chosen)
  const missingRequired = REQUIRED.filter((f) => mapping[f] === undefined)
  const acc = accounts.find((a) => a.id === accountId)

  const run = async () => {
    if (!acc) return
    setBusy(true)
    const trades: Trade[] = []
    const cash: CashMove[] = []
    for (const cd of ready) {
      if (cd.kind === 'cash' && cd.cash) cash.push(cd.cash)
      if (cd.kind === 'trade' && cd.trade) {
        const tr = { ...cd.trade, exits: cd.trade.exits.map((e) => ({ ...e })) }
        const inst = instrument(tr.pair)
        try {
          tr.convEntry = await rate(inst.quote, acc.currency, tr.openTime.slice(0, 10))
        } catch {
          /* risk calculation will be unavailable for this trade */
        }
        if (cd.needsRate) {
          for (const e of tr.exits) {
            try {
              const r = await rate(inst.quote, acc.currency, e.time.slice(0, 10))
              e.pnl = quotePnl(inst, tr.direction, tr.entry, e.price, e.lots) * r + (e.commission ?? 0) + (e.swap ?? 0)
              e.pnlSource = 'calc'
            } catch {
              /* keep 0 */
            }
          }
        }
        trades.push(tr)
      }
    }
    onImport(trades, cash)
    setBusy(false)
    setMsg(t.done(trades.length + cash.length))
    setTable(null)
  }

  const dups = candidates.filter((x) => x.duplicate).length
  const errs = candidates.filter((x) => x.errors.length).length
  const sel = 'rounded-xl border border-white/15 bg-white/[0.04] px-2 py-1.5 text-sm outline-none focus:border-[var(--wc-red)]'

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-lg font-bold">{t.title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-white/60">{t.intro}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label={t.account}>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputCls}>
              {accounts.map((a) => <option key={a.id} value={a.id} className="bg-[var(--wc-panel)]">{a.name} ({a.currency})</option>)}
            </select>
          </Field>
          <Field label={t.file}>
            <input type="file" accept=".csv,.txt,.htm,.html,text/csv,text/html" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = '' }} className="text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black" />
          </Field>
        </div>
        {msg ? <p className="mt-3 text-sm text-white/80">{msg}</p> : null}
        <p className="mt-3 text-xs text-white/40">{t.future}</p>
      </div>

      {table ? (
        <>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-bold">{t.mapping} · <span className="font-normal text-white/50">{fileName}</span></h3>
            <p className="mt-1 text-sm text-white/55">{t.mappingNote}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FIELDS.map((fl) => (
                <Field key={fl} label={`${t.fields[fl]}${REQUIRED.includes(fl) ? ' *' : ''}`}>
                  <select value={mapping[fl] ?? ''} onChange={(e) => setMapping((m) => ({ ...m, [fl]: e.target.value === '' ? undefined : Number(e.target.value) }))} className={sel}>
                    <option value="" className="bg-[var(--wc-panel)]">{t.ignore}</option>
                    {table.headers.map((h, i) => <option key={i} value={i} className="bg-[var(--wc-panel)]">{h || `#${i + 1}`}</option>)}
                  </select>
                </Field>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Field label={t.offset} hint={t.offsetNote}>
                <input type="number" step="0.5" min={-12} max={14} value={opt.offsetHours} onChange={(e) => setOpt((o) => ({ ...o, offsetHours: Number(e.target.value) || 0 }))} className={inputCls} />
              </Field>
              <Field label={t.dateOrder}>
                <select value={opt.dateOrder} onChange={(e) => setOpt((o) => ({ ...o, dateOrder: e.target.value as ImportOptions['dateOrder'] }))} className={inputCls}>
                  <option value="ymd" className="bg-[var(--wc-panel)]">YYYY-MM-DD / YYYY.MM.DD</option>
                  <option value="dmy" className="bg-[var(--wc-panel)]">DD-MM-YYYY</option>
                  <option value="mdy" className="bg-[var(--wc-panel)]">MM/DD/YYYY</option>
                </select>
              </Field>
              <Field label={t.volume}>
                <select value={opt.volume} onChange={(e) => setOpt((o) => ({ ...o, volume: e.target.value as ImportOptions['volume'] }))} className={inputCls}>
                  <option value="lots" className="bg-[var(--wc-panel)]">{t.lotsOpt}</option>
                  <option value="units" className="bg-[var(--wc-panel)]">{t.unitsOpt}</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold">{t.preview}</h3>
              <span className="text-sm text-white/60">{t.summary(ready.length, dups, errs)}</span>
            </div>
            {missingRequired.length ? <p className="mt-2 text-sm text-amber-300">* {missingRequired.map((x) => t.fields[x]).join(', ')}</p> : null}
            <div className="mt-3 max-h-[28rem] overflow-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[760px] text-xs">
                <thead className="sticky top-0 bg-[var(--wc-panel)] text-left text-white/50">
                  <tr>
                    <th className="px-2 py-2">{t.include}</th><th className="px-2 py-2">#</th><th className="px-2 py-2">{c.cols.status}</th><th className="px-2 py-2">{c.cols.date}</th><th className="px-2 py-2">{c.cols.pair}</th><th className="px-2 py-2">{c.cols.dir}</th><th className="px-2 py-2 text-right">{c.cols.lots}</th><th className="px-2 py-2 text-right">{c.cols.entry}</th><th className="px-2 py-2 text-right">{c.cols.exit}</th><th className="px-2 py-2 text-right">{c.cols.pnl}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {candidates.slice(0, 1000).map((cd) => {
                    const tr = cd.trade
                    const status = cd.errors.length ? `${t.err}: ${cd.errors.map((e) => t.fields[e] ?? e).join(', ')}` : cd.duplicate ? t.dup : cd.kind === 'cash' ? t.cash : t.ok
                    return (
                      <tr key={cd.row} className={cd.errors.length ? 'text-[var(--wc-red-soft)]' : cd.duplicate ? 'text-amber-300' : ''}>
                        <td className="px-2 py-1.5"><input type="checkbox" disabled={!!cd.errors.length} checked={chosen(cd)} onChange={(e) => { const on = e.target.checked; setInclude((s) => { const n = new Set(s); if (on) n.add(cd.row); else n.delete(cd.row); return n }); setExclude((s) => { const n = new Set(s); if (!on) n.add(cd.row); else n.delete(cd.row); return n }) }} className="accent-[var(--wc-red)]" /></td>
                        <td className="px-2 py-1.5 text-white/40">{cd.row}</td>
                        <td className="px-2 py-1.5">{status}</td>
                        <td className="px-2 py-1.5">{fmtDateTime(cd.kind === 'cash' ? cd.cash?.time : tr?.openTime, state.settings.tz, locale)}</td>
                        <td className="px-2 py-1.5">{cd.kind === 'cash' ? (cd.cash?.type === 'deposit' ? c.accounts.deposit : c.accounts.withdrawal) : pairLabel(tr?.pair ?? '')}</td>
                        <td className="px-2 py-1.5">{tr ? (tr.direction === 'buy' ? c.buy : c.sell) : ''}</td>
                        <td className="px-2 py-1.5 text-right">{tr?.lots ? +tr.lots.toFixed(3) : ''}</td>
                        <td className="px-2 py-1.5 text-right">{tr?.entry || ''}</td>
                        <td className="px-2 py-1.5 text-right">{tr?.exits[0]?.price ?? ''}</td>
                        <td className="px-2 py-1.5 text-right">{cd.kind === 'cash' ? cd.cash?.amount.toFixed(2) : cd.needsRate ? '≈' : tr?.exits[0] ? tr.exits[0].pnl.toFixed(2) : ''}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <button type="button" disabled={!ready.length || busy || !!missingRequired.length} onClick={() => void run()} className="mt-4 rounded-full bg-[var(--wc-red)] px-6 py-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-40">{busy ? '…' : t.run(ready.length)}</button>
          </div>
        </>
      ) : null}
    </div>
  )
}
