import type { ReactElement } from 'react'
import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import { Card } from '../../../shared/components/Card'
import { Badge } from '../../../shared/components/Badge'
import { Checkbox } from '../../../shared/components/Checkbox'
import { Button } from '../../../shared/components/Button'
import { groupTransactionsByDate, formatGroupDate } from '../utils/transactionUtils'
import { SearchHighlight } from './SearchHighlight'
import { cn } from '../../../shared/lib/cn'
import { useAppSelector, useAppDispatch } from '../../../app/store/hooks'
import { selectPendingDeletes, triggerDeleteWithUndo } from '../../../app/store/notificationSlice'
import { flattenTransactions, type FlattenedTransactionItem } from '../utils/virtualizationUtils'
import { DataList } from '../../../shared/components/DataList'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { formatCurrency } from '../../../shared/lib/formatCurrency'

interface TransactionListProps {
  transactions: TransactionResponse[]
  searchQuery?: string
  hasMore?: boolean
  onLoadMore?: () => void
  isLoading?: boolean
}

const currencyFormatter = {
  format: (amount: number) => formatCurrency(amount),
}

const timeFormatter = new Intl.DateTimeFormat('en-PH', {
  timeStyle: 'short',
})

export function TransactionList({
  transactions,
  searchQuery = '',
  hasMore = false,
  onLoadMore,
  isLoading = false,
}: TransactionListProps): ReactElement {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pendingDeletes = useAppSelector(selectPendingDeletes)

  // Filter out pending deletes
  const visibleTransactions = transactions.filter((tx) => !pendingDeletes.includes(tx.id))

  const handleRowClick = (tx: TransactionResponse) => {
    if (isSelectionMode) {
      toggleSelection(tx.id)
    } else {
      navigate(`/transactions/${tx.id}`)
    }
  }

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleLongPressStart = (id: number) => {
    if (isSelectionMode) return
    longPressTimer.current = setTimeout(() => {
      setIsSelectionMode(true)
      setSelectedIds([id])
    }, 600) // 600ms long press
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const exitSelectionMode = () => {
    setIsSelectionMode(false)
    setSelectedIds([])
  }

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return

    const count = selectedIds.length
    dispatch(
      triggerDeleteWithUndo({
        message: `${count} transaction${count > 1 ? 's' : ''} deleted`,
        transactionIds: selectedIds,
        timeoutMs: 5000,
      }),
    )
    exitSelectionMode()
  }

  const flattenedItems = useMemo(() => {
    return flattenTransactions(visibleTransactions, groupTransactionsByDate)
  }, [visibleTransactions])

  const renderItem = (item: FlattenedTransactionItem, index: number) => {
    if (item.type === 'header') {
      return (
        <div className="px-1 py-3 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {formatGroupDate(item.date)}
          </h2>
          {isSelectionMode && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs font-semibold text-primary hover:bg-transparent"
              onClick={() => {
                // Find all transaction IDs in this date group
                const groupItems: number[] = []
                for (let i = index + 1; i < flattenedItems.length; i++) {
                  const subItem = flattenedItems[i]
                  if (subItem.type === 'header') break
                  groupItems.push(subItem.transaction.id)
                }
                const allSelected = groupItems.every((id) => selectedIds.includes(id))
                if (allSelected) {
                  setSelectedIds((prev) => prev.filter((id) => !groupItems.includes(id)))
                } else {
                  setSelectedIds((prev) => Array.from(new Set([...prev, ...groupItems])))
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
    const isInitialBalance = tx.type === 'INITIAL_BALANCE'

    return (
      <div className="relative flex items-center gap-3 py-1.5">
        {isSelectionMode && (
          <div className="shrink-0 animate-in fade-in slide-in-from-left-2 duration-200">
            <Checkbox
              checked={selectedIds.includes(tx.id)}
              onCheckedChange={() => toggleSelection(tx.id)}
            />
          </div>
        )}
        <Card
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
            'flex-1 flex items-center justify-between px-4 py-3.5 hover:border-primary/50 transition-all cursor-pointer group active:scale-[0.98]',
            selectedIds.includes(tx.id) &&
              'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-md',
            !isInitialBalance &&
              !tx.category &&
              !selectedIds.includes(tx.id) &&
              'border-amber-200 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/10',
          )}
        >
          <div className="flex items-center gap-4">
            {tx.category ? (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: tx.category.color + '22',
                  color: tx.category.color,
                }}
              >
                <SharedIcon type="category" name={tx.category.icon} size={20} />
              </div>
            ) : (
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110',
                  tx.type === 'INCOME' || tx.type === 'INITIAL_BALANCE'
                    ? 'bg-ui-success/10 text-ui-success'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-500',
                )}
              >
                {tx.type === 'INCOME' || tx.type === 'INITIAL_BALANCE' ? (
                  <SharedIcon type="ui" name="income" size={20} />
                ) : (
                  <span className="text-lg font-bold">?</span>
                )}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <SearchHighlight
                  text={
                    isInitialBalance
                      ? 'Initial Balance'
                      : tx.description || tx.category?.name || 'Uncategorized'
                  }
                  query={searchQuery}
                  className={cn(
                    'font-semibold transition-colors block',
                    tx.category || isInitialBalance
                      ? 'text-foreground group-hover:text-primary'
                      : 'text-amber-700 dark:text-amber-500',
                  )}
                />
                {tx.notes && (
                  <div title="Contains notes" className="text-muted-foreground/60 shrink-0">
                    <SharedIcon type="ui" name="note" size={14} />
                  </div>
                )}
                {tx.isRecurring && (
                  <div title="Recurring transaction" className="text-primary/70 shrink-0">
                    <SharedIcon type="ui" name="recurring" size={14} />
                  </div>
                )}
                {/* Instruction 6: Merge local pending transactions */}
                {tx.id === -1 && (
                  <Badge tone="warning" className="text-[8px] animate-pulse">
                    Syncing
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {timeFormatter.format(new Date(tx.transactionDate))}
                {tx.paymentMethod && (
                  <span className="ml-2 font-medium text-foreground/70">
                    • {tx.paymentMethod.name}
                  </span>
                )}
                {!isInitialBalance && !tx.category && (
                  <span className="ml-2 text-amber-600/70 dark:text-amber-500/50 font-medium">
                    • Needs category
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={cn(
                'font-bold',
                tx.type === 'EXPENSE' ? 'text-foreground' : 'text-ui-success',
              )}
            >
              {tx.type === 'EXPENSE' ? '-' : '+'}
              <SearchHighlight
                text={currencyFormatter.format(tx.amount).replace('PHP', '').trim()}
                query={searchQuery}
              />
              <span className="ml-1 text-[10px] text-muted-foreground font-normal">PHP</span>
            </p>
            <Badge
              tone={tx.type === 'INCOME' || tx.type === 'INITIAL_BALANCE' ? 'success' : 'neutral'}
              className="text-[10px] uppercase font-bold px-2 py-0.5 mt-1"
            >
              {isInitialBalance ? 'Initial Balance' : tx.type}
            </Badge>
          </div>
        </Card>
      </div>
    )
  }

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse">Loading transactions...</p>
      </div>
    )
  }

  return (
    <div className="w-full pb-24">
      {/* Selection Mode Toolbar */}
      {isSelectionMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg">
          <Card className="bg-ui-surface-strong border-ui-border shadow-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-white"
                onClick={exitSelectionMode}
              >
                <SharedIcon type="ui" name="close" size={18} />
              </Button>
              <p className="font-semibold text-white">{selectedIds.length} Selected</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => setSelectedIds(visibleTransactions.map((tx) => tx.id))}
              >
                Select All
              </Button>
              <Button
                size="sm"
                className="bg-ui-error hover:bg-ui-error-hover text-white border-0 px-4"
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      <DataList
        data={flattenedItems}
        renderItem={renderItem}
        emptyState={
          !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground">No transactions found</p>
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
