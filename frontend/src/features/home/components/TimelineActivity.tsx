import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetTransactionsQuery } from '../../../app/store/api/transactionApi'
import { TransactionsEmptyState } from '../TransactionsEmptyState'
import { ADD_TRANSACTION_ROUTE } from '../routes'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { Money } from '../../../shared/components/Money/Money'
import { cn } from '../../../shared/lib/cn'

export const TimelineActivity: React.FC = () => {
  const navigate = useNavigate()
  const { data: transactionsData, isLoading } = useGetTransactionsQuery()

  const transactions = useMemo(() => transactionsData?.items ?? [], [transactionsData])

  const recentActivity = useMemo(
    () => transactions.filter((tx) => tx.type === 'INCOME' || tx.type === 'EXPENSE').slice(0, 3),
    [transactions],
  )

  if (isLoading) {
    return <div className="h-64 bg-surface border border-border-subtle rounded-2xl animate-pulse" />
  }

  if (transactions.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm">
        <TransactionsEmptyState onAddTransaction={() => navigate(ADD_TRANSACTION_ROUTE)} />
      </div>
    )
  }

  if (recentActivity.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm">
        <TransactionsEmptyState onAddTransaction={() => navigate(ADD_TRANSACTION_ROUTE)} />
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl shadow-sm p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
          Recent Activity
        </p>
        <button
          onClick={() => navigate('/transactions')}
          className="text-[10px] font-semibold text-primary hover:underline"
        >
          See all activity →
        </button>
      </div>

      {/* Transaction rows */}
      <div className="flex flex-col divide-y divide-border-subtle">
        {recentActivity.map((tx) => {
          const isExpense = tx.type === 'EXPENSE'
          return (
            <div
              key={tx.id}
              onClick={() => navigate('/transactions')}
              className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-surface-secondary/50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0',
                    isExpense ? 'bg-red-50' : 'bg-green-50',
                  )}
                >
                  <SharedIcon
                    type="category"
                    name={tx.category?.icon ?? 'banknote'}
                    size={14}
                    className={isExpense ? 'text-red-500' : 'text-green-600'}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-text-primary truncate">
                    {tx.description}
                  </p>
                  <p className="text-[10px] text-text-tertiary">
                    {new Date(tx.transactionDate).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'text-[12px] font-semibold tabular-nums ml-3 flex-shrink-0',
                  isExpense ? 'text-red-600' : 'text-green-600',
                )}
              >
                {isExpense ? '–' : '+'}
                <Money amount={tx.amount} currency="" />
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
