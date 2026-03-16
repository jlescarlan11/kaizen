import type { HTMLAttributes, ReactElement } from 'react'
import { cn } from '../lib/cn'

type BadgeTone = 'neutral' | 'success' | 'error' | 'warning' | 'info'
type BadgeEmphasis = 'soft' | 'solid'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  emphasis?: BadgeEmphasis
}

const badgeToneStyles: Record<BadgeTone, Record<BadgeEmphasis, string>> = {
  neutral: {
    soft: 'border-ui-border-muted bg-ui-surface-muted text-foreground',
    solid: 'border-ui-border bg-ui-surface text-foreground',
  },
  success: {
    soft: 'border-transparent bg-ui-success-subtle text-foreground',
    solid: 'border-transparent bg-ui-success text-ui-success-text',
  },
  error: {
    soft: 'border-transparent bg-ui-danger-subtle text-foreground',
    solid: 'border-transparent bg-ui-danger text-ui-danger-text',
  },
  warning: {
    soft: 'border-transparent bg-ui-warning-subtle text-foreground',
    solid: 'border-transparent bg-ui-warning text-ui-warning-text',
  },
  info: {
    soft: 'border-transparent bg-ui-info-subtle text-foreground',
    solid: 'border-transparent bg-ui-info text-ui-info-text',
  },
}

export function Badge({
  children,
  className,
  emphasis = 'soft',
  tone = 'neutral',
  ...props
}: BadgeProps): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs leading-5',
        badgeToneStyles[tone][emphasis],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
