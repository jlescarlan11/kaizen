import { useState, useEffect, useRef, type ReactElement } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Input, TextArea, Button, Card, LoadingSpinner } from '../../../shared/components'
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
import { CategorySelector } from '../../categories/CategorySelector'
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
import {
  getErrorMessage as getApiErrorMessage,
  getFieldErrors,
  hasFieldErrors,
} from '../../../app/store/api/errors'
import { formatCurrency } from '../../../shared/lib/formatCurrency'

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

  // Real-time validation helper
  const validateField = (field: string, value: string | null) => {
    // Construct a partial payload for validation
    const currentPayload = {
      amount: field === 'amount' ? parseFloat(value ?? '') : parseFloat(amount),
      type: (field === 'type' ? value : type) as TransactionType,
      transactionDate:
        field === 'transactionDate'
          ? (value ?? '')
          : transactionDate || toLocalISOString(new Date()),
      description: field === 'description' ? (value ?? '') : description,
      categoryId:
        field === 'categoryId'
          ? value
            ? parseInt(value)
            : undefined
          : categoryId
            ? parseInt(categoryId)
            : undefined,
      paymentMethodId:
        field === 'paymentMethodId'
          ? value
            ? parseInt(value)
            : undefined
          : paymentMethodId
            ? parseInt(paymentMethodId)
            : undefined,
      isRecurring,
      frequencyUnit,
      frequencyMultiplier: parseInt(frequencyMultiplier),
    }

    const { errors: validationErrors } = validationGate(currentPayload)
    const fieldError = validationErrors.find((e) => e.field === field)

    setErrors((prev) => {
      const next = { ...prev }
      const fieldName = field === 'transactionDate' ? 'transactionDate' : field

      if (fieldError) {
        next[fieldName] = getErrorMessage(fieldError.code, fieldName)
      } else {
        delete next[fieldName]
      }

      // Special case: insufficient balance is also a real-time error for amount
      // We must calculate the balance for the target method to avoid stale closure issues
      const targetMethodId = field === 'paymentMethodId' ? value : paymentMethodId
      const targetType = (field === 'type' ? value : type) as TransactionType
      const targetAmount = field === 'amount' ? (value ?? '') : amount

      const methodSummary = balanceSummaries?.find(
        (s) => s.paymentMethod?.id.toString() === targetMethodId,
      )
      const rawBal = methodSummary?.totalAmount ?? 0
      const currentAvailableBalance =
        editData?.paymentMethod?.id.toString() === targetMethodId && editData.type === 'EXPENSE'
          ? rawBal + editData.amount
          : rawBal

      const val = parseFloat(targetAmount)
      if (targetType === 'EXPENSE' && !isNaN(val) && val > currentAvailableBalance) {
        next.amount = `Insufficient balance. Available: ${formatCurrency(currentAvailableBalance)}`
      } else if (next.amount?.includes('Insufficient balance')) {
        delete next.amount
      }

      return next
    })
  }

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
        newErrors.amount = `Insufficient balance. Available: ${formatCurrency(availableBalance)}`
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
      const fetchErr = err as { status?: number | 'FETCH_ERROR' }

      // Handle specific system-level errors
      let alertProps = {
        title: 'Error',
        message: 'An unexpected error occurred while saving.',
        type: 'error' as const,
        dataSaved: false,
        autoRetry: false,
      }

      if (fetchErr.status === 'FETCH_ERROR') {
        alertProps = {
          ...SystemMessages.NETWORK_TIMEOUT,
          type: 'error',
          dataSaved: false,
          autoRetry: true,
        }
      } else if (hasFieldErrors(err)) {
        // Handle structured validation errors from backend
        setErrors(getFieldErrors(err))
        alertProps.message = 'Please correct the highlighted errors.'
      } else {
        alertProps.message = getApiErrorMessage(err, 'An unexpected error occurred while saving.')
      }

      dispatch(showAlert(alertProps))
      if (!hasFieldErrors(err)) {
        setErrors({ form: alertProps.message })
      }
    }
  }

  if (isFetching) {
    return (
      <Card className="border border-ui-border-subtle shadow-sm">
        <LoadingSpinner />
      </Card>
    )
  }

  const balanceTone = insufficientBalance ? 'text-error font-bold' : 'text-primary font-bold'

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!lockType && (
        <TransactionTypeToggle
          value={type}
          onChange={(newType) => {
            setType(newType)
          }}
        />
      )}

      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary px-1 opacity-60">
          Amount
        </label>
        <div className="flex items-baseline gap-4">
          <span className="text-3xl font-bold text-text-secondary opacity-30 italic">PHP</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={(e) => validateField('amount', e.target.value)}
            className="w-full text-5xl md:text-6xl font-bold tracking-tighter text-text-primary bg-transparent border-none focus:ring-0 p-0 placeholder-text-secondary/10"
            required
          />
        </div>
        {errors.amount && (
          <p className="text-[10px] font-bold uppercase tracking-tight text-error px-1">
            {errors.amount}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        {(type === 'EXPENSE' || type === 'INCOME') && (
          <CategorySelector
            label="Category"
            value={categoryId}
            onChange={(newVal) => {
              setCategoryId(newVal)
              validateField('categoryId', newVal)
            }}
            error={errors.categoryId}
            type={type}
            className="bg-transparent border-0 border-b-2 border-border-subtle rounded-none px-0 hover:border-primary/30 focus-visible:border-primary focus-visible:ring-0 py-3 text-lg font-bold tracking-tight"
          />
        )}

        <div className="relative">
          <PaymentMethodSelector
            label="Payment Method"
            value={paymentMethodId}
            onChange={(newVal) => {
              setPaymentMethodId(newVal)
              validateField('paymentMethodId', newVal)
            }}
            error={errors.paymentMethodId}
            className="bg-transparent border-0 border-b-2 border-border-subtle rounded-none px-0 hover:border-primary/30 focus-visible:border-primary focus-visible:ring-0 py-3 text-lg font-bold tracking-tight"
          />
          {paymentMethodId && type === 'EXPENSE' && (
            <div className="absolute right-0 top-0 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
              <span className={`text-[10px] uppercase tracking-widest ${balanceTone}`}>
                Bal: ${availableBalance.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {!hideDate && (
          <Input
            label="Date (Optional)"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            onBlur={(e) => validateField('transactionDate', e.target.value)}
            error={errors.transactionDate}
            helperText={editId ? undefined : 'Today if not set.'}
            className="bg-transparent border-0 border-b-2 border-border-subtle rounded-none px-0 hover:border-primary/30 focus-visible:border-primary focus-visible:ring-0 py-3 text-lg font-bold tracking-tight"
          />
        )}

        {!hideDescription && (
          <Input
            label="Description (Optional)"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={(e) => validateField('description', e.target.value)}
            error={errors.description}
            className="bg-transparent border-0 border-b-2 border-border-subtle rounded-none px-0 hover:border-primary/30 focus-visible:border-primary focus-visible:ring-0 py-3 text-lg font-bold tracking-tight"
          />
        )}
      </div>

      {!hideDescription && (
        <div className="space-y-6 pt-6">
          <TextArea
            label="Notes (Optional)"
            placeholder="Add extra details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-transparent border-0 border-b-2 border-border-subtle rounded-none px-0 hover:border-primary/30 focus-visible:border-primary focus-visible:ring-0 py-3 text-lg font-bold tracking-tight min-h-[100px]"
          />
        </div>
      )}

      {!hideAdvancedFields && (
        <div className="space-y-6">
          <div className="space-y-5 rounded-2xl border-2 border-border-subtle p-6 bg-surface-secondary/30 shadow-inner">
            <Checkbox
              label="Recurring Transaction"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
              helperText="Auto-record on a regular basis."
            />

            {isRecurring && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 animate-in fade-in slide-in-from-top-4 duration-300">
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
                  helperText="e.g. every 2 weeks."
                />
                <div className="sm:col-span-2 pt-3 border-t border-border-subtle/30 mt-1">
                  <Checkbox
                    label="Enable Reminders"
                    checked={remindersEnabled}
                    onCheckedChange={setRemindersEnabled}
                    helperText="Notification when due."
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
        </div>
      )}

      {errors.form && (
        <p className="text-sm font-bold text-error text-center uppercase tracking-tight">
          {errors.form}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto px-12 h-14 shadow-md shadow-primary/10 order-1 sm:order-2"
          isLoading={isCreating || isUpdating}
        >
          {submitLabel || (editId ? 'Save Changes' : 'Record Entry')}
        </Button>
        {!hideCancel && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto px-10 h-14 order-2 sm:order-1 opacity-60"
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

  return <Card className="p-6 md:p-8 shadow-lg shadow-primary/5">{formContent}</Card>
}
