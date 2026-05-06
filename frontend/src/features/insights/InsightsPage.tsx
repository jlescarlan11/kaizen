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
    <div className={cn(pageLayout.sectionGap, 'animate-entrance-slide-up pb-24')}>
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tighter text-text-primary uppercase">
            Insights
          </h1>
          <p className="text-base font-medium text-text-secondary tracking-tight opacity-60">
            Analyze your spending life.
          </p>
        </div>
        <PeriodSelector value={period} onChange={updatePeriod} />
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border-2 border-error/20 bg-error/5 p-5 text-error font-bold uppercase tracking-tight text-center"
        >
          {error instanceof Error ? error.message : 'Failed to load insights.'}
        </div>
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
  )
}
