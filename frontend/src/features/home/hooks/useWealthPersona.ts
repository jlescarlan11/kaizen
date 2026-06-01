import { useMemo } from 'react'
import { useWealthHealth } from './useWealthHealth'
import { useActionCenter } from './useActionCenter'
import { useGetTransactionsQuery } from '../../../app/store/api/transactionApi'

export const useWealthPersona = () => {
  const { analytics } = useWealthHealth()
  const { tasks } = useActionCenter()
  const { data: txData } = useGetTransactionsQuery({ pageSize: 50 })

  return useMemo(() => {
    if (!analytics) return null

    let persona = 'The Student'
    let description = 'Just getting started on the journey.'
    let icon = 'hand'

    if (analytics.savingsRate > 30) {
      persona = 'The Accumulator'
      description = 'Mastering the art of keeping what you earn.'
      icon = 'target'
    } else if (analytics.netFlow > 2000) {
      persona = 'Cash Flow King'
      description = 'Generating strong momentum this month.'
      icon = 'trending-up'
    } else if (tasks.length === 0) {
      persona = 'Data Perfectionist'
      description = 'Your financial records are spotless.'
      icon = 'check-circle'
    }

    // Streak Logic (Simple: Days with $0 spend in the last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split('T')[0]
    })

    const spendDays = new Set(
      txData?.items
        ?.filter((tx) => tx.type === 'EXPENSE')
        .map((tx) => tx.transactionDate.split('T')[0]),
    )

    let streak = 0
    for (const day of last7Days) {
      if (!spendDays.has(day)) {
        streak++
      } else {
        break // Streak broken
      }
    }

    return { persona, description, icon, streak }
  }, [analytics, tasks, txData])
}
