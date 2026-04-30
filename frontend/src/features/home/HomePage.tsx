import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react'
import {
  useGetBudgetSummaryQuery,
  useGetBudgetsQuery,
  type BudgetResponse,
} from '../../app/store/api/budgetApi'
import {
  useGetTransactionsQuery,
  type TransactionResponse,
} from '../../app/store/api/transactionApi'
import { useGetCategoriesQuery, type CategoryResponse } from '../../app/store/api/categoryApi'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { BalanceSummaryIcon } from './components/BalanceSummaryIcon'
import { BudgetsEmptyState } from './BudgetsEmptyState'
import { TransactionsEmptyState } from './TransactionsEmptyState'
import { SectionHeader } from '../../shared/components/SectionHeader'
import { SkeletonList } from '../../shared/components/SkeletonList'
import { Badge } from '../../shared/components/Badge'
import { DashboardTour } from './DashboardTour'
import { useRegisterDashboardTourAnchor } from './DashboardTourAnchorsHooks'
import { ADD_TRANSACTION_ROUTE } from './routes'
import { DEFERRED_BUDGET_SETUP_ROUTE } from '../budgets/routes'
import { cn } from '../../shared/lib/cn'
import { pageLayout } from '../../shared/styles/layout'
import { formatCurrency } from '../../shared/lib/formatCurrency'
import { DataList } from '../../shared/components/DataList'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { formatTransactionDate } from '../transactions/utils/transactionUtils'

const currencyFormatter = {
  format: (amount: number) => formatCurrency(amount),
}

// --- Helper Components ---

