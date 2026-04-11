import { type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card } from '../../../shared/components/Card'
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 w-full animate-pulse rounded-xl bg-ui-surface-muted" />
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sortedSummaries.length === 0 ? (
        <p className="col-span-full text-sm text-muted-foreground italic py-4 text-center">
          No account data available.
        </p>
      ) : (
        sortedSummaries.map((s) => (
          <Card
            key={s.paymentMethod?.id ?? 'unknown'}
            onClick={() => handleAccountClick(s.paymentMethod?.id)}
            className="group flex flex-col justify-between border border-ui-border-subtle p-4 shadow-sm hover:border-primary/50 transition-all cursor-pointer bg-ui-surface"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ui-surface-muted text-foreground font-black text-xs">
                  {(s.paymentMethod?.name ?? 'U').charAt(0).toUpperCase()}
                </div>
                <p className="font-bold text-sm text-foreground truncate max-w-[120px]">
                  {s.paymentMethod?.name ?? 'Unknown'}
                </p>
              </div>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none mb-1">
                  Balance
                </p>
                <p className="text-lg font-black text-foreground tabular-nums leading-none">
                  {formatCurrency(s.totalAmount).replace('PHP', '').trim()}
                  <span className="ml-1 text-[10px] text-muted-foreground font-normal">PHP</span>
                </p>
              </div>
              <div className="w-16 h-6 mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <Sparkline data={s.last7Days} />
              </div>
            </div>
          </Card>
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
