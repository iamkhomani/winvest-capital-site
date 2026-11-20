import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { DISCORD_URL } from '../config'
import type { Lang } from '../i18n'
import { paths } from '../paths'
import { STABLES, diversification, drawdown, holdings, periods, series, volatility } from '../portfolio/calc'
import type { Holding } from '../portfolio/calc'
import { cryptoSectors, dividends as fetchDividends, history as fetchHistory, fxNow, priceAt, quotes, searchCrypto, searchStock, stockSector } from '../portfolio/data'
import { cachedSync, detectWallet, syncAll } from '../portfolio/wallets'
import type { WalletSync, WalletToken } from '../portfolio/wallets'
import type { Dividend, History, Quote, SectorMap } from '../portfolio/data'
import { exportCsv, exportJson, load, loadIndex, removeStored, save, saveIndex, storageKey, uid, validate, parseCsv, DEFAULT_ASSETS } from '../portfolio/store'
import type { Asset, Currency, PortfolioData, PortfolioIndex, PortfolioMeta, Tx } from '../portfolio/store'
import { Card, PageHeader, btn, pageWrap, tabCls } from '../components/kit'
import { useWatchlists } from '../shared/watchlist'
import type { WatchItem } from '../shared/watchlist'
import { AssetBadge, AssetSearch } from '../shared/AssetPicker'
import MyWinvestTabs from '../components/MyWinvestTabs'
import DataStamp from '../markets/DataStamp'
import WhisperAsk from '../components/WhisperAsk'

// EvilCharts (Recharts) only downloads when the portfolio overview is shown.
const ValueChart = lazy(() => import('../portfolio/Charts').then((m) => ({ default: m.ValueChart })))
const MonthlyChart = lazy(() => import('../portfolio/Charts').then((m) => ({ default: m.MonthlyChart })))
const BenchmarkChart = lazy(() => import('../portfolio/Charts').then((m) => ({ default: m.BenchmarkChart })))
const SnapshotChart = lazy(() => import('../portfolio/Charts').then((m) => ({ default: m.SnapshotChart })))
const AllocationChart = lazy(() => import('../portfolio/Charts').then((m) => ({ default: m.AllocationChart })))
const ChartFallback = ({ h = 'h-64' }: { h?: string }) => <div className={`${h} w-full animate-pulse rounded-xl bg-white/[0.03]`} />

