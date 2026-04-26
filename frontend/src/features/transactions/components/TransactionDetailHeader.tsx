import { type ReactElement } from 'react'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { cn } from '../../../shared/lib/cn'

interface TransactionDetailHeaderProps {
  amount: number
  type: 'INCOME' | 'EXPENSE'
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
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Transaction Amount
        </p>
        <div className="flex items-baseline gap-2">
          <h2
            className={cn(
              'text-4xl md:text-5xl font-semibold tracking-tight tabular-nums',
              isExpense ? 'text-foreground' : isIncome ? 'text-ui-success' : 'text-foreground',
            )}
          >
            {isExpense ? '-' : isIncome ? '+' : ''}
            {formatCurrency(amount).replace('PHP', '').trim()}
          </h2>
          <span className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
            PHP
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/60">
            Settled On
          </p>
          <p className="text-base font-semibold text-foreground">
            {dateFormatter.format(new Date(date))}
          </p>
        </div>
      </div>
    </div>
  )
}
