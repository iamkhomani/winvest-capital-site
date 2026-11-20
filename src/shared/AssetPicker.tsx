// Asset badge (logo, symbol, name; crypto links to its coin page) and the crypto/stock search,
// shared by the portfolio tracker and the watchlist page.
import { useEffect, useState } from 'react'
import type { Lang } from '../i18n'
import { coinHref } from '../markets/coins'
import { searchCrypto, searchStock } from '../portfolio/data'
import type { Found } from '../portfolio/data'
import type { Asset } from '../portfolio/store'

const copy = {
  en: { stocks: 'Stocks', search: 'Search a coin or stock (e.g. BTC, Apple, ASML)', searching: 'Searching…', none: 'Nothing found.' },
  nl: { stocks: 'Aandelen', search: 'Zoek een coin of aandeel (bijv. BTC, Apple, ASML)', searching: 'Zoeken…', none: 'Niets gevonden.' },
}

export function AssetBadge({ a, lang }: { a?: Pick<Asset, 'kind' | 'id' | 'symbol' | 'name' | 'image'>; lang?: Lang }) {
  if (!a) return <span>?</span>
  // crypto names link to their coin page (stocks get pages later)
  const href = lang && a.kind === 'crypto' ? coinHref(lang, a.id) : undefined
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {a.image ? <img src={a.image} alt="" width={22} height={22} className="size-[22px] shrink-0 rounded-full bg-white/10" /> : <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">{a.symbol.slice(0, 3)}</span>}
      <span className="min-w-0">
        {href ? <a href={href} className="block truncate font-semibold hover:text-[var(--wc-red-soft)] hover:underline">{a.symbol}</a> : <span className="block truncate font-semibold">{a.symbol}</span>}
        <span className="block truncate text-xs text-white/45">{a.name}</span>
      </span>
    </span>
  )
}

export function AssetSearch({ lang, onPick, autoFocus }: { lang: Lang; onPick: (a: Found) => void; autoFocus?: boolean }) {
  const c = copy[lang]
  const [kind, setKind] = useState<'crypto' | 'stock'>('crypto')
  const [q, setQ] = useState('')
  const [res, setRes] = useState<Found[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  useEffect(() => {
    const s = q.trim()
    if (s.length < 1) {
      setRes(null)
      return
    }
    setBusy(true)
    const t = setTimeout(async () => {
      try {
        setRes(kind === 'crypto' ? await searchCrypto(s) : await searchStock(s))
        setErr(false)
      } catch {
        setErr(true)
        setRes([])
      } finally {
        setBusy(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [q, kind])
  const pill = (on: boolean) => `rounded-full px-4 py-1.5 text-sm font-semibold transition ${on ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`
  return (
    <div>
      <div className="inline-flex rounded-full border border-white/15 p-1">
        <button type="button" className={pill(kind === 'crypto')} onClick={() => setKind('crypto')}>Crypto</button>
        <button type="button" className={pill(kind === 'stock')} onClick={() => setKind('stock')}>{c.stocks}</button>
      </div>
      <input autoFocus={autoFocus} value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.search} className="mt-3 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 outline-none placeholder:text-white/35 focus:border-[var(--wc-red)]" />
      <div className="mt-2 max-h-64 overflow-y-auto">
        {busy ? <p className="px-1 py-2 text-sm text-white/50">{c.searching}</p> : null}
        {!busy && res && !res.length ? <p className="px-1 py-2 text-sm text-white/50">{err ? '⚠ ' : ''}{c.none}</p> : null}
        {!busy && res?.map((r) => (
          <button key={r.key} type="button" onClick={() => onPick(r)} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/[0.06]">
            <AssetBadge a={r} />
            <span className="shrink-0 text-xs text-white/45">{r.kind === 'crypto' ? (r.rank ? `#${r.rank}` : '') : `${r.type ?? ''} · ${r.exchange ?? ''}`}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
