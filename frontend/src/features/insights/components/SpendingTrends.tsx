import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '../../../shared/components/Card'
import { Button } from '../../../shared/components/Button'
import type { TrendSeries, Granularity } from '../types'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { CHART_COLORS } from '../../../shared/lib/chartTheme'

interface SpendingTrendsProps {
  trends: TrendSeries
  granularity: Granularity
  onGranularityChange: (g: Granularity) => void
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
        <div className="flex h-64 items-center justify-center">
          <p className="animate-pulse text-sm leading-6 text-muted-foreground">Loading trends...</p>
        </div>
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
      granularity === 'WEEKLY'
        ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
    return { name, value: t.total }
  })

  return (
    <Card title="Spending Trends">
      <div className="mb-4 flex justify-end gap-2" role="group" aria-label="Trend granularity">
        <Button
          size="sm"
          variant={granularity === 'WEEKLY' ? 'primary' : 'ghost'}
          aria-pressed={granularity === 'WEEKLY'}
          onClick={() => onGranularityChange('WEEKLY')}
        >
          Weekly
        </Button>
        <Button
          size="sm"
          variant={granularity === 'MONTHLY' ? 'primary' : 'ghost'}
          aria-pressed={granularity === 'MONTHLY'}
          onClick={() => onGranularityChange('MONTHLY')}
        >
          Monthly
        </Button>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} width={60} tickFormatter={(val) => `PHP ${val}`} />
            <Tooltip formatter={(value: unknown) => formatCurrency(Number(value ?? 0))} />
            <Bar dataKey="value" fill={CHART_COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
