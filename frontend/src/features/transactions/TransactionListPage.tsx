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

        {!isLoading && processedTransactions.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-600">
            <TransactionSummaryStrip incoming={moneyFlow.incoming} outgoing={moneyFlow.outgoing} />
          </div>
        )}

        {!isLoading && (processedTransactions.length > 0 || isSearchActive || isFilterActive) && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[280px]">
                <TransactionSearch value={searchQuery} onChange={setSearchQuery} />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className={cn(
                    'h-11 px-5 transition-all duration-200',
                    isSelectionMode &&
                      'bg-primary border-primary text-white shadow-sm shadow-primary/10',
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

            {isFilterActive && (
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
                      onClick={() =>
                        setFilterState((prev) => ({
                          ...prev,
                          types: prev.types.filter((t) => t !== type),
                        }))
                      }
                      className="hover:scale-110 transition-transform opacity-60"
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
                        className="hover:scale-110 transition-transform opacity-60"
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
                        className="hover:scale-110 transition-transform opacity-60"
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
                      className="hover:scale-110 transition-transform opacity-60"
                    >
                      <SharedIcon type="ui" name="close" size={10} strokeWidth={3} />
                    </button>
                  </Badge>
                )}
                <button
                  onClick={handleClearAll}
                  className="text-3xs font-bold text-error uppercase tracking-widest hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}

        <div className="w-full bg-surface border border-border-subtle rounded-card overflow-hidden shadow-sm">
          {isLoading && processedTransactions.length === 0 ? (
            <div className="p-32 flex flex-col items-center justify-center space-y-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm font-black uppercase tracking-widest text-text-secondary animate-pulse">
                Loading Activity...
              </p>
            </div>
          ) : processedTransactions.length === 0 ? (
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
              isLoading={isFetching}
            />
          )}
        </div>
      </div>
    </div>
  )
}
