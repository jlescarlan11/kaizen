import { useState, type ReactElement } from 'react'
import { Input } from '../../shared/components/Input'
import { Button } from '../../shared/components/Button'
import { useCreatePaymentMethodMutation } from '../../app/store/api/paymentMethodApi'
import type { PaymentMethod } from './types'
import { getErrorMessage } from '../../app/store/api/errors'

interface PaymentMethodCreationFormProps {
  paymentMethods: PaymentMethod[]
  onPaymentMethodSaved?: (paymentMethod: PaymentMethod) => void
}

export function PaymentMethodCreationForm({
  paymentMethods,
  onPaymentMethodSaved,
}: PaymentMethodCreationFormProps): ReactElement {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [createPaymentMethod, { isLoading }] = useCreatePaymentMethodMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Payment method name cannot be empty.')
      return
    }

    // Case-insensitive duplicate check (Instruction 6)
    const isDuplicate = paymentMethods.some(
      (pm) => pm.name.toLowerCase() === trimmedName.toLowerCase(),
    )

    if (isDuplicate) {
      setError('A payment method with this name already exists.')
      return
    }

    try {
      const result = await createPaymentMethod({ name: trimmedName }).unwrap()
      setName('')
      onPaymentMethodSaved?.(result)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create payment method.'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        placeholder="e.g. My Secret Stash"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error || undefined}
        disabled={isLoading}
        required
      />
      <Button type="submit" className="w-full" isLoading={isLoading}>
        Create payment method
      </Button>
    </form>
  )
}
