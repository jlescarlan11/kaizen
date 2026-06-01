import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { formatTransactionDate } from '../utils/transactionUtils'
import { cn } from '../../../shared/lib/cn'
import { withOpacity } from '../../../shared/lib/colorUtils'

interface ActivityRowProps {
  transaction: TransactionResponse
  isIncome?: boolean
}

export const ActivityRow: React.FC<ActivityRowProps> = ({ transaction: tx, isIncome }) => {
  const navigate = useNavigate()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/transactions/${tx.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/transactions/${tx.id}`)}
      className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-surface-secondary transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl transition-all group-hover:bg-surface shadow-sm"
          style={{
            backgroundColor: withOpacity(
              tx.category?.color || 'var(--color-category-fallback)',
              0.08,
            ),
            color: tx.category?.color || 'var(--color-text-secondary)',
          }}
        >
          <SharedIcon
            type="category"
            name={tx.category?.icon || 'banknote'}
            size={20}
            strokeWidth={2.5}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-tight transition-colors">
            {tx.description || tx.category?.name || 'Uncategorized'}
          </p>
          <p className="text-3xs font-semibold text-text-secondary opacity-40 uppercase tracking-wider mt-0.5">
            {formatTransactionDate(tx.transactionDate)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={cn(
            'text-sm font-bold tracking-tight',
            isIncome ? 'text-success' : 'text-text-primary',
          )}
        >
          {isIncome ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
        </p>
      </div>
    </div>
  )
}
