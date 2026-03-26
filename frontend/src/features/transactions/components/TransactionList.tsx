import type { ReactElement } from 'react'
import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import { Card } from '../../../shared/components/Card'
import { Badge } from '../../../shared/components/Badge'

interface TransactionListProps {
  transactions: TransactionResponse[]
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function TransactionList({ transactions }: TransactionListProps): ReactElement {
  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <Card
          key={tx.id}
          className="flex items-center justify-between border border-ui-border-subtle p-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            {tx.category ? (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                style={{ backgroundColor: tx.category.color + '22', color: tx.category.color }}
              >
                {tx.category.icon}
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-surface-muted text-muted-foreground">
                <TransactionIcon />
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">
                {tx.description || tx.category?.name || 'Transaction'}
              </p>
              <p className="text-xs text-muted-foreground">
                {dateFormatter.format(new Date(tx.transactionDate))}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={
                tx.type === 'INCOME' ? 'font-bold text-ui-success' : 'font-bold text-foreground'
              }
            >
              {tx.type === 'INCOME' ? '+' : '-'} {currencyFormatter.format(tx.amount)}
            </p>
            <Badge
              tone={tx.type === 'INCOME' ? 'success' : 'neutral'}
              className="text-[10px] uppercase font-bold px-2 py-0.5 mt-1"
            >
              {tx.type}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}

function TransactionIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}
