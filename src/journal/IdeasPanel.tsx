// Trade ideas and saved analyses on the journal page (saved from coin pages via "Plan trade").
// An idea with levels becomes a prefilled journal trade in one click; a note stays a saved analysis.
import { useState } from 'react'
import type { Lang } from '../i18n'
import { coinHref } from '../markets/coins'
import { isTradeIdea, useIdeas } from '../shared/ideas'
import type { Idea } from '../shared/ideas'
import { unitsPair } from './fx'
import { ACCOUNT_CURRENCIES, uid } from './types'
import type { Account, AccountCurrency, Trade } from './types'

const copy = {
  en: {
    h: 'Trade ideas and notes',
    p: 'Saved from a coin page with “Plan trade”. Record an idea when you actually take the trade.',
    record: 'Record in journal',
    drop: 'Drop',
    del: 'Delete',
    taken: 'recorded',
    dropped: 'dropped',
    showDone: (n: number) => `Show ${n} recorded or dropped`,
    hideDone: 'Hide recorded and dropped',
    needAccount: 'One step first: which account is this trade for?',
    accName: 'Account name',
    accDefault: 'My account',
    accType: 'Type',
    live: 'Live',
    demo: 'Demo',
    accCur: 'Currency',
    accStart: 'Starting balance',
    accGo: 'Create account and record',
    accBad: 'Enter a starting balance above 0.',
    long: 'Long',
    short: 'Short',
    qty: (q: string) => `size ${q}`,
    note: 'Note',
  },
  nl: {
    h: 'Trade-ideeën en notities',
    p: 'Bewaard vanaf een coinpagina met “Trade plannen”. Leg een idee vast als je de trade echt neemt.',
    record: 'Vastleggen in journal',
    drop: 'Laten vallen',
    del: 'Verwijderen',
    taken: 'vastgelegd',
    dropped: 'laten vallen',
    showDone: (n: number) => `Toon ${n} vastgelegd of laten vallen`,
    hideDone: 'Verberg vastgelegd en laten vallen',
    needAccount: 'Eén stap eerst: voor welk account is deze trade?',
    accName: 'Naam van het account',
    accDefault: 'Mijn account',
    accType: 'Type',
    live: 'Live',
    demo: 'Demo',
    accCur: 'Valuta',
    accStart: 'Startsaldo',
    accGo: 'Account aanmaken en vastleggen',
    accBad: 'Vul een startsaldo boven 0 in.',
    long: 'Long',
    short: 'Short',
    qty: (q: string) => `grootte ${q}`,
    note: 'Notitie',
  },
}

export const ideaDraft = (i: Idea): Partial<Trade> => ({
  pair: unitsPair(i.kind, i.symbol, i.quote),
  direction: i.direction,
  entry: i.entry,
  sl: i.sl,
  tps: i.tp ? [i.tp] : [],
  lots: i.qty ? +i.qty.toPrecision(6) : undefined,
  notes: i.note,
})

