import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '../../../shared/components/Card'
import type { TrendSeries, Granularity } from '../types'
import { formatCurrency } from '../../../shared/lib/formatCurrency'

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
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500 animate-pulse">Loading trends...</p>
        </div>
      </Card>
    )
  }

  if (!trends.series || trends.series.length === 0) {
    return (
      <Card title="Spending Trends">
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500 italic">No trend data available for this period.</p>
        </div>
      </Card>
    )
  }

  const chartData = trends.series.map((t) => {
    const date = new Date(t.periodStart)
    let name: string

    if (granularity === 'WEEKLY') {
      name = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } else {
      name = date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
    }

    return { name, value: t.total }
  })

  return (
    <Card title="Spending Trends">
      <div className="flex justify-end mb-4 space-x-2">
        <button
          onClick={() => onGranularityChange('WEEKLY')}
          className={`px-3 py-1 text-xs rounded ${granularity === 'WEEKLY' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Weekly
        </button>
        <button
          onClick={() => onGranularityChange('MONTHLY')}
          className={`px-3 py-1 text-xs rounded ${granularity === 'MONTHLY' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Monthly
        </button>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} width={60} tickFormatter={(val) => `PHP ${val}`} />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value ?? 0))} />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
