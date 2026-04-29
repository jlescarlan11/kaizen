import type { HTMLAttributes, ReactElement, ReactNode, ForwardedRef } from 'react'
import { forwardRef } from 'react'
import { cn } from '../lib/cn'

type CardVariant = 'neutral' | 'accent' | 'success' | 'error' | 'warning' | 'info'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: CardVariant
  title?: ReactNode
  titleLevel?: 'h2' | 'h3' | 'h4'
}

const variantStyles: Record<CardVariant, string> = {
  neutral: 'border-ui-border-subtle bg-transparent text-foreground shadow-none',
  accent: 'border-ui-border bg-ui-accent-subtle text-foreground',
  success: 'border-ui-border bg-ui-success-subtle text-foreground',
  error: 'border-ui-border bg-ui-danger-subtle text-foreground',
  warning: 'border-ui-border bg-ui-warning-subtle text-foreground',
  info: 'border-ui-border bg-ui-info-subtle text-foreground',
}

const titleClass =
  'text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground mb-4'

export const Card = forwardRef(function Card(
  { children, className, variant = 'neutral', title, titleLevel = 'h3', ...props }: CardProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const TitleTag = titleLevel
  return (
    <div
      ref={ref}
      className={cn('rounded-xl border p-6', variantStyles[variant], className)}
      {...props}
    >
      {title ? <TitleTag className={titleClass}>{title}</TitleTag> : null}
      {children}
    </div>
  )
})
