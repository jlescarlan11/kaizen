import type { ReactElement } from 'react'
import { TransactionList } from './components/TransactionList'
import { useGetTransactionsQuery } from '../../app/store/api/transactionApi'
import { pageLayout } from '../../shared/styles/layout'
import { Card } from '../../shared/components/Card'
import { calculateRunningBalance } from './utils/transactionUtils'
import { cn } from '../../shared/lib/cn'

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})

export function TransactionListPage(): ReactElement {
  // NOTE: Full load implemented with no pagination per PRD Instruction 1 constraints.
  // This decision avoids complexity for small-to-medium datasets but may need
  // virtualization or pagination if the history grows significantly.
  const { data: transactions = [], isLoading } = useGetTransactionsQuery()
  const balance = calculateRunningBalance(transactions)

  return (
    <div className={pageLayout.sectionGap}>
      <header className={pageLayout.headerGap}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Transaction History
            </h1>
            <p className="text-muted-foreground">A complete record of your income and expenses.</p>
          </div>

          {/* Running Balance Card */}
          {!isLoading && transactions.length > 0 && (
            <Card className="flex flex-col items-center md:items-end justify-center px-6 py-3 border-ui-border-subtle bg-ui-surface shadow-sm">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                Total Balance
              </p>
              <p
                className={cn(
                  'text-2xl font-bold tracking-tight',
                  balance >= 0 ? 'text-ui-success' : 'text-ui-error',
                )}
              >
                {currencyFormatter.format(balance)}
              </p>
            </Card>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl w-full">
        {isLoading ? (
          <Card className="p-12 flex justify-center border border-ui-border-subtle shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </Card>
        ) : transactions.length === 0 ? (
          <Card className="p-12 text-center border border-ui-border-subtle shadow-sm">
            <p className="text-muted-foreground">No transactions recorded yet.</p>
          </Card>
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </div>
    </div>
  )
}
