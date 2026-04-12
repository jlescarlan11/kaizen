import type { ReactElement } from 'react'
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
    <div className="py-6 space-y-6">
      <div className="space-y-1 px-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          Cash Flow Metrics
        </h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2 px-1">
          <div className="flex justify-between items-baseline text-sm">
            <span className="font-black text-income uppercase tracking-wider text-[11px]">
              Income
            </span>
            <span className="font-black text-income text-base tabular-nums">
              +{formatCurrency(totalIncome).replace('PHP', '').trim()}
              <span className="ml-1 text-[10px] font-normal uppercase">PHP</span>
            </span>
          </div>
          <div className="w-full h-1 bg-ui-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-income transition-all duration-700 ease-out"
              style={{ width: `${incomePercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 px-1">
          <div className="flex justify-between items-baseline text-sm">
            <span className="font-black text-expense uppercase tracking-wider text-[11px]">
              Expenses
            </span>
            <span className="font-black text-expense text-base tabular-nums">
              -{formatCurrency(totalExpenses).replace('PHP', '').trim()}
              <span className="ml-1 text-[10px] font-normal uppercase">PHP</span>
            </span>
          </div>
          <div className="w-full h-1 bg-ui-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-expense transition-all duration-700 ease-out"
              style={{ width: `${expensePercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-ui-border-subtle flex justify-between items-center px-1">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          Net Flow Result
        </span>
        <div className="text-right">
          <span
            className={`text-xl font-black ${netBalance >= 0 ? 'text-income' : 'text-expense'} tabular-nums`}
          >
            {netBalance >= 0 ? '+' : ''}
            {formatCurrency(netBalance).replace('PHP', '').trim()}
          </span>
          <span className="ml-1 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
            PHP
          </span>
        </div>
      </div>
    </div>
  )
}
