import { useState, useMemo, type ReactElement } from 'react'
import { typography } from '../../shared/styles/typography'
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
import { Badge } from '../../shared/components/Badge'
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
import { TransactionSummaryStrip } from './components/TransactionSummaryStrip'
import { useGetCategoriesQuery } from '../../app/store/api/categoryApi'
import { useGetPaymentMethodsQuery } from '../../app/store/api/paymentMethodApi'

function formatDateChipLabel(start: string | undefined, end: string | undefined): string {
  if (!start && !end) return ''
  const fmt = (iso: string) => {
    const [year, month, day] = iso.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return `From ${fmt(start)}`
  return `Until ${fmt(end as string)}`
}

export function TransactionListPage(): ReactElement {
  const dispatch = useAppDispatch()
  const isSelectionMode = useAppSelector(selectIsSelectionMode)
  const selectedIds = useAppSelector(selectSelectedIds)
  const [sortState] = useSortPersistence()

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const [bulkDelete, { isLoading: isDeleting }] = useBulkDeleteTransactionsMutation()

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

  const { data: categories = [] } = useGetCategoriesQuery()
  const { data: paymentMethods = [] } = useGetPaymentMethodsQuery()

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
      <div className="w-full space-y-6">
        <h1 className={typography.h1}>Transactions</h1>
        <SelectionActionBar onDeleteRequest={() => setIsConfirmDialogOpen(true)} />

        <ConfirmBulkDeleteDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={handleBulkDeleteConfirm}
          count={selectedIds.length}
          isLoading={isDeleting}
        />

        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          transactions={processedTransactions}
          initialFilter={filterState}
          initialSearch={searchQuery}
          initialSort={sortState}
        />

        {isLoading ? (
          <div className="flex gap-3 px-1">
            <div className="h-14 flex-1 rounded-xl bg-surface-secondary animate-pulse" />
            <div className="h-14 flex-1 rounded-xl bg-surface-secondary animate-pulse" />
            <div className="h-14 flex-1 rounded-xl bg-surface-secondary animate-pulse" />
          </div>
        ) : processedTransactions.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-600">
            <TransactionSummaryStrip incoming={moneyFlow.incoming} outgoing={moneyFlow.outgoing} />
          </div>
        ) : null}

        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[280px]">
              <TransactionSearch value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isSelectionMode ? 'primary' : 'secondary'}
                className="h-11 px-5 transition-all duration-200"
                onClick={toggleSelectionMode}
                disabled={isLoading}
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
                disabled={isLoading || isFetching}
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

          {(isFilterActive || isSearchActive) && (
            <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-3xs font-bold text-text-secondary uppercase tracking-widest mr-2 opacity-60">
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
                    aria-label={`Remove ${type === 'INCOME' ? 'Income' : 'Expense'} filter`}
                    onClick={() =>
                      setFilterState((prev) => ({
                        ...prev,
                        types: prev.types.filter((t) => t !== type),
                      }))
                    }
                    type="button"
                    className="hover:scale-110 transition-transform opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                  >
                    <SharedIcon type="ui" name="close" size={10} strokeWidth={3} />
                  </button>
                </Badge>
              ))}
              {filterState.categories.map((categoryId) => {
                const category = categories.find((c) => c.id === categoryId)
                if (!category) return null
                return (
                  <Badge
                    key={categoryId}
                    variant="success"
                    emphasis="soft"
                    className="gap-1.5 pl-2.5 pr-1.5"
                  >
                    {category.name}
                    <button
                      aria-label={`Remove ${category.name} filter`}
                      onClick={() =>
                        setFilterState((prev) => ({
                          ...prev,
                          categories: prev.categories.filter((id) => id !== categoryId),
                        }))
                      }
                      type="button"
                      className="hover:scale-110 transition-transform opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                    >
                      <SharedIcon type="ui" name="close" size={10} strokeWidth={3} />
                    </button>
                  </Badge>
                )
              })}
              {filterState.paymentMethods.map((methodId) => {
                const method = paymentMethods.find((m) => m.id === methodId)
                if (!method) return null
                return (
                  <Badge
                    key={methodId}
                    variant="success"
                    emphasis="soft"
                    className="gap-1.5 pl-2.5 pr-1.5"
                  >
                    {method.name}
                    <button
                      aria-label={`Remove ${method.name} filter`}
                      onClick={() =>
                        setFilterState((prev) => ({
                          ...prev,
                          paymentMethods: prev.paymentMethods.filter((id) => id !== methodId),
                        }))
                      }
                      type="button"
                      className="hover:scale-110 transition-transform opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                    >
                      <SharedIcon type="ui" name="close" size={10} strokeWidth={3} />
                    </button>
                  </Badge>
                )
              })}
              {(filterState.startDate || filterState.endDate) && (
                <Badge variant="success" emphasis="soft" className="gap-1.5 pl-2.5 pr-1.5">
                  {formatDateChipLabel(filterState.startDate, filterState.endDate)}
                  <button
                    aria-label="Remove date range filter"
                    onClick={() =>
                      setFilterState((prev) => ({
                        ...prev,
                        startDate: undefined,
                        endDate: undefined,
                      }))
                    }
                    type="button"
                    className="hover:scale-110 transition-transform opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
                  >
                    <SharedIcon type="ui" name="close" size={10} strokeWidth={3} />
                  </button>
                </Badge>
              )}
              <button
                onClick={handleClearAll}
                className="text-3xs font-bold text-text-secondary hover:text-text-primary uppercase tracking-widest hover:underline ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        <div className="w-full bg-surface border border-border-subtle rounded-card overflow-hidden shadow-sm">
          {processedTransactions.length === 0 && !isLoading ? (
            <div className="p-6">
              <TransactionEmptyState
                isSearchActive={isSearchActive}
                isFilterActive={isFilterActive}
                onClearSearch={clearSearch}
                onClearFilter={clearFilters}
                onClearAll={handleClearAll}
              />
            </div>
          ) : (
            <TransactionList
              transactions={processedTransactions}
              searchQuery={searchQuery}
              hasMore={hasMore}
              onLoadMore={loadMore}
              isLoading={isLoading}
              isFetching={isFetching}
            />
          )}
        </div>
      </div>
    </div>
  )
}
