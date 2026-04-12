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
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          Transaction Amount
        </p>
        <div className="flex items-baseline gap-2">
          <h2
            className={cn(
              'text-6xl font-black tracking-tighter tabular-nums',
              isExpense ? 'text-foreground' : isIncome ? 'text-ui-success' : 'text-foreground',
            )}
          >
            {isExpense ? '-' : isIncome ? '+' : ''}
            {formatCurrency(amount).replace('PHP', '').trim()}
          </h2>
          <span className="text-sm font-bold text-muted-foreground tracking-widest uppercase">
            PHP
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Settled On
          </p>
          <p className="text-base font-bold text-foreground">
            {dateFormatter.format(new Date(date))}
          </p>
        </div>
      </div>
    </div>
  )
}
