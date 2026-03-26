import type { ReactElement } from 'react'
import { useState, useRef } from 'react'
import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import { Card } from '../../../shared/components/Card'
import { Badge } from '../../../shared/components/Badge'
import { Checkbox } from '../../../shared/components/Checkbox'
import { Button } from '../../../shared/components/Button'
import { groupTransactionsByDate, formatGroupDate } from '../utils/transactionUtils'
import { TransactionDetailModal } from './TransactionDetailModal'
import { cn } from '../../../shared/lib/cn'
import { useAppSelector, useAppDispatch } from '../../../app/store/hooks'
import { selectPendingDeletes, triggerDeleteWithUndo } from '../../../app/store/notificationSlice'

interface TransactionListProps {
  transactions: TransactionResponse[]
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})

const timeFormatter = new Intl.DateTimeFormat('en-PH', {
  timeStyle: 'short',
})

export function TransactionList({ transactions }: TransactionListProps): ReactElement {
  const dispatch = useAppDispatch()
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

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

  const groupedTransactions = groupTransactionsByDate(visibleTransactions)

  return (
    <div className="space-y-8 pb-24">
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

      {groupedTransactions.map((group) => (
        <div key={group.date} className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {formatGroupDate(group.date)}
            </h2>
            {isSelectionMode && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs font-semibold text-primary hover:bg-transparent"
                onClick={() => {
                  const groupIds = group.transactions.map((t) => t.id)
                  const allSelected = groupIds.every((id) => selectedIds.includes(id))
                  if (allSelected) {
                    setSelectedIds((prev) => prev.filter((id) => !groupIds.includes(id)))
                  } else {
                    setSelectedIds((prev) => Array.from(new Set([...prev, ...groupIds])))
                  }
                }}
              >
                {group.transactions.every((id) => selectedIds.includes(id.id))
                  ? 'Deselect group'
                  : 'Select group'}
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {group.transactions.map((tx) => (
              <div key={tx.id} className="relative flex items-center gap-3">
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
                    'flex-1 flex items-center justify-between border border-ui-border-subtle p-4 shadow-sm hover:border-primary/50 transition-all cursor-pointer group active:scale-[0.98]',
                    selectedIds.includes(tx.id) &&
                      'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-md',
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
                            : 'bg-ui-surface-muted text-muted-foreground',
                        )}
                      >
                        {tx.type === 'INCOME' ? <IncomeIcon /> : <ExpenseIcon />}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tx.description || tx.category?.name || 'Transaction'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {timeFormatter.format(new Date(tx.transactionDate))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={
                        tx.type === 'INCOME'
                          ? 'font-bold text-ui-success'
                          : 'font-bold text-foreground'
                      }
                    >
                      {tx.type === 'INCOME' ? '+' : '-'} {currencyFormatter.format(tx.amount)}
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
            ))}
          </div>
        </div>
      ))}

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

function ExpenseIcon() {
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
      <path d="M7 14l5 5 5-5" />
      <path d="M12 19V5" />
    </svg>
  )
}
