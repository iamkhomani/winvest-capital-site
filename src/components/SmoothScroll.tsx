import { useEffect } from 'react'

/**
 * Smooth wheel scrolling (Lenis) on desktop only.
 * Not loaded on touch devices (native scrolling feels best there) or when the visitor
 * prefers reduced motion. Nested scroll areas, dialogs and anything marked
 * data-lenis-prevent keep their normal scrolling.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return
    let stop: (() => void) | undefined
    let cancelled = false
    import('lenis')
      .then(({ default: Lenis }) => {
        if (cancelled) return
        const lenis = new Lenis({
          autoRaf: true,
          anchors: true,
          allowNestedScroll: true,
          lerp: 0.12,
          wheelMultiplier: 1,
          prevent: (node: HTMLElement) => !!node.closest?.('[data-lenis-prevent], [role="dialog"], dialog, details[open] nav'),
        })
        stop = () => lenis.destroy()
      })
      .catch(() => {
        /* fall back to native scrolling */
      })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [])
  return null
}
