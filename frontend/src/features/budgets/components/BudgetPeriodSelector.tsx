import type { ReactElement } from 'react'
import { typography } from '../../../shared/styles/typography'
import { SMART_BUDGET_PERIOD, WEEKS_PER_MONTH_DIVISOR } from '../constants'
import type { BudgetPeriod } from '../constants'

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
})

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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium leading-none text-foreground">Budget period</p>
        <div className="flex gap-2">
          {periodOptions.map((option) => {
            const selected = option.value === value

            return (
              <button
                key={option.value}
                type="button"
                className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-sm font-medium leading-none transition ${
                  selected
                    ? 'border-ui-border bg-ui-surface text-foreground'
                    : 'border-ui-border-subtle bg-ui-surface-subtle text-muted-foreground'
                }`}
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
