import type { ReactElement } from 'react'

interface ChartSkeletonProps {
  variant: 'pie' | 'bar' | 'line'
  className?: string
}

export function ChartSkeleton({ variant, className }: ChartSkeletonProps): ReactElement {
  return (
    <div className={`animate-pulse flex items-center justify-center w-full ${className ?? ''}`}>
      {variant === 'pie' && (
        <div className="relative w-40 h-40">
          <div className="w-full h-full rounded-full bg-ui-border-subtle" />
          <div className="absolute inset-6 rounded-full bg-background" />
        </div>
      )}
      {variant === 'bar' && (
        <div className="flex items-end gap-2 w-full h-36 px-4">
          {[0.6, 0.9, 0.4, 0.75, 0.55, 0.85].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-ui-border-subtle"
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
      )}
      {variant === 'line' && (
        <div className="w-full h-36 flex flex-col gap-3 px-4 pt-4">
          <div className="h-2 w-full rounded bg-ui-border-subtle" />
          <div className="h-2 w-5/6 rounded bg-ui-border-subtle" />
          <div className="h-2 w-4/6 rounded bg-ui-border-subtle" />
          <div className="h-2 w-full rounded bg-ui-border-subtle" />
          <div className="h-2 w-3/4 rounded bg-ui-border-subtle" />
        </div>
      )}
    </div>
  )
}
