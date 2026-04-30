import React from 'react'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { cn } from '../../../shared/lib/cn'

export interface MoneyFlowDisplayProps {
  incoming: number
  outgoing: number
  ratio: number
}

export const MoneyFlowDisplay: React.FC<MoneyFlowDisplayProps> = ({
  incoming,
  outgoing,
  ratio,
}) => {
  const percentage = Math.min(Math.max(ratio * 100, 0), 100)

  if (incoming === 0 && outgoing === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4 italic">
        No transactions this period
      </p>
    )
  }

  return (
    <div className="space-y-4" data-testid="money-flow-display">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Income
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">PHP</span>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {formatCurrency(incoming).replace('PHP', '').trim()}
            </p>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Expense
          </p>
          <div className="flex items-baseline justify-end gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">PHP</span>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {formatCurrency(outgoing).replace('PHP', '').trim()}
            </p>
          </div>
        </div>
      </div>
      <div className="h-2 w-full bg-ui-border-subtle/40 rounded-full overflow-hidden">
        <div
          data-testid="money-flow-progress"
          className={cn(
            'h-full transition-all duration-700 ease-out',
            percentage > 90 ? 'bg-ui-danger' : percentage > 75 ? 'bg-ui-warning' : 'bg-ui-action',
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
