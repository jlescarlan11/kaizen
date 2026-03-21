import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { useGetBudgetCountQuery } from '../../app/store/api/budgetApi'
import { DashboardBudgetEmptyState } from './DashboardBudgetEmptyState'
import { Card } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'

export function HomePage(): ReactElement {
  const { user } = useAuthState()
  const navigate = useNavigate()

  const formattedBalance = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(user?.openingBalance ?? 0)

  const hasSkippedBudgets = Boolean(user?.budgetSetupSkipped)
  const { data: budgetCountData } = useGetBudgetCountQuery(undefined, {
    skip: !hasSkippedBudgets,
  })
  const hasBudgets = (budgetCountData?.count ?? 0) > 0
  const showSkipEmptyState = hasSkippedBudgets && !hasBudgets

  const handleOpenEditor = () => {
    navigate('/balance/edit')
  }

  const handleLaunchSetup = () => {
    navigate('/budget')
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here is your account overview.
        </p>
      </header>

      {showSkipEmptyState && <DashboardBudgetEmptyState onLaunchSetup={handleLaunchSetup} />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Current Balance
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <span className="text-4xl font-bold tracking-tight text-foreground">
              {formattedBalance}
            </span>
            <Button variant="ghost" className="text-sm font-medium" onClick={handleOpenEditor}>
              Edit balance
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Opening balance from onboarding.</p>
        </Card>
      </div>
    </section>
  )
}
