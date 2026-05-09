import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscriptionWatchdog } from '../hooks/useSubscriptionWatchdog'
import { SharedIcon } from '../../../shared/components/IconRegistry'

export const SubscriptionWatchdogCard: React.FC = () => {
  const { subscriptions, isLoading } = useSubscriptionWatchdog()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="h-full min-h-[300px] p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm animate-pulse">
        <div className="h-4 w-32 bg-surface-secondary rounded mb-8" />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-secondary rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col h-full group">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SharedIcon type="ui" name="recurring" size={14} className="text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-text-primary">
            Subscription Watchdog
          </p>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/5">
          <span className="text-[8px] font-black text-primary uppercase">Audit</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-grow">
        {subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <div
              key={sub.name}
              className="flex items-center justify-between p-3 rounded-2xl bg-surface-secondary/30 border border-border/5 hover:bg-surface-secondary transition-all group/sub"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-surface flex items-center justify-center border border-border/5 text-text-tertiary group-hover/sub:text-primary transition-colors">
                  <SharedIcon type="ui" name="refresh" size={14} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-text-primary truncate max-w-[120px]">
                    {sub.name}
                  </p>
                  <p className="text-[8px] font-black text-text-tertiary uppercase opacity-50 tracking-tighter">
                    Monthly Active
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black text-text-primary leading-none">
                  ${sub.amount.toLocaleString()}
                </p>
                <p className="text-[8px] font-bold text-success uppercase mt-0.5">Verified</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-30">
            <SharedIcon
              type="ui"
              name="check-circle"
              size={32}
              className="text-text-tertiary mb-2"
            />
            <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
              No Subs Found
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-border/5">
        <button
          onClick={() => navigate('/transactions')}
          className="w-full text-center text-[9px] font-black uppercase tracking-[0.2em] text-text-tertiary hover:text-primary transition-all"
        >
          Manage Subscriptions
        </button>
      </div>
    </div>
  )
}
