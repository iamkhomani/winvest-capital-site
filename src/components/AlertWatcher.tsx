// Checks the price alerts while any Winvest page is open: every 2 minutes, only for assets that have an
// active alert, with the same quote function as the watchlist. When one goes off: a browser notification
// (if the visitor allowed it) and a small banner on the page. Nothing is sent to our servers.
import { useEffect, useState } from 'react'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import { quotes } from '../portfolio/data'
import type { Asset, Currency } from '../portfolio/store'
import { hits, loadAlerts, saveAlerts } from '../shared/alerts'
import type { PriceAlert } from '../shared/alerts'

const EVERY = 120_000
const LOCK = 'wc-alerts-lock' // one tab checks at a time

export function alertText(a: PriceAlert, lang: Lang, price?: number, change?: number) {
  const nl = lang === 'nl'
  const fmt = (v: number) => new Intl.NumberFormat(nl ? 'nl-NL' : 'en-US', { style: 'currency', currency: a.currency, maximumFractionDigits: v >= 1 ? 2 : 6 }).format(v)
  if (a.type === 'above') return nl ? `${a.symbol} staat boven ${fmt(a.value)}${price ? ` (nu ${fmt(price)})` : ''}` : `${a.symbol} is above ${fmt(a.value)}${price ? ` (now ${fmt(price)})` : ''}`
  if (a.type === 'below') return nl ? `${a.symbol} staat onder ${fmt(a.value)}${price ? ` (nu ${fmt(price)})` : ''}` : `${a.symbol} is below ${fmt(a.value)}${price ? ` (now ${fmt(price)})` : ''}`
  const ch = change !== undefined ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` : ''
  return nl ? `${a.symbol} bewoog ${ch || `meer dan ${a.value}%`} in 24 uur` : `${a.symbol} moved ${ch || `more than ${a.value}%`} in 24 hours`
}

export default function AlertWatcher({ lang }: { lang: Lang }) {
  const [banner, setBanner] = useState<string[]>([])
  useEffect(() => {
    let stop = false
    const check = async () => {
      if (stop) return
      const active = loadAlerts().filter((a) => a.active)
      if (!active.length) return
      try {
        const last = Number(localStorage.getItem(LOCK) || 0)
        if (Date.now() - last < EVERY - 5000) return // another tab checked just now
        localStorage.setItem(LOCK, String(Date.now()))
      } catch { /* storage blocked: check anyway */ }
      const fired: string[] = []
      for (const cur of ['EUR', 'USD'] as Currency[]) {
        const group = active.filter((a) => a.currency === cur)
        if (!group.length) continue
        const assets: Asset[] = [...new Map(group.map((a) => [a.key, { key: a.key, kind: a.kind, symbol: a.symbol, name: a.name, id: a.assetId } as Asset])).values()]
        const q = await quotes(assets, cur).catch(() => ({}) as Awaited<ReturnType<typeof quotes>>)
        const now = Date.now()
        const all = loadAlerts()
        let changed = false
        for (const a of all) {
          const qt = q[a.key]
          if (!qt || qt.stale || !hits(a, qt.price, qt.change24h, now)) continue
          a.fired = now
          a.seen = false
          if (a.type !== 'move') a.active = false // a price level fires once
          changed = true
          const text = alertText(a, lang, qt.price, qt.change24h)
          fired.push(text)
          try {
            if ('Notification' in window && Notification.permission === 'granted') new Notification('Winvest alert', { body: text, icon: '/app-icon-192.png', tag: a.id })
          } catch { /* notifications unavailable */ }
        }
        if (changed) saveAlerts(all)
      }
      if (fired.length && !stop) setBanner((b) => [...b, ...fired].slice(-3))
    }
    const first = setTimeout(() => void check(), 4000)
    const t = setInterval(() => void check(), EVERY)
    return () => {
      stop = true
      clearTimeout(first)
      clearInterval(t)
    }
  }, [lang])

  if (!banner.length) return null
  const nl = lang === 'nl'
  return (
    <div role="status" className="fixed inset-x-3 bottom-20 z-[60] mx-auto max-w-md rounded-2xl border border-amber-300/40 bg-[var(--wc-panel)] p-4 text-sm shadow-2xl shadow-black/60 sm:bottom-6">
      <p className="font-semibold text-amber-300">🔔 {nl ? 'Prijsalert' : 'Price alert'}</p>
      <ul className="mt-1 space-y-0.5 text-white/85">{banner.map((b, i) => <li key={i}>{b}</li>)}</ul>
      <div className="mt-3 flex gap-3">
        <a href={paths[lang].watchlist + '#alerts'} className="font-semibold text-[var(--wc-red-soft)] hover:underline">{nl ? 'Bekijk alerts' : 'View alerts'}</a>
        <button type="button" onClick={() => setBanner([])} className="text-white/60 hover:text-white">{nl ? 'Sluiten' : 'Dismiss'}</button>
      </div>
    </div>
  )
}
