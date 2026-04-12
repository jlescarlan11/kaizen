import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

interface DataListProps<T> {
  data: T[]
  renderItem: (item: T, index: number) => ReactNode
  emptyState?: ReactNode
  className?: string
  hideBorders?: boolean
}

/**
 * A generic list component that renders items with horizontal separators.
 * Adheres to the "Flat Out" design principle with clean borders.
 */
export function DataList<T>({
  data,
  renderItem,
  emptyState,
  className = '',
  hideBorders = false,
}: DataListProps<T>) {
  if (data.length === 0) {
    return emptyState ? <div className={className}>{emptyState}</div> : null
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {data.map((item, index) => (
        <div
          key={index}
          className={cn(!hideBorders && index !== 0 && 'border-t border-ui-border-subtle')}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}
