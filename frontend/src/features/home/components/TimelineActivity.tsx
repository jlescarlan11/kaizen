import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetTransactionsQuery } from '../../../app/store/api/transactionApi'
import { TransactionsEmptyState } from '../TransactionsEmptyState'
import { ADD_TRANSACTION_ROUTE } from '../routes'
import { ActivityListCard } from '../../transactions/components/ActivityListCard'
import { calculateMoneyFlow } from '../../transactions/utils/transactionUtils'

export const TimelineActivity: React.FC = () => {
  const navigate = useNavigate()
  const { data: transactionsData, isLoading } = useGetTransactionsQuery()

  const transactions = useMemo(() => transactionsData?.items ?? [], [transactionsData])
  const hasTransactions = transactions.length > 0

  const incomeTransactions = useMemo(
    () => transactions.filter((tx) => tx.type === 'INCOME').slice(0, 4),
    [transactions],
  )
  const expenseTransactions = useMemo(
    () => transactions.filter((tx) => tx.type === 'EXPENSE').slice(0, 4),
    [transactions],
  )

  const moneyFlow = useMemo(() => calculateMoneyFlow(transactions), [transactions])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <div className="h-72 bg-surface border border-border-subtle rounded-2xl animate-pulse" />
        <div className="h-72 bg-surface border border-border-subtle rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!hasTransactions) {
    return (
      <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm">
        <TransactionsEmptyState onAddTransaction={() => navigate(ADD_TRANSACTION_ROUTE)} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      <ActivityListCard
        title="Expenses"
        type="EXPENSE"
        transactions={expenseTransactions}
        totalAmount={moneyFlow.outgoing}
        onSeeAll={() => navigate('/transactions')}
      />
      <ActivityListCard
        title="Income"
        type="INCOME"
        transactions={incomeTransactions}
        totalAmount={moneyFlow.incoming}
        onSeeAll={() => navigate('/transactions')}
      />
    </div>
  )
}
