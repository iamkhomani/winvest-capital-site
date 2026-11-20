// Market news: the latest headlines from publisher RSS feeds (crypto, forex and macro, stocks),
// the same sources Market Whisper posts in Discord. Loaded through our Cloudflare Worker (/news),
// which fetches the feeds server-side. Only headline, source, time and a link to the publisher.
import { useEffect, useState } from 'react'
import { DEFI_PROXY_URL, DISCORD_URL } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import { LinkTabs, PageHeader, pageWrap, tabCls } from '../components/kit'

const API = (DEFI_PROXY_URL || 'https://winvest-defi-proxy.helijl.workers.dev') + '/news'

type Item = { id: string; category: 'crypto' | 'forex' | 'stocks'; title: string; url: string; source: string; published: number }
type Cat = 'all' | Item['category']

export const newsCopy = {
  en: {
    metaTitle: 'Crypto, Forex and Stock Market News Today | Winvest Capital',
    description: 'The latest crypto, forex, macro and stock market headlines from leading publishers in one overview, refreshed every 10 minutes. Free on Winvest Capital.',
    h1: 'Market news',
    intro: 'The latest headlines on crypto, forex and macro, and stocks from leading publishers, in one place. Refreshed every 10 minutes. Click a headline to read the full article at the source.',
    cats: { all: 'All', crypto: 'Crypto', forex: 'Forex & macro', stocks: 'Stocks' } as Record<Cat, string>,
    loading: 'Loading headlines…',
    error: 'The headlines could not be loaded right now. Please try again in a few minutes.',
    empty: 'No headlines in this category right now.',
    ago: (m: number) => (m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.floor(m / 60)} h ago` : `${Math.floor(m / 1440)} d ago`),
    calH: 'What is on the calendar?',
    calP: 'Rate decisions, inflation and jobs data move markets. See this week’s key events.',
    calBtn: 'Economic calendar',
    mwH: 'News in Discord, with context',
    mwP: 'Market Whisper AI posts these headlines in the free Discord as they come in. One Percent Club members can ask what a headline means for a market.',
    mwBtn: 'Join the Discord for free',
    sources: 'Sources: Cointelegraph, CoinDesk, Decrypt, The Block, FXStreet, investingLive, Investing.com, CNBC and MarketWatch. Headlines belong to their publishers. Educational only, not financial advice.',
  },
  nl: {
    metaTitle: 'Crypto-, forex- en beursnieuws van vandaag | Winvest Capital',
    description: 'Het laatste nieuws over crypto, forex, macro en aandelen van toonaangevende uitgevers in één overzicht, elke 10 minuten ververst. Gratis op Winvest Capital.',
    h1: 'Marktnieuws',
    intro: 'De laatste krantenkoppen over crypto, forex en macro, en aandelen van toonaangevende uitgevers, op één plek. Elke 10 minuten ververst. Klik op een kop om het hele artikel bij de bron te lezen. De koppen zijn in het Engels.',
    cats: { all: 'Alles', crypto: 'Crypto', forex: 'Forex & macro', stocks: 'Aandelen' } as Record<Cat, string>,
    loading: 'Nieuws laden…',
    error: 'Het nieuws kon nu niet worden geladen. Probeer het over een paar minuten opnieuw.',
    empty: 'Op dit moment geen nieuws in deze categorie.',
    ago: (m: number) => (m < 1 ? 'zojuist' : m < 60 ? `${m} min geleden` : m < 1440 ? `${Math.floor(m / 60)} uur geleden` : `${Math.floor(m / 1440)} d geleden`),
    calH: 'Wat staat er op de kalender?',
    calP: 'Rentebesluiten en cijfers over inflatie en werkgelegenheid bewegen de markten. Bekijk de belangrijkste events van deze week.',
    calBtn: 'Economische kalender',
    mwH: 'Nieuws in Discord, met duiding',
    mwP: 'Market Whisper AI plaatst dit nieuws in de gratis Discord zodra het binnenkomt. Leden van de One Percent Club vragen wat een bericht betekent voor een markt.',
    mwBtn: 'Word gratis lid van de Discord',
    sources: 'Bronnen: Cointelegraph, CoinDesk, Decrypt, The Block, FXStreet, investingLive, Investing.com, CNBC en MarketWatch. De koppen zijn van hun uitgevers. Uitsluitend educatief, geen financieel advies.',
  },
}

const DOT: Record<Item['category'], string> = { crypto: '#F7931A', forex: '#38BDF8', stocks: '#34D399' }

export default function News({ lang }: { lang: Lang }) {
  const c = newsCopy[lang]
  const p = paths[lang]
  const [items, setItems] = useState<Item[] | null>(null)
  const [error, setError] = useState(false)
  const [cat, setCat] = useState<Cat>('all')
  const [now, setNow] = useState(0)

  useEffect(() => {
    let alive = true
    const load = () =>
      fetch(API, { signal: AbortSignal.timeout(20000) })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((j: { items: Item[] }) => {
          if (!alive) return
          setItems(j.items.filter((x) => /^https:\/\//.test(x.url)))
          setError(false)
          setNow(Date.now())
        })
        .catch(() => alive && setError(true))
    void load()
    const t = setInterval(() => !document.hidden && void load(), 5 * 60_000)
    const tick = setInterval(() => setNow(Date.now()), 60_000)
    return () => {
      alive = false
      clearInterval(t)
      clearInterval(tick)
    }
  }, [])

  const shown = (items ?? []).filter((x) => cat === 'all' || x.category === cat)

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/12 blur-[120px]" />
      <div className={pageWrap()}>
        <PageHeader home={p.home} title={c.h1} intro={c.intro} />
        <LinkTabs className="mt-6" label={lang === 'nl' ? 'Markten' : 'Markets'} items={[{ href: p.markets + '#crypto', label: 'Crypto', on: false }, { href: p.markets + '#stocks', label: lang === 'nl' ? 'Aandelen' : 'Stocks', on: false }, { href: p.news, label: lang === 'nl' ? 'Nieuws' : 'News', on: true }, { href: p.markets + '#calendar', label: lang === 'nl' ? 'Kalender' : 'Calendar', on: false }]} />

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div role="tablist" className="flex gap-1 overflow-x-auto rounded-full border border-white/15 p-1 sm:inline-flex">
              {(['all', 'crypto', 'forex', 'stocks'] as Cat[]).map((k) => (
                <button key={k} type="button" role="tab" aria-selected={cat === k} onClick={() => setCat(k)} className={tabCls(cat === k)}>
                  {c.cats[k]}
                </button>
              ))}
            </div>
            {!items && !error ? <p className="mt-6 text-white/60">{c.loading}</p> : null}
            {error && !items ? <p className="mt-6 text-[var(--wc-red-soft)]">{c.error}</p> : null}
            {items && !shown.length ? <p className="mt-6 text-white/60">{c.empty}</p> : null}
            <ul className="mt-5 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.02]">
              {shown.slice(0, 60).map((x) => (
                <li key={x.id}>
                  <a href={x.url} target="_blank" rel="noopener nofollow" className="block px-4 py-3.5 transition hover:bg-white/[0.04]">
                    <span className="block font-medium leading-snug text-white">{x.title}</span>
                    <span className="mt-1 flex items-center gap-2 text-xs text-white/50">
                      <span className="inline-block size-2 rounded-full" style={{ background: DOT[x.category] }} aria-hidden="true" />
                      {c.cats[x.category]} · {x.source} · {now ? c.ago(Math.max(0, Math.floor((now - x.published) / 60000))) : ''}
                      <span className="ml-auto text-white/30" aria-hidden="true">↗</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-white/40">{c.sources}</p>
          </section>

          <aside className="grid content-start gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="font-semibold">{c.calH}</h2>
              <p className="mt-1 text-sm text-white/60">{c.calP}</p>
              <a href={p.home + '#calendar'} className="mt-3 inline-block rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition hover:border-white/50">{c.calBtn}</a>
            </div>
            <div className="rounded-2xl border border-[var(--wc-red)]/40 bg-[var(--wc-red)]/[0.06] p-5">
              <h2 className="font-semibold">{c.mwH}</h2>
              <p className="mt-1 text-sm text-white/65">{c.mwP}</p>
              <a href={DISCORD_URL} className="mt-3 inline-block rounded-full bg-[var(--wc-red)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">{c.mwBtn}</a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
