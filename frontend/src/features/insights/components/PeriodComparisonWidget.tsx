import type { ReactElement } from 'react'
import { Card } from '../../../shared/components/Card'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { Badge } from '../../../shared/components/Badge'

interface PeriodComparisonWidgetProps {
  currentBalance: number
  previousBalance: number
  isLoading: boolean
}

export function PeriodComparisonWidget({
  currentBalance,
  previousBalance,
  isLoading,
}: PeriodComparisonWidgetProps): ReactElement {
  if (isLoading) {
    return <div className="h-48 rounded-2xl bg-black/5 animate-pulse" />
  }

  const diff = currentBalance - previousBalance
  const percentage = previousBalance !== 0 ? (diff / Math.abs(previousBalance)) * 100 : 0
  const isPositive = diff >= 0

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">Period Comparison</h3>
        <p className="text-xs text-muted-foreground">Month-over-month trend</p>
      </div>

      <div className="flex flex-col items-center justify-center py-4 space-y-3">
        <Badge
          tone={isPositive ? 'success' : 'error'}
          emphasis="soft"
          className="px-4 py-1.5 gap-2"
        >
          <SharedIcon type="ui" name={isPositive ? 'income' : 'expense'} size={16} />
          <span className="font-bold text-sm">{Math.abs(percentage).toFixed(1)}%</span>
        </Badge>

        <div className="text-center">
          <p className="text-2xl font-black text-foreground">
            {formatCurrency(Math.abs(diff)).replace('PHP', '').trim()}
            <span className="ml-1 text-xs font-normal uppercase">PHP</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {isPositive ? 'Increase' : 'Decrease'} from last month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-ui-border-subtle">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Current
          </p>
          <p className="text-sm font-bold">
            {formatCurrency(currentBalance).replace('PHP', '').trim()}
          </p>
        </div>
        <div className="space-y-0.5 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Previous
          </p>
          <p className="text-sm font-bold text-muted-foreground/70">
            {formatCurrency(previousBalance).replace('PHP', '').trim()}
          </p>
        </div>
      </div>
    </Card>
  )
}
