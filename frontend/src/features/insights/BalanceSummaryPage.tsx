import { useMemo, useState, type ReactElement } from 'react'
import { useGetPaymentMethodSummaryQuery } from '../../app/store/api/paymentMethodApi'
import {
  useGetSpendingSummaryQuery,
  useGetBalanceTrendsQuery,
} from '../../app/store/api/insightsApi'
import { CompactAccountList } from './components/CompactAccountList'
import { IncomeVsExpenseWidget } from './components/IncomeVsExpenseWidget'
import { BalanceTrendChart } from './components/BalanceTrendChart'
import { BalanceSummaryHero } from './components/BalanceSummaryHero'
import { SummaryFilterBar } from './components/SummaryFilterBar'
import { TrendInsights } from './components/TrendInsights'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { setGranularity, setSelectedAccountIds } from './balanceSummarySlice'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function BalanceSummaryPage(): ReactElement {
  const dispatch = useAppDispatch()
  const { selectedAccountIds, granularity } = useAppSelector((state) => state.balanceSummary)
  const [showAccountBreakdown, setShowAccountBreakdown] = useState(false)

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

  const filteredAccountSummaries = useMemo(() => {
    if (selectedAccountIds.length === 0) return accountSummaries
    return accountSummaries.filter(
      (s) => s.paymentMethod?.id && selectedAccountIds.includes(s.paymentMethod.id),
    )
  }, [accountSummaries, selectedAccountIds])

  const currentBalance = filteredAccountSummaries.reduce((acc, s) => acc + s.totalAmount, 0)
  const currentNetFlow = currentSummary?.netBalance ?? 0
  const previousBalance = currentBalance - currentNetFlow

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
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

      <TrendInsights trends={balanceTrends} isLoading={isTrendsLoading} />

      <div className="space-y-4">
        <div
          className="cursor-pointer group transition-all"
          onClick={() => setShowAccountBreakdown(!showAccountBreakdown)}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Cash Flow Summary
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              {showAccountBreakdown ? 'Hide Breakdown' : 'Show Account Breakdown'}
              {showAccountBreakdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </div>
          </div>
          <IncomeVsExpenseWidget summary={currentSummary} isLoading={isCurrentSummaryLoading} />
        </div>

        {showAccountBreakdown && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <div className="px-1 mb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Account Breakdown
              </h2>
            </div>
            <CompactAccountList
              summaries={filteredAccountSummaries}
              isLoading={isAccountsLoading}
            />
          </div>
        )}
      </div>

      <BalanceTrendChart
        trends={balanceTrends}
        granularity={granularity}
        onGranularityChange={(g) => dispatch(setGranularity(g))}
        isLoading={isTrendsLoading}
      />
    </div>
  )
}
