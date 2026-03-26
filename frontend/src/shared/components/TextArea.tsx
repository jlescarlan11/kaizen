import { useId, type TextareaHTMLAttributes, type ReactElement } from 'react'
import { cn } from '../lib/cn'
import { formFieldClasses } from '../styles/form'

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export function TextArea({
  className,
  defaultValue,
  error,
  helperText,
  id,
  label,
  value,
  ...props
}: TextAreaProps): ReactElement {
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
        </label>
      ) : null}
      <div className="relative flex items-center">
        <textarea
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          {...props}
          aria-describedby={ariaDescribedBy}
          aria-invalid={error ? 'true' : undefined}
          className={cn(formFieldClasses.input, 'h-auto min-h-[120px] py-3 resize-none', className)}
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
