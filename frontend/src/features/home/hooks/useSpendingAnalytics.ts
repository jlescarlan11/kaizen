import { useMemo } from 'react'
import { useGetSpendingTrendsQuery } from '../../../app/store/api/insightsApi'

export const useSpendingAnalytics = (days = 30) => {
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

  const { data, isLoading, error } = useGetSpendingTrendsQuery(dateRange)

  const processedData = useMemo(() => {
    if (!data?.series) return []

    // Create a map of existing data for quick lookup (YYYY-MM-DD)
    const dataMap = new Map(
      data.series.map((entry) => {
        const d = new Date(entry.periodStart)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        return [key, entry.total]
      }),
    )

    const result = []
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)

    const dateFormatter = new Intl.DateTimeFormat('en-PH', {
      month: 'short',
      day: 'numeric',
    })

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      result.push({
        date: dateFormatter.format(d),
        fullDate: dateKey,
        amount: Math.abs(dataMap.get(dateKey) || 0),
      })
    }

    return result
  }, [data, dateRange])

  const totalSpending = useMemo(() => {
    return processedData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [processedData])

  return {
    data: processedData,
    totalSpending,
    isLoading,
    error,
  }
}
