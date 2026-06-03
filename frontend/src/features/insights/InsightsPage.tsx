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
import { pageLayout } from '../../shared/styles/layout'
import { cn } from '../../shared/lib/cn'
import { Card, typography } from '../../shared/components'

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
    <div className="w-full">
      <div className={cn(pageLayout.sectionGap, 'animate-entrance-slide-up pb-24')}>
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className={typography.h1}>Spending Insights</h1>
          <PeriodSelector value={period} onChange={updatePeriod} />
        </div>

        {error && (
          <Card variant="error" role="alert">
            <p>Failed to load insights. Please try again.</p>
          </Card>
        )}

        <div className="space-y-5">
          <SpendingSummary
            summary={summary || { totalIncome: 0, totalExpenses: 0, netBalance: 0 }}
            isLoading={isSummaryLoading && !summary}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
    </div>
  )
}
