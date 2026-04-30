import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '../../../shared/components/Card'
import { ChartSkeleton } from '../../../shared/components/ChartSkeleton'
import type { TrendSeries, Granularity } from '../types'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { CHART_COLORS } from '../../../shared/lib/chartTheme'

interface SpendingTrendsProps {
  trends: TrendSeries
  granularity: Granularity
  isLoading: boolean
}

export function SpendingTrends({ trends, granularity, isLoading }: SpendingTrendsProps) {
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
          <p className="text-sm leading-6 italic text-muted-foreground">
            No trend data available for this period.
          </p>
        </div>
      </Card>
    )
  }

  const chartData = trends.series.map((t) => {
    const date = new Date(t.periodStart)
    const name =
      granularity === 'MONTHLY'
        ? date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
        : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return { name, value: t.total }
  })

  return (
    <Card title="Spending Trends">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-ui-border-subtle)"
              strokeOpacity={0.6}
            />
            <XAxis dataKey="name" fontSize={12} tick={{ fill: 'var(--color-text-secondary)' }} />
            <YAxis
              fontSize={12}
              width={60}
              tick={{ fill: 'var(--color-text-secondary)' }}
              tickFormatter={(val) => `PHP ${val}`}
            />
            <Tooltip formatter={(value: unknown) => formatCurrency(Number(value ?? 0))} />
            <Bar dataKey="value" fill={CHART_COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
