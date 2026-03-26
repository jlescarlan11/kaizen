import { useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../../shared/components/Input'
import { Button } from '../../../shared/components/Button'
import { Select } from '../../../shared/components/Select'
import { Card } from '../../../shared/components/Card'
import { TransactionTypeToggle } from './TransactionTypeToggle'
import {
  useCreateTransactionMutation,
  type TransactionType,
} from '../../../app/store/api/transactionApi'
import { useGetCategoriesQuery } from '../../../app/store/api/categoryApi'
import { useAuthState } from '../../../shared/hooks/useAuthState'

export function TransactionEntryForm(): ReactElement {
  const navigate = useNavigate()
  const { user } = useAuthState()
  const [createTransaction, { isLoading }] = useCreateTransactionMutation()
  const { data: categories = [] } = useGetCategoriesQuery()

  // Instruction 8: Quick Add Pre-fill on Open
  const initialPrefs = (() => {
    if (!user?.quickAddPreferences) return null
    try {
      return JSON.parse(user.quickAddPreferences)
    } catch (err) {
      console.error('Failed to parse Quick Add preferences:', err)
      return null
    }
  })()

  const [amount, setAmount] = useState(initialPrefs?.amount?.toString() ?? '')
  const [type, setType] = useState<TransactionType>(initialPrefs?.type ?? 'EXPENSE')
  const [transactionDate, setTransactionDate] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(initialPrefs?.categoryId?.toString() ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const today = new Date().toISOString().split('T')[0]

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

    try {
      await createTransaction({
        amount: parseFloat(amount),
        type,
        transactionDate: transactionDate ? `${transactionDate}T00:00:00` : undefined,
        description: description || undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
      }).unwrap()
      navigate('/')
    } catch (err) {
      console.error('Failed to save transaction:', err)
      // Basic error handling
      setErrors({ form: 'An error occurred while saving. Please try again.' })
    }
  }

  const categoryOptions = categories.map((cat) => ({
    value: cat.id.toString(),
    label: cat.name,
  }))

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
          helperText="Captured at submission if not set."
        />

        <Select
          label="Category (Optional)"
          options={categoryOptions}
          value={categoryId}
          onChange={setCategoryId}
          placeholder="Select a category"
        />

        <Input
          label="Description (Optional)"
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {errors.form && <p className="text-sm text-error text-center">{errors.form}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={isLoading}>
            Save Transaction
          </Button>
        </div>
      </form>
    </Card>
  )
}
