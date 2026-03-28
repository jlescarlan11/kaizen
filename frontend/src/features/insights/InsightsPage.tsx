import { useState } from 'react'
import { useInsightsPeriod } from './hooks/useInsightsPeriod'
import {
  useGetSpendingSummaryQuery,
  useGetCategoryBreakdownQuery,
  useGetSpendingTrendsQuery,
} from '../../app/store/api/insightsApi'
import type { Granularity } from './types'
import { PeriodSelector } from './components/PeriodSelector'
import { SpendingSummary } from './components/SpendingSummary'
import { CategoryBreakdown } from './components/CategoryBreakdown'
import { SpendingTrends } from './components/SpendingTrends'

export default function InsightsPage() {
  const { period, dateRange, updatePeriod } = useInsightsPeriod()
  const [granularity, setGranularity] = useState<Granularity>('MONTHLY')

  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useGetSpendingSummaryQuery(dateRange)

  const {
    data: breakdown,
    isLoading: isBreakdownLoading,
    error: breakdownError,
  } = useGetCategoryBreakdownQuery(dateRange)

  const {
    data: trends,
    isLoading: isTrendsLoading,
    error: trendsError,
  } = useGetSpendingTrendsQuery({ ...dateRange, granularity })

  const error = summaryError || breakdownError || trendsError

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Spending Insights</h1>
          <p className="text-gray-500 mt-1">Analyze your income and expenses over time.</p>
        </div>
        <PeriodSelector value={period} onChange={updatePeriod} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
          {error instanceof Error ? error.message : 'Failed to load insights. Please try again.'}
        </div>
      )}

      <div className="space-y-8">
        <SpendingSummary
          summary={summary || { totalIncome: 0, totalExpenses: 0, netBalance: 0 }}
          isLoading={isSummaryLoading && !summary}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CategoryBreakdown
            breakdown={breakdown || { categories: [] }}
            isLoading={isBreakdownLoading && !breakdown}
          />
          <SpendingTrends
            trends={trends || { series: [] }}
            granularity={granularity}
            onGranularityChange={setGranularity}
            isLoading={isTrendsLoading && !trends}
          />
        </div>
      </div>
    </div>
  )
}
