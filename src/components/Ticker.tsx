import type { Lang } from '../i18n'
import TradingViewWidget from './TradingViewWidget'

// Live price banner. Edit symbols here.
const SYMBOLS = [
  { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
  { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
  { proName: 'BINANCE:SOLUSDT', title: 'Solana' },
  { proName: 'BINANCE:XRPUSDT', title: 'XRP' },
  { proName: 'BINANCE:BNBUSDT', title: 'BNB' },
  { proName: 'BINANCE:DOGEUSDT', title: 'Dogecoin' },
  { proName: 'BINANCE:ADAUSDT', title: 'Cardano' },
  { proName: 'BINANCE:LINKUSDT', title: 'Chainlink' },
  { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
  { proName: 'FOREXCOM:NSXUSD', title: 'Nasdaq 100' },
  { proName: 'FOREXCOM:DJI', title: 'Dow Jones' },
  { proName: 'INDEX:DEU40', title: 'DAX' },
  { proName: 'TVC:DXY', title: 'Dollar Index' },
  { proName: 'NASDAQ:NVDA', title: 'Nvidia' },
  { proName: 'NASDAQ:AAPL', title: 'Apple' },
  { proName: 'NASDAQ:TSLA', title: 'Tesla' },
  { proName: 'NASDAQ:MSFT', title: 'Microsoft' },
  { proName: 'NASDAQ:AMZN', title: 'Amazon' },
  { proName: 'NASDAQ:META', title: 'Meta' },
  { proName: 'FX_IDC:EURUSD', title: 'EUR/USD' },
  { proName: 'FX_IDC:GBPUSD', title: 'GBP/USD' },
  { proName: 'FX_IDC:USDJPY', title: 'USD/JPY' },
  { proName: 'OANDA:XAUUSD', title: 'Gold' },
  { proName: 'OANDA:XAGUSD', title: 'Silver' },
  { proName: 'TVC:USOIL', title: 'Crude oil (WTI)' },
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
