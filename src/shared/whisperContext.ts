// Context packs for Market Whisper AI (decision 44, route A). A page turns data it ALREADY shows into a
// short, sourced text block; the visitor previews it and copies it to the AI chat in Discord. Building a
// pack makes no network request and no AI call. Personal data only as percentages, never amounts,
// addresses or account sizes. The bot reads the block as data (never instructions) and checks every
// number in its answer against it.
import { useEffect } from 'react'

export type PackKind = 'coin' | 'portfolio' | 'scanner' | 'journal'

// Sections a page registers from different components (e.g. coin facts, derivatives, headlines).
const parts = new Map<string, string[]>()

export function setPart(key: string, lines: string[] | null) {
  if (lines && lines.length) parts.set(key, lines)
  else parts.delete(key)
}

/** Register a section while the component is on screen. */
export function usePart(key: string, lines: string[] | null) {
  const sig = lines ? lines.join('\n') : ''
  useEffect(() => {
    setPart(key, lines)
    return () => setPart(key, null)
  }, [key, sig]) // eslint-disable-line react-hooks/exhaustive-deps
}

export const collect = (keys: string[]) => keys.flatMap((k) => parts.get(k) ?? [])

const clean = (s: string) => s.replace(/[[\]\r]/g, '').replace(/\s+\n/g, '\n').trim()

/** The block that is copied. English, so the bot and its number check read it the same way every time. */
export function packText(kind: PackKind, subject: string, lines: string[], question: string) {
  const t = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
  return [`[WINVEST CONTEXT v1 | ${kind} | ${clean(subject)} | ${t}]`, ...lines.map(clean).filter(Boolean), `Question: ${clean(question)}`, '[END WINVEST CONTEXT]'].join('\n')
}

// Number formatting for packs (always en-US, no locale commas).
export const n = (v: number | undefined | null, digits = 2) => (v === undefined || v === null || !Number.isFinite(v) ? 'n/a' : v.toLocaleString('en-US', { maximumFractionDigits: digits }))
export const p = (v: number | undefined | null, digits = 1) => (v === undefined || v === null || !Number.isFinite(v) ? 'n/a' : `${v >= 0 ? '+' : ''}${v.toFixed(digits)}%`)
export const big = (v: number | undefined | null) =>
  v === undefined || v === null || !Number.isFinite(v) ? 'n/a' : v >= 1e12 ? `${(v / 1e12).toFixed(2)}T` : v >= 1e9 ? `${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : Math.round(v).toLocaleString('en-US')
export const hhmm = (at = Date.now()) => new Date(at).toISOString().slice(11, 16) + ' UTC'
