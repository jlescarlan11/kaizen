import { type ReactElement } from 'react'
import { useGetPaymentMethodsQuery } from '../../../app/store/api/paymentMethodApi'
import { Select, type SelectOption } from '../../../shared/components/Select'
import { cn } from '../../../shared/lib/cn'

interface PaymentMethodSelectorProps {
  value?: string | null
  onChange: (value: string | null) => void
  label?: string
  error?: string
  helperText?: string
  placeholder?: string
  className?: string
  id?: string
}

export function PaymentMethodSelector({
  value,
  onChange,
  label = 'Payment Method (Optional)',
  error,
  helperText,
  placeholder = 'Select a payment method',
  className,
  id,
}: PaymentMethodSelectorProps): ReactElement {
  const { data: paymentMethods = [], isLoading } = useGetPaymentMethodsQuery()

  const paymentMethodOptions: SelectOption[] = [
    // Null option (Unspecified)
    {
      value: '',
      label: 'None (Unspecified)',
      icon: (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-ui-surface-muted text-muted-foreground text-[10px]">
          —
        </div>
      ),
    },
    ...paymentMethods.map((pm) => ({
      value: pm.id.toString(),
      label: pm.name,
      icon: (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-ui-surface-muted text-foreground text-[10px]">
          {pm.name.charAt(0).toUpperCase()}
        </div>
      ),
    })),
  ]

  const handleChange = (newValue: string) => {
    // If empty string (None), emit null
    onChange(newValue === '' ? null : newValue)
  }

  return (
    <Select
      id={id}
      label={label}
      options={paymentMethodOptions}
      value={value ?? ''}
      onChange={handleChange}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      className={cn(className)}
      disabled={isLoading}
    />
  )
}
