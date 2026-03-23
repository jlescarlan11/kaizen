import type { ReactElement } from 'react'

/**
 * Placeholder goals empty state reserved for future work.
 * PRD Section 8 defers this sprint; PRD Open Question 6 must be answered before the final copy is added.
 */
export function GoalsEmptyStatePlaceholder(): ReactElement {
  return (
    <div className="space-y-2" data-testid="goals-empty-placeholder">
      <p className="text-sm font-semibold text-muted-foreground">Goals empty state pending</p>
      <p className="text-xs text-subtle-foreground">
        See PRD Open Question 6 for the final experience.
      </p>
    </div>
  )
}
