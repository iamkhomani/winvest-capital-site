// Action row on asset (coin) pages: the next step a user wants to take, right where they decide.
// Add to portfolio (prefilled), Plan trade (position size with the live price), Check contract
// (DeFi scanner), Ask Market Whisper (Discord). Watch is the star in the page header.
import { useRef, useState } from 'react'
import { DISCORD_URL } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import LotSizeCalculator from './LotSizeCalculator'
import { Icon } from './nav'

const copy = {
  en: {
    add: 'Add to portfolio',
    plan: 'Plan trade',
    check: 'Check contract',
    ask: 'Ask Market Whisper',
    close: 'Close',
    planH: (s: string) => `Plan a ${s} trade`,
    planP: 'Position size from your account, risk and stop. The live price is filled in as entry; change it to your own level.',
    askH: 'Ask Market Whisper AI',
    askP: (n: string) => `Market Whisper AI answers in our Discord (One Percent Club). We copied a question about ${n}; paste it in the AI chat.`,
    question: (n: string, s: string) => `What is your analysis of ${n} (${s}) right now? Key levels, trend and risks.`,
    copied: 'Question copied',
    openDiscord: 'Open Discord',
    what: 'What is Market Whisper?',
    note: 'Educational only, not financial advice.',
  },
  nl: {
    add: 'Toevoegen aan portfolio',
    plan: 'Trade plannen',
    check: 'Contract checken',
    ask: 'Vraag Market Whisper',
    close: 'Sluiten',
    planH: (s: string) => `${s}-trade plannen`,
    planP: 'Positiegrootte op basis van je account, risico en stop. De actuele prijs staat als instap ingevuld; pas die aan naar je eigen niveau.',
    askH: 'Vraag het Market Whisper AI',
    askP: (n: string) => `Market Whisper AI antwoordt in onze Discord (One Percent Club). We hebben een vraag over ${n} gekopieerd; plak die in de AI-chat.`,
    question: (n: string, s: string) => `Wat is je analyse van ${n} (${s}) op dit moment? Belangrijke niveaus, trend en risico's.`,
    copied: 'Vraag gekopieerd',
    openDiscord: 'Open Discord',
    what: 'Wat is Market Whisper?',
    note: 'Uitsluitend educatief, geen financieel advies.',
  },
}

const chip = 'inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/40 hover:text-white'

export default function AssetActions({ lang, id, name, symbol, price, contract }: { lang: Lang; id: string; name: string; symbol: string; price?: number; contract?: string }) {
  const c = copy[lang]
  const p = paths[lang]
  const planRef = useRef<HTMLDialogElement>(null)
  const askRef = useRef<HTMLDialogElement>(null)
  const [planOpen, setPlanOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const open = (d: HTMLDialogElement | null) => {
    d?.showModal()
    document.documentElement.classList.add('wc-modal')
  }
  const onClose = () => document.documentElement.classList.remove('wc-modal')
  const ask = () => {
    setCopied(false)
    void navigator.clipboard?.writeText(c.question(name, symbol)).then(() => setCopied(true)).catch(() => {})
    open(askRef.current)
  }
  const dlg = 'wc-dialog m-auto w-[min(34rem,calc(100vw-2rem))] max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-[var(--wc-panel)] p-5 text-white shadow-2xl shadow-black/60'

  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      <a href={`${p.portfolio}?add=${encodeURIComponent(id)}`} className={chip}><Icon name="portfolio" size={16} className="text-[var(--wc-red)]" />{c.add}</a>
      <button type="button" onClick={() => { setPlanOpen(true); open(planRef.current) }} className={chip}><Icon name="calc" size={16} className="text-[var(--wc-red)]" />{c.plan}</button>
      {contract ? <a href={`${p.scanner}?q=${encodeURIComponent(contract)}`} className={chip}><Icon name="scan" size={16} className="text-[var(--wc-red)]" />{c.check}</a> : null}
      <button type="button" onClick={ask} className={chip}><Icon name="whisper" size={16} className="text-[var(--wc-red)]" />{c.ask}</button>

      <dialog ref={planRef} onClose={() => { onClose(); setPlanOpen(false) }} aria-label={c.planH(symbol)} className={dlg}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold">{c.planH(symbol)}</h2>
          <button type="button" onClick={() => planRef.current?.close()} className="text-sm font-semibold text-white/60 hover:text-white">{c.close}</button>
        </div>
        <p className="mt-1 text-sm text-white/60">{c.planP}</p>
        <div className="mt-4">{planOpen ? <LotSizeCalculator lang={lang} preset={price ? { entry: price, currency: 'USD' } : undefined} /> : null}</div>
      </dialog>

      <dialog ref={askRef} onClose={onClose} aria-label={c.askH} className={dlg}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold">{c.askH}</h2>
          <button type="button" onClick={() => askRef.current?.close()} className="text-sm font-semibold text-white/60 hover:text-white">{c.close}</button>
        </div>
        <p className="mt-2 text-sm text-white/70">{c.askP(name)}</p>
        <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/85">“{c.question(name, symbol)}”</p>
        {copied ? <p className="mt-2 text-xs text-emerald-300">✓ {c.copied}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={DISCORD_URL} target="_blank" rel="noopener" className="rounded-full bg-[var(--wc-red)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110">{c.openDiscord}</a>
          <a href={p.whisper} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold hover:border-white/50">{c.what}</a>
        </div>
        <p className="mt-3 text-xs text-white/40">{c.note}</p>
      </dialog>
    </div>
  )
}
