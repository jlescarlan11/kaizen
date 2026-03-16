import {
  useId,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactElement,
} from 'react'
import { cn } from '../lib/cn'
import { formFieldClasses } from '../styles/form'

export interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  helperText?: string
  /**
   * Called with the normalized value (digits only, e.g., "9175550199").
   */
  onChange?: (value: string) => void
}

/**
 * Normalizes input to digits only.
 */
function normalizePhone(value: string): string {
  // Extract only digits
  let digits = value.replace(/\D/g, '')

  // If it starts with 63, remove it to normalize to the local part
  if (digits.startsWith('63')) {
    digits = digits.slice(2)
  }

  // Max 10 digits for PH mobile (9XX XXX XXXX)
  return digits.slice(0, 10)
}

/**
 * Formats digits into PH mobile pattern: XXX XXX XXXX
 */
function formatPhoneDisplay(digits: string): string {
  if (!digits) return ''
  const part1 = digits.slice(0, 3)
  const part2 = digits.slice(3, 6)
  const part3 = digits.slice(6, 10)

  if (digits.length > 6) {
    return `${part1} ${part2} ${part3}`
  }
  if (digits.length > 3) {
    return `${part1} ${part2}`
  }
  return part1
}

export function PhoneInput({
  className,
  defaultValue,
  error,
  helperText,
  id,
  label,
  onChange,
  value: propValue,
  ...props
}: PhoneInputProps): ReactElement {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = error ? `${inputId}-error` : undefined
  const helperId = helperText && !error ? `${inputId}-helper` : undefined

  // Internal state if not controlled externally
  const [internalValue, setInternalValue] = useState(
    normalizePhone(String(propValue ?? defaultValue ?? '')),
  )

  const digits = propValue !== undefined ? normalizePhone(String(propValue)) : internalValue
  const displayValue = formatPhoneDisplay(digits)

  const ariaDescribedBy = error ? errorId : helperId

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const normalized = normalizePhone(raw)

    if (propValue === undefined) {
      setInternalValue(normalized)
    }

    onChange?.(normalized)
  }

  return (
    <div className={formFieldClasses.container}>
      {label ? (
        <label htmlFor={inputId} className={formFieldClasses.label}>
          {label}
        </label>
      ) : null}
      <div className="relative flex items-center">
        {/* Fixed Prefix */}
        <span
          className={cn(
            'absolute left-3 flex h-full items-center text-sm font-medium text-ui-muted transition-colors',
            error ? 'text-ui-danger-text-soft' : '',
          )}
          aria-hidden="true"
        >
          +63
        </span>
        <input
          id={inputId}
          type="tel"
          inputMode="tel"
          value={displayValue}
          onChange={handleChange}
          {...props}
          aria-describedby={ariaDescribedBy}
          aria-invalid={error ? 'true' : undefined}
          placeholder="9XX XXX XXXX"
          className={cn(
            formFieldClasses.input,
            'pl-12', // Extra padding for the +63 prefix
            className,
          )}
        />
      </div>
      {error ? (
        <p id={errorId} className={formFieldClasses.error}>
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className={formFieldClasses.helper}>
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
