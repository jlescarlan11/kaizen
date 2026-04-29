import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from '../../../shared/components/Card'
import { ChartSkeleton } from '../../../shared/components/ChartSkeleton'
import type { CategoryBreakdown as CategoryBreakdownType } from '../types'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { getCategoricalColor } from '../../../shared/lib/chartTheme'

interface CategoryBreakdownProps {
  breakdown: CategoryBreakdownType
  isLoading: boolean
}

export function CategoryBreakdown({ breakdown, isLoading }: CategoryBreakdownProps) {
  if (isLoading) {
    return (
      <Card title="Category Breakdown">
        <ChartSkeleton variant="pie" className="h-64" />
      </Card>
    )
  }

  if (!breakdown.categories || breakdown.categories.length === 0) {
    return (
      <Card title="Category Breakdown">
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm leading-6 italic text-muted-foreground">
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
    <Card title="Category Breakdown">
      <div className="flex flex-col items-center md:flex-row">
        <div className="h-64 w-full md:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
                fill={getCategoricalColor(0)}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getCategoricalColor(index)} />
                ))}
              </Pie>
              <Tooltip formatter={(value: unknown) => formatCurrency(Number(value ?? 0))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 w-full md:mt-0 md:w-1/2">
          <ul className="space-y-2">
            {breakdown.categories.map((c, index) => (
              <li
                key={c.categoryId || 'uncategorized'}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  to={`/transactions?type=EXPENSE${c.categoryId ? `&category=${c.categoryId}` : ''}`}
                  className="flex items-center text-foreground transition-colors hover:text-primary"
                >
                  <span
                    className="mr-2 h-3 w-3 rounded-full"
                    style={{ backgroundColor: getCategoricalColor(index) }}
                  />
                  {c.categoryName}
                </Link>
                <span className="font-semibold text-foreground">
                  {formatCurrency(c.total)} ({c.percentage.toFixed(1)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
