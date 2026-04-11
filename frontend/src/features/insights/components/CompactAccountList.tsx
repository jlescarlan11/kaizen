import { type ReactElement, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [isExpanded, setIsExpanded] = useState(true)

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
    <Card className="p-0 overflow-hidden border-ui-border-subtle bg-ui-surface/50 backdrop-blur-sm">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-ui-surface-hover transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary">Accounts</h3>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {sortedSummaries.length} active
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground leading-none mb-1">
              Total Assets
            </p>
            <p className="text-sm font-black text-foreground">
              {formatCurrency(total).replace('PHP', '').trim()}
              <span className="ml-1 text-[10px] text-muted-foreground">PHP</span>
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-ui-border-subtle divide-y divide-ui-border-subtle/50 animate-in slide-in-from-top-2 duration-200">
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                      {s.paymentMethod?.name ?? 'Unknown'}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Balance
                    </p>
                  </div>

                  <div className="hidden xs:block w-24 h-8 shrink-0">
                    <Sparkline data={s.last7Days} />
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground tabular-nums">
                      {formatCurrency(s.totalAmount).replace('PHP', '').trim()}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase text-right">
                      PHP
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
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
