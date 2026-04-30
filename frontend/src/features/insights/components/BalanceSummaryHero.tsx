import type { ReactElement } from 'react'
import { Badge } from '../../../shared/components/Badge'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { formatCurrency } from '../../../shared/lib/formatCurrency'

interface BalanceSummaryHeroProps {
  currentBalance: number
  previousBalance: number
  periodLabel: string
  accountCount: number
  totalIncome: number
  totalSpent: number
  isLoading: boolean
}

export function BalanceSummaryHero({
  currentBalance,
  previousBalance,
  periodLabel,
  accountCount,
  totalIncome,
  totalSpent,
  isLoading,
}: BalanceSummaryHeroProps): ReactElement {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-ui-surface border border-ui-border p-6 space-y-4 animate-pulse">
        <div className="h-3 w-32 rounded bg-ui-border-subtle" />
        <div className="h-10 w-56 rounded bg-ui-border-subtle" />
        <div className="h-7 w-28 rounded-full bg-ui-border-subtle" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-ui-border-subtle" />
          ))}
        </div>
      </div>
    )
  }

  const diff = currentBalance - previousBalance
  const percentage = previousBalance !== 0 ? (diff / Math.abs(previousBalance)) * 100 : 0
  const isPositive = diff >= 0

  return (
    <div className="rounded-2xl bg-ui-surface border border-ui-border p-6 space-y-4 bg-gradient-to-br from-ui-surface to-ui-surface-muted">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Balance Summary
      </p>

      <div className="space-y-3">
        <p className="text-4xl font-bold tracking-tight text-foreground leading-none">
          {formatCurrency(currentBalance).replace('PHP', '').trim()}
          <span className="ml-1.5 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            PHP
          </span>
        </p>

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

      <div className="grid grid-cols-3 gap-3">
        <HeroStat
          label={`Income for ${periodLabel}`}
          value={formatCurrency(totalIncome)}
          colorClass="text-success"
        />
        <HeroStat
          label={`Spent for ${periodLabel}`}
          value={formatCurrency(totalSpent)}
          colorClass="text-error"
        />
        <HeroStat label="Accounts" value={String(accountCount)} colorClass="text-foreground" />
      </div>
    </div>
  )
}

function HeroStat({
  label,
  value,
  colorClass,
}: {
  label: string
  value: string
  colorClass: string
}) {
  return (
    <div className="rounded-xl bg-ui-surface-muted p-3 text-center">
      <p className="text-xs text-muted-foreground leading-snug mb-1.5">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${colorClass}`}>{value}</p>
    </div>
  )
}
