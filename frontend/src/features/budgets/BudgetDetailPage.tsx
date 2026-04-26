import { type ReactElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetBudgetsQuery, useGetBudgetSummaryQuery } from '../../app/store/api/budgetApi'
import { useGetCategoriesQuery } from '../../app/store/api/categoryApi'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { formatCurrency } from '../../shared/lib/formatCurrency'
import { pageLayout } from '../../shared/styles/layout'

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
        <h2 className="text-xl font-black text-foreground uppercase tracking-widest">
          Budget not found
        </h2>
        <button
          onClick={() => navigate('/budgets')}
          className="px-6 py-2.5 bg-ui-surface border border-ui-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm"
        >
          Back to Budgets
        </button>
      </div>
    )
  }

  const category = categories.find((c) => c.id === budget.categoryId)

  const handleEdit = () => {
    // Navigating to smart setup as per BudgetsPage logic,
    // but in a real app this would likely go to a specific edit page if it existed.
    navigate('/budgets/add')
  }

  return (
    <div className={pageLayout.sectionGap}>
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-16">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase tracking-widest">
              Budget Details
            </h1>
            <p className="text-muted-foreground font-medium">
              Manage your spending limit for this category.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              {budget.period.toLowerCase()} Budget
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-6xl font-black tracking-tighter text-foreground tabular-nums">
                {currencyFormatter.format(budget.amount).replace('PHP', '').trim()}
              </p>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                PHP
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto">
          <button
            onClick={handleEdit}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-ui-surface border border-ui-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm group"
          >
            <SharedIcon
              type="ui"
              name="edit"
              size={12}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            />
            Edit Configuration
          </button>
        </div>
      </header>

      <div className="space-y-16">
        {/* Spending Progress */}
        <section className="py-8 border-y border-ui-border-subtle">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  Spending Progress
                </p>
                <p className="text-2xl font-black text-foreground tabular-nums">
                  {currencyFormatter.format(budget.expense)} /{' '}
                  {currencyFormatter.format(budget.amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  Remaining
                </p>
                <p
                  className={`text-2xl font-black tabular-nums ${budget.amount - budget.expense < 0 ? 'text-ui-error' : 'text-ui-action'}`}
                >
                  {currencyFormatter.format(Math.max(0, budget.amount - budget.expense))}
                </p>
              </div>
            </div>
            <div className="h-4 w-full bg-ui-surface-hover rounded-full overflow-hidden border border-ui-border-subtle">
              <div
                className={`h-full transition-all duration-1000 ${budget.expense > budget.amount ? 'bg-ui-error' : 'bg-ui-action'}`}
                style={{ width: `${Math.min(100, (budget.expense / budget.amount) * 100)}%` }}
              />
            </div>
            {budget.expense > budget.amount && (
              <p className="text-[10px] font-black uppercase tracking-widest text-ui-error flex items-center gap-2">
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
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Total Allocated
              </p>
              <p className="text-2xl font-black text-foreground tabular-nums">
                {currencyFormatter.format(budgetSummary?.totalAllocated ?? 0)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Unallocated
              </p>
              <p className="text-2xl font-black text-foreground tabular-nums">
                {currencyFormatter.format(budgetSummary?.unallocated ?? 0)}
              </p>
            </div>
          </div>
        </section>

        {/* Details List */}
        <section className="space-y-12">
          <div className="flex items-center gap-2 mb-8 px-1">
            <div className="h-4 w-1 bg-primary rounded-full" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
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
                      backgroundColor: (category?.color || '#000') + '15',
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
                    <span className="text-xl font-black text-foreground">
                      {budget.categoryName}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
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
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
        {label}
      </p>
      {content ? (
        content
      ) : (
        <p className="text-xl text-foreground font-black tabular-nums">{value}</p>
      )}
    </div>
  )
}
