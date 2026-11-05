import { useEffect, useMemo, useState } from 'react'
import type { ClipboardEvent, ReactNode } from 'react'
import type { JC } from './copy'
import { compressImage, deleteImage, getImage, putImage } from './db'
import { COMMON_PAIRS, LOT_UNITS, instrument, quotePnl, rate } from './fx'
import type { LotUnit } from './fx'
import { isoToWall, nowWall, wallToIso } from './time'
import { CONDITIONS, EMOTIONS, TIMEFRAMES, uid } from './types'
import type { Account, Condition, Emotion, ExitKind, JournalState, Plan, Shot, Trade } from './types'

type ExitDraft = { id: string; time: string; price: string; lots: string; kind: ExitKind; pnl: string; override: boolean; commission: string; swap: string; source: 'calc' | 'broker' }
type ShotDraft = Shot & { url?: string; blob?: Blob; isNew?: boolean }

const n = (s: string) => {
  const v = parseFloat(String(s).replace(',', '.'))
  return isFinite(v) ? v : NaN
}
const s2 = (v?: number) => (v === undefined || !isFinite(v) ? '' : String(+v.toPrecision(10)))

export const inputCls = 'w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[var(--wc-red)]'
export function Field({ label, children, hint, className = '' }: { label: string; children: ReactNode; hint?: string; className?: string }) {
  return (
    <label className={`grid gap-1 text-xs text-white/60 ${className}`}>
      {label}
      {children}
      {hint ? <span className="text-[11px] text-white/40">{hint}</span> : null}
    </label>
  )
}

