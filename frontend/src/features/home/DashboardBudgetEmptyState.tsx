import type { ReactElement } from 'react'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'

const EMPTY_STATE_COPY =
  'You skipped budget setup earlier. When you are ready, you can revisit the suggested flow to build your first budgets.' // PRD Section 4, Story 15: copy is inferred and requires UX review before finalizing.

interface DashboardBudgetEmptyStateProps {
  onLaunchSetup?: () => void
}

export function DashboardBudgetEmptyState({
  onLaunchSetup,
}: DashboardBudgetEmptyStateProps): ReactElement {
  return (
    <Card className="space-y-4 border border-ui-border-subtle p-6">
      <div className="space-y-2">
        <p className="text-base font-semibold text-foreground">No budgets yet</p>
        <p className="text-sm text-muted-foreground">{EMPTY_STATE_COPY}</p>
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          onClick={onLaunchSetup}
          disabled={!onLaunchSetup}
          className="text-sm font-medium"
        >
          Set up budgets
        </Button>
      </div>
      {/* Instruction 7 mount point: connect the actual deferred setup entry point here once the Budgets tab flow is finalized. */}
    </Card>
  )
}
