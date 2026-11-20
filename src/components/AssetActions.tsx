// Action row on asset (coin) pages: the next step a user wants to take, right where they decide.
// Add to portfolio (prefilled), Plan trade (position size with the live price), Check contract
// (DeFi scanner), Ask Market Whisper (Discord). Watch is the star in the page header.
import { useRef, useState } from 'react'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import LotSizeCalculator from './LotSizeCalculator'
import { Icon } from './nav'
import WhisperAsk from './WhisperAsk'
import { collect } from '../shared/whisperContext'
import { newIdeaId, saveIdeas, loadIdeas } from '../shared/ideas'

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
    ideaH: 'Save as trade idea',
    tp: 'Take profit (optional)',
    ideaNote: 'Note (optional): why this trade, what invalidates it',
    saveIdea: 'Save trade idea',
    saveNote: 'Save note only',
    saved: 'Saved. Find it in your journal under Trade ideas.',
    open: 'Open journal',
    needLevels: 'Fill in entry and stop first, or save the note only.',
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
    ideaH: 'Bewaren als trade-idee',
    tp: 'Take profit (optioneel)',
    ideaNote: 'Notitie (optioneel): waarom deze trade, wat maakt hem ongeldig',
    saveIdea: 'Trade-idee bewaren',
    saveNote: 'Alleen notitie bewaren',
    saved: 'Bewaard. Je vindt het in je journal onder Trade-ideeën.',
    open: 'Open journal',
    needLevels: 'Vul eerst entry en stop in, of bewaar alleen de notitie.',
  },
}

const chip = 'inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/40 hover:text-white'

export default function AssetActions({ lang, id, name, symbol, price, contract, kind = 'crypto' }: { lang: Lang; id: string; name: string; symbol: string; price?: number; contract?: string; kind?: 'crypto' | 'stock' }) {
  const c = copy[lang]
  const p = paths[lang]
  const planRef = useRef<HTMLDialogElement>(null)
  const [planOpen, setPlanOpen] = useState(false)
  const levels = useRef<{ entry: number; stop: number; units?: number }>({ entry: NaN, stop: NaN })
  const [tp, setTp] = useState('')
  const [ideaNote, setIdeaNote] = useState('')
  const [ideaMsg, setIdeaMsg] = useState<'' | 'saved' | 'need'>('')
  const saveIdea = (withLevels: boolean) => {
    const { entry, stop, units } = levels.current
    if (withLevels && !(entry > 0 && stop > 0 && entry !== stop)) return setIdeaMsg('need')
    const t = parseFloat(tp.replace(',', '.'))
    saveIdeas([
      {
        id: newIdeaId(), kind, assetId: id, symbol, name, quote: 'USD',
        ...(withLevels ? { direction: stop < entry ? ('buy' as const) : ('sell' as const), entry, sl: stop, tp: t > 0 ? t : undefined, qty: units } : {}),
        note: ideaNote.trim() || undefined, created: Date.now(), status: 'open' as const,
      },
      ...loadIdeas(),
    ])
    setIdeaMsg('saved')
    setTp('')
    setIdeaNote('')
  }
  const open = (d: HTMLDialogElement | null) => {
    d?.showModal()
    document.documentElement.classList.add('wc-modal')
  }
  const onClose = () => document.documentElement.classList.remove('wc-modal')
  const dlg = 'wc-dialog m-auto w-[min(34rem,calc(100vw-2rem))] max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-[var(--wc-panel)] p-5 text-white shadow-2xl shadow-black/60'

  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      <a href={`${p.portfolio}?add=${encodeURIComponent(id)}`} className={chip}><Icon name="portfolio" size={16} className="text-[var(--wc-red)]" />{c.add}</a>
      <button type="button" onClick={() => { setPlanOpen(true); open(planRef.current) }} className={chip}><Icon name="calc" size={16} className="text-[var(--wc-red)]" />{c.plan}</button>
      {contract ? <a href={`${p.scanner}?q=${encodeURIComponent(contract)}`} className={chip}><Icon name="scan" size={16} className="text-[var(--wc-red)]" />{c.check}</a> : null}
      <WhisperAsk
        lang={lang}
        kind="coin"
        subject={`${name} (${symbol})`}
        lines={() => collect(['coin', 'derivatives', 'news'])}
        questions={lang === 'nl'
          ? [`Analyseer ${name}: trend, drijfveren en risico's.`, `Verklaar de koersbeweging van ${name} in de laatste 24 uur.`, `Vat de laatste ontwikkelingen rond ${name} samen.`, `Vergelijk ${name} met Bitcoin.`]
          : [`Analyse ${name}: trend, key drivers and risks.`, `Explain the price move of ${name} over the last 24 hours.`, `Summarise the latest developments around ${name}.`, `Compare ${name} with Bitcoin.`]}
      />

      <dialog ref={planRef} onClose={() => { onClose(); setPlanOpen(false) }} aria-label={c.planH(symbol)} className={dlg}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold">{c.planH(symbol)}</h2>
          <button type="button" onClick={() => planRef.current?.close()} className="text-sm font-semibold text-white/60 hover:text-white">{c.close}</button>
        </div>
        <p className="mt-1 text-sm text-white/60">{c.planP}</p>
        <div className="mt-4">{planOpen ? <LotSizeCalculator lang={lang} preset={{ entry: price ?? 0, currency: 'USD' }} onValues={(v) => { levels.current = v }} /> : null}</div>
        <div className="mt-4 rounded-xl border border-white/10 p-3">
          <h3 className="text-sm font-semibold">{c.ideaH}</h3>
          <div className="mt-2 grid gap-2">
            <input inputMode="decimal" aria-label={c.tp} placeholder={c.tp} value={tp} onChange={(e) => setTp(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[var(--wc-red)]" />
            <textarea aria-label={c.ideaNote} placeholder={c.ideaNote} value={ideaNote} onChange={(e) => setIdeaNote(e.target.value)} rows={2} className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[var(--wc-red)]" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => saveIdea(true)} className="rounded-full bg-[var(--wc-red)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">{c.saveIdea}</button>
            <button type="button" onClick={() => saveIdea(false)} className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold hover:border-white/50">{c.saveNote}</button>
          </div>
          {ideaMsg === 'saved' ? <p className="mt-2 text-xs text-emerald-300" role="status">✓ {c.saved} <a href={p.journal + '#ideas'} className="font-semibold underline">{c.open}</a></p> : ideaMsg === 'need' ? <p className="mt-2 text-xs text-[var(--wc-red-soft)]" role="status">{c.needLevels}</p> : null}
        </div>
      </dialog>

    </div>
  )
}