export const portfolioCopy = {
  en: {
    metaTitle: 'Free portfolio tracker for crypto and stocks | Winvest Capital',
    description: 'Free portfolio tracker for crypto and stocks with live prices: P/L, allocation, performance and drawdown, plus automatic wallet tracking. Stored on your device only.',
    h1: 'Portfolio tracker',
    intro: 'Crypto and stocks in one overview, with live prices. Your data is stored only in this browser on this device, not on our servers. Use export to make a backup or move it to another device.',
    tabs: { overview: 'Overview', positions: 'Positions', wallets: 'Wallets', txs: 'Transactions', settings: 'Backup & settings' },
    w: {
      title: 'Track your wallets automatically',
      intro: 'Add a public wallet address and we read the coins and tokens in it straight from the blockchain. Balances and value update automatically. Read-only: we never need a private key or seed phrase, and you can never sign anything here.',
      address: 'Wallet address', addressPh: '0x…, Solana, bc1… or r… address', label: 'Name (optional)', labelPh: 'e.g. Ledger', add: 'Add wallet',
      invalid: 'This is not a supported address. Paste a public address, never a private key or seed phrase.',
      exists: 'This wallet has already been added.',
      detected: { evm: 'EVM address: Ethereum, Base, Arbitrum, Optimism, Polygon, BNB Chain and XDC', solana: 'Solana address', bitcoin: 'Bitcoin address', xrpl: 'XRP Ledger address' },
      networks: 'Supported: Ethereum, Base, Arbitrum, Optimism and Polygon (native coin and all tokens with an active market), BNB Chain (BNB and the most used tokens), XDC, Solana (SOL and SPL tokens), Bitcoin and XRP. Tokens without a liquid market and balances under $0.50 are hidden to keep out spam.',
      refresh: 'Refresh', syncing: 'Reading the blockchains…', lastSync: 'Updated', never: 'not yet',
      remove: 'Remove', total: 'Value in wallets', empty: 'No coins or tokens with a value found yet.',
      errors: (n: string) => `Could not read: ${n}. Shown balances may be incomplete; try Refresh later.`,
      cols: { asset: 'Asset', chain: 'Network', qty: 'Amount', price: 'Price', value: 'Value', change: '24h' },
      double: 'Wallet balances are counted on top of your transactions. Do not also enter the same coins as transactions, or they are counted twice. Wallets have no purchase price, so they are not part of profit/loss and the performance chart.',
      privacy: 'Privacy: addresses are stored only on this device. To read balances, the address is sent to public blockchain services (Blockscout, Jupiter, Blockstream, XRPL, public RPC nodes) and prices come from CoinGecko and DexScreener. Never paste a seed phrase or private key anywhere.',
      inclWallets: 'incl. wallets', cardTitle: 'Wallets', open: 'Manage wallets →',
    },
    add: '+ Add transaction',
    total: 'Total value', pnl: 'Total profit / loss', unreal: 'Unrealised', real: 'Realised', today: 'Today', invested: 'Invested (cost basis)',
    perf: 'Performance', week: 'Week', month: 'Month', quarter: 'Quarter', year: 'Year', sinceStart: 'since start',
    valueChart: 'Portfolio value, last 12 months',
    chart: { value: 'Portfolio value', invested: 'Net invested', gain: 'Gain', loss: 'Loss', empty: 'Not enough history yet' },
    bench: { h: 'You versus Bitcoin and Ethereum', you: 'Your portfolio', btc: 'Bitcoin', eth: 'Ethereum', note: 'Your time-weighted return against simply holding BTC or ETH from the same start date. Past results say nothing about the future.' },
    monthly: 'Monthly return',
    monthlyNote: 'Time-weighted: deposits and withdrawals do not count as gains or losses.',
    alloc: 'Allocation', byClass: 'By asset class', crypto: 'Crypto', stocks: 'Stocks',
    split: { h: 'Spread by type', p: 'How your portfolio, including wallets, is split between Bitcoin, other coins, stablecoins and stocks.', btc: 'Bitcoin', alts: 'Altcoins', stables: 'Stablecoins', stocks: 'Stocks', altWarn: 'More than 60% is in altcoins. Altcoins usually move harder than Bitcoin, in both directions.', chains: 'Wallets per blockchain' },
    sector: {
      h: 'Spread by sector',
      p: 'Which parts of the market your money is in, including wallets.',
      note: 'Crypto sectors are based on CoinGecko categories for the top 100 coins; other coins count as Other crypto. Stock sectors come from Yahoo Finance.',
      fund: 'ETFs and funds',
      unknown: 'Stocks, sector unknown',
      crypto: { l1: 'Layer 1', l2: 'Layer 2', defi: 'DeFi', stable: 'Stablecoins', meme: 'Meme coins', exchange: 'Exchange tokens', ai: 'AI', privacy: 'Privacy', infra: 'Infrastructure', rwa: 'Real-world assets', other: 'Other crypto' } as Record<string, string>,
      stocks: {} as Record<string, string>,
    },
    dividend: {
      h: 'Dividend',
      p: 'Dividends your stocks paid, worked out from your transactions and the ex-dividend dates. Gross amounts before tax, converted at the exchange rate of the ex-date where available.',
      total: 'Received in total',
      last12: 'Last 12 months',
      next: 'Expected next 12 months',
      stock: 'Stock',
      nextNote: 'Expected = the dividends per share of the past 12 months times the shares you hold now. Companies can change or stop their dividend.',
    },
    snap: {
      h: 'Your own history',
      p: 'Each day you open the tracker, the total value (including wallets) is saved on this device. This shows how your portfolio really developed, including deposits and withdrawals.',
      value: 'Total value',
      empty: 'Saved once per day when you open the tracker. The chart appears from the second day.',
      since: (d: string) => `Since ${d}`,
      days: (n: number) => `${n} days saved`,
    },
    pf: { label: 'Your portfolios', main: 'Main portfolio', new: 'New portfolio', rename: 'Rename', del: 'Delete', delConfirm: (n: string) => `Delete “${n}” and all its transactions from this device?`, name: 'Portfolio name', create: 'Create', save: 'Save', cancel: 'Cancel', defaultName: (n: number) => `Portfolio ${n}` },
    risk: 'Risk exposure', maxDd: 'Max drawdown (1y)', curDd: 'Current drawdown', vol: 'Volatility (annualised, 90d)', largest: 'Largest position', top3: 'Top 3 positions', effective: 'Effective number of positions', stable: 'Stablecoins',
    divLow: 'Concentrated', divMid: 'Moderately diversified', divHigh: 'Well diversified',
    cols: { asset: 'Asset', qty: 'Quantity', avg: 'Avg. cost', price: 'Price', value: 'Value', pnl: 'P/L', weight: 'Weight', d24: '24h' },
    emptyH: 'Start your portfolio',
    emptyP: 'Add your first buy transaction. Search for any coin or stock, enter how much you bought and at what price.',
    loadingPrices: 'Loading live prices…',
    noPrice: 'no live price',
    setPrice: 'Set price',
    histNote: 'Performance uses daily closing prices of the last 12 months. Positions bought earlier are valued from 12 months ago.',
    txH: 'Transactions', del: 'Delete', edit: 'Edit', type: 'Type', buy: 'Buy', sell: 'Sell', date: 'Date', fee: 'Fee', note: 'Note',
    form: { title: 'Add transaction', editTitle: 'Edit transaction', kind: 'Market', search: 'Search a coin or stock (e.g. BTC, Apple, ASML)', searching: 'Searching…', none: 'Nothing found.', chosen: 'Selected', change: 'Change', qty: 'Quantity', price: 'Price per unit', fee: 'Fees (optional)', note: 'Note (optional)', save: 'Save transaction', cancel: 'Cancel', priceHint: 'Prefilled with the current price. Change it to what you actually paid.', sellTooMuch: 'You cannot sell more than you hold.' },
    settings: {
      base: 'Base currency', baseLocked: 'The base currency is locked because transaction prices are stored in it. Export, clear and re-enter to change it.',
      exportH: 'Export', exportP: 'Download a backup of all your data (JSON) or your transactions as a spreadsheet (CSV).', exportJson: 'Export backup (JSON)', exportCsv: 'Export transactions (CSV)',
      importH: 'Import', importP: 'Restore a backup made with this tracker. This replaces the data in this browser.', importBtn: 'Choose backup file', importOk: 'Backup imported.', importBad: 'This file is not a valid Winvest portfolio backup.',
      csvP: 'Or add transactions from a CSV file: the CSV this tracker exports, or a file with the columns date (YYYY-MM-DD), type (buy/sell), symbol, quantity and price. Existing data stays.', csvBtn: 'Add from CSV', csvBusy: 'Reading the CSV and looking up the assets…', csvBad: 'No usable rows found. Check the columns date, type, symbol, quantity and price.', csvCurrency: (b: string) => `The prices in this file are not in ${b}, the currency of this portfolio.`, csvDone: (a: number, m: number) => `${a} transactions added${m ? `, ${m} rows skipped (unknown asset or incomplete row)` : ''}.`,
      clearH: 'Clear all data', clearP: 'Removes your portfolio and watchlists from this browser. Make an export first.', clear: 'Clear all data', confirm: 'Yes, delete everything',
      privacyH: 'Privacy', privacyP: 'Your portfolio is saved in this browser’s local storage only. To fetch prices, only the names of the assets are sent to CoinGecko and, for stocks, via our Cloudflare proxy to Yahoo Finance. Clearing your browser data deletes the portfolio, so export regularly.',
      storageFail: 'Your browser blocks local storage (for example in private mode). Changes will be lost when you close this page.',
    },
    disclaimer: 'Prices can be delayed or missing and calculations are indicative. This tool is for your own tracking only and is not financial advice.',
    ctaH: 'Discuss your portfolio with the community', ctaP: 'Ask questions and share ideas in the free Winvest Capital Discord.', ctaBtn: 'Join the free Discord',
  },
  nl: {
    metaTitle: 'Gratis portfolio tracker: crypto en aandelen | Winvest Capital',
    description: 'Gratis portfolio tracker voor crypto en aandelen met live koersen: W/V, allocatie, performance en drawdown, plus automatisch wallets volgen. Alleen op je apparaat.',
    h1: 'Portfolio tracker',
    intro: 'Crypto en aandelen in één overzicht, met actuele prijzen. Je gegevens worden alleen in deze browser op dit apparaat opgeslagen, niet op onze servers. Gebruik export voor een back-up of om ze naar een ander apparaat te zetten.',
    tabs: { overview: 'Overzicht', positions: 'Posities', wallets: 'Wallets', txs: 'Transacties', settings: 'Back-up & instellingen' },
    w: {
      title: 'Volg je wallets automatisch',
      intro: 'Voeg een openbaar walletadres toe en we lezen de coins en tokens rechtstreeks van de blockchain. Saldi en waarde worden automatisch bijgewerkt. Alleen-lezen: we hebben nooit een private key of seed phrase nodig en je kunt hier nooit iets ondertekenen.',
      address: 'Walletadres', addressPh: '0x…-, Solana-, bc1…- of r…-adres', label: 'Naam (optioneel)', labelPh: 'bijv. Ledger', add: 'Wallet toevoegen',
      invalid: 'Dit is geen ondersteund adres. Plak een openbaar adres, nooit een private key of seed phrase.',
      exists: 'Deze wallet is al toegevoegd.',
      detected: { evm: 'EVM-adres: Ethereum, Base, Arbitrum, Optimism, Polygon, BNB Chain en XDC', solana: 'Solana-adres', bitcoin: 'Bitcoin-adres', xrpl: 'XRP Ledger-adres' },
      networks: 'Ondersteund: Ethereum, Base, Arbitrum, Optimism en Polygon (native coin en alle tokens met een actieve markt), BNB Chain (BNB en de meest gebruikte tokens), XDC, Solana (SOL en SPL-tokens), Bitcoin en XRP. Tokens zonder liquide markt en saldi onder $0,50 worden verborgen om spam buiten te houden.',
      refresh: 'Vernieuwen', syncing: 'Blockchains worden uitgelezen…', lastSync: 'Bijgewerkt', never: 'nog niet',
      remove: 'Verwijderen', total: 'Waarde in wallets', empty: 'Nog geen coins of tokens met waarde gevonden.',
      errors: (n: string) => `Kon niet uitlezen: ${n}. De getoonde saldi kunnen onvolledig zijn; probeer later opnieuw.`,
      cols: { asset: 'Asset', chain: 'Netwerk', qty: 'Aantal', price: 'Prijs', value: 'Waarde', change: '24u' },
      double: 'Walletsaldi worden opgeteld bij je transacties. Voer dezelfde coins niet ook als transactie in, anders worden ze dubbel geteld. Wallets hebben geen aankoopprijs en tellen daarom niet mee in winst/verlies en de rendementsgrafiek.',
      privacy: 'Privacy: adressen worden alleen op dit apparaat bewaard. Om saldi op te halen wordt het adres naar openbare blockchaindiensten gestuurd (Blockscout, Jupiter, Blockstream, XRPL, openbare RPC-nodes) en prijzen komen van CoinGecko en DexScreener. Plak nooit ergens een seed phrase of private key.',
      inclWallets: 'incl. wallets', cardTitle: 'Wallets', open: 'Wallets beheren →',
    },
    add: '+ Transactie toevoegen',
    total: 'Totale waarde', pnl: 'Totale winst / verlies', unreal: 'Ongerealiseerd', real: 'Gerealiseerd', today: 'Vandaag', invested: 'Ingelegd (kostprijs)',
    perf: 'Performance', week: 'Week', month: 'Maand', quarter: 'Kwartaal', year: 'Jaar', sinceStart: 'sinds start',
    valueChart: 'Portfoliowaarde, laatste 12 maanden',
    chart: { value: 'Portfoliowaarde', invested: 'Netto ingelegd', gain: 'Winst', loss: 'Verlies', empty: 'Nog niet genoeg historie' },
    bench: { h: 'Jij tegenover Bitcoin en Ethereum', you: 'Jouw portfolio', btc: 'Bitcoin', eth: 'Ethereum', note: 'Je tijdgewogen rendement tegenover gewoon BTC of ETH aanhouden vanaf dezelfde startdatum. Resultaten uit het verleden zeggen niets over de toekomst.' },
    monthly: 'Rendement per maand',
    monthlyNote: 'Tijdgewogen: stortingen en opnames tellen niet als winst of verlies.',
    alloc: 'Allocatie', byClass: 'Per categorie', crypto: 'Crypto', stocks: 'Aandelen',
    split: { h: 'Verdeling naar soort', p: 'Hoe je portfolio, inclusief wallets, verdeeld is over Bitcoin, andere munten, stablecoins en aandelen.', btc: 'Bitcoin', alts: 'Altcoins', stables: 'Stablecoins', stocks: 'Aandelen', altWarn: 'Meer dan 60% zit in altcoins. Altcoins bewegen meestal harder dan Bitcoin, in beide richtingen.', chains: 'Wallets per blockchain' },
    sector: {
      h: 'Verdeling naar sector',
      p: 'In welke delen van de markt je geld zit, inclusief wallets.',
      note: 'Crypto-sectoren komen uit de categorieën van CoinGecko voor de top 100; andere munten tellen als Overige crypto. Sectoren van aandelen komen van Yahoo Finance.',
      fund: 'ETF’s en fondsen',
      unknown: 'Aandelen, sector onbekend',
      crypto: { l1: 'Layer 1', l2: 'Layer 2', defi: 'DeFi', stable: 'Stablecoins', meme: 'Memecoins', exchange: 'Exchangetokens', ai: 'AI', privacy: 'Privacy', infra: 'Infrastructuur', rwa: 'Echte activa (RWA)', other: 'Overige crypto' } as Record<string, string>,
      stocks: { Technology: 'Technologie', Healthcare: 'Gezondheidszorg', 'Financial Services': 'Financiële diensten', 'Consumer Cyclical': 'Cyclische consumptie', 'Communication Services': 'Communicatiediensten', Industrials: 'Industrie', 'Consumer Defensive': 'Basisconsumptie', Energy: 'Energie', 'Basic Materials': 'Grondstoffen', 'Real Estate': 'Vastgoed', Utilities: 'Nutsbedrijven' } as Record<string, string>,
    },
    dividend: {
      h: 'Dividend',
      p: 'Dividend dat je aandelen hebben uitgekeerd, berekend uit je transacties en de ex-dividenddata. Brutobedragen vóór belasting, omgerekend tegen de wisselkoers van de ex-datum waar die bekend is.',
      total: 'Totaal ontvangen',
      last12: 'Laatste 12 maanden',
      next: 'Verwacht komende 12 maanden',
      stock: 'Aandeel',
      nextNote: 'Verwacht = het dividend per aandeel van de afgelopen 12 maanden maal de aandelen die je nu hebt. Bedrijven kunnen hun dividend aanpassen of stoppen.',
    },
    snap: {
      h: 'Je eigen verloop',
      p: 'Elke dag dat je de tracker opent, wordt de totale waarde (inclusief wallets) op dit apparaat opgeslagen. Zo zie je hoe je portfolio echt is gegroeid, inclusief stortingen en opnames.',
      value: 'Totale waarde',
      empty: 'Wordt één keer per dag opgeslagen als je de tracker opent. De grafiek verschijnt vanaf de tweede dag.',
      since: (d: string) => `Sinds ${d}`,
      days: (n: number) => `${n} dagen opgeslagen`,
    },
    pf: { label: 'Je portfolio’s', main: 'Hoofdportfolio', new: 'Nieuw portfolio', rename: 'Naam wijzigen', del: 'Verwijderen', delConfirm: (n: string) => `“${n}” en alle transacties ervan van dit apparaat verwijderen?`, name: 'Naam van het portfolio', create: 'Aanmaken', save: 'Opslaan', cancel: 'Annuleren', defaultName: (n: number) => `Portfolio ${n}` },
    risk: 'Risico', maxDd: 'Max drawdown (1j)', curDd: 'Huidige drawdown', vol: 'Volatiliteit (per jaar, 90d)', largest: 'Grootste positie', top3: 'Top 3 posities', effective: 'Effectief aantal posities', stable: 'Stablecoins',
    divLow: 'Geconcentreerd', divMid: 'Redelijk gespreid', divHigh: 'Goed gespreid',
    cols: { asset: 'Asset', qty: 'Aantal', avg: 'Gem. kostprijs', price: 'Prijs', value: 'Waarde', pnl: 'W/V', weight: 'Gewicht', d24: '24u' },
    emptyH: 'Start je portfolio',
    emptyP: 'Voeg je eerste aankoop toe. Zoek een coin of aandeel en vul in hoeveel je kocht en tegen welke prijs.',
    loadingPrices: 'Actuele prijzen laden…',
    noPrice: 'geen live prijs',
    setPrice: 'Prijs invullen',
    histNote: 'Performance gebruikt dagelijkse slotkoersen van de laatste 12 maanden. Posities die eerder zijn gekocht, worden gewaardeerd vanaf 12 maanden geleden.',
    txH: 'Transacties', del: 'Verwijderen', edit: 'Bewerken', type: 'Type', buy: 'Koop', sell: 'Verkoop', date: 'Datum', fee: 'Kosten', note: 'Notitie',
    form: { title: 'Transactie toevoegen', editTitle: 'Transactie bewerken', kind: 'Markt', search: 'Zoek een coin of aandeel (bijv. BTC, Apple, ASML)', searching: 'Zoeken…', none: 'Niets gevonden.', chosen: 'Gekozen', change: 'Wijzigen', qty: 'Aantal', price: 'Prijs per stuk', fee: 'Kosten (optioneel)', note: 'Notitie (optioneel)', save: 'Transactie opslaan', cancel: 'Annuleren', priceHint: 'Vooraf ingevuld met de huidige prijs. Pas aan naar wat je echt betaalde.', sellTooMuch: 'Je kunt niet meer verkopen dan je bezit.' },
    settings: {
      base: 'Basisvaluta', baseLocked: 'De basisvaluta ligt vast omdat de transactieprijzen daarin zijn opgeslagen. Exporteer, wis en voer opnieuw in om te wijzigen.',
      exportH: 'Exporteren', exportP: 'Download een back-up van al je gegevens (JSON) of je transacties als spreadsheet (CSV).', exportJson: 'Back-up exporteren (JSON)', exportCsv: 'Transacties exporteren (CSV)',
      importH: 'Importeren', importP: 'Zet een back-up van deze tracker terug. Dit vervangt de gegevens in deze browser.', importBtn: 'Kies back-upbestand', importOk: 'Back-up geïmporteerd.', importBad: 'Dit bestand is geen geldige back-up van de Winvest portfolio tracker.',
      csvP: 'Of voeg transacties toe uit een CSV-bestand: de CSV die deze tracker exporteert, of een bestand met de kolommen date (JJJJ-MM-DD), type (buy/sell), symbol, quantity en price. Bestaande gegevens blijven staan.', csvBtn: 'Toevoegen uit CSV', csvBusy: 'CSV lezen en de assets opzoeken…', csvBad: 'Geen bruikbare regels gevonden. Controleer de kolommen date, type, symbol, quantity en price.', csvCurrency: (b: string) => `De prijzen in dit bestand zijn niet in ${b}, de valuta van deze portfolio.`, csvDone: (a: number, m: number) => `${a} transacties toegevoegd${m ? `, ${m} regels overgeslagen (onbekende asset of onvolledige regel)` : ''}.`,
      clearH: 'Alle gegevens wissen', clearP: 'Verwijdert je portfolio en watchlists uit deze browser. Maak eerst een export.', clear: 'Alle gegevens wissen', confirm: 'Ja, alles verwijderen',
      privacyH: 'Privacy', privacyP: 'Je portfolio staat alleen in de lokale opslag van deze browser. Om prijzen op te halen worden alleen de namen van de assets naar CoinGecko gestuurd en, voor aandelen, via onze Cloudflare-proxy naar Yahoo Finance. Als je je browsergegevens wist, is het portfolio weg, dus exporteer regelmatig.',
      storageFail: 'Je browser blokkeert lokale opslag (bijvoorbeeld in privémodus). Wijzigingen gaan verloren als je deze pagina sluit.',
    },
    disclaimer: 'Prijzen kunnen vertraagd zijn of ontbreken en berekeningen zijn indicatief. Deze tool is alleen voor je eigen overzicht en geen financieel advies.',
    ctaH: 'Bespreek je portfolio met de community', ctaP: 'Stel vragen en deel ideeën in de gratis Winvest Capital Discord.', ctaBtn: 'Word gratis lid van de Discord',
  },
}

