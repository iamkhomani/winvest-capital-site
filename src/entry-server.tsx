import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { SITE_URL } from './config'
import { PathContext } from './components/nav'
import { PageDataContext } from './pageData'
import coinData from '../data/coins.json'
import type { Meta } from './head'
import { routes, type Route } from './routes'

export { routes }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function head(r: Meta) {
  const canonical = SITE_URL + r.path
  const tags = [
    `<title>${esc(r.title)}</title>`,
    `<meta name="description" content="${esc(r.description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="${r.ogType ?? 'website'}" />`,
    `<meta property="og:site_name" content="Winvest Capital" />`,
    `<meta property="og:title" content="${esc(r.title)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${SITE_URL}/logo.jpeg" />`,
    `<meta property="og:locale" content="${r.lang === 'nl' ? 'nl_NL' : 'en_US'}" />`,
    `<meta name="twitter:card" content="summary" />`,
  ]
  if (r.noindex) tags.push('<meta name="robots" content="noindex" />')
  else if (r.alternate) {
    const en = r.lang === 'en' ? r.path : r.alternate
    const nl = r.lang === 'nl' ? r.path : r.alternate
    tags.push(
      `<link rel="alternate" hreflang="en" href="${SITE_URL}${en}" />`,
      `<link rel="alternate" hreflang="nl" href="${SITE_URL}${nl}" />`,
      `<link rel="alternate" hreflang="x-default" href="${SITE_URL}${en}" />`,
    )
  }
  for (const j of r.jsonLd ?? []) tags.push(`<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`)
  return tags.join('\n    ')
}

// Server-only: facts per coin for the prerendered coin pages (never in the browser bundle).
const COINS = (coinData as { coins: Record<string, unknown> }).coins

export function render(r: Route) {
  const data = r.dataKey ? (COINS[r.dataKey] ?? null) : null
  const html = renderToString(
    <StrictMode>
      <PathContext.Provider value={r.path}>
        <PageDataContext.Provider value={data}>
          <r.element />
        </PageDataContext.Provider>
      </PathContext.Provider>
    </StrictMode>,
  )
  const dataTag = data ? `\n    <script type="application/json" id="wc-page-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>` : ''
  return { html, head: head(r) + dataTag }
}
