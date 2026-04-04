import type { ReactElement } from 'react'
import { Card } from '../../../shared/components/Card'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import type { SpendingSummary } from '../types'

interface IncomeVsExpenseWidgetProps {
  summary: SpendingSummary | undefined
  isLoading: boolean
}

export function IncomeVsExpenseWidget({
  summary,
  isLoading,
}: IncomeVsExpenseWidgetProps): ReactElement {
  if (isLoading || !summary) {
    return <div className="h-48 rounded-2xl bg-black/5 animate-pulse" />
  }

  const { totalIncome, totalExpenses, netBalance } = summary
  const totalFlow = totalIncome + totalExpenses
  const incomePercentage = totalFlow > 0 ? (totalIncome / totalFlow) * 100 : 0
  const expensePercentage = totalFlow > 0 ? (totalExpenses / totalFlow) * 100 : 0

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">Income vs Expenses</h3>
        <p className="text-xs text-muted-foreground">Monthly cash flow</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline text-sm">
            <span className="font-medium text-income">Income</span>
            <span className="font-bold text-income">
              +{formatCurrency(totalIncome).replace('PHP', '').trim()}
              <span className="ml-1 text-[10px] font-normal uppercase">PHP</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-income transition-all duration-700 ease-out"
              style={{ width: `${incomePercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline text-sm">
            <span className="font-medium text-expense">Expenses</span>
            <span className="font-bold text-expense">
              -{formatCurrency(totalExpenses).replace('PHP', '').trim()}
              <span className="ml-1 text-[10px] font-normal uppercase">PHP</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-expense transition-all duration-700 ease-out"
              style={{ width: `${expensePercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-ui-border-subtle flex justify-between items-baseline">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Net Flow
        </span>
        <span
          className={`text-lg font-black ${netBalance >= 0 ? 'text-income' : 'text-expense'}`}
        >
          {netBalance >= 0 ? '+' : ''}
          {formatCurrency(netBalance).replace('PHP', '').trim()}
          <span className="ml-1 text-[10px] font-normal uppercase">PHP</span>
        </span>
      </div>
    </Card>
  )
}
