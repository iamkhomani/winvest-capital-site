// DeFi market overview on the DeFi Scanner page: largest protocols, DEX volume, lending markets and
// stablecoin yields. Reads one small daily snapshot (public/data/defi-market.json, made by
// scripts/defi-market.mjs from DefiLlama), so visitors never download DefiLlama's multi-MB files.
import { useEffect, useState } from 'react'
import { cardBase, tabCls } from '../components/kit'
import type { Lang } from '../i18n'
import DataStamp, { LoadState } from './DataStamp'
import { usdBig } from './pulse'

type Proto = { name: string; slug: string; category: string; chains: number; tvl: number; ch1d: number | null; ch7d: number | null; logo?: string }
type Snap = {
  generated: string
  totalTvl: number
  protocols: Proto[]
  lending: Proto[]
  dex: { total24h: number; ch1d: number | null; ch7d: number | null; top: { name: string; slug: string; vol24h: number; ch1d: number | null; chains: number; logo?: string }[] }
  yields: { pool: string; project: string; chain: string; symbol: string; tvl: number; apy: number; apyBase: number | null; apyReward: number | null; apy30d: number; meta: string | null }[]
}
type Tab = 'protocols' | 'dex' | 'lending' | 'yields'

const copy = {
  en: {
    h: 'DeFi market',
    p: 'The largest decentralised finance protocols, trading volume on decentralised exchanges, lending markets and stablecoin yields.',
    tabs: { protocols: 'Protocols', dex: 'DEX volume', lending: 'Lending', yields: 'Stablecoin yields' } as Record<Tab, string>,
    totalTvl: 'Total value locked',
    dexVol: 'DEX volume 24h',
    tvl: 'TVL',
    vol: 'Volume 24h',
    d1: '24h',
    d7: '7d',
    chains: (n: number) => `${n} chain${n === 1 ? '' : 's'}`,
    apy: 'APY now',
    apy30: 'avg 30d',
    reward: 'incl. reward tokens',
    yieldsP: 'What the largest pools for major dollar stablecoins (USDC, USDT, DAI and others) pay, sorted by size. Not a recommendation: yields change daily, and every protocol carries risk (smart contract, depeg, borrowers not repaying). A higher yield usually means more risk.',
    tvlP: 'TVL = value of the crypto deposited in a protocol. Exchanges and chains themselves are left out.',
    lendP: 'Protocols where you can lend crypto for interest or borrow against collateral.',
    dexP: 'Trading volume over the last 24 hours on decentralised exchanges, all chains.',
    more: 'More on DefiLlama',
  },
  nl: {
    h: 'DeFi-markt',
    p: 'De grootste DeFi-protocollen, handelsvolume op decentrale exchanges, lending-markten en stablecoin-rendementen.',
    tabs: { protocols: 'Protocollen', dex: 'DEX-volume', lending: 'Lending', yields: 'Stablecoin-rendement' } as Record<Tab, string>,
    totalTvl: 'Totale waarde vastgezet (TVL)',
    dexVol: 'DEX-volume 24u',
    tvl: 'TVL',
    vol: 'Volume 24u',
    d1: '24u',
    d7: '7d',
    chains: (n: number) => `${n} chain${n === 1 ? '' : 's'}`,
    apy: 'APY nu',
    apy30: 'gem. 30d',
    reward: 'incl. beloningstokens',
    yieldsP: 'Wat de grootste pools voor bekende dollar-stablecoins (USDC, USDT, DAI en andere) betalen, gesorteerd op grootte. Geen aanbeveling: rendementen veranderen dagelijks en elk protocol heeft risico (smart contract, depeg, leners die niet terugbetalen). Een hoger rendement betekent meestal meer risico.',
    tvlP: 'TVL = waarde van de crypto die in een protocol is ingelegd. Exchanges en chains zelf tellen niet mee.',
    lendP: 'Protocollen waar je crypto uitleent tegen rente of leent tegen onderpand.',
    dexP: 'Handelsvolume van de laatste 24 uur op decentrale exchanges, alle chains.',
    more: 'Meer op DefiLlama',
  },
}

let snapP: Promise<Snap> | null = null
const loadSnap = () =>
  (snapP ??= fetch('/data/defi-market.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .catch((e) => {
      snapP = null
      throw e
    }))

const pct = (v: number | null, lang: Lang) => (v === null || v === undefined ? '–' : (v >= 0 ? '+' : '') + v.toFixed(1).replace('.', lang === 'nl' ? ',' : '.') + '%')
const tone = (v: number | null) => (v === null || v === undefined ? 'text-white/40' : v >= 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]')
const num2 = (v: number, lang: Lang) => v.toFixed(2).replace('.', lang === 'nl' ? ',' : '.')

function Logo({ src }: { src?: string }) {
  return src ? <img src={src} alt="" width={20} height={20} loading="lazy" className="size-5 shrink-0 rounded-full bg-white/10" /> : <span className="size-5 shrink-0 rounded-full bg-white/10" />
}

