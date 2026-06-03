import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useActionCenter } from '../hooks/useActionCenter'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { cn } from '../../../shared/lib/cn'
import { DashboardCard, CardHeader } from '../../../shared/components'

export const ActionCenterCard: React.FC = () => {
  const { tasks, highlights } = useActionCenter()
  const navigate = useNavigate()
  const allItems = [...tasks, ...highlights]

  return (
    <DashboardCard className="flex flex-col h-full group relative overflow-hidden">
      <CardHeader
        icon={<SharedIcon type="ui" name="check-square" size={14} className="text-primary" />}
        title="Action Center"
        titleClassName="text-3xs font-black uppercase tracking-widest text-text-secondary"
        right={
          <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-5xs font-black text-primary uppercase">Live</span>
          </div>
        }
        className="mb-5"
      />

      <div className="flex flex-col gap-3 flex-grow">
        {allItems.length > 0 ? (
          allItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                const route =
                  item.type === 'TASK'
                    ? '/transactions/add'
                    : item.type === 'ALERT'
                      ? '/budgets'
                      : item.type === 'WIN'
                        ? '/insights'
                        : '/transactions'
                navigate(route)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  const route =
                    item.type === 'TASK'
                      ? '/transactions/add'
                      : item.type === 'ALERT'
                        ? '/budgets'
                        : item.type === 'WIN'
                          ? '/insights'
                          : '/transactions'
                  navigate(route)
                }
              }}
              className={cn(
                'px-3 py-2.5 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] active:scale-95 flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                item.type === 'ALERT' && 'bg-warning/10 border-warning/30',
                item.type === 'WIN' && 'bg-success/10 border-success/30',
                item.type === 'TASK' && 'bg-info/10 border-info/30',
              )}
            >
              <SharedIcon
                type="ui"
                name={
                  item.type === 'WIN'
                    ? 'trending-up'
                    : item.type === 'ALERT'
                      ? 'alert-circle'
                      : 'plus'
                }
                size={12}
                className={cn(
                  item.type === 'ALERT' && 'text-warning',
                  item.type === 'WIN' && 'text-success',
                  item.type === 'TASK' && 'text-info',
                )}
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-2xs font-semibold truncate',
                    item.type === 'ALERT' && 'text-warning',
                    item.type === 'WIN' && 'text-success',
                    item.type === 'TASK' && 'text-info',
                  )}
                >
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-4xs text-text-tertiary mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <SharedIcon type="ui" name="check" size={28} className="text-primary mb-2" />
            <p className="text-3xs font-semibold text-text-tertiary uppercase tracking-widest">
              All Clear
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-border-subtle text-center">
        <button
          onClick={() => navigate('/transactions')}
          className="text-4xs font-semibold uppercase tracking-[0.2em] text-text-tertiary hover:text-primary transition-all"
        >
          History & Archives
        </button>
      </div>
    </DashboardCard>
  )
}
