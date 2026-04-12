import { useState, useEffect, useMemo, type ReactElement } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TransactionList } from './components/TransactionList'
import { pageLayout } from '../../shared/styles/layout'
import { TransactionSearch } from './components/TransactionSearch'
import { TransactionFilter } from './components/TransactionFilter'
import { TransactionEmptyState } from './components/TransactionEmptyState'
import { ExportModal } from './components/ExportModal'
import { Download } from 'lucide-react'
import { useTransactionPipeline } from './hooks/useTransactionPipeline'
import { useSortPersistence } from './hooks/useSortPersistence'
import { Button } from '../../shared/components/Button'
import type { FilterState } from './types'
import { useTransactionPagination } from './hooks/useTransactionPagination'

import { calculateMoneyFlow } from './utils/transactionUtils'
import { MoneyFlowDisplay } from './components/MoneyFlowDisplay'

const INITIAL_FILTER: FilterState = {
  categories: [],
  types: [],
  paymentMethods: [],
  startDate: undefined,
  endDate: undefined,
}

export function TransactionListPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams()
  const { transactions, isLoading, hasMore, loadMore } = useTransactionPagination()

  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // 1. Pipeline Inputs (State Management)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterState, setFilterState] = useState<FilterState>(() => {
    const categories = searchParams
      .getAll('category')
      .map(Number)
      .filter((id) => !isNaN(id))
    const paymentMethods = searchParams
      .getAll('paymentMethod')
      .map(Number)
      .filter((id) => !isNaN(id))
    const types = searchParams.getAll('type') as ('INCOME' | 'EXPENSE')[]
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    return {
      categories,
      paymentMethods,
      types: types.filter((t) => ['INCOME', 'EXPENSE'].includes(t)),
      startDate,
      endDate,
    }
  })
  const [sortState] = useSortPersistence()

  // Sync URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('category')
    newParams.delete('type')
    newParams.delete('paymentMethod')
    newParams.delete('startDate')
    newParams.delete('endDate')

    filterState.categories.forEach((c) => newParams.append('category', String(c)))
    filterState.types.forEach((t) => newParams.append('type', t))
    filterState.paymentMethods.forEach((pm) => newParams.append('paymentMethod', String(pm)))

    if (filterState.startDate) newParams.set('startDate', filterState.startDate)
    if (filterState.endDate) newParams.set('endDate', filterState.endDate)

    setSearchParams(newParams, { replace: true })
  }, [filterState, setSearchParams, searchParams])

  // 2. The Shared Result Pipeline
  // Composable data pipeline: filter → search → sort
  const processedTransactions = useTransactionPipeline({
    transactions,
    searchQuery,
    filterState,
    sortState,
  })

  // Calculate money flow metrics from processed transactions
  const moneyFlow = useMemo(
    () => calculateMoneyFlow(processedTransactions),
    [processedTransactions],
  )

  const isSearchActive = searchQuery.trim().length > 0
  const isFilterActive =
    filterState.categories.length > 0 ||
    filterState.types.length > 0 ||
    filterState.paymentMethods.length > 0

  const handleClearSearch = () => setSearchQuery('')
  const handleClearFilter = () => setFilterState(INITIAL_FILTER)
  const handleClearAll = () => {
    handleClearSearch()
    handleClearFilter()
  }

  return (
    <div className={pageLayout.sectionGap}>
      <header className="space-y-7">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground">All Transactions</h1>
            <p className="text-muted-foreground">A complete record of your income and expenses.</p>
          </div>
        </div>

        {/* Money Flow Metrics Visualization */}
        {!isLoading && transactions.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-600 delay-75">
            <MoneyFlowDisplay {...moneyFlow} />
          </div>
        )}

        {/* Export Modal (Instructions 1-8) */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          transactions={processedTransactions}
          initialFilter={filterState}
          initialSearch={searchQuery}
          initialSort={sortState}
        />

        {/* Search, Filter, and Export Controls */}
        {!isLoading && transactions.length > 0 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[280px]">
                <TransactionSearch value={searchQuery} onChange={setSearchQuery} />
              </div>
              <div className="flex items-center gap-2">
                <TransactionFilter
                  filter={filterState}
                  onChange={setFilterState}
                  onClear={handleClearFilter}
                />
                <Button
                  variant="ghost"
                  className="h-10 px-4 border border-ui-border-subtle text-subtle-foreground hover:text-foreground hover:bg-ui-accent-subtle/30"
                  onClick={() => setIsExportModalOpen(true)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Active Filter Indicators (Optional, but good for UX) */}
            {isFilterActive && (
              <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1">
                  Active Filters:
                </p>
                {filterState.types.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase"
                  >
                    {type === 'INCOME' ? 'Income' : 'Expense'}
                    <button
                      onClick={() =>
                        setFilterState((prev) => ({
                          ...prev,
                          types: prev.types.filter((t) => t !== type),
                        }))
                      }
                      className="hover:text-primary-hover"
                    >
                      <CloseIcon />
                    </button>
                  </span>
                ))}
                {filterState.startDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                    From: {filterState.startDate}
                    <button
                      onClick={() => setFilterState((prev) => ({ ...prev, startDate: undefined }))}
                      className="hover:text-primary-hover"
                    >
                      <CloseIcon />
                    </button>
                  </span>
                )}
                {filterState.endDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                    To: {filterState.endDate}
                    <button
                      onClick={() => setFilterState((prev) => ({ ...prev, endDate: undefined }))}
                      className="hover:text-primary-hover"
                    >
                      <CloseIcon />
                    </button>
                  </span>
                )}
                {/* Note: Showing category names would require mapping IDs to categories, 
                    leaving as simple indicator for now to keep focus on pipeline */}
                {filterState.categories.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                    {filterState.categories.length} Categories
                    <button
                      onClick={() => setFilterState((prev) => ({ ...prev, categories: [] }))}
                      className="hover:text-primary-hover"
                    >
                      <CloseIcon />
                    </button>
                  </span>
                )}
                {filterState.paymentMethods.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                    {filterState.paymentMethods.length} Accounts
                    <button
                      onClick={() => setFilterState((prev) => ({ ...prev, paymentMethods: [] }))}
                      className="hover:text-primary-hover"
                    >
                      <CloseIcon />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      <div className="w-full">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : processedTransactions.length === 0 ? (
          <TransactionEmptyState
            isSearchActive={isSearchActive}
            isFilterActive={isFilterActive}
            onClearSearch={handleClearSearch}
            onClearFilter={handleClearFilter}
            onClearAll={handleClearAll}
          />
        ) : (
          <TransactionList
            transactions={processedTransactions}
            searchQuery={searchQuery}
            hasMore={hasMore}
            onLoadMore={loadMore}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}
