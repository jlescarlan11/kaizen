import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useWealthHealth } from '../hooks/useWealthHealth'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { cn } from '../../../shared/lib/cn'

export const WealthHealthCard: React.FC = () => {
  const { analytics, isLoading } = useWealthHealth()
  const navigate = useNavigate()

  if (isLoading || !analytics) {
    return (
      <div className="h-full min-h-[300px] p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm animate-pulse flex flex-col justify-between">
        <div className="h-4 w-32 bg-surface-secondary rounded" />
        <div className="flex items-center justify-center py-10">
          <div className="h-24 w-24 rounded-full border-4 border-surface-secondary" />
        </div>
      </div>
    )
  }

  const { savingsRate, netFlow, netFlowChange, isImproving } = analytics
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (savingsRate / 100) * circumference

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col h-full group">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SharedIcon type="ui" name="target" size={14} className="text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-text-primary">
            Wealth Health
          </p>
        </div>
        <span className="text-[9px] font-black text-text-tertiary uppercase tracking-wider">
          This Month
        </span>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow py-4">
        {/* Savings Rate Gauge */}
        <div className="relative flex items-center justify-center mb-6">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-surface-secondary"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              style={{ strokeDashoffset: offset }}
              strokeLinecap="round"
              fill="transparent"
              className="text-primary transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-text-primary leading-none">
              {savingsRate}%
            </span>
            <span className="text-[8px] font-bold text-text-tertiary uppercase tracking-tighter mt-0.5">
              Saved
            </span>
          </div>
        </div>

        {/* Cash Flow Status */}
        <div className="w-full text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary opacity-50">
            Net Flow
          </p>
          <div className="flex items-baseline justify-center gap-2">
            <span
              className={cn(
                'text-2xl font-black tracking-tighter',
                netFlow >= 0 ? 'text-primary' : 'text-error',
              )}
            >
              {netFlow >= 0 ? '+' : '-'}${Math.abs(netFlow).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
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
              <span className="text-[9px] font-black uppercase tracking-widest">
                {Math.abs(netFlowChange)}%
              </span>
            </div>
            <span className="text-[9px] font-bold text-text-tertiary opacity-40 uppercase">
              vs Last Month
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-border/5">
        <button
          onClick={() => navigate('/insights')}
          className="w-full text-center text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-primary transition-all"
        >
          Financial Deep Dive
        </button>
      </div>
    </div>
  )
}
