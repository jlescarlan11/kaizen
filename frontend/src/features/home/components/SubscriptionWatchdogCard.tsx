import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscriptionWatchdog } from '../hooks/useSubscriptionWatchdog'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { DashboardCard, CardHeader, CardSkeleton } from '../../../shared/components'

export const SubscriptionWatchdogCard: React.FC = () => {
  const { subscriptions, isLoading } = useSubscriptionWatchdog()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <CardSkeleton className="h-full min-h-[300px]">
        <div className="h-4 w-32 bg-surface-secondary rounded mb-5" />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-secondary rounded-2xl" />
          ))}
        </div>
      </CardSkeleton>
    )
  }

  return (
    <DashboardCard className="flex flex-col h-full group">
      <CardHeader
        icon={<SharedIcon type="ui" name="recurring" size={14} className="text-primary" />}
        title="Subscription Watchdog"
        titleClassName="text-3xs font-black uppercase tracking-widest text-text-primary"
        right={
          <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/5">
            <span className="text-5xs font-black text-primary uppercase">Audit</span>
          </div>
        }
        className="mb-5"
      />

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
                  <p className="text-2xs font-bold text-text-primary truncate max-w-[120px]">
                    {sub.name}
                  </p>
                  <p className="text-5xs font-black text-text-tertiary uppercase opacity-50 tracking-tighter">
                    Monthly Active
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xs font-black text-text-primary leading-none">
                  ${sub.amount.toLocaleString()}
                </p>
                <p className="text-5xs font-bold text-success uppercase mt-0.5">Verified</p>
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
            <p className="text-3xs font-black uppercase tracking-widest text-text-tertiary">
              No Subs Found
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-border/5">
        <button
          onClick={() => navigate('/transactions')}
          className="w-full text-center text-4xs font-black uppercase tracking-[0.2em] text-text-tertiary hover:text-primary transition-all"
        >
          Manage Subscriptions
        </button>
      </div>
    </DashboardCard>
  )
}
