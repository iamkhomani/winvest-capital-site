// One line under every block of market data: where it comes from, when it was last loaded and how fresh
// it is (live, refreshed every minute; daily; weekly snapshot). Also the shared loading and error text.
import type { Lang } from '../i18n'

export type Freshness = 'live' | 'delayed' | 'daily' | 'weekly' | 'onload' | 'provider'

const LABEL: Record<Lang, Record<Freshness, string>> = {
  en: { live: 'live, refreshed every minute', delayed: 'delayed, refreshed every 10 min', daily: 'updated once a day', weekly: 'weekly snapshot', onload: 'snapshot when the page opened', provider: 'live chart from the provider' },
  nl: { live: 'live, elke minuut ververst', delayed: 'vertraagd, elke 10 min ververst', daily: 'één keer per dag bijgewerkt', weekly: 'wekelijkse momentopname', onload: 'momentopname bij openen', provider: 'live grafiek van de aanbieder' },
}

export const timeOf = (at: number, lang: Lang) => {
  const d = new Date(at)
  const today = new Date().toDateString() === d.toDateString()
  const loc = lang === 'nl' ? 'nl-NL' : 'en-GB'
  return today ? d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString(loc, { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
}

export default function DataStamp({ lang, source, at, kind, className = '', updated = false }: { lang: Lang; source: string; at?: number | null; kind: Freshness; className?: string; updated?: boolean }) {
  const nl = lang === 'nl'
  const dot = kind === 'live' || kind === 'provider' ? 'bg-emerald-400' : kind === 'delayed' ? 'bg-amber-300' : 'bg-white/35'
  return (
    <p className={`flex flex-wrap items-center gap-x-1.5 text-[11px] text-white/40 ${className}`}>
      <span className={`inline-block size-1.5 rounded-full ${dot}`} aria-hidden="true" />
      <span>{nl ? 'Bron' : 'Source'}: {source}</span>
      <span aria-hidden="true">·</span>
      <span>{LABEL[lang][kind]}</span>
      {at ? (
        <>
          <span aria-hidden="true">·</span>
          <span>{updated ? (nl ? 'bijgewerkt' : 'updated') : nl ? 'geladen' : 'loaded'} {timeOf(at, lang)}</span>
        </>
      ) : null}
    </p>
  )
}

export function LoadState({ lang, error, onRetry }: { lang: Lang; error: boolean; onRetry?: () => void }) {
  const nl = lang === 'nl'
  if (!error) return <p className="mt-2 text-sm text-white/45">{nl ? 'Laden…' : 'Loading…'}</p>
  return (
    <p className="mt-2 text-sm text-[var(--wc-red-soft)]">
      {nl ? 'Kon nu niet laden (de gratis databron beperkt hoe vaak we mogen vragen).' : 'Could not load right now (the free data source limits how often we may ask).'}{' '}
      {onRetry ? <button type="button" onClick={onRetry} className="font-semibold underline">{nl ? 'Opnieuw' : 'Retry'}</button> : nl ? 'Probeer het over een minuut opnieuw.' : 'Try again in a minute.'}
    </p>
  )
}
