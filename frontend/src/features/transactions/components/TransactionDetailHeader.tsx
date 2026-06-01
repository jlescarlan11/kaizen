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
  const isIncome = type === 'INCOME'

  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-8 text-center', className)}>
      {/* Type pill */}
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
          isIncome ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error',
        )}
      >
        {isIncome ? '↑ Income' : '↓ Expense'}
      </span>

      {/* Amount */}
      <div
        role="status"
        aria-label={`${isIncome ? 'Income' : 'Expense'}: ${formatCurrency(amount)}`}
        className="flex items-baseline gap-2"
      >
        <h2
          aria-hidden="true"
          className={cn(
            'text-4xl md:text-5xl font-semibold tracking-tight tabular-nums',
            isIncome ? 'text-success' : 'text-error',
          )}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(amount).replace('PHP', '').trim()}
        </h2>
        <span
          aria-hidden="true"
          className="text-sm font-semibold text-text-secondary tracking-wide uppercase"
        >
          PHP
        </span>
      </div>

      {/* Date */}
      <p className="text-sm text-text-secondary">{dateFormatter.format(new Date(date))}</p>
    </div>
  )
}
