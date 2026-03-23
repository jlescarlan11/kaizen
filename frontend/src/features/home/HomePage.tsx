import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetBudgetSummaryQuery } from '../../app/store/api/budgetApi'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { BudgetsEmptyState } from './BudgetsEmptyState'
import { TransactionsEmptyState } from './TransactionsEmptyState'
import { Card } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { DashboardTour } from './DashboardTour'
import { useRegisterDashboardTourAnchor } from './DashboardTourAnchorsHooks'
import { ADD_TRANSACTION_ROUTE } from './routes'
import { DEFERRED_BUDGET_SETUP_ROUTE } from '../budgets/routes'
import { pageLayout } from '../../shared/styles/layout'

interface HomePageProps {
  /**
   * Placeholder count until a transaction history endpoint exists (PRD Section 6b).
   * Connect this to the same data used to render transaction rows so no extra requests are required.
   */
  transactionsCount?: number
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function HomePage({ transactionsCount }: HomePageProps = {}): ReactElement {
  const { user } = useAuthState()
  const navigate = useNavigate()

  const balanceCardRef = useRegisterDashboardTourAnchor('balanceCard')
  const addTransactionButtonRef = useRegisterDashboardTourAnchor('addTransactionButton')

  const { data: budgetSummary, isFetching: isBudgetSummaryLoading } = useGetBudgetSummaryQuery()
  const budgetCount = budgetSummary?.budgetCount ?? 0
  const hasBudgets = budgetCount > 0
  const hasTransactions = (transactionsCount ?? 0) > 0

  const formattedBalance = currencyFormatter.format(user?.balance ?? 0)

  const handleStartTransactions = () => {
    // TODO: update ADD_TRANSACTION_ROUTE once the real add-transaction flow is available.
    navigate(ADD_TRANSACTION_ROUTE)
  }

  const handleLaunchSetup = () => {
    navigate(DEFERRED_BUDGET_SETUP_ROUTE)
  }

  return (
    <>
      <section className={pageLayout.sectionGap}>
        <header className={pageLayout.headerGap}>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here is your account overview.
          </p>
        </header>

        <div className={pageLayout.sectionCompactGap}>
          <h2 className="text-xl font-semibold text-foreground">Transactions</h2>
          {!hasTransactions ? (
            <>
              <TransactionsEmptyState
                onAddTransaction={handleStartTransactions}
                buttonRef={addTransactionButtonRef}
              />
              <p className="text-xs leading-snug text-subtle-foreground">
                {/*
                  The prompt shows until we have a transaction history endpoint.
                  Replace this guard with a real `hasTransactions` flag once transaction data exists.
                */}
                No transaction history yet? Tap the button above to record your first entry.
              </p>
            </>
          ) : (
            <Card className="space-y-2 border border-ui-border-subtle p-6">
              <p className="text-base font-semibold text-foreground">
                Transactions will appear here
              </p>
              <p className="text-sm text-muted-foreground">
                Once you record entries, this list will refresh automatically and the tour can
                highlight the most recent item.
              </p>
            </Card>
          )}
        </div>

        <div className={pageLayout.sectionCompactGap}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Budget summary
              </p>
              <p className="text-foreground text-lg font-semibold">Plan and track your budgets</p>
            </div>
            <Button variant="ghost" onClick={handleLaunchSetup} className="text-sm font-medium">
              Manage budgets
            </Button>
          </div>

          {isBudgetSummaryLoading ? (
            <Card className="border border-ui-border-subtle p-6">
              <p className="text-sm text-muted-foreground">Loading budget activity...</p>
            </Card>
          ) : hasBudgets ? (
            <Card className="space-y-3 border border-ui-border-subtle p-6">
              <p className="text-base font-semibold text-foreground">Budgets at a glance</p>
              <p className="text-sm text-muted-foreground">
                You currently have {budgetCount} budget{budgetCount === 1 ? '' : 's'} configured.
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                    Allocated
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {currencyFormatter.format(budgetSummary?.totalAllocated ?? 0)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                    Remaining to budget
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {currencyFormatter.format(budgetSummary?.remainingToAllocate ?? 0)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                    Allocation rate
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {budgetSummary?.allocationPercentage ?? 0}%
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <BudgetsEmptyState onQuickSetup={handleLaunchSetup} />
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card ref={balanceCardRef} className="space-y-3 border border-ui-border-subtle p-6">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Available balance
            </p>
            <p className="text-4xl font-bold tracking-tight text-foreground">{formattedBalance}</p>
          </Card>
        </div>
        {/*
          Goals empty state content is deferred (PRD Open Question 6).
          Keep this stub in place until the UX team confirms the required copy.
        */}
      </section>
      <DashboardTour />
    </>
  )
}
