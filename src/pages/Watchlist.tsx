// The one watchlist page (My Winvest · Watchlist). Same store as the stars on Markets and coin pages,
// the dashboard and, before, the portfolio tab: src/shared/watchlist.ts. Prices come from the same
// quote function as the portfolio tracker, in the currency of the active portfolio.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import MyWinvestTabs from '../components/MyWinvestTabs'
import { Card, PageHeader, btn, pageWrap } from '../components/kit'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import { quotes } from '../portfolio/data'
import type { Quote } from '../portfolio/data'
import { load, loadIndex } from '../portfolio/store'
import type { Asset, Currency } from '../portfolio/store'
import { AssetBadge, AssetSearch } from '../shared/AssetPicker'
import { exportAll, importAll } from '../shared/backup'
import { useWatchlists } from '../shared/watchlist'
import DataStamp from '../markets/DataStamp'

export const watchlistCopy = {
  en: {
    metaTitle: 'Free watchlist for crypto and stocks | Winvest Capital',
    description: 'Follow crypto and stocks in one watchlist with live prices and daily change. Stored only on your device, no account needed.',
    h1: 'Watchlist',
    intro: 'Everything you follow, in one place. Star a coin on Markets or a coin page and it shows up here. Saved on this device only.',
    newList: 'New list',
    rename: 'Rename',
    delList: 'Delete list',
    name: 'List name',
    add: 'Add crypto or stock',
    cancel: 'Cancel',
    empty: 'This list is empty. Add a coin or stock, or tap the star on Markets.',
    toPortfolio: 'Add to portfolio',
    remove: (n: string) => `Remove ${n}`,
    backupH: 'Back up everything',
    backupP: 'One file with your portfolios, watchlist, alerts, journal (with screenshots) and settings. Keep it safe; use it to move to another device. Nothing is sent to us.',
    exportBtn: 'Download backup',
    importBtn: 'Restore backup',
    importOk: (k: number, t: number) => `Backup restored: ${k} items and ${t} journal trades. Reloading…`,
    importBad: 'This file is not a Winvest backup.',
    confirm: 'Restoring replaces the same data on this device with what is in the file. Continue?',
    made: (kb: number) => `Backup downloaded (${kb} KB).`,
  },
  nl: {
    metaTitle: 'Gratis watchlist voor crypto en aandelen | Winvest Capital',
    description: 'Volg crypto en aandelen in één watchlist met actuele koersen en dagverandering. Alleen opgeslagen op je eigen apparaat, geen account nodig.',
    h1: 'Watchlist',
    intro: 'Alles wat je volgt, op één plek. Geef een munt een ster op Markten of een coinpagina en hij staat hier. Alleen opgeslagen op dit apparaat.',
    newList: 'Nieuwe lijst',
    rename: 'Hernoemen',
    delList: 'Lijst verwijderen',
    name: 'Naam van de lijst',
    add: 'Crypto of aandeel toevoegen',
    cancel: 'Annuleren',
    empty: 'Deze lijst is leeg. Voeg een munt of aandeel toe, of tik op de ster bij Markten.',
    toPortfolio: 'Naar portfolio',
    remove: (n: string) => `${n} verwijderen`,
    backupH: 'Alles back-uppen',
    backupP: 'Eén bestand met je portfolio’s, watchlist, alerts, journal (met screenshots) en instellingen. Bewaar het goed; gebruik het om naar een ander apparaat te verhuizen. Er wordt niets naar ons gestuurd.',
    exportBtn: 'Back-up downloaden',
    importBtn: 'Back-up terugzetten',
    importOk: (k: number, t: number) => `Back-up teruggezet: ${k} onderdelen en ${t} journal-trades. Pagina wordt herladen…`,
    importBad: 'Dit bestand is geen Winvest-back-up.',
    confirm: 'Terugzetten vervangt dezelfde gegevens op dit apparaat door wat in het bestand staat. Doorgaan?',
    made: (kb: number) => `Back-up gedownload (${kb} KB).`,
  },
}

const money = (v: number, cur: Currency, lang: Lang) =>
  new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'en-US', { style: 'currency', currency: cur, maximumFractionDigits: v >= 1 ? 2 : 6 }).format(v)
const pct = (v?: number) => (v === undefined || v === null ? '–' : (v >= 0 ? '+' : '') + v.toFixed(2) + '%')
const tone = (v?: number) => (v === undefined || v === null ? 'text-white/40' : v >= 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]')

export function addHref(lang: Lang, a: { kind: string; id: string }) {
  return `${paths[lang].portfolio}?add=${encodeURIComponent(a.kind === 'stock' ? `stock:${a.id}` : a.id)}`
}

