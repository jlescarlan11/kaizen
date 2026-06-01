import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '../../../shared/components/Card'
import { ChartSkeleton } from '../../../shared/components/ChartSkeleton'
import type { TrendSeries, Granularity } from '../types'

interface SpendingTrendsProps {
  trends: TrendSeries
  granularity: Granularity
  onGranularityChange?: (g: Granularity) => void
  isLoading: boolean
}

export function SpendingTrends({
  trends,
  granularity,
  onGranularityChange,
  isLoading,
}: SpendingTrendsProps) {
  if (isLoading) {
    return (
      <Card title="Spending Trends">
        <ChartSkeleton variant="bar" className="h-64" />
      </Card>
    )
  }

  if (!trends.series || trends.series.length === 0) {
    return (
      <Card title="Spending Trends">
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm leading-6 italic text-text-secondary">
            No trend data available for this period.
          </p>
        </div>
      </Card>
    )
  }

  const chartData = (trends.series || []).map((t) => {
    const date = new Date(t.periodStart)
    const name =
      granularity === 'MONTHLY'
        ? date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
        : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return { name, value: t.total }
  })

  return (
    <Card
      title="Spending Trends"
      className="h-full"
      extra={
        onGranularityChange && (
          <div className="flex items-center gap-1 bg-surface-secondary rounded-lg p-0.5 border border-border/5">
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as Granularity[]).map((g) => (
              <button
                key={g}
                onClick={() => onGranularityChange(g)}
                className={`px-2 py-1 text-3xs font-black uppercase tracking-widest rounded-md transition-all ${
                  granularity === g
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary opacity-40 hover:opacity-100'
                }`}
              >
                {g[0]}
              </button>
            ))}
          </div>
        )
      }
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="var(--color-border)"
              strokeOpacity={0.1}
            />
            <XAxis
              dataKey="name"
              fontSize={10}
              tick={{ fill: 'var(--color-text-secondary)', fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              fontSize={10}
              width={40}
              tick={{ fill: 'var(--color-text-secondary)', fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-primary)', opacity: 0.05 }}
              contentStyle={{
                borderRadius: '0.75rem',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: unknown) => `$${Number(value ?? 0).toFixed(2)}`}
            />
            <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
