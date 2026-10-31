import { useEffect, useRef } from 'react'

// Live price banner (TradingView ticker tape widget). Edit symbols here.
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

export default function Ticker() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || el.querySelector('script')) return
    const s = document.createElement('script')
    s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    s.async = true
    s.innerHTML = JSON.stringify({
      symbols: SYMBOLS,
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'en',
    })
    el.appendChild(s)
  }, [])
  return (
    <div className="border-b border-white/10 bg-black/60">
      <div ref={ref} className="tradingview-widget-container min-h-[46px]">
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  )
}
