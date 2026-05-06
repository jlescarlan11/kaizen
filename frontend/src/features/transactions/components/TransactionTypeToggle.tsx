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
    <div className="space-y-2">
      <div className="flex border-b border-ui-border-subtle">
        <button
          type="button"
          onClick={() => onChange('EXPENSE')}
          className={cn(
            'pb-4 px-8 text-lg font-medium transition-colors relative',
            value === 'EXPENSE'
              ? 'text-[var(--color-expense)]'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Expense
          {value === 'EXPENSE' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--color-expense)] animate-in fade-in duration-200" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onChange('INCOME')}
          className={cn(
            'pb-4 px-8 text-lg font-medium transition-colors relative',
            value === 'INCOME'
              ? 'text-[var(--color-income)]'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Income
          {value === 'INCOME' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--color-income)] animate-in fade-in duration-200" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-error px-8">{error}</p>}
    </div>
  )
}
