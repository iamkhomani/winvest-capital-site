import type { ReactElement } from 'react'
import Layout from './components/Layout'
import { PRICE, SITE_URL, SOCIALS } from './config'
import { articles, NEW_IDS, PUBLISHED, UPDATED } from './content/articles'
import { legal } from './content/legal'
import type { Meta } from './head'
import type { Lang } from './i18n'
import Article from './pages/Article'
import CalculatorPage, { calcCopy } from './pages/CalculatorPage'
import Home, { homeCopy } from './pages/Home'
import LearnIndex, { learnCopy } from './pages/LearnIndex'
import Legal from './pages/Legal'
import Partners, { partnersCopy } from './pages/Partners'
import DefiScanner, { scannerCopy } from './pages/DefiScanner'
import Markets, { marketsCopy } from './pages/Markets'
import MarketWhisper, { whisperCopy } from './pages/MarketWhisper'
import Portfolio, { portfolioCopy } from './pages/Portfolio'
import Products, { productsCopy } from './pages/Products'
import Terminal, { terminalCopy } from './pages/Terminal'
import Journal from './pages/Journal'
import { journalCopy } from './journal/copy'
import Welcome from './pages/Welcome'
import { paths } from './paths'

export type Route = Meta & { element: () => ReactElement }

const LANGS: Lang[] = ['en', 'nl']
const other = (l: Lang): Lang => (l === 'en' ? 'nl' : 'en')
const url = (p: string) => SITE_URL + p

const org = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Winvest Capital',
  url: SITE_URL + '/',
  logo: url('/logo.jpeg'),
  sameAs: SOCIALS.map((s) => s.url),
}

const faqLd = (faq: [string, string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
})

const crumbs = (items: [string, string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url(p) })),
})

function wrap(lang: Lang, alternate: string | undefined, page: ReactElement) {
  return () => (
    <Layout lang={lang} alternate={alternate}>
      {page}
    </Layout>
  )
}

