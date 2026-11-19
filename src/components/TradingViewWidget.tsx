import { useEffect, useRef, useState } from 'react'

// Loads a TradingView embed widget on the client only.
// On touch screens a transparent layer lies over the widget, so a swipe over it scrolls the page
// instead of the widget. One tap removes the layer and the widget can be used as normal.
export default function TradingViewWidget({
  script,
  config,
  className = '',
  touchGuard = true,
}: {
  script: string
  config: Record<string, unknown>
  className?: string
  /** false for widgets that do not scroll themselves, such as the ticker tape. */
  touchGuard?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const json = JSON.stringify(config)
  const [guard, setGuard] = useState(false)
  useEffect(() => {
    setGuard(touchGuard && window.matchMedia('(pointer: coarse)').matches)
  }, [touchGuard])
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
  const nl = typeof document !== 'undefined' && document.documentElement.lang === 'nl'
  return (
    <div className="relative">
      <div ref={ref} className={`tradingview-widget-container ${className}`} />
      {guard && (
        <button
          type="button"
          onClick={() => setGuard(false)}
          className="absolute inset-0 z-10 flex items-end justify-center bg-transparent pb-3"
          aria-label={nl ? 'Tik om de grafiek te gebruiken' : 'Tap to use the chart'}
        >
          <span className="rounded-full border border-white/15 bg-[var(--wc-black)]/85 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
            {nl ? 'Tik om te gebruiken' : 'Tap to use'}
          </span>
        </button>
      )}
    </div>
  )
}