export default function Watchlist({ lang }: { lang: Lang }) {
  const c = watchlistCopy[lang]
  const W = useWatchlists()
  const lists = W.lists ?? []
  const [wl, setWl] = useState(0)
  const [adding, setAdding] = useState(false)
  const [base, setBase] = useState<Currency>('EUR')
  const [q, setQ] = useState<Record<string, Quote>>({})
  const [at, setAt] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const list = lists[Math.min(wl, Math.max(0, lists.length - 1))]

  useEffect(() => {
    try {
      setBase(load(loadIndex().active).base)
    } catch { /* default EUR */ }
  }, [])

  // every asset on any list, priced once a minute while the tab is visible
  const assets = useMemo(() => {
    const m = new Map<string, Asset>()
    for (const l of lists) for (const i of l.items) m.set(i.key, { key: i.key, kind: i.kind, symbol: i.symbol, name: i.name, id: i.id, image: i.image, currency: i.currency })
    return [...m.values()]
  }, [lists])
  const sig = assets.map((a) => a.key).join('|') + base
  useEffect(() => {
    if (!assets.length) return
    let alive = true
    const run = () =>
      void quotes(assets, base).then((r) => {
        if (!alive) return
        setQ(r)
        setAt(Date.now())
      })
    run()
    const t = setInterval(() => !document.hidden && run(), 60_000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [sig]) // eslint-disable-line react-hooks/exhaustive-deps

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f || !window.confirm(c.confirm)) return
    const r = await importAll(f)
    if (!r.ok) return setMsg(c.importBad)
    setMsg(c.importOk(r.keys, r.trades))
    setTimeout(() => location.reload(), 1200)
  }

  return (
    <main className="relative overflow-hidden">
      <div className={pageWrap()}>
        <MyWinvestTabs lang={lang} on="watchlist" />
        <PageHeader home={paths[lang].home} title={c.h1} intro={c.intro} />

        {W.lists ? (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {lists.map((w, i) => (
                <button key={w.id} type="button" aria-pressed={i === wl} onClick={() => setWl(i)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${i === wl ? 'border-white bg-white text-black' : 'border-white/15 text-white/70 hover:text-white'}`}>
                  {w.name} <span className="text-xs opacity-60">{w.items.length}</span>
                </button>
              ))}
              <button type="button" onClick={() => { W.set((ls) => [...ls, { id: Math.random().toString(36).slice(2, 10), name: `${c.newList} ${ls.length + 1}`, items: [] }]); setWl(lists.length) }} className="rounded-full border border-dashed border-white/25 px-4 py-1.5 text-sm text-white/70 hover:text-white">+ {c.newList}</button>
            </div>
            {list ? (
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <button type="button" className="text-white/60 hover:text-white" onClick={() => { const v = window.prompt(c.name, list.name); if (v && v.trim()) W.set((ls) => ls.map((x, i) => (i === wl ? { ...x, name: v.trim().slice(0, 40) } : x))) }}>{c.rename}</button>
                {lists.length > 1 ? <button type="button" className="text-white/60 hover:text-[var(--wc-red-soft)]" onClick={() => { W.set((ls) => ls.filter((_, i) => i !== wl)); setWl(0) }}>{c.delList}</button> : null}
              </div>
            ) : null}

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <ul className="divide-y divide-white/5">
                {list?.items.map((it) => {
                  const qt = q[it.key]
                  return (
                    <li key={it.key} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
                      <span className="min-w-0 flex-1"><AssetBadge lang={lang} a={{ ...it, image: it.image ?? qt?.image }} /></span>
                      <span className="text-right">
                        <span className="block font-semibold tabular-nums">{qt ? money(qt.price, base, lang) : '–'}</span>
                        <span className={`block text-xs tabular-nums ${tone(qt?.change24h)}`}>{pct(qt?.change24h)} · 24{lang === 'nl' ? 'u' : 'h'}{qt?.stale ? ' · ⏱' : ''}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <a href={addHref(lang, it)} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/70 hover:border-[var(--wc-red)] hover:text-white">{c.toPortfolio}</a>
                        <button type="button" aria-label={c.remove(it.name)} title={c.remove(it.name)} onClick={() => W.set((ls) => ls.map((x, i) => (i === wl ? { ...x, items: x.items.filter((y) => y.key !== it.key) } : x)))} className="rounded-full px-2 py-1 text-white/40 hover:text-[var(--wc-red-soft)]">✕</button>
                      </span>
                    </li>
                  )
                })}
                {list && !list.items.length ? <li className="px-4 py-8 text-center text-white/50">{c.empty}</li> : null}
              </ul>
            </div>
            <DataStamp className="mt-2" lang={lang} source={lang === 'nl' ? 'CoinGecko (crypto), Yahoo Finance via onze proxy (aandelen, vertraagd)' : 'CoinGecko (crypto), Yahoo Finance via our proxy (stocks, delayed)'} kind="live" at={at} />

            <div className="mt-4">
              {adding ? (
                <Card>
                  <AssetSearch lang={lang} autoFocus onPick={(a) => { W.set((ls) => ls.map((x, i) => (i === wl && !x.items.some((y) => y.key === a.key) ? { ...x, items: [...x.items, { key: a.key, kind: a.kind, symbol: a.symbol, name: a.name, id: a.id, image: a.image, currency: a.currency }] } : x))); setAdding(false) }} />
                  <button type="button" onClick={() => setAdding(false)} className="mt-3 text-sm text-white/60 hover:text-white">{c.cancel}</button>
                </Card>
              ) : (
                <button type="button" onClick={() => setAdding(true)} className={btn('secondary', 'sm')}>+ {c.add}</button>
              )}
            </div>
          </>
        ) : null}

        <div id="backup" className="scroll-mt-24" />
        <Card className="mt-10" title={c.backupH} desc={c.backupP}>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => void exportAll().then((r) => setMsg(c.made(Math.max(1, Math.round(r.bytes / 1024)))))} className={btn('primary', 'sm')}>{c.exportBtn}</button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void onImport(e)} />
            <button type="button" onClick={() => fileRef.current?.click()} className={btn('secondary', 'sm')}>{c.importBtn}</button>
          </div>
          {msg ? <p className="mt-2 text-sm text-white/70" role="status">{msg}</p> : null}
        </Card>
      </div>
    </main>
  )
}
