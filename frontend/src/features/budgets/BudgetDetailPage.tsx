import { type ReactElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetBudgetsQuery, useGetBudgetSummaryQuery } from '../../app/store/api/budgetApi'
import { useGetCategoriesQuery } from '../../app/store/api/categoryApi'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { Button } from '../../shared/components/Button'
import { formatCurrency } from '../../shared/lib/formatCurrency'
import { pageLayout } from '../../shared/styles/layout'
import { withOpacity } from '../../shared/lib/colorUtils'
import { PageHeader } from '../../shared/components/PageHeader'
import { KpiStrip } from '../../shared/components/KpiStrip'

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
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <h2 className="text-xl font-semibold text-text-primary">Budget not found</h2>
        <button
          onClick={() => navigate('/budgets')}
          className="px-6 py-2.5 bg-surface border border-border rounded-xl text-xs font-semibold uppercase tracking-wide text-text-secondary hover:text-primary hover:border-primary/30 transition-all shadow-sm"
        >
          Back to Budgets
        </button>
      </div>
    )
  }

  const category = categories.find((c) => c.id === budget.categoryId)

  return (
    <div className={`w-full ${pageLayout.sectionGap}`}>
      <PageHeader
        title={budget.categoryName}
        subtitle={`${budget.period} budget`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/budgets/${budget.id}/edit`)}
          >
            Edit
          </Button>
        }
      />
      <KpiStrip
        items={[
          { label: 'Allocated', value: `$${budget.amount.toFixed(2)}` },
          {
            label: 'Spent',
            value: `$${budget.expense.toFixed(2)}`,
            valueClassName: budget.expense > budget.amount ? 'text-error' : undefined,
          },
          {
            label: 'Remaining',
            value: `$${Math.max(budget.amount - budget.expense, 0).toFixed(2)}`,
          },
        ]}
      />

      <main className="space-y-16">
        {/* Spending Progress */}
        <section className="py-8 border-y border-border-subtle">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary/60">
                  Spending Progress
                </p>
                <p className="text-2xl font-semibold text-text-primary tabular-nums">
                  {currencyFormatter.format(budget.expense)} /{' '}
                  {currencyFormatter.format(budget.amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary/60">
                  Remaining
                </p>
                <p
                  className={`text-2xl font-semibold tabular-nums ${budget.amount - budget.expense < 0 ? 'text-error' : 'text-primary'}`}
                >
                  {currencyFormatter.format(Math.max(0, budget.amount - budget.expense))}
                </p>
              </div>
            </div>
            <div className="h-4 w-full bg-surface-secondary rounded-full overflow-hidden border border-border-subtle">
              <div
                className={`h-full transition-all duration-1000 ${budget.expense > budget.amount ? 'bg-error' : 'bg-primary'}`}
                style={{ width: `${Math.min(100, (budget.expense / budget.amount) * 100)}%` }}
              />
            </div>
            {budget.expense > budget.amount && (
              <p className="text-xs font-semibold uppercase tracking-wide text-error flex items-center gap-2">
                <SharedIcon type="ui" name="error" size={10} />
                You have exceeded your {budget.period.toLowerCase()} budget by{' '}
                {currencyFormatter.format(budget.expense - budget.amount)}
              </p>
            )}
          </div>
        </section>

        {/* Summary */}
        <section className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary/60">
                Total Allocated
              </p>
              <p className="text-2xl font-semibold text-text-primary tabular-nums">
                {currencyFormatter.format(budgetSummary?.totalAllocated ?? 0)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary/60">
                Unallocated
              </p>
              <p className="text-2xl font-semibold text-text-primary tabular-nums">
                {currencyFormatter.format(budgetSummary?.unallocated ?? 0)}
              </p>
            </div>
          </div>
        </section>

        {/* Details List */}
        <section className="space-y-12">
          <div className="flex items-center gap-2 mb-8 px-1">
            <div className="h-4 w-1 bg-primary rounded-full" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Core Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
            <DetailRow
              label="Category"
              content={
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                    style={{
                      backgroundColor: withOpacity(
                        category?.color || 'var(--color-category-fallback)',
                        0.08,
                      ),
                      color: category?.color,
                    }}
                  >
                    {category ? (
                      <SharedIcon type="category" name={category.icon} size={28} />
                    ) : (
                      '💰'
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-semibold text-text-primary">
                      {budget.categoryName}
                    </span>
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                      ID: {budget.categoryId}
                    </span>
                  </div>
                </div>
              }
            />

            <DetailRow label="Reporting Period" value={budget.period} />

            <DetailRow
              label="Created Date"
              value={new Date(budget.createdAt).toLocaleDateString('en-PH', { dateStyle: 'long' })}
            />
          </div>
        </section>
      </main>
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
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary/60">
        {label}
      </p>
      {content ? (
        content
      ) : (
        <p className="text-xl text-text-primary font-semibold tabular-nums">{value}</p>
      )}
    </div>
  )
}
