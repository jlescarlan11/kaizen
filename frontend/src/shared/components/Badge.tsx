import type { HTMLAttributes, ReactElement } from 'react'
import { cn } from '../lib/cn'

type BadgeVariant = 'neutral' | 'success' | 'error' | 'warning' | 'info'
type BadgeEmphasis = 'soft' | 'solid'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  emphasis?: BadgeEmphasis
}

const badgeVariantStyles: Record<BadgeVariant, Record<BadgeEmphasis, string>> = {
  neutral: {
    soft: 'border-border-subtle bg-surface-secondary text-text-secondary',
    solid: 'border-border bg-surface text-text-primary',
  },
  success: {
    soft: 'border-transparent bg-success/10 text-success',
    solid: 'border-transparent bg-success text-white',
  },
  error: {
    soft: 'border-transparent bg-error/10 text-error',
    solid: 'border-transparent bg-error text-white',
  },
  warning: {
    soft: 'border-transparent bg-warning/10 text-warning',
    solid: 'border-transparent bg-warning text-white',
  },
  info: {
    soft: 'border-transparent bg-info/10 text-info',
    solid: 'border-transparent bg-info text-white',
  },
}

export function Badge({
  children,
  className,
  emphasis = 'soft',
  variant = 'neutral',
  ...props
}: BadgeProps): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
        badgeVariantStyles[variant][emphasis],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