export const routes: Route[] = LANGS.flatMap((lang): Route[] => {
  const p = paths[lang]
  const o = paths[other(lang)]
  const L = lang === 'nl'
  const home: Route = {
    path: p.home,
    alternate: o.home,
    lang,
    title: homeCopy[lang].title,
    description: homeCopy[lang].description,
    jsonLd: [
      { '@context': 'https://schema.org', '@graph': [org, { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL + '/', name: 'Winvest Capital', inLanguage: lang, publisher: { '@id': org['@id'] } }] },
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'One Percent Club',
        brand: { '@type': 'Brand', name: 'Winvest Capital' },
        description: L ? 'Eenmalige upgrade van de Winvest Capital community.' : 'One-time upgrade of the Winvest Capital community.',
        offers: { '@type': 'Offer', price: PRICE.replace(/[^0-9.]/g, ''), priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: url(p.home) + '#membership' },
      },
      faqLd(homeCopy[lang].faqs as [string, string][]),
    ],
    element: wrap(lang, o.home, <Home lang={lang} />),
  }
  const learn: Route = {
    path: p.learn,
    alternate: o.learn,
    lang,
    title: learnCopy[lang].metaTitle,
    description: learnCopy[lang].description,
    jsonLd: [crumbs([['Home', p.home], [L ? 'Leren' : 'Learn', p.learn]])],
    element: wrap(lang, o.learn, <LearnIndex lang={lang} />),
  }
  const calculator: Route = {
    path: p.calculator,
    alternate: o.calculator,
    lang,
    title: calcCopy[lang].metaTitle,
    description: calcCopy[lang].description,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: calcCopy[lang].h1,
        url: url(p.calculator),
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        inLanguage: lang,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        publisher: org,
      },
      crumbs([['Home', p.home], [calcCopy[lang].h1, p.calculator]]),
      faqLd(calcCopy[lang].faq),
    ],
    element: wrap(lang, o.calculator, <CalculatorPage lang={lang} />),
  }
  const products: Route = {
    path: p.products,
    alternate: o.products,
    lang,
    title: productsCopy[lang].metaTitle,
    description: productsCopy[lang].description,
    jsonLd: [crumbs([['Home', p.home], [productsCopy[lang].h1, p.products]])],
    element: wrap(lang, o.products, <Products lang={lang} />),
  }
  const terminal: Route = {
    path: p.terminal,
    alternate: o.terminal,
    lang,
    title: terminalCopy[lang].metaTitle,
    description: terminalCopy[lang].description,
    jsonLd: [crumbs([['Home', p.home], ['Winvest Terminal', p.terminal]])],
    element: wrap(lang, o.terminal, <Terminal lang={lang} />),
  }
  const partners: Route = {
    path: p.partners,
    alternate: o.partners,
    lang,
    title: partnersCopy[lang].metaTitle,
    description: partnersCopy[lang].description,
    jsonLd: [crumbs([['Home', p.home], ['Partners', p.partners]])],
    element: wrap(lang, o.partners, <Partners lang={lang} />),
  }
  const scanner: Route = {
    path: p.scanner,
    alternate: o.scanner,
    lang,
    title: scannerCopy[lang].metaTitle,
    description: scannerCopy[lang].description,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: scannerCopy[lang].h1, url: url(p.scanner), applicationCategory: 'FinanceApplication', operatingSystem: 'Any', inLanguage: lang, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, publisher: org },
      crumbs([['Home', p.home], [scannerCopy[lang].h1, p.scanner]]),
    ],
    element: wrap(lang, o.scanner, <DefiScanner lang={lang} />),
  }
  const markets: Route = {
    path: p.markets,
    alternate: o.markets,
    lang,
    title: marketsCopy[lang].metaTitle,
    description: marketsCopy[lang].description,
    jsonLd: [crumbs([['Home', p.home], [marketsCopy[lang].h1, p.markets]])],
    element: wrap(lang, o.markets, <Markets lang={lang} />),
  }
  const whisper: Route = {
    path: p.whisper,
    alternate: o.whisper,
    lang,
    title: whisperCopy[lang].metaTitle,
    description: whisperCopy[lang].description,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Market Whisper AI', applicationCategory: 'FinanceApplication', operatingSystem: 'Discord', url: url(p.whisper), image: url('/brand/market-whisper-symbol-dark.svg'), publisher: org, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } },
      crumbs([['Home', p.home], ['Market Whisper AI', p.whisper]]),
      faqLd(whisperCopy[lang].faqs),
    ],
    element: wrap(lang, o.whisper, <MarketWhisper lang={lang} />),
  }
  const portfolio: Route = {
    path: p.portfolio,
    alternate: o.portfolio,
    lang,
    title: portfolioCopy[lang].metaTitle,
    description: portfolioCopy[lang].description,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: portfolioCopy[lang].h1, url: url(p.portfolio), applicationCategory: 'FinanceApplication', operatingSystem: 'Any', inLanguage: lang, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, publisher: org },
      crumbs([['Home', p.home], [portfolioCopy[lang].h1, p.portfolio]]),
    ],
    element: wrap(lang, o.portfolio, <Portfolio lang={lang} />),
  }
  const journal: Route = {
    path: p.journal,
    alternate: o.journal,
    lang,
    title: journalCopy[lang].metaTitle,
    description: journalCopy[lang].description,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: L ? 'Forex trading journal' : 'Forex trading journal', url: url(p.journal), applicationCategory: 'FinanceApplication', operatingSystem: 'Any', inLanguage: lang, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, publisher: org },
      crumbs([['Home', p.home], [journalCopy[lang].h1, p.journal]]),
    ],
    element: wrap(lang, o.journal, <Journal lang={lang} />),
  }
  const arts: Route[] = articles.map((a) => {
    const c = a[lang]
    return {
      path: c.path,
      alternate: a[other(lang)].path,
      lang,
      title: c.metaTitle,
      description: c.description,
      ogType: 'article',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: c.title,
          description: c.description,
          inLanguage: lang,
          datePublished: NEW_IDS.includes(a.id) ? UPDATED : PUBLISHED,
          dateModified: UPDATED,
          mainEntityOfPage: url(c.path),
          image: url('/logo.jpeg'),
          author: { '@type': 'Organization', name: 'Winvest Capital', url: SITE_URL + '/' },
          publisher: org,
        },
        crumbs([['Home', p.home], [L ? 'Leren' : 'Learn', p.learn], [c.title, c.path]]),
        faqLd(c.faq),
      ],
      element: wrap(lang, a[other(lang)].path, <Article id={a.id} lang={lang} />),
    }
  })
  const docs: Route[] = (['terms', 'privacy', 'refunds'] as const).map((k) => ({
    path: legal[k][lang].path,
    alternate: legal[k][other(lang)].path,
    lang,
    title: `${legal[k][lang].title} | Winvest Capital`,
    description: legal[k][lang].description,
    element: wrap(lang, legal[k][other(lang)].path, <Legal doc={k} lang={lang} />),
  }))
  const welcome: Route = {
    path: L ? '/nl/welkom/' : '/welcome/',
    alternate: L ? '/welcome/' : '/nl/welkom/',
    lang,
    noindex: true,
    title: L ? 'Welkom in de One Percent Club | Winvest Capital' : 'Welcome to the One Percent Club | Winvest Capital',
    description: L ? 'Je betaling is ontvangen.' : 'Your payment has been received.',
    element: wrap(lang, L ? '/welcome/' : '/nl/welkom/', <Welcome lang={lang} />),
  }
  return [home, products, calculator, markets, portfolio, journal, whisper, terminal, scanner, partners, learn, ...arts, ...docs, welcome]
})

export function findRoute(pathname: string): Route | undefined {
  let p = pathname.replace(/index\.html$/, '')
  if (p === '/welcome.html') p = '/welcome/'
  if (!p.endsWith('/')) p += '/'
  return routes.find((r) => r.path === p)
}
