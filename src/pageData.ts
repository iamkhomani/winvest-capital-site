// Static data for one prerendered page (for example a coin page's description and links).
// The build puts it in the HTML as <script type="application/json" id="wc-page-data">, so the
// browser hydrates with exactly the same data and nothing large ends up in the shared JS bundle.
import { createContext, useContext } from 'react'

export const PageDataContext = createContext<unknown>(null)
export const usePageData = <T,>() => useContext(PageDataContext) as T | null

export function readPageData(): unknown {
  const el = typeof document !== 'undefined' ? document.getElementById('wc-page-data') : null
  if (!el?.textContent) return null
  try {
    return JSON.parse(el.textContent)
  } catch {
    return null
  }
}
