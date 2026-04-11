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
import { Card } from '../../../shared/components/Card'
import type { BalanceTrendSeries, Granularity } from '../types'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
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
      <Card className="h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Analyzing trends...</p>
        </div>
      </Card>
    )
  }

  if (!trends.series || trends.series.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground italic">No trend data available for this period.</p>
      </Card>
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
    <Card className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black tracking-tight text-foreground">Balance Trends</h3>
          <p className="text-xs text-muted-foreground">Income, Expenses, and Net Flow over time</p>
        </div>
        <div className="flex bg-ui-surface-muted p-1 rounded-lg border border-ui-border-subtle">
          {GRANULARITY_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onGranularityChange(value)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                granularity === value
                  ? 'bg-ui-surface text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--ui-border-subtle)"
            />
            <XAxis
              dataKey="name"
              fontSize={10}
              fontWeight={700}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)' }}
              dy={10}
            />
            <YAxis
              fontSize={10}
              fontWeight={700}
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
                    <div className="bg-ui-surface border border-ui-border p-3 rounded-xl shadow-xl space-y-2 min-w-[200px]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pb-1 border-b border-ui-border-subtle">
                        {data.fullDate}
                      </p>
                      <div className="space-y-2 pt-1">
                        {payload.map((entry) => {
                          const deltaKey = `${entry.dataKey}Delta`
                          const delta = data[deltaKey] as number | null
                          return (
                            <div key={entry.name} className="flex flex-col gap-0.5">
                              <div className="flex items-center justify-between gap-8">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {entry.name}
                                  </span>
                                </div>
                                <span className="text-[11px] font-black text-foreground">
                                  {formatCurrency(entry.value as number)}
                                </span>
                              </div>
                              {delta !== null && (
                                <div className="flex justify-end">
                                  <span
                                    className={`text-[9px] font-bold ${
                                      delta >= 0 ? 'text-success' : 'text-error'
                                    }`}
                                  >
                                    {delta >= 0 ? '+' : ''}
                                    {delta.toFixed(1)}% vs prev
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
                <div className="flex gap-4 justify-end mb-4">
                  {payload?.map((entry) => (
                    <div
                      key={entry.value}
                      className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${
                        hiddenSeries.includes(entry.dataKey as string)
                          ? 'opacity-30'
                          : 'opacity-100'
                      }`}
                      onClick={() => toggleSeries(entry.dataKey as string)}
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
                stroke="var(--color-income)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            )}
            {!hiddenSeries.includes('expenses') && (
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="var(--color-expense)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            )}
            {!hiddenSeries.includes('netBalance') && (
              <Line
                type="monotone"
                dataKey="netBalance"
                name="Net Balance"
                stroke="var(--color-text-secondary)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
