import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from '../../../shared/components/Card'
import type { CategoryBreakdown as CategoryBreakdownType } from '../types'
import { formatCurrency } from '../../../shared/lib/formatCurrency'

interface CategoryBreakdownProps {
  breakdown: CategoryBreakdownType
  isLoading: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

export function CategoryBreakdown({ breakdown, isLoading }: CategoryBreakdownProps) {
  if (isLoading) {
    return (
      <Card title="Category Breakdown">
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500 animate-pulse">Loading breakdown...</p>
        </div>
      </Card>
    )
  }

  if (!breakdown.categories || breakdown.categories.length === 0) {
    return (
      <Card title="Category Breakdown">
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500 italic">No spending data for this period.</p>
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
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(Number(value ?? 0))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-1/2 mt-4 md:mt-0">
          <ul className="space-y-2">
            {breakdown.categories.map((c, index) => (
              <li
                key={c.categoryId || 'uncategorized'}
                className="flex justify-between items-center text-sm"
              >
                <Link
                  to={`/transactions?type=EXPENSE${c.categoryId ? `&category=${c.categoryId}` : ''}`}
                  className="flex items-center hover:text-indigo-600 transition-colors"
                >
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  {c.categoryName}
                </Link>
                <span className="font-semibold">
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
