import { type ReactElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetBudgetsQuery, useGetBudgetSummaryQuery } from '../../app/store/api/budgetApi'
import { useGetCategoriesQuery } from '../../app/store/api/categoryApi'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { pageLayout } from '../../shared/styles/layout'
import { formatCurrency } from '../../shared/lib/formatCurrency'

const currencyFormatter = {
  format: (amount: number) => formatCurrency(amount),
}

export function BudgetDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: budgets, isLoading: isBudgetsLoading } = useGetBudgetsQuery()
  const { data: budgetSummary } = useGetBudgetSummaryQuery()
  const { data: categories = [] } = useGetCategoriesQuery()

  const budget = budgets?.find((b) => b.id === Number(id))

  if (isBudgetsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-foreground">Budget not found</h2>
        <Button variant="ghost" onClick={() => navigate('/budget')} className="mt-4">
          Back to Budgets
        </Button>
      </div>
    )
  }

  const category = categories.find((c) => c.id === budget.categoryId)

  const handleEdit = () => {
    // Navigating to smart setup as per BudgetsPage logic,
    // but in a real app this would likely go to a specific edit page if it existed.
    navigate('/budget/manual')
  }

  return (
    <div className={pageLayout.sectionGap}>
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Budget Details</h1>
          <p className="text-muted-foreground">Manage your spending limit for this category.</p>
        </div>
        <Button onClick={handleEdit} className="shrink-0">
          Edit
        </Button>
      </header>

      <div className="mx-auto max-w-2xl w-full space-y-8">
        {/* Amount Card */}
        <div className="flex flex-col items-center justify-center py-10 bg-ui-surface-muted rounded-3xl border border-ui-border-subtle shadow-sm">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Monthly Budget
          </p>
          <p className="text-5xl font-bold tracking-tight text-foreground">
            <span className="text-muted-foreground text-3xl font-medium mr-1">PHP</span>
            {currencyFormatter.format(budget.amount).replace('PHP', '').trim()}
          </p>
          <div className="mt-4 rounded-full bg-ui-accent-subtle px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-ui-action border border-ui-border-strong">
            {budget.period}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 space-y-1 border border-ui-border-subtle">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Total Allocated
            </p>
            <p className="text-xl font-bold text-foreground">
              {currencyFormatter.format(budgetSummary?.totalAllocated ?? 0)}
            </p>
          </Card>
          <Card className="p-5 space-y-1 border border-ui-border-subtle">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Remaining to budget
            </p>
            <p className="text-xl font-bold text-foreground">
              {currencyFormatter.format(budgetSummary?.remainingToAllocate ?? 0)}
            </p>
          </Card>
        </div>

        {/* Details List */}
        <div className="grid grid-cols-1 gap-y-6">
          <DetailRow
            label="Category"
            content={
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                  style={{
                    backgroundColor: (category?.color || '#000') + '15',
                    color: category?.color,
                  }}
                >
                  {category ? <SharedIcon type="category" name={category.icon} size={24} /> : '💰'}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-foreground">{budget.categoryName}</span>
                  <span className="text-sm text-muted-foreground">
                    Category ID: {budget.categoryId}
                  </span>
                </div>
              </div>
            }
          />

          <DetailRow label="Period" value={budget.period} />

          <DetailRow
            label="Created"
            value={new Date(budget.createdAt).toLocaleDateString('en-PH', { dateStyle: 'long' })}
          />
        </div>
      </div>
    </div>
  )
}

interface DetailRowProps {
  label: string
  value?: string
  content?: ReactElement
}

function DetailRow({ label, value, content }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-ui-border-subtle pb-4 last:border-0 last:pb-0">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
      {content ? (
        content
      ) : (
        <p className="text-lg text-foreground leading-relaxed font-medium">{value}</p>
      )}
    </div>
  )
}
