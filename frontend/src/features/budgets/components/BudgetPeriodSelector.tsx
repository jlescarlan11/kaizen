import type { ReactElement } from 'react'
import { typography } from '../../../shared/styles/typography'
import { SMART_BUDGET_PERIOD, WEEKS_PER_MONTH_DIVISOR } from '../constants'
import type { BudgetPeriod } from '../constants'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { cn } from '../../../shared/lib/cn'
import { fluidLayout } from '../../../shared/styles/layout'

const currencyFormatter = {
  format: (amount: number) => formatCurrency(amount),
}

interface BudgetPeriodSelectorProps {
  value: BudgetPeriod
  onChange: (period: BudgetPeriod) => void
  referenceAmount: number
}

const periodOptions: { label: string; value: BudgetPeriod }[] = [
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Weekly', value: 'WEEKLY' },
]

export function BudgetPeriodSelector({
  value,
  onChange,
  referenceAmount,
}: BudgetPeriodSelectorProps): ReactElement {
  const sanitizedReference = Number.isFinite(referenceAmount) ? Math.max(referenceAmount, 0) : 0
  const showWeeklyEquivalent = value === SMART_BUDGET_PERIOD && sanitizedReference > 0
  const weeklyEquivalent = showWeeklyEquivalent ? sanitizedReference / WEEKS_PER_MONTH_DIVISOR : 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground sm:text-foreground sm:normal-case sm:tracking-normal">
          Budget period
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          {periodOptions.map((option) => {
            const selected = option.value === value

            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'inline-flex items-center justify-center rounded-xl border px-5 transition text-sm font-bold sm:font-medium',
                  fluidLayout.touchTarget,
                  'sm:h-9 sm:min-h-0 sm:px-4 sm:py-1.5',
                  selected
                    ? 'border-ui-border bg-ui-surface text-foreground shadow-sm'
                    : 'border-ui-border-subtle bg-ui-surface-subtle text-muted-foreground',
                )}
                onClick={() => onChange(option.value)}
                aria-pressed={selected}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
      <p className={typography.caption}>Monthly resets on the 1st. Weekly resets on Monday.</p>
      {showWeeklyEquivalent ? (
        <p className={typography.caption}>
          Approx. {currencyFormatter.format(weeklyEquivalent)}/week
        </p>
      ) : null}
    </div>
  )
}
