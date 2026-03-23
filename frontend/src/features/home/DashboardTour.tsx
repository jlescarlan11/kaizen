import { useEffect, useRef } from 'react'
import { driver, type Driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useAuthState } from '../../shared/hooks/useAuthState'
import type { DashboardTourAnchorKey } from './DashboardTourAnchorsContext'
import { useDashboardTourAnchors } from './DashboardTourAnchorsHooks'
import { useMarkTourCompletedMutation } from '../../app/store/api/authApi'

const TOUR_START_DELAY_MS = 500

const TOUR_STEPS: ReadonlyArray<{
  anchorKey: DashboardTourAnchorKey
  title: string
  description: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}> = [
  {
    anchorKey: 'balanceCard',
    title: 'Current Balance',
    description: 'This shows your current balance.',
    side: 'bottom',
  },
  {
    anchorKey: 'addTransactionButton',
    title: 'Add Transaction',
    description: 'Tap here to add transactions.',
    side: 'bottom',
  },
  {
    anchorKey: 'budgetsTab',
    title: 'Budgets',
    description: 'View your budget progress here.',
    side: 'top',
  },
  {
    anchorKey: 'goalsTab',
    title: 'Goals',
    description: 'Set savings goals.',
    side: 'top',
  },
]

export function DashboardTour() {
  const { user } = useAuthState()
  const anchors = useDashboardTourAnchors()
  const [markTourCompleted] = useMarkTourCompletedMutation()
  const driverRef = useRef<Driver | null>(null)

  useEffect(() => {
    // If user hasn't loaded or already completed the tour, don't initialize
    if (!user || user.tourCompleted) {
      return
    }

    // Map steps and filter for only those that are available
    const steps = TOUR_STEPS.map((step) => ({
      element: anchors[step.anchorKey] as HTMLElement,
      popover: {
        title: step.title,
        description: step.description,
        side: step.side,
        align: 'start' as const,
      },
    })).filter((s) => !!s.element)

    // Wait until all expected anchors are available before initializing
    if (steps.length < TOUR_STEPS.length) {
      return
    }

    // Initialize driver
    const driverObj = driver({
      showProgress: true,
      allowClose: false,
      overlayColor: 'rgba(0, 0, 0, 0.6)',
      onDeselected: (_element, _step, { config, state }) => {
        // If it was the last step, mark tour completed
        if (state.activeIndex === (config.steps?.length ?? 0) - 1) {
          markTourCompleted().unwrap().catch(console.error)
        }
      },
      steps,
    })

    driverRef.current = driverObj

    const timer = window.setTimeout(() => {
      // Re-verify that the user is still here and tour is not completed
      if (user && !user.tourCompleted && driverRef.current) {
        driverRef.current.drive()
      }
    }, TOUR_START_DELAY_MS)

    return () => {
      window.clearTimeout(timer)
      if (driverRef.current) {
        driverRef.current.destroy()
      }
    }
  }, [user, anchors, markTourCompleted])

  return null
}
