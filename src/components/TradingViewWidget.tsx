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
    const build = () => {
      const settings = JSON.parse(json)
      if ('colorTheme' in settings) settings.colorTheme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
      el.innerHTML = '<div class="tradingview-widget-container__widget"></div>'
      const s = document.createElement('script')
      s.src = `https://s3.tradingview.com/external-embedding/${script}`
      s.async = true
      s.innerHTML = JSON.stringify(settings)
      el.appendChild(s)
    }
    build()
    window.addEventListener('wc-theme', build)
    return () => window.removeEventListener('wc-theme', build)
  }, [script, json])
  return <div ref={ref} className={`tradingview-widget-container ${className}`} />
}
