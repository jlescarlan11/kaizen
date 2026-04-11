import type { BalanceTrendEntry } from '../types'

export interface Insight {
  type: 'trend' | 'anomaly' | 'success'
  message: string
}

export function generateInsights(series: BalanceTrendEntry[]): Insight[] {
  if (!series || series.length < 2) return []

  const insights: Insight[] = []
  const current = series[series.length - 1]
  const previous = series[series.length - 2]

  // 1. Detect Negative Net Balance (Anomaly)
  if (current.netBalance < 0) {
    insights.push({
      type: 'anomaly',
      message: `Negative net flow in the most recent period. Expenses exceeded income by ₱${Math.abs(current.netBalance).toLocaleString()}.`,
    })
  }

  // 2. Detect Income Change
  const incomeDiff = current.income - previous.income
  if (incomeDiff !== 0) {
    const percentage = ((incomeDiff / Math.max(previous.income, 1)) * 100).toFixed(1)
    insights.push({
      type: incomeDiff > 0 ? 'success' : 'trend',
      message: `Income ${incomeDiff > 0 ? 'increased' : 'decreased'} by ${Math.abs(Number(percentage))}% compared to the previous period.`,
    })
  }

  // 3. Detect Expense Change
  const expenseDiff = current.expenses - previous.expenses
  if (expenseDiff !== 0) {
    const percentage = ((expenseDiff / Math.max(previous.expenses, 1)) * 100).toFixed(1)
    insights.push({
      type: expenseDiff > 0 ? 'anomaly' : 'success',
      message: `Expenses ${expenseDiff > 0 ? 'rose' : 'fell'} by ${Math.abs(Number(percentage))}% compared to the previous period.`,
    })
  }

  return insights
}