const TransactionRow = ({ transaction: tx }: { transaction: TransactionResponse }) => {
  const navigate = useNavigate()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/transactions/${tx.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/transactions/${tx.id}`)}
      className="flex items-center justify-between px-4 py-3.5 hover:bg-ui-accent-subtle/30 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110"
          style={{
            backgroundColor: (tx.category?.color || '#000') + '15',
            color: tx.category?.color || 'var(--muted-foreground)',
          }}
        >
          {tx.category ? (
            <SharedIcon type="category" name={tx.category.icon} size={20} />
          ) : (
            <div
              className={cn(
                'flex h-full w-full items-center justify-center rounded-full',
                tx.type === 'INCOME'
                  ? 'bg-ui-success/10 text-ui-success'
                  : 'bg-ui-danger/10 text-ui-danger',
              )}
            >
              {tx.type === 'INCOME' ? (
                <SharedIcon type="category" name="banknote" size={20} />
              ) : (
                <span className="text-lg font-semibold">?</span>
              )}
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {tx.description || tx.category?.name || 'Uncategorized'}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {formatTransactionDate(tx.transactionDate)}
            {tx.paymentMethod && (
              <>
                <span className="text-muted-foreground/50 mx-1">•</span>
                <span className="font-medium text-foreground/70">{tx.paymentMethod.name}</span>
              </>
            )}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={cn(
            'font-semibold',
            tx.type === 'EXPENSE' ? 'text-foreground' : 'text-ui-success',
          )}
        >
          {tx.type === 'EXPENSE' ? '-' : '+'}
          {currencyFormatter.format(tx.amount).replace('PHP', '').trim()}
          <span className="ml-1 text-xs text-muted-foreground font-normal">PHP</span>
        </p>
        <Badge
          variant={tx.type === 'INCOME' ? 'success' : 'neutral'}
          className="text-xs uppercase font-semibold px-2 py-0.5 mt-1"
        >
          {tx.type}
        </Badge>
      </div>
    </div>
  )
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
          <div className="flex flex-col px-4 py-4 hover:bg-ui-accent-subtle/30 transition-colors group relative">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => navigate(`/budgets/${budget.id}`)}
                className="flex items-center gap-4 cursor-pointer flex-1 min-w-0 text-left"
              >
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
                  style={{
                    backgroundColor: (category?.color || '#000') + '15',
                    color: category?.color,
                  }}
                >
                  <SharedIcon type="category" name={category?.icon || 'banknote'} size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors truncate">
                      {budget.categoryName}
                    </p>
                    {isOverBudget && (
                      <Badge
                        variant="error"
                        className="text-xs uppercase font-semibold px-1.5 py-0"
                      >
                        Overbudget
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {budget.period}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-2 sm:gap-4 ml-2">
                <button
                  type="button"
                  onClick={() => navigate(`/budgets/${budget.id}`)}
                  className="text-right cursor-pointer"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {currencyFormatter.format(budget.expense)}
                  </p>
                  <p
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wider',
                      isOverBudget ? 'text-ui-danger' : 'text-primary',
                    )}
                  >
                    {usagePercent}% used
                  </p>
                </button>

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

            <div className="w-full h-1.5 bg-ui-border-subtle/40 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500 ease-out',
                  isOverBudget ? 'bg-ui-danger' : 'bg-primary',
                )}
                style={{ width: `${usagePercent}%` }}
              />
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">
                    Burn Rate
                  </p>
                  <p className="text-sm font-semibold text-foreground tabular-nums">
                    {hasInsufficientData
                      ? '—'
                      : currencyFormatter.format(budget.burnRate!).replace('PHP', '').trim()}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                    per day
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">
                    Allowance
                  </p>
                  <p
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      isOverBudget ? 'text-ui-danger' : 'text-foreground',
                    )}
                  >
                    {hasInsufficientData
                      ? '—'
                      : currencyFormatter.format(budget.dailyAllowance!).replace('PHP', '').trim()}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                    remaining
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-subtle-foreground">
                    Projection
                  </p>
                  <p
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      isOverBudget
                        ? 'text-ui-danger'
                        : isProjectedOverBudget
                          ? 'text-warning-dark'
                          : 'text-foreground',
                    )}
                  >
                    {hasInsufficientData
                      ? '—'
                      : currencyFormatter.format(budget.projectedTotal!).replace('PHP', '').trim()}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
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

const GoalPlaceholderRow = () => {
  const navigate = useNavigate()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate('/goals')}
      onKeyDown={(e) => e.key === 'Enter' && navigate('/goals')}
      className="p-10 flex flex-col items-center justify-center text-center space-y-3 hover:bg-ui-accent-subtle/30 transition-colors cursor-pointer group"
    >
      <div className="h-12 w-12 rounded-full bg-ui-accent-subtle flex items-center justify-center group-hover:scale-110 transition-transform">
        <SharedIcon type="category" name="sparkles" size={24} className="text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Savings Goals</p>
        <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
          Track your progress towards big purchases or emergency funds.
        </p>
      </div>
      <Badge variant="neutral" className="text-xs uppercase font-semibold tracking-wide px-3 py-1">
        Coming Soon
      </Badge>
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
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
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

  const { data: transactionsData, isLoading: isTransactionsLoading } = useGetTransactionsQuery()
  const transactions = transactionsData?.items ?? []
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
      <header>
        <div className={pageLayout.headerGap}>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Track your finances at a glance.
          </p>
        </div>
      </header>
      <div className={cn('space-y-7 pb-32')}>
        {/* ───────── TOTAL BALANCE ───────── */}
        <section
          ref={balanceCardRef}
          className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500"
          role="status"
          aria-label={`Total Balance: ${formattedBalance}`}
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Total Balance
          </p>
          <div className="flex items-baseline gap-2" aria-hidden="true">
            <span className="text-lg font-semibold text-muted-foreground">PHP</span>
            <h2 className="text-4xl font-semibold tracking-tight text-foreground">
              {formattedBalance.replace('PHP', '').trim()}
            </h2>
            <BalanceSummaryIcon />
          </div>
        </section>

        {/* ───────── TRANSACTIONS SECTION ───────── */}
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-600 delay-75">
          <SectionHeader title="Transactions" seeAllHref="/transactions" />

          {isTransactionsLoading ? (
            <SkeletonList count={3} itemHeight="h-20" />
          ) : !hasTransactions ? (
            <TransactionsEmptyState
              onAddTransaction={handleStartTransactions}
              buttonRef={addTransactionButtonRef}
            />
          ) : (
            <DataList
              data={transactions.slice(0, 5)}
              renderItem={(tx) => <TransactionRow transaction={tx} />}
            />
          )}
        </section>

        {/* ───────── BUDGET SECTION ───────── */}
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <SectionHeader title="Budget" seeAllHref="/budgets" />

          {isBudgetSummaryLoading || isBudgetsLoading ? (
            <SkeletonList count={2} itemHeight="h-24" />
          ) : !hasBudgets ? (
            <BudgetsEmptyState onQuickSetup={handleLaunchSetup} />
          ) : (
            <DataList
              data={budgets.slice(0, 3)}
              renderItem={(budget) => {
                const category = categories.find((c) => c.id === budget.categoryId)
                return <BudgetRow budget={budget} category={category} />
              }}
            />
          )}
        </section>

        {/* ───────── GOALS SECTION ───────── */}
        <section className="space-y-3 animate-in fade-in slide-in-from-bottom-5 duration-800 delay-225">
          <SectionHeader title="Goal" seeAllHref="/goals" />
          <DataList
            data={[1]} // Single item list for consistency
            renderItem={() => <GoalPlaceholderRow />}
          />
        </section>
      </div>
      <DashboardTour />
    </>
  )
}
