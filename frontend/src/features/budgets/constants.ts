export interface SmartBudgetSlot {
  id: string
  percentage: number
  placeholderLabel: string
}

// These placeholder labels must be replaced with the confirmed category names once PRD Open Question 1
// is resolved. Do not replace them with real names until the author supplies the approved labels.
export const SMART_BUDGET_SLOTS: SmartBudgetSlot[] = [
  { id: 'slot1', percentage: 0.3, placeholderLabel: 'CATEGORY_SLOT_1' },
  { id: 'slot2', percentage: 0.16, placeholderLabel: 'CATEGORY_SLOT_2' },
  { id: 'slot3', percentage: 0.1, placeholderLabel: 'CATEGORY_SLOT_3' },
  { id: 'slot4', percentage: 0.1, placeholderLabel: 'CATEGORY_SLOT_4' },
]

export const SMART_BUDGET_PERIOD = 'MONTHLY' as const
export type BudgetPeriod = typeof SMART_BUDGET_PERIOD | 'WEEKLY'

// PRD Open Question 9 flags the divisor as inferred; swap to a dynamic
// week-count calculation once the author confirms the desired approach.
export const WEEKS_PER_MONTH_DIVISOR = 4.33
