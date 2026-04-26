import type { HTMLAttributes, ReactElement, ReactNode, ForwardedRef } from 'react'
import { forwardRef } from 'react'
import { cn } from '../lib/cn'

type CardTone = 'neutral' | 'accent' | 'success' | 'error' | 'warning' | 'info'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: CardTone
  title?: ReactNode
}

const toneStyles: Record<CardTone, string> = {
  neutral: 'border-ui-border-subtle bg-transparent text-foreground shadow-none',
  accent: 'border-ui-border bg-ui-accent-subtle text-foreground',
  success: 'border-ui-border bg-ui-success-subtle text-foreground',
  error: 'border-ui-border bg-ui-danger-subtle text-foreground',
  warning: 'border-ui-border bg-ui-warning-subtle text-foreground',
  info: 'border-ui-border bg-ui-info-subtle text-foreground',
}

export const Card = forwardRef(function Card(
  { children, className, tone = 'neutral', title, ...props }: CardProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  return (
    <div ref={ref} className={cn('rounded-xl border p-6', toneStyles[tone], className)} {...props}>
      {title ? (
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground mb-4">
          {title}
        </h3>
      ) : null}
      {children}
    </div>
  )
})
