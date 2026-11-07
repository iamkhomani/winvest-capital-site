import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { DISCORD_URL } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import { diversification, drawdown, holdings, periods, series, volatility } from '../portfolio/calc'
import type { Holding, Point } from '../portfolio/calc'
import { history as fetchHistory, quotes, searchCrypto, searchStock } from '../portfolio/data'
import type { Found, History, Quote } from '../portfolio/data'
import { exportCsv, exportJson, load, save, uid, validate } from '../portfolio/store'
import type { Asset, Currency, PortfolioData, Tx } from '../portfolio/store'

export const portfolioCopy = {
  en: {
    metaTitle: 'Free portfolio tracker for crypto and stocks | Winvest Capital',
    description: 'Track crypto and stocks in one overview with live prices: profit and loss, allocation, performance per week, month, quarter and year, drawdown and watchlists. Stored only on your own device.',
    h1: 'Portfolio tracker',
    intro: 'Crypto and stocks in one overview, with live prices. Your data is stored only in this browser on this device, not on our servers. Use export to make a backup or move it to another device.',
    tabs: { overview: 'Overview', positions: 'Positions', txs: 'Transactions', watch: 'Watchlists', settings: 'Backup & settings' },
    add: '+ Add transaction',
    total: 'Total value', pnl: 'Total profit / loss', unreal: 'Unrealised', real: 'Realised', today: 'Today', invested: 'Invested (cost basis)',
    perf: 'Performance', week: 'Week', month: 'Month', quarter: 'Quarter', year: 'Year', sinceStart: 'since start',
    valueChart: 'Portfolio value, last 12 months',
    alloc: 'Allocation', byClass: 'By asset class', crypto: 'Crypto', stocks: 'Stocks',
    risk: 'Risk exposure', maxDd: 'Max drawdown (1y)', curDd: 'Current drawdown', vol: 'Volatility (annualised, 90d)', largest: 'Largest position', top3: 'Top 3 positions', effective: 'Effective number of positions', stable: 'Stablecoins',
    divLow: 'Concentrated', divMid: 'Moderately diversified', divHigh: 'Well diversified',
    cols: { asset: 'Asset', qty: 'Quantity', avg: 'Avg. cost', price: 'Price', value: 'Value', pnl: 'P/L', weight: 'Weight', d24: '24h' },
    emptyH: 'Start your portfolio',
    emptyP: 'Add your first buy transaction. Search for any coin or stock, enter how much you bought and at what price.',
    loadingPrices: 'Loading live prices…',
    noPrice: 'no live price',
    setPrice: 'Set price',
    histNote: 'Performance uses daily closing prices of the last 12 months. Positions bought earlier are valued from 12 months ago.',
    txH: 'Transactions', del: 'Delete', type: 'Type', buy: 'Buy', sell: 'Sell', date: 'Date', fee: 'Fee', note: 'Note',
    form: { title: 'Add transaction', kind: 'Market', search: 'Search a coin or stock (e.g. BTC, Apple, ASML)', searching: 'Searching…', none: 'Nothing found.', chosen: 'Selected', change: 'Change', qty: 'Quantity', price: 'Price per unit', fee: 'Fees (optional)', note: 'Note (optional)', save: 'Save transaction', cancel: 'Cancel', priceHint: 'Prefilled with the current price. Change it to what you actually paid.', sellTooMuch: 'You cannot sell more than you hold.' },
    watch: { add: 'Add to watchlist', newList: 'New list', rename: 'Rename', remove: 'Remove', delList: 'Delete list', empty: 'This watchlist is empty. Search for an asset to add it.', name: 'List name' },
    settings: {
      base: 'Base currency', baseLocked: 'The base currency is locked because transaction prices are stored in it. Export, clear and re-enter to change it.',
      exportH: 'Export', exportP: 'Download a backup of all your data (JSON) or your transactions as a spreadsheet (CSV).', exportJson: 'Export backup (JSON)', exportCsv: 'Export transactions (CSV)',
      importH: 'Import', importP: 'Restore a backup made with this tracker. This replaces the data in this browser.', importBtn: 'Choose backup file', importOk: 'Backup imported.', importBad: 'This file is not a valid Winvest portfolio backup.',
      clearH: 'Clear all data', clearP: 'Removes your portfolio and watchlists from this browser. Make an export first.', clear: 'Clear all data', confirm: 'Yes, delete everything',
      privacyH: 'Privacy', privacyP: 'Your portfolio is saved in this browser’s local storage only. To fetch prices, only the names of the assets are sent to CoinGecko and, for stocks, via our Cloudflare proxy to Yahoo Finance. Clearing your browser data deletes the portfolio, so export regularly.',
      storageFail: 'Your browser blocks local storage (for example in private mode). Changes will be lost when you close this page.',
    },
    disclaimer: 'Prices can be delayed or missing and calculations are indicative. This tool is for your own tracking only and is not financial advice.',
    ctaH: 'Discuss your portfolio with the community', ctaP: 'Ask questions and share ideas in the free Winvest Capital Discord.', ctaBtn: 'Join the free Discord',
  },
  nl: {
    metaTitle: 'Gratis portfolio tracker voor crypto en aandelen | Winvest Capital',
    description: 'Volg crypto en aandelen in één overzicht met actuele prijzen: winst en verlies, allocatie, performance per week, maand, kwartaal en jaar, drawdown en watchlists. Alleen opgeslagen op je eigen apparaat.',
    h1: 'Portfolio tracker',
    intro: 'Crypto en aandelen in één overzicht, met actuele prijzen. Je gegevens worden alleen in deze browser op dit apparaat opgeslagen, niet op onze servers. Gebruik export voor een back-up of om ze naar een ander apparaat te zetten.',
    tabs: { overview: 'Overzicht', positions: 'Posities', txs: 'Transacties', watch: 'Watchlists', settings: 'Back-up & instellingen' },
    add: '+ Transactie toevoegen',
    total: 'Totale waarde', pnl: 'Totale winst / verlies', unreal: 'Ongerealiseerd', real: 'Gerealiseerd', today: 'Vandaag', invested: 'Ingelegd (kostprijs)',
    perf: 'Performance', week: 'Week', month: 'Maand', quarter: 'Kwartaal', year: 'Jaar', sinceStart: 'sinds start',
    valueChart: 'Portfoliowaarde, laatste 12 maanden',
    alloc: 'Allocatie', byClass: 'Per categorie', crypto: 'Crypto', stocks: 'Aandelen',
    risk: 'Risk exposure', maxDd: 'Max drawdown (1j)', curDd: 'Huidige drawdown', vol: 'Volatiliteit (per jaar, 90d)', largest: 'Grootste positie', top3: 'Top 3 posities', effective: 'Effectief aantal posities', stable: 'Stablecoins',
    divLow: 'Geconcentreerd', divMid: 'Redelijk gespreid', divHigh: 'Goed gespreid',
    cols: { asset: 'Asset', qty: 'Aantal', avg: 'Gem. kostprijs', price: 'Prijs', value: 'Waarde', pnl: 'W/V', weight: 'Gewicht', d24: '24u' },
    emptyH: 'Start je portfolio',
    emptyP: 'Voeg je eerste aankoop toe. Zoek een coin of aandeel en vul in hoeveel je kocht en tegen welke prijs.',
    loadingPrices: 'Actuele prijzen laden…',
    noPrice: 'geen live prijs',
    setPrice: 'Prijs invullen',
    histNote: 'Performance gebruikt dagelijkse slotkoersen van de laatste 12 maanden. Posities die eerder zijn gekocht, worden gewaardeerd vanaf 12 maanden geleden.',
    txH: 'Transacties', del: 'Verwijderen', type: 'Type', buy: 'Koop', sell: 'Verkoop', date: 'Datum', fee: 'Kosten', note: 'Notitie',
    form: { title: 'Transactie toevoegen', kind: 'Markt', search: 'Zoek een coin of aandeel (bijv. BTC, Apple, ASML)', searching: 'Zoeken…', none: 'Niets gevonden.', chosen: 'Gekozen', change: 'Wijzigen', qty: 'Aantal', price: 'Prijs per stuk', fee: 'Kosten (optioneel)', note: 'Notitie (optioneel)', save: 'Transactie opslaan', cancel: 'Annuleren', priceHint: 'Vooraf ingevuld met de huidige prijs. Pas aan naar wat je echt betaalde.', sellTooMuch: 'Je kunt niet meer verkopen dan je bezit.' },
    watch: { add: 'Toevoegen aan watchlist', newList: 'Nieuwe lijst', rename: 'Hernoemen', remove: 'Verwijderen', delList: 'Lijst verwijderen', empty: 'Deze watchlist is leeg. Zoek een asset om toe te voegen.', name: 'Naam van de lijst' },
    settings: {
      base: 'Basisvaluta', baseLocked: 'De basisvaluta ligt vast omdat de transactieprijzen daarin zijn opgeslagen. Exporteer, wis en voer opnieuw in om te wijzigen.',
      exportH: 'Exporteren', exportP: 'Download een back-up van al je gegevens (JSON) of je transacties als spreadsheet (CSV).', exportJson: 'Back-up exporteren (JSON)', exportCsv: 'Transacties exporteren (CSV)',
      importH: 'Importeren', importP: 'Zet een back-up van deze tracker terug. Dit vervangt de gegevens in deze browser.', importBtn: 'Kies back-upbestand', importOk: 'Back-up geïmporteerd.', importBad: 'Dit bestand is geen geldige back-up van de Winvest portfolio tracker.',
      clearH: 'Alle gegevens wissen', clearP: 'Verwijdert je portfolio en watchlists uit deze browser. Maak eerst een export.', clear: 'Alle gegevens wissen', confirm: 'Ja, alles verwijderen',
      privacyH: 'Privacy', privacyP: 'Je portfolio staat alleen in de lokale opslag van deze browser. Om prijzen op te halen worden alleen de namen van de assets naar CoinGecko gestuurd en, voor aandelen, via onze Cloudflare-proxy naar Yahoo Finance. Als je je browsergegevens wist, is het portfolio weg, dus exporteer regelmatig.',
      storageFail: 'Je browser blokkeert lokale opslag (bijvoorbeeld in privémodus). Wijzigingen gaan verloren als je deze pagina sluit.',
    },
    disclaimer: 'Prijzen kunnen vertraagd zijn of ontbreken en berekeningen zijn indicatief. Deze tool is alleen voor je eigen overzicht en geen financieel advies.',
    ctaH: 'Bespreek je portfolio met de community', ctaP: 'Stel vragen en deel ideeën in de gratis Winvest Capital Discord.', ctaBtn: 'Word gratis lid van de Discord',
  },
}

