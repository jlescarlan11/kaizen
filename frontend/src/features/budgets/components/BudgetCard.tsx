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
      className={`flex items-center gap-4 px-1 py-4 transition-colors ${
        isInvalid ? 'bg-ui-danger-subtle/30 -mx-1 rounded-lg px-2' : 'bg-transparent'
      }`}
    >
      <CategoryBadge
        icon={categoryDesign.icon}
        color={categoryDesign.color}
        size={40}
        label={`Icon for ${budget.categoryName}`}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold leading-none text-foreground">
          {budget.categoryName}
        </p>
        <p className="mt-1 text-sm font-medium leading-none text-subtle-foreground tabular-nums">
          {formatCurrency(budget.amount)}{' '}
          <span className="text-xs text-muted-foreground font-normal">
            / {periodLabel[budget.period]}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg px-3 py-2 text-sm font-semibold leading-none text-muted-foreground transition-colors hover:bg-ui-surface-muted hover:text-foreground active:scale-95"
          aria-label={`Edit ${budget.categoryName} budget`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg px-3 py-2 text-sm font-semibold leading-none text-muted-foreground transition-colors hover:bg-ui-danger-subtle hover:text-danger active:scale-95"
          aria-label={`Remove ${budget.categoryName} budget`}
        >
          Remove
        </button>
      </div>
    </div>
  )
}
