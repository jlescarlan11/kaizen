import type { InputHTMLAttributes, ReactElement } from 'react'
import { cn } from '../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ className, error, id, label, ...props }: InputProps): ReactElement {
  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className={cn(
          'w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary',
          'placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary',
          error ? 'border-error focus:border-error focus:ring-error-light' : '',
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  )
}
