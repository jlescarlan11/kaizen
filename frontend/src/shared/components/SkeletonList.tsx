import { type ReactElement } from 'react'
import { cn } from '../lib/cn'

interface SkeletonListProps {
  count?: number
  itemHeight?: string
  className?: string
}

/**
 * SkeletonList: A generic skeleton loader for lists.
 */
export function SkeletonList({
  count = 3,
  itemHeight = 'h-20',
  className,
}: SkeletonListProps): ReactElement {
  return (
    <div className={cn('space-y-4', className)} data-testid="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          data-testid="skeleton"
          className={cn('w-full animate-pulse rounded-2xl bg-black/5', itemHeight)}
        />
      ))}
    </div>
  )
}
