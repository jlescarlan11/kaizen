import type { HTMLAttributes, ReactElement, ReactNode, ForwardedRef } from 'react'
import { forwardRef } from 'react'
import { cn } from '../lib/cn'

type CardVariant = 'neutral' | 'accent' | 'success' | 'error' | 'warning' | 'info'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: CardVariant
  title?: ReactNode
  titleLevel?: 'h2' | 'h3' | 'h4'
  extra?: ReactNode
}

const variantStyles: Record<CardVariant, string> = {
  neutral: 'border-border-subtle bg-white text-text-primary shadow-sm',
  accent: 'border-primary/20 bg-primary/5 text-text-primary',
  success: 'border-success/20 bg-success/5 text-text-primary',
  error: 'border-error/20 bg-error/5 text-text-primary',
  warning: 'border-warning/20 bg-warning/5 text-text-primary',
  info: 'border-info/20 bg-info/5 text-text-primary',
}

const titleClass = 'text-[11px] font-semibold tracking-widest text-text-secondary uppercase'

export const Card = forwardRef(function Card(
  {
    children,
    className,
    variant = 'neutral',
    title,
    titleLevel = 'h3',
    extra,
    ...props
  }: CardProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const TitleTag = titleLevel
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border p-4 md:p-5 transition-all',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {title || extra ? (
        <div className="flex items-center justify-between mb-4 gap-4 min-w-0">
          {title ? <TitleTag className={titleClass}>{title}</TitleTag> : <div />}
          {extra ? <div className="shrink-0">{extra}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  )
})
