import type { HTMLAttributes, ReactElement, ForwardedRef } from 'react'
import { forwardRef } from 'react'
import { cn } from '../lib/cn'

type CardTone = 'neutral' | 'accent' | 'success' | 'error' | 'warning' | 'info' | 'flat'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone
}

const toneStyles: Record<CardTone, string> = {
  neutral: 'border-ui-border bg-ui-surface text-foreground shadow-sm',
  accent: 'border-ui-border bg-ui-accent-subtle text-foreground',
  success: 'border-ui-border bg-ui-success-subtle text-foreground',
  error: 'border-ui-border bg-ui-danger-subtle text-foreground',
  warning: 'border-ui-border bg-ui-warning-subtle text-foreground',
  info: 'border-ui-border bg-ui-info-subtle text-foreground',
  flat: 'border-ui-border-subtle bg-transparent text-foreground shadow-none',
}

export const Card = forwardRef(function Card(
  { children, className, tone = 'neutral', ...props }: CardProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  return (
    <div ref={ref} className={cn('rounded-xl border p-6', toneStyles[tone], className)} {...props}>
      {children}
    </div>
  )
})
