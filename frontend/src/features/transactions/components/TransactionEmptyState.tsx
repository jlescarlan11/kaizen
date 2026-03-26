import type { ReactElement } from 'react'
import { Card } from '../../../shared/components/Card'
import { Button } from '../../../shared/components/Button'

interface TransactionEmptyStateProps {
  isSearchActive: boolean
  isFilterActive: boolean
  onClearSearch: () => void
  onClearFilter: () => void
  onClearAll: () => void
}

export function TransactionEmptyState({
  isSearchActive,
  isFilterActive,
  onClearSearch,
  onClearFilter,
  onClearAll,
}: TransactionEmptyStateProps): ReactElement {
  let title = 'No transactions recorded yet'
  let description = 'Start by adding your first transaction to track your spending.'

  if (isSearchActive && isFilterActive) {
    title = 'No matches found'
    description = "We couldn't find any transactions matching your current search and filters."
  } else if (isSearchActive) {
    title = 'No search results'
    description = 'No transactions match your search query. Try a different keyword.'
  } else if (isFilterActive) {
    title = 'No transactions found'
    description = 'No transactions match your selected filters. Try adjusting your criteria.'
  }

  return (
    <Card className="p-16 text-center border border-ui-border-subtle shadow-sm flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="h-16 w-16 bg-ui-surface-muted rounded-full flex items-center justify-center text-muted-foreground mb-2">
        <EmptyIcon />
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>

      {(isSearchActive || isFilterActive) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {isSearchActive && isFilterActive && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear all
            </Button>
          )}
          {isSearchActive && (
            <Button variant="outline" size="sm" onClick={onClearSearch}>
              Clear search
            </Button>
          )}
          {isFilterActive && (
            <Button variant="outline" size="sm" onClick={onClearFilter}>
              Clear filters
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

function EmptyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
      <path d="M8 8l6 6" />
      <path d="M14 8l-6 6" />
    </svg>
  )
}
