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
    <div className={cn(pageLayout.sectionGap, 'animate-entrance-slide-up pb-24')}>
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tighter text-text-primary uppercase">
              Activity
            </h1>
            <p className="text-base font-medium text-text-secondary tracking-tight opacity-60">
              A complete record of your spending.
            </p>
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

        {/* Export Modal */}
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
                  variant="secondary"
                  className={cn(
                    'h-11 px-5 transition-all duration-200',
                    isSelectionMode &&
                      'bg-primary border-primary text-text-primary shadow-md shadow-primary/10',
                  )}
                  onClick={toggleSelectionMode}
                >
                  {isSelectionMode ? (
                    <>
                      <SharedIcon
                        type="ui"
                        name="close"
                        size={16}
                        strokeWidth={2.5}
                        className="mr-2"
                      />
                      Exit
                    </>
                  ) : (
                    <>
                      <SharedIcon
                        type="ui"
                        name="check-square"
                        size={16}
                        strokeWidth={2.5}
                        className="mr-2"
                      />
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
                  variant="secondary"
                  className="h-11 px-5"
                  onClick={() => setIsExportModalOpen(true)}
                >
                  <SharedIcon
                    type="ui"
                    name="download"
                    size={16}
                    strokeWidth={2.5}
                    className="mr-2"
                  />
                  Export
                </Button>
              </div>
            </div>

            {/* Active Filter Indicators */}
            {isFilterActive && (
              <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mr-2 opacity-60">
                  Active Filters:
                </p>
                {filterState.types.map((type) => (
                  <Badge
                    key={type}
                    variant="success"
                    emphasis="soft"
                    className="gap-1.5 pl-2.5 pr-1.5"
                  >
                    {type === 'INCOME' ? 'Income' : 'Expense'}
                    <button
                      onClick={() =>
                        setFilterState((prev) => ({
                          ...prev,
                          types: prev.types.filter((t) => t !== type),
                        }))
                      }
                      className="hover:scale-110 transition-transform opacity-60"
                    >
                      <CloseIcon />
                    </button>
                  </Badge>
                ))}
                {filterState.startDate && (
                  <Badge variant="info" emphasis="soft" className="gap-1.5 pl-2.5 pr-1.5">
                    From: {filterState.startDate}
                    <button
                      onClick={() => setFilterState((prev) => ({ ...prev, startDate: undefined }))}
                      className="hover:scale-110 transition-transform opacity-60"
                    >
                      <CloseIcon />
                    </button>
                  </Badge>
                )}
                {filterState.endDate && (
                  <Badge variant="info" emphasis="soft" className="gap-1.5 pl-2.5 pr-1.5">
                    To: {filterState.endDate}
                    <button
                      onClick={() => setFilterState((prev) => ({ ...prev, endDate: undefined }))}
                      className="hover:scale-110 transition-transform opacity-60"
                    >
                      <CloseIcon />
                    </button>
                  </Badge>
                )}
                {filterState.categories.length > 0 && (
                  <Badge variant="neutral" emphasis="soft" className="gap-1.5 pl-2.5 pr-1.5">
                    {filterState.categories.length} Categories
                    <button
                      onClick={() => setFilterState((prev) => ({ ...prev, categories: [] }))}
                      className="hover:scale-110 transition-transform opacity-60"
                    >
                      <CloseIcon />
                    </button>
                  </Badge>
                )}
                {filterState.paymentMethods.length > 0 && (
                  <Badge variant="neutral" emphasis="soft" className="gap-1.5 pl-2.5 pr-1.5">
                    {filterState.paymentMethods.length} Accounts
                    <button
                      onClick={() => setFilterState((prev) => ({ ...prev, paymentMethods: [] }))}
                      className="hover:scale-110 transition-transform opacity-60"
                    >
                      <CloseIcon />
                    </button>
                  </Badge>
                )}
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-bold text-error uppercase tracking-widest hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="w-full mt-6">
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
