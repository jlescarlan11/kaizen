import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useActionCenter } from '../hooks/useActionCenter'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { cn } from '../../../shared/lib/cn'

export const ActionCenterCard: React.FC = () => {
  const { tasks, highlights } = useActionCenter()
  const navigate = useNavigate()
  const allItems = [...tasks, ...highlights]

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col h-full group relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SharedIcon type="ui" name="check-square" size={14} className="text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
            Action Center
          </p>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-[8px] font-black text-primary uppercase">Live</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-grow">
        {allItems.length > 0 ? (
          allItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => navigate('/transactions')}
              className={cn(
                'px-3 py-2.5 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] active:scale-95 flex items-center gap-2.5',
                item.type === 'ALERT' && 'bg-amber-50 border-amber-200',
                item.type === 'WIN' && 'bg-green-50 border-green-200',
                item.type === 'TASK' && 'bg-blue-50 border-blue-200',
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
                  item.type === 'ALERT' && 'text-amber-600',
                  item.type === 'WIN' && 'text-green-600',
                  item.type === 'TASK' && 'text-blue-600',
                )}
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-[11px] font-semibold truncate',
                    item.type === 'ALERT' && 'text-amber-800',
                    item.type === 'WIN' && 'text-green-800',
                    item.type === 'TASK' && 'text-blue-800',
                  )}
                >
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-[9px] text-text-tertiary mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <SharedIcon type="ui" name="check" size={28} className="text-primary mb-2" />
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
              All Clear
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-border-subtle text-center">
        <button
          onClick={() => navigate('/transactions')}
          className="text-[9px] font-semibold uppercase tracking-[0.2em] text-text-tertiary hover:text-primary transition-all"
        >
          History & Archives
        </button>
      </div>
    </div>
  )
}
