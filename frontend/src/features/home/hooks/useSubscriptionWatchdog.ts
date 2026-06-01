import { useMemo } from 'react'
import {
  useGetTransactionsQuery,
  type TransactionResponse,
} from '../../../app/store/api/transactionApi'

export const useSubscriptionWatchdog = () => {
  const { data: txData, isLoading } = useGetTransactionsQuery({ pageSize: 100 })

  const subscriptions = useMemo(() => {
    if (!txData?.items) return []

    // Group by description to find patterns
    const groups = new Map<string, TransactionResponse[]>()
    txData.items.forEach((tx) => {
      if (tx.type === 'EXPENSE' && tx.description) {
        const key = tx.description.toLowerCase().trim()
        const existing = groups.get(key) || []
        groups.set(key, [...existing, tx])
      }
    })

    const detected = []
    for (const txs of groups.values()) {
      const isExplicitlyRecurring = txs.some((t) => t.isRecurring)
      const hasHistory = txs.length >= 2

      if (isExplicitlyRecurring || hasHistory) {
        // Simple heuristic: if it happens multiple times with similar amounts, it's a sub
        const amounts = txs.map((t) => t.amount)
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
        const isConsistent = amounts.every((a) => Math.abs(a - avgAmount) < 5)

        if (isConsistent || isExplicitlyRecurring) {
          detected.push({
            name: txs[0].description,
            amount: avgAmount,
            count: txs.length,
            isRecurring: isExplicitlyRecurring,
            lastDate: txs[0].transactionDate,
          })
        }
      }
    }

    return detected.sort((a, b) => b.amount - a.amount).slice(0, 3)
  }, [txData])

  return { subscriptions, isLoading }
}
