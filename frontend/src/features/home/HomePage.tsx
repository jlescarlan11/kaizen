import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const isInitialBalance = tx.type === 'INITIAL_BALANCE'

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
                tx.type === 'INCOME' || tx.type === 'INITIAL_BALANCE'
                  ? 'bg-ui-success/10 text-ui-success'
                  : 'bg-ui-error/10 text-ui-error',
              )}
            >
              {tx.type === 'INCOME' || tx.type === 'INITIAL_BALANCE' ? (
                <SharedIcon type="category" name="banknote" size={20} />
              ) : (
                <span className="text-lg font-bold">?</span>
              )}
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {isInitialBalance
              ? 'Initial Balance'
              : tx.description || tx.category?.name || 'Uncategorized'}
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
          className={cn('font-bold', tx.type === 'EXPENSE' ? 'text-foreground' : 'text-ui-success')}
        >
          {tx.type === 'EXPENSE' ? '-' : '+'}
          {currencyFormatter.format(tx.amount).replace('PHP', '').trim()}
          <span className="ml-1 text-[10px] text-muted-foreground font-normal">PHP</span>
        </p>
        <Badge
          tone={tx.type === 'INCOME' || tx.type === 'INITIAL_BALANCE' ? 'success' : 'neutral'}
          className="text-[10px] uppercase font-bold px-2 py-0.5 mt-1"
        >
          {isInitialBalance ? 'Initial Balance' : tx.type}
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
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/budget/${budget.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/budget/${budget.id}`)}
      className="flex items-center justify-between px-4 py-3.5 hover:bg-ui-accent-subtle/30 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
          style={{
            backgroundColor: (category?.color || '#000') + '15',
            color: category?.color,
          }}
        >
          <SharedIcon type="category" name={category?.icon || 'banknote'} size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
            {budget.categoryName}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {budget.period}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:block w-32">
          <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary/40" style={{ width: '0%' }} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">
            {currencyFormatter.format(budget.amount)}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Limit
          </p>
        </div>
      </div>
    </div>
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
        <p className="text-sm font-bold text-foreground">Savings Goals</p>
        <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
          Track your progress towards big purchases or emergency funds.
        </p>
      </div>
      <Badge tone="neutral" className="text-[10px] uppercase font-black tracking-widest px-3 py-1">
        Coming Soon
      </Badge>
    </div>
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
      <div className={cn('space-y-7 pb-32')}>
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
          <SectionHeader title="Budget" seeAllHref="/budget" />

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
