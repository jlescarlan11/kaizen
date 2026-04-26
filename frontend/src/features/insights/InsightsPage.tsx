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
    <section className={pageLayout.sectionGap}>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className={pageLayout.headerGap}>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
            Spending Insights
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Analyze your income and expenses over time.
          </p>
        </div>
        <PeriodSelector value={period} onChange={updatePeriod} />
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-ui-border bg-ui-danger-subtle p-4 text-ui-danger-text"
        >
          {error instanceof Error ? error.message : 'Failed to load insights. Please try again.'}
        </div>
      )}

      <SpendingSummary
        summary={summary || { totalIncome: 0, totalExpenses: 0, netBalance: 0 }}
        isLoading={isSummaryLoading && !summary}
      />

      <div className="grid grid-cols-1 gap-6 md:gap-7 lg:grid-cols-2">
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
    </section>
  )
}
