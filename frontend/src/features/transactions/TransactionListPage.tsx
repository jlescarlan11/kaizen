import type { ReactElement } from 'react'
import { TransactionList } from './components/TransactionList'
import { useGetTransactionsQuery } from '../../app/store/api/transactionApi'
import { pageLayout } from '../../shared/styles/layout'
import { Card } from '../../shared/components/Card'

export function TransactionListPage(): ReactElement {
  const { data: transactions = [], isLoading } = useGetTransactionsQuery()

  return (
    <div className={pageLayout.sectionGap}>
      <header className={pageLayout.headerGap}>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Transaction History
        </h1>
        <p className="text-muted-foreground">A complete record of your income and expenses.</p>
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
