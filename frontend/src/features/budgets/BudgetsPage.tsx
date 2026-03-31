import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetBudgetsQuery, useGetBudgetSummaryQuery } from '../../app/store/api/budgetApi'
import { useGetCategoriesQuery } from '../../app/store/api/categoryApi'
import { Card } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { pageLayout } from '../../shared/styles/layout'
import { formatCurrency } from '../../shared/lib/formatCurrency'
import { DataList } from '../../shared/components/DataList'
import { SharedIcon } from '../../shared/components/IconRegistry'

const currencyFormatter = {
  format: (amount: number) => formatCurrency(amount),
}

export function BudgetsPage(): ReactElement {
  const navigate = useNavigate()
  const { data: budgets, isLoading: isBudgetsLoading } = useGetBudgetsQuery()
  const { data: budgetSummary } = useGetBudgetSummaryQuery()
  const { data: categories = [] } = useGetCategoriesQuery()

  const handleNewBudget = () => {
    navigate('/budget/manual')
  }

  if (isBudgetsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <section className={pageLayout.sectionGap}>
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Budgets</h1>
          <p className="text-muted-foreground">Monitor and manage your monthly spending limits.</p>
        </div>
        <Button onClick={handleNewBudget} className="shrink-0">
          Add Budget
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-1 border border-ui-border-subtle p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
            Actual balance
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {currencyFormatter.format(budgetSummary?.balance ?? 0)}
          </p>
        </Card>
        <Card className="space-y-1 border border-ui-border-subtle p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
            Allocated
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {currencyFormatter.format(budgetSummary?.totalAllocated ?? 0)}
          </p>
        </Card>
        <Card className="space-y-1 border border-ui-border-subtle p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
            Remaining to budget
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {currencyFormatter.format(budgetSummary?.remainingToAllocate ?? 0)}
          </p>
          <p className="text-sm text-muted-foreground">
            {budgetSummary?.allocationPercentage ?? 0}% of balance allocated
          </p>
        </Card>
      </div>

      <DataList
        data={budgets || []}
        emptyState={
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ui-accent-subtle text-ui-action">
              <SharedIcon type="category" name="wallet" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No budgets found</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              You haven&apos;t set up any budgets yet. Start with our smart allocation or create one
              manually.
            </p>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => navigate('/budget/smart')}>Use Smart Allocation</Button>
              <Button variant="ghost" onClick={handleNewBudget}>
                Manual Setup
              </Button>
            </div>
          </div>
        }
        renderItem={(budget) => {
          const category = categories.find((c) => c.id === budget.categoryId)
          return (
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/budget/${budget.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/budget/${budget.id}`)}
              className="group flex items-center justify-between p-4 hover:bg-ui-surface-hover transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: (category?.color || '#000') + '15',
                    color: category?.color,
                  }}
                >
                  <SharedIcon type="category" name={category?.icon || 'wallet'} size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {budget.categoryName}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {budget.period}
                  </p>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    {currencyFormatter.format(budget.amount)}
                  </p>
                </div>
                <div className="text-muted-foreground/30 group-hover:text-primary transition-colors">
                  <ChevronRightIcon size={20} />
                </div>
              </div>
            </div>
          )
        }}
      />
    </section>
  )
}

function ChevronRightIcon({ size }: { size: number }) {
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
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
