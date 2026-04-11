import { useState, useEffect, useRef, type ReactElement } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Input, TextArea, Button, Card } from '../../../shared/components'
import { TransactionTypeToggle } from './TransactionTypeToggle'
import {
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
  useGetTransactionQuery,
  type TransactionType,
  type FrequencyUnit,
} from '../../../app/store/api/transactionApi'
import { CategorySelector } from '../../categories'
import { PaymentMethodSelector } from '../../payment-methods/PaymentMethodSelector'
import { useGetPaymentMethodSummaryQuery } from '../../../app/store/api/paymentMethodApi'
import { ReceiptPicker } from './ReceiptPicker'
import { useAuthState } from '../../../shared/hooks/useAuthState'
import { Checkbox, Select } from '../../../shared/components'
import { db, SyncStatus, generateClientId } from '../lib/localStore'
import { toLocalISOString } from '../../../shared/lib/dateUtils'

import { useAppDispatch } from '../../../app/store/hooks'
import { showAlert } from '../../../app/store/notificationSlice'
import { validationGate } from '../lib/validationGate'
import { getErrorMessage, SystemMessages } from '../utils/errorMessages'

interface TransactionEntryFormProps {
  editId?: number
  onSuccess?: (data: {
    amount: number
    paymentMethodId?: number
    categoryId?: number
    type: TransactionType
  }) => void
  initialType?: TransactionType
  lockType?: boolean
  hideAdvancedFields?: boolean
  noCard?: boolean
  submitLabel?: string
  hideCancel?: boolean
  skipSubmit?: boolean
  hideDescription?: boolean
  hideDate?: boolean
}

const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
]

