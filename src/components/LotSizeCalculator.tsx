import { useEffect, useMemo, useState } from 'react'
import type { Lang } from '../i18n'

// Instruments: pip size and contract size per standard lot. Pip value per lot is in the quote currency.
const INSTRUMENTS = [
  { id: 'EURUSD', label: 'EUR/USD', quote: 'USD', pip: 0.0001, contract: 100000 },
  { id: 'GBPUSD', label: 'GBP/USD', quote: 'USD', pip: 0.0001, contract: 100000 },
  { id: 'AUDUSD', label: 'AUD/USD', quote: 'USD', pip: 0.0001, contract: 100000 },
  { id: 'NZDUSD', label: 'NZD/USD', quote: 'USD', pip: 0.0001, contract: 100000 },
  { id: 'USDJPY', label: 'USD/JPY', quote: 'JPY', pip: 0.01, contract: 100000 },
  { id: 'USDCHF', label: 'USD/CHF', quote: 'CHF', pip: 0.0001, contract: 100000 },
  { id: 'USDCAD', label: 'USD/CAD', quote: 'CAD', pip: 0.0001, contract: 100000 },
  { id: 'EURGBP', label: 'EUR/GBP', quote: 'GBP', pip: 0.0001, contract: 100000 },
  { id: 'EURJPY', label: 'EUR/JPY', quote: 'JPY', pip: 0.01, contract: 100000 },
  { id: 'GBPJPY', label: 'GBP/JPY', quote: 'JPY', pip: 0.01, contract: 100000 },
  { id: 'XAUUSD', label: 'XAU/USD (Gold)', quote: 'USD', pip: 0.1, contract: 100 },
] as const

const ACCOUNT_CURRENCIES = ['EUR', 'USD', 'GBP'] as const
type Rates = Record<string, number>

const copy = {
  en: {
    fx: 'Forex & gold',
    units: 'Crypto & stocks',
    balance: 'Account balance',
    currency: 'Account currency',
    risk: 'Risk per trade (%)',
    instrument: 'Instrument',
    stop: 'Stop loss (pips)',
    entry: 'Entry price',
    stopPrice: 'Stop loss price',
    rate: (q: string, a: string) => `Exchange rate 1 ${q} = … ${a}`,
    rateNote: (d: string) => `ECB reference rate of ${d}. You can adjust it.`,
    rateFail: 'Could not load the exchange rate. Enter it yourself.',
    riskAmount: 'Amount at risk',
    lots: 'Lot size',
    lotsSub: 'standard lots',
    pipValue: 'Pip value per standard lot',
    breakdown: (u: string) => `${u} units · mini lots ×10 · micro lots ×100`,
    unitsRes: 'Position size',
    unitsSub: 'units / coins / shares',
    posValue: 'Position value',
    exposure: 'Exposure vs. account',
    invalid: 'Fill in all fields with positive numbers.',
    sameStop: 'Entry and stop loss cannot be the same.',
    priceNote: 'Enter prices in your account currency. Works for long and short positions.',
    goldNote: 'Gold: 1 lot = 100 oz and 1 pip = 0.10 USD price move. Check your broker, contract sizes can differ.',
    disclaimer: 'For education only. Results are estimates and exclude spread, commission and swap.',
  },
  nl: {
    fx: 'Forex & goud',
    units: 'Crypto & aandelen',
    balance: 'Accountsaldo',
    currency: 'Valuta van je account',
    risk: 'Risico per trade (%)',
    instrument: 'Instrument',
    stop: 'Stop-loss (pips)',
    entry: 'Instapprijs',
    stopPrice: 'Stop-lossprijs',
    rate: (q: string, a: string) => `Wisselkoers 1 ${q} = … ${a}`,
    rateNote: (d: string) => `ECB-referentiekoers van ${d}. Je kunt hem aanpassen.`,
    rateFail: 'Wisselkoers kon niet worden geladen. Vul hem zelf in.',
    riskAmount: 'Bedrag dat je riskeert',
    lots: 'Lotgrootte',
    lotsSub: 'standaard lots',
    pipValue: 'Pipwaarde per standaard lot',
    breakdown: (u: string) => `${u} eenheden · mini lots ×10 · micro lots ×100`,
    unitsRes: 'Positiegrootte',
    unitsSub: 'eenheden / munten / aandelen',
    posValue: 'Positiewaarde',
    exposure: 'Blootstelling t.o.v. account',
    invalid: 'Vul alle velden in met positieve getallen.',
    sameStop: 'Instapprijs en stop-loss mogen niet gelijk zijn.',
    priceNote: 'Vul prijzen in de valuta van je account in. Werkt voor long- en shortposities.',
    goldNote: 'Goud: 1 lot = 100 oz en 1 pip = 0,10 USD koersbeweging. Check je broker, contractgroottes kunnen verschillen.',
    disclaimer: 'Uitsluitend educatief. Uitkomsten zijn schattingen, exclusief spread, commissie en swap.',
  },
}

