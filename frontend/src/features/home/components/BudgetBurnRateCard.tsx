import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetBudgetsQuery } from '../../../app/store/api/budgetApi'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { CategoryIcon } from '../../categories/CategoryIcon'
import { cn } from '../../../shared/lib/cn'
import { DashboardCard, CardHeader, CardSkeleton } from '../../../shared/components'

export const BudgetBurnRateCard: React.FC = () => {
  const { data: budgets = [], isLoading } = useGetBudgetsQuery()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <CardSkeleton className="flex flex-col gap-3">
        <div className="h-3 w-28 bg-surface-secondary rounded" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-full bg-surface-secondary rounded" />
              <div className="h-1.5 w-full bg-surface-secondary rounded-full" />
            </div>
          ))}
        </div>
      </CardSkeleton>
    )
  }

  const sortedBudgets = [...budgets]
    .sort((a, b) => b.expense / b.amount - a.expense / a.amount)
    .slice(0, 3)

  return (
    <DashboardCard className="flex flex-col group">
      <CardHeader
        icon={<SharedIcon type="ui" name="target" size={14} className="text-primary" />}
        title="Active Burn Rates"
        right={
          <div className="flex items-center gap-1 bg-error/10 px-2 py-0.5 rounded-full">
            <div className="w-1 h-1 rounded-full bg-error animate-pulse" />
            <span className="text-4xs font-semibold text-error">Monitoring</span>
          </div>
        }
        className="mb-4"
      />

      <div className="flex flex-col gap-3 flex-grow">
        {sortedBudgets.length > 0 ? (
          sortedBudgets.map((budget) => {
            const percentage = Math.min((budget.expense / budget.amount) * 100, 100)
            const isOver = budget.expense > budget.amount
            const isWarning = percentage > 85
            return (
              <div key={budget.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-2xs">
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
            <p className="text-2xs font-medium text-text-tertiary/60">No Budgets Set</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle">
        <button
          onClick={() => navigate('/budgets')}
          className="w-full text-center text-2xs font-medium text-text-secondary hover:text-primary transition-colors"
        >
          Manage Budgets
        </button>
      </div>
    </DashboardCard>
  )
}
