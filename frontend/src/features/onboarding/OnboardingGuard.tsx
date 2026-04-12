import { type ReactElement, useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { useGetOnboardingProgressQuery } from '../../app/store/api/authApi'
import {
  createInitialBudgetEditorDraft,
  createInitialOnboardingState,
  goToPreviousStep,
  hydrateOnboardingState,
  selectCurrentStep,
} from './onboardingSlice'
import {
  getPreviousStep,
  ONBOARDING_STEP_ORDER,
  ONBOARDING_STEP_ROUTE_MAP,
  ROUTE_TO_ONBOARDING_STEP,
  type OnboardingStep,
} from './onboardingStep'
import {
  clearStoredOnboardingDraft,
  getStoredOnboardingDraft,
  persistOnboardingDraft,
} from './onboardingDraftStorage'

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
  const onboardingState = useAppSelector((state) => state.onboarding)
  const { data: progress, isLoading: isProgressLoading } = useGetOnboardingProgressQuery(
    undefined,
    {
      skip: !user || user.onboardingCompleted,
    },
  )
  const progressHydrated = useRef(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (progressHydrated.current) {
      return
    }
    if (isProgressLoading) {
      return
    }
    progressHydrated.current = true

    const storedDraft = user ? getStoredOnboardingDraft(user.id) : null
    const progressStep = (progress?.currentStep ?? 'BALANCE') as OnboardingStep
    const initialOnboardingState = createInitialOnboardingState()

    dispatch(
      hydrateOnboardingState({
        currentStep: storedDraft?.currentStep ?? progressStep,
        startingFunds:
          storedDraft?.startingFunds ??
          progress?.startingFunds ??
          initialOnboardingState.startingFunds,
        startingFundsInput:
          storedDraft?.startingFundsInput ??
          (progress?.startingFunds != null
            ? progress.startingFunds.toString()
            : initialOnboardingState.startingFundsInput),
        fundingSourceType:
          storedDraft?.fundingSourceType ??
          progress?.fundingSourceType ??
          initialOnboardingState.fundingSourceType,
        categoriesSeeded: storedDraft?.categoriesSeeded ?? initialOnboardingState.categoriesSeeded,
        pendingBudgets: storedDraft?.pendingBudgets ?? initialOnboardingState.pendingBudgets,
        budgetEditorDraft: storedDraft?.budgetEditorDraft ?? createInitialBudgetEditorDraft(),
        initialTransactionDescription:
          storedDraft?.initialTransactionDescription ?? progress?.description,
        initialTransactionNotes: storedDraft?.initialTransactionNotes ?? progress?.notes,
        initialTransactionPaymentMethodId:
          storedDraft?.initialTransactionPaymentMethodId ?? progress?.paymentMethodId,
        initialTransactionDate: storedDraft?.initialTransactionDate ?? progress?.transactionDate,
        initialBalances: storedDraft?.initialBalances ?? progress?.initialBalances ?? [],
      }),
    )
    Promise.resolve().then(() => {
      setIsHydrated(true)
    })
  }, [dispatch, isProgressLoading, progress, user])

  useEffect(() => {
    if (
      !isHydrated ||
      !user ||
      user.onboardingCompleted ||
      !location.pathname.startsWith('/onboarding')
    ) {
      return
    }

    persistOnboardingDraft(user.id, {
      currentStep: onboardingState.currentStep,
      startingFunds: onboardingState.startingFunds,
      startingFundsInput: onboardingState.startingFundsInput,
      fundingSourceType: onboardingState.fundingSourceType,
      categoriesSeeded: onboardingState.categoriesSeeded,
      pendingBudgets: onboardingState.pendingBudgets,
      budgetEditorDraft: onboardingState.budgetEditorDraft,
      initialTransactionDescription: onboardingState.initialTransactionDescription,
      initialTransactionNotes: onboardingState.initialTransactionNotes,
      initialTransactionPaymentMethodId: onboardingState.initialTransactionPaymentMethodId,
      initialTransactionDate: onboardingState.initialTransactionDate,
      initialBalances: onboardingState.initialBalances,
    })
  }, [isHydrated, location.pathname, onboardingState, user])

  useEffect(() => {
    if (!user?.onboardingCompleted) {
      return
    }

    clearStoredOnboardingDraft(user.id)
  }, [user])

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

  if (!isProgressResolved || !isHydrated) {
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