const num = (s: string) => Number(s.replace(',', '.'))

function Field({ label, value, onChange, suffix, id }: { label: string; value: string; onChange: (v: string) => void; suffix?: string; id: string }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm text-white/60">{label}</span>
      <span className="mt-1.5 flex items-center rounded-xl border border-white/15 bg-black/40 focus-within:border-[var(--wc-red)]">
        <input id={id} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent px-4 py-3 text-white outline-none" />
        {suffix && <span className="pr-4 text-sm text-white/40">{suffix}</span>}
      </span>
    </label>
  )
}

function Select({ label, value, onChange, options, id }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[]; id: string }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm text-white/60">{label}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none focus:border-[var(--wc-red)]">
        {options.map((o) => (
          <option key={o.v} value={o.v} className="bg-[#111113]">{o.l}</option>
        ))}
      </select>
    </label>
  )
}

export default function LotSizeCalculator({ lang }: { lang: Lang }) {
  const c = copy[lang]
  const locale = lang === 'nl' ? 'nl-NL' : 'en-US'
  const [mode, setMode] = useState<'fx' | 'units'>('fx')
  const [balance, setBalance] = useState('10000')
  const [currency, setCurrency] = useState<string>(lang === 'nl' ? 'EUR' : 'USD')
  const [risk, setRisk] = useState('1')
  const [instrument, setInstrument] = useState('EURUSD')
  const [stopPips, setStopPips] = useState('20')
  const [entry, setEntry] = useState('60000')
  const [stopPrice, setStopPrice] = useState('59000')
  const [rates, setRates] = useState<{ date: string; r: Rates } | null>(null)
  const [rateFail, setRateFail] = useState(false)
  const [rateOverride, setRateOverride] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP,JPY,CHF,CAD,AUD,NZD')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: { date: string; rates: Rates }) => setRates({ date: j.date, r: { USD: 1, ...j.rates } }))
      .catch(() => setRateFail(true))
  }, [])

  const inst = INSTRUMENTS.find((i) => i.id === instrument)!
  const autoRate = inst.quote === currency ? 1 : rates ? rates.r[currency] / rates.r[inst.quote] : NaN
  useEffect(() => setRateOverride(null), [instrument, currency])
  const rate = rateOverride !== null ? num(rateOverride) : autoRate

  const money = (v: number, cur = currency) => new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(v)
  const n = (v: number, d = 2) => new Intl.NumberFormat(locale, { maximumFractionDigits: d }).format(v)

  const riskAmount = num(balance) * (num(risk) / 100)
  const fx = useMemo(() => {
    const sl = num(stopPips)
    if (!(riskAmount > 0 && sl > 0 && rate > 0)) return null
    const pipValue = inst.pip * inst.contract * rate // per standard lot, in account currency
    const lots = riskAmount / (sl * pipValue)
    return { pipValue, lots: Math.floor(lots * 100) / 100, exactUnits: lots * inst.contract }
  }, [riskAmount, stopPips, rate, inst])

  const units = useMemo(() => {
    const e = num(entry)
    const s = num(stopPrice)
    if (!(riskAmount > 0 && e > 0 && s > 0)) return null
    if (e === s) return 'same' as const
    const u = riskAmount / Math.abs(e - s)
    return { u, value: u * e, exposure: (u * e) / num(balance) }
  }, [riskAmount, entry, stopPrice, balance])

  const tab = (m: 'fx' | 'units', label: string) => (
    <button type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === m ? 'bg-[var(--wc-red)] text-white' : 'text-white/60 hover:text-white'}`}>
      {label}
    </button>
  )

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] shadow-[0_30px_80px_-40px_var(--wc-red)]">
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5 p-6 sm:p-8">
          <div className="flex rounded-full border border-white/10 bg-black/40 p-1">
            {tab('fx', c.fx)}
            {tab('units', c.units)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="lsc-balance" label={c.balance} value={balance} onChange={setBalance} />
            <Select id="lsc-cur" label={c.currency} value={currency} onChange={setCurrency} options={ACCOUNT_CURRENCIES.map((v) => ({ v, l: v }))} />
          </div>
          <Field id="lsc-risk" label={c.risk} value={risk} onChange={setRisk} suffix="%" />
          {mode === 'fx' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select id="lsc-inst" label={c.instrument} value={instrument} onChange={setInstrument} options={INSTRUMENTS.map((i) => ({ v: i.id, l: i.label }))} />
                <Field id="lsc-sl" label={c.stop} value={stopPips} onChange={setStopPips} suffix="pips" />
              </div>
              {inst.quote !== currency && (
                <div>
                  <Field id="lsc-rate" label={c.rate(inst.quote, currency)} value={rateOverride ?? (Number.isFinite(autoRate) ? String(Number(autoRate.toPrecision(6))) : '')} onChange={setRateOverride} />
                  <p className="mt-1.5 text-xs text-white/40">{rateFail ? c.rateFail : rates ? c.rateNote(rates.date) : '…'}</p>
                </div>
              )}
              {instrument === 'XAUUSD' && <p className="text-xs text-white/45">{c.goldNote}</p>}
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="lsc-entry" label={c.entry} value={entry} onChange={setEntry} />
                <Field id="lsc-stop" label={c.stopPrice} value={stopPrice} onChange={setStopPrice} />
              </div>
              <p className="text-xs text-white/45">{c.priceNote}</p>
            </>
          )}
        </div>

        <div className="relative flex min-h-[320px] flex-col justify-center gap-5 border-t border-white/10 bg-[var(--wc-red)]/[0.07] p-6 sm:p-8 md:border-t-0 md:border-l" aria-live="polite">
          <div className="pointer-events-none absolute -top-20 -right-20 size-60 rounded-full bg-[var(--wc-red)]/20 blur-3xl" />
          {mounted && (<>
          <div className="relative">
            <p className="text-sm text-white/60">{c.riskAmount}</p>
            <p className="mt-1 text-2xl font-bold">{riskAmount > 0 ? money(riskAmount) : '—'}</p>
          </div>
          {mode === 'fx' ? (
            fx ? (
              <div className="relative space-y-5">
                <div>
                  <p className="text-sm text-white/60">{c.lots}</p>
                  <p className="mt-1 text-5xl font-bold tracking-tight text-[var(--wc-red)]">{n(fx.lots)}</p>
                  <p className="mt-1 text-sm text-white/50">{c.lotsSub}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="text-white/50">{c.pipValue}</p>
                    <p className="mt-1 font-semibold">{money(fx.pipValue)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <p className="text-white/50">Mini / micro</p>
                    <p className="mt-1 font-semibold">{n(fx.lots * 10, 1)} / {n(fx.lots * 100, 0)}</p>
                  </div>
                </div>
                <p className="text-xs text-white/40">{c.breakdown(n(fx.exactUnits, 0))}</p>
              </div>
            ) : (
              <p className="relative text-white/60">{c.invalid}</p>
            )
          ) : units === 'same' ? (
            <p className="relative text-white/60">{c.sameStop}</p>
          ) : units ? (
            <div className="relative space-y-5">
              <div>
                <p className="text-sm text-white/60">{c.unitsRes}</p>
                <p className="mt-1 text-5xl font-bold tracking-tight text-[var(--wc-red)]">{n(units.u, units.u < 1 ? 6 : 4)}</p>
                <p className="mt-1 text-sm text-white/50">{c.unitsSub}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-white/50">{c.posValue}</p>
                  <p className="mt-1 font-semibold">{money(units.value)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-white/50">{c.exposure}</p>
                  <p className="mt-1 font-semibold">{n(units.exposure * 100, 1)}%</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="relative text-white/60">{c.invalid}</p>
          )}
          </>)}
          <p className="relative text-xs text-white/35">{c.disclaimer}</p>
        </div>
      </div>
    </div>
  )
}
