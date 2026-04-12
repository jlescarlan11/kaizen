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

  // 1. Overall Period Summary
  const totalNet = series.reduce((acc, s) => acc + s.netBalance, 0)
  if (totalNet !== 0) {
    insights.push({
      type: totalNet > 0 ? 'success' : 'anomaly',
      message: `Total ${totalNet > 0 ? 'savings' : 'deficit'} for this period is ₱${Math.abs(totalNet).toLocaleString()}.`,
    })
  }

  // 2. Detect Negative Net Balance (Recent Anomaly)
  if (current.netBalance < 0) {
    insights.push({
      type: 'anomaly',
      message: `Negative net flow in the most recent period. Expenses exceeded income by ₱${Math.abs(current.netBalance).toLocaleString()}.`,
    })
  }

  // 3. Peak Expense Detection
  const maxExpense = Math.max(...series.map((s) => s.expenses))
  if (maxExpense > 0 && current.expenses === maxExpense && series.length > 3) {
    insights.push({
      type: 'anomaly',
      message: `Highest spending recorded in the most recent period (₱${maxExpense.toLocaleString()}).`,
    })
  }

  // 4. Detect Income Change (Robust)
  if (previous.income > 0) {
    const incomeDiff = current.income - previous.income
    if (Math.abs(incomeDiff) / previous.income > 0.05) {
      // Only show if > 5% change
      const percentage = ((incomeDiff / previous.income) * 100).toFixed(1)
      insights.push({
        type: incomeDiff > 0 ? 'success' : 'trend',
        message: `Income ${incomeDiff > 0 ? 'increased' : 'decreased'} by ${Math.abs(Number(percentage))}% compared to the previous period.`,
      })
    }
  } else if (current.income > 0) {
    insights.push({
      type: 'success',
      message: `New income stream detected in the most recent period (₱${current.income.toLocaleString()}).`,
    })
  }

  return insights
}
