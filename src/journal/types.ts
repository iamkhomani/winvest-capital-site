// Trading journal data model. Everything is stored in the visitor's browser (IndexedDB).
// Times are stored as UTC ISO strings; amounts per trade are in the account currency.

export type AccountCurrency = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'JPY' | 'AUD' | 'CAD' | 'NZD'
export const ACCOUNT_CURRENCIES: AccountCurrency[] = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD', 'NZD']

export type Account = {
  id: string
  name: string
  broker?: string
  type: 'live' | 'demo'
  currency: AccountCurrency
  startBalance: number
  startDate: string // YYYY-MM-DD
  leverage?: number
  archived?: boolean
}

export type CashMove = {
  id: string
  accountId: string
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'adjustment'
  amount: number // always positive, in the account currency (adjustment may be negative)
  time: string // ISO
  note?: string
  linkId?: string // links the two sides of a transfer
}

export type ExitKind = 'tp' | 'partial' | 'sl' | 'be' | 'manual'

export type Exit = {
  id: string
  time: string // ISO
  price: number
  lots: number // standard lots closed
  kind: ExitKind
  pnl: number // net result in account currency (incl. commission and swap)
  commission?: number // negative = cost
  swap?: number
  pnlSource: 'calc' | 'broker'
}

export type Plan = 'strategy' | 'impulse'
export type Emotion = 'calm' | 'confident' | 'fearful' | 'frustrated' | 'greedy' | 'fomo' | 'bored' | 'tired'
export const EMOTIONS: Emotion[] = ['calm', 'confident', 'fearful', 'frustrated', 'greedy', 'fomo', 'bored', 'tired']
export const CONDITIONS = ['trending', 'ranging', 'volatile', 'news', 'low_liquidity'] as const
export type Condition = (typeof CONDITIONS)[number]
export const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'] as const

export type Shot = { id: string; kind: 'before' | 'after'; name?: string } // image blob lives in IndexedDB "images"

export type Trade = {
  id: string
  accountId: string
  pair: string // normalised, e.g. EURUSD, XAUUSD
  direction: 'buy' | 'sell'
  entry: number
  sl?: number // initial stop loss
  tps: number[] // planned take profits
  lots: number // standard lots opened
  leverage?: number
  riskPct?: number // manually entered risk %
  openTime: string // ISO
  timeframe?: string
  setup?: string
  condition?: Condition
  plan?: Plan
  emotion?: Emotion
  revenge?: boolean
  notes?: string
  links: string[] // e.g. TradingView snapshot links
  shots: Shot[]
  slMoves: { time: string; price: number }[]
  exits: Exit[]
  convEntry?: number // quote -> account currency rate at entry
  contract?: number // override contract size
  pipSize?: number // override pip size
  mark?: number // manual current price for open trades
  ticket?: string
  source: 'manual' | 'import'
  createdAt: string
  updatedAt: string
}

export type Settings = {
  tz: string
  displayCurrency: AccountCurrency
  maxRiskPct: number
  maxLeverage: number
  maxTradesPerDay: number
  revengeMinutes: number
  beThresholdR: number
}

export type JournalState = {
  app: 'winvest-journal'
  version: 1
  accounts: Account[]
  cash: CashMove[]
  trades: Trade[]
  settings: Settings
}

export const defaultSettings = (): Settings => ({
  tz: (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Amsterdam'
    } catch {
      return 'Europe/Amsterdam'
    }
  })(),
  displayCurrency: 'EUR',
  maxRiskPct: 2,
  maxLeverage: 30,
  maxTradesPerDay: 5,
  revengeMinutes: 30,
  beThresholdR: 0.1,
})

export const emptyState = (): JournalState => ({ app: 'winvest-journal', version: 1, accounts: [], cash: [], trades: [], settings: defaultSettings() })

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-5)
