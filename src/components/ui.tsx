import type { ImgHTMLAttributes } from 'react'

// Shows the -dark.svg logo in the dark theme and its -light.svg twin in the light theme.
export function ThemedImage({ src = '', className = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <>
      <img {...props} src={src} className={`${className} only-dark`} />
      <img {...props} src={src.replace('-dark.svg', '-light.svg')} className={`${className} only-light`} />
    </>
  )
}

export function Check({ muted = false }: { muted?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`mt-0.5 size-5 shrink-0 ${muted ? 'text-white/30' : 'text-[var(--wc-red)]'}`} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Stars() {
  return (
    <div className="flex gap-0.5 text-[var(--wc-red)]" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden="true">
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </div>
  )
}

export function Candles() {
  const c = [
    [8, 60, 92, 70, 85, 1], [26, 50, 84, 58, 78, 1], [44, 40, 80, 48, 66, 0], [62, 52, 88, 60, 80, 1],
    [80, 34, 70, 40, 62, 1], [98, 28, 60, 36, 52, 0], [116, 38, 64, 44, 58, 1], [134, 22, 50, 28, 44, 1],
    [152, 14, 42, 20, 36, 1], [170, 18, 46, 24, 40, 0], [188, 6, 30, 10, 26, 1],
  ]
  return (
    <svg viewBox="0 0 200 100" className="h-full w-full" aria-hidden="true">
      <polyline points="0,96 40,78 70,82 110,56 140,46 170,40 200,12" fill="none" stroke="var(--wc-red)" strokeOpacity=".35" strokeWidth="1" strokeDasharray="3 3" />
      {c.map(([x, hi, lo, top, bot, up], i) => (
        <g key={i}>
          <line x1={x + 4} x2={x + 4} y1={hi} y2={lo} stroke={up ? 'var(--wc-red)' : '#ffffff55'} strokeWidth="1" />
          <rect x={x} y={top} width="8" height={bot - top} rx="1" fill={up ? 'var(--wc-red)' : '#ffffff22'} stroke={up ? 'var(--wc-red)' : '#ffffff55'} strokeWidth=".8" />
        </g>
      ))}
    </svg>
  )
}
