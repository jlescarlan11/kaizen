import type { ReactElement } from 'react'
import { Button } from '../../shared/components/Button'
import { BUDGETS_EMPTY_BUTTON, BUDGETS_EMPTY_MESSAGE } from './emptyStateCopy'

interface BudgetsEmptyStateProps {
  onQuickSetup: () => void
}

export function BudgetsEmptyState({ onQuickSetup }: BudgetsEmptyStateProps): ReactElement {
  return (
    <div className="space-y-3 p-6 border border-dashed border-ui-border-subtle rounded-xl bg-transparent">
      <div>
        <p className="text-base font-semibold text-foreground">{BUDGETS_EMPTY_MESSAGE}</p>
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          onClick={onQuickSetup}
          className="text-sm font-medium"
        >
          {BUDGETS_EMPTY_BUTTON}
        </Button>
      </div>
    </div>
  )
}
