import React from 'react'
import { useIntelligence } from '../hooks/useIntelligence'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { DashboardCard, CardHeader, CardSkeleton } from '../../../shared/components'

export const FinancialIntelligenceCard: React.FC = () => {
  const { intelligence, isLoading } = useIntelligence()

  if (isLoading || !intelligence) {
    return (
      <CardSkeleton className="flex flex-col gap-3">
        <div className="h-3 w-28 bg-surface-secondary rounded" />
        <div className="h-20 bg-surface-secondary rounded-xl" />
        <div className="h-20 bg-surface-secondary rounded-xl" />
      </CardSkeleton>
    )
  }

  const { runway, dailyLimit, remainingBudget, totalLiquidity } = intelligence

  return (
    <DashboardCard className="flex flex-col group">
      <CardHeader
        icon={<SharedIcon type="ui" name="refresh" size={14} className="text-primary" />}
        title="Financial Intelligence"
        right={<div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />}
        className="mb-4"
      />

      <div className="grid grid-cols-1 gap-3 flex-grow">
        <div className="p-4 rounded-xl bg-surface-secondary/60 border border-border-subtle">
          <p className="text-3xs font-medium text-text-tertiary/60 mb-1">Financial Runway</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text-primary tabular-nums">{runway}</span>
            <span className="text-3xs font-medium text-text-secondary">months</span>
          </div>
          <p className="text-3xs text-text-tertiary/60 mt-0.5">Based on avg. spending</p>
        </div>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-3xs font-medium text-primary/70 mb-1">Safe Daily Limit</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text-primary tabular-nums">${dailyLimit}</span>
            <span className="text-3xs font-medium text-text-secondary">/ day</span>
          </div>
          <p className="text-3xs text-text-tertiary/60 mt-0.5">To stay under monthly budget</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xs font-medium text-text-tertiary/60 mb-0.5">Liquidity</p>
          <p className="text-xs font-semibold text-text-primary tabular-nums">
            ${totalLiquidity.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xs font-medium text-text-tertiary/60 mb-0.5">Left in Budget</p>
          <p className="text-xs font-semibold text-text-primary tabular-nums">
            ${remainingBudget.toLocaleString()}
          </p>
        </div>
      </div>
    </DashboardCard>
  )
}
