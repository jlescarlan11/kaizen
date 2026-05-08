import React from 'react'
import { useIntelligence } from '../hooks/useIntelligence'
import { SharedIcon } from '../../../shared/components/IconRegistry'

export const FinancialIntelligenceCard: React.FC = () => {
  const { intelligence, isLoading } = useIntelligence()

  if (isLoading || !intelligence) {
    return (
      <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm animate-pulse flex flex-col gap-3">
        <div className="h-3 w-28 bg-surface-secondary rounded" />
        <div className="h-20 bg-surface-secondary rounded-xl" />
        <div className="h-20 bg-surface-secondary rounded-xl" />
      </div>
    )
  }

  const { runway, dailyLimit, remainingBudget, totalLiquidity } = intelligence

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SharedIcon type="ui" name="refresh" size={14} className="text-primary" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            Financial Intelligence
          </p>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
      </div>

      <div className="grid grid-cols-1 gap-3 flex-grow">
        <div className="p-4 rounded-xl bg-surface-secondary/60 border border-border-subtle">
          <p className="text-[10px] font-medium text-text-tertiary/60 mb-1">Financial Runway</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text-primary tabular-nums">{runway}</span>
            <span className="text-[10px] font-medium text-text-secondary">months</span>
          </div>
          <p className="text-[10px] text-text-tertiary/60 mt-0.5">Based on avg. spending</p>
        </div>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-[10px] font-medium text-primary/70 mb-1">Safe Daily Limit</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text-primary tabular-nums">${dailyLimit}</span>
            <span className="text-[10px] font-medium text-text-secondary">/ day</span>
          </div>
          <p className="text-[10px] text-text-tertiary/60 mt-0.5">To stay under monthly budget</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-medium text-text-tertiary/60 mb-0.5">Liquidity</p>
          <p className="text-xs font-semibold text-text-primary tabular-nums">
            ${totalLiquidity.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium text-text-tertiary/60 mb-0.5">Left in Budget</p>
          <p className="text-xs font-semibold text-text-primary tabular-nums">
            ${remainingBudget.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
