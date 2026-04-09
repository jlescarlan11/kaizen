import { useMemo, useState, type ReactElement } from 'react'
import { useGetPaymentMethodSummaryQuery } from '../../app/store/api/paymentMethodApi'
import {
  useGetSpendingSummaryQuery,
  useGetBalanceTrendsQuery,
} from '../../app/store/api/insightsApi'
import { AccountBreakdownWidget } from './components/AccountBreakdownWidget'
import { IncomeVsExpenseWidget } from './components/IncomeVsExpenseWidget'
import { PeriodComparisonWidget } from './components/PeriodComparisonWidget'
import { BalanceTrendChart } from './components/BalanceTrendChart'
import type { Granularity } from './types'

export function BalanceSummaryPage(): ReactElement {
  const [granularity, setGranularity] = useState<Granularity>('MONTHLY')

  const { data: accountSummaries = [], isLoading: isAccountsLoading } =
    useGetPaymentMethodSummaryQuery()

  const { currentRange, yearRange } = useMemo(() => {
    const now = new Date()
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentEnd = new Date()

    const yearStart = new Date(now.getFullYear(), 0, 1)
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59)

    return {
      currentRange: { start: currentStart.toISOString(), end: currentEnd.toISOString() },
      yearRange: { start: yearStart.toISOString(), end: yearEnd.toISOString() },
    }
  }, [])

  const { data: currentSummary, isLoading: isCurrentSummaryLoading } =
    useGetSpendingSummaryQuery(currentRange)

  const { data: balanceTrends = { series: [] }, isLoading: isTrendsLoading } =
    useGetBalanceTrendsQuery({
      ...yearRange,
      granularity,
    })

  // Calculate current total balance from account summaries
  const currentBalance = accountSummaries.reduce((acc, s) => acc + s.totalAmount, 0)

  // For previous balance, we can approximate it by taking current balance
  // and subtracting current month's net flow.
  // Note: This is an approximation if there were manual adjustments or deletions.
  const currentNetFlow = currentSummary?.netBalance ?? 0
  const previousBalance = currentBalance - currentNetFlow

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Balance Summary</h1>
        <p className="text-muted-foreground text-sm">
          A detailed breakdown of your current financial status.
        </p>
      </div>

      <BalanceTrendChart
        trends={balanceTrends}
        granularity={granularity}
        onGranularityChange={setGranularity}
        isLoading={isTrendsLoading}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AccountBreakdownWidget summaries={accountSummaries} isLoading={isAccountsLoading} />

        <IncomeVsExpenseWidget summary={currentSummary} isLoading={isCurrentSummaryLoading} />

        <PeriodComparisonWidget
          currentBalance={currentBalance}
          previousBalance={previousBalance}
          isLoading={isAccountsLoading || isCurrentSummaryLoading}
        />
      </div>
    </div>
  )
}
