import { type ReactElement } from 'react'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { cn } from '../../../shared/lib/cn'

interface TransactionDetailHeaderProps {
  amount: number
  type: 'INCOME' | 'EXPENSE' | 'RECONCILIATION' | 'INITIAL_BALANCE'
  date: string
  className?: string
}

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'full',
  timeStyle: 'short',
})

export function TransactionDetailHeader({
  amount,
  type,
  date,
  className,
}: TransactionDetailHeaderProps): ReactElement {
  const isExpense = type === 'EXPENSE'
  const isIncome = type === 'INCOME'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6',
        'bg-ui-surface border border-ui-border-subtle rounded-3xl',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Transaction Amount
        </p>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'text-3xl font-black tracking-tight',
              isExpense ? 'text-foreground' : isIncome ? 'text-ui-success' : 'text-foreground',
            )}
          >
            {isExpense ? '-' : isIncome ? '+' : ''}
          </span>
          <span className="text-2xl font-bold text-muted-foreground tracking-tight">PHP</span>
          <h2
            className={cn(
              'text-6xl font-black tracking-tighter tabular-nums',
              isExpense ? 'text-foreground' : isIncome ? 'text-ui-success' : 'text-foreground',
            )}
          >
            {formatCurrency(amount).replace('PHP', '').trim()}
          </h2>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Settled On
        </p>
        <p className="text-sm font-semibold text-foreground">
          {dateFormatter.format(new Date(date))}
        </p>
      </div>
    </div>
  )
}
