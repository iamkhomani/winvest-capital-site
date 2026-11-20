// Personal dashboard cards on the homepage ("Your overview"). Everything is read from this device:
// the shared watchlist, the active portfolio (localStorage) and the trading journal (IndexedDB).
// Nothing is sent anywhere except price requests. Cards without data stay hidden.
// Users can hide cards and change their order; that choice is stored on the device (wc-dash-v1).
import { useEffect, useState } from 'react'
import type { Lang } from '../i18n'
import { coinHref } from '../markets/coins'
import { paths } from '../paths'
import { useWatchlists } from '../shared/watchlist'
import type { WatchItem } from '../shared/watchlist'
import type { Asset, Currency } from '../portfolio/store'
import { cardBase } from './kit'

type CardId = 'start' | 'myday' | 'alerts' | 'watch' | 'activity' | 'news'
const ALL: CardId[] = ['start', 'myday', 'alerts', 'watch', 'activity', 'news']
const PREF = 'wc-dash-v1'
const ALERT_PCT = 5

const copy = {
  en: {
    title: 'Your overview',
    sub: 'Saved on this device only.',
    customise: 'Customise',
    done: 'Done',
    show: 'Show',
    up: 'Move up',
    down: 'Move down',
    names: { start: 'Getting started', myday: 'My day', alerts: 'Alerts', watch: 'Watchlist', activity: 'Recent activity', news: 'Headlines' } as Record<CardId, string>,
    steps: ['Follow 3 coins or stocks with ☆', 'Add a first transaction or trade', 'Read a first lesson'],
    stepLinks: ['Go to Markets', 'Open the portfolio', 'Open the lessons'],
    portfolio: 'Portfolio',
    value: 'Value',
    today: 'Today',
    trades: (open: number, week: number) => `${open} open trade${open === 1 ? '' : 's'} · ${week} closed this week`,
    noAlerts: 'Nothing unusual today.',
    moved: (pct: string) => `moved ${pct} in 24h`,
    openTrade: (n: number) => `${n} trade${n === 1 ? '' : 's'} still open in your journal`,
    seeAll: 'See all',
    empty: 'Nothing here yet.',
    bought: 'Bought',
    sold: 'Sold',
    trade: 'Trade',
    open: 'open',
    closed: 'closed',
    loading: 'Loading…',
  },
  nl: {
    title: 'Jouw overzicht',
    sub: 'Alleen op dit apparaat opgeslagen.',
    customise: 'Aanpassen',
    done: 'Klaar',
    show: 'Tonen',
    up: 'Omhoog',
    down: 'Omlaag',
    names: { start: 'Aan de slag', myday: 'Mijn dag', alerts: 'Meldingen', watch: 'Watchlist', activity: 'Recente activiteit', news: 'Nieuws' } as Record<CardId, string>,
    steps: ['Volg 3 munten of aandelen met ☆', 'Voeg een eerste transactie of trade toe', 'Lees een eerste les'],
    stepLinks: ['Naar Markten', 'Open de portfolio', 'Open de lessen'],
    portfolio: 'Portfolio',
    value: 'Waarde',
    today: 'Vandaag',
    trades: (open: number, week: number) => `${open} open trade${open === 1 ? '' : 's'} · ${week} gesloten deze week`,
    noAlerts: 'Niets bijzonders vandaag.',
    moved: (pct: string) => `${pct} in 24 uur`,
    openTrade: (n: number) => `${n} trade${n === 1 ? '' : 's'} staat nog open in je journal`,
    seeAll: 'Alles',
    empty: 'Nog niets.',
    bought: 'Gekocht',
    sold: 'Verkocht',
    trade: 'Trade',
    open: 'open',
    closed: 'gesloten',
    loading: 'Laden…',
  },
}

