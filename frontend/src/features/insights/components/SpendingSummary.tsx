import { Card } from '../../../shared/components/Card'
import { ChartSkeleton } from '../../../shared/components/ChartSkeleton'
import type { SpendingSummary as SpendingSummaryType } from '../types'
import { cn } from '../../../shared/lib/cn'

interface SpendingSummaryProps {
  summary: SpendingSummaryType
  isLoading: boolean
}

export function SpendingSummary({ summary, isLoading }: SpendingSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <ChartSkeleton variant="bar" className="h-14" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card title="Income">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-text-secondary opacity-30 italic">PHP</span>
          <p className="text-2xl font-bold tracking-tighter text-success">
            {summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </Card>
      <Card title="Expense">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-text-secondary opacity-30 italic">PHP</span>
          <p className="text-2xl font-bold tracking-tighter text-error">
            {summary.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </Card>
      <Card title="Net Balance" variant={summary.netBalance >= 0 ? 'success' : 'error'}>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-text-secondary opacity-30 italic">PHP</span>
          <p
            className={cn(
              'text-2xl font-bold tracking-tighter',
              summary.netBalance >= 0 ? 'text-success' : 'text-error',
            )}
          >
            {Math.abs(summary.netBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </Card>
    </div>
  )
}
