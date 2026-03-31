import { type ReactElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetTransactionQuery } from '../../app/store/api/transactionApi'
import { Button } from '../../shared/components/Button'
import { pageLayout } from '../../shared/styles/layout'
import { cn } from '../../shared/lib/cn'
import { TransactionDetailHeader } from './components/TransactionDetailHeader'
import { TransactionDetailInfo } from './components/TransactionDetailInfo'

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

  return (
    <div className={cn(pageLayout.sectionGap, 'pt-4 md:pt-8')}>
      <div className="mx-auto max-w-3xl w-full space-y-12 pb-20">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Transaction Details
          </h1>
          <p className="text-muted-foreground text-lg">Full overview of your record.</p>
        </div>

        <TransactionDetailHeader
          amount={transaction.amount}
          type={transaction.type}
          date={transaction.transactionDate}
        />

        <TransactionDetailInfo
          category={transaction.category}
          paymentMethod={transaction.paymentMethod}
          description={transaction.description}
          notes={transaction.notes}
          type={transaction.type}
        />
      </div>
    </div>
  )
}