type C = (typeof portfolioCopy)['en']
type Tab = keyof C['tabs']

// ---------- formatting ----------
const fmtMoney = (v: number | undefined, base: Currency, lang: Lang, compact = false) => {
  if (v === undefined || !isFinite(v)) return '–'
  const abs = Math.abs(v)
  return new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'en-GB', {
    style: 'currency', currency: base,
    notation: compact && abs >= 1e6 ? 'compact' : 'standard',
    maximumFractionDigits: abs >= 1000 ? 0 : abs >= 1 ? 2 : 6,
    minimumFractionDigits: abs >= 1000 ? 0 : abs >= 1 ? 2 : 2,
  }).format(v)
}
const fmtNum = (v: number, lang: Lang) => new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'en-GB', { maximumFractionDigits: v >= 1000 ? 2 : 8 }).format(v)
const fmtPct = (v: number | undefined, sign = true) => (v === undefined || !isFinite(v) ? '–' : `${sign && v > 0 ? '+' : ''}${v.toFixed(2)}%`)
const tone = (v: number | undefined) => (v === undefined || Math.abs(v) < 1e-9 ? 'text-white/70' : v > 0 ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]')
const todayStr = () => new Date().toISOString().slice(0, 10)
const SPLIT_COLORS = { btc: '#F7931A', alts: '#8B5CF6', stables: '#94A3B8', stocks: '#38BDF8' }
const PALETTE = ['#FE0000', 'var(--wc-text)', '#F59E0B', '#34D399', '#60A5FA', '#A78BFA', '#F472B6', '#94A3B8', '#FB7185', '#2DD4BF']

