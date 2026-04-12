import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { cn } from '../../../shared/lib/cn'

interface RelatedTransaction {
  id: number
  amount: number
  type: 'INCOME' | 'EXPENSE'
  transactionDate: string
  description: string
  category?: {
    name: string
    icon: string
    color: string
  }
}

interface RelatedTransactionsListProps {
  transactions: RelatedTransaction[]
  isLoading: boolean
  className?: string
}

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric',
})

export function RelatedTransactionsList({
  transactions,
  isLoading,
  className,
}: RelatedTransactionsListProps): ReactElement {
  if (isLoading) {
    return (
      <div className={cn('space-y-6 py-4', className)} data-testid="related-loading">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-full animate-pulse bg-ui-surface-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded animate-pulse bg-ui-surface-muted" />
                <div className="h-3 w-20 rounded animate-pulse bg-ui-surface-muted/60" />
              </div>
            </div>
            <div className="h-6 w-24 rounded animate-pulse bg-ui-surface-muted" />
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
          No related activity found in this category.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('divide-y divide-ui-border-subtle/30', className)}>
      {transactions.map((transaction) => (
        <Link
          key={transaction.id}
          to={`/transactions/${transaction.id}`}
          className="group flex items-center justify-between py-5 px-1 rounded-2xl hover:bg-ui-surface-muted transition-all cursor-pointer"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-xl shrink-0 group-hover:scale-105 transition-transform"
              style={{
                backgroundColor: transaction.category?.color + '15',
                color: transaction.category?.color,
              }}
            >
              <SharedIcon
                type="category"
                name={transaction.category?.icon || 'help-circle'}
                size={22}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-base text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                {transaction.description || 'No description'}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 leading-none">
                  {transaction.category?.name || 'Uncategorized'}
                </p>
                <div className="h-2 w-px bg-ui-border-subtle" />
                <p className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground/40 leading-none">
                  {dateFormatter.format(new Date(transaction.transactionDate))}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right ml-4">
            <p
              className={cn(
                'text-lg font-black tracking-tight tabular-nums leading-none',
                transaction.type === 'INCOME' ? 'text-ui-success' : 'text-foreground',
              )}
            >
              {transaction.type === 'EXPENSE' ? '-' : transaction.type === 'INCOME' ? '+' : ''}
              {formatCurrency(transaction.amount).replace('PHP', '').trim()}
            </p>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right mt-1.5 opacity-50">
              PHP RECORD
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
