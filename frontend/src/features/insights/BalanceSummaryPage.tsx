import { useMemo, useState, type ReactElement } from 'react'
import { useGetPaymentMethodSummaryQuery } from '../../app/store/api/paymentMethodApi'
import {
  useGetSpendingSummaryQuery,
  useGetBalanceTrendsQuery,
} from '../../app/store/api/insightsApi'
import { pageLayout } from '../../shared/styles/layout'
import { CompactAccountList } from './components/CompactAccountList'
import { IncomeVsExpenseWidget } from './components/IncomeVsExpenseWidget'
import { BalanceTrendChart } from './components/BalanceTrendChart'
import { BalanceSummaryHero } from './components/BalanceSummaryHero'
import { SummaryFilterBar } from './components/SummaryFilterBar'
import { TrendInsights } from './components/TrendInsights'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { setGranularity, setSelectedAccountIds } from './balanceSummarySlice'
import { ChevronDown, ChevronUp, Download } from 'lucide-react'
import { deliverExportFile } from '../transactions/export/exportDelivery'

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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <BalanceSummaryHero
          currentBalance={currentBalance}
          previousBalance={previousBalance}
          isLoading={isAccountsLoading || isCurrentSummaryLoading}
        />
        <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[260px]">
          <SummaryFilterBar
            selectedAccountIds={selectedAccountIds}
            onAccountSelectionChange={(ids) => dispatch(setSelectedAccountIds(ids))}
            accounts={accounts}
          />
          <button
            onClick={handleExportCSV}
            disabled={isTrendsLoading || !balanceTrends.series.length}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-ui-surface border border-ui-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50 shadow-sm"
          >
            <Download size={12} />
            Export Data (CSV)
          </button>
        </div>
      </div>

      {/* Observations - Top Priority */}
      <div className="mb-12">
        <TrendInsights trends={balanceTrends} isLoading={isTrendsLoading} />
      </div>

      {/* Main Analysis Section */}
      <div className="space-y-12">
        {/* Trend Visualization */}
        <section>
          <BalanceTrendChart
            trends={balanceTrends}
            granularity={granularity}
            onGranularityChange={(g) => dispatch(setGranularity(g))}
            isLoading={isTrendsLoading}
          />
        </section>

        {/* Cash Flow & Drilldown */}
        <section className="pt-8 border-t border-ui-border-subtle">
          <div
            className="cursor-pointer group transition-all"
            onClick={() => setShowAccountBreakdown(!showAccountBreakdown)}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Cash Flow Deep Dive
                </h2>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary group-hover:translate-x-1 transition-all">
                {showAccountBreakdown ? 'Collapse Assets' : 'Expand Assets'}
                {showAccountBreakdown ? (
                  <ChevronUp size={12} strokeWidth={3} />
                ) : (
                  <ChevronDown size={12} strokeWidth={3} />
                )}
              </div>
            </div>
            <IncomeVsExpenseWidget summary={currentSummary} isLoading={isCurrentSummaryLoading} />
          </div>

          {showAccountBreakdown && (
            <div className="mt-6 animate-in slide-in-from-top-4 duration-500 ease-out">
              <div className="px-1 mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  Individual Account Performance
                </h3>
              </div>
              <CompactAccountList
                summaries={filteredAccountSummaries}
                isLoading={isAccountsLoading}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
