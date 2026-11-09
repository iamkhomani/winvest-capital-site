// Portfolio charts built with EvilCharts (Recharts), styled in the Winvest Capital brand.
// Loaded lazily from the portfolio page so the chart library only downloads when it is needed.
import { useMemo } from 'react'
import { EvilAreaChart } from '../components/evilcharts/charts/recharts-area-chart'
import { EvilBarChart } from '../components/evilcharts/charts/recharts-bar-chart'
import { EvilPieChart } from '../components/evilcharts/charts/recharts-pie-chart'
import type { ChartConfig } from '../components/evilcharts/ui/recharts-chart'
import type { Point } from './calc'

const RED = '#FE0000'
const GAIN = '#34D399'
const LOSS = '#FF4D4D'

type Fmt = (v: number) => string
type Txt = { value: string; invested: string; gain: string; loss: string; empty: string }

const day = (t: number, locale: string, long = false) =>
  new Date(t).toLocaleDateString(locale, long ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' })

/** Portfolio value vs. net invested capital (value line in brand red with a glow-like gradient). */
export function ValueChart({ pts, investedStart, money, compact, locale, t }: { pts: Point[]; investedStart: number; money: Fmt; compact: Fmt; locale: string; t: Txt }) {
  const data = useMemo(() => {
    let inv = investedStart
    const out: { t: number; label: string; value: number; invested: number }[] = []
    for (const p of pts) {
      inv += p.flow
      if (p.value > 0) out.push({ t: p.t, label: day(p.t, locale), value: Math.round(p.value * 100) / 100, invested: Math.max(0, Math.round(inv * 100) / 100) })
    }
    return out
  }, [pts, investedStart, locale])
  const config = useMemo(
    () =>
      ({
        value: { label: t.value, colors: { dark: [RED], light: [RED] } },
        invested: { label: t.invested, colors: { dark: ['#FFFFFF'], light: ['#141414'] } },
      }) satisfies ChartConfig,
    [t.value, t.invested],
  )
  if (data.length < 2) return <div className="flex h-56 items-center justify-center text-sm text-white/40">{t.empty}</div>
  return (
    <div className="h-64 w-full sm:h-72 min-w-0 overflow-hidden">
      <EvilAreaChart data={data} config={config} className="h-full w-full" curveType="monotone" xDataKey="label">
        <EvilAreaChart.Grid />
        <EvilAreaChart.XAxis dataKey="label" minTickGap={32} />
        <EvilAreaChart.YAxis width={64} tickFormatter={(v: number) => compact(v)} domain={['auto', 'auto']} />
        <EvilAreaChart.Legend isClickable />
        <EvilAreaChart.Tooltip variant="frosted-glass" valueFormatter={money} labelFormatter={(_l: unknown, payload: unknown) => {
          const row = (payload as { payload?: { t?: number } }[] | undefined)?.[0]?.payload
          return row?.t ? day(row.t, locale, true) : ''
        }} />
        <EvilAreaChart.Area dataKey="invested" variant="lines" strokeVariant="dashed" strokeWidth={1.5} isClickable />
        <EvilAreaChart.Area dataKey="value" variant="gradient" strokeWidth={2.5} isClickable>
          <EvilAreaChart.ActiveDot variant="default" />
        </EvilAreaChart.Area>
      </EvilAreaChart>
    </div>
  )
}

/** Monthly return (time-weighted, so deposits do not count as gains). */
export function MonthlyChart({ pts, locale, t }: { pts: Point[]; locale: string; t: Txt }) {
  const data = useMemo(() => {
    const ends = new Map<string, Point>()
    for (const p of pts) ends.set(new Date(p.t).toISOString().slice(0, 7), p)
    const months = [...ends.entries()]
    const out: { label: string; gain: number | null; loss: number | null }[] = []
    let prev = pts.find((p) => p.value > 0)
    for (const [m, p] of months) {
      if (!prev || p.t <= prev.t) continue
      const r = (p.index / prev.index - 1) * 100
      const label = new Date(m + '-01T00:00:00Z').toLocaleDateString(locale, { month: 'short', year: '2-digit' })
      if (isFinite(r)) out.push({ label, gain: r >= 0 ? Math.round(r * 100) / 100 : null, loss: r < 0 ? Math.round(r * 100) / 100 : null })
      prev = p
    }
    return out.slice(-12)
  }, [pts, locale])
  const config = useMemo(
    () =>
      ({
        gain: { label: t.gain, colors: { dark: [GAIN], light: ['#059669'] } },
        loss: { label: t.loss, colors: { dark: [LOSS], light: ['#C80000'] } },
      }) satisfies ChartConfig,
    [t.gain, t.loss],
  )
  if (data.length < 2) return <div className="flex h-48 items-center justify-center text-sm text-white/40">{t.empty}</div>
  const pct = (v: number) => (v > 0 ? '+' : '') + v.toFixed(2) + '%'
  return (
    <div className="h-60 w-full min-w-0 overflow-hidden">
      <EvilBarChart data={data} config={config} className="h-full w-full" stackType="stacked" barRadius={4}>
        <EvilBarChart.Grid />
        <EvilBarChart.XAxis dataKey="label" />
        <EvilBarChart.YAxis width={52} tickFormatter={(v: number) => v.toFixed(0) + '%'} />
        <EvilBarChart.Tooltip variant="frosted-glass" valueFormatter={pct} />
        <EvilBarChart.Bar dataKey="gain" variant="default" glowing />
        <EvilBarChart.Bar dataKey="loss" variant="default" glowing />
      </EvilBarChart>
    </div>
  )
}

/** Allocation donut; colours follow the palette used in the legend next to it. */
export function AllocationChart({ parts, money }: { parts: { label: string; value: number; color: string }[]; money: Fmt }) {
  const { data, config } = useMemo(() => {
    const cfg: ChartConfig = {}
    const rows = parts.map((p, i) => {
      cfg['a' + i] = { label: p.label, colors: { dark: [p.color], light: [p.color] } }
      return { name: 'a' + i, value: Math.round(p.value * 100) / 100 }
    })
    return { data: rows, config: cfg }
  }, [parts])
  if (!data.length) return null
  return (
    <div className="size-52 shrink-0">
      <EvilPieChart data={data} dataKey="value" nameKey="name" config={config} className="h-full w-full">
        <EvilPieChart.Tooltip variant="frosted-glass" valueFormatter={money} />
        <EvilPieChart.Pie innerRadius="58%" paddingAngle={2} cornerRadius={4} isClickable glowingSectors={['a0']} />
      </EvilPieChart>
    </div>
  )
}
