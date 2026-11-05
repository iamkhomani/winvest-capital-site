import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { DISCORD_URL } from '../config'
import { CHAINS, EVM_CHAINS, btcAddress, detect, evmAddress, evmTx, hash64, searchPairs, solanaAddress, solanaTx, tokenPairs, xrplAddress } from '../defi'
import type { ChainId, Pair, Result } from '../defi'
import { analyzeToken } from '../risk'
import type { Cat, Grade, Report, Sev } from '../risk'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import { safeUrl } from '../safeUrl'

export const scannerCopy = {
  en: {
    metaTitle: 'DeFi scanner: tokens, smart contracts and wallets | Winvest Capital',
    description: 'Free DeFi scanner. Search a token, smart contract, wallet or transaction on Ethereum, Solana, XRP Ledger, Bitcoin, XDC, BNB Chain, Base and more. Live price, liquidity and automated scam detection, contract checks and a risk score.',
    h1: 'DeFi scanner',
    intro: 'Search a token by name or ticker, or paste a contract address, wallet address or transaction hash. We fetch live data straight from the blockchains and DEXs.',
    placeholder: 'Token name, ticker, contract, wallet or tx hash',
    search: 'Scan',
    examples: 'Try:',
    loading: 'Fetching live data…',
    nothing: 'Nothing found. Check the address or try a token name or ticker.',
    error: 'The data source did not respond. Please try again in a moment.',
    results: (n: number) => `${n} markets found, sorted by liquidity. Anyone can create a token with the same name: always check the contract address.`,
    price: 'Price', h24: '24h', liq: 'Liquidity', vol: 'Volume 24h', fdv: 'FDV', mcap: 'Market cap', age: 'Pair age', txns: 'Trades 24h', dex: 'DEX',
    secH: 'Security check',
    secNone: 'No automated security check is available for this chain.',
    secNote: 'Automated check by GoPlus Security. A clean result is no guarantee: always do your own research.',
    marketsH: 'Top markets',
    back: '← Back to results',
    open: 'Open',
    recent: 'Recent transactions',
    walletOn: 'Found on',
    proxyMissing: 'XDC wallet lookups are being set up.',
    supports: 'Supported: tokens on 80+ chains via DexScreener (incl. Ethereum, Solana, XRP Ledger, BNB Chain, Base, Arbitrum, Polygon), wallets and transactions on Ethereum, BNB Chain, Base, Arbitrum, Polygon, XDC, Solana, XRP Ledger and Bitcoin.',
    disclaimer: 'Data comes from third parties (DexScreener, GoPlus Security, public blockchain nodes) and can be delayed or incomplete. Nothing on this page is financial advice. New tokens carry a high risk of scams and total loss.',
    ctaH: 'Want a second opinion on a project?',
    ctaP: 'Share it in the free Winvest Capital Discord. One Percent Club members can also ask Market Whisper AI for a fundamental analysis.',
    ctaBtn: 'Join the free Discord',
    levels: { ok: 'OK', warn: 'Caution', bad: 'Risk', info: 'Info' },
  },
  nl: {
    metaTitle: 'DeFi-scanner: tokens, smart contracts en wallets | Winvest Capital',
    description: 'Gratis DeFi-scanner. Zoek een token, smart contract, wallet of transactie op Ethereum, Solana, XRP Ledger, Bitcoin, XDC, BNB Chain, Base en meer. Live prijs, liquidity en automatische scamdetectie, contractchecks en een risicoscore.',
    h1: 'DeFi-scanner',
    intro: 'Zoek een token op naam of ticker, of plak een contractadres, walletadres of transactie-hash. We halen live data direct op van de blockchains en DEX’en.',
    placeholder: 'Tokennaam, ticker, contract, wallet of tx-hash',
    search: 'Scan',
    examples: 'Probeer:',
    loading: 'Live data ophalen…',
    nothing: 'Niets gevonden. Controleer het adres of probeer een tokennaam of ticker.',
    error: 'De databron reageerde niet. Probeer het zo nog eens.',
    results: (n: number) => `${n} markten gevonden, gesorteerd op liquidity. Iedereen kan een token met dezelfde naam maken: controleer altijd het contractadres.`,
    price: 'Prijs', h24: '24u', liq: 'Liquidity', vol: 'Volume 24u', fdv: 'FDV', mcap: 'Market cap', age: 'Leeftijd pair', txns: 'Trades 24u', dex: 'DEX',
    secH: 'Security check',
    secNone: 'Voor deze chain is geen automatische security check beschikbaar.',
    secNote: 'Automatische check door GoPlus Security. Een schone uitslag is geen garantie: doe altijd je eigen onderzoek.',
    marketsH: 'Grootste markten',
    back: '← Terug naar resultaten',
    open: 'Openen',
    recent: 'Recente transacties',
    walletOn: 'Gevonden op',
    proxyMissing: 'XDC-walletzoekopdrachten worden nog ingericht.',
    supports: 'Ondersteund: tokens op 80+ chains via DexScreener (o.a. Ethereum, Solana, XRP Ledger, BNB Chain, Base, Arbitrum, Polygon), wallets en transacties op Ethereum, BNB Chain, Base, Arbitrum, Polygon, XDC, Solana, XRP Ledger en Bitcoin.',
    disclaimer: 'De data komt van derden (DexScreener, GoPlus Security, publieke blockchain-nodes) en kan vertraagd of onvolledig zijn. Niets op deze pagina is financieel advies. Nieuwe tokens hebben een hoog risico op scams en volledig verlies.',
    ctaH: 'Een second opinion over een project?',
    ctaP: 'Deel het in de gratis Winvest Capital Discord. Leden van de One Percent Club kunnen Market Whisper AI ook om een fundamentele analyse vragen.',
    ctaBtn: 'Word gratis lid van de Discord',
    levels: { ok: 'OK', warn: 'Let op', bad: 'Risico', info: 'Info' },
  },
}

