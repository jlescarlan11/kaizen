import { useState, useMemo, type ReactElement } from 'react'
import { TransactionList } from './components/TransactionList'
import { SelectionActionBar } from './components/SelectionActionBar'
import { ConfirmBulkDeleteDialog } from './components/ConfirmBulkDeleteDialog'
import { pageLayout } from '../../shared/styles/layout'
import { TransactionSearch } from './components/TransactionSearch'
import { TransactionFilter } from './components/TransactionFilter'
import { TransactionEmptyState } from './components/TransactionEmptyState'
import { ExportModal } from './components/ExportModal'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { useTransactionPipeline } from './hooks/useTransactionPipeline'
import { useSortPersistence } from './hooks/useSortPersistence'
import { Button } from '../../shared/components/Button'
import { cn } from '../../shared/lib/cn'
import { useAppSelector, useAppDispatch } from '../../app/store/hooks'
import { useBulkDeleteTransactionsMutation } from '../../app/store/api/transactionApi'
import {
  selectIsSelectionMode,
  setSelectionMode,
  clearSelection,
  selectSelectedIds,
} from './transactionSlice'
import { showAlert } from '../../app/store/notificationSlice'

import { calculateMoneyFlow } from './utils/transactionUtils'
import { MoneyFlowDisplay } from './components/MoneyFlowDisplay'

export function TransactionListPage(): ReactElement {
  const dispatch = useAppDispatch()
  const isSelectionMode = useAppSelector(selectIsSelectionMode)
  const selectedIds = useAppSelector(selectSelectedIds)
  const [sortState] = useSortPersistence()

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  const [bulkDelete, { isLoading: isDeleting }] = useBulkDeleteTransactionsMutation()

  // 1. The Shared Result Pipeline
  // ...
  const {
    transactions: processedTransactions,
    isLoading,
    isFetching,
    hasMore,
    loadMore,
    searchQuery,
    setSearchQuery,
    filterState,
    setFilterState,
    clearFilters,
    clearSearch,
  } = useTransactionPipeline(sortState)

  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Calculate money flow metrics from processed transactions
  const moneyFlow = useMemo(
    () => calculateMoneyFlow(processedTransactions),
    [processedTransactions],
  )

  const isSearchActive = searchQuery.trim().length > 0
  const isFilterActive =
    filterState.categories.length > 0 ||
    filterState.types.length > 0 ||
    filterState.paymentMethods.length > 0 ||
    !!filterState.startDate ||
    !!filterState.endDate

  const handleClearAll = () => {
    clearSearch()
    clearFilters()
  }

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      dispatch(setSelectionMode(false))
      dispatch(clearSelection())
    } else {
      dispatch(setSelectionMode(true))
    }
  }

  // Undo infrastructure exists for transactions but is not yet wired here — see UNDO_POLICY.md.
  const handleBulkDeleteConfirm = async () => {
    try {
      await bulkDelete(selectedIds).unwrap()

      dispatch(
        showAlert({
          type: 'success',
          title: 'Transactions Deleted',
          message: `Successfully deleted ${selectedIds.length} transaction${selectedIds.length === 1 ? '' : 's'}.`,
        }),
      )

      setIsConfirmDialogOpen(false)
      dispatch(setSelectionMode(false))
      dispatch(clearSelection())
    } catch (error) {
      console.error('Failed to bulk delete transactions:', error)
      dispatch(
        showAlert({
          type: 'error',
          title: 'Deletion Failed',
          message: 'Failed to delete transactions. Please try again.',
        }),
      )
    }
  }

  return (
    <div className={pageLayout.sectionGap}>
      <header className="space-y-7">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              All Transactions
            </h1>
            <p className="text-muted-foreground">A complete record of your income and expenses.</p>
          </div>
        </div>

        {/* Selection Action Bar */}
        <SelectionActionBar onDeleteRequest={() => setIsConfirmDialogOpen(true)} />

        {/* Confirmation Dialog */}
        <ConfirmBulkDeleteDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={handleBulkDeleteConfirm}
          count={selectedIds.length}
          isLoading={isDeleting}
        />

        {/* Money Flow Metrics Visualization */}
        {!isLoading && processedTransactions.length > 0 && (
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
        {!isLoading && (processedTransactions.length > 0 || isSearchActive || isFilterActive) && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[280px]">
                <TransactionSearch value={searchQuery} onChange={setSearchQuery} />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className={cn(
                    'h-10 px-4 border transition-all duration-200',
                    isSelectionMode
                      ? 'bg-primary border-primary text-white hover:bg-primary-hover shadow-md'
                      : 'border-ui-border-subtle text-subtle-foreground hover:text-foreground hover:bg-ui-accent-subtle/30',
                  )}
                  onClick={toggleSelectionMode}
                >
                  {isSelectionMode ? (
                    <>
                      <SharedIcon type="ui" name="close" size={16} className="mr-2" />
                      Exit Select
                    </>
                  ) : (
                    <>
                      <SharedIcon type="ui" name="check-square" size={16} className="mr-2" />
                      Select
                    </>
                  )}
                </Button>
                <TransactionFilter
                  filter={filterState}
                  onChange={setFilterState}
                  onClear={clearFilters}
                />
                <Button
                  variant="ghost"
                  className="h-10 px-4 border border-ui-border-subtle text-subtle-foreground hover:text-foreground hover:bg-ui-accent-subtle/30"
                  onClick={() => setIsExportModalOpen(true)}
                >
                  <SharedIcon type="ui" name="download" size={16} className="mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Active Filter Indicators (Optional, but good for UX) */}
            {isFilterActive && (
              <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1">
                  Active Filters:
                </p>
                {filterState.types.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase"
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
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
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
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
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
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
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
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
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
        {isLoading || isFetching ? (
          <div className="p-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : processedTransactions.length === 0 ? (
          <TransactionEmptyState
            isSearchActive={isSearchActive}
            isFilterActive={isFilterActive}
            onClearSearch={clearSearch}
            onClearFilter={clearFilters}
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
