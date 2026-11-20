// Shared UI patterns for every page: page header, card, tabs and button styles.
// One look and one behaviour across Markets, Portfolio, Journal, News, tools and the dashboard.
// Brand colours and radii are the existing ones; nothing here adds new visual elements.
import type { ReactNode } from 'react'

/** Card surface, for places that need the class instead of the component. */
export const cardBase = 'min-w-0 rounded-2xl border border-white/10 bg-white/[0.03]'

/** A card with an optional title, one-line description and a "See all" style link. */
export function Card({ children, className = '', title, desc, more }: { children?: ReactNode; className?: string; title?: ReactNode; desc?: ReactNode; more?: { href: string; label: string } }) {
  return (
    <div className={`${cardBase} p-4 sm:p-5 ${className}`}>
      {title || more ? (
        <div className="flex items-baseline justify-between gap-3">
          {title ? <h2 className="text-lg font-bold">{title}</h2> : <span />}
          {more ? <a href={more.href} className="shrink-0 text-sm font-semibold text-[var(--wc-red-soft)] hover:underline">{more.label} →</a> : null}
        </div>
      ) : null}
      {desc ? <p className="mt-1 text-sm text-white/55">{desc}</p> : null}
      {children}
    </div>
  )
}

/** Button styles: primary (one per screen), secondary (outline), quiet (text). Sizes md (default) and sm. */
export function btn(kind: 'primary' | 'secondary' | 'quiet' = 'primary', size: 'md' | 'sm' = 'md') {
  const s = size === 'sm' ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-sm'
  if (kind === 'primary') return `inline-flex items-center justify-center gap-2 rounded-full bg-[var(--wc-red)] ${s} font-semibold text-white transition hover:brightness-110`
  if (kind === 'secondary') return `inline-flex items-center justify-center gap-2 rounded-full border border-white/20 ${s} font-semibold text-white transition hover:border-white/50`
  return `inline-flex items-center gap-1 ${size === 'sm' ? 'text-sm' : 'text-sm'} font-semibold text-white/60 transition hover:text-white`
}

/** One tab style everywhere; scrolls sideways on small screens. */
export const tabCls = (on: boolean) => `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${on ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`

export function Tabs<T extends string>({ items, value, onChange, label, className = '' }: { items: { id: T; label: ReactNode }[]; value: T; onChange: (id: T) => void; label?: string; className?: string }) {
  return (
    <div role="tablist" aria-label={label} className={`flex gap-1 overflow-x-auto rounded-full border border-white/15 p-1 sm:inline-flex ${className}`}>
      {items.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)} className={tabCls(value === t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

/** Page header: breadcrumb, H1, one-line intro and an optional primary action. Compact on phones. */
export function PageHeader({ home, title, intro, action, crumb }: { home: string; title: ReactNode; intro?: ReactNode; action?: ReactNode; crumb?: ReactNode }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-white/45">
        <a href={home} className="hover:text-white">Home</a> <span aria-hidden="true">/</span> {crumb ?? title}
      </nav>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4 sm:mt-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">{title}</h1>
          {intro ? <p className="mt-3 max-w-2xl text-base text-white/70 sm:mt-4 sm:text-lg">{intro}</p> : null}
        </div>
        {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
      </div>
    </>
  )
}

/** Standard page container: same widths and spacing on every tool page. */
export const pageWrap = (wide = true) => `relative mx-auto ${wide ? 'max-w-6xl' : 'max-w-5xl'} px-4 py-8 sm:px-6 sm:py-16`
