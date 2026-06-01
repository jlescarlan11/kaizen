import { useMemo } from 'react'
import { useGetPaymentMethodSummaryQuery } from '../../../app/store/api/paymentMethodApi'
import { useGetSpendingSummaryQuery } from '../../../app/store/api/insightsApi'
import { useGetBudgetSummaryQuery } from '../../../app/store/api/budgetApi'

export const useIntelligence = () => {
  const { data: accounts = [], isLoading: isLiquidityLoading } = useGetPaymentMethodSummaryQuery()
  const { data: budgetSummary, isLoading: isBudgetLoading } = useGetBudgetSummaryQuery()

  const ninetyDayRange = useMemo(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 89)
    return { start: start.toISOString(), end: end.toISOString() }
  }, [])

  const { data: longTermSpend, isLoading: isAvgLoading } =
    useGetSpendingSummaryQuery(ninetyDayRange)

  const intelligence = useMemo(() => {
    if (!budgetSummary || !longTermSpend) return null

    const totalLiquidity = accounts.reduce((acc, curr) => acc + curr.totalAmount, 0)
    const avgMonthlySpend = longTermSpend.totalExpenses / 3

    // 1. Financial Runway (Months)
    const runway = avgMonthlySpend > 0 ? totalLiquidity / avgMonthlySpend : Infinity

    // 2. Daily Spending Limit
    const now = new Date()
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysRemaining = lastDayOfMonth - now.getDate() + 1

    const remainingBudget = Math.max(0, budgetSummary.totalAllocated - budgetSummary.totalSpent)
    const dailyLimit = remainingBudget / (daysRemaining || 1)

    return {
      runway: runway === Infinity ? 0 : Number(runway.toFixed(1)),
      dailyLimit: Math.round(dailyLimit),
      remainingBudget: Math.round(remainingBudget),
      totalLiquidity: Math.round(totalLiquidity),
    }
  }, [accounts, budgetSummary, longTermSpend])

  return {
    intelligence,
    isLoading: isLiquidityLoading || isBudgetLoading || isAvgLoading,
  }
}