type C = (typeof scannerCopy)['en']
type View =
  | { s: 'idle' }
  | { s: 'loading' }
  | { s: 'error' }
  | { s: 'empty' }
  | { s: 'xdc-off' }
  | { s: 'pairs'; pairs: Pair[] }
  | { s: 'token'; pairs: Pair[]; from?: Pair[] }
  | { s: 'results'; results: Result[] }

const EXAMPLES = ['PEPE', 'XDC', '0x6982508145454Ce325dDbE47a25d4ec3d2311933', 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh']

const usd = (n?: number | string) => {
  if (n === undefined || n === null || n === '') return '–'
  const v = typeof n === 'string' ? parseFloat(n) : n
  if (!isFinite(v)) return '–'
  if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B'
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M'
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K'
  if (v >= 1) return '$' + v.toFixed(2)
  return '$' + v.toPrecision(4)
}
const pctEl = (v?: number) =>
  v === undefined ? <span className="text-white/40">–</span> : <span className={v >= 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]'}>{v >= 0 ? '+' : ''}{v.toFixed(2)}%</span>
const age = (ms?: number) => {
  if (!ms) return '–'
  const d = (Date.now() - ms) / 864e5
  return d < 1 ? Math.round(d * 24) + 'h' : d < 60 ? Math.round(d) + 'd' : Math.round(d / 30) + 'mo'
}
const chainName = (id: string) => (CHAINS as Record<string, { name: string }>)[id]?.name ?? id.charAt(0).toUpperCase() + id.slice(1)

async function run(input: string): Promise<View> {
  const q = detect(input)
  if (!q) return { s: 'idle' }
  switch (q.kind) {
    case 'search': {
      const pairs = await searchPairs(q.q)
      return pairs.length ? { s: 'pairs', pairs: pairs.slice(0, 30) } : { s: 'empty' }
    }
    case 'evm-address': {
      const pairs = await tokenPairs(q.address).catch(() => [])
      if (pairs.length) return { s: 'token', pairs }
      if (q.xdcPrefix && !CHAINS.xdc.rpc) return { s: 'xdc-off' }
      const res = await evmAddress(q.address, q.xdcPrefix ? ['xdc'] : EVM_CHAINS)
      return res.length ? { s: 'results', results: res } : { s: 'empty' }
    }
    case 'solana-address': {
      const pairs = await tokenPairs(q.address).catch(() => [])
      if (pairs.length) return { s: 'token', pairs }
      const r = await solanaAddress(q.address)
      return r ? { s: 'results', results: [r] } : { s: 'empty' }
    }
    case 'evm-tx': {
      const r = await evmTx(q.hash)
      return r ? { s: 'results', results: [r] } : { s: 'empty' }
    }
    case 'solana-tx': {
      const r = await solanaTx(q.sig)
      return r ? { s: 'results', results: [r] } : { s: 'empty' }
    }
    case 'xrpl-address': {
      const r = await xrplAddress(q.address)
      return r ? { s: 'results', results: [r] } : { s: 'empty' }
    }
    case 'hash64': {
      const r = await hash64(q.hash)
      return r ? { s: 'results', results: [r] } : { s: 'empty' }
    }
    case 'btc-address': {
      const r = await btcAddress(q.address)
      return r ? { s: 'results', results: [r] } : { s: 'empty' }
    }
  }
}

function PairList({ pairs, c, onPick }: { pairs: Pair[]; c: C; onPick: (p: Pair) => void }) {
  return (
    <div>
      <p className="text-sm text-white/50">{c.results(pairs.length)}</p>
      <ul className="mt-3 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
        {pairs.map((p) => (
          <li key={p.chainId + p.pairAddress}>
            <button type="button" onClick={() => onPick(p)} className="grid w-full grid-cols-[1fr_auto] gap-x-4 gap-y-1 bg-white/[0.02] px-4 py-3 text-left transition hover:bg-white/[0.06] sm:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))] sm:items-center">
              <span className="flex min-w-0 items-center gap-3">
                {safeUrl(p.info?.imageUrl) ? <img src={safeUrl(p.info?.imageUrl)} alt="" width={28} height={28} loading="lazy" className="size-7 shrink-0 rounded-full bg-white/10" /> : <span className="size-7 shrink-0 rounded-full bg-white/10" />}
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{p.baseToken.symbol} <span className="font-normal text-white/45">/ {p.quoteToken.symbol}</span></span>
                  <span className="block truncate text-xs text-white/45">{p.baseToken.name} · {chainName(p.chainId)} · {p.dexId}</span>
                </span>
              </span>
              <span className="text-right font-semibold">{usd(p.priceUsd)}</span>
              <span className="text-sm sm:text-right">{pctEl(p.priceChange?.h24)}</span>
              <span className="text-right text-sm text-white/60"><span className="text-white/35 sm:hidden">{c.liq} </span>{usd(p.liquidity?.usd)}</span>
              <span className="hidden text-right text-sm text-white/60 sm:block">{usd(p.volume?.h24)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-xs text-white/45">{label}</div>
      <div className="mt-1 font-semibold">{children}</div>
    </div>
  )
}

function Token({ pairs, c, lang }: { pairs: Pair[]; c: C; lang: Lang }) {
  const p = pairs[0]
  const explorer = (CHAINS as Record<string, { explorer: string }>)[p.chainId]?.explorer
  return (
    <div>
      <div className="flex items-center gap-4">
        {safeUrl(p.info?.imageUrl) ? <img src={safeUrl(p.info?.imageUrl)} alt="" width={48} height={48} className="size-12 rounded-full bg-white/10" /> : null}
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-bold">{p.baseToken.name} <span className="text-white/50">({p.baseToken.symbol})</span></h2>
          <p className="truncate text-sm text-white/50">{chainName(p.chainId)} · {p.baseToken.address}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={c.price}>{usd(p.priceUsd)}</Stat>
        <Stat label={c.h24}>{pctEl(p.priceChange?.h24)}</Stat>
        <Stat label={c.liq}>{usd(p.liquidity?.usd)}</Stat>
        <Stat label={c.vol}>{usd(p.volume?.h24)}</Stat>
        <Stat label={c.mcap}>{usd(p.marketCap)}</Stat>
        <Stat label={c.fdv}>{usd(p.fdv)}</Stat>
        <Stat label={c.txns}>{p.txns?.h24 ? `${p.txns.h24.buys} / ${p.txns.h24.sells}` : '–'}</Stat>
        <Stat label={c.age}>{age(p.pairCreatedAt)}</Stat>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <a href={safeUrl(p.url)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-3 py-1.5 hover:border-[var(--wc-red)]">DexScreener ↗</a>
        {explorer ? <a href={`${explorer}/token/${p.baseToken.address}`} target="_blank" rel="noopener" className="rounded-full border border-white/15 px-3 py-1.5 hover:border-[var(--wc-red)]">Explorer ↗</a> : null}
        {(p.info?.websites || []).filter((w) => safeUrl(w.url)).slice(0, 2).map((w) => <a key={w.url} href={safeUrl(w.url)} target="_blank" rel="noopener noreferrer nofollow ugc" className="rounded-full border border-white/15 px-3 py-1.5 hover:border-[var(--wc-red)]">Website ↗</a>)}
        {(p.info?.socials || []).filter((s) => safeUrl(s.url)).slice(0, 3).map((s) => <a key={s.url} href={safeUrl(s.url)} target="_blank" rel="noopener noreferrer nofollow ugc" className="rounded-full border border-white/15 px-3 py-1.5 capitalize hover:border-[var(--wc-red)]">{s.type} ↗</a>)}
      </div>

      <RiskReport key={p.chainId + p.baseToken.address} pairs={pairs} lang={lang} />

      {pairs.length > 1 ? (
        <section className="mt-8">
          <h3 className="text-lg font-bold">{c.marketsH}</h3>
          <ul className="mt-3 divide-y divide-white/10 rounded-2xl border border-white/10 text-sm">
            {pairs.slice(0, 6).map((x) => (
              <li key={x.pairAddress} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="min-w-0 truncate">{x.baseToken.symbol}/{x.quoteToken.symbol} <span className="text-white/45">· {x.dexId}</span></span>
                <span className="shrink-0 text-white/70">{c.liq} {usd(x.liquidity?.usd)}</span>
                <a href={safeUrl(x.url)} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[var(--wc-red-soft)] hover:underline">{c.open} ↗</a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

const RC = {
  en: {
    h: 'Risk analysis',
    loading: 'Running scam, contract and liquidity checks…',
    error: 'The risk analysis could not be completed. Try again in a moment.',
    score: 'Risk score',
    grade: { low: 'Low risk', medium: 'Medium risk', high: 'High risk', critical: 'Critical risk' } as Record<Grade, string>,
    sum: {
      low: 'No major red flags found in the automated checks. That is no guarantee: do your own research.',
      medium: 'Some risk factors found. Read them before you buy and size your position carefully.',
      high: 'Several serious risk factors. Be very careful with this token.',
      critical: 'Critical red flags found. This token shows typical scam characteristics.',
    } as Record<Grade, string>,
    sev: { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' } as Record<Sev, string>,
    cat: { scam: 'Scam signals', contract: 'Contract', liquidity: 'Liquidity & market', holders: 'Holders' } as Record<Cat, string>,
    none: 'No issues found in this category.',
    good: 'Good signs',
    audit: 'Contract scan (bytecode)',
    code: 'Code size',
    funcs: 'Privileged functions found',
    noFuncs: 'none of the known risky functions',
    proxy: 'Implementation (proxy)',
    dc: 'Uses DELEGATECALL',
    yes: 'yes', no: 'no',
    sources: (n: number, s: string) => `${n} checks · sources: ${s}`,
    failed: (s: string) => `Not available right now: ${s}. The score may be incomplete.`,
    note: 'Automated checks, not a manual smart contract audit. Scammers keep inventing new tricks, so a low score is never a guarantee. Not financial advice.',
  },
  nl: {
    h: 'Risicoanalyse',
    loading: 'Scam-, contract- en liquiditychecks worden uitgevoerd…',
    error: 'De risicoanalyse kon niet worden afgerond. Probeer het zo opnieuw.',
    score: 'Risicoscore',
    grade: { low: 'Laag risico', medium: 'Gemiddeld risico', high: 'Hoog risico', critical: 'Kritiek risico' } as Record<Grade, string>,
    sum: {
      low: 'Geen grote rode vlaggen gevonden in de automatische checks. Dat is geen garantie: doe je eigen onderzoek.',
      medium: 'Enkele risicofactoren gevonden. Lees ze voordat je koopt en bepaal je positie voorzichtig.',
      high: 'Meerdere serieuze risicofactoren. Wees heel voorzichtig met dit token.',
      critical: 'Kritieke rode vlaggen gevonden. Dit token vertoont typische scamkenmerken.',
    } as Record<Grade, string>,
    sev: { critical: 'Kritiek', high: 'Hoog', medium: 'Gemiddeld', low: 'Laag' } as Record<Sev, string>,
    cat: { scam: 'Scamsignalen', contract: 'Contract', liquidity: 'Liquidity & markt', holders: 'Holders' } as Record<Cat, string>,
    none: 'Geen problemen gevonden in deze categorie.',
    good: 'Goede signalen',
    audit: 'Contractscan (bytecode)',
    code: 'Codegrootte',
    funcs: 'Gevonden owner-functies',
    noFuncs: 'geen van de bekende risicovolle functies',
    proxy: 'Implementatie (proxy)',
    dc: 'Gebruikt DELEGATECALL',
    yes: 'ja', no: 'nee',
    sources: (n: number, s: string) => `${n} checks · bronnen: ${s}`,
    failed: (s: string) => `Nu niet beschikbaar: ${s}. De score kan onvolledig zijn.`,
    note: 'Automatische checks, geen handmatige smart contract audit. Scammers bedenken steeds nieuwe trucs, dus een lage score is nooit een garantie. Geen financieel advies.',
  },
}

const GRADE_TONE: Record<Grade, { bar: string; text: string; ring: string }> = {
  low: { bar: 'bg-emerald-500', text: 'text-emerald-300', ring: 'border-emerald-500/40' },
  medium: { bar: 'bg-amber-400', text: 'text-amber-300', ring: 'border-amber-400/40' },
  high: { bar: 'bg-orange-500', text: 'text-orange-300', ring: 'border-orange-500/50' },
  critical: { bar: 'bg-[var(--wc-red)]', text: 'text-[var(--wc-red-soft)]', ring: 'border-[var(--wc-red)]/60' },
}
const SEV_TONE: Record<Sev, string> = {
  critical: 'bg-[var(--wc-red)] text-white',
  high: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
  medium: 'bg-amber-400/15 text-amber-300 border border-amber-400/30',
  low: 'bg-white/5 text-white/60 border border-white/15',
}

function RiskReport({ pairs, lang }: { pairs: Pair[]; lang: Lang }) {
  const t = RC[lang]
  const [r, setR] = useState<Report | null | 'error'>(null)
  useEffect(() => {
    let on = true
    analyzeToken(pairs).then((x) => on && setR(x)).catch(() => on && setR('error'))
    return () => {
      on = false
    }
  }, [pairs])
  if (r === null) return <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5"><h3 className="text-lg font-bold">{t.h}</h3><p className="mt-2 animate-pulse text-sm text-white/60">{t.loading}</p></section>
  if (r === 'error') return <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5"><h3 className="text-lg font-bold">{t.h}</h3><p className="mt-2 text-sm text-white/60">{t.error}</p></section>
  const tone = GRADE_TONE[r.grade]
  const cats: Cat[] = ['scam', 'contract', 'liquidity', 'holders']
  return (
    <section className={`mt-8 rounded-2xl border bg-white/[0.03] p-5 sm:p-6 ${tone.ring}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">{t.h}</h3>
          <p className={`mt-1 text-2xl font-bold ${tone.text}`}>{t.grade[r.grade]}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-white/50">{t.score}</span>
          <p className="text-3xl font-bold tabular-nums">{r.score}<span className="text-base text-white/40">/100</span></p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={r.score} aria-label={t.score}>
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${Math.max(3, r.score)}%` }} />
      </div>
      <p className="mt-3 text-sm text-white/75">{t.sum[r.grade]}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cats.map((cat) => {
          const list = r.findings.filter((f) => f.cat === cat)
          return (
            <div key={cat} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <h4 className="text-sm font-semibold text-white/85">{t.cat[cat]}</h4>
              {list.length ? (
                <ul className="mt-3 space-y-3">
                  {list.map((f, i) => (
                    <li key={i} className="text-sm">
                      <div className="flex items-start gap-2">
                        <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${SEV_TONE[f.sev]}`}>{t.sev[f.sev]}</span>
                        <span className="font-semibold text-white/90">{f.t[lang]}</span>
                      </div>
                      <p className="mt-1 text-white/55">{f.d[lang]}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-emerald-300/80">✓ {t.none}</p>
              )}
            </div>
          )
        })}
      </div>

      {r.good.length ? (
        <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.05] p-4">
          <h4 className="text-sm font-semibold text-emerald-300">{t.good}</h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {r.good.map((g, i) => <li key={i} className="rounded-full border border-emerald-500/30 px-3 py-1 text-xs text-emerald-200">✓ {g[lang]}</li>)}
          </ul>
        </div>
      ) : null}

      {r.audit ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
          <h4 className="font-semibold text-white/85">{t.audit}</h4>
          <dl className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            <div className="flex justify-between gap-3"><dt className="text-white/50">{t.code}</dt><dd>{r.audit.codeSize.toLocaleString(lang === 'nl' ? 'nl-NL' : 'en-US')} bytes</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-white/50">{t.dc}</dt><dd>{r.audit.delegatecall ? t.yes : t.no}</dd></div>
            {r.audit.implementation ? <div className="flex justify-between gap-3 sm:col-span-2"><dt className="text-white/50">{t.proxy}</dt><dd className="truncate font-mono text-xs">{r.audit.implementation}</dd></div> : null}
            <div className="flex justify-between gap-3 sm:col-span-2"><dt className="shrink-0 text-white/50">{t.funcs}</dt><dd className="text-right">{r.audit.functions.length ? r.audit.functions.join(', ') : t.noFuncs}</dd></div>
          </dl>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-white/45">{t.sources(r.checks, r.sources.join(', '))}</p>
      {r.failed.length ? <p className="mt-1 text-xs text-amber-300/80">{t.failed(r.failed.join(', '))}</p> : null}
      <p className="mt-2 text-xs text-white/45">{t.note}</p>
    </section>
  )
}

function TokenView({ view, c, lang, onBack }: { view: Extract<View, { s: 'token' }>; c: C; lang: Lang; onBack: (p: Pair[]) => void }) {
  const from = view.from
  return (
    <>
      {from ? <button type="button" onClick={() => onBack(from)} className="mb-4 text-sm text-white/60 hover:text-white">{c.back}</button> : null}
      <Token pairs={view.pairs} c={c} lang={lang} />
    </>
  )
}

function Results({ results, c }: { results: Result[]; c: C }) {
  return (
    <div className="grid gap-4">
      {results.map((r) => (
        <article key={r.chain + r.explorer} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{r.title}</h2>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">{c.walletOn} {CHAINS[r.chain as ChainId].name}</span>
          </div>
          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {r.rows.map(([k, v, link]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-white/5 pb-2">
                <dt className="text-white/50">{k}</dt>
                <dd className="truncate text-right font-medium">{link ? <a href={link} target="_blank" rel="noopener" className="hover:underline">{v}</a> : v}</dd>
              </div>
            ))}
          </dl>
          {r.txs && r.txs.length ? (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-white/80">{c.recent}</h3>
              <ul className="mt-2 divide-y divide-white/5 text-sm">
                {r.txs.map((t) => (
                  <li key={t.url} className="flex justify-between gap-3 py-1.5">
                    <a href={t.url} target="_blank" rel="noopener" className="truncate font-mono text-white/80 hover:underline">{t.id}</a>
                    <span className="shrink-0 text-white/45">{t.note ? t.note + ' · ' : ''}{t.when ?? ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <a href={r.explorer} target="_blank" rel="noopener" className="mt-4 inline-block text-sm font-semibold text-[var(--wc-red-soft)] hover:underline">{c.open} in explorer ↗</a>
        </article>
      ))}
    </div>
  )
}

export default function DefiScanner({ lang }: { lang: Lang }) {
  const c = scannerCopy[lang]
  const [input, setInput] = useState('')
  const [view, setView] = useState<View>({ s: 'idle' })

  const go = async (value: string, push = true) => {
    const v = value.trim()
    if (!v) return
    setInput(v)
    setView({ s: 'loading' })
    if (push) {
      const u = new URL(location.href)
      u.searchParams.set('q', v)
      history.replaceState(null, '', u)
    }
    try {
      setView(await run(v))
    } catch {
      setView({ s: 'error' })
    }
  }

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q')
    if (q) void go(q, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    void go(input)
  }

  const pick = async (p: Pair) => {
    const from = view.s === 'pairs' ? view.pairs : undefined
    setView({ s: 'loading' })
    const all = await tokenPairs(p.baseToken.address).catch(() => [p])
    const pairs = all.length ? all : [p]
    setView({ s: 'token', pairs, from })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/15 blur-[120px]" />
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-white/45">
          <a href={paths[lang].home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span> {c.h1}
        </nav>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/70">{c.intro}</p>

        <form onSubmit={submit} className="mt-8 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={c.placeholder}
            aria-label={c.placeholder}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-base outline-none placeholder:text-white/35 focus:border-[var(--wc-red)]"
          />
          <button type="submit" className="shrink-0 rounded-full bg-[var(--wc-red)] px-6 py-3 font-semibold text-white transition hover:brightness-110">{c.search}</button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/50">
          <span>{c.examples}</span>
          {EXAMPLES.map((x) => (
            <button key={x} type="button" onClick={() => void go(x)} className="max-w-[16rem] truncate rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/70 hover:border-white/30">{x}</button>
          ))}
        </div>

        <div className="mt-8 min-h-[120px]" aria-live="polite">
          {view.s === 'loading' && <p className="text-white/60">{c.loading}</p>}
          {view.s === 'error' && <p className="text-[var(--wc-red-soft)]">{c.error}</p>}
          {view.s === 'empty' && <p className="text-white/60">{c.nothing}</p>}
          {view.s === 'xdc-off' && <p className="text-white/60">{c.proxyMissing}</p>}
          {view.s === 'pairs' && <PairList pairs={view.pairs} c={c} onPick={(p) => void pick(p)} />}
          {view.s === 'token' && <TokenView view={view} c={c} lang={lang} onBack={(pairs) => setView({ s: 'pairs', pairs })} />}
          {view.s === 'results' && <Results results={view.results} c={c} />}
        </div>

        <a href={paths[lang].markets} className="mt-10 inline-block rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:border-[var(--wc-red)] hover:text-white">{lang === 'nl' ? 'Bekijk de top 50 crypto en populaire aandelen →' : 'See the top 50 crypto and popular stocks →'}</a>
        <p className="mt-6 max-w-3xl text-sm text-white/45">{c.supports}</p>
        <p className="mt-3 max-w-3xl text-sm text-white/45">{c.disclaimer}</p>

        <aside className="mt-10 max-w-3xl rounded-2xl border border-[var(--wc-red)]/50 bg-gradient-to-b from-[var(--wc-red)]/15 to-white/[0.02] p-6 sm:p-8">
          <h2 className="text-xl font-bold">{c.ctaH}</h2>
          <p className="mt-2 text-white/70">{c.ctaP}</p>
          <a href={DISCORD_URL} className="mt-5 inline-block rounded-full bg-[var(--wc-red)] px-5 py-2.5 font-semibold text-white transition hover:brightness-110">{c.ctaBtn}</a>
        </aside>
      </div>
    </main>
  )
}
