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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-ui-surface-muted" />
        ))}
      </div>
    )
  }

  const netBalanceColor = summary.netBalance >= 0 ? 'text-income' : 'text-expense'

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card title="Total Income">
        <p className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug text-income">
          {formatCurrency(summary.totalIncome)}
        </p>
      </Card>
      <Card title="Total Expenses">
        <p className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug text-expense">
          {formatCurrency(summary.totalExpenses)}
        </p>
      </Card>
      <Card title="Net Balance">
        <p
          className={`text-2xl md:text-3xl font-semibold tracking-tight leading-snug ${netBalanceColor}`}
        >
          {formatCurrency(summary.netBalance)}
        </p>
      </Card>
    </div>
  )
}
