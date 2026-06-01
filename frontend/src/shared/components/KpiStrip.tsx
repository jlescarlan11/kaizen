import { type ReactElement, type ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface KpiItem {
  label: string
  value: ReactNode
  valueClassName?: string
}

interface KpiStripProps {
  items: KpiItem[]
  className?: string
}

export function KpiStrip({ items, className }: KpiStripProps): ReactElement {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-6 gap-y-3 py-3 mb-5 border-b border-border-subtle',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-0.5 min-w-[80px]">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {item.label}
          </span>
          <span className={cn('text-base font-semibold text-text-primary', item.valueClassName)}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
