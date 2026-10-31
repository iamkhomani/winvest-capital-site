import { useEffect, useRef } from 'react'

// Loads a TradingView embed widget on the client only.
export default function TradingViewWidget({
  script,
  config,
  className = '',
}: {
  script: string
  config: Record<string, unknown>
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const json = JSON.stringify(config)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = '<div class="tradingview-widget-container__widget"></div>'
    const s = document.createElement('script')
    s.src = `https://s3.tradingview.com/external-embedding/${script}`
    s.async = true
    s.innerHTML = json
    el.appendChild(s)
  }, [script, json])
  return <div ref={ref} className={`tradingview-widget-container ${className}`} />
}
