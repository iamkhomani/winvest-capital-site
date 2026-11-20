// Shared trading settings for the whole site, stored on this device only:
// account size, account currency and default risk per trade. Used by the lot size calculator
// (and the Plan trade sheet on asset pages), so users enter them once.
export type TradeSettings = { balance: string; currency: string; risk: string }

const KEY = 'wc-settings-v1'
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD', 'NZD']

export function loadSettings(): Partial<TradeSettings> {
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<TradeSettings>
    const out: Partial<TradeSettings> = {}
    if (typeof o.balance === 'string' && /^\d{1,12}([.,]\d{0,2})?$/.test(o.balance)) out.balance = o.balance
    if (typeof o.currency === 'string' && CURRENCIES.includes(o.currency)) out.currency = o.currency
    if (typeof o.risk === 'string' && /^\d{1,2}([.,]\d{0,2})?$/.test(o.risk)) out.risk = o.risk
    return out
  } catch {
    return {}
  }
}

export function saveSettings(patch: Partial<TradeSettings>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...loadSettings(), ...patch }))
  } catch { /* storage blocked */ }
}
