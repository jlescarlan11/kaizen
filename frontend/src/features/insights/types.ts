export interface SpendingSummary {
  totalIncome: number
  totalExpenses: number
  netBalance: number
}

export interface CategoryEntry {
  categoryId: number | null
  categoryName: string
  total: number
  transactionCount: number
  percentage: number
}

export interface CategoryBreakdown {
  categories: CategoryEntry[]
}

export interface TrendEntry {
  periodStart: string
  total: number
}

export interface TrendSeries {
  series: TrendEntry[]
}

export interface BalanceTrendEntry {
  periodStart: string
  income: number
  expenses: number
  netBalance: number
}

export interface BalanceTrendSeries {
  series: BalanceTrendEntry[]
}

export type Granularity = 'DAILY' | 'WEEKLY' | 'MONTHLY'

export type PeriodOption = 'CURRENT_MONTH' | 'LAST_3_MONTHS' | 'YTD'

export interface DateRange {
  start: string
  end: string
}

export interface BalanceSummaryState {
  selectedAccountIds: number[]
  granularity: Granularity
}
