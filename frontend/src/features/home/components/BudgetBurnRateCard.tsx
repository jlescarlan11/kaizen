import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetBudgetsQuery } from '../../../app/store/api/budgetApi'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { CategoryIcon } from '../../categories/CategoryIcon'
import { cn } from '../../../shared/lib/cn'

export const BudgetBurnRateCard: React.FC = () => {
  const { data: budgets = [], isLoading } = useGetBudgetsQuery()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm animate-pulse flex flex-col gap-3">
        <div className="h-3 w-28 bg-surface-secondary rounded" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-full bg-surface-secondary rounded" />
              <div className="h-1.5 w-full bg-surface-secondary rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const sortedBudgets = [...budgets]
    .sort((a, b) => b.expense / b.amount - a.expense / a.amount)
    .slice(0, 3)

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SharedIcon type="ui" name="target" size={14} className="text-primary" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            Active Burn Rates
          </p>
        </div>
        <div className="flex items-center gap-1 bg-error/10 px-2 py-0.5 rounded-full">
          <div className="w-1 h-1 rounded-full bg-error animate-pulse" />
          <span className="text-[9px] font-semibold text-error">Monitoring</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-grow">
        {sortedBudgets.length > 0 ? (
          sortedBudgets.map((budget) => {
            const percentage = Math.min((budget.expense / budget.amount) * 100, 100)
            const isOver = budget.expense > budget.amount
            const isWarning = percentage > 85
            return (
              <div key={budget.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <CategoryIcon icon={budget.categoryName} size={10} />
                    <span className="font-medium text-text-primary">{budget.categoryName}</span>
                  </div>
                  <div className="font-semibold tabular-nums">
                    <span
                      className={cn(
                        isOver ? 'text-error' : isWarning ? 'text-warning' : 'text-text-primary',
                      )}
                    >
                      ${budget.expense.toLocaleString()}
                    </span>
                    <span className="text-text-tertiary/40 mx-0.5">/</span>
                    <span className="text-text-tertiary">${budget.amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-surface-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-1000 ease-out rounded-full',
                      isOver ? 'bg-error' : isWarning ? 'bg-warning' : 'bg-primary',
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-6">
            <p className="text-[11px] font-medium text-text-tertiary/60">No Budgets Set</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle">
        <button
          onClick={() => navigate('/budgets')}
          className="w-full text-center text-[11px] font-medium text-text-secondary hover:text-primary transition-colors"
        >
          Manage Budgets
        </button>
      </div>
    </div>
  )
}
