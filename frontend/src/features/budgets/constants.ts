export interface SmartBudgetSlot {
  id: string
  percentage: number
  categoryName: string
}

export const SMART_BUDGET_SLOTS: SmartBudgetSlot[] = [
  { id: 'housing', percentage: 0.3, categoryName: 'Housing' },
  { id: 'food', percentage: 0.2, categoryName: 'Food' },
  { id: 'transport', percentage: 0.1, categoryName: 'Transport' },
  { id: 'utilities', percentage: 0.1, categoryName: 'Utilities' },
]

export const SMART_BUDGET_PERIOD = 'MONTHLY' as const
export type BudgetPeriod = typeof SMART_BUDGET_PERIOD | 'WEEKLY'

// PRD Open Question 9 flags the divisor as inferred; swap to a dynamic
// week-count calculation once the author confirms the desired approach.
export const WEEKS_PER_MONTH_DIVISOR = 4.33
