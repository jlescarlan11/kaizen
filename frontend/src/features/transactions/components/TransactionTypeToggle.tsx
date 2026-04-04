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
      <label className="text-sm font-medium text-foreground">Transaction type</label>
      <div className="flex h-11 w-full rounded-lg bg-ui-bg-subtle p-1 border border-ui-border-subtle">
        <button
          type="button"
          onClick={() => onChange('EXPENSE')}
          className={cn(
            'flex-1 rounded-md text-sm font-medium transition-all duration-200',
            value === 'EXPENSE'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Outflow
        </button>
        <button
          type="button"
          onClick={() => onChange('INCOME')}
          className={cn(
            'flex-1 rounded-md text-sm font-medium transition-all duration-200',
            value === 'INCOME'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Inflow
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