type Pref = { order: CardId[]; hidden: CardId[] }
function loadPref(): Pref {
  try {
    const o = JSON.parse(localStorage.getItem(PREF) || '{}') as Partial<Pref>
    const order = (o.order ?? []).filter((x): x is CardId => ALL.includes(x as CardId))
    for (const id of ALL) if (!order.includes(id)) order.push(id)
    return { order, hidden: (o.hidden ?? []).filter((x): x is CardId => ALL.includes(x as CardId)) }
  } catch {
    return { order: [...ALL], hidden: [] }
  }
}

type Quote = { price: number; change24h?: number; image?: string }
type Personal = {
  base: string
  pfName: string
  value: number
  change: number // money change over 24h
  hasPortfolio: boolean
  txCount: number
  recentTx: { date: string; type: 'buy' | 'sell'; symbol: string; id: string; kind: string }[]
  held: WatchItem[]
  openTrades: number
  weekClosed: number
  tradeCount: number
  recentTrades: { time: string; pair: string; open: boolean; pnl: number; ccy: string }[]
}

const pctStr = (v: number, lang: Lang) => `${v >= 0 ? '+' : ''}${v.toFixed(1).replace('.', lang === 'nl' ? ',' : '.')}%`

export default function Dashboard({ lang }: { lang: Lang }) {
  const c = copy[lang]
  const p = paths[lang]
  const locale = lang === 'nl' ? 'nl-NL' : 'en-US'
  const W = useWatchlists()
  const [pref, setPref] = useState<Pref | null>(null)
  const [edit, setEdit] = useState(false)
  const [me, setMe] = useState<Personal | null>(null)
  const [q, setQ] = useState<Record<string, Quote>>({})
  const [news, setNews] = useState<{ id: string; title: string; url: string; source: string }[] | null>(null)
  const [read, setRead] = useState(false)

  useEffect(() => {
    setPref(loadPref())
    try { setRead(!!localStorage.getItem('wc-read-lesson')) } catch { /* ignore */ }
  }, [])
  const savePref = (next: Pref) => {
    setPref(next)
    try { localStorage.setItem(PREF, JSON.stringify(next)) } catch { /* ignore */ }
  }

  // Personal data: active portfolio + journal (read only)
  useEffect(() => {
    let alive = true
    void (async () => {
      const [store, calc, jdb] = await Promise.all([import('../portfolio/store'), import('../portfolio/calc'), import('../journal/db')])
      const ix = store.loadIndex()
      const d = store.load(ix.active)
      const pfName = ix.list.find((x) => x.id === ix.active)?.name || (ix.active === 'main' ? (lang === 'nl' ? 'Hoofdportfolio' : 'Main portfolio') : 'Portfolio')
      const heldKeys = [...new Set(d.txs.map((t) => t.asset))]
      const held: WatchItem[] = heldKeys.map((k) => d.assets[k]).filter((a): a is Asset => !!a).map((a) => ({ key: a.key, kind: a.kind, symbol: a.symbol, name: a.name, id: a.id, image: a.image, currency: a.currency }))
      let quotes: Record<string, Quote> = {}
      if (held.length) {
        const data = await import('../portfolio/data')
        quotes = await data.quotes(held, d.base).catch(() => ({}))
      }
      const prices: Record<string, number | undefined> = {}
      const changes: Record<string, number | undefined> = {}
      for (const [k, v] of Object.entries(quotes)) { prices[k] = v.price; changes[k] = v.change24h }
      const hs = calc.holdings(d, prices, changes).filter((h) => h.qty > 0)
      const value = hs.reduce((s, h) => s + h.value, 0)
      const change = hs.reduce((s, h) => s + (h.change24h !== undefined ? h.value - h.value / (1 + h.change24h / 100) : 0), 0)
      let openTrades = 0, weekClosed = 0, tradeCount = 0
      let recentTrades: Personal['recentTrades'] = []
      try {
        const js = await jdb.loadState()
        const ccy = Object.fromEntries(js.accounts.map((a) => [a.id, a.currency]))
        const weekAgo = Date.now() - 7 * 864e5
        tradeCount = js.trades.length
        for (const t of js.trades) {
          const closedLots = t.exits.reduce((s, e) => s + e.lots, 0)
          const isOpen = closedLots < t.lots - 1e-9
          if (isOpen) openTrades++
          else if (t.exits.some((e) => Date.parse(e.time) >= weekAgo)) weekClosed++
        }
        recentTrades = [...js.trades]
          .sort((a, b) => b.openTime.localeCompare(a.openTime))
          .slice(0, 3)
          .map((t) => ({ time: t.openTime, pair: t.pair, open: t.exits.reduce((s, e) => s + e.lots, 0) < t.lots - 1e-9, pnl: t.exits.reduce((s, e) => s + e.pnl, 0), ccy: ccy[t.accountId] ?? '' }))
      } catch { /* no journal */ }
      if (!alive) return
      setQ((old) => ({ ...old, ...quotes }))
      setMe({
        base: d.base,
        pfName,
        value,
        change,
        hasPortfolio: d.txs.length > 0,
        txCount: d.txs.length,
        recentTx: [...d.txs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map((t) => ({ date: t.date, type: t.type, symbol: d.assets[t.asset]?.symbol ?? '?', id: d.assets[t.asset]?.id ?? '', kind: d.assets[t.asset]?.kind ?? '' })),
        held,
        openTrades,
        weekClosed,
        tradeCount,
        recentTrades,
      })
    })().catch(() => alive && setMe(null))
    return () => { alive = false }
  }, [lang])

  // Watchlist prices (in the portfolio's base currency)
  const watch = W.lists?.[0]?.items ?? []
  const watchSig = watch.map((i) => i.key).join('|') + (me?.base ?? '')
  useEffect(() => {
    if (!watch.length || !me) return
    let alive = true
    void import('../portfolio/data').then((m) => m.quotes(watch.slice(0, 12), me.base as Currency)).then((r) => alive && setQ((old) => ({ ...old, ...r }))).catch(() => {})
    return () => { alive = false }
  }, [watchSig]) // eslint-disable-line react-hooks/exhaustive-deps

  // Headlines (same feed as the news page)
  useEffect(() => {
    fetch('https://winvest-defi-proxy.helijl.workers.dev/news', { signal: AbortSignal.timeout(15000) })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { items?: { id: string; title: string; url: string; source: string }[] } | null) => setNews((j?.items ?? []).filter((x) => /^https:\/\//.test(x.url)).slice(0, 3)))
      .catch(() => setNews([]))
  }, [])

  if (!pref) return <div className={`${cardBase} min-h-[160px] p-5`} aria-hidden="true" />

  const money = (v: number, base = me?.base ?? 'EUR') => new Intl.NumberFormat(locale, { style: 'currency', currency: base, maximumFractionDigits: v >= 1000 ? 0 : 2 }).format(v)
  const watchCount = (W.lists ?? []).reduce((s, l) => s + l.items.length, 0)
  const steps = [watchCount >= 3, !!me && (me.txCount > 0 || me.tradeCount > 0), read]
  const stepHref = [p.markets, p.portfolio, p.learn]
  const isNew = steps.filter(Boolean).length < 3
  const href = (i: { kind: string; id: string }) => (i.kind === 'crypto' && i.id ? coinHref(lang, i.id) : p.portfolio)

  const alerts = [
    ...[...new Map([...watch, ...(me?.held ?? [])].map((i) => [i.key, i])).values()]
      .map((i) => ({ i, ch: q[i.key]?.change24h }))
      .filter((x): x is { i: WatchItem; ch: number } => x.ch !== undefined && Math.abs(x.ch) >= ALERT_PCT)
      .sort((a, b) => Math.abs(b.ch) - Math.abs(a.ch))
      .slice(0, 4),
  ]

  const has: Record<CardId, boolean> = {
    start: isNew,
    myday: !!me && (me.hasPortfolio || me.tradeCount > 0),
    alerts: alerts.length > 0 || (me?.openTrades ?? 0) > 0,
    watch: watch.length > 0,
    activity: !!me && (me.recentTx.length > 0 || me.recentTrades.length > 0),
    news: !!news && news.length > 0,
  }

  const body = (id: CardId) => {
    switch (id) {
      case 'start':
        return (
          <ol className="mt-3 space-y-2 text-sm">
            {c.steps.map((s, i) => (
              <li key={s} className="flex items-start gap-2.5">
                <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${steps[i] ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300' : 'border-white/25 text-white/50'}`}>{steps[i] ? '✓' : i + 1}</span>
                <span className="min-w-0">
                  <span className={steps[i] ? 'text-white/50 line-through' : 'text-white/85'}>{s}</span>
                  {!steps[i] ? <a href={stepHref[i]} className="ml-2 font-semibold text-[var(--wc-red-soft)] hover:underline">{c.stepLinks[i]} →</a> : null}
                </span>
              </li>
            ))}
          </ol>
        )
      case 'myday':
        return me ? (
          <div className="mt-3 grid gap-3 text-sm">
            {me.hasPortfolio ? (
              <a href={p.portfolio} className="block rounded-xl bg-white/[0.04] p-3 hover:bg-white/[0.07]">
                <span className="block text-xs text-white/50">{c.portfolio} · {me.pfName}</span>
                <span className="mt-1 flex flex-wrap items-baseline gap-x-3">
                  <span className="text-2xl font-bold tabular-nums">{money(me.value)}</span>
                  <span className={`font-semibold tabular-nums ${me.change >= 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]'}`}>{me.change >= 0 ? '+' : ''}{money(me.change)} {c.today.toLowerCase()}</span>
                </span>
              </a>
            ) : null}
            {me.tradeCount > 0 ? <a href={p.journal} className="block rounded-xl bg-white/[0.04] p-3 text-white/80 hover:bg-white/[0.07]">{c.trades(me.openTrades, me.weekClosed)}</a> : null}
          </div>
        ) : null
      case 'alerts':
        return (
          <ul className="mt-3 space-y-2 text-sm">
            {alerts.map(({ i, ch }) => (
              <li key={i.key} className="flex items-center gap-2">
                <span className={`size-2 shrink-0 rounded-full ${ch >= 0 ? 'bg-emerald-400' : 'bg-[var(--wc-red)]'}`} aria-hidden="true" />
                <a href={href(i)} className="font-semibold hover:underline">{i.symbol}</a>
                <span className={ch >= 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]'}>{c.moved(pctStr(ch, lang))}</span>
              </li>
            ))}
            {me && me.openTrades > 0 ? <li><a href={p.journal} className="text-white/80 hover:underline">{c.openTrade(me.openTrades)}</a></li> : null}
          </ul>
        )
      case 'watch':
        return (
          <ul className="mt-2 divide-y divide-white/5 text-sm">
            {watch.slice(0, 6).map((i) => {
              const qt = q[i.key]
              return (
                <li key={i.key} className="flex items-center gap-2.5 py-2">
                  {i.image || qt?.image ? <img src={i.image ?? qt?.image} alt="" width={20} height={20} loading="lazy" className="size-5 rounded-full" /> : <span className="size-5 rounded-full bg-white/10" />}
                  <a href={href(i)} className="min-w-0 flex-1 truncate font-semibold hover:underline">{i.symbol} <span className="font-normal text-white/45">{i.name}</span></a>
                  <span className="tabular-nums">{qt ? money(qt.price) : '–'}</span>
                  <span className={`w-16 text-right tabular-nums ${(qt?.change24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]'}`}>{qt?.change24h !== undefined ? pctStr(qt.change24h, lang) : ''}</span>
                </li>
              )
            })}
          </ul>
        )
      case 'activity':
        return me ? (
          <ul className="mt-2 space-y-1.5 text-sm text-white/80">
            {me.recentTx.map((t, k) => (
              <li key={'t' + k} className="flex gap-2"><span className="w-20 shrink-0 text-white/45 tabular-nums">{new Date(t.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span><span>{t.type === 'buy' ? c.bought : c.sold} <a href={href(t)} className="font-semibold hover:underline">{t.symbol}</a></span></li>
            ))}
            {me.recentTrades.map((t, k) => (
              <li key={'j' + k} className="flex gap-2"><span className="w-20 shrink-0 text-white/45 tabular-nums">{new Date(t.time).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span><span>{c.trade} <a href={p.journal} className="font-semibold hover:underline">{t.pair}</a> · {t.open ? c.open : <span className={t.pnl >= 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]'}>{t.ccy ? money(t.pnl, t.ccy) : t.pnl.toFixed(2)}</span>}</span></li>
            ))}
          </ul>
        ) : null
      default:
        return (
          <ul className="mt-2 space-y-2 text-sm">
            {(news ?? []).map((n) => (
              <li key={n.id}><a href={n.url} target="_blank" rel="noopener nofollow" className="line-clamp-2 text-white/85 hover:text-white">{n.title}</a><span className="text-xs text-white/40">{n.source}</span></li>
            ))}
          </ul>
        )
    }
  }
  const more: Partial<Record<CardId, string>> = { watch: p.portfolio + '#watch', news: p.news, activity: p.portfolio }
  const order = pref.order
  const move = (id: CardId, dir: -1 | 1) => {
    const o = [...order]
    const i = o.indexOf(id)
    const j = i + dir
    if (j < 0 || j >= o.length) return
    ;[o[i], o[j]] = [o[j], o[i]]
    savePref({ ...pref, order: o })
  }
  const toggleHidden = (id: CardId) => savePref({ ...pref, hidden: pref.hidden.includes(id) ? pref.hidden.filter((x) => x !== id) : [...pref.hidden, id] })
  const visible = order.filter((id) => has[id] && !pref.hidden.includes(id))

  return (
    <div className={`${cardBase} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{c.title}</h2>
          <p className="text-xs text-white/45">{c.sub}</p>
        </div>
        <button type="button" onClick={() => setEdit(!edit)} className="shrink-0 text-sm font-semibold text-white/55 hover:text-white">{edit ? c.done : c.customise}</button>
      </div>
      {edit ? (
        <ul className="mt-3 divide-y divide-white/5 text-sm">
          {order.map((id, i) => (
            <li key={id} className="flex items-center gap-2 py-2">
              <label className="flex flex-1 items-center gap-2">
                <input type="checkbox" checked={!pref.hidden.includes(id)} onChange={() => toggleHidden(id)} className="accent-[var(--wc-red)]" />
                {c.names[id]}
              </label>
              <button type="button" aria-label={`${c.up}: ${c.names[id]}`} disabled={i === 0} onClick={() => move(id, -1)} className="rounded-full px-2 text-white/60 hover:text-white disabled:opacity-30">↑</button>
              <button type="button" aria-label={`${c.down}: ${c.names[id]}`} disabled={i === order.length - 1} onClick={() => move(id, 1)} className="rounded-full px-2 text-white/60 hover:text-white disabled:opacity-30">↓</button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 divide-y divide-white/10">
          {visible.map((id) => (
            <section key={id} aria-label={c.names[id]} className="py-3 first:pt-2 last:pb-0">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-xs font-semibold tracking-wide text-white/50 uppercase">{c.names[id]}</h3>
                {more[id] ? <a href={more[id]} className="text-xs font-semibold text-white/50 hover:text-white">{c.seeAll} →</a> : null}
              </div>
              {body(id)}
            </section>
          ))}
          {!visible.length ? <p className="py-3 text-sm text-white/55">{me === null ? c.loading : c.empty}</p> : null}
        </div>
      )}
    </div>
  )
}
