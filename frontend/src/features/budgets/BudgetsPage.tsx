import { type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react'
import {
  useGetBudgetsQuery,
  useGetBudgetSummaryQuery,
  type BudgetResponse,
} from '../../app/store/api/budgetApi'
import { useGetCategoriesQuery, type CategoryResponse } from '../../app/store/api/categoryApi'
import { Card } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { Badge } from '../../shared/components/Badge'
import { pageLayout } from '../../shared/styles/layout'
import { formatCurrency } from '../../shared/lib/formatCurrency'
import { DataList } from '../../shared/components/DataList'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { LoadingSpinner } from '../../shared/components/LoadingSpinner'
import { EmptyStateCard } from '../../shared/components/EmptyStateCard'
import { cn } from '../../shared/lib/cn'

const currencyFormatter = {
  format: (amount: number) => formatCurrency(amount),
}

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
    <Disclosure as="div" className="border-b border-ui-border-subtle last:border-0 overflow-hidden">
      {({ open }) => (
        <>
          <div className="flex flex-col px-4 py-4 hover:bg-ui-surface-hover transition-colors group relative">
            <div className="flex items-center justify-between mb-3">
              <div
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/budget/${budget.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/budget/${budget.id}`)}
                className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
              >
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
                  style={{
                    backgroundColor: (category?.color || '#000') + '15',
                    color: category?.color,
                  }}
                >
                  <SharedIcon type="category" name={category?.icon || 'wallet'} size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors truncate">
                      {budget.categoryName}
                    </p>
                    {isOverBudget && (
                      <Badge tone="error" className="text-[9px] uppercase font-black px-1.5 py-0">
                        Overbudget
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {budget.period.toLowerCase()} Budget
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 ml-2">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/budget/${budget.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/budget/${budget.id}`)}
                  className="text-right cursor-pointer"
                >
                  <p className="text-sm font-bold text-foreground">
                    {currencyFormatter.format(budget.amount)}
                  </p>
                  <p
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60',
                    )}
                  >
                    Allocated
                  </p>
                </div>

                <DisclosureButton
                  className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/5 transition-colors focus:outline-none"
                  aria-label="Toggle Insights"
                >
                  <ChevronRightIcon
                    size={20}
                    className={cn('transition-transform duration-200', open && 'rotate-90')}
                  />
                </DisclosureButton>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/budget/${budget.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/budget/${budget.id}`)}
              className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden cursor-pointer"
            >
              <div
                className={cn(
                  'h-full transition-all duration-500 ease-out',
                  isOverBudget ? 'bg-ui-danger' : 'bg-primary',
                )}
                style={{ width: `${usagePercent}%` }}
              />
            </div>

            <div className="flex justify-between mt-1.5 px-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Spent: {currencyFormatter.format(budget.expense)}
              </p>
              <p
                className={cn(
                  'text-[10px] font-bold uppercase tracking-widest',
                  isOverBudget ? 'text-ui-danger' : 'text-primary',
                )}
              >
                {usagePercent}%
              </p>
            </div>
          </div>

          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0 -translate-y-2"
            enterTo="transform scale-100 opacity-100 translate-y-0"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100 translate-y-0"
            leaveTo="transform scale-95 opacity-0 -translate-y-2"
          >
            <DisclosurePanel className="px-4 pb-4 pt-1 bg-ui-accent-subtle/10 border-t border-ui-border-subtle/50">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-subtle-foreground">
                    Burn Rate
                  </p>
                  <p className="text-sm font-black text-foreground tabular-nums">
                    {hasInsufficientData
                      ? '—'
                      : currencyFormatter.format(budget.burnRate!).replace('PHP', '').trim()}
                  </p>
                  <p className="text-[8px] font-medium text-muted-foreground uppercase tracking-tight">
                    per day
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-subtle-foreground">
                    Allowance
                  </p>
                  <p
                    className={cn(
                      'text-sm font-black tabular-nums',
                      isOverBudget ? 'text-ui-danger' : 'text-foreground',
                    )}
                  >
                    {hasInsufficientData
                      ? '—'
                      : currencyFormatter.format(budget.dailyAllowance!).replace('PHP', '').trim()}
                  </p>
                  <p className="text-[8px] font-medium text-muted-foreground uppercase tracking-tight">
                    remaining
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-subtle-foreground">
                    Projection
                  </p>
                  <p
                    className={cn(
                      'text-sm font-black tabular-nums',
                      isOverBudget
                        ? 'text-ui-danger'
                        : isProjectedOverBudget
                          ? 'text-amber-500'
                          : 'text-foreground',
                    )}
                  >
                    {hasInsufficientData
                      ? '—'
                      : currencyFormatter.format(budget.projectedTotal!).replace('PHP', '').trim()}
                  </p>
                  <p className="text-[8px] font-medium text-muted-foreground uppercase tracking-tight">
                    est. total
                  </p>
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
  const { data: budgets, isLoading: isBudgetsLoading } = useGetBudgetsQuery()
  const { data: budgetSummary } = useGetBudgetSummaryQuery()
  const { data: categories = [] } = useGetCategoriesQuery()

  const handleNewBudget = () => {
    navigate('/budget/add')
  }

  if (isBudgetsLoading) {
    return <LoadingSpinner />
  }

  return (
    <section className={pageLayout.sectionGap}>
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Budgets</h1>
          <p className="text-muted-foreground">Monitor and manage your spending limits.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewBudget} className="shrink-0">
            Add Budget
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-1 border border-ui-border-subtle p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
            Allocated
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {currencyFormatter.format(budgetSummary?.totalAllocated ?? 0)}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {budgetSummary?.allocationPercentage ?? 0}% of balance
          </p>
        </Card>
        <Card className="space-y-1 border border-ui-border-subtle p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
            Unallocated
          </p>
          <p
            className={cn(
              'text-2xl font-semibold',
              (budgetSummary?.unallocated ?? 0) < 0 ? 'text-ui-danger' : 'text-foreground',
            )}
          >
            {currencyFormatter.format(budgetSummary?.unallocated ?? 0)}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {(budgetSummary?.unallocated ?? 0) < 0
              ? `Over-committed by ${currencyFormatter.format(
                  Math.abs(budgetSummary?.unallocated ?? 0),
                )}`
              : 'available'}
          </p>
        </Card>
      </div>

      <DataList
        data={budgets || []}
        emptyState={
          <EmptyStateCard
            icon={<SharedIcon type="category" name="wallet" size={24} />}
            title="No budgets found"
            description="You haven't set up any budgets yet. Start with our smart allocation or create one manually."
            primaryAction={{
              label: 'Use Smart Allocation',
              onClick: () => navigate('/budget/smart'),
            }}
            secondaryAction={{ label: 'Manual Setup', onClick: handleNewBudget }}
          />
        }
        renderItem={(budget) => {
          const category = categories.find((c) => c.id === budget.categoryId)
          return <BudgetRow budget={budget} category={category} />
        }}
      />
    </section>
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
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