export default function TradeForm({ c, state, accounts, trade, defaultAccount, locale, onSave, onDelete, onClose }: {
  c: JC; state: JournalState; accounts: Account[]; trade?: Trade; defaultAccount?: string; locale: string
  onSave: (t: Trade) => void; onDelete: (t: Trade) => void; onClose: () => void
}) {
  const tz = state.settings.tz
  const f = c.form
  const [accountId, setAccountId] = useState(trade?.accountId ?? defaultAccount ?? accounts[0]?.id ?? '')
  const acc = accounts.find((a) => a.id === accountId)
  const [pair, setPair] = useState(trade?.pair ?? 'EURUSD')
  const [direction, setDirection] = useState<'buy' | 'sell'>(trade?.direction ?? 'buy')
  const [timeframe, setTimeframe] = useState(trade?.timeframe ?? 'H1')
  const [openTime, setOpenTime] = useState(trade ? isoToWall(trade.openTime, tz) : nowWall(tz))
  const [entry, setEntry] = useState(s2(trade?.entry))
  const [sl, setSl] = useState(s2(trade?.sl))
  const [tps, setTps] = useState<string[]>(trade?.tps.length ? trade.tps.map((x) => s2(x)) : [''])
  const [unit, setUnit] = useState<LotUnit>('standard')
  const [lots, setLots] = useState(trade ? s2(trade.lots) : '')
  const [leverage, setLeverage] = useState(s2(trade?.leverage ?? acc?.leverage))
  const [riskPct, setRiskPct] = useState(s2(trade?.riskPct))
  const [setup, setSetup] = useState(trade?.setup ?? '')
  const [condition, setCondition] = useState<Condition | ''>(trade?.condition ?? '')
  const [plan, setPlan] = useState<Plan | ''>(trade?.plan ?? '')
  const [emotion, setEmotion] = useState<Emotion | ''>(trade?.emotion ?? '')
  const [revenge, setRevenge] = useState(!!trade?.revenge)
  const [notes, setNotes] = useState(trade?.notes ?? '')
  const [links, setLinks] = useState((trade?.links ?? []).join('\n'))
  const [slMoves, setSlMoves] = useState(trade?.slMoves.map((m) => ({ time: isoToWall(m.time, tz), price: s2(m.price) })) ?? [])
  const [exits, setExits] = useState<ExitDraft[]>(trade?.exits.map((e) => ({ id: e.id, time: isoToWall(e.time, tz), price: s2(e.price), lots: s2(e.lots), kind: e.kind, pnl: s2(e.pnl), override: e.pnlSource === 'broker', commission: s2(e.commission), swap: s2(e.swap), source: e.pnlSource })) ?? [])
  const [conv, setConv] = useState(s2(trade?.convEntry))
  const [convAuto, setConvAuto] = useState(!trade?.convEntry)
  const [contract, setContract] = useState(s2(trade?.contract))
  const [pipSize, setPipSize] = useState(s2(trade?.pipSize))
  const [mark, setMark] = useState(s2(trade?.mark))
  const [shots, setShots] = useState<ShotDraft[]>(trade?.shots ?? [])
  const [removedShots, setRemovedShots] = useState<string[]>([])
  const [err, setErr] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)
  const [adv, setAdv] = useState(false)

  const inst = useMemo(() => instrument(pair, n(contract) || undefined, n(pipSize) || undefined), [pair, contract, pipSize])
  const mult = LOT_UNITS[unit]
  const toStd = (s: string) => n(s) * mult
  const fromStd = (v: number) => s2(v / mult)

  // show sizes in the chosen unit
  useEffect(() => {
    if (trade) {
      setLots(fromStd(trade.lots))
      setExits((xs) => xs.map((x, i) => ({ ...x, lots: fromStd(trade.exits[i]?.lots ?? n(x.lots)) })))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit])

  // load existing screenshots
  useEffect(() => {
    let alive = true
    const urls: string[] = []
    ;(async () => {
      for (const s of trade?.shots ?? []) {
        const b = await getImage(s.id)
        if (b && alive) {
          const url = URL.createObjectURL(b)
          urls.push(url)
          setShots((xs) => xs.map((x) => (x.id === s.id ? { ...x, url } : x)))
        }
      }
    })()
    return () => {
      alive = false
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [trade])

  // conversion rate quote -> account currency at entry date
  useEffect(() => {
    if (!acc || !convAuto) return
    const iso = wallToIso(openTime, tz)
    if (!iso) return
    let alive = true
    rate(inst.quote, acc.currency, iso.slice(0, 10)).then((r) => alive && setConv(s2(r))).catch(() => undefined)
    return () => { alive = false }
  }, [inst.quote, acc, openTime, convAuto, tz])

  // calculated P/L for exits (unless overridden with the broker amount)
  const exitSig = exits.map((e) => [e.time, e.price, e.lots, e.override, e.commission, e.swap].join(',')).join('|') + `|${entry}|${direction}|${pair}|${accountId}|${unit}|${contract}`
  useEffect(() => {
    if (!acc) return
    let alive = true
    ;(async () => {
      const next = await Promise.all(exits.map(async (e) => {
        if (e.override) return e
        const p = n(e.price), l = toStd(e.lots), en = n(entry)
        const iso = wallToIso(e.time, tz)
        if (!(p > 0) || !(l > 0) || !(en > 0) || !iso) return { ...e, pnl: '' }
        try {
          const r = await rate(inst.quote, acc.currency, iso.slice(0, 10))
          const v = quotePnl(inst, direction, en, p, l) * r + (n(e.commission) || 0) + (n(e.swap) || 0)
          return { ...e, pnl: v.toFixed(2), source: 'calc' as const }
        } catch {
          return e
        }
      }))
      if (alive) setExits((xs) => (xs.length === next.length ? xs.map((x, i) => (x.override ? x : { ...x, pnl: next[i].pnl, source: next[i].source })) : xs))
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exitSig])

  const closedStd = exits.reduce((s, e) => s + (toStd(e.lots) || 0), 0)
  const openStd = (toStd(lots) || 0) - closedStd
  const convN = n(conv)
  const riskAmount = n(sl) > 0 && n(entry) > 0 && convN > 0 ? Math.abs(n(entry) - n(sl)) * toStd(lots) * inst.contract * convN : undefined
  const lastTp = n(tps.filter((x) => n(x) > 0).slice(-1)[0] ?? '')
  const rr = n(sl) > 0 && lastTp > 0 && n(entry) > 0 ? Math.abs(lastTp - n(entry)) / Math.abs(n(entry) - n(sl)) : undefined
  const pipValue = convN > 0 ? inst.pip * inst.contract * convN : undefined
  const money = (v?: number) => (v === undefined || !isFinite(v) || !acc ? '–' : new Intl.NumberFormat(locale, { style: 'currency', currency: acc.currency, maximumFractionDigits: 2 }).format(v))

  const addShots = async (files: FileList | File[] | null, kind: 'before' | 'after') => {
    if (!files) return
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const blob = await compressImage(file)
      setShots((xs) => [...xs, { id: uid(), kind, name: file.name, blob, url: URL.createObjectURL(blob), isNew: true }])
    }
  }
  const onPaste = (e: ClipboardEvent, kind: 'before' | 'after') => {
    const files = Array.from(e.clipboardData.files || [])
    if (files.length) {
      e.preventDefault()
      void addShots(files, kind)
    }
  }

  const save = async () => {
    const open = wallToIso(openTime, tz)
    const en = n(entry), lt = toStd(lots)
    if (!acc || pair.length < 6 || !(en > 0) || !(lt > 0) || !open) return setErr(f.required)
    if (closedStd > lt + 1e-9) return setErr(f.tooMuch)
    for (const s of shots) if (s.isNew && s.blob) await putImage(s.id, s.blob)
    for (const id of removedShots) await deleteImage(id).catch(() => undefined)
    const now = new Date().toISOString()
    const t: Trade = {
      id: trade?.id ?? uid(), accountId, pair: inst.pair, direction, entry: en, sl: n(sl) > 0 ? n(sl) : undefined, tps: tps.map(n).filter((x) => x > 0), lots: lt,
      leverage: n(leverage) > 0 ? n(leverage) : undefined, riskPct: n(riskPct) > 0 ? n(riskPct) : undefined, openTime: open, timeframe, setup: setup.trim() || undefined,
      condition: condition || undefined, plan: plan || undefined, emotion: emotion || undefined, revenge: revenge || undefined, notes: notes.trim() || undefined,
      links: links.split(/\s+/).filter((x) => /^https?:\/\//.test(x)).slice(0, 10),
      shots: shots.map(({ id, kind, name }) => ({ id, kind, name })),
      slMoves: slMoves.map((m) => ({ time: wallToIso(m.time, tz) || open, price: n(m.price) })).filter((m) => m.price > 0),
      exits: exits.map((e) => ({
        id: e.id, time: wallToIso(e.time, tz) || now, price: n(e.price), lots: toStd(e.lots), kind: e.kind, pnl: n(e.pnl) || 0,
        commission: n(e.commission) || undefined, swap: n(e.swap) || undefined, pnlSource: e.override ? 'broker' : e.source,
      })).filter((e) => e.price > 0 && e.lots > 0).sort((a, b) => a.time.localeCompare(b.time)),
      convEntry: convN > 0 ? convN : undefined, contract: n(contract) > 0 ? n(contract) : undefined, pipSize: n(pipSize) > 0 ? n(pipSize) : undefined, mark: n(mark) > 0 ? n(mark) : undefined,
      ticket: trade?.ticket, source: trade?.source ?? 'manual', createdAt: trade?.createdAt ?? now, updatedAt: now,
    }
    onSave(t)
  }

  const pill = (on: boolean) => `flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${on ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`
  const sel = (v: string, set: (v: string) => void, opts: [string, string][]) => (
    <select value={v} onChange={(e) => set(e.target.value)} className={inputCls}>
      {opts.map(([k, l]) => <option key={k} value={k} className="bg-[#111]">{l}</option>)}
    </select>
  )
  const ShotBox = ({ kind, label }: { kind: 'before' | 'after'; label: string }) => (
    <div onPaste={(e) => onPaste(e, kind)} tabIndex={0} className="rounded-xl border border-dashed border-white/15 p-3 outline-none focus:border-[var(--wc-red)]">
      <div className="flex items-center justify-between gap-2 text-xs text-white/60">
        <span>{label}</span>
        <label className="cursor-pointer rounded-full border border-white/15 px-2.5 py-1 text-white/80 hover:border-white/40">{f.addShot}<input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void addShots(e.target.files, kind); e.target.value = '' }} /></label>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {shots.filter((s) => s.kind === kind).map((s) => (
          <div key={s.id} className="relative">
            {s.url ? <a href={s.url} target="_blank" rel="noopener"><img src={s.url} alt="" className="h-24 w-full rounded-lg object-cover" /></a> : <div className="h-24 rounded-lg bg-white/5" />}
            <button type="button" onClick={() => { setShots((xs) => xs.filter((x) => x.id !== s.id)); if (!s.isNew) setRemovedShots((r) => [...r, s.id]) }} className="absolute right-1 top-1 rounded-full bg-black/70 px-2 text-xs">✕</button>
          </div>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-white/35">{f.paste}</p>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={trade ? f.editTitle : f.newTitle} className="max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#111113] p-5 sm:rounded-3xl sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{trade ? f.editTitle : f.newTitle}</h2>
          <button type="button" onClick={onClose} aria-label={f.cancel} className="rounded-full px-3 py-1 text-white/60 hover:text-white">✕</button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Field label={f.account}>{sel(accountId, setAccountId, accounts.map((a) => [a.id, `${a.name} (${a.currency}${a.type === 'demo' ? ', demo' : ''})`]))}</Field>
          <Field label={f.pair}>
            <input list="wc-pairs" value={pair} onChange={(e) => setPair(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6))} className={inputCls} />
            <datalist id="wc-pairs">{COMMON_PAIRS.map((p) => <option key={p} value={p} />)}</datalist>
          </Field>
          <Field label={f.direction}>
            <div className="flex rounded-full border border-white/15 p-1">
              <button type="button" className={pill(direction === 'buy')} onClick={() => setDirection('buy')}>{c.buy}</button>
              <button type="button" className={pill(direction === 'sell')} onClick={() => setDirection('sell')}>{c.sell}</button>
            </div>
          </Field>
          <Field label={f.openTime}><input type="datetime-local" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className={inputCls} /></Field>
          <Field label={f.timeframe}>{sel(timeframe, setTimeframe, TIMEFRAMES.map((x) => [x, x]))}</Field>
          <Field label={f.entry}><input inputMode="decimal" value={entry} onChange={(e) => setEntry(e.target.value)} className={inputCls} /></Field>
          <Field label={f.sl}><input inputMode="decimal" value={sl} onChange={(e) => setSl(e.target.value)} className={inputCls} /></Field>
          <Field label={f.tps} className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {tps.map((v, i) => (
                <input key={i} inputMode="decimal" value={v} placeholder={`TP${i + 1}`} onChange={(e) => setTps((xs) => xs.map((x, k) => (k === i ? e.target.value : x)))} className={`${inputCls} w-28`} />
              ))}
              <button type="button" onClick={() => setTps((xs) => [...xs, ''])} className="rounded-full border border-white/15 px-3 text-sm text-white/70 hover:text-white">{f.addTp}</button>
            </div>
          </Field>
          <Field label={f.lots} hint={toStd(lots) > 0 ? `= ${(toStd(lots) * inst.contract).toLocaleString(locale)} ${f.units}` : undefined}>
            <div className="flex gap-2">
              <input inputMode="decimal" value={lots} onChange={(e) => setLots(e.target.value)} className={inputCls} />
              <select value={unit} onChange={(e) => setUnit(e.target.value as LotUnit)} className={`${inputCls} w-auto`}>
                {(Object.keys(LOT_UNITS) as LotUnit[]).map((u) => <option key={u} value={u} className="bg-[#111]">{f.lotUnit[u]}</option>)}
              </select>
            </div>
          </Field>
          <Field label={f.leverage}><input inputMode="numeric" value={leverage} onChange={(e) => setLeverage(e.target.value)} className={inputCls} /></Field>
          <Field label={f.riskPct} hint={riskAmount !== undefined && acc ? `${f.riskAuto}: ${money(riskAmount)}` : undefined}><input inputMode="decimal" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} className={inputCls} /></Field>
        </div>
        <p className="mt-2 text-xs text-white/50">
          {rr !== undefined ? `${f.rr}: 1:${rr.toFixed(2)} · ` : ''}{pipValue !== undefined && acc ? f.pipValue(money(pipValue)) : ''}
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{f.exits}</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => setExits((xs) => [...xs, { id: uid(), time: nowWall(tz), price: '', lots: fromStd(Math.max(0, openStd)), kind: 'partial', pnl: '', override: false, commission: '', swap: '', source: 'calc' }])} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 hover:border-white/40">{f.addExit}</button>
              {openStd > 1e-9 && exits.length ? <button type="button" onClick={() => setExits((xs) => [...xs, { id: uid(), time: nowWall(tz), price: '', lots: fromStd(openStd), kind: 'manual', pnl: '', override: false, commission: '', swap: '', source: 'calc' }])} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 hover:border-white/40">{f.closeRest}</button> : null}
            </div>
          </div>
          {exits.map((e, i) => {
            const set = (patch: Partial<ExitDraft>) => setExits((xs) => xs.map((x, k) => (k === i ? { ...x, ...patch } : x)))
            return (
              <div key={e.id} className="mt-3 grid grid-cols-2 gap-2 border-t border-white/5 pt-3 sm:grid-cols-6">
                <Field label={f.exitTime} className="col-span-2"><input type="datetime-local" value={e.time} onChange={(ev) => set({ time: ev.target.value })} className={inputCls} /></Field>
                <Field label={f.exitPrice}><input inputMode="decimal" value={e.price} onChange={(ev) => set({ price: ev.target.value })} className={inputCls} /></Field>
                <Field label={`${f.exitLots} (${f.lotUnit[unit].split(' ')[0].toLowerCase()})`}><input inputMode="decimal" value={e.lots} onChange={(ev) => set({ lots: ev.target.value })} className={inputCls} /></Field>
                <Field label={c.cols.result} className="col-span-2">{sel(e.kind, (v) => set({ kind: v as ExitKind }), (['tp', 'partial', 'sl', 'be', 'manual'] as ExitKind[]).map((k) => [k, f.kind[k]]))}</Field>
                <Field label={f.commission}><input inputMode="decimal" value={e.commission} onChange={(ev) => set({ commission: ev.target.value })} className={inputCls} /></Field>
                <Field label={f.swap}><input inputMode="decimal" value={e.swap} onChange={(ev) => set({ swap: ev.target.value })} className={inputCls} /></Field>
                <Field label={`${f.exitPnl} · ${e.override ? f.brokerPnl : f.calcPnl}`} className="col-span-2"><input inputMode="decimal" value={e.pnl} onChange={(ev) => set({ pnl: ev.target.value, override: true })} className={`${inputCls} ${n(e.pnl) > 0 ? 'text-emerald-400' : n(e.pnl) < 0 ? 'text-[var(--wc-red-soft)]' : ''}`} /></Field>
                <div className="col-span-2 flex items-end gap-2 sm:col-span-2">
                  {e.override ? <button type="button" onClick={() => set({ override: false })} className="text-xs text-white/50 hover:text-white">↺ {f.calcPnl}</button> : null}
                  <button type="button" onClick={() => setExits((xs) => xs.filter((_, k) => k !== i))} className="ml-auto text-xs text-white/50 hover:text-[var(--wc-red-soft)]">✕</button>
                </div>
              </div>
            )
          })}
          <p className="mt-2 text-[11px] text-white/40">{f.pnlHint}</p>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{f.slMoves}</h3>
            <button type="button" onClick={() => setSlMoves((xs) => [...xs, { time: nowWall(tz), price: '' }])} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 hover:border-white/40">{f.addSlMove}</button>
          </div>
          {slMoves.map((m, i) => (
            <div key={i} className="mt-2 flex gap-2">
              <input type="datetime-local" value={m.time} onChange={(e) => setSlMoves((xs) => xs.map((x, k) => (k === i ? { ...x, time: e.target.value } : x)))} className={inputCls} />
              <input inputMode="decimal" value={m.price} placeholder="SL" onChange={(e) => setSlMoves((xs) => xs.map((x, k) => (k === i ? { ...x, price: e.target.value } : x)))} className={`${inputCls} w-32`} />
              <button type="button" onClick={() => setSlMoves((xs) => xs.filter((_, k) => k !== i))} className="px-2 text-white/50 hover:text-[var(--wc-red-soft)]">✕</button>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Field label={f.setup}><input value={setup} onChange={(e) => setSetup(e.target.value)} maxLength={60} className={inputCls} /></Field>
          <Field label={f.condition}>{sel(condition, (v) => setCondition(v as Condition | ''), [['', '–'], ...CONDITIONS.map((k) => [k, c.conditions[k]] as [string, string])])}</Field>
          <Field label={f.plan}>{sel(plan, (v) => setPlan(v as Plan | ''), [['', '–'], ['strategy', c.plans.strategy], ['impulse', c.plans.impulse]])}</Field>
          <Field label={f.emotion}>{sel(emotion, (v) => setEmotion(v as Emotion | ''), [['', '–'], ...EMOTIONS.map((k) => [k, c.emotions[k]] as [string, string])])}</Field>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-white/80"><input type="checkbox" checked={revenge} onChange={(e) => setRevenge(e.target.checked)} className="size-4 accent-[var(--wc-red)]" />{f.revenge}</label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label={f.notes}><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} maxLength={4000} className={inputCls} /></Field>
          <Field label={f.links}><textarea value={links} onChange={(e) => setLinks(e.target.value)} rows={4} placeholder="https://www.tradingview.com/x/…" className={inputCls} /></Field>
          <ShotBox kind="before" label={f.shotsBefore} />
          <ShotBox kind="after" label={f.shotsAfter} />
        </div>

        <button type="button" onClick={() => setAdv((v) => !v)} className="mt-4 text-sm text-white/60 hover:text-white">{adv ? '▾' : '▸'} {f.advanced}</button>
        {adv ? (
          <div className="mt-2 grid gap-3 sm:grid-cols-4">
            <Field label={f.conv} hint={f.convHint} className="sm:col-span-2"><input inputMode="decimal" value={conv} onChange={(e) => { setConv(e.target.value); setConvAuto(false) }} className={inputCls} /></Field>
            <Field label={f.contract}><input inputMode="decimal" value={contract} placeholder={String(inst.contract)} onChange={(e) => setContract(e.target.value)} className={inputCls} /></Field>
            <Field label={f.pip}><input inputMode="decimal" value={pipSize} placeholder={String(inst.pip)} onChange={(e) => setPipSize(e.target.value)} className={inputCls} /></Field>
            <Field label={f.mark} className="sm:col-span-2"><input inputMode="decimal" value={mark} onChange={(e) => setMark(e.target.value)} className={inputCls} /></Field>
          </div>
        ) : null}

        {err ? <p className="mt-3 text-sm text-[var(--wc-red-soft)]">{err}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => void save()} className="flex-1 rounded-full bg-[var(--wc-red)] px-5 py-3 font-semibold text-white transition hover:brightness-110">{f.save}</button>
          <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-5 py-3 font-semibold text-white/80 hover:border-white/40">{f.cancel}</button>
          {trade ? (confirmDel
            ? <button type="button" onClick={() => onDelete(trade)} className="rounded-full bg-[var(--wc-red)]/20 px-5 py-3 font-semibold text-[var(--wc-red-soft)]">{f.delConfirm}</button>
            : <button type="button" onClick={() => setConfirmDel(true)} className="rounded-full px-5 py-3 text-sm text-white/50 hover:text-[var(--wc-red-soft)]">{f.del}</button>) : null}
        </div>
      </div>
    </div>
  )
}