type C = (typeof portfolioCopy)['en']
type Tab = keyof C['tabs']

// ---------- formatting ----------
const fmtMoney = (v: number | undefined, base: Currency, lang: Lang, compact = false) => {
  if (v === undefined || !isFinite(v)) return '–'
  const abs = Math.abs(v)
  return new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'en-GB', {
    style: 'currency', currency: base,
    notation: compact && abs >= 1e6 ? 'compact' : 'standard',
    maximumFractionDigits: abs >= 1000 ? 0 : abs >= 1 ? 2 : 6,
    minimumFractionDigits: abs >= 1000 ? 0 : abs >= 1 ? 2 : 2,
  }).format(v)
}
const fmtNum = (v: number, lang: Lang) => new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'en-GB', { maximumFractionDigits: v >= 1000 ? 2 : 8 }).format(v)
const fmtPct = (v: number | undefined, sign = true) => (v === undefined || !isFinite(v) ? '–' : `${sign && v > 0 ? '+' : ''}${v.toFixed(2)}%`)
const tone = (v: number | undefined) => (v === undefined || Math.abs(v) < 1e-9 ? 'text-white/70' : v > 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]')
const todayStr = () => new Date().toISOString().slice(0, 10)
const PALETTE = ['#FE0000', 'var(--wc-text)', '#F59E0B', '#34D399', '#60A5FA', '#A78BFA', '#F472B6', '#94A3B8', '#FB7185', '#2DD4BF']

