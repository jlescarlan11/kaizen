import type { ReactElement } from 'react'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { Card } from '../../shared/components/Card'

export function HomePage(): ReactElement {
  const { user } = useAuthState()

  const formattedBalance = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(user?.openingBalance ?? 0)

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here is your account overview.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Current Balance
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-foreground">
              {formattedBalance}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Opening balance from onboarding.</p>
        </Card>
      </div>
    </section>
  )
}
