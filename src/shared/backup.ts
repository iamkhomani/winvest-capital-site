// One backup file for everything personal on this device: portfolios, the shared watchlist, alerts,
// trade ideas, calculator settings, dashboard layout, and the trading journal with its screenshots.
// Nothing is sent anywhere: the file is made and read in the browser.
import { allImages, blobToDataUrl, dataUrlToBlob, isSafeImageDataUrl, loadState, putImage, saveState } from '../journal/db'
import type { JournalState } from '../journal/types'

// User data only; caches, theme and layout state are left out.
const KEEP = /^wc-(portfolio-v1(:[\w-]{1,40})?|portfolios|watchlist-v1|alerts-v1|ideas-v1|settings-v1|dash-v1|read-lesson)$/

type Backup = { app: 'winvest-backup'; version: 1; created: string; local: Record<string, string>; journal?: { state: JournalState; images: Record<string, string> } }

export async function exportAll(): Promise<{ bytes: number }> {
  const local: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && KEEP.test(k)) local[k] = localStorage.getItem(k) ?? ''
  }
  let journal: Backup['journal']
  try {
    const state = await loadState()
    const imgs = await allImages()
    const images: Record<string, string> = {}
    for (const [id, b] of Object.entries(imgs)) images[id] = await blobToDataUrl(b)
    if (state.trades.length || state.accounts.length) journal = { state, images }
  } catch { /* no journal on this device */ }
  const out: Backup = { app: 'winvest-backup', version: 1, created: new Date().toISOString(), local, journal }
  const text = JSON.stringify(out)
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  a.download = `winvest-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  return { bytes: text.length }
}

export type ImportResult = { ok: true; keys: number; trades: number; images: number } | { ok: false }

/** Restores a backup made with exportAll. Replaces the same data on this device; other data stays. */
export async function importAll(file: File): Promise<ImportResult> {
  let b: Backup
  try {
    b = JSON.parse(await file.text())
  } catch {
    return { ok: false }
  }
  if (!b || b.app !== 'winvest-backup' || b.version !== 1 || typeof b.local !== 'object') return { ok: false }
  let keys = 0
  for (const [k, v] of Object.entries(b.local)) {
    if (!KEEP.test(k) || typeof v !== 'string' || v.length > 5_000_000) continue
    try {
      JSON.parse(v === '1' ? '1' : v) // every kept value is JSON (or the flag "1")
      localStorage.setItem(k, v)
      keys++
    } catch { /* skip a broken value */ }
  }
  let trades = 0
  let images = 0
  const j = b.journal
  if (j && j.state && j.state.app === 'winvest-journal' && Array.isArray(j.state.trades) && Array.isArray(j.state.accounts)) {
    await saveState({ ...j.state, cash: Array.isArray(j.state.cash) ? j.state.cash : [] })
    trades = j.state.trades.length
    for (const [id, url] of Object.entries(j.images ?? {})) {
      if (typeof url !== 'string' || !isSafeImageDataUrl(url) || !/^[\w-]{1,80}$/.test(id)) continue
      await putImage(id, await dataUrlToBlob(url))
      images++
    }
  }
  window.dispatchEvent(new Event('wc-watchlist'))
  return { ok: true, keys, trades, images }
}
