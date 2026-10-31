import type { Lang } from '../i18n'
import TradingViewWidget from './TradingViewWidget'

// Live price banner. Edit symbols here.
const SYMBOLS = [
  { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
  { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
  { proName: 'BINANCE:SOLUSDT', title: 'Solana' },
  { proName: 'BINANCE:XRPUSDT', title: 'XRP' },
  { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
  { proName: 'FOREXCOM:NSXUSD', title: 'Nasdaq 100' },
  { proName: 'NASDAQ:NVDA', title: 'Nvidia' },
  { proName: 'NASDAQ:AAPL', title: 'Apple' },
  { proName: 'NASDAQ:TSLA', title: 'Tesla' },
  { proName: 'FX_IDC:EURUSD', title: 'EUR/USD' },
  { proName: 'OANDA:XAUUSD', title: 'Gold' },
]

export default function Ticker({ lang }: { lang: Lang }) {
  return (
    <div className="border-b border-white/10 bg-black/60">
      <TradingViewWidget
        className="min-h-[46px]"
        script="embed-widget-ticker-tape.js"
        config={{
          symbols: SYMBOLS,
          showSymbolLogo: true,
          isTransparent: true,
          displayMode: 'adaptive',
          colorTheme: 'dark',
          locale: lang === 'nl' ? 'nl_NL' : 'en',
        }}
      />
    </div>
  )
}
