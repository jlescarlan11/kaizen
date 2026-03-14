import type { HTMLAttributes, ReactElement } from 'react'
import { cn } from '../lib/cn'

type CardTone = 'neutral' | 'accent' | 'success' | 'error' | 'warning' | 'info'

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
}

export function Card({ children, className, tone = 'neutral', ...props }: CardProps): ReactElement {
  return (
    <div className={cn('rounded-xl border p-6', toneStyles[tone], className)} {...props}>
      {children}
    </div>
  )
}
