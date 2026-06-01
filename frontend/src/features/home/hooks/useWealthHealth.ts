import { useMemo } from 'react'
import { useGetSpendingSummaryQuery } from '../../../app/store/api/insightsApi'

export const useWealthHealth = () => {
  const currentMonthRange = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return {
      start: start.toISOString(),
      end: now.toISOString(),
    }
  }, [])

  const lastMonthRange = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    }
  }, [])

  const { data: current, isLoading: isCurrentLoading } =
    useGetSpendingSummaryQuery(currentMonthRange)
  const { data: previous, isLoading: isPreviousLoading } =
    useGetSpendingSummaryQuery(lastMonthRange)

  const analytics = useMemo(() => {
    if (!current) return null

    const savingsRate =
      current.totalIncome > 0 ? Math.max(0, (current.netBalance / current.totalIncome) * 100) : 0

    const netFlowDiff = previous ? current.netBalance - previous.netBalance : 0
    const netFlowChange =
      previous && previous.netBalance !== 0
        ? (netFlowDiff / Math.abs(previous.netBalance)) * 100
        : 0

    return {
      savingsRate: Math.round(savingsRate),
      netFlow: current.netBalance,
      netFlowChange: Math.round(netFlowChange),
      isImproving: netFlowChange >= 0,
    }
  }, [current, previous])

  return {
    analytics,
    currentSummary: current ?? null,
    isLoading: isCurrentLoading || isPreviousLoading,
  }
}
