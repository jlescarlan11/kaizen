import { useMemo } from 'react'
import { useGetBalanceTrendsQuery } from '../../../app/store/api/insightsApi'

export const useBalanceAnalytics = (days = 30) => {
  const dateRange = useMemo(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - (days - 1))

    return {
      start: start.toISOString(),
      end: end.toISOString(),
      granularity: 'DAILY' as const,
    }
  }, [days])

  const { data, isLoading, error } = useGetBalanceTrendsQuery(dateRange)

  const processedData = useMemo(() => {
    if (!data?.series) return []

    return data.series.map((entry) => {
      const d = new Date(entry.periodStart)
      return {
        date: d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
        balance: entry.netBalance,
      }
    })
  }, [data])

  return {
    data: processedData,
    isLoading,
    error,
  }
}
