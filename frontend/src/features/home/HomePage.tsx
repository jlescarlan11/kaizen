import type { ReactElement } from 'react'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { HomeDashboardHeader } from './components/HomeDashboardHeader'
import { SpendingGraphCard } from './components/SpendingGraphCard'
import { TopCategoriesCard } from './components/TopCategoriesCard'
import { BudgetBurnRateCard } from './components/BudgetBurnRateCard'
import { WalletBento } from './components/WalletBento'
import { TimelineActivity } from './components/TimelineActivity'
import { FinancialIntelligenceCard } from './components/FinancialIntelligenceCard'
import { SevenDayInsights } from './components/SevenDayInsights'
import { CommandPalette } from './components/CommandPalette'
import { DashboardTour } from './DashboardTour'
import { useRegisterDashboardTourAnchor } from './DashboardTourAnchorsHooks'

export function HomePage(): ReactElement {
  const { user } = useAuthState()
  const balanceCardRef = useRegisterDashboardTourAnchor('balanceCard')

  return (
    <div className="animate-entrance-slide-up pb-24 space-y-4">
      <CommandPalette />

      {/* Zone 1 — Balance hero */}
      <section ref={balanceCardRef}>
        <HomeDashboardHeader balance={user?.balance ?? 0} />
      </section>

      {/* Zone 2 — Chart + Wallets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7">
          <SpendingGraphCard />
        </div>
        <div className="lg:col-span-5">
          <WalletBento />
        </div>
      </div>

      {/* Zone 3 — Recent activity */}
      <TimelineActivity />

      {/* Zone 4 — Insight strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BudgetBurnRateCard />
        <FinancialIntelligenceCard />
        <TopCategoriesCard />
        <SevenDayInsights />
      </div>

      <DashboardTour />
    </div>
  )
}
