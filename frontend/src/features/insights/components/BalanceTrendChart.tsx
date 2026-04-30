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
import { ChartSkeleton } from '../../../shared/components/ChartSkeleton'
import { Card } from '../../../shared/components/Card'

interface BalanceTrendChartProps {
  trends: BalanceTrendSeries
  granularity: Granularity
  isLoading: boolean
}

const SERIES = [
  { key: 'balance', name: 'Balance', color: CHART_COLORS.income, axis: 'left' },
  { key: 'expenses', name: 'Total Expenses', color: CHART_COLORS.expense, axis: 'right' },
] as const

function formatPeriodLabel(date: Date, granularity: Granularity): string {
  if (granularity === 'MONTHLY') {
    return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatFullDate(date: Date, granularity: Granularity): string {
  if (granularity === 'MONTHLY') {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
  }
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function BalanceTrendChart({ trends, granularity, isLoading }: BalanceTrendChartProps) {
  if (isLoading) {
    return (
      <Card title="Financial Trajectory">
        <ChartSkeleton variant="line" className="h-64" />
      </Card>
    )
  }

  if (!trends.series || trends.series.length === 0) {
    return (
      <Card title="Financial Trajectory">
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm leading-6 italic text-muted-foreground">
            No trend data available for this period.
          </p>
        </div>
      </Card>
    )
  }

  const sorted = [...trends.series].sort(
    (a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime(),
  )

  // Trim leading and trailing periods that have no activity.
  // Leading zeros are timezone-offset artifacts (backend start.toLocalDate() lands
  // one UTC day early for GMT+8 users). Trailing zeros are API-generated placeholders
  // for days in the range that have no transactions yet.
  // Both kinds cause label collisions on the categorical X-axis (e.g., two "Apr 29"
  // entries — one from 2025, one from 2026) which made Recharts show 0 when hovering.
  let start = 0
  while (
    start < sorted.length &&
    sorted[start].income === 0 &&
    sorted[start].expenses === 0 &&
    sorted[start].netBalance === 0
  ) {
    start++
  }
  let end = sorted.length
  while (
    end > start &&
    sorted[end - 1].income === 0 &&
    sorted[end - 1].expenses === 0 &&
    sorted[end - 1].netBalance === 0
  ) {
    end--
  }
  const activeSeries = sorted.slice(start, end)

  const chartData = activeSeries.reduce<
    { date: string; balance: number; expenses: number; fullDate: string }[]
  >((acc, t) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : { balance: 0, expenses: 0 }
    const date = new Date(t.periodStart)
    acc.push({
      date: t.periodStart,
      balance: prev.balance + t.netBalance,
      expenses: prev.expenses + t.expenses,
      fullDate: formatFullDate(date, granularity),
    })
    return acc
  }, [])

  return (
    <Card title="Financial Trajectory">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-ui-border-subtle)"
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="date"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)' }}
              tickFormatter={(val) => formatPeriodLabel(new Date(val), granularity)}
            />
            <YAxis
              yAxisId="left"
              fontSize={12}
              width={60}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)' }}
              tickFormatter={(val) => `₱${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              fontSize={12}
              width={60}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)' }}
              tickFormatter={(val) => `₱${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const data = payload[0].payload
                return (
                  <div className="bg-ui-surface border border-ui-border p-4 rounded-2xl shadow-2xl space-y-2.5 min-w-[200px]">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pb-2 border-b border-ui-border-subtle">
                      {data.fullDate}
                    </p>
                    {payload.map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between gap-8">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {entry.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-foreground tabular-nums">
                          {formatCurrency(entry.value as number)}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              content={({ payload }) => (
                <div className="flex gap-5 justify-center mt-3">
                  {payload?.map((entry) => (
                    <div key={entry.value} className="flex items-center gap-1.5">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            />
            {SERIES.map(({ key, name, color, axis }) => (
              <Line
                key={key}
                yAxisId={axis}
                type="monotone"
                dataKey={key}
                name={name}
                stroke={color}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: color }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
