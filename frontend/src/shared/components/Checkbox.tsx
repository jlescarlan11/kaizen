import { useId, type InputHTMLAttributes, type ReactElement } from 'react'
import { cn } from '../lib/cn'
import { formFieldClasses } from '../styles/form'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
  onCheckedChange?: (checked: boolean) => void
}

export function Checkbox({
  className,
  error,
  helperText,
  id,
  label,
  onCheckedChange,
  onChange,
  ...props
}: CheckboxProps): ReactElement {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = error ? `${inputId}-error` : undefined
  const helperId = helperText && !error ? `${inputId}-helper` : undefined

  const ariaDescribedBy = error ? errorId : helperId

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e)
    onCheckedChange?.(e.target.checked)
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-start gap-3">
        <div className="flex h-5 items-center">
          <input
            id={inputId}
            type="checkbox"
            {...props}
            onChange={handleChange}
            aria-describedby={ariaDescribedBy}
            aria-invalid={error ? 'true' : undefined}
            className={cn(
              'h-4 w-4 rounded border-border bg-surface text-primary/60 transition focus:ring-2 focus:ring-primary/30 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-(--ui-disabled-opacity)',
              'aria-invalid:border-error aria-invalid:focus:ring-error/20',
              'checked:bg-primary/60 checked:border-primary/60',
              className,
            )}
          />
        </div>
        {label ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-5 text-text-primary select-none cursor-pointer"
          >
            {label}
            {props.required ? (
              <span aria-hidden="true" className="ml-0.5 text-error">
                *
              </span>
            ) : null}
          </label>
        ) : null}
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
