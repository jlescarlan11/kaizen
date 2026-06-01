import { type ReactElement } from 'react'
import { cn } from '../lib/cn'

export interface TabItem<T extends string> {
  key: T
  label: string
}

interface PageTabsProps<T extends string> {
  tabs: TabItem<T>[]
  activeTab: T
  onChange: (key: T) => void
  className?: string
}

export function PageTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: PageTabsProps<T>): ReactElement {
  return (
    <div className={cn('flex gap-0 border-b border-border-subtle mb-5', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
