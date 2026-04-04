import type { ReactElement } from 'react'
import { Card } from '../../../shared/components/Card'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import type { PaymentMethodSummary } from '../../payment-methods/api'

interface AccountBreakdownWidgetProps {
  summaries: PaymentMethodSummary[]
  isLoading: boolean
}

export function AccountBreakdownWidget({
  summaries,
  isLoading,
}: AccountBreakdownWidgetProps): ReactElement {
  if (isLoading) {
    return <div className="h-48 rounded-2xl bg-black/5 animate-pulse" />
  }

  const sortedSummaries = [...summaries].sort((a, b) => b.totalAmount - a.totalAmount)
  const total = sortedSummaries.reduce((acc, s) => acc + s.totalAmount, 0)

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">Account Breakdown</h3>
        <p className="text-xs text-muted-foreground">Distribution across accounts</p>
      </div>

      <div className="space-y-4">
        {sortedSummaries.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">No account data available.</p>
        ) : (
          sortedSummaries.map((s) => {
            const percentage = total > 0 ? (s.totalAmount / total) * 100 : 0
            return (
              <div key={s.paymentMethod?.id ?? 'unknown'} className="space-y-1.5">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="font-medium text-foreground/80 truncate pr-2">
                    {s.paymentMethod?.name ?? 'Unknown'}
                  </span>
                  <span className="font-bold whitespace-nowrap">
                    {formatCurrency(s.totalAmount).replace('PHP', '').trim()}
                    <span className="ml-1 text-[10px] text-muted-foreground font-normal">PHP</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      {sortedSummaries.length > 0 && (
        <div className="pt-3 border-t border-ui-border-subtle flex justify-between items-baseline">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Total Assets
          </span>
          <span className="text-lg font-black text-foreground">
            {formatCurrency(total).replace('PHP', '').trim()}
            <span className="ml-1 text-[10px] text-muted-foreground font-normal uppercase">PHP</span>
          </span>
        </div>
      )}
    </Card>
  )
}
