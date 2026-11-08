// Trading journal charts built with EvilCharts (Recharts), styled in the Winvest Capital brand.
// Loaded lazily from the journal page so the chart library only downloads when it is needed.
import { useMemo } from 'react'
import { EvilAreaChart } from '../components/evilcharts/charts/recharts-area-chart'
import { EvilBarChart } from '../components/evilcharts/charts/recharts-bar-chart'
import { EvilPieChart } from '../components/evilcharts/charts/recharts-pie-chart'
import type { ChartConfig } from '../components/evilcharts/ui/recharts-chart'
import type { Group } from './calc'

const RED = '#FE0000'
const GAIN = { dark: ['#34D399'], light: ['#059669'] }
const LOSS = { dark: ['#FF4D4D'], light: ['#C80000'] }

type Fmt = (v: number) => string
export type ChartText = { balance: string; pnl: string; gain: string; loss: string; wins: string; losses: string; be: string; empty: string }

const r2 = (v: number) => Math.round(v * 100) / 100
const Empty = ({ t, h = 'h-48' }: { t: ChartText; h?: string }) => <div className={`flex ${h} items-center justify-center text-sm text-white/40`}>{t.empty}</div>

/** Equity curve: balance (brand red) or trading P/L only (green/red by result). Steps, because balance only changes when a trade closes. */
export function EquityChart({ points, money, compact, locale, mode, t }: { points: { time: number; v: number }[]; money: Fmt; compact: Fmt; locale: string; mode: 'balance' | 'pnl'; t: ChartText }) {
  const data = useMemo(
    () => points.map((p) => ({ time: p.time, label: new Date(p.time).toLocaleDateString(locale, { day: 'numeric', month: 'short' }), v: r2(p.v) })),
    [points, locale],
  )
  const up = data.length ? data[data.length - 1].v >= (mode === 'pnl' ? 0 : data[0].v) : true
  const config = useMemo(
    () => ({ v: { label: mode === 'pnl' ? t.pnl : t.balance, colors: mode === 'pnl' ? (up ? GAIN : LOSS) : { dark: [RED], light: [RED] } } }) satisfies ChartConfig,
    [mode, up, t.pnl, t.balance],
  )
  if (data.length < 2) return <Empty t={t} h="h-56" />
  return (
    <div className="h-64 w-full sm:h-72">
      <EvilAreaChart data={data} config={config} className="h-full w-full" curveType="stepAfter" xDataKey="label">
        <EvilAreaChart.Grid />
        <EvilAreaChart.XAxis dataKey="label" minTickGap={32} />
        <EvilAreaChart.YAxis width={64} tickFormatter={(v: number) => compact(v)} domain={['auto', 'auto']} />
        <EvilAreaChart.Tooltip variant="frosted-glass" valueFormatter={money} labelFormatter={(_l: unknown, payload: unknown) => {
          const row = (payload as { payload?: { time?: number } }[] | undefined)?.[0]?.payload
          return row?.time ? new Date(row.time).toLocaleString(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
        }} />
        <EvilAreaChart.Area dataKey="v" variant="gradient" strokeWidth={2.5}>
          <EvilAreaChart.ActiveDot variant="default" />
        </EvilAreaChart.Area>
      </EvilAreaChart>
    </div>
  )
}

/** Realised P/L per month (last 12 months that have trades). */
export function MonthlyPnlChart({ byDay, money, compact, locale, t }: { byDay: Map<string, { pnl: number; trades: number }>; money: Fmt; compact: Fmt; locale: string; t: ChartText }) {
  const data = useMemo(() => {
    const m = new Map<string, number>()
    for (const [d, v] of byDay) m.set(d.slice(0, 7), (m.get(d.slice(0, 7)) ?? 0) + v.pnl)
    return [...m.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([k, v]) => ({ label: new Date(k + '-01T12:00:00Z').toLocaleDateString(locale, { month: 'short', year: '2-digit' }), gain: v >= 0 ? r2(v) : null, loss: v < 0 ? r2(v) : null }))
  }, [byDay, locale])
  const config = useMemo(() => ({ gain: { label: t.gain, colors: GAIN }, loss: { label: t.loss, colors: LOSS } }) satisfies ChartConfig, [t.gain, t.loss])
  if (!data.length) return <Empty t={t} />
  return (
    <div className="h-60 w-full">
      <EvilBarChart data={data} config={config} className="h-full w-full" stackType="stacked" barRadius={4}>
        <EvilBarChart.Grid />
        <EvilBarChart.XAxis dataKey="label" />
        <EvilBarChart.YAxis width={60} tickFormatter={(v: number) => compact(v)} />
        <EvilBarChart.Tooltip variant="frosted-glass" valueFormatter={money} />
        <EvilBarChart.Bar dataKey="gain" variant="default" glowing />
        <EvilBarChart.Bar dataKey="loss" variant="default" glowing />
      </EvilBarChart>
    </div>
  )
}

/** Net P/L per group (pair, session, weekday …) as horizontal bars. */
export function GroupBarChart({ groups, label, money, compact, t, limit = 10 }: { groups: Group[]; label: (k: string) => string; money: Fmt; compact: Fmt; t: ChartText; limit?: number }) {
  const data = useMemo(
    () => groups.slice(0, limit).map((g) => ({ name: label(g.key), gain: g.net >= 0 ? r2(g.net) : null, loss: g.net < 0 ? r2(g.net) : null })),
    [groups, label, limit],
  )
  const config = useMemo(() => ({ gain: { label: t.gain, colors: GAIN }, loss: { label: t.loss, colors: LOSS } }) satisfies ChartConfig, [t.gain, t.loss])
  if (!data.length) return null
  return (
    <div className="w-full" style={{ height: Math.max(140, data.length * 34 + 40) }}>
      <EvilBarChart data={data} config={config} className="h-full w-full" layout="horizontal" stackType="stacked" barRadius={4}>
        <EvilBarChart.Grid />
        <EvilBarChart.YAxis dataKey="name" width={96} />
        <EvilBarChart.XAxis tickFormatter={(v: number) => compact(v)} />
        <EvilBarChart.Tooltip variant="frosted-glass" valueFormatter={money} />
        <EvilBarChart.Bar dataKey="gain" variant="default" />
        <EvilBarChart.Bar dataKey="loss" variant="default" />
      </EvilBarChart>
    </div>
  )
}

/** Wins, losses and break-even trades as a donut. */
export function OutcomeChart({ wins, losses, bes, t }: { wins: number; losses: number; bes: number; t: ChartText }) {
  const data = useMemo(() => [{ name: 'wins', value: wins }, { name: 'losses', value: losses }, { name: 'be', value: bes }].filter((x) => x.value > 0), [wins, losses, bes])
  const config = useMemo(
    () => ({ wins: { label: t.wins, colors: GAIN }, losses: { label: t.losses, colors: LOSS }, be: { label: t.be, colors: { dark: ['#8E8E93'], light: ['#6B6B70'] } } }) satisfies ChartConfig,
    [t.wins, t.losses, t.be],
  )
  if (!data.length) return <Empty t={t} />
  return (
    <div className="h-60 w-full">
      <EvilPieChart data={data} dataKey="value" nameKey="name" config={config} className="h-full w-full">
        <EvilPieChart.Legend />
        <EvilPieChart.Tooltip variant="frosted-glass" />
        <EvilPieChart.Pie innerRadius="58%" paddingAngle={2} cornerRadius={4} isClickable />
      </EvilPieChart>
    </div>
  )
}
