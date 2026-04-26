import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { BalanceTrendSeries, Granularity } from '../types'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { CHART_COLORS } from '../../../shared/lib/chartTheme'
import { useState } from 'react'

interface BalanceTrendChartProps {
  trends: BalanceTrendSeries
  granularity: Granularity
  onGranularityChange: (g: Granularity) => void
  isLoading: boolean
}

const GRANULARITY_OPTIONS: { label: string; value: Granularity }[] = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
]

function formatPeriodLabel(date: Date, granularity: Granularity): string {
  if (granularity === 'MONTHLY') {
    return date.toLocaleDateString(undefined, { month: 'short' })
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatFullDate(date: Date, granularity: Granularity): string {
  if (granularity === 'MONTHLY') {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
  }
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function BalanceTrendChart({
  trends,
  granularity,
  onGranularityChange,
  isLoading,
}: BalanceTrendChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([])

  const toggleSeries = (dataKey: string) => {
    setHiddenSeries((prev) =>
      prev.includes(dataKey) ? prev.filter((s) => s !== dataKey) : [...prev, dataKey],
    )
  }

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Analyzing trends...</p>
        </div>
      </div>
    )
  }

  if (!trends.series || trends.series.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center border border-dashed border-ui-border-subtle rounded-2xl">
        <p className="text-muted-foreground italic text-sm">
          No trend data available for this period.
        </p>
      </div>
    )
  }

  const sortedSeries = [...trends.series].sort(
    (a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime(),
  )

  const chartData = sortedSeries.map((t, index) => {
    const date = new Date(t.periodStart)
    const prev = index > 0 ? sortedSeries[index - 1] : null

    const calculateDelta = (curr: number, p: number | null) => {
      if (p === null || p === 0) return null
      return ((curr - p) / Math.abs(p)) * 100
    }

    return {
      name: formatPeriodLabel(date, granularity),
      income: t.income,
      incomeDelta: calculateDelta(t.income, prev?.income ?? null),
      expenses: t.expenses,
      expensesDelta: calculateDelta(t.expenses, prev?.expenses ?? null),
      netBalance: t.netBalance,
      netBalanceDelta: calculateDelta(t.netBalance, prev?.netBalance ?? null),
      fullDate: formatFullDate(date, granularity),
    }
  })

  return (
    <div className="flex flex-col gap-8 py-6">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <p className="text-xs leading-5 text-muted-foreground tracking-wide uppercase">
            Financial Trajectory
          </p>
          <p className="text-xs font-bold text-foreground/60">Income vs Expenses Analysis</p>
        </div>
        <div className="flex bg-ui-surface-muted p-1 rounded-full border border-ui-border-subtle shadow-inner">
          {GRANULARITY_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onGranularityChange(value)}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
                granularity === value
                  ? 'bg-ui-surface text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--ui-border-subtle)"
              opacity={0.5}
            />
            <XAxis
              dataKey="name"
              fontSize={10}
              fontWeight={800}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)' }}
              dy={15}
            />
            <YAxis
              fontSize={10}
              fontWeight={800}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)' }}
              tickFormatter={(val) => `₱${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-ui-surface/95 backdrop-blur-md border border-ui-border p-4 rounded-2xl shadow-2xl space-y-3 min-w-[220px]">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pb-2 border-b border-ui-border-subtle">
                        {data.fullDate}
                      </p>
                      <div className="space-y-2.5">
                        {payload.map((entry) => {
                          const deltaKey = `${entry.dataKey}Delta`
                          const delta = data[deltaKey] as number | null
                          return (
                            <div key={entry.name} className="flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-8">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="h-2 w-2 rounded-full shadow-sm"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                                    {entry.name}
                                  </span>
                                </div>
                                <span className="text-[12px] font-black text-foreground tabular-nums">
                                  {formatCurrency(entry.value as number)}
                                </span>
                              </div>
                              {delta !== null && (
                                <div className="flex justify-end pr-0.5">
                                  <span
                                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                      delta >= 0
                                        ? 'bg-success/10 text-success'
                                        : 'bg-error/10 text-error'
                                    }`}
                                  >
                                    {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              content={({ payload }) => (
                <div className="flex gap-6 justify-end mb-6">
                  {payload?.map((entry) => (
                    <div
                      key={entry.value}
                      className={`flex items-center gap-2 cursor-pointer transition-all ${
                        hiddenSeries.includes(entry.dataKey as string)
                          ? 'opacity-20 grayscale'
                          : 'opacity-100'
                      }`}
                      onClick={() => toggleSeries(entry.dataKey as string)}
                    >
                      <div
                        className="h-2 w-2 rounded-full shadow-sm"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70 group-hover:text-foreground">
                        {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            />
            {!hiddenSeries.includes('income') && (
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke={CHART_COLORS.income}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: CHART_COLORS.income }}
              />
            )}
            {!hiddenSeries.includes('expenses') && (
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke={CHART_COLORS.expense}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: CHART_COLORS.expense }}
              />
            )}
            {!hiddenSeries.includes('netBalance') && (
              <Line
                type="monotone"
                dataKey="netBalance"
                name="Net Balance"
                stroke="var(--color-text-secondary)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--color-text-secondary)' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
