import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
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
  const navigate = useNavigate()

  if (isLoading) {
    return <div className="h-48 rounded-2xl bg-black/5 animate-pulse" />
  }

  const sortedSummaries = [...summaries].sort((a, b) => b.totalAmount - a.totalAmount)
  const total = sortedSummaries.reduce((acc, s) => acc + s.totalAmount, 0)

  const handleAccountClick = (paymentMethodId?: number) => {
    if (paymentMethodId) {
      navigate(`/transactions?paymentMethod=${paymentMethodId}`)
    } else {
      navigate('/transactions')
    }
  }

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
            return (
              <div
                key={s.paymentMethod?.id ?? 'unknown'}
                onClick={() => handleAccountClick(s.paymentMethod?.id)}
                className="flex justify-between items-baseline py-1.5 group cursor-pointer hover:bg-ui-surface-muted/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-sm font-medium text-foreground/80 truncate group-hover:text-primary transition-colors">
                    {s.paymentMethod?.name ?? 'Unknown'}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                </div>
                <span className="font-bold whitespace-nowrap text-sm group-hover:text-foreground">
                  {formatCurrency(s.totalAmount).replace('PHP', '').trim()}
                  <span className="ml-1 text-[10px] text-muted-foreground font-normal">PHP</span>
                </span>
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
