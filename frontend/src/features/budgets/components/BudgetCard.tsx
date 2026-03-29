import type { ReactElement } from 'react'
import { CategoryBadge } from '../../categories/CategoryBadge'
import { resolveCategoryDesign } from '../../categories/designSystem'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import type { BudgetPeriod } from '../constants'
import type { PendingBudget } from '../../onboarding/onboardingSlice'

interface BudgetCardProps {
  budget: PendingBudget
  isInvalid: boolean
  onEdit: () => void
  onRemove: () => void
}

const periodLabel: Record<BudgetPeriod, string> = {
  MONTHLY: 'Monthly',
  WEEKLY: 'Weekly',
}

export function BudgetCard({ budget, isInvalid, onEdit, onRemove }: BudgetCardProps): ReactElement {
  const categoryDesign = resolveCategoryDesign(
    budget.categoryName,
    budget.categoryIcon,
    budget.categoryColor,
  )

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
        isInvalid
          ? 'border-ui-danger-bg bg-ui-danger-subtle'
          : 'border-ui-border-subtle bg-transparent'
      }`}
    >
      <CategoryBadge
        icon={categoryDesign.icon}
        color={categoryDesign.color}
        size={36}
        label={`Icon for ${budget.categoryName}`}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-none text-foreground">
          {budget.categoryName}
        </p>
        <p className="text-xs leading-5 text-muted-foreground tabular-nums">
          {formatCurrency(budget.amount)} / {periodLabel[budget.period]}
        </p>
      </div>

      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium leading-none text-muted-foreground transition-colors hover:bg-ui-surface-muted hover:text-foreground"
          aria-label={`Edit ${budget.categoryName} budget`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium leading-none text-muted-foreground transition-colors hover:bg-ui-danger-subtle hover:text-foreground"
          aria-label={`Remove ${budget.categoryName} budget`}
        >
          Remove
        </button>
      </div>
    </div>
  )
}
