import React from 'react'
import { useWealthHealth } from '../hooks/useWealthHealth'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { Money } from '../../../shared/components/Money/Money'
import { cn } from '../../../shared/lib/cn'
import { DashboardCard, CardHeader, CardSkeleton, CircleGauge } from '../../../shared/components'

export const WealthHealthCard: React.FC = () => {
  const { analytics, isLoading } = useWealthHealth()

  if (isLoading || !analytics) {
    return (
      <CardSkeleton className="h-full min-h-[300px] flex flex-col justify-between">
        <div className="h-4 w-32 bg-surface-secondary rounded" />
        <div className="flex items-center justify-center py-10">
          <div className="h-24 w-24 rounded-full border-4 border-surface-secondary" />
        </div>
      </CardSkeleton>
    )
  }

  const { savingsRate, netFlow, netFlowChange, isImproving } = analytics

  return (
    <DashboardCard className="flex flex-col h-full group">
      <CardHeader
        icon={<SharedIcon type="ui" name="target" size={14} className="text-primary" />}
        title="Wealth Health"
        titleClassName="text-3xs font-black uppercase tracking-widest text-text-primary"
        className="mb-5"
      />

      {/* Two-column layout: gauge | net flow */}
      <div className="flex items-center gap-5 flex-1">
        {/* Savings rate gauge */}
        <CircleGauge percent={savingsRate} label={`${savingsRate}%`} sublabel="Saved" />

        <div className="w-px self-stretch bg-border-subtle shrink-0" />

        {/* Net flow */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-4xs font-black uppercase tracking-widest text-text-tertiary opacity-50">
            Net Flow
          </p>
          <span
            className={cn(
              'text-2xl font-black tracking-tighter leading-none',
              netFlow >= 0 ? 'text-primary' : 'text-error',
            )}
          >
            {netFlow >= 0 ? '+' : '–'}
            <Money amount={Math.abs(netFlow)} currency="" />
          </span>
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full',
                isImproving ? 'bg-success/10 text-success' : 'bg-error/10 text-error',
              )}
            >
              <SharedIcon
                type="ui"
                name={isImproving ? 'trending-up' : 'trending-down'}
                size={10}
                strokeWidth={3}
              />
              <span className="text-4xs font-black uppercase tracking-widest">
                {Math.abs(netFlowChange)}%
              </span>
            </div>
            <span className="text-4xs font-bold text-text-tertiary opacity-40 uppercase">
              vs Last Month
            </span>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
