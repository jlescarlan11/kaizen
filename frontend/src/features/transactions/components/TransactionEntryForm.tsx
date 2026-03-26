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
} from '../../../app/store/api/transactionApi'
import { CategorySelector } from '../../categories'
import { PaymentMethodSelector } from '../../payment-methods/PaymentMethodSelector'
import { ReceiptPicker } from './ReceiptPicker'
import { useAuthState } from '../../../shared/hooks/useAuthState'

interface TransactionEntryFormProps {
  editId?: number
}

export function TransactionEntryForm({ editId }: TransactionEntryFormProps): ReactElement {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthState()
  const [createTransaction, { isLoading: isCreating }] = useCreateTransactionMutation()
  const [updateTransaction, { isLoading: isUpdating }] = useUpdateTransactionMutation()
  const [uploadAttachment] = useUploadAttachmentMutation()
  const [deleteAttachment] = useDeleteAttachmentMutation()

  // Fetch data if editing
  const { data: editData, isLoading: isFetching } = useGetTransactionQuery(editId!, {
    skip: !editId,
  })

  // Story 13: Duplicate pre-population
  const duplicateFrom = location.state?.duplicateFrom

  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('EXPENSE')
  const [transactionDate, setTransactionDate] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const isInitialized = useRef(false)

  const today = new Date().toISOString().split('T')[0]

  // Initialize form
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isInitialized.current) return

    if (editId && editData) {
      setAmount(editData.amount.toString())
      setType(editData.type)
      setTransactionDate(editData.transactionDate.split('T')[0])
      setDescription(editData.description || '')
      setNotes(editData.notes || '')
      setCategoryId(editData.category?.id.toString() || null)
      setPaymentMethodId(editData.paymentMethod?.id.toString() || null)
      isInitialized.current = true
    } else if (duplicateFrom) {
      setAmount(duplicateFrom.amount.toString())
      setType(duplicateFrom.type)
      // Story 13: Date defaults to current date for duplicate
      setTransactionDate('')
      setDescription(duplicateFrom.description || '')
      setNotes(duplicateFrom.notes || '')
      setCategoryId(duplicateFrom.categoryId?.toString() || null)
      setPaymentMethodId(duplicateFrom.paymentMethodId?.toString() || null)
      isInitialized.current = true
    } else if (user?.quickAddPreferences) {
      // Instruction 8: Quick Add Pre-fill
      try {
        const prefs = JSON.parse(user.quickAddPreferences)
        setAmount(prefs.amount?.toString() ?? '')
        setType(prefs.type ?? 'EXPENSE')
        setCategoryId(prefs.categoryId?.toString() ?? null)
        setPaymentMethodId(prefs.paymentMethodId?.toString() ?? null)
        isInitialized.current = true
      } catch (err) {
        console.error('Failed to parse Quick Add preferences:', err)
      }
    }
  }, [editId, editData, duplicateFrom, user])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    const newErrors: Record<string, string> = {}

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero.'
    }

    if (transactionDate && transactionDate > today) {
      newErrors.transactionDate = 'Future dates are not permitted.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload = {
      amount: parseFloat(amount),
      type,
      transactionDate: transactionDate ? `${transactionDate}T00:00:00` : undefined,
      description: description || undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      paymentMethodId: paymentMethodId ? parseInt(paymentMethodId) : undefined,
      notes: notes || undefined,
    }

    try {
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

      navigate('/')
    } catch (err) {
      console.error('Failed to save transaction:', err)
      setErrors({ form: 'An error occurred while saving. Please try again.' })
    }
  }

  if (isFetching) {
    return (
      <Card className="p-12 flex justify-center border border-ui-border-subtle shadow-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </Card>
    )
  }

  return (
    <Card className="border border-ui-border-subtle p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <TransactionTypeToggle value={type} onChange={setType} />

        <Input
          label="Amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          startAdornment={<span className="text-sm font-medium text-muted-foreground">PHP</span>}
          required
        />

        <Input
          label="Date (Optional)"
          type="date"
          max={today}
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          error={errors.transactionDate}
          helperText={editId ? undefined : 'Captured at submission if not set.'}
        />

        <CategorySelector value={categoryId} onChange={setCategoryId} />

        <PaymentMethodSelector value={paymentMethodId} onChange={setPaymentMethodId} />

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

        <ReceiptPicker
          file={receiptFile}
          onFileChange={setReceiptFile}
          existingAttachments={editData?.attachments}
        />

        {errors.form && <p className="text-sm text-error text-center">{errors.form}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={isCreating || isUpdating}>
            {editId ? 'Save Changes' : 'Save Transaction'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
