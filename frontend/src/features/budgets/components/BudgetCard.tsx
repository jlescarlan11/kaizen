import type { ReactElement } from 'react'
import { CategoryBadge } from '../../categories/CategoryBadge'
import { resolveCategoryDesign } from '../../categories/designSystem'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { cn } from '../../../shared/lib/cn'
import { fluidLayout } from '../../../shared/styles/layout'
import { Button } from '../../../shared/components/Button'
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
      className={cn(
        'flex items-center gap-4 px-4 py-3.5 transition-colors',
        isInvalid && 'bg-error/10 -mx-4 rounded-lg px-2',
      )}
    >
      <CategoryBadge
        icon={categoryDesign.icon}
        color={categoryDesign.color}
        size={40}
        label={`Icon for ${budget.categoryName}`}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold leading-none text-text-primary">
          {budget.categoryName}
        </p>
        <p className="mt-1 text-sm font-medium leading-none text-text-secondary tabular-nums">
          {formatCurrency(budget.amount)}{' '}
          <span className="text-xs text-text-secondary font-normal">
            / {periodLabel[budget.period]}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className={cn(fluidLayout.touchTarget, 'sm:h-9 sm:min-h-0')}
          aria-label={`Edit ${budget.categoryName} budget`}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className={cn(fluidLayout.touchTarget, 'sm:h-9 sm:min-h-0 text-error hover:!text-error')}
          aria-label={`Delete ${budget.categoryName} budget`}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
