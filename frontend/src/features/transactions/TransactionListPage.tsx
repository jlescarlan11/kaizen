import { useState, useEffect, type ReactElement } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { TransactionList } from './components/TransactionList'
import { pageLayout } from '../../shared/styles/layout'
import { Card } from '../../shared/components/Card'
import { calculateRunningBalance } from './utils/transactionUtils'
import { cn } from '../../shared/lib/cn'
import { TransactionSearch } from './components/TransactionSearch'
import { TransactionFilter } from './components/TransactionFilter'
import { TransactionSort } from './components/TransactionSort'
import { TransactionEmptyState } from './components/TransactionEmptyState'
import { ReconciliationModal } from './components/ReconciliationModal'
import { ExportModal } from './components/ExportModal'
import { History, Download, RefreshCw } from 'lucide-react'
import { useTransactionPipeline } from './hooks/useTransactionPipeline'
import { useSortPersistence } from './hooks/useSortPersistence'
import { Button } from '../../shared/components/Button'
import type { FilterState } from './types'
import { useTransactionPagination } from './hooks/useTransactionPagination'

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})

const INITIAL_FILTER: FilterState = {
  categories: [],
  types: [],
}

export function TransactionListPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams()
  const { transactions, isLoading, hasMore, loadMore } = useTransactionPagination()

  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // 1. Pipeline Inputs (State Management)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterState, setFilterState] = useState<FilterState>(() => {
    const categories = searchParams
      .getAll('category')
      .map(Number)
      .filter((id) => !isNaN(id))
    const types = searchParams.getAll('type') as ('INCOME' | 'EXPENSE')[]
    return {
      categories,
      types: types.filter((t) => ['INCOME', 'EXPENSE'].includes(t)),
    }
  })
  const [sortState, setSortState] = useSortPersistence()

  // Sync URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('category')
    newParams.delete('type')
    filterState.categories.forEach((c) => newParams.append('category', String(c)))
    filterState.types.forEach((t) => newParams.append('type', t))
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

  // Calculate balance based on ALL visible transactions (unfiltered by search/filter)
  // to maintain consistent "Total Balance" context.
  const balance = calculateRunningBalance(transactions)

  const isSearchActive = searchQuery.trim().length > 0
  const isFilterActive = filterState.categories.length > 0 || filterState.types.length > 0

  const handleClearSearch = () => setSearchQuery('')
  const handleClearFilter = () => setFilterState(INITIAL_FILTER)
  const handleClearAll = () => {
    handleClearSearch()
    handleClearFilter()
  }

  return (
    <div className={pageLayout.sectionGap}>
      <header className={pageLayout.headerGap}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Transaction History
            </h1>
            <p className="text-muted-foreground">A complete record of your income and expenses.</p>
          </div>

          {/* Running Balance Card */}
          {!isLoading && transactions.length > 0 && (
            <div className="flex flex-col items-center md:items-end gap-2">
              <Card className="flex flex-col items-center md:items-end justify-center px-6 py-3 border-ui-border-subtle bg-ui-surface shadow-sm">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                  Total Balance
                </p>
                <p
                  className={cn(
                    'text-2xl font-bold tracking-tight',
                    balance >= 0 ? 'text-ui-success' : 'text-ui-error',
                  )}
                >
                  {currencyFormatter.format(balance)}
                </p>
              </Card>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 gap-1.5 text-subtle-foreground hover:text-foreground"
                  onClick={() => setIsReconcileModalOpen(true)}
                >
                  <RefreshCw className="h-3 w-3" />
                  Reconcile
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 gap-1.5 text-subtle-foreground hover:text-foreground"
                  onClick={() => setIsExportModalOpen(true)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
                <Link to="/transactions/history">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 gap-1.5 text-subtle-foreground hover:text-foreground"
                  >
                    <History className="h-3.5 w-3.5" />
                    View History
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Reconciliation Modal */}
        <ReconciliationModal
          isOpen={isReconcileModalOpen}
          onClose={() => setIsReconcileModalOpen(false)}
          currentBalance={balance}
        />

        {/* Export Modal (Instructions 1-8) */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          transactions={visibleTransactions}
          initialFilter={filterState}
          initialSearch={searchQuery}
          initialSort={sortState}
        />

        {/* Search, Filter, and Sort Controls */}
        {!isLoading && transactions.length > 0 && (
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TransactionSearch value={searchQuery} onChange={setSearchQuery} />
              <div className="flex items-center gap-3">
                <TransactionFilter
                  filter={filterState}
                  onChange={setFilterState}
                  onClear={handleClearFilter}
                />
                <TransactionSort sort={sortState} onChange={setSortState} />
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
                    {type}
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
              </div>
            )}
          </div>
        )}
      </header>

      <div className="mx-auto max-w-3xl w-full">
        {isLoading ? (
          <Card className="p-12 flex justify-center border border-ui-border-subtle shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </Card>
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
