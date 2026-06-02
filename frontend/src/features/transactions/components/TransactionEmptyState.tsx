import type { ReactElement } from 'react'
import { Button } from '../../../shared/components/Button'
import { SharedIcon } from '../../../shared/components/IconRegistry'

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
    <div className="p-16 text-center border border-dashed border-border-subtle rounded-2xl flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="h-16 w-16 bg-surface-secondary/50 rounded-full flex items-center justify-center text-text-secondary mb-2">
        {isSearchActive ? (
          <SharedIcon type="ui" name="search" size={32} strokeWidth={2} />
        ) : isFilterActive ? (
          <SharedIcon type="ui" name="filter" size={32} strokeWidth={2} />
        ) : (
          <SharedIcon type="ui" name="receipt" size={32} strokeWidth={2} />
        )}
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
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
    </div>
  )
}