export default function DefiMarket({ lang }: { lang: Lang }) {
  const c = copy[lang]
  const [d, setD] = useState<Snap | null>(null)
  const [err, setErr] = useState(false)
  const [tab, setTab] = useState<Tab>('protocols')
  useEffect(() => {
    loadSnap().then(setD, () => setErr(true))
  }, [])
  const protoRows = (list: Proto[]) => (
    <ol className="mt-3 divide-y divide-white/5">
      {list.map((p, i) => (
        <li key={p.slug}>
          <a href={`https://defillama.com/protocol/${encodeURIComponent(p.slug)}`} target="_blank" rel="noopener" className="flex items-center gap-3 py-2 text-sm hover:bg-white/[0.03]">
            <span className="w-5 text-right text-xs text-white/35">{i + 1}</span>
            <Logo src={p.logo} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{p.name}</span>
              <span className="block truncate text-xs text-white/40">{p.category} · {c.chains(p.chains)}</span>
            </span>
            <span className="text-right tabular-nums">
              <span className="block">{usdBig(p.tvl)}</span>
              <span className={`block text-xs ${tone(p.ch7d)}`}>{pct(p.ch7d, lang)} {c.d7}</span>
            </span>
          </a>
        </li>
      ))}
    </ol>
  )
  return (
    <section aria-labelledby="defi-market-h" className={`${cardBase} mt-10 p-4 sm:p-5`}>
      <h2 id="defi-market-h" className="text-xl font-bold">{c.h}</h2>
      <p className="mt-1 max-w-3xl text-sm text-white/55">{c.p}</p>
      {d ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-xs text-white/50">{c.totalTvl}</p>
              <p className="text-lg font-bold tabular-nums">{usdBig(d.totalTvl)}</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-xs text-white/50">{c.dexVol}</p>
              <p className="text-lg font-bold tabular-nums">{usdBig(d.dex.total24h)}</p>
              <p className={`text-xs ${tone(d.dex.ch1d)}`}>{pct(d.dex.ch1d, lang)} {c.d1}</p>
            </div>
          </div>
          <div role="tablist" aria-label={c.h} className="mt-4 flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/15 p-1 sm:inline-flex">
            {(Object.keys(c.tabs) as Tab[]).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tabCls(tab === t)}>{c.tabs[t]}</button>
            ))}
          </div>
          {tab === 'protocols' ? (
            <>
              <p className="mt-3 text-xs text-white/45">{c.tvlP}</p>
              {protoRows(d.protocols)}
            </>
          ) : tab === 'lending' ? (
            <>
              <p className="mt-3 text-xs text-white/45">{c.lendP}</p>
              {protoRows(d.lending)}
            </>
          ) : tab === 'dex' ? (
            <>
              <p className="mt-3 text-xs text-white/45">{c.dexP}</p>
              <ol className="mt-3 divide-y divide-white/5">
                {d.dex.top.map((p, i) => (
                  <li key={p.slug ?? p.name}>
                    <a href={`https://defillama.com/dexs/${encodeURIComponent(p.slug ?? '')}`} target="_blank" rel="noopener" className="flex items-center gap-3 py-2 text-sm hover:bg-white/[0.03]">
                      <span className="w-5 text-right text-xs text-white/35">{i + 1}</span>
                      <Logo src={p.logo} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{p.name}</span>
                        <span className="block truncate text-xs text-white/40">{c.chains(p.chains)}</span>
                      </span>
                      <span className="text-right tabular-nums">
                        <span className="block">{usdBig(p.vol24h)}</span>
                        <span className={`block text-xs ${tone(p.ch1d)}`}>{pct(p.ch1d, lang)} {c.d1}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <p className="mt-3 text-xs text-amber-200/80">{c.yieldsP}</p>
              <ol className="mt-3 divide-y divide-white/5">
                {d.yields.map((y) => (
                  <li key={y.pool}>
                    <a href={`https://defillama.com/yields/pool/${encodeURIComponent(y.pool)}`} target="_blank" rel="noopener" className="flex items-center gap-3 py-2 text-sm hover:bg-white/[0.03]">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{y.symbol} <span className="font-normal text-white/50">· {y.project}</span></span>
                        <span className="block truncate text-xs text-white/40">{y.chain}{y.meta ? ` · ${y.meta}` : ''} · {c.tvl} {usdBig(y.tvl)}</span>
                      </span>
                      <span className="text-right tabular-nums">
                        <span className="block font-semibold">{num2(y.apy30d, lang)}% <span className="text-xs font-normal text-white/45">{c.apy30}</span></span>
                        <span className="block text-xs text-white/50">{c.apy} {num2(y.apy, lang)}%{y.apyReward ? ` (${c.reward})` : ''}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </>
          )}
          <DataStamp className="mt-3" lang={lang} source="DefiLlama" kind="daily" updated at={Date.parse(d.generated)} />
        </>
      ) : (
        <LoadState lang={lang} error={err} />
      )}
    </section>
  )
}
