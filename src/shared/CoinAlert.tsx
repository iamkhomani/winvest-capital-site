// Price alert straight from a coin page (quality review, item 1): a bell next to the watch star.
// Saving also puts the coin on the watchlist, because alerts belong to watched assets.
import { useRef } from 'react'
import { paths } from '../paths'
import type { Lang } from '../i18n'
import AlertForm from './AlertForm'
import { useAlerts } from './alerts'
import { alertText } from '../components/AlertWatcher'
import { useWatchlists } from './watchlist'
import type { WatchItem } from './watchlist'

export default function CoinAlert({ lang, item, price }: { lang: Lang; item: WatchItem; price?: number }) {
  const nl = lang === 'nl'
  const ref = useRef<HTMLDialogElement>(null)
  const A = useAlerts()
  const W = useWatchlists()
  const mine = (A.alerts ?? []).filter((a) => a.key === item.key)
  const active = mine.some((a) => a.active)
  return (
    <>
      <button
        type="button"
        onClick={() => { ref.current?.showModal(); document.documentElement.classList.add('wc-modal') }}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? 'border-amber-300/50 text-amber-300' : 'border-white/20 text-white/70 hover:text-white'}`}
      >
        <span aria-hidden="true">🔔</span>
        {active ? (nl ? 'Alert actief' : 'Alert on') : nl ? 'Alert' : 'Alert'}
      </button>
      <dialog ref={ref} onClose={() => document.documentElement.classList.remove('wc-modal')} aria-label={nl ? `Prijsalert voor ${item.name}` : `Price alert for ${item.name}`} className="wc-dialog m-auto w-[min(30rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-[var(--wc-panel)] p-5 text-left text-white shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold">{nl ? `Prijsalert voor ${item.symbol}` : `Price alert for ${item.symbol}`}</h2>
          <button type="button" onClick={() => ref.current?.close()} className="text-sm font-semibold text-white/60 hover:text-white">{nl ? 'Sluiten' : 'Close'}</button>
        </div>
        <div className="mt-3">
          <AlertForm
            lang={lang}
            item={item}
            price={price}
            base="USD"
            onSave={(a) => {
              A.set((l) => [...l, a])
              if (!W.has(item.key)) W.toggle(item)
            }}
          />
        </div>
        {mine.length ? (
          <ul className="mt-3 space-y-1 text-sm">
            {mine.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3">
                <span className={a.active ? '' : 'text-white/45'}>{alertText(a, lang)}</span>
                <button type="button" onClick={() => A.set((l) => l.filter((x) => x.id !== a.id))} className="shrink-0 text-xs text-white/45 hover:text-[var(--wc-red-soft)]">{nl ? 'Verwijderen' : 'Delete'}</button>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-3 text-xs text-white/45">{nl ? 'Wordt elke 2 minuten gecontroleerd zolang Winvest open is op dit apparaat. Je volgt de munt dan ook in je watchlist.' : 'Checked every 2 minutes while Winvest is open on this device. The coin is also added to your watchlist.'} <a href={paths[lang].watchlist + '#alerts'} className="font-semibold text-[var(--wc-red-soft)] hover:underline">{nl ? 'Alle alerts' : 'All alerts'} →</a></p>
      </dialog>
    </>
  )
}
