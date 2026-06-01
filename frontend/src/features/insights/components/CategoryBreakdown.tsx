import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '../../../shared/components/Card'
import { ChartSkeleton } from '../../../shared/components/ChartSkeleton'
import type { CategoryBreakdown as CategoryBreakdownType } from '../types'
import { getCategoricalColor } from '../../../shared/lib/chartTheme'

interface CategoryBreakdownProps {
  breakdown: CategoryBreakdownType
  isLoading: boolean
  title?: string
}

export function CategoryBreakdown({
  breakdown,
  isLoading,
  title = 'Category Breakdown',
}: CategoryBreakdownProps) {
  if (isLoading) {
    return (
      <Card title={title}>
        <ChartSkeleton variant="pie" className="h-64" />
      </Card>
    )
  }

  if (!breakdown.categories || breakdown.categories.length === 0) {
    return (
      <Card title={title}>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm leading-6 italic text-text-secondary">
            No spending data for this period.
          </p>
        </div>
      </Card>
    )
  }

  const chartData = breakdown.categories.map((c) => ({
    name: c.categoryName,
    value: c.total,
  }))

  return (
    <Card title={title} className="h-full">
      <div className="flex flex-col items-center">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getCategoricalColor(index)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: unknown) => `$${Number(value ?? 0).toFixed(2)}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 w-full">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {breakdown.categories.map((c, index) => (
              <li key={c.categoryId || 'uncategorized'} className="group">
                <Link
                  to={`/transactions?type=EXPENSE${c.categoryId ? `&category=${c.categoryId}` : ''}`}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:bg-surface-secondary hover:border-border-subtle transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: getCategoricalColor(index) }}
                    />
                    <span className="text-3xs font-bold uppercase tracking-tight text-text-primary">
                      {c.categoryName}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold tracking-tighter text-text-primary">
                      ${c.total.toFixed(2)}
                    </p>
                    <p className="text-3xs font-bold uppercase tracking-widest text-text-secondary opacity-30">
                      {c.percentage.toFixed(0)}%
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
