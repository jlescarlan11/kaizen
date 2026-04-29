import type { ButtonHTMLAttributes, ReactElement, ForwardedRef } from 'react'
import { forwardRef } from 'react'
import { cn } from '../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'secondaryLg'

type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'border border-transparent bg-ui-action text-ui-action-text hover:bg-ui-action-hover active:bg-ui-action-active focus-visible:ring-ui-focus disabled:border-ui-border disabled:bg-ui-surface-muted disabled:text-foreground disabled:opacity-60',
  secondary:
    'border border-ui-border bg-ui-surface text-foreground hover:bg-ui-surface-muted focus-visible:ring-ui-focus disabled:border-ui-border disabled:bg-ui-surface disabled:text-foreground disabled:opacity-60',
  ghost:
    'border border-transparent bg-transparent text-foreground hover:bg-ui-surface-muted hover:text-foreground focus-visible:ring-ui-focus focus-visible:ring-offset-1 disabled:text-foreground disabled:opacity-60',
  destructive:
    'border border-transparent bg-ui-danger text-ui-danger-text hover:bg-ui-danger-hover active:bg-ui-danger-active focus-visible:ring-ui-focus disabled:border-ui-border disabled:bg-ui-surface-muted disabled:text-foreground disabled:opacity-60',
  outline:
    'border border-ui-border bg-transparent text-foreground hover:bg-ui-surface-muted focus-visible:ring-ui-focus focus-visible:ring-offset-1 disabled:border-ui-border disabled:bg-transparent disabled:text-foreground disabled:opacity-60',
  secondaryLg:
    'border border-ui-border bg-ui-surface rounded-xl text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary hover:border-primary/30 focus-visible:ring-ui-focus focus-visible:ring-offset-1 shadow-sm disabled:opacity-50',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
}

export const Button = forwardRef(function Button(
  {
    className,
    type = 'button',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    ...props
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
): ReactElement {
  return (
    <button
      ref={ref}
      type={type}
      disabled={isLoading || props.disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
})
