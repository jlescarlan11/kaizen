import type { ButtonHTMLAttributes, ReactElement } from 'react'
import { cn } from '../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'border border-transparent bg-ui-action text-ui-action-text hover:bg-ui-action-hover active:bg-ui-action-active focus-visible:ring-ui-focus disabled:border-ui-border disabled:bg-ui-surface-muted disabled:text-foreground disabled:opacity-60',
  secondary:
    'border border-ui-border bg-ui-surface text-foreground hover:bg-ui-surface-muted focus-visible:ring-ui-focus disabled:border-ui-border disabled:bg-ui-surface disabled:text-foreground disabled:opacity-60',
  ghost:
    'border border-transparent bg-transparent text-foreground hover:bg-ui-surface-muted hover:text-foreground focus-visible:ring-ui-focus disabled:text-foreground disabled:opacity-60',
  destructive:
    'border border-transparent bg-ui-danger text-ui-danger-text hover:bg-ui-danger-hover active:bg-ui-danger-active focus-visible:ring-ui-focus disabled:border-ui-border disabled:bg-ui-surface-muted disabled:text-foreground disabled:opacity-60',
}

export function Button({
  className,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  )
}
