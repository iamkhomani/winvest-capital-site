// The coins that have their own prerendered page (/markets/bitcoin/), from the weekly data snapshot.
import index from '../data/coin-index.json'
import type { Lang } from '../i18n'
import { paths } from '../paths'

export type CoinIndexEntry = { id: string; name: string; symbol: string; rank: number }
export const COIN_INDEX = index as CoinIndexEntry[]
const HAS_PAGE = new Set(COIN_INDEX.map((c) => c.id))

/** Link to a coin: its own page when it has one, otherwise the general coin page with ?id=. */
export const coinHref = (lang: Lang, id: string) =>
  HAS_PAGE.has(id) ? `${paths[lang].markets}${id}/` : `${paths[lang].markets}coin/?id=${encodeURIComponent(id)}`
