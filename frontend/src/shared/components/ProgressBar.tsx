import type { CSSProperties, HTMLAttributes, ReactElement } from 'react'
import { cn } from '../lib/cn'

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number // 0-100
  colorScheme?: 'foreground' | 'primary'
  activeClassName?: string
  activeStyle?: CSSProperties
  inactiveClassName?: string
}

export function ProgressBar({
  value,
  colorScheme = 'foreground',
  activeClassName,
  activeStyle,
  inactiveClassName = 'bg-ui-surface-muted',
  className,
  ...props
}: ProgressBarProps): ReactElement {
  const normalizedValue = Math.min(Math.max(value, 0), 100)
  const resolvedActiveClassName =
    activeClassName ?? (colorScheme === 'primary' ? 'bg-primary' : 'bg-foreground')

  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full', inactiveClassName, className)}
      role="progressbar"
      aria-valuenow={normalizedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-300', resolvedActiveClassName)}
        style={{ width: `${normalizedValue}%`, ...activeStyle }}
      />
    </div>
  )
}
