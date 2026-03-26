import type { ReactElement } from 'react'
import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import { ResponsiveModal } from '../../../shared/components/ResponsiveModal'
import { Badge } from '../../../shared/components/Badge'
import { cn } from '../../../shared/lib/cn'

interface TransactionDetailModalProps {
  transaction: TransactionResponse | null
  open: boolean
  onClose: () => void
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'full',
  timeStyle: 'short',
})

export function TransactionDetailModal({
  transaction,
  open,
  onClose,
}: TransactionDetailModalProps): ReactElement {
  if (!transaction) return <></>

  return (
    <ResponsiveModal open={open} onClose={onClose} title="Transaction Details">
      <div className="space-y-6">
        {/* Header/Summary */}
        <div className="flex flex-col items-center justify-center py-4 bg-ui-surface-muted rounded-2xl border border-ui-border-subtle">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
          </p>
          <p
            className={cn(
              'text-4xl font-bold tracking-tight',
              transaction.type === 'INCOME' ? 'text-ui-success' : 'text-foreground',
            )}
          >
            {transaction.type === 'INCOME' ? '+' : '-'}{' '}
            {currencyFormatter.format(transaction.amount)}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-y-5">
          <DetailRow
            label="Date & Time"
            value={dateFormatter.format(new Date(transaction.transactionDate))}
          />

          <DetailRow
            label="Description"
            value={transaction.description || '—'}
            italic={!transaction.description}
          />

          <DetailRow
            label="Category"
            content={
              transaction.category ? (
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-base"
                    style={{
                      backgroundColor: transaction.category.color + '22',
                      color: transaction.category.color,
                    }}
                  >
                    {transaction.category.icon}
                  </div>
                  <span className="font-medium text-foreground">{transaction.category.name}</span>
                </div>
              ) : (
                <span className="italic text-muted-foreground">—</span>
              )
            }
          />

          <DetailRow
            label="Type"
            content={
              <Badge
                tone={transaction.type === 'INCOME' ? 'success' : 'neutral'}
                className="uppercase font-bold"
              >
                {transaction.type}
              </Badge>
            }
          />
        </div>
      </div>
    </ResponsiveModal>
  )
}

interface DetailRowProps {
  label: string
  value?: string
  content?: ReactElement
  italic?: boolean
}

function DetailRow({ label, value, content, italic }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-ui-border-subtle pb-3 last:border-0 last:pb-0">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      {content ? (
        content
      ) : (
        <p
          className={cn(
            'text-base text-foreground leading-relaxed',
            italic && 'italic text-muted-foreground',
          )}
        >
          {value}
        </p>
      )}
    </div>
  )
}
