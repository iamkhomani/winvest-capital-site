// Price alert form (above, below, or a % move in 24h), used on the watchlist page and on coin pages.
import { useState } from 'react'
import { btn } from '../components/kit'
import type { Lang } from '../i18n'
import type { Currency } from '../portfolio/store'
import { newAlertId } from './alerts'
import type { AlertKind, PriceAlert } from './alerts'
import type { WatchItem } from './watchlist'

const copy = {
  en: { alertsH: 'Price alerts', above: 'Price above', below: 'Price below', move: 'Moves more than (24h, %)', save: 'Set alert', bad: 'Enter a number above 0.' },
  nl: { alertsH: 'Prijsalerts', above: 'Prijs boven', below: 'Prijs onder', move: 'Beweegt meer dan (24u, %)', save: 'Alert instellen', bad: 'Vul een getal boven 0 in.' },
}

export default function AlertForm({ lang, item, price, base, onSave }: { lang: Lang; item: WatchItem; price?: number; base: Currency; onSave: (a: PriceAlert) => void }) {
  const c = copy[lang]
  const [type, setType] = useState<AlertKind>('above')
  const sig = (v: number) => String(Number(v.toPrecision(v >= 1 ? 6 : 4)))
  const preset = (t: AlertKind) => (t === 'move' ? '5' : price ? sig(price * (t === 'above' ? 1.05 : 0.95)) : '')
  const [value, setValue] = useState(preset('above'))
  const [err, setErr] = useState(false)
  const pick = (t: AlertKind) => { setType(t); setValue(preset(t)); setErr(false) }
  const save = () => {
    const v = parseFloat(value.replace(',', '.'))
    if (!(v > 0)) return setErr(true)
    onSave({ id: newAlertId(), key: item.key, kind: item.kind, assetId: item.id, symbol: item.symbol, name: item.name, type, value: v, currency: base, created: Date.now(), active: true })
  }
  return (
    <div className="basis-full rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={c.alertsH}>
        {(['above', 'below', 'move'] as AlertKind[]).map((t) => (
          <button key={t} type="button" role="radio" aria-checked={type === t} onClick={() => pick(t)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${type === t ? 'bg-white text-black' : 'border border-white/15 text-white/70 hover:text-white'}`}>{c[t]}</button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input inputMode="decimal" aria-label={c[type]} value={value} onChange={(e) => { setValue(e.target.value); setErr(false) }} className="w-36 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[var(--wc-red)]" />
        <span className="text-xs text-white/50">{type === 'move' ? '%' : base}</span>
        <button type="button" onClick={save} className={btn('primary', 'sm')}>{c.save}</button>
      </div>
      {err ? <p className="mt-1 text-xs text-[var(--wc-red-soft)]">{c.bad}</p> : null}
    </div>
  )
}
