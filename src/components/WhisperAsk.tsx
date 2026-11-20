// "Ask Market Whisper" on a page: pick a question, see exactly what will be shared (editable), then copy
// it and open the AI chat in Discord (One Percent members). No AI call and no request from the website.
import { useRef, useState } from 'react'
import { DISCORD_URL } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import { packText } from '../shared/whisperContext'
import type { PackKind } from '../shared/whisperContext'
import { Icon } from './nav'

const copy = {
  en: {
    ask: 'Ask Market Whisper',
    h: 'Ask Market Whisper AI',
    q: 'Your question',
    own: 'Or type your own question',
    shared: 'What will be shared (you can edit or delete lines)',
    note: 'Only this text is copied. Nothing is sent until you paste it in Discord. No amounts, wallet addresses or account sizes.',
    go: 'Copy and open Discord',
    copied: 'Copied. Paste it in the Market Whisper AI chat in Discord.',
    failed: 'Copying failed. Select the text above and copy it yourself.',
    member: 'Answers from Market Whisper AI are part of the One Percent Club.',
    club: 'See the One Percent Club',
    close: 'Close',
    disclaimer: 'Educational only, not financial advice. The AI explains data; it does not decide for you.',
  },
  nl: {
    ask: 'Vraag Market Whisper',
    h: 'Vraag het Market Whisper AI',
    q: 'Je vraag',
    own: 'Of typ je eigen vraag',
    shared: 'Wat er wordt gedeeld (je kunt regels aanpassen of weghalen)',
    note: 'Alleen deze tekst wordt gekopieerd. Er gaat niets weg tot je hem in Discord plakt. Geen bedragen, walletadressen of accountgrootte.',
    go: 'Kopieer en open Discord',
    copied: 'Gekopieerd. Plak het in de Market Whisper AI-chat in Discord.',
    failed: 'Kopiëren lukte niet. Selecteer de tekst hierboven en kopieer hem zelf.',
    member: 'Antwoorden van Market Whisper AI horen bij de One Percent Club.',
    club: 'Bekijk de One Percent Club',
    close: 'Sluiten',
    disclaimer: 'Uitsluitend educatief, geen financieel advies. De AI legt data uit; hij beslist niet voor je.',
  },
}

export const whisperChip = 'inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/40 hover:text-white'

export default function WhisperAsk({ lang, kind, subject, lines, questions, label, className = whisperChip }: { lang: Lang; kind: PackKind; subject: string; lines: () => string[]; questions: string[]; label?: string; className?: string }) {
  const c = copy[lang]
  const ref = useRef<HTMLDialogElement>(null)
  const [qi, setQi] = useState(0)
  const [own, setOwn] = useState('')
  const [body, setBody] = useState('')
  const [state, setState] = useState<'' | 'copied' | 'failed'>('')
  const open = () => {
    setBody(lines().join('\n'))
    setState('')
    ref.current?.showModal()
    document.documentElement.classList.add('wc-modal')
  }
  const question = own.trim() || questions[qi] || ''
  const go = () => {
    const text = packText(kind, subject, body.split('\n'), question)
    const done = () => {
      setState('copied')
      window.open(DISCORD_URL, '_blank', 'noopener')
    }
    if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(text).then(done, () => setState('failed'))
    else setState('failed')
  }
  return (
    <>
      <button type="button" onClick={open} className={className}><Icon name="whisper" size={16} className="text-[var(--wc-red)]" />{label ?? c.ask}</button>
      <dialog ref={ref} onClose={() => document.documentElement.classList.remove('wc-modal')} aria-label={c.h} className="wc-dialog m-auto max-h-[90vh] w-[min(36rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/15 bg-[var(--wc-panel)] p-5 text-left text-white shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold">{c.h}</h2>
          <button type="button" onClick={() => ref.current?.close()} className="text-sm font-semibold text-white/60 hover:text-white">{c.close}</button>
        </div>
        <fieldset className="mt-3">
          <legend className="text-xs font-semibold text-white/60">{c.q}</legend>
          <div className="mt-1 grid gap-1">
            {questions.map((q, i) => (
              <label key={q} className={`flex cursor-pointer items-start gap-2 rounded-xl px-3 py-2 text-sm ${qi === i && !own.trim() ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'}`}>
                <input type="radio" name={`wq-${kind}`} checked={qi === i && !own.trim()} onChange={() => { setQi(i); setOwn('') }} className="mt-1 accent-[var(--wc-red)]" />
                <span>{q}</span>
              </label>
            ))}
          </div>
          <input value={own} onChange={(e) => setOwn(e.target.value.slice(0, 300))} placeholder={c.own} aria-label={c.own} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[var(--wc-red)]" />
        </fieldset>
        <label className="mt-4 block text-xs font-semibold text-white/60">
          {c.shared}
          <textarea value={body} onChange={(e) => setBody(e.target.value.slice(0, 3000))} rows={Math.min(10, Math.max(4, body.split('\n').length + 1))} className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 font-mono text-xs leading-relaxed text-white/85 outline-none focus:border-[var(--wc-red)]" />
        </label>
        <p className="mt-1 text-[11px] text-white/45">{c.note}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={go} disabled={!question} className="rounded-full bg-[var(--wc-red)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50">{c.go}</button>
          <a href={paths[lang].products} className="text-sm font-semibold text-white/70 hover:text-white">{c.club} →</a>
        </div>
        {state ? <p role="status" className={`mt-2 text-sm ${state === 'copied' ? 'text-emerald-300' : 'text-[var(--wc-red-soft)]'}`}>{state === 'copied' ? `✓ ${c.copied}` : c.failed}</p> : null}
        <p className="mt-3 text-xs text-white/50">{c.member}</p>
        <p className="mt-1 text-[11px] text-white/40">{c.disclaimer}</p>
      </dialog>
    </>
  )
}