export default function IdeasPanel({ lang, canRecord, onRecord, onCreateAccount }: { lang: Lang; canRecord: boolean; onRecord: (i: Idea) => void; onCreateAccount: (a: Account) => void }) {
  const c = copy[lang]
  const { ideas, set } = useIdeas()
  const [showDone, setShowDone] = useState(false)
  const [pending, setPending] = useState<Idea | null>(null) // idea waiting for a first journal account
  const [acc, setAcc] = useState({ name: '', type: 'live' as Account['type'], currency: 'USD' as AccountCurrency, start: '' })
  const [accErr, setAccErr] = useState(false)
  const createAndRecord = () => {
    const start = parseFloat(acc.start.replace(',', '.'))
    if (!(start > 0) || !pending) return setAccErr(true)
    onCreateAccount({ id: uid(), name: acc.name.trim().slice(0, 40) || c.accDefault, type: acc.type, currency: acc.currency, startBalance: start, startDate: new Date().toISOString().slice(0, 10) })
    onRecord(pending)
    setPending(null)
  }
  if (!ideas || !ideas.length) return null
  const open = ideas.filter((i) => i.status === 'open')
  const done = ideas.filter((i) => i.status !== 'open')
  const list = showDone ? ideas : open
  const fmt = (v?: number) => (v === undefined ? '–' : String(+v.toPrecision(8)))
  return (
    <section id="ideas" className="mt-6 scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <h2 className="text-lg font-bold">{c.h}</h2>
      <p className="mt-1 text-sm text-white/55">{c.p}</p>
      {pending ? (
        <div className="mt-3 rounded-xl border border-amber-300/30 bg-amber-300/[0.04] p-3 text-sm">
          <p className="font-semibold text-amber-200">{c.needAccount}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-4">
            <label className="grid gap-1 text-xs text-white/60">{c.accName}<input value={acc.name} placeholder={c.accDefault} onChange={(e) => setAcc({ ...acc, name: e.target.value })} className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-sm text-white outline-none focus:border-[var(--wc-red)]" /></label>
            <label className="grid gap-1 text-xs text-white/60">{c.accType}<select value={acc.type} onChange={(e) => setAcc({ ...acc, type: e.target.value as Account['type'] })} className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-sm text-white outline-none"><option value="live" className="bg-[var(--wc-panel)]">{c.live}</option><option value="demo" className="bg-[var(--wc-panel)]">{c.demo}</option></select></label>
            <label className="grid gap-1 text-xs text-white/60">{c.accCur}<select value={acc.currency} onChange={(e) => setAcc({ ...acc, currency: e.target.value as AccountCurrency })} className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-sm text-white outline-none">{ACCOUNT_CURRENCIES.map((x) => <option key={x} value={x} className="bg-[var(--wc-panel)]">{x}</option>)}</select></label>
            <label className="grid gap-1 text-xs text-white/60">{c.accStart}<input inputMode="decimal" value={acc.start} onChange={(e) => { setAcc({ ...acc, start: e.target.value }); setAccErr(false) }} className="rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-sm text-white outline-none focus:border-[var(--wc-red)]" /></label>
          </div>
          <button type="button" onClick={createAndRecord} className="mt-2 rounded-full bg-[var(--wc-red)] px-4 py-1.5 text-sm font-semibold text-white hover:brightness-110">{c.accGo}</button>
          {accErr ? <p className="mt-1 text-xs text-[var(--wc-red-soft)]">{c.accBad}</p> : null}
        </div>
      ) : null}
      <ul className="mt-3 divide-y divide-white/5">
        {list.map((i) => (
          <li key={i.id} className={`flex flex-wrap items-start gap-x-3 gap-y-1 py-3 ${i.status !== 'open' ? 'opacity-60' : ''}`}>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                {i.kind === 'crypto' && i.assetId ? <a href={coinHref(lang, i.assetId)} className="font-semibold hover:underline">{i.symbol}</a> : <span className="font-semibold">{i.symbol}</span>}{' '}
                {isTradeIdea(i) ? (
                  <span className="text-white/70">
                    <span className={i.direction === 'buy' ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]'}>{i.direction === 'buy' ? c.long : c.short}</span> · entry {fmt(i.entry)} · SL {fmt(i.sl)}{i.tp ? ` · TP ${fmt(i.tp)}` : ''} {i.quote}{i.qty ? ` · ${c.qty(`${+i.qty.toPrecision(4)} ${i.symbol}`)}` : ''}
                  </span>
                ) : (
                  <span className="text-white/50">· {c.note}</span>
                )}
              </p>
              {i.note ? <p className="mt-0.5 whitespace-pre-line text-sm text-white/60">{i.note}</p> : null}
              <p className="mt-0.5 text-xs text-white/35">{new Date(i.created).toLocaleString(lang === 'nl' ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}{i.status !== 'open' ? ` · ${i.status === 'taken' ? c.taken : c.dropped}` : ''}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 text-xs">
              {i.status === 'open' && isTradeIdea(i) ? <button type="button" onClick={() => (canRecord ? onRecord(i) : setPending(i))} className="rounded-full bg-[var(--wc-red)] px-3 py-1.5 font-semibold text-white hover:brightness-110">{c.record}</button> : null}
              {i.status === 'open' && isTradeIdea(i) ? <button type="button" onClick={() => set((l) => l.map((x) => (x.id === i.id ? { ...x, status: 'dropped' } : x)))} className="rounded-full border border-white/15 px-3 py-1.5 text-white/70 hover:text-white">{c.drop}</button> : null}
              <button type="button" onClick={() => set((l) => l.filter((x) => x.id !== i.id))} className="px-1 py-1.5 text-white/45 hover:text-[var(--wc-red-soft)]">{c.del}</button>
            </div>
          </li>
        ))}
      </ul>
      {done.length ? <button type="button" onClick={() => setShowDone((v) => !v)} className="mt-1 text-xs text-white/50 hover:text-white">{showDone ? c.hideDone : c.showDone(done.length)}</button> : null}
    </section>
  )
}
