import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useWealthHealth } from '../hooks/useWealthHealth'
import { useWealthPersona } from '../hooks/useWealthPersona'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { Money } from '../../../shared/components/Money/Money'
import { cn } from '../../../shared/lib/cn'

export const WealthProfileCard: React.FC = () => {
  const { analytics, isLoading } = useWealthHealth()
  const personaData = useWealthPersona()
  const navigate = useNavigate()

  if (isLoading || !analytics) {
    return (
      <div className="h-full p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm animate-pulse flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="h-3 w-28 bg-surface-secondary rounded" />
          <div className="h-3 w-16 bg-surface-secondary rounded" />
        </div>
        <div className="flex gap-5 flex-1">
          <div className="w-20 h-20 rounded-full border-4 border-surface-secondary shrink-0" />
          <div className="w-px bg-surface-secondary" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-2 w-14 bg-surface-secondary rounded" />
            <div className="h-6 w-24 bg-surface-secondary rounded" />
            <div className="h-3 w-20 bg-surface-secondary rounded" />
          </div>
          <div className="w-px bg-surface-secondary" />
          <div className="flex gap-3 flex-1 items-center">
            <div className="w-10 h-10 rounded-2xl bg-surface-secondary shrink-0" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-24 bg-surface-secondary rounded" />
              <div className="h-3 w-32 bg-surface-secondary rounded" />
            </div>
          </div>
        </div>
        <div className="h-3 w-20 bg-surface-secondary rounded" />
      </div>
    )
  }

  const { savingsRate, netFlow, netFlowChange, isImproving } = analytics
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (savingsRate / 100) * circumference

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col h-full group relative overflow-hidden">
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 blur-3xl rounded-full opacity-50 group-hover:bg-primary/10 transition-colors duration-1000" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <SharedIcon type="ui" name="target" size={14} className="text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-text-primary">
            Wealth Profile
          </p>
        </div>
        <button
          onClick={() => navigate('/your-account/profile')}
          className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline transition-all"
        >
          Profile XP →
        </button>
      </div>

      {/* Content: [gauge + net flow] | [persona] */}
      <div className="flex items-center gap-5 flex-1 relative z-10">
        {/* Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-20 h-20 -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              fill="transparent"
              className="text-surface-secondary"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              strokeDasharray={circumference}
              style={{ strokeDashoffset: offset }}
              strokeLinecap="round"
              fill="transparent"
              className="text-primary transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black text-text-primary leading-none">
              {savingsRate}%
            </span>
            <span className="text-[7px] font-bold text-text-tertiary uppercase tracking-tighter mt-0.5">
              Saved
            </span>
          </div>
        </div>

        {/* Net flow */}
        <div className="flex flex-col gap-1 shrink-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary opacity-50">
            Net Flow
          </p>
          <span
            className={cn(
              'text-xl font-black tracking-tighter leading-none',
              netFlow >= 0 ? 'text-primary' : 'text-error',
            )}
          >
            {netFlow >= 0 ? '+' : '–'}
            <Money amount={Math.abs(netFlow)} currency="" />
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div
              className={cn(
                'flex items-center gap-1 px-1.5 py-0.5 rounded-full',
                isImproving ? 'bg-success/10 text-success' : 'bg-error/10 text-error',
              )}
            >
              <SharedIcon
                type="ui"
                name={isImproving ? 'trending-up' : 'trending-down'}
                size={9}
                strokeWidth={3}
              />
              <span className="text-[8px] font-black uppercase tracking-widest">
                {Math.abs(netFlowChange)}%
              </span>
            </div>
            <span className="text-[8px] font-bold text-text-tertiary opacity-40 uppercase">
              vs last month
            </span>
          </div>
        </div>

        {personaData && (
          <>
            <div className="w-px self-stretch bg-border-subtle shrink-0" />

            {/* Persona */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                <SharedIcon type="ui" name={personaData.icon} size={20} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-text-primary tracking-tight leading-none mb-1 truncate">
                  {personaData.persona}
                </h3>
                <p className="text-[10px] font-medium text-text-secondary opacity-60 leading-relaxed line-clamp-2">
                  {personaData.description}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer: savings streak */}
      {personaData && (
        <div className="mt-4 relative z-10">
          <p className="text-[8px] font-black uppercase text-text-tertiary opacity-40 mb-1">
            Savings Streak
          </p>
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-3 rounded-full border border-surface ${i < personaData.streak ? 'bg-primary' : 'bg-surface-secondary opacity-30'}`}
                />
              ))}
            </div>
            <span className="text-[10px] font-black text-primary">{personaData.streak}d</span>
          </div>
        </div>
      )}
    </div>
  )
}
