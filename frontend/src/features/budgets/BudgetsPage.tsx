import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetBudgetsQuery, useGetBudgetSummaryQuery } from '../../app/store/api/budgetApi'
import { useGetCategoriesQuery } from '../../app/store/api/categoryApi'
import { Card } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { pageLayout } from '../../shared/styles/layout'
import { formatCurrency } from '../../shared/lib/formatCurrency'

const currencyFormatter = {
  format: (amount: number) => formatCurrency(amount),
}

export function BudgetsPage(): ReactElement {
  const navigate = useNavigate()
  const { data: budgets, isLoading: isBudgetsLoading } = useGetBudgetsQuery()
  const { data: budgetSummary } = useGetBudgetSummaryQuery()
  const { data: categories = [] } = useGetCategoriesQuery()

  const handleEditBudget = () => {
    // For now, redirect to the smart setup as an "editor" (MVP logic)
    // In a future story, we might have a specific per-budget edit view.
    navigate('/budget/smart')
  }

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

      <div className="grid gap-6">
        {!budgets || budgets.length === 0 ? (
          <Card className="flex flex-col items-center justify-center border-dashed p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ui-accent-subtle text-ui-action">
              <BudgetIcon />
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
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => {
              const category = categories.find((c) => c.id === budget.categoryId)
              return (
                <Card
                  key={budget.id}
                  className="group space-y-4 border border-ui-border-subtle p-6 transition-colors hover:border-ui-border-strong"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                        style={{
                          backgroundColor: (category?.color || '#000') + '15',
                          color: category?.color,
                        }}
                      >
                        {category?.icon || '💰'}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                          {budget.categoryName}
                        </p>
                        <p className="text-2xl font-semibold text-foreground">
                          {currencyFormatter.format(budget.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-md bg-ui-accent-subtle px-2 py-1 text-[10px] font-medium uppercase text-ui-action">
                      {budget.period}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      onClick={handleEditBudget}
                      className="w-full text-xs font-medium"
                    >
                      Edit Budget
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function BudgetIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
