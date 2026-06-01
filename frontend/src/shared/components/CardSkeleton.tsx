import { type ReactNode } from 'react'
import { cn } from '../lib/cn'

interface CardSkeletonProps {
  children: ReactNode
  className?: string
}

export function CardSkeleton({ children, className }: CardSkeletonProps) {
  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm animate-pulse',
        className,
      )}
    >
      {children}
    </div>
  )
}
