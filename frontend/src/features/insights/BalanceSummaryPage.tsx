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
import {
  setDateRange,
  setGranularity,
  setPeriodPreset,
  setSelectedAccountIds,
} from './balanceSummarySlice'
import { getPeriodRange } from './constants'
import type { PeriodOption } from './types'

export function BalanceSummaryPage(): ReactElement {
  const dispatch = useAppDispatch()
  const { dateRange, selectedAccountIds, granularity, periodPreset } = useAppSelector(
    (state) => state.balanceSummary,
  )

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

  const handlePeriodPresetChange = (preset: PeriodOption) => {
    dispatch(setPeriodPreset(preset))
    if (preset !== 'CUSTOM') {
      dispatch(setDateRange(getPeriodRange(preset)))
    }
  }

  const filteredAccountSummaries = useMemo(() => {
    if (selectedAccountIds.length === 0) return accountSummaries
    return accountSummaries.filter(
      (s) => s.paymentMethod?.id && selectedAccountIds.includes(s.paymentMethod.id),
    )
  }, [accountSummaries, selectedAccountIds])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-6">
          <BalanceSummaryHero
            currentBalance={currentBalance}
            previousBalance={previousBalance}
            isLoading={isAccountsLoading || isCurrentSummaryLoading}
          />

          <SummaryFilterBar
            periodPreset={periodPreset}
            onPeriodPresetChange={handlePeriodPresetChange}
            selectedAccountIds={selectedAccountIds}
            onAccountSelectionChange={(ids) => dispatch(setSelectedAccountIds(ids))}
            accounts={accounts}
          />

          <BalanceTrendChart
            trends={balanceTrends}
            granularity={granularity}
            onGranularityChange={(g) => dispatch(setGranularity(g))}
            isLoading={isTrendsLoading}
          />
        </div>

        <div className="lg:w-80 space-y-6 shrink-0">
          <AccountBreakdownWidget
            summaries={filteredAccountSummaries}
            isLoading={isAccountsLoading}
          />
          <IncomeVsExpenseWidget summary={currentSummary} isLoading={isCurrentSummaryLoading} />
        </div>
      </div>
    </div>
  )
}
