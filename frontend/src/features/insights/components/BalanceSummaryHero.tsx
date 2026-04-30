import type { ReactElement } from 'react'
import { Badge } from '../../../shared/components/Badge'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { formatCurrency } from '../../../shared/lib/formatCurrency'

interface BalanceSummaryHeroProps {
  currentBalance: number
  previousBalance: number
  isLoading: boolean
}

export function BalanceSummaryHero({
  currentBalance,
  previousBalance,
  isLoading,
}: BalanceSummaryHeroProps): ReactElement {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-3 w-32 rounded bg-ui-border-subtle animate-pulse" />
        <div className="h-12 w-72 rounded bg-ui-border-subtle animate-pulse" />
        <div className="h-7 w-28 rounded-full bg-ui-border-subtle animate-pulse" />
      </div>
    )
  }

  const diff = currentBalance - previousBalance
  const percentage = previousBalance !== 0 ? (diff / Math.abs(previousBalance)) * 100 : 0
  const isPositive = diff >= 0

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Balance Summary
      </p>

      <div className="flex items-baseline gap-2" aria-hidden="true">
        <span className="text-lg font-semibold text-muted-foreground">PHP</span>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          {formatCurrency(currentBalance).replace('PHP', '').trim()}
        </h1>
      </div>

      <Badge
        variant={isPositive ? 'success' : 'error'}
        emphasis="soft"
        className="px-3 py-1 gap-1.5"
      >
        <SharedIcon type="ui" name={isPositive ? 'income' : 'expense'} size={14} />
        <span className="font-semibold text-xs">{Math.abs(percentage).toFixed(1)}%</span>
        <span className="text-xs font-medium text-muted-foreground">
          {isPositive ? 'increase' : 'decrease'} from prior period
        </span>
      </Badge>
    </div>
  )
}
