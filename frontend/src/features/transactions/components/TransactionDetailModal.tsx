import { useState, useEffect, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useUpdateTransactionMutation,
  type TransactionResponse,
} from '../../../app/store/api/transactionApi'
import { ResponsiveModal } from '../../../shared/components/ResponsiveModal'
import { Badge } from '../../../shared/components/Badge'
import { Button } from '../../../shared/components/Button'
import { Image as ImageIcon, FileText } from 'lucide-react'
import { cn } from '../../../shared/lib/cn'
import { useAppDispatch } from '../../../app/store/hooks'
import { triggerDeleteWithUndo } from '../../../app/store/notificationSlice'
import { CategorySelector } from '../../categories'
import { PaymentMethodSelector } from '../../payment-methods/PaymentMethodSelector'
import { formatFrequency } from '../utils/transactionUtils'

interface TransactionDetailModalProps {
  transaction: TransactionResponse | null
  open: boolean
  onClose: () => void
}

import { formatCurrency } from '../../../shared/lib/formatCurrency'

const currencyFormatter = {
  format: (amount: number) => formatCurrency(amount),
}

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'full',
  timeStyle: 'short',
})

export function TransactionDetailModal({
  transaction,
  open,
  onClose,
}: TransactionDetailModalProps): ReactElement {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [updateTransaction, { isLoading: isUpdating }] = useUpdateTransactionMutation()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isRecategorizing, setIsRecategorizing] = useState(false)
  const [newCategoryId, setNewCategoryId] = useState<string | null>(null)
  const [isChangingPaymentMethod, setIsChangingPaymentMethod] = useState(false)
  const [newPaymentMethodId, setNewPaymentMethodId] = useState<string | null>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (transaction) {
      setNewCategoryId(transaction.category?.id.toString() || null)
      setNewPaymentMethodId(transaction.paymentMethod?.id.toString() || null)
    }
  }, [transaction])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!transaction) return <></>

  const handleEdit = () => {
    onClose()
    navigate(`/transactions/edit/${transaction.id}`)
  }

  const handleDuplicate = () => {
    onClose()
    // Pass transaction data as state to pre-populate the entry form
    navigate('/transactions/add', {
      state: {
        duplicateFrom: {
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          categoryId: transaction.category?.id,
          paymentMethodId: transaction.paymentMethod?.id,
        },
      },
    })
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false)
    onClose()
    dispatch(
      triggerDeleteWithUndo({
        message: 'Transaction deleted',
        transactionIds: [transaction.id],
        timeoutMs: 5000,
      }),
    )
  }

  const handleRecategorize = async () => {
    try {
      await updateTransaction({
        id: transaction.id,
        payload: {
          amount: transaction.amount,
          type: transaction.type,
          transactionDate: transaction.transactionDate,
          description: transaction.description,
          categoryId: newCategoryId ? parseInt(newCategoryId) : undefined,
          paymentMethodId: transaction.paymentMethod?.id,
          notes: transaction.notes,
        },
      }).unwrap()
      setIsRecategorizing(false)
    } catch (err) {
      console.error('Failed to recategorize transaction:', err)
    }
  }

  const handleChangePaymentMethod = async () => {
    try {
      await updateTransaction({
        id: transaction.id,
        payload: {
          amount: transaction.amount,
          type: transaction.type,
          transactionDate: transaction.transactionDate,
          description: transaction.description,
          categoryId: transaction.category?.id,
          paymentMethodId: newPaymentMethodId ? parseInt(newPaymentMethodId) : undefined,
          notes: transaction.notes,
        },
      }).unwrap()
      setIsChangingPaymentMethod(false)
    } catch (err) {
      console.error('Failed to change payment method:', err)
    }
  }

  const footer = (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={handleEdit}>
          Edit
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleDuplicate}>
          Duplicate
        </Button>
      </div>
      <Button
        variant="ghost"
        className="text-ui-error hover:bg-ui-error/10"
        onClick={handleDeleteClick}
      >
        Delete Transaction
      </Button>
    </div>
  )

  return (
    <>
      <ResponsiveModal open={open} onClose={onClose} title="Transaction Details" footer={footer}>
        <div className="space-y-6">
          {/* Header/Summary */}
          <div className="flex flex-col items-center justify-center py-4 bg-ui-surface-muted rounded-2xl border border-ui-border-subtle">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
            </p>
            <p
              className={cn(
                'text-4xl font-bold tracking-tight',
                transaction.type === 'INCOME' ? 'text-ui-success' : 'text-foreground',
              )}
            >
              {transaction.type === 'INCOME' ? '+' : '-'}{' '}
              {currencyFormatter.format(transaction.amount)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-y-5">
            <DetailRow
              label="Date & Time"
              value={dateFormatter.format(new Date(transaction.transactionDate))}
            />

            {transaction.isRecurring && (
              <DetailRow
                label="Frequency"
                value={formatFrequency(transaction.frequencyUnit, transaction.frequencyMultiplier)}
              />
            )}

            <DetailRow
              label="Description"
              value={transaction.description || '—'}
              italic={!transaction.description}
            />

            <DetailRow label="Notes" value={transaction.notes || '—'} italic={!transaction.notes} />

            <DetailRow
              label="Receipt"
              content={
                <div className="space-y-2">
                  {transaction.attachments && transaction.attachments.length > 0 ? (
                    transaction.attachments.map((att) => (
                      <div key={att.id} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between p-3 rounded-xl border border-ui-border-subtle bg-ui-surface-muted group transition-colors hover:border-primary/30">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                              {att.mimeType.startsWith('image/') ? (
                                <ImageIcon size={20} />
                              ) : (
                                <FileText size={20} />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
                                {att.filename}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                {(att.fileSize / 1024).toFixed(1)} KB • {att.mimeType.split('/')[1]}
                              </span>
                            </div>
                          </div>
                          <a
                            href={`/api/transactions/attachments/${att.id}/content`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
                          >
                            Open
                          </a>
                        </div>
                        {att.mimeType.startsWith('image/') && (
                          <div className="rounded-xl overflow-hidden border border-ui-border-subtle bg-black/5 aspect-video flex items-center justify-center">
                            <img
                              src={`/api/transactions/attachments/${att.id}/content`}
                              alt="Receipt Preview"
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                // Instruction 7: Offline Fallback
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.parentElement!.innerHTML =
                                  '<div class="flex flex-col items-center gap-2 p-6 text-muted-foreground"><div class="h-10 w-10 opacity-20"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><path d="M12 20h.01"/></svg></div><span class="text-xs font-bold uppercase tracking-wider">Receipt Unavailable</span><span class="text-[10px] opacity-60">File could not be loaded</span></div>'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="italic text-muted-foreground">—</span>
                  )}
                </div>
              }
            />

            <DetailRow
              label="Payment Method"
              content={
                <div className="flex items-center justify-between">
                  {transaction.paymentMethod ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ui-surface-muted text-foreground text-[10px] font-bold">
                        {transaction.paymentMethod.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">
                        {transaction.paymentMethod.name}
                      </span>
                    </div>
                  ) : (
                    <span className="italic text-muted-foreground">—</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-primary hover:bg-primary/10 text-xs font-semibold"
                    onClick={() => setIsChangingPaymentMethod(true)}
                  >
                    Change
                  </Button>
                </div>
              }
            />

            <DetailRow
              label="Category"
              content={
                <div className="flex items-center justify-between">
                  {transaction.category ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-base"
                        style={{
                          backgroundColor: transaction.category.color + '22',
                          color: transaction.category.color,
                        }}
                      >
                        {transaction.category.icon}
                      </div>
                      <span className="font-medium text-foreground">
                        {transaction.category.name}
                      </span>
                    </div>
                  ) : (
                    <span className="italic text-muted-foreground">—</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-primary hover:bg-primary/10 text-xs font-semibold"
                    onClick={() => setIsRecategorizing(true)}
                  >
                    Change
                  </Button>
                </div>
              }
            />

            <DetailRow
              label="Type"
              content={
                <Badge
                  tone={transaction.type === 'INCOME' ? 'success' : 'neutral'}
                  className="uppercase font-bold"
                >
                  {transaction.type}
                </Badge>
              }
            />
          </div>
        </div>
      </ResponsiveModal>

      {/* Recategorize Modal */}
      <ResponsiveModal
        open={isRecategorizing}
        onClose={() => setIsRecategorizing(false)}
        title="Change Category"
      >
        <div className="space-y-6">
          <CategorySelector value={newCategoryId} onChange={setNewCategoryId} />
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsRecategorizing(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleRecategorize} isLoading={isUpdating}>
              Confirm
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      {/* Change Payment Method Modal */}
      <ResponsiveModal
        open={isChangingPaymentMethod}
        onClose={() => setIsChangingPaymentMethod(false)}
        title="Change Payment Method"
      >
        <div className="space-y-6">
          <PaymentMethodSelector value={newPaymentMethodId} onChange={setNewPaymentMethodId} />
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsChangingPaymentMethod(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleChangePaymentMethod} isLoading={isUpdating}>
              Confirm
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      {/* Delete Confirmation Dialog */}
      <ResponsiveModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Transaction?"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete this transaction? This action will update your balance.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-ui-error hover:bg-ui-error-hover text-white border-0"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </>
  )
}

interface DetailRowProps {
  label: string
  value?: string
  content?: ReactElement
  italic?: boolean
}

function DetailRow({ label, value, content, italic }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-ui-border-subtle pb-3 last:border-0 last:pb-0">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      {content ? (
        content
      ) : (
        <p
          className={cn(
            'text-base text-foreground leading-relaxed',
            italic && 'italic text-muted-foreground',
          )}
        >
          {value}
        </p>
      )}
    </div>
  )
}
