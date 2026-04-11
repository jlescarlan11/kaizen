import { type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import type { PaymentMethodSummary } from '../../payment-methods/api'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'

interface CompactAccountListProps {
  summaries: PaymentMethodSummary[]
  isLoading: boolean
}

export function CompactAccountList({
  summaries,
  isLoading,
}: CompactAccountListProps): ReactElement {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-ui-surface-muted" />
        ))}
      </div>
    )
  }

  const sortedSummaries = [...summaries].sort((a, b) => b.totalAmount - a.totalAmount)

  const handleAccountClick = (paymentMethodId?: number) => {
    if (paymentMethodId) {
      navigate(`/transactions?paymentMethod=${paymentMethodId}`)
    } else {
      navigate('/transactions')
    }
  }

  return (
    <div className="bg-ui-surface rounded-2xl border border-ui-border-subtle overflow-hidden shadow-sm divide-y divide-ui-border-subtle/30">
      {sortedSummaries.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-8 text-center">
          No account data available.
        </p>
      ) : (
        sortedSummaries.map((s) => (
          <div
            key={s.paymentMethod?.id ?? 'unknown'}
            onClick={() => handleAccountClick(s.paymentMethod?.id)}
            className="group flex items-center justify-between p-4 hover:bg-ui-surface-muted/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ui-surface-muted text-foreground font-black text-xs shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {(s.paymentMethod?.name ?? 'U').charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {s.paymentMethod?.name ?? 'Unknown'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground leading-none">
                    Asset
                  </p>
                  <div className="h-3 w-px bg-ui-border-subtle" />
                  <div className="w-12 h-3 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={s.last7Days} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <div className="text-right">
                <p className="text-sm font-black text-foreground tabular-nums leading-none">
                  {formatCurrency(s.totalAmount).replace('PHP', '').trim()}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase text-right mt-1">
                  PHP
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null

  const chartData = data.map((val, i) => ({ value: val, index: i }))
  const isPositive = data[data.length - 1] >= data[0]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <YAxis hide domain={['auto', 'auto']} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={isPositive ? 'var(--color-income)' : 'var(--color-expense)'}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
