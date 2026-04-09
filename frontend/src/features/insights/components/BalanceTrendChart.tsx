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

interface BalanceTrendChartProps {
  trends: BalanceTrendSeries
  granularity: Granularity
  onGranularityChange: (g: Granularity) => void
  isLoading: boolean
}

export function BalanceTrendChart({
  trends,
  granularity,
  onGranularityChange,
  isLoading,
}: BalanceTrendChartProps) {
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

  const chartData = trends.series.map((t) => {
    const date = new Date(t.periodStart)
    let name: string

    if (granularity === 'DAILY') {
      name = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } else {
      name = date.toLocaleDateString(undefined, { month: 'short' })
    }

    return {
      name,
      income: t.income,
      expenses: t.expenses,
      netBalance: t.netBalance,
      fullDate: date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: granularity === 'DAILY' ? 'numeric' : undefined,
      }),
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
          <button
            onClick={() => onGranularityChange('DAILY')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
              granularity === 'DAILY'
                ? 'bg-ui-surface text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => onGranularityChange('MONTHLY')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
              granularity === 'MONTHLY'
                ? 'bg-ui-surface text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border-subtle)"
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
                    <div className="bg-ui-surface border border-ui-border p-3 rounded-xl shadow-xl space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pb-1 border-b border-ui-border-subtle">
                        {data.fullDate}
                      </p>
                      <div className="space-y-1.5">
                        {payload.map((entry) => (
                          <div key={entry.name} className="flex items-center justify-between gap-8">
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
                        ))}
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
                    <div key={entry.value} className="flex items-center gap-1.5">
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
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10b981" // emerald-500
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#f43f5e" // rose-500
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="netBalance"
              name="Net Balance"
              stroke="#6366f1" // indigo-500
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
