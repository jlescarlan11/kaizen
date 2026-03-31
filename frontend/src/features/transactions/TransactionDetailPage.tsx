import { type ReactElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetTransactionQuery } from '../../app/store/api/transactionApi'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { Button } from '../../shared/components/Button'
import { pageLayout } from '../../shared/styles/layout'
import { formatCurrency } from '../../shared/lib/formatCurrency'
import { cn } from '../../shared/lib/cn'

const currencyFormatter = {
  format: (amount: number) => formatCurrency(amount),
}

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'full',
  timeStyle: 'short',
})

export function TransactionDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: transaction, isLoading, error } = useGetTransactionQuery(Number(id))

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-foreground">Transaction not found</h2>
        <Button variant="ghost" onClick={() => navigate('/transactions')} className="mt-4">
          Back to Transactions
        </Button>
      </div>
    )
  }

  const handleEdit = () => {
    navigate(`/transactions/edit/${transaction.id}`)
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'Income'
      case 'EXPENSE':
        return 'Expense'
      case 'RECONCILIATION':
        return 'Adjustment'
      case 'INITIAL_BALANCE':
        return 'Initial Balance'
      default:
        return type
    }
  }

  return (
    <div className={pageLayout.sectionGap}>
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Transaction Details
          </h1>
          <p className="text-muted-foreground">Full overview of your record.</p>
        </div>
        <Button onClick={handleEdit} className="shrink-0">
          Edit
        </Button>
      </header>

      <div className="mx-auto max-w-2xl w-full space-y-8">
        {/* Amount Card */}
        <div className="flex flex-col items-center justify-center py-10 bg-ui-surface-muted rounded-3xl border border-ui-border-subtle shadow-sm">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            {getTypeName(transaction.type)}
          </p>
          <p
            className={cn(
              'text-5xl font-bold tracking-tight',
              transaction.type === 'EXPENSE' ? 'text-foreground' : 'text-ui-success',
            )}
          >
            {transaction.type === 'EXPENSE' ? '-' : '+'}{' '}
            <span className="text-muted-foreground text-3xl font-medium mr-1">PHP</span>
            {currencyFormatter.format(transaction.amount).replace('PHP', '').trim()}
          </p>
        </div>

        {/* Details List */}
        <div className="grid grid-cols-1 gap-y-6">
          <DetailRow
            label="Date & Time"
            value={dateFormatter.format(new Date(transaction.transactionDate))}
          />

          <DetailRow
            label="Description"
            value={transaction.description || '—'}
            italic={!transaction.description}
          />

          <DetailRow label="Notes" value={transaction.notes || '—'} italic={!transaction.notes} />

          <DetailRow
            label="Category"
            content={
              <div className="flex items-center gap-3">
                {transaction.category ? (
                  <>
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                      style={{
                        backgroundColor: transaction.category.color + '15',
                        color: transaction.category.color,
                      }}
                    >
                      <SharedIcon type="category" name={transaction.category.icon} size={20} />
                    </div>
                    <span className="text-lg font-medium text-foreground">
                      {transaction.category.name}
                    </span>
                  </>
                ) : (
                  <span className="italic text-muted-foreground">—</span>
                )}
              </div>
            }
          />

          <DetailRow
            label="Payment Method"
            content={
              <div className="flex items-center gap-3">
                {transaction.paymentMethod ? (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-surface-strong text-foreground text-sm font-bold border border-ui-border">
                      {transaction.paymentMethod.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-lg font-medium text-foreground">
                      {transaction.paymentMethod.name}
                    </span>
                  </>
                ) : (
                  <span className="italic text-muted-foreground">—</span>
                )}
              </div>
            }
          />
        </div>
      </div>
    </div>
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
    <div className="flex flex-col gap-2 border-b border-ui-border-subtle pb-4 last:border-0 last:pb-0">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
      {content ? (
        content
      ) : (
        <p
          className={cn(
            'text-lg text-foreground leading-relaxed',
            italic && 'italic text-muted-foreground',
          )}
        >
          {value}
        </p>
      )}
    </div>
  )
}
