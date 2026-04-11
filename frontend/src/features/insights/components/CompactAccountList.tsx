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
      <div className="space-y-4 py-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-2xl bg-ui-surface-muted" />
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
    <div className="py-4 space-y-1">
      {sortedSummaries.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-8 text-center">
          No account data available.
        </p>
      ) : (
        sortedSummaries.map((s) => (
          <div
            key={s.paymentMethod?.id ?? 'unknown'}
            onClick={() => handleAccountClick(s.paymentMethod?.id)}
            className="group flex items-center justify-between p-4 rounded-2xl hover:bg-ui-surface-muted transition-all cursor-pointer border border-transparent hover:border-ui-border-subtle"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-surface-muted text-foreground font-black text-xs shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-sm">
                {(s.paymentMethod?.name ?? 'U').charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {s.paymentMethod?.name ?? 'Unknown'}
                </p>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground leading-none">
                    Asset
                  </p>
                  <div className="h-2 w-px bg-ui-border-subtle" />
                  <div className="w-16 h-4 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={s.last7Days} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 ml-4">
              <div className="text-right">
                <p className="text-base font-black text-foreground tabular-nums leading-none">
                  {formatCurrency(s.totalAmount).replace('PHP', '').trim()}
                </p>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right mt-1.5">
                  PHP CURRENCY
                </p>
              </div>
              <div className="p-1 rounded-full bg-ui-surface-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <ChevronRight className="h-3 w-3" />
              </div>
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
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
