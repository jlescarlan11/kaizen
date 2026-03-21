import { type ReactElement, useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { useGetOnboardingProgressQuery } from '../../app/store/api/authApi'
import {
  goToPreviousStep,
  setBalanceValue,
  setBudgetChoice,
  setCurrentStep,
  selectCurrentStep,
} from './onboardingSlice'
import {
  getPreviousStep,
  ONBOARDING_STEP_ORDER,
  ONBOARDING_STEP_ROUTE_MAP,
  ROUTE_TO_ONBOARDING_STEP,
  type OnboardingStep,
} from './onboardingStep'

/**
 * Guard decision table:
 * - /onboarding/balance: allowed when user is at BALANCE; higher steps redirect to current valid step.
 * - /onboarding/budget: allowed when user progress >= BUDGET; direct URL attempts above current step redirect back.
 * - /onboarding: always redirects to the route representing the persisted step.
 */
export function OnboardingGuard(): ReactElement | null {
  const { isAuthenticated, isLoading, user } = useAuthState()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const currentStep = useAppSelector(selectCurrentStep)
  const { data: progress, isLoading: isProgressLoading } = useGetOnboardingProgressQuery(
    undefined,
    {
      skip: !user || user.onboardingCompleted,
    },
  )
  const progressHydrated = useRef(false)

  useEffect(() => {
    if (progressHydrated.current) {
      return
    }
    if (isProgressLoading) {
      return
    }
    progressHydrated.current = true

    const nextStep = (progress?.currentStep ?? 'BALANCE') as OnboardingStep
    dispatch(setCurrentStep(nextStep))
    dispatch(setBalanceValue(progress?.balanceValue ?? null))
    dispatch(setBudgetChoice(progress?.budgetChoice ?? null))
  }, [dispatch, isProgressLoading, progress])

  const isProgressResolved = !isProgressLoading

  useEffect(() => {
    const handlePopstate = (): void => {
      if (!location.pathname.startsWith('/onboarding')) {
        return
      }
      const previous = getPreviousStep(currentStep)
      if (previous == null) {
        // Open Question 1: first-step back behavior may show logout confirmation; keep user held for now.
        navigate(location.pathname, { replace: true })
        return
      }
      dispatch(goToPreviousStep())
      navigate(ONBOARDING_STEP_ROUTE_MAP[previous], { replace: true })
    }

    window.addEventListener('popstate', handlePopstate)
    return () => window.removeEventListener('popstate', handlePopstate)
  }, [currentStep, dispatch, location.pathname, navigate])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  if (!isProgressResolved) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (user?.onboardingCompleted) {
    return <Navigate to="/" replace />
  }

  const resolvedRoute = ONBOARDING_STEP_ROUTE_MAP[currentStep]
  if (location.pathname === '/onboarding') {
    return <Navigate to={resolvedRoute} replace />
  }

  const routeStep = ROUTE_TO_ONBOARDING_STEP[location.pathname]
  if (routeStep) {
    const attemptedIndex = ONBOARDING_STEP_ORDER.indexOf(routeStep)
    const currentIndex = ONBOARDING_STEP_ORDER.indexOf(currentStep)
    if (currentIndex === -1 || attemptedIndex > currentIndex) {
      return <Navigate to={resolvedRoute} replace />
    }
  }

  // Native browser back button (popstate) is handled separately from the in-app Back button.
  // Open Question 5: divergence point documented here so future logic can branch as needed.

  return <Outlet />
}
