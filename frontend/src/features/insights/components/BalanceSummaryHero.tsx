// frontend/src/features/insights/components/BalanceSummaryHero.tsx
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
        <div className="h-8 w-48 rounded-lg bg-ui-border-subtle animate-pulse" />
        <div className="h-12 w-72 rounded-lg bg-ui-border-subtle animate-pulse" />
        <div className="h-6 w-32 rounded-full bg-ui-border-subtle animate-pulse" />
      </div>
    )
  }

  const diff = currentBalance - previousBalance
  const percentage = previousBalance !== 0 ? (diff / Math.abs(previousBalance)) * 100 : 0
  const isPositive = diff >= 0

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Balance Summary</h1>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <p className="text-4xl font-semibold tracking-tight text-foreground leading-none">
          {formatCurrency(currentBalance).replace('PHP', '').trim()}
          <span className="ml-1.5 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            PHP
          </span>
        </p>

        <Badge
          tone={isPositive ? 'success' : 'error'}
          emphasis="soft"
          className="px-3 py-1 gap-1.5 self-end mb-0.5"
        >
          <SharedIcon type="ui" name={isPositive ? 'income' : 'expense'} size={14} />
          <span className="font-semibold text-xs">{Math.abs(percentage).toFixed(1)}%</span>
          <span className="text-xs font-medium text-muted-foreground">
            {isPositive ? 'increase' : 'decrease'} from last month
          </span>
        </Badge>
      </div>
    </div>
  )
}
