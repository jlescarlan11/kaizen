import type { ReactElement } from 'react'
import { cn } from '../../../shared/lib/cn'
import type { TransactionType } from '../../../app/store/api/transactionApi'

interface TransactionTypeToggleProps {
  value: TransactionType
  onChange: (value: TransactionType) => void
  error?: string
}

export function TransactionTypeToggle({
  value,
  onChange,
  error,
}: TransactionTypeToggleProps): ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex bg-surface-secondary p-1.5 rounded-xl border border-border-subtle/30 shadow-inner">
        <button
          type="button"
          onClick={() => onChange('EXPENSE')}
          className={cn(
            'flex-1 py-3 px-6 text-sm font-black uppercase tracking-widest transition-all rounded-2xl',
            value === 'EXPENSE'
              ? 'bg-error text-white shadow-lg shadow-error/20'
              : 'text-text-secondary hover:text-text-primary hover:bg-white/50',
          )}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => onChange('INCOME')}
          className={cn(
            'flex-1 py-3 px-6 text-sm font-black uppercase tracking-widest transition-all rounded-2xl',
            value === 'INCOME'
              ? 'bg-success text-white shadow-lg shadow-success/20'
              : 'text-text-secondary hover:text-text-primary hover:bg-white/50',
          )}
        >
          Income
        </button>
      </div>
      {error && (
        <p className="text-xs text-error font-black uppercase tracking-tight px-4">{error}</p>
      )}
    </div>
  )
}
