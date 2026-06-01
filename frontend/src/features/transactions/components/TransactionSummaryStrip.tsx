import type { ReactElement } from 'react'
import { cn } from '../../../shared/lib/cn'
import { phpCurrencyFormatter } from '../../../shared/lib/formatCurrency'

interface TransactionSummaryStripProps {
  incoming: number
  outgoing: number
}

interface StatColProps {
  label: string
  value: number
  colorClass: string
  dotColor?: string
  sign?: string
}

function StatCol({ label, value, colorClass, dotColor, sign = '' }: StatColProps) {
  const formatted = phpCurrencyFormatter.format(value).replace('PHP', '').trim()

  return (
    <div className="flex-1 px-5 py-4 border-r border-border-subtle last:border-r-0">
      <div className="flex items-center gap-1.5 mb-2">
        {dotColor && <span className={cn('h-1.5 w-1.5 rounded-full inline-block', dotColor)} />}
        <span className="text-3xs font-bold uppercase tracking-widest text-text-secondary">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1" aria-label={`${label}: PHP ${formatted}`}>
        <span className="text-xs font-semibold text-text-secondary opacity-50" aria-hidden="true">
          PHP
        </span>
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
}: TransactionSummaryStripProps): ReactElement {
  const net = incoming - outgoing
  const netSign = net > 0 ? '+' : net < 0 ? '−' : ''

  return (
    <div
      className="flex bg-surface border border-border-subtle rounded-card overflow-hidden"
      aria-label="Transaction summary"
    >
      <StatCol label="Income" value={incoming} colorClass="text-success" dotColor="bg-success" />
      <StatCol label="Expenses" value={outgoing} colorClass="text-error" dotColor="bg-error" />
      <StatCol
        label="Net"
        value={Math.abs(net)}
        colorClass={net >= 0 ? 'text-success' : 'text-error'}
        sign={netSign}
      />
    </div>
  )
}
