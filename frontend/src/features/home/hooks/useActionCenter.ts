import { useMemo } from 'react'
import { useGetTransactionsQuery } from '../../../app/store/api/transactionApi'
import { useGetBudgetsQuery } from '../../../app/store/api/budgetApi'

interface DashboardAction {
  id: string
  title: string
  description?: string
  type: 'TASK' | 'WIN' | 'ALERT'
}

export const useActionCenter = () => {
  const { data: txData } = useGetTransactionsQuery({ pageSize: 50 })
  const { data: budgets = [] } = useGetBudgetsQuery()

  const insights = useMemo(() => {
    const tasks: DashboardAction[] = []
    const highlights: DashboardAction[] = []

    if (!txData?.items) return { tasks, highlights }

    // 1. Data Hygiene Tasks
    const uncategorized = txData.items
      .filter((tx) => !tx.category || tx.category.name === 'Uncategorized')
      .slice(0, 3)
    if (uncategorized.length > 0) {
      tasks.push({
        id: 'hygiene-uncategorized',
        title: `Categorize ${uncategorized.length} items`,
        type: 'TASK',
      })
    }

    if (budgets.length === 0) {
      tasks.push({
        id: 'task-no-budgets',
        title: 'Set your first budget',
        type: 'TASK',
      })
    }

    // 2. Highlights (Wins/Risks)
    const today = new Date().toISOString().split('T')[0]
    const todaySpend = txData.items
      .filter((tx) => tx.transactionDate.startsWith(today) && tx.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0)

    if (todaySpend === 0 && txData.items.length > 0) {
      highlights.push({
        id: 'highlight-no-spend',
        title: 'Zero-Spend Day!',
        description: "You haven't spent anything today. Keep it up!",
        type: 'WIN',
      })
    }

    const largeTx = txData.items.find((tx) => tx.amount > 500 && tx.type === 'EXPENSE')
    if (largeTx) {
      highlights.push({
        id: 'highlight-large-tx',
        title: 'Large Expense',
        description: `Your ${largeTx.description} was a major outlier this week.`,
        type: 'ALERT',
      })
    }

    return { tasks, highlights }
  }, [txData, budgets])

  return insights
}
