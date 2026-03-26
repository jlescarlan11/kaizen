import type { ReactElement } from 'react'
import { useState } from 'react'
import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import { Card } from '../../../shared/components/Card'
import { Badge } from '../../../shared/components/Badge'
import { groupTransactionsByDate, formatGroupDate } from '../utils/transactionUtils'
import { TransactionDetailModal } from './TransactionDetailModal'
import { cn } from '../../../shared/lib/cn'

interface TransactionListProps {
  transactions: TransactionResponse[]
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})

const timeFormatter = new Intl.DateTimeFormat('en-PH', {
  timeStyle: 'short',
})

export function TransactionList({ transactions }: TransactionListProps): ReactElement {
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRowClick = (tx: TransactionResponse) => {
    setSelectedTx(tx)
    setIsModalOpen(true)
  }

  const groupedTransactions = groupTransactionsByDate(transactions)

  return (
    <div className="space-y-8">
      {groupedTransactions.map((group) => (
        <div key={group.date} className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">
            {formatGroupDate(group.date)}
          </h2>
          <div className="space-y-3">
            {group.transactions.map((tx) => (
              <Card
                key={tx.id}
                role="button"
                tabIndex={0}
                onClick={() => handleRowClick(tx)}
                onKeyDown={(e) => e.key === 'Enter' && handleRowClick(tx)}
                className="flex items-center justify-between border border-ui-border-subtle p-4 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  {tx.category ? (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: tx.category.color + '22',
                        color: tx.category.color,
                      }}
                    >
                      {tx.category.icon}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110',
                        tx.type === 'INCOME'
                          ? 'bg-ui-success/10 text-ui-success'
                          : 'bg-ui-surface-muted text-muted-foreground',
                      )}
                    >
                      {tx.type === 'INCOME' ? <IncomeIcon /> : <ExpenseIcon />}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {tx.description || tx.category?.name || 'Transaction'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {timeFormatter.format(new Date(tx.transactionDate))}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={
                      tx.type === 'INCOME'
                        ? 'font-bold text-ui-success'
                        : 'font-bold text-foreground'
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
        </div>
      ))}

      <TransactionDetailModal
        transaction={selectedTx}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

function IncomeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 10l5-5 5 5" />
      <path d="M12 5v14" />
    </svg>
  )
}

function ExpenseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 14l5 5 5-5" />
      <path d="M12 19V5" />
    </svg>
  )
}