// ---------- small UI pieces ----------
function Label({ children }: { children: ReactNode }) {
  return <div className="text-xs font-medium tracking-wide text-white/50 uppercase">{children}</div>
}
// ---------- add transaction ----------
function TxForm({ c, lang, data, quotesNow, onSave, onClose, preset, held, edit }: { c: C; lang: Lang; data: PortfolioData; quotesNow: Record<string, Quote>; onSave: (a: Asset, t: Tx) => void; onClose: () => void; preset?: Asset; held: Record<string, number>; edit?: Tx }) {
  const [asset, setAsset] = useState<Asset | undefined>(preset)
  const [type, setType] = useState<'buy' | 'sell'>(edit?.type ?? 'buy')
  const [date, setDate] = useState(edit?.date ?? todayStr())
  const [qty, setQty] = useState(edit ? String(edit.qty) : '')
  const [price, setPrice] = useState(edit ? String(edit.price) : '')
  const [fee, setFee] = useState(edit?.fee ? String(edit.fee) : '')
  const [note, setNote] = useState(edit?.note ?? '')
  const [err, setErr] = useState('')

  const pick = async (a: Asset) => {
    setAsset(a)
    const known = quotesNow[a.key]?.price
    if (known) setPrice(String(+known.toPrecision(8)))
    else {
      const q = await quotes([a], data.base).catch(() => ({} as Record<string, Quote>))
      const p = q[a.key]?.price
      if (p) setPrice(String(+p.toPrecision(8)))
      if (q[a.key]?.image) setAsset({ ...a, image: a.image || q[a.key].image })
    }
  }
  useEffect(() => {
    if (preset && !edit) void pick(preset) // when editing, keep the price that was entered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const n = (s: string) => parseFloat(s.replace(',', '.'))
  const submit = () => {
    if (!asset) return
    const q = n(qty), p = n(price), f = fee ? n(fee) : 0
    if (!(q > 0) || !(p >= 0) || !(f >= 0) || !date) return setErr('⚠')
    // when editing, leave this transaction itself out of the available quantity
    const own = edit && edit.asset === asset.key ? (edit.type === 'sell' ? edit.qty : -edit.qty) : 0
    if (type === 'sell' && q > (held[asset.key] || 0) + own + 1e-12) return setErr(c.form.sellTooMuch)
    onSave(asset, { id: edit?.id ?? uid(), asset: asset.key, type, date, qty: q, price: p, fee: f, note: note.trim() || undefined })
  }
  const input = 'w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 outline-none focus:border-[var(--wc-red)]'
  const pill = (on: boolean) => `flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${on ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={edit ? c.form.editTitle : c.form.title} className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-[var(--wc-panel)] p-5 sm:rounded-3xl sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{edit ? c.form.editTitle : c.form.title}</h2>
          <button type="button" onClick={onClose} aria-label={c.form.cancel} className="rounded-full px-3 py-1 text-white/60 hover:text-white">✕</button>
        </div>
        <div className="mt-4">
          {asset ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <AssetBadge a={asset} />
              {!preset ? <button type="button" onClick={() => setAsset(undefined)} className="text-sm text-white/60 hover:text-white">{c.form.change}</button> : null}
            </div>
          ) : (
            <AssetSearch lang={lang} onPick={(a) => void pick(a)} autoFocus />
          )}
        </div>
        {asset ? (
          <div className="mt-4 grid gap-3">
            <div className="flex rounded-full border border-white/15 p-1">
              <button type="button" className={pill(type === 'buy')} onClick={() => setType('buy')}>{c.buy}</button>
              <button type="button" className={pill(type === 'sell')} onClick={() => setType('sell')}>{c.sell}</button>
            </div>
            <label className="grid gap-1 text-sm text-white/60">{c.date}<input type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} className={input} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm text-white/60">{c.form.qty}<input inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" className={input} /></label>
              <label className="grid gap-1 text-sm text-white/60">{c.form.price} ({data.base})<input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className={input} /></label>
            </div>
            {edit ? null : <p className="-mt-1 text-xs text-white/40">{c.form.priceHint}</p>}
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm text-white/60">{c.form.fee} ({data.base})<input inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0" className={input} /></label>
              <label className="grid gap-1 text-sm text-white/60">{c.form.note}<input value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} className={input} /></label>
            </div>
            {qty && price ? <p className="text-sm text-white/60">= {fmtMoney(n(qty) * n(price) + (fee ? n(fee) : 0), data.base, lang)}</p> : null}
            {err ? <p className="text-sm text-[var(--wc-red-soft)]">{err}</p> : null}
            <div className="mt-1 flex gap-2">
              <button type="button" onClick={submit} className={`flex-1 ${btn()}`}>{c.form.save}</button>
              <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-5 py-3 font-semibold text-white/80 hover:border-white/40">{c.form.cancel}</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ---------- main ----------
export default function Portfolio({ lang }: { lang: Lang }) {
  const c = portfolioCopy[lang]
  const [data, setData] = useState<PortfolioData | null>(null)
  const [storageOk, setStorageOk] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [q, setQ] = useState<Record<string, Quote>>({})
  const [loadingQ, setLoadingQ] = useState(false)
  const [qAt, setQAt] = useState<number | null>(null) // time of the last round that returned fresh prices
  const [hist, setHist] = useState<Record<string, History>>({})
  const [form, setForm] = useState<{ preset?: Asset; edit?: Tx } | null>(null)
  const [msg, setMsg] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const W = useWatchlists() // shared watchlist (whole site); the portfolio's own lists stay as a backup
  const fileRef = useRef<HTMLInputElement>(null)
  const csvRef = useRef<HTMLInputElement>(null)
  const [wsync, setWsync] = useState<WalletSync | null>(null)
  const [wBusy, setWBusy] = useState(false)
  const [usdRate, setUsdRate] = useState(1)
  const [wAddr, setWAddr] = useState('')
  const [wLabel, setWLabel] = useState('')
  const [wErr, setWErr] = useState('')
  const [pf, setPf] = useState<PortfolioIndex>({ active: 'main', list: [{ id: 'main', name: '' }] })
  const pidRef = useRef('main')
  const [pfEdit, setPfEdit] = useState<null | 'new' | 'rename' | 'delete'>(null)
  const [pfName, setPfName] = useState('')
  const [sectors, setSectors] = useState<SectorMap | null>(null)
  const [divs, setDivs] = useState<Record<string, Dividend[]>>({})
  const snapRef = useRef<{ ready: boolean; value: number }>({ ready: false, value: 0 })

  useEffect(() => {
    const ix = loadIndex()
    pidRef.current = ix.active
    setPf(ix)
    setData(load(ix.active))
    void cryptoSectors().then(setSectors)
    if (location.hash === '#watch') {
      location.replace(paths[lang].watchlist) // the watchlist has its own page now
      return
    }
    if (location.hash) {
      const t = location.hash.slice(1) as Tab
      if (t in portfolioCopy.en.tabs) setTab(t)
    }
  }, [])

  // ---- wallets: read balances from the blockchains (cached 10 minutes) ----
  const walletSig = data ? data.wallets.map((w) => w.id).join('|') : ''
  const syncWallets = useCallback(async (force = false) => {
    if (!data || !data.wallets.length) return
    const cached = cachedSync()
    const ids = data.wallets.map((w) => w.id)
    const covered = !!cached && ids.every((id) => cached.ids?.includes(id))
    if (!force && cached && covered && Date.now() - cached.at < 10 * 60e3) { setWsync(cached); return }
    if (cached) setWsync(cached)
    setWBusy(true)
    try {
      const s = await syncAll(data.wallets)
      setWsync(s)
    } finally {
      setWBusy(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletSig])
  useEffect(() => { void syncWallets() }, [syncWallets])
  useEffect(() => {
    if (!data) return
    let alive = true
    fxNow('USD', data.base).then((r) => { if (alive && r > 0) setUsdRate(r) }).catch(() => undefined)
    return () => { alive = false }
  }, [data?.base]) // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback((fn: (d: PortfolioData) => PortfolioData) => {
    setData((prev) => {
      if (!prev) return prev
      const next = fn(structuredClone(prev))
      setStorageOk(save(next, pidRef.current))
      return next
    })
  }, [])

  // Stocks added before sectors were stored: look up their sector once (Yahoo search via our Worker).
  const sectorTodo = data ? Object.values(data.assets).filter((a) => a.kind === 'stock' && a.sector === undefined && data.txs.some((t) => t.asset === a.key)).map((a) => a.symbol) : []
  const sectorSig = sectorTodo.join('|')
  useEffect(() => {
    if (!sectorTodo.length) return
    let alive = true
    void (async () => {
      const found: Record<string, string> = {}
      for (const sym of sectorTodo.slice(0, 8)) {
        try {
          found[`stock:${sym}`] = await stockSector(sym)
        } catch {
          return // offline or source down: try again next visit
        }
      }
      if (alive) update((d) => { for (const [k, v] of Object.entries(found)) if (d.assets[k]) d.assets[k].sector = v; return d })
    })()
    return () => { alive = false }
  }, [sectorSig]) // eslint-disable-line react-hooks/exhaustive-deps

  // Dividend history for stocks that have transactions (one request per stock, cached 12 hours).
  const divKeys = data ? [...new Set(data.txs.map((t) => t.asset))].filter((k) => data.assets[k]?.kind === 'stock') : []
  const divSig = divKeys.join('|') + '|' + (data?.base ?? '')
  useEffect(() => {
    if (!data || !divKeys.length) { setDivs({}); return }
    let alive = true
    void (async () => {
      const out: Record<string, Dividend[]> = {}
      for (const k of divKeys) {
        try {
          out[k] = await fetchDividends(data.assets[k], data.base)
        } catch {
          /* source down: skip this stock for now */
        }
      }
      if (alive) setDivs(out)
    })()
    return () => { alive = false }
  }, [divSig]) // eslint-disable-line react-hooks/exhaustive-deps

  // Daily snapshot of the total value, saved once all prices (and wallets) are in.
  useEffect(() => {
    const { ready, value } = snapRef.current
    if (!ready || !data) return
    const today = new Date().toLocaleDateString('sv-SE')
    const v = Math.round(value * 100) / 100
    if (data.snapshots[today] === v) return
    update((d) => { d.snapshots[today] = v; return d })
  })

  // ---- several portfolios ----
  const switchTo = (id: string, ix: PortfolioIndex = pf) => {
    const next = { ...ix, active: id }
    pidRef.current = id
    setPf(next)
    saveIndex(next)
    setData(load(id))
    setHist({})
    setForm(null)
    setMsg('')
    setConfirmClear(false)
    setPfEdit(null)
  }
  const createPf = (name: string) => {
    const id = uid().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'p' + Date.now().toString(36)
    switchTo(id, { ...pf, list: [...pf.list, { id, name: name.trim().slice(0, 40) }] })
  }
  const renamePf = (name: string) => {
    const next = { ...pf, list: pf.list.map((p) => (p.id === pf.active ? { ...p, name: name.trim().slice(0, 40) } : p)) }
    setPf(next)
    saveIndex(next)
    setPfEdit(null)
  }
  const deletePf = () => {
    if (pf.active === 'main') return
    removeStored(pf.active)
    switchTo('main', { ...pf, list: pf.list.filter((p) => p.id !== pf.active) })
  }

  // Opened from a coin page with "Add to portfolio": ?add=<CoinGecko id> opens the form prefilled
  const ready = data !== null
  useEffect(() => {
    if (!ready || !data) return
    const id = new URLSearchParams(location.search).get('add')
    if (!id) return
    // stocks come as stock:<Yahoo symbol> (from the watchlist page)
    const stock = /^stock:([A-Za-z0-9.^=-]{1,20})$/.exec(id)
    if (stock) {
      history.replaceState(null, '', location.pathname + location.hash)
      const knownStock = data.assets[`stock:${stock[1]}`]
      if (knownStock) { setForm({ preset: knownStock }); return }
      void searchStock(stock[1])
        .then((list) => {
          const f = list.find((x) => x.id.toUpperCase() === stock[1].toUpperCase())
          if (f) setForm({ preset: { key: f.key, kind: 'stock', symbol: f.symbol, name: f.name, id: f.id, sector: f.sector } })
        })
        .catch(() => {})
      return
    }
    if (!/^[a-z0-9-]{1,80}$/.test(id)) return
    history.replaceState(null, '', location.pathname + location.hash)
    const known = data.assets[`crypto:${id}`]
    if (known) { setForm({ preset: known }); return }
    void searchCrypto(id)
      .then((list) => {
        const f = list.find((x) => x.id === id)
        if (f) setForm({ preset: { key: f.key, kind: 'crypto', symbol: f.symbol, name: f.name, id: f.id, image: f.image } })
      })
      .catch(() => {})
  }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  // assets that need prices: held assets + shared watchlist assets
  const watchMap = useMemo(() => new Map<string, WatchItem>((W.lists ?? []).flatMap((l) => l.items.map((i) => [i.key, i] as [string, WatchItem]))), [W.lists])
  const assetOf = (k: string): Asset | undefined => data?.assets[k] ?? watchMap.get(k)
  const neededKeys = useMemo(() => {
    if (!data) return [] as string[]
    const s = new Set<string>(data.txs.map((t) => t.asset))
    for (const k of watchMap.keys()) s.add(k)
    return [...s].filter((k) => data.assets[k] || watchMap.get(k))
  }, [data, watchMap])
  const neededSig = neededKeys.join('|') + '|' + (data?.base ?? '')

  useEffect(() => {
    if (!data || !neededKeys.length) return
    let alive = true
    let retry: ReturnType<typeof setTimeout> | undefined
    const run = async () => {
      if (retry) clearTimeout(retry)
      setLoadingQ(true)
      const r = await quotes(neededKeys.map((k) => assetOf(k) as Asset), data.base).catch(() => ({} as Record<string, Quote>))
      if (alive) {
        // keep the last known price of anything this round could not fetch, instead of blanking it
        setQ((old) => {
          const next: Record<string, Quote> = { ...r }
          for (const k of neededKeys) if (!next[k] && old[k]) next[k] = { ...old[k], stale: true }
          return next
        })
        if (Object.values(r).some((x) => !x.stale)) setQAt(Date.now())
        setLoadingQ(false)
        // some prices missing or stale (rate limit): try again sooner
        if (neededKeys.some((k) => !r[k] || r[k].stale)) retry = setTimeout(() => void run(), 20000)
      }
    }
    void run()
    const t = setInterval(() => { if (!document.hidden) void run() }, 60000)
    return () => { alive = false; clearInterval(t); if (retry) clearTimeout(retry) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neededSig])

  // history for held assets (sequential, cached for 6 hours)
  const heldKeys = useMemo(() => (data ? [...new Set(data.txs.map((t) => t.asset))] : []), [data])
  const heldSig = heldKeys.join('|') + '|' + (data?.base ?? '')
  useEffect(() => {
    if (!data || !heldKeys.length) return
    let alive = true
    ;(async () => {
      for (const k of heldKeys) {
        const a = data.assets[k]
        if (!a) continue
        // CoinGecko's free API is rate limited: retry a couple of times with a pause
        for (let attempt = 0; attempt < 3 && alive; attempt++) {
          try {
            const h = await fetchHistory(a, data.base)
            if (!alive) return
            setHist((prev) => ({ ...prev, [k]: h }))
            break
          } catch {
            await new Promise((r) => setTimeout(r, 15000 * (attempt + 1)))
          }
        }
        await new Promise((r) => setTimeout(r, 1200))
      }
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heldSig])

  const prices = useMemo(() => {
    const p: Record<string, number | undefined> = {}
    if (data) for (const k of neededKeys) p[k] = q[k]?.price ?? data.manualPrices[k]
    return p
  }, [q, data, neededKeys])
  const changes = useMemo(() => Object.fromEntries(Object.entries(q).map(([k, v]) => [k, v.change24h])), [q])

  const hs: Holding[] = useMemo(() => (data ? holdings(data, prices, changes) : []), [data, prices, changes])
  const open = hs.filter((h) => h.qty > 0)
  const pts = useMemo(() => (data ? series(data, hist, prices) : []), [data, hist, prices])

  // Benchmark: what simply holding Bitcoin or Ethereum would have done over the same period.
  const [bench, setBench] = useState<{ btc?: History; eth?: History }>({})
  const baseCur = data?.base
  useEffect(() => {
    if (!baseCur || !pts.length) return
    let alive = true
    Promise.all([fetchHistory(DEFAULT_ASSETS['crypto:bitcoin'], baseCur).catch(() => undefined), fetchHistory(DEFAULT_ASSETS['crypto:ethereum'], baseCur).catch(() => undefined)]).then(
      ([btc, eth]) => alive && setBench({ btc, eth }),
    )
    return () => {
      alive = false
    }
  }, [baseCur, pts.length > 0]) // eslint-disable-line react-hooks/exhaustive-deps
  const benchRows = useMemo(() => {
    const start = pts.findIndex((p) => p.value > 0)
    if (start < 0) return []
    const p0 = pts[start]
    const b0 = bench.btc ? priceAt(bench.btc, p0.t) : undefined
    const e0 = bench.eth ? priceAt(bench.eth, p0.t) : undefined
    return pts.slice(start).map((p) => {
      const b = bench.btc && b0 ? priceAt(bench.btc, p.t) : undefined
      const e = bench.eth && e0 ? priceAt(bench.eth, p.t) : undefined
      return {
        t: p.t,
        you: Math.round((p.index / p0.index - 1) * 1000) / 10,
        btc: b !== undefined && b0 ? Math.round((b / b0 - 1) * 1000) / 10 : undefined,
        eth: e !== undefined && e0 ? Math.round((e / e0 - 1) * 1000) / 10 : undefined,
      }
    })
  }, [pts, bench])
  const per = useMemo(() => periods(pts), [pts])
  const dd = useMemo(() => drawdown(pts), [pts])
  const vol = useMemo(() => volatility(pts), [pts])
  const div = useMemo(() => (data ? diversification(data, open) : null), [data, open])
  const held = useMemo(() => Object.fromEntries(hs.map((h) => [h.key, h.qty])), [hs])

  if (!data) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/70">{c.intro}</p>
      </main>
    )
  }

  const base = data.base
  const totalValue = open.reduce((s, h) => s + h.value, 0)
  const totalCost = open.reduce((s, h) => s + h.cost, 0)
  const unreal = open.reduce((s, h) => s + h.unrealized, 0)
  const real = hs.reduce((s, h) => s + h.realized, 0)
  const day24 = open.reduce((s, h) => s + (h.change24h !== undefined && h.price !== undefined ? h.value - h.value / (1 + h.change24h / 100) : 0), 0)
  const missing = open.filter((h) => h.price === undefined)
  const wIds = new Set(data.wallets.map((w) => w.id))
  const wTokens: (WalletToken & { value: number })[] = (wsync?.tokens ?? []).filter((t) => wIds.has(t.wallet)).map((t) => ({ ...t, value: (t.priceUsd ?? 0) * t.qty * usdRate }))
  const walletValue = wTokens.reduce((s, t) => s + t.value, 0)
  const walletDay24 = wTokens.reduce((s, t) => s + (t.change24h !== undefined ? t.value - t.value / (1 + t.change24h / 100) : 0), 0)
  const grandTotal = totalValue + walletValue
  const addWallet = () => {
    const det = detectWallet(wAddr)
    if (!det) return setWErr(c.w.invalid)
    if (data.wallets.some((x) => x.address.toLowerCase() === det.address.toLowerCase())) return setWErr(c.w.exists)
    setWErr('')
    update((d) => { d.wallets.push({ id: uid(), type: det.type, address: det.address, label: wLabel.trim().slice(0, 40) || undefined }); return d })
    setWAddr('')
    setWLabel('')
  }

  const saveTx = (a: Asset, t: Tx) => {
    update((d) => {
      d.assets[a.key] = { key: a.key, kind: a.kind, symbol: a.symbol, name: a.name, id: a.id, image: a.image ?? d.assets[a.key]?.image, currency: a.currency, sector: a.sector ?? d.assets[a.key]?.sector }
      const i = d.txs.findIndex((x) => x.id === t.id)
      if (i >= 0) d.txs[i] = t
      else d.txs.push(t)
      d.txs.sort((x, y) => x.date.localeCompare(y.date))
      return d
    })
    setForm(null)
  }

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const d = validate(JSON.parse(await f.text()))
      if (!d) throw new Error('bad')
      setData(d)
      setStorageOk(save(d, pidRef.current))
      setHist({})
      setMsg(c.settings.importOk)
    } catch {
      setMsg(c.settings.importBad)
    }
  }

  // CSV import: adds transactions (does not replace). Assets are matched on symbol: first the ones
  // already in the portfolio, then a search (crypto: CoinGecko, highest ranked exact symbol; stocks: Yahoo).
  const onImportCsv = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f || !data) return
    setMsg(c.settings.csvBusy)
    const { rows, skipped, currencyMismatch } = parseCsv(await f.text(), data.base)
    if (currencyMismatch) return setMsg(c.settings.csvCurrency(data.base))
    if (!rows.length) return setMsg(c.settings.csvBad)
    const known = new Map<string, Asset>()
    for (const a of [...Object.values(DEFAULT_ASSETS), ...Object.values(data.assets)]) known.set(`${a.kind}:${a.symbol.toUpperCase()}`, a)
    const found = new Map<string, Asset | null>()
    for (const r of rows) {
      const k = `${r.kind}:${r.symbol}`
      if (known.has(k) || found.has(k)) continue
      try {
        const list = r.kind === 'stock' ? await searchStock(r.symbol) : await searchCrypto(r.name !== r.symbol ? r.name : r.symbol)
        const exact = list.filter((x) => x.symbol.toUpperCase() === r.symbol).sort((a, b) => (a.rank ?? 1e9) - (b.rank ?? 1e9))[0]
        found.set(k, exact ? { key: exact.key, kind: exact.kind, symbol: exact.symbol, name: exact.name, id: exact.id, image: exact.image } : null)
      } catch {
        found.set(k, null)
      }
    }
    const add: { a: Asset; tx: Tx }[] = []
    let missing = skipped
    for (const r of rows) {
      const a = known.get(`${r.kind}:${r.symbol}`) ?? found.get(`${r.kind}:${r.symbol}`)
      if (!a) missing++
      else add.push({ a, tx: { id: uid(), asset: a.key, type: r.type, date: r.date, qty: r.qty, price: r.price, fee: r.fee, note: r.note } })
    }
    const added = add.length
    if (added)
      update((d) => {
        for (const { a, tx } of add) {
          d.assets[a.key] = d.assets[a.key] ?? a
          d.txs.push(tx)
        }
        d.txs.sort((x, y) => x.date.localeCompare(y.date))
        return d
      })
    setMsg(c.settings.csvDone(added, missing))
  }

  const tabBtn = (t: Tab) => (
    <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => { setTab(t); history.replaceState(null, '', '#' + t) }} className={tabCls(tab === t)}>
      {c.tabs[t]}
    </button>
  )

  const divLabel = div ? (div.effective >= 8 ? c.divHigh : div.effective >= 4 ? c.divMid : c.divLow) : ''
  const allocMap = new Map<string, number>()
  for (const h of open) if (h.value > 0) { const k = data.assets[h.key]?.symbol ?? h.key; allocMap.set(k, (allocMap.get(k) ?? 0) + h.value) }
  for (const t of wTokens) if (t.value > 0) allocMap.set(t.symbol, (allocMap.get(t.symbol) ?? 0) + t.value)
  const allocSorted = [...allocMap.entries()].sort((a, b) => b[1] - a[1])
  const allocParts = allocSorted.slice(0, 9).map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }))
  const rest = allocSorted.slice(9).reduce((s, [, v]) => s + v, 0)
  if (rest > 0) allocParts.push({ label: lang === 'nl' ? 'Overig' : 'Other', value: rest, color: '#475569' })
  // Split by type (incl. wallets) and wallet value per blockchain, for the spread card.
  const split = { btc: 0, alts: 0, stables: 0, stocks: 0 }
  const kindOf = (sym: string, stock: boolean) => (stock ? 'stocks' : sym.toUpperCase() === 'BTC' ? 'btc' : STABLES.has(sym.toUpperCase()) ? 'stables' : 'alts') as keyof typeof split
  for (const h of open) if (h.value > 0) { const a = data.assets[h.key]; if (a) split[kindOf(a.symbol, a.kind === 'stock')] += h.value }
  for (const t of wTokens) if (t.value > 0) split[kindOf(t.symbol, false)] += t.value
  const splitTotal = split.btc + split.alts + split.stables + split.stocks
  const chainMap = new Map<string, number>()
  for (const t of wTokens) if (t.value > 0) chainMap.set(t.chain, (chainMap.get(t.chain) ?? 0) + t.value)
  const chains = [...chainMap.entries()].sort((a, b) => b[1] - a[1])
  // Spread by sector: crypto from the weekly CoinGecko category snapshot, stocks from Yahoo.
  const cryptoSec = (id: string | undefined, sym: string) => (STABLES.has(sym.toUpperCase()) ? 'stable' : (id && sectors?.byId[id]) || sectors?.bySymbol[sym.toUpperCase()] || 'other')
  const secMap = new Map<string, number>()
  const addSec = (k: string, v: number) => secMap.set(k, (secMap.get(k) ?? 0) + v)
  for (const h of open) {
    const a = data.assets[h.key]
    if (!a || !(h.value > 0)) continue
    addSec(a.kind === 'stock' ? (a.sector === 'fund' ? 's:fund' : a.sector ? 's:' + a.sector : 's:unknown') : 'c:' + cryptoSec(a.id, a.symbol), h.value)
  }
  for (const t of wTokens) if (t.value > 0) addSec('c:' + cryptoSec(undefined, t.symbol), t.value)
  const secLabel = (k: string) => (k.startsWith('c:') ? c.sector.crypto[k.slice(2)] ?? k.slice(2) : k === 's:fund' ? c.sector.fund : k === 's:unknown' ? c.sector.unknown : c.sector.stocks[k.slice(2)] ?? k.slice(2))
  const secSorted = [...secMap.entries()].sort((a, b) => b[1] - a[1])
  const secTotal = secSorted.reduce((s, [, v]) => s + v, 0)
  const secParts = secSorted.slice(0, 9).map(([k, value], i) => ({ label: secLabel(k), value, color: PALETTE[i % PALETTE.length] }))
  const secRest = secSorted.slice(9).reduce((s, [, v]) => s + v, 0)
  // Context for "Ask Market Whisper": shares and returns only, never amounts, wallets or transactions.
  const whisperLines = () => {
    const share = (v: number, t: number) => (t > 0 ? ((v / t) * 100).toFixed(1) + '%' : 'n/a')
    const lastBench = benchRows[benchRows.length - 1]
    return [
      `Holdings by weight: ${allocSorted.slice(0, 12).map(([k, v]) => `${k} ${share(v, grandTotal)}`).join(', ')}${allocSorted.length > 12 ? `, ${allocSorted.length - 12} more` : ''}`,
      `By type: Bitcoin ${share(split.btc, splitTotal)}, altcoins ${share(split.alts, splitTotal)}, stablecoins ${share(split.stables, splitTotal)}, stocks ${share(split.stocks, splitTotal)}`,
      `By sector: ${secSorted.slice(0, 8).map(([k, v]) => `${secLabel(k)} ${share(v, secTotal)}`).join(', ')}`,
      div ? `Concentration: ${div.positions} positions, largest ${div.largest.toFixed(1)}%, top 3 ${div.top3.toFixed(1)}%, effective number of positions ${div.effective.toFixed(1)}` : '',
      `Returns (time-weighted): ${per.map((x) => `${x.label} ${x.pct === undefined ? 'n/a' : (x.pct >= 0 ? '+' : '') + x.pct.toFixed(1) + '%'}`).join(', ')}`,
      `Max drawdown ${dd.max.toFixed(1)}%, now ${dd.current.toFixed(1)}% from peak${vol !== undefined ? `, volatility ${vol.toFixed(0)}% a year` : ''}`,
      lastBench ? `Since start vs holding: portfolio ${lastBench.you >= 0 ? '+' : ''}${lastBench.you}%, BTC ${lastBench.btc ?? 'n/a'}%, ETH ${lastBench.eth ?? 'n/a'}%` : '',
      `Base currency ${base}. Data: Winvest Portfolio Tracker on the user's device.`,
    ].filter(Boolean)
  }
  // Dividends received per stock (shares held on the day before the ex-date)
  const nowMs = Date.now()
  const yearAgo = nowMs - 365 * 864e5
  const divRows = Object.entries(divs)
    .map(([key, list]) => {
      const a = data.assets[key]
      if (!a) return null
      const own = data.txs.filter((t) => t.asset === key)
      const sharesAt = (t: number) => Math.max(0, own.reduce((s, x) => (Date.parse(x.date) < t ? s + (x.type === 'buy' ? x.qty : -x.qty) : s), 0))
      let total = 0, last12 = 0, perShare12 = 0
      for (const [t, v] of list) {
        if (t > nowMs) continue
        const got = sharesAt(t) * v
        total += got
        if (t >= yearAgo) { last12 += got; perShare12 += v }
      }
      return { key, symbol: a.symbol, total, last12, next: sharesAt(nowMs + 864e5) * perShare12 }
    })
    .filter((r): r is { key: string; symbol: string; total: number; last12: number; next: number } => !!r && (r.total > 0 || r.next > 0))
    .sort((x, y) => y.total - x.total)
  const divTotal = divRows.reduce((s, r) => s + r.total, 0)
  const div12 = divRows.reduce((s, r) => s + r.last12, 0)
  const divNext = divRows.reduce((s, r) => s + r.next, 0)
  // Own history: daily snapshots on this device
  const snapRows = Object.entries(data.snapshots).sort((x, y) => x[0].localeCompare(y[0])).map(([d, value]) => ({ t: Date.parse(d), value }))
  snapRef.current = { ready: !loadingQ && missing.length === 0 && (data.wallets.length === 0 || !!wsync) && grandTotal > 0, value: grandTotal }
  if (secRest > 0) secParts.push({ label: lang === 'nl' ? 'Overig' : 'Other', value: secRest, color: '#475569' })
  const pfLabel = (p: PortfolioMeta) => p.name || (p.id === 'main' ? c.pf.main : c.pf.defaultName(pf.list.indexOf(p) + 1))
  const activePf = pf.list.find((p) => p.id === pf.active) ?? pf.list[0]
  const pill = (on: boolean) => `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${on ? 'bg-white text-black' : 'border border-white/15 text-white/75 hover:border-white/40 hover:text-white'}`
  const locale = lang === 'nl' ? 'nl-NL' : 'en-GB'
  const money = (v: number) => fmtMoney(v, base, lang)
  const moneyCompact = (v: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: base, notation: 'compact', maximumFractionDigits: 1 }).format(v)
  const startDay = pts.length ? new Date(pts[0].t).toISOString().slice(0, 10) : ''
  const investedStart = data.txs.filter((x) => x.date < startDay).reduce((s, x) => s + (x.type === 'buy' ? x.qty * x.price + x.fee : -(x.qty * x.price - x.fee)), 0)


  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--wc-red)]/15 blur-[120px]" />
      <div className={pageWrap()}>
        <MyWinvestTabs lang={lang} on="portfolio" />
        <PageHeader home={paths[lang].home} title={c.h1} intro={c.intro} action={<button type="button" onClick={() => setForm({})} className={btn()}>{c.add}</button>} />
        {!storageOk ? <p className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">{c.settings.storageFail}</p> : null}

        <section aria-label={c.pf.label} className="mt-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pf.list.map((p) => (
              <button key={p.id} type="button" aria-pressed={p.id === pf.active} onClick={() => p.id !== pf.active && switchTo(p.id)} className={pill(p.id === pf.active)}>{pfLabel(p)}</button>
            ))}
            {pfEdit === null ? (
              <button type="button" onClick={() => { setPfName(c.pf.defaultName(pf.list.length + 1)); setPfEdit('new') }} className="shrink-0 rounded-full border border-dashed border-white/25 px-4 py-2 text-sm font-semibold text-white/70 hover:border-white/50 hover:text-white">+ {c.pf.new}</button>
            ) : null}
          </div>
          {pfEdit === 'new' || pfEdit === 'rename' ? (
            <form onSubmit={(e) => { e.preventDefault(); if (!pfName.trim()) return; if (pfEdit === 'new') createPf(pfName); else renamePf(pfName) }} className="mt-3 flex flex-wrap items-center gap-2">
              <input autoFocus aria-label={c.pf.name} value={pfName} maxLength={40} onChange={(e) => setPfName(e.target.value)} className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm outline-none focus:border-[var(--wc-red)] sm:max-w-xs" />
              <button type="submit" className={btn('primary', 'sm')}>{pfEdit === 'new' ? c.pf.create : c.pf.save}</button>
              <button type="button" onClick={() => setPfEdit(null)} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40">{c.pf.cancel}</button>
            </form>
          ) : pfEdit === 'delete' ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="text-sm text-white/75">{c.pf.delConfirm(pfLabel(activePf))}</p>
              <button type="button" onClick={deletePf} className={btn('primary', 'sm')}>{c.pf.del}</button>
              <button type="button" onClick={() => setPfEdit(null)} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40">{c.pf.cancel}</button>
            </div>
          ) : (
            <div className="mt-2 flex gap-4 text-sm">
              <button type="button" onClick={() => { setPfName(pfLabel(activePf)); setPfEdit('rename') }} className="font-semibold text-white/55 hover:text-white">{c.pf.rename}</button>
              {pf.active !== 'main' ? <button type="button" onClick={() => setPfEdit('delete')} className="font-semibold text-white/55 hover:text-[var(--wc-red-soft)]">{c.pf.del}</button> : null}
            </div>
          )}
        </section>

        <div role="tablist" className="mt-6 flex gap-1 overflow-x-auto rounded-full border border-white/15 p-1 sm:inline-flex">
          {(Object.keys(c.tabs) as Tab[]).map(tabBtn)}
        </div>

        {/* ---------------- OVERVIEW ---------------- */}
        {tab === 'overview' && (
          <div className="mt-6 grid gap-4">
            {grandTotal > 0 ? (
              <div className="flex justify-end">
                <WhisperAsk
                  lang={lang}
                  kind="portfolio"
                  subject={lang === 'nl' ? 'Mijn portfolio' : 'My portfolio'}
                  lines={whisperLines}
                  questions={lang === 'nl'
                    ? ['Beoordeel mijn spreiding en concentratierisico.', 'Verklaar mijn rendement en de grootste invloeden.', 'Welke marktontwikkelingen zijn relevant voor mijn grootste posities?']
                    : ['Review my allocation and concentration risk.', 'Explain my performance and its main drivers.', 'Which market developments matter for my largest holdings?']}
                />
              </div>
            ) : null}
            {!data.txs.length && data.wallets.length ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card><Label>{c.w.total}</Label><div className="mt-1 text-3xl font-bold tabular-nums">{wsync ? fmtMoney(walletValue, base, lang, true) : '…'}</div><div className={`mt-1 text-sm tabular-nums ${tone(walletDay24)}`}>{c.today}: {fmtMoney(walletDay24, base, lang)}</div></Card>
                  <Card><Label>{c.w.cardTitle}</Label><div className="mt-1 text-3xl font-bold tabular-nums">{data.wallets.length}</div><button type="button" onClick={() => { setTab('wallets'); history.replaceState(null, '', '#wallets') }} className="mt-1 text-sm font-semibold text-[var(--wc-red-soft)] hover:underline">{c.w.open}</button></Card>
                </div>
                {allocParts.length ? (
                  <Card>
                    <h2 className="text-lg font-bold">{c.alloc}</h2>
                    <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row">
                      <Suspense fallback={<div className="size-52 shrink-0 animate-pulse rounded-full bg-white/[0.03]" />}><AllocationChart parts={allocParts} money={money} /></Suspense>
                      <ul className="w-full space-y-1.5 text-sm">
                        {allocParts.map((p) => (
                          <li key={p.label} className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2"><span className="inline-block size-2.5 rounded-full" style={{ background: p.color }} />{p.label}</span>
                            <span className="tabular-nums text-white/70">{((p.value / (grandTotal || 1)) * 100).toFixed(1)}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ) : null}
                <p className="text-xs text-white/45">{c.w.double}</p>
              </>
            ) : !data.txs.length ? (
              <Card className="py-10 text-center">
                <h2 className="text-2xl font-bold">{c.emptyH}</h2>
                <p className="mx-auto mt-2 max-w-md text-white/65">{c.emptyP}</p>
                <button type="button" onClick={() => setForm({})} className="mt-6 rounded-full bg-[var(--wc-red)] px-6 py-3 font-semibold text-white transition hover:brightness-110">{c.add}</button>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card><Label>{c.total}</Label><div className="mt-1 text-3xl font-bold tabular-nums">{fmtMoney(grandTotal, base, lang, true)}</div><div className={`mt-1 text-sm tabular-nums ${tone(day24 + walletDay24)}`}>{c.today}: {fmtMoney(day24 + walletDay24, base, lang)}</div>{walletValue > 0 ? <div className="mt-1 text-xs text-white/50">{c.w.inclWallets}: {fmtMoney(walletValue, base, lang)}</div> : null}</Card>
                  <Card><Label>{c.pnl}</Label><div className={`mt-1 text-3xl font-bold tabular-nums ${tone(unreal + real)}`}>{fmtMoney(unreal + real, base, lang, true)}</div><div className="mt-1 text-sm text-white/55">{c.unreal} <span className={tone(unreal)}>{fmtMoney(unreal, base, lang)}</span> ({fmtPct(totalCost ? (unreal / totalCost) * 100 : undefined)})</div></Card>
                  <Card><Label>{c.invested}</Label><div className="mt-1 text-3xl font-bold tabular-nums">{fmtMoney(totalCost, base, lang, true)}</div><div className="mt-1 text-sm text-white/55">{c.real} <span className={tone(real)}>{fmtMoney(real, base, lang)}</span></div></Card>
                  <Card><Label>{c.byClass}</Label><div className="mt-2 flex h-3 overflow-hidden rounded-full bg-white/10">{div ? <><span style={{ width: `${div.cryptoPct}%` }} className="bg-[var(--wc-red)]" /><span style={{ width: `${div.stockPct}%` }} className="bg-white" /></> : null}</div><div className="mt-2 flex justify-between text-sm"><span><span className="mr-1.5 inline-block size-2 rounded-full bg-[var(--wc-red)]" />{c.crypto} {fmtPct(div?.cryptoPct, false)}</span><span><span className="mr-1.5 inline-block size-2 rounded-full bg-white" />{c.stocks} {fmtPct(div?.stockPct, false)}</span></div></Card>
                </div>
                {loadingQ && !Object.keys(q).length ? <p className="text-sm text-white/50">{c.loadingPrices}</p> : null}
                {(() => {
                  const stale = open.filter((h) => q[h.key]?.stale).map((h) => data.assets[h.key]?.symbol).filter(Boolean)
                  return stale.length ? (
                    <p className="text-sm text-amber-200/90">
                      {lang === 'nl'
                        ? `Laatst bekende prijs voor ${stale.join(', ')}: de koersbron reageerde niet. We proberen het automatisch opnieuw.`
                        : `Last known price for ${stale.join(', ')}: the price source did not respond. Retrying automatically.`}
                    </p>
                  ) : null
                })()}
                {qAt ? <DataStamp lang={lang} source={lang === 'nl' ? 'CoinGecko (crypto), Yahoo Finance via onze proxy (aandelen, vertraagd)' : 'CoinGecko (crypto), Yahoo Finance via our proxy (stocks, delayed)'} kind="live" at={qAt} updated /> : null}
                {missing.length ? <p className="text-sm text-amber-200/90">⚠ {missing.map((h) => data.assets[h.key]?.symbol).join(', ')}: {c.noPrice}. {lang === 'nl' ? 'Waarde berekend op kostprijs; vul een prijs in bij Posities.' : 'Valued at cost; set a price under Positions.'}</p> : null}

                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">{c.perf}</h2></div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {per.map((p) => (
                      <div key={p.label} className="rounded-xl bg-white/[0.04] p-3">
                        <div className="text-xs text-white/50">{c[p.label]}{p.sinceStart ? ` · ${c.sinceStart}` : ''}</div>
                        <div className={`mt-1 text-xl font-bold tabular-nums ${tone(p.pct)}`}>{fmtPct(p.pct)}</div>
                        <div className={`text-xs tabular-nums ${tone(p.pnl)}`}>{fmtMoney(p.pnl, base, lang)}</div>
                      </div>
                    ))}
                  </div>
                  <h3 className="mt-6 text-sm font-semibold text-white/70">{c.valueChart}</h3>
                  <div className="mt-2"><Suspense fallback={<ChartFallback h="h-72" />}><ValueChart pts={pts} investedStart={investedStart} money={money} compact={moneyCompact} locale={locale} t={c.chart} /></Suspense></div>
                  <p className="mt-2 text-xs text-white/40">{c.histNote}</p>
                </Card>

                <Card>
                  <h2 className="text-lg font-bold">{c.monthly}</h2>
                  <div className="mt-3"><Suspense fallback={<ChartFallback h="h-60" />}><MonthlyChart pts={pts} locale={locale} t={c.chart} /></Suspense></div>
                  <p className="mt-2 text-xs text-white/40">{c.monthlyNote}</p>
                </Card>

                <Card>
                  <h2 className="text-lg font-bold">{c.bench.h}</h2>
                  <div className="mt-3"><Suspense fallback={<ChartFallback h="h-72" />}><BenchmarkChart rows={benchRows} locale={locale} t={{ ...c.bench, empty: c.chart.empty }} /></Suspense></div>
                  <p className="mt-2 text-xs text-white/40">{c.bench.note}</p>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <h2 className="text-lg font-bold">{c.alloc}</h2>
                    <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row">
                      <Suspense fallback={<div className="size-52 shrink-0 animate-pulse rounded-full bg-white/[0.03]" />}><AllocationChart parts={allocParts} money={money} /></Suspense>
                      <ul className="w-full space-y-1.5 text-sm">
                        {allocParts.map((p) => (
                          <li key={p.label} className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2"><span className="inline-block size-2.5 rounded-full" style={{ background: p.color }} />{p.label}</span>
                            <span className="tabular-nums text-white/70">{((p.value / (grandTotal || 1)) * 100).toFixed(1)}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {div ? <p className="mt-4 text-sm text-white/60">{c.effective}: <span className="font-semibold text-white">{div.effective.toFixed(1)}</span> · {divLabel}</p> : null}
                  </Card>
                  <Card>
                    <h2 className="text-lg font-bold">{c.risk}</h2>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      {([
                        [c.maxDd, fmtPct(dd.max), dd.max < -30 ? 'bad' : dd.max < -15 ? 'warn' : 'ok'],
                        [c.curDd, fmtPct(dd.current), dd.current < -20 ? 'bad' : dd.current < -10 ? 'warn' : 'ok'],
                        [c.vol, vol === undefined ? '–' : vol.toFixed(1) + '%', vol === undefined ? 'ok' : vol > 80 ? 'bad' : vol > 40 ? 'warn' : 'ok'],
                        [c.largest, fmtPct(div?.largest, false), (div?.largest ?? 0) > 50 ? 'bad' : (div?.largest ?? 0) > 25 ? 'warn' : 'ok'],
                        [c.top3, fmtPct(div?.top3, false), (div?.top3 ?? 0) > 80 ? 'warn' : 'ok'],
                        [c.stable, fmtPct(div?.stablePct, false), 'ok'],
                      ] as [string, string, 'ok' | 'warn' | 'bad'][]).map(([k, v, lvl]) => (
                        <div key={k} className="rounded-xl bg-white/[0.04] p-3">
                          <dt className="text-xs text-white/50">{k}</dt>
                          <dd className={`mt-1 text-lg font-bold tabular-nums ${lvl === 'bad' ? 'text-[var(--wc-red-soft)]' : lvl === 'warn' ? 'text-amber-300' : 'text-white'}`}>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </Card>
                </div>

                {splitTotal > 0 ? (
                  <Card>
                    <h2 className="text-lg font-bold">{c.split.h}</h2>
                    <p className="mt-1 text-sm text-white/55">{c.split.p}</p>
                    <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                      {(['btc', 'alts', 'stables', 'stocks'] as const).map((k) => split[k] > 0 ? <div key={k} style={{ width: `${(split[k] / splitTotal) * 100}%`, background: SPLIT_COLORS[k] }} /> : null)}
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      {(['btc', 'alts', 'stables', 'stocks'] as const).map((k) => (
                        <div key={k} className="rounded-xl bg-white/[0.04] p-3">
                          <dt className="flex items-center gap-2 text-xs text-white/50"><span className="inline-block size-2.5 rounded-full" style={{ background: SPLIT_COLORS[k] }} />{c.split[k]}</dt>
                          <dd className="mt-1 text-lg font-bold tabular-nums">{fmtPct((split[k] / splitTotal) * 100, false)}</dd>
                        </div>
                      ))}
                    </dl>
                    {split.alts / splitTotal > 0.6 ? <p className="mt-3 text-sm text-amber-300">{c.split.altWarn}</p> : null}
                    {chains.length ? (
                      <div className="mt-5">
                        <h3 className="text-sm font-semibold">{c.split.chains}</h3>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          {chains.map(([name, v]) => (
                            <li key={name} className="flex items-center gap-3">
                              <span className="w-28 shrink-0 truncate text-white/70">{name}</span>
                              <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-[var(--wc-red)]" style={{ width: `${(v / walletValue) * 100}%` }} /></span>
                              <span className="w-14 shrink-0 text-right tabular-nums text-white/70">{fmtPct((v / walletValue) * 100, false)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </Card>
                ) : null}
                {secTotal > 0 ? (
                  <Card>
                    <h2 className="text-lg font-bold">{c.sector.h}</h2>
                    <p className="mt-1 text-sm text-white/55">{c.sector.p}</p>
                    <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                      {secParts.map((p) => <div key={p.label} style={{ width: `${(p.value / secTotal) * 100}%`, background: p.color }} />)}
                    </div>
                    <ul className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                      {secParts.map((p) => (
                        <li key={p.label} className="flex items-center gap-2">
                          <span className="inline-block size-2.5 shrink-0 rounded-full" style={{ background: p.color }} aria-hidden="true" />
                          <span className="min-w-0 flex-1 truncate text-white/75">{p.label}</span>
                          <span className="tabular-nums text-white/60">{moneyCompact(p.value)}</span>
                          <span className="w-14 text-right font-semibold tabular-nums">{fmtPct((p.value / secTotal) * 100, false)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-white/40">{c.sector.note}</p>
                  </Card>
                ) : null}
                {divRows.length ? (
                  <Card>
                    <h2 className="text-lg font-bold">{c.dividend.h}</h2>
                    <p className="mt-1 text-sm text-white/55">{c.dividend.p}</p>
                    <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                      {([[c.dividend.total, divTotal], [c.dividend.last12, div12], [c.dividend.next, divNext]] as [string, number][]).map(([l, v]) => (
                        <div key={l} className="rounded-xl bg-white/[0.04] p-3">
                          <dt className="text-xs text-white/50">{l}</dt>
                          <dd className="mt-1 text-lg font-bold tabular-nums">{money(v)}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[420px] text-sm">
                        <thead className="text-left text-xs text-white/45">
                          <tr><th className="py-2 font-medium">{c.dividend.stock}</th><th className="py-2 text-right font-medium">{c.dividend.total}</th><th className="py-2 text-right font-medium">{c.dividend.last12}</th><th className="py-2 text-right font-medium">{c.dividend.next}</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {divRows.map((r) => (
                            <tr key={r.key}><td className="py-2 font-semibold">{r.symbol}</td><td className="py-2 text-right tabular-nums">{money(r.total)}</td><td className="py-2 text-right tabular-nums">{money(r.last12)}</td><td className="py-2 text-right tabular-nums text-white/70">{money(r.next)}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-xs text-white/40">{c.dividend.nextNote}</p>
                  </Card>
                ) : null}
                <Card>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-lg font-bold">{c.snap.h}</h2>
                    {snapRows.length ? <span className="text-xs text-white/45">{c.snap.days(snapRows.length)} · {c.snap.since(new Date(snapRows[0].t).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }))}</span> : null}
                  </div>
                  <p className="mt-1 text-sm text-white/55">{c.snap.p}</p>
                  <div className="mt-3"><Suspense fallback={<ChartFallback h="h-56" />}><SnapshotChart rows={snapRows} money={money} compact={moneyCompact} locale={locale} t={c.snap} /></Suspense></div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* ---------------- POSITIONS ---------------- */}
        {tab === 'positions' && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-white/[0.04] text-left text-xs text-white/50">
                <tr>
                  <th className="px-3 py-2.5 font-medium">{c.cols.asset}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.qty}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.avg}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.price}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.d24}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.value}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.pnl}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.weight}</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {open.map((h) => {
                  const a = data.assets[h.key]
                  return (
                    <tr key={h.key} className="hover:bg-white/[0.03]">
                      <td className="px-3 py-2.5"><AssetBadge lang={lang} a={a ? { ...a, image: a.image ?? q[h.key]?.image } : undefined} /></td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{fmtNum(h.qty, lang)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-white/70">{fmtMoney(h.avg, base, lang)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {q[h.key] ? fmtMoney(h.price, base, lang) : (
                          <button type="button" className="text-xs text-amber-300 underline" onClick={() => {
                            const v = window.prompt(`${c.setPrice} (${a?.symbol}, ${base})`, data.manualPrices[h.key] ? String(data.manualPrices[h.key]) : '')
                            const p = v ? parseFloat(v.replace(',', '.')) : NaN
                            if (p > 0) update((d) => { d.manualPrices[h.key] = p; return d })
                          }}>{data.manualPrices[h.key] ? fmtMoney(data.manualPrices[h.key], base, lang) : c.setPrice}</button>
                        )}
                      </td>
                      <td className={`px-3 py-2.5 text-right tabular-nums ${tone(h.change24h)}`}>{fmtPct(h.change24h)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{fmtMoney(h.value, base, lang)}</td>
                      <td className={`px-3 py-2.5 text-right tabular-nums ${tone(h.unrealized)}`}>{fmtMoney(h.unrealized, base, lang)}<span className="block text-xs">{fmtPct(h.unrealizedPct)}</span></td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-white/70">{(h.weight * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2.5 text-right"><button type="button" onClick={() => a && setForm({ preset: a })} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/70 hover:border-[var(--wc-red)] hover:text-white">+ / −</button></td>
                    </tr>
                  )
                })}
                {!open.length ? <tr><td colSpan={9} className="px-3 py-8 text-center text-white/50">{c.emptyP}</td></tr> : null}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- WALLETS ---------------- */}
        {tab === 'wallets' && (
          <div className="mt-6 grid gap-4">
            <Card>
              <h2 className="text-lg font-bold">{c.w.title}</h2>
              <p className="mt-1 max-w-3xl text-sm text-white/60">{c.w.intro}</p>
              <form onSubmit={(e) => { e.preventDefault(); addWallet() }} className="mt-4 grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
                <label className="grid gap-1 text-sm">
                  <span className="text-white/60">{c.w.address}</span>
                  <input value={wAddr} onChange={(e) => { setWAddr(e.target.value); setWErr('') }} placeholder={c.w.addressPh} spellCheck={false} autoComplete="off" autoCapitalize="off" className="min-w-0 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 font-mono text-sm outline-none focus:border-[var(--wc-red)]" />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-white/60">{c.w.label}</span>
                  <input value={wLabel} onChange={(e) => setWLabel(e.target.value)} placeholder={c.w.labelPh} maxLength={40} className="min-w-0 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-[var(--wc-red)]" />
                </label>
                <button type="submit" disabled={!wAddr.trim()} className="rounded-full bg-[var(--wc-red)] px-5 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-40">{c.w.add}</button>
              </form>
              {wErr ? <p className="mt-2 text-sm text-[var(--wc-red-soft)]">{wErr}</p> : wAddr.trim() && detectWallet(wAddr) ? <p className="mt-2 text-sm text-emerald-400">✓ {c.w.detected[detectWallet(wAddr)!.type]}</p> : null}
              <p className="mt-3 text-xs text-white/45">{c.w.networks}</p>
            </Card>

            {data.wallets.length ? (
              <>
                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Label>{c.w.total}</Label>
                      <div className="mt-1 text-3xl font-bold tabular-nums">{wsync ? fmtMoney(walletValue, base, lang, true) : '…'}</div>
                      <div className={`mt-1 text-sm tabular-nums ${tone(walletDay24)}`}>{c.today}: {fmtMoney(walletDay24, base, lang)}</div>
                    </div>
                    <div className="text-right text-sm text-white/55">
                      <div>{wBusy ? c.w.syncing : `${c.w.lastSync}: ${wsync ? new Date(wsync.at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : c.w.never}`}</div>
                      <button type="button" disabled={wBusy} onClick={() => void syncWallets(true)} className="mt-2 rounded-full border border-white/15 px-4 py-1.5 font-semibold text-white/85 transition hover:border-white/40 disabled:opacity-40">{c.w.refresh}</button>
                    </div>
                  </div>
                </Card>

                {data.wallets.map((w) => {
                  const toks = wTokens.filter((t) => t.wallet === w.id).sort((a, b) => b.value - a.value)
                  const val = toks.reduce((s2, t) => s2 + t.value, 0)
                  const errs = wsync?.errors[w.id]
                  return (
                    <Card key={w.id}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold">{w.label || c.w.detected[w.type].split(':')[0]}</h3>
                          <p className="truncate font-mono text-xs text-white/50" title={w.address}>{w.address}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold tabular-nums">{wsync ? fmtMoney(val, base, lang) : '…'}</span>
                          <button type="button" onClick={() => update((d) => { d.wallets = d.wallets.filter((x) => x.id !== w.id); return d })} className="text-xs text-white/50 hover:text-[var(--wc-red-soft)]">{c.w.remove}</button>
                        </div>
                      </div>
                      {errs?.length ? <p className="mt-2 text-xs text-amber-300/90">{c.w.errors(errs.join(', '))}</p> : null}
                      {toks.length ? (
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full min-w-[560px] text-sm">
                            <thead className="text-left text-xs text-white/50">
                              <tr><th className="py-2 pr-3">{c.w.cols.asset}</th><th className="py-2 pr-3">{c.w.cols.chain}</th><th className="py-2 pr-3 text-right">{c.w.cols.qty}</th><th className="py-2 pr-3 text-right">{c.w.cols.price}</th><th className="py-2 pr-3 text-right">{c.w.cols.value}</th><th className="py-2 text-right">{c.w.cols.change}</th></tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {toks.map((t) => (
                                <tr key={t.key}>
                                  <td className="py-2 pr-3"><span className="flex items-center gap-2">{t.image ? <img src={t.image} alt="" width={20} height={20} loading="lazy" className="size-5 rounded-full" /> : <span className="flex size-5 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold">{t.symbol.slice(0, 3)}</span>}<span className="font-semibold">{t.symbol}</span><span className="hidden truncate text-white/45 sm:inline">{t.name}</span></span></td>
                                  <td className="py-2 pr-3 text-white/60">{t.chain}</td>
                                  <td className="py-2 pr-3 text-right tabular-nums">{fmtNum(t.qty, lang)}</td>
                                  <td className="py-2 pr-3 text-right tabular-nums">{fmtMoney(t.priceUsd !== undefined ? t.priceUsd * usdRate : undefined, base, lang)}</td>
                                  <td className="py-2 pr-3 text-right font-semibold tabular-nums">{fmtMoney(t.value, base, lang)}</td>
                                  <td className={`py-2 text-right tabular-nums ${tone(t.change24h)}`}>{fmtPct(t.change24h)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : wsync && !wBusy ? <p className="mt-3 text-sm text-white/50">{c.w.empty}</p> : null}
                    </Card>
                  )
                })}
              </>
            ) : null}
            <p className="text-xs text-white/45">{c.w.double}</p>
            <p className="text-xs text-white/45">{c.w.privacy}</p>
          </div>
        )}

        {/* ---------------- TRANSACTIONS ---------------- */}
        {tab === 'txs' && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-white/[0.04] text-left text-xs text-white/50">
                <tr>
                  <th className="px-3 py-2.5 font-medium">{c.date}</th>
                  <th className="px-3 py-2.5 font-medium">{c.type}</th>
                  <th className="px-3 py-2.5 font-medium">{c.cols.asset}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.qty}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.cols.price}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{c.fee}</th>
                  <th className="px-3 py-2.5 font-medium">{c.note}</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...data.txs].reverse().map((t) => (
                  <tr key={t.id}>
                    <td className="px-3 py-2.5 tabular-nums text-white/70">{t.date}</td>
                    <td className={`px-3 py-2.5 font-semibold ${t.type === 'buy' ? 'text-emerald-400' : 'text-[var(--wc-red-soft)]'}`}>{t.type === 'buy' ? c.buy : c.sell}</td>
                    <td className="px-3 py-2.5">{data.assets[t.asset]?.symbol}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{fmtNum(t.qty, lang)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{fmtMoney(t.price, base, lang)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-white/60">{t.fee ? fmtMoney(t.fee, base, lang) : '–'}</td>
                    <td className="max-w-[12rem] truncate px-3 py-2.5 text-white/60">{t.note}</td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      {data.assets[t.asset] ? <button type="button" onClick={() => setForm({ preset: data.assets[t.asset], edit: t })} className="mr-3 text-xs text-white/60 hover:text-white">{c.edit}</button> : null}
                      <button type="button" onClick={() => update((d) => { d.txs = d.txs.filter((x) => x.id !== t.id); return d })} className="text-xs text-white/50 hover:text-[var(--wc-red-soft)]">{c.del}</button>
                    </td>
                  </tr>
                ))}
                {!data.txs.length ? <tr><td colSpan={8} className="px-3 py-8 text-center text-white/50">{c.emptyP}</td></tr> : null}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- WATCHLISTS ---------------- */}
        {/* ---------------- SETTINGS ---------------- */}
        {tab === 'settings' && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="text-lg font-bold">{c.settings.base}</h2>
              <div className="mt-3 inline-flex rounded-full border border-white/15 p-1">
                {(['EUR', 'USD'] as Currency[]).map((cur) => (
                  <button key={cur} type="button" disabled={data.txs.length > 0} onClick={() => { update((d) => { d.base = cur; return d }); setHist({}) }} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${base === cur ? 'bg-white text-black' : 'text-white/70 hover:text-white disabled:opacity-40'}`}>{cur}</button>
                ))}
              </div>
              {data.txs.length ? <p className="mt-2 text-xs text-white/45">{c.settings.baseLocked}</p> : null}
            </Card>
            <Card>
              <h2 className="text-lg font-bold">{c.settings.exportH}</h2>
              <p className="mt-1 text-sm text-white/60">{c.settings.exportP}</p>
              <p className="mt-2 text-sm text-white/60">{lang === 'nl' ? 'Alles in één bestand (ook watchlist en journal):' : 'Everything in one file (watchlist and journal too):'} <a href={paths[lang].watchlist + '#backup'} className="font-semibold text-[var(--wc-red-soft)] hover:underline">{lang === 'nl' ? 'volledige back-up' : 'full backup'} →</a></p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => exportJson(data)} className={btn('primary', 'sm')}>{c.settings.exportJson}</button>
                <button type="button" onClick={() => exportCsv(data)} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40">{c.settings.exportCsv}</button>
              </div>
            </Card>
            <Card>
              <h2 className="text-lg font-bold">{c.settings.importH}</h2>
              <p className="mt-1 text-sm text-white/60">{c.settings.importP}</p>
              <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void onImport(e)} />
              <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40">{c.settings.importBtn}</button>
              <input ref={csvRef} type="file" accept="text/csv,.csv" className="hidden" onChange={(e) => void onImportCsv(e)} />
              <p className="mt-4 text-sm text-white/60">{c.settings.csvP}</p>
              <button type="button" onClick={() => csvRef.current?.click()} className="mt-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40">{c.settings.csvBtn}</button>
              {msg ? <p className="mt-2 text-sm text-white/70">{msg}</p> : null}
            </Card>
            <Card>
              <h2 className="text-lg font-bold">{c.settings.clearH}</h2>
              <p className="mt-1 text-sm text-white/60">{c.settings.clearP}</p>
              {confirmClear ? (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => { try { localStorage.removeItem(storageKey(pidRef.current)) } catch { /* ignore */ } setData(load(pidRef.current)); setHist({}); setQ({}); setConfirmClear(false) }} className={btn('primary', 'sm')}>{c.settings.confirm}</button>
                  <button type="button" onClick={() => setConfirmClear(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80">{c.form.cancel}</button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmClear(true)} className="mt-3 rounded-full border border-[var(--wc-red)]/60 px-4 py-2 text-sm font-semibold text-[var(--wc-red-soft)]">{c.settings.clear}</button>
              )}
            </Card>
            <Card className="lg:col-span-2">
              <h2 className="text-lg font-bold">{c.settings.privacyH}</h2>
              <p className="mt-1 text-sm text-white/60">{c.settings.privacyP}</p>
            </Card>
          </div>
        )}

        <p className="mt-8 max-w-3xl text-sm text-white/45">{c.disclaimer}</p>
        <aside className="mt-8 max-w-3xl rounded-2xl border border-[var(--wc-red)]/50 bg-gradient-to-b from-[var(--wc-red)]/15 to-white/[0.02] p-6 sm:p-8">
          <h2 className="text-xl font-bold">{c.ctaH}</h2>
          <p className="mt-2 text-white/70">{c.ctaP}</p>
          <a href={DISCORD_URL} className={`mt-5 ${btn()}`}>{c.ctaBtn}</a>
        </aside>
      </div>

      {form ? <TxForm c={c} lang={lang} data={data} quotesNow={q} preset={form.preset} edit={form.edit} held={held} onSave={saveTx} onClose={() => setForm(null)} /> : null}
    </main>
  )
}
