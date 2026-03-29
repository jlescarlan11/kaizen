import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetBudgetSummaryQuery, useGetBudgetsQuery } from '../../app/store/api/budgetApi'
import { useGetTransactionsQuery } from '../../app/store/api/transactionApi'
import { useGetCategoriesQuery } from '../../app/store/api/categoryApi'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { BudgetsEmptyState } from './BudgetsEmptyState'
import { TransactionsEmptyState } from './TransactionsEmptyState'
import { TransactionList } from '../transactions/components/TransactionList'
import { SectionHeader } from '../../shared/components/SectionHeader'
import { SkeletonList } from '../../shared/components/SkeletonList'
import { Card } from '../../shared/components/Card'
import { Badge } from '../../shared/components/Badge'
import { DashboardTour } from './DashboardTour'
import { useRegisterDashboardTourAnchor } from './DashboardTourAnchorsHooks'
import { ADD_TRANSACTION_ROUTE } from './routes'
import { DEFERRED_BUDGET_SETUP_ROUTE } from '../budgets/routes'
import { cn } from '../../shared/lib/cn'
import { formatCurrency } from '../../shared/lib/formatCurrency'

const currencyFormatter = {
  format: (amount: number) => formatCurrency(amount),
}

export function HomePage(): ReactElement {
  const { user } = useAuthState()
  const navigate = useNavigate()

  const balanceCardRef = useRegisterDashboardTourAnchor('balanceCard')
  const addTransactionButtonRef = useRegisterDashboardTourAnchor('addTransactionButton')

  const { isFetching: isBudgetSummaryLoading } = useGetBudgetSummaryQuery()
  const { data: budgets = [], isFetching: isBudgetsLoading } = useGetBudgetsQuery()
  const { data: categories = [] } = useGetCategoriesQuery()

  const hasBudgets = budgets.length > 0

  const { data: transactions = [], isLoading: isTransactionsLoading } = useGetTransactionsQuery()
  const hasTransactions = transactions.length > 0

  const formattedBalance = currencyFormatter.format(user?.balance ?? 0)

  const handleStartTransactions = () => {
    navigate(ADD_TRANSACTION_ROUTE)
  }

  const handleLaunchSetup = () => {
    navigate(DEFERRED_BUDGET_SETUP_ROUTE)
  }

  return (
    <>
      <div className={cn('space-y-10 pb-32')}>
        {/* ───────── TOTAL BALANCE ───────── */}
        <section
          ref={balanceCardRef}
          className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Total Balance
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-muted-foreground">PHP</span>
            <h2 className="text-4xl font-black tracking-tight text-foreground">
              {formattedBalance.replace('PHP', '').trim()}
            </h2>
          </div>
        </section>

        {/* ───────── TRANSACTIONS SECTION ───────── */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-600 delay-75">
          <SectionHeader title="Transactions" seeAllHref="/transactions" />

          {isTransactionsLoading ? (
            <SkeletonList count={3} itemHeight="h-20" />
          ) : !hasTransactions ? (
            <TransactionsEmptyState
              onAddTransaction={handleStartTransactions}
              buttonRef={addTransactionButtonRef}
            />
          ) : (
            <TransactionList transactions={transactions.slice(0, 5)} />
          )}
        </section>

        {/* ───────── BUDGET SECTION ───────── */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <SectionHeader title="Budget" seeAllHref="/budget" />

          {isBudgetSummaryLoading || isBudgetsLoading ? (
            <SkeletonList count={2} itemHeight="h-24" />
          ) : !hasBudgets ? (
            <BudgetsEmptyState onQuickSetup={handleLaunchSetup} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {budgets.slice(0, 3).map((budget) => {
                const category = categories.find((c) => c.id === budget.categoryId)
                return (
                  <Card
                    key={budget.id}
                    className="p-5 border border-ui-border-subtle hover:border-ui-border-strong transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-lg"
                        style={{
                          backgroundColor: (category?.color || '#000') + '15',
                          color: category?.color,
                        }}
                      >
                        {category?.icon || '💰'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-tight">
                          {budget.categoryName}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {budget.period}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Limit</span>
                        <span className="text-foreground">
                          {currencyFormatter.format(budget.amount)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                        {/* 
                          TODO: In Phase 4, we should fetch current spending for each budget 
                          to show accurate progress. For now, showing an empty bar or static 0.
                        */}
                        <div className="h-full bg-primary/40" style={{ width: '0%' }} />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {/* ───────── GOAL SECTION ───────── */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-800 delay-225">
          <SectionHeader title="Goal" seeAllHref="/goals" />
          <Card className="p-10 border border-dashed border-ui-border-strong bg-ui-surface-muted/30 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-ui-accent-subtle flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Savings Goals</p>
              <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                Track your progress towards big purchases or emergency funds.
              </p>
            </div>
            <Badge
              tone="neutral"
              className="text-[10px] uppercase font-black tracking-widest px-3 py-1"
            >
              Coming Soon
            </Badge>
          </Card>
        </section>
      </div>
      <DashboardTour />
    </>
  )
}