export function TransactionEntryForm({
  editId,
  onSuccess,
  initialType,
  lockType,
  hideAdvancedFields,
  noCard,
  submitLabel,
  hideCancel,
  skipSubmit,
  hideDescription,
  hideDate,
}: TransactionEntryFormProps): ReactElement {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthState()
  const dispatch = useAppDispatch()
  const [createTransaction, { isLoading: isCreating }] = useCreateTransactionMutation()
  const [updateTransaction, { isLoading: isUpdating }] = useUpdateTransactionMutation()
  const [uploadAttachment] = useUploadAttachmentMutation()
  const [deleteAttachment] = useDeleteAttachmentMutation()

  // Fetch data if editing
  const { data: editData, isLoading: isFetching } = useGetTransactionQuery(editId!, {
    skip: !editId,
  })

  // Fetch balances for safeguard
  const { data: balanceSummaries } = useGetPaymentMethodSummaryQuery()

  // Handle pre-fill from location state (e.g. from reminders)
  const prefill = location.state?.prefill

  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>(initialType ?? 'EXPENSE')
  const [transactionDate, setTransactionDate] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>('MONTHLY')
  const [frequencyMultiplier, setFrequencyMultiplier] = useState('1')
  const [parentRecurringTransactionId, setParentRecurringTransactionId] = useState<number | null>(
    null,
  )
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const isInitialized = useRef(false)

  // Calculate available balance for selected method
  const selectedMethodSummary = balanceSummaries?.find(
    (s) => s.paymentMethod?.id.toString() === paymentMethodId,
  )
  const rawBalance = selectedMethodSummary?.totalAmount ?? 0

  // If editing, the current transaction's amount is already subtracted from the balance summary,
  // so we add it back to see the "true" available balance before this edit.
  const availableBalance =
    editData?.paymentMethod?.id.toString() === paymentMethodId && editData.type === 'EXPENSE'
      ? rawBalance + editData.amount
      : rawBalance

  const insufficientBalance = type === 'EXPENSE' && parseFloat(amount) > availableBalance

  // Initialize form
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isInitialized.current) return

    if (editId && editData) {
      setAmount(editData.amount.toString())
      setType(editData.type)
      setTransactionDate(editData.transactionDate?.split('T')[0] ?? '')
      setDescription(editData.description || '')
      setNotes(editData.notes || '')
      setCategoryId(editData.category?.id.toString() || null)
      setPaymentMethodId(editData.paymentMethod?.id.toString() || null)
      setIsRecurring(editData.isRecurring || false)
      setFrequencyUnit(editData.frequencyUnit || 'MONTHLY')
      setFrequencyMultiplier(editData.frequencyMultiplier?.toString() || '1')
      setRemindersEnabled(editData.remindersEnabled ?? true)
      isInitialized.current = true
    } else if (prefill) {
      setAmount(prefill.amount?.toString() ?? '')
      setType(prefill.type ?? type)
      setDescription(prefill.description || '')
      setCategoryId(prefill.categoryId?.toString() || null)
      setPaymentMethodId(prefill.paymentMethodId?.toString() || null)
      setParentRecurringTransactionId(prefill.parentRecurringTransactionId || null)
      isInitialized.current = true
    } else if (user?.quickAddPreferences) {
      // Instruction 8: Quick Add Pre-fill
      try {
        const prefs = JSON.parse(user.quickAddPreferences)
        setAmount(prefs.amount?.toString() ?? '')
        setType(initialType ?? prefs.type ?? 'EXPENSE')
        setCategoryId(prefs.categoryId?.toString() ?? null)
        setPaymentMethodId(prefs.paymentMethodId?.toString() ?? null)
        isInitialized.current = true
      } catch (err) {
        console.error('Failed to parse Quick Add preferences:', err)
      }
    }
  }, [editId, editData, prefill, user, initialType, type])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const clientId = generateClientId()

    const payload = {
      amount: parseFloat(amount),
      type,
      transactionDate: transactionDate
        ? toLocalISOString(transactionDate)
        : toLocalISOString(new Date()),
      description: description || undefined,
      categoryId:
        (type === 'EXPENSE' || type === 'INCOME') && categoryId ? parseInt(categoryId) : undefined,
      paymentMethodId: paymentMethodId ? parseInt(paymentMethodId) : undefined,
      notes: notes || undefined,
      isRecurring,
      frequencyUnit: isRecurring ? frequencyUnit : undefined,
      frequencyMultiplier: isRecurring ? parseInt(frequencyMultiplier) : undefined,
      parentRecurringTransactionId: parentRecurringTransactionId || undefined,
      remindersEnabled: isRecurring ? remindersEnabled : undefined,
      clientGeneratedId: clientId,
    }

    const validationResult = validationGate(payload)
    if (!validationResult.valid || (type === 'EXPENSE' && insufficientBalance)) {
      const newErrors: Record<string, string> = {}
      validationResult.errors.forEach((err) => {
        newErrors[err.field] = getErrorMessage(err.code, err.field)
      })

      if (type === 'EXPENSE' && insufficientBalance) {
        newErrors.amount = `Insufficient balance. Available: PHP ${availableBalance.toFixed(2)}`
      }

      setErrors(newErrors)
      return
    }

    try {
      const isOnline = navigator.onLine

      if (!skipSubmit) {
        if (isOnline) {
          let savedId: number
          if (editId) {
            await updateTransaction({ id: editId, payload }).unwrap()
            savedId = editId
          } else {
            const result = await createTransaction(payload).unwrap()
            savedId = result.id
          }

          // Handle receipt attachment
          if (receiptFile) {
            // If editing and already has an attachment, delete it first (Replace behavior)
            if (editId && editData?.attachments && editData.attachments.length > 0) {
              for (const att of editData.attachments) {
                await deleteAttachment({ transactionId: editId, attachmentId: att.id }).unwrap()
              }
            }

            try {
              await uploadAttachment({ transactionId: savedId, file: receiptFile }).unwrap()
            } catch (uploadErr) {
              // Attachment failure must not block transaction save (Story 31)
              console.error('Failed to upload receipt:', uploadErr)
            }
          }

          dispatch(
            showAlert({
              ...SystemMessages.SUCCESS,
              type: 'success',
              dataSaved: true,
            }),
          )
        } else {
          // Instruction 5: Offline Transaction Creation
          await db.transactions.add({
            ...payload,
            syncStatus: SyncStatus.PENDING,
            clientGeneratedId: clientId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })

          dispatch(
            showAlert({
              ...SystemMessages.OFFLINE_SAVE,
              type: 'success',
              dataSaved: true,
            }),
          )
        }
      }

      if (onSuccess) {
        onSuccess({
          amount: payload.amount,
          paymentMethodId: payload.paymentMethodId,
          categoryId: payload.categoryId,
          type: payload.type,
        })
      } else {
        navigate('/')
      }
    } catch (err: unknown) {
      console.error('Failed to save transaction:', err)
      const error = err as {
        status?: number | 'FETCH_ERROR'
        data?: {
          message?: string
          errors?: Array<{ field: string; message: string; code: string }>
        }
      }

      // Handle specific system-level errors
      let alertProps = {
        title: 'Error',
        message: 'An unexpected error occurred while saving.',
        type: 'error' as const,
        dataSaved: false,
        autoRetry: false,
      }

      if (error.status === 'FETCH_ERROR') {
        alertProps = {
          ...SystemMessages.NETWORK_TIMEOUT,
          type: 'error',
          dataSaved: false,
          autoRetry: true,
        }
      } else if (error.data?.errors && Array.isArray(error.data.errors)) {
        // Handle structured validation errors from backend
        const backendErrors: Record<string, string> = {}
        error.data.errors.forEach((e: { field: string; message: string; code: string }) => {
          backendErrors[e.field] = e.message
        })
        setErrors(backendErrors)
        alertProps.message = 'Please correct the highlighted errors.'
      } else if (error.data?.message) {
        alertProps.message = error.data.message
      }

      dispatch(showAlert(alertProps))
      setErrors({ form: alertProps.message })
    }
  }

  if (isFetching) {
    return (
      <Card className="p-12 flex justify-center border border-ui-border-subtle shadow-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </Card>
    )
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!lockType && <TransactionTypeToggle value={type} onChange={setType} />}

      <div className="space-y-6">
        <Input
          label="Amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          startAdornment={
            <span className="text-base font-semibold text-muted-foreground">PHP</span>
          }
          className="h-14 text-2xl font-bold tracking-tight"
          required
        />

        {(type === 'EXPENSE' || type === 'INCOME') && (
          <CategorySelector
            label="Category"
            value={categoryId}
            onChange={setCategoryId}
            error={errors.categoryId}
            type={type}
          />
        )}

        <PaymentMethodSelector
          label="Payment Method"
          value={paymentMethodId}
          onChange={setPaymentMethodId}
          error={errors.paymentMethodId}
        />

        {paymentMethodId && type === 'EXPENSE' && (
          <div className="flex items-center justify-end px-1 -mt-5 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <span
              className={`text-xs font-bold ${insufficientBalance ? 'text-error' : 'text-primary'}`}
            >
              Balance: PHP {availableBalance.toLocaleString()}
            </span>
          </div>
        )}
        {!hideDate && (
          <Input
            label="Date (Optional)"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            error={errors.transactionDate}
            helperText={editId ? undefined : 'Captured at submission if not set.'}
          />
        )}
      </div>

      {!hideDescription && (
        <div className="space-y-6 pt-6 border-t border-ui-border-subtle/50">
          <Input
            label="Description (Optional)"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextArea
            label="Notes (Optional)"
            placeholder="Add extra details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      )}

      {!hideAdvancedFields && (
        <>
          <div className="space-y-4 rounded-xl border border-ui-border-subtle p-5 bg-ui-surface-muted/30">
            <Checkbox
              label="Recurring Transaction"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
              helperText="Set a frequency for regular charges or income."
            />

            {isRecurring && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Select
                  label="Frequency"
                  options={FREQUENCY_OPTIONS}
                  value={frequencyUnit}
                  onChange={(v) => setFrequencyUnit(v as FrequencyUnit)}
                />
                <Input
                  label="Every (multiplier)"
                  type="number"
                  min="1"
                  value={frequencyMultiplier}
                  onChange={(e) => setFrequencyMultiplier(e.target.value)}
                  error={errors.frequencyMultiplier}
                  helperText="e.g., '2' for every 2 weeks."
                />
                <div className="sm:col-span-2 pt-2 border-t border-ui-border-subtle/50 mt-2">
                  <Checkbox
                    label="Enable Reminders"
                    checked={remindersEnabled}
                    onCheckedChange={setRemindersEnabled}
                    helperText="Get notified when the next instance is due."
                  />
                </div>
              </div>
            )}
          </div>

          <ReceiptPicker
            file={receiptFile}
            onFileChange={setReceiptFile}
            existingAttachments={editData?.attachments}
          />
        </>
      )}

      {errors.form && <p className="text-sm text-error text-center">{errors.form}</p>}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          className="flex-1 order-1 sm:order-2"
          isLoading={isCreating || isUpdating}
        >
          {submitLabel || (editId ? 'Save Changes' : 'Save Transaction')}
        </Button>
        {!hideCancel && (
          <Button
            type="button"
            variant="ghost"
            className="flex-1 order-2 sm:order-1"
            onClick={() => navigate(-1)}
            disabled={isCreating || isUpdating}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )

  if (noCard) {
    return formContent
  }

  return <Card className="border border-ui-border-subtle p-5 sm:p-6 shadow-sm">{formContent}</Card>
}
