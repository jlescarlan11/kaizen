import type { ReactElement } from 'react'
import { useState, useRef, useMemo } from 'react'
import { List, type ListImperativeAPI, type RowComponentProps } from 'react-window'
import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import { Card } from '../../../shared/components/Card'
import { Badge } from '../../../shared/components/Badge'
import { Checkbox } from '../../../shared/components/Checkbox'
import { Button } from '../../../shared/components/Button'
import { groupTransactionsByDate, formatGroupDate } from '../utils/transactionUtils'
import { TransactionDetailModal } from './TransactionDetailModal'
import { SearchHighlight } from './SearchHighlight'
import { cn } from '../../../shared/lib/cn'
import { useAppSelector, useAppDispatch } from '../../../app/store/hooks'
import { selectPendingDeletes, triggerDeleteWithUndo } from '../../../app/store/notificationSlice'
import { TRANSACTION_OVERSCAN_BUFFER } from '../constants'
import { flattenTransactions, ITEM_HEIGHTS } from '../utils/virtualizationUtils'

interface TransactionListProps {
  transactions: TransactionResponse[]
  searchQuery?: string
  hasMore?: boolean
  onLoadMore?: () => void
  isLoading?: boolean
}

import { formatCurrency } from '../../../shared/lib/formatCurrency'

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
  const dispatch = useAppDispatch()
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      setSelectedTx(tx)
      setIsModalOpen(true)
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

  const getItemSize = (index: number) => {
    const item = flattenedItems[index]
    return item.type === 'header' ? ITEM_HEIGHTS.header : ITEM_HEIGHTS.transaction
  }

  const listRef = useRef<ListImperativeAPI>(null)

  const Row = ({ index, style, ariaAttributes }: RowComponentProps) => {
    const item = flattenedItems[index]

    if (item.type === 'header') {
      return (
        <div {...ariaAttributes} style={style} className="px-1 flex items-center justify-between">
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
    return (
      <div
        {...ariaAttributes}
        style={{ ...style, height: style.height ? (style.height as number) - 12 : style.height }}
        className="relative flex items-center gap-3"
      >
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
          tone="flat"
          className={cn(
            'flex-1 flex items-center justify-between p-4 hover:border-primary/50 transition-all cursor-pointer group active:scale-[0.98]',
            selectedIds.includes(tx.id) &&
              'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-md',
            !tx.category &&
              !selectedIds.includes(tx.id) &&
              'border-amber-200 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/10',
          )}
        >
          <div className="flex items-center gap-4">
            {tx.category ? (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: tx.category.color + '22',
                  color: tx.category.color,
                }}
              >
                {tx.category.icon}
              </div>
            ) : (
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110',
                  tx.type === 'INCOME'
                    ? 'bg-ui-success/10 text-ui-success'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-500',
                )}
              >
                {tx.type === 'INCOME' ? (
                  <IncomeIcon />
                ) : (
                  <span className="text-lg font-bold">?</span>
                )}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <SearchHighlight
                  text={tx.description || tx.category?.name || 'Uncategorized'}
                  query={searchQuery}
                  className={cn(
                    'font-semibold transition-colors block',
                    tx.category
                      ? 'text-foreground group-hover:text-primary'
                      : 'text-amber-700 dark:text-amber-500',
                  )}
                />
                {tx.notes && (
                  <div title="Contains notes" className="text-muted-foreground/60 shrink-0">
                    <NoteIcon />
                  </div>
                )}
                {tx.isRecurring && (
                  <div title="Recurring transaction" className="text-primary/70 shrink-0">
                    <RecurringIcon />
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
                {!tx.category && (
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
                tx.type === 'INCOME' ? 'text-ui-success' : 'text-foreground',
              )}
            >
              {tx.type === 'INCOME' ? '+' : '-'}
              <SearchHighlight
                text={currencyFormatter.format(tx.amount).replace('PHP', '').trim()}
                query={searchQuery}
              />
              <span className="ml-1 text-[10px] text-muted-foreground font-normal">PHP</span>
            </p>
            <Badge
              tone={tx.type === 'INCOME' ? 'success' : 'neutral'}
              className="text-[10px] uppercase font-bold px-2 py-0.5 mt-1"
            >
              {tx.type}
            </Badge>
          </div>
        </Card>
      </div>
    )
  }

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || isFetchingMore || !hasMore) return

    const scrollOffset = event.currentTarget.scrollTop

    // Simple check if we're near the bottom
    const totalHeight = flattenedItems.reduce((acc, _, i) => acc + getItemSize(i), 0)
    if (scrollOffset + 800 > totalHeight) {
      onLoadMore()
    }
  }

  // Add dummy state for isFetchingMore if not provided
  const isFetchingMore = false

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse">Loading transactions...</p>
      </div>
    )
  }

  return (
    <div className="h-[600px] w-full pb-24">
      {/* Selection Mode Toolbar */}
      {isSelectionMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg">
          <Card className="bg-ui-surface-strong border-ui-border shadow-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-white/10"
                onClick={exitSelectionMode}
              >
                <CloseIcon />
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

      <List
        listRef={listRef}
        rowCount={flattenedItems.length}
        rowHeight={getItemSize}
        style={{ height: 600, width: '100%' }}
        overscanCount={TRANSACTION_OVERSCAN_BUFFER}
        onScroll={handleScroll}
        rowComponent={Row}
        rowProps={{} as Record<string, never>}
      />

      {!isSelectionMode && (
        <TransactionDetailModal
          transaction={selectedTx}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function IncomeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 10l5-5 5 5" />
      <path d="M12 5v14" />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
      <path d="M15 3v6h6" />
      <path d="M9 13h6" />
      <path d="M9 17h3" />
    </svg>
  )
}

function RecurringIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}
