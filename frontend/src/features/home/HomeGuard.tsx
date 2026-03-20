import { type ReactElement, Suspense, lazy } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { UnauthenticatedHome } from './UnauthenticatedHome'

const HomePage = lazy(() => import('./HomePage').then((m) => ({ default: m.HomePage })))

/**
 * HomeGuard: A root route guard that conditionally mounts the authenticated
 * or unauthenticated home screen based on the current auth state.
 */
export function HomeGuard(): ReactElement | null {
  const { isAuthenticated, isLoading, user } = useAuthState()

  // 1. Loading Guard: Show nothing while auth state is resolving
  if (isLoading) {
    return null
  }

  // 2. Auth Conditional Branch: Render UnauthenticatedHome directly for speed,
  // or the lazy-loaded HomePage if authenticated.
  if (isAuthenticated) {
    // 3. Onboarding Guard: If authenticated but onboarding not complete, redirect.
    if (user && !user.onboardingCompleted) {
      /*
       * TODO: Partial-completion handling (PRD Open Question 2).
       * Once the behavior for users who started but didn't finish onboarding
       * is confirmed, update this branching logic. For now, we always
       * redirect to the start of onboarding if not confirmed as complete.
       */
      return <Navigate to="/onboarding" replace />
    }

    return (
      <Suspense fallback={null}>
        <HomePage />
      </Suspense>
    )
  }

  return <UnauthenticatedHome />
}