// ---------- small UI pieces ----------
function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className}`}>{children}</div>
}
function Label({ children }: { children: ReactNode }) {
  return <div className="text-xs font-medium tracking-wide text-white/50 uppercase">{children}</div>
}
function AssetBadge({ a }: { a?: Asset }) {
  if (!a) return <span>?</span>
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {a.image ? <img src={a.image} alt="" width={22} height={22} className="size-[22px] shrink-0 rounded-full bg-white/10" /> : <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">{a.symbol.slice(0, 3)}</span>}
      <span className="min-w-0">
        <span className="block truncate font-semibold">{a.symbol}</span>
        <span className="block truncate text-xs text-white/45">{a.name}</span>
      </span>
    </span>
  )
}

function LineChart({ pts, base, lang }: { pts: Point[]; base: Currency; lang: Lang }) {
  const [hover, setHover] = useState<number | null>(null)
  const data = pts.filter((p) => p.value > 0)
  if (data.length < 2) return <div className="flex h-48 items-center justify-center text-sm text-white/40">–</div>
  const W = 800, H = 220, pad = 8
  const min = Math.min(...data.map((p) => p.value)), max = Math.max(...data.map((p) => p.value))
  const x = (i: number) => pad + (i / (data.length - 1)) * (W - pad * 2)
  const y = (v: number) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2)
  const d = data.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join('')
  const up = data[data.length - 1].value >= data[0].value
  const col = up ? 'var(--wc-up)' : 'var(--wc-red-soft)'
  const h = hover !== null ? data[hover] : null
  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-56 w-full"
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
          const i = Math.round(((e.clientX - r.left) / r.width) * (data.length - 1))
          setHover(Math.max(0, Math.min(data.length - 1, i)))
        }}
      >
        <defs>
          <linearGradient id="pf-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={col} stopOpacity="0.25" />
            <stop offset="1" stopColor={col} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d}L${x(data.length - 1)},${H}L${x(0)},${H}Z`} fill="url(#pf-fill)" />
        <path d={d} fill="none" stroke={col} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {h ? <line x1={x(hover!)} x2={x(hover!)} y1={0} y2={H} stroke="var(--wc-line)" vectorEffect="non-scaling-stroke" /> : null}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-white/45">
        <span>{new Date(data[0].t).toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-GB', { month: 'short', year: 'numeric' })}</span>
        {h ? <span className="font-semibold text-white">{new Date(h.t).toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-GB')} · {fmtMoney(h.value, base, lang)}</span> : null}
        <span>{new Date(data[data.length - 1].t).toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  )
}

function Donut({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0)
  if (!total) return null
  const R = 60, r = 38
  let a0 = -Math.PI / 2
  const arcs = parts.map((p) => {
    const a1 = a0 + (p.value / total) * Math.PI * 2
    const large = a1 - a0 > Math.PI ? 1 : 0
    const pt = (rad: number, a: number) => `${80 + rad * Math.cos(a)},${80 + rad * Math.sin(a)}`
    const path = parts.length === 1
      ? `M80,${80 - R}A${R},${R} 0 1 1 79.99,${80 - R}ZM80,${80 - r}A${r},${r} 0 1 0 80.01,${80 - r}Z`
      : `M${pt(R, a0)}A${R},${R} 0 ${large} 1 ${pt(R, a1)}L${pt(r, a1)}A${r},${r} 0 ${large} 0 ${pt(r, a0)}Z`
    a0 = a1
    return <path key={p.label} d={path} fill={p.color} fillRule="evenodd" stroke="var(--wc-black)" strokeWidth="1.5" />
  })
  return <svg viewBox="0 0 160 160" className="size-40 shrink-0">{arcs}</svg>
}

// ---------- asset search ----------
function AssetSearch({ c, onPick, autoFocus }: { c: C; onPick: (a: Found) => void; autoFocus?: boolean }) {
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
      <input autoFocus={autoFocus} value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.form.search} className="mt-3 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 outline-none placeholder:text-white/35 focus:border-[var(--wc-red)]" />
      <div className="mt-2 max-h-64 overflow-y-auto">
        {busy ? <p className="px-1 py-2 text-sm text-white/50">{c.form.searching}</p> : null}
        {!busy && res && !res.length ? <p className="px-1 py-2 text-sm text-white/50">{err ? '⚠ ' : ''}{c.form.none}</p> : null}
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

// ---------- add transaction ----------
function TxForm({ c, lang, data, quotesNow, onSave, onClose, preset, held }: { c: C; lang: Lang; data: PortfolioData; quotesNow: Record<string, Quote>; onSave: (a: Asset, t: Tx) => void; onClose: () => void; preset?: Asset; held: Record<string, number> }) {
  const [asset, setAsset] = useState<Asset | undefined>(preset)
  const [type, setType] = useState<'buy' | 'sell'>('buy')
  const [date, setDate] = useState(todayStr())
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [fee, setFee] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')

  const pick = async (a: Asset) => {
    setAsset(a)
    const known = quotesNow[a.key]?.price
    if (known) setPrice(String(+known.toPrecision(8)))
    else {
      const q = await quotes([a], data.base).catch(() => ({} as Record<string, Quote>))
      const p = q[a.key]?.price
      if (p) setPrice(String(+p.toPrecision(8)))
      if (q[a.key]?.image) setAsset({ ...a, image: a.image || q[a.key].image })
    }
  }
  useEffect(() => {
    if (preset) void pick(preset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const n = (s: string) => parseFloat(s.replace(',', '.'))
  const submit = () => {
    if (!asset) return
    const q = n(qty), p = n(price), f = fee ? n(fee) : 0
    if (!(q > 0) || !(p >= 0) || !(f >= 0) || !date) return setErr('⚠')
    if (type === 'sell' && q > (held[asset.key] || 0) + 1e-12) return setErr(c.form.sellTooMuch)
    onSave(asset, { id: uid(), asset: asset.key, type, date, qty: q, price: p, fee: f, note: note.trim() || undefined })
  }
  const input = 'w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 outline-none focus:border-[var(--wc-red)]'
  const pill = (on: boolean) => `flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${on ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={c.form.title} className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-[var(--wc-panel)] p-5 sm:rounded-3xl sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{c.form.title}</h2>
          <button type="button" onClick={onClose} aria-label={c.form.cancel} className="rounded-full px-3 py-1 text-white/60 hover:text-white">✕</button>
        </div>
        <div className="mt-4">
          {asset ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <AssetBadge a={asset} />
              {!preset ? <button type="button" onClick={() => setAsset(undefined)} className="text-sm text-white/60 hover:text-white">{c.form.change}</button> : null}
            </div>
          ) : (
            <AssetSearch c={c} onPick={(a) => void pick(a)} autoFocus />
          )}
        </div>
        {asset ? (
          <div className="mt-4 grid gap-3">
            <div className="flex rounded-full border border-white/15 p-1">
              <button type="button" className={pill(type === 'buy')} onClick={() => setType('buy')}>{c.buy}</button>
              <button type="button" className={pill(type === 'sell')} onClick={() => setType('sell')}>{c.sell}</button>
            </div>
            <label className="grid gap-1 text-sm text-white/60">{c.date}<input type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} className={input} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm text-white/60">{c.form.qty}<input inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" className={input} /></label>
              <label className="grid gap-1 text-sm text-white/60">{c.form.price} ({data.base})<input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className={input} /></label>
            </div>
            <p className="-mt-1 text-xs text-white/40">{c.form.priceHint}</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm text-white/60">{c.form.fee} ({data.base})<input inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0" className={input} /></label>
              <label className="grid gap-1 text-sm text-white/60">{c.form.note}<input value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} className={input} /></label>
            </div>
            {qty && price ? <p className="text-sm text-white/60">= {fmtMoney(n(qty) * n(price) + (fee ? n(fee) : 0), data.base, lang)}</p> : null}
            {err ? <p className="text-sm text-[var(--wc-red-soft)]">{err}</p> : null}
            <div className="mt-1 flex gap-2">
              <button type="button" onClick={submit} className="flex-1 rounded-full bg-[var(--wc-red)] px-5 py-3 font-semibold text-white transition hover:brightness-110">{c.form.save}</button>
              <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-5 py-3 font-semibold text-white/80 hover:border-white/40">{c.form.cancel}</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ---------- main ----------
export default function Portfolio({ lang }: { lang: Lang }) {
  const c = portfolioCopy[lang]
  const [data, setData] = useState<PortfolioData | null>(null)
  const [storageOk, setStorageOk] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [q, setQ] = useState<Record<string, Quote>>({})
  const [loadingQ, setLoadingQ] = useState(false)
  const [hist, setHist] = useState<Record<string, History>>({})
  const [form, setForm] = useState<{ preset?: Asset } | null>(null)
  const [msg, setMsg] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [wl, setWl] = useState(0)
  const [wlSearch, setWlSearch] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setData(load())
    if (location.hash) {
      const t = location.hash.slice(1) as Tab
      if (t in portfolioCopy.en.tabs) setTab(t)
    }
  }, [])

  const update = useCallback((fn: (d: PortfolioData) => PortfolioData) => {
    setData((prev) => {
      if (!prev) return prev
      const next = fn(structuredClone(prev))
      setStorageOk(save(next))
      return next
    })
  }, [])

  // assets that need prices: held assets + watchlist assets
  const neededKeys = useMemo(() => {
    if (!data) return [] as string[]
    const s = new Set<string>(data.txs.map((t) => t.asset))
    for (const w of data.watchlists) for (const k of w.assets) s.add(k)
    return [...s].filter((k) => data.assets[k])
  }, [data])
  const neededSig = neededKeys.join('|') + '|' + (data?.base ?? '')

  useEffect(() => {
    if (!data || !neededKeys.length) return
    let alive = true
    let retry: ReturnType<typeof setTimeout> | undefined
    const run = async () => {
      if (retry) clearTimeout(retry)
      setLoadingQ(true)
      const r = await quotes(neededKeys.map((k) => data.assets[k]), data.base).catch(() => ({} as Record<string, Quote>))
      if (alive) {
        setQ(r)
        setLoadingQ(false)
        // some prices missing or stale (rate limit): try again sooner
        if (neededKeys.some((k) => !r[k] || r[k].stale)) retry = setTimeout(() => void run(), 20000)
      }
    }
    void run()
    const t = setInterval(() => { if (!document.hidden) void run() }, 60000)
    return () => { alive = false; clearInterval(t); if (retry) clearTimeout(retry) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neededSig])

  // history for held assets (sequential, cached for 6 hours)
  const heldKeys = useMemo(() => (data ? [...new Set(data.txs.map((t) => t.asset))] : []), [data])
  const heldSig = heldKeys.join('|') + '|' + (data?.base ?? '')
  useEffect(() => {
    if (!data || !heldKeys.length) return
    let alive = true
    ;(async () => {
      for (const k of heldKeys) {
        const a = data.assets[k]
        if (!a) continue
        // CoinGecko's free API is rate limited: retry a couple of times with a pause
        for (let attempt = 0; attempt < 3 && alive; attempt++) {
          try {
            const h = await fetchHistory(a, data.base)
            if (!alive) return
            setHist((prev) => ({ ...prev, [k]: h }))
            break
          } catch {
            await new Promise((r) => setTimeout(r, 15000 * (attempt + 1)))
          }
        }
        await new Promise((r) => setTimeout(r, 1200))
      }
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heldSig])

  const prices = useMemo(() => {
    const p: Record<string, number | undefined> = {}
    if (data) for (const k of neededKeys) p[k] = q[k]?.price ?? data.manualPrices[k]
    return p
  }, [q, data, neededKeys])
  const changes = useMemo(() => Object.fromEntries(Object.entries(q).map(([k, v]) => [k, v.change24h])), [q])

  const hs: Holding[] = useMemo(() => (data ? holdings(data, prices, changes) : []), [data, prices, changes])
  const open = hs.filter((h) => h.qty > 0)
  const pts = useMemo(() => (data ? series(data, hist, prices) : []), [data, hist, prices])
  const per = useMemo(() => periods(pts), [pts])
  const dd = useMemo(() => drawdown(pts), [pts])
  const vol = useMemo(() => volatility(pts), [pts])
  const div = useMemo(() => (data ? diversification(data, open) : null), [data, open])
  const held = useMemo(() => Object.fromEntries(hs.map((h) => [h.key, h.qty])), [hs])

  if (!data) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/70">{c.intro}</p>
      </main>
    )
  }

  const base = data.base
  const totalValue = open.reduce((s, h) => s + h.value, 0)
  const totalCost = open.reduce((s, h) => s + h.cost, 0)
  const unreal = open.reduce((s, h) => s + h.unrealized, 0)
  const real = hs.reduce((s, h) => s + h.realized, 0)
  const day24 = open.reduce((s, h) => s + (h.change24h !== undefined && h.price !== undefined ? h.value - h.value / (1 + h.change24h / 100) : 0), 0)
  const missing = open.filter((h) => h.price === undefined)

  const saveTx = (a: Asset, t: Tx) => {
    update((d) => {
      d.assets[a.key] = { key: a.key, kind: a.kind, symbol: a.symbol, name: a.name, id: a.id, image: a.image ?? d.assets[a.key]?.image, currency: a.currency }
      d.txs.push(t)
      d.txs.sort((x, y) => x.date.localeCompare(y.date))
      return d
    })
    setForm(null)
  }

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const d = validate(JSON.parse(await f.text()))
      if (!d) throw new Error('bad')
      setData(d)
      setStorageOk(save(d))
      setHist({})
      setMsg(c.settings.importOk)
    } catch {
      setMsg(c.settings.importBad)
    }
  }

  const tabBtn = (t: Tab) => (
    <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => { setTab(t); history.replaceState(null, '', '#' + t) }} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>
      {c.tabs[t]}
    </button>
  )

  const divLabel = div ? (div.effective >= 8 ? c.divHigh : div.effective >= 4 ? c.divMid : c.divLow) : ''
  const allocParts = open.filter((h) => h.value > 0).slice(0, 9).map((h, i) => ({ label: data.assets[h.key]?.symbol ?? h.key, value: h.value, color: PALETTE[i % PALETTE.length] }))
  const rest = open.filter((h) => h.value > 0).slice(9).reduce((s, h) => s + h.value, 0)
  if (rest > 0) allocParts.push({ label: lang === 'nl' ? 'Overig' : 'Other', value: rest, color: '#475569' })

  const list = data.watchlists[Math.min(wl, data.watchlists.length - 1)]

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/15 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-white/45">
          <a href={paths[lang].home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span> {c.h1}
        </nav>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1>
            <p className="mt-3 max-w-2xl text-white/65">{c.intro}</p>
          </div>
          <button type="button" onClick={() => setForm({})} className="rounded-full bg-[var(--wc-red)] px-5 py-3 font-semibold text-white transition hover:brightness-110">{c.add}</button>
        </div>
        {!storageOk ? <p className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">{c.settings.storageFail}</p> : null}

        <div role="tablist" className="mt-8 flex gap-1 overflow-x-auto rounded-full border border-white/15 p-1 sm:inline-flex">
          {(Object.keys(c.tabs) as Tab[]).map(tabBtn)}
        </div>

        {/* ---------------- OVERVIEW ---------------- */}
        {tab === 'overview' && (
          <div className="mt-6 grid gap-4">
            {!data.txs.length ? (
              <Card className="py-10 text-center">
                <h2 className="text-2xl font-bold">{c.emptyH}</h2>
                <p className="mx-auto mt-2 max-w-md text-white/65">{c.emptyP}</p>
                <button type="button" onClick={() => setForm({})} className="mt-6 rounded-full bg-[var(--wc-red)] px-6 py-3 font-semibold text-white transition hover:brightness-110">{c.add}</button>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card><Label>{c.total}</Label><div className="mt-1 text-3xl font-bold tabular-nums">{fmtMoney(totalValue, base, lang, true)}</div><div className={`mt-1 text-sm tabular-nums ${tone(day24)}`}>{c.today}: {fmtMoney(day24, base, lang)}</div></Card>
                  <Card><Label>{c.pnl}</Label><div className={`mt-1 text-3xl font-bold tabular-nums ${tone(unreal + real)}`}>{fmtMoney(unreal + real, base, lang, true)}</div><div className="mt-1 text-sm text-white/55">{c.unreal} <span className={tone(unreal)}>{fmtMoney(unreal, base, lang)}</span> ({fmtPct(totalCost ? (unreal / totalCost) * 100 : undefined)})</div></Card>
                  <Card><Label>{c.invested}</Label><div className="mt-1 text-3xl font-bold tabular-nums">{fmtMoney(totalCost, base, lang, true)}</div><div className="mt-1 text-sm text-white/55">{c.real} <span className={tone(real)}>{fmtMoney(real, base, lang)}</span></div></Card>
                  <Card><Label>{c.byClass}</Label><div className="mt-2 flex h-3 overflow-hidden rounded-full bg-white/10">{div ? <><span style={{ width: `${div.cryptoPct}%` }} className="bg-[var(--wc-red)]" /><span style={{ width: `${div.stockPct}%` }} className="bg-white" /></> : null}</div><div className="mt-2 flex justify-between text-sm"><span><span className="mr-1.5 inline-block size-2 rounded-full bg-[var(--wc-red)]" />{c.crypto} {fmtPct(div?.cryptoPct, false)}</span><span><span className="mr-1.5 inline-block size-2 rounded-full bg-white" />{c.stocks} {fmtPct(div?.stockPct, false)}</span></div></Card>
                </div>
                {loadingQ && !Object.keys(q).length ? <p className="text-sm text-white/50">{c.loadingPrices}</p> : null}
                {missing.length ? <p className="text-sm text-amber-200/90">⚠ {missing.map((h) => data.assets[h.key]?.symbol).join(', ')}: {c.noPrice}. {lang === 'nl' ? 'Waarde berekend op kostprijs; vul een prijs in bij Posities.' : 'Valued at cost; set a price under Positions.'}</p> : null}

                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">{c.perf}</h2></div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {per.map((p) => (
                      <div key={p.label} className="rounded-xl bg-white/[0.04] p-3">
                        <div className="text-xs text-white/50">{c[p.label]}{p.sinceStart ? ` · ${c.sinceStart}` : ''}</div>
                        <div className={`mt-1 text-xl font-bold tabular-nums ${tone(p.pct)}`}>{fmtPct(p.pct)}</div>
                        <div className={`text-xs tabular-nums ${tone(p.pnl)}`}>{fmtMoney(p.pnl, base, lang)}</div>
                      </div>
                    ))}
                  </div>
                  <h3 className="mt-6 text-sm font-semibold text-white/70">{c.valueChart}</h3>
                  <LineChart pts={pts} base={base} lang={lang} />
                  <p className="mt-2 text-xs text-white/40">{c.histNote}</p>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <h2 className="text-lg font-bold">{c.alloc}</h2>
                    <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row">
                      <Donut parts={allocParts} />
                      <ul className="w-full space-y-1.5 text-sm">
                        {allocParts.map((p) => (
                          <li key={p.label} className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2"><span className="inline-block size-2.5 rounded-full" style={{ background: p.color }} />{p.label}</span>
                            <span className="tabular-nums text-white/70">{((p.value / (totalValue || 1)) * 100).toFixed(1)}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {div ? <p className="mt-4 text-sm text-white/60">{c.effective}: <span className="font-semibold text-white">{div.effective.toFixed(1)}</span> · {divLabel}</p> : null}
                  </Card>
                  <Card>
                    <h2 className="text-lg font-bold">{c.risk}</h2>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      {([
                        [c.maxDd, fmtPct(dd.max), dd.max < -30 ? 'bad' : dd.max < -15 ? 'warn' : 'ok'],
                        [c.curDd, fmtPct(dd.current), dd.current < -20 ? 'bad' : dd.current < -10 ? 'warn' : 'ok'],
                        [c.vol, vol === undefined ? '–' : vol.toFixed(1) + '%', vol === undefined ? 'ok' : vol > 80 ? 'bad' : vol > 40 ? 'warn' : 'ok'],
                        [c.largest, fmtPct(div?.largest, false), (div?.largest ?? 0) > 50 ? 'bad' : (div?.largest ?? 0) > 25 ? 'warn' : 'ok'],
                        [c.top3, fmtPct(div?.top3, false), (div?.top3 ?? 0) > 80 ? 'warn' : 'ok'],
                        [c.stable, fmtPct(div?.stablePct, false), 'ok'],
                      ] as [string, string, 'ok' | 'warn' | 'bad'][]).map(([k, v, lvl]) => (
                        <div key={k} className="rounded-xl bg-white/[0.04] p-3">
                          <dt className="text-xs text-white/50">{k}</dt>
                          <dd className={`mt-1 text-lg font-bold tabular-nums ${lvl === 'bad' ? 'text-[var(--wc-red-soft)]' : lvl === 'warn' ? 'text-amber-300' : 'text-white'}`}>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* ---------------- POSITIONS ---------------- */}
        {tab === 'positions' && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-white/[0.04] text-left text-xs text-white/50">
                <tr>
                  <th className="px-3 py-2.5 font-medium">{c.cols.asset}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.qty}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.avg}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.price}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.d24}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.value}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.pnl}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.weight}</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {open.map((h) => {
                  const a = data.assets[h.key]
                  return (
                    <tr key={h.key} className="hover:bg-white/[0.03]">
                      <td className="px-3 py-2.5"><AssetBadge a={a ? { ...a, image: a.image ?? q[h.key]?.image } : undefined} /></td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{fmtNum(h.qty, lang)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-white/70">{fmtMoney(h.avg, base, lang)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {q[h.key] ? fmtMoney(h.price, base, lang) : (
                          <button type="button" className="text-xs text-amber-300 underline" onClick={() => {
                            const v = window.prompt(`${c.setPrice} (${a?.symbol}, ${base})`, data.manualPrices[h.key] ? String(data.manualPrices[h.key]) : '')
                            const p = v ? parseFloat(v.replace(',', '.')) : NaN
                            if (p > 0) update((d) => { d.manualPrices[h.key] = p; return d })
                          }}>{data.manualPrices[h.key] ? fmtMoney(data.manualPrices[h.key], base, lang) : c.setPrice}</button>
                        )}
                      </td>
                      <td className={`px-3 py-2.5 text-right tabular-nums ${tone(h.change24h)}`}>{fmtPct(h.change24h)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{fmtMoney(h.value, base, lang)}</td>
                      <td className={`px-3 py-2.5 text-right tabular-nums ${tone(h.unrealized)}`}>{fmtMoney(h.unrealized, base, lang)}<span className="block text-xs">{fmtPct(h.unrealizedPct)}</span></td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-white/70">{(h.weight * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2.5 text-right"><button type="button" onClick={() => a && setForm({ preset: a })} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/70 hover:border-[var(--wc-red)] hover:text-white">+ / −</button></td>
                    </tr>
                  )
                })}
                {!open.length ? <tr><td colSpan={9} className="px-3 py-8 text-center text-white/50">{c.emptyP}</td></tr> : null}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- TRANSACTIONS ---------------- */}
        {tab === 'txs' && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-white/[0.04] text-left text-xs text-white/50">
                <tr>
                  <th className="px-3 py-2.5 font-medium">{c.date}</th>
                  <th className="px-3 py-2.5 font-medium">{c.type}</th>
                  <th className="px-3 py-2.5 font-medium">{c.cols.asset}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.qty}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.price}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.fee}</th>
                  <th className="px-3 py-2.5 font-medium">{c.note}</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...data.txs].reverse().map((t) => (
                  <tr key={t.id}>
                    <td className="px-3 py-2.5 tabular-nums text-white/70">{t.date}</td>
                    <td className={`px-3 py-2.5 font-semibold ${t.type === 'buy' ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]'}`}>{t.type === 'buy' ? c.buy : c.sell}</td>
                    <td className="px-3 py-2.5">{data.assets[t.asset]?.symbol}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{fmtNum(t.qty, lang)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{fmtMoney(t.price, base, lang)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-white/60">{t.fee ? fmtMoney(t.fee, base, lang) : '–'}</td>
                    <td className="max-w-[12rem] truncate px-3 py-2.5 text-white/60">{t.note}</td>
                    <td className="px-3 py-2.5 text-right"><button type="button" onClick={() => update((d) => { d.txs = d.txs.filter((x) => x.id !== t.id); return d })} className="text-xs text-white/50 hover:text-[var(--wc-red-soft)]">{c.del}</button></td>
                  </tr>
                ))}
                {!data.txs.length ? <tr><td colSpan={8} className="px-3 py-8 text-center text-white/50">{c.emptyP}</td></tr> : null}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- WATCHLISTS ---------------- */}
        {tab === 'watch' && list && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              {data.watchlists.map((w, i) => (
                <button key={w.id} type="button" onClick={() => setWl(i)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${i === wl ? 'border-white bg-white text-black' : 'border-white/15 text-white/70 hover:text-white'}`}>{w.name}</button>
              ))}
              <button type="button" onClick={() => { update((d) => { d.watchlists.push({ id: uid(), name: `${c.watch.newList} ${d.watchlists.length + 1}`, assets: [] }); return d }); setWl(data.watchlists.length) }} className="rounded-full border border-dashed border-white/25 px-4 py-1.5 text-sm text-white/70 hover:text-white">+ {c.watch.newList}</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <button type="button" className="text-white/60 hover:text-white" onClick={() => { const v = window.prompt(c.watch.name, list.name); if (v && v.trim()) update((d) => { d.watchlists[wl].name = v.trim().slice(0, 40); return d }) }}>{c.watch.rename}</button>
              {data.watchlists.length > 1 ? <button type="button" className="text-white/60 hover:text-[var(--wc-red-soft)]" onClick={() => { update((d) => { d.watchlists.splice(wl, 1); return d }); setWl(0) }}>{c.watch.delList}</button> : null}
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <ul className="divide-y divide-white/5">
                {list.assets.map((k) => {
                  const a = data.assets[k]
                  const qt = q[k]
                  return (
                    <li key={k} className="flex items-center justify-between gap-3 px-4 py-3">
                      <AssetBadge a={a ? { ...a, image: a.image ?? qt?.image } : undefined} />
                      <span className="ml-auto text-right">
                        <span className="block font-semibold tabular-nums">{qt ? fmtMoney(qt.price, base, lang) : '–'}</span>
                        <span className={`block text-xs tabular-nums ${tone(qt?.change24h)}`}>{fmtPct(qt?.change24h)} · 24h</span>
                      </span>
                      <span className="flex shrink-0 gap-1">
                        {a ? <button type="button" onClick={() => setForm({ preset: a })} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/70 hover:border-[var(--wc-red)] hover:text-white">{c.buy}</button> : null}
                        <button type="button" aria-label={c.watch.remove} onClick={() => update((d) => { d.watchlists[wl].assets = d.watchlists[wl].assets.filter((x) => x !== k); return d })} className="rounded-full px-2 py-1 text-white/40 hover:text-[var(--wc-red-soft)]">✕</button>
                      </span>
                    </li>
                  )
                })}
                {!list.assets.length ? <li className="px-4 py-8 text-center text-white/50">{c.watch.empty}</li> : null}
              </ul>
            </div>
            <div className="mt-4">
              {wlSearch ? (
                <Card>
                  <AssetSearch c={c} autoFocus onPick={(a) => { update((d) => { d.assets[a.key] = d.assets[a.key] ?? { key: a.key, kind: a.kind, symbol: a.symbol, name: a.name, id: a.id, image: a.image }; if (!d.watchlists[wl].assets.includes(a.key)) d.watchlists[wl].assets.push(a.key); return d }); setWlSearch(false) }} />
                  <button type="button" onClick={() => setWlSearch(false)} className="mt-3 text-sm text-white/60 hover:text-white">{c.form.cancel}</button>
                </Card>
              ) : (
                <button type="button" onClick={() => setWlSearch(true)} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 hover:border-white/40">+ {c.watch.add}</button>
              )}
            </div>
          </div>
        )}

        {/* ---------------- SETTINGS ---------------- */}
        {tab === 'settings' && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="text-lg font-bold">{c.settings.base}</h2>
              <div className="mt-3 inline-flex rounded-full border border-white/15 p-1">
                {(['EUR', 'USD'] as Currency[]).map((cur) => (
                  <button key={cur} type="button" disabled={data.txs.length > 0} onClick={() => { update((d) => { d.base = cur; return d }); setHist({}) }} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${base === cur ? 'bg-white text-black' : 'text-white/70 hover:text-white disabled:opacity-40'}`}>{cur}</button>
                ))}
              </div>
              {data.txs.length ? <p className="mt-2 text-xs text-white/45">{c.settings.baseLocked}</p> : null}
            </Card>
            <Card>
              <h2 className="text-lg font-bold">{c.settings.exportH}</h2>
              <p className="mt-1 text-sm text-white/60">{c.settings.exportP}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => exportJson(data)} className="rounded-full bg-[var(--wc-red)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">{c.settings.exportJson}</button>
                <button type="button" onClick={() => exportCsv(data)} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40">{c.settings.exportCsv}</button>
              </div>
            </Card>
            <Card>
              <h2 className="text-lg font-bold">{c.settings.importH}</h2>
              <p className="mt-1 text-sm text-white/60">{c.settings.importP}</p>
              <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void onImport(e)} />
              <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40">{c.settings.importBtn}</button>
              {msg ? <p className="mt-2 text-sm text-white/70">{msg}</p> : null}
            </Card>
            <Card>
              <h2 className="text-lg font-bold">{c.settings.clearH}</h2>
              <p className="mt-1 text-sm text-white/60">{c.settings.clearP}</p>
              {confirmClear ? (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => { try { localStorage.removeItem('wc-portfolio-v1') } catch { /* ignore */ } setData(load()); setHist({}); setQ({}); setConfirmClear(false) }} className="rounded-full bg-[var(--wc-red)] px-4 py-2 text-sm font-semibold text-white">{c.settings.confirm}</button>
                  <button type="button" onClick={() => setConfirmClear(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80">{c.form.cancel}</button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmClear(true)} className="mt-3 rounded-full border border-[var(--wc-red)]/60 px-4 py-2 text-sm font-semibold text-[var(--wc-red-soft)]">{c.settings.clear}</button>
              )}
            </Card>
            <Card className="lg:col-span-2">
              <h2 className="text-lg font-bold">{c.settings.privacyH}</h2>
              <p className="mt-1 text-sm text-white/60">{c.settings.privacyP}</p>
            </Card>
          </div>
        )}

        <p className="mt-8 max-w-3xl text-sm text-white/45">{c.disclaimer}</p>
        <aside className="mt-8 max-w-3xl rounded-2xl border border-[var(--wc-red)]/50 bg-gradient-to-b from-[var(--wc-red)]/15 to-white/[0.02] p-6 sm:p-8">
          <h2 className="text-xl font-bold">{c.ctaH}</h2>
          <p className="mt-2 text-white/70">{c.ctaP}</p>
          <a href={DISCORD_URL} className="mt-5 inline-block rounded-full bg-[var(--wc-red)] px-5 py-2.5 font-semibold text-white transition hover:brightness-110">{c.ctaBtn}</a>
        </aside>
      </div>

      {form ? <TxForm c={c} lang={lang} data={data} quotesNow={q} preset={form.preset} held={held} onSave={saveTx} onClose={() => setForm(null)} /> : null}
    </main>
  )
}
