import type { ReactElement } from 'react'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { HomeDashboardHeader } from './components/HomeDashboardHeader'
import { SpendingGraphCard } from './components/SpendingGraphCard'
import { TopCategoriesCard } from './components/TopCategoriesCard'
import { BudgetBurnRateCard } from './components/BudgetBurnRateCard'
import { WalletBento } from './components/WalletBento'
import { TimelineActivity } from './components/TimelineActivity'
import { FinancialIntelligenceCard } from './components/FinancialIntelligenceCard'
import { ActionCenterCard } from './components/ActionCenterCard'
import { WealthProfileCard } from './components/WealthProfileCard'
import { SubscriptionWatchdogCard } from './components/SubscriptionWatchdogCard'
import { CommandPalette } from './components/CommandPalette'
import { DashboardTour } from './DashboardTour'
import { useRegisterDashboardTourAnchor } from './DashboardTourAnchorsHooks'
export function HomePage(): ReactElement {
  const { user } = useAuthState()
  const balanceCardRef = useRegisterDashboardTourAnchor('balanceCard')

  return (
    <div className="animate-entrance-slide-up pb-24 space-y-4">
      <CommandPalette />

      {/* Hero — full-width centered Net Worth */}
      <section ref={balanceCardRef}>
        <HomeDashboardHeader balance={user?.balance ?? 0} />
      </section>

      {/* Row 1 — 5/4/3: Spending Chart · Wallets · Action Center */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-start lg:items-stretch lg:min-h-[290px]">
        <div className="lg:col-span-5">
          <SpendingGraphCard />
        </div>
        <div className="lg:col-span-4">
          <WalletBento />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <ActionCenterCard />
        </div>
      </div>

      {/* Row 2 — 7/5: Unified Activity Feed · Wealth Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start lg:items-stretch">
        <div className="lg:col-span-7">
          <TimelineActivity />
        </div>
        <div className="lg:col-span-5">
          <WealthProfileCard />
        </div>
      </div>

      {/* Row 3 — 1/1/1: Budget Burn · Top Categories · Financial Intelligence */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BudgetBurnRateCard />
        <TopCategoriesCard />
        <FinancialIntelligenceCard />
      </div>

      {/* Row 4 — full: Subscription Watchdog */}
      <SubscriptionWatchdogCard />

      <DashboardTour />
    </div>
  )
}
