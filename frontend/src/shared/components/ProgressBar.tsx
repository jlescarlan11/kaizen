import type { HTMLAttributes, ReactElement } from 'react'
import { cn } from '../lib/cn'

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number // 0 to 100
  segments?: number
}

export function ProgressBar({
  value,
  segments = 20,
  className,
  ...props
}: ProgressBarProps): ReactElement {
  const normalizedValue = Math.min(Math.max(value, 0), 100)
  const activeSegments = Math.round((normalizedValue / 100) * segments)

  return (
    <div
      className={cn('flex h-4 w-full gap-px overflow-hidden rounded-sm', className)}
      role="progressbar"
      aria-valuenow={normalizedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      {Array.from({ length: segments }).map((_, i) => {
        const isActive = i < activeSegments

        return (
          <div
            key={i}
            className={cn(
              'h-full flex-1 transition-colors duration-300',
              isActive ? 'bg-foreground' : 'bg-ui-surface-muted',
            )}
          />
        )
      })}
    </div>
  )
}
