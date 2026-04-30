import { useMemo, useState, type ReactElement } from 'react'
import { useGetPaymentMethodSummaryQuery } from '../../app/store/api/paymentMethodApi'
import {
  useGetSpendingSummaryQuery,
  useGetBalanceTrendsQuery,
  useGetCategoryBreakdownQuery,
  useGetSpendingTrendsQuery,
} from '../../app/store/api/insightsApi'
import { pageLayout } from '../../shared/styles/layout'
import { CompactAccountList } from './components/CompactAccountList'
import { BalanceTrendChart } from './components/BalanceTrendChart'
import { CategoryBreakdown } from './components/CategoryBreakdown'
import { SpendingTrends } from './components/SpendingTrends'
import { BalanceSummaryHero } from './components/BalanceSummaryHero'
import { SummaryFilterBar } from './components/SummaryFilterBar'
import { PeriodSelector } from './components/PeriodSelector'
import { useInsightsPeriod } from './hooks/useInsightsPeriod'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { setGranularity, setSelectedAccountIds } from './balanceSummarySlice'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { deliverExportFile } from '../transactions/export/exportDelivery'
import type { Granularity, PeriodOption } from './types'

const PERIOD_LABELS: Record<PeriodOption, string> = {
  CURRENT_MONTH: 'Current Month',
  LAST_MONTH: 'Last Month',
  LAST_3_MONTHS: 'Last 3 Months',
  ALL_TIME: 'One Year',
  YTD: 'Year to Date',
  LAST_12_MONTHS: 'Last 12 Months',
  CUSTOM: 'Custom Period',
}

export function BalanceSummaryPage(): ReactElement {
  const dispatch = useAppDispatch()
  const { selectedAccountIds, granularity } = useAppSelector((state) => state.balanceSummary)
  const { period, dateRange, updatePeriod } = useInsightsPeriod()
  const [spendingGranularity, setSpendingGranularity] = useState<Granularity>('MONTHLY')

  const { data: accountSummaries = [], isLoading: isAccountsLoading } =
    useGetPaymentMethodSummaryQuery()

  const accounts = useMemo(() => {
    return accountSummaries
      .map((s) => ({
        id: s.paymentMethod?.id ?? 0,
        name: s.paymentMethod?.name ?? 'Unknown',
      }))
      .filter((a) => a.id !== 0)
  }, [accountSummaries])

  const apiParams = useMemo(
    () => ({
      ...dateRange,
      paymentMethodIds: selectedAccountIds.length > 0 ? selectedAccountIds : undefined,
    }),
    [dateRange, selectedAccountIds],
  )

  const { data: currentSummary, isLoading: isCurrentSummaryLoading } =
    useGetSpendingSummaryQuery(apiParams)

  const { data: balanceTrends = { series: [] }, isLoading: isTrendsLoading } =
    useGetBalanceTrendsQuery({
      ...apiParams,
      granularity,
    })

  const { data: breakdown, isLoading: isBreakdownLoading } = useGetCategoryBreakdownQuery(apiParams)

  const { data: spendingTrends, isLoading: isSpendingTrendsLoading } = useGetSpendingTrendsQuery({
    ...apiParams,
    granularity: spendingGranularity,
  })

  const filteredAccountSummaries = useMemo(() => {
    if (selectedAccountIds.length === 0) return accountSummaries
    return accountSummaries.filter(
      (s) => s.paymentMethod?.id && selectedAccountIds.includes(s.paymentMethod.id),
    )
  }, [accountSummaries, selectedAccountIds])

  const currentBalance = filteredAccountSummaries.reduce((acc, s) => acc + s.totalAmount, 0)
  const currentNetFlow = currentSummary?.netBalance ?? 0
  const previousBalance = currentBalance - currentNetFlow
  const totalIncome = currentSummary?.totalIncome ?? 0
  const totalSpent = currentSummary?.totalExpenses ?? 0
  const periodLabel = PERIOD_LABELS[period]

  const handleExportCSV = () => {
    if (!balanceTrends.series.length) return

    const headers = ['Date', 'Income', 'Expenses', 'Net Balance']
    const rows = balanceTrends.series.map((t) => [
      new Date(t.periodStart).toLocaleDateString(),
      t.income.toString(),
      t.expenses.toString(),
      t.netBalance.toString(),
    ])

    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const filename = `balance_summary_${granularity.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`

    deliverExportFile(csvContent, filename)
  }

  return (
    <div className={pageLayout.sectionGap}>
      {/* Hero Card */}
      <BalanceSummaryHero
        currentBalance={currentBalance}
        previousBalance={previousBalance}
        periodLabel={periodLabel}
        accountCount={filteredAccountSummaries.length}
        totalIncome={totalIncome}
        totalSpent={totalSpent}
        isLoading={isAccountsLoading || isCurrentSummaryLoading}
      />

      {/* Controls Row */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <PeriodSelector value={period} onChange={updatePeriod} />
        </div>
        <div className="flex-1">
          <SummaryFilterBar
            selectedAccountIds={selectedAccountIds}
            onAccountSelectionChange={(ids) => dispatch(setSelectedAccountIds(ids))}
            accounts={accounts}
          />
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={isTrendsLoading || !balanceTrends.series.length}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-ui-surface border border-ui-border rounded-xl text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50 shadow-sm"
        >
          <SharedIcon type="ui" name="download" size={12} />
          Export CSV
        </button>
      </div>

      {/* Main Analysis Section */}
      <div className="space-y-12">
        <section>
          <BalanceTrendChart
            trends={balanceTrends}
            granularity={granularity}
            onGranularityChange={(g) => dispatch(setGranularity(g))}
            isLoading={isTrendsLoading}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 md:gap-7 lg:grid-cols-2">
          <CategoryBreakdown
            breakdown={breakdown ?? { categories: [] }}
            isLoading={isBreakdownLoading && !breakdown}
            title="Spending Breakdown"
          />
          <SpendingTrends
            trends={spendingTrends ?? { series: [] }}
            granularity={spendingGranularity}
            onGranularityChange={setSpendingGranularity}
            isLoading={isSpendingTrendsLoading && !spendingTrends}
          />
        </section>

        <section className="pt-8 border-t border-ui-border-subtle">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Accounts
          </p>
          <CompactAccountList summaries={filteredAccountSummaries} isLoading={isAccountsLoading} />
        </section>
      </div>
    </div>
  )
}
