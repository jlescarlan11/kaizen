import type { ButtonHTMLAttributes, ReactElement } from 'react'
import { cn } from '../lib/cn'

type ButtonVariant = 'primary' | 'secondary'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-text-primary hover:bg-primary-hover focus-visible:ring-primary disabled:bg-surface-secondary disabled:text-text-tertiary',
  secondary:
    'bg-surface text-text-primary hover:bg-surface-secondary focus-visible:ring-primary disabled:bg-surface disabled:text-text-tertiary',
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
