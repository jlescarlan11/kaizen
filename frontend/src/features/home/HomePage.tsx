import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react'
import { useGetBudgetSummaryQuery, useGetBudgetsQuery } from '../../app/store/api/budgetApi'
import { useGetCategoriesQuery } from '../../app/store/api/categoryApi'
import { useGetTransactionsQuery } from '../../app/store/api/transactionApi'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { DEFERRED_BUDGET_SETUP_ROUTE } from '../../features/budgets/routes'
import { ADD_TRANSACTION_ROUTE } from '../../features/home/routes'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { SectionHeader } from '../../shared/components/SectionHeader'
import { DataList } from '../../shared/components/DataList'
import { Badge } from '../../shared/components/Badge'
import { formatTransactionDate } from '../../features/transactions/utils/transactionUtils'
import { cn } from '../../shared/lib/cn'
import { SkeletonList } from '../../shared/components/SkeletonList'
import { useRegisterDashboardTourAnchor } from './DashboardTourAnchorsHooks'
import { DashboardTour } from './DashboardTour'
import { BalanceSummaryIcon } from './components/BalanceSummaryIcon'
import { TransactionsEmptyState } from './TransactionsEmptyState'
import { BudgetsEmptyState } from './BudgetsEmptyState'
import type { TransactionResponse, BudgetResponse } from '../../app/store/api/transactionApi'
import type { CategoryResponse } from '../../app/store/api/categoryApi'

// --- Helper Components ---

