import { Card } from '../../../shared/components/Card'
import type { SpendingSummary as SpendingSummaryType } from '../types'
import { formatCurrency } from '../../../shared/lib/formatCurrency'

interface SpendingSummaryProps {
  summary: SpendingSummaryType
  isLoading: boolean
}

export function SpendingSummary({ summary, isLoading }: SpendingSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Total Income">
        <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</p>
      </Card>
      <Card title="Total Expenses">
        <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
      </Card>
      <Card title="Net Balance">
        <p
          className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {formatCurrency(summary.netBalance)}
        </p>
      </Card>
    </div>
  )
}
