import { useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react'
import { useGetBudgetsQuery, type BudgetResponse } from '../../app/store/api/budgetApi'
import { useGetCategoriesQuery, type CategoryResponse } from '../../app/store/api/categoryApi'
import { Button } from '../../shared/components/Button'
import { Badge } from '../../shared/components/Badge'
import { DataList } from '../../shared/components/DataList'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { EmptyStateCard } from '../../shared/components/EmptyStateCard'
import { cn } from '../../shared/lib/cn'
import { withOpacity } from '../../shared/lib/colorUtils'
import { PageTabs } from '../../shared/components/PageTabs'
import { ProgressBar } from '../../shared/components/ProgressBar'

const BudgetRow = ({
  budget,
  category,
}: {
  budget: BudgetResponse
  category?: CategoryResponse
}) => {
  const navigate = useNavigate()
  const usagePercent = Math.min(Math.round((budget.expense / budget.amount) * 100), 100)
  const isOverBudget = budget.expense > budget.amount
  const hasInsufficientData = !budget.burnRate || (budget.daysElapsed ?? 0) < 3
  const isProjectedOverBudget = (budget.projectedTotal ?? 0) > budget.amount

  return (
    <Disclosure as="div" className="overflow-hidden">
      {({ open }) => (
        <>
          <div className="relative flex flex-col px-5 py-4 bg-surface rounded-2xl shadow-sm hover:bg-surface-secondary transition-all group">
            <button
              type="button"
              className="absolute inset-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded-2xl"
              onClick={() => navigate(`/budgets/${budget.id}`)}
              aria-label={`View ${budget.categoryName} budget`}
            />
            <div className="relative flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className="h-11 w-11 rounded-[10px] flex items-center justify-center transition-all group-hover:scale-105 shrink-0"
                  style={{
                    backgroundColor: withOpacity(
                      category?.color || 'var(--color-category-fallback)',
                      0.1,
                    ),
                    color: category?.color || 'var(--color-text-secondary)',
                  }}
                >
                  <SharedIcon
                    type="category"
                    name={category?.icon || 'wallet'}
                    size={24}
                    strokeWidth={2.5}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold tracking-tight text-text-primary leading-tight group-hover:text-primary transition-colors truncate">
                      {budget.categoryName}
                    </p>
                    {isOverBudget && <Badge variant="error">Over</Badge>}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {budget.period === 'MONTHLY' ? 'Monthly' : 'Weekly'} budget
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-4 ml-2">
                <div className="text-right">
                  <p className="text-base font-bold tracking-tight text-text-primary">
                    ${budget.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-text-secondary">allocated</p>
                </div>

                <DisclosureButton
                  className="p-1.5 rounded-lg text-text-secondary/40 hover:text-primary hover:bg-primary/10 transition-colors focus:outline-none"
                  aria-label={`Toggle insights for ${budget.categoryName}`}
                >
                  <ChevronRightIcon
                    size={18}
                    className={cn('transition-transform duration-300', open && 'rotate-90')}
                  />
                </DisclosureButton>
              </div>
            </div>

            <ProgressBar
              value={usagePercent}
              activeClassName={isOverBudget ? 'bg-error' : 'bg-primary'}
              inactiveClassName={isOverBudget ? 'bg-error/10' : 'bg-background'}
            />

            <div className="flex justify-between mt-1.5 px-0.5">
              <p className="text-sm text-text-secondary">Spent ${budget.expense.toFixed(2)}</p>
              <p
                className={cn(
                  'text-sm font-semibold',
                  isOverBudget ? 'text-error' : 'text-primary',
                )}
              >
                {usagePercent}% used
              </p>
            </div>
          </div>

          <Transition
            enter="transition duration-200 ease-out"
            enterFrom="transform scale-95 opacity-0 -translate-y-2"
            enterTo="transform scale-100 opacity-100 translate-y-0"
            leave="transition duration-150 ease-out"
            leaveFrom="transform scale-100 opacity-100 translate-y-0"
            leaveTo="transform scale-95 opacity-0 -translate-y-2"
          >
            <DisclosurePanel className="px-6 pb-6 pt-3 bg-surface-secondary/50 rounded-2xl mt-1 border border-border-subtle/30 shadow-inner">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-text-secondary">Burn rate</p>
                  <p className="text-sm font-bold text-text-primary tabular-nums tracking-tight">
                    {hasInsufficientData ? '—' : `$${budget.burnRate!.toFixed(2)}`}
                  </p>
                  <p className="text-xs text-text-secondary">per day</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-text-secondary">Allowance</p>
                  <p
                    className={cn(
                      'text-sm font-bold tabular-nums tracking-tight',
                      isOverBudget ? 'text-error' : 'text-text-primary',
                    )}
                  >
                    {hasInsufficientData ? '—' : `$${budget.dailyAllowance!.toFixed(2)}`}
                  </p>
                  <p className="text-xs text-text-secondary">remaining</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-text-secondary">Projection</p>
                  <p
                    className={cn(
                      'text-sm font-bold tabular-nums tracking-tight',
                      isOverBudget
                        ? 'text-error'
                        : isProjectedOverBudget
                          ? 'text-warning'
                          : 'text-text-primary',
                    )}
                  >
                    {hasInsufficientData ? '—' : `$${budget.projectedTotal!.toFixed(2)}`}
                  </p>
                  <p className="text-xs text-text-secondary">est. total</p>
                </div>
              </div>
            </DisclosurePanel>
          </Transition>
        </>
      )}
    </Disclosure>
  )
}

export function BudgetsPage(): ReactElement {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')
  const { data: budgets, isLoading: isBudgetsLoading } = useGetBudgetsQuery()
  const { data: categories = [] } = useGetCategoriesQuery()

  // BudgetResponse does not have an `archived` field — treat all budgets as active.
  // Cast to a local interface to safely access the field without `any`.
  type BudgetMaybeArchived = BudgetResponse & { archived?: boolean }
  const visibleBudgets: BudgetResponse[] =
    (budgets as BudgetMaybeArchived[] | undefined)?.filter((b) =>
      activeTab === 'archived' ? (b.archived ?? false) : !(b.archived ?? false),
    ) ?? []

  const handleNewBudget = () => {
    navigate('/budgets/add')
  }

  if (isBudgetsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent shadow-xl shadow-primary/10"></div>
        <p className="text-3xs font-bold uppercase tracking-widest text-text-secondary animate-pulse opacity-60">
          Loading Budgets...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full animate-entrance-slide-up pb-24">
      <div className="flex justify-end mb-6">
        <Button variant="primary" size="sm" onClick={() => navigate('/budgets/add')}>
          + New Budget
        </Button>
      </div>
      <PageTabs
        tabs={[
          { key: 'active', label: 'Active' },
          { key: 'archived', label: 'Archived' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      <DataList
        data={visibleBudgets}
        hideBorders
        className="gap-1"
        emptyState={
          <EmptyStateCard
            icon={<SharedIcon type="category" name="wallet" size={28} strokeWidth={2.5} />}
            title="No budgets found"
            description="You haven't set up any budgets yet."
            primaryAction={{
              label: 'Smart Allocation',
              onClick: () => navigate('/budgets/smart'),
            }}
            secondaryAction={{ label: 'Manual Setup', onClick: handleNewBudget }}
          />
        }
        renderItem={(budget) => {
          const category = categories.find((c) => c.id === budget.categoryId)
          return <BudgetRow budget={budget} category={category} />
        }}
      />
    </div>
  )
}

function ChevronRightIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
