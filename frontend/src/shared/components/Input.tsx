import { useId, type InputHTMLAttributes, type ReactElement } from 'react'
import { cn } from '../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ className, error, id, label, ...props }: InputProps): ReactElement {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium leading-none text-foreground">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        aria-describedby={errorId}
        aria-invalid={error ? 'true' : 'false'}
        className={cn(
          'w-full rounded-md border border-ui-border-strong bg-ui-surface px-3 py-2 text-sm leading-6 text-foreground',
          'placeholder:text-ui-subtle focus:border-ui-accent focus:outline-none focus:ring-2 focus:ring-ui-focus',
          error ? 'border-ui-danger focus:border-ui-danger focus:ring-ui-danger' : '',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs leading-5 text-ui-danger-text-soft">
          {error}
        </p>
      ) : null}
    </div>
  )
}
