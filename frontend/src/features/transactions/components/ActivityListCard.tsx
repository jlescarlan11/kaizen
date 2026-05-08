import React from 'react'
import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import { ActivityRow } from './ActivityRow'
import { cn } from '../../../shared/lib/cn'

interface ActivityListCardProps {
  title: string
  type: 'INCOME' | 'EXPENSE'
  transactions: TransactionResponse[]
  totalAmount: number
  onSeeAll?: () => void
}

export const ActivityListCard: React.FC<ActivityListCardProps> = ({
  title,
  type,
  transactions,
  totalAmount,
  onSeeAll,
}) => {
  const isIncome = type === 'INCOME'

  return (
    <div className="flex-1 p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight text-text-primary">{title}</h2>
          <div
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
              isIncome
                ? 'bg-success/5 text-success border-success/10'
                : 'bg-error/5 text-error border-error/10',
            )}
          >
            {isIncome ? 'In' : 'Out'}
          </div>
        </div>
        <p
          className={cn(
            'text-sm font-bold tabular-nums',
            isIncome ? 'text-success' : 'text-text-primary',
          )}
        >
          {isIncome ? '+' : '-'}$
          {Math.abs(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="space-y-0.5 flex-1">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-text-tertiary/60">
            <p className="text-sm font-medium">No {title.toLowerCase()} recorded.</p>
          </div>
        ) : (
          transactions.map((tx) => <ActivityRow key={tx.id} transaction={tx} isIncome={isIncome} />)
        )}
      </div>

      {onSeeAll && transactions.length > 0 && (
        <button
          onClick={onSeeAll}
          className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-border text-[11px] font-medium text-text-secondary hover:border-primary/40 hover:text-primary transition-all"
        >
          See All {title}
        </button>
      )}
    </div>
  )
}