const TransactionRow = ({ transaction: tx }: { transaction: TransactionResponse }) => {
  const navigate = useNavigate()
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/transactions/${tx.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/transactions/${tx.id}`)}
      className="flex items-center justify-between px-6 py-3.5 hover:bg-primary/5 active:bg-primary/10 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl transition-all group-hover:scale-105 shadow-sm"
          style={{
            backgroundColor: (tx.category?.color || '#000') + '15',
            color: tx.category?.color || 'var(--color-text-secondary)',
          }}
        >
          {tx.category ? (
            <SharedIcon type="category" name={tx.category.icon} size={22} strokeWidth={2.5} />
          ) : (
            <div
              className={cn(
                'flex h-full w-full items-center justify-center rounded-xl',
                tx.type === 'INCOME' ? 'bg-success/10 text-success' : 'bg-error/10 text-error',
              )}
            >
              {tx.type === 'INCOME' ? (
                <SharedIcon type="category" name="banknote" size={22} strokeWidth={2.5} />
              ) : (
                <span className="text-lg font-bold">?</span>
              )}
            </div>
          )}
        </div>
        <div>
          <p className="font-bold tracking-tight text-text-primary transition-colors">
            {tx.description || tx.category?.name || 'Uncategorized'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-60">
              {formatTransactionDate(tx.transactionDate)}
            </span>
            {tx.paymentMethod && (
              <>
                <span className="text-border-subtle">•</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-40">
                  {tx.paymentMethod.name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p
          className={cn(
            'text-base font-bold tracking-tight',
            tx.type === 'EXPENSE' ? 'text-text-primary' : 'text-success',
          )}
        >
          {tx.type === 'EXPENSE' ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
        </p>
        <Badge variant={tx.type === 'INCOME' ? 'success' : 'neutral'} className="mt-1">
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
    <Disclosure as="div" className="overflow-hidden">
      {({ open }) => (
        <>
          <div className="flex items-center justify-between px-6 py-2.5 hover:bg-primary/5 active:bg-primary/10 transition-colors group relative">
            <button
              type="button"
              onClick={() => navigate(`/budgets/${budget.id}`)}
              className="flex items-center gap-4 cursor-pointer flex-1 min-w-0 text-left"
            >
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 shrink-0 shadow-sm"
                style={{
                  backgroundColor: (category?.color || '#000') + '15',
                  color: category?.color,
                }}
              >
                <SharedIcon
                  type="category"
                  name={category?.icon || 'banknote'}
                  size={22}
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-sm font-bold tracking-tight text-text-primary leading-tight transition-colors truncate">
                    {budget.categoryName}
                  </p>
                  {isOverBudget && <Badge variant="error">Over</Badge>}
                </div>
                {/* Compact Inline Progress Bar */}
                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden p-[1px] max-w-[120px]">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700 ease-out',
                      isOverBudget ? 'bg-error' : 'bg-primary',
                    )}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            </button>

            <div className="flex items-center gap-4 ml-2">
              <button
                type="button"
                onClick={() => navigate(`/budgets/${budget.id}`)}
                className="text-right cursor-pointer"
              >
                <p
                  className={cn(
                    'text-base font-bold tracking-tight',
                    isOverBudget ? 'text-error' : 'text-primary',
                  )}
                >
                  {usagePercent}%
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-40">
                  Used
                </p>
              </button>

              <DisclosureButton
                className="p-1.5 rounded-lg text-text-secondary/30 hover:text-primary hover:bg-primary/10 transition-colors focus:outline-none"
                aria-label="Toggle Insights"
              >
                <ChevronRightIcon
                  size={18}
                  className={cn('transition-transform duration-300', open && 'rotate-90')}
                />
              </DisclosureButton>
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
            <DisclosurePanel className="px-6 pb-5 pt-3 bg-surface-secondary/50 rounded-b-2xl -mt-2 border-t border-border-subtle/30">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-60">
                    Spent
                  </p>
                  <p className="text-xs font-bold text-text-primary tabular-nums tracking-tight">
                    ${budget.expense.toFixed(2)}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-text-secondary opacity-40">
                    of ${budget.amount.toFixed(0)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-60">
                    Allowance
                  </p>
                  <p
                    className={cn(
                      'text-xs font-bold tabular-nums tracking-tight',
                      isOverBudget ? 'text-error' : 'text-text-primary',
                    )}
                  >
                    {hasInsufficientData ? '—' : `$${budget.dailyAllowance!.toFixed(2)}`}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-text-secondary opacity-40">
                    remaining
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-60">
                    Projection
                  </p>
                  <p
                    className={cn(
                      'text-xs font-bold tabular-nums tracking-tight',
                      isOverBudget
                        ? 'text-error'
                        : isProjectedOverBudget
                          ? 'text-warning'
                          : 'text-text-primary',
                    )}
                  >
                    {hasInsufficientData ? '—' : `$${budget.projectedTotal!.toFixed(2)}`}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-text-secondary opacity-40">
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
      className="p-8 flex flex-col items-center justify-center text-center space-y-3 hover:bg-surface-secondary transition-all cursor-pointer group rounded-2xl"
    >
      <div className="h-14 w-14 rounded-xl bg-surface-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
        <SharedIcon
          type="category"
          name="sparkles"
          size={28}
          className="text-primary"
          strokeWidth={2.5}
        />
      </div>
      <div>
        <p className="text-base font-bold tracking-tight text-text-primary uppercase">
          Savings Goals
        </p>
        <p className="text-xs font-medium text-text-secondary max-w-[200px] mx-auto mt-1 opacity-60">
          Track progress towards big purchases.
        </p>
      </div>
      <Badge variant="neutral" emphasis="solid" className="px-3 py-1">
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

  const handleStartTransactions = () => {
    navigate(ADD_TRANSACTION_ROUTE)
  }

  const handleLaunchSetup = () => {
    navigate(DEFERRED_BUDGET_SETUP_ROUTE)
  }

  return (
    <div className="animate-entrance-slide-up">
      <header className="mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tighter text-text-primary">
            Hey, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-base font-medium text-text-secondary tracking-tight opacity-60">
            You're doing great with your money.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-5 pb-24">
        {/* ───────── TOTAL BALANCE (Bento Hero) ───────── */}
        <section
          ref={balanceCardRef}
          className="col-span-12 lg:col-span-8 bg-white border border-border-subtle p-6 md:p-8 rounded-2xl shadow-sm flex flex-col justify-between min-h-[240px]"
          role="status"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-60 px-1">
                Total Balance
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-text-secondary tracking-tighter opacity-30 italic">
                PHP
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-text-primary">
                {Math.abs(user?.balance ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              ref={addTransactionButtonRef}
              onClick={handleStartTransactions}
              className="bg-primary text-text-primary px-6 py-3.5 rounded-xl font-bold text-sm hover:brightness-105 active:scale-95 transition-all shadow-md shadow-primary/10 flex-1 md:flex-none"
            >
              Add Transaction
            </button>
            <BalanceSummaryIcon />
          </div>
        </section>

        {/* ───────── SMART INSIGHT (Bento Small) ───────── */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-text-primary text-white p-6 md:p-8 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-5">
            <SharedIcon
              type="ui"
              name="sparkles"
              size={20}
              className="text-primary"
              strokeWidth={2.5}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight mb-2 uppercase">Weekly Goal</h3>
            <p className="text-xs text-text-secondary font-medium leading-relaxed">
              You're <span className="text-primary font-bold">15% ahead</span> of your target.
            </p>
          </div>
        </div>

        {/* ───────── TRANSACTIONS (Bento Large) ───────── */}
        <section className="col-span-12 lg:col-span-7 bg-white border border-border-subtle py-6 rounded-2xl shadow-sm">
          <SectionHeader title="Activity" seeAllHref="/transactions" className="mb-6 px-6" />

          {isTransactionsLoading ? (
            <div className="px-6">
              <SkeletonList count={3} itemHeight="h-20" />
            </div>
          ) : !hasTransactions ? (
            <div className="px-6">
              <TransactionsEmptyState
                onAddTransaction={handleStartTransactions}
                buttonRef={addTransactionButtonRef}
              />
            </div>
          ) : (
            <DataList
              data={transactions.slice(0, 3)}
              renderItem={(tx) => <TransactionRow transaction={tx} />}
              hideBorders
              className="gap-1"
            />
          )}
        </section>

        {/* ───────── BUDGET (Bento Medium) ───────── */}
        <section className="col-span-12 md:col-span-6 lg:col-span-5 bg-white border border-border-subtle py-6 rounded-2xl shadow-sm">
          <SectionHeader title="Budgets" seeAllHref="/budgets" className="mb-6 px-6" />

          {isBudgetSummaryLoading || isBudgetsLoading ? (
            <div className="px-6">
              <SkeletonList count={2} itemHeight="h-24" />
            </div>
          ) : !hasBudgets ? (
            <div className="px-6">
              <BudgetsEmptyState onQuickSetup={handleLaunchSetup} />
            </div>
          ) : (
            <DataList
              data={budgets.slice(0, 3)}
              renderItem={(budget) => {
                const category = categories.find((c) => c.id === budget.categoryId)
                return <BudgetRow budget={budget} category={category} />
              }}
              hideBorders
              className="gap-1"
            />
          )}
        </section>

        {/* ───────── GOALS (Bento Small/Bottom) ───────── */}
        <section className="col-span-12 bg-white border-2 border-dashed border-border-subtle rounded-2xl">
          <GoalPlaceholderRow />
        </section>
      </div>
      <DashboardTour />
    </div>
  )
}
