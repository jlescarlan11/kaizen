import React from 'react'
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
      <div className="bg-white border border-border-subtle p-8 rounded-[2rem] text-center">
        <p className="text-sm text-text-secondary font-medium italic">
          No transactions this period
        </p>
      </div>
    )
  }

  return (
    <div
      className="bg-white border border-border-subtle p-8 md:p-10 rounded-[2.5rem] shadow-sm space-y-6"
      data-testid="money-flow-display"
    >
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
              Incoming
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-text-secondary opacity-40 italic">PHP</span>
            <p className="text-4xl font-black tracking-tighter text-text-primary">
              {incoming.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <div className="flex items-center justify-end gap-2 mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
              Outgoing
            </p>
            <div className="w-2 h-2 rounded-full bg-error" />
          </div>
          <div className="flex items-baseline justify-end gap-2">
            <span className="text-sm font-black text-text-secondary opacity-40 italic">PHP</span>
            <p className="text-4xl font-black tracking-tighter text-text-primary">
              {outgoing.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>
      <div className="h-4 w-full bg-background rounded-full overflow-hidden p-[2px]">
        <div
          data-testid="money-flow-progress"
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            percentage > 90 ? 'bg-error' : percentage > 75 ? 'bg-warning' : 'bg-primary',
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
