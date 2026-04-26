import { useId, type InputHTMLAttributes, type ReactElement, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import { formFieldClasses } from '../styles/form'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  helperText?: string
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  startAdornmentPointerEvents?: 'none' | 'auto'
}

export function Input({
  className,
  defaultValue,
  error,
  helperText,
  id,
  label,
  value,
  startAdornment,
  endAdornment,
  startAdornmentPointerEvents,
  ...props
}: InputProps): ReactElement {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = error ? `${inputId}-error` : undefined
  const helperId = helperText && !error ? `${inputId}-helper` : undefined

  const ariaDescribedBy = error ? errorId : helperId

  return (
    <div className={formFieldClasses.container}>
      {label ? (
        <label htmlFor={inputId} className={formFieldClasses.label}>
          {label}
          {props.required ? (
            <span aria-hidden="true" className="ml-0.5 text-ui-danger">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      <div className="relative flex items-center">
        {startAdornment ? (
          <div
            className={cn(
              'absolute left-3 flex items-center text-subtle-foreground',
              startAdornmentPointerEvents === 'auto'
                ? 'pointer-events-auto'
                : 'pointer-events-none',
            )}
          >
            {startAdornment}
          </div>
        ) : null}
        <input
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          {...props}
          aria-describedby={ariaDescribedBy}
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            formFieldClasses.input,
            Boolean(startAdornment) && 'pl-10',
            Boolean(endAdornment) && 'pr-12',
            className,
          )}
        />
        {endAdornment ? (
          <div className="pointer-events-none absolute right-3 flex items-center text-sm font-medium text-subtle-foreground uppercase">
            {endAdornment}
          </div>
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
