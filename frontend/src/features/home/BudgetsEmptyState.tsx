import type { ReactElement } from 'react'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { BUDGETS_EMPTY_BUTTON, BUDGETS_EMPTY_MESSAGE } from './emptyStateCopy'

interface BudgetsEmptyStateProps {
  onQuickSetup: () => void
}

export function BudgetsEmptyState({ onQuickSetup }: BudgetsEmptyStateProps): ReactElement {
  return (
    <Card tone="flat" className="space-y-3 p-6">
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
    </Card>
  )
}
