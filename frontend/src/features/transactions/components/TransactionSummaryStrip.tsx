// frontend/src/features/transactions/components/TransactionSummaryStrip.tsx
import type { ReactElement } from 'react'
import { cn } from '../../../shared/lib/cn'
import { phpCurrencyFormatter } from '../../../shared/lib/formatCurrency'

interface TransactionSummaryStripProps {
  incoming: number
  outgoing: number
  net: number
}

interface StatColProps {
  label: string
  value: number
  colorClass: string
  dotColor?: string
  showSign?: boolean
}

function StatCol({ label, value, colorClass, dotColor, showSign = false }: StatColProps) {
  const formatted = phpCurrencyFormatter.format(Math.abs(value)).replace('PHP', '').trim()
  const sign = showSign ? (value >= 0 ? '+' : '−') : ''

  return (
    <div className="flex-1 px-5 py-4 border-r border-border-subtle last:border-r-0">
      <div className="flex items-center gap-1.5 mb-2">
        {dotColor && <span className={cn('h-1.5 w-1.5 rounded-full inline-block', dotColor)} />}
        <span className="text-3xs font-bold uppercase tracking-widest text-text-secondary">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-semibold text-text-secondary opacity-50">PHP</span>
        <span className={cn('text-xl font-extrabold tracking-tight leading-none', colorClass)}>
          {sign}
          {formatted}
        </span>
      </div>
    </div>
  )
}

export function TransactionSummaryStrip({
  incoming,
  outgoing,
  net,
}: TransactionSummaryStripProps): ReactElement {
  return (
    <div className="flex bg-surface border border-border-subtle rounded-card overflow-hidden">
      <StatCol label="Income" value={incoming} colorClass="text-success" dotColor="bg-success" />
      <StatCol label="Expenses" value={outgoing} colorClass="text-error" dotColor="bg-error" />
      <StatCol label="Net" value={net} colorClass="text-text-primary" showSign />
    </div>
  )
}
