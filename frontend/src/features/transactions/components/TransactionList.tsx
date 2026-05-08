import type { ReactElement } from 'react'
import { useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import { Badge } from '../../../shared/components/Badge'
import { Checkbox } from '../../../shared/components/Checkbox'
import { Button } from '../../../shared/components/Button'
import { groupTransactionsByDate, formatGroupDate } from '../utils/transactionUtils'
import { SearchHighlight } from './SearchHighlight'
import { cn } from '../../../shared/lib/cn'
import { useAppSelector, useAppDispatch } from '../../../app/store/hooks'
import { selectPendingDeletes } from '../../../app/store/notificationSlice'
import {
  selectIsSelectionMode,
  selectSelectedIds,
  setSelectionMode,
  toggleSelection,
  setSelectedIds,
} from '../transactionSlice'
import { flattenTransactions, type FlattenedTransactionItem } from '../utils/virtualizationUtils'
import { DataList } from '../../../shared/components/DataList'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { formatTransactionDate } from '../utils/transactionUtils'

interface TransactionListProps {
  transactions: TransactionResponse[]
  searchQuery?: string
  hasMore?: boolean
  onLoadMore?: () => void
  isLoading?: boolean
}

export function TransactionList({
  transactions,
  searchQuery = '',
  hasMore = false,
  onLoadMore,
  isLoading = false,
}: TransactionListProps): ReactElement {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // Selection Mode State from Redux
  const isSelectionMode = useAppSelector(selectIsSelectionMode)
  const selectedIds = useAppSelector(selectSelectedIds)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pendingDeletes = useAppSelector(selectPendingDeletes)

  // Filter out pending deletes
  const visibleTransactions = transactions.filter((tx) => !pendingDeletes.includes(tx.id))

  const handleRowClick = (tx: TransactionResponse) => {
    if (isSelectionMode) {
      dispatch(toggleSelection(tx.id))
    } else {
      navigate(`/transactions/${tx.id}`)
    }
  }

  const handleLongPressStart = (id: number) => {
    if (isSelectionMode) return
    longPressTimer.current = setTimeout(() => {
      dispatch(setSelectionMode(true))
      dispatch(setSelectedIds([id]))
    }, 600) // 600ms long press
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const flattenedItems = useMemo(() => {
    // Always group transactions by date to maintain a clear visual hierarchy.
    return flattenTransactions(visibleTransactions, groupTransactionsByDate)
  }, [visibleTransactions])

  const allVisibleSelected = useMemo(() => {
    if (visibleTransactions.length === 0) return false
    return visibleTransactions.every((tx) => selectedIds.includes(tx.id))
  }, [visibleTransactions, selectedIds])

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      dispatch(setSelectedIds([]))
    } else {
      dispatch(setSelectedIds(visibleTransactions.map((tx) => tx.id)))
    }
  }

  const renderItem = (item: FlattenedTransactionItem, index: number) => {
    if (item.type === 'header') {
      return (
        <div className="pt-10 pb-4 bg-background sticky top-0 z-10 flex items-center justify-between pr-6">
          <h2 className="px-6 text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
            {formatGroupDate(item.date)}
          </h2>
          {isSelectionMode && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[10px] font-black text-primary hover:bg-transparent uppercase tracking-widest"
              onClick={() => {
                const groupItems: number[] = []
                for (let i = index + 1; i < flattenedItems.length; i++) {
                  const subItem = flattenedItems[i]
                  if (subItem.type === 'header') break
                  groupItems.push(subItem.transaction.id)
                }
                const allSelected = groupItems.every((id) => selectedIds.includes(id))
                if (allSelected) {
                  dispatch(setSelectedIds(selectedIds.filter((id) => !groupItems.includes(id))))
                } else {
                  dispatch(setSelectedIds(Array.from(new Set([...selectedIds, ...groupItems]))))
                }
              }}
            >
              Select group
            </Button>
          )}
        </div>
      )
    }

    const { transaction: tx } = item

    return (
      <div className={cn('relative flex items-center gap-4 transition-all px-2')}>
        {isSelectionMode && (
          <div className="shrink-0 animate-in fade-in slide-in-from-left-2 duration-200 ml-4">
            <Checkbox
              checked={selectedIds.includes(tx.id)}
              onCheckedChange={() => dispatch(toggleSelection(tx.id))}
            />
          </div>
        )}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleRowClick(tx)}
          onKeyDown={(e) => e.key === 'Enter' && handleRowClick(tx)}
          onMouseDown={() => handleLongPressStart(tx.id)}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={() => handleLongPressStart(tx.id)}
          onTouchEnd={handleLongPressEnd}
          className={cn(
            'flex-1 flex items-center justify-between px-6 py-3.5 transition-all cursor-pointer group active:scale-[0.98] border-b border-border-subtle/10',
            selectedIds.includes(tx.id)
              ? 'bg-primary/5 border-primary shadow-sm'
              : 'hover:bg-primary/5 active:bg-primary/10',
            !tx.category && !selectedIds.includes(tx.id) && 'bg-warning/5',
          )}
        >
          <div className="flex items-center gap-6">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl transition-all group-hover:scale-105 shadow-sm"
              style={{
                backgroundColor: (tx.category?.color || '#000') + '15',
                color: tx.category?.color || 'var(--color-text-secondary)',
              }}
            >
              {tx.category ? (
                <SharedIcon type="category" name={tx.category.icon} size={24} strokeWidth={2.5} />
              ) : (
                <div
                  className={cn(
                    'flex h-full w-full items-center justify-center rounded-xl',
                    tx.type === 'INCOME'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning',
                  )}
                >
                  {tx.type === 'INCOME' ? (
                    <SharedIcon type="ui" name="income" size={24} strokeWidth={2.5} />
                  ) : (
                    <span className="text-xl font-bold italic">?</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <SearchHighlight
                  text={tx.description || tx.category?.name || 'Uncategorized'}
                  query={searchQuery}
                  className={cn(
                    'text-base font-bold tracking-tight transition-colors block leading-tight',
                    tx.category ? 'text-text-primary' : 'text-warning',
                  )}
                />
                {tx.notes && (
                  <div title="Contains notes" className="text-text-secondary/30 shrink-0">
                    <SharedIcon type="ui" name="note" size={16} strokeWidth={2.5} />
                  </div>
                )}
                {tx.isRecurring && (
                  <div title="Recurring transaction" className="text-primary/60 shrink-0">
                    <SharedIcon type="ui" name="recurring" size={16} strokeWidth={2.5} />
                  </div>
                )}
                {tx.id === -1 && (
                  <Badge variant="warning" className="animate-pulse">
                    Syncing
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-60">
                  {formatTransactionDate(tx.transactionDate)}
                </span>
                {tx.paymentMethod && (
                  <>
                    <span className="text-border-subtle">•</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-40">
                      {tx.paymentMethod.name}
                    </span>
                  </>
                )}
                {!tx.category && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-warning ml-1">
                    • Missing category
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p
              className={cn(
                'text-lg font-bold tracking-tighter',
                tx.type === 'EXPENSE' ? 'text-text-primary' : 'text-success',
              )}
            >
              {tx.type === 'EXPENSE' ? '-' : '+'}
              <SearchHighlight
                text={Math.abs(tx.amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                query={searchQuery}
              />
              <span className="ml-1.5 text-xs font-bold text-text-secondary opacity-30 italic">
                PHP
              </span>
            </p>
            <Badge variant={tx.type === 'INCOME' ? 'success' : 'neutral'} className="mt-2">
              {tx.type === 'INCOME' ? 'Income' : 'Expense'}
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent shadow-xl shadow-primary/10"></div>
        <p className="text-sm font-black uppercase tracking-widest text-text-secondary animate-pulse">
          Loading Activity...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full pb-32">
      {/* Selection Mode List Header */}
      {isSelectionMode && visibleTransactions.length > 0 && (
        <div className="flex items-center justify-between px-8 py-4 bg-primary text-white rounded-2xl mb-6 shadow-md shadow-primary/15 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={allVisibleSelected}
              onCheckedChange={toggleSelectAll}
              className="border-text-primary bg-transparent checked:bg-text-primary checked:border-text-primary"
            />
            <span className="text-xs font-black uppercase tracking-widest">
              Selected {selectedIds.length} of {visibleTransactions.length}
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
            Selection Mode
          </span>
        </div>
      )}

      <DataList
        data={flattenedItems}
        renderItem={renderItem}
        hideBorders={true}
        className="gap-1"
        emptyState={
          !isLoading && (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white border-2 border-dashed border-border-subtle rounded-[3rem]">
              <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mb-6">
                <SharedIcon
                  type="ui"
                  name="search"
                  size={32}
                  className="text-text-secondary opacity-20"
                  strokeWidth={3}
                />
              </div>
              <p className="text-lg font-black text-text-primary uppercase tracking-tight">
                No results found
              </p>
              <p className="text-sm font-medium text-text-secondary mt-1">
                Try adjusting your filters or search query.
              </p>
            </div>
          )
        }
      />

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            onClick={onLoadMore}
            isLoading={isLoading}
            className="text-muted-foreground hover:text-primary"
          >
            Load more transactions
          </Button>
        </div>
      )}
    </div>
  )
}
