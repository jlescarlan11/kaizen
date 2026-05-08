import React, { useMemo } from 'react'
import { useGetSpendingSummaryQuery } from '../../../app/store/api/insightsApi'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { cn } from '../../../shared/lib/cn'

export const SevenDayInsights: React.FC = () => {
  const dateRange = useMemo(() => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    const start = new Date()
    start.setDate(end.getDate() - 7)
    start.setHours(0, 0, 0, 0)
    return { start: start.toISOString(), end: end.toISOString() }
  }, [])

  const { data: summary, isLoading } = useGetSpendingSummaryQuery(dateRange)

  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm animate-pulse flex flex-col gap-3">
        <div className="h-3 w-28 bg-surface-secondary rounded" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-2 border-b border-border-subtle last:border-0"
            >
              <div className="h-3 w-16 bg-surface-secondary rounded" />
              <div className="h-5 w-20 bg-surface-secondary rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const income = summary?.totalIncome ?? 0
  const spending = summary?.totalExpenses ?? 0
  const netFlow = summary?.netBalance ?? 0

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SharedIcon type="category" name="calendar" size={14} className="text-primary" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            7-Day Summary
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-0 flex-grow">
        <div className="flex justify-between items-center py-3 border-b border-border-subtle">
          <p className="text-[11px] font-medium text-text-secondary">Total In</p>
          <p className="text-sm font-semibold text-success tabular-nums">
            +${income.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-border-subtle">
          <p className="text-[11px] font-medium text-text-secondary">Total Out</p>
          <p className="text-sm font-semibold text-text-primary tabular-nums">
            -${Math.abs(spending).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex justify-between items-center py-3">
          <p className="text-[11px] font-medium text-text-secondary">Net Flow</p>
          <p
            className={cn(
              'text-sm font-bold tabular-nums',
              netFlow >= 0 ? 'text-primary' : 'text-error',
            )}
          >
            {netFlow >= 0 ? '+' : '-'}$
            {Math.abs(netFlow).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}
