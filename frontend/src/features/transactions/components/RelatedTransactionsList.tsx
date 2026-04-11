import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { cn } from '../../../shared/lib/cn'

interface RelatedTransaction {
  id: number
  amount: number
  type: 'INCOME' | 'EXPENSE' | 'RECONCILIATION'
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
      <div className={cn('space-y-4', className)} data-testid="related-loading">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse bg-ui-surface-muted rounded-2xl border border-ui-border-subtle"
          />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div
        className={cn(
          'py-10 text-center border border-dashed border-ui-border rounded-2xl bg-ui-surface-muted/30',
          className,
        )}
      >
        <p className="text-sm text-muted-foreground">No related transactions found.</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {transactions.map((transaction) => (
        <Link
          key={transaction.id}
          to={`/transactions/${transaction.id}`}
          className="flex items-center justify-between p-4 bg-ui-surface border border-ui-border-subtle rounded-2xl hover:bg-ui-surface-muted hover:border-ui-border transition-all group"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: transaction.category?.color + '15',
                color: transaction.category?.color,
              }}
            >
              <SharedIcon
                type="category"
                name={transaction.category?.icon || 'help-circle'}
                size={18}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {transaction.description || 'No description'}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {dateFormatter.format(new Date(transaction.transactionDate))} •{' '}
                {transaction.category?.name || 'Uncategorized'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={cn(
                'text-sm font-bold tracking-tight tabular-nums',
                transaction.type === 'INCOME' ? 'text-ui-success' : 'text-foreground',
              )}
            >
              {transaction.type === 'EXPENSE' ? '-' : transaction.type === 'INCOME' ? '+' : ''}
              {formatCurrency(transaction.amount).replace('PHP', '').trim()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
