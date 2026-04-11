import { useMemo, type ReactElement } from 'react'
import { useGetPaymentMethodSummaryQuery } from '../../app/store/api/paymentMethodApi'
import {
  useGetSpendingSummaryQuery,
  useGetBalanceTrendsQuery,
} from '../../app/store/api/insightsApi'
import { AccountBreakdownWidget } from './components/AccountBreakdownWidget'
import { IncomeVsExpenseWidget } from './components/IncomeVsExpenseWidget'
import { BalanceTrendChart } from './components/BalanceTrendChart'
import { BalanceSummaryHero } from './components/BalanceSummaryHero'
import { SummaryFilterBar } from './components/SummaryFilterBar'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { setGranularity, setSelectedAccountIds } from './balanceSummarySlice'

export function BalanceSummaryPage(): ReactElement {
  const dispatch = useAppDispatch()
  const { selectedAccountIds, granularity } = useAppSelector((state) => state.balanceSummary)

  const dateRange = useMemo(() => {
    const now = new Date()
    const start = new Date()
    const end = new Date()

    switch (granularity) {
      case 'DAILY':
        start.setDate(now.getDate() - 30)
        break
      case 'WEEKLY':
        start.setDate(now.getDate() - 28) // 4 weeks
        break
      case 'MONTHLY':
        start.setFullYear(now.getFullYear() - 1) // 12 months
        break
    }

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    }
  }, [granularity])

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

  const { data: currentSummary, isLoading: isCurrentSummaryLoading } =
    useGetSpendingSummaryQuery(dateRange)

  const { data: balanceTrends = { series: [] }, isLoading: isTrendsLoading } =
    useGetBalanceTrendsQuery({
      ...dateRange,
      granularity,
    })

  const currentBalance = accountSummaries.reduce((acc, s) => acc + s.totalAmount, 0)
  const currentNetFlow = currentSummary?.netBalance ?? 0
  const previousBalance = currentBalance - currentNetFlow

  const filteredAccountSummaries = useMemo(() => {
    if (selectedAccountIds.length === 0) return accountSummaries
    return accountSummaries.filter(
      (s) => s.paymentMethod?.id && selectedAccountIds.includes(s.paymentMethod.id),
    )
  }, [accountSummaries, selectedAccountIds])

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <BalanceSummaryHero
          currentBalance={currentBalance}
          previousBalance={previousBalance}
          isLoading={isAccountsLoading || isCurrentSummaryLoading}
        />
        <div className="w-full md:w-auto md:min-w-[240px]">
          <SummaryFilterBar
            selectedAccountIds={selectedAccountIds}
            onAccountSelectionChange={(ids) => dispatch(setSelectedAccountIds(ids))}
            accounts={accounts}
          />
        </div>
      </div>

      <BalanceTrendChart
        trends={balanceTrends}
        granularity={granularity}
        onGranularityChange={(g) => dispatch(setGranularity(g))}
        isLoading={isTrendsLoading}
      />

      <AccountBreakdownWidget summaries={filteredAccountSummaries} isLoading={isAccountsLoading} />

      <IncomeVsExpenseWidget summary={currentSummary} isLoading={isCurrentSummaryLoading} />
    </div>
  )
}
